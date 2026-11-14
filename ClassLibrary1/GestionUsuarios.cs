using System.Data;
using System.Data.SQLite;

namespace FlightLib
{
    // Accés a la base de dades d'usuaris (taula usuarios amb les columnes nombre i contrasena).
    public class GestionUsuarios
    {
        SQLiteConnection cnx;

        // Obre la base de dades. Retorna 0 si s'ha pogut obrir o -1 si no s'ha trobat el fitxer.
        public int Iniciar()
        {
            // FailIfMissing fa que no es creï una base de dades buida si el fitxer no existeix
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

        // Comprova si existeix un usuari amb aquest nom i contrasenya.
        // Retorna 0 si són correctes, -1 si no ho són o -2 si hi ha un error amb la base de dades.
        public int ComprobarUsuario(string nombre, string contrasena)
        {
            DataTable dt = new DataTable();
            string sql = "SELECT * FROM usuarios WHERE nombre='" + nombre + "' AND contrasena='" + contrasena + "'";
            try
            {
                SQLiteDataAdapter adp = new SQLiteDataAdapter(sql, cnx);
                adp.Fill(dt);
            }
            catch (SQLiteException)
            {
                return -2;
            }

            if (dt.Rows.Count == 1)
                return 0;
            else
                return -1;
        }

        // Registra un usuari nou amb el nom i la contrasenya rebuts.
        // Retorna 0 si s'ha registrat, -1 si ja existeix un usuari amb aquest nom o -2 si hi ha un error amb la base de dades.
        public int RegistrarUsuario(string nombre, string contrasena)
        {
            DataTable dt = new DataTable();
            string sql = "SELECT * FROM usuarios WHERE nombre='" + nombre + "'";
            try
            {
                SQLiteDataAdapter adp = new SQLiteDataAdapter(sql, cnx);
                adp.Fill(dt);
                if (dt.Rows.Count > 0)
                    return -1;

                sql = "INSERT INTO usuarios VALUES ('" + nombre + "', '" + contrasena + "')";
                SQLiteCommand command = new SQLiteCommand(sql, cnx);
                command.ExecuteNonQuery();
                return 0;
            }
            catch (SQLiteException)
            {
                return -2;
            }
        }
    }
}
