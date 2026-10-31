// Items you carry, keyed like the web game: block / material ids as numbers ("3"), tools as "w:<id>".
// The four mining tools are always owned; the hotbar has nine slots.
using System.Collections.Generic;
using System.Linq;

namespace Rootbound
{
    public sealed class Inventory
    {
        public readonly Dictionary<string, int> Items = new Dictionary<string, int>();
        public readonly string[] Hotbar = { "w:pip", "w:pebble", "w:glimmer", "w:twiggy", null, null, null, null, null };
        public int Selected;
        public long Gems;

        public static bool IsTool(string k)
        {
            return k != null && k.StartsWith("w:");
        }

        public static int BlockOf(string k)
        {
            int id;
            return k != null && !IsTool(k) && int.TryParse(k, out id) && id > 0 && id < 256 && GameData.Block(id) != null ? id : 0;
        }

        public int Count(string k)
        {
            if (k == null) return 0;
            if (IsTool(k)) return 1;
            int n;
            return Items.TryGetValue(k, out n) ? n : 0;
        }

        public void Add(string k, int n)
        {
            if (IsTool(k) || n <= 0) return;
            Items[k] = Count(k) + n;
            // a newly found block fills the first empty block slot
            if (BlockOf(k) != 0 && !Hotbar.Contains(k))
                for (int i = 4; i < Hotbar.Length; i++)
                    if (Hotbar[i] == null || Count(Hotbar[i]) == 0) { Hotbar[i] = k; break; }
        }

        public bool Take(string k, int n)
        {
            int c = Count(k);
            if (IsTool(k) || c < n) return false;
            if (c == n) Items.Remove(k);
            else Items[k] = c - n;
            return true;
        }

        public string Held
        {
            get { return Hotbar[Selected]; }
        }

        public IEnumerable<string> Sorted()
        {
            return Items.Where(kv => kv.Value > 0).Select(kv => kv.Key).OrderBy(k => { int id; return int.TryParse(k, out id) ? id : 9999; });
        }
    }
}
