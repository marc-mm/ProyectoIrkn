using FlightLib;

namespace WinFormsApp4
{
    // Formulari de la simulació: mostra l'espai aeri i els dos avions
    public partial class Form4 : Form
    {
        // Dades que ens passa el Form1
        FlightPlan vol1;
        FlightPlan vol2;
        double distanciaSeguridad;
        double tiempoCiclo;

        // Un PictureBox per a cada avió (es veuen com un quadrat de color)
        PictureBox avio1 = new PictureBox();
        PictureBox avio2 = new PictureBox();

        public Form4()
        {
            InitializeComponent();
        }

        // Funcions perquè el Form1 ens passi les dades
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

        // Quan s'obre el furmulari creem els dos avions dins del panel
        private void Form4_Load(object sender, EventArgs e)
        {
            // Avió 1 (blau)
            avio1.Width = 20;
            avio1.Height = 20;
            avio1.BackColor = Color.Blue;
            avio1.Tag = 1;                                    // per saber quin avió és quan hi cliquem
            avio1.Click += new System.EventHandler(this.evento); // què passa quan cliquem l'avió
            panel1.Controls.Add(avio1);

            // Avió 2 (verd, així el vermell queda només per avisar de conflicte)
            avio2.Width = 20;
            avio2.Height = 20;
            avio2.BackColor = Color.Green;
            avio2.Tag = 2;
            avio2.Click += new System.EventHandler(this.evento);
            panel1.Controls.Add(avio2);

            // Versió 1: preparem la llista de vols (una fila per vol)
            matriz.ColumnCount = 4;
            matriz.RowCount = 2;
            matriz.RowHeadersVisible = false;
            matriz.Columns[0].HeaderText = "Vol";
            matriz.Columns[1].HeaderText = "Velocitat";
            matriz.Columns[2].HeaderText = "X";
            matriz.Columns[3].HeaderText = "Y";
            // Només es pot canviar la velocitat, la resta és només per mirar
            matriz.Columns[0].ReadOnly = true;
            matriz.Columns[2].ReadOnly = true;
            matriz.Columns[3].ReadOnly = true;
            EscriureVelocitats();

            // Timer per a la simulació automàtica: un cicle cada mig segon
            timer1.Interval = 500;

            // Versió 1: abans de començar avisem si hi haurà conflicte
            // (ConflictoFuturo ja deixa els avions a la posició inicial)
            AvisarConflicte();
            ActualitzarPantalla();
        }

        // Escriu el nom i la velocitat de cada vol a la llista
        private void EscriureVelocitats()
        {
            matriz.Rows[0].Cells[0].Value = vol1.GetId();
            matriz.Rows[0].Cells[1].Value = vol1.GetVelocidad();
            matriz.Rows[1].Cells[0].Value = vol2.GetId();
            matriz.Rows[1].Cells[1].Value = vol2.GetVelocidad();
        }

        // Mira si hi haurà conflicte i ho diu a l'usuari
        private void AvisarConflicte()
        {
            if (vol1.ConflictoFuturo(vol2, distanciaSeguridad, tiempoCiclo))
                MessageBox.Show("Atenció: amb aquestes velocitats HI HAURÀ CONFLICTE.\nPots clicar \"Proposar canvi de velocitat\" o canviar-les tu a la llista.");
            else
                MessageBox.Show("Amb aquestes velocitats no hi haurà cap conflicte");
        }

        // Col·loca els avions on toca i torna a dibuixar el panel
        private void ActualitzarPantalla()
        {
            // El PictureBox es col·loca per la cantonada de dalt a l'esquerra,
            // per això restem 10 (la meitat de 20) perquè l'avió quedi centrat a la seva posició
            int x1 = (int)vol1.GetCurrentPosition().GetX();
            int y1 = (int)vol1.GetCurrentPosition().GetY();
            avio1.Location = new Point(x1 - 10, y1 - 10);

            int x2 = (int)vol2.GetCurrentPosition().GetX();
            int y2 = (int)vol2.GetCurrentPosition().GetY();
            avio2.Location = new Point(x2 - 10, y2 - 10);

            // Mirem si hi ha conflicte entre els dos avions
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

            // Versió 1: distància entre els vols i posicions a la llista
            labelDistancia.Text = "Distància entre els vols: " + vol1.Distance(vol2).ToString("0.00");
            matriz.Rows[0].Cells[2].Value = vol1.GetCurrentPosition().GetX().ToString("0.00");
            matriz.Rows[0].Cells[3].Value = vol1.GetCurrentPosition().GetY().ToString("0.00");
            matriz.Rows[1].Cells[2].Value = vol2.GetCurrentPosition().GetX().ToString("0.00");
            matriz.Rows[1].Cells[3].Value = vol2.GetCurrentPosition().GetY().ToString("0.00");

            // Obliga el panel a tornar-se a dibuixar (s'executa panel1_Paint)
            panel1.Invalidate();
        }

        // Mou els dos avions un cicle (el fan servir el botó i el timer)
        private void MoureUnCicle()
        {
            vol1.Move(tiempoCiclo);
            vol2.Move(tiempoCiclo);
            ActualitzarPantalla();

            if (vol1.HasArrived() && vol2.HasArrived())
            {
                timer1.Stop(); // aturem el timer abans del missatge perquè no surti repetit
                MessageBox.Show("Els dos avions han arribat al destí");
            }
        }

        // Botó "Moure un cicle": simulació pas a pas
        private void button1_Click(object sender, EventArgs e)
        {
            MoureUnCicle();
        }

        // Botó Reiniciar els avions tornen a la posició inicial
        private void button2_Click(object sender, EventArgs e)
        {
            timer1.Stop();
            vol1.Restart();
            vol2.Restart();
            ActualitzarPantalla();
        }

        // Botó "Iniciar": simulació automàtica (el timer mou un cicle a cada tick)
        private void buttonIniciar_Click(object sender, EventArgs e)
        {
            timer1.Start();
        }

        // Botó "Aturar": para la simulació automàtica
        private void buttonAturar_Click(object sender, EventArgs e)
        {
            timer1.Stop();
        }

        // S'executa a cada tick del timer
        private void timer1_Tick(object sender, EventArgs e)
        {
            MoureUnCicle();
        }

        // Versió 1: botó "Aplicar velocitats". Llegeix les velocitats de la llista,
        // les canvia i torna a començar la simulació per comprovar si encara hi ha conflicte
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

            // Tornem a començar des de la posició inicial i avisem si hi haurà conflicte
            AvisarConflicte();
            ActualitzarPantalla();
        }

        // Versió 1: botó "Proposar canvi de velocitat"
        private void buttonProposar_Click(object sender, EventArgs e)
        {
            timer1.Stop();

            // Si no hi ha conflicte no cal proposar res
            if (!vol1.ConflictoFuturo(vol2, distanciaSeguridad, tiempoCiclo))
            {
                MessageBox.Show("No hi haurà conflicte, no cal canviar cap velocitat");
                ActualitzarPantalla();
                return;
            }

            // Primer provem canviant el vol 2. Si no funciona, provem amb el vol 1
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
                // Ensenyem la proposta i preguntem si la volem aplicar
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

            // Els avions tornen a la posició inicial (ConflictoFuturo ja els hi ha deixat)
            ActualitzarPantalla();
        }

        // Prova velocitats noves per al vol v, cada cop una mica més diferents de l'original:
        // 95%, 105%, 90%, 110%, ... fins al 5% i el 195%.
        // Retorna la primera que no té conflicte, o -1 si no en troba cap.
        // Al final deixa al vol la seva velocitat original.
        private double BuscarVelocitat(FlightPlan v)
        {
            double original = v.GetVelocidad();
            double trobada = -1;
            int i = 1;

            while (i <= 19 && trobada == -1)
            {
                // Provem més lent
                v.SetVelocidad(original * (1 - 0.05 * i));
                if (!vol1.ConflictoFuturo(vol2, distanciaSeguridad, tiempoCiclo))
                    trobada = v.GetVelocidad();
                else
                {
                    // Provem més ràpid
                    v.SetVelocidad(original * (1 + 0.05 * i));
                    if (!vol1.ConflictoFuturo(vol2, distanciaSeguridad, tiempoCiclo))
                        trobada = v.GetVelocidad();
                }
                i++;
            }

            v.SetVelocidad(original);
            return trobada;
        }

        // Quan cliquem un avió, obrim un formulari amb la seva informació
        private void evento(object sender, EventArgs e)
        {
            PictureBox p = (PictureBox)sender; // l'avió que hem clicat
            int numero = (int)p.Tag;           // 1 o 2

            Form5 F5 = new Form5();
            if (numero == 1)
                F5.pon_vol(vol1);
            else
                F5.pon_vol(vol2);
            F5.ShowDialog();
        }

        // Aquí dibuixem les línies i les el·lipses. S'executa cada cop que el panel es redibuixa
        private void panel1_Paint(object sender, PaintEventArgs e)
        {
            System.Drawing.Graphics graphics = e.Graphics;
            Pen llapis1 = new Pen(Color.Blue);
            Pen llapis2 = new Pen(Color.Green);

            // Fase 6: línia de l'origen al destí de cada vol
            graphics.DrawLine(llapis1,
                (float)vol1.GetInitialPosition().GetX(), (float)vol1.GetInitialPosition().GetY(),
                (float)vol1.GetFinalPosition().GetX(), (float)vol1.GetFinalPosition().GetY());
            graphics.DrawLine(llapis2,
                (float)vol2.GetInitialPosition().GetX(), (float)vol2.GetInitialPosition().GetY(),
                (float)vol2.GetFinalPosition().GetX(), (float)vol2.GetFinalPosition().GetY());

            // Fase 7: el·lipse (cercle) al voltant de cada avió amb l'avió al centre.
            // El diàmetre és la distància de seguretat, així quan els dos cercles es toquen hi ha conflicte
            float r = (float)(distanciaSeguridad / 2); // radi
            float x1 = (float)vol1.GetCurrentPosition().GetX();
            float y1 = (float)vol1.GetCurrentPosition().GetY();
            float x2 = (float)vol2.GetCurrentPosition().GetX();
            float y2 = (float)vol2.GetCurrentPosition().GetY();

            // Versió 1: si hi ha conflicte, els cercles es dibuixen vermells i més gruixuts
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

            //vol la cantonada de dalt a l'esquerra, l'amplada i l'alçada
            graphics.DrawEllipse(llapisCercle1, x1 - r, y1 - r, 2 * r, 2 * r);
            graphics.DrawEllipse(llapisCercle2, x2 - r, y2 - r, 2 * r, 2 * r);

            llapis1.Dispose();
            llapis2.Dispose();
            llapisCercle1.Dispose();
            llapisCercle2.Dispose();
        }
    }
}
