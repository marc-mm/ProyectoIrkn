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

        // Quan s'obre el formulari creem els dos avions dins del panel (Fase 3)
        private void Form4_Load(object sender, EventArgs e)
        {
            // Avió 1 (blau)
            avio1.Width = 20;
            avio1.Height = 20;
            avio1.BackColor = Color.Blue;
            avio1.Tag = 1;                                    // per saber quin avió és quan hi cliquem
            avio1.Click += new System.EventHandler(this.evento); // què passa quan cliquem l'avió
            panel1.Controls.Add(avio1);

            // Avió 2 (vermell)
            avio2.Width = 20;
            avio2.Height = 20;
            avio2.BackColor = Color.Red;
            avio2.Tag = 2;
            avio2.Click += new System.EventHandler(this.evento);
            panel1.Controls.Add(avio2);

            // Posem els avions a la posició inicial
            ActualitzarPantalla();
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
                labelConflicte.Text = "CONFLICTE!";
            else
                labelConflicte.Text = "Sense conflicte";

            // Obliga el panel a tornar-se a dibuixar (s'executa panel1_Paint)
            panel1.Invalidate();
        }

        // Botó "Moure un cicle": els dos avions es mouen un cicle (Fase 4)
        private void button1_Click(object sender, EventArgs e)
        {
            vol1.Move(tiempoCiclo);
            vol2.Move(tiempoCiclo);
            ActualitzarPantalla();

            if (vol1.HasArrived() && vol2.HasArrived())
                MessageBox.Show("Els dos avions han arribat al destí");
        }

        // Botó "Reiniciar": els avions tornen a la posició inicial
        private void button2_Click(object sender, EventArgs e)
        {
            vol1.Restart();
            vol2.Restart();
            ActualitzarPantalla();
        }

        // Quan cliquem un avió, obrim un formulari amb la seva informació (Fase 5)
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
            Pen llapis2 = new Pen(Color.Red);

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

            // DrawEllipse vol la cantonada de dalt a l'esquerra, l'amplada i l'alçada
            graphics.DrawEllipse(llapis1, x1 - r, y1 - r, 2 * r, 2 * r);
            graphics.DrawEllipse(llapis2, x2 - r, y2 - r, 2 * r, 2 * r);

            llapis1.Dispose();
            llapis2.Dispose();
        }
    }
}
