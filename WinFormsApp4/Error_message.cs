using FlightLib;

namespace WinFormsApp4
{
    // Formulari que mostra la informació d'un avió
    public partial class Error_message : Form
    {
        FlightPlan vol;

        public Error_message()
        {
            InitializeComponent();
        }

        public void pon_vol(FlightPlan v)
        {
            vol = v;
        }

        private void Form5_Load(object sender, EventArgs e)
        {
            labelId.Text = "Identificador: " + vol.GetId();
            labelVelocitat.Text = "Velocitat: " + vol.GetVelocidad();
            labelInicial.Text = "Posició inicial: (" + vol.GetInitialPosition().GetX().ToString("0.00") + " , " + vol.GetInitialPosition().GetY().ToString("0.00") + ")";
            labelActual.Text = "Posició actual: (" + vol.GetCurrentPosition().GetX().ToString("0.00") + " , " + vol.GetCurrentPosition().GetY().ToString("0.00") + ")";
            labelFinal.Text = "Posició final: (" + vol.GetFinalPosition().GetX().ToString("0.00") + " , " + vol.GetFinalPosition().GetY().ToString("0.00") + ")";

            if (vol.HasArrived())
                labelArribat.Text = "Ha arribat al destí: Sí";
            else
                labelArribat.Text = "Ha arribat al destí: No";
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}
