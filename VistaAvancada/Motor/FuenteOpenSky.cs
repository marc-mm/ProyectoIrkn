using System.Net;
using System.Net.Http;
using System.Text.Json;

namespace VistaAvancada.Motor
{
    // Un avió real rebut d'OpenSky. Entre dues descàrregues la posició s'extrapola amb la velocitat i el rumb.
    public class VueloDirecto : IVueloVista, IVueloPilotable
    {
        public int Id { get; set; }
        public string Icao24 { get; set; }
        public string Callsign { get; set; }
        public string PaisOrigen { get; set; }
        public int AerolineaIdx { get; set; } = -1;
        public double Lat { get; private set; }
        public double Lon { get; private set; }
        public double AltitudFt { get; private set; }
        public double Rumbo { get; private set; }
        public double VelocidadKt { get; private set; }
        public double VelVerticalFpm { get; private set; }
        public int FaseIdx { get; private set; } = Fases.Creuer;
        public bool EnTierra => false;
        public bool EnConflicto { get; set; }

        // Última posició real coneguda (fix), rumb, velocitats i hora simulada en què es va rebre
        double lat0, lon0, alt0, rumbo0, vel0, vv0;
        DateTime t0;

        // Cert mentre l'usuari el pilota: la posició la marca la pàgina i les dades reals només es guarden
        public bool Manual { get; private set; }

        // Desa un nou fix rebut d'OpenSky (unitats ja convertides: ft, kt, fpm) i hora simulada de recepció.
        public void Actualizar(double lat, double lon, double altFt, double velKt, double rumbo, double vvFpm, DateTime hora)
        {
            lat0 = lat; lon0 = lon; alt0 = altFt; t0 = hora;
            rumbo0 = rumbo; vel0 = velKt; vv0 = vvFpm;
            if (Manual) return;
            VelocidadKt = velKt; Rumbo = rumbo; VelVerticalFpm = vvFpm;
            Lat = lat; Lon = lon; AltitudFt = altFt;
            FaseIdx = FaseSegunVertical(altFt, vvFpm);
        }

        // Fixa la posició que envia la pàgina mentre l'usuari pilota l'avió.
        public void PonerManual(double lat, double lon, double altFt, double rumbo, double velKt, double vvFpm, DateTime utc)
        {
            Manual = true;
            Lat = lat; Lon = Geo.NormalizarLon(lon); AltitudFt = Math.Max(0, altFt);
            Rumbo = Geo.Normalizar360(rumbo); VelocidadKt = Math.Max(0, velKt); VelVerticalFpm = vvFpm;
            FaseIdx = FaseSegunVertical(AltitudFt, vvFpm);
        }

        // Deixa de pilotar-lo: torna a la seva posició real (extrapolada des de l'últim fix).
        public void Liberar(DateTime utc)
        {
            Manual = false;
            VelocidadKt = vel0; Rumbo = rumbo0; VelVerticalFpm = vv0;
            Extrapolar(utc);
        }

        // Determina la fase aproximada a partir de l'altitud i la velocitat vertical.
        static int FaseSegunVertical(double altFt, double vvFpm)
        {
            if (vvFpm > 500) return Fases.Pujada;
            if (vvFpm < -500) return altFt < 3500 ? Fases.Aproximacio : Fases.Descens;
            return Fases.Creuer;
        }

        // Extrapola la posició a l'hora simulada "ahora" (cinemàtica simple: recta ortodròmica + variació d'altitud).
        public void Extrapolar(DateTime ahora)
        {
            if (Manual) return;
            double dt = (ahora - t0).TotalSeconds;
            if (dt <= 0) return;
            var p = Geo.Destino(lat0, lon0, rumbo0, vel0 * dt / 3600.0);
            Lat = p.lat; Lon = p.lon;
            AltitudFt = Math.Max(0, alt0 + vv0 * dt / 60.0);
        }
    }

    // Font de dades en directe: trànsit aeri real d'OpenSky Network (API anònima, com a màxim una petició per minut).
    // Si falla qualsevol cosa (sense Internet, límit diari, temps d'espera...) avisa i demana tornar al mode simulat.
    public class FuenteOpenSky : FuenteTrafico
    {
        const string Url = "https://opensky-network.org/api/states/all";
        const double SegundosEntrePeticiones = 60.0;
        const int MaxVuelos = 9000;

        static readonly HttpClient http = CrearCliente();

        readonly Catalogo cat;
        readonly Dictionary<string, VueloDirecto> porIcao = new Dictionary<string, VueloDirecto>();
        readonly Dictionary<int, VueloDirecto> porId = new Dictionary<int, VueloDirecto>();
        readonly List<IVueloVista> vistas = new List<IVueloVista>();
        readonly CancellationTokenSource cts = new CancellationTokenSource();
        int siguienteId = 1_000_000;
        double segundosDesdePeticion;
        bool primeraPeticion = true;
        volatile bool solicitando;
        volatile Resultado pendiente;
        double acumDeteccion;

        // Es dispara (des del fil que crida Avanzar) quan la descàrrega falla; el paràmetre és el missatge en català.
        public event Action<string> Fallo;

        public override string Modo => "directo";
        public override IReadOnlyList<IVueloVista> Vuelos => vistas;

        // Resultat d'una descàrrega: llista d'avions o un error.
        sealed class Resultado
        {
            public List<Registro> Estados;
            public string Error;
        }

        // Estat d'un avió ja convertit a les unitats de la pàgina.
        public sealed class Registro
        {
            public string Icao24, Callsign, Pais;
            public double Lat, Lon, AltFt, VelKt, Rumbo, VvFpm;
        }

        // Crea el client HTTP únic: User-Agent genèric (sense dades personals), compressió i temps d'espera de 20 s.
        static HttpClient CrearCliente()
        {
            var h = new HttpClientHandler { AutomaticDecompression = DecompressionMethods.All };
            var c = new HttpClient(h) { Timeout = TimeSpan.FromSeconds(20) };
            c.DefaultRequestHeaders.UserAgent.ParseAdd("ProyectoIrkn-VistaAvancada/1.0");
            return c;
        }

        // Crea la font amb el catàleg (per reconèixer aerolínies pel distintiu) i el rellotge compartit.
        public FuenteOpenSky(Catalogo catalogo, Reloj reloj)
        {
            cat = catalogo;
            Reloj = reloj;
        }

        public override IVueloVista BuscarVuelo(int id) => porId.TryGetValue(id, out var v) ? v : null;

        public override string NombreBdDe(IVueloVista v)
        {
            var d = v as VueloDirecto;
            return d != null && d.AerolineaIdx >= 0 ? cat.Aerolineas[d.AerolineaIdx].NombreBd : null;
        }

        public override string NombreAerolineaDe(IVueloVista v)
        {
            var d = v as VueloDirecto;
            if (d == null) return null;
            return d.AerolineaIdx >= 0 ? cat.Aerolineas[d.AerolineaIdx].Nombre : d.PaisOrigen;
        }

        // En mode directe no es poden donar instruccions a avions reals: només s'informa.
        public override Instruccion ResolverConflicto(int idA, int idB)
        {
            AvisarUsuario("info", "En mode directe només es detecten conflictes: no es poden donar instruccions a avions reals.");
            return null;
        }

        public override List<Instruccion> ResolverTodos()
        {
            AvisarUsuario("info", "En mode directe només es detecten conflictes: no es poden donar instruccions a avions reals.");
            return new List<Instruccion>();
        }

        // Avança la font: aplica la descàrrega pendent (si n'hi ha), en llança una de nova si toca (cada 60 s reals),
        // extrapola les posicions i detecta conflictes. No bloqueja: la descàrrega va en un altre fil.
        public override void Avanzar(double segundosReales)
        {
            Reloj.Avanzar(segundosReales);
            segundosDesdePeticion += segundosReales;

            var res = Interlocked.Exchange(ref pendiente, null);
            if (res != null)
            {
                if (res.Error != null) { Fallo?.Invoke(res.Error); return; }
                Aplicar(res.Estados);
                AvisarUsuario("ok", $"Dades en directe d'OpenSky: {vistas.Count} avions.");
            }

            if (!solicitando && (primeraPeticion || segundosDesdePeticion >= SegundosEntrePeticiones))
            {
                primeraPeticion = false;
                segundosDesdePeticion = 0;
                Solicitar();
            }

            DateTime t = Reloj.HoraUtc;
            foreach (var v in porId.Values) v.Extrapolar(t);

            acumDeteccion += segundosReales;
            if (acumDeteccion >= 2.0 && vistas.Count > 0)
            {
                acumDeteccion = 0;
                Detector.Actualizar(vistas, t, v => NombreBdDe(v));
            }
        }

        // Llança la descàrrega en segon pla. El resultat es deixa a "pendiente" i s'aplica a la propera crida d'Avanzar,
        // així tot el tractament de dades passa al fil de la interfície.
        void Solicitar()
        {
            solicitando = true;
            var token = cts.Token;
            Task.Run(async () =>
            {
                Resultado res;
                try { res = await DescargarAsync(token).ConfigureAwait(false); }
                catch (OperationCanceledException) when (token.IsCancellationRequested) { solicitando = false; return; }
                catch (Exception ex) { res = new Resultado { Error = "Error en llegir les dades d'OpenSky: " + ex.Message }; }
                pendiente = res;
                solicitando = false;
            });
        }

        // Descarrega i interpreta les dades d'OpenSky. Retorna el resultat o un error en català (cap excepció surt d'aquí
        // per als errors habituals de xarxa).
        async Task<Resultado> DescargarAsync(CancellationToken token)
        {
            try
            {
                using var resp = await http.GetAsync(Url, HttpCompletionOption.ResponseHeadersRead, token).ConfigureAwait(false);
                if (resp.StatusCode == (HttpStatusCode)429)
                    return new Resultado { Error = "OpenSky ha rebutjat la petició (s'ha superat el límit diari de crèdits anònims)." };
                if (!resp.IsSuccessStatusCode)
                    return new Resultado { Error = $"OpenSky ha respost amb l'error HTTP {(int)resp.StatusCode}." };
                using var stream = await resp.Content.ReadAsStreamAsync(token).ConfigureAwait(false);
                var estados = await Task.Run(() => Interpretar(stream), token).ConfigureAwait(false);
                if (estados.Count == 0)
                    return new Resultado { Error = "OpenSky no ha retornat cap avió." };
                return new Resultado { Estados = estados };
            }
            catch (TaskCanceledException) when (!token.IsCancellationRequested)
            {
                return new Resultado { Error = "OpenSky no respon (s'ha esgotat el temps d'espera de 20 s)." };
            }
            catch (HttpRequestException)
            {
                return new Resultado { Error = "No hi ha connexió amb OpenSky (comprova la connexió a Internet)." };
            }
            catch (JsonException)
            {
                return new Resultado { Error = "La resposta d'OpenSky no té el format esperat." };
            }
        }

        // Interpreta el JSON d'OpenSky: { "time":..., "states":[ [icao24, callsign, país, ..., lon(5), lat(6), baro_alt m(7),
        // on_ground(8), velocity m/s(9), true_track(10), vertical_rate m/s(11), ...], ... ] }.
        // Salta els avions a terra i els que tenen valors nuls. Retorna la llista convertida a ft/kt/fpm.
        public static List<Registro> Interpretar(Stream stream)
        {
            var lista = new List<Registro>(8192);
            using var doc = JsonDocument.Parse(stream);
            if (!doc.RootElement.TryGetProperty("states", out var states) || states.ValueKind != JsonValueKind.Array)
                return lista;
            foreach (var s in states.EnumerateArray())
            {
                if (s.ValueKind != JsonValueKind.Array || s.GetArrayLength() < 12) continue;
                var r = new Registro();
                double? lon = null, lat = null, alt = null, vel = null, trk = null, vv = null, geo = null;
                bool suelo = false;
                int k = 0;
                foreach (var e in s.EnumerateArray())
                {
                    bool nulo = e.ValueKind == JsonValueKind.Null;
                    switch (k)
                    {
                        case 0: r.Icao24 = nulo ? null : e.GetString(); break;
                        case 1: r.Callsign = nulo ? "" : (e.GetString() ?? "").Trim(); break;
                        case 2: r.Pais = nulo ? "" : e.GetString(); break;
                        case 5: if (!nulo) lon = e.GetDouble(); break;
                        case 6: if (!nulo) lat = e.GetDouble(); break;
                        case 7: if (!nulo) alt = e.GetDouble(); break;
                        case 8: suelo = e.ValueKind == JsonValueKind.True; break;
                        case 9: if (!nulo) vel = e.GetDouble(); break;
                        case 10: if (!nulo) trk = e.GetDouble(); break;
                        case 11: if (!nulo) vv = e.GetDouble(); break;
                        case 13: if (!nulo) geo = e.GetDouble(); break;
                    }
                    k++;
                }
                if (suelo || r.Icao24 == null || !lon.HasValue || !lat.HasValue || !vel.HasValue || !trk.HasValue) continue;
                double? altM = alt ?? geo;
                if (!altM.HasValue) continue;
                if (Math.Abs(lat.Value) > 90 || Math.Abs(lon.Value) > 180) continue;
                r.Lat = lat.Value; r.Lon = lon.Value;
                r.AltFt = Math.Max(0, altM.Value * 3.28084);          // m -> ft
                r.VelKt = vel.Value * 1.943844;                       // m/s -> kt
                r.Rumbo = trk.Value;
                r.VvFpm = (vv ?? 0) * 196.8504;                       // m/s -> ft/min
                lista.Add(r);
                if (lista.Count >= MaxVuelos) break;
            }
            return lista;
        }

        // Aplica una llista de registres: actualitza els avions que ja es coneixien (mateix icao24 = mateix id),
        // n'afegeix de nous i retira els que han desaparegut.
        void Aplicar(List<Registro> estados)
        {
            DateTime ahora = Reloj.HoraUtc;
            var vistos = new HashSet<string>();
            foreach (var r in estados)
            {
                if (!vistos.Add(r.Icao24)) continue;
                if (!porIcao.TryGetValue(r.Icao24, out var v))
                {
                    v = new VueloDirecto { Id = siguienteId++, Icao24 = r.Icao24 };
                    porIcao[r.Icao24] = v;
                    porId[v.Id] = v;
                }
                v.Callsign = string.IsNullOrEmpty(r.Callsign) ? r.Icao24.ToUpperInvariant() : r.Callsign;
                v.PaisOrigen = r.Pais;
                v.AerolineaIdx = -1;
                if (r.Callsign.Length >= 4 && char.IsDigit(r.Callsign[3]) &&
                    cat.PorIcao.TryGetValue(r.Callsign.Substring(0, 3).ToUpperInvariant(), out var al))
                    v.AerolineaIdx = al.Indice;
                v.Actualizar(r.Lat, r.Lon, r.AltFt, r.VelKt, r.Rumbo, r.VvFpm, ahora);
            }
            // Es retiren els que ja no surten (excepte el que pilota l'usuari)
            foreach (var k in porIcao.Keys.Where(k => !vistos.Contains(k) && !porIcao[k].Manual).ToList())
            {
                porId.Remove(porIcao[k].Id);
                porIcao.Remove(k);
            }
            vistas.Clear();
            foreach (var v in porId.Values) vistas.Add(v);
        }

        // Cancel·la la descàrrega en curs i allibera el recurs.
        public override void Dispose()
        {
            cts.Cancel();
        }
    }
}
