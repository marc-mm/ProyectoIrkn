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

        public void Move(double tiempo)
        {
            
            if (HasArrived())
                return;

            
            double distancia = tiempo * this.velocidad / 60;

            
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

        
        public Boolean HasArrived()
        {
            bool resultat = false;
            if (currentPosition.Distancia(finalPosition) == 0)
                resultat = true;
            return resultat;
        }

        
        public void Restart()
        {
            currentPosition = new Position(initialPosition.GetX(), initialPosition.GetY());
        }

        
        public double Distance(FlightPlan plan)
        {
            return currentPosition.Distancia(plan.GetCurrentPosition());
        }

        
        public bool Conflicto(FlightPlan b, double distanciaSeguridad)
        {
            bool conflicto = false;
            if (Distance(b) < distanciaSeguridad)
                conflicto = true;
            return conflicto;
        }

        
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
