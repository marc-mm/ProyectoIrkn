using FlightLib;

namespace WinFormsApp4
{
    // Formulari per introduir les dades dels dos plans de vol
    public partial class Form2 : Form
    {
        // Aquí guardem els dos vols perquè el Form1 els pugui llegir
        FlightPlan vol1;
        FlightPlan vol2;

        public Form2()
        {
            InitializeComponent();
        }

        // El Form1 fa servir aquestes funcions per agafar els vols
        // (si l'usuari tanca la finestra sense acceptar, retornen null)
        public FlightPlan dame_vol1()
        {
            return vol1;
        }

        public FlightPlan dame_vol2()
        {
            return vol2;
        }

        // Retorna true si la coordenada està dins de l'espai aeri (de 0 a 500)
        private bool CoordenadaCorrecta(double c)
        {
            return c >= 0 && c <= 799;
        }

        // Botó Acceptar: comprovem les dades i creem els dos vols
        private void button1_Click(object sender, EventArgs e)
        {
            string id1 = textBox_ID1.Text;
            string id2 = textBox_ID2.Text;
            double ix1, iy1, fx1, fy1, v1;
            double ix2, iy2, fx2, fy2, v2;

            // Convertim el text a números. Si no són números, avisem
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

            // L'identificador no pot estar buit
            if (id1 == "" || id2 == "")
            {
                MessageBox.Show("Has d'escriure l'identificador dels dos vols");
                return;
            }

            // La velocitat ha de ser més gran que 0
            if (v1 <= 0 || v2 <= 0)
            {
                MessageBox.Show("La velocitat ha de ser més gran que 0");
                return;
            }

            // Totes les coordenades han d'estar entre 0 i 500
            if (!CoordenadaCorrecta(ix1) || !CoordenadaCorrecta(iy1) || !CoordenadaCorrecta(fx1) || !CoordenadaCorrecta(fy1) ||
                !CoordenadaCorrecta(ix2) || !CoordenadaCorrecta(iy2) || !CoordenadaCorrecta(fx2) || !CoordenadaCorrecta(fy2))
            {
                MessageBox.Show("Les coordenades han d'estar entre 0 i 500");
                return;
            }

            // Tot correcte: creem els dos objectes FlightPlan i tanquem
            vol1 = new FlightPlan(id1, ix1, iy1, fx1, fy1, v1);
            vol2 = new FlightPlan(id2, ix2, iy2, fx2, fy2, v2);
            Close();
        }
    }
}
