// Off-screen smoke test, only active when Unity is started with the RB_SMOKE environment variable (see
// Editor/RootboundSmoke.cs): drives the game through the title, a world, mining, placing, the underground and the night,
// saves camera screenshots and writes a JSON report next to them. Never runs in normal play.
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Rootbound.Dev
{
    public sealed class SmokeTest : MonoBehaviour
    {
        string outDir;
        readonly List<string> errors = new List<string>();
        readonly Dictionary<string, object> report = new Dictionary<string, object>();

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Hook()
        {
            var dir = Environment.GetEnvironmentVariable("RB_SMOKE");
            if (string.IsNullOrEmpty(dir)) return;
            var go = new GameObject("SmokeTest");
            DontDestroyOnLoad(go);
            go.AddComponent<SmokeTest>().outDir = dir;
        }

        void OnEnable() { Application.logMessageReceived += OnLog; }
        void OnDisable() { Application.logMessageReceived -= OnLog; }

        void OnLog(string msg, string stack, LogType t)
        {
            if ((stack ?? "").Contains("UnityEditor.") || msg.Contains("UnityEditor.")) return;
            if (t == LogType.Error || t == LogType.Exception || t == LogType.Assert) errors.Add(msg + " | " + (stack ?? "").Split('\n')[0]);
        }

        IEnumerator Start()
        {
            Directory.CreateDirectory(outDir);
            GameManager gm = null;
            for (int i = 0; i < 100 && gm == null; i++) { gm = FindAnyObjectByType<GameManager>(); yield return null; }
            yield return new WaitForSeconds(1.5f);
            Shot(gm, "1-title");
            report["titleState"] = gm.State.ToString();

            gm.Play("unitysmoke");
            yield return new WaitForSeconds(2f);
            Shot(gm, "2-world");
            var w = gm.World;
            var hero = FindAnyObjectByType<Player>();
            report["world"] = w.Name;
            report["spawnGrounded"] = hero.Grounded;
            report["surfaceAtDoor"] = w.Sh(w.DoorX);
            int trees = w.Trees.Count, ores = 0, water = 0;
            for (int k = 0; k < w.Tiles.Length; k++)
            {
                var b = GameData.Block(w.Tiles[k]);
                if (b != null && b.Cat == "ore") ores++;
                if (w.Water[k] > 0) water++;
            }
            report["trees"] = trees;
            report["oreTiles"] = ores;
            report["waterCells"] = water;

            // tool rules on real blocks
            report["rule_glimmer_stone"] = ToolRules.Check("ore", 3).ToString();
            report["rule_glimmer_iron"] = ToolRules.Check("ore", 72).ToString();
            report["rule_pebble_geode"] = ToolRules.Check("stone", 219).ToString();
            report["rule_pip_geode"] = ToolRules.Check("soft", 219).ToString();
            report["rule_pip_stone"] = ToolRules.Check("soft", 3).ToString();

            // walk right for a moment (physics + animation)
            float x0 = hero.X;
            hero.Vx = 260;
            for (int i = 0; i < 30; i++) { hero.Vx = 260; yield return null; }
            report["walked"] = hero.X - x0;

            // break the block under the hero's feet with the shovel, place it back
            int tx = Mathf.FloorToInt(hero.X / GameData.T), ty = Mathf.FloorToInt((hero.Y + hero.Ht + 2) / GameData.T);
            int before = w.Get(tx, ty);
            w.Set(tx, ty, 0);
            yield return null;
            w.Set(tx, ty, before);
            report["editTracked"] = w.TileEdits.ContainsKey(ty * w.W + tx);
            gm.Save.Inv.Add("3", 5);
            report["invStone"] = gm.Save.Inv.Count("3");

            // underground: drop the hero into a cave and look around
            int cx = w.DoorX + 20, cy = w.Sh(cx) + 30;
            for (int y = cy - 3; y <= cy; y++) for (int x = cx - 4; x <= cx + 4; x++) w.Set(x, y, 0);
            hero.Spawn(w, new Vector2((cx + .5f) * GameData.T, (cy - 1) * GameData.T - hero.Ht));
            yield return new WaitForSeconds(1.5f);
            Shot(gm, "3-cave");

            // night on the surface
            hero.Spawn(w, null);
            gm.Save.Clock = GameData.Day * .55f;
            yield return new WaitForSeconds(1.5f);
            Shot(gm, "4-night");
            gm.Save.Clock = GameData.Day * .05f;
            yield return new WaitForSeconds(1f);
            Shot(gm, "5-day");

            gm.SaveAll();
            report["saved"] = File.Exists(Path.Combine(SaveSystem.Root, "worlds", "unitysmoke.json"));
            float t0 = Time.realtimeSinceStartup;
            int frames = 0;
            while (Time.realtimeSinceStartup - t0 < 2f) { frames++; yield return null; }
            report["fps"] = frames / 2f;
            report["errors"] = errors;
            File.WriteAllText(Path.Combine(outDir, "report.json"), Json.Write(report));
            File.WriteAllText(Path.Combine(outDir, "done"), "1");
        }

        void Shot(GameManager gm, string name)
        {
            var cam = gm.Cam;
            var rt = new RenderTexture(1280, 720, 24, RenderTextureFormat.ARGB32);
            var prev = cam.targetTexture;
            cam.targetTexture = rt;
            cam.Render();
            var old = RenderTexture.active;
            RenderTexture.active = rt;
            var tex = new Texture2D(1280, 720, TextureFormat.RGB24, false);
            tex.ReadPixels(new Rect(0, 0, 1280, 720), 0, 0);
            tex.Apply();
            RenderTexture.active = old;
            cam.targetTexture = prev;
            File.WriteAllBytes(Path.Combine(outDir, name + ".png"), tex.EncodeToPNG());
            Destroy(tex);
            rt.Release();
        }
    }
}
