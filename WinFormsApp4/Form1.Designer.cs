namespace WinFormsApp4
{
    partial class Form1
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
            menuVols = new ToolStripMenuItem();
            menuDades = new ToolStripMenuItem();
            menuSimulacio = new ToolStripMenuItem();
            label1 = new Label();
            menuStrip1.SuspendLayout();
            SuspendLayout();
            //
            // menuStrip1
            //
            menuStrip1.ImageScalingSize = new Size(20, 20);
            menuStrip1.Items.AddRange(new ToolStripItem[] { menuVols, menuDades, menuSimulacio });
            menuStrip1.Location = new Point(0, 0);
            menuStrip1.Name = "menuStrip1";
            menuStrip1.Size = new Size(584, 24);
            menuStrip1.TabIndex = 0;
            menuStrip1.Text = "menuStrip1";
            //
            // menuVols
            //
            menuVols.Name = "menuVols";
            menuVols.Size = new Size(100, 20);
            menuVols.Text = "Dades dels vols";
            menuVols.Click += menuVols_Click;
            //
            // menuDades
            //
            menuDades.Name = "menuDades";
            menuDades.Size = new Size(110, 20);
            menuDades.Text = "Dades simulació";
            menuDades.Click += menuDades_Click;
            //
            // menuSimulacio
            //
            menuSimulacio.Name = "menuSimulacio";
            menuSimulacio.Size = new Size(70, 20);
            menuSimulacio.Text = "Simulació";
            menuSimulacio.Click += menuSimulacio_Click;
            //
            // label1
            //
            label1.Font = new Font("Segoe UI", 12F);
            label1.Location = new Point(40, 80);
            label1.Name = "label1";
            label1.Size = new Size(500, 120);
            label1.TabIndex = 1;
            label1.Text = "1. Dades dels vols: introdueix els dos plans de vol\r\n2. Dades simulació: distància de seguretat i temps de cicle\r\n3. Simulació: obre l'espai aeri";
            //
            // Form1
            //
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(584, 261);
            Controls.Add(label1);
            Controls.Add(menuStrip1);
            MainMenuStrip = menuStrip1;
            Name = "Form1";
            StartPosition = FormStartPosition.CenterScreen;
            Text = "Simulador de vols";
            menuStrip1.ResumeLayout(false);
            menuStrip1.PerformLayout();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private MenuStrip menuStrip1;
        private ToolStripMenuItem menuVols;
        private ToolStripMenuItem menuDades;
        private ToolStripMenuItem menuSimulacio;
        private Label label1;
    }
}
