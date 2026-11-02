using System;

namespace FlightLib
{
    // Llista de fins a 10 plans de vol.
    public class FlightPlanList
    {
        FlightPlan[] vector = new FlightPlan[10];
        int number = 0;

        // Afegeix el pla p. Retorna 0 si s'ha afegit o -1 si la llista és plena.
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

        // Retorna el pla de la posició i, o null si no existeix.
        public FlightPlan GetFlightPlan(int i)
        {
            if (i < 0 || i >= number)
                return null;
            else
                return vector[i];
        }

        public int GetNumber()
        { return number; }

        // Mou tots els avions de la llista durant el temps indicat.
        public void Move(double tiempo)
        {
            int i = 0;
            while (i < number)
            {
                vector[i].Move(tiempo);
                i++;
            }
        }

        // Mostra per consola tots els plans de la llista.
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
