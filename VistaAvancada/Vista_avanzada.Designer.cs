namespace VistaAvancada
{
    partial class Vista_avanzada
    {
        private System.ComponentModel.IContainer components = null;

        // Allibera els recursos del formulari (components del dissenyador).
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        // Inicialitza les propietats bàsiques del formulari (el navegador WebView2 es crea per codi a Vista_avanzada.cs).
        private void InitializeComponent()
        {
            this.SuspendLayout();
            //
            // Vista_avanzada
            //
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.FromArgb(5, 8, 16);
            this.ClientSize = new System.Drawing.Size(1280, 800);
            this.Name = "Vista_avanzada";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Vista Avançada Realista";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.ResumeLayout(false);
        }

        #endregion
    }
}
