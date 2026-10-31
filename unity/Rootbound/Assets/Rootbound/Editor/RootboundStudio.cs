// Studio batch tools: render art for the web game (the real game) off-screen.
//   RenderIntro: plays the Rootbound scene with the IntroDirector (RB_STUDIO=intro), then encodes its PNG frames into a
//   VP8 WebM video at RB_STUDIO_VIDEO (media/intro.webm in the web game).
//   Unity.exe -batchmode -projectPath <proj> -executeMethod Rootbound.EditorTools.RootboundStudio.RenderIntro
using System;
using System.IO;
using UnityEditor;
using UnityEditor.Media;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Rootbound.EditorTools
{
    [InitializeOnLoad]
    public static class RootboundStudio
    {
        static double start;

        static RootboundStudio()
        {
            if (SessionState.GetBool("rb_studio", false)) Watch();
        }

        public static void RenderIntro()
        {
            RootboundSetup.Run();
            EditorSceneManager.OpenScene("Assets/Scenes/Rootbound.unity");
            SessionState.SetBool("rb_studio", true);
            SessionState.SetFloat("rb_studio_t0", (float)EditorApplication.timeSinceStartup);
            Watch();
            EditorApplication.EnterPlaymode();
        }

        static void Watch()
        {
            start = SessionState.GetFloat("rb_studio_t0", (float)EditorApplication.timeSinceStartup);
            EditorApplication.update -= Tick;
            EditorApplication.update += Tick;
        }

        static void Tick()
        {
            var dir = Environment.GetEnvironmentVariable("RB_STUDIO_OUT");
            bool done = !string.IsNullOrEmpty(dir) && File.Exists(Path.Combine(dir, "done"));
            if (!done && EditorApplication.timeSinceStartup - start < 900) return;
            EditorApplication.update -= Tick;
            SessionState.SetBool("rb_studio", false);
            int code = 2;
            if (done)
            {
                try { Encode(dir, Environment.GetEnvironmentVariable("RB_STUDIO_VIDEO")); code = 0; }
                catch (Exception e) { Debug.LogError("Rootbound studio: encoding failed: " + e); code = 3; }
            }
            EditorApplication.Exit(code);
        }

        static void Encode(string dir, string video)
        {
            var frames = Directory.GetFiles(dir, "f*.png");
            Array.Sort(frames, StringComparer.Ordinal);
            if (frames.Length == 0) throw new Exception("no frames in " + dir);
            var tex = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            tex.LoadImage(File.ReadAllBytes(frames[0]));
            int w = tex.width, h = tex.height;
            Directory.CreateDirectory(Path.GetDirectoryName(video));
            var attr = new VideoTrackEncoderAttributes(new VP8EncoderAttributes { keyframeDistance = 30 })
            {
                frameRate = new MediaRational(Studio.IntroDirector.Fps),
                width = (uint)w,
                height = (uint)h,
                targetBitRate = 6000000
            };
            using (var enc = new MediaEncoder(video, attr))
            {
                var frame = new Texture2D(w, h, TextureFormat.RGBA32, false);
                foreach (var f in frames)
                {
                    frame.LoadImage(File.ReadAllBytes(f));
                    if (frame.format != TextureFormat.RGBA32)
                    {
                        var c = new Texture2D(frame.width, frame.height, TextureFormat.RGBA32, false);
                        c.SetPixels32(frame.GetPixels32());
                        c.Apply();
                        enc.AddFrame(c);
                        UnityEngine.Object.DestroyImmediate(c);
                    }
                    else enc.AddFrame(frame);
                }
            }
            Debug.Log("Rootbound studio: wrote " + video + " (" + frames.Length + " frames)");
        }
    }
}
