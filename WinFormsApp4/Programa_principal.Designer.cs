namespace WinFormsApp4
{
    partial class Programa_principal
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
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
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            menuStrip1 = new MenuStrip();
            menuCargar = new ToolStripMenuItem();
            menuIntroducir = new ToolStripMenuItem();
            menuDades = new ToolStripMenuItem();
            menuSimulacio = new ToolStripMenuItem();
            menuCompanias = new ToolStripMenuItem();
            labelEstado = new Label();
            buttonVistaAvanzada = new Button();
            menuStrip1.SuspendLayout();
            SuspendLayout();
            //
            // menuStrip1
            //
            menuStrip1.ImageScalingSize = new Size(20, 20);
            menuStrip1.Items.AddRange(new ToolStripItem[] { menuCargar, menuIntroducir, menuDades, menuSimulacio, menuCompanias });
            menuStrip1.Location = new Point(0, 0);
            menuStrip1.Name = "menuStrip1";
            menuStrip1.Padding = new Padding(7, 3, 0, 3);
            menuStrip1.Size = new Size(667, 30);
            menuStrip1.TabIndex = 0;
            menuStrip1.Text = "menuStrip1";
            //
            // menuCargar
            //
            menuCargar.Name = "menuCargar";
            menuCargar.Size = new Size(170, 24);
            menuCargar.Text = "Carregar plans de vol";
            menuCargar.Click += menuCargar_Click;
            //
            // menuIntroducir
            //
            menuIntroducir.Name = "menuIntroducir";
            menuIntroducir.Size = new Size(170, 24);
            menuIntroducir.Text = "Introduir plans de vol";
            menuIntroducir.Click += menuIntroducir_Click;
            //
            // menuDades
            //
            menuDades.Name = "menuDades";
            menuDades.Size = new Size(132, 24);
            menuDades.Text = "Dades simulació";
            menuDades.Click += menuDades_Click;
            //
            // menuSimulacio
            //
            menuSimulacio.Name = "menuSimulacio";
            menuSimulacio.Size = new Size(88, 24);
            menuSimulacio.Text = "Simulació";
            menuSimulacio.Click += menuSimulacio_Click;
            //
            // menuCompanias
            //
            menuCompanias.Name = "menuCompanias";
            menuCompanias.Size = new Size(100, 24);
            menuCompanias.Text = "Companyies";
            menuCompanias.Click += menuCompanias_Click;
            //
            // labelEstado
            //
            labelEstado.Font = new Font("Segoe UI", 11F);
            labelEstado.Location = new Point(30, 55);
            labelEstado.Name = "labelEstado";
            labelEstado.Size = new Size(610, 270);
            labelEstado.TabIndex = 1;
            //
            // buttonVistaAvanzada
            //
            buttonVistaAvanzada.BackColor = Color.FromArgb(10, 25, 60);
            buttonVistaAvanzada.FlatStyle = FlatStyle.Flat;
            buttonVistaAvanzada.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
            buttonVistaAvanzada.ForeColor = Color.White;
            buttonVistaAvanzada.Location = new Point(30, 335);
            buttonVistaAvanzada.Name = "buttonVistaAvanzada";
            buttonVistaAvanzada.Size = new Size(610, 55);
            buttonVistaAvanzada.TabIndex = 2;
            buttonVistaAvanzada.Text = "Vista Avançada Realista";
            buttonVistaAvanzada.UseVisualStyleBackColor = false;
            buttonVistaAvanzada.Click += buttonVistaAvanzada_Click;
            //
            // Programa_principal
            //
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(667, 410);
            Controls.Add(buttonVistaAvanzada);
            Controls.Add(labelEstado);
            Controls.Add(menuStrip1);
            MainMenuStrip = menuStrip1;
            Margin = new Padding(3, 4, 3, 4);
            Name = "Programa_principal";
            StartPosition = FormStartPosition.CenterScreen;
            Text = "Simulador de vols";
            menuStrip1.ResumeLayout(false);
            menuStrip1.PerformLayout();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private MenuStrip menuStrip1;
        private ToolStripMenuItem menuCargar;
        private ToolStripMenuItem menuIntroducir;
        private ToolStripMenuItem menuDades;
        private ToolStripMenuItem menuSimulacio;
        private ToolStripMenuItem menuCompanias;
        private Label labelEstado;
        private Button buttonVistaAvanzada;
    }
}
