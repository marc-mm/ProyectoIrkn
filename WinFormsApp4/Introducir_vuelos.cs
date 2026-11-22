using FlightLib;

namespace WinFormsApp4
{
    // Formulari per introduir plans de vol a mà. A l'esquerra s'escriuen les dades d'un vol
    // i a la dreta es veu la llista de plans de vol que ja hi ha.
    public partial class Introducir_vuelos : Form
    {
        // Llista on s'afegeixen els vols (és la mateixa del formulari principal)
        FlightPlanList vuelos;

        public Introducir_vuelos()
        {
            InitializeComponent();
        }

        // Rep la llista de vols on s'afegiran els nous. Cal cridar-la abans d'obrir la finestra.
        public void pon_vuelos(FlightPlanList vuelos)
        {
            this.vuelos = vuelos;
        }

        // Prepara les columnes de la taula i hi mostra els vols que ja hi ha.
        private void Introducir_vuelos_Load(object sender, EventArgs e)
        {
            tablaVuelos.ColumnCount = 5;
            tablaVuelos.RowHeadersVisible = false;
            tablaVuelos.Columns[0].HeaderText = "ID";
            tablaVuelos.Columns[1].HeaderText = "Companyia";
            tablaVuelos.Columns[2].HeaderText = "Inicial";
            tablaVuelos.Columns[3].HeaderText = "Final";
            tablaVuelos.Columns[4].HeaderText = "Velocitat";
            MostrarVuelos();
        }

        // Omple la taula amb tots els plans de vol de la llista.
        private void MostrarVuelos()
        {
            tablaVuelos.Rows.Clear();
            int i = 0;
            while (i < vuelos.GetNumber())
            {
                FlightPlan vuelo = vuelos.GetFlightPlan(i);
                string inicial = "(" + vuelo.GetInitialPosition().GetX() + " , " + vuelo.GetInitialPosition().GetY() + ")";
                string final = "(" + vuelo.GetFinalPosition().GetX() + " , " + vuelo.GetFinalPosition().GetY() + ")";
                tablaVuelos.Rows.Add(vuelo.GetId(), vuelo.GetCompania(), inicial, final, vuelo.GetVelocidad());
                i++;
            }
            tablaVuelos.ClearSelection();
        }

        // Retorna true si la coordenada està dins de l'espai aeri (de 0 a 799)
        private bool CoordenadaCorrecta(double c)
        {
            return c >= 0 && c <= 799;
        }

        // Botó Afegir: comprovem les dades, creem el vol, l'afegim a la llista i buidem els camps
        private void button1_Click(object sender, EventArgs e)
        {
            string id1 = textBox_ID1.Text;
            string compania1 = textBox_Compania1.Text;
            double ix1, iy1, fx1, fy1, v1;

            // Convertim el text a números. Si no són números, avisem
            try
            {
                ix1 = Convert.ToDouble(textBoxCx1.Text);
                iy1 = Convert.ToDouble(textBoxCy1.Text);
                fx1 = Convert.ToDouble(textBoxFx1.Text);
                fy1 = Convert.ToDouble(textBoxFy1.Text);
                v1 = Convert.ToDouble(textBoxV1.Text);
            }
            catch (FormatException)
            {
                MessageBox.Show("Error de format: a les posicions i velocitats només hi poden anar números");
                return;
            }

            // L'identificador i la companyia no poden estar buits ni tenir espais
            // (al fitxer de vols els camps se separen amb espais)
            if (id1 == "" || compania1 == "" || id1.Contains(" ") || compania1.Contains(" "))
            {
                MessageBox.Show("Has d'escriure l'identificador i la companyia del vol, sense espais");
                return;
            }

            // La velocitat ha de ser més gran que 0
            if (v1 <= 0)
            {
                MessageBox.Show("La velocitat ha de ser més gran que 0");
                return;
            }

            // Totes les coordenades han d'estar entre 0 i 799
            if (!CoordenadaCorrecta(ix1) || !CoordenadaCorrecta(iy1) || !CoordenadaCorrecta(fx1) || !CoordenadaCorrecta(fy1))
            {
                MessageBox.Show("Les coordenades han d'estar entre 0 i 799");
                return;
            }

            // Tot correcte: creem el FlightPlan, l'afegim i el mostrem a la llista
            vuelos.AddFlightPlan(new FlightPlan(id1, compania1, ix1, iy1, fx1, fy1, v1));
            MostrarVuelos();

            textBox_ID1.Text = "";
            textBox_Compania1.Text = "";
            textBoxCx1.Text = "";
            textBoxCy1.Text = "";
            textBoxFx1.Text = "";
            textBoxFy1.Text = "";
            textBoxV1.Text = "";
        }

        private void buttonTancar_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}
