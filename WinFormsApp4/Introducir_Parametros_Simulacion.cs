namespace WinFormsApp4
{
    // Finestra per introduir la distància de seguretat i el temps de cicle.
    public partial class Introducir_Parametros_Simulacion : Form
    {
        double distanciaSeguridad = 0;
        double tiempoCiclo = 0;

        public Introducir_Parametros_Simulacion()
        {
            InitializeComponent();
        }

        // Retorna la distància de seguretat introduïda (0 si no s'ha acceptat).
        public double dame_distancia()
        {
            return distanciaSeguridad;
        }

        // Retorna el temps de cicle introduït (0 si no s'ha acceptat).
        public double dame_ciclo()
        {
            return tiempoCiclo;
        }

        // Valida que els dos valors siguin números més grans que 0; si ho són, els guarda i tanca.
        private void buttonAcceptar_Click(object sender, EventArgs e)
        {
            double distancia;
            double ciclo;

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

            if (distancia <= 0 || ciclo <= 0)
            {
                MessageBox.Show("Els valors han de ser més grans que 0");
                return;
            }

            distanciaSeguridad = distancia;
            tiempoCiclo = ciclo;
            Close();
        }
    }
}
