namespace WinFormsApp4
{
    partial class Form4
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
            panel1 = new Panel();
            button1 = new Button();
            button2 = new Button();
            labelConflicte = new Label();
            SuspendLayout();
            // 
            // panel1
            // 
            panel1.BackColor = Color.White;
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Location = new Point(11, 14);
            panel1.Margin = new Padding(3, 4, 3, 4);
            panel1.Name = "panel1";
            panel1.Size = new Size(799, 799);
            panel1.TabIndex = 0;
            panel1.Paint += panel1_Paint;
            // 
            // button1
            // 
            button1.Location = new Point(835, 37);
            button1.Margin = new Padding(3, 4, 3, 4);
            button1.Name = "button1";
            button1.Size = new Size(149, 54);
            button1.TabIndex = 1;
            button1.Text = "Moure un cicle";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            // 
            // button2
            // 
            button2.Location = new Point(835, 117);
            button2.Margin = new Padding(3, 4, 3, 4);
            button2.Name = "button2";
            button2.Size = new Size(149, 54);
            button2.TabIndex = 2;
            button2.Text = "Reiniciar";
            button2.UseVisualStyleBackColor = true;
            button2.Click += button2_Click;
            // 
            // labelConflicte
            // 
            labelConflicte.AutoSize = true;
            labelConflicte.Font = new Font("Segoe UI", 11F);
            labelConflicte.Location = new Point(835, 208);
            labelConflicte.Name = "labelConflicte";
            labelConflicte.Size = new Size(138, 25);
            labelConflicte.TabIndex = 3;
            labelConflicte.Text = "Sense conflicte";
            // 
            // Form4
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(1022, 821);
            Controls.Add(labelConflicte);
            Controls.Add(button2);
            Controls.Add(button1);
            Controls.Add(panel1);
            Margin = new Padding(3, 4, 3, 4);
            Name = "Form4";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Simulació";
            Load += Form4_Load;
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Panel panel1;
        private Button button1;
        private Button button2;
        private Label labelConflicte;
    }
}
