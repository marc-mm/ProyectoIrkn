using System;

namespace FlightLib
{
    public class Position
    {
        // Atributs
        double x; // coordenada X
        double y; // coordenada Y

        // Constructor
        public Position(double x, double y)
        {
            this.x = x;
            this.y = y;
        }

        // Gets i Sets
        public double GetX()
        { return x; }

        public double GetY()
        { return y; }

        public void SetX(double x)
        { this.x = x; }

        public void SetY(double y)
        { this.y = y; }

        // Retorna la distància entre aquesta posició i la posició b
        public double Distancia(Position b)
        {
            double resultat = Math.Sqrt((x - b.x) * (x - b.x) + (y - b.y) * (y - b.y));
            return resultat;
        }
    }
}
