// One-time project setup (runs by itself the first time the project opens, or from the Rootbound menu):
//  - materials in Resources so standalone builds keep the URP 2D sprite and particle shaders,
//  - the Rootbound scene (camera + game) set as the first scene to build and opened,
//  - player settings (name, windowed fullscreen, keep running in the background).
// Also: Rootbound > Build Windows, and batch entry points for building without opening the editor window.
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Rootbound.EditorTools
{
    [InitializeOnLoad]
    public static class RootboundSetup
    {
        const string ScenePath = "Assets/Scenes/Rootbound.unity";
        const string MatDir = "Assets/Rootbound/Resources/Rootbound";

        static RootboundSetup()
        {
            EditorApplication.delayCall += () =>
            {
                if (!File.Exists(ScenePath) || !File.Exists(MatDir + "/RB_Lit.mat")) Run();
            };
        }

        [MenuItem("Rootbound/Set Up Project")]
        public static void Run()
        {
            Materials();
            Scene();
            PlayerSettings.productName = "Rootbound";
            PlayerSettings.companyName = "Rootbound";
            PlayerSettings.fullScreenMode = FullScreenMode.FullScreenWindow;
            PlayerSettings.runInBackground = true;
            PlayerSettings.resizableWindow = true;
            AssetDatabase.SaveAssets();
            Debug.Log("Rootbound: project set up. Press Play in the Rootbound scene.");
        }

        static void Materials()
        {
            Directory.CreateDirectory(MatDir);
            Mat("RB_Lit", "Universal Render Pipeline/2D/Sprite-Lit-Default", null);
            Mat("RB_Unlit", "Universal Render Pipeline/2D/Sprite-Unlit-Default", null);
            Mat("RB_Additive", "Universal Render Pipeline/Particles/Unlit", m =>
            {
                m.SetFloat("_Surface", 1f);
                m.SetFloat("_Blend", 2f);
                m.SetInt("_SrcBlend", (int)BlendMode.SrcAlpha);
                m.SetInt("_DstBlend", (int)BlendMode.One);
                m.SetInt("_ZWrite", 0);
                m.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                m.EnableKeyword("_BLENDMODE_ADD");
                m.renderQueue = (int)RenderQueue.Transparent;
            });
        }

        static void Mat(string name, string shader, System.Action<Material> setup)
        {
            var path = MatDir + "/" + name + ".mat";
            if (File.Exists(path)) return;
            var sh = Shader.Find(shader);
            if (sh == null)
            {
                Debug.LogWarning("Rootbound: shader not found: " + shader + " (is the project using URP 2D?)");
                return;
            }
            var m = new Material(sh);
            if (setup != null) setup(m);
            AssetDatabase.CreateAsset(m, path);
        }

        static void Scene()
        {
            if (!File.Exists(ScenePath))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(ScenePath));
                var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                var cg = new GameObject("Main Camera") { tag = "MainCamera" };
                var cam = cg.AddComponent<Camera>();
                cam.orthographic = true;
                cam.orthographicSize = 9;
                cam.transform.position = new Vector3(128, -14, -10);
                cam.clearFlags = CameraClearFlags.SolidColor;
                cam.backgroundColor = new Color(.05f, .07f, .15f);
                var data = cam.GetUniversalAdditionalCameraData();
                data.renderPostProcessing = true;
                new GameObject("Rootbound").AddComponent<GameManager>();
                EditorSceneManager.SaveScene(scene, ScenePath);
            }
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            if (!Application.isBatchMode && EditorSceneManager.GetActiveScene().path != ScenePath && !EditorApplication.isPlayingOrWillChangePlaymode)
                EditorSceneManager.OpenScene(ScenePath);
        }

        [MenuItem("Rootbound/Build Windows")]
        public static void BuildWindows()
        {
            Run();
            var opts = new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = "Builds/Windows/Rootbound.exe",
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            };
            var r = BuildPipeline.BuildPlayer(opts);
            Debug.Log("Rootbound build: " + r.summary.result + " -> " + opts.locationPathName);
            if (Application.isBatchMode) EditorApplication.Exit(r.summary.result == UnityEditor.Build.Reporting.BuildResult.Succeeded ? 0 : 1);
        }
    }
}
