using System;

namespace FlightLib
{
    public class Position
    {
        double x;
        double y;

        public Position(double x, double y)
        {
            this.x = x;
            this.y = y;
        }

        public double GetX()
        { return x; }

        public double GetY()
        { return y; }

        public void SetX(double x)
        { this.x = x; }

        public void SetY(double y)
        { this.y = y; }

        // Retorna la distància euclidiana entre aquesta posició i b.
        public double Distancia(Position b)
        {
            double resultat = Math.Sqrt((x - b.x) * (x - b.x) + (y - b.y) * (y - b.y));
            return resultat;
        }
    }
}
