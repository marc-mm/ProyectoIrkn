using FlightLib;

namespace WinFormsApp4
{
    // Formulari principal: té el menú i guarda totes les dades de la simulació
    public partial class Programa_principal : Form
    {
        // Dades que necessitem per a la simulació
        FlightPlan vol1;
        FlightPlan vol2;
        double distanciaSeguridad = 0;
        double tiempoCiclo = 0;

        public Programa_principal()
        {
            InitializeComponent();
        }

        // Opció 1 del menú: introduir les dades dels dos vols
        private void menuVols_Click(object sender, EventArgs e)
        {
            Introducir_vuelos F2 = new Introducir_vuelos();
            F2.ShowDialog(); // el programa s'espera aquí fins que es tanca el Form2

            // Si l'usuari ha acceptat dades correctes, les guardem
            if (F2.dame_vol1() != null)
            {
                vol1 = F2.dame_vol1();
                vol2 = F2.dame_vol2();
            }
        }

        // Opció 2 del menú: introduir la distància de seguretat i el temps de cicle
        private void menuDades_Click(object sender, EventArgs e)
        {
            Introducir_Parametros_Simulacion F3 = new Introducir_Parametros_Simulacion();
            F3.ShowDialog();

            // Si les dades són correctes (més grans que 0), les guardem
            if (F3.dame_distancia() > 0)
            {
                distanciaSeguridad = F3.dame_distancia();
                tiempoCiclo = F3.dame_ciclo();
            }
        }

        // Opció 3 del menú: obrir la simulació
        private void menuSimulacio_Click(object sender, EventArgs e)
        {
            // Comprovem que abans s'han introduït totes les dades
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

            // Passem les dades al formulari de simulació i l'obrim
            Ventana_simulacion F4 = new Ventana_simulacion();
            F4.pon_vols(vol1, vol2);
            F4.pon_distancia(distanciaSeguridad);
            F4.pon_ciclo(tiempoCiclo);
            F4.ShowDialog();
        }
    }
}
