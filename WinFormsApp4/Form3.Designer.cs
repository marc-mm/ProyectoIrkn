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
            label1.Location = new Point(30, 33);
            label1.Name = "label1";
            label1.Size = new Size(128, 15);
            label1.TabIndex = 0;
            label1.Text = "Distància de seguretat:";
            //
            // label2
            //
            label2.AutoSize = true;
            label2.Location = new Point(30, 73);
            label2.Name = "label2";
            label2.Size = new Size(90, 15);
            label2.TabIndex = 1;
            label2.Text = "Temps de cicle:";
            //
            // textBoxDistancia
            //
            textBoxDistancia.Location = new Point(180, 30);
            textBoxDistancia.Name = "textBoxDistancia";
            textBoxDistancia.Size = new Size(100, 23);
            textBoxDistancia.TabIndex = 2;
            //
            // textBoxCiclo
            //
            textBoxCiclo.Location = new Point(180, 70);
            textBoxCiclo.Name = "textBoxCiclo";
            textBoxCiclo.Size = new Size(100, 23);
            textBoxCiclo.TabIndex = 3;
            //
            // button1
            //
            button1.Location = new Point(100, 115);
            button1.Name = "button1";
            button1.Size = new Size(120, 35);
            button1.TabIndex = 4;
            button1.Text = "Acceptar";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            //
            // Form3
            //
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(320, 170);
            Controls.Add(button1);
            Controls.Add(textBoxCiclo);
            Controls.Add(textBoxDistancia);
            Controls.Add(label2);
            Controls.Add(label1);
            Name = "Form3";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Dades de la simulació";
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
