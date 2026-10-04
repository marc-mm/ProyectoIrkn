namespace WinFormsApp4
{
    partial class Form3
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
            label1 = new Label();
            label2 = new Label();
            textBoxDistancia = new TextBox();
            textBoxCiclo = new TextBox();
            button1 = new Button();
            SuspendLayout();
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(72, 90);
            label1.Name = "label1";
            label1.Size = new Size(256, 32);
            label1.TabIndex = 0;
            label1.Text = "Distancia de seguridad";
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Location = new Point(482, 90);
            label2.Name = "label2";
            label2.Size = new Size(184, 32);
            label2.TabIndex = 1;
            label2.Text = "Tiempo de ciclo";
            // 
            // textBoxDistancia
            // 
            textBoxDistancia.Location = new Point(94, 208);
            textBoxDistancia.Name = "textBoxDistancia";
            textBoxDistancia.Size = new Size(200, 39);
            textBoxDistancia.TabIndex = 2;
            // 
            // textBoxCiclo
            // 
            textBoxCiclo.Location = new Point(482, 208);
            textBoxCiclo.Name = "textBoxCiclo";
            textBoxCiclo.Size = new Size(200, 39);
            textBoxCiclo.TabIndex = 3;
            // 
            // button1
            // 
            button1.Location = new Point(313, 311);
            button1.Name = "button1";
            button1.Size = new Size(150, 46);
            button1.TabIndex = 4;
            button1.Text = "Acceptar";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            // 
            // Form3
            // 
            AutoScaleDimensions = new SizeF(13F, 32F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 450);
            Controls.Add(button1);
            Controls.Add(textBoxCiclo);
            Controls.Add(textBoxDistancia);
            Controls.Add(label2);
            Controls.Add(label1);
            Name = "Form3";
            Text = "Form3";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label label1;
        private Label label2;
        private TextBox textBoxDistancia;
        private TextBox textBoxCiclo;
        private Button button1;
    }
}