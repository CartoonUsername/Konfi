"""
Baut die Hardware-Teile eines Plissees (Kopfschiene, Fenster-Halterung/
Klemmträger, ein wiederverwendbares Falten-Segment) als sauberes glTF/GLB —
prozedural aus bekannter Geometrie, kein Artist, kein Foto, kein Scan.

Ausgeführt headless über die Kommandozeile:
    blender --background --python tools/build_plissee_model.py

Drei benannte, unabhängig einfärbbare Materialien (Fabric/Rail/Bracket),
damit der Web-Konfigurator sie zur Laufzeit per Three.js auf die vom Kunden
gewählte Stoff-/Schienen-/Klemmträgerfarbe umfärben kann — genau die
Eigenschaft, die ein aus einem Foto generiertes KI-Modell nicht hätte
(dort wäre die Farbe fest in eine gebackene Textur eingebrannt).

Referenzmaße (Meter, passend zur Three.js-Szene in plissee-room-3d.js):
  - Falten-Segment: 1 volle Zickzack-Periode, 1 m breit, für spätere
    Wiederholung entlang der tatsächlichen Fensterhöhe im Browser gedacht.
  - Schiene: mit Bevel-Modifier für ein echtes rundes Alu-Profil statt einer
    flachen Box — das war einer der größten optischen Unterschiede zum
    Stofftex-Referenzfoto.
  - Klemmträger: kleine Halterungskappe (Zylinder) + Klemmkörper.
"""

import bpy
import bmesh
import os

OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "plissee-parts.glb")


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.meshes):
        if block.users == 0:
            bpy.data.meshes.remove(block)


def make_material(name, base_color, roughness, metallic):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def build_fabric_unit(mat):
    """Ein volles Zickzack-Faltenpaar (Berg + Tal), 1 m breit, nahtlos
    wiederholbar entlang Y — Anfangs- und End-Profil sind identisch in Phase,
    damit aneinandergereihte Kopien ohne sichtbare Naht stapeln."""
    unit_height = 0.032
    fold_depth = 0.007
    half_w = 0.5

    mesh = bpy.data.meshes.new("FabricUnit")
    bm = bmesh.new()

    # (Höhe, Falten-Tiefe) je Profilpunkt — Höhe MUSS auf Blenders Z-Achse
    # (hoch) liegen, nicht auf Y, sonst landet sie nach der glTF-Y-up-
    # Konvertierung auf der falschen Three.js-Achse (genau dieser Fehler
    # verursachte das Z-Fighting/den hellen Keil im ersten Export-Versuch).
    p0 = (0.0, fold_depth / 2)
    p1 = (unit_height / 2, -fold_depth / 2)
    p2 = (unit_height, fold_depth / 2)

    v00 = bm.verts.new((-half_w, p0[1], p0[0]))
    v01 = bm.verts.new((half_w, p0[1], p0[0]))
    v10 = bm.verts.new((-half_w, p1[1], p1[0]))
    v11 = bm.verts.new((half_w, p1[1], p1[0]))
    v20 = bm.verts.new((-half_w, p2[1], p2[0]))
    v21 = bm.verts.new((half_w, p2[1], p2[0]))

    bm.faces.new((v00, v01, v11, v10))
    bm.faces.new((v10, v11, v21, v20))

    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("FabricUnit", mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(mat)

    uv = mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        v = mesh.vertices[loop.vertex_index]
        uv.data[loop.index].uv = (v.co.x + half_w, v.co.z / unit_height)

    return obj


def build_rail(mat):
    """Kopf-/Fußschiene: Box mit Bevel-Modifier für ein rundes Alu-Profil
    statt einer harten, flachen Kante — das war der auffälligste Unterschied
    zum Referenzfoto (dort ein sichtbar rundes Profil mit Lichtreflex)."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = "Rail"
    obj.scale = (1.0, 0.05, 0.03)
    bpy.ops.object.transform_apply(scale=True)

    bevel = obj.modifiers.new(name="Bevel", type="BEVEL")
    bevel.width = 0.006
    bevel.segments = 4
    bevel.limit_method = "ANGLE"
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier="Bevel")

    obj.data.materials.append(mat)
    return obj


def build_bracket(mat):
    """Klemmträger: runde Halterungskappe (an der Schiene sichtbar, siehe
    Referenzfoto) + kleiner Klemmkörper seitlich am Rahmen."""
    bpy.ops.mesh.primitive_cylinder_add(radius=0.02, depth=0.012, location=(0, 0, 0))
    cap = bpy.context.active_object
    cap.name = "BracketCap"
    cap.rotation_euler = (1.5708, 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    cap.data.materials.append(mat)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.3, 0))
    clip = bpy.context.active_object
    clip.name = "BracketClip"
    clip.scale = (0.025, 0.08, 0.05)
    bpy.ops.object.transform_apply(scale=True)
    bevel = clip.modifiers.new(name="Bevel", type="BEVEL")
    bevel.width = 0.004
    bevel.segments = 3
    bpy.context.view_layer.objects.active = clip
    bpy.ops.object.modifier_apply(modifier="Bevel")
    clip.data.materials.append(mat)

    return cap, clip


def main():
    clear_scene()

    fabric_mat = make_material("Fabric", (0.85, 0.82, 0.75), roughness=0.85, metallic=0.0)
    rail_mat = make_material("Rail", (0.82, 0.82, 0.84), roughness=0.32, metallic=0.75)
    bracket_mat = make_material("Bracket", (0.15, 0.15, 0.16), roughness=0.45, metallic=0.2)

    build_fabric_unit(fabric_mat)
    build_rail(rail_mat)
    build_bracket(bracket_mat)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_PATH,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_materials="EXPORT",
    )
    print("Exported:", OUTPUT_PATH)


if __name__ == "__main__":
    main()
