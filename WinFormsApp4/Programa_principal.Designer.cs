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
            menuDades = new ToolStripMenuItem();
            menuSimulacio = new ToolStripMenuItem();
            labelEstado = new Label();
            menuStrip1.SuspendLayout();
            SuspendLayout();
            //
            // menuStrip1
            //
            menuStrip1.ImageScalingSize = new Size(20, 20);
            menuStrip1.Items.AddRange(new ToolStripItem[] { menuCargar, menuDades, menuSimulacio });
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
            // labelEstado
            //
            labelEstado.Font = new Font("Segoe UI", 11F);
            labelEstado.Location = new Point(30, 55);
            labelEstado.Name = "labelEstado";
            labelEstado.Size = new Size(610, 270);
            labelEstado.TabIndex = 1;
            //
            // Programa_principal
            //
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(667, 348);
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
        private ToolStripMenuItem menuDades;
        private ToolStripMenuItem menuSimulacio;
        private Label labelEstado;
    }
}
