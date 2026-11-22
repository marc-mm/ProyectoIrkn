namespace WinFormsApp4
{
    partial class Introducir_vuelos
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
            label3 = new Label();
            labelCompania = new Label();
            label5 = new Label();
            label7 = new Label();
            label9 = new Label();
            label11 = new Label();
            textBox_ID1 = new TextBox();
            textBox_Compania1 = new TextBox();
            textBoxCx1 = new TextBox();
            textBoxCy1 = new TextBox();
            textBoxFx1 = new TextBox();
            textBoxFy1 = new TextBox();
            textBoxV1 = new TextBox();
            button1 = new Button();
            tablaVuelos = new DataGridView();
            buttonTancar = new Button();
            ((System.ComponentModel.ISupportInitialize)tablaVuelos).BeginInit();
            SuspendLayout();
            //
            // label1
            //
            label1.AutoSize = true;
            label1.Font = new Font("Segoe UI", 14F);
            label1.Location = new Point(140, 25);
            label1.Margin = new Padding(4, 0, 4, 0);
            label1.Name = "label1";
            label1.Size = new Size(109, 38);
            label1.TabIndex = 0;
            label1.Text = "Nou vol";
            //
            // label2
            //
            label2.AutoSize = true;
            label2.Font = new Font("Segoe UI", 14F);
            label2.Location = new Point(457, 25);
            label2.Margin = new Padding(4, 0, 4, 0);
            label2.Name = "label2";
            label2.Size = new Size(170, 38);
            label2.TabIndex = 1;
            label2.Text = "Plans de vol";
            //
            // label3
            //
            label3.AutoSize = true;
            label3.Location = new Point(29, 105);
            label3.Margin = new Padding(4, 0, 4, 0);
            label3.Name = "label3";
            label3.Size = new Size(34, 25);
            label3.TabIndex = 2;
            label3.Text = "ID:";
            //
            // labelCompania
            //
            labelCompania.AutoSize = true;
            labelCompania.Location = new Point(29, 160);
            labelCompania.Margin = new Padding(4, 0, 4, 0);
            labelCompania.Name = "labelCompania";
            labelCompania.Size = new Size(103, 25);
            labelCompania.TabIndex = 3;
            labelCompania.Text = "Companyia:";
            //
            // label5
            //
            label5.AutoSize = true;
            label5.Location = new Point(29, 215);
            label5.Margin = new Padding(4, 0, 4, 0);
            label5.Name = "label5";
            label5.Size = new Size(160, 25);
            label5.TabIndex = 4;
            label5.Text = "Posició inicial (x, y):";
            //
            // label7
            //
            label7.AutoSize = true;
            label7.Location = new Point(29, 270);
            label7.Margin = new Padding(4, 0, 4, 0);
            label7.Name = "label7";
            label7.Size = new Size(150, 25);
            label7.TabIndex = 5;
            label7.Text = "Posició final (x, y):";
            //
            // label9
            //
            label9.AutoSize = true;
            label9.Location = new Point(29, 325);
            label9.Margin = new Padding(4, 0, 4, 0);
            label9.Name = "label9";
            label9.Size = new Size(83, 25);
            label9.TabIndex = 6;
            label9.Text = "Velocitat:";
            //
            // label11
            //
            label11.AutoSize = true;
            label11.ForeColor = Color.Gray;
            label11.Location = new Point(29, 380);
            label11.Margin = new Padding(4, 0, 4, 0);
            label11.Name = "label11";
            label11.Size = new Size(341, 25);
            label11.TabIndex = 7;
            label11.Text = "Les coordenades han d'estar entre 0 i 799";
            //
            // textBox_ID1
            //
            textBox_ID1.Location = new Point(200, 100);
            textBox_ID1.Margin = new Padding(4, 5, 4, 5);
            textBox_ID1.Name = "textBox_ID1";
            textBox_ID1.Size = new Size(155, 31);
            textBox_ID1.TabIndex = 8;
            //
            // textBox_Compania1
            //
            textBox_Compania1.Location = new Point(200, 155);
            textBox_Compania1.Margin = new Padding(4, 5, 4, 5);
            textBox_Compania1.Name = "textBox_Compania1";
            textBox_Compania1.Size = new Size(155, 31);
            textBox_Compania1.TabIndex = 9;
            //
            // textBoxCx1
            //
            textBoxCx1.Location = new Point(200, 210);
            textBoxCx1.Margin = new Padding(4, 5, 4, 5);
            textBoxCx1.Name = "textBoxCx1";
            textBoxCx1.PlaceholderText = "x";
            textBoxCx1.Size = new Size(70, 31);
            textBoxCx1.TabIndex = 10;
            //
            // textBoxCy1
            //
            textBoxCy1.Location = new Point(286, 210);
            textBoxCy1.Margin = new Padding(4, 5, 4, 5);
            textBoxCy1.Name = "textBoxCy1";
            textBoxCy1.PlaceholderText = "y";
            textBoxCy1.Size = new Size(70, 31);
            textBoxCy1.TabIndex = 11;
            //
            // textBoxFx1
            //
            textBoxFx1.Location = new Point(200, 265);
            textBoxFx1.Margin = new Padding(4, 5, 4, 5);
            textBoxFx1.Name = "textBoxFx1";
            textBoxFx1.PlaceholderText = "x";
            textBoxFx1.Size = new Size(70, 31);
            textBoxFx1.TabIndex = 12;
            //
            // textBoxFy1
            //
            textBoxFy1.Location = new Point(286, 265);
            textBoxFy1.Margin = new Padding(4, 5, 4, 5);
            textBoxFy1.Name = "textBoxFy1";
            textBoxFy1.PlaceholderText = "y";
            textBoxFy1.Size = new Size(70, 31);
            textBoxFy1.TabIndex = 13;
            //
            // textBoxV1
            //
            textBoxV1.Location = new Point(200, 320);
            textBoxV1.Margin = new Padding(4, 5, 4, 5);
            textBoxV1.Name = "textBoxV1";
            textBoxV1.Size = new Size(155, 31);
            textBoxV1.TabIndex = 14;
            //
            // button1
            //
            button1.Location = new Point(200, 425);
            button1.Margin = new Padding(4, 5, 4, 5);
            button1.Name = "button1";
            button1.Size = new Size(155, 50);
            button1.TabIndex = 15;
            button1.Text = "Afegir";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            //
            // tablaVuelos
            //
            tablaVuelos.AllowUserToAddRows = false;
            tablaVuelos.AllowUserToDeleteRows = false;
            tablaVuelos.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            tablaVuelos.Location = new Point(457, 100);
            tablaVuelos.Margin = new Padding(4, 5, 4, 5);
            tablaVuelos.Name = "tablaVuelos";
            tablaVuelos.ReadOnly = true;
            tablaVuelos.Size = new Size(600, 305);
            tablaVuelos.TabIndex = 16;
            //
            // buttonTancar
            //
            buttonTancar.Location = new Point(902, 425);
            buttonTancar.Margin = new Padding(4, 5, 4, 5);
            buttonTancar.Name = "buttonTancar";
            buttonTancar.Size = new Size(155, 50);
            buttonTancar.TabIndex = 17;
            buttonTancar.Text = "Tancar";
            buttonTancar.UseVisualStyleBackColor = true;
            buttonTancar.Click += buttonTancar_Click;
            //
            // Introducir_vuelos
            //
            AutoScaleDimensions = new SizeF(10F, 25F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(1090, 500);
            Controls.Add(buttonTancar);
            Controls.Add(tablaVuelos);
            Controls.Add(button1);
            Controls.Add(textBoxV1);
            Controls.Add(textBoxFy1);
            Controls.Add(textBoxFx1);
            Controls.Add(textBoxCy1);
            Controls.Add(textBoxCx1);
            Controls.Add(textBox_Compania1);
            Controls.Add(textBox_ID1);
            Controls.Add(label11);
            Controls.Add(label9);
            Controls.Add(label7);
            Controls.Add(label5);
            Controls.Add(labelCompania);
            Controls.Add(label3);
            Controls.Add(label2);
            Controls.Add(label1);
            Margin = new Padding(4, 5, 4, 5);
            Name = "Introducir_vuelos";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Introduir plans de vol";
            Load += Introducir_vuelos_Load;
            ((System.ComponentModel.ISupportInitialize)tablaVuelos).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label label1;
        private Label label2;
        private Label label3;
        private Label labelCompania;
        private Label label5;
        private Label label7;
        private Label label9;
        private Label label11;
        private TextBox textBox_ID1;
        private TextBox textBox_Compania1;
        private TextBox textBoxCx1;
        private TextBox textBoxCy1;
        private TextBox textBoxFx1;
        private TextBox textBoxFy1;
        private TextBox textBoxV1;
        private Button button1;
        private DataGridView tablaVuelos;
        private Button buttonTancar;
    }
}
