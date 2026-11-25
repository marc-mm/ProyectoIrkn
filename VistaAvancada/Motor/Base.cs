namespace VistaAvancada.Motor
{
    // Índexs de les fases de vol (ordre exacte del protocol amb el JavaScript) i els seus noms en català.
    public static class Fases
    {
        public const int Rodatge = 0, Enlairament = 1, Pujada = 2, Creuer = 3, Descens = 4, Aproximacio = 5, Aterrat = 6;
        public static readonly string[] Nombres =
            { "Rodatge", "Enlairament", "Pujada", "Creuer", "Descens", "Aproximació", "Aterrat" };

        // Retorna el nom de la fase (o "" si l'índex no és vàlid).
        public static string Nombre(int idx) => idx >= 0 && idx < Nombres.Length ? Nombres[idx] : "";
    }

    // Vista comuna d'un avió (simulat, en directe o del projecte) per a la detecció de conflictes i l'enviament a la pàgina.
    public interface IVueloVista
    {
        int Id { get; }
        string Callsign { get; }
        double Lat { get; }
        double Lon { get; }
        double AltitudFt { get; }
        double Rumbo { get; }
        double VelocidadKt { get; }
        double VelVerticalFpm { get; }
        int FaseIdx { get; }
        int AerolineaIdx { get; }
        // Cert si l'avió és a terra (rodatge, enlairament o ja aterrat)
        bool EnTierra { get; }
        // El detector el marca quan l'avió forma part d'algun conflicte actiu
        bool EnConflicto { get; set; }
    }

    // Avió que l'usuari pot pilotar des de la pàgina: mentre és manual, la posició la decideix el JavaScript.
    public interface IVueloPilotable
    {
        bool Manual { get; }
        // Fixa l'estat que envia la pàgina (graus, ft, graus, kt, ft/min) a l'hora simulada utc i posa l'avió en mode manual.
        void PonerManual(double lat, double lon, double altFt, double rumbo, double velKt, double vvFpm, DateTime utc);
        // Torna el control de l'avió a la simulació a l'hora simulada utc.
        void Liberar(DateTime utc);
    }

    // Rellotge simulat en UTC: comença a l'hora real i avança "Escala" segons simulats per segon real.
    public class Reloj
    {
        public DateTime HoraUtc = DateTime.UtcNow;
        public double Escala = 60;
        public bool Pausado;

        // Avança el rellotge segons el temps real transcorregut (en segons). Retorna els segons simulats que han passat
        // (0 si està en pausa).
        public double Avanzar(double segundosReales)
        {
            if (Pausado || segundosReales <= 0) return 0;
            double dt = segundosReales * Escala;
            HoraUtc = HoraUtc.AddTicks((long)(dt * TimeSpan.TicksPerSecond));
            return dt;
        }

        // Torna el rellotge a l'hora UTC real.
        public void PonerHoraReal() { HoraUtc = DateTime.UtcNow; }
    }

    // Instrucció d'ATC donada a un avió per resoldre un conflicte (es guarda per a l'informe).
    public class Instruccion
    {
        public DateTime Hora;                 // hora simulada UTC en què es dona
        public int IdVuelo;
        public string Callsign;
        public string NombreBd;               // nom de la companyia a la BD del projecte (per buscar-ne el contacte), pot ser null
        public string Texto;                  // p. ex. "IBE3145: pugi a FL370"
        public int IdA, IdB;                  // parella de vols en conflicte que ha motivat la instrucció
    }

    // Un conflicte entre dos avions (actiu o ja acabat).
    public class ConflictoActivo
    {
        public int IdA, IdB;
        public string CallsignA, CallsignB;
        public string NombreBdA, NombreBdB;
        public double DistNM, DifAltFt;       // valors actuals
        public double MinDistNM = double.MaxValue;
        public DateTime Detectado;
        public DateTime? Finalizado;
        public bool Activo = true;
        public Instruccion Instruccion;       // instrucció donada per resoldre'l (si n'hi ha)
    }

    // Parella en conflicte en un instant donat (sortida bruta del detector).
    public struct ParConflicto
    {
        public IVueloVista A, B;
        public double DistNM, DifAltFt;
    }

    // Font de trànsit aeri: simulat, en directe (OpenSky) o plans de vol del projecte.
    // Aquesta classe base té la part comuna: el rellotge, el detector de conflictes i el registre d'instruccions.
    public abstract class FuenteTrafico
    {
        public Reloj Reloj { get; protected set; }
        public DetectorConflictos Detector { get; } = new DetectorConflictos();
        public List<Instruccion> Instrucciones { get; } = new List<Instruccion>();

        // Es dispara quan la font vol mostrar un avís a l'usuari (nivell: info, ok, error; text en català).
        public event Action<string, string> Aviso;

        protected void AvisarUsuario(string nivel, string texto) => Aviso?.Invoke(nivel, texto);

        public abstract string Modo { get; }
        public abstract IReadOnlyList<IVueloVista> Vuelos { get; }

        // Busca un avió pel seu id (o null si ja no existeix).
        public abstract IVueloVista BuscarVuelo(int id);

        // Id de l'avió que pilota l'usuari des de la pàgina (-1 si no en pilota cap).
        public int IdPilotado { get; private set; } = -1;

        // Comença o actualitza el pilotatge manual d'un avió amb l'estat que envia la pàgina.
        // Retorna false si l'avió ja no existeix o no es pot pilotar.
        public bool Pilotar(int id, double lat, double lon, double altFt, double rumbo, double velKt, double vvFpm)
        {
            if (!(BuscarVuelo(id) is IVueloPilotable v))
            {
                if (id == IdPilotado) IdPilotado = -1;
                return false;
            }
            if (IdPilotado >= 0 && IdPilotado != id) DejarPilotar();
            IdPilotado = id;
            v.PonerManual(lat, lon, altFt, rumbo, velKt, vvFpm, Reloj.HoraUtc);
            return true;
        }

        // Torna el control de l'avió pilotat a la simulació (si n'hi ha cap).
        public void DejarPilotar()
        {
            if (IdPilotado < 0) return;
            if (BuscarVuelo(IdPilotado) is IVueloPilotable v) v.Liberar(Reloj.HoraUtc);
            IdPilotado = -1;
        }

        // Avança la font el temps real indicat (en segons) respectant l'escala i la pausa del rellotge.
        public abstract void Avanzar(double segundosReales);

        // Nom amb què la companyia de l'avió figura a la BD del projecte (null si no se sap).
        public abstract string NombreBdDe(IVueloVista v);

        // Nom llegible de la companyia de l'avió.
        public abstract string NombreAerolineaDe(IVueloVista v);

        // Intenta resoldre el conflicte entre dos avions; retorna la instrucció donada o null si no s'ha pogut.
        public abstract Instruccion ResolverConflicto(int idA, int idB);

        // Resol tots els conflictes actius. Retorna les instruccions donades.
        public virtual List<Instruccion> ResolverTodos()
        {
            var resultado = new List<Instruccion>();
            foreach (var c in Detector.Activos.ToList())
            {
                if (!c.Activo || c.Instruccion != null) continue;
                var ins = ResolverConflicto(c.IdA, c.IdB);
                if (ins != null) resultado.Add(ins);
            }
            return resultado;
        }

        // Registra una instrucció a la llista general i a la parella en conflicte corresponent.
        protected void RegistrarInstruccion(Instruccion ins)
        {
            Instrucciones.Add(ins);
            if (Detector.BuscarActivo(ins.IdA, ins.IdB) is ConflictoActivo c) c.Instruccion = ins;
        }

        // Allibera recursos (fils, connexions...) quan es tanca la finestra.
        public virtual void Dispose() { }
    }
}
