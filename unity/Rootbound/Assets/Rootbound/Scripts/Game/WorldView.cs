// Draws the world: 16x16-tile chunk meshes from the block atlas (one draw call per chunk, rebuilt only when a cell in it
// changes), shaded back walls behind open cave space, translucent water with a bright surface line, and trees made of a
// trunk and a crown that sways in the wind. All of it uses the 2D lit material, so the URP 2D lights shade it.
using System.Collections.Generic;
using UnityEngine;

namespace Rootbound
{
    public sealed class WorldView : MonoBehaviour
    {
        public const int C = 16;
        // sorting: walls/trees behind tiles, hero in front, water over the hero, effects on top
        public const int OrderWall = -20, OrderTree = -10, OrderTiles = 0, OrderCrack = 2, OrderDrop = 4, OrderHero = 5, OrderWater = 7, OrderFx = 9, OrderCursor = 12;

        World world;
        int cw, ch;
        Mesh[] tileMeshes, waterMeshes;
        MeshRenderer[] tileR, waterR;
        Material tileMat, waterMat;
        readonly List<Vector3> v = new List<Vector3>();
        readonly List<Vector2> uv = new List<Vector2>();
        readonly List<Color32> col = new List<Color32>();
        readonly List<int> tri = new List<int>();
        readonly Dictionary<int, TreeView> trees = new Dictionary<int, TreeView>();
        Transform treeRoot;

        sealed class TreeView
        {
            public Transform Root, Crown;
            public float Phase;
        }

        public void Show(World w)
        {
            Clear();
            world = w;
            cw = (w.W + C - 1) / C;
            ch = (w.H + C - 1) / C;
            if (tileMat == null) tileMat = Art.WithTexture(Art.Lit, Art.Blocks);
            if (waterMat == null) waterMat = Art.WithTexture(Art.Lit, Art.White);
            tileMeshes = new Mesh[cw * ch];
            waterMeshes = new Mesh[cw * ch];
            tileR = new MeshRenderer[cw * ch];
            waterR = new MeshRenderer[cw * ch];
            for (int cy = 0; cy < ch; cy++)
                for (int cx = 0; cx < cw; cx++)
                {
                    int i = cy * cw + cx;
                    tileMeshes[i] = NewChunk("Chunk " + cx + "," + cy, tileMat, OrderTiles, out tileR[i]);
                    waterMeshes[i] = NewChunk("Water " + cx + "," + cy, waterMat, OrderWater, out waterR[i]);
                    BuildTiles(cx, cy);
                    BuildWater(cx, cy);
                }
            treeRoot = new GameObject("Trees").transform;
            treeRoot.SetParent(transform, false);
            SyncTrees();
            w.DirtyChunks.Clear();
            w.DirtyWater.Clear();
        }

        public void Clear()
        {
            foreach (Transform t in transform) Destroy(t.gameObject);
            trees.Clear();
            world = null;
        }

        Mesh NewChunk(string name, Material m, int order, out MeshRenderer r)
        {
            var go = new GameObject(name);
            go.transform.SetParent(transform, false);
            var mf = go.AddComponent<MeshFilter>();
            r = go.AddComponent<MeshRenderer>();
            r.sharedMaterial = m;
            r.sortingOrder = order;
            r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            r.receiveShadows = false;
            var mesh = new Mesh { name = name };
            mesh.MarkDynamic();
            mf.sharedMesh = mesh;
            return mesh;
        }

        void Quad(float x0, float y0, float x1, float y1, Rect r, Color32 c)
        {
            int n = v.Count;
            v.Add(new Vector3(x0, y0));
            v.Add(new Vector3(x0, y1));
            v.Add(new Vector3(x1, y1));
            v.Add(new Vector3(x1, y0));
            uv.Add(new Vector2(r.xMin, r.yMin));
            uv.Add(new Vector2(r.xMin, r.yMax));
            uv.Add(new Vector2(r.xMax, r.yMax));
            uv.Add(new Vector2(r.xMax, r.yMin));
            col.Add(c); col.Add(c); col.Add(c); col.Add(c);
            tri.Add(n); tri.Add(n + 1); tri.Add(n + 2);
            tri.Add(n); tri.Add(n + 2); tri.Add(n + 3);
        }

        void Flush(Mesh m)
        {
            m.Clear();
            m.SetVertices(v);
            m.SetUVs(0, uv);
            m.SetColors(col);
            m.SetTriangles(tri, 0);
            m.RecalculateBounds();
            v.Clear(); uv.Clear(); col.Clear(); tri.Clear();
        }

        void BuildTiles(int cx, int cy)
        {
            var w = world;
            int W = w.W;
            var wallTint = new Color32(46, 44, 58, 255);
            for (int y = cy * C; y < Mathf.Min(w.H, cy * C + C); y++)
                for (int x = cx * C; x < Mathf.Min(W, cx * C + C); x++)
                {
                    int b = w.Tiles[y * W + x];
                    float X = x, Y = -y;
                    if (b == 0)
                    {
                        // back wall: the natural layer this deep, darkened (only underground)
                        if (y > w.Sh(x))
                        {
                            int dep = y - w.Sh(x), wb = dep < 6 ? 1 : dep < 44 ? 3 : 77;
                            Quad(X, Y - 1, X + 1, Y, Art.BlockUV(wb, (x * 7 + y * 13) % 3), wallTint);
                        }
                        continue;
                    }
                    Quad(X, Y - 1, X + 1, Y, Art.BlockUV(b, (x * 7 + y * 13) % 3), new Color32(255, 255, 255, 255));
                }
            Flush(tileMeshes[cy * cw + cx]);
        }

        void BuildWater(int cx, int cy)
        {
            var w = world;
            int W = w.W;
            var body = new Color32(58, 143, 216, 150);
            var top = new Color32(190, 236, 255, 210);
            var full = new Rect(0, 0, 1, 1);
            for (int y = cy * C; y < Mathf.Min(w.H, cy * C + C); y++)
                for (int x = cx * C; x < Mathf.Min(W, cx * C + C); x++)
                {
                    int k = y * W + x, lv = w.Water[k];
                    if (lv == 0 || w.Tiles[k] != 0) continue;
                    bool covered = y > 0 && w.Water[k - W] > 0 && w.Tiles[k - W] == 0;
                    float h = covered ? 1f : lv / 8f, X = x, Y = -y;
                    Quad(X, Y - 1, X + 1, Y - 1 + h, full, body);
                    if (!covered) Quad(X, Y - 1 + h - .06f, X + 1, Y - 1 + h, full, top);
                }
            Flush(waterMeshes[cy * cw + cx]);
        }

        public void Tick(Rect view, float time)
        {
            if (world == null) return;
            if (world.DirtyChunks.Count > 0)
            {
                foreach (int i in world.DirtyChunks)
                    if (i >= 0 && i < tileMeshes.Length) BuildTiles(i % cw, i / cw);
                world.DirtyChunks.Clear();
            }
            if (world.DirtyWater.Count > 0)
            {
                foreach (int i in world.DirtyWater)
                    if (i >= 0 && i < waterMeshes.Length) BuildWater(i % cw, i / cw);
                world.DirtyWater.Clear();
            }
            if (world.TreesDirty) SyncTrees();
            // only chunks near the view are drawn
            for (int i = 0; i < tileR.Length; i++)
            {
                float x0 = (i % cw) * C, y0 = -(i / cw) * C;
                bool on = x0 + C > view.xMin - 2 && x0 < view.xMax + 2 && y0 > view.yMin - 2 && y0 - C < view.yMax + 2;
                tileR[i].enabled = on;
                waterR[i].enabled = on;
            }
            // crowns sway around the top of the trunk
            foreach (var t in trees.Values)
            {
                var p = t.Root.position;
                bool on = p.x > view.xMin - 4 && p.x < view.xMax + 4 && p.y > view.yMin - 2 && p.y < view.yMax + 7;
                t.Root.gameObject.SetActive(on);
                if (!on) continue;
                float a = Mathf.Sin(time / 1.15f + p.x * 1.37f) * 2.2f + Mathf.Sin(time / .53f + p.x * .7f) * .5f;
                t.Crown.localRotation = Quaternion.Euler(0, 0, a);
            }
        }

        void SyncTrees()
        {
            world.TreesDirty = false;
            var gone = new List<int>();
            foreach (var kv in trees)
                if (!world.Trees.ContainsKey(kv.Key)) gone.Add(kv.Key);
            foreach (int k in gone)
            {
                Destroy(trees[k].Root.gameObject);
                trees.Remove(k);
            }
            foreach (var kv in world.Trees)
            {
                if (trees.ContainsKey(kv.Key)) continue;
                int type = Art.TreeTrunk.ContainsKey(kv.Value.Type) ? kv.Value.Type : 5;
                var trunks = Art.TreeTrunk[type];
                int sg = trunks.Length - 1;
                int x = kv.Key % world.W, y = kv.Key / world.W;
                var root = new GameObject("Tree").transform;
                root.SetParent(treeRoot, false);
                root.position = new Vector3(x + .5f, -(y + 1), 0);
                var tr = root.gameObject.AddComponent<SpriteRenderer>();
                tr.sprite = trunks[sg];
                tr.sharedMaterial = Art.Lit;
                tr.sortingOrder = OrderTree;
                var piv = Art.TreePivot[type][sg];
                var crown = new GameObject("Crown").transform;
                crown.SetParent(root, false);
                crown.localPosition = new Vector3((piv.x - 85f) / 48f, -(piv.y - 242f) / 48f, 0);
                var cr = crown.gameObject.AddComponent<SpriteRenderer>();
                cr.sprite = Art.TreeCrown[type][sg];
                cr.sharedMaterial = Art.Lit;
                cr.sortingOrder = OrderTree + 1;
                trees[kv.Key] = new TreeView { Root = root, Crown = crown };
            }
        }

        // the tree (if any) under a world point: its cell, or the trunk/crown above it
        public int TreeAt(Vector2 p)
        {
            int tx = Mathf.FloorToInt(p.x), ty = Mathf.FloorToInt(-p.y);
            for (int dy = 0; dy <= 4; dy++)
                for (int dx = -1; dx <= 1; dx++)
                {
                    if (dy < 2 && dx != 0) continue;
                    int x = tx + dx, y = ty + dy;
                    if (!world.In(x, y)) continue;
                    int k = y * world.W + x;
                    if (world.Trees.ContainsKey(k)) return k;
                }
            return -1;
        }
    }
}
