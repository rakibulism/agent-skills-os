---
name: de3-linear-algebra
description: Track 3 rail — linear algebra for graphics. Working vector math (2D/3D vectors, dot products for lighting and facing, cross products for normals), 3x3 and 4x4 matrix transformations, homogeneous coordinates, transform composition order, normal matrices, and Euler vs quaternion rotation. Use whenever writing or explaining 3D/graphics math, lighting calculations, camera math, transform code in Three.js or shaders, rotating/scaling/translating points, or when a user asks about dot products, cross products, matrices, or quaternions in a graphics context.
version: 0.1.0
tags: [design-engineering, webgl, 3d, graphics-math]
inputs:
  - name: scene
    description: The 3D scene, shader, or asset pipeline being built or debugged.
    required: true
---

# Linear Algebra for Graphics

The working set of math that all GPU work stands on. Comfort here means never copy-pasting transform code on faith.

## Vectors

Position, direction, velocity. Rules:
- **Normalize** (`v / |v|`) any vector used as a direction; unnormalized directions silently corrupt lighting.
- Length = `sqrt(dot(v,v))`; compare **squared lengths** when possible to skip the sqrt (`distSq < rSq`).

## Dot Product — the workhorse

`a·b = |a||b|cosθ`. Same direction → +, perpendicular → 0, opposite → −.

- **Lambert diffuse lighting:** `diffuse = max(dot(normal, lightDir), 0.0)`
- **Facing test:** `dot(viewDir, normal) < 0` → surface faces away
- **Fresnel rim glow** (the edge-light on every premium 3D site): `pow(1.0 - dot(viewDir, normal), 3.0)`
- **Projection** of a onto b: `(dot(a,b) / dot(b,b)) * b` — the basis of sliding-along-surfaces, drag constraints
- **Angle between:** `acos(dot(â, b̂))` on normalized vectors

## Cross Product — perpendicularity

`a × b` = vector perpendicular to both, length = parallelogram area.
- **Face normals:** `normalize(cross(edge1, edge2))` — winding order determines direction
- Camera basis: `right = normalize(cross(forward, worldUp))`
- 2D "cross" (z of the 3D cross): `ax*by - ay*bx` — sign gives left/right-of-line tests, winding checks

## Matrices

4×4 for 3D: the extra row/column carries **translation** via homogeneous coordinates (`w=1` for points, `w=0` for directions — directions don't translate).

The pipeline every vertex travels:
```
clipPos = projectionMatrix × viewMatrix × modelMatrix × vec4(position, 1.0)
```
- **Right-to-left application; order matters.** Conventional composition: `T · R · S` (scale first, then rotate, then translate). `R · T` orbits the origin instead of rotating in place — the classic bug.
- **Normal matrix:** normals transform by the **inverse-transpose** of the model matrix (Three's `normalMatrix`). Using the model matrix directly breaks lighting under non-uniform scale.
- 3×3 suffices for pure rotation/scale (and 2D transforms with homogeneous 3rd row).

## Rotations

- **Euler angles:** intuitive, gimbal-locked; fine for single-axis or simple cases.
- **Quaternions:** always, for interpolating between orientations — `slerp` gives constant-speed shortest-arc rotation. Camera transitions, object tumbling, orientation springs → quaternions. Never lerp Euler angles between arbitrary orientations.

## Practice Fluency Targets
Point a light and predict the shading by eye; know why an object orbits instead of spins (composition order); compute a surface normal from three vertices; explain why w=0 for directions. These four cover 90% of real 3D debugging.
