// Which tool may break which block (same rules as the web game's TOOLS8):
//  - a tool built for the block's category breaks it in one hit;
//  - the Ore Pick refuses every block that isn't an ore;
//  - a block with an "only" tool (Geode Rock -> the Rock Tapper) refuses every other tool;
//  - any other tool just chips at it one point at a time.
namespace Rootbound
{
    public enum HitKind { Refuse, Slow, Good, Unbreakable }

    public static class ToolRules
    {
        public static readonly string[] KindNames = { "soft", "stone", "ore", "tree" };

        public static bool Fits(string tool, string cat)
        {
            return tool == cat || (tool == "soft" && cat == "wood") || (tool == "tree" && cat == "wood");
        }

        public static bool Unbreakable(int block)
        {
            var b = GameData.Block(block);
            return block == 4 || block == 70 || (b != null && b.Hardness >= 99);
        }

        public static HitKind Check(string tool, int block)
        {
            if (Unbreakable(block)) return HitKind.Unbreakable;
            var b = GameData.Block(block);
            string cat = b != null ? b.Cat : "soft";
            if (Fits(tool, cat)) return HitKind.Good;
            if (tool == "ore") return HitKind.Refuse;
            if (b != null && b.Only != "" && b.Only != tool) return HitKind.Refuse;
            return HitKind.Slow;
        }

        public static string ToolName(string kind)
        {
            switch (kind)
            {
                case "soft": return "Pocket Shovel";
                case "stone": return "Rock Tapper";
                case "ore": return "Ore Pick";
                case "tree": return "Tree Axe";
            }
            return kind;
        }

        public static string RefuseText(string tool, int block)
        {
            var b = GameData.Block(block);
            if (b != null && b.Only != "" && b.Only != tool) return "Only the " + ToolName(b.Only) + " can break this";
            return "The Ore Pick only mines ores";
        }

        // what a broken block gives back (grass -> dirt, biome rocks -> plain blocks, everything else itself)
        public static int DropOf(int block)
        {
            int d;
            if (GameData.Drop.TryGetValue(block, out d)) return d;
            return block == 2 ? 1 : block;
        }
    }
}
