namespace WinFormsApp4
{
    partial class Form4
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            components = new System.ComponentModel.Container();
            panel1 = new Panel();
            button1 = new Button();
            button2 = new Button();
            labelConflicte = new Label();
            buttonIniciar = new Button();
            buttonAturar = new Button();
            labelDistancia = new Label();
            labelLlista = new Label();
            matriz = new DataGridView();
            buttonAplicar = new Button();
            buttonProposar = new Button();
            timer1 = new System.Windows.Forms.Timer(components);
            ((System.ComponentModel.ISupportInitialize)matriz).BeginInit();
            SuspendLayout();
            //
            // panel1
            //
            panel1.BackColor = Color.White;
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Location = new Point(11, 14);
            panel1.Margin = new Padding(3, 4, 3, 4);
            panel1.Name = "panel1";
            panel1.Size = new Size(802, 802);
            panel1.TabIndex = 0;
            panel1.Paint += panel1_Paint;
            //
            // button1
            //
            button1.Location = new Point(835, 20);
            button1.Margin = new Padding(3, 4, 3, 4);
            button1.Name = "button1";
            button1.Size = new Size(149, 54);
            button1.TabIndex = 1;
            button1.Text = "Moure un cicle";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            //
            // button2
            //
            button2.Location = new Point(995, 20);
            button2.Margin = new Padding(3, 4, 3, 4);
            button2.Name = "button2";
            button2.Size = new Size(149, 54);
            button2.TabIndex = 2;
            button2.Text = "Reiniciar";
            button2.UseVisualStyleBackColor = true;
            button2.Click += button2_Click;
            //
            // buttonIniciar
            //
            buttonIniciar.Location = new Point(835, 85);
            buttonIniciar.Margin = new Padding(3, 4, 3, 4);
            buttonIniciar.Name = "buttonIniciar";
            buttonIniciar.Size = new Size(149, 54);
            buttonIniciar.TabIndex = 3;
            buttonIniciar.Text = "Iniciar";
            buttonIniciar.UseVisualStyleBackColor = true;
            buttonIniciar.Click += buttonIniciar_Click;
            //
            // buttonAturar
            //
            buttonAturar.Location = new Point(995, 85);
            buttonAturar.Margin = new Padding(3, 4, 3, 4);
            buttonAturar.Name = "buttonAturar";
            buttonAturar.Size = new Size(149, 54);
            buttonAturar.TabIndex = 4;
            buttonAturar.Text = "Aturar";
            buttonAturar.UseVisualStyleBackColor = true;
            buttonAturar.Click += buttonAturar_Click;
            //
            // labelConflicte
            //
            labelConflicte.AutoSize = true;
            labelConflicte.Font = new Font("Segoe UI", 11F);
            labelConflicte.Location = new Point(835, 160);
            labelConflicte.Name = "labelConflicte";
            labelConflicte.Size = new Size(138, 25);
            labelConflicte.TabIndex = 5;
            labelConflicte.Text = "Sense conflicte";
            //
            // labelDistancia
            //
            labelDistancia.AutoSize = true;
            labelDistancia.Location = new Point(835, 200);
            labelDistancia.Name = "labelDistancia";
            labelDistancia.Size = new Size(170, 20);
            labelDistancia.TabIndex = 6;
            labelDistancia.Text = "Distància entre els vols:";
            //
            // labelLlista
            //
            labelLlista.AutoSize = true;
            labelLlista.Location = new Point(835, 250);
            labelLlista.Name = "labelLlista";
            labelLlista.Size = new Size(290, 20);
            labelLlista.TabIndex = 7;
            labelLlista.Text = "Llista de vols (pots canviar la velocitat):";
            //
            // matriz
            //
            matriz.AllowUserToAddRows = false;
            matriz.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            matriz.Location = new Point(835, 275);
            matriz.Margin = new Padding(3, 4, 3, 4);
            matriz.Name = "matriz";
            matriz.ScrollBars = ScrollBars.None;
            matriz.Size = new Size(309, 100);
            matriz.TabIndex = 8;
            //
            // buttonAplicar
            //
            buttonAplicar.Location = new Point(835, 385);
            buttonAplicar.Margin = new Padding(3, 4, 3, 4);
            buttonAplicar.Name = "buttonAplicar";
            buttonAplicar.Size = new Size(309, 54);
            buttonAplicar.TabIndex = 9;
            buttonAplicar.Text = "Aplicar velocitats i reiniciar";
            buttonAplicar.UseVisualStyleBackColor = true;
            buttonAplicar.Click += buttonAplicar_Click;
            //
            // buttonProposar
            //
            buttonProposar.Location = new Point(835, 450);
            buttonProposar.Margin = new Padding(3, 4, 3, 4);
            buttonProposar.Name = "buttonProposar";
            buttonProposar.Size = new Size(309, 54);
            buttonProposar.TabIndex = 10;
            buttonProposar.Text = "Proposar canvi de velocitat";
            buttonProposar.UseVisualStyleBackColor = true;
            buttonProposar.Click += buttonProposar_Click;
            //
            // timer1
            //
            timer1.Tick += timer1_Tick;
            //
            // Form4
            //
            AutoScaleMode = AutoScaleMode.None;
            ClientSize = new Size(1165, 830);
            Controls.Add(buttonProposar);
            Controls.Add(buttonAplicar);
            Controls.Add(matriz);
            Controls.Add(labelLlista);
            Controls.Add(labelDistancia);
            Controls.Add(buttonAturar);
            Controls.Add(buttonIniciar);
            Controls.Add(labelConflicte);
            Controls.Add(button2);
            Controls.Add(button1);
            Controls.Add(panel1);
            Margin = new Padding(3, 4, 3, 4);
            Name = "Form4";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Simulació";
            Load += Form4_Load;
            ((System.ComponentModel.ISupportInitialize)matriz).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Panel panel1;
        private Button button1;
        private Button button2;
        private Label labelConflicte;
        private Button buttonIniciar;
        private Button buttonAturar;
        private Label labelDistancia;
        private Label labelLlista;
        private DataGridView matriz;
        private Button buttonAplicar;
        private Button buttonProposar;
        private System.Windows.Forms.Timer timer1;
    }
}
