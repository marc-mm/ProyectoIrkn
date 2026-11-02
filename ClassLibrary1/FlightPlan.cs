using System;

namespace FlightLib
{
    public class FlightPlan
    {
        string id;
        Position initialPosition;
        Position currentPosition;
        Position finalPosition;
        double velocidad;

        // Crea un pla de vol a partir de l'id, la posició inicial (ipx, ipy), la final (fpx, fpy) i la velocitat.
        // La posició actual comença a la inicial.
        public FlightPlan(string id, double ipx, double ipy, double fpx, double fpy, double velocidad)
        {
            this.id = id;
            this.initialPosition = new Position(ipx, ipy);
            this.currentPosition = new Position(ipx, ipy);
            this.finalPosition = new Position(fpx, fpy);
            this.velocidad = velocidad;
        }

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

        // Avança l'avió cap al destí durant el temps indicat (en minuts, amb velocitat per hora).
        // Si la distància a recórrer supera la que queda, el deixa just al destí.
        public void Move(double tiempo)
        {
            if (HasArrived())
                return;

            double distancia = tiempo * this.velocidad / 60;

            // Direcció del moviment com a cosinus i sinus de l'angle cap al destí
            double hipotenusa = currentPosition.Distancia(finalPosition);
            double coseno = (finalPosition.GetX() - currentPosition.GetX()) / hipotenusa;
            double seno = (finalPosition.GetY() - currentPosition.GetY()) / hipotenusa;

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

        // Retorna true si l'avió és a la posició final.
        public Boolean HasArrived()
        {
            bool resultat = false;
            if (currentPosition.Distancia(finalPosition) == 0)
                resultat = true;
            return resultat;
        }

        // Torna l'avió a la posició inicial.
        public void Restart()
        {
            currentPosition = new Position(initialPosition.GetX(), initialPosition.GetY());
        }

        // Retorna la distància actual entre aquest avió i el del pla rebut.
        public double Distance(FlightPlan plan)
        {
            return currentPosition.Distancia(plan.GetCurrentPosition());
        }

        // Retorna true si ara mateix els dos avions estan més a prop que la distància de seguretat.
        public bool Conflicto(FlightPlan b, double distanciaSeguridad)
        {
            bool conflicto = false;
            if (Distance(b) < distanciaSeguridad)
                conflicto = true;
            return conflicto;
        }

        // Simula els dos vols des de l'inici fins que arriben tots dos i retorna true si en algun
        // moment hi ha conflicte. Rep el vol b, la distància de seguretat i el temps de cicle.
        // Deixa els dos avions a la posició inicial.
        public bool ConflictoFuturo(FlightPlan b, double distanciaSeguridad, double tiempoCiclo)
        {
            Restart();
            b.Restart();

            // Pas d'una centèsima de cicle perquè no s'escapi un conflicte entre dos cicles
            double paso = tiempoCiclo / 100;

            bool conflicto = Conflicto(b, distanciaSeguridad);
            while (!conflicto && !(HasArrived() && b.HasArrived()))
            {
                Move(paso);
                b.Move(paso);
                if (Conflicto(b, distanciaSeguridad))
                    conflicto = true;
            }

            Restart();
            b.Restart();
            return conflicto;
        }

        // Mostra per consola les dades del vol.
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
