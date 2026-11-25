using System.Data;
using FlightLib;

namespace VistaAvancada.Motor
{
    // Dades de contacte d'una companyia, tretes de la taula "companias" de la base de dades del projecte.
    public class Contacto
    {
        public string Nombre, Telefono, Email;
    }

    // Consulta els contactes de les companyies amb la classe GestionCompanias del projecte original.
    // Guarda en memòria cau els resultats (també els que no existeixen) per no obrir la BD cada vegada.
    public class Contactos
    {
        readonly Dictionary<string, Contacto> cache = new Dictionary<string, Contacto>();
        DateTime ultimoFalloBd = DateTime.MinValue;
        public bool BdDisponible { get; private set; } = true;

        // Retorna el contacte de la companyia (null si no hi és o no hi ha BD). Obre i tanca la BD només si cal.
        public Contacto Obtener(string nombreBd)
        {
            if (string.IsNullOrWhiteSpace(nombreBd)) return null;
            if (cache.TryGetValue(nombreBd, out var c)) return c;
            ResolverLote(new[] { nombreBd });
            cache.TryGetValue(nombreBd, out c);
            return c;
        }

        // Carrega en memòria cau els contactes de diverses companyies obrint la BD només un cop (un "lot").
        // Si la BD no es troba, es torna a intentar com a màxim cada 20 segons.
        public void ResolverLote(IEnumerable<string> nombres)
        {
            var pendientes = nombres.Where(n => !string.IsNullOrWhiteSpace(n) && !cache.ContainsKey(n)).Distinct().ToList();
            if (pendientes.Count == 0) return;
            if (!BdDisponible && (DateTime.UtcNow - ultimoFalloBd).TotalSeconds < 20) return;

            GestionCompanias bd = null;
            bool abierta = false;
            try
            {
                bd = new GestionCompanias();
                if (bd.Iniciar() != 0)
                {
                    BdDisponible = false;
                    ultimoFalloBd = DateTime.UtcNow;
                    return;
                }
                abierta = true;
                BdDisponible = true;
                foreach (var nombre in pendientes)
                {
                    // El nom es concatena dins l'SQL de GestionCompanias: s'eviten les cometes simples
                    if (nombre.Contains('\'')) { cache[nombre] = null; continue; }
                    DataTable dt = bd.BuscarCompania(nombre);
                    if (dt != null && dt.Rows.Count >= 1)
                        cache[nombre] = new Contacto
                        {
                            Nombre = dt.Rows[0][0].ToString(),
                            Telefono = dt.Rows[0][1].ToString(),
                            Email = dt.Rows[0][2].ToString()
                        };
                    else
                        cache[nombre] = null;
                }
            }
            catch (Exception)
            {
                BdDisponible = false;
                ultimoFalloBd = DateTime.UtcNow;
            }
            finally
            {
                try { if (abierta) bd.Cerrar(); } catch (Exception) { }
            }
        }

        // Esborra la memòria cau (per exemple perquè s'ha canviat la base de dades).
        public void Limpiar() => cache.Clear();
    }
}
