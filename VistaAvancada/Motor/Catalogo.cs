using System.Globalization;

namespace VistaAvancada.Motor
{
    // Un aeroport del fitxer aeropuertos.csv. Guarda també la importància (Pes) i el pes per triar destins.
    public class Aeropuerto
    {
        public int Indice;
        public string Iata, Icao, Nombre, Ciudad, Pais, Continente;
        public double Lat, Lon;
        public int ElevacionFt;
        // Importància 0..5 = nombre d'aerolínies que hi tenen un hub (limitat a 5)
        public int Pes;
        // Pes relatiu per ser triat com a destí (més gran = més trànsit)
        public double Atractivo;

        // Hores de diferència amb UTC de l'hora local aproximada (fus solar: longitud / 15, arrodonit).
        public int DesfaseHoras => (int)Math.Round(Lon / 15.0);

        // Retorna l'hora local aproximada a partir d'una hora UTC.
        public DateTime HoraLocal(DateTime utc) => utc.AddHours(DesfaseHoras);

        public override string ToString() => Iata + " " + Nombre;
    }

    // Un tipus d'avió del fitxer tipos_avion.csv (velocitat de creuer, nivell màxim i abast).
    public class TipoAvion
    {
        // Categoria: NB (un passadís), WB (fuselatge ample), RJ (jet regional), TP (turbohèlix)
        public string Codigo, Nombre, Categoria;
        public int Indice;                           // posició a Catalogo.Tipos (la pàgina hi fa referència)
        public double VelCruceroKt;
        public int NivelMax;                         // en nivells de vol (FL), p. ex. 390
        public double AlcanceNm;

        public bool EsWB => Categoria == "WB";
        public bool EsTurbohelice => Categoria == "TP";
        public override string ToString() => Codigo;
    }

    // Una aerolínia del fitxer aerolineas.csv amb els seus hubs i la seva flota.
    public class Aerolinea
    {
        public int Indice;
        public string Icao, Iata, Nombre, Pais, Color, Telefonia, NombreBd;
        public Aeropuerto[] Hubs;
        public TipoAvion[] Flota;
        public double AlcanceMax;                    // abast del tipus més capaç de la flota

        public override string ToString() => Icao + " " + Nombre;
    }

    // Carrega i guarda el catàleg de dades estàtiques (aeroports, aerolínies i tipus d'avió) dels CSV.
    public class Catalogo
    {
        public List<Aeropuerto> Aeropuertos = new List<Aeropuerto>();
        public List<Aerolinea> Aerolineas = new List<Aerolinea>();
        public List<TipoAvion> Tipos = new List<TipoAvion>();
        public Dictionary<string, Aeropuerto> PorIata = new Dictionary<string, Aeropuerto>();
        public Dictionary<string, Aerolinea> PorIcao = new Dictionary<string, Aerolinea>();
        public Dictionary<string, TipoAvion> TipoPorCodigo = new Dictionary<string, TipoAvion>();
        // Problemes detectats en carregar (hubs o tipus que no existeixen...); buida si tot és correcte
        public List<string> Avisos = new List<string>();

        // Carrega els tres CSV de la carpeta indicada (per defecte, Datos al costat de l'executable).
        // Llença una excepció si falta algun fitxer. Retorna el catàleg ja carregat.
        public static Catalogo Cargar(string carpeta = null)
        {
            carpeta ??= Path.Combine(AppContext.BaseDirectory, "Datos");
            var c = new Catalogo();
            c.CargarTipos(Path.Combine(carpeta, "tipos_avion.csv"));
            c.CargarAeropuertos(Path.Combine(carpeta, "aeropuertos.csv"));
            c.CargarAerolineas(Path.Combine(carpeta, "aerolineas.csv"));
            c.CalcularImportancia();
            return c;
        }

        // Llegeix un CSV separat per ';' saltant la capçalera i les línies buides.
        static IEnumerable<string[]> LeerCsv(string ruta)
        {
            bool primera = true;
            foreach (var linea in File.ReadLines(ruta, System.Text.Encoding.UTF8))
            {
                if (primera) { primera = false; continue; }
                if (string.IsNullOrWhiteSpace(linea)) continue;
                yield return linea.Split(';');
            }
        }

        // Converteix un text a double sempre amb cultura invariant (el punt és el separador decimal).
        static double Num(string s) => double.Parse(s, NumberStyles.Float, CultureInfo.InvariantCulture);

        // Llegeix tipos_avion.csv.
        void CargarTipos(string ruta)
        {
            foreach (var f in LeerCsv(ruta))
            {
                var t = new TipoAvion
                {
                    Codigo = f[0], Nombre = f[1], VelCruceroKt = Num(f[2]),
                    NivelMax = (int)Num(f[3]), AlcanceNm = Num(f[4]), Categoria = f[5].Trim(), Indice = Tipos.Count
                };
                Tipos.Add(t);
                TipoPorCodigo[t.Codigo] = t;
            }
        }

        // Llegeix aeropuertos.csv (iata;icao;nombre;ciudad;pais;continente;lat;lon;elevacion_ft).
        void CargarAeropuertos(string ruta)
        {
            foreach (var f in LeerCsv(ruta))
            {
                if (f.Length < 9 || string.IsNullOrWhiteSpace(f[0]) || PorIata.ContainsKey(f[0])) continue;
                var a = new Aeropuerto
                {
                    Indice = Aeropuertos.Count, Iata = f[0], Icao = f[1], Nombre = f[2], Ciudad = f[3],
                    Pais = f[4], Continente = f[5], Lat = Num(f[6]), Lon = Num(f[7]),
                    ElevacionFt = (int)Math.Round(Num(f[8]))
                };
                Aeropuertos.Add(a);
                PorIata[a.Iata] = a;
            }
        }

        // Llegeix aerolineas.csv (icao;iata;nombre;pais;color;hubs;flota;telefonia;nombre_bd).
        void CargarAerolineas(string ruta)
        {
            foreach (var f in LeerCsv(ruta))
            {
                var hubs = new List<Aeropuerto>();
                foreach (var h in f[5].Split('|', StringSplitOptions.RemoveEmptyEntries))
                {
                    if (PorIata.TryGetValue(h, out var ap)) hubs.Add(ap);
                    else Avisos.Add($"{f[0]}: el hub {h} no existeix a aeropuertos.csv");
                }
                var flota = new List<TipoAvion>();
                foreach (var t in f[6].Split('|', StringSplitOptions.RemoveEmptyEntries))
                {
                    if (TipoPorCodigo.TryGetValue(t, out var tp)) flota.Add(tp);
                    else Avisos.Add($"{f[0]}: el tipus {t} no existeix a tipos_avion.csv");
                }
                if (hubs.Count == 0 || flota.Count == 0) continue;
                var al = new Aerolinea
                {
                    Indice = Aerolineas.Count, Icao = f[0], Iata = f[1], Nombre = f[2], Pais = f[3], Color = f[4],
                    Hubs = hubs.ToArray(), Flota = flota.ToArray(), Telefonia = f[7], NombreBd = f[8].Trim(),
                    AlcanceMax = flota.Max(t => t.AlcanceNm)
                };
                Aerolineas.Add(al);
                PorIcao[al.Icao] = al;
            }
        }

        // Calcula la importància (Pes 0..5) = nombre d'aerolínies amb hub a l'aeroport,
        // i l'atractiu per triar-lo com a destí (creix més que proporcionalment amb el nombre de hubs).
        void CalcularImportancia()
        {
            foreach (var al in Aerolineas)
                foreach (var h in al.Hubs) h.Pes++;
            foreach (var a in Aeropuertos)
            {
                int hubs = a.Pes;
                a.Pes = Math.Min(5, hubs);
                a.Atractivo = Math.Pow(1.0 + 2.5 * hubs, 1.4);
            }
        }
    }
}
