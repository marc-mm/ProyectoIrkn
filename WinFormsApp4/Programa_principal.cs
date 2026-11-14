using FlightLib;

namespace WinFormsApp4
{
    // Finestra principal: menú de l'aplicació i dades de la simulació.
    public partial class Programa_principal : Form
    {
        FlightPlanList vuelos = new FlightPlanList();
        double distanciaSeguridad = 0;
        double tiempoCiclo = 0;
        string usuario;

        // Rep el nom de l'usuari que ha iniciat sessió.
        public Programa_principal(string usuario)
        {
            InitializeComponent();
            this.usuario = usuario;
            MostrarEstado();
        }

        // Mostra a la finestra l'usuari, els vols carregats i els paràmetres de simulació.
        private void MostrarEstado()
        {
            string estado = "Usuari: " + usuario + "\n\n";
            estado = estado + "Plans de vol carregats: " + vuelos.GetNumber() + "\n";
            if (distanciaSeguridad > 0)
                estado = estado + "Distància de seguretat: " + distanciaSeguridad + "\nTemps de cicle: " + tiempoCiclo + "\n";
            else
                estado = estado + "Distància de seguretat i temps de cicle: sense introduir\n";
            estado = estado + "\nPassos: 1) Carregar vols   2) Dades simulació   3) Simulació";
            labelEstado.Text = estado;
        }

        // Deixa triar un fitxer de plans de vol i el carrega. Si té errors, avisa i no canvia els vols actuals.
        private void menuCargar_Click(object sender, EventArgs e)
        {
            OpenFileDialog dialogo = new OpenFileDialog();
            dialogo.Filter = "Fitxers de text (*.txt)|*.txt";
            if (dialogo.ShowDialog() != DialogResult.OK)
                return;

            FlightPlanList nuevaLista = new FlightPlanList();
            int resultado = nuevaLista.CargarFichero(dialogo.FileName);

            if (resultado == -1)
                MessageBox.Show("No s'ha trobat el fitxer");
            else if (resultado > 0)
                MessageBox.Show("Error a la línia " + resultado + " del fitxer.\nCada línia ha de ser: id companyia xInicial yInicial xFinal yFinal velocitat\n(coordenades entre 0 i 799 i velocitat més gran que 0)");
            else if (nuevaLista.GetNumber() == 0)
                MessageBox.Show("El fitxer no conté cap pla de vol");
            else
            {
                vuelos = nuevaLista;
                MessageBox.Show("S'han carregat " + vuelos.GetNumber() + " plans de vol");
            }
            MostrarEstado();
        }

        // Obre la finestra de paràmetres i, si s'han acceptat, guarda la distància de seguretat i el temps de cicle.
        private void menuDades_Click(object sender, EventArgs e)
        {
            Introducir_Parametros_Simulacion F3 = new Introducir_Parametros_Simulacion();
            F3.ShowDialog();

            if (F3.dame_distancia() > 0)
            {
                distanciaSeguridad = F3.dame_distancia();
                tiempoCiclo = F3.dame_ciclo();
            }
            MostrarEstado();
        }

        // Comprova que s'hagin introduït totes les dades i obre la simulació amb elles.
        private void menuSimulacio_Click(object sender, EventArgs e)
        {
            if (vuelos.GetNumber() == 0)
            {
                MessageBox.Show("Primer has de carregar un fitxer de plans de vol");
                return;
            }
            if (distanciaSeguridad <= 0 || tiempoCiclo <= 0)
            {
                MessageBox.Show("Primer has d'introduir la distància de seguretat i el temps de cicle");
                return;
            }

            Ventana_simulacion F4 = new Ventana_simulacion();
            F4.pon_vuelos(vuelos);
            F4.pon_distancia(distanciaSeguridad);
            F4.pon_ciclo(tiempoCiclo);
            F4.ShowDialog();
        }
    }
}
