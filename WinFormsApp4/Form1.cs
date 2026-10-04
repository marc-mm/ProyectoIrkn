using WinFormsApp4;

namespace WinFormsApp4
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void informacióVolsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            Form2 Vols = new Form2();
            Vols.Show();

        }

        private void dadesSimulacióToolStripMenuItem_Click(object sender, EventArgs e)
        {
            Form3 Dades_Sim = new Form3();
        }
    }
}
