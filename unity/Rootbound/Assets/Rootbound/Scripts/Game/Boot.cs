// Starts the game in whatever scene is open when you press Play (the Rootbound scene already holds a GameManager).
using UnityEngine;

namespace Rootbound
{
    public static class Boot
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Start()
        {
            if (Object.FindAnyObjectByType<GameManager>() != null) return;
            new GameObject("Rootbound").AddComponent<GameManager>();
        }
    }
}
