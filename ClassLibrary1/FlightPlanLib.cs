using System;
using System.Collections.Generic;
using System.IO;

namespace FlightLib
{
    // Llista de plans de vol. També guarda l'historial de posicions per poder desfer passos de la simulació.
    public class FlightPlanList
    {
        List<FlightPlan> vuelos = new List<FlightPlan>();
        Stack<Position> historial = new Stack<Position>();

        public void AddFlightPlan(FlightPlan p)
        {
            vuelos.Add(p);
        }

        // Retorna el pla de la posició i, o null si no existeix.
        public FlightPlan GetFlightPlan(int i)
        {
            if (i < 0 || i >= vuelos.Count)
                return null;
            else
                return vuelos[i];
        }

        public int GetNumber()
        {
            return vuelos.Count;
        }

        // Llegeix els plans de vol d'un fitxer de text i els afegeix a la llista.
        // Cada línia és un vol: id companyia xInicial yInicial xFinal yFinal velocitat (separats per espais).
        // Retorna 0 si tot va bé, -1 si el fitxer no existeix, o el número de la línia que té un error.
        public int CargarFichero(string nombreFichero)
        {
            StreamReader lector;
            try
            {
                lector = new StreamReader(nombreFichero);
            }
            catch (FileNotFoundException)
            {
                return -1;
            }

            int numLinea = 0;
            try
            {
                string linea = lector.ReadLine();
                while (linea != null)
                {
                    numLinea++;
                    if (linea != "")
                    {
                        string[] trozos = linea.Split(' ');
                        if (trozos.Length != 7)
                        {
                            lector.Close();
                            return numLinea;
                        }

                        double ix = Convert.ToDouble(trozos[2]);
                        double iy = Convert.ToDouble(trozos[3]);
                        double fx = Convert.ToDouble(trozos[4]);
                        double fy = Convert.ToDouble(trozos[5]);
                        double velocidad = Convert.ToDouble(trozos[6]);

                        if (velocidad <= 0 || !CoordenadaCorrecta(ix) || !CoordenadaCorrecta(iy) ||
                            !CoordenadaCorrecta(fx) || !CoordenadaCorrecta(fy))
                        {
                            lector.Close();
                            return numLinea;
                        }

                        vuelos.Add(new FlightPlan(trozos[0], trozos[1], ix, iy, fx, fy, velocidad));
                    }
                    linea = lector.ReadLine();
                }
                lector.Close();
                return 0;
            }
            catch (FormatException)
            {
                lector.Close();
                return numLinea;
            }
        }

        // Guarda la llista en un fitxer amb el mateix format que CargarFichero. Com a posició inicial
        // s'escriu la posició actual, així en carregar-lo la simulació continua des d'on s'havia aturat.
        // Retorna 0 si s'ha guardat o -1 si no s'ha pogut escriure el fitxer.
        public int GuardarFichero(string nombreFichero)
        {
            try
            {
                StreamWriter escritor = new StreamWriter(nombreFichero);
                foreach (FlightPlan vuelo in vuelos)
                {
                    escritor.WriteLine(vuelo.GetId() + " " + vuelo.GetCompania() + " " +
                        vuelo.GetCurrentPosition().GetX() + " " + vuelo.GetCurrentPosition().GetY() + " " +
                        vuelo.GetFinalPosition().GetX() + " " + vuelo.GetFinalPosition().GetY() + " " +
                        vuelo.GetVelocidad());
                }
                escritor.Close();
                return 0;
            }
            catch (Exception)
            {
                return -1;
            }
        }

        // Retorna true si la coordenada c està dins de l'espai aeri (entre 0 i 799).
        private bool CoordenadaCorrecta(double c)
        {
            return c >= 0 && c <= 799;
        }

        // Mou tots els avions durant el temps indicat. Abans de moure cada avió en guarda la posició
        // a l'historial perquè el pas es pugui desfer.
        public void Move(double tiempo)
        {
            foreach (FlightPlan vuelo in vuelos)
            {
                historial.Push(vuelo.GetCurrentPosition());
                vuelo.Move(tiempo);
            }
        }

        // Desfà l'últim pas: torna cada avió a la posició que tenia abans de l'últim Move.
        // Retorna false si no hi ha cap pas per desfer.
        public bool Deshacer()
        {
            if (historial.Count == 0)
                return false;

            // Les posicions surten de la pila en ordre invers al que van entrar: de l'últim vol al primer
            int i = vuelos.Count - 1;
            while (i >= 0)
            {
                vuelos[i].SetCurrentPosition(historial.Pop());
                i--;
            }
            return true;
        }

        // Torna tots els avions a la posició inicial i esborra l'historial.
        public void Restart()
        {
            foreach (FlightPlan vuelo in vuelos)
                vuelo.Restart();
            historial.Clear();
        }

        // Retorna true si tots els avions han arribat al destí.
        public bool TodosHanLlegado()
        {
            bool todos = true;
            int i = 0;
            while (i < vuelos.Count && todos)
            {
                if (!vuelos[i].HasArrived())
                    todos = false;
                i++;
            }
            return todos;
        }

        // Retorna true si ara mateix el vol i està en conflicte amb algun altre vol.
        public bool EnConflicto(int i, double distanciaSeguridad)
        {
            bool conflicto = false;
            int j = 0;
            while (j < vuelos.Count && !conflicto)
            {
                if (j != i && vuelos[i].Conflicto(vuelos[j], distanciaSeguridad))
                    conflicto = true;
                j++;
            }
            return conflicto;
        }

        // Retorna les parelles de vols que ara mateix estan en conflicte (ex: "IB101-VY202 "),
        // o "" si no n'hi ha cap.
        public string ConflictosActuales(double distanciaSeguridad)
        {
            string parejas = "";
            int i = 0;
            while (i < vuelos.Count)
            {
                int j = i + 1;
                while (j < vuelos.Count)
                {
                    if (vuelos[i].Conflicto(vuelos[j], distanciaSeguridad))
                        parejas = parejas + vuelos[i].GetId() + "-" + vuelos[j].GetId() + " ";
                    j++;
                }
                i++;
            }
            return parejas;
        }

        // Retorna les parelles de vols que tindran conflicte si se simula des de l'inici (una per línia),
        // o "" si no n'hi haurà cap. Deixa la simulació reiniciada.
        public string ConflictosFuturos(double distanciaSeguridad, double tiempoCiclo)
        {
            string parejas = "";
            int i = 0;
            while (i < vuelos.Count)
            {
                int j = i + 1;
                while (j < vuelos.Count)
                {
                    if (vuelos[i].ConflictoFuturo(vuelos[j], distanciaSeguridad, tiempoCiclo))
                        parejas = parejas + vuelos[i].GetId() + " i " + vuelos[j].GetId() + "\n";
                    j++;
                }
                i++;
            }
            Restart();
            return parejas;
        }

        // Retorna true si el vol i tindrà conflicte amb algun altre vol si se simula des de l'inici.
        // Deixa la simulació reiniciada.
        public bool ConflictoFuturo(int i, double distanciaSeguridad, double tiempoCiclo)
        {
            bool conflicto = false;
            int j = 0;
            while (j < vuelos.Count && !conflicto)
            {
                if (j != i && vuelos[i].ConflictoFuturo(vuelos[j], distanciaSeguridad, tiempoCiclo))
                    conflicto = true;
                j++;
            }
            Restart();
            return conflicto;
        }

        // Busca una velocitat per al vol i amb la qual no tingui conflicte amb cap altre vol. Prova variacions
        // del 5% en 5% (alternant més lent i més ràpid) fins a ±95%. Retorna la velocitat trobada (arrodonida
        // a 2 decimals) o -1 si no n'hi ha cap. La velocitat del vol no es modifica.
        public double BuscarVelocidad(int i, double distanciaSeguridad, double tiempoCiclo)
        {
            FlightPlan vuelo = vuelos[i];
            double original = vuelo.GetVelocidad();
            double encontrada = -1;
            int k = 1;

            while (k <= 19 && encontrada == -1)
            {
                vuelo.SetVelocidad(Math.Round(original * (1 - 0.05 * k), 2));
                if (!ConflictoFuturo(i, distanciaSeguridad, tiempoCiclo))
                    encontrada = vuelo.GetVelocidad();
                else
                {
                    vuelo.SetVelocidad(Math.Round(original * (1 + 0.05 * k), 2));
                    if (!ConflictoFuturo(i, distanciaSeguridad, tiempoCiclo))
                        encontrada = vuelo.GetVelocidad();
                }
                k++;
            }

            vuelo.SetVelocidad(original);
            return encontrada;
        }

        // Mostra per consola tots els plans de la llista.
        public void EscribeConsola()
        {
            foreach (FlightPlan vuelo in vuelos)
                vuelo.EscribeConsola();
        }
    }
}
