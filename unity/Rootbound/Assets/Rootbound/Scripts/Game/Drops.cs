// Items that pop out of broken blocks and chopped trees: they hop out, fall onto the ground, bob gently, then fly to the
// hero when close (like the web game's drops) and land in the inventory with a pop and a "+1 Stone" label.
using System.Collections.Generic;
using UnityEngine;

namespace Rootbound
{
    public sealed class Drops : MonoBehaviour
    {
        sealed class Drop
        {
            public string Key;
            public int N;
            public float X, Y, Vx, Vy, T, Ph;
            public SpriteRenderer R;
        }

        readonly List<Drop> list = new List<Drop>();
        readonly Stack<SpriteRenderer> pool = new Stack<SpriteRenderer>();
        World world;
        public System.Action<string, int, Vector2> Collected;

        public void SetWorld(World w)
        {
            world = w;
            foreach (var d in list) Free(d.R);
            list.Clear();
        }

        // px/py in the web game's pixel space
        public void Spawn(float px, float py, string key, int n)
        {
            if (list.Count > 140 || n <= 0) return;
            var r = pool.Count > 0 ? pool.Pop() : NewRenderer();
            r.gameObject.SetActive(true);
            r.sprite = Art.Icon(key);
            list.Add(new Drop { Key = key, N = n, X = px, Y = py, Vx = Random.Range(-140f, 140f), Vy = Random.Range(-420f, -220f), Ph = Random.value * 6, R = r });
        }

        SpriteRenderer NewRenderer()
        {
            var go = new GameObject("Drop");
            go.transform.SetParent(transform, false);
            var r = go.AddComponent<SpriteRenderer>();
            r.sharedMaterial = Art.Unlit;
            r.sortingOrder = WorldView.OrderDrop;
            go.transform.localScale = Vector3.one * .55f;
            return r;
        }

        void Free(SpriteRenderer r)
        {
            r.gameObject.SetActive(false);
            pool.Push(r);
        }

        public void Tick(float dt, Player p)
        {
            if (world == null) return;
            const float T = GameData.T;
            float hx = p.X, hy = p.Y + p.Ht / 2;
            for (int i = list.Count - 1; i >= 0; i--)
            {
                var d = list[i];
                d.T += dt;
                float dx = hx - d.X, dy = hy - d.Y, dist = Mathf.Sqrt(dx * dx + dy * dy);
                if (d.T > .35f && dist < 2.4f * T)
                {
                    // magnet: accelerate toward the hero
                    float s = Mathf.Lerp(900f, 300f, dist / (2.4f * T));
                    d.Vx = Mathf.Lerp(d.Vx, dx / dist * s, dt * 10);
                    d.Vy = Mathf.Lerp(d.Vy, dy / dist * s, dt * 10);
                    d.X += d.Vx * dt;
                    d.Y += d.Vy * dt;
                    if (dist < .45f * T)
                    {
                        if (Collected != null) Collected(d.Key, d.N, new Vector2(d.X / T, -d.Y / T));
                        Free(d.R);
                        list.RemoveAt(i);
                        continue;
                    }
                }
                else
                {
                    d.Vy = Mathf.Min(d.Vy + 1500f * dt, 900f);
                    d.Vx *= Mathf.Max(0, 1 - 3f * dt);
                    float nx = d.X + d.Vx * dt, ny = d.Y + d.Vy * dt;
                    if (world.Solid(Mathf.FloorToInt(nx / T), Mathf.FloorToInt(d.Y / T))) { d.Vx = -d.Vx * .3f; nx = d.X; }
                    if (world.Solid(Mathf.FloorToInt(nx / T), Mathf.FloorToInt((ny + 10) / T)))
                    {
                        if (d.Vy > 0) { ny = Mathf.Floor((ny + 10) / T) * T - 10; d.Vy = d.Vy > 200 ? -d.Vy * .3f : 0; d.Vx *= .6f; }
                        else { d.Vy = 0; ny = d.Y; }
                    }
                    d.X = nx;
                    d.Y = ny;
                }
                if (d.T > 300) { Free(d.R); list.RemoveAt(i); continue; }
                float bob = Mathf.Sin(Time.time * 3 + d.Ph) * 3f;
                d.R.transform.position = new Vector3(d.X / T, -(d.Y + bob) / T, 0);
            }
        }
    }
}
