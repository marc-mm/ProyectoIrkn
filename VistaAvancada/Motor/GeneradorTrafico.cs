namespace VistaAvancada.Motor
{
    // Genera matrícules d'avió versemblants (però inventades) segons el país de l'aerolínia.
    public static class Matriculas
    {
        const string Letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // Retorna n lletres a l'atzar.
        static string L(Random r, int n)
        {
            var c = new char[n];
            for (int i = 0; i < n; i++) c[i] = Letras[r.Next(26)];
            return new string(c);
        }

        // Retorna n xifres a l'atzar.
        static string N(Random r, int n)
        {
            var c = new char[n];
            for (int i = 0; i < n; i++) c[i] = (char)('0' + r.Next(10));
            return new string(c);
        }

        // Crea una matrícula amb el prefix del país (codi ISO de 2 lletres) i un sufix a l'atzar.
        public static string Crear(string pais, Random r)
        {
            switch (pais)
            {
                case "US": return "N" + r.Next(100, 999) + L(r, 2);
                case "CA": return "C-F" + L(r, 3);
                case "MX": return "XA-" + L(r, 3);
                case "ES": return "EC-" + L(r, 3);
                case "GB": return "G-" + L(r, 4);
                case "DE": return "D-A" + L(r, 3);
                case "FR": return "F-G" + L(r, 3);
                case "NL": return "PH-" + L(r, 3);
                case "IE": return "EI-" + L(r, 3);
                case "CH": return "HB-" + L(r, 3);
                case "AT": return "OE-" + L(r, 3);
                case "SE": return "SE-" + L(r, 3);
                case "FI": return "OH-" + L(r, 3);
                case "PT": return "CS-T" + L(r, 2);
                case "TR": return "TC-" + L(r, 3);
                case "GR": return "SX-" + L(r, 3);
                case "PL": return "SP-" + L(r, 3);
                case "HU": return "HA-" + L(r, 3);
                case "RU": return "RA-" + N(r, 5);
                case "AZ": return "4K-" + L(r, 2) + N(r, 1);
                case "AE": return "A6-" + L(r, 3);
                case "QA": return "A7-" + L(r, 3);
                case "SA": return "HZ-" + L(r, 3);
                case "IL": return "4X-" + L(r, 3);
                case "EG": return "SU-" + L(r, 3);
                case "MA": return "CN-" + L(r, 3);
                case "ET": return "ET-" + L(r, 3);
                case "ZA": return "ZS-" + L(r, 3);
                case "KE": return "5Y-" + L(r, 3);
                case "SG": return "9V-" + L(r, 3);
                case "TH": return "HS-" + L(r, 3);
                case "MY": return "9M-" + L(r, 3);
                case "ID": return "PK-" + L(r, 3);
                case "PH": return "RP-C" + N(r, 4);
                case "IN": return "VT-" + L(r, 3);
                case "CN": return "B-" + N(r, 4);
                case "HK": return "B-H" + L(r, 2);
                case "TW": return "B-" + N(r, 5);
                case "KR": return "HL" + N(r, 4);
                case "JP": return "JA" + N(r, 3) + L(r, 1);
                case "AU": return "VH-" + L(r, 3);
                case "NZ": return "ZK-" + L(r, 3);
                case "BR": return "PR-" + L(r, 3);
                case "AR": return "LV-" + L(r, 3);
                case "CL": return "CC-" + L(r, 3);
                case "CO": return "HK-" + N(r, 4);
                case "PA": return "HP-" + N(r, 4);
                default: return "XX-" + L(r, 3);
            }
        }
    }

    // Taula de destinacions possibles des d'un aeroport: tots els altres aeroports ordenats per distància, amb pesos
    // acumulats per poder triar-ne un a l'atzar dins d'un interval de distàncies amb una cerca binària.
    sealed class TablaDestinos
    {
        readonly double[] dist;        // distàncies ordenades (NM)
        readonly int[] idx;            // índex de l'aeroport corresponent al catàleg
        readonly double[] acum;        // pesos acumulats (acum[i] = suma dels pesos 0..i-1)

        // Construeix la taula des de l'aeroport "hub". El pes és l'atractiu de l'aeroport, doblat si és al mateix país
        // (vols domèstics) i dividit per 1 + d/1800 (els vols curts són més freqüents).
        public TablaDestinos(Aeropuerto hub, List<Aeropuerto> todos)
        {
            var lista = new List<(double d, int i)>(todos.Count);
            foreach (var a in todos)
                if (a != hub) lista.Add((Geo.Distancia(hub.Lat, hub.Lon, a.Lat, a.Lon), a.Indice));
            lista.Sort((p, q) => p.d.CompareTo(q.d));
            dist = new double[lista.Count];
            idx = new int[lista.Count];
            acum = new double[lista.Count + 1];
            for (int k = 0; k < lista.Count; k++)
            {
                var a = todos[lista[k].i];
                dist[k] = lista[k].d;
                idx[k] = lista[k].i;
                double w = a.Atractivo * (a.Pais == hub.Pais ? 2.0 : 1.0) / (1.0 + dist[k] / 1800.0);
                acum[k + 1] = acum[k] + w;
            }
        }

        // Primer índex amb dist >= d (cerca binària).
        int LimiteInferior(double d)
        {
            int lo = 0, hi = dist.Length;
            while (lo < hi) { int m = (lo + hi) / 2; if (dist[m] < d) lo = m + 1; else hi = m; }
            return lo;
        }

        // Tria un aeroport a l'atzar amb distància entre dmin i dmax; retorna -1 si no n'hi ha cap.
        public int Elegir(double dmin, double dmax, Random r)
        {
            int a = LimiteInferior(dmin), b = LimiteInferior(dmax);
            if (b <= a) return -1;
            double objetivo = acum[a] + r.NextDouble() * (acum[b] - acum[a]);
            int lo = a, hi = b - 1;                              // cerca binària sobre els pesos acumulats
            while (lo < hi) { int m = (lo + hi) / 2; if (acum[m + 1] < objetivo) lo = m + 1; else hi = m; }
            return idx[lo];
        }
    }

    // Crea vols simulats creïbles: tria aerolínia, hub, destí (ponderat per la importància de l'aeroport i
    // dins de l'abast de la flota), tipus d'avió segons la distància, matrícula i número de vol. Usa un Random
    // amb llavor, així la simulació és reproduïble.
    public class GeneradorTrafico
    {
        readonly Catalogo cat;
        readonly Random azar;
        readonly Dictionary<int, TablaDestinos> tablas = new Dictionary<int, TablaDestinos>();
        readonly HashSet<string> llamadas = new HashSet<string>();
        readonly double[] pesoAerolinea;
        readonly double pesoTotal;
        int siguienteId = 1;

        public Random Azar => azar;

        // Crea el generador amb el catàleg i la llavor del generador de nombres aleatoris.
        public GeneradorTrafico(Catalogo catalogo, int semilla)
        {
            cat = catalogo;
            azar = new Random(semilla);
            // Les aerolínies amb més hubs tenen més vols
            pesoAerolinea = cat.Aerolineas.Select(a => 2.0 + 1.5 * a.Hubs.Length).ToArray();
            pesoTotal = pesoAerolinea.Sum();
        }

        // Factor (0..1) de probabilitat d'enlairar-se a l'hora UTC donada des de l'aeroport: poca activitat de
        // 00:00 a 05:00 en hora solar local (UTC + lon/15).
        public static double FactorHorario(Aeropuerto origen, DateTime utc)
        {
            double h = (utc.TimeOfDay.TotalHours + origen.Lon / 15.0) % 24.0;
            if (h < 0) h += 24.0;
            if (h < 5.0) return 0.18;
            if (h < 6.5) return 0.6;
            if (h >= 22.5) return 0.55;
            return 1.0;
        }

        // Retorna la taula de destinacions des d'un aeroport (es calcula la primera vegada i es guarda).
        TablaDestinos TablaDe(Aeropuerto hub)
        {
            if (!tablas.TryGetValue(hub.Indice, out var t))
                tablas[hub.Indice] = t = new TablaDestinos(hub, cat.Aeropuertos);
            return t;
        }

        // Tria una aerolínia a l'atzar ponderada.
        Aerolinea ElegirAerolinea()
        {
            double x = azar.NextDouble() * pesoTotal;
            for (int i = 0; i < pesoAerolinea.Length; i++)
            {
                x -= pesoAerolinea[i];
                if (x <= 0) return cat.Aerolineas[i];
            }
            return cat.Aerolineas[^1];
        }

        // Tria el tipus d'avió de la flota segons la distància: els avions grans per a rutes llargues i els
        // petits (turbohèlix, regionals) per a les curtes. Només s'accepten tipus amb abast suficient.
        TipoAvion ElegirTipo(Aerolinea al, double dist)
        {
            var cand = new List<(TipoAvion t, double w)>();
            foreach (var t in al.Flota)
            {
                if (t.AlcanceNm * 0.92 < dist) continue;
                double w = 1.0;
                if (t.EsWB) w = dist < 1000 ? 0.05 : dist < 2500 ? 0.6 : 3.0;
                else if (t.EsTurbohelice) w = dist > 600 ? 0.05 : 1.5;
                else if (dist > 3500) w = 0.4;
                cand.Add((t, w));
            }
            if (cand.Count == 0) return al.Flota.OrderByDescending(t => t.AlcanceNm).First();
            double x = azar.NextDouble() * cand.Sum(c => c.w);
            foreach (var c in cand) { x -= c.w; if (x <= 0) return c.t; }
            return cand[^1].t;
        }

        // Crea un número de vol únic per a l'aerolínia (de 1 a 4 xifres) i retorna el distintiu complet (p. ex. IBE3145).
        string NuevaLlamada(Aerolinea al)
        {
            for (int intento = 0; intento < 20; intento++)
            {
                int n = azar.Next(10) < 3 ? azar.Next(1, 1000) : azar.Next(100, 9999);
                string cs = al.Icao + n;
                if (llamadas.Add(cs)) return cs;
            }
            return al.Icao + azar.Next(10000, 99999);
        }

        // Crea un vol amb sortida programada a "salida" (UTC). Retorna null si el generador el descarta (poca activitat
        // a aquesta hora local) o si el vol acabaria abans de "descartarAbans" (no es mostraria mai).
        public VueloSimulado Crear(DateTime salida, DateTime descartarAbans)
        {
            var al = ElegirAerolinea();
            var hub = al.Hubs[azar.Next(al.Hubs.Length)];
            bool saliendo = azar.Next(2) == 0;                      // vol des del hub o cap al hub
            int k = TablaDe(hub).Elegir(100.0, al.AlcanceMax * 0.92, azar);
            if (k < 0) return null;
            var otro = cat.Aeropuertos[k];
            var origen = saliendo ? hub : otro;
            var destino = saliendo ? otro : hub;

            if (azar.NextDouble() > FactorHorario(origen, salida)) return null;

            double dist = Geo.Distancia(origen.Lat, origen.Lon, destino.Lat, destino.Lon);
            // Durada aproximada per descartar de seguida els vols que ja han acabat fa temps
            double durAprox = 1500 + dist / 380.0 * 3600.0;
            if (salida.AddSeconds(durAprox * 0.8) < descartarAbans) return null;

            var tipo = ElegirTipo(al, dist);
            string matricula = Matriculas.Crear(al.Pais, azar);
            return Construir(al, tipo, matricula, origen, destino, salida);
        }

        // Crea el vol de tornada d'un vol (mateixa aerolínia, avió i matrícula, aeroports intercanviats) que surt a "salida".
        // Retorna null si el generador el descarta per l'hora.
        public VueloSimulado CrearRetorno(VueloSimulado v, DateTime salida)
        {
            if (azar.NextDouble() > FactorHorario(v.Destino, salida)) return null;
            var r = Construir(v.Aerolinea, v.Tipo, v.Matricula, v.Destino, v.Origen, salida);
            r.EsRetorno = true;
            return r;
        }

        // Crea el vol amb tots els paràmetres aleatoris restants (rodatge de 10-14 min, vent ±5%).
        VueloSimulado Construir(Aerolinea al, TipoAvion tipo, string matricula, Aeropuerto origen, Aeropuerto destino, DateTime salida)
        {
            double taxi = 600 + azar.NextDouble() * 240;
            double viento = 0.95 + azar.NextDouble() * 0.10;
            return new VueloSimulado(siguienteId++, NuevaLlamada(al), matricula, al, tipo, origen, destino, salida, taxi, viento, azar);
        }
    }
}
