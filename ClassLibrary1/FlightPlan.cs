using System;

namespace FlightLib
{
    public class FlightPlan
    {
        string id;
        string compania;
        Position initialPosition;
        Position currentPosition;
        Position finalPosition;
        double velocidad;

        // Crea un pla de vol a partir de l'id, la companyia, la posició inicial (ipx, ipy), la final (fpx, fpy)
        // i la velocitat. La posició actual comença a la inicial.
        public FlightPlan(string id, string compania, double ipx, double ipy, double fpx, double fpy, double velocidad)
        {
            this.id = id;
            this.compania = compania;
            this.initialPosition = new Position(ipx, ipy);
            this.currentPosition = new Position(ipx, ipy);
            this.finalPosition = new Position(fpx, fpy);
            this.velocidad = velocidad;
        }

        public string GetId()
        { return id; }

        public string GetCompania()
        { return compania; }

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

        public void SetCompania(string compania)
        { this.compania = compania; }

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

        // Retorna true si, des de l'inici, els dos vols arribaran a estar més a prop que la distància
        // de seguretat. Rep el vol b, la distància de seguretat i el temps de cicle (no es fa servir).
        // La separació entre els avions és x(t) = dx + vx·t, y(t) = dy + vy·t
        // i la distància d(t) = arrel(x(t)² + y(t)²). El de dins l'arrel és una paràbola:
        // d²(t) = (vx² + vy²)·t² + 2·(dx·vx + dy·vy)·t + (dx² + dy²)
        // Derivant i igualant a 0 surt el temps del mínim: t = -(dx·vx + dy·vy) / (vx² + vy²)
        // Com que cada avió s'atura quan arriba, hi ha dos trams amb la seva paràbola:
        // 1) volen tots dos, 2) només vola el que encara no ha arribat.
        // Deixa els dos avions a la posició inicial.
        public bool ConflictoFuturo(FlightPlan b, double distanciaSeguridad, double tiempoCiclo)
        {
            Restart();
            b.Restart();

            // Velocitat en X i Y de cada avió i temps que tarda a arribar (com a Move: velocidad / 60).
            // Un avió que no s'ha de moure té velocitat 0 i "vola" per sempre.
            double vxA = 0, vyA = 0, tA = double.MaxValue;
            double hipotenusaA = initialPosition.Distancia(finalPosition);
            if (hipotenusaA > 0 && velocidad > 0)
            {
                vxA = velocidad / 60 * (finalPosition.GetX() - initialPosition.GetX()) / hipotenusaA;
                vyA = velocidad / 60 * (finalPosition.GetY() - initialPosition.GetY()) / hipotenusaA;
                tA = hipotenusaA / (velocidad / 60);
            }

            double vxB = 0, vyB = 0, tB = double.MaxValue;
            double hipotenusaB = b.GetInitialPosition().Distancia(b.GetFinalPosition());
            if (hipotenusaB > 0 && b.GetVelocidad() > 0)
            {
                vxB = b.GetVelocidad() / 60 * (b.GetFinalPosition().GetX() - b.GetInitialPosition().GetX()) / hipotenusaB;
                vyB = b.GetVelocidad() / 60 * (b.GetFinalPosition().GetY() - b.GetInitialPosition().GetY()) / hipotenusaB;
                tB = hipotenusaB / (b.GetVelocidad() / 60);
            }

            double dx = b.GetInitialPosition().GetX() - initialPosition.GetX();
            double dy = b.GetInitialPosition().GetY() - initialPosition.GetY();
            double vx = vxB - vxA;
            double vy = vyB - vyA;

            double duracion = Math.Min(tA, tB);

            bool conflicto = false;
            for (int tramo = 1; tramo <= 2; tramo++)
            {
                // Mínim de la paràbola (derivada = 0)
                double t = 0;
                if (vx * vx + vy * vy != 0)
                    t = -(dx * vx + dy * vy) / (vx * vx + vy * vy);

                // Si cau fora del tram, el punt més proper és un extrem
                if (t < 0)
                    t = 0;
                if (t > duracion)
                    t = duracion;

                double x = dx + vx * t;
                double y = dy + vy * t;
                if (Math.Sqrt(x * x + y * y) < distanciaSeguridad)
                    conflicto = true;

                // Tram 2: separació quan arriba el primer i només es mou l'altre
                dx = dx + vx * duracion;
                dy = dy + vy * duracion;
                if (tA < tB)
                {
                    vx = vxB;
                    vy = vyB;
                }
                else
                {
                    vx = -vxA;
                    vy = -vyA;
                }
                duracion = Math.Abs(tA - tB);
            }
            return conflicto;
        }

        // Mostra per consola les dades del vol.
        public void EscribeConsola()
        {
            Console.WriteLine("******************************");
            Console.WriteLine("Dades del vol: ");
            Console.WriteLine("Identificador: {0}", id);
            Console.WriteLine("Companyia: {0}", compania);
            Console.WriteLine("Velocitat: {0:f2}", velocidad);
            Console.WriteLine("Posició actual: ({0:f2} -- {1:f2})", currentPosition.GetX(), currentPosition.GetY());
            if (HasArrived())
                Console.WriteLine("Ha arribat al destí");
            Console.WriteLine("******************************");
        }
    }
}
