namespace WinFormsApp4
{
    partial class Datos_vuelo
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
            labelCompania = new Label();
            labelTelefon = new Label();
            labelEmail = new Label();
            labelVelocitat = new Label();
            labelInicial = new Label();
            labelActual = new Label();
            labelFinal = new Label();
            labelArribat = new Label();
            labelDistancias = new Label();
            tablaDistancias = new DataGridView();
            buttonTancar = new Button();
            ((System.ComponentModel.ISupportInitialize)tablaDistancias).BeginInit();
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
            // labelCompania
            //
            labelCompania.AutoSize = true;
            labelCompania.Location = new Point(20, 45);
            labelCompania.Name = "labelCompania";
            labelCompania.Size = new Size(68, 15);
            labelCompania.TabIndex = 1;
            labelCompania.Text = "Companyia:";
            //
            // labelTelefon
            //
            labelTelefon.AutoSize = true;
            labelTelefon.Location = new Point(20, 70);
            labelTelefon.Name = "labelTelefon";
            labelTelefon.Size = new Size(52, 15);
            labelTelefon.TabIndex = 2;
            labelTelefon.Text = "Telèfon:";
            //
            // labelEmail
            //
            labelEmail.AutoSize = true;
            labelEmail.Location = new Point(20, 95);
            labelEmail.Name = "labelEmail";
            labelEmail.Size = new Size(39, 15);
            labelEmail.TabIndex = 3;
            labelEmail.Text = "Email:";
            //
            // labelVelocitat
            //
            labelVelocitat.AutoSize = true;
            labelVelocitat.Location = new Point(20, 120);
            labelVelocitat.Name = "labelVelocitat";
            labelVelocitat.Size = new Size(54, 15);
            labelVelocitat.TabIndex = 4;
            labelVelocitat.Text = "Velocitat:";
            //
            // labelInicial
            //
            labelInicial.AutoSize = true;
            labelInicial.Location = new Point(20, 145);
            labelInicial.Name = "labelInicial";
            labelInicial.Size = new Size(82, 15);
            labelInicial.TabIndex = 5;
            labelInicial.Text = "Posició inicial:";
            //
            // labelActual
            //
            labelActual.AutoSize = true;
            labelActual.Location = new Point(20, 170);
            labelActual.Name = "labelActual";
            labelActual.Size = new Size(84, 15);
            labelActual.TabIndex = 6;
            labelActual.Text = "Posició actual:";
            //
            // labelFinal
            //
            labelFinal.AutoSize = true;
            labelFinal.Location = new Point(20, 195);
            labelFinal.Name = "labelFinal";
            labelFinal.Size = new Size(75, 15);
            labelFinal.TabIndex = 7;
            labelFinal.Text = "Posició final:";
            //
            // labelArribat
            //
            labelArribat.AutoSize = true;
            labelArribat.Location = new Point(20, 220);
            labelArribat.Name = "labelArribat";
            labelArribat.Size = new Size(112, 15);
            labelArribat.TabIndex = 8;
            labelArribat.Text = "Ha arribat al destí:";
            //
            // labelDistancias
            //
            labelDistancias.AutoSize = true;
            labelDistancias.Location = new Point(20, 255);
            labelDistancias.Name = "labelDistancias";
            labelDistancias.Size = new Size(150, 15);
            labelDistancias.TabIndex = 9;
            labelDistancias.Text = "Distància als altres vols:";
            //
            // tablaDistancias
            //
            tablaDistancias.AllowUserToAddRows = false;
            tablaDistancias.AllowUserToDeleteRows = false;
            tablaDistancias.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            tablaDistancias.Location = new Point(20, 275);
            tablaDistancias.Name = "tablaDistancias";
            tablaDistancias.ReadOnly = true;
            tablaDistancias.Size = new Size(300, 150);
            tablaDistancias.TabIndex = 10;
            //
            // buttonTancar
            //
            buttonTancar.Location = new Point(110, 440);
            buttonTancar.Name = "buttonTancar";
            buttonTancar.Size = new Size(120, 35);
            buttonTancar.TabIndex = 11;
            buttonTancar.Text = "Tancar";
            buttonTancar.UseVisualStyleBackColor = true;
            buttonTancar.Click += buttonTancar_Click;
            //
            // Datos_vuelo
            //
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(340, 490);
            Controls.Add(buttonTancar);
            Controls.Add(tablaDistancias);
            Controls.Add(labelDistancias);
            Controls.Add(labelArribat);
            Controls.Add(labelFinal);
            Controls.Add(labelActual);
            Controls.Add(labelInicial);
            Controls.Add(labelVelocitat);
            Controls.Add(labelEmail);
            Controls.Add(labelTelefon);
            Controls.Add(labelCompania);
            Controls.Add(labelId);
            Name = "Datos_vuelo";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Dades del vol";
            Load += Datos_vuelo_Load;
            ((System.ComponentModel.ISupportInitialize)tablaDistancias).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label labelId;
        private Label labelCompania;
        private Label labelTelefon;
        private Label labelEmail;
        private Label labelVelocitat;
        private Label labelInicial;
        private Label labelActual;
        private Label labelFinal;
        private Label labelArribat;
        private Label labelDistancias;
        private DataGridView tablaDistancias;
        private Button buttonTancar;
    }
}
