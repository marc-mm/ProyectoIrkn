using FlightLib;

namespace WinFormsApp4
{
    // Finestra de simulació: mostra l'espai aeri amb tots els avions i permet moure'ls, desfer passos,
    // canviar-ne la velocitat i guardar la simulació en un fitxer.
    public partial class Ventana_simulacion : Form
    {
        FlightPlanList vuelos;
        double distanciaSeguridad;
        double tiempoCiclo;

        List<PictureBox> aviones = new List<PictureBox>();
        Color[] colores = { Color.DodgerBlue, Color.LimeGreen, Color.Orange, Color.Magenta, Color.Cyan, Color.Yellow, Color.White, Color.HotPink };

        public Ventana_simulacion()
        {
            InitializeComponent();
        }

        // pon_vuelos, pon_distancia i pon_ciclo reben les dades de la simulació abans d'obrir la finestra.
        public void pon_vuelos(FlightPlanList vuelos)
        {
            this.vuelos = vuelos;
        }

        public void pon_distancia(double d)
        {
            distanciaSeguridad = d;
        }

        public void pon_ciclo(double c)
        {
            tiempoCiclo = c;
        }

        // Crea un quadrat per a cada avió, prepara la taula (només la velocitat és editable),
        // avisa dels conflictes que hi haurà i dibuixa l'estat inicial.
        private void Ventana_simulacion_Load(object sender, EventArgs e)
        {
            panel1.BackColor = Color.Black;

            // El Tag guarda la posició del vol a la llista per saber quin avió s'ha clicat a evento()
            int i = 0;
            while (i < vuelos.GetNumber())
            {
                PictureBox avion = new PictureBox();
                avion.Width = 20;
                avion.Height = 20;
                avion.BackColor = ColorVuelo(i);
                avion.Tag = i;
                avion.Click += new System.EventHandler(this.evento);
                panel1.Controls.Add(avion);
                aviones.Add(avion);
                i++;
            }

            matriz.ColumnCount = 5;
            matriz.RowCount = vuelos.GetNumber();
            matriz.RowHeadersVisible = false;
            matriz.Columns[0].HeaderText = "Vol";
            matriz.Columns[1].HeaderText = "Companyia";
            matriz.Columns[2].HeaderText = "Velocitat";
            matriz.Columns[3].HeaderText = "X";
            matriz.Columns[4].HeaderText = "Y";
            matriz.Columns[0].ReadOnly = true;
            matriz.Columns[1].ReadOnly = true;
            matriz.Columns[3].ReadOnly = true;
            matriz.Columns[4].ReadOnly = true;
            EscriureVelocitats();
            timer1.Interval = 500;

            AvisarConflictes();
            ActualitzarPantalla();
        }

        // Retorna el color amb què es dibuixa el vol de la posició i.
        private Color ColorVuelo(int i)
        {
            return colores[i % colores.Length];
        }

        // Escriu l'id, la companyia i la velocitat de cada vol a la taula.
        private void EscriureVelocitats()
        {
            int i = 0;
            while (i < vuelos.GetNumber())
            {
                FlightPlan vuelo = vuelos.GetFlightPlan(i);
                matriz.Rows[i].Cells[0].Value = vuelo.GetId();
                matriz.Rows[i].Cells[1].Value = vuelo.GetCompania();
                matriz.Rows[i].Cells[2].Value = vuelo.GetVelocidad();
                i++;
            }
        }

        // Mostra un missatge amb les parelles de vols que tindran conflicte amb les velocitats actuals.
        // Deixa la simulació reiniciada.
        private void AvisarConflictes()
        {
            string conflictos = vuelos.ConflictosFuturos(distanciaSeguridad, tiempoCiclo);
            if (conflictos == "")
                MessageBox.Show("Amb aquestes velocitats no hi haurà cap conflicte");
            else
                MessageBox.Show("Atenció: amb aquestes velocitats HI HAURÀ CONFLICTE entre:\n" + conflictos +
                    "\nPots clicar \"Proposar canvis de velocitat\" o canviar-les tu a la llista.");
        }

        // Actualitza la posició dels avions, la taula i l'avís de conflicte, i redibuixa el panel.
        private void ActualitzarPantalla()
        {
            int i = 0;
            while (i < vuelos.GetNumber())
            {
                Position actual = vuelos.GetFlightPlan(i).GetCurrentPosition();
                // Es resta 10 per centrar el quadrat de 20x20 sobre la posició
                aviones[i].Location = new Point((int)actual.GetX() - 10, (int)actual.GetY() - 10);

                matriz.Rows[i].Cells[3].Value = actual.GetX().ToString("0.00");
                matriz.Rows[i].Cells[4].Value = actual.GetY().ToString("0.00");
                if (vuelos.EnConflicto(i, distanciaSeguridad))
                    matriz.Rows[i].DefaultCellStyle.BackColor = Color.LightCoral;
                else
                    matriz.Rows[i].DefaultCellStyle.BackColor = Color.White;
                i++;
            }

            string conflictos = vuelos.ConflictosActuales(distanciaSeguridad);
            if (conflictos == "")
            {
                labelConflicte.Text = "Sense conflicte";
                labelConflicte.ForeColor = Color.Green;
            }
            else
            {
                labelConflicte.Text = "CONFLICTE! " + conflictos;
                labelConflicte.ForeColor = Color.Red;
            }

            panel1.Invalidate();
        }

        // Mou tots els avions un cicle. Quan tots han arribat atura el timer i ho avisa.
        private void MoureUnCicle()
        {
            if (vuelos.TodosHanLlegado())
            {
                timer1.Stop();
                MessageBox.Show("Tots els avions ja són al destí");
                return;
            }

            vuelos.Move(tiempoCiclo);
            ActualitzarPantalla();

            if (vuelos.TodosHanLlegado())
            {
                timer1.Stop();
                MessageBox.Show("Tots els avions han arribat al destí");
            }
        }

        private void buttonMoure_Click(object sender, EventArgs e)
        {
            MoureUnCicle();
        }

        // Torna els avions a la posició que tenien abans de l'últim cicle.
        private void buttonDesfer_Click(object sender, EventArgs e)
        {
            timer1.Stop();
            if (!vuelos.Deshacer())
                MessageBox.Show("No hi ha cap pas per desfer");
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

        // Atura la simulació i torna els avions a la posició inicial.
        private void buttonReiniciar_Click(object sender, EventArgs e)
        {
            timer1.Stop();
            vuelos.Restart();
            ActualitzarPantalla();
        }

        // Deixa triar un fitxer i hi guarda els vols amb la posició actual, per poder continuar la simulació més endavant.
        private void buttonGuardar_Click(object sender, EventArgs e)
        {
            timer1.Stop();
            SaveFileDialog dialogo = new SaveFileDialog();
            dialogo.Filter = "Fitxers de text (*.txt)|*.txt";
            if (dialogo.ShowDialog() != DialogResult.OK)
                return;

            if (vuelos.GuardarFichero(dialogo.FileName) == 0)
                MessageBox.Show("Vols guardats. Carrega aquest fitxer més endavant per continuar la simulació des d'aquest punt");
            else
                MessageBox.Show("No s'ha pogut guardar el fitxer");
        }

        // Llegeix les velocitats de la taula, comprova que siguin números més grans que 0 i les aplica als vols.
        // Després reinicia la simulació i avisa dels conflictes que hi haurà.
        private void buttonAplicar_Click(object sender, EventArgs e)
        {
            matriz.EndEdit();
            List<double> velocidades = new List<double>();
            int i = 0;
            try
            {
                while (i < vuelos.GetNumber())
                {
                    double v = Convert.ToDouble(matriz.Rows[i].Cells[2].Value);
                    if (v <= 0)
                    {
                        MessageBox.Show("La velocitat del vol " + vuelos.GetFlightPlan(i).GetId() + " ha de ser més gran que 0");
                        return;
                    }
                    velocidades.Add(v);
                    i++;
                }
            }
            catch (FormatException)
            {
                MessageBox.Show("Error de format: la velocitat del vol " + vuelos.GetFlightPlan(i).GetId() + " ha de ser un número");
                return;
            }

            timer1.Stop();
            i = 0;
            while (i < vuelos.GetNumber())
            {
                vuelos.GetFlightPlan(i).SetVelocidad(velocidades[i]);
                i++;
            }

            AvisarConflictes();
            ActualitzarPantalla();
        }

        // Per a cada vol que tindrà conflicte, busca una velocitat que l'eviti i pregunta a l'usuari si la vol aplicar.
        // Al final avisa si encara queden conflictes. Deixa la simulació reiniciada.
        private void buttonProposar_Click(object sender, EventArgs e)
        {
            timer1.Stop();

            if (vuelos.ConflictosFuturos(distanciaSeguridad, tiempoCiclo) == "")
            {
                MessageBox.Show("No hi haurà cap conflicte, no cal canviar cap velocitat");
                ActualitzarPantalla();
                return;
            }

            int i = 0;
            while (i < vuelos.GetNumber())
            {
                if (vuelos.ConflictoFuturo(i, distanciaSeguridad, tiempoCiclo))
                {
                    FlightPlan vuelo = vuelos.GetFlightPlan(i);
                    double nueva = vuelos.BuscarVelocidad(i, distanciaSeguridad, tiempoCiclo);
                    if (nueva != -1)
                    {
                        DialogResult respuesta = MessageBox.Show(
                            "Proposta: canviar la velocitat del vol " + vuelo.GetId() +
                            " de " + vuelo.GetVelocidad().ToString("0.00") + " a " + nueva.ToString("0.00") +
                            ".\nVols aplicar-la?", "Proposta", MessageBoxButtons.YesNo);

                        if (respuesta == DialogResult.Yes)
                            vuelo.SetVelocidad(nueva);
                    }
                }
                i++;
            }
            EscriureVelocitats();

            string conflictos = vuelos.ConflictosFuturos(distanciaSeguridad, tiempoCiclo);
            if (conflictos == "")
                MessageBox.Show("Ara ja no hi haurà cap conflicte");
            else
                MessageBox.Show("Encara hi haurà conflicte entre:\n" + conflictos);

            ActualitzarPantalla();
        }

        // En clicar un avió, obre una finestra amb les dades del seu vol.
        private void evento(object sender, EventArgs e)
        {
            PictureBox avion = (PictureBox)sender;
            int indice = (int)avion.Tag;

            Datos_vuelo F5 = new Datos_vuelo();
            F5.pon_vuelo(vuelos, indice);
            F5.ShowDialog();
        }

        // Dibuixa per a cada vol la seva ruta, el seu identificador i un cercle de seguretat al voltant
        // de l'avió (vermell i més gruixut si està en conflicte).
        private void panel1_Paint(object sender, PaintEventArgs e)
        {
            Graphics graphics = e.Graphics;
            Pen lapiz = new Pen(Color.White);
            SolidBrush pincel = new SolidBrush(Color.White);

            // Radi = meitat de la distància de seguretat: dos cercles es toquen just quan hi ha conflicte
            float r = (float)(distanciaSeguridad / 2);

            int i = 0;
            while (i < vuelos.GetNumber())
            {
                FlightPlan vuelo = vuelos.GetFlightPlan(i);
                float x = (float)vuelo.GetCurrentPosition().GetX();
                float y = (float)vuelo.GetCurrentPosition().GetY();

                lapiz.Color = ColorVuelo(i);
                lapiz.Width = 1;
                graphics.DrawLine(lapiz,
                    (float)vuelo.GetInitialPosition().GetX(), (float)vuelo.GetInitialPosition().GetY(),
                    (float)vuelo.GetFinalPosition().GetX(), (float)vuelo.GetFinalPosition().GetY());

                if (vuelos.EnConflicto(i, distanciaSeguridad))
                {
                    lapiz.Color = Color.Red;
                    lapiz.Width = 3;
                }
                graphics.DrawEllipse(lapiz, x - r, y - r, 2 * r, 2 * r);

                pincel.Color = ColorVuelo(i);
                graphics.DrawString(vuelo.GetId(), this.Font, pincel, x + 12, y - 25);
                i++;
            }

            lapiz.Dispose();
            pincel.Dispose();
        }
    }
}
