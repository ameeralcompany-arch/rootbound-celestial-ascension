// Runs the game: loads the exported data and art, sets up the camera (orthographic, URP post-processing with bloom,
// vignette and a gentle colour grade), the sky, lights, effects and HUD, and moves between the title screen, playing
// and the pause menu. The title screen shows a live preview world behind it.
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Rootbound
{
    public sealed class GameManager : MonoBehaviour
    {
        public enum Mode { Title, Playing, Paused }

        public Mode State { get; private set; }
        public World World { get; private set; }
        public Camera Cam { get; private set; }
        public PlayerSave Save { get; private set; }
        public bool ShowInventory;
        public List<string> SavedWorlds = new List<string>();

        WorldView view;
        Lighting lights;
        Sky sky;
        Player player;
        Drops drops;
        Interaction act;
        Hud hud;
        bool preview;
        float waterT, saveT, moteT, titlePan;
        Vector3 camVel;

        void Awake()
        {
            Application.targetFrameRate = 144;
            QualitySettings.vSyncCount = 1;
            GameData.Load();
            Art.Load();
            Sfx.Init(gameObject);
            Save = SaveSystem.LoadPlayer();

            Cam = Camera.main;
            if (Cam == null)
            {
                var cg = new GameObject("Main Camera") { tag = "MainCamera" };
                Cam = cg.AddComponent<Camera>();
            }
            Cam.orthographic = true;
            Cam.orthographicSize = 9f;
            Cam.clearFlags = CameraClearFlags.SolidColor;
            Cam.backgroundColor = new Color(.05f, .07f, .15f);
            Cam.transform.position = new Vector3(128, -14, -10);
            var cd = Cam.GetUniversalAdditionalCameraData();
            if (cd != null) cd.renderPostProcessing = true;
            Post();

            view = Child<WorldView>("World");
            lights = Child<Lighting>("Lights");
            lights.Init();
            sky = Child<Sky>("Sky");
            sky.Init(Cam);
            var fx = Child<Fx>("Effects");
            fx.Init();
            player = Child<Player>("Hero");
            player.Init();
            drops = Child<Drops>("Drops");
            drops.Collected = Picked;
            act = Child<Interaction>("Interaction");
            act.Init(player, view, drops, Cam);
            hud = gameObject.AddComponent<Hud>();
            hud.Game = this;
            act.Say = hud.Say;
            ToTitle();
        }

        T Child<T>(string name) where T : Component
        {
            var go = new GameObject(name);
            go.transform.SetParent(transform, false);
            return go.AddComponent<T>();
        }

        // bloom makes glowing ores, sparkles and lights shine; a soft vignette and a touch more colour finish the look
        void Post()
        {
            var go = new GameObject("Post Processing");
            go.transform.SetParent(transform, false);
            var vol = go.AddComponent<Volume>();
            vol.isGlobal = true;
            vol.priority = 10;
            var p = ScriptableObject.CreateInstance<VolumeProfile>();
            var bloom = p.Add<Bloom>(true);
            bloom.threshold.Override(.82f);
            bloom.intensity.Override(.9f);
            bloom.scatter.Override(.72f);
            var vig = p.Add<Vignette>(true);
            vig.intensity.Override(.24f);
            vig.smoothness.Override(.55f);
            var ca = p.Add<ColorAdjustments>(true);
            ca.contrast.Override(8f);
            ca.saturation.Override(10f);
            vol.sharedProfile = p;
        }

        void ToTitle()
        {
            State = Mode.Title;
            ShowInventory = false;
            SavedWorlds = SaveSystem.Worlds();
            preview = true;
            Load(WorldGen.Create("rootbound"));
            player.gameObject.SetActive(false);
            titlePan = World.DoorX - 30;
        }

        void Load(World w)
        {
            World = w;
            view.Show(w);
            lights.SetWorld(w);
            drops.SetWorld(w);
            act.SetWorld(w, Save.Inv);
        }

        public void Play(string name)
        {
            name = World.Norm(name);
            SaveAll();
            var w = WorldGen.Create(name);
            SaveSystem.LoadWorld(w);
            preview = false;
            Load(w);
            player.gameObject.SetActive(true);
            Vector2 spot;
            player.Spawn(w, Save.Spots.TryGetValue(name, out spot) ? spot : (Vector2?)null);
            Cam.transform.position = new Vector3(player.Center.x, player.Center.y, -10);
            Save.LastWorld = name;
            State = Mode.Playing;
            SaveSystem.SaveWorld(w);
            hud.Toast("Welcome to " + name);
        }

        public void Resume()
        {
            State = Mode.Playing;
        }

        public void Leave()
        {
            SaveAll();
            ToTitle();
        }

        public void SaveAll()
        {
            if (World == null || preview) return;
            Save.Spots[World.Name] = new Vector2(player.X, player.Y);
            SaveSystem.SaveWorld(World);
            SaveSystem.SavePlayer(Save);
        }

        void OnApplicationQuit()
        {
            SaveAll();
        }

        void Picked(string key, int n, Vector2 at)
        {
            Save.Inv.Add(key, n);
            Sfx.Play("pickup", .45f, 1f + Random.Range(0f, .15f));
            hud.Say(at + Vector2.up * .3f, "+" + n + " " + GameData.ItemName(key), new Color(.85f, 1f, .85f));
        }

        // ---- time of day
        float Phase { get { return Mathf.Repeat(Save.Clock / GameData.Day + .3f, 1f); } }

        float Daylight
        {
            get
            {
                float s = Mathf.Sin((Phase - .25f) * Mathf.PI * 2f);
                return Mathf.Clamp01(s * 1.6f + .55f);
            }
        }

        public string TimeText
        {
            get
            {
                float p = Phase;
                return p < .2f || p > .85f ? "Night" : p < .32f ? "Morning" : p < .62f ? "Day" : p < .74f ? "Evening" : "Dusk";
            }
        }

        public string DepthText
        {
            get
            {
                if (World == null) return "";
                int tx = Mathf.FloorToInt(player.X / GameData.T), ty = Mathf.FloorToInt((player.Y + player.Ht) / GameData.T);
                int d = ty - World.Sh(tx);
                return d <= 0 ? "Surface" : "Depth " + d;
            }
        }

        void Update()
        {
            float dt = Mathf.Min(Time.deltaTime, .05f);
            if (State == Mode.Playing || State == Mode.Paused)
            {
                if (InputX.PausePressed)
                {
                    if (ShowInventory) ShowInventory = false;
                    else State = State == Mode.Paused ? Mode.Playing : Mode.Paused;
                }
                if (State == Mode.Playing && InputX.InventoryPressed) ShowInventory = !ShowInventory;
            }
            if (State == Mode.Paused) return;

            Rect viewRect = ViewRect();
            if (State == Mode.Playing)
            {
                var inv = Save.Inv;
                int n = InputX.NumberPressed;
                if (n >= 0) inv.Selected = n;
                float sc = InputX.Scroll;
                if (Mathf.Abs(sc) > 1f && !ShowInventory) inv.Selected = (inv.Selected + (sc < 0 ? 1 : 8)) % 9;
                // fixed physics sub-steps keep jumps identical at any frame rate
                float rem = dt;
                while (rem > 1e-5f)
                {
                    float st = Mathf.Min(rem, 1f / 120f);
                    player.Step(st, ShowInventory);
                    rem -= st;
                }
                act.Blocked = ShowInventory;
                act.Tick(dt);
                drops.Tick(dt, player);
                Save.Clock += dt;
                Follow(dt);
                saveT += dt;
                if (saveT > 30f) { saveT = 0; SaveAll(); }
            }
            else
            {
                // title: drift slowly along the preview world's surface
                titlePan += dt * 2.2f;
                if (titlePan > World.W - 20) titlePan = 20;
                int x = Mathf.Clamp((int)titlePan, 0, World.W - 1);
                var target = new Vector3(titlePan, -World.Sh(x) + 3f, -10);
                Cam.transform.position = Vector3.SmoothDamp(Cam.transform.position, target, ref camVel, .8f);
            }
            waterT += dt;
            if (waterT > .07f) { waterT = 0; World.StepWater(); }
            lights.Daylight = Daylight;
            lights.Tick(player.gameObject.activeSelf ? player.Center : (Vector2)Cam.transform.position, viewRect, dt);
            sky.Tick(Phase, Daylight, dt);
            view.Tick(viewRect, Time.time);
            Ambient(dt, viewRect);
        }

        Rect ViewRect()
        {
            float hh = Cam.orthographicSize, ww = hh * Cam.aspect;
            var p = Cam.transform.position;
            return new Rect(p.x - ww, p.y - hh, ww * 2, hh * 2);
        }

        // smooth follow with a little look-ahead, kept inside the world
        void Follow(float dt)
        {
            float hh = Cam.orthographicSize, ww = hh * Cam.aspect;
            var c = player.Center;
            var target = new Vector3(c.x + player.Vx / GameData.T * .18f, c.y + .8f, -10);
            target.x = Mathf.Clamp(target.x, ww, World.W - ww);
            target.y = Mathf.Clamp(target.y, -World.H + hh, -hh + 4f);
            Cam.transform.position = Vector3.SmoothDamp(Cam.transform.position, target, ref camVel, .12f, Mathf.Infinity, dt);
        }

        // fireflies over the grass at night, faint glints drifting in caves
        void Ambient(float dt, Rect v)
        {
            if (Fx.I == null) return;
            moteT -= dt;
            if (moteT > 0) return;
            moteT = .12f;
            float x = Random.Range(v.xMin, v.xMax);
            int tx = Mathf.Clamp(Mathf.FloorToInt(x), 0, World.W - 1);
            float surf = -World.Sh(tx);
            if (Daylight < .45f && surf > v.yMin && surf < v.yMax)
                Fx.I.Mote(new Vector2(x, surf + Random.Range(.3f, 2.5f)), new Color(.9f, 1.4f, .5f));
            float y = Random.Range(v.yMin, v.yMax);
            int ty = Mathf.FloorToInt(-y);
            if (World.In(tx, ty) && ty > World.Sh(tx) + 6 && World.Tiles[ty * World.W + tx] == 0)
                Fx.I.Mote(new Vector2(x, y), new Color(.55f, .7f, 1.1f, .6f));
        }
    }
}
