using System.Globalization;
using System.Text;

namespace VistaAvancada.Motor
{
    // Genera l'informe de text amb els conflictes detectats i les instruccions d'ATC donades, indicant
    // per a cada companyia el telèfon i l'email de la base de dades del projecte (taula companias).
    public static class Informe
    {
        static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

        // Construeix el text de l'informe. Rep la font de trànsit (conflictes i instruccions) i la consulta de
        // contactes; la BD només s'obre un cop (lot) per a totes les companyies implicades.
        public static string Generar(FuenteTrafico fuente, Contactos contactos)
        {
            var historial = fuente.Detector.Historial;
            var instrucciones = fuente.Instrucciones;

            // Una sola obertura de la BD per a totes les companyies que apareixen a l'informe
            var nombres = new HashSet<string>();
            foreach (var c in historial) { nombres.Add(c.NombreBdA); nombres.Add(c.NombreBdB); }
            foreach (var i in instrucciones) nombres.Add(i.NombreBd);
            nombres.Remove(null);
            contactos.ResolverLote(nombres);

            var sb = new StringBuilder();
            sb.AppendLine("INFORME DE CONFLICTES I INSTRUCCIONS - VISTA AVANÇADA REALISTA");
            sb.AppendLine(new string('=', 66));
            sb.AppendLine("Generat el: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss", Inv) + " (hora local del PC)");
            sb.AppendLine("Mode: " + fuente.Modo + "    Hora simulada: " + fuente.Reloj.HoraUtc.ToString("yyyy-MM-dd HH:mm:ss", Inv) + " UTC");
            sb.AppendLine($"Conflictes detectats: {historial.Count}    Actius: {fuente.Detector.Activos.Count}    Resolts: {fuente.Detector.Resueltos}");
            sb.AppendLine($"Instruccions donades: {instrucciones.Count}");
            if (fuente.Modo == "proyecto")
                sb.AppendLine("Criteri de conflicte: distància entre plans inferior a la distància de seguretat (FlightLib).");
            else
                sb.AppendLine("Criteri de conflicte: menys de 5 NM en horitzontal i menys de 1000 ft en vertical, per sobre de 10000 ft.");
            sb.AppendLine();

            sb.AppendLine("CONFLICTES DETECTATS");
            sb.AppendLine(new string('-', 66));
            if (historial.Count == 0) sb.AppendLine("(cap conflicte detectat)");
            int n = 0;
            foreach (var c in historial)
            {
                n++;
                string estado = c.Activo ? "ACTIU" : "RESOLT" + (c.Finalizado.HasValue ? " a les " + c.Finalizado.Value.ToString("HH:mm:ss", Inv) + "Z" : "");
                sb.AppendLine($"{n}. {c.Detectado.ToString("yyyy-MM-dd HH:mm:ss", Inv)}Z  {c.CallsignA} / {c.CallsignB}  [{estado}]");
                sb.AppendLine($"   Distància mínima: {c.MinDistNM.ToString("0.0", Inv)} NM    Diferència d'altitud actual: {c.DifAltFt.ToString("0", Inv)} ft");
                sb.AppendLine("   Instrucció: " + (c.Instruccion != null ? c.Instruccion.Texto : "cap"));
                sb.AppendLine("   Contacte " + c.CallsignA + ": " + Texto(contactos, c.NombreBdA));
                sb.AppendLine("   Contacte " + c.CallsignB + ": " + Texto(contactos, c.NombreBdB));
            }
            sb.AppendLine();

            sb.AppendLine("INSTRUCCIONS D'ATC");
            sb.AppendLine(new string('-', 66));
            if (instrucciones.Count == 0) sb.AppendLine("(cap instrucció donada)");
            foreach (var i in instrucciones)
            {
                sb.AppendLine($"{i.Hora.ToString("HH:mm:ss", Inv)}Z  {i.Texto}");
                sb.AppendLine("   Companyia: " + Texto(contactos, i.NombreBd));
            }
            if (!contactos.BdDisponible)
            {
                sb.AppendLine();
                sb.AppendLine("Nota: no s'ha pogut obrir la base de dades usuarios.db; no es mostren els contactes de les companyies.");
            }
            return sb.ToString();
        }

        // Retorna "nom - Tel: ... - Email: ..." d'una companyia o un text d'absència de dades.
        static string Texto(Contactos contactos, string nombreBd)
        {
            if (string.IsNullOrEmpty(nombreBd)) return "companyia desconeguda";
            var c = contactos.Obtener(nombreBd);
            if (c == null) return nombreBd + " (no consta a la base de dades)";
            return $"{c.Nombre} - Tel: {c.Telefono} - Email: {c.Email}";
        }

        // Desa l'informe en un fitxer de text UTF-8 (amb BOM, perquè el Bloc de notes mostri bé els accents).
        // Retorna true si s'ha desat o false si hi ha hagut un error d'escriptura.
        public static bool Guardar(string ruta, string texto)
        {
            try
            {
                File.WriteAllText(ruta, texto, new UTF8Encoding(true));
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
