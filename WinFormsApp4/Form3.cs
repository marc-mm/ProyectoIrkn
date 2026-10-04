namespace WinFormsApp4
{
    // Formulari per introduir la distància de seguretat i el temps de cicle
    public partial class Form3 : Form
    {
        // Valors que el Form1 llegirà (si l'usuari no accepta, es queden a 0)
        double distanciaSeguridad = 0;
        double tiempoCiclo = 0;

        public Form3()
        {
            InitializeComponent();
        }

        // El Form1 fa servir aquestes funcions per llegir els valors
        public double dame_distancia()
        {
            return distanciaSeguridad;
        }

        public double dame_ciclo()
        {
            return tiempoCiclo;
        }

        // Botó Acceptar: comprovem les dades
        private void button1_Click(object sender, EventArgs e)
        {
            double distancia;
            double ciclo;

            // Si no són números, avisem
            try
            {
                distancia = Convert.ToDouble(textBoxDistancia.Text);
                ciclo = Convert.ToDouble(textBoxCiclo.Text);
            }
            catch (FormatException)
            {
                MessageBox.Show("Error de format: escriu només números");
                return;
            }

            // Han de ser més grans que 0
            if (distancia <= 0 || ciclo <= 0)
            {
                MessageBox.Show("Els valors han de ser més grans que 0");
                return;
            }

            // Tot correcte: guardem i tanquem
            distanciaSeguridad = distancia;
            tiempoCiclo = ciclo;
            Close();
        }
    }
}
