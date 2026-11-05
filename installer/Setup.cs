// The first stage of RootboundSetup.exe: shows the splash, unpacks the launcher that travels at the end of this file into a temporary folder, starts it in installer mode and
// cleans up when it ends. Compiled by tools/publish/build-launcher.js with the C# compiler that is part of Windows, so it needs only the .NET Framework that Windows 10 and 11 include.
// Flags: /silent shows no window and passes the rest of the command line on to the launcher. RB_TEST_OFFSCREEN=1 keeps the splash off-screen for automated tests.
using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;

static class Setup
{
    const string MARKER = "RBSETUP1";

    [STAThread]
    static int Main(string[] args)
    {
        bool silent = args.Any(a => a.Equals("/silent", StringComparison.OrdinalIgnoreCase));
        string pass = string.Join(" ", args.Where(a => !a.Equals("/silent", StringComparison.OrdinalIgnoreCase)).Select(Quote));
        string shot = Environment.GetEnvironmentVariable("RB_SETUP_SCREENSHOT");

        if (silent) return Run(null, pass, true);

        Application.EnableVisualStyles();
        int code = 0;
        var form = new Splash();
        if (Environment.GetEnvironmentVariable("RB_TEST_OFFSCREEN") == "1") { form.StartPosition = FormStartPosition.Manual; form.Location = new Point(-32000, -32000); form.ShowInTaskbar = false; }
        form.Shown += (s, e) =>
        {
            var t = new Thread(() =>
            {
                code = Run(form, pass, false);
                try { form.BeginInvoke((Action)(() => form.Close())); } catch { }
            });
            t.IsBackground = true;
            t.Start();
        };
        if (!string.IsNullOrEmpty(shot)) form.Shown += (s, e) =>
        {
            var b = new Bitmap(form.Width, form.Height);
            form.Progress = 0.42f; form.DrawToBitmap(b, new Rectangle(0, 0, form.Width, form.Height));
            b.Save(shot, System.Drawing.Imaging.ImageFormat.Png);
        };
        Application.Run(form);
        return code;
    }

    static string Quote(string a) { return a.Contains(" ") ? "\"" + a + "\"" : a; }

    static int Run(Splash ui, string pass, bool silent)
    {
        string dir = Path.Combine(Path.GetTempPath(), "RootboundSetup-" + Guid.NewGuid().ToString("N").Substring(0, 10));
        try
        {
            Directory.CreateDirectory(dir);
            Unpack(dir, ui);
            string exe = Path.Combine(dir, "RootboundLauncher.exe");
            if (!File.Exists(exe)) throw new Exception("The installer is damaged. Please download it again.");
            var psi = new ProcessStartInfo(exe, ("--installer " + (silent ? "--silent " : "") + pass).Trim()) { UseShellExecute = false, WorkingDirectory = dir };
            if (silent) { psi.RedirectStandardOutput = true; psi.RedirectStandardError = true; psi.CreateNoWindow = true; }
            using (var p = Process.Start(psi))
            {
                // the launcher's own window takes over from here
                if (ui != null) { try { ui.BeginInvoke((Action)(() => ui.Hide())); } catch { } }
                if (silent)
                {
                    p.OutputDataReceived += (s, e) => { if (e.Data != null) Console.WriteLine(e.Data); };
                    p.ErrorDataReceived += (s, e) => { };
                    p.BeginOutputReadLine(); p.BeginErrorReadLine();
                }
                p.WaitForExit();
                return p.ExitCode;
            }
        }
        catch (Exception e)
        {
            if (silent) Console.WriteLine("SETUP FAILED " + e.Message);
            else MessageBox.Show(e.Message, "Rootbound Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
        finally
        {
            // the launcher that was just installed runs from its own folder: this temporary copy can go
            for (int i = 0; i < 12; i++) { try { if (Directory.Exists(dir)) Directory.Delete(dir, true); break; } catch { Thread.Sleep(500); } }
        }
    }

    static void Unpack(string dir, Splash ui)
    {
        string self = Assembly.GetExecutingAssembly().Location;
        using (var fs = new FileStream(self, FileMode.Open, FileAccess.Read, FileShare.Read))
        {
            var foot = new byte[16];
            fs.Seek(-16, SeekOrigin.End);
            fs.Read(foot, 0, 16);
            if (Encoding.ASCII.GetString(foot, 8, 8) != MARKER) throw new Exception("The installer is damaged. Please download it again.");
            long size = BitConverter.ToInt64(foot, 0);
            long start = fs.Length - 16 - size;
            if (start <= 0) throw new Exception("The installer is damaged. Please download it again.");
            fs.Seek(start, SeekOrigin.Begin);
            using (var zip = new ZipArchive(new Window(fs, size), ZipArchiveMode.Read))
            {
                long total = zip.Entries.Sum(e => e.Length), done = 0;
                string root = Path.GetFullPath(dir) + Path.DirectorySeparatorChar;
                foreach (var e in zip.Entries)
                {
                    string to = Path.GetFullPath(Path.Combine(dir, e.FullName));
                    if (!to.StartsWith(root, StringComparison.OrdinalIgnoreCase)) throw new Exception("The installer is damaged. Please download it again.");
                    if (e.FullName.EndsWith("/") || e.FullName.EndsWith("\\")) { Directory.CreateDirectory(to); continue; }
                    Directory.CreateDirectory(Path.GetDirectoryName(to));
                    e.ExtractToFile(to, true);
                    done += e.Length;
                    if (ui != null) ui.Report(total > 0 ? (float)done / total : 1f);
                }
            }
        }
    }

    // A read-only view of the part of this file that holds the launcher.
    class Window : Stream
    {
        readonly Stream b; readonly long start, len; long pos;
        public Window(Stream s, long length) { b = s; start = s.Position; len = length; }
        public override bool CanRead { get { return true; } }
        public override bool CanSeek { get { return true; } }
        public override bool CanWrite { get { return false; } }
        public override long Length { get { return len; } }
        public override long Position { get { return pos; } set { pos = value; } }
        public override void Flush() { }
        public override long Seek(long o, SeekOrigin w) { pos = w == SeekOrigin.Begin ? o : w == SeekOrigin.Current ? pos + o : len + o; return pos; }
        public override void SetLength(long v) { throw new NotSupportedException(); }
        public override void Write(byte[] a, int c, int d) { throw new NotSupportedException(); }
        public override int Read(byte[] a, int o, int c)
        {
            if (pos >= len) return 0;
            b.Seek(start + pos, SeekOrigin.Begin);
            int n = b.Read(a, o, (int)Math.Min(c, len - pos));
            pos += n;
            return n;
        }
    }

    class Splash : Form
    {
        public float Progress;
        Image art;
        public Splash()
        {
            FormBorderStyle = FormBorderStyle.None; StartPosition = FormStartPosition.CenterScreen; ClientSize = new Size(640, 318); DoubleBuffered = true; BackColor = Color.FromArgb(7, 8, 24); Text = "Rootbound Setup";
            try { Icon = Icon.ExtractAssociatedIcon(Assembly.GetExecutingAssembly().Location); } catch { }
            using (var s = Assembly.GetExecutingAssembly().GetManifestResourceStream("splash.jpg")) art = Image.FromStream(s);
        }
        public void Report(float p)
        {
            Progress = p;
            try { BeginInvoke((Action)Invalidate); } catch { }
        }
        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics; g.SmoothingMode = SmoothingMode.AntiAlias; g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.DrawImage(art, 0, 0, ClientSize.Width, ClientSize.Height);
            using (var shade = new LinearGradientBrush(ClientRectangle, Color.FromArgb(20, 7, 8, 24), Color.FromArgb(235, 7, 8, 24), 90f)) g.FillRectangle(shade, ClientRectangle);
            using (var title = new Font("Georgia", 26f, FontStyle.Regular, GraphicsUnit.Point))
            using (var gold = new SolidBrush(Color.FromArgb(244, 213, 154)))
            using (var fmt = new StringFormat { Alignment = StringAlignment.Center })
                g.DrawString("R O O T B O U N D", title, gold, new RectangleF(0, ClientSize.Height - 118, ClientSize.Width, 50), fmt);
            using (var small = new Font("Segoe UI", 9.5f))
            using (var soft = new SolidBrush(Color.FromArgb(196, 200, 235)))
            using (var fmt = new StringFormat { Alignment = StringAlignment.Center })
                g.DrawString("Preparing the installer...", small, soft, new RectangleF(0, ClientSize.Height - 66, ClientSize.Width, 22), fmt);
            var track = new Rectangle(70, ClientSize.Height - 36, ClientSize.Width - 140, 6);
            using (var b = new SolidBrush(Color.FromArgb(70, 170, 180, 255))) g.FillRectangle(b, track);
            int w = (int)(track.Width * Math.Max(0f, Math.Min(1f, Progress)));
            if (w > 0) { var fill = new Rectangle(track.X, track.Y, w, track.Height); using (var b = new LinearGradientBrush(new Rectangle(track.X, track.Y, Math.Max(1, track.Width), track.Height), Color.FromArgb(114, 228, 255), Color.FromArgb(160, 109, 255), 0f)) g.FillRectangle(b, fill); }
            using (var pen = new Pen(Color.FromArgb(70, 168, 182, 255))) g.DrawRectangle(pen, 0, 0, ClientSize.Width - 1, ClientSize.Height - 1);
        }
    }
}
