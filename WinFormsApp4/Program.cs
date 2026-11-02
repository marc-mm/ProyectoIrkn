namespace WinFormsApp4
{
    internal static class Program
    {
        // Punt d'entrada: obre el formulari principal.
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();
            Application.Run(new Programa_principal());
        }
    }
}
