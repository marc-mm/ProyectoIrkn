using FlightLib;

namespace WinFormsApp4
{
    // Finestra per introduir les dades dels dos plans de vol.
    public partial class Introducir_vuelos : Form
    {
        FlightPlan vol1;
        FlightPlan vol2;

        public Introducir_vuelos()
        {
            InitializeComponent();
        }

        // Retorna el primer vol creat, o null si no s'ha acceptat.
        public FlightPlan dame_vol1()
        {
            return vol1;
        }

        // Retorna el segon vol creat, o null si no s'ha acceptat.
        public FlightPlan dame_vol2()
        {
            return vol2;
        }

        // Retorna true si la coordenada c està dins de l'espai aeri (entre 0 i 799).
        private bool CoordenadaCorrecta(double c)
        {
            return c >= 0 && c <= 799;
        }

        // Valida les dades dels dos vols (format, id no buit, velocitat > 0 i coordenades dins
        // de l'espai aeri). Si tot és correcte, crea els dos FlightPlan i tanca.
        private void button1_Click(object sender, EventArgs e)
        {
            string id1 = textBox_ID1.Text;
            string id2 = textBox_ID2.Text;
            double ix1, iy1, fx1, fy1, v1;
            double ix2, iy2, fx2, fy2, v2;

            try
            {
                ix1 = Convert.ToDouble(textBoxCx1.Text);
                iy1 = Convert.ToDouble(textBoxCy1.Text);
                fx1 = Convert.ToDouble(textBoxFx1.Text);
                fy1 = Convert.ToDouble(textBoxFy1.Text);
                v1 = Convert.ToDouble(textBoxV1.Text);

                ix2 = Convert.ToDouble(textBoxCx2.Text);
                iy2 = Convert.ToDouble(textBoxCy2.Text);
                fx2 = Convert.ToDouble(textBoxFx2.Text);
                fy2 = Convert.ToDouble(textBoxFy2.Text);
                v2 = Convert.ToDouble(textBoxV2.Text);
            }
            catch (FormatException)
            {
                MessageBox.Show("Error de format: a les posicions i velocitats només hi poden anar números");
                return;
            }

            if (id1 == "" || id2 == "")
            {
                MessageBox.Show("Has d'escriure l'identificador dels dos vols");
                return;
            }

            if (v1 <= 0 || v2 <= 0)
            {
                MessageBox.Show("La velocitat ha de ser més gran que 0");
                return;
            }

            if (!CoordenadaCorrecta(ix1) || !CoordenadaCorrecta(iy1) || !CoordenadaCorrecta(fx1) || !CoordenadaCorrecta(fy1) ||
                !CoordenadaCorrecta(ix2) || !CoordenadaCorrecta(iy2) || !CoordenadaCorrecta(fx2) || !CoordenadaCorrecta(fy2))
            {
                MessageBox.Show("Les coordenades han d'estar entre 0 i 799");
                return;
            }

            vol1 = new FlightPlan(id1, ix1, iy1, fx1, fy1, v1);
            vol2 = new FlightPlan(id2, ix2, iy2, fx2, fy2, v2);
            Close();
        }
    }
}
