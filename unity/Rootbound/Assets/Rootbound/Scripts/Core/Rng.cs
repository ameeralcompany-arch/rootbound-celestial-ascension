// The web game's seeded generator, bit for bit: s = (s * 1664525 + 1013904223) >>> 0, returned as s / 2^32.
// Using the same generator and seeds means a world name grows the same terrain in Unity as in the web version.
namespace Rootbound
{
    public sealed class Rng
    {
        uint s;

        public Rng(long seed)
        {
            s = unchecked((uint)seed);
        }

        public double Next()
        {
            s = unchecked(s * 1664525u + 1013904223u);
            return s / 4294967296.0;
        }

        // JS: (R() * n) | 0  for positive n
        public int Int(int n)
        {
            return (int)(Next() * n);
        }

        // JS: Math.round
        public static int Round(double v)
        {
            return (int)System.Math.Floor(v + 0.5);
        }
    }
}
