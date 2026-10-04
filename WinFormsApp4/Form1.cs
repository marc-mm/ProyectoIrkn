using FlightLib;
using WinFormsApp4;
using static System.Net.WebRequestMethods;

namespace WinFormsApp4
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        FlightPlan flight1;

        FlightPlan flight2;

        private void informacióVolsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            Form2 Vols = new Form2(this);
            Vols.Show();

        }

        public void pon_flight1(FlightPlan f1)
        {
            flight1 = f1;
        }

        public void pon_flight2(FlightPlan f1)
        {
            flight2 = f1;
        }



        private void dadesSimulacióToolStripMenuItem_Click(object sender, EventArgs e)
        {
            Form3 Dades_Sim = new Form3();
            Dades_Sim.Show();
        }
    }
}
