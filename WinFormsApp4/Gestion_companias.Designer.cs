namespace WinFormsApp4
{
    partial class Gestion_companias
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
            tablaCompanias = new DataGridView();
            labelNombre = new Label();
            textBoxNombre = new TextBox();
            labelTelefono = new Label();
            textBoxTelefono = new TextBox();
            labelEmail = new Label();
            textBoxEmail = new TextBox();
            buttonAnadir = new Button();
            buttonEliminar = new Button();
            buttonTancar = new Button();
            labelAyuda = new Label();
            ((System.ComponentModel.ISupportInitialize)tablaCompanias).BeginInit();
            SuspendLayout();
            //
            // tablaCompanias
            //
            tablaCompanias.AllowUserToAddRows = false;
            tablaCompanias.AllowUserToDeleteRows = false;
            tablaCompanias.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            tablaCompanias.Location = new Point(20, 20);
            tablaCompanias.MultiSelect = false;
            tablaCompanias.Name = "tablaCompanias";
            tablaCompanias.ReadOnly = true;
            tablaCompanias.RowHeadersVisible = false;
            tablaCompanias.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            tablaCompanias.Size = new Size(600, 220);
            tablaCompanias.TabIndex = 0;
            tablaCompanias.CellClick += tablaCompanias_CellClick;
            //
            // labelNombre
            //
            labelNombre.AutoSize = true;
            labelNombre.Location = new Point(20, 258);
            labelNombre.Name = "labelNombre";
            labelNombre.Size = new Size(37, 15);
            labelNombre.TabIndex = 1;
            labelNombre.Text = "Nom:";
            //
            // textBoxNombre
            //
            textBoxNombre.Location = new Point(90, 255);
            textBoxNombre.Name = "textBoxNombre";
            textBoxNombre.Size = new Size(220, 23);
            textBoxNombre.TabIndex = 2;
            //
            // labelTelefono
            //
            labelTelefono.AutoSize = true;
            labelTelefono.Location = new Point(20, 293);
            labelTelefono.Name = "labelTelefono";
            labelTelefono.Size = new Size(52, 15);
            labelTelefono.TabIndex = 3;
            labelTelefono.Text = "Telèfon:";
            //
            // textBoxTelefono
            //
            textBoxTelefono.Location = new Point(90, 290);
            textBoxTelefono.Name = "textBoxTelefono";
            textBoxTelefono.Size = new Size(220, 23);
            textBoxTelefono.TabIndex = 4;
            //
            // labelEmail
            //
            labelEmail.AutoSize = true;
            labelEmail.Location = new Point(20, 328);
            labelEmail.Name = "labelEmail";
            labelEmail.Size = new Size(39, 15);
            labelEmail.TabIndex = 5;
            labelEmail.Text = "Email:";
            //
            // textBoxEmail
            //
            textBoxEmail.Location = new Point(90, 325);
            textBoxEmail.Name = "textBoxEmail";
            textBoxEmail.Size = new Size(220, 23);
            textBoxEmail.TabIndex = 6;
            //
            // buttonAnadir
            //
            buttonAnadir.Location = new Point(340, 252);
            buttonAnadir.Name = "buttonAnadir";
            buttonAnadir.Size = new Size(280, 32);
            buttonAnadir.TabIndex = 7;
            buttonAnadir.Text = "Afegir companyia";
            buttonAnadir.UseVisualStyleBackColor = true;
            buttonAnadir.Click += buttonAnadir_Click;
            //
            // buttonEliminar
            //
            buttonEliminar.Location = new Point(340, 289);
            buttonEliminar.Name = "buttonEliminar";
            buttonEliminar.Size = new Size(280, 32);
            buttonEliminar.TabIndex = 8;
            buttonEliminar.Text = "Esborrar companyia";
            buttonEliminar.UseVisualStyleBackColor = true;
            buttonEliminar.Click += buttonEliminar_Click;
            //
            // buttonTancar
            //
            buttonTancar.Location = new Point(340, 326);
            buttonTancar.Name = "buttonTancar";
            buttonTancar.Size = new Size(280, 32);
            buttonTancar.TabIndex = 9;
            buttonTancar.Text = "Tancar";
            buttonTancar.UseVisualStyleBackColor = true;
            buttonTancar.Click += buttonTancar_Click;
            //
            // labelAyuda
            //
            labelAyuda.Location = new Point(20, 370);
            labelAyuda.Name = "labelAyuda";
            labelAyuda.Size = new Size(600, 40);
            labelAyuda.TabIndex = 10;
            labelAyuda.Text = "Per afegir una companyia, omple els tres camps. Per esborrar-ne una, clica-la a la llista.\nEl nom ha de ser igual que el del fitxer de plans de vol (sense espais).";
            //
            // Gestion_companias
            //
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(640, 420);
            Controls.Add(labelAyuda);
            Controls.Add(buttonTancar);
            Controls.Add(buttonEliminar);
            Controls.Add(buttonAnadir);
            Controls.Add(textBoxEmail);
            Controls.Add(labelEmail);
            Controls.Add(textBoxTelefono);
            Controls.Add(labelTelefono);
            Controls.Add(textBoxNombre);
            Controls.Add(labelNombre);
            Controls.Add(tablaCompanias);
            Name = "Gestion_companias";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Companyies aèries";
            Load += Gestion_companias_Load;
            ((System.ComponentModel.ISupportInitialize)tablaCompanias).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private DataGridView tablaCompanias;
        private Label labelNombre;
        private TextBox textBoxNombre;
        private Label labelTelefono;
        private TextBox textBoxTelefono;
        private Label labelEmail;
        private TextBox textBoxEmail;
        private Button buttonAnadir;
        private Button buttonEliminar;
        private Button buttonTancar;
        private Label labelAyuda;
    }
}
