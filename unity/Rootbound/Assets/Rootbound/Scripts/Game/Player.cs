// The hero: the web game's movement physics ported number for number (acceleration, friction, floaty jump apex,
// coyote time, jump buffering, swimming), simulated in the same pixel units against the tile grid, then drawn with the
// exported anime character frames (idle / run / jump) with squash on landing and dust puffs.
using UnityEngine;

namespace Rootbound
{
    public sealed class Player : MonoBehaviour
    {
        // pixel-space state, exactly like the web game's P: x = centre, y = top of the hitbox
        public float X, Y, Vx, Vy;
        public float Wd = 26, Ht = 54;
        public bool Grounded, Swimming, HeadUnder;
        public int Facing = 1;
        float coyote, buffer, pvy, animT, squash;
        bool wasGrounded;
        World world;
        SpriteRenderer body, shadow;

        public Vector2 Pos { get { return new Vector2(X / GameData.T, -Y / GameData.T); } }
        public Vector2 Center { get { return new Vector2(X / GameData.T, -(Y + Ht / 2) / GameData.T); } }
        public Vector2 Feet { get { return new Vector2(X / GameData.T, -(Y + Ht) / GameData.T); } }

        public void Init()
        {
            Wd = GameData.PlayerSize.x;
            Ht = GameData.PlayerSize.y;
            body = gameObject.AddComponent<SpriteRenderer>();
            body.sharedMaterial = Art.Lit;
            body.sortingOrder = WorldView.OrderHero;
            body.sprite = Art.HeroFrames[0];
        }

        public void Spawn(World w, Vector2? px)
        {
            world = w;
            if (px.HasValue)
            {
                X = px.Value.x;
                Y = px.Value.y;
            }
            else
            {
                X = w.DoorX * GameData.T + GameData.T / 2f;
                Y = w.Sh(w.DoorX) * GameData.T - Ht - 1;
            }
            Vx = Vy = 0;
            Unstick();
            Sync();
        }

        // if a save put us inside blocks, climb to the first free spot above
        void Unstick()
        {
            for (int i = 0; i < 200 && BoxHit().HasValue; i++) Y -= GameData.T;
        }

        Vector2Int? BoxHit()
        {
            const int T = GameData.T;
            int x0 = Mathf.FloorToInt((X - Wd / 2) / T), x1 = Mathf.FloorToInt((X + Wd / 2 - .01f) / T);
            int y0 = Mathf.FloorToInt(Y / T), y1 = Mathf.FloorToInt((Y + Ht - .01f) / T);
            for (int y = y0; y <= y1; y++)
                for (int x = x0; x <= x1; x++)
                    if (world.Solid(x, y)) return new Vector2Int(x, y);
            return null;
        }

        // moveE: move on x, resolve against tiles, then on y
        void Move(float dt)
        {
            const int T = GameData.T;
            X += Vx * dt;
            var h = BoxHit();
            if (h.HasValue)
            {
                X = Vx > 0 ? h.Value.x * T - Wd / 2 - .01f : (h.Value.x + 1) * T + Wd / 2 + .01f;
                Vx = 0;
            }
            Grounded = false;
            Y += Vy * dt;
            h = BoxHit();
            if (h.HasValue)
            {
                if (Vy > 0)
                {
                    Y = h.Value.y * T - Ht - .01f;
                    Grounded = true;
                }
                else Y = (h.Value.y + 1) * T + .01f;
                Vy = 0;
            }
        }

        public void Step(float dt, bool busy)
        {
            if (world == null) return;
            int ax = busy ? 0 : (InputX.Right ? 1 : 0) - (InputX.Left ? 1 : 0);
            bool hold = !busy && InputX.Up;
            if (!busy && InputX.JumpPressed) buffer = .12f;

            // physics(): run toward the target speed, brake with friction
            float top = 260f * (Swimming ? .62f : 1f), acc = Grounded ? 2700f : 1700f, fr = Grounded ? 3200f : 600f;
            if (ax != 0)
            {
                float tg = ax * top;
                if (Vx != tg)
                {
                    float d = Mathf.Sign(tg - Vx) * acc * dt;
                    Vx = Mathf.Abs(tg - Vx) <= Mathf.Abs(d) ? tg : Vx + d;
                }
                Facing = ax;
            }
            else
            {
                float d = fr * dt;
                Vx = Mathf.Abs(Vx) <= d ? 0 : Vx - Mathf.Sign(Vx) * d;
            }

            Swimming = world.InWater(X, Y + Ht * .6f);
            HeadUnder = world.InWater(X, Y + 10);
            float gv = 1900f;
            if (!Grounded && Mathf.Abs(Vy) < 130) gv *= .55f;
            else if (Vy > 0) gv *= 1.2f;
            if (Swimming) gv = 260f;
            Vy = Mathf.Min(Vy + gv * dt, Swimming ? 170f : 1100f);
            if (Swimming)
            {
                Vy *= Mathf.Max(0, 1 - 2.6f * dt);
                Vx *= Mathf.Max(0, 1 - .9f * dt);
                if (hold) Vy = Mathf.Max(Vy - 2400f * dt, HeadUnder ? -240f : -300f);
                if (!busy && InputX.Down) Vy = Mathf.Min(Vy + 1500f * dt, 260f);
            }
            coyote -= dt;
            buffer -= dt;
            if (Grounded) coyote = .1f;
            if (buffer > 0 && Swimming)
            {
                buffer = 0;
                Vy = HeadUnder ? -380f : -600f;
                coyote = 0;
                Sfx.Play("splash", .5f);
            }
            else if (buffer > 0 && coyote > 0)
            {
                Vy = -690f;
                coyote = 0;
                buffer = 0;
                Grounded = false;
                if (Fx.I != null) Fx.I.Dust(Feet, 6);
                Sfx.Play("jump", .4f);
            }
            pvy = Vy;
            Move(dt);

            // landing: dust, a little squash, a soft thump
            if (Grounded && !wasGrounded && pvy > 380)
            {
                if (Fx.I != null) Fx.I.Dust(Feet, 10);
                squash = Mathf.Min(.18f, pvy / 6000f);
                Sfx.Play("land", Mathf.Min(.6f, pvy / 1500f));
            }
            if (Grounded && Mathf.Abs(Vx) > 200 && Random.value < dt * 16 && Fx.I != null) Fx.I.Dust(Feet, 1);
            wasGrounded = Grounded;
            Sync();
            Animate(dt);
        }

        void Sync()
        {
            transform.position = new Vector3(X / GameData.T, -Y / GameData.T, 0);
        }

        void Animate(float dt)
        {
            string k = !Grounded && !Swimming ? "jump" : Mathf.Abs(Vx) > 20 ? "run" : "idle";
            int[] fr;
            if (!Art.HeroAnim.TryGetValue(k, out fr) || fr.Length == 0) return;
            float rate = k == "run" ? Mathf.Abs(Vx) / 260f * 13f : k == "idle" ? 5f : 8f;
            animT += dt * rate;
            int f = k == "jump" ? fr[Mathf.Clamp(Vy < -200 ? 0 : Vy < 0 ? 1 : Vy < 300 ? 2 : 3, 0, fr.Length - 1)] : fr[(int)animT % fr.Length];
            body.sprite = Art.HeroFrames[f];
            body.flipX = Facing < 0;
            squash = Mathf.MoveTowards(squash, 0, dt * .9f);
            // squash from the feet: scale about the hitbox bottom
            float sy = 1f - squash, sx = 1f + squash * .8f;
            transform.localScale = new Vector3(sx, sy, 1);
            transform.position = new Vector3(X / GameData.T, -Y / GameData.T - (Ht / GameData.T) * (1 - sy), 0);
        }

        public Rect HitboxTiles
        {
            get { return new Rect((X - Wd / 2) / GameData.T, Y / GameData.T, Wd / GameData.T, Ht / GameData.T); }
        }
    }
}
