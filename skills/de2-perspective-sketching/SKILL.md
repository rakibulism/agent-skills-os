---
name: de2-perspective-sketching
description: Track 2 rail — perspective and industrial sketching. 1/2/3-point perspective methods for visualizing UI cards, folders, device mockups, and 3D scenes on paper before coding. Use whenever a user wants to sketch or visualize a spatial/3D concept before building it, plan a 3D scene's camera and composition, learn perspective drawing for design work, or when Claude is describing how a 3D layout should be blocked out.
version: 0.1.0
tags: [design-engineering, prototyping, storyboarding]
inputs:
  - name: concept
    description: The interaction or motion idea being planned before implementation.
    required: true
---

# Perspective & Industrial Sketching

Spatial problems are 100× cheaper to solve on paper. Sketching decides the composition before software makes it expensive.

## The Three Systems

- **1-point perspective** — depth-stacked UI: card stacks receding, z-layered modals, tunnel/portal effects. One vanishing point (VP) at eye level; all depth lines converge to it. Fastest for "cards floating in z-space" concepts.
- **2-point perspective** — angled product shots, floating device mockups, folder/box metaphors. Two VPs on the horizon line; verticals stay vertical. The workhorse for hero-object sketches.
- **3-point perspective** — dramatic up/down hero shots. Third VP above (looking up, monumental) or below (looking down, overview). Use sparingly; it's loud.

## Method (any system)

1. Draw the **horizon line** = camera eye level. Objects above it show their undersides; below it, their tops.
2. Place VPs **far apart** — close VPs create fisheye distortion (unless that's the point).
3. **Block every object as a box first.** Cards, phones, folders — boxes. Round corners and add face details only after the box sits correctly in space.
4. **Anchor with shadows:** a soft ellipse under floating elements grounds them; no shadow = sticker floating on paper.
5. Line weight: thick silhouette, medium structural edges, thin surface detail — instant depth without shading.

## The Four Decisions to Sketch Before Coding a 3D Scene

These determine ~80% of a scene's look and cost minutes on paper vs. days in code:
1. **Camera height & angle** (worm/eye/bird level)
2. **Focal length feel** — wide (24–35mm feel, FOV 60–75°) = drama and depth exaggeration; long (85mm+, FOV 25–40°) = calm product-shot compression
3. **Light direction** — one arrow on the page; key light placement defines the mood
4. **Depth planes** — name foreground / subject / background; a scene without three planes reads flat

## Deliverable
A sketch is done when someone else could block the Three.js scene from it: horizon, camera notes, light arrow, labeled depth planes, and rough proportions. Photograph it and attach to the ticket — the sketch is the spec.
