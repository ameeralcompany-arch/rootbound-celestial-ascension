// World generator: a faithful port of the web game's generator chain, in the same order and with the same seeds:
//   terrain (VILL9.terrain: rolling hills, plains, mesas, flat landing at the door)
//   -> genBase (grass/dirt/stone layers, crystal and gold, caves, bedrock walls) -> genWater (lakes, cave pools)
//   -> DEEP7 (moonstone, amber fossils, magma veins, void geodes, glowshrooms, urns)
//   -> MINE7 (deepslate layer, copper..diamond ore veins, tackle boxes on lake shores, floating sky islands)
//   -> VILL9 cliffs + wild trees.
// Still to come in later phases: villages, chests, depth-zone rooms and biome bands.
using System;

namespace Rootbound
{
    public static class WorldGen
    {
        public static World Create(string name)
        {
            var w = new World(name, GameData.W, GameData.H);
            Terrain(w);
            Base(w);
            Deep(w);
            Mine(w);
            Wild(w);
            return w;
        }

        // ---- VILL9.terrain
        static void Terrain(World w)
        {
            int W = w.W, DX = w.DoorX;
            var R = new Rng(90001 + (long)Math.Floor(w.Seed * 7907));
            var h = w.Surface;
            var a = new float[W];
            Func<double, double> big = Noise(R, W, 52, 5.5), mid = Noise(R, W, 17, 2.4), fine = Noise(R, W, 7, .8), flat = Noise(R, W, 70, 1);
            for (int x = 0; x < W; x++)
            {
                double pf = Math.Max(0, Math.Min(1, flat(x) * 1.4 + .35));
                a[x] = (float)((big(x) + mid(x) * (1 - pf * .7) + fine(x) * (1 - pf)) * (1 - pf * .65));
            }
            int nm = 1 + R.Int(2);
            for (int i = 0; i <= nm; i++)
            {
                int wd = 9 + R.Int(9), cx = 10 + (int)Math.Floor(R.Next() * (W - 20));
                int d = i < nm ? 2 + R.Int(2) : -(2 + R.Int(2));
                if (Math.Abs(cx - DX) < wd / 2.0 + 18) continue;
                for (int x = Math.Max(1, cx - (wd >> 1)); x <= Math.Min(W - 2, cx + (wd >> 1)); x++) a[x] += d;
            }
            for (int x = 0; x < W; x++) h[x] = Math.Max(10, Math.Min(27, Rng.Round(18 - (double)a[x])));
            int s0 = h[DX];
            for (int x = DX - 9; x <= DX + 9; x++) h[x] = s0;
            for (int x = DX + 10; x < W; x++)
            {
                int c = Math.Max(h[x - 1] - 1, Math.Min(h[x - 1] + 1, h[x]));
                if (c == h[x] && x > DX + 16) break;
                h[x] = c;
            }
            for (int x = DX - 10; x >= 0; x--)
            {
                int c = Math.Max(h[x + 1] - 1, Math.Min(h[x + 1] + 1, h[x]));
                if (c == h[x] && x < DX - 16) break;
                h[x] = c;
            }
        }

        static Func<double, double> Noise(Rng R, int W, double L, double amp)
        {
            int n = (int)Math.Ceiling(W / L) + 3;
            var v = new double[n];
            for (int i = 0; i < n; i++) v[i] = R.Next() * 2 - 1;
            return x =>
            {
                double f = x / L;
                int i = (int)Math.Floor(f);
                double t = f - i, u = t * t * (3 - 2 * t);
                return (v[i] * (1 - u) + v[i + 1] * u) * amp;
            };
        }

        // ---- genBase + genWater
        static void Base(World w)
        {
            int W = w.W, H = w.H;
            var R = new Rng(1337 + (long)Math.Floor(w.Seed * 7919));
            for (int x = 0; x < W; x++)
            {
                int h = w.Sh(x);
                for (int y = h; y < H; y++)
                {
                    int t = y >= H - 2 ? 4 : y == h ? 2 : y < h + 6 ? 1 : 3;
                    if (t == 3 && y > h + 10)
                    {
                        double r = R.Next();
                        if (r < .02) t = 9;
                        else if (r < .027 && y > h + 20) t = 10;
                    }
                    w.SetGen(x, y, t);
                }
            }
            int caves = Rng.Round(110.0 * W * H / 6400);
            for (int i = 0; i < caves; i++)
            {
                double cx = R.Next() * W, cy = 30 + R.Next() * (H - 36), r = 1.6 + R.Next() * 2.6;
                for (int y = Math.Max(0, (int)(cy - r)); y <= Math.Min(H - 3, (int)(cy + r + 1)); y++)
                    for (int x = Math.Max(1, (int)(cx - r)); x <= Math.Min(W - 2, (int)(cx + r + 1)); x++)
                        if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r && y > w.Sh(x) + 8) w.SetGen(x, y, 0);
            }
            for (int y = 0; y < H; y++)
            {
                w.SetGen(0, y, 4);
                w.SetGen(W - 1, y, 4);
                w.Hp[y * W] = w.Hp[y * W + W - 1] = 99;
            }
            Water(w, R);
        }

        static void Water(World w, Rng R)
        {
            int W = w.W, H = w.H, DX = w.DoorX;
            var tiles = w.Tiles;
            int last = -99;
            int nl = Rng.Round((4 + R.Int(3)) * W / 100.0);
            for (int i = 0; i < nl; i++)
            {
                int wd = 7 + R.Int(9), a = 3 + R.Int(W - wd - 8), b = a + wd;
                if (Math.Abs(a - last) < 16 || (a < DX + 6 && b > DX - 6)) continue;
                last = a;
                int L = Math.Max(w.Sh(a - 1), w.Sh(b + 1)), D = L + 3 + R.Int(3);
                for (int x = a; x <= b; x++)
                {
                    for (int y = w.Sh(x); y < D; y++) w.SetGen(x, y, 0);
                    for (int y = D; y < D + 3; y++) w.SetGen(x, y, 8);
                    for (int y = L; y < D; y++) w.Water[y * W + x] = 8;
                }
                foreach (int bx in new[] { a - 2, a - 1, b + 1, b + 2 })
                {
                    for (int y = L; y <= D + 2; y++)
                        if (tiles[y * W + bx] == 0) w.SetGen(bx, y, 1);
                    if (bx == a - 1 || bx == b + 1)
                    {
                        int t = w.Sh(bx) * W + bx;
                        if (tiles[t] != 0) w.SetGen(bx, w.Sh(bx), 8);
                    }
                }
            }
            int pools = Rng.Round(8.0 * W * H / 6400);
            for (int i = 0; i < pools; i++)
            {
                int x = 3 + R.Int(W - 6), y0 = w.Sh(x) + 12 + R.Int(Math.Max(1, H - w.Sh(x) - 22));
                if (tiles[y0 * W + x] != 0) continue;
                int y = y0;
                while (y < H - 3 && tiles[(y + 1) * W + x] == 0) y++;
                if (y >= H - 3) continue;
                int l = x, r = x;
                while (l > 2 && tiles[y * W + l - 1] == 0 && x - l < 7) l--;
                while (r < W - 3 && tiles[y * W + r + 1] == 0 && r - x < 7) r++;
                for (int xx = l; xx <= r; xx++)
                {
                    w.Water[y * W + xx] = 8;
                    if (tiles[(y - 1) * W + xx] == 0 && R.Next() < .7) w.Water[(y - 1) * W + xx] = 8;
                }
            }
        }

        // ---- DEEP7: deep-cave treasures (ids 60-65)
        static void Deep(World w)
        {
            int W = w.W, H = w.H;
            var tiles = w.Tiles;
            var R = new Rng(4242 + (long)Math.Floor(w.Seed * 104729));
            Action<int, int, int> set = (x, y, b) => { if (x > 0 && x < W - 1 && y > 0 && y < H - 2) w.SetGen(x, y, b); };
            int[][] nb = { new[] { 1, 0 }, new[] { 0, 1 }, new[] { -1, 0 } };
            for (int x = 2; x < W - 2; x++)
            {
                int s = w.Sh(x);
                for (int y = s + 9; y < H - 3; y++)
                {
                    int k = y * W + x, t = tiles[k], dep = y - s;
                    if (t == 3)
                    {
                        double r = R.Next();
                        int id = 0;
                        if (dep > 12 && r < .018) id = 60;
                        else if (dep > 16 && r < .03 && r >= .018) id = 61;
                        else if (dep > 26 && r < .039 && r >= .03) id = 62;
                        else if (dep > 34 && r < .0425 && r >= .039) id = 65;
                        if (id != 0)
                        {
                            set(x, y, id);
                            if (R.Next() < .55)
                                foreach (var d in nb)
                                    if (tiles[(y + d[1]) * W + x + d[0]] == 3 && R.Next() < .5) set(x + d[0], y + d[1], id);
                        }
                    }
                    else if (t == 0 && tiles[(y + 1) * W + x] == 3 && dep > 10)
                    {
                        double r = R.Next();
                        if (r < .05) set(x, y, 63);
                        else if (r < .075 && dep > 14) set(x, y, 64);
                    }
                }
            }
        }

        // ---- MINE7: deepslate, ore veins, tackle boxes, sky islands
        static readonly int[] Ores = { 71, 72, 73, 74, 75, 76 };
        static readonly int[] OreDep = { 3, 12, 30, 38, 48, 62 };
        static readonly double[] OreCh = { .012, .011, .005, .005, .004, .0025 };
        static readonly int[,] OreV = { { 3, 6 }, { 3, 6 }, { 2, 4 }, { 2, 4 }, { 2, 4 }, { 1, 3 } };

        static void Mine(World w)
        {
            int W = w.W, H = w.H, DX = w.DoorX;
            var tiles = w.Tiles;
            var R = new Rng(7331 + (long)Math.Floor(w.Seed * 15485863));
            Func<int, int, bool> ok = (x, y) => x > 0 && x < W - 1 && y > 0 && y < H - 2;
            Action<int, int, int> set = (x, y, b) => { if (ok(x, y)) w.SetGen(x, y, b); };
            for (int x = 1; x < W - 1; x++)
            {
                int s = w.Sh(x), top = s + 44 + Rng.Round(Math.Sin(x * .21 + w.Seed) * 2 + Math.Sin(x * .07) * 2);
                for (int y = top; y < H - 2; y++)
                    if (tiles[y * W + x] == 3) w.SetGen(x, y, 77);
            }
            for (int x = 2; x < W - 2; x++)
            {
                int s = w.Sh(x);
                for (int y = s + 4; y < H - 3; y++)
                {
                    int t = tiles[y * W + x];
                    if (t != 3 && t != 77) continue;
                    int dep = y - s;
                    double r = R.Next(), acc = 0;
                    int oi = -1;
                    for (int o = 0; o < Ores.Length; o++)
                    {
                        if (dep < OreDep[o]) continue;
                        acc += OreCh[o];
                        if (r < acc) { oi = o; break; }
                    }
                    if (oi < 0) continue;
                    int n = OreV[oi, 0] + (int)Math.Floor(R.Next() * (OreV[oi, 1] - OreV[oi, 0] + 1));
                    int vx = x, vy = y;
                    for (int i = 0; i < n; i++)
                    {
                        int tt = tiles[vy * W + vx];
                        if (tt == 3 || tt == 77) set(vx, vy, Ores[oi]);
                        double q = R.Next();
                        if (q < .3) vx++;
                        else if (q < .55) vx--;
                        else if (q < .8) vy++;
                        else vy--;
                        if (!ok(vx, vy)) break;
                    }
                }
            }
            // tackle boxes on lake shores
            int lastBox = -99;
            int[] dxs = { -2, -3, 2, 3, -4, 4 };
            for (int x = 3; x < W - 3; x++)
            {
                if (x - lastBox < 14) continue;
                int s = w.Sh(x), wy = -1;
                for (int y = Math.Max(1, s - 2); y < s + 8 && y < H - 2; y++)
                    if (w.Water[y * W + x] > 0 && tiles[y * W + x] == 0) { wy = y; break; }
                if (wy < 0) continue;
                foreach (int dx in dxs)
                {
                    int bx = x + dx, y = Math.Max(1, wy - 4);
                    while (y < H - 3 && tiles[(y + 1) * W + bx] == 0) y++;
                    int k = y * W + bx, below = tiles[(y + 1) * W + bx];
                    if (tiles[k] == 0 && w.Water[k] == 0 && below != 0 && below != 70) { set(bx, y, 70); lastBox = x; break; }
                }
            }
            // floating sky islands with a little loot on top
            int nI = Math.Max(2, Rng.Round(W / 42.0));
            for (int i = 0; i < nI; i++)
            {
                int cx = 6 + (int)Math.Floor(R.Next() * (W - 12)), s = w.Sh(cx);
                int cy = Math.Max(3, s - 7 - (int)Math.Floor(R.Next() * 5)), rw = 3 + (int)Math.Floor(R.Next() * 4), rh = 2 + (int)Math.Floor(R.Next() * 2);
                if (Math.Abs(cx - DX) < 8) continue;
                for (int x = cx - rw; x <= cx + rw; x++)
                {
                    double u = (x - cx) / (double)rw;
                    int depth = Math.Max(1, Rng.Round(rh * (1 - u * u) + R.Next() * .8));
                    for (int y = cy; y < cy + depth; y++)
                        if (ok(x, y) && tiles[y * W + x] == 0) set(x, y, y == cy ? 2 : 1);
                }
                double rr = R.Next();
                if (rr < .4) set(cx, cy - 1, 64);
                else if (rr < .65) set(cx, cy - 1, 63);
                else if (rr < .85) set(cx, cy - 1, 70);
            }
        }

        // ---- VILL9: rocky cliff faces and wild trees (oak, cherry, hedge, palm near water)
        static void Wild(World w)
        {
            int W = w.W, DX = w.DoorX;
            var tiles = w.Tiles;
            var sh = w.Surface;
            var R = new Rng(61001 + (long)Math.Floor(w.Seed * 48611));
            for (int x = 2; x < W - 2; x++)
            {
                int s = sh[x];
                foreach (int nx in new[] { x - 1, x + 1 })
                {
                    int d = sh[nx] - s;
                    if (d < 2) continue;
                    for (int y = s + 1; y <= s + d; y++)
                        if (tiles[y * W + x] == 1) w.SetGen(x, y, R.Next() < .25 ? 102 : 3);
                }
            }
            int last = -99;
            for (int x = 4; x < W - 4; x++)
            {
                if (x - last < 5 || Math.Abs(x - DX) < 14) continue;
                int s = sh[x], k = (s - 1) * W + x;
                if (tiles[s * W + x] != 2 || tiles[k] != 0 || w.Water[k] != 0) continue;
                bool clear = true;
                for (int y = s - 7; y < s; y++)
                    if (y > 0 && tiles[y * W + x] != 0) { clear = false; break; }
                if (!clear || R.Next() > .32) continue;
                bool wet = false;
                for (int dx = -6; dx <= 6 && !wet; dx++)
                {
                    int xx = x + dx;
                    if (xx > 0 && xx < W)
                        for (int y = sh[xx] - 1; y <= sh[xx] + 2; y++)
                            if (w.Water[y * W + xx] != 0) { wet = true; break; }
                }
                double r = R.Next();
                int t = wet && r < .55 ? 8 : r < .58 ? 5 : r < .76 ? 50 : r < .9 ? 15 : 5;
                w.Trees[k] = new Tree { Type = t, Deco = true };
                last = x;
            }
        }
    }
}
