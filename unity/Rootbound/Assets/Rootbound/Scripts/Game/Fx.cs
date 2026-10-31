// Particle effects on Unity's GPU-friendly particle systems: block debris in the block's colour, landing dust,
// additive sparkles (ores, good tool hits, pickups - bright enough to bloom), falling leaves and ambient motes.
using UnityEngine;

namespace Rootbound
{
    public sealed class Fx : MonoBehaviour
    {
        public static Fx I;
        ParticleSystem debris, dust, sparks, leaves, motes;

        public void Init()
        {
            I = this;
            debris = Make("Debris", Art.Lit, Art.Chip, 600, 1.4f);
            dust = Make("Dust", Art.Lit, Art.Soft, 300, .9f);
            sparks = Make("Sparks", Art.Additive, Art.Spark, 500, .8f);
            leaves = Make("Leaves", Art.Lit, Art.Leaf, 300, 3f);
            motes = Make("Motes", Art.Additive, Art.Soft, 200, 4f);
            var g = debris.main;
            g.gravityModifier = 2.6f;
            var dg = dust.main;
            dg.gravityModifier = -.05f;
            var lg = leaves.main;
            lg.gravityModifier = .12f;
            var no = leaves.noise;
            no.enabled = true;
            no.strength = .6f;
            no.frequency = .4f;
            var sg = sparks.main;
            sg.gravityModifier = -.1f;
            var mo = motes.noise;
            mo.enabled = true;
            mo.strength = .25f;
            mo.frequency = .3f;
            Fade(dust);
            Fade(sparks);
            Fade(leaves);
            Fade(motes);
            Shrink(debris);
            Shrink(sparks);
        }

        ParticleSystem Make(string name, Material mat, Texture tex, int max, float life)
        {
            var go = new GameObject(name);
            go.transform.SetParent(transform, false);
            var ps = go.AddComponent<ParticleSystem>();
            ps.Stop(true, ParticleSystemStopBehavior.StopEmittingAndClear);
            var m = ps.main;
            m.loop = false;
            m.playOnAwake = false;
            m.maxParticles = max;
            m.startLifetime = life;
            m.simulationSpace = ParticleSystemSimulationSpace.World;
            m.startSpeed = 0;
            var em = ps.emission;
            em.enabled = false;
            var sh = ps.shape;
            sh.enabled = false;
            var r = go.GetComponent<ParticleSystemRenderer>();
            r.sharedMaterial = Art.WithTexture(mat, tex);
            r.sortingOrder = WorldView.OrderFx;
            r.renderMode = ParticleSystemRenderMode.Billboard;
            ps.Play();
            return ps;
        }

        static void Fade(ParticleSystem ps)
        {
            var c = ps.colorOverLifetime;
            c.enabled = true;
            var g = new Gradient();
            g.SetKeys(new[] { new GradientColorKey(Color.white, 0), new GradientColorKey(Color.white, 1) },
                      new[] { new GradientAlphaKey(0, 0), new GradientAlphaKey(1, .15f), new GradientAlphaKey(1, .6f), new GradientAlphaKey(0, 1) });
            c.color = g;
        }

        static void Shrink(ParticleSystem ps)
        {
            var s = ps.sizeOverLifetime;
            s.enabled = true;
            s.size = new ParticleSystem.MinMaxCurve(1f, AnimationCurve.Linear(0, 1, 1, 0));
        }

        static void Emit(ParticleSystem ps, Vector2 at, Vector2 vel, float size, Color c, float life)
        {
            var e = new ParticleSystem.EmitParams
            {
                position = new Vector3(at.x, at.y, 0),
                velocity = new Vector3(vel.x, vel.y, 0),
                startSize = size,
                startColor = c,
                startLifetime = life,
                rotation = Random.Range(0f, 360f)
            };
            ps.Emit(e, 1);
        }

        // a block cracking apart: chips in its colour, a puff of dust, sparkles if it glows or is an ore
        public void Break(Vector2 c, Color col, bool shiny)
        {
            for (int i = 0; i < 14; i++)
            {
                var tint = Color.Lerp(col, i % 3 == 0 ? Color.white : Color.black, Random.Range(0f, .25f));
                Emit(debris, c + Random.insideUnitCircle * .35f, new Vector2(Random.Range(-3.5f, 3.5f), Random.Range(2f, 7f)), Random.Range(.09f, .2f), tint, Random.Range(.6f, 1.2f));
            }
            for (int i = 0; i < 5; i++)
                Emit(dust, c + Random.insideUnitCircle * .3f, Random.insideUnitCircle * .6f + Vector2.up * .3f, Random.Range(.5f, .9f), new Color(col.r, col.g, col.b, .5f), Random.Range(.5f, .9f));
            if (shiny) Sparkle(c, col, 10);
        }

        public void Hit(Vector2 c, Color col, bool good)
        {
            for (int i = 0; i < (good ? 5 : 3); i++)
                Emit(debris, c + Random.insideUnitCircle * .3f, new Vector2(Random.Range(-2.5f, 2.5f), Random.Range(1.5f, 4.5f)), Random.Range(.07f, .14f), col, Random.Range(.4f, .7f));
        }

        public void Sparkle(Vector2 c, Color col, int n)
        {
            var hdr = new Color(col.r * 2.2f + .3f, col.g * 2.2f + .3f, col.b * 2.2f + .3f, 1f);
            for (int i = 0; i < n; i++)
                Emit(sparks, c + Random.insideUnitCircle * .45f, Random.insideUnitCircle * 2.2f + Vector2.up, Random.Range(.18f, .38f), hdr, Random.Range(.35f, .8f));
        }

        public void Dust(Vector2 feet, int n)
        {
            for (int i = 0; i < n; i++)
                Emit(dust, feet + new Vector2(Random.Range(-.3f, .3f), .05f), new Vector2(Random.Range(-1.2f, 1.2f), Random.Range(.1f, .6f)), Random.Range(.35f, .6f), new Color(.85f, .8f, .7f, .55f), Random.Range(.4f, .7f));
        }

        public void Leaves(Vector2 c, int n, Color col)
        {
            for (int i = 0; i < n; i++)
                Emit(leaves, c + Random.insideUnitCircle * 1.4f, new Vector2(Random.Range(-1.5f, 1.5f), Random.Range(-.2f, 1.5f)), Random.Range(.16f, .26f), Color.Lerp(col, Color.white, Random.Range(0f, .2f)), Random.Range(2f, 3.4f));
        }

        public void Mote(Vector2 at, Color c)
        {
            Emit(motes, at, new Vector2(Random.Range(-.2f, .2f), Random.Range(.05f, .3f)), Random.Range(.08f, .16f), c, Random.Range(2.5f, 4f));
        }

    }
}
