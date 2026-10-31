// On-screen interface (Unity IMGUI with generated rounded "glass" panels): title screen with world list, hotbar with item
// icons and counts, inventory grid (click an item to put it in the selected hotbar slot), world / depth / time card,
// floating "+1 Stone" labels, pause menu and an FPS readout (F3).
using System.Collections.Generic;
using UnityEngine;

namespace Rootbound
{
    public sealed class Hud : MonoBehaviour
    {
        sealed class Label
        {
            public Vector2 At;
            public string Text;
            public Color Color;
            public float T;
        }

        public GameManager Game;
        readonly List<Label> labels = new List<Label>();
        Texture2D panel, panelHi, slot, slotSel, bar;
        GUIStyle title, h1, body, small, button, field, count, center;
        string worldName = "";
        bool styled, showFps;
        float fps = 60, fpsT;
        string toast;
        float toastT;
        Vector2 scroll;

        float S { get { return Mathf.Max(.6f, Screen.height / 1080f); } }

        public void Say(Vector2 world, string text, Color c)
        {
            labels.Add(new Label { At = world, Text = text, Color = c });
            if (labels.Count > 40) labels.RemoveAt(0);
        }

        public void Toast(string text)
        {
            toast = text;
            toastT = 2.2f;
        }

        void Update()
        {
            for (int i = labels.Count - 1; i >= 0; i--)
            {
                labels[i].T += Time.unscaledDeltaTime;
                if (labels[i].T > 1.4f) labels.RemoveAt(i);
            }
            toastT -= Time.unscaledDeltaTime;
            fpsT += Time.unscaledDeltaTime;
            fps = Mathf.Lerp(fps, 1f / Mathf.Max(1e-4f, Time.unscaledDeltaTime), .05f);
            if (InputX.DebugPressed) showFps = !showFps;
        }

        static Texture2D Rounded(int n, int r, Color fill, Color edge)
        {
            var t = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            var px = new Color[n * n];
            for (int y = 0; y < n; y++)
                for (int x = 0; x < n; x++)
                {
                    float dx = Mathf.Max(0, Mathf.Max(r - x, x - (n - 1 - r))), dy = Mathf.Max(0, Mathf.Max(r - y, y - (n - 1 - r)));
                    float d = Mathf.Sqrt(dx * dx + dy * dy);
                    float a = Mathf.Clamp01(r - d + .5f);
                    var c = d > r - 2.2f ? edge : Color.Lerp(fill, fill * 1.12f, y / (float)n);
                    c.a *= a;
                    px[y * n + x] = c;
                }
            t.SetPixels(px);
            t.Apply();
            return t;
        }

        void Style()
        {
            if (styled) return;
            styled = true;
            panel = Rounded(64, 18, new Color(.09f, .11f, .2f, .78f), new Color(.75f, .82f, 1f, .5f));
            panelHi = Rounded(64, 18, new Color(.2f, .25f, .45f, .9f), new Color(.85f, .9f, 1f, .8f));
            slot = Rounded(64, 14, new Color(.12f, .14f, .26f, .72f), new Color(.7f, .78f, 1f, .35f));
            slotSel = Rounded(64, 14, new Color(.3f, .34f, .6f, .9f), new Color(1f, .9f, .55f, 1f));
            bar = Rounded(16, 7, new Color(1, 1, 1, 1), new Color(1, 1, 1, 1));
            title = new GUIStyle { fontStyle = FontStyle.Bold, alignment = TextAnchor.MiddleCenter, normal = { textColor = new Color(1f, .95f, .8f) } };
            h1 = new GUIStyle { fontStyle = FontStyle.Bold, alignment = TextAnchor.MiddleLeft, normal = { textColor = Color.white } };
            body = new GUIStyle { alignment = TextAnchor.MiddleLeft, wordWrap = true, normal = { textColor = new Color(.9f, .93f, 1f) } };
            small = new GUIStyle(body) { normal = { textColor = new Color(.78f, .84f, 1f) } };
            center = new GUIStyle(body) { alignment = TextAnchor.MiddleCenter };
            count = new GUIStyle { fontStyle = FontStyle.Bold, alignment = TextAnchor.LowerRight, normal = { textColor = Color.white } };
            button = new GUIStyle { alignment = TextAnchor.MiddleCenter, fontStyle = FontStyle.Bold, border = new RectOffset(18, 18, 18, 18), normal = { background = panel, textColor = Color.white }, hover = { background = panelHi, textColor = new Color(1f, .95f, .75f) }, active = { background = panelHi, textColor = Color.white } };
            field = new GUIStyle { alignment = TextAnchor.MiddleLeft, padding = new RectOffset(16, 16, 0, 0), border = new RectOffset(14, 14, 14, 14), normal = { background = slot, textColor = Color.white }, focused = { background = slotSel, textColor = Color.white } };
        }

        void Sizes()
        {
            float s = S;
            title.fontSize = (int)(84 * s);
            h1.fontSize = (int)(26 * s);
            body.fontSize = (int)(20 * s);
            small.fontSize = (int)(16 * s);
            center.fontSize = (int)(20 * s);
            count.fontSize = (int)(17 * s);
            button.fontSize = (int)(22 * s);
            field.fontSize = (int)(24 * s);
        }

        void Box(Rect r, Texture2D t)
        {
            GUI.DrawTexture(r, t, ScaleMode.StretchToFill, true, 0, Color.white, 0, 18 * S);
        }

        void OnGUI()
        {
            if (Game == null) return;
            Style();
            Sizes();
            if (Game.State == GameManager.Mode.Title) TitleScreen();
            else
            {
                Labels();
                Card();
                Hotbar();
                if (Game.ShowInventory) InventoryPanel();
                if (Game.State == GameManager.Mode.Paused) Pause();
            }
            if (toastT > 0 && !string.IsNullOrEmpty(toast))
            {
                var r = new Rect(Screen.width / 2f - 260 * S, 120 * S, 520 * S, 52 * S);
                GUI.color = new Color(1, 1, 1, Mathf.Clamp01(toastT * 2));
                Box(r, panel);
                GUI.Label(r, toast, center);
                GUI.color = Color.white;
            }
            if (showFps) GUI.Label(new Rect(Screen.width - 200 * S, 12 * S, 190 * S, 30 * S), ((int)fps) + " FPS", small);
        }

        void TitleScreen()
        {
            float s = S, w = Screen.width, h = Screen.height;
            GUI.color = new Color(0, 0, 0, .35f);
            GUI.DrawTexture(new Rect(0, 0, w, h), Texture2D.whiteTexture);
            GUI.color = Color.white;
            var t = new Rect(0, h * .12f, w, 110 * s);
            var shadow = new GUIStyle(title) { normal = { textColor = new Color(0, 0, 0, .45f) } };
            GUI.Label(new Rect(t.x + 4 * s, t.y + 5 * s, t.width, t.height), "ROOTBOUND", shadow);
            GUI.Label(t, "ROOTBOUND", title);
            GUI.Label(new Rect(0, t.yMax, w, 36 * s), "Celestial Ascension", center);

            var card = new Rect(w / 2 - 300 * s, h * .36f, 600 * s, 470 * s);
            Box(card, panel);
            GUI.Label(new Rect(card.x + 30 * s, card.y + 20 * s, 540 * s, 40 * s), "World name", h1);
            GUI.SetNextControlName("world");
            worldName = GUI.TextField(new Rect(card.x + 30 * s, card.y + 66 * s, 380 * s, 58 * s), worldName, 16, field);
            bool enter = Event.current.type == EventType.KeyDown && (Event.current.keyCode == KeyCode.Return || Event.current.keyCode == KeyCode.KeypadEnter);
            if (GUI.Button(new Rect(card.x + 424 * s, card.y + 66 * s, 146 * s, 58 * s), "Play", button) || (enter && worldName.Trim().Length > 0))
            {
                Sfx.Play("click");
                Game.Play(worldName);
                return;
            }
            GUI.Label(new Rect(card.x + 30 * s, card.y + 140 * s, 540 * s, 34 * s), "Your worlds", h1);
            var worlds = Game.SavedWorlds;
            var view = new Rect(card.x + 30 * s, card.y + 180 * s, 540 * s, 210 * s);
            scroll = GUI.BeginScrollView(view, scroll, new Rect(0, 0, 520 * s, Mathf.Max(210 * s, worlds.Count * 58 * s)), GUIStyle.none, GUIStyle.none);
            for (int i = 0; i < worlds.Count; i++)
                if (GUI.Button(new Rect(0, i * 58 * s, 520 * s, 50 * s), worlds[i], button)) { Sfx.Play("click"); Game.Play(worlds[i]); }
            GUI.EndScrollView();
            if (worlds.Count == 0) GUI.Label(view, "No worlds yet: type a name and press Play. The same name always grows the same world.", small);
            if (GUI.Button(new Rect(card.x + 30 * s, card.yMax - 70 * s, 540 * s, 50 * s), "Quit", button)) Application.Quit();
        }

        void Labels()
        {
            var cam = Game.Cam;
            foreach (var l in labels)
            {
                var sp = cam.WorldToScreenPoint(new Vector3(l.At.x, l.At.y + l.T * .9f, 0));
                var r = new Rect(sp.x - 200 * S, Screen.height - sp.y - 16 * S, 400 * S, 32 * S);
                var st = new GUIStyle(center) { fontStyle = FontStyle.Bold, normal = { textColor = new Color(0, 0, 0, .6f * (1.4f - l.T)) } };
                GUI.Label(new Rect(r.x + 2, r.y + 2, r.width, r.height), l.Text, st);
                st.normal.textColor = new Color(l.Color.r, l.Color.g, l.Color.b, Mathf.Clamp01(1.4f - l.T));
                GUI.Label(r, l.Text, st);
            }
        }

        // top-left card: world, depth, time of day, gems
        void Card()
        {
            float s = S;
            var r = new Rect(18 * s, 18 * s, 330 * s, 120 * s);
            Box(r, panel);
            GUI.Label(new Rect(r.x + 22 * s, r.y + 12 * s, 290 * s, 34 * s), Game.World != null ? Game.World.Name : "", h1);
            GUI.Label(new Rect(r.x + 22 * s, r.y + 48 * s, 290 * s, 28 * s), Game.DepthText, body);
            GUI.Label(new Rect(r.x + 22 * s, r.y + 80 * s, 290 * s, 28 * s), Game.TimeText + "   " + Game.Save.Inv.Gems + " gems", small);
        }

        void Hotbar()
        {
            float s = S, z = 72 * s, gap = 8 * s;
            var inv = Game.Save.Inv;
            float total = 9 * z + 8 * gap, x0 = Screen.width / 2f - total / 2f, y0 = Screen.height - z - 22 * s;
            for (int i = 0; i < 9; i++)
            {
                var r = new Rect(x0 + i * (z + gap), y0, z, z);
                bool sel = i == inv.Selected;
                if (sel) r = new Rect(r.x - 4 * s, r.y - 8 * s, r.width + 8 * s, r.height + 8 * s);
                Box(r, sel ? slotSel : slot);
                var k = inv.Hotbar[i];
                var sp = Art.Icon(k);
                if (sp != null && inv.Count(k) > 0)
                {
                    var ir = new Rect(r.x + r.width * .14f, r.y + r.height * .14f, r.width * .72f, r.height * .72f);
                    var tr = sp.textureRect;
                    GUI.DrawTextureWithTexCoords(ir, sp.texture, new Rect(tr.x / sp.texture.width, tr.y / sp.texture.height, tr.width / sp.texture.width, tr.height / sp.texture.height));
                    if (!Inventory.IsTool(k)) GUI.Label(new Rect(r.x, r.y, r.width - 8 * s, r.height - 4 * s), inv.Count(k).ToString(), count);
                }
                GUI.Label(new Rect(r.x + 8 * s, r.y + 4 * s, 20 * s, 20 * s), (i + 1).ToString(), small);
            }
            var held = inv.Held;
            if (held != null && inv.Count(held) > 0)
                GUI.Label(new Rect(0, y0 - 40 * s, Screen.width, 32 * s), GameData.ItemName(held), center);
        }

        void InventoryPanel()
        {
            float s = S, z = 76 * s, gap = 8 * s;
            const int cols = 9;
            var inv = Game.Save.Inv;
            var items = new List<string>(inv.Sorted());
            int rows = Mathf.Max(3, (items.Count + cols - 1) / cols);
            float w = cols * z + (cols - 1) * gap + 48 * s, h = rows * (z + gap) + 110 * s;
            var r = new Rect(Screen.width / 2f - w / 2, Screen.height / 2f - h / 2 - 40 * s, w, h);
            Box(r, panel);
            GUI.Label(new Rect(r.x + 24 * s, r.y + 14 * s, w, 36 * s), "Inventory", h1);
            GUI.Label(new Rect(r.x + 24 * s, r.y + 48 * s, w - 48 * s, 26 * s), "Click an item to put it in hotbar slot " + (inv.Selected + 1) + ".", small);
            for (int i = 0; i < items.Count; i++)
            {
                var cell = new Rect(r.x + 24 * s + (i % cols) * (z + gap), r.y + 86 * s + (i / cols) * (z + gap), z, z);
                bool on = cell.Contains(Event.current.mousePosition);
                Box(cell, on ? slotSel : slot);
                var sp = Art.Icon(items[i]);
                if (sp != null)
                {
                    var tr = sp.textureRect;
                    GUI.DrawTextureWithTexCoords(new Rect(cell.x + z * .14f, cell.y + z * .14f, z * .72f, z * .72f), sp.texture, new Rect(tr.x / sp.texture.width, tr.y / sp.texture.height, tr.width / sp.texture.width, tr.height / sp.texture.height));
                }
                GUI.Label(new Rect(cell.x, cell.y, z - 8 * s, z - 4 * s), inv.Count(items[i]).ToString(), count);
                if (on) GUI.Label(new Rect(r.x + 24 * s, r.yMax - 34 * s, w, 28 * s), GameData.ItemName(items[i]), body);
                if (GUI.Button(cell, GUIContent.none, GUIStyle.none))
                {
                    int sel = inv.Selected;
                    for (int j = 0; j < inv.Hotbar.Length; j++)
                        if (inv.Hotbar[j] == items[i]) inv.Hotbar[j] = inv.Hotbar[sel];
                    inv.Hotbar[sel] = items[i];
                    Sfx.Play("click");
                }
            }
            if (items.Count == 0) GUI.Label(new Rect(r.x + 24 * s, r.y + 90 * s, w - 48 * s, 60 * s), "Nothing yet. Break some blocks!", body);
        }

        void Pause()
        {
            float s = S;
            GUI.color = new Color(0, 0, 0, .45f);
            GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), Texture2D.whiteTexture);
            GUI.color = Color.white;
            var r = new Rect(Screen.width / 2f - 220 * s, Screen.height / 2f - 170 * s, 440 * s, 340 * s);
            Box(r, panel);
            GUI.Label(new Rect(r.x, r.y + 20 * s, r.width, 50 * s), "Paused", new GUIStyle(h1) { alignment = TextAnchor.MiddleCenter, fontSize = (int)(34 * s) });
            if (GUI.Button(new Rect(r.x + 40 * s, r.y + 100 * s, 360 * s, 56 * s), "Resume", button)) { Sfx.Play("click"); Game.Resume(); }
            if (GUI.Button(new Rect(r.x + 40 * s, r.y + 170 * s, 360 * s, 56 * s), "Save & leave world", button)) { Sfx.Play("click"); Game.Leave(); }
            if (GUI.Button(new Rect(r.x + 40 * s, r.y + 240 * s, 360 * s, 56 * s), "Quit game", button)) { Game.SaveAll(); Application.Quit(); }
        }
    }
}
