using FlightLib;

namespace WinFormsApp4
{
    // Finestra principal: menú de l'aplicació i dades de la simulació.
    public partial class Programa_principal : Form
    {
        FlightPlan vol1;
        FlightPlan vol2;
        double distanciaSeguridad = 0;
        double tiempoCiclo = 0;

        public Programa_principal()
        {
            InitializeComponent();
        }

        // Obre la finestra d'introduir vols i, si s'han acceptat, guarda els dos vols.
        private void menuVols_Click(object sender, EventArgs e)
        {
            Introducir_vuelos F2 = new Introducir_vuelos();
            F2.ShowDialog();

            if (F2.dame_vol1() != null)
            {
                vol1 = F2.dame_vol1();
                vol2 = F2.dame_vol2();
            }
        }

        // Obre la finestra de paràmetres i, si s'han acceptat, guarda la distància de seguretat i el temps de cicle.
        private void menuDades_Click(object sender, EventArgs e)
        {
            Introducir_Parametros_Simulacion F3 = new Introducir_Parametros_Simulacion();
            F3.ShowDialog();

            if (F3.dame_distancia() > 0)
            {
                distanciaSeguridad = F3.dame_distancia();
                tiempoCiclo = F3.dame_ciclo();
            }
        }

        // Comprova que s'hagin introduït totes les dades i obre la simulació amb elles.
        private void menuSimulacio_Click(object sender, EventArgs e)
        {
            if (vol1 == null || vol2 == null)
            {
                MessageBox.Show("Primer has d'introduir les dades dels vols");
                return;
            }
            if (distanciaSeguridad <= 0 || tiempoCiclo <= 0)
            {
                MessageBox.Show("Primer has d'introduir la distància de seguretat i el temps de cicle");
                return;
            }

            Ventana_simulacion F4 = new Ventana_simulacion();
            F4.pon_vols(vol1, vol2);
            F4.pon_distancia(distanciaSeguridad);
            F4.pon_ciclo(tiempoCiclo);
            F4.ShowDialog();
        }
    }
}
