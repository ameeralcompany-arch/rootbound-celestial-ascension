// URP 2D lighting: a dim global light (cave ambience), a world-sized sprite light carrying the sky light map (daylight
// that pours into cave mouths and fades underground), a warm light around the hero, and pooled point lights for every
// glowing block near the camera (ores, glowshrooms, magma). Bright lights feed the bloom pass.
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using UnityEngine.Rendering.Universal;

namespace Rootbound
{
    public sealed class Lighting : MonoBehaviour
    {
        Light2D global, sky, hero;
        readonly List<Light2D> pool = new List<Light2D>();
        Texture2D skyTex;
        Color32[] skyPx;
        byte[] level;
        World world;
        float glowT;
        public float Daylight = 1f;

        public static Light2D Make(Transform parent, string name, Light2D.LightType type)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var l = go.AddComponent<Light2D>();
            SetMember(l, "lightType", "m_LightType", type);
            AllLayers(l);
            return l;
        }

        // Light2D's setters differ between URP versions: use the property when it is writable, else the serialized field
        static void SetMember(object o, string prop, string field, object v)
        {
            var t = o.GetType();
            var p = t.GetProperty(prop, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (p != null && p.CanWrite) { p.SetValue(o, v, null); return; }
            var f = t.GetField(field, BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public);
            if (f != null) f.SetValue(o, v);
        }

        static void AllLayers(Light2D l)
        {
            var f = typeof(Light2D).GetField("m_ApplyToSortingLayers", BindingFlags.Instance | BindingFlags.NonPublic);
            if (f == null) return;
            var layers = SortingLayer.layers;
            var ids = new int[layers.Length];
            for (int i = 0; i < ids.Length; i++) ids[i] = layers[i].id;
            f.SetValue(l, ids);
        }

        public void Init()
        {
            // reuse a global light the scene already has (the Universal 2D template ships one)
            foreach (var l in FindObjectsByType<Light2D>())
                if (l.lightType == Light2D.LightType.Global) { global = l; break; }
            if (global == null) global = Make(transform, "Global Light", Light2D.LightType.Global);
            AllLayers(global);

            sky = Make(transform, "Sky Light", Light2D.LightType.Sprite);
            hero = Make(transform, "Hero Light", Light2D.LightType.Point);
            hero.color = new Color(1f, .9f, .75f);
            hero.intensity = .85f;
            hero.pointLightOuterRadius = 5.5f;
            hero.pointLightInnerRadius = .4f;
            hero.falloffIntensity = .6f;
        }

        public void SetWorld(World w)
        {
            world = w;
            level = new byte[w.W * w.H];
            if (skyTex != null) Destroy(skyTex);
            skyTex = new Texture2D(w.W, w.H, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            skyPx = new Color32[w.W * w.H];
            // world tile (x, y) is Unity (x .. x+1, -y-1 .. -y): the sprite spans (0, -H) .. (W, 0) at one pixel per tile
            var spr = Sprite.Create(skyTex, new Rect(0, 0, w.W, w.H), new Vector2(0, 1), 1f, 0, SpriteMeshType.FullRect);
            SetMember(sky, "lightCookieSprite", "m_LightCookieSprite", spr);
            sky.transform.position = Vector3.zero;
            w.LightDirty = true;
        }

        public void Tick(Vector2 heroPos, Rect view, float dt)
        {
            if (world == null) return;
            if (world.LightDirty)
            {
                world.LightDirty = false;
                LightMap.Sky(world, level);
                int W = world.W, H = world.H;
                // texture row 0 is the bottom of the world
                for (int y = 0; y < H; y++)
                    for (int x = 0; x < W; x++)
                    {
                        float l = level[y * W + x] / (float)LightMap.Max;
                        byte v = (byte)(Mathf.Pow(l, 1.6f) * 255);
                        skyPx[(H - 1 - y) * W + x] = new Color32(v, v, v, v);
                    }
                skyTex.SetPixels32(skyPx);
                skyTex.Apply(false);
            }
            // day: bright, slightly warm; night: cool and dim; caves keep a faint ambience either way
            global.intensity = Mathf.Lerp(.07f, .16f, Daylight);
            global.color = Color.Lerp(new Color(.55f, .6f, 1f), Color.white, Daylight);
            sky.intensity = Mathf.Lerp(.22f, 1.05f, Daylight);
            sky.color = Color.Lerp(new Color(.45f, .55f, 1f), new Color(1f, .98f, .92f), Daylight);
            hero.transform.position = heroPos;
            hero.intensity = Mathf.Lerp(.95f, .35f, Daylight);

            glowT -= dt;
            if (glowT <= 0)
            {
                glowT = .25f;
                Glows(view);
            }
        }

        // a point light on each glowing block in view (nearest the view centre first, capped)
        void Glows(Rect view)
        {
            const int Cap = 48;
            int used = 0;
            int x0 = Mathf.Max(0, Mathf.FloorToInt(view.xMin) - 2), x1 = Mathf.Min(world.W - 1, Mathf.CeilToInt(view.xMax) + 2);
            int y0 = Mathf.Max(0, Mathf.FloorToInt(-view.yMax) - 2), y1 = Mathf.Min(world.H - 1, Mathf.CeilToInt(-view.yMin) + 2);
            for (int y = y0; y <= y1 && used < Cap; y++)
                for (int x = x0; x <= x1 && used < Cap; x++)
                {
                    var b = GameData.Block(world.Tiles[y * world.W + x]);
                    if (b == null || !b.Glow.HasValue) continue;
                    // one light per small cluster: skip if the cell to the left or above glows the same
                    if (x > 0 && world.Tiles[y * world.W + x - 1] == b.Id && (x & 1) == 1) continue;
                    if (used >= pool.Count)
                    {
                        var l = Make(transform, "Glow", Light2D.LightType.Point);
                        l.pointLightInnerRadius = .2f;
                        l.falloffIntensity = .75f;
                        pool.Add(l);
                    }
                    var gl = pool[used++];
                    gl.enabled = true;
                    gl.color = b.Glow.Value;
                    gl.intensity = 1.35f;
                    gl.pointLightOuterRadius = 2.6f;
                    gl.transform.position = new Vector3(x + .5f, -y - .5f, 0);
                }
            for (int i = used; i < pool.Count; i++) pool[i].enabled = false;
        }
    }
}
