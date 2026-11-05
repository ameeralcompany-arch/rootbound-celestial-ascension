# Renders the far background of each dungeon in Blender, with real depth, light and haze, to assets/dungeons/<id>-far.webp. The game draws its mid and near layers over it and keeps its painted layer as the fallback.
# Everything is built from code, nothing is downloaded. Art only: no gameplay lives here (see docs/blender.md).
#   blender -b --factory-startup --python tools/blender/render_dungeon.py -- --id ruins --out assets/dungeons/ruins-far.webp [--samples 48] [--w 1600] [--h 900]
import math, random, sys
import bpy, bmesh
from mathutils import Vector, noise as mnoise

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(n, d=None):
    return argv[argv.index("--" + n) + 1] if "--" + n in argv else d
ID, OUT, SAMPLES, RW, RH = arg("id", "ruins"), arg("out", "/tmp/out.webp"), int(arg("samples", 48)), int(arg("w", 1600)), int(arg("h", 900))
random.seed(sum(map(ord, ID)) * 31)
R = random.random
def rn(a, b): return a + (b - a) * R()

bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
S.render.engine = "CYCLES"
S.cycles.samples, S.cycles.use_denoising, S.cycles.max_bounces, S.cycles.volume_bounces = SAMPLES, True, 4, 1
S.cycles.volume_step_rate, S.cycles.volume_max_steps = 3.0, 64
S.render.resolution_x, S.render.resolution_y, S.render.resolution_percentage = RW, RH, 100
S.render.image_settings.file_format = "WEBP"
S.render.image_settings.quality = 82
S.render.filepath = OUT
S.view_settings.view_transform = "AgX"
try:
    S.view_settings.look = "AgX - High Contrast"
except Exception:
    pass
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("OPTIX", "CUDA", "HRT", "ONEAPI", "METAL"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            if any(d.type == kind for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == kind
                S.cycles.device = "GPU"
                print("render device", kind)
                break
        except Exception:
            pass
except Exception as e:
    print("cpu", e)

def mat(name, col, rough=.8, emit=None, strength=0, metal=0, noise=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    t = m.node_tree
    p = next(n for n in t.nodes if n.type == "BSDF_PRINCIPLED")
    p.inputs["Base Color"].default_value = (*col, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if emit:
        p.inputs["Emission Color"].default_value = (*emit, 1)
        p.inputs["Emission Strength"].default_value = strength
    if noise:
        # weathered: two tones broken up by noise, plus bumps, so stone never reads as plastic
        n = t.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = noise[0]
        n.inputs["Detail"].default_value = 8
        ramp = t.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].color = (*col, 1)
        ramp.color_ramp.elements[1].color = (*noise[1], 1)
        t.links.new(n.outputs[0], ramp.inputs[0])
        t.links.new(ramp.outputs[0], p.inputs["Base Color"])
        b = t.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = .55
        t.links.new(n.outputs[0], b.inputs["Height"])
        t.links.new(b.outputs[0], p.inputs["Normal"])
    return m

def add_mesh(name, bm, m):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    S.collection.objects.link(o)
    me.materials.append(m)
    return o
def box(x, y, z, sx, sy, sz, m, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    o = add_mesh("b", bm, m)
    o.location, o.scale, o.rotation_euler = (x, y, z), (sx, sy, sz), rot
    return o
def cyl(x, y, z, r, h, m, seg=20, r2=None, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
    for f in bm.faces:
        f.smooth = True
    o = add_mesh("c", bm, m)
    o.location, o.rotation_euler = (x, y, z), rot
    return o
def ball(x, y, z, r, m, sub=4, rough=0):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    if rough:
        for v in bm.verts:
            v.co *= 1 + (R() - .5) * rough
    for f in bm.faces:
        f.smooth = not rough
    o = add_mesh("s", bm, m)
    o.location = (x, y, z)
    return o
def column(x, y, h, r, m, broken=False):
    cut = rn(.3, .75) if broken else 1
    hh = h * cut
    cyl(x, y, hh / 2, r, hh, m, 18)
    box(x, y, .2, r * 3, r * 3, .4, m)
    if not broken:
        box(x, y, hh, r * 3, r * 3, .4, m)
        cyl(x, y, hh - .5, r * 1.3, .5, m, 18, r)
def crystal(x, y, z, s, m):
    for i in range(int(rn(3, 6))):
        rx, ry = rn(-.5, .5), rn(-.5, .5)
        h = s * rn(.6, 1.6)
        cyl(x + rx * s, y + ry * s, z + h / 2, s * rn(.14, .28), h, m, 6, .02, rot=(rx * .7, ry * .7, 0))
def rock(x, y, z, r, m, sq=1):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=5 if r > 3 else 4, radius=r)
    off = Vector((R() * 40, R() * 40, R() * 40))
    for v in bm.verts:
        d = v.co.normalized()
        n = mnoise.fractal(d * 1.7 + off, 1.0, 2.1, 6)
        v.co = d * r * (1 + .42 * n)
    for f in bm.faces:
        f.smooth = True
    o = add_mesh("r", bm, m)
    o.location = (x, y, z)
    o.scale = (1, 1, sq)
    o.rotation_euler = (R() * 6, R() * 6, R() * 6)
    return o
def rib(x, y, h, m, lean=1):
    pts = 12
    for i in range(pts):
        a = i / pts
        px, pz = x + lean * math.sin(a * 2.3) * h * .55, a * h
        cyl(px, y, pz, h * (.05 - a * .03), h / pts * 1.25, m, 10, rot=(0, lean * math.cos(a * 2.3) * .9, 0))
def sun(rot, energy, col, ang=.08):
    d = bpy.data.lights.new("sun", "SUN")
    d.energy, d.color, d.angle = energy, col, ang
    o = bpy.data.objects.new("sun", d)
    S.collection.objects.link(o)
    o.rotation_euler = rot
def point(x, y, z, energy, col, r=1):
    d = bpy.data.lights.new("pt", "POINT")
    d.energy, d.color, d.shadow_soft_size = energy, col, r
    o = bpy.data.objects.new("pt", d)
    S.collection.objects.link(o)
    o.location = (x, y, z)
def world(col, strength, fog=None, fogd=0, stars=False):
    w = bpy.data.worlds.new("w")
    S.world = w
    w.use_nodes = True
    t = w.node_tree
    bg = next(n for n in t.nodes if n.type == "BACKGROUND")
    bg.inputs[0].default_value = (*col, 1)
    bg.inputs[1].default_value = strength
    if stars:
        v = t.nodes.new("ShaderNodeTexVoronoi")
        v.inputs["Scale"].default_value = 260
        ramp = t.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = .0
        ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
        ramp.color_ramp.elements[1].position = .035
        ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
        n = t.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = 1.4
        n.inputs["Detail"].default_value = 9
        neb = t.nodes.new("ShaderNodeValToRGB")
        neb.color_ramp.elements[0].position = .46
        neb.color_ramp.elements[0].color = (*col, 1)
        neb.color_ramp.elements[1].position = .72
        neb.color_ramp.elements[1].color = (*stars, 1)
        add = t.nodes.new("ShaderNodeMixRGB")
        add.blend_type = "ADD"
        add.inputs[0].default_value = 1
        t.links.new(v.outputs["Distance"], ramp.inputs[0])
        t.links.new(n.outputs[0], neb.inputs[0])
        t.links.new(neb.outputs[0], add.inputs[1])
        t.links.new(ramp.outputs[0], add.inputs[2])
        t.links.new(add.outputs[0], bg.inputs[0])
    if fog:
        # a cube of even haze around the set: cheaper and calmer than world volume
        vm = bpy.data.materials.new("fog")
        vm.use_nodes = True
        vt = vm.node_tree
        for n in list(vt.nodes):
            if n.type == "BSDF_PRINCIPLED":
                vt.nodes.remove(n)
        out = next(n for n in vt.nodes if n.type == "OUTPUT_MATERIAL")
        vol = vt.nodes.new("ShaderNodeVolumePrincipled")
        vol.inputs["Color"].default_value = (*fog, 1)
        vol.inputs["Density"].default_value = fogd * .42
        vt.links.new(vol.outputs[0], out.inputs["Volume"])
        o = box(0, 40, 26, 300, 240, 80, vm)
        o.display_type = "WIRE"
def cam(loc, look, lens=30):
    c = bpy.data.cameras.new("c")
    c.lens = lens
    o = bpy.data.objects.new("c", c)
    S.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(look) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    S.camera = o
def floor(m, y0=-30, sz=400):
    box(0, y0 + sz / 2 - 40, -.5, sz, sz, 1, m)

G = lambda a, b, c: (a, b, c)
def ruins():
    st, mo = mat("stone", G(.09, .12, .1), .9, noise=(3, G(.03, .07, .04))), mat("moss", G(.02, .07, .03), 1, noise=(9, G(.05, .13, .03)))
    cr = mat("cry", G(.1, .9, .5), .15, G(.1, 1, .55), 16)
    world(G(.006, .02, .016), 1, G(.45, .85, .7), .013)
    floor(st)
    for y in range(6, 90, 14):
        for s in (-1, 1):
            for xx in (10, 26):
                column(s * xx + rn(-1, 1), y, rn(20, 28), 1.6, st, R() < .28)
    for y in range(20, 90, 28):
        for t in range(-10, 11):
            a = t / 10 * math.pi / 2
            box(math.sin(a) * 10, y, 25 + math.cos(a) * 9, 3.4, 3, 2, st, rot=(0, a, 0))
    for i in range(70):
        rock(rn(-44, 44), rn(0, 95), rn(0, .6), rn(.4, 1.8), mo if R() < .5 else st, .55)
    for x, y, s in [(-6, 14, 2), (7, 10, 1.6), (-12, 26, 2.4), (13, 30, 2.1), (-3, 44, 2.6), (5, 56, 2), (-16, 54, 3), (16, 62, 3)]:
        crystal(x, y, 0, s, cr)
        point(x, y, s * 1.5, 900 * s, G(.3, 1, .65), 2)
    sun((1.05, .1, .6), 5, G(.65, 1, .8), .05)
    box(0, 40, 41, 120, 180, 2, st)
    box(5, 34, 41, 14, 7, 4, mat("hole", G(0, 0, 0), 1))
    cam((0, -24, 7), (2, 40, 11), 26)
def crimson():
    st = mat("basalt", G(.05, .02, .02), .85, noise=(2.4, G(.02, .006, .006)))
    lv = mat("lava", G(1, .25, .03), .4, G(1, .2, .02), 7, noise=(.9, G(1, .55, .1)))
    cr = mat("cry", G(.8, .05, .05), .2, G(1, .08, .05), 15)
    world(G(.012, .002, .001), 1, G(1, .35, .15), .007)
    box(0, 40, -2, 400, 400, 1, lv)
    for i in range(170):
        x, y = rn(-90, 90), rn(4, 130)
        if abs(x) < 7 and y < 90:
            continue
        h = rn(10, 44) * (1 + abs(x) / 90)
        cyl(x, y, h / 2 - 2, rn(3, 9), h, st, 7, rn(.3, 3), rot=(rn(-.1, .1), rn(-.1, .1), R() * 6))
    for i in range(80):
        cyl(rn(-90, 90), rn(4, 130), 62 - rn(0, 16), rn(1.4, 5), rn(12, 34), st, 6, .1, rot=(math.pi, 0, 0))
    box(0, 64, 62, 400, 400, 2, st)
    for x, y in [(-22, 18), (20, 26), (-12, 40), (15, 54)]:
        crystal(x, y, 0, 3, cr)
    for x, y, e in [(0, 30, 500), (-24, 50, 400), (24, 60, 450), (0, 90, 800)]:
        point(x, y, 2, e, G(1, .36, .1), 4)
    cam((0, -14, 9), (0, 60, 14), 26)
def frozen():
    st = mat("stone", G(.1, .15, .2), .55, noise=(3, G(.2, .3, .42)))
    ice = mat("ice", G(.45, .8, 1), .1, G(.2, .65, 1), 2.4)
    cr = mat("cry", G(.3, .8, 1), .08, G(.2, .75, 1), 20)
    world(G(.008, .02, .05), 1, G(.6, .8, 1), .014)
    floor(mat("snow", G(.55, .68, .8), .6, noise=(2, G(.8, .9, 1))))
    for y in range(8, 92, 14):
        for s in (-1, 1):
            column(s * 15 + rn(-1, 1), y, rn(20, 30), 1.7, st, R() < .2)
    for i in range(70):
        x, y, h = rn(-55, 55), rn(2, 100), rn(4, 22)
        if abs(x) < 6 and y < 50:
            continue
        cyl(x, y, h / 2, rn(.6, 2.6), h, ice, 6, .05, rot=(rn(-.3, .3), rn(-.3, .3), R() * 6))
    for i in range(50):
        cyl(rn(-40, 40), rn(4, 95), 42 - rn(0, 8), rn(.4, 1.5), rn(4, 16), ice, 6, .03, rot=(math.pi, 0, 0))
    box(0, 50, 44, 300, 300, 2, st)
    for x, y, s in [(-8, 18, 2), (9, 28, 2.4), (-14, 44, 3), (13, 58, 3), (0, 76, 4)]:
        crystal(x, y, 0, s, cr)
        point(x, y, s * 2, 1100 * s, G(.45, .8, 1), 2)
    cam((0, -24, 7), (0, 50, 12), 28)
def hollow():
    st = mat("marble", G(.1, .08, .14), .5, noise=(2, G(.22, .18, .28)))
    gd = mat("gold", G(.75, .6, .3), .35, metal=1)
    root = mat("root", G(.02, .01, .03), .9, G(.45, .1, .9), .35)
    cr = mat("cry", G(.5, .2, 1), .1, G(.55, .2, 1), 26)
    world(G(.012, .004, .03), 1, G(.6, .35, 1), .018)
    floor(st)
    for y in range(8, 90, 13):
        for s in (-1, 1):
            column(s * 13, y, 26, 1.5, st, R() < .35)
            box(s * 13, y, 27, 4.4, 4.4, .5, gd)
    for y in range(18, 90, 26):
        for t in range(-12, 13):
            a = t / 12 * math.pi / 2
            box(math.sin(a) * 13, y, 27 + math.cos(a) * 11, 3.5, 2.4, 1.8, st, rot=(0, a, 0))
    for i in range(46):
        rock(rn(-38, 38), rn(10, 110), rn(14, 40), rn(1, 4.5), st, .7)
    for i in range(36):
        x, y = rn(-30, 30), rn(5, 90)
        for k in range(6):
            cyl(x + k * rn(-.6, .6), y, 46 - k * 6, 1 - k * .12, 7, root, 8, rot=(rn(-.3, .3), rn(-.3, .3), 0))
    for x, y, s in [(-6, 16, 2), (7, 26, 2), (0, 60, 4)]:
        crystal(x, y, 0, s, cr)
        point(x, y, s * 2, 1500 * s, G(.65, .3, 1), 3)
    sun((.95, 0, -.5), 3, G(1, .8, .6), .08)
    cam((0, -22, 7), (0, 50, 14), 26)
def dragon():
    st = mat("ash", G(.07, .06, .05), .95, noise=(1.5, G(.03, .025, .02)))
    bn = mat("bone", G(.62, .56, .44), .65, noise=(6, G(.3, .26, .2)))
    em = mat("eye", G(1, .3, .05), .4, G(1, .3, .05), 28)
    world(G(.03, .026, .024), 1, G(.5, .42, .36), .016)
    floor(st)
    for i in range(50):
        rock(rn(-110, 110), rn(0, 170), 0, rn(1.5, 7), st, .5)
    for cx, cy, cnt, h in [(-34, 44, 8, 30), (34, 74, 9, 38), (-8, 112, 10, 48)]:
        for k in range(cnt):
            rib(cx - cnt * 2.5 + k * 5, cy, h, bn, 1)
            rib(cx - cnt * 2.5 + k * 5, cy + 18, h, bn, -1)
    o = rock(4, 40, 9, 11, bn, .8)
    o.scale = (1.5, 1, .8)
    box(16, 37, 5, 13, 8, 5, bn)
    ball(-3, 31, 11, .9, em, 3)
    point(-3, 29, 11, 160, G(1, .4, .1), 1)
    for i in range(16):
        x, y = rn(-60, 60), rn(4, 120)
        box(x, y, rn(2, 5), .5, .15, rn(7, 12), mat("iron", G(.2, .2, .22), .4, metal=1), rot=(rn(-.5, .5), rn(-.4, .4), R() * 6))
    for x, y in [(-22, 20), (24, 30), (0, 80)]:
        point(x, y, 2, 1500, G(1, .45, .12), 4)
    sun((1.2, .35, .9), 3.6, G(.72, .78, .95), .03)
    cam((0, -12, 6), (2, 50, 15), 26)
def voidscene(col, accent, em, islands=26, big=None):
    st = mat("rock", G(col[0] * .3, col[1] * .3, col[2] * .3), .85, noise=(1.8, G(col[0] * .7, col[1] * .7, col[2] * .7)))
    glow = mat("glow", accent, .2, em, 20)
    world(G(col[0] * .03, col[1] * .03, col[2] * .05), 1, None, 0, stars=G(em[0] * .3, em[1] * .3, em[2] * .3))
    for i in range(islands):
        x, y, z, r = rn(-120, 120), rn(30, 240), rn(-40, 70), rn(4, 24)
        rock(x, y, z, r, st, .55)
        cyl(x, y, z - r * .8, r * .7, r * 1.4, st, 8, .5, rot=(math.pi, 0, 0))
        if R() < .55:
            crystal(x + rn(-r * .4, r * .4), y, z + r * .36, r * .22, glow)
    for i in range(170):
        rock(rn(-160, 160), rn(10, 280), rn(-60, 110), rn(.3, 2.6), st, .8)
    for i in range(12):
        x, y, z = rn(-70, 70), rn(30, 120), rn(-10, 40)
        for k in range(3):
            column(x + k * 6, y, rn(10, 22), 1, st, True)
    sun((1, .3, .8), 2.2, em, .1)
    cam((0, -40, 12), (0, 100, 16), 24)
def star():
    voidscene(G(.32, .24, .42), G(1, .8, .4), G(1, .72, .25), 22)
    m = mat("star", G(1, .8, .4), .3, G(1, .7, .3), 14)
    ball(38, 200, 52, 26, m, 5)
    point(38, 170, 52, 2.2e4, G(1, .72, .35), 20)
    for i in range(46):
        o = rock(rn(-110, 110), rn(40, 220), rn(0, 110), rn(.8, 3.4), mat("met", G(.1, .07, .06), .9, G(1, .45, .1), .6))
def night():
    st = mat("black", G(.012, .014, .02), .4, noise=(2.2, G(.03, .036, .05)))
    win = mat("win", G(.5, .65, 1), .2, G(.55, .7, 1), 4)
    world(G(.006, .009, .02), 1, G(.5, .6, .9), .007, stars=G(.03, .05, .1))
    floor(st)
    for x, y, w, h in [(0, 90, 30, 44), (-34, 110, 18, 58), (34, 112, 18, 54), (-62, 130, 16, 40), (62, 132, 16, 44)]:
        box(x, y, h / 2, w, w, h, st)
        cyl(x, y, h + w * .75, w * .6, w * 1.5, st, 4, .03, rot=(0, 0, .785))
        for k in range(3):
            box(x + (k - 1) * w * .26, y - w / 2 - .1, h * rn(.5, .85), 1.6, .4, 4, win)
    for y in range(10, 70, 12):
        for s in (-1, 1):
            column(s * 18, y, 24, 1.5, st, R() < .2)
    moon = mat("moon", G(.8, .85, 1), .4, G(.8, .88, 1), 14)
    ball(-30, 230, 112, 16, moon, 5)
    sun((1.15, 0, -.35), .9, G(.6, .7, 1), .02)
    cam((0, -20, 5), (-3, 90, 26), 28)
def king():
    st = mat("slate", G(.05, .05, .07), .45, noise=(2, G(.11, .1, .15)))
    si = mat("silver", G(.72, .74, .85), .3, metal=1)
    world(G(.02, .016, .04), 1, G(.68, .6, 1), .02)
    floor(st)
    for y in range(8, 130, 12):
        for s in (-1, 1):
            column(s * 22, y, 40, 2.2, st, R() < .15)
            box(s * 22, y, 41, 6, 6, .6, si)
    box(0, 70, 60, 300, 300, 2, st)
    box(0, 118, 2, 40, 20, 4, st)
    box(0, 120, 16, 20, 8, 24, st)
    for s in (-1, 1):
        cyl(s * 8, 120, 34, 2.6, 18, st, 6, .1)
    cyl(0, 120, 37, 3, 24, st, 6, .1)
    box(-5, 116, 10, 10, 4, 2, si, rot=(0, .3, .3))
    for x, y in [(-14, 40), (14, 40), (-14, 90), (14, 90)]:
        point(x, y, 26, 9000, G(.75, .62, 1), 5)
    sun((.95, 0, .28), 9, G(.78, .82, 1), .03)
    box(0, 62, 61.5, 8, 60, 4, mat("hole2", G(0, 0, 0), 1))
    cam((0, -22, 8), (0, 90, 16), 24)
def eater():
    voidscene(G(.3, .05, .07), G(1, .1, .12), G(1, .1, .1), 14)
    for x, y, z, r in [(-60, 220, 40, 26), (54, 260, 66, 32), (2, 300, -10, 18)]:
        m = mat("planet", G(.07, .04, .05), .8, noise=(.7, G(.3, .08, .06)))
        for k in range(6):
            rock(x + rn(-r * .5, r * .5), y + rn(-r * .4, r * .4), z + rn(-r * .5, r * .5), r * rn(.3, .7), m)
    dark = mat("maw", G(0, 0, 0), 1, G(1, .05, .05), .05)
    ball(0, 420, 40, 90, dark, 5)
    glow = mat("rim", G(1, .1, .1), .5, G(1, .08, .08), 26)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=128, radius1=98, radius2=91, depth=2)
    o = add_mesh("rim", bm, glow)
    o.location, o.rotation_euler = (0, 330, 40), (math.pi / 2, 0, 0)
def abyss():
    voidscene(G(.24, .13, .44), G(.6, .3, 1), G(.6, .3, 1), 30)
{"ruins": ruins, "crimson": crimson, "frozen": frozen, "hollow": hollow, "dragon": dragon, "abyss": abyss, "star": star, "night": night, "king": king, "eater": eater}[ID]()
bpy.ops.render.render(write_still=True)
print("rendered", OUT)
