using System;

namespace FlightLib
{
    public class FlightPlan
    {
        // Atributs
        string id;                 // identificador del vol
        Position initialPosition;  // posició inicial (per poder fer Restart)
        Position currentPosition;  // posició actual
        Position finalPosition;    // posició final (destí)
        double velocidad;          // velocitat

        // Constructor: inicialitza tots els atributs
        public FlightPlan(string id, double ipx, double ipy, double fpx, double fpy, double velocidad)
        {
            this.id = id;
            this.initialPosition = new Position(ipx, ipy);
            this.currentPosition = new Position(ipx, ipy); // al principi l'avió és a la posició inicial
            this.finalPosition = new Position(fpx, fpy);
            this.velocidad = velocidad;
        }

        // ----- Gets -----
        public string GetId()
        { return id; }

        public Position GetInitialPosition()
        { return initialPosition; }

        public Position GetCurrentPosition()
        { return currentPosition; }

        public Position GetFinalPosition()
        { return finalPosition; }

        public double GetVelocidad()
        { return velocidad; }

        // ----- Sets -----
        public void SetId(string id)
        { this.id = id; }

        public void SetInitialPosition(Position p)
        { this.initialPosition = p; }

        public void SetCurrentPosition(Position p)
        { this.currentPosition = p; }

        public void SetFinalPosition(Position p)
        { this.finalPosition = p; }

        public void SetVelocidad(double velocidad)
        { this.velocidad = velocidad; }

        // ----- Mètodes -----

        // Mou l'avió el que recorre durant el temps rebut
        public void Move(double tiempo)
        {
            // Si ja ha arribat no el movem
            if (HasArrived())
                return;

            // Distància que recorre en aquest temps
            double distancia = tiempo * this.velocidad / 60;

            // Distància que li falta fins al destí, i el sinus i cosinus de la direcció
            double hipotenusa = currentPosition.Distancia(finalPosition);
            double coseno = (finalPosition.GetX() - currentPosition.GetX()) / hipotenusa;
            double seno = (finalPosition.GetY() - currentPosition.GetY()) / hipotenusa;

            // Si amb aquest moviment arribem (o ens passem), el posem directament al destí
            if (distancia >= hipotenusa)
            {
                currentPosition = new Position(finalPosition.GetX(), finalPosition.GetY());
            }
            else
            {
                double x = currentPosition.GetX() + distancia * coseno;
                double y = currentPosition.GetY() + distancia * seno;
                currentPosition = new Position(x, y);
            }
        }

        // Retorna true si l'avió ha arribat al destí
        public Boolean HasArrived()
        {
            bool resultat = false;
            if (currentPosition.Distancia(finalPosition) == 0)
                resultat = true;
            return resultat;
        }

        // Torna a posar l'avió a la posició inicial
        public void Restart()
        {
            currentPosition = new Position(initialPosition.GetX(), initialPosition.GetY());
        }

        // Retorna la distància entre aquest avió i el que rebem
        public double Distance(FlightPlan plan)
        {
            return currentPosition.Distancia(plan.GetCurrentPosition());
        }

        // Retorna true si els dos avions estan més a prop que la distància de seguretat
        public bool Conflicto(FlightPlan b, double distanciaSeguridad)
        {
            bool conflicto = false;
            if (Distance(b) < distanciaSeguridad)
                conflicto = true;
            return conflicto;
        }

        // Escriu les dades a la consola (de la versió en consola)
        public void EscribeConsola()
        {
            Console.WriteLine("******************************");
            Console.WriteLine("Dades del vol: ");
            Console.WriteLine("Identificador: {0}", id);
            Console.WriteLine("Velocitat: {0:f2}", velocidad);
            Console.WriteLine("Posició actual: ({0:f2} -- {1:f2})", currentPosition.GetX(), currentPosition.GetY());
            if (HasArrived())
                Console.WriteLine("Ha arribat al destí");
            Console.WriteLine("******************************");
        }
    }
}
