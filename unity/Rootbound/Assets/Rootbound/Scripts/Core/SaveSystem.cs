// Saves live in the Unity persistent data folder (separate from the web/Electron game's save, which is never touched):
//   worlds/<name>.json  - only the cells you changed (tile edits, chopped trees)
//   player.json         - inventory, hotbar, gems, where you stood in each world, time of day
using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Rootbound
{
    public sealed class PlayerSave
    {
        public Inventory Inv = new Inventory();
        public Dictionary<string, Vector2> Spots = new Dictionary<string, Vector2>();
        public float Clock = 30f;
        public string LastWorld = "";
    }

    public static class SaveSystem
    {
        public static string Root
        {
            get { return Path.Combine(Application.persistentDataPath, "RootboundSaves"); }
        }

        static string WorldFile(string n)
        {
            return Path.Combine(Root, "worlds", n + ".json");
        }

        public static List<string> Worlds()
        {
            var l = new List<string>();
            var d = Path.Combine(Root, "worlds");
            if (!Directory.Exists(d)) return l;
            var files = new DirectoryInfo(d).GetFiles("*.json");
            Array.Sort(files, (a, b) => b.LastWriteTimeUtc.CompareTo(a.LastWriteTimeUtc));
            foreach (var f in files) l.Add(Path.GetFileNameWithoutExtension(f.Name));
            return l;
        }

        public static void SaveWorld(World w)
        {
            var tiles = new Dictionary<string, object>();
            foreach (var kv in w.TileEdits) tiles[kv.Key.ToString()] = kv.Value;
            var trees = new Dictionary<string, object>();
            foreach (var kv in w.TreeEdits) trees[kv.Key.ToString()] = kv.Value;
            var o = new Dictionary<string, object> { { "g", 2 }, { "v", 1 }, { "tiles", tiles }, { "trees", trees } };
            Write(WorldFile(w.Name), Json.Write(o));
        }

        public static void LoadWorld(World w)
        {
            var f = WorldFile(w.Name);
            if (!File.Exists(f)) return;
            try
            {
                var o = Json.Parse(File.ReadAllText(f));
                var tiles = Json.O(o, "tiles");
                if (tiles != null)
                    foreach (var kv in tiles)
                    {
                        int k = int.Parse(kv.Key), b = (int)(double)kv.Value;
                        if (k < 0 || k >= w.Tiles.Length) continue;
                        w.SetGen(k % w.W, k / w.W, b);
                        if (b != 0) w.Water[k] = 0;
                        w.TileEdits[k] = b;
                    }
                var trees = Json.O(o, "trees");
                if (trees != null)
                    foreach (var kv in trees)
                    {
                        int k = int.Parse(kv.Key), t = (int)(double)kv.Value;
                        if (t == 0) w.Trees.Remove(k);
                        else w.Trees[k] = new Tree { Type = t };
                        w.TreeEdits[k] = t;
                    }
            }
            catch (Exception e)
            {
                Debug.LogWarning("Rootbound: could not read world save " + f + ": " + e.Message);
            }
        }

        public static void SavePlayer(PlayerSave p)
        {
            var items = new Dictionary<string, object>();
            foreach (var kv in p.Inv.Items) items[kv.Key] = kv.Value;
            var spots = new Dictionary<string, object>();
            foreach (var kv in p.Spots) spots[kv.Key] = new List<object> { kv.Value.x, kv.Value.y };
            var hot = new List<object>();
            foreach (var h in p.Inv.Hotbar) hot.Add(h);
            var o = new Dictionary<string, object>
            {
                { "items", items }, { "hot", hot }, { "sel", p.Inv.Selected }, { "gems", (double)p.Inv.Gems },
                { "spots", spots }, { "clock", p.Clock }, { "last", p.LastWorld }
            };
            Write(Path.Combine(Root, "player.json"), Json.Write(o));
        }

        public static PlayerSave LoadPlayer()
        {
            var p = new PlayerSave();
            var f = Path.Combine(Root, "player.json");
            if (!File.Exists(f)) return p;
            try
            {
                var o = Json.Parse(File.ReadAllText(f));
                var items = Json.O(o, "items");
                if (items != null) foreach (var kv in items) p.Inv.Items[kv.Key] = (int)(double)kv.Value;
                var hot = Json.A(o, "hot");
                if (hot != null) for (int i = 0; i < hot.Count && i < p.Inv.Hotbar.Length; i++) p.Inv.Hotbar[i] = hot[i] as string;
                p.Inv.Selected = Mathf.Clamp((int)Json.N(o, "sel"), 0, 8);
                p.Inv.Gems = (long)Json.N(o, "gems");
                var spots = Json.O(o, "spots");
                if (spots != null)
                    foreach (var kv in spots)
                    {
                        var a = kv.Value as List<object>;
                        if (a != null && a.Count == 2) p.Spots[kv.Key] = new Vector2((float)(double)a[0], (float)(double)a[1]);
                    }
                p.Clock = (float)Json.N(o, "clock", 30);
                p.LastWorld = Json.S(o, "last");
            }
            catch (Exception e)
            {
                Debug.LogWarning("Rootbound: could not read player save: " + e.Message);
            }
            return p;
        }

        // write to a temp file first so a crash mid-save never corrupts the old save
        static void Write(string path, string text)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            var tmp = path + ".tmp";
            File.WriteAllText(tmp, text);
            if (File.Exists(path)) File.Replace(tmp, path, null);
            else File.Move(tmp, path);
        }
    }
}
