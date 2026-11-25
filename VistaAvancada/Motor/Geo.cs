namespace VistaAvancada.Motor
{
    // Funcions de geografia sobre l'esfera terrestre: distàncies, rumbs i punts de la ruta ortodròmica.
    // Totes les distàncies són en milles nàutiques (NM) i els angles públics en graus.
    public static class Geo
    {
        // Radi mitjà de la Terra en milles nàutiques
        public const double RadioNM = 3440.065;
        public const double GradosARad = Math.PI / 180.0;
        public const double RadAGrados = 180.0 / Math.PI;

        // Normalitza un angle a l'interval [0, 360).
        public static double Normalizar360(double grados)
        {
            double r = grados % 360.0;
            if (r < 0) r += 360.0;
            return r;
        }

        // Normalitza una longitud a l'interval [-180, 180).
        public static double NormalizarLon(double lon)
        {
            double r = (lon + 180.0) % 360.0;
            if (r < 0) r += 360.0;
            return r - 180.0;
        }

        // Distància ortodròmica en NM entre dos punts (lat/lon en graus), amb la fórmula de haversine.
        public static double Distancia(double lat1, double lon1, double lat2, double lon2)
        {
            double f1 = lat1 * GradosARad, f2 = lat2 * GradosARad;
            double df = (lat2 - lat1) * GradosARad;
            double dl = (lon2 - lon1) * GradosARad;
            double sf = Math.Sin(df / 2), sl = Math.Sin(dl / 2);
            double a = sf * sf + Math.Cos(f1) * Math.Cos(f2) * sl * sl;
            // Math.Min evita que errors d'arrodoniment facin sortir l'arrel del domini
            return 2 * RadioNM * Math.Asin(Math.Min(1.0, Math.Sqrt(a)));
        }

        // Rumb inicial (0 = nord, sentit horari) per anar del punt 1 al punt 2 per la ruta ortodròmica.
        public static double Rumbo(double lat1, double lon1, double lat2, double lon2)
        {
            double f1 = lat1 * GradosARad, f2 = lat2 * GradosARad;
            double dl = (lon2 - lon1) * GradosARad;
            double y = Math.Sin(dl) * Math.Cos(f2);
            double x = Math.Cos(f1) * Math.Sin(f2) - Math.Sin(f1) * Math.Cos(f2) * Math.Cos(dl);
            return Normalizar360(Math.Atan2(y, x) * RadAGrados);
        }

        // Punt intermedi de la ruta ortodròmica entre els dos punts, a la fracció f (0 = punt 1, 1 = punt 2).
        // Retorna (lat, lon) en graus. Interpola esfèricament (slerp) entre els dos vectors unitat;
        // d és l'angle central entre els dos punts.
        public static (double lat, double lon) Intermedio(double lat1, double lon1, double lat2, double lon2, double f)
        {
            double d = Distancia(lat1, lon1, lat2, lon2) / RadioNM;     // angle central en radians
            if (d < 1e-9) return (lat1, lon1);
            double f1 = lat1 * GradosARad, l1 = lon1 * GradosARad, f2 = lat2 * GradosARad, l2 = lon2 * GradosARad;
            double a = Math.Sin((1 - f) * d) / Math.Sin(d);
            double b = Math.Sin(f * d) / Math.Sin(d);
            double x = a * Math.Cos(f1) * Math.Cos(l1) + b * Math.Cos(f2) * Math.Cos(l2);
            double y = a * Math.Cos(f1) * Math.Sin(l1) + b * Math.Cos(f2) * Math.Sin(l2);
            double z = a * Math.Sin(f1) + b * Math.Sin(f2);
            return (Math.Atan2(z, Math.Sqrt(x * x + y * y)) * RadAGrados, Math.Atan2(y, x) * RadAGrados);
        }

        // Punt de destinació: des de (lat, lon), recorrent distNM milles amb el rumb indicat (en graus).
        public static (double lat, double lon) Destino(double lat, double lon, double rumboGrados, double distNM)
        {
            double d = distNM / RadioNM;
            double br = rumboGrados * GradosARad;
            double f1 = lat * GradosARad, l1 = lon * GradosARad;
            double sinF2 = Math.Sin(f1) * Math.Cos(d) + Math.Cos(f1) * Math.Sin(d) * Math.Cos(br);
            double f2 = Math.Asin(Math.Max(-1.0, Math.Min(1.0, sinF2)));
            double l2 = l1 + Math.Atan2(Math.Sin(br) * Math.Sin(d) * Math.Cos(f1), Math.Cos(d) - Math.Sin(f1) * sinF2);
            return (f2 * RadAGrados, NormalizarLon(l2 * RadAGrados));
        }

        // Diferència mínima entre dos rumbs (0..180 graus).
        public static double DiferenciaAngulo(double a, double b)
        {
            double d = Math.Abs(Normalizar360(a) - Normalizar360(b));
            return d > 180 ? 360 - d : d;
        }
    }
}
