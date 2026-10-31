// Game data exported from the web build (tools/unity-export.js -> StreamingAssets/Rootbound/data.json):
// every block's name, colour, hardness, solidity, mining category and price, the tools and materials, and where each
// sprite sits in the exported atlases.
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Rootbound
{
    public sealed class BlockInfo
    {
        public int Id;
        public string Name;
        public Color Color;
        public int Hardness;
        public bool Solid;
        public int Price;
        public string Cat;   // soft | stone | ore | wood
        public string Only;  // the one tool kind allowed to break it ("" = any)
        public Color? Glow;
        public int[] AtlasCells = new int[3];
    }

    public sealed class ToolInfo
    {
        public string Id;
        public string Name;
        public string Kind;  // soft | stone | ore | tree | rod
        public string Desc;
        public float Cooldown;
        public Color Glow;
    }

    public sealed class MatInfo
    {
        public int Id;
        public string Name;
        public Color Color;
        public int Price;
    }

    public static class GameData
    {
        public const int T = 48;
        public static int W = 256, H = 128;
        public static float Day = 240f;
        public static float Reach = 4.6f;
        public static Vector2 PlayerSize = new Vector2(26, 54);

        public static readonly Dictionary<int, BlockInfo> Blocks = new Dictionary<int, BlockInfo>();
        public static readonly Dictionary<string, ToolInfo> Tools = new Dictionary<string, ToolInfo>();
        public static readonly Dictionary<int, MatInfo> Mats = new Dictionary<int, MatInfo>();
        public static readonly Dictionary<int, int> Drop = new Dictionary<int, int>();
        public static Dictionary<string, object> Raw;
        public static bool Loaded;

        public static string Dir
        {
            get { return Path.Combine(Application.streamingAssetsPath, "Rootbound"); }
        }

        public static void Load()
        {
            if (Loaded) return;
            Raw = Json.Parse(File.ReadAllText(Path.Combine(Dir, "data.json"))) as Dictionary<string, object>;
            W = (int)Json.N(Raw, "W", 256);
            H = (int)Json.N(Raw, "H", 128);
            Day = (float)Json.N(Raw, "DAY", 240);
            Reach = (float)Json.N(Raw, "REACH", 4.6);
            var pl = Json.O(Raw, "player");
            PlayerSize = new Vector2((float)Json.N(pl, "w", 26), (float)Json.N(pl, "h", 54));

            var blocks = Json.O(Raw, "blocks");
            var map = Json.O(Json.O(Raw, "blockAtlas"), "map");
            foreach (var kv in blocks)
            {
                int id = int.Parse(kv.Key);
                var b = kv.Value;
                var info = new BlockInfo
                {
                    Id = id,
                    Name = Json.S(b, "n"),
                    Color = Hex(Json.S(b, "c", "#888888")),
                    Hardness = (int)Json.N(b, "h", 3),
                    Solid = Json.N(b, "solid", 1) > 0,
                    Price = (int)Json.N(b, "price"),
                    Cat = Json.S(b, "cat", "soft"),
                    Only = Json.S(b, "only", "")
                };
                var g = Json.A(b, "glow");
                if (g != null && g.Count >= 3) info.Glow = new Color((float)(double)g[0] / 255f, (float)(double)g[1] / 255f, (float)(double)g[2] / 255f);
                var cells = Json.A(map, kv.Key);
                for (int v = 0; v < 3; v++)
                    info.AtlasCells[v] = cells != null && v < cells.Count && cells[v] != null ? (int)(double)cells[v] : (cells != null && cells.Count > 0 && cells[0] != null ? (int)(double)cells[0] : -1);
                Blocks[id] = info;
            }

            foreach (var kv in Json.O(Raw, "tools"))
            {
                var t = kv.Value;
                var g = Json.A(t, "g");
                Tools[kv.Key] = new ToolInfo
                {
                    Id = kv.Key,
                    Name = Json.S(t, "n"),
                    Kind = Json.S(t, "tool"),
                    Desc = Json.S(t, "d"),
                    Cooldown = (float)Json.N(t, "cd", .18),
                    Glow = g != null ? new Color((float)(double)g[0] / 255f, (float)(double)g[1] / 255f, (float)(double)g[2] / 255f) : Color.white
                };
            }

            var mats = Json.O(Raw, "mats");
            if (mats != null)
                foreach (var kv in mats)
                {
                    int id;
                    if (!int.TryParse(kv.Key, out id)) continue;
                    Mats[id] = new MatInfo { Id = id, Name = Json.S(kv.Value, "n"), Color = Hex(Json.S(kv.Value, "c", "#ffffff")), Price = (int)Json.N(kv.Value, "p") };
                }

            var drop = Json.O(Raw, "drop");
            if (drop != null)
                foreach (var kv in drop) Drop[int.Parse(kv.Key)] = (int)(double)kv.Value;
            Loaded = true;
        }

        public static BlockInfo Block(int id)
        {
            BlockInfo b;
            return Blocks.TryGetValue(id, out b) ? b : null;
        }

        public static bool IsSolid(int id)
        {
            if (id == 0) return false;
            var b = Block(id);
            return b == null || b.Solid;
        }

        public static string ItemName(string key)
        {
            if (key.StartsWith("w:"))
            {
                ToolInfo t;
                return Tools.TryGetValue(key.Substring(2), out t) ? t.Name : key;
            }
            int id;
            if (int.TryParse(key, out id))
            {
                var b = Block(id);
                if (b != null) return b.Name;
                MatInfo m;
                if (Mats.TryGetValue(id, out m)) return m.Name;
            }
            return key;
        }

        public static Color Hex(string h)
        {
            Color c;
            return ColorUtility.TryParseHtmlString(h, out c) ? c : Color.gray;
        }
    }
}
