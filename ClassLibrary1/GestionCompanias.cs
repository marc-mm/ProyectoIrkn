using System.Data;
using System.Data.SQLite;

namespace FlightLib
{
    // Accés a la taula companias de la base de dades (columnes nombre, telefono i email).
    // La taula és a la mateixa base de dades que els usuaris (usuarios.db).
    public class GestionCompanias
    {
        SQLiteConnection cnx;

        // Obre la base de dades. Retorna 0 si s'ha pogut obrir o -1 si no s'ha trobat el fitxer.
        public int Iniciar()
        {
            string dataSource = "Data Source=..\\..\\..\\usuarios.db;FailIfMissing=True";
            cnx = new SQLiteConnection(dataSource);
            try
            {
                cnx.Open();
                return 0;
            }
            catch (SQLiteException)
            {
                return -1;
            }
        }

        public void Cerrar()
        {
            cnx.Close();
        }

        // Retorna una taula amb totes les companyies ordenades per nom,
        // o null si hi ha un error amb la base de dades.
        public DataTable DameCompanias()
        {
            DataTable dt = new DataTable();
            string sql = "SELECT * FROM companias ORDER BY nombre";
            try
            {
                SQLiteDataAdapter adp = new SQLiteDataAdapter(sql, cnx);
                adp.Fill(dt);
                return dt;
            }
            catch (SQLiteException)
            {
                return null;
            }
        }

        // Busca la companyia amb el nom rebut. Retorna una taula amb una fila (nom, telèfon, email)
        // si existeix o sense cap fila si no existeix, o null si hi ha un error amb la base de dades.
        public DataTable BuscarCompania(string nombre)
        {
            DataTable dt = new DataTable();
            string sql = "SELECT * FROM companias WHERE nombre='" + nombre + "'";
            try
            {
                SQLiteDataAdapter adp = new SQLiteDataAdapter(sql, cnx);
                adp.Fill(dt);
                return dt;
            }
            catch (SQLiteException)
            {
                return null;
            }
        }

        // Afegeix una companyia amb el nom, el telèfon i l'email rebuts.
        // Retorna 0 si s'ha afegit, -1 si ja n'hi ha una amb aquest nom o -2 si hi ha un error amb la base de dades.
        public int AnadirCompania(string nombre, string telefono, string email)
        {
            DataTable dt = BuscarCompania(nombre);
            if (dt == null)
                return -2;
            if (dt.Rows.Count > 0)
                return -1;

            string sql = "INSERT INTO companias VALUES ('" + nombre + "', '" + telefono + "', '" + email + "')";
            try
            {
                SQLiteCommand command = new SQLiteCommand(sql, cnx);
                command.ExecuteNonQuery();
                return 0;
            }
            catch (SQLiteException)
            {
                return -2;
            }
        }

        // Esborra la companyia amb el nom rebut.
        // Retorna 0 si s'ha esborrat, -1 si no n'hi ha cap amb aquest nom o -2 si hi ha un error amb la base de dades.
        public int EliminarCompania(string nombre)
        {
            string sql = "DELETE FROM companias WHERE nombre='" + nombre + "'";
            try
            {
                SQLiteCommand command = new SQLiteCommand(sql, cnx);
                int filas = command.ExecuteNonQuery();
                if (filas == 1)
                    return 0;
                else
                    return -1;
            }
            catch (SQLiteException)
            {
                return -2;
            }
        }
    }
}
