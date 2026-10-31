// The world grid, as in the web game: W x H tiles (block ids), their remaining hit points, water levels (0-8 per cell)
// and the trees standing on the surface. Edits are tracked against the generated world so saves stay small.
using System.Collections.Generic;

namespace Rootbound
{
    public sealed class Tree
    {
        public int Type;      // tree kind: 5 oak, 50 cherry, 15 hedge, 8 palm, 3 pine
        public bool Deco = true;
    }

    public sealed class World
    {
        public readonly int W, H;
        public readonly string Name;
        public readonly double Seed;
        public readonly byte[] Tiles;
        public readonly float[] Hp;
        public readonly byte[] Water;
        public readonly int[] Surface;
        public readonly Dictionary<int, Tree> Trees = new Dictionary<int, Tree>();
        public readonly Dictionary<int, int> TileEdits = new Dictionary<int, int>();
        public readonly Dictionary<int, int> TreeEdits = new Dictionary<int, int>();

        public int DoorX { get { return W >> 1; } }

        // which areas changed since the view last looked (16x16 chunks)
        public readonly HashSet<int> DirtyChunks = new HashSet<int>();
        public readonly HashSet<int> DirtyWater = new HashSet<int>();
        public bool LightDirty = true;
        public bool TreesDirty = true;

        public World(string name, int w, int h)
        {
            Name = name;
            W = w;
            H = h;
            Seed = SeedOf(name);
            Tiles = new byte[w * h];
            Hp = new float[w * h];
            Water = new byte[w * h];
            Surface = new int[w];
        }

        public static string Norm(string n)
        {
            var sb = new System.Text.StringBuilder();
            foreach (char ch in (n ?? "").ToLowerInvariant())
                if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-') sb.Append(ch);
            var s = sb.ToString();
            if (s.Length > 16) s = s.Substring(0, 16);
            return s.Length == 0 ? "world" : s;
        }

        // JS: [...n].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7)%1000/10
        public static double SeedOf(string n)
        {
            uint h = 7;
            foreach (char c in n) h = unchecked(h * 31u + c);
            return (h % 1000) / 10.0;
        }

        public int Sh(int x)
        {
            return Surface[x < 0 ? 0 : x >= W ? W - 1 : x];
        }

        public bool In(int x, int y)
        {
            return x >= 0 && y >= 0 && x < W && y < H;
        }

        public int Get(int x, int y)
        {
            return In(x, y) ? Tiles[y * W + x] : 4;
        }

        public bool Solid(int x, int y)
        {
            if (!In(x, y)) return true;
            return GameData.IsSolid(Tiles[y * W + x]);
        }

        // raw set used by the generator (no edit tracking)
        public void SetGen(int x, int y, int b)
        {
            int k = y * W + x;
            Tiles[k] = (byte)b;
            var bi = b != 0 ? GameData.Block(b) : null;
            Hp[k] = b != 0 ? (bi != null ? bi.Hardness : 3) : 0;
        }

        public void Set(int x, int y, int b)
        {
            if (!In(x, y)) return;
            int k = y * W + x;
            SetGen(x, y, b);
            if (b != 0) Water[k] = 0;
            TileEdits[k] = b;
            MarkDirty(x, y);
            LightDirty = true;
        }

        public void RemoveTree(int k)
        {
            if (Trees.Remove(k))
            {
                TreeEdits[k] = 0;
                TreesDirty = true;
            }
        }

        public void MarkDirty(int x, int y)
        {
            int cx = x >> 4, cy = y >> 4, cw = (W + 15) >> 4;
            DirtyChunks.Add(cy * cw + cx);
            // neighbours too: back walls and edges of the next chunk can depend on this cell
            if ((x & 15) == 0 && cx > 0) DirtyChunks.Add(cy * cw + cx - 1);
            if ((x & 15) == 15) DirtyChunks.Add(cy * cw + cx + 1);
            if ((y & 15) == 0 && cy > 0) DirtyChunks.Add((cy - 1) * cw + cx);
            if ((y & 15) == 15) DirtyChunks.Add((cy + 1) * cw + cx);
        }

        // ---- water flow (port of stepWater): falls first, then evens out sideways, alternating direction every step
        bool wDir;

        public void StepWater()
        {
            wDir = !wDir;
            int cw = (W + 15) >> 4;
            for (int y = H - 3; y >= 1; y--)
            {
                for (int i = 1; i < W - 1; i++)
                {
                    int x = wDir ? i : W - i, k = y * W + x;
                    int v = Water[k];
                    if (v == 0) continue;
                    if (Tiles[k] != 0) { Water[k] = 0; continue; }
                    int kb = k + W;
                    if (Tiles[kb] == 0 && Water[kb] < 8)
                    {
                        int mv = System.Math.Min(v, 8 - Water[kb]);
                        Water[kb] = (byte)(Water[kb] + mv);
                        v = Water[k] = (byte)(Water[k] - mv);
                        DirtyWater.Add((y >> 4) * cw + (x >> 4));
                        DirtyWater.Add(((y + 1) >> 4) * cw + (x >> 4));
                        if (v == 0) continue;
                    }
                    int a = wDir ? -1 : 1;
                    for (int s = 0; s < 2; s++)
                    {
                        int dd = s == 0 ? a : -a, kk = k + dd;
                        if (Tiles[kk] != 0) continue;
                        int df = v - Water[kk];
                        if (df >= 2)
                        {
                            int mv = df >> 1;
                            Water[kk] = (byte)(Water[kk] + mv);
                            v = Water[k] = (byte)(Water[k] - mv);
                            DirtyWater.Add((y >> 4) * cw + ((x + dd) >> 4));
                            DirtyWater.Add((y >> 4) * cw + (x >> 4));
                            if (v == 0) break;
                        }
                    }
                }
            }
        }

        // port of inWater(x,y) in pixel coordinates
        public bool InWater(float px, float py)
        {
            int tx = (int)System.Math.Floor(px / GameData.T), ty = (int)System.Math.Floor(py / GameData.T);
            if (!In(tx, ty)) return false;
            int k = ty * W + tx, v = Water[k];
            if (v == 0 || Tiles[k] != 0) return false;
            if (ty > 0 && Water[k - W] > 0) return true;
            return py >= (ty + 1) * GameData.T - v / 8f * GameData.T;
        }
    }
}
