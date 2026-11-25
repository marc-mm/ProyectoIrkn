using System.Globalization;
using System.Text.Json;
using FlightLib;

namespace VistaAvancada.Motor
{
    // Pont entre el motor i la pàgina 3D: rep els missatges JSON de la pàgina, manté el mode actiu (simulat, en directe
    // o projecte), i a cada pas del temporitzador envia els missatges periòdics (estado, infoVuelo, infoAeropuerto,
    // estadisticas). No depèn de WebView2: els missatges surten per la funció "Enviar", així es pot provar des de consola.
    public class ControladorVista : IDisposable
    {
        public Catalogo Catalogo { get; }
        public Reloj Reloj { get; } = new Reloj();
        public Contactos Contactos { get; } = new Contactos();
        public FuenteTrafico Actual { get; private set; }

        // Funció que envia un missatge JSON a la pàgina (la posa el formulari)
        public Action<string> Enviar { get; set; } = _ => { };
        // Funcions que demanen una ruta de fitxer a l'usuari (diàlegs del formulari); retornen null si es cancel·la
        public Func<string> PedirFicheroPlanes { get; set; } = () => null;
        public Func<string> PedirFicheroInforme { get; set; } = () => null;

        readonly Serializador ser;
        MotorSimulacion sim;
        FuenteOpenSky directo;
        PlanesProyecto proyecto;
        FlightPlanList plantillaProyecto;               // plans a copiar cada cop que s'entra al mode projecte
        bool listo;
        int idSeleccionado = -1;
        string iataSeleccionado;
        double accEstado, accInfoVuelo, accInfoAeropuerto, accEstadisticas;
        double escalaAntesPilotar = -1;                 // escala de temps guardada mentre l'usuari pilota (-1 = no en pilota cap)
        DateTime ultimoErrorTick = DateTime.MinValue;

        // Crea el controlador: carrega les dades (llença excepció si falten els CSV), crea el motor simulat i guarda
        // els plans del projecte (pot ser null o buida) per al mode "proyecto".
        public ControladorVista(FlightPlanList planesProyecto, string carpetaDatos = null)
        {
            Catalogo = Catalogo.Cargar(carpetaDatos);
            ser = new Serializador(Catalogo);
            plantillaProyecto = planesProyecto ?? new FlightPlanList();
            sim = new MotorSimulacion(Catalogo, Reloj);
            Actual = sim;
            Suscribir(sim);
        }

        // Subscriu els avisos d'una font perquè arribin a la pàgina.
        void Suscribir(FuenteTrafico f)
        {
            f.Aviso += (nivel, texto) => Enviar(ser.Aviso(nivel, texto));
        }

        // Envia un avís a la pàgina.
        void Avisar(string nivel, string texto) => Enviar(ser.Aviso(nivel, texto));

        // ------------------------------------------------------------------ Temporitzador
        // Avança el motor i envia els missatges periòdics. Rep els segons reals transcorreguts des de l'últim pas.
        // Mai llença excepcions: els errors s'envien com a avís (com a molt un cada 5 s).
        public void Tick(double segundosReales)
        {
            if (!listo) return;
            try
            {
                segundosReales = Math.Max(0, Math.Min(0.5, segundosReales));
                Actual.Avanzar(segundosReales);

                accEstado += segundosReales; accInfoVuelo += segundosReales;
                accInfoAeropuerto += segundosReales; accEstadisticas += segundosReales;

                // En mode directe hi ha milers d'avions: es redueix la freqüència (la pàgina extrapola entre missatges)
                double periodo = Actual.Modo == "directo" ? 0.25 : 0.045;
                if (accEstado >= periodo)
                {
                    accEstado = 0;
                    Enviar(ser.Estado(Actual));
                }
                if (accInfoVuelo >= 1.0)
                {
                    accInfoVuelo = 0;
                    EnviarInfoVuelo();
                }
                if (accInfoAeropuerto >= 2.0)
                {
                    accInfoAeropuerto = 0;
                    EnviarInfoAeropuerto();
                }
                if (accEstadisticas >= 2.0)
                {
                    accEstadisticas = 0;
                    Enviar(ser.Estadisticas(Actual));
                }
            }
            catch (Exception ex)
            {
                if ((DateTime.UtcNow - ultimoErrorTick).TotalSeconds > 5)
                {
                    ultimoErrorTick = DateTime.UtcNow;
                    Avisar("error", "Error intern de la simulació: " + ex.Message);
                }
            }
        }

        // Envia l'infoVuelo de l'avió seleccionat (si encara existeix).
        void EnviarInfoVuelo()
        {
            if (idSeleccionado < 0) return;
            var v = Actual.BuscarVuelo(idSeleccionado);
            if (v == null)
            {
                // L'avió ja no existeix (ha aterrat i s'ha retirat): es deixa de seguir
                idSeleccionado = -1;
                return;
            }
            Enviar(ser.InfoVuelo(Actual, v, Contactos));
        }

        // Envia l'infoAeropuerto de l'aeroport seleccionat (taules només en mode simulat).
        void EnviarInfoAeropuerto()
        {
            if (iataSeleccionado == null || !Catalogo.PorIata.TryGetValue(iataSeleccionado, out var ap)) return;
            List<FilaTabla> sal = null, lle = null;
            if (Actual is MotorSimulacion m) (sal, lle) = m.Tabla(ap, Reloj.HoraUtc);
            Enviar(ser.InfoAeropuerto(ap, Reloj.HoraUtc, sal, lle));
        }

        // ------------------------------------------------------------------ Missatges de la pàgina
        // Processa un missatge JSON rebut de la pàgina. Ignora amb seguretat els desconeguts o mal formats.
        public void ProcesarMensaje(string json)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                var r = doc.RootElement;
                if (r.ValueKind != JsonValueKind.Object || !r.TryGetProperty("tipo", out var t) || t.ValueKind != JsonValueKind.String) return;
                switch (t.GetString())
                {
                    case "listo":
                        listo = true;
                        EnviarInicio();
                        break;
                    case "seleccionarVuelo":
                        idSeleccionado = (int)Numero(r, "id", -1);
                        accInfoVuelo = 0;
                        EnviarInfoVuelo();
                        break;
                    case "deseleccionar":
                        idSeleccionado = -1;
                        break;
                    case "seleccionarAeropuerto":
                        iataSeleccionado = Texto(r, "iata");
                        accInfoAeropuerto = 0;
                        EnviarInfoAeropuerto();
                        break;
                    case "escala":
                        if (TiempoBloqueado()) break;
                        Reloj.Escala = Math.Max(0.1, Math.Min(10000, Numero(r, "valor", Reloj.Escala)));
                        break;
                    case "pausa":
                        if (TiempoBloqueado()) break;
                        Reloj.Pausado = r.TryGetProperty("valor", out var pv) && pv.ValueKind == JsonValueKind.True;
                        break;
                    case "horaReal":
                        if (TiempoBloqueado()) break;
                        Reloj.PonerHoraReal();
                        if (Actual is MotorSimulacion ms) ms.Reiniciar();
                        break;
                    case "pilotar":
                        Pilotar(r);
                        break;
                    case "dejarPilotar":
                        DejarPilotar();
                        break;
                    case "densidad":
                        if (Actual.IdPilotado >= 0) break;
                        if (sim != null)
                        {
                            sim.Densidad = (int)Numero(r, "valor", 800);
                            if (Actual != sim) break;
                            idSeleccionado = -1;
                        }
                        break;
                    case "modo":
                        CambiarModo(Texto(r, "valor"));
                        break;
                    case "cargarPlanes":
                        CargarPlanes();
                        break;
                    case "resolverConflicto":
                        Actual.ResolverConflicto((int)Numero(r, "idA", -1), (int)Numero(r, "idB", -1));
                        break;
                    case "resolverTodos":
                        var lista = Actual.ResolverTodos();
                        if (Actual.Modo != "directo")
                            Avisar(lista.Count > 0 ? "ok" : "info",
                                lista.Count > 0 ? $"S'han donat {lista.Count} instruccions d'ATC." : "No hi ha conflictes per resoldre.");
                        break;
                    case "exportarInforme":
                        ExportarInforme();
                        break;
                    default:
                        break;                                  // missatge desconegut: s'ignora
                }
            }
            catch (Exception ex)
            {
                try { Avisar("error", "Error en processar una ordre: " + ex.Message); } catch (Exception) { }
            }
        }

        // El temps no es pot accelerar, aturar ni reiniciar amb dades en directe (són reals) ni mentre l'usuari pilota un avió.
        bool TiempoBloqueado() => Actual.Modo == "directo" || Actual.IdPilotado >= 0;

        // Missatge "pilotar" (~10 Hz): posició de l'avió que pilota l'usuari. El primer cop posa el rellotge a temps real
        // (x1, sense pausa) i en guarda l'escala per restaurar-la després. Si l'avió ja no existeix, avisa la pàgina.
        void Pilotar(JsonElement r)
        {
            int id = (int)Numero(r, "id", -1);
            bool primero = Actual.IdPilotado != id;
            bool ok = Actual.Pilotar(id, Numero(r, "lat", 0), Numero(r, "lon", 0), Numero(r, "alt", 0),
                Numero(r, "rumbo", 0), Numero(r, "vel", 0), Numero(r, "vv", 0));
            if (!ok)
            {
                Enviar("{\"tipo\":\"finPilotaje\",\"motivo\":\"L'avió ja no és a la simulació.\"}");
                RestaurarEscala();
                return;
            }
            if (primero && escalaAntesPilotar < 0)
            {
                escalaAntesPilotar = Reloj.Escala;
                Reloj.Escala = 1;
                Reloj.Pausado = false;
            }
        }

        // L'usuari deixa els comandaments: l'avió torna a la simulació i es restaura l'escala de temps.
        void DejarPilotar()
        {
            Actual.DejarPilotar();
            RestaurarEscala();
        }

        // Torna a l'escala de temps que hi havia abans de pilotar (en directe sempre és x1).
        void RestaurarEscala()
        {
            if (escalaAntesPilotar < 0) return;
            Reloj.Escala = Actual.Modo == "directo" ? 1 : escalaAntesPilotar;
            escalaAntesPilotar = -1;
        }

        // Llegeix una propietat numèrica d'un objecte JSON (admet nombres i textos); retorna "defecto" si no hi és.
        static double Numero(JsonElement r, string nombre, double defecto)
        {
            if (!r.TryGetProperty(nombre, out var p)) return defecto;
            if (p.ValueKind == JsonValueKind.Number) return p.GetDouble();
            if (p.ValueKind == JsonValueKind.String && double.TryParse(p.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var d)) return d;
            return defecto;
        }

        // Llegeix una propietat de text d'un objecte JSON (null si no hi és).
        static string Texto(JsonElement r, string nombre)
        {
            return r.TryGetProperty(nombre, out var p) && p.ValueKind == JsonValueKind.String ? p.GetString() : null;
        }

        // ------------------------------------------------------------------ Modes
        // Envia el missatge "inicio" (i, en mode projecte, "planesProyecto" i "volarA" a Barcelona).
        public void EnviarInicio()
        {
            Enviar(ser.Inicio(Actual.Modo, Reloj.HoraUtc, Reloj.Escala));
            if (Actual is PlanesProyecto pp)
            {
                Enviar(ser.MensajePlanesProyecto(pp.DistanciaSeguridadNM));
                Enviar(ser.VolarA(PlanesProyecto.CentroLat, PlanesProyecto.CentroLon, 0.35));
                if (pp.Cantidad == 0)
                    Avisar("info", "No hi ha plans de vol carregats. Prem \"Carregar plans\" per triar un fitxer .txt.");
            }
        }

        // Canvia de mode ("simulado", "directo" o "proyecto"): atura la font anterior, prepara la nova i reenvia "inicio".
        public void CambiarModo(string modo)
        {
            if (modo != "simulado" && modo != "directo" && modo != "proyecto") return;
            if (Actual.Modo == modo && modo != "proyecto") return;
            // En sortir del mode en directe (que obliga a x1) es torna a l'escala habitual de la simulació
            if (Actual.Modo == "directo" && modo != "directo") Reloj.Escala = 60;

            Actual.DejarPilotar();
            escalaAntesPilotar = -1;
            directo?.Dispose();
            directo = null;
            idSeleccionado = -1;
            Detener(Actual);
            Reloj.PonerHoraReal();
            Reloj.Pausado = false;

            switch (modo)
            {
                case "simulado":
                    sim.Reiniciar();
                    Actual = sim;
                    break;
                case "directo":
                    Reloj.Escala = 1;                           // dades reals: temps real per defecte
                    directo = new FuenteOpenSky(Catalogo, Reloj);
                    directo.Fallo += OnFalloDirecto;
                    Suscribir(directo);
                    Actual = directo;
                    Avisar("info", "Connectant amb OpenSky Network...");
                    break;
                case "proyecto":
                    proyecto = new PlanesProyecto(Reloj, plantillaProyecto);
                    Suscribir(proyecto);
                    Actual = proyecto;
                    break;
            }
            accEstado = accInfoVuelo = accInfoAeropuerto = accEstadisticas = 0;
            EnviarInicio();
        }

        // Atura una font (només cal per al mode directe, que té descàrregues en curs).
        static void Detener(FuenteTrafico f) { f.Dispose(); }

        // Quan falla OpenSky: avisa amb l'error i torna al mode simulat.
        void OnFalloDirecto(string error)
        {
            Avisar("error", error + " Es torna al mode simulat.");
            CambiarModo("simulado");
        }

        // Obre el diàleg per triar un fitxer de plans de vol, el carrega amb FlightLib i l'activa al mode projecte.
        void CargarPlanes()
        {
            string ruta = PedirFicheroPlanes();
            if (string.IsNullOrEmpty(ruta)) return;
            var lista = new FlightPlanList();
            int codigo;
            try { codigo = lista.CargarFichero(ruta); }
            catch (Exception ex) { Avisar("error", "No s'ha pogut llegir el fitxer: " + ex.Message); return; }
            if (codigo == -1) { Avisar("error", "No s'ha trobat el fitxer de plans de vol."); return; }
            if (codigo > 0) { Avisar("error", $"Error de format a la línia {codigo} del fitxer de plans de vol."); return; }
            if (lista.GetNumber() == 0) { Avisar("error", "El fitxer no conté cap pla de vol."); return; }

            plantillaProyecto = lista;
            CambiarModo("proyecto");
            Avisar("ok", $"S'han carregat {lista.GetNumber()} plans de vol.");
        }

        // Genera l'informe amb els conflictes i instruccions i el desa a la ruta que demani l'usuari.
        void ExportarInforme()
        {
            string ruta = PedirFicheroInforme();
            if (string.IsNullOrEmpty(ruta)) return;
            string texto = Informe.Generar(Actual, Contactos);
            if (Informe.Guardar(ruta, texto)) Avisar("ok", "Informe desat a " + ruta);
            else Avisar("error", "No s'ha pogut desar l'informe.");
        }

        // Allibera les fonts (cancel·la descàrregues HTTP).
        public void Dispose()
        {
            listo = false;
            directo?.Dispose();
            sim?.Dispose();
            proyecto?.Dispose();
        }
    }
}
