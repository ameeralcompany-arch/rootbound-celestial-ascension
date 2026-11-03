# Renders the grey textures the game tints in its own colours: nebula clouds, dust lanes, water caustics, cloth folds (see docs/blender.md).
# With no window, in its own Blender, leaving any open Blender alone:
#   blender -b --factory-startup --python tools/blender/render_textures.py -- <out dir> [size]
# Then tools/embed-textures.js turns them into src/js/late/00-tex.js, so they travel inside index.html.
import os, sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "textures")
SIZE = int(argv[1]) if len(argv) > 1 else 512
os.makedirs(OUT, exist_ok=True)

scene = bpy.context.scene
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob)
bpy.ops.mesh.primitive_plane_add(size=2)
plane = bpy.context.object
cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 2
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
cam.location = (0, 0, 2)
scene.camera = cam
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 16
scene.cycles.use_denoising = False
scene.render.resolution_x = scene.render.resolution_y = SIZE
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
scene.render.image_settings.file_format = "JPEG"
scene.render.image_settings.color_mode = "BW"
scene.render.image_settings.quality = 82

mat = bpy.data.materials.new("tex")
mat.use_nodes = True
plane.data.materials.append(mat)
nt = mat.node_tree


def clear():
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(em.outputs[0], out.inputs[0])
    tc = nt.nodes.new("ShaderNodeTexCoord")
    return em, tc


def noise(vec, scale, detail=8, rough=0.55, dist=0.0, w=None):
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = detail
    n.inputs["Roughness"].default_value = rough
    n.inputs["Distortion"].default_value = dist
    nt.links.new(vec, n.inputs["Vector"])
    return n


def mapping(vec, scale=(1, 1, 1), loc=(0, 0, 0)):
    m = nt.nodes.new("ShaderNodeMapping")
    m.inputs["Scale"].default_value = scale
    m.inputs["Location"].default_value = loc
    nt.links.new(vec, m.inputs["Vector"])
    return m.outputs[0]


def warp(vec, n_out, amount):
    v = nt.nodes.new("ShaderNodeVectorMath")
    v.operation = "SCALE"
    nt.links.new(n_out, v.inputs[0])
    v.inputs["Scale"].default_value = amount
    a = nt.nodes.new("ShaderNodeVectorMath")
    a.operation = "ADD"
    nt.links.new(vec, a.inputs[0])
    nt.links.new(v.outputs[0], a.inputs[1])
    return a.outputs[0]


def ramp(val, lo, hi, gamma=1.0):
    r = nt.nodes.new("ShaderNodeMapRange")
    r.inputs["From Min"].default_value = lo
    r.inputs["From Max"].default_value = hi
    r.clamp = True
    nt.links.new(val, r.inputs["Value"])
    if gamma == 1.0:
        return r.outputs[0]
    m = nt.nodes.new("ShaderNodeMath")
    m.operation = "POWER"
    nt.links.new(r.outputs[0], m.inputs[0])
    m.inputs[1].default_value = gamma
    return m.outputs[0]


def render(name, val, strength=1.0):
    em = nt.nodes["Emission"] if "Emission" in nt.nodes else [n for n in nt.nodes if n.type == "EMISSION"][0]
    nt.links.new(val, em.inputs["Strength"])
    em.inputs["Color"].default_value = (strength, strength, strength, 1)
    scene.render.filepath = os.path.join(OUT, name + ".jpg")
    bpy.ops.render.render(write_still=True)
    print("rendered", name, os.path.getsize(scene.render.filepath))


# 1. billowing nebula clouds: noise bent through itself twice
em, tc = clear()
v0 = tc.outputs["Object"]
w1 = noise(v0, 1.6, 6, 0.5)
v1 = warp(v0, w1.outputs["Color"], 1.4)
w2 = noise(v1, 3.2, 8, 0.55)
v2 = warp(v1, w2.outputs["Color"], 0.8)
c = noise(v2, 2.6, 12, 0.62)
render("neb1", ramp(c.outputs["Fac"], 0.34, 0.72, 1.5))

# 2. a second cloud, finer and streakier
em, tc = clear()
v0 = mapping(tc.outputs["Object"], (1, 1.6, 1), (3.1, 1.7, 0.4))
w1 = noise(v0, 2.2, 5, 0.5)
v1 = warp(v0, w1.outputs["Color"], 1.9)
c = noise(v1, 5.0, 12, 0.66)
render("neb2", ramp(c.outputs["Fac"], 0.4, 0.74, 1.8))

# 3. dark dust lanes (white = clear, dark = dust)
em, tc = clear()
v0 = mapping(tc.outputs["Object"], (1, 1, 1), (7.3, 2.2, 1.1))
w1 = noise(v0, 1.8, 4, 0.5)
v1 = warp(v0, w1.outputs["Color"], 2.4)
c = noise(v1, 4.2, 10, 0.6)
render("lanes", ramp(c.outputs["Fac"], 0.38, 0.6, 1.0))

# 4. water caustics: the bright web on the floor of a pool
em, tc = clear()
v0 = tc.outputs["Object"]
w1 = noise(v0, 3.0, 4, 0.5)
v1 = warp(v0, w1.outputs["Color"], 0.35)
vo = nt.nodes.new("ShaderNodeTexVoronoi")
vo.feature = "DISTANCE_TO_EDGE"
vo.inputs["Scale"].default_value = 5.5
nt.links.new(v1, vo.inputs["Vector"])
inv = ramp(vo.outputs["Distance"], 0.0, 0.11, 1.0)
m = nt.nodes.new("ShaderNodeMath")
m.operation = "SUBTRACT"
m.inputs[0].default_value = 1.0
nt.links.new(inv, m.inputs[1])
p = nt.nodes.new("ShaderNodeMath")
p.operation = "POWER"
nt.links.new(m.outputs[0], p.inputs[0])
p.inputs[1].default_value = 1.8
render("caustic", p.outputs[0])

# 5. cloth folds: long soft ridges running down the fabric
em, tc = clear()
v0 = mapping(tc.outputs["Object"], (1, 0.16, 1), (0.6, 0.2, 0.3))
w1 = noise(v0, 2.4, 3, 0.45)
v1 = warp(v0, w1.outputs["Color"], 0.5)
w = nt.nodes.new("ShaderNodeTexWave")
w.wave_type = "BANDS"
w.bands_direction = "X"
w.wave_profile = "SIN"
w.inputs["Scale"].default_value = 2.4
w.inputs["Distortion"].default_value = 3.0
w.inputs["Detail"].default_value = 3.0
nt.links.new(v1, w.inputs["Vector"])
render("folds", ramp(w.outputs["Fac"], 0.05, 0.95, 1.0))
print("textures done")
