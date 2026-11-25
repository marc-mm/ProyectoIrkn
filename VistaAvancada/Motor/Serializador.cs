using System.Buffers;
using System.Globalization;
using System.Text;
using System.Text.Json;

namespace VistaAvancada.Motor
{
    // Construeix els missatges JSON que s'envien a la pàgina (protocol del README) amb Utf8JsonWriter.
    // Els nombres sempre s'escriuen amb cultura invariant (punt decimal) i arrodonits per fer el JSON compacte.
    public class Serializador
    {
        readonly ArrayBufferWriter<byte> buffer = new ArrayBufferWriter<byte>(1 << 16);
        readonly Utf8JsonWriter w;
        readonly Catalogo cat;

        // Crea el serialitzador (reutilitza un mateix buffer per a tots els missatges).
        public Serializador(Catalogo catalogo)
        {
            cat = catalogo;
            w = new Utf8JsonWriter(buffer);
        }

        // Formata una hora UTC en ISO 8601 ("2026-11-23T12:34:56Z").
        public static string Iso(DateTime utc) => utc.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture);

        // Tanca el missatge en curs i el retorna com a text; deixa el buffer a punt per al següent.
        string Terminar()
        {
            w.Flush();
            string s = Encoding.UTF8.GetString(buffer.WrittenSpan);
            buffer.Clear();
            w.Reset(buffer);
            return s;
        }

        // Escriu un nombre decimal arrodonit a "dec" decimals.
        void Num(double v, int dec) => w.WriteNumberValue(Math.Round(v, dec));

        // Escriu una propietat amb un nombre arrodonit.
        void Prop(string nombre, double v, int dec) => w.WriteNumber(nombre, Math.Round(v, dec));

        // ------------------------------------------------------------------ Missatges C# -> JS
        // Missatge "inicio": mode, hora, escala, tots els aeroports, les aerolínies i els noms de les fases.
        public string Inicio(string modo, DateTime hora, double escala)
        {
            w.WriteStartObject();
            w.WriteString("tipo", "inicio");
            w.WriteString("modo", modo);
            w.WriteString("hora", Iso(hora));
            Prop("escala", escala, 3);
            w.WriteStartArray("aeropuertos");
            foreach (var a in cat.Aeropuertos)
            {
                w.WriteStartArray();
                w.WriteStringValue(a.Iata); w.WriteStringValue(a.Nombre); w.WriteStringValue(a.Ciudad); w.WriteStringValue(a.Pais);
                Num(a.Lat, 4); Num(a.Lon, 4); w.WriteNumberValue(a.Pes);
                w.WriteEndArray();
            }
            w.WriteEndArray();
            w.WriteStartArray("aerolineas");
            foreach (var a in cat.Aerolineas)
            {
                w.WriteStartArray();
                w.WriteStringValue(a.Icao); w.WriteStringValue(a.Nombre); w.WriteStringValue(a.Color);
                w.WriteEndArray();
            }
            w.WriteEndArray();
            w.WriteStartArray("fases");
            foreach (var f in Fases.Nombres) w.WriteStringValue(f);
            w.WriteEndArray();
            // Tipus d'avió [codi, nom]: el desè camp de cada vol d'"estado" és l'índex en aquesta llista
            w.WriteStartArray("tipos");
            foreach (var t in cat.Tipos)
            {
                w.WriteStartArray(); w.WriteStringValue(t.Codigo); w.WriteStringValue(t.Nombre); w.WriteEndArray();
            }
            w.WriteEndArray();
            w.WriteEndObject();
            return Terminar();
        }

        // Missatge "estado" (~20 Hz): posició de tots els avions i conflictes actuals.
        // En mode projecte hi afegeix el camp opcional "previstos" (parelles que tindran conflicte).
        public string Estado(FuenteTrafico f)
        {
            w.WriteStartObject();
            w.WriteString("tipo", "estado");
            w.WriteString("hora", Iso(f.Reloj.HoraUtc));
            Prop("escala", f.Reloj.Escala, 3);
            w.WriteBoolean("pausado", f.Reloj.Pausado);
            w.WriteString("modo", f.Modo);
            w.WriteNumber("pilotado", f.IdPilotado);
            w.WriteStartArray("vuelos");
            var vs = f.Vuelos;
            for (int i = 0; i < vs.Count; i++)
            {
                var v = vs[i];
                w.WriteStartArray();
                w.WriteNumberValue(v.Id);
                Num(v.Lat, 4); Num(v.Lon, 4);
                w.WriteNumberValue((int)Math.Round(v.AltitudFt));
                Num(v.Rumbo, 1);
                w.WriteNumberValue((int)Math.Round(v.VelocidadKt));
                w.WriteNumberValue(v.FaseIdx);
                w.WriteNumberValue(v.AerolineaIdx);
                w.WriteStringValue(v.Callsign);
                w.WriteNumberValue(v is VueloSimulado sv ? sv.Tipo.Indice : -1);
                w.WriteEndArray();
            }
            w.WriteEndArray();
            w.WriteStartArray("conflictos");
            foreach (var c in f.Detector.Activos)
            {
                w.WriteStartArray();
                w.WriteNumberValue(c.IdA); w.WriteNumberValue(c.IdB);
                Num(c.DistNM, 1); w.WriteNumberValue((int)Math.Round(c.DifAltFt));
                w.WriteEndArray();
            }
            w.WriteEndArray();
            if (f is PlanesProyecto pp)
            {
                w.WriteStartArray("previstos");
                foreach (var (a, b) in pp.Previstos)
                {
                    w.WriteStartArray(); w.WriteNumberValue(a); w.WriteNumberValue(b); w.WriteEndArray();
                }
                w.WriteEndArray();
            }
            w.WriteEndObject();
            return Terminar();
        }

        // Escriu un objecte d'aeroport {iata, nombre, ciudad, lat, lon} (o null).
        void EscribirAeropuerto(string clave, Aeropuerto a)
        {
            if (a == null) { w.WriteNull(clave); return; }
            w.WriteStartObject(clave);
            w.WriteString("iata", a.Iata); w.WriteString("nombre", a.Nombre); w.WriteString("ciudad", a.Ciudad);
            Prop("lat", a.Lat, 4); Prop("lon", a.Lon, 4);
            w.WriteEndObject();
        }

        // Escriu una llista de punts [[lat, lon], ...].
        void EscribirPuntos(string clave, List<double[]> pts)
        {
            w.WriteStartArray(clave);
            foreach (var p in pts)
            {
                w.WriteStartArray(); Num(p[0], 4); Num(p[1], 4); w.WriteEndArray();
            }
            w.WriteEndArray();
        }

        // Escriu el contacte de la companyia (o null).
        void EscribirContacto(Contacto c)
        {
            if (c == null) { w.WriteNull("contacto"); return; }
            w.WriteStartObject("contacto");
            w.WriteString("nombre", c.Nombre); w.WriteString("telefono", c.Telefono); w.WriteString("email", c.Email);
            w.WriteEndObject();
        }

        // Missatge "infoVuelo": detall d'un avió. Segons l'origen (simulat, en directe o del projecte) uns camps són null.
        // Camps opcionals afegits: "paisOrigen" i "icao24" (mode directe).
        public string InfoVuelo(FuenteTrafico f, IVueloVista v, Contactos contactos)
        {
            string nombreBd = f.NombreBdDe(v);
            var contacto = contactos.Obtener(nombreBd);
            w.WriteStartObject();
            w.WriteString("tipo", "infoVuelo");
            w.WriteNumber("id", v.Id);
            w.WriteString("callsign", v.Callsign);
            w.WriteString("aerolinea", f.NombreAerolineaDe(v));
            var vs = v as VueloSimulado;
            var vd = v as VueloDirecto;
            var vp = v as VueloProyecto;
            string color = vs != null ? vs.Aerolinea.Color
                : vd != null && vd.AerolineaIdx >= 0 ? cat.Aerolineas[vd.AerolineaIdx].Color
                : vp != null ? "#4FC3F7" : "#9AA0A6";
            w.WriteString("color", color);

            if (vs != null)
            {
                w.WriteString("tipoAvion", vs.Tipo.Codigo);
                w.WriteString("nombreAvion", vs.Tipo.Nombre);
                w.WriteString("matricula", vs.Matricula);
                EscribirAeropuerto("origen", vs.Origen);
                EscribirAeropuerto("destino", vs.Destino);
                w.WriteString("salida", Iso(vs.Salida));
                w.WriteString("llegada", Iso(vs.Llegada));
            }
            else
            {
                w.WriteNull("tipoAvion"); w.WriteNull("nombreAvion");
                if (vd != null) w.WriteString("matricula", vd.Icao24.ToUpperInvariant()); else w.WriteNull("matricula");
                if (vp != null)
                {
                    EscribirPuntoPlan("origen", "INI", "Punt inicial del pla", vp.Plan.GetInitialPosition());
                    EscribirPuntoPlan("destino", "FIN", "Punt final del pla", vp.Plan.GetFinalPosition());
                    w.WriteNull("salida");
                    double vel = Math.Max(1e-6, vp.VelocidadKt);
                    double rest = vp.Plan.GetCurrentPosition().Distancia(vp.Plan.GetFinalPosition());
                    w.WriteString("llegada", Iso(f.Reloj.HoraUtc.AddHours(rest / vel)));
                }
                else
                {
                    w.WriteNull("origen"); w.WriteNull("destino"); w.WriteNull("salida"); w.WriteNull("llegada");
                }
            }

            w.WriteString("fase", Fases.Nombre(v.FaseIdx));
            w.WriteNumber("altitudFt", (int)Math.Round(v.AltitudFt));
            w.WriteNumber("velocidadKt", (int)Math.Round(v.VelocidadKt));
            Prop("rumbo", v.Rumbo, 1);
            w.WriteNumber("velVerticalFpm", (int)Math.Round(v.VelVerticalFpm / 10.0) * 10);

            if (vs != null)
            {
                Prop("progreso", vs.Progreso, 4);
                Prop("distanciaTotalNM", vs.DistanciaTotalNM, 1);
                Prop("distanciaRestanteNM", vs.DistRestanteNM, 1);
                w.WriteNumber("nivelCrucero", vs.NivelCrucero);
                EscribirPuntos("ruta", vs.PuntosRuta(64));
                EscribirPuntos("recorrido", vs.PuntosRecorrido(64));
            }
            else if (vp != null)
            {
                var ini = vp.Plan.GetInitialPosition(); var cur = vp.Plan.GetCurrentPosition(); var fin = vp.Plan.GetFinalPosition();
                double tot = ini.Distancia(fin), rest = cur.Distancia(fin);
                Prop("progreso", tot <= 0 ? 1 : 1 - rest / tot, 4);
                Prop("distanciaTotalNM", tot, 1);
                Prop("distanciaRestanteNM", rest, 1);
                w.WriteNumber("nivelCrucero", 300);
                var gi = PlanesProyecto.AGeografico(ini.GetX(), ini.GetY());
                var gc = PlanesProyecto.AGeografico(cur.GetX(), cur.GetY());
                var gf = PlanesProyecto.AGeografico(fin.GetX(), fin.GetY());
                EscribirPuntos("ruta", new List<double[]> { new[] { gi.lat, gi.lon }, new[] { gf.lat, gf.lon } });
                EscribirPuntos("recorrido", new List<double[]> { new[] { gi.lat, gi.lon }, new[] { gc.lat, gc.lon } });
            }
            else
            {
                w.WriteNull("progreso"); w.WriteNull("distanciaTotalNM"); w.WriteNull("distanciaRestanteNM");
                w.WriteNull("nivelCrucero");
                w.WriteStartArray("ruta"); w.WriteEndArray();
                w.WriteStartArray("recorrido"); w.WriteEndArray();
            }

            EscribirContacto(contacto);
            w.WriteBoolean("enConflicto", v.EnConflicto);
            w.WriteStartArray("instrucciones");
            if (vs != null) foreach (var t in vs.TextosInstrucciones) w.WriteStringValue(t);
            else foreach (var ins in f.Instrucciones) if (ins.IdVuelo == v.Id) w.WriteStringValue(ins.Texto);
            w.WriteEndArray();
            if (vd != null) { w.WriteString("paisOrigen", vd.PaisOrigen); w.WriteString("icao24", vd.Icao24); }
            w.WriteEndObject();
            return Terminar();
        }

        // Escriu l'extrem d'un pla de vol del projecte com a "aeroport" fictici, amb les coordenades geogràfiques.
        void EscribirPuntoPlan(string clave, string iata, string nombre, FlightLib.Position p)
        {
            var g = PlanesProyecto.AGeografico(p.GetX(), p.GetY());
            w.WriteStartObject(clave);
            w.WriteString("iata", iata);
            w.WriteString("nombre", string.Create(CultureInfo.InvariantCulture, $"{nombre} ({p.GetX():0}, {p.GetY():0})"));
            w.WriteString("ciudad", "");
            Prop("lat", g.lat, 4); Prop("lon", g.lon, 4);
            w.WriteEndObject();
        }

        // Escriu una taula (sortides o arribades) com a llista de [hora, vol, iata, ciutat, estat].
        void EscribirTabla(string clave, List<FilaTabla> filas)
        {
            w.WriteStartArray(clave);
            foreach (var f in filas)
            {
                w.WriteStartArray();
                w.WriteStringValue(f.HoraLocal); w.WriteStringValue(f.Callsign); w.WriteStringValue(f.Iata);
                w.WriteStringValue(f.Ciudad); w.WriteStringValue(f.Estado);
                w.WriteEndArray();
            }
            w.WriteEndArray();
        }

        // Missatge "infoAeropuerto": dades de l'aeroport, hora local i taules de sortides/arribades (buides si no és la simulació).
        public string InfoAeropuerto(Aeropuerto a, DateTime ahora, List<FilaTabla> salidas, List<FilaTabla> llegadas)
        {
            w.WriteStartObject();
            w.WriteString("tipo", "infoAeropuerto");
            w.WriteString("iata", a.Iata); w.WriteString("icao", a.Icao); w.WriteString("nombre", a.Nombre);
            w.WriteString("ciudad", a.Ciudad); w.WriteString("pais", a.Pais);
            Prop("lat", a.Lat, 4); Prop("lon", a.Lon, 4);
            w.WriteNumber("elevacionFt", a.ElevacionFt);
            w.WriteString("horaLocal", a.HoraLocal(ahora).ToString("HH:mm", CultureInfo.InvariantCulture));
            EscribirTabla("salidas", salidas ?? new List<FilaTabla>());
            EscribirTabla("llegadas", llegadas ?? new List<FilaTabla>());
            w.WriteEndObject();
            return Terminar();
        }

        // Missatge "estadisticas": recomptes per fase, aerolínia, aeroport i continent, i comptadors de conflictes.
        public string Estadisticas(FuenteTrafico f)
        {
            var vs = f.Vuelos;
            int enTierra = 0;
            var porFase = new int[Fases.Nombres.Length];
            var porAerolinea = new Dictionary<string, int>();
            var porAeropuerto = new Dictionary<string, int>();
            foreach (var v in vs)
            {
                if (v.EnTierra) enTierra++;
                if (v.FaseIdx >= 0 && v.FaseIdx < porFase.Length) porFase[v.FaseIdx]++;
                if (v.AerolineaIdx != -1)
                {
                    string n = f.NombreAerolineaDe(v);
                    if (n != null) porAerolinea[n] = porAerolinea.GetValueOrDefault(n) + 1;
                }
                if (v is VueloSimulado s)
                {
                    porAeropuerto[s.Origen.Iata] = porAeropuerto.GetValueOrDefault(s.Origen.Iata) + 1;
                    porAeropuerto[s.Destino.Iata] = porAeropuerto.GetValueOrDefault(s.Destino.Iata) + 1;
                }
            }
            w.WriteStartObject();
            w.WriteString("tipo", "estadisticas");
            w.WriteNumber("enVuelo", vs.Count - enTierra);
            w.WriteNumber("enTierra", enTierra);
            w.WriteStartArray("porFase");
            foreach (var n in porFase) w.WriteNumberValue(n);
            w.WriteEndArray();
            EscribirTop("topAerolineas", porAerolinea, 8);
            EscribirTop("topAeropuertos", porAeropuerto, 8);
            EscribirTop("porContinente", ContarContinentes(vs), 8);
            w.WriteNumber("conflictosActivos", f.Detector.Activos.Count);
            w.WriteNumber("conflictosResueltos", f.Detector.Resueltos);
            w.WriteEndObject();
            return Terminar();
        }

        // Escriu els n primers elements d'un diccionari de recomptes ordenats de més a menys com a [[nom, recompte], ...].
        void EscribirTop(string clave, Dictionary<string, int> datos, int n)
        {
            w.WriteStartArray(clave);
            foreach (var kv in datos.OrderByDescending(k => k.Value).ThenBy(k => k.Key).Take(n))
            {
                w.WriteStartArray(); w.WriteStringValue(kv.Key); w.WriteNumberValue(kv.Value); w.WriteEndArray();
            }
            w.WriteEndArray();
        }

        // Vectors unitat dels aeroports, per trobar l'aeroport més proper a un avió amb un producte escalar.
        double[] ax, ay, az;

        // Compta els avions per continent de l'aeroport més proper (mostra de com a màxim 1500 avions, escalada).
        Dictionary<string, int> ContarContinentes(IReadOnlyList<IVueloVista> vs)
        {
            var r = new Dictionary<string, int>();
            if (vs.Count == 0) return r;
            if (ax == null)
            {
                int n = cat.Aeropuertos.Count;
                ax = new double[n]; ay = new double[n]; az = new double[n];
                for (int i = 0; i < n; i++)
                {
                    double la = cat.Aeropuertos[i].Lat * Geo.GradosARad, lo = cat.Aeropuertos[i].Lon * Geo.GradosARad;
                    ax[i] = Math.Cos(la) * Math.Cos(lo); ay[i] = Math.Cos(la) * Math.Sin(lo); az[i] = Math.Sin(la);
                }
            }
            int paso = Math.Max(1, vs.Count / 1500);
            for (int k = 0; k < vs.Count; k += paso)
            {
                double la = vs[k].Lat * Geo.GradosARad, lo = vs[k].Lon * Geo.GradosARad;
                double x = Math.Cos(la) * Math.Cos(lo), y = Math.Cos(la) * Math.Sin(lo), z = Math.Sin(la);
                int mejor = 0; double mejorDot = -2;
                for (int i = 0; i < ax.Length; i++)
                {
                    double d = x * ax[i] + y * ay[i] + z * az[i];
                    if (d > mejorDot) { mejorDot = d; mejor = i; }
                }
                string c = cat.Aeropuertos[mejor].Continente;
                r[c] = r.GetValueOrDefault(c) + paso;
            }
            return r;
        }

        // Missatge "aviso" (nivell: info, ok o error).
        public string Aviso(string nivel, string texto)
        {
            w.WriteStartObject();
            w.WriteString("tipo", "aviso"); w.WriteString("nivel", nivel); w.WriteString("texto", texto);
            w.WriteEndObject();
            return Terminar();
        }

        // Missatge "volarA": moure la càmera cap a un punt.
        public string VolarA(double lat, double lon, double distancia)
        {
            w.WriteStartObject();
            w.WriteString("tipo", "volarA");
            Prop("lat", lat, 4); Prop("lon", lon, 4); Prop("distancia", distancia, 3);
            w.WriteEndObject();
            return Terminar();
        }

        // Missatge "planesProyecto": centre, caixa de l'espai aeri i distància de seguretat.
        public string MensajePlanesProyecto(double distanciaSeguridadNM)
        {
            w.WriteStartObject();
            w.WriteString("tipo", "planesProyecto");
            w.WriteStartArray("centro"); Num(PlanesProyecto.CentroLat, 4); Num(PlanesProyecto.CentroLon, 4); w.WriteEndArray();
            w.WriteStartArray("caja");
            foreach (var p in PlanesProyecto.Caja())
            {
                w.WriteStartArray(); Num(p[0], 4); Num(p[1], 4); w.WriteEndArray();
            }
            w.WriteEndArray();
            Prop("distanciaSeguridadNM", distanciaSeguridadNM, 2);
            w.WriteEndObject();
            return Terminar();
        }
    }
}
