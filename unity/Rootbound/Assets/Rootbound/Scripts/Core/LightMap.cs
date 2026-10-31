// Sky light: how much daylight reaches each cell. Open air under the sky is fully lit; light spreads through air
// (losing a step per tile) and only a little way into solid blocks, so caves fall dark and their mouths glow.
// The result feeds a smooth 2D sprite light stretched over the whole world (one texel per tile).
using System.Collections.Generic;

namespace Rootbound
{
    public static class LightMap
    {
        public const int Max = 15;

        public static void Sky(World w, byte[] outLevel)
        {
            int W = w.W, H = w.H;
            var q = new Queue<int>();
            System.Array.Clear(outLevel, 0, outLevel.Length);
            for (int x = 0; x < W; x++)
            {
                for (int y = 0; y < H; y++)
                {
                    int k = y * W + x;
                    if (GameData.IsSolid(w.Tiles[k])) break;
                    outLevel[k] = Max;
                    q.Enqueue(k);
                }
            }
            while (q.Count > 0)
            {
                int k = q.Dequeue(), x = k % W, y = k / W, l = outLevel[k];
                if (l <= 1) continue;
                for (int d = 0; d < 4; d++)
                {
                    int nx = x + (d == 0 ? 1 : d == 1 ? -1 : 0), ny = y + (d == 2 ? 1 : d == 3 ? -1 : 0);
                    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                    int nk = ny * W + nx;
                    bool solid = GameData.IsSolid(w.Tiles[nk]);
                    int nl = l - (solid ? 5 : 1);
                    if (w.Water[nk] > 0 && !solid) nl -= 1;
                    if (nl > outLevel[nk])
                    {
                        outLevel[nk] = (byte)nl;
                        if (!solid) q.Enqueue(nk);
                    }
                }
            }
        }
    }
}
