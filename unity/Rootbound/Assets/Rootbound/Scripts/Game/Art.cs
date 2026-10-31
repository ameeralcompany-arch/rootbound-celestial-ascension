// Loads the exported art from StreamingAssets/Rootbound (raw PNGs, so no import settings can blur or compress them)
// and cuts it into sprites / UV rects. Also makes the small procedural textures the effects use, and the materials.
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rootbound
{
    public static class Art
    {
        public static Texture2D Blocks, Cracks, Icons, Trees, Hero, White, Soft, Chip, Leaf, Spark, Outline;
        public static Material Lit, Unlit, Additive;
        public static readonly Sprite[] CrackSprites = new Sprite[5];
        public static readonly Dictionary<string, Sprite> IconSprites = new Dictionary<string, Sprite>();
        public static readonly Dictionary<int, Sprite[]> TreeTrunk = new Dictionary<int, Sprite[]>();
        public static readonly Dictionary<int, Sprite[]> TreeCrown = new Dictionary<int, Sprite[]>();
        public static readonly Dictionary<int, Vector2[]> TreePivot = new Dictionary<int, Vector2[]>();
        public static Sprite[] HeroFrames;
        public static Dictionary<string, int[]> HeroAnim = new Dictionary<string, int[]>();
        public static Sprite SoftSprite, ChipSprite, LeafSprite, SparkSprite, OutlineSprite, WhiteSprite;
        static int blockCols, blockCell;

        public static void Load()
        {
            var raw = GameData.Raw;
            var ba = Json.O(raw, "blockAtlas");
            Blocks = Png(Json.S(ba, "file", "blocks.png"));
            blockCols = (int)Json.N(ba, "cols", 24);
            blockCell = (int)Json.N(ba, "cell", 48);

            Cracks = Png("cracks.png");
            for (int i = 0; i < 5; i++) CrackSprites[i] = Sprite.Create(Cracks, new Rect(i * 48, 0, 48, 48), new Vector2(.5f, .5f), 48f, 0, SpriteMeshType.FullRect);

            var ic = Json.O(raw, "icons");
            Icons = Png(Json.S(ic, "file", "icons.png"));
            int icols = (int)Json.N(ic, "cols", 16), icell = (int)Json.N(ic, "cell", 64);
            foreach (var kv in Json.O(ic, "map"))
            {
                int i = (int)(double)kv.Value;
                IconSprites[kv.Key] = Sprite.Create(Icons, new Rect((i % icols) * icell, Icons.height - (i / icols + 1) * icell, icell, icell), new Vector2(.5f, .5f), icell, 0, SpriteMeshType.FullRect);
            }

            var tr = Json.O(raw, "trees");
            Trees = Png(Json.S(tr, "file", "trees.png"));
            int fw = (int)Json.N(tr, "w", 170), fh = (int)Json.N(tr, "h", 250), bx = (int)Json.N(tr, "bx", 85), by = (int)Json.N(tr, "by", 242);
            var types = Json.A(tr, "types");
            var frames = Json.O(tr, "frames");
            for (int ti = 0; ti < types.Count; ti++)
            {
                int type = (int)(double)types[ti];
                var fl = Json.A(frames, type.ToString());
                int n = fl != null ? fl.Count : 0;
                var trunk = new Sprite[n];
                var crown = new Sprite[n];
                var piv = new Vector2[n];
                for (int sg = 0; sg < n; sg++)
                {
                    float px = (float)Json.N(fl[sg], "px", bx), py = (float)Json.N(fl[sg], "py", by);
                    piv[sg] = new Vector2(px, py);
                    trunk[sg] = Sprite.Create(Trees, new Rect(sg * fw, Trees.height - (ti * fh * 2 + fh), fw, fh), new Vector2(bx / (float)fw, 1f - by / (float)fh), 48f, 0, SpriteMeshType.FullRect);
                    crown[sg] = Sprite.Create(Trees, new Rect(sg * fw, Trees.height - (ti * fh * 2 + fh * 2), fw, fh), new Vector2(px / fw, 1f - py / fh), 48f, 0, SpriteMeshType.FullRect);
                }
                TreeTrunk[type] = trunk;
                TreeCrown[type] = crown;
                TreePivot[type] = piv;
            }

            var he = Json.O(raw, "hero");
            Hero = Png(Json.S(he, "file", "hero.png"));
            int hw = (int)Json.N(he, "fw", 480), hh = (int)Json.N(he, "fh", 510);
            float ox = (float)Json.N(he, "ox", 240), oy = (float)Json.N(he, "oy", 234), sc = (float)Json.N(he, "scale", 3);
            int nf = Hero.width / hw;
            HeroFrames = new Sprite[nf];
            for (int i = 0; i < nf; i++) HeroFrames[i] = Sprite.Create(Hero, new Rect(i * hw, 0, hw, hh), new Vector2(ox / hw, 1f - oy / hh), 48f * sc, 0, SpriteMeshType.FullRect);
            foreach (var kv in Json.O(he, "anim"))
            {
                var l = kv.Value as List<object>;
                var a = new int[l.Count];
                for (int i = 0; i < a.Length; i++) a[i] = (int)(double)l[i];
                HeroAnim[kv.Key] = a;
            }

            MakeProcedural();
            MakeMaterials();
        }

        public static Texture2D Png(string file)
        {
            var t = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            var p = Path.Combine(GameData.Dir, file);
            if (File.Exists(p)) t.LoadImage(File.ReadAllBytes(p));
            else Debug.LogError("Rootbound: missing art " + p + " (run tools/unity-export.js)");
            t.filterMode = FilterMode.Bilinear;
            t.wrapMode = TextureWrapMode.Clamp;
            t.name = file;
            return t;
        }

        // UV rect of a block's sprite variant in the block atlas (inset half a texel so neighbours never bleed in)
        public static Rect BlockUV(int id, int variant)
        {
            var b = GameData.Block(id);
            int cell = b != null ? b.AtlasCells[variant] : -1;
            if (cell < 0) cell = 0;
            float tw = Blocks.width, th = Blocks.height;
            int col = cell % blockCols, row = cell / blockCols;
            float x = col * blockCell + .5f, y = th - (row + 1) * blockCell + .5f;
            return new Rect(x / tw, y / th, (blockCell - 1f) / tw, (blockCell - 1f) / th);
        }

        public static Sprite Icon(string key)
        {
            Sprite s;
            return key != null && IconSprites.TryGetValue(key, out s) ? s : null;
        }

        static void MakeProcedural()
        {
            White = new Texture2D(4, 4, TextureFormat.RGBA32, false);
            var px = new Color32[16];
            for (int i = 0; i < 16; i++) px[i] = new Color32(255, 255, 255, 255);
            White.SetPixels32(px);
            White.Apply();
            WhiteSprite = Sprite.Create(White, new Rect(0, 0, 4, 4), new Vector2(.5f, .5f), 4f);

            Soft = Gen(64, (x, y) => { float d = Mathf.Clamp01(1f - Vector2.Distance(new Vector2(x, y), new Vector2(.5f, .5f)) * 2f); return d * d; });
            SoftSprite = Sprite.Create(Soft, new Rect(0, 0, 64, 64), new Vector2(.5f, .5f), 64f);
            Chip = Gen(8, (x, y) => 1f);
            ChipSprite = Sprite.Create(Chip, new Rect(0, 0, 8, 8), new Vector2(.5f, .5f), 8f);
            Leaf = Gen(16, (x, y) => { float u = (x - .5f) * 2f, v = (y - .5f) * 2f; return u * u / .35f + v * v < 1f ? 1f : 0f; });
            LeafSprite = Sprite.Create(Leaf, new Rect(0, 0, 16, 16), new Vector2(.5f, .5f), 16f);
            Spark = Gen(32, (x, y) =>
            {
                float u = Mathf.Abs(x - .5f) * 2f, v = Mathf.Abs(y - .5f) * 2f;
                float star = Mathf.Clamp01(1f - (u * v * 12f + Mathf.Min(u, v) * 3f)) * Mathf.Clamp01(1f - Mathf.Max(u, v));
                float core = Mathf.Clamp01(1f - Mathf.Sqrt(u * u + v * v) * 2.2f);
                return Mathf.Clamp01(star + core);
            });
            SparkSprite = Sprite.Create(Spark, new Rect(0, 0, 32, 32), new Vector2(.5f, .5f), 32f);
            Outline = Gen(48, (x, y) =>
            {
                float e = Mathf.Min(Mathf.Min(x, 1 - x), Mathf.Min(y, 1 - y)) * 48f;
                return e < 3.2f ? 1f : 0f;
            });
            OutlineSprite = Sprite.Create(Outline, new Rect(0, 0, 48, 48), new Vector2(0, 1), 48f);
        }

        // white texture whose alpha comes from f(u, v)
        static Texture2D Gen(int n, System.Func<float, float, float> f)
        {
            var t = new Texture2D(n, n, TextureFormat.RGBA32, false);
            var px = new Color32[n * n];
            for (int y = 0; y < n; y++)
                for (int x = 0; x < n; x++)
                    px[y * n + x] = new Color32(255, 255, 255, (byte)(Mathf.Clamp01(f((x + .5f) / n, (y + .5f) / n)) * 255));
            t.SetPixels32(px);
            t.Apply();
            t.wrapMode = TextureWrapMode.Clamp;
            t.filterMode = FilterMode.Bilinear;
            return t;
        }

        // Materials come from Resources (made by the editor setup so builds keep their shaders), else straight from the shader.
        static void MakeMaterials()
        {
            Lit = Resources.Load<Material>("Rootbound/RB_Lit");
            Unlit = Resources.Load<Material>("Rootbound/RB_Unlit");
            Additive = Resources.Load<Material>("Rootbound/RB_Additive");
            if (Lit == null) Lit = new Material(Find("Universal Render Pipeline/2D/Sprite-Lit-Default", "Sprites/Default"));
            if (Unlit == null) Unlit = new Material(Find("Universal Render Pipeline/2D/Sprite-Unlit-Default", "Sprites/Default"));
            if (Additive == null) Additive = MakeAdditive();
        }

        public static Material MakeAdditive()
        {
            var sh = Find("Universal Render Pipeline/Particles/Unlit", "Sprites/Default");
            var m = new Material(sh);
            if (sh.name.Contains("Particles"))
            {
                m.SetFloat("_Surface", 1f);
                m.SetFloat("_Blend", 2f);
                m.SetInt("_SrcBlend", (int)BlendMode.SrcAlpha);
                m.SetInt("_DstBlend", (int)BlendMode.One);
                m.SetInt("_ZWrite", 0);
                m.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                m.EnableKeyword("_BLENDMODE_ADD");
                m.renderQueue = (int)RenderQueue.Transparent;
            }
            return m;
        }

        static Shader Find(string a, string b)
        {
            var s = Shader.Find(a);
            return s != null ? s : Shader.Find(b);
        }

        public static Material WithTexture(Material baseMat, Texture tex)
        {
            var m = new Material(baseMat);
            m.mainTexture = tex;
            if (m.HasProperty("_BaseMap")) m.SetTexture("_BaseMap", tex);
            return m;
        }
    }
}
