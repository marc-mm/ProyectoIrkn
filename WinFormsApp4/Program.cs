namespace WinFormsApp4
{
    internal static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            // Inicia l'aplicació obrint el formulari principal (Form1)
            ApplicationConfiguration.Initialize();
            Application.Run(new Form1());
        }
    }
}
