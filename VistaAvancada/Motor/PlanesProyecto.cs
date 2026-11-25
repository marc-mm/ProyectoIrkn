using FlightLib;

namespace VistaAvancada.Motor
{
    // Un pla de vol del projecte original dibuixat sobre el globus. Embolcalla un FlightPlan de FlightLib.
    public class VueloProyecto : IVueloVista, IVueloPilotable
    {
        public int Id { get; set; }
        public FlightPlan Plan { get; set; }
        public string Compania => Plan.GetCompania();
        public string Callsign => Plan.GetId();
        public int AerolineaIdx => -2;
        public double Lat { get; set; }
        public double Lon { get; set; }
        public double AltitudFt { get; set; } = PlanesProyecto.AltitudFt;
        public double Rumbo { get; set; }
        public double VelocidadKt => Manual ? velManual : Plan.GetVelocidad();
        public double VelVerticalFpm => Manual ? vvManual : 0;
        public int FaseIdx { get; set; } = Fases.Creuer;
        public bool EnTierra => false;
        public bool EnConflicto { get; set; }
        public bool HaLlegado => Plan.HasArrived();

        // Pilotatge manual: la posició la marca la pàgina i es copia al FlightPlan (en unitats del projecte), de manera
        // que la detecció de conflictes de FlightLib també el té en compte. En deixar-lo, el pla continua cap al seu destí.
        public bool Manual { get; private set; }
        double velManual, vvManual;

        // Fixa la posició que envia la pàgina mentre l'usuari pilota l'avió.
        public void PonerManual(double lat, double lon, double altFt, double rumbo, double velKt, double vvFpm, DateTime utc)
        {
            Manual = true;
            Lat = lat; Lon = Geo.NormalizarLon(lon); AltitudFt = Math.Max(0, altFt);
            Rumbo = Geo.Normalizar360(rumbo); velManual = Math.Max(0, velKt); vvManual = vvFpm;
            var (x, y) = PlanesProyecto.AProyecto(Lat, Lon);
            Plan.SetCurrentPosition(new Position(x, y));
        }

        // Torna el control al pla de vol (continua des d'on l'ha deixat l'usuari, a l'altitud del mode projecte).
        public void Liberar(DateTime utc)
        {
            Manual = false;
            AltitudFt = PlanesProyecto.AltitudFt;
        }
    }

    // Mode "proyecto": mostra els plans de vol del projecte original (FlightPlanList) sobre Barcelona.
    // Equivalència: 1 unitat = 1 NM, (400,400) = aeroport del Prat, x creix cap a l'est i y cap al SUD (coordenades de pantalla).
    // Reutilitza la lògica de FlightLib (Move, Conflicto, ConflictoFuturo, BuscarVelocidad) sense modificar la simulació original.
    public class PlanesProyecto : FuenteTrafico
    {
        public const double CentroLat = 41.2971, CentroLon = 2.0785;
        public const double CentroX = 400, CentroY = 400;
        public const double AltitudFt = 30000;
        public const double Maximo = 799;                    // límit de coordenades de FlightLib (0..799)

        readonly List<VueloProyecto> vuelos = new List<VueloProyecto>();
        readonly List<IVueloVista> vistas = new List<IVueloVista>();
        readonly Dictionary<int, VueloProyecto> porId = new Dictionary<int, VueloProyecto>();
        double acumDeteccion, acumPrevistos;

        // Distància de seguretat en unitats (= NM)
        public double DistanciaSeguridadNM { get; set; } = 25;
        // Parelles (idA, idB) que tindran conflicte si res no canvia (predicció amb ConflictoFuturo)
        public List<(int idA, int idB)> Previstos { get; } = new List<(int, int)>();

        public override string Modo => "proyecto";
        public override IReadOnlyList<IVueloVista> Vuelos => vistas;
        public int Cantidad => vuelos.Count;

        // Crea el mode amb el rellotge compartit i una còpia dels plans de la llista rebuda (pot ser buida o null).
        public PlanesProyecto(Reloj reloj, FlightPlanList origen)
        {
            Reloj = reloj;
            Cargar(origen);
        }

        // Substitueix els plans per una còpia nova dels de la llista (posició inicial i velocitat actual de cada pla);
        // així la simulació original no es modifica mai. Reinicia també el registre de conflictes.
        public void Cargar(FlightPlanList origen)
        {
            vuelos.Clear(); porId.Clear(); vistas.Clear(); Previstos.Clear();
            Detector.Reiniciar();
            Instrucciones.Clear();
            if (origen != null)
                for (int i = 0; i < origen.GetNumber(); i++)
                {
                    var p = origen.GetFlightPlan(i);
                    var ini = p.GetInitialPosition();
                    var fin = p.GetFinalPosition();
                    var copia = new FlightPlan(p.GetId(), p.GetCompania(), ini.GetX(), ini.GetY(), fin.GetX(), fin.GetY(), p.GetVelocidad());
                    var v = new VueloProyecto { Id = i + 1, Plan = copia };
                    vuelos.Add(v);
                    porId[v.Id] = v;
                    vistas.Add(v);
                }
            foreach (var v in vuelos) Actualizar(v);
        }

        // Converteix coordenades del projecte (x, y) a latitud/longitud: l'offset en NM respecte al centre
        // (est = x - 400, nord = -(y - 400)) es recorre sobre l'esfera amb distància i rumb.
        public static (double lat, double lon) AGeografico(double x, double y)
        {
            double este = x - CentroX, norte = -(y - CentroY);
            double dist = Math.Sqrt(este * este + norte * norte);
            if (dist < 1e-9) return (CentroLat, CentroLon);
            double rumbo = Math.Atan2(este, norte) * Geo.RadAGrados;
            return Geo.Destino(CentroLat, CentroLon, rumbo, dist);
        }

        // Inversa d'AGeografico: latitud/longitud -> coordenades del projecte (x cap a l'est, y cap al sud, en NM).
        public static (double x, double y) AProyecto(double lat, double lon)
        {
            double dist = Geo.Distancia(CentroLat, CentroLon, lat, lon);
            if (dist < 1e-9) return (CentroX, CentroY);
            double rumbo = Geo.Rumbo(CentroLat, CentroLon, lat, lon) * Geo.GradosARad;
            return (CentroX + dist * Math.Sin(rumbo), CentroY - dist * Math.Cos(rumbo));
        }

        // Les quatre cantonades de l'espai aeri (0..799) com a [lat, lon]: NO, NE, SE, SO.
        public static double[][] Caja()
        {
            var esq = new[] { (0.0, 0.0), (Maximo, 0.0), (Maximo, Maximo), (0.0, Maximo) };
            return esq.Select(c => { var g = AGeografico(c.Item1, c.Item2); return new[] { g.lat, g.lon }; }).ToArray();
        }

        // Actualitza la posició geogràfica, el rumb i la fase d'un vol segons l'estat del seu FlightPlan.
        static void Actualizar(VueloProyecto v)
        {
            var pos = v.Plan.GetCurrentPosition();
            var fin = v.Plan.GetFinalPosition();
            var g = AGeografico(pos.GetX(), pos.GetY());
            v.Lat = g.lat; v.Lon = g.lon;
            double dx = fin.GetX() - pos.GetX(), dy = fin.GetY() - pos.GetY();
            if (Math.Abs(dx) > 1e-9 || Math.Abs(dy) > 1e-9)
                v.Rumbo = Geo.Normalizar360(Math.Atan2(dx, -dy) * Geo.RadAGrados);   // y creix cap al sud
            bool llegado = v.Plan.HasArrived();
            v.FaseIdx = llegado ? Fases.Aterrat : Fases.Creuer;
            v.AltitudFt = llegado ? 0 : AltitudFt;
        }

        public override IVueloVista BuscarVuelo(int id) => porId.TryGetValue(id, out var v) ? v : null;
        public override string NombreBdDe(IVueloVista v) => (v as VueloProyecto)?.Compania;
        public override string NombreAerolineaDe(IVueloVista v) => (v as VueloProyecto)?.Compania;

        // Avança els plans el temps simulat (FlightPlan.Move, velocitat en unitats per hora = nusos),
        // detecta els conflictes actuals (cada 0,5 s reals) i els previstos (cada segon, si hi ha pocs plans).
        public override void Avanzar(double segundosReales)
        {
            double segSim = Reloj.Avanzar(segundosReales);
            if (segSim > 0)
                foreach (var v in vuelos)
                {
                    if (v.Manual) continue;                 // el pilota l'usuari
                    v.Plan.Move(segSim / 60.0);
                    Actualizar(v);
                }

            acumDeteccion += segundosReales;
            if (acumDeteccion >= 0.5)
            {
                acumDeteccion = 0;
                DetectarActuales();
            }
            acumPrevistos += segundosReales;
            if (acumPrevistos >= 1.0)
            {
                acumPrevistos = 0;
                CalcularPrevistos();
            }
        }

        // Troba les parelles que ara mateix són a menys de la distància de seguretat (Conflicto de FlightLib)
        // i les registra al detector.
        void DetectarActuales()
        {
            var pares = new List<ParConflicto>();
            for (int i = 0; i < vuelos.Count; i++)
            {
                vuelos[i].EnConflicto = false;
                if (vuelos[i].HaLlegado) continue;
                for (int j = i + 1; j < vuelos.Count; j++)
                {
                    if (vuelos[j].HaLlegado) continue;
                    if (vuelos[i].Plan.Conflicto(vuelos[j].Plan, DistanciaSeguridadNM))
                        pares.Add(new ParConflicto { A = vuelos[i], B = vuelos[j], DistNM = vuelos[i].Plan.Distance(vuelos[j].Plan), DifAltFt = 0 });
                }
            }
            Detector.Registrar(pares, Reloj.HoraUtc, v => NombreBdDe(v));
        }

        // Còpia dels plans que encara volen, amb la posició actual com a inici: serveix per prevenir/resoldre conflictes
        // amb la lògica de FlightLib sense tocar els plans reals (ConflictoFuturo reinicia les posicions).
        (FlightPlanList lista, List<VueloProyecto> origen) CopiaDesdeAhora()
        {
            var l = new FlightPlanList();
            var o = new List<VueloProyecto>();
            foreach (var v in vuelos)
            {
                if (v.HaLlegado) continue;
                var pos = v.Plan.GetCurrentPosition();
                var fin = v.Plan.GetFinalPosition();
                l.AddFlightPlan(new FlightPlan(v.Plan.GetId(), v.Plan.GetCompania(), pos.GetX(), pos.GetY(), fin.GetX(), fin.GetY(), v.Plan.GetVelocidad()));
                o.Add(v);
            }
            return (l, o);
        }

        // Calcula les parelles que tindran conflicte en el futur amb ConflictoFuturo de FlightLib.
        void CalcularPrevistos()
        {
            Previstos.Clear();
            var (l, o) = CopiaDesdeAhora();
            if (o.Count < 2 || o.Count > 150) return;
            for (int i = 0; i < o.Count; i++)
                for (int j = i + 1; j < o.Count; j++)
                    if (l.GetFlightPlan(i).ConflictoFuturo(l.GetFlightPlan(j), DistanciaSeguridadNM, 0))
                        Previstos.Add((o[i].Id, o[j].Id));
        }

        // Resol un conflicte (actual o previst) canviant la velocitat d'un dels dos plans amb l'algorisme de l'equip
        // (FlightPlanList.BuscarVelocidad). Prova amb tots dos i aplica el canvi més petit. Retorna la instrucció o null.
        public override Instruccion ResolverConflicto(int idA, int idB)
        {
            if (!porId.TryGetValue(idA, out var a) || !porId.TryGetValue(idB, out var b)) return null;
            var (l, o) = CopiaDesdeAhora();
            VueloProyecto mejor = null;
            double mejorVel = -1, mejorCambio = double.MaxValue;
            foreach (var v in new[] { a, b })
            {
                if (v.Manual) continue;                     // a l'avió pilotat no se li donen instruccions
                int i = o.IndexOf(v);
                if (i < 0) continue;
                double vel = l.BuscarVelocidad(i, DistanciaSeguridadNM, 0);
                if (vel < 0) continue;
                double cambio = Math.Abs(vel - v.Plan.GetVelocidad());
                if (cambio < mejorCambio) { mejorCambio = cambio; mejor = v; mejorVel = vel; }
            }
            if (mejor == null)
            {
                AvisarUsuario("error", $"Cap canvi de velocitat evita el conflicte entre {a.Callsign} i {b.Callsign}.");
                return null;
            }
            double antes = mejor.Plan.GetVelocidad();
            mejor.Plan.SetVelocidad(mejorVel);
            string texto = FormattableString.Invariant($"{mejor.Callsign}: {(mejorVel < antes ? "redueixi" : "augmenti")} velocitat de {antes:0.##} a {mejorVel:0.##} kt");
            var ins = new Instruccion
            {
                Hora = Reloj.HoraUtc, IdVuelo = mejor.Id, Callsign = mejor.Callsign, NombreBd = mejor.Compania,
                Texto = texto, IdA = Math.Min(idA, idB), IdB = Math.Max(idA, idB)
            };
            RegistrarInstruccion(ins);
            AvisarUsuario("ok", "Instrucció ATC: " + texto);
            return ins;
        }

        // Resol les parelles previstes i les actuals (cada una un cop), reavaluant després de cada canvi.
        public override List<Instruccion> ResolverTodos()
        {
            var resultado = new List<Instruccion>();
            CalcularPrevistos();
            var pares = Previstos.ToList();
            foreach (var c in Detector.Activos)
                if (!pares.Contains((c.IdA, c.IdB))) pares.Add((c.IdA, c.IdB));
            foreach (var (ia, ib) in pares)
            {
                if (!porId.TryGetValue(ia, out var a) || !porId.TryGetValue(ib, out var b)) continue;
                var (l, o) = CopiaDesdeAhora();
                int i = o.IndexOf(a), j = o.IndexOf(b);
                if (i < 0 || j < 0 || !l.GetFlightPlan(i).ConflictoFuturo(l.GetFlightPlan(j), DistanciaSeguridadNM, 0))
                    continue;                                   // ja resolt per un canvi anterior
                var ins = ResolverConflicto(ia, ib);
                if (ins != null) resultado.Add(ins);
            }
            CalcularPrevistos();
            return resultado;
        }
    }
}
