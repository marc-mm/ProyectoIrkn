using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;


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
            cpx = Convert.ToDouble(textBox_CPX1.Text);
            cpy = Convert.ToDouble(textBox_CPY1.Text);
            fpx = Convert.ToDouble(textBox_FPX1.Text);
            fpy = Convert.ToDouble(textBox_FPY1.Text);
            velocidad = Convert.ToDouble(textBox_Velocidad1.Text);
        }
    }
}