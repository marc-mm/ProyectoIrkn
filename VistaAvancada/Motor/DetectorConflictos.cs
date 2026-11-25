namespace VistaAvancada.Motor
{
    // Detecta conflictes entre avions amb una reixeta espacial (cel·les d'1 grau x 1 grau) per ser O(n) de mitjana.
    // Conflicte = els dos en l'aire, per sobre de 10.000 ft, a menys de 5 NM en horitzontal
    // I a menys de 1000 ft en vertical. També porta el registre dels conflictes actius, l'historial i el
    // comptador de resolts.
    public class DetectorConflictos
    {
        public const double DistHorizontalNM = 5.0;
        public const double DifVerticalFt = 1000.0;
        public const double AltitudMinimaFt = 10000.0;

        // Reixeta construïda a l'última detecció (clau de cel·la -> avions)
        Dictionary<int, List<IVueloVista>> rejilla = new Dictionary<int, List<IVueloVista>>();
        readonly Dictionary<long, ConflictoActivo> activos = new Dictionary<long, ConflictoActivo>();
        readonly List<ConflictoActivo> historial = new List<ConflictoActivo>();

        public IReadOnlyCollection<ConflictoActivo> Activos => activos.Values;
        public IReadOnlyList<ConflictoActivo> Historial => historial;
        public int Resueltos { get; private set; }

        // Clau única de la parella (independent de l'ordre dels dos ids).
        static long ClavePar(int a, int b) => a < b ? ((long)a << 32) | (uint)b : ((long)b << 32) | (uint)a;

        // Retorna el conflicte actiu entre dos avions (o null).
        public ConflictoActivo BuscarActivo(int idA, int idB)
        {
            activos.TryGetValue(ClavePar(idA, idB), out var c);
            return c;
        }

        // Clau de cel·la: fila (latitud + 90) * 400 + columna (longitud + 180).
        static int Celda(double lat, double lon)
        {
            int f = (int)Math.Floor(lat) + 90;
            int c = ((int)Math.Floor(lon) + 180 + 360) % 360;
            return f * 400 + c;
        }

        // Construeix la reixeta amb els avions en l'aire per sobre de 10.000 ft. Retorna res; queda guardada a "rejilla".
        void ConstruirRejilla(IReadOnlyList<IVueloVista> vuelos)
        {
            var nueva = new Dictionary<int, List<IVueloVista>>(Math.Max(16, vuelos.Count / 2));
            for (int i = 0; i < vuelos.Count; i++)
            {
                var v = vuelos[i];
                v.EnConflicto = false;
                if (v.EnTierra || v.AltitudFt < AltitudMinimaFt) continue;
                int k = Celda(v.Lat, v.Lon);
                if (!nueva.TryGetValue(k, out var lista))
                {
                    lista = new List<IVueloVista>(4);
                    nueva[k] = lista;
                }
                lista.Add(v);
            }
            rejilla = nueva;
        }

        // Busca les parelles en conflicte en aquest instant. Cada avió només es compara amb els de la seva cel·la
        // i les 8 veïnes (a latituds altes, on un grau de longitud és molt curt, amb més columnes veïnes).
        public List<ParConflicto> Detectar(IReadOnlyList<IVueloVista> vuelos)
        {
            ConstruirRejilla(vuelos);
            var resultado = new List<ParConflicto>();
            foreach (var par in rejilla)
            {
                foreach (var a in par.Value)
                {
                    int fila = (int)Math.Floor(a.Lat) + 90;
                    int col = ((int)Math.Floor(a.Lon) + 180 + 360) % 360;
                    int nc = Math.Abs(a.Lat) > 80 ? 6 : 1;          // columnes veïnes a cada costat
                    double cosLat = Math.Cos(a.Lat * Geo.GradosARad);
                    for (int df = -1; df <= 1; df++)
                    {
                        int f2 = fila + df;
                        if (f2 < 0 || f2 > 180) continue;
                        for (int dc = -nc; dc <= nc; dc++)
                        {
                            int c2 = (col + dc + 360) % 360;
                            if (!rejilla.TryGetValue(f2 * 400 + c2, out var lista)) continue;
                            foreach (var b in lista)
                            {
                                if (b.Id <= a.Id) continue;                        // cada parella només un cop
                                double dAlt = Math.Abs(a.AltitudFt - b.AltitudFt);
                                if (dAlt >= DifVerticalFt) continue;
                                // Filtre ràpid pla (1 grau de latitud = 60 NM) abans de la distància exacta
                                double dy = (b.Lat - a.Lat) * 60.0;
                                if (Math.Abs(dy) > DistHorizontalNM * 1.5) continue;
                                double dLon = b.Lon - a.Lon;
                                if (dLon > 180) dLon -= 360; else if (dLon < -180) dLon += 360;
                                double dx = dLon * 60.0 * cosLat;
                                if (Math.Abs(dx) > DistHorizontalNM * 1.5) continue;
                                double d = Geo.Distancia(a.Lat, a.Lon, b.Lat, b.Lon);
                                if (d < DistHorizontalNM)
                                    resultado.Add(new ParConflicto { A = a, B = b, DistNM = d, DifAltFt = dAlt });
                            }
                        }
                    }
                }
            }
            return resultado;
        }

        // Retorna els avions de la reixeta propers a un punt (radi aproximat en NM), segons l'última detecció.
        public IEnumerable<IVueloVista> Cercanos(double lat, double lon, double radioNM)
        {
            int fila = (int)Math.Floor(lat) + 90;
            int col = ((int)Math.Floor(lon) + 180 + 360) % 360;
            int n = Math.Max(1, (int)Math.Ceiling(radioNM / 60.0));
            int nc = Math.Abs(lat) > 80 ? n + 5 : n;
            for (int df = -n; df <= n; df++)
                for (int dc = -nc; dc <= nc; dc++)
                {
                    int f2 = fila + df;
                    if (f2 < 0 || f2 > 180) continue;
                    if (rejilla.TryGetValue(f2 * 400 + (col + dc + 360) % 360, out var lista))
                        foreach (var v in lista) yield return v;
                }
        }

        // Actualitza el registre de conflictes amb les parelles actuals: n'obre de nous, actualitza els que
        // continuen i tanca (comptant-los com a resolts) els que ja no hi són. També marca els avions amb EnConflicto.
        public void Registrar(List<ParConflicto> actuales, DateTime hora, Func<IVueloVista, string> nombreBd = null)
        {
            var vistos = new HashSet<long>();
            foreach (var p in actuales)
            {
                long k = ClavePar(p.A.Id, p.B.Id);
                vistos.Add(k);
                p.A.EnConflicto = true;
                p.B.EnConflicto = true;
                if (!activos.TryGetValue(k, out var c))
                {
                    c = new ConflictoActivo
                    {
                        IdA = Math.Min(p.A.Id, p.B.Id), IdB = Math.Max(p.A.Id, p.B.Id), Detectado = hora,
                        CallsignA = p.A.Id < p.B.Id ? p.A.Callsign : p.B.Callsign,
                        CallsignB = p.A.Id < p.B.Id ? p.B.Callsign : p.A.Callsign,
                        NombreBdA = nombreBd?.Invoke(p.A.Id < p.B.Id ? p.A : p.B),
                        NombreBdB = nombreBd?.Invoke(p.A.Id < p.B.Id ? p.B : p.A)
                    };
                    activos[k] = c;
                    historial.Add(c);
                    if (historial.Count > 5000) historial.RemoveAt(0);
                }
                c.DistNM = p.DistNM;
                c.DifAltFt = p.DifAltFt;
                if (p.DistNM < c.MinDistNM) c.MinDistNM = p.DistNM;
            }

            // Els que ja no hi són s'han resolt (per una instrucció o perquè els avions s'han separat)
            List<long> acabados = null;
            foreach (var kv in activos)
                if (!vistos.Contains(kv.Key))
                    (acabados ??= new List<long>()).Add(kv.Key);
            if (acabados != null)
                foreach (var k in acabados)
                {
                    var c = activos[k];
                    c.Activo = false;
                    c.Finalizado = hora;
                    activos.Remove(k);
                    Resueltos++;
                }
        }

        // Detecta i registra en un sol pas (avions amb posició geogràfica).
        public void Actualizar(IReadOnlyList<IVueloVista> vuelos, DateTime hora, Func<IVueloVista, string> nombreBd = null)
        {
            Registrar(Detectar(vuelos), hora, nombreBd);
        }

        // Esborra tot el registre (en canviar de mode o reiniciar la simulació).
        public void Reiniciar()
        {
            activos.Clear();
            historial.Clear();
            rejilla.Clear();
            Resueltos = 0;
        }
    }
}
