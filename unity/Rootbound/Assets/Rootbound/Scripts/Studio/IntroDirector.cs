// Studio only (the real game is the web version): renders the web game's cinematic opening frame by frame.
// Active only when Unity is started with RB_STUDIO=intro (Editor/RootboundStudio.cs); writes PNG frames to RB_STUDIO_OUT.
// It is the backdrop of the last two story scenes, restore (6.5 s) and title (7.5 s): starry night over the floating
// islands, light returning around the scene's flash (1.6 s), dawn by 4 s, then a glide over the sunlit land down to the hero
// at the spawn door, leaving the sky clear for the RootBound title the web game draws on top.
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Rootbound.Studio
{
    public sealed class IntroDirector : MonoBehaviour
    {
        public const int Fps = 30, Width = 1600, Height = 900;
        public const float Length = 14f;

        struct Key
        {
            public float T;
            public Vector2 P;
            public float Size, Clock;
            public Key(float t, Vector2 p, float size, float clock) { T = t; P = p; Size = size; Clock = clock; }
        }

        string outDir;
        GameManager gm;
        Player hero;
        readonly List<Key> keys = new List<Key>();
        float t;
        RenderTexture rt;
        Texture2D grab;
        int frame;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Hook()
        {
            if (System.Environment.GetEnvironmentVariable("RB_STUDIO") != "intro") return;
            var go = new GameObject("IntroDirector");
            go.AddComponent<IntroDirector>().outDir = System.Environment.GetEnvironmentVariable("RB_STUDIO_OUT");
        }

        IEnumerator Start()
        {
            Directory.CreateDirectory(outDir);
            Time.captureFramerate = Fps;
            for (int i = 0; i < 100 && gm == null; i++) { gm = FindAnyObjectByType<GameManager>(); yield return null; }
            gm.Directed = true;
            var hud = gm.GetComponent<Hud>();
            if (hud != null) hud.enabled = false;
            hero = gm.GetComponentInChildren<Player>(true);
            yield return null;
            Stage();
            rt = new RenderTexture(Width, Height, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 };
            grab = new Texture2D(Width, Height, TextureFormat.RGBA32, false);
            gm.Cam.targetTexture = rt;
            // let lights, water and particles settle on the first shot before recording
            for (int i = 0; i < 20; i++) { Drive(0); yield return null; }
            // (batch mode never reaches "end of frame", so each frame is rendered explicitly after the game's Update)
            Drive(0);
            while (t <= Length)
            {
                yield return null;
                Capture();
                t += 1f / Fps;
                Drive(t);
            }
            File.WriteAllText(Path.Combine(outDir, "frames.txt"), frame.ToString());
            File.WriteAllText(Path.Combine(outDir, "done"), "1");
        }

        // build the shot list from the world: its sky islands, lake, door, and a crystal cave we dig for the scene
        void Stage()
        {
            var w = gm.World;
            int door = w.DoorX;
            int lake = FindLake(w, door);
            Vector2 island = FindIsland(w, door);

            float surf = -w.Sh(door);
            hero.gameObject.SetActive(true);
            hero.Spawn(w, null);

            // times in seconds, camera centre in world units, orthographic size, clock as a fraction of a day
            // (the game shows phase = clock + .3: .78 is deep night, .93 dawn, .985 bright morning)
            float day = GameData.Day;
            keys.Add(new Key(0f, new Vector2(island.x - 16, island.y + 8), 11f, day * .80f));
            keys.Add(new Key(1.6f, new Vector2(island.x - 10, island.y + 6), 10.6f, day * .86f));
            keys.Add(new Key(4.0f, new Vector2(island.x - 2, island.y + 3), 10f, day * .935f));
            keys.Add(new Key(6.5f, new Vector2(island.x + 5, island.y), 9.4f, day * .95f));
            keys.Add(new Key(9.5f, new Vector2(lake, -w.Sh(lake) + 3f), 8f, day * .965f));
            keys.Add(new Key(14f, new Vector2(door + .5f - 4.5f, surf + 4.2f), 6.4f, day * .985f));   // hero lower right, under the title text
            gm.Cam.transform.position = new Vector3(keys[0].P.x, keys[0].P.y, -10);
        }

        static int FindLake(World w, int door)
        {
            int best = door - 30, bestD = 9999;
            for (int x = 6; x < w.W - 6; x++)
            {
                int s = w.Sh(x);
                if (w.Water[s * w.W + x] == 0) continue;
                int d = Mathf.Abs(x - door);
                if (d > 8 && d < bestD) { bestD = d; best = x; }
            }
            return best;
        }

        static Vector2 FindIsland(World w, int door)
        {
            for (int r = 0; r < w.W / 2; r++)
                foreach (int x in new[] { door - r, door + r })
                {
                    if (x < 8 || x >= w.W - 8) continue;
                    int s = w.Sh(x);
                    for (int y = 2; y < s - 3; y++)
                        if (w.Tiles[y * w.W + x] != 0) return new Vector2(x, -y);
                }
            return new Vector2(door - 20, -w.Sh(door) + 8);
        }

        // camera follows a smooth (Catmull-Rom) path through the keys with eased timing
        void Drive(float time)
        {
            int i = 0;
            while (i < keys.Count - 2 && time > keys[i + 1].T) i++;
            var a = keys[Mathf.Max(0, i - 1)];
            var b = keys[i];
            var c = keys[i + 1];
            var d = keys[Mathf.Min(keys.Count - 1, i + 2)];
            float u = Mathf.Clamp01((time - b.T) / Mathf.Max(.001f, c.T - b.T));
            u = u * u * (3 - 2 * u);
            var p = CatmullRom(a.P, b.P, c.P, d.P, u);
            float size = Mathf.Lerp(b.Size, c.Size, u);
            float clock = Mathf.Lerp(b.Clock, c.Clock, u);
            var cam = gm.Cam;
            cam.transform.position = new Vector3(p.x, p.y, -10);
            cam.orthographicSize = size;
            gm.Save.Clock = clock;
            if (hero != null && hero.gameObject.activeSelf) hero.Step(1f / Fps, true);
        }

        static Vector2 CatmullRom(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 p3, float t)
        {
            float t2 = t * t, t3 = t2 * t;
            return .5f * (2f * p1 + (-p0 + p2) * t + (2f * p0 - 5f * p1 + 4f * p2 - p3) * t2 + (-p0 + 3f * p1 - 3f * p2 + p3) * t3);
        }

        void Capture()
        {
            var cam = gm.Cam;
            cam.Render();
            var old = RenderTexture.active;
            RenderTexture.active = rt;
            grab.ReadPixels(new Rect(0, 0, Width, Height), 0, 0);
            grab.Apply(false);
            RenderTexture.active = old;
            File.WriteAllBytes(Path.Combine(outDir, "f" + frame.ToString("D4") + ".png"), grab.EncodeToPNG());
            frame++;
        }
    }
}
