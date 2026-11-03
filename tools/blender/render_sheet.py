# Renders one object in Blender to a transparent sprite sheet the game can load (see docs/blender.md).
#
# From a live Blender, through MCP for Blender's execute_blender_code:
#   exec(open(r"<repo>/tools/blender/render_sheet.py").read())
#   print(render_sheet("MyObject", r"<repo>/assets/sprites/my-object.png", size=128, frames=(1, 24)))
#
# With no window, in its own Blender, leaving any open Blender alone:
#   blender -b scene.blend --python tools/blender/render_sheet.py -- --object MyObject --out assets/sprites/my-object.png --size 128 --frames 1 24
#   blender -b --factory-startup --python tools/blender/render_sheet.py -- --demo --out tests/fixtures/rbtest-sheet.png --size 64 --frames 1 8
#
# The camera looks straight from the side, like the game's. Every setting it changes is put back afterwards.
import json, math, os, sys, tempfile

import bpy
import numpy as np
from mathutils import Vector


def _bounds(ob, frames):
    """The object's world box over the whole animation, children included, so the sprite doesn't jump or clip."""
    scene = bpy.context.scene
    parts = [ob] + list(ob.children_recursive)
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for f in range(frames[0], frames[1] + 1):
        scene.frame_set(f)
        bpy.context.view_layer.update()
        for p in parts:
            if p.type not in {"MESH", "CURVE", "SURFACE", "META", "FONT"}:
                continue
            for c in p.bound_box:
                w = p.matrix_world @ Vector(c)
                for i in range(3):
                    lo[i] = min(lo[i], w[i])
                    hi[i] = max(hi[i], w[i])
    if lo.x > hi.x:
        raise ValueError("Nothing to draw in " + ob.name)
    return lo, hi


def render_sheet(name, out, size=128, frames=(1, 1), cols=None, margin=1.08, fps=None):
    """Renders `name` over `frames` to `out` (PNG). Returns what the game needs to know, also saved next to it as .json."""
    scene = bpy.context.scene
    ob = bpy.data.objects[name]
    frames = (int(frames[0]), int(frames[1]))
    r = scene.render
    saved = dict(fp=r.filepath, x=r.resolution_x, y=r.resolution_y, pc=r.resolution_percentage, film=r.film_transparent, cam=scene.camera,
                 frame=scene.frame_current, fmt=r.image_settings.file_format, mode=r.image_settings.color_mode, depth=r.image_settings.color_depth)
    vt = scene.view_settings.view_transform
    cam_data = bpy.data.cameras.new("rb_sheet_cam")
    cam = bpy.data.objects.new("rb_sheet_cam", cam_data)
    scene.collection.objects.link(cam)
    tmp = tempfile.mkdtemp(prefix="rbsheet")
    paths = []
    try:
        lo, hi = _bounds(ob, frames)
        centre = (lo + hi) / 2
        span = max(hi.x - lo.x, hi.z - lo.z) * margin
        cam_data.type = "ORTHO"
        cam_data.ortho_scale = span
        depth = (hi.y - lo.y) + span + 2
        cam_data.clip_end = depth * 3
        cam.location = (centre.x, lo.y - depth, centre.z)
        cam.rotation_euler = (math.pi / 2, 0, 0)
        scene.camera = cam
        r.resolution_x = r.resolution_y = int(size)
        r.resolution_percentage = 100
        r.film_transparent = True
        r.image_settings.file_format = "PNG"
        r.image_settings.color_mode = "RGBA"
        r.image_settings.color_depth = "8"
        # the game shows colours as they are, so no film look that would wash them out
        try:
            scene.view_settings.view_transform = "Standard"
        except TypeError:
            pass
        for f in range(frames[0], frames[1] + 1):
            scene.frame_set(f)
            p = os.path.join(tmp, "f%05d.png" % f)
            r.filepath = p
            bpy.ops.render.render(write_still=True)
            paths.append(p)
        n = len(paths)
        cols = int(cols or math.ceil(math.sqrt(n)))
        rows = int(math.ceil(n / cols))
        size = int(size)
        W, H = cols * size, rows * size
        sheet = np.zeros((H, W, 4), dtype=np.float32)
        for i, p in enumerate(paths):
            im = bpy.data.images.load(p)
            px = np.empty(size * size * 4, dtype=np.float32)
            im.pixels.foreach_get(px)
            bpy.data.images.remove(im)
            # Blender's rows run bottom to top
            cx, cy = i % cols, rows - 1 - i // cols
            sheet[cy * size:(cy + 1) * size, cx * size:(cx + 1) * size] = px.reshape(size, size, 4)
        out = os.path.abspath(out)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        img = bpy.data.images.new("rb_sheet", W, H, alpha=True)
        img.pixels.foreach_set(sheet.ravel())
        img.filepath_raw = out
        img.file_format = "PNG"
        img.save()
        bpy.data.images.remove(img)
        info = {"fw": size, "fh": size, "n": n, "cols": cols, "fps": int(fps or scene.render.fps), "metres": round(span, 3)}
        with open(os.path.splitext(out)[0] + ".json", "w") as fh:
            json.dump(info, fh)
        return info
    finally:
        r.filepath, r.resolution_x, r.resolution_y, r.resolution_percentage = saved["fp"], saved["x"], saved["y"], saved["pc"]
        r.film_transparent, scene.camera = saved["film"], saved["cam"]
        r.image_settings.file_format, r.image_settings.color_mode, r.image_settings.color_depth = saved["fmt"], saved["mode"], saved["depth"]
        scene.view_settings.view_transform = vt
        scene.frame_set(saved["frame"])
        bpy.data.objects.remove(cam)
        bpy.data.cameras.remove(cam_data)
        for p in paths:
            try:
                os.remove(p)
            except OSError:
                pass
        try:
            os.rmdir(tmp)
        except OSError:
            pass


def _demo(frames):
    """A small spinning gold gem, the test fixture."""
    scene = bpy.context.scene
    for o in list(scene.objects):
        if o.type == "MESH":
            bpy.data.objects.remove(o)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1)
    ob = bpy.context.active_object
    ob.name = "rb_demo"
    ob.scale = (0.7, 0.7, 1.0)
    mat = bpy.data.materials.new("rb_demo_gold")
    mat.use_nodes = True
    b = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (1.0, 0.65, 0.15, 1)
    b.inputs["Roughness"].default_value = 0.35
    ob.data.materials.append(mat)
    scene.frame_set(frames[0])
    ob.rotation_euler = (0, 0, 0)
    ob.keyframe_insert("rotation_euler", index=2)
    scene.frame_set(frames[1] + 1)
    ob.rotation_euler = (0, 0, math.pi)
    ob.keyframe_insert("rotation_euler", index=2)
    return ob.name


if "--" in sys.argv:
    a = sys.argv[sys.argv.index("--") + 1:]
    val = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    fr = (int(a[a.index("--frames") + 1]), int(a[a.index("--frames") + 2])) if "--frames" in a else (1, 1)
    who = _demo(fr) if "--demo" in a else val("--object")
    print("RB_SHEET " + json.dumps(render_sheet(who, val("--out"), size=int(val("--size", 128)), frames=fr)))
