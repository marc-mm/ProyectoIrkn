using System.Data;
using FlightLib;

namespace WinFormsApp4
{
    // Finestra per veure totes les companyies de la base de dades, afegir-ne de noves i esborrar-ne.
    public partial class Gestion_companias : Form
    {
        GestionCompanias bd = new GestionCompanias();

        public Gestion_companias()
        {
            InitializeComponent();
        }

        private void Gestion_companias_Load(object sender, EventArgs e)
        {
            MostrarCompanias();
        }

        // Llegeix totes les companyies de la base de dades i les mostra a la taula.
        private void MostrarCompanias()
        {
            if (bd.Iniciar() == -1)
            {
                MessageBox.Show("No s'ha trobat la base de dades de companyies (usuarios.db)");
                return;
            }
            DataTable companias = bd.DameCompanias();
            bd.Cerrar();

            if (companias == null)
            {
                MessageBox.Show("Error en llegir la taula de companyies de la base de dades");
                return;
            }
            tablaCompanias.DataSource = companias;
            tablaCompanias.Columns[0].HeaderText = "Nom";
            tablaCompanias.Columns[1].HeaderText = "Telèfon";
            tablaCompanias.Columns[2].HeaderText = "Email";
            tablaCompanias.ClearSelection();
        }

        // En clicar una fila de la taula, copia les dades d'aquella companyia als quadres de text.
        private void tablaCompanias_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            // RowIndex és -1 quan es clica la capçalera
            if (e.RowIndex < 0)
                return;
            DataGridViewRow fila = tablaCompanias.Rows[e.RowIndex];
            textBoxNombre.Text = fila.Cells[0].Value.ToString();
            textBoxTelefono.Text = fila.Cells[1].Value.ToString();
            textBoxEmail.Text = fila.Cells[2].Value.ToString();
        }

        // Retorna true si el nom, el telèfon i l'email escrits són correctes. Si no, avisa l'usuari.
        private bool DatosCorrectos()
        {
            string nombre = textBoxNombre.Text;
            string telefono = textBoxTelefono.Text;
            string email = textBoxEmail.Text;

            if (nombre == "" || telefono == "" || email == "")
            {
                MessageBox.Show("Has d'escriure el nom, el telèfon i l'email de la companyia");
                return false;
            }
            if (nombre.Contains("'") || telefono.Contains("'") || email.Contains("'"))
            {
                MessageBox.Show("Les dades no poden contenir apòstrofs (')");
                return false;
            }
            // Al fitxer de plans de vol els camps se separen amb espais, així que el nom no en pot tenir
            if (nombre.Contains(" "))
            {
                MessageBox.Show("El nom de la companyia no pot tenir espais, ha de ser igual que al fitxer de plans de vol");
                return false;
            }

            // La conversió només serveix per comprovar que el telèfon és un número
            try
            {
                Convert.ToInt64(telefono);
            }
            catch (FormatException)
            {
                MessageBox.Show("Error de format: el telèfon ha de ser un número, sense lletres ni espais");
                return false;
            }
            catch (OverflowException)
            {
                MessageBox.Show("El telèfon és massa llarg");
                return false;
            }

            if (!email.Contains("@") || email.Contains(" "))
            {
                MessageBox.Show("L'email ha de tenir una @ i no pot tenir espais");
                return false;
            }
            return true;
        }

        // Buida els quadres de text.
        private void BorrarCampos()
        {
            textBoxNombre.Text = "";
            textBoxTelefono.Text = "";
            textBoxEmail.Text = "";
        }

        // Afegeix a la base de dades la companyia escrita als quadres de text i actualitza la taula.
        private void buttonAnadir_Click(object sender, EventArgs e)
        {
            if (!DatosCorrectos())
                return;

            if (bd.Iniciar() == -1)
            {
                MessageBox.Show("No s'ha trobat la base de dades de companyies (usuarios.db)");
                return;
            }
            int resultado = bd.AnadirCompania(textBoxNombre.Text, textBoxTelefono.Text, textBoxEmail.Text);
            bd.Cerrar();

            if (resultado == 0)
            {
                MessageBox.Show("Companyia afegida");
                BorrarCampos();
                MostrarCompanias();
            }
            else if (resultado == -1)
                MessageBox.Show("Ja existeix una companyia amb aquest nom");
            else
                MessageBox.Show("Error en escriure a la base de dades de companyies");
        }

        // Després de demanar confirmació, esborra de la base de dades la companyia amb el nom escrit
        // i actualitza la taula.
        private void buttonEliminar_Click(object sender, EventArgs e)
        {
            string nombre = textBoxNombre.Text;
            if (nombre == "")
            {
                MessageBox.Show("Clica a la llista la companyia que vols esborrar o escriu-ne el nom");
                return;
            }
            if (nombre.Contains("'"))
            {
                MessageBox.Show("El nom no pot contenir apòstrofs (')");
                return;
            }

            DialogResult respuesta = MessageBox.Show("Segur que vols esborrar la companyia " + nombre + "?",
                "Esborrar companyia", MessageBoxButtons.YesNo);
            if (respuesta != DialogResult.Yes)
                return;

            if (bd.Iniciar() == -1)
            {
                MessageBox.Show("No s'ha trobat la base de dades de companyies (usuarios.db)");
                return;
            }
            int resultado = bd.EliminarCompania(nombre);
            bd.Cerrar();

            if (resultado == 0)
            {
                MessageBox.Show("Companyia esborrada");
                BorrarCampos();
                MostrarCompanias();
            }
            else if (resultado == -1)
                MessageBox.Show("No existeix cap companyia amb aquest nom");
            else
                MessageBox.Show("Error en escriure a la base de dades de companyies");
        }

        private void buttonTancar_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}
