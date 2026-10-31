// Keyboard and mouse through whichever input backend the project uses (new Input System in the Universal 2D template,
// the classic Input Manager otherwise).
using UnityEngine;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Controls;
#endif

namespace Rootbound
{
    public static class InputX
    {
#if ENABLE_INPUT_SYSTEM
        static KeyControl K(Key k)
        {
            var kb = Keyboard.current;
            return kb != null ? kb[k] : null;
        }

        public static bool Left { get { return Held(Key.A) || Held(Key.LeftArrow); } }
        public static bool Right { get { return Held(Key.D) || Held(Key.RightArrow); } }
        public static bool Up { get { return Held(Key.W) || Held(Key.UpArrow) || Held(Key.Space); } }
        public static bool Down { get { return Held(Key.S) || Held(Key.DownArrow); } }
        public static bool JumpPressed { get { return Pressed(Key.W) || Pressed(Key.UpArrow) || Pressed(Key.Space); } }
        public static bool InventoryPressed { get { return Pressed(Key.I) || Pressed(Key.Tab); } }
        public static bool PausePressed { get { return Pressed(Key.Escape); } }
        public static bool DebugPressed { get { return Pressed(Key.F3); } }

        public static int NumberPressed
        {
            get
            {
                for (int i = 0; i < 9; i++)
                    if (Pressed(Key.Digit1 + i)) return i;
                return -1;
            }
        }

        static bool Held(Key k) { var c = K(k); return c != null && c.isPressed; }
        static bool Pressed(Key k) { var c = K(k); return c != null && c.wasPressedThisFrame; }

        public static bool MouseLeft { get { return Mouse.current != null && Mouse.current.leftButton.isPressed; } }
        public static bool MouseRight { get { return Mouse.current != null && Mouse.current.rightButton.isPressed; } }
        public static Vector2 MousePos { get { return Mouse.current != null ? Mouse.current.position.ReadValue() : Vector2.zero; } }
        public static float Scroll { get { return Mouse.current != null ? Mouse.current.scroll.ReadValue().y : 0f; } }
#else
        public static bool Left { get { return Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow); } }
        public static bool Right { get { return Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow); } }
        public static bool Up { get { return Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow) || Input.GetKey(KeyCode.Space); } }
        public static bool Down { get { return Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow); } }
        public static bool JumpPressed { get { return Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.Space); } }
        public static bool InventoryPressed { get { return Input.GetKeyDown(KeyCode.I) || Input.GetKeyDown(KeyCode.Tab); } }
        public static bool PausePressed { get { return Input.GetKeyDown(KeyCode.Escape); } }
        public static bool DebugPressed { get { return Input.GetKeyDown(KeyCode.F3); } }

        public static int NumberPressed
        {
            get
            {
                for (int i = 0; i < 9; i++)
                    if (Input.GetKeyDown(KeyCode.Alpha1 + i)) return i;
                return -1;
            }
        }

        public static bool MouseLeft { get { return Input.GetMouseButton(0); } }
        public static bool MouseRight { get { return Input.GetMouseButton(1); } }
        public static Vector2 MousePos { get { return Input.mousePosition; } }
        public static float Scroll { get { return Input.mouseScrollDelta.y * 120f; } }
#endif
    }
}
