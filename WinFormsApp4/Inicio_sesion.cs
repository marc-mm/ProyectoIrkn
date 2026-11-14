using FlightLib;

namespace WinFormsApp4
{
    // Finestra per iniciar sessió o registrar un usuari nou a la base de dades.
    public partial class Inicio_sesion : Form
    {
        GestionUsuarios baseDatos = new GestionUsuarios();
        bool autenticado = false;
        string usuario = "";

        public Inicio_sesion()
        {
            InitializeComponent();
        }

        // Retorna true si l'usuari ha iniciat sessió correctament.
        public bool dame_autenticado()
        {
            return autenticado;
        }

        public string dame_usuario()
        {
            return usuario;
        }

        // Retorna true si s'han escrit el nom i la contrasenya i no contenen apòstrofs
        // (trencarien la consulta SQL). Si no, avisa l'usuari.
        private bool DatosCorrectos()
        {
            if (textBoxUsuario.Text == "" || textBoxContrasena.Text == "")
            {
                MessageBox.Show("Has d'escriure el nom d'usuari i la contrasenya");
                return false;
            }
            if (textBoxUsuario.Text.Contains("'") || textBoxContrasena.Text.Contains("'"))
            {
                MessageBox.Show("El nom i la contrasenya no poden contenir apòstrofs (')");
                return false;
            }
            return true;
        }

        // Comprova l'usuari i la contrasenya a la base de dades i, si són correctes, tanca la finestra.
        private void buttonEntrar_Click(object sender, EventArgs e)
        {
            if (!DatosCorrectos())
                return;

            if (baseDatos.Iniciar() == -1)
            {
                MessageBox.Show("No s'ha trobat la base de dades d'usuaris (usuarios.db)");
                return;
            }
            int resultado = baseDatos.ComprobarUsuario(textBoxUsuario.Text, textBoxContrasena.Text);
            baseDatos.Cerrar();

            if (resultado == 0)
            {
                autenticado = true;
                usuario = textBoxUsuario.Text;
                Close();
            }
            else if (resultado == -1)
                MessageBox.Show("Usuari o contrasenya incorrectes");
            else
                MessageBox.Show("Error en llegir la base de dades d'usuaris");
        }

        // Registra a la base de dades l'usuari i la contrasenya escrits.
        private void buttonRegistrar_Click(object sender, EventArgs e)
        {
            if (!DatosCorrectos())
                return;

            if (baseDatos.Iniciar() == -1)
            {
                MessageBox.Show("No s'ha trobat la base de dades d'usuaris (usuarios.db)");
                return;
            }
            int resultado = baseDatos.RegistrarUsuario(textBoxUsuario.Text, textBoxContrasena.Text);
            baseDatos.Cerrar();

            if (resultado == 0)
                MessageBox.Show("Usuari registrat. Ja pots entrar");
            else if (resultado == -1)
                MessageBox.Show("Ja existeix un usuari amb aquest nom");
            else
                MessageBox.Show("Error en escriure a la base de dades d'usuaris");
        }
    }
}
