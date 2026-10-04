using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace WinFormsApp4
{
    public partial class Form4 : Form
    {
        public Form4()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            try
            {
                double distancia = Convert.ToDouble(textBoxDistancia.Text);
                double ciclo = Convert.ToDouble(textBoxCiclo.Text);

                if (distancia <= 0 || ciclo <= 0)
                {
                    MessageBox.Show("Values have to be bigger than 0");
                }
                else
                {
                    MessageBox.Show("Values saved correctly");
                    this.Close();
                }
            }
            catch
            {
                MessageBox.Show("Error: introduce only numbers in the two fields");
            }
        }
    }
}
