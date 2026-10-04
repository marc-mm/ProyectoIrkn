using System;

namespace FlightLib
{
    // Llista (vector) de plans de vol
    public class FlightPlanList
    {
        FlightPlan[] vector = new FlightPlan[10];
        int number = 0; // quants plans hi ha a la llista

        // Afegeix un pla. Retorna -1 si la llista és plena, 0 si tot va bé
        public int AddFlightPlan(FlightPlan p)
        {
            if (number == 10)
                return -1;
            else
            {
                vector[number] = p;
                number++;
                return 0;
            }
        }

        // Retorna el pla de la posició i (o null si no existeix)
        public FlightPlan GetFlightPlan(int i)
        {
            if (i < 0 || i >= number)
                return null;
            else
                return vector[i];
        }

        // Retorna quants plans hi ha
        public int GetNumber()
        { return number; }

        // Mou tots els avions de la llista
        public void Move(double tiempo)
        {
            int i = 0;
            while (i < number)
            {
                vector[i].Move(tiempo);
                i++;
            }
        }

        // Escriu tots els plans a la consola
        public void EscribeConsola()
        {
            int i = 0;
            while (i < number)
            {
                vector[i].EscribeConsola();
                i++;
            }
        }
    }
}
