// The sky behind the world: a vertical gradient that follows the time of day (morning blue, golden dusk, deep night),
// a sun and moon with soft halos, twinkling stars at night, slow drifting clouds and two layers of distant hills that
// scroll slower than the world (parallax). All generated in code, drawn unlit behind everything.
using System.Collections.Generic;
using UnityEngine;

namespace Rootbound
{
    public sealed class Sky : MonoBehaviour
    {
        SpriteRenderer grad, sun, moon, sunHalo, moonHalo;
        Texture2D gradTex;
        readonly List<SpriteRenderer> stars = new List<SpriteRenderer>();
        readonly List<Transform> clouds = new List<Transform>();
        readonly SpriteRenderer[] hills = new SpriteRenderer[6];
        Camera cam;
        float worldW;

        static readonly Color DayTop = Hex("#5fb4ff"), DayBot = Hex("#cdeeff"), DuskTop = Hex("#4a5aa8"), DuskBot = Hex("#ffb987"),
                              NightTop = Hex("#060a1e"), NightBot = Hex("#1a2350");

        static Color Hex(string h) { return GameData.Hex(h); }

        public void Init(Camera c)
        {
            cam = c;
            gradTex = new Texture2D(1, 64, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            grad = Spr("Gradient", Sprite.Create(gradTex, new Rect(0, 0, 1, 64), new Vector2(.5f, .5f), 1f), -400);
            sunHalo = Spr("Sun Halo", Art.SoftSprite, -390);
            sun = Spr("Sun", Disc(new Color(1f, .96f, .82f)), -389);
            moonHalo = Spr("Moon Halo", Art.SoftSprite, -390);
            moon = Spr("Moon", Disc(new Color(.92f, .95f, 1f)), -389);
            var rnd = new System.Random(7);
            for (int i = 0; i < 90; i++)
            {
                var s = Spr("Star", Art.SparkSprite, -395);
                s.transform.localPosition = new Vector3((float)rnd.NextDouble() * 2 - 1, (float)rnd.NextDouble() * .9f + .1f, 0);
                s.transform.localScale = Vector3.one * (float)(.08 + rnd.NextDouble() * .16);
                stars.Add(s);
            }
            for (int L = 0; L < 2; L++)
            {
                var tex = HillTex(L, 1024, 256);
                for (int j = 0; j < 3; j++)
                {
                    var h = Spr("Hills " + L, Sprite.Create(tex, new Rect(0, 0, 1024, 256), new Vector2(0, 0), 32f), -380 + L * 5);
                    hills[L * 3 + j] = h;
                }
            }
            for (int i = 0; i < 9; i++)
            {
                var c2 = Spr("Cloud", Art.SoftSprite, -385);
                c2.color = new Color(1, 1, 1, .55f);
                c2.transform.localScale = new Vector3(5f + i % 3 * 2f, 1.6f + i % 2 * .6f, 1);
                c2.transform.position = new Vector3((i * 37 % 256), -(4 + i * 3 % 7), 0);
                clouds.Add(c2.transform);
            }
        }

        SpriteRenderer Spr(string name, Sprite s, int order)
        {
            var go = new GameObject(name);
            go.transform.SetParent(transform, false);
            var r = go.AddComponent<SpriteRenderer>();
            r.sprite = s;
            r.sharedMaterial = Art.Unlit;
            r.sortingOrder = order;
            return r;
        }

        static Sprite Disc(Color c)
        {
            const int n = 64;
            var t = new Texture2D(n, n, TextureFormat.RGBA32, false);
            var px = new Color32[n * n];
            for (int y = 0; y < n; y++)
                for (int x = 0; x < n; x++)
                {
                    float d = Vector2.Distance(new Vector2(x + .5f, y + .5f), new Vector2(n / 2f, n / 2f)) / (n / 2f);
                    float a = Mathf.Clamp01((1f - d) * 18f);
                    px[y * n + x] = new Color(c.r, c.g, c.b, a);
                }
            t.SetPixels32(px);
            t.Apply();
            return Sprite.Create(t, new Rect(0, 0, n, n), new Vector2(.5f, .5f), n / 1.6f);
        }

        // a row of soft rolling hills with a lighter rim (seamless left-right so two copies tile)
        static Texture2D HillTex(int layer, int w, int h)
        {
            var t = new Texture2D(w, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            var px = new Color32[w * h];
            Color body = layer == 0 ? Hex("#7fa7c9") : Hex("#5d8a76"), rim = layer == 0 ? Hex("#a9c8e2") : Hex("#86b58f");
            for (int x = 0; x < w; x++)
            {
                float u = x / (float)w * Mathf.PI * 2f;
                float top = h * (layer == 0 ? .62f : .45f) + Mathf.Sin(u * 2 + layer) * h * .12f + Mathf.Sin(u * 5 + 1.3f * layer) * h * .06f + Mathf.Sin(u * 11) * h * .02f;
                for (int y = 0; y < h; y++)
                {
                    float d = top - y;
                    if (d < 0) { px[y * w + x] = new Color32(0, 0, 0, 0); continue; }
                    var c = d < 5 ? Color.Lerp(rim, body, d / 5f) : Color.Lerp(body, body * .82f, Mathf.Clamp01((d - 5) / h));
                    c.a = Mathf.Clamp01(d * .8f);
                    px[y * w + x] = c;
                }
            }
            t.SetPixels32(px);
            t.Apply();
            return t;
        }

        // phase 0..1 through the day (0 = midnight); daylight 0..1
        public void Tick(float phase, float daylight, float dt)
        {
            if (cam == null) return;
            float hh = cam.orthographicSize, ww = hh * cam.aspect;
            var cp = cam.transform.position;
            float dusk = Mathf.Clamp01(1f - Mathf.Abs(daylight - .5f) * 2.4f);
            Color top = Color.Lerp(NightTop, DayTop, daylight), bot = Color.Lerp(NightBot, DayBot, daylight);
            top = Color.Lerp(top, DuskTop, dusk * .6f);
            bot = Color.Lerp(bot, DuskBot, dusk * .75f);
            var px = new Color[64];
            for (int i = 0; i < 64; i++) px[i] = Color.Lerp(bot, top, i / 63f);
            gradTex.SetPixels(px);
            gradTex.Apply(false);
            grad.transform.position = new Vector3(cp.x, cp.y, 0);
            grad.transform.localScale = new Vector3(ww * 2.2f, hh * 2.2f / 64f, 1);

            // sun and moon travel an arc across the view
            float a = (phase - .25f) * Mathf.PI * 2f;
            var arc = new Vector3(Mathf.Cos(a + Mathf.PI) * ww * .85f, Mathf.Sin(a) * hh * .75f - hh * .1f, 0);
            sun.transform.position = cp + arc + Vector3.forward * 0;
            sun.transform.localScale = Vector3.one * 1.4f;
            sunHalo.transform.position = sun.transform.position;
            sunHalo.transform.localScale = Vector3.one * 6f;
            sunHalo.color = new Color(1f, .85f, .55f, .45f + dusk * .2f);
            moon.transform.position = cp - arc;
            moon.transform.localScale = Vector3.one * 1.1f;
            moonHalo.transform.position = moon.transform.position;
            moonHalo.transform.localScale = Vector3.one * 4f;
            moonHalo.color = new Color(.7f, .8f, 1f, .3f * (1 - daylight));
            sun.enabled = sunHalo.enabled = arc.y > -hh;
            moon.enabled = moonHalo.enabled = -arc.y > -hh;

            float night = 1f - daylight, t = Time.time;
            for (int i = 0; i < stars.Count; i++)
            {
                var s = stars[i];
                var lp = s.transform.localPosition;
                s.transform.position = new Vector3(cp.x + lp.x * ww, cp.y + lp.y * hh, 0);
                s.color = new Color(1, 1, 1, Mathf.Clamp01(night * 1.3f - .3f) * (.55f + .45f * Mathf.Sin(t * (1.3f + i % 5 * .4f) + i)));
            }

            // hills: parallax against the camera, tinted to the light
            for (int L = 0; L < 2; L++)
            {
                float f = L == 0 ? .12f : .25f, span = 1024f / 32f;
                float baseY = cp.y - hh * (L == 0 ? .55f : .8f) + (-cp.y - 14f) * (L == 0 ? .05f : .1f);
                float off = Mathf.Repeat(cp.x * f, span);
                var tint = Color.Lerp(new Color(.18f, .22f, .38f), Color.white, daylight);
                tint = Color.Lerp(tint, new Color(1f, .78f, .7f), dusk * .35f);
                for (int j = 0; j < 3; j++)
                {
                    var h = hills[L * 3 + j];
                    h.transform.position = new Vector3(cp.x - ww - off + j * span, baseY, 0);
                    h.color = tint;
                }
            }

            foreach (var c in clouds)
            {
                var p = c.position;
                p.x += dt * .35f;
                if (p.x > cp.x + ww + 8) p.x = cp.x - ww - 8;
                if (p.x < cp.x - ww - 10) p.x = cp.x + ww + 6;
                c.position = new Vector3(p.x, cp.y + hh * .55f + Mathf.Sin(p.x * .1f) * .8f, 0);
                var sr = c.GetComponent<SpriteRenderer>();
                sr.color = Color.Lerp(new Color(.35f, .4f, .6f, .35f), new Color(1, 1, 1, .6f), daylight);
            }
        }
    }
}
