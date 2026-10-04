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

        private Form1 mainForm; // L'IA m'ha ajudat per a fer aquest canvi, ja que abans no estava passant la referència del Form1 a Form2 i per això no podia accedir a les funcions de Form1.

        public Form2(Form1 owner) // Constructor que rep una referència al Form1, l'IA m'ha ajudat.
        {
            InitializeComponent();
            mainForm = owner;
        }

        public FlightPlan get_vol(string id, double cpx, double cpy, double fpx, double fpy, double velocidad)
        {
            return new FlightPlan(id, cpx, cpy, fpx, fpy, velocidad);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            mainForm.pon_flight1(get_vol(textBox_ID1.Text, double.Parse(textBoxCx1.Text), double.Parse(textBoxCy1.Text), double.Parse(textBoxFx1.Text), double.Parse(textBoxFy1.Text), double.Parse(textBoxV1.Text)));
            mainForm.pon_flight2(get_vol(textBox_ID2.Text, double.Parse(textBoxCx2.Text), double.Parse(textBoxCy2.Text), double.Parse(textBoxFx2.Text), double.Parse(textBoxFy2.Text), double.Parse(textBoxV2.Text)));
            Close();
        }
    }
}