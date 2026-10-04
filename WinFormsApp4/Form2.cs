using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using FlightLib;


namespace WinFormsApp4
{
    public partial class Form2 : Form
    {
        public Form2()
        {
            InitializeComponent();
        }
        public FlightPlan get_vol(string id, double cpx, double cpy, double fpx, double fpy, double velocidad)
        {
            id = textBox_ID1.Text;
            cpx = Convert.ToDouble(textBoxCx1.Text);
            cpy = Convert.ToDouble(textBoxCy1.Text);
            fpx = Convert.ToDouble(textBoxFx1.Text);
            fpy = Convert.ToDouble(textBoxFy1.Text);
            velocidad = Convert.ToDouble(textBoxV1.Text);
            return new FlightPlan(id, cpx, cpy, fpx, fpy, velocidad);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}