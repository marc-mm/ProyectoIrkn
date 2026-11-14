namespace WinFormsApp4
{
    internal static class Program
    {
        // Punt d'entrada: demana iniciar sessió i, si és correcte, obre el formulari principal.
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();

            Inicio_sesion login = new Inicio_sesion();
            login.ShowDialog();
            if (login.dame_autenticado())
                Application.Run(new Programa_principal(login.dame_usuario()));
        }
    }
}
