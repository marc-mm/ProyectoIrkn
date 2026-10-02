using System.Xml.Linq;

namespace WinFormsApp4
{
    partial class Form2
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
            label4 = new Label();
            label5 = new Label();
            label6 = new Label();
            label7 = new Label();
            label8 = new Label();
            label9 = new Label();
            label10 = new Label();
            textBox_ID1 = new TextBox();
            textBoxCx1 = new TextBox();
            textBoxV1 = new TextBox();
            textBox_ID2 = new TextBox();
            textBoxV2 = new TextBox();
            textBoxCy1 = new TextBox();
            textBoxFx1 = new TextBox();
            textBoxFy1 = new TextBox();
            textBoxCx2 = new TextBox();
            textBoxCy2 = new TextBox();
            textBoxFx2 = new TextBox();
            textBoxFy2 = new TextBox();
            button1 = new Button();
            SuspendLayout();
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Font = new Font("Segoe UI", 20F);
            label1.Location = new Point(187, 51);
            label1.Name = "label1";
            label1.Size = new Size(94, 46);
            label1.TabIndex = 0;
            label1.Text = "Vol 1";
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Font = new Font("Segoe UI", 20F);
            label2.Location = new Point(592, 51);
            label2.Name = "label2";
            label2.Size = new Size(94, 46);
            label2.TabIndex = 1;
            label2.Text = "Vol 2";
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Location = new Point(101, 141);
            label3.Name = "label3";
            label3.Size = new Size(27, 20);
            label3.TabIndex = 2;
            label3.Text = "ID:";
            // 
            // label4
            // 
            label4.AutoSize = true;
            label4.Location = new Point(492, 141);
            label4.Name = "label4";
            label4.Size = new Size(27, 20);
            label4.TabIndex = 3;
            label4.Text = "ID:";
            // 
            // label5
            // 
            label5.AutoSize = true;
            label5.Location = new Point(12, 215);
            label5.Name = "label5";
            label5.Size = new Size(116, 20);
            label5.TabIndex = 4;
            label5.Text = "Current Position:";
            // 
            // label6
            // 
            label6.AutoSize = true;
            label6.Location = new Point(403, 215);
            label6.Name = "label6";
            label6.Size = new Size(116, 20);
            label6.TabIndex = 5;
            label6.Text = "Current Position:";
            // 
            // label7
            // 
            label7.AutoSize = true;
            label7.Location = new Point(29, 299);
            label7.Name = "label7";
            label7.Size = new Size(99, 20);
            label7.TabIndex = 6;
            label7.Text = "Final Position:";
            // 
            // label8
            // 
            label8.AutoSize = true;
            label8.Location = new Point(420, 299);
            label8.Name = "label8";
            label8.Size = new Size(99, 20);
            label8.TabIndex = 7;
            label8.Text = "Final Position:";
            // 
            // label9
            // 
            label9.AutoSize = true;
            label9.Location = new Point(64, 378);
            label9.Name = "label9";
            label9.Size = new Size(64, 20);
            label9.TabIndex = 8;
            label9.Text = "Velocity:";
            // 
            // label10
            // 
            label10.AutoSize = true;
            label10.Location = new Point(455, 378);
            label10.Name = "label10";
            label10.Size = new Size(64, 20);
            label10.TabIndex = 9;
            label10.Text = "Velocity:";
            // 
            // textBox_ID1
            // 
            textBox_ID1.Location = new Point(175, 138);
            textBox_ID1.Name = "textBox_ID1";
            textBox_ID1.Size = new Size(125, 27);
            textBox_ID1.TabIndex = 10;
            // 
            // textBoxCx1
            // 
            textBoxCx1.Location = new Point(175, 212);
            textBoxCx1.Name = "textBoxCx1";
            textBoxCx1.Size = new Size(38, 27);
            textBoxCx1.TabIndex = 11;
            textBoxCx1.Text = "x";
            // 
            // textBoxV1
            // 
            textBoxV1.Location = new Point(175, 378);
            textBoxV1.Name = "textBoxV1";
            textBoxV1.Size = new Size(125, 27);
            textBoxV1.TabIndex = 13;
            // 
            // textBox_ID2
            // 
            textBox_ID2.Location = new Point(575, 138);
            textBox_ID2.Name = "textBox_ID2";
            textBox_ID2.Size = new Size(125, 27);
            textBox_ID2.TabIndex = 14;
            // 
            // textBoxV2
            // 
            textBoxV2.Location = new Point(575, 378);
            textBoxV2.Name = "textBoxV2";
            textBoxV2.Size = new Size(125, 27);
            textBoxV2.TabIndex = 17;
            // 
            // textBoxCy1
            // 
            textBoxCy1.Location = new Point(262, 212);
            textBoxCy1.Name = "textBoxCy1";
            textBoxCy1.Size = new Size(38, 27);
            textBoxCy1.TabIndex = 18;
            textBoxCy1.Text = "y";
            // 
            // textBoxFx1
            // 
            textBoxFx1.Location = new Point(175, 296);
            textBoxFx1.Name = "textBoxFx1";
            textBoxFx1.Size = new Size(38, 27);
            textBoxFx1.TabIndex = 19;
            textBoxFx1.Text = "x";
            // 
            // textBoxFy1
            // 
            textBoxFy1.Location = new Point(262, 296);
            textBoxFy1.Name = "textBoxFy1";
            textBoxFy1.Size = new Size(38, 27);
            textBoxFy1.TabIndex = 20;
            textBoxFy1.Text = "y";
            // 
            // textBoxCx2
            // 
            textBoxCx2.Location = new Point(575, 212);
            textBoxCx2.Name = "textBoxCx2";
            textBoxCx2.Size = new Size(38, 27);
            textBoxCx2.TabIndex = 21;
            textBoxCx2.Text = "x";
            // 
            // textBoxCy2
            // 
            textBoxCy2.Location = new Point(662, 212);
            textBoxCy2.Name = "textBoxCy2";
            textBoxCy2.Size = new Size(38, 27);
            textBoxCy2.TabIndex = 22;
            textBoxCy2.Text = "y";
            // 
            // textBoxFx2
            // 
            textBoxFx2.Location = new Point(575, 296);
            textBoxFx2.Name = "textBoxFx2";
            textBoxFx2.Size = new Size(38, 27);
            textBoxFx2.TabIndex = 23;
            textBoxFx2.Text = "x";
            // 
            // textBoxFy2
            // 
            textBoxFy2.Location = new Point(662, 296);
            textBoxFy2.Name = "textBoxFy2";
            textBoxFy2.Size = new Size(38, 27);
            textBoxFy2.TabIndex = 24;
            textBoxFy2.Text = "y";
            // 
            // button1
            // 
            button1.Location = new Point(303, 449);
            button1.Name = "button1";
            button1.Size = new Size(172, 70);
            button1.TabIndex = 25;
            button1.Text = "Tornar";
            button1.UseVisualStyleBackColor = true;
            // 
            // Form2
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 547);
            Controls.Add(button1);
            Controls.Add(textBoxFy2);
            Controls.Add(textBoxFx2);
            Controls.Add(textBoxCy2);
            Controls.Add(textBoxCx2);
            Controls.Add(textBoxFy1);
            Controls.Add(textBoxFx1);
            Controls.Add(textBoxCy1);
            Controls.Add(textBoxV2);
            Controls.Add(textBox_ID2);
            Controls.Add(textBoxV1);
            Controls.Add(textBoxCx1);
            Controls.Add(textBox_ID1);
            Controls.Add(label10);
            Controls.Add(label9);
            Controls.Add(label8);
            Controls.Add(label7);
            Controls.Add(label6);
            Controls.Add(label5);
            Controls.Add(label4);
            Controls.Add(label3);
            Controls.Add(label2);
            Controls.Add(label1);
            Name = "Form2";
            Text = "Form2";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label label1;
        private Label label2;
        private Label label3;
        private Label label4;
        private Label label5;
        private Label label6;
        private Label label7;
        private Label label8;
        private Label label9;
        private Label label10;
        private TextBox textBox_ID1;
        private TextBox textBoxCx1;
        private TextBox textBoxV1;
        private TextBox textBox_ID2;
        private TextBox textBoxV2;
        private TextBox textBoxCy1;
        private TextBox textBoxFx1;
        private TextBox textBoxFy1;
        private TextBox textBoxCx2;
        private TextBox textBoxCy2;
        private TextBox textBoxFx2;
        private TextBox textBoxFy2;
        private Button button1;
    }
}