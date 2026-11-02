using FlightLib;

namespace WinFormsApp4
{
    // Finestra de simulació: mostra l'espai aeri amb els dos avions i permet moure'ls i canviar-ne la velocitat.
    public partial class Ventana_simulacion : Form
    {
        FlightPlan vol1;
        FlightPlan vol2;
        double distanciaSeguridad;
        double tiempoCiclo;

        PictureBox avio1 = new PictureBox();
        PictureBox avio2 = new PictureBox();

        public Ventana_simulacion()
        {
            InitializeComponent();
        }

        // pon_vols, pon_distancia i pon_ciclo reben les dades de la simulació abans d'obrir la finestra.
        public void pon_vols(FlightPlan v1, FlightPlan v2)
        {
            vol1 = v1;
            vol2 = v2;
        }

        public void pon_distancia(double d)
        {
            distanciaSeguridad = d;
        }

        public void pon_ciclo(double c)
        {
            tiempoCiclo = c;
        }

        // Crea els avions al panel, configura la taula (només la velocitat és editable) i el timer,
        // avisa si hi haurà conflicte i dibuixa l'estat inicial.
        private void Form4_Load(object sender, EventArgs e)
        {
            // El Tag identifica quin avió s'ha clicat a evento()
            avio1.Width = 20;
            avio1.Height = 20;
            avio1.BackColor = Color.Blue;
            avio1.Tag = 1;
            avio1.Click += new System.EventHandler(this.evento);
            panel1.Controls.Add(avio1);

            avio2.Width = 20;
            avio2.Height = 20;
            avio2.BackColor = Color.Green;
            avio2.Tag = 2;
            avio2.Click += new System.EventHandler(this.evento);
            panel1.Controls.Add(avio2);
            panel1.BackColor = Color.Black ;

            matriz.ColumnCount = 4;
            matriz.RowCount = 2;
            matriz.RowHeadersVisible = false;
            matriz.Columns[0].HeaderText = "Vol";
            matriz.Columns[1].HeaderText = "Velocitat";
            matriz.Columns[2].HeaderText = "X";
            matriz.Columns[3].HeaderText = "Y";
            matriz.Columns[0].ReadOnly = true;
            matriz.Columns[2].ReadOnly = true;
            matriz.Columns[3].ReadOnly = true;
            EscriureVelocitats();
            timer1.Interval = 500;

            AvisarConflicte();
            ActualitzarPantalla();
        }

        // Escriu l'id i la velocitat de cada vol a la taula.
        private void EscriureVelocitats()
        {
            matriz.Rows[0].Cells[0].Value = vol1.GetId();
            matriz.Rows[0].Cells[1].Value = vol1.GetVelocidad();
            matriz.Rows[1].Cells[0].Value = vol2.GetId();
            matriz.Rows[1].Cells[1].Value = vol2.GetVelocidad();
        }

        // Mostra un missatge indicant si amb les velocitats actuals hi haurà conflicte.
        private void AvisarConflicte()
        {
            if (vol1.ConflictoFuturo(vol2, distanciaSeguridad, tiempoCiclo))
                MessageBox.Show("Atenció: amb aquestes velocitats HI HAURÀ CONFLICTE.\nPots clicar \"Proposar canvi de velocitat\" o canviar-les tu a la llista.");
            else
                MessageBox.Show("Amb aquestes velocitats no hi haurà cap conflicte");
        }

        // Actualitza la posició dels avions, l'estat de conflicte, la distància i la taula, i redibuixa el panel.
        private void ActualitzarPantalla()
        {
            // Es resta 10 per centrar el quadrat de 20x20 sobre la posició
            int x1 = (int)vol1.GetCurrentPosition().GetX();
            int y1 = (int)vol1.GetCurrentPosition().GetY();
            avio1.Location = new Point(x1 - 10, y1 - 10);

            int x2 = (int)vol2.GetCurrentPosition().GetX();
            int y2 = (int)vol2.GetCurrentPosition().GetY();
            avio2.Location = new Point(x2 - 10, y2 - 10);

            if (vol1.Conflicto(vol2, distanciaSeguridad))
            {
                labelConflicte.Text = "CONFLICTE!";
                labelConflicte.ForeColor = Color.Red;
            }
            else
            {
                labelConflicte.Text = "Sense conflicte";
                labelConflicte.ForeColor = Color.Black;
            }

            labelDistancia.Text = "Distància entre els vols: " + vol1.Distance(vol2).ToString("0.00");
            matriz.Rows[0].Cells[2].Value = vol1.GetCurrentPosition().GetX().ToString("0.00");
            matriz.Rows[0].Cells[3].Value = vol1.GetCurrentPosition().GetY().ToString("0.00");
            matriz.Rows[1].Cells[2].Value = vol2.GetCurrentPosition().GetX().ToString("0.00");
            matriz.Rows[1].Cells[3].Value = vol2.GetCurrentPosition().GetY().ToString("0.00");

            panel1.Invalidate();
        }

        // Mou els dos avions un cicle i atura el timer quan tots dos han arribat.
        private void MoureUnCicle()
        {
            vol1.Move(tiempoCiclo);
            vol2.Move(tiempoCiclo);
            ActualitzarPantalla();

            if (vol1.HasArrived() && vol2.HasArrived())
            {
                timer1.Stop();
                MessageBox.Show("Els dos avions han arribat al destí");
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            MoureUnCicle();
        }

        // Atura la simulació i torna els avions a la posició inicial.
        private void button2_Click(object sender, EventArgs e)
        {
            timer1.Stop();
            vol1.Restart();
            vol2.Restart();
            ActualitzarPantalla();
        }

        private void buttonIniciar_Click(object sender, EventArgs e)
        {
            timer1.Start();
        }

        private void buttonAturar_Click(object sender, EventArgs e)
        {
            timer1.Stop();
        }

        private void timer1_Tick(object sender, EventArgs e)
        {
            MoureUnCicle();
        }

        // Llegeix les velocitats de la taula, les valida (numèriques i > 0) i les aplica als vols.
        // Com que ConflictoFuturo reinicia els avions, la simulació torna a començar.
        private void buttonAplicar_Click(object sender, EventArgs e)
        {
            double v1, v2;
            try
            {
                v1 = Convert.ToDouble(matriz.Rows[0].Cells[1].Value);
                v2 = Convert.ToDouble(matriz.Rows[1].Cells[1].Value);
            }
            catch (FormatException)
            {
                MessageBox.Show("Error de format: la velocitat ha de ser un número");
                return;
            }

            if (v1 <= 0 || v2 <= 0)
            {
                MessageBox.Show("La velocitat ha de ser més gran que 0");
                return;
            }

            timer1.Stop();
            vol1.SetVelocidad(v1);
            vol2.SetVelocidad(v2);

            AvisarConflicte();
            ActualitzarPantalla();
        }

        // Si hi haurà conflicte, busca una velocitat que l'eviti (primer canviant el vol 2 i, si no,
        // el vol 1) i pregunta a l'usuari si la vol aplicar.
        private void buttonProposar_Click(object sender, EventArgs e)
        {
            timer1.Stop();

            if (!vol1.ConflictoFuturo(vol2, distanciaSeguridad, tiempoCiclo))
            {
                MessageBox.Show("No hi haurà conflicte, no cal canviar cap velocitat");
                ActualitzarPantalla();
                return;
            }

            FlightPlan volACanviar = vol2;
            double nova = BuscarVelocitat(vol2);
            if (nova == -1)
            {
                volACanviar = vol1;
                nova = BuscarVelocitat(vol1);
            }

            if (nova == -1)
            {
                MessageBox.Show("No he trobat cap canvi de velocitat que eviti el conflicte");
            }
            else
            {
                DialogResult resposta = MessageBox.Show(
                    "Proposta: canviar la velocitat del vol " + volACanviar.GetId() +
                    " de " + volACanviar.GetVelocidad().ToString("0.00") + " a " + nova.ToString("0.00") +
                    ".\nVols aplicar-la?", "Proposta", MessageBoxButtons.YesNo);

                if (resposta == DialogResult.Yes)
                {
                    volACanviar.SetVelocidad(nova);
                    EscriureVelocitats();
                    MessageBox.Show("Velocitat canviada. Ara ja no hi haurà conflicte");
                }
            }

            ActualitzarPantalla();
        }

        // Busca una velocitat per al vol v que eviti el conflicte, provant variacions del 5% en 5%
        // (alternant més lent i més ràpid) fins a ±95%. Retorna la velocitat trobada o -1 si no n'hi ha cap.
        // La velocitat original de v no es modifica.
        private double BuscarVelocitat(FlightPlan v)
        {
            double original = v.GetVelocidad();
            double trobada = -1;
            int i = 1;

            while (i <= 19 && trobada == -1)
            {
                v.SetVelocidad(original * (1 - 0.05 * i));
                if (!vol1.ConflictoFuturo(vol2, distanciaSeguridad, tiempoCiclo))
                    trobada = v.GetVelocidad();
                else
                {
                    v.SetVelocidad(original * (1 + 0.05 * i));
                    if (!vol1.ConflictoFuturo(vol2, distanciaSeguridad, tiempoCiclo))
                        trobada = v.GetVelocidad();
                }
                i++;
            }

            v.SetVelocidad(original);
            return trobada;
        }

        // En clicar un avió, obre una finestra amb la informació del seu vol.
        private void evento(object sender, EventArgs e)
        {
            PictureBox p = (PictureBox)sender;
            int numero = (int)p.Tag;

            Error_message F5 = new Error_message();
            if (numero == 1)
                F5.pon_vol(vol1);
            else
                F5.pon_vol(vol2);
            F5.ShowDialog();
        }

        // Dibuixa la ruta de cada vol i un cercle al voltant de cada avió (vermell si hi ha conflicte).
        private void panel1_Paint(object sender, PaintEventArgs e)
        {
            System.Drawing.Graphics graphics = e.Graphics;
            Pen llapis1 = new Pen(Color.Blue);
            Pen llapis2 = new Pen(Color.Green);

            graphics.DrawLine(llapis1,
                (float)vol1.GetInitialPosition().GetX(), (float)vol1.GetInitialPosition().GetY(),
                (float)vol1.GetFinalPosition().GetX(), (float)vol1.GetFinalPosition().GetY());
            graphics.DrawLine(llapis2,
                (float)vol2.GetInitialPosition().GetX(), (float)vol2.GetInitialPosition().GetY(),
                (float)vol2.GetFinalPosition().GetX(), (float)vol2.GetFinalPosition().GetY());

            // Radi = meitat de la distància de seguretat: els cercles es toquen just quan hi ha conflicte
            float r = (float)(distanciaSeguridad / 2);
            float x1 = (float)vol1.GetCurrentPosition().GetX();
            float y1 = (float)vol1.GetCurrentPosition().GetY();
            float x2 = (float)vol2.GetCurrentPosition().GetX();
            float y2 = (float)vol2.GetCurrentPosition().GetY();

            Pen llapisCercle1;
            Pen llapisCercle2;
            if (vol1.Conflicto(vol2, distanciaSeguridad))
            {
                llapisCercle1 = new Pen(Color.Red, 3);
                llapisCercle2 = new Pen(Color.Red, 3);
            }
            else
            {
                llapisCercle1 = new Pen(Color.Blue);
                llapisCercle2 = new Pen(Color.Green);
            }

            graphics.DrawEllipse(llapisCercle1, x1 - r, y1 - r, 2 * r, 2 * r);
            graphics.DrawEllipse(llapisCercle2, x2 - r, y2 - r, 2 * r, 2 * r);

            llapis1.Dispose();
            llapis2.Dispose();
            llapisCercle1.Dispose();
            llapisCercle2.Dispose();
        }
    }
}
