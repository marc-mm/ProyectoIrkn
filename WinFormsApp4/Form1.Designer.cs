using System.Xml.Linq;
using static System.Net.Mime.MediaTypeNames;

namespace WinFormsApp4
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
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
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            menuStrip1 = new MenuStrip();
            opcionsToolStripMenuItem = new ToolStripMenuItem();
            informacióVolsToolStripMenuItem = new ToolStripMenuItem();
            dadesSimulacióToolStripMenuItem = new ToolStripMenuItem();
            simulacióToolStripMenuItem = new ToolStripMenuItem();
            menuStrip1.SuspendLayout();
            SuspendLayout();
            // 
            // menuStrip1
            // 
            menuStrip1.ImageScalingSize = new Size(20, 20);
            menuStrip1.Items.AddRange(new ToolStripItem[] { opcionsToolStripMenuItem });
            menuStrip1.Location = new Point(0, 0);
            menuStrip1.Name = "menuStrip1";
            menuStrip1.Size = new Size(670, 28);
            menuStrip1.TabIndex = 0;
            menuStrip1.Text = "menuStrip1";
            // 
            // opcionsToolStripMenuItem
            // 
            opcionsToolStripMenuItem.DropDownItems.AddRange(new ToolStripItem[] { informacióVolsToolStripMenuItem, dadesSimulacióToolStripMenuItem, simulacióToolStripMenuItem });
            opcionsToolStripMenuItem.Name = "opcionsToolStripMenuItem";
            opcionsToolStripMenuItem.Size = new Size(108, 24);
            opcionsToolStripMenuItem.Text = "Configuració";
            // 
            // informacióVolsToolStripMenuItem
            // 
            informacióVolsToolStripMenuItem.Name = "informacióVolsToolStripMenuItem";
            informacióVolsToolStripMenuItem.Size = new Size(224, 26);
            informacióVolsToolStripMenuItem.Text = "Informació Vols";
            informacióVolsToolStripMenuItem.Click += informacióVolsToolStripMenuItem_Click;
            // 
            // dadesSimulacióToolStripMenuItem
            // 
            dadesSimulacióToolStripMenuItem.Name = "dadesSimulacióToolStripMenuItem";
            dadesSimulacióToolStripMenuItem.Size = new Size(224, 26);
            dadesSimulacióToolStripMenuItem.Text = "Dades Simulació";
            dadesSimulacióToolStripMenuItem.Click += dadesSimulacióToolStripMenuItem_Click;
            // 
            // simulacióToolStripMenuItem
            // 
            simulacióToolStripMenuItem.Name = "simulacióToolStripMenuItem";
            simulacióToolStripMenuItem.Size = new Size(224, 26);
            simulacióToolStripMenuItem.Text = "Simulació";
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(670, 639);
            Controls.Add(menuStrip1);
            MainMenuStrip = menuStrip1;
            Name = "Form1";
            Text = "Form1";
            menuStrip1.ResumeLayout(false);
            menuStrip1.PerformLayout();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private MenuStrip menuStrip1;
        private ToolStripMenuItem opcionsToolStripMenuItem;
        private ToolStripMenuItem informacióVolsToolStripMenuItem;
        private ToolStripMenuItem dadesSimulacióToolStripMenuItem;
        private ToolStripMenuItem simulacióToolStripMenuItem;
    }
}