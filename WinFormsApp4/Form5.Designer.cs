namespace WinFormsApp4
{
    partial class Form5
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
            labelId = new Label();
            labelVelocitat = new Label();
            labelInicial = new Label();
            labelActual = new Label();
            labelFinal = new Label();
            labelArribat = new Label();
            button1 = new Button();
            SuspendLayout();
            //
            // labelId
            //
            labelId.AutoSize = true;
            labelId.Location = new Point(20, 20);
            labelId.Name = "labelId";
            labelId.Size = new Size(79, 15);
            labelId.TabIndex = 0;
            labelId.Text = "Identificador:";
            //
            // labelVelocitat
            //
            labelVelocitat.AutoSize = true;
            labelVelocitat.Location = new Point(20, 50);
            labelVelocitat.Name = "labelVelocitat";
            labelVelocitat.Size = new Size(54, 15);
            labelVelocitat.TabIndex = 1;
            labelVelocitat.Text = "Velocitat:";
            //
            // labelInicial
            //
            labelInicial.AutoSize = true;
            labelInicial.Location = new Point(20, 80);
            labelInicial.Name = "labelInicial";
            labelInicial.Size = new Size(82, 15);
            labelInicial.TabIndex = 2;
            labelInicial.Text = "Posició inicial:";
            //
            // labelActual
            //
            labelActual.AutoSize = true;
            labelActual.Location = new Point(20, 110);
            labelActual.Name = "labelActual";
            labelActual.Size = new Size(84, 15);
            labelActual.TabIndex = 3;
            labelActual.Text = "Posició actual:";
            //
            // labelFinal
            //
            labelFinal.AutoSize = true;
            labelFinal.Location = new Point(20, 140);
            labelFinal.Name = "labelFinal";
            labelFinal.Size = new Size(75, 15);
            labelFinal.TabIndex = 4;
            labelFinal.Text = "Posició final:";
            //
            // labelArribat
            //
            labelArribat.AutoSize = true;
            labelArribat.Location = new Point(20, 170);
            labelArribat.Name = "labelArribat";
            labelArribat.Size = new Size(112, 15);
            labelArribat.TabIndex = 5;
            labelArribat.Text = "Ha arribat al destí:";
            //
            // button1
            //
            button1.Location = new Point(90, 205);
            button1.Name = "button1";
            button1.Size = new Size(120, 35);
            button1.TabIndex = 6;
            button1.Text = "Tancar";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            //
            // Form5
            //
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(300, 260);
            Controls.Add(button1);
            Controls.Add(labelArribat);
            Controls.Add(labelFinal);
            Controls.Add(labelActual);
            Controls.Add(labelInicial);
            Controls.Add(labelVelocitat);
            Controls.Add(labelId);
            Name = "Form5";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Informació de l'avió";
            Load += Form5_Load;
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label labelId;
        private Label labelVelocitat;
        private Label labelInicial;
        private Label labelActual;
        private Label labelFinal;
        private Label labelArribat;
        private Button button1;
    }
}
