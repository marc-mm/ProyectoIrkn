using FlightLib;

namespace WinFormsApp4
{
    // Formulari que mostra la informació d'un avió (s'obre quan cliquem l'avió)
    public partial class Form5 : Form
    {
        FlightPlan vol; // el vol que hem de mostrar

        public Form5()
        {
            InitializeComponent();
        }

        // El Form4 ens passa el vol amb aquesta funció
        public void pon_vol(FlightPlan v)
        {
            vol = v;
        }

        // Quan s'obre el formulari escrivim les dades a les etiquetes
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

        // Botó Tancar
        private void button1_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}
