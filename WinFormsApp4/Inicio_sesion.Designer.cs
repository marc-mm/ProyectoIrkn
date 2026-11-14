namespace WinFormsApp4
{
    partial class Inicio_sesion
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
            labelTitulo = new Label();
            labelUsuario = new Label();
            labelContrasena = new Label();
            textBoxUsuario = new TextBox();
            textBoxContrasena = new TextBox();
            buttonEntrar = new Button();
            buttonRegistrar = new Button();
            labelAyuda = new Label();
            SuspendLayout();
            //
            // labelTitulo
            //
            labelTitulo.AutoSize = true;
            labelTitulo.Font = new Font("Segoe UI", 14F, FontStyle.Bold);
            labelTitulo.Location = new Point(30, 20);
            labelTitulo.Name = "labelTitulo";
            labelTitulo.Size = new Size(230, 25);
            labelTitulo.TabIndex = 0;
            labelTitulo.Text = "Deconflicting tool";
            //
            // labelUsuario
            //
            labelUsuario.AutoSize = true;
            labelUsuario.Location = new Point(30, 73);
            labelUsuario.Name = "labelUsuario";
            labelUsuario.Size = new Size(44, 15);
            labelUsuario.TabIndex = 1;
            labelUsuario.Text = "Usuari:";
            //
            // labelContrasena
            //
            labelContrasena.AutoSize = true;
            labelContrasena.Location = new Point(30, 113);
            labelContrasena.Name = "labelContrasena";
            labelContrasena.Size = new Size(72, 15);
            labelContrasena.TabIndex = 2;
            labelContrasena.Text = "Contrasenya:";
            //
            // textBoxUsuario
            //
            textBoxUsuario.Location = new Point(130, 70);
            textBoxUsuario.Name = "textBoxUsuario";
            textBoxUsuario.Size = new Size(160, 23);
            textBoxUsuario.TabIndex = 3;
            //
            // textBoxContrasena
            //
            textBoxContrasena.Location = new Point(130, 110);
            textBoxContrasena.Name = "textBoxContrasena";
            textBoxContrasena.PasswordChar = '*';
            textBoxContrasena.Size = new Size(160, 23);
            textBoxContrasena.TabIndex = 4;
            //
            // buttonEntrar
            //
            buttonEntrar.Location = new Point(30, 155);
            buttonEntrar.Name = "buttonEntrar";
            buttonEntrar.Size = new Size(120, 35);
            buttonEntrar.TabIndex = 5;
            buttonEntrar.Text = "Entrar";
            buttonEntrar.UseVisualStyleBackColor = true;
            buttonEntrar.Click += buttonEntrar_Click;
            //
            // buttonRegistrar
            //
            buttonRegistrar.Location = new Point(170, 155);
            buttonRegistrar.Name = "buttonRegistrar";
            buttonRegistrar.Size = new Size(120, 35);
            buttonRegistrar.TabIndex = 6;
            buttonRegistrar.Text = "Registrar-me";
            buttonRegistrar.UseVisualStyleBackColor = true;
            buttonRegistrar.Click += buttonRegistrar_Click;
            //
            // labelAyuda
            //
            labelAyuda.Location = new Point(30, 205);
            labelAyuda.Name = "labelAyuda";
            labelAyuda.Size = new Size(260, 35);
            labelAyuda.TabIndex = 7;
            labelAyuda.Text = "Si no tens compte, escriu un nom i una contrasenya nous i clica \"Registrar-me\".";
            //
            // Inicio_sesion
            //
            AcceptButton = buttonEntrar;
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(320, 255);
            Controls.Add(labelAyuda);
            Controls.Add(buttonRegistrar);
            Controls.Add(buttonEntrar);
            Controls.Add(textBoxContrasena);
            Controls.Add(textBoxUsuario);
            Controls.Add(labelContrasena);
            Controls.Add(labelUsuario);
            Controls.Add(labelTitulo);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            Name = "Inicio_sesion";
            StartPosition = FormStartPosition.CenterScreen;
            Text = "Inici de sessió";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label labelTitulo;
        private Label labelUsuario;
        private Label labelContrasena;
        private TextBox textBoxUsuario;
        private TextBox textBoxContrasena;
        private Button buttonEntrar;
        private Button buttonRegistrar;
        private Label labelAyuda;
    }
}
