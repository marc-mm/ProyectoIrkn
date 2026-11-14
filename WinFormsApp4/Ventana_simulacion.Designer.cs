namespace WinFormsApp4
{
    partial class Ventana_simulacion
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
            buttonMoure = new Button();
            buttonDesfer = new Button();
            buttonIniciar = new Button();
            buttonAturar = new Button();
            buttonReiniciar = new Button();
            buttonGuardar = new Button();
            labelConflicte = new Label();
            labelLlista = new Label();
            matriz = new DataGridView();
            buttonAplicar = new Button();
            buttonProposar = new Button();
            labelAjuda = new Label();
            timer1 = new System.Windows.Forms.Timer(components);
            ((System.ComponentModel.ISupportInitialize)matriz).BeginInit();
            SuspendLayout();
            //
            // panel1
            //
            panel1.BackColor = Color.Black;
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Location = new Point(11, 14);
            panel1.Margin = new Padding(3, 4, 3, 4);
            panel1.Name = "panel1";
            panel1.Size = new Size(802, 802);
            panel1.TabIndex = 0;
            panel1.Paint += panel1_Paint;
            //
            // buttonMoure
            //
            buttonMoure.Location = new Point(835, 14);
            buttonMoure.Name = "buttonMoure";
            buttonMoure.Size = new Size(190, 45);
            buttonMoure.TabIndex = 1;
            buttonMoure.Text = "Moure un cicle";
            buttonMoure.UseVisualStyleBackColor = true;
            buttonMoure.Click += buttonMoure_Click;
            //
            // buttonDesfer
            //
            buttonDesfer.Location = new Point(1035, 14);
            buttonDesfer.Name = "buttonDesfer";
            buttonDesfer.Size = new Size(190, 45);
            buttonDesfer.TabIndex = 2;
            buttonDesfer.Text = "Desfer últim cicle";
            buttonDesfer.UseVisualStyleBackColor = true;
            buttonDesfer.Click += buttonDesfer_Click;
            //
            // buttonIniciar
            //
            buttonIniciar.Location = new Point(835, 67);
            buttonIniciar.Name = "buttonIniciar";
            buttonIniciar.Size = new Size(190, 45);
            buttonIniciar.TabIndex = 3;
            buttonIniciar.Text = "Iniciar automàtic";
            buttonIniciar.UseVisualStyleBackColor = true;
            buttonIniciar.Click += buttonIniciar_Click;
            //
            // buttonAturar
            //
            buttonAturar.Location = new Point(1035, 67);
            buttonAturar.Name = "buttonAturar";
            buttonAturar.Size = new Size(190, 45);
            buttonAturar.TabIndex = 4;
            buttonAturar.Text = "Aturar";
            buttonAturar.UseVisualStyleBackColor = true;
            buttonAturar.Click += buttonAturar_Click;
            //
            // buttonReiniciar
            //
            buttonReiniciar.Location = new Point(835, 120);
            buttonReiniciar.Name = "buttonReiniciar";
            buttonReiniciar.Size = new Size(190, 45);
            buttonReiniciar.TabIndex = 5;
            buttonReiniciar.Text = "Reiniciar";
            buttonReiniciar.UseVisualStyleBackColor = true;
            buttonReiniciar.Click += buttonReiniciar_Click;
            //
            // buttonGuardar
            //
            buttonGuardar.Location = new Point(1035, 120);
            buttonGuardar.Name = "buttonGuardar";
            buttonGuardar.Size = new Size(190, 45);
            buttonGuardar.TabIndex = 6;
            buttonGuardar.Text = "Guardar vols";
            buttonGuardar.UseVisualStyleBackColor = true;
            buttonGuardar.Click += buttonGuardar_Click;
            //
            // labelConflicte
            //
            labelConflicte.Font = new Font("Segoe UI", 11F, FontStyle.Bold);
            labelConflicte.Location = new Point(835, 180);
            labelConflicte.Name = "labelConflicte";
            labelConflicte.Size = new Size(390, 55);
            labelConflicte.TabIndex = 7;
            labelConflicte.Text = "Sense conflicte";
            //
            // labelLlista
            //
            labelLlista.AutoSize = true;
            labelLlista.Location = new Point(835, 240);
            labelLlista.Name = "labelLlista";
            labelLlista.Size = new Size(290, 20);
            labelLlista.TabIndex = 8;
            labelLlista.Text = "Llista de vols (pots canviar la velocitat):";
            //
            // matriz
            //
            matriz.AllowUserToAddRows = false;
            matriz.AllowUserToDeleteRows = false;
            matriz.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            matriz.Location = new Point(835, 265);
            matriz.Name = "matriz";
            matriz.ScrollBars = ScrollBars.Vertical;
            matriz.Size = new Size(390, 300);
            matriz.TabIndex = 9;
            //
            // buttonAplicar
            //
            buttonAplicar.Location = new Point(835, 575);
            buttonAplicar.Name = "buttonAplicar";
            buttonAplicar.Size = new Size(390, 45);
            buttonAplicar.TabIndex = 10;
            buttonAplicar.Text = "Aplicar velocitats i reiniciar";
            buttonAplicar.UseVisualStyleBackColor = true;
            buttonAplicar.Click += buttonAplicar_Click;
            //
            // buttonProposar
            //
            buttonProposar.Location = new Point(835, 628);
            buttonProposar.Name = "buttonProposar";
            buttonProposar.Size = new Size(390, 45);
            buttonProposar.TabIndex = 11;
            buttonProposar.Text = "Proposar canvis de velocitat";
            buttonProposar.UseVisualStyleBackColor = true;
            buttonProposar.Click += buttonProposar_Click;
            //
            // labelAjuda
            //
            labelAjuda.Location = new Point(835, 690);
            labelAjuda.Name = "labelAjuda";
            labelAjuda.Size = new Size(390, 120);
            labelAjuda.TabIndex = 12;
            labelAjuda.Text = "Clica un avió per veure'n les dades i la distància als altres vols.\n\nEl cercle de cada avió és la seva zona de seguretat: es torna vermell si hi ha conflicte.";
            //
            // timer1
            //
            timer1.Tick += timer1_Tick;
            //
            // Ventana_simulacion
            //
            AutoScaleMode = AutoScaleMode.None;
            ClientSize = new Size(1240, 830);
            Controls.Add(labelAjuda);
            Controls.Add(buttonProposar);
            Controls.Add(buttonAplicar);
            Controls.Add(matriz);
            Controls.Add(labelLlista);
            Controls.Add(labelConflicte);
            Controls.Add(buttonGuardar);
            Controls.Add(buttonReiniciar);
            Controls.Add(buttonAturar);
            Controls.Add(buttonIniciar);
            Controls.Add(buttonDesfer);
            Controls.Add(buttonMoure);
            Controls.Add(panel1);
            Margin = new Padding(3, 4, 3, 4);
            Name = "Ventana_simulacion";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Simulació";
            Load += Ventana_simulacion_Load;
            ((System.ComponentModel.ISupportInitialize)matriz).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Panel panel1;
        private Button buttonMoure;
        private Button buttonDesfer;
        private Button buttonIniciar;
        private Button buttonAturar;
        private Button buttonReiniciar;
        private Button buttonGuardar;
        private Label labelConflicte;
        private Label labelLlista;
        private DataGridView matriz;
        private Button buttonAplicar;
        private Button buttonProposar;
        private Label labelAjuda;
        private System.Windows.Forms.Timer timer1;
    }
}
