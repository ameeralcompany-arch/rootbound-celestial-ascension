// Small synthesized sounds (no audio files needed), in the spirit of the web game's tones: soft taps for dirt, stony
// cracks, crystalline "tings" for ores, pops for pickups, a low thud when a tool can't break something.
using System.Collections.Generic;
using UnityEngine;

namespace Rootbound
{
    public static class Sfx
    {
        static readonly Dictionary<string, AudioClip> clips = new Dictionary<string, AudioClip>();
        static AudioSource[] voices;
        static int next;
        public static float Volume = .7f;

        public static void Init(GameObject host)
        {
            voices = new AudioSource[10];
            for (int i = 0; i < voices.Length; i++)
            {
                voices[i] = host.AddComponent<AudioSource>();
                voices[i].playOnAwake = false;
                voices[i].spatialBlend = 0;
            }
            Make("soft", .09f, (t, r) => Noise(r) * Env(t, .09f, 60) * .6f + Tone(t, 180, 120, .09f) * Env(t, .09f, 40) * .4f);
            Make("stone", .11f, (t, r) => Noise(r) * Env(t, .11f, 45) * .5f + Tone(t, 140, 90, .11f) * Env(t, .11f, 30) * .5f);
            Make("ore", .22f, (t, r) => Noise(r) * Env(t, .05f, 80) * .4f + Tone(t, 1320, 1500, .22f) * Env(t, .22f, 14) * .35f + Tone(t, 1980, 2100, .22f) * Env(t, .22f, 18) * .2f);
            Make("wood", .1f, (t, r) => Tone(t, 260, 200, .1f) * Env(t, .1f, 35) * .6f + Noise(r) * Env(t, .04f, 90) * .3f);
            Make("break", .25f, (t, r) => Noise(r) * Env(t, .25f, 14) * .55f + Tone(t, 220, 90, .25f) * Env(t, .25f, 16) * .35f);
            Make("place", .1f, (t, r) => Tone(t, 320, 260, .1f) * Env(t, .1f, 30) * .5f + Noise(r) * Env(t, .03f, 120) * .3f);
            Make("pickup", .14f, (t, r) => Tone(t, 880, 1320, .14f) * Env(t, .14f, 22) * .4f);
            Make("refuse", .14f, (t, r) => Tone(t, 180, 140, .14f) * Env(t, .14f, 20) * .5f);
            Make("jump", .12f, (t, r) => Tone(t, 380, 570, .12f) * Env(t, .12f, 24) * .3f);
            Make("land", .12f, (t, r) => Tone(t, 120, 70, .12f) * Env(t, .12f, 30) * .5f + Noise(r) * Env(t, .05f, 70) * .3f);
            Make("splash", .3f, (t, r) => Noise(r) * Env(t, .3f, 10) * .45f * (.6f + .4f * Mathf.Sin(t * 90)));
            Make("chop", .16f, (t, r) => Tone(t, 200, 150, .16f) * Env(t, .16f, 25) * .5f + Noise(r) * Env(t, .06f, 60) * .35f);
            Make("click", .05f, (t, r) => Tone(t, 1200, 1100, .05f) * Env(t, .05f, 60) * .3f);
        }

        static float Env(float t, float len, float k) { return Mathf.Exp(-t * k) * Mathf.Clamp01((len - t) * 40f); }
        static float Noise(System.Random r) { return (float)(r.NextDouble() * 2 - 1); }

        static float Tone(float t, float f0, float f1, float len)
        {
            // phase of a linear sweep from f0 to f1
            float k = (f1 - f0) / len;
            return Mathf.Sin(2 * Mathf.PI * (f0 * t + .5f * k * t * t));
        }

        static void Make(string name, float len, System.Func<float, System.Random, float> f)
        {
            const int rate = 44100;
            int n = Mathf.CeilToInt(len * rate);
            var data = new float[n];
            var r = new System.Random(name.GetHashCode());
            for (int i = 0; i < n; i++) data[i] = Mathf.Clamp(f(i / (float)rate, r), -1f, 1f);
            var c = AudioClip.Create(name, n, 1, rate, false);
            c.SetData(data, 0);
            clips[name] = c;
        }

        public static void Play(string name, float vol = 1f, float pitch = 1f)
        {
            AudioClip c;
            if (voices == null || !clips.TryGetValue(name, out c)) return;
            var v = voices[next++ % voices.Length];
            v.pitch = pitch * Random.Range(.94f, 1.06f);
            v.PlayOneShot(c, vol * Volume);
        }

        public static string ForCategory(string cat)
        {
            return cat == "stone" ? "stone" : cat == "ore" ? "ore" : cat == "wood" ? "wood" : "soft";
        }
    }
}
