namespace VistaAvancada.Motor
{
    // Fila d'una taula d'aeroport (sortides o arribades): hora local, vol, aeroport de l'altre extrem i estat.
    public class FilaTabla
    {
        public DateTime HoraUtc;
        public string HoraLocal, Callsign, Iata, Ciudad, Estado;
    }

    // Motor de la simulació mundial de trànsit aeri. Té un rellotge UTC simulat, genera vols entre aeroports
    // (amb rotacions d'avions), els avalua a cada pas i detecta/resol conflictes.
    public class MotorSimulacion : FuenteTrafico
    {
        public const int DensidadMaxima = 2500;
        static readonly TimeSpan HorizonteProgramacion = TimeSpan.FromHours(2);

        public Catalogo Catalogo { get; }
        readonly int semilla;
        GeneradorTrafico gen;
        int densidad = 800;
        double lambda;                                  // sortides candidates per segon simulat (ritme del generador)

        // Vols visibles ara, vols programats per sortir (ordenats per hora d'inici) i vols acabats fa menys de 2 h
        readonly List<VueloSimulado> activos = new List<VueloSimulado>();
        readonly List<VueloSimulado> pendientes = new List<VueloSimulado>();
        readonly List<VueloSimulado> recientes = new List<VueloSimulado>();
        readonly Dictionary<int, VueloSimulado> indice = new Dictionary<int, VueloSimulado>();
        readonly List<IVueloVista> vistas = new List<IVueloVista>();
        DateTime horizonte;                             // hora fins a la qual ja s'han generat sortides
        double acumDeteccion;                           // segons reals des de l'última detecció de conflictes

        public override string Modo => "simulado";
        public override IReadOnlyList<IVueloVista> Vuelos => vistas;
        public IReadOnlyList<VueloSimulado> VuelosActivos => activos;
        public int NumPendientes => pendientes.Count;

        // Densitat objectiu de vols simultanis; en canviar-la es regenera el món a l'hora actual.
        public int Densidad
        {
            get => densidad;
            set { densidad = Math.Max(10, Math.Min(DensidadMaxima, value)); Reiniciar(); }
        }

        // Crea el motor amb el catàleg, el rellotge compartit i la llavor aleatòria; ja deixa el món poblat de vols.
        public MotorSimulacion(Catalogo catalogo, Reloj reloj, int semilla = 12345, int densidad = 800)
        {
            Catalogo = catalogo;
            Reloj = reloj;
            this.semilla = semilla;
            this.densidad = Math.Max(10, Math.Min(DensidadMaxima, densidad));
            Reiniciar();
        }

        // Torna a generar tots els vols per a l'hora actual del rellotge: omple el món amb vols que ja són a mig camí
        // (sortides en les 20 h anteriors) i programa les sortides de les 2 h següents. Calibra el ritme de generació
        // perquè hi hagi aproximadament "densidad" vols en l'aire (dues passades).
        public void Reiniciar()
        {
            DateTime t0 = Reloj.HoraUtc;
            double duracionMedia = 2.7 * 3600.0 * 0.85;          // estimació inicial de la durada d'un vol (s)
            lambda = densidad / duracionMedia;
            for (int pasada = 0; pasada < 2; pasada++)
            {
                Vaciar();
                gen = new GeneradorTrafico(Catalogo, semilla);
                Poblar(t0);
                if (pasada == 0)
                {
                    int n = Math.Max(1, activos.Count(v => v.FaseIdx != Fases.Aterrat));
                    if (Math.Abs(n - densidad) < densidad * 0.04) break;
                    lambda *= densidad / (double)n;                // correcció proporcional
                }
            }
            horizonte = t0 + HorizonteProgramacion;
            ReconstruirVistas();
        }

        // Buida totes les llistes i el registre de conflictes.
        void Vaciar()
        {
            activos.Clear(); pendientes.Clear(); recientes.Clear(); indice.Clear(); vistas.Clear();
            Detector.Reiniciar();
            Instrucciones.Clear();
        }

        // Genera sortides entre t0 - 20 h i t0 + 2 h amb el ritme actual i les col·loca segons l'estat que tindran a t0.
        void Poblar(DateTime t0)
        {
            double ventana = 22.0 * 3600.0;
            DateTime inicio = t0.AddHours(-20);
            int n = (int)Math.Round(lambda * ventana);
            DateTime limite = t0 - HorizonteProgramacion - TimeSpan.FromMinutes(20);
            for (int i = 0; i < n; i++)
            {
                var salida = inicio.AddSeconds(gen.Azar.NextDouble() * ventana);
                var v = gen.Crear(salida, limite);
                if (v != null) Colocar(v, t0);
            }
        }

        // Col·loca un vol nou a la llista que correspon a l'instant t (actiu, pendent o ja acabat).
        void Colocar(VueloSimulado v, DateTime t)
        {
            if (v.Llegada.AddHours(2) < t) return;              // ja no apareix ni a les taules
            indice[v.Id] = v;
            if (v.FinVisible < t) recientes.Add(v);
            else if (v.InicioVisible <= t) { v.Evaluar(t); activos.Add(v); }
            else
            {
                // inserció ordenada per hora d'inici del rodatge (cerca binària)
                int lo = 0, hi = pendientes.Count;
                while (lo < hi)
                {
                    int m = (lo + hi) / 2;
                    if (pendientes[m].InicioVisible <= v.InicioVisible) lo = m + 1; else hi = m;
                }
                pendientes.Insert(lo, v);
            }
        }

        // Actualitza la llista de vistes (interfície comuna) a partir dels vols actius.
        void ReconstruirVistas()
        {
            vistas.Clear();
            foreach (var v in activos) vistas.Add(v);
        }

        public override IVueloVista BuscarVuelo(int id)
        {
            return indice.TryGetValue(id, out var v) && activos.Contains(v) ? v : null;
        }

        // Busca un vol de la simulació (actiu, pendent o recent) pel seu id.
        public VueloSimulado BuscarSimulado(int id)
        {
            indice.TryGetValue(id, out var v);
            return v;
        }

        // Avança el motor: mou el rellotge, genera noves sortides, activa i retira vols, avalua posicions
        // i detecta conflictes (cada ~30 s simulats). Rep els segons reals transcorreguts.
        public override void Avanzar(double segundosReales)
        {
            Reloj.Avanzar(segundosReales);
            DateTime t = Reloj.HoraUtc;

            // 1) Generació de sortides futures fins a t + 2 h, en blocs de 10 minuts
            while (horizonte < t + HorizonteProgramacion)
            {
                DateTime fin = horizonte.AddMinutes(10);
                // ritme del flux base: el 60% de les sortides; la resta són rotacions (tornades)
                double esperados = lambda * 0.6 * (fin - horizonte).TotalSeconds;
                int n = (int)esperados + (gen.Azar.NextDouble() < esperados - Math.Floor(esperados) ? 1 : 0);
                for (int i = 0; i < n; i++)
                {
                    var v = gen.Crear(horizonte.AddSeconds(gen.Azar.NextDouble() * 600.0), DateTime.MinValue);
                    if (v != null) Colocar(v, t);
                }
                horizonte = fin;
            }

            // 2) Els vols programats que ja han de començar el rodatge passen a ser actius
            int k = 0;
            while (k < pendientes.Count && pendientes[k].InicioVisible <= t) k++;
            if (k > 0)
            {
                for (int i = 0; i < k; i++) activos.Add(pendientes[i]);
                pendientes.RemoveRange(0, k);
            }

            // 3) Avaluar posicions i retirar els vols que ja han acabat (amb possible rotació)
            for (int i = activos.Count - 1; i >= 0; i--)
            {
                var v = activos[i];
                if (v.FinVisible < t)
                {
                    activos.RemoveAt(i);
                    recientes.Add(v);
                    ProgramarRetorno(v, t);
                }
                else v.Evaluar(t);
            }
            for (int i = recientes.Count - 1; i >= 0; i--)
                if (recientes[i].Llegada.AddHours(2) < t)
                {
                    indice.Remove(recientes[i].Id);
                    recientes.RemoveAt(i);
                }
            ReconstruirVistas();

            // 4) Detecció de conflictes
            acumDeteccion += segundosReales;
            // Interval de detecció: uns 30 s simulats (0,5 s reals a escala 60), mai menys d'un pas
            if (acumDeteccion >= Math.Max(0.04, Math.Min(0.5, 30.0 / Math.Max(1.0, Reloj.Escala))))
            {
                acumDeteccion = 0;
                Detector.Actualizar(vistas, t, v => NombreBdDe(v));
            }
        }

        // Quan un vol acaba, el mateix avió pot fer el vol de tornada 45-90 minuts després de l'aterratge (40% dels casos).
        void ProgramarRetorno(VueloSimulado v, DateTime t)
        {
            if (v.EsRetorno && gen.Azar.NextDouble() < 0.5) return;       // les cadenes llargues s'acaben
            if (gen.Azar.NextDouble() >= 0.4) return;
            var salida = v.Llegada.AddMinutes(45 + gen.Azar.NextDouble() * 45);
            var r = gen.CrearRetorno(v, salida);
            if (r != null) Colocar(r, t);
        }

        public override string NombreBdDe(IVueloVista v) => (v as VueloSimulado)?.Aerolinea.NombreBd;
        public override string NombreAerolineaDe(IVueloVista v) => (v as VueloSimulado)?.Aerolinea.Nombre;

        // ------------------------------------------------------------------ Taules d'aeroport
        // Construeix les taules de sortides i arribades de l'aeroport entre 2 h abans i 2 h després de "ahora".
        // Retorna les dues llistes ordenades per hora (com a molt "max" files cadascuna).
        public (List<FilaTabla> salidas, List<FilaTabla> llegadas) Tabla(Aeropuerto ap, DateTime ahora, int max = 40)
        {
            var salidas = new List<FilaTabla>();
            var llegadas = new List<FilaTabla>();
            DateTime desde = ahora.AddHours(-2), hasta = ahora.AddHours(2);

            void Revisar(VueloSimulado v)
            {
                if (v.Origen == ap && v.Salida >= desde && v.Salida <= hasta)
                    salidas.Add(new FilaTabla
                    {
                        HoraUtc = v.Salida, HoraLocal = ap.HoraLocal(v.Salida).ToString("HH:mm"), Callsign = v.Callsign,
                        Iata = v.Destino.Iata, Ciudad = v.Destino.Ciudad, Estado = v.EstadoSalida(ahora)
                    });
                if (v.Destino == ap && v.Llegada >= desde && v.Llegada <= hasta)
                    llegadas.Add(new FilaTabla
                    {
                        HoraUtc = v.Llegada, HoraLocal = ap.HoraLocal(v.Llegada).ToString("HH:mm"), Callsign = v.Callsign,
                        Iata = v.Origen.Iata, Ciudad = v.Origen.Ciudad, Estado = v.EstadoLlegada(ahora)
                    });
            }
            foreach (var v in activos) Revisar(v);
            foreach (var v in pendientes) Revisar(v);
            foreach (var v in recientes) Revisar(v);

            salidas.Sort((a, b) => a.HoraUtc.CompareTo(b.HoraUtc));
            llegadas.Sort((a, b) => a.HoraUtc.CompareTo(b.HoraUtc));
            // Si n'hi ha massa, es mostren les més properes a l'hora actual
            salidas = Recortar(salidas, ahora, max);
            llegadas = Recortar(llegadas, ahora, max);
            return (salidas, llegadas);
        }

        // Conserva les "max" files més properes a l'hora actual (mantenint l'ordre cronològic).
        static List<FilaTabla> Recortar(List<FilaTabla> filas, DateTime ahora, int max)
        {
            if (filas.Count <= max) return filas;
            return filas.OrderBy(f => Math.Abs((f.HoraUtc - ahora).TotalSeconds)).Take(max).OrderBy(f => f.HoraUtc).ToList();
        }

        // ------------------------------------------------------------------ Resolució de conflictes
        // Opció de maniobra avaluada pel resolutor.
        sealed class Opcion
        {
            public VueloSimulado Vuelo;
            public double? NuevoH;           // nou nivell de creuer (ft) o null
            public double Factor = 1.0;      // factor de velocitat
            public double Puntuacion;        // com més petita, millor
        }

        // Resol un conflicte entre dos avions amb la millor maniobra: canvi de nivell de +-2000 ft (manté la regla
        // semicircular), si no és possible un canvi de velocitat de +-5/10% que obri la separació i, com a últim recurs,
        // +-1000 ft. Aplica la instrucció, la guarda i la retorna (null si no s'ha trobat cap solució).
        public override Instruccion ResolverConflicto(int idA, int idB)
        {
            if (!indice.TryGetValue(idA, out var a) || !indice.TryGetValue(idB, out var b)) return null;
            var existente = Detector.BuscarActivo(idA, idB);
            if (existente?.Instruccion != null) return existente.Instruccion;      // ja s'ha donat una instrucció

            DateTime ahora = Reloj.HoraUtc;
            Opcion mejor = null;
            foreach (var (f, o) in new[] { (a, b), (b, a) })
            {
                if (f.FaseIdx != Fases.Pujada && f.FaseIdx != Fases.Creuer) continue;
                if ((ahora - f.UltimaInstruccion).TotalSeconds < 90) continue;       // acaba de rebre una instrucció

                // Opcions de nivell: +-2000 (preferides), +-1000 (només si no queda res més)
                foreach (double delta in new[] { 2000.0, -2000.0, 1000.0, -1000.0 })
                {
                    double hN = f.AltitudObjetivoFt + delta;
                    if (hN > f.AltitudMaximaFt || hN < 11000) continue;
                    // El nou nivell ha de quedar separat de l'altre avió i no travessar-lo pel camí
                    double hOtro = o.FaseIdx == Fases.Creuer ? o.AltitudObjetivoFt : o.AltitudFt;
                    // L'altre avió no pot quedar "pel camí" (entre l'altitud actual i el nou nivell, amb marge de 1000 ft)
                    if (EnCamino(o.AltitudFt, f.AltitudFt, hN)) continue;
                    if (Math.Abs(hN - hOtro) < DetectorConflictos.DifVerticalFt) continue;
                    if (!f.Reprogramar(ahora, hN, 1.0, false)) continue;

                    double p = Math.Abs(delta) == 2000 ? 1000 : 6000;
                    if (f.FaseIdx == Fases.Pujada) p += 300;
                    // Millor pujar l'avió que és més amunt i baixar el que és més avall
                    if ((delta > 0) != (f.AltitudFt >= o.AltitudFt)) p += 200;
                    // Evita nivells ocupats per altre trànsit proper
                    foreach (var nb in Detector.Cercanos(f.Lat, f.Lon, 15))
                        if (nb != f && nb != o && EnCamino(nb.AltitudFt, f.AltitudFt, hN)) { p += 8000; break; }
                    if (mejor == null || p < mejor.Puntuacion) mejor = new Opcion { Vuelo = f, NuevoH = hN, Puntuacion = p };
                }

                // Opcions de velocitat: només si fan créixer el ritme d'obertura de la separació
                double obertura0 = RitmoObertura(f, o, 1.0);
                foreach (double factor in new[] { 0.95, 1.05, 0.90, 1.10 })
                {
                    if (f.FaseIdx != Fases.Creuer) continue;
                    if (!f.Reprogramar(ahora, null, factor, false)) continue;
                    double mejora = RitmoObertura(f, o, factor) - obertura0;
                    if (mejora <= 1.0) continue;
                    double p = 3000 + Math.Abs(1 - factor) * 5000;
                    if (mejor == null || p < mejor.Puntuacion) mejor = new Opcion { Vuelo = f, Factor = factor, Puntuacion = p };
                }
            }

            if (mejor == null)
            {
                AvisarUsuario("error", $"No s'ha trobat cap maniobra viable per a {a.Callsign} i {b.Callsign}.");
                return null;
            }
            return Aplicar(mejor, a, b, ahora);
        }

        // Retorna true si un avió a l'altitud "otro" queda al camí d'un avió que va de "desde" a "hasta" (ft):
        // a la banda cap on es mou i fins a 1000 ft més enllà del nou nivell. Els que queden enrere no compten.
        static bool EnCamino(double otro, double desde, double hasta)
        {
            if (hasta > desde) return otro > desde + 100 && otro < hasta + DetectorConflictos.DifVerticalFt;
            return otro < desde - 100 && otro > hasta - DetectorConflictos.DifVerticalFt;
        }

        // Ritme (NM/h) amb què s'obre la distància entre f i o si f multiplica la seva velocitat pel factor indicat
        // (positiu = s'allunyen). S'usa la projecció plana local: east/north en NM respecte a f.
        static double RitmoObertura(VueloSimulado f, VueloSimulado o, double factor)
        {
            double cosLat = Math.Cos(f.Lat * Geo.GradosARad);
            double rx = (o.Lon - f.Lon) * 60.0 * cosLat, ry = (o.Lat - f.Lat) * 60.0;
            double vfx = f.VelocidadKt * factor * Math.Sin(f.Rumbo * Geo.GradosARad);
            double vfy = f.VelocidadKt * factor * Math.Cos(f.Rumbo * Geo.GradosARad);
            double vox = o.VelocidadKt * Math.Sin(o.Rumbo * Geo.GradosARad);
            double voy = o.VelocidadKt * Math.Cos(o.Rumbo * Geo.GradosARad);
            double r = Math.Sqrt(rx * rx + ry * ry);
            if (r < 1e-6) return 0;
            // derivada de la distància: (r · v_rel) / |r|, amb v_rel = v_o - v_f
            return (rx * (vox - vfx) + ry * (voy - vfy)) / r;
        }

        // Aplica la maniobra triada, en construeix el text en català i el registra. Retorna la instrucció.
        Instruccion Aplicar(Opcion op, VueloSimulado a, VueloSimulado b, DateTime ahora)
        {
            var f = op.Vuelo;
            double hAntes = f.AltitudObjetivoFt;
            f.Reprogramar(ahora, op.NuevoH, op.Factor, true);
            string texto;
            if (op.NuevoH.HasValue)
            {
                int fl = (int)Math.Round(op.NuevoH.Value / 100.0);
                texto = $"{f.Callsign}: {(op.NuevoH.Value > hAntes ? "pugi" : "baixi")} a FL{fl}";
            }
            else
            {
                int kt = (int)(Math.Round(f.VelCruceroActualKt / 5.0) * 5);
                texto = $"{f.Callsign}: {(op.Factor < 1 ? "redueixi" : "augmenti")} velocitat a {kt} kt";
            }
            var ins = new Instruccion
            {
                Hora = ahora, IdVuelo = f.Id, Callsign = f.Callsign, NombreBd = f.Aerolinea.NombreBd,
                Texto = texto, IdA = Math.Min(a.Id, b.Id), IdB = Math.Max(a.Id, b.Id)
            };
            f.TextosInstrucciones.Add(texto);
            f.UltimaInstruccion = ahora;
            RegistrarInstruccion(ins);
            AvisarUsuario("ok", "Instrucció ATC: " + texto);
            return ins;
        }
    }
}
