// Small JSON reader/writer: objects become Dictionary<string, object>, arrays List<object>, numbers double.
// (Unity's JsonUtility can't read dictionaries, and the exported game data is keyed by block id.)
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Rootbound
{
    public static class Json
    {
        public static object Parse(string s)
        {
            int i = 0;
            object v = Value(s, ref i);
            return v;
        }

        static void Ws(string s, ref int i)
        {
            while (i < s.Length && char.IsWhiteSpace(s[i])) i++;
        }

        static object Value(string s, ref int i)
        {
            Ws(s, ref i);
            if (i >= s.Length) return null;
            char c = s[i];
            if (c == '{') return Obj(s, ref i);
            if (c == '[') return Arr(s, ref i);
            if (c == '"') return Str(s, ref i);
            if (c == 't') { i += 4; return true; }
            if (c == 'f') { i += 5; return false; }
            if (c == 'n') { i += 4; return null; }
            return Num(s, ref i);
        }

        static Dictionary<string, object> Obj(string s, ref int i)
        {
            var d = new Dictionary<string, object>();
            i++;
            while (true)
            {
                Ws(s, ref i);
                if (s[i] == '}') { i++; return d; }
                string k = Str(s, ref i);
                Ws(s, ref i);
                i++; // :
                d[k] = Value(s, ref i);
                Ws(s, ref i);
                if (s[i] == ',') i++;
            }
        }

        static List<object> Arr(string s, ref int i)
        {
            var l = new List<object>();
            i++;
            while (true)
            {
                Ws(s, ref i);
                if (s[i] == ']') { i++; return l; }
                l.Add(Value(s, ref i));
                Ws(s, ref i);
                if (s[i] == ',') i++;
            }
        }

        static string Str(string s, ref int i)
        {
            var sb = new StringBuilder();
            i++;
            while (s[i] != '"')
            {
                char c = s[i++];
                if (c == '\\')
                {
                    char e = s[i++];
                    switch (e)
                    {
                        case 'n': sb.Append('\n'); break;
                        case 't': sb.Append('\t'); break;
                        case 'r': sb.Append('\r'); break;
                        case 'b': sb.Append('\b'); break;
                        case 'f': sb.Append('\f'); break;
                        case 'u': sb.Append((char)Convert.ToInt32(s.Substring(i, 4), 16)); i += 4; break;
                        default: sb.Append(e); break;
                    }
                }
                else sb.Append(c);
            }
            i++;
            return sb.ToString();
        }

        static double Num(string s, ref int i)
        {
            int a = i;
            while (i < s.Length && "+-0123456789.eE".IndexOf(s[i]) >= 0) i++;
            return double.Parse(s.Substring(a, i - a), CultureInfo.InvariantCulture);
        }

        public static string Write(object v)
        {
            var sb = new StringBuilder();
            W(sb, v);
            return sb.ToString();
        }

        static void W(StringBuilder sb, object v)
        {
            if (v == null) { sb.Append("null"); return; }
            if (v is string) { WStr(sb, (string)v); return; }
            if (v is bool) { sb.Append((bool)v ? "true" : "false"); return; }
            if (v is int || v is long || v is float || v is double || v is byte || v is short)
            {
                sb.Append(Convert.ToDouble(v).ToString("R", CultureInfo.InvariantCulture));
                return;
            }
            var d = v as IDictionary<string, object>;
            if (d != null)
            {
                sb.Append('{');
                bool first = true;
                foreach (var kv in d)
                {
                    if (!first) sb.Append(',');
                    first = false;
                    WStr(sb, kv.Key);
                    sb.Append(':');
                    W(sb, kv.Value);
                }
                sb.Append('}');
                return;
            }
            var l = v as System.Collections.IEnumerable;
            if (l != null)
            {
                sb.Append('[');
                bool first = true;
                foreach (var e in l)
                {
                    if (!first) sb.Append(',');
                    first = false;
                    W(sb, e);
                }
                sb.Append(']');
                return;
            }
            WStr(sb, v.ToString());
        }

        static void WStr(StringBuilder sb, string s)
        {
            sb.Append('"');
            foreach (char c in s)
            {
                if (c == '"') sb.Append("\\\"");
                else if (c == '\\') sb.Append("\\\\");
                else if (c == '\n') sb.Append("\\n");
                else if (c < ' ') sb.Append("\\u" + ((int)c).ToString("x4"));
                else sb.Append(c);
            }
            sb.Append('"');
        }

        // ---- helpers for reading parsed data
        public static Dictionary<string, object> O(object o, string k)
        {
            var d = o as Dictionary<string, object>;
            object v;
            return d != null && d.TryGetValue(k, out v) ? v as Dictionary<string, object> : null;
        }

        public static List<object> A(object o, string k)
        {
            var d = o as Dictionary<string, object>;
            object v;
            return d != null && d.TryGetValue(k, out v) ? v as List<object> : null;
        }

        public static double N(object o, string k, double def = 0)
        {
            var d = o as Dictionary<string, object>;
            object v;
            return d != null && d.TryGetValue(k, out v) && v is double ? (double)v : def;
        }

        public static string S(object o, string k, string def = "")
        {
            var d = o as Dictionary<string, object>;
            object v;
            return d != null && d.TryGetValue(k, out v) && v is string ? (string)v : def;
        }
    }
}
