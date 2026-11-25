using System.Diagnostics;
using FlightLib;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using VistaAvancada.Motor;

namespace VistaAvancada
{
    // Formulari de la "Vista Avançada Realista": conté el navegador WebView2 que mostra el globus 3D i fa de pont
    // entre la pàgina (JavaScript) i el motor en C# (ControladorVista). Un temporitzador de ~50 ms fa avançar la simulació.
    public partial class Vista_avanzada : Form
    {
        readonly FlightPlanList planesProyecto;
        readonly WebView2 web = new WebView2();
        readonly System.Windows.Forms.Timer temporizador = new System.Windows.Forms.Timer();
        readonly Stopwatch reloj = new Stopwatch();
        ControladorVista controlador;
        bool cerrando;
        double ultimoInstante;

        // Crea el formulari. Rep la llista de plans de vol del projecte original (pot estar buida); se'n fa una còpia
        // i la simulació original no es modifica.
        public Vista_avanzada(FlightPlanList planesProyecto)
        {
            InitializeComponent();
            this.planesProyecto = planesProyecto;
            web.Dock = DockStyle.Fill;
            web.DefaultBackgroundColor = Color.FromArgb(5, 8, 16);
            Controls.Add(web);
            temporizador.Interval = 50;
            temporizador.Tick += OnTick;
            Load += async (s, e) => await InicializarAsync();
            FormClosing += OnFormClosing;
        }

        // Carrega les dades, crea el motor i inicialitza WebView2 (carpeta d'usuari a %LOCALAPPDATA%, domini virtual
        // vistaavancada.local apuntant a la carpeta web). Mostra missatges en català si falta el Runtime de WebView2.
        async Task InicializarAsync()
        {
            try
            {
                controlador = new ControladorVista(planesProyecto);
                controlador.Enviar = EnviarAPagina;
                controlador.PedirFicheroPlanes = PedirFicheroPlanes;
                controlador.PedirFicheroInforme = PedirFicheroInforme;
            }
            catch (Exception ex)
            {
                MessageBox.Show(this, "No s'han pogut carregar les dades de la Vista Avançada (carpeta Datos):\n" + ex.Message,
                    "Vista Avançada Realista", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
                return;
            }

            try
            {
                string datos = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ProyectoIrkn", "WebView2");
                var entorno = await CoreWebView2Environment.CreateAsync(null, datos);
                await web.EnsureCoreWebView2Async(entorno);
                if (cerrando || IsDisposed) return;

                var core = web.CoreWebView2;
                core.Settings.AreDevToolsEnabled = true;                    // F12 per depurar
                core.Settings.IsStatusBarEnabled = false;
                core.SetVirtualHostNameToFolderMapping("vistaavancada.local",
                    Path.Combine(AppContext.BaseDirectory, "web"), CoreWebView2HostResourceAccessKind.Allow);
                core.WebMessageReceived += OnWebMessage;
                core.NewWindowRequested += (s, e) => e.Handled = true;      // sense finestres emergents
                core.Navigate("https://vistaavancada.local/index.html");

                reloj.Start();
                ultimoInstante = 0;
                temporizador.Start();
            }
            catch (WebView2RuntimeNotFoundException)
            {
                MessageBox.Show(this,
                    "Per mostrar la Vista Avançada cal tenir instal·lat el Microsoft Edge WebView2 Runtime.\n\n" +
                    "Pots descarregar-lo gratuïtament de https://developer.microsoft.com/microsoft-edge/webview2/ " +
                    "i tornar a obrir aquesta finestra.",
                    "Vista Avançada Realista", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show(this, "No s'ha pogut iniciar el navegador integrat:\n" + ex.Message,
                    "Vista Avançada Realista", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
            }
        }

        // Envia un missatge JSON a la pàgina (ignora els errors si el navegador ja no està disponible).
        void EnviarAPagina(string json)
        {
            try
            {
                if (!cerrando && web.CoreWebView2 != null) web.CoreWebView2.PostWebMessageAsJson(json);
            }
            catch (Exception) { }
        }

        // Rep un missatge de la pàgina i el passa al controlador (que ignora els desconeguts).
        void OnWebMessage(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                controlador?.ProcesarMensaje(e.WebMessageAsJson);
            }
            catch (Exception ex)
            {
                EnviarAPagina("{\"tipo\":\"aviso\",\"nivel\":\"error\",\"texto\":" +
                    System.Text.Json.JsonSerializer.Serialize("Error: " + ex.Message) + "}");
            }
        }

        // Pas del temporitzador: calcula el temps real transcorregut (Stopwatch) i fa avançar el motor.
        void OnTick(object sender, EventArgs e)
        {
            if (cerrando || controlador == null) return;
            double ahora = reloj.Elapsed.TotalSeconds;
            double dt = ahora - ultimoInstante;
            ultimoInstante = ahora;
            controlador.Tick(dt);
        }

        // Diàleg per triar el fitxer .txt de plans de vol. Retorna la ruta o null si es cancel·la.
        string PedirFicheroPlanes()
        {
            using var dlg = new OpenFileDialog
            {
                Title = "Carrega un fitxer de plans de vol",
                Filter = "Fitxers de text (*.txt)|*.txt|Tots els fitxers (*.*)|*.*"
            };
            return dlg.ShowDialog(this) == DialogResult.OK ? dlg.FileName : null;
        }

        // Diàleg per triar on desar l'informe. Retorna la ruta o null si es cancel·la.
        string PedirFicheroInforme()
        {
            using var dlg = new SaveFileDialog
            {
                Title = "Desa l'informe de conflictes",
                Filter = "Fitxers de text (*.txt)|*.txt",
                FileName = "informe_conflictes_" + DateTime.Now.ToString("yyyyMMdd_HHmm") + ".txt"
            };
            return dlg.ShowDialog(this) == DialogResult.OK ? dlg.FileName : null;
        }

        // En tancar: atura el temporitzador, cancel·la les descàrregues HTTP i allibera el navegador.
        void OnFormClosing(object sender, FormClosingEventArgs e)
        {
            cerrando = true;
            temporizador.Stop();
            try { controlador?.Dispose(); } catch (Exception) { }
            try { web.Dispose(); } catch (Exception) { }
        }
    }
}
