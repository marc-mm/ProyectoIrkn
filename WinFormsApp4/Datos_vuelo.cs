using FlightLib;

namespace WinFormsApp4
{
    // Finestra que mostra les dades d'un vol i la seva distància a la resta de vols.
    public partial class Datos_vuelo : Form
    {
        FlightPlanList vuelos;
        int indice;

        public Datos_vuelo()
        {
            InitializeComponent();
        }

        // Rep la llista de vols i la posició del vol que s'ha de mostrar. Cal cridar-la abans d'obrir la finestra.
        public void pon_vuelo(FlightPlanList vuelos, int indice)
        {
            this.vuelos = vuelos;
            this.indice = indice;
        }

        // Omple les etiquetes amb les dades del vol i la taula amb les distàncies als altres vols.
        private void Datos_vuelo_Load(object sender, EventArgs e)
        {
            FlightPlan vuelo = vuelos.GetFlightPlan(indice);
            labelId.Text = "Identificador: " + vuelo.GetId();
            labelCompania.Text = "Companyia: " + vuelo.GetCompania();
            labelVelocitat.Text = "Velocitat: " + vuelo.GetVelocidad().ToString("0.00");
            labelInicial.Text = "Posició inicial: (" + vuelo.GetInitialPosition().GetX().ToString("0.00") + " , " + vuelo.GetInitialPosition().GetY().ToString("0.00") + ")";
            labelActual.Text = "Posició actual: (" + vuelo.GetCurrentPosition().GetX().ToString("0.00") + " , " + vuelo.GetCurrentPosition().GetY().ToString("0.00") + ")";
            labelFinal.Text = "Posició final: (" + vuelo.GetFinalPosition().GetX().ToString("0.00") + " , " + vuelo.GetFinalPosition().GetY().ToString("0.00") + ")";

            if (vuelo.HasArrived())
                labelArribat.Text = "Ha arribat al destí: Sí";
            else
                labelArribat.Text = "Ha arribat al destí: No";

            tablaDistancias.ColumnCount = 2;
            tablaDistancias.RowHeadersVisible = false;
            tablaDistancias.Columns[0].HeaderText = "Vol";
            tablaDistancias.Columns[1].HeaderText = "Distància";

            int i = 0;
            while (i < vuelos.GetNumber())
            {
                if (i != indice)
                {
                    FlightPlan otro = vuelos.GetFlightPlan(i);
                    tablaDistancias.Rows.Add(otro.GetId(), vuelo.Distance(otro).ToString("0.00"));
                }
                i++;
            }
        }

        private void buttonTancar_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}
