// Batch entry point for the off-screen smoke test: opens the Rootbound scene, enters play mode (SmokeTest drives the game
// when RB_SMOKE is set) and exits the editor once the test writes its "done" file (or after a timeout).
//   Unity.exe -batchmode -projectPath <proj> -executeMethod Rootbound.EditorTools.RootboundSmoke.Run   (with RB_SMOKE=<dir>)
using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;

namespace Rootbound.EditorTools
{
    [InitializeOnLoad]
    public static class RootboundSmoke
    {
        static double start;

        static RootboundSmoke()
        {
            // play mode reloads the editor domain: re-arm the watcher after the reload
            if (SessionState.GetBool("rb_smoke", false)) Watch();
        }

        public static void Run()
        {
            RootboundSetup.Run();
            EditorSceneManager.OpenScene("Assets/Scenes/Rootbound.unity");
            SessionState.SetBool("rb_smoke", true);
            SessionState.SetFloat("rb_smoke_t0", (float)EditorApplication.timeSinceStartup);
            Watch();
            EditorApplication.EnterPlaymode();
        }

        static void Watch()
        {
            start = SessionState.GetFloat("rb_smoke_t0", (float)EditorApplication.timeSinceStartup);
            EditorApplication.update -= Tick;
            EditorApplication.update += Tick;
        }

        static void Tick()
        {
            var dir = Environment.GetEnvironmentVariable("RB_SMOKE");
            bool done = !string.IsNullOrEmpty(dir) && File.Exists(Path.Combine(dir, "done"));
            if (done || EditorApplication.timeSinceStartup - start > 240)
            {
                EditorApplication.update -= Tick;
                SessionState.SetBool("rb_smoke", false);
                EditorApplication.Exit(done ? 0 : 2);
            }
        }
    }
}
