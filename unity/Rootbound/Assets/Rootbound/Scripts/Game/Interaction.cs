// Mining and building, following the web game's rules:
//  - hold left click with a tool: the right tool breaks a block in one hit, another tool chips at it, and refused blocks
//    (non-ores for the Ore Pick, Geode Rock for anything but the Rock Tapper) don't break at all;
//  - the Ore Pick mines the whole vein (up to 8 more of the same ore) and sometimes finds a bonus ore;
//  - clicking a tree chops it (the Tree Axe gets 2 extra wood);
//  - right click places the held block;
//  - the cursor square shows green (right tool), amber (slow), red (refused) or white (place).
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Rootbound
{
    public sealed class Interaction : MonoBehaviour
    {
        World world;
        Player player;
        WorldView view;
        Drops drops;
        Inventory inv;
        Camera cam;
        float cd, tipT;
        SpriteRenderer cursor, crack;
        public System.Action<Vector2, string, Color> Say;
        public bool Blocked;

        public void Init(Player p, WorldView v, Drops d, Camera c)
        {
            player = p;
            view = v;
            drops = d;
            cam = c;
            cursor = new GameObject("Cursor").AddComponent<SpriteRenderer>();
            cursor.transform.SetParent(transform, false);
            cursor.sprite = Art.OutlineSprite;
            cursor.sharedMaterial = Art.Unlit;
            cursor.sortingOrder = WorldView.OrderCursor;
            crack = new GameObject("Crack").AddComponent<SpriteRenderer>();
            crack.transform.SetParent(transform, false);
            crack.sharedMaterial = Art.Unlit;
            crack.sortingOrder = WorldView.OrderCrack;
            crack.color = new Color(1, 1, 1, .85f);
        }

        public void SetWorld(World w, Inventory i)
        {
            world = w;
            inv = i;
            StopAllCoroutines();
            cursor.enabled = crack.enabled = false;
        }

        bool InReach(int tx, int ty)
        {
            var c = player.Center;
            return Vector2.Distance(c, new Vector2(tx + .5f, -ty - .5f)) < GameData.Reach;
        }

        public void Tick(float dt)
        {
            if (world == null) return;
            cd -= dt;
            tipT -= dt;
            Vector3 mw = cam.ScreenToWorldPoint(new Vector3(InputX.MousePos.x, InputX.MousePos.y, -cam.transform.position.z));
            int tx = Mathf.FloorToInt(mw.x), ty = Mathf.FloorToInt(-mw.y);
            bool reach = world.In(tx, ty) && InReach(tx, ty);
            string held = inv.Held;
            ToolInfo tool = null;
            if (Inventory.IsTool(held)) GameData.Tools.TryGetValue(held.Substring(2), out tool);

            // cursor colour tells you what a click will do
            int b = world.Get(tx, ty);
            cursor.enabled = reach && !Blocked;
            cursor.transform.position = new Vector3(tx, -ty, 0);
            if (tool != null && b != 0)
            {
                var hk = ToolRules.Check(tool.Kind, b);
                cursor.color = hk == HitKind.Good ? new Color(.6f, 1f, .68f, .95f) : hk == HitKind.Slow ? new Color(1f, .83f, .48f, .9f) : new Color(1f, .45f, .45f, .9f);
            }
            else cursor.color = new Color(1, 1, 1, .55f);

            // crack overlay on a damaged block
            var bi = GameData.Block(b);
            float frac = bi != null && b != 0 ? world.Hp[ty * world.W + tx] / Mathf.Max(1, bi.Hardness) : 1;
            crack.enabled = reach && b != 0 && frac < .999f;
            if (crack.enabled)
            {
                crack.sprite = Art.CrackSprites[Mathf.Clamp((int)((1 - frac) * 5), 0, 4)];
                crack.transform.position = new Vector3(tx + .5f, -ty - .5f, 0);
            }

            if (Blocked || !reach || cd > 0) return;
            if (InputX.MouseLeft && tool != null && tool.Kind != "rod") Use(tool, tx, ty, mw);
            else if (InputX.MouseRight) Place(held, tx, ty);
        }

        void Use(ToolInfo tool, int tx, int ty, Vector2 mw)
        {
            cd = tool.Cooldown;
            int tk = view.TreeAt(mw);
            if (tk >= 0)
            {
                var t = world.Trees[tk];
                world.RemoveTree(tk);
                float px = (tk % world.W) * GameData.T + GameData.T / 2f, py = (tk / world.W) * GameData.T;
                int wood = 3 + Random.Range(0, 2) + (tool.Kind == "tree" ? 2 : 0);
                drops.Spawn(px, py, "5", wood);
                if (Fx.I != null) Fx.I.Leaves(new Vector2(px / GameData.T, -py / GameData.T + 2.2f), 18, t.Type == 50 ? new Color(1f, .7f, .8f) : new Color(.45f, .75f, .35f));
                if (tool.Kind == "tree" && Say != null) Say(new Vector2(px / GameData.T, -py / GameData.T + 1), "+2 Wood", new Color(.85f, 1f, .7f));
                Sfx.Play("chop");
                return;
            }
            int b = world.Get(tx, ty);
            if (b == 0) return;
            var hk = ToolRules.Check(tool.Kind, b);
            var c = new Vector2(tx + .5f, -ty - .5f);
            var info = GameData.Block(b);
            Color col = info != null ? info.Color : Color.gray;
            if (hk == HitKind.Unbreakable || hk == HitKind.Refuse)
            {
                Sfx.Play("refuse", .6f);
                if (tipT <= 0 && Say != null)
                {
                    tipT = 2.5f;
                    Say(c + Vector2.up * .3f, hk == HitKind.Refuse ? ToolRules.RefuseText(tool.Kind, b) : "This can't be broken", new Color(1f, .82f, .82f));
                }
                return;
            }
            bool good = hk == HitKind.Good;
            int k = ty * world.W + tx;
            world.Hp[k] -= good ? 255 : 1;
            string cat = info != null ? info.Cat : "soft";
            if (world.Hp[k] > 0)
            {
                if (Fx.I != null) Fx.I.Hit(c, col, good);
                Sfx.Play(Sfx.ForCategory(cat), .55f);
                if (!good && tipT <= 0 && Say != null) { tipT = 9f; Say(c + Vector2.up * .3f, "Slow - try another tool", new Color(1f, .82f, .82f)); }
                return;
            }
            Break(tx, ty, b, true);
            if (good && Fx.I != null) Fx.I.Sparkle(c, tool.Glow, 5);
            if (tool.Kind == "ore" && cat == "ore")
            {
                if (Random.value < .5f)
                {
                    drops.Spawn(tx * GameData.T + 24, ty * GameData.T + 24, ToolRules.DropOf(b).ToString(), 1);
                    if (Say != null) Say(c + Vector2.up * .6f, "Bonus ore!", new Color(.75f, .96f, 1f));
                }
                StartCoroutine(Vein(tx, ty, b, 8));
            }
        }

        void Break(int tx, int ty, int b, bool loud)
        {
            var info = GameData.Block(b);
            world.Set(tx, ty, 0);
            drops.Spawn(tx * GameData.T + 24, ty * GameData.T + 24, ToolRules.DropOf(b).ToString(), 1);
            var c = new Vector2(tx + .5f, -ty - .5f);
            bool shiny = info != null && (info.Cat == "ore" || info.Glow.HasValue);
            if (Fx.I != null) Fx.I.Break(c, info != null ? info.Color : Color.gray, shiny);
            if (loud) Sfx.Play(shiny ? "ore" : "break", .6f, shiny ? 1.1f : 1f);
        }

        // the rest of an ore vein crumbles one block after another
        IEnumerator Vein(int tx, int ty, int id, int n)
        {
            var seen = new HashSet<int> { ty * world.W + tx };
            var q = new Queue<Vector2Int>();
            q.Enqueue(new Vector2Int(tx, ty));
            var outl = new List<Vector2Int>();
            while (q.Count > 0 && outl.Count < n)
            {
                var p = q.Dequeue();
                for (int d = 0; d < 4; d++)
                {
                    int nx = p.x + (d == 0 ? 1 : d == 1 ? -1 : 0), ny = p.y + (d == 2 ? 1 : d == 3 ? -1 : 0);
                    if (nx < 1 || ny < 1 || nx >= world.W - 1 || ny >= world.H - 1) continue;
                    int k = ny * world.W + nx;
                    if (!seen.Add(k) || world.Tiles[k] != id) continue;
                    outl.Add(new Vector2Int(nx, ny));
                    q.Enqueue(new Vector2Int(nx, ny));
                }
            }
            for (int i = 0; i < outl.Count; i++)
            {
                yield return new WaitForSeconds(.07f);
                var p = outl[i];
                if (world.Get(p.x, p.y) == id)
                {
                    Break(p.x, p.y, id, false);
                    Sfx.Play("ore", .4f, 1f + i * .06f);
                }
            }
        }

        void Place(string held, int tx, int ty)
        {
            int b = Inventory.BlockOf(held);
            if (b == 0 || inv.Count(held) <= 0) return;
            if (world.Get(tx, ty) != 0 || world.Trees.ContainsKey(ty * world.W + tx)) return;
            // never inside the hero
            var hb = player.HitboxTiles;
            if (tx + 1 > hb.xMin && tx < hb.xMax && ty + 1 > hb.yMin && ty < hb.yMax) return;
            inv.Take(held, 1);
            world.Set(tx, ty, b);
            cd = .12f;
            var info = GameData.Block(b);
            if (Fx.I != null) Fx.I.Hit(new Vector2(tx + .5f, -ty - .5f), info != null ? info.Color : Color.gray, true);
            Sfx.Play("place", .5f);
        }
    }
}
