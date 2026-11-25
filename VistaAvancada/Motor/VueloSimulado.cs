namespace VistaAvancada.Motor
{
    // Un vol simulat entre dos aeroports. La seva posició és una funció analítica del temps: el perfil de vol
    // és una llista de trams (rodatge, enlairament, pujada, creuer, descens, aproximació, aterratge) i dins de
    // cada tram la velocitat i l'altitud canvien linealment amb el temps. Per això qualsevol escala de temps
    // i qualsevol salt gran de rellotge funcionen sense acumular errors.
    public class VueloSimulado : IVueloVista, IVueloPilotable
    {
        // ------------------------------------------------------------------ Tram del perfil
        // Un tram: temps relatiu a la sortida (s), distància recorreguda al començament (NM), altitud (ft) i
        // velocitat (kt) inicials, acceleració (kt/s) i velocitat vertical (ft/s).
        sealed class Tramo
        {
            public double T0, Dur, D0, H0, V0, Acc, VV;
            public int Fase;
        }

        // Constructor de perfils: manté l'estat actual (t, d, h, v) i hi afegeix trams enllaçats.
        sealed class Constructor
        {
            public double T, D, H, V;
            public readonly List<Tramo> Lista;

            public Constructor(List<Tramo> lista, double t, double d, double h, double v)
            { Lista = lista; T = t; D = d; H = h; V = v; }

            // Afegeix un tram de durada fixa que acaba a l'altitud hFin i la velocitat vFin (variació lineal).
            public void PorTiempo(int fase, double dur, double hFin, double vFin)
            {
                if (dur < 1e-6) dur = 1e-6;
                var s = new Tramo
                {
                    T0 = T, Dur = dur, D0 = D, H0 = H, V0 = V, Fase = fase,
                    Acc = (vFin - V) / dur, VV = (hFin - H) / dur
                };
                Lista.Add(s);
                // distància = velocitat mitjana (kt) * durada (s) / 3600 -> NM
                D += (V + vFin) / 2.0 * dur / 3600.0;
                T += dur; H = hFin; V = vFin;
            }

            // Afegeix un tram que recorre exactament "dist" NM; la durada surt de la velocitat mitjana.
            public void PorDistancia(int fase, double dist, double hFin, double vFin)
            {
                double vm = Math.Max(1.0, (V + vFin) / 2.0);
                PorTiempo(fase, dist * 3600.0 / vm, hFin, vFin);
            }
        }

        // ------------------------------------------------------------------ Dades del vol
        public int Id { get; }
        public string Callsign { get; }
        public string Matricula { get; }
        public Aerolinea Aerolinea { get; }
        public TipoAvion Tipo { get; }
        public Aeropuerto Origen { get; }
        public Aeropuerto Destino { get; }
        // Hora programada (UTC) d'enlairament; el rodatge comença TaxiSeg segons abans
        public DateTime Salida { get; }
        public double TaxiSeg { get; }
        public double DistanciaTotalNM { get; }
        public double Viento { get; }                 // factor ±5% sobre la velocitat sobre el terra
        public int AerolineaIdx => Aerolinea.Indice;
        public bool EsRetorno { get; set; }           // true si és el vol de tornada d'una rotació
        public List<string> TextosInstrucciones { get; } = new List<string>();
        public DateTime UltimaInstruccion = DateTime.MinValue;

        // Perfil i estat del creuer actual
        readonly List<Tramo> tramos = new List<Tramo>();
        double hCrucero;                              // altitud de creuer en ft
        double multVel = 1.0;                         // factor de velocitat acumulat per les instruccions
        double vCrucero;                              // velocitat sobre el terra en creuer (kt)

        // Geometria de la ruta (vectors unitat dels extrems per interpolar sobre l'esfera)
        readonly double x0, y0, z0, x1, y1, z1, delta, sinDelta;
        readonly double rumboSalida, rumboLlegada;

        // ------------------------------------------------------------------ Estat actual (IVueloVista)
        public double Lat { get; private set; }
        public double Lon { get; private set; }
        public double AltitudFt { get; private set; }
        public double Rumbo { get; private set; }
        public double VelocidadKt { get; private set; }
        public double VelVerticalFpm { get; private set; }
        public int FaseIdx { get; private set; }
        public double DistRecorridaNM { get; private set; }
        public bool EnConflicto { get; set; }
        public bool EnTierra => FaseIdx == Fases.Rodatge || FaseIdx == Fases.Enlairament || FaseIdx == Fases.Aterrat;
        public double Progreso => DistanciaTotalNM <= 0 ? 1 : Math.Min(1.0, DistRecorridaNM / DistanciaTotalNM);
        public double DistRestanteNM => Math.Max(0, DistanciaTotalNM - DistRecorridaNM);
        public int NivelCrucero => (int)Math.Round(hCrucero / 100.0);
        public double HoraRelativa { get; private set; }

        // Hora (UTC) en què toca la pista (arribada), i moment a partir del qual deixa de mostrar-se
        public DateTime Llegada { get; private set; }
        public DateTime InicioVisible => Salida.AddSeconds(-TaxiSeg);
        // Mentre el pilota l'usuari, l'avió no es retira mai
        public DateTime FinVisible => Manual ? DateTime.MaxValue : Llegada.AddMinutes(5);

        // ------------------------------------------------------------------ Pilotatge manual i vol lliure
        // Mentre l'usuari el pilota (Manual), la posició la marca la pàgina. Quan el deixa, l'avió passa a "vol lliure":
        // un pilot automàtic senzill el porta per l'ortodròmica fins al destí, amb descens de 3 NM per 1000 ft i aterratge.
        public bool Manual { get; private set; }
        public bool Libre { get; private set; }
        DateTime tLibre;                              // última hora simulada avaluada en vol lliure
        double distTomaControl = -1;                  // distància de ruta recorreguda quan l'usuari en va prendre el control
        readonly List<double[]> rastro = new List<double[]>();    // punts realment volats des de llavors

        // Crea el vol i en calcula el perfil. Paràmetres: identificadors, aerolínia, tipus, aeroports, hora programada
        // d'enlairament (UTC), durada del rodatge (s), factor de vent, i el nivell de creuer màxim desitjat en ft
        // (el real es redueix si el vol és massa curt i es força la regla semicircular).
        // "azar" decideix entre els nivells vàlids més alts.
        public VueloSimulado(int id, string callsign, string matricula, Aerolinea aerolinea, TipoAvion tipo,
            Aeropuerto origen, Aeropuerto destino, DateTime salida, double taxiSeg, double viento, Random azar)
        {
            Id = id; Callsign = callsign; Matricula = matricula; Aerolinea = aerolinea; Tipo = tipo;
            Origen = origen; Destino = destino; Salida = salida; TaxiSeg = taxiSeg; Viento = viento;

            DistanciaTotalNM = Geo.Distancia(origen.Lat, origen.Lon, destino.Lat, destino.Lon);
            delta = DistanciaTotalNM / Geo.RadioNM;
            sinDelta = Math.Sin(delta);
            double f1 = origen.Lat * Geo.GradosARad, l1 = origen.Lon * Geo.GradosARad;
            double f2 = destino.Lat * Geo.GradosARad, l2 = destino.Lon * Geo.GradosARad;
            x0 = Math.Cos(f1) * Math.Cos(l1); y0 = Math.Cos(f1) * Math.Sin(l1); z0 = Math.Sin(f1);
            x1 = Math.Cos(f2) * Math.Cos(l2); y1 = Math.Cos(f2) * Math.Sin(l2); z1 = Math.Sin(f2);

            // Rumb de sortida i d'arribada: es fan servir mentre és a prop d'un aeroport (direcció de la pista)
            var p3 = PuntoEn(Math.Min(3.0, DistanciaTotalNM / 2));
            rumboSalida = Geo.Rumbo(origen.Lat, origen.Lon, p3.lat, p3.lon);
            var p3b = PuntoEn(Math.Max(DistanciaTotalNM - 3.0, DistanciaTotalNM / 2));
            rumboLlegada = Geo.Rumbo(p3b.lat, p3b.lon, destino.Lat, destino.Lon);

            // El sentit E/O de la ruta decideix la paritat del nivell (regla semicircular)
            bool haciaEste = Geo.Rumbo(origen.Lat, origen.Lon, destino.Lat, destino.Lon) < 180.0;
            ElegirNivelYConstruir(haciaEste, azar);

            Lat = origen.Lat; Lon = origen.Lon; AltitudFt = origen.ElevacionFt; Rumbo = rumboSalida;
            FaseIdx = Fases.Rodatge;
        }

        // ------------------------------------------------------------------ Perfil: construcció
        // Velocitat sobre el terra (kt) en creuer a l'altitud h: per sota de 10.000 ft màxim 250 kt;
        // per sobre puja progressivament fins a la velocitat de creuer del tipus (amb el vent aplicat).
        double VelocidadCrucero(double h)
        {
            if (h <= 10000) return Math.Min(Tipo.VelCruceroKt, 250.0);
            double frac = Math.Min(1.0, (h - 10000.0) / 20000.0);
            return Tipo.VelCruceroKt * (0.82 + 0.18 * frac) * Viento;
        }

        // Velocitat de pujada i règim vertical (ft/min) segons la categoria de l'avió: (tram baix, tram alt).
        (double bajo, double alto) RitmoPujada()
        {
            if (Tipo.EsTurbohelice) return (1800, 1500);
            if (Tipo.EsWB) return (2500, 1900);
            return (2800, 2200);
        }

        // Afegeix el rodatge, l'enlairament i la pujada fins a l'altitud de creuer hCr (velocitat final vCr).
        // El constructor c ha d'estar a l'inici del rodatge. Retorna res; deixa c al final de la pujada.
        void AnadirAscenso(Constructor c, double hCr, double vCr)
        {
            double e0 = Origen.ElevacionFt;
            c.PorTiempo(Fases.Rodatge, TaxiSeg, e0, 0);
            c.PorTiempo(Fases.Enlairament, 40, e0, 160);               // cursa d'enlairament: 0 -> 160 kt en 40 s
            var (bajo, alto) = RitmoPujada();
            double hTramo1 = Math.Min(10000.0, hCr);
            double v1 = hCr > 10500 ? Math.Min(250.0, vCr) : vCr;
            c.PorTiempo(Fases.Pujada, Math.Max(1, (hTramo1 - e0)) / (bajo / 60.0), hTramo1, v1);
            if (hCr > 10500)
                c.PorTiempo(Fases.Pujada, (hCr - 10000.0) / (alto / 60.0), hCr, vCr);
        }

        // Afegeix des de l'estat actual (inici del descens, a altitud hCr) el descens (3 NM per cada 1000 ft),
        // l'aproximació i la cursa d'aterratge fins aturar-se. Deixa c al final.
        void AnadirDescenso(Constructor c)
        {
            double e1 = Destino.ElevacionFt;
            double hAprox = e1 + 3000.0;                               // inici de l'aproximació final
            double hBaja = Math.Max(10000.0, hAprox);                  // alçada on es frena fins a 250 kt
            if (c.H > hBaja + 100)
                c.PorDistancia(Fases.Descens, 3.0 * (c.H - hBaja) / 1000.0, hBaja, Math.Min(250.0, c.V));
            if (c.H > hAprox + 100)
                c.PorDistancia(Fases.Descens, 3.0 * (c.H - hAprox) / 1000.0, hAprox, Math.Min(180.0, c.V));
            c.PorDistancia(Fases.Aproximacio, 3.0 * Math.Max(1.0, hAprox - e1) / 1000.0, e1, 140);
            c.PorTiempo(Fases.Aterrat, 45, e1, 0);                     // cursa d'aterratge 140 -> 0 kt en 45 s
        }

        // Longitud (NM) que ocupen el descens, l'aproximació i l'aterratge si es comença a l'altitud hCr i la velocitat vCr.
        double LongitudDescenso(double hCr, double vCr)
        {
            var c = new Constructor(new List<Tramo>(), 0, 0, hCr, vCr);
            AnadirDescenso(c);
            return c.D;
        }

        // Longitud (NM) de la sortida: rodatge, enlairament i pujada fins a hCr.
        double LongitudAscenso(double hCr, double vCr)
        {
            var c = new Constructor(new List<Tramo>(), 0, 0, Origen.ElevacionFt, 0);
            AnadirAscenso(c, hCr, vCr);
            return c.D;
        }

        // Tria el nivell de creuer i construeix el perfil complet. Prova els nivells (només els de la paritat de
        // la regla semicircular) des del màxim del tipus cap avall fins que la pujada i el descens caben a la ruta,
        // i en tria un entre els 4 més alts possibles (a l'atzar).
        void ElegirNivelYConstruir(bool haciaEste, Random azar)
        {
            int maxMiles = Tipo.NivelMax / 10;                          // FL390 -> 39 (milers de peus)
            int minMiles = (int)Math.Ceiling((Math.Max(Origen.ElevacionFt, Destino.ElevacionFt) + 5000.0) / 1000.0);
            int paridad = haciaEste ? 1 : 0;                            // est: milers imparells; oest: parells
            var validos = new List<double>();
            for (int m = maxMiles; m >= Math.Max(minMiles, 4) && validos.Count < 4; m--)
            {
                if ((m & 1) != paridad) continue;
                double h = m * 1000.0;
                double vCr = VelocidadCrucero(h);
                if (LongitudAscenso(h, vCr) + LongitudDescenso(h, vCr) <= DistanciaTotalNM - 5.0)
                    validos.Add(h);
            }
            double hElegida;
            if (validos.Count == 0)
            {
                // Ruta molt curta: nivell més baix possible amb la paritat correcta
                int m = minMiles; if ((m & 1) != paridad) m++;
                hElegida = m * 1000.0;
            }
            else hElegida = validos[azar.Next(validos.Count)];
            ConstruirPerfilCompleto(hElegida);
        }

        // Construeix el perfil complet per a un nivell de creuer donat (ft) i el deixa guardat.
        void ConstruirPerfilCompleto(double hCr)
        {
            hCrucero = hCr;
            vCrucero = VelocidadCrucero(hCr) * multVel;
            tramos.Clear();
            var c = new Constructor(tramos, -TaxiSeg, 0, Origen.ElevacionFt, 0);
            AnadirAscenso(c, hCr, vCrucero);
            double dTod = DistanciaTotalNM - LongitudDescenso(hCr, vCrucero);   // punt on comença el descens
            if (dTod > c.D) c.PorDistancia(Fases.Creuer, dTod - c.D, hCr, vCrucero);
            AnadirDescenso(c);
            FijarLlegada();
        }

        // Calcula la hora d'arribada (toc de pista) a partir del primer tram d'aterratge.
        void FijarLlegada()
        {
            foreach (var t in tramos)
                if (t.Fase == Fases.Aterrat) { Llegada = Salida.AddSeconds(t.T0); return; }
            var u = tramos[^1];
            Llegada = Salida.AddSeconds(u.T0 + u.Dur);
        }

        // ------------------------------------------------------------------ Perfil: avaluació
        // Estat intern en un instant t (segons relatius a la sortida): distància, altitud, velocitat, vertical i fase.
        (double d, double h, double v, double vv, int fase) EstadoEn(double t)
        {
            if (t <= tramos[0].T0)
                return (0, Origen.ElevacionFt, 0, 0, Fases.Rodatge);
            // Cerca del tram (el perfil té pocs trams: cerca lineal des del final)
            int i = tramos.Count - 1;
            while (i > 0 && tramos[i].T0 > t) i--;
            var s = tramos[i];
            double tau = t - s.T0;
            if (tau > s.Dur) tau = s.Dur;
            double d = s.D0 + (s.V0 * tau + 0.5 * s.Acc * tau * tau) / 3600.0;
            double h = s.H0 + s.VV * tau;
            double v = s.V0 + s.Acc * tau;
            bool fin = i == tramos.Count - 1 && t >= s.T0 + s.Dur;
            return (d, h, fin ? 0 : v, fin ? 0 : s.VV * 60.0, s.Fase);
        }

        // Punt de la ruta ortodròmica a la distància d (NM) des de l'origen: interpolació esfèrica.
        (double lat, double lon) PuntoEn(double d)
        {
            if (DistanciaTotalNM < 1e-6) return (Origen.Lat, Origen.Lon);
            double f = Math.Max(0.0, Math.Min(1.0, d / DistanciaTotalNM));
            if (delta < 1e-9) return (Origen.Lat, Origen.Lon);
            double a = Math.Sin((1 - f) * delta) / sinDelta;
            double b = Math.Sin(f * delta) / sinDelta;
            double x = a * x0 + b * x1, y = a * y0 + b * y1, z = a * z0 + b * z1;
            return (Math.Atan2(z, Math.Sqrt(x * x + y * y)) * Geo.RadAGrados, Math.Atan2(y, x) * Geo.RadAGrados);
        }

        // Calcula posició, altitud, velocitats, rumb i fase en l'hora UTC indicada i les deixa a les propietats.
        public void Evaluar(DateTime utc)
        {
            double t = (utc - Salida).TotalSeconds;
            HoraRelativa = t;
            if (Manual) return;                       // la posició la dona la pàgina
            if (Libre) { AvanzarLibre(utc); return; }
            var e = EstadoEn(t);
            double dist = Math.Min(DistanciaTotalNM, Math.Max(0, e.d));
            DistRecorridaNM = dist;
            var p = PuntoEn(dist);
            Lat = p.lat; Lon = p.lon;
            AltitudFt = Math.Max(0, e.h);          // alguns aeroports tenen elevació negativa
            VelocidadKt = e.v;
            VelVerticalFpm = e.vv;
            FaseIdx = e.fase;
            // Rumb: dirigit al destí; a prop de cada aeroport es manté el de la pista
            if (dist < 3.0) Rumbo = rumboSalida;
            else if (DistanciaTotalNM - dist < 3.0) Rumbo = rumboLlegada;
            else Rumbo = Geo.Rumbo(Lat, Lon, Destino.Lat, Destino.Lon);
        }

        // ------------------------------------------------------------------ Instruccions d'ATC
        // Reconstrueix el perfil des de l'estat de l'instant utc amb un nou nivell de creuer (ft; null = el mateix) i
        // un factor de velocitat (1 = igual). Només és possible en pujada o creuer. Si "aplicar" és fals només
        // comprova si seria factible. Retorna true si s'ha pogut (o es podria) fer.
        public bool Reprogramar(DateTime utc, double? nuevoHFt, double factorVel, bool aplicar)
        {
            if (Manual) return false;                 // l'avió el pilota l'usuari
            if (Libre)
            {
                // En vol lliure n'hi ha prou de canviar els objectius del pilot automàtic
                if (FaseIdx != Fases.Pujada && FaseIdx != Fases.Creuer) return false;
                if (!aplicar) return true;
                hCrucero = nuevoHFt ?? hCrucero;
                multVel = Math.Max(0.85, Math.Min(1.15, multVel * factorVel));
                vCrucero = VelocidadCrucero(hCrucero) * multVel;
                return true;
            }
            double t = (utc - Salida).TotalSeconds;
            var e = EstadoEn(t);
            if (e.fase != Fases.Pujada && e.fase != Fases.Creuer) return false;

            double hN = nuevoHFt ?? hCrucero;
            double multN = Math.Max(0.85, Math.Min(1.15, multVel * factorVel));
            double vN = VelocidadCrucero(hN) * multN;

            var nuevos = new List<Tramo>();
            foreach (var s in tramos)                                   // es conserva el passat, tallant el tram actual
            {
                if (s.T0 >= t) break;
                nuevos.Add(new Tramo { T0 = s.T0, Dur = Math.Min(s.Dur, t - s.T0), D0 = s.D0, H0 = s.H0, V0 = s.V0, Acc = s.Acc, VV = s.VV, Fase = s.Fase });
            }
            var c = new Constructor(nuevos, t, e.d, e.h, e.v);

            // 1) Canvi de nivell: 2500 ft/min si puja per sota de 10.000 ft, 1800 ft/min en la resta;
            //    la velocitat s'apropa a la nova de creuer amb com a màxim 1,2 kt/s d'acceleració.
            bool sube = hN > e.h + 30, baja = hN < e.h - 30;
            if (sube || baja)
            {
                double ritmo = sube && e.h < 10000 ? 2500.0 : 1800.0;
                double dur = Math.Abs(hN - e.h) / (ritmo / 60.0);
                double vFin = e.v + Math.Max(-1.2 * dur, Math.Min(1.2 * dur, vN - e.v));
                c.PorTiempo(sube ? Fases.Pujada : Fases.Creuer, dur, hN, vFin);
            }
            // 2) Si falta velocitat, es corregeix a 1 kt/s
            if (Math.Abs(vN - c.V) > 0.5)
                c.PorTiempo(Fases.Creuer, Math.Abs(vN - c.V) / 1.0, hN, vN);
            // 3) Creuer fins al nou punt d'inici de descens
            double dTod = DistanciaTotalNM - LongitudDescenso(hN, vN);
            if (c.D > dTod - 2.0) return false;
            c.PorDistancia(Fases.Creuer, dTod - c.D, hN, vN);
            AnadirDescenso(c);

            if (!aplicar) return true;
            tramos.Clear();
            tramos.AddRange(nuevos);
            hCrucero = hN; multVel = multN; vCrucero = vN;
            FijarLlegada();
            return true;
        }

        // Retorna l'altitud (ft) a la qual el vol tindrà el creuer, i la velocitat de creuer actual (kt).
        public double AltitudObjetivoFt => hCrucero;
        public double VelCruceroActualKt => vCrucero;
        public double MultiplicadorVelocidad => multVel;
        // Màxim nivell permès pel tipus d'avió, en ft
        public double AltitudMaximaFt => Tipo.NivelMax * 100.0;

        // Retorna els n punts (lat, lon) de tota la ruta ortodròmica (de l'origen al destí).
        public List<double[]> PuntosRuta(int n)
        {
            var r = new List<double[]>(n);
            for (int i = 0; i < n; i++)
            {
                var p = PuntoEn(DistanciaTotalNM * i / (n - 1));
                r.Add(new[] { p.lat, p.lon });
            }
            return r;
        }

        // Retorna els punts (lat, lon) del tros de ruta ja volat (fins a la posició actual), com a màxim n.
        public List<double[]> PuntosRecorrido(int n)
        {
            var r = new List<double[]>(n);
            if (distTomaControl >= 0)
            {
                // Tros de la ruta planificada fins que l'usuari en va prendre el control, i després el que s'ha volat de veritat
                int ka = Math.Max(2, (int)Math.Ceiling(n / 2.0 * Math.Min(1.0, distTomaControl / Math.Max(1e-6, DistanciaTotalNM))));
                for (int i = 0; i < ka; i++)
                {
                    var p = PuntoEn(distTomaControl * i / (ka - 1));
                    r.Add(new[] { p.lat, p.lon });
                }
                int pas = Math.Max(1, (int)Math.Ceiling(rastro.Count / (n / 2.0)));
                for (int i = 0; i < rastro.Count; i += pas) r.Add(rastro[i]);
                r.Add(new[] { Lat, Lon });
                return r;
            }
            double dist = DistRecorridaNM;
            int k = Math.Max(2, (int)Math.Ceiling(n * Progreso));
            for (int i = 0; i < k; i++)
            {
                var p = PuntoEn(dist * i / (k - 1));
                r.Add(new[] { p.lat, p.lon });
            }
            return r;
        }

        // ------------------------------------------------------------------ Pilotatge manual i vol lliure
        // Fixa la posició que envia la pàgina mentre l'usuari pilota l'avió (graus, ft, graus, kt, ft/min) a l'hora utc.
        public void PonerManual(double lat, double lon, double altFt, double rumbo, double velKt, double vvFpm, DateTime utc)
        {
            if (distTomaControl < 0) distTomaControl = DistRecorridaNM;
            Manual = true; Libre = false;
            Lat = lat; Lon = Geo.NormalizarLon(lon);
            AltitudFt = Math.Max(0, altFt);
            Rumbo = Geo.Normalizar360(rumbo);
            VelocidadKt = Math.Max(0, velKt);
            VelVerticalFpm = vvFpm;
            FaseIdx = FaseSegunVertical(vvFpm, Geo.Distancia(Lat, Lon, Destino.Lat, Destino.Lon));
            AnadirRastro();
            EstimarLlegada(utc);
        }

        // L'usuari deixa els comandaments: l'avió continua cap al destí amb el pilot automàtic (vol lliure).
        public void Liberar(DateTime utc)
        {
            if (!Manual) return;
            Manual = false; Libre = true;
            tLibre = utc;
            EstimarLlegada(utc);
        }

        // Fase aproximada segons la velocitat vertical (ft/min) i la distància al destí (NM).
        static int FaseSegunVertical(double vvFpm, double distDestino)
        {
            if (vvFpm > 300) return Fases.Pujada;
            if (vvFpm < -300) return distDestino < 15 ? Fases.Aproximacio : Fases.Descens;
            return Fases.Creuer;
        }

        // Afegeix la posició actual al rastre si s'ha mogut més d'1 NM (com a màxim uns 1500 punts).
        void AnadirRastro()
        {
            if (rastro.Count > 0)
            {
                var u = rastro[^1];
                if (Geo.Distancia(u[0], u[1], Lat, Lon) < 1.0) return;
            }
            rastro.Add(new[] { Lat, Lon });
            if (rastro.Count > 1500)
                for (int i = rastro.Count - 2; i > 0; i -= 2) rastro.RemoveAt(i);     // es queda amb la meitat
        }

        // Recalcula la distància recorreguda (per al progrés) i l'hora d'arribada estimada des de la posició actual.
        void EstimarLlegada(DateTime utc)
        {
            double resta = Geo.Distancia(Lat, Lon, Destino.Lat, Destino.Lon);
            DistRecorridaNM = Math.Max(0, DistanciaTotalNM - resta);
            if (FaseIdx == Fases.Aterrat) return;
            double v = Math.Max(150.0, VelocidadKt);
            Llegada = utc.AddSeconds(resta / v * 3600.0 + 240);
        }

        // Avança el vol lliure fins a l'hora utc en passos de com a màxim 5 s simulats.
        void AvanzarLibre(DateTime utc)
        {
            double total = (utc - tLibre).TotalSeconds;
            if (total <= 0) return;
            tLibre = utc;
            if (FaseIdx == Fases.Aterrat) { VelocidadKt = 0; VelVerticalFpm = 0; return; }
            while (total > 1e-6)
            {
                double dt = Math.Min(5.0, total);
                total -= dt;
                if (PasoLibre(dt))
                {
                    Llegada = utc.AddSeconds(-total);       // acaba d'aterrar: d'aquí a 5 minuts es retira
                    break;
                }
            }
            AnadirRastro();
            if (FaseIdx != Fases.Aterrat) EstimarLlegada(utc);
            else DistRecorridaNM = DistanciaTotalNM;
        }

        // Un pas del pilot automàtic del vol lliure (dt en segons simulats): gira cap al destí (màx. 3°/s), segueix el
        // nivell de creuer o la senda de descens (3 NM per cada 1000 ft) i ajusta la velocitat. Retorna true si aterra.
        bool PasoLibre(double dt)
        {
            double dist = Geo.Distancia(Lat, Lon, Destino.Lat, Destino.Lon);
            double e1 = Destino.ElevacionFt;
            if (dist < 1.5 && AltitudFt < e1 + 800)
            {
                Lat = Destino.Lat; Lon = Destino.Lon; AltitudFt = e1;
                VelocidadKt = 0; VelVerticalFpm = 0; FaseIdx = Fases.Aterrat;
                return true;
            }
            double objetivo = Geo.Rumbo(Lat, Lon, Destino.Lat, Destino.Lon);
            double giro = Geo.Normalizar360(objetivo - Rumbo);
            if (giro > 180) giro -= 360;
            Rumbo = Geo.Normalizar360(Rumbo + Math.Max(-3 * dt, Math.Min(3 * dt, giro)));

            double hObj = Math.Min(hCrucero, e1 + dist * 1000.0 / 3.0);
            double vv = Math.Max(-2500, Math.Min(2200, (hObj - AltitudFt) * 2.0));
            VelVerticalFpm = vv;
            AltitudFt = Math.Max(e1, AltitudFt + vv / 60.0 * dt);

            double vObj = dist < 30 ? Math.Max(150, Math.Min(250, 140 + dist * 4)) : AltitudFt < 10000 ? Math.Min(250, vCrucero) : vCrucero;
            VelocidadKt += Math.Max(-1.5 * dt, Math.Min(1.5 * dt, vObj - VelocidadKt));
            var p = Geo.Destino(Lat, Lon, Rumbo, VelocidadKt * dt / 3600.0);
            Lat = p.lat; Lon = p.lon;
            FaseIdx = FaseSegunVertical(vv, dist);
            return false;
        }

        // Estat en una taula de sortides de l'aeroport d'origen a l'hora utc: Programat, Embarcant o Enlairat.
        public string EstadoSalida(DateTime utc)
        {
            if (utc < Salida.AddMinutes(-35)) return "Programat";
            if (utc < Salida) return "Embarcant";
            return "Enlairat";
        }

        // Estat en una taula d'arribades de l'aeroport de destí: Programat (encara no ha sortit), En vol o Aterrat.
        public string EstadoLlegada(DateTime utc)
        {
            if (utc < InicioVisible) return "Programat";
            if (utc < Llegada) return "En vol";
            return "Aterrat";
        }

        public override string ToString() => Callsign + " " + Origen.Iata + "-" + Destino.Iata;
    }
}
