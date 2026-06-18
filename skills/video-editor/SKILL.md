---
name: video-editor
description: Edit raw footage into a finished cut — structure the story, pace the timeline, choose where and how to cut. Produces an edit plan (assembly → rough → fine cut) with shot-by-shot decisions, cut types, and rhythm notes. Use when the user asks to edit a video, cut footage, fix pacing, build a sequence, or improve a video's flow.
version: 0.1.0
tags: [video, editing, storytelling, pacing, post-production]
inputs:
  - name: footage
    description: What you have to work with — a shot list, transcript, timestamps, or a description of the raw material.
    required: true
  - name: goal
    description: What the finished video is for — YouTube, ad, documentary, social reel, trailer — and its target length.
    required: false
  - name: constraints
    description: Hard limits — runtime, platform aspect ratio, music bed, brand requirements.
    required: false
---

# Video Editor

The edit is where the story actually gets told. Footage is raw potential; the cut decides what the viewer feels and when. Your job is to find the film inside the footage, not to use everything you shot.

## Cut for the story first, polish later

Work in passes — never try to make it perfect on the first timeline.

1. **Assembly** — get every usable shot in roughly the right order. Ugly and too long on purpose. The goal is to see the whole shape.
2. **Rough cut** — cut for story and structure. Remove whole sections that don't earn their place. This is where you make the hard deletions.
3. **Fine cut** — tighten frame-accurate in and out points, fix rhythm, smooth transitions.
4. **Polish** — color, sound, titles, final timing. (Hand off to `color-grading`, `sound-design`, `motion-graphics`.)

Most beginners over-polish a structure that's still wrong. Lock story before you sweeten.

## Every cut needs a reason

Cut when the current shot has given the viewer what it has to give, and the next one moves the story forward. Reasons to cut:

- **New information** — a new subject, action, or beat the viewer needs to see.
- **The shot is dead** — the action, line, or idea has completed.
- **Rhythm** — the sequence's pace calls for it (action cuts faster, emotion holds longer).
- **Motivation** — a sound, a look offscreen, or a movement pulls the eye to the next shot.

If you can't name why a cut is there, it's probably one frame too early or late. Don't cut just because you can.

## Cut types — pick the one the moment wants

- **Hard cut** — default. Instantaneous, invisible when motivated.
- **J-cut** — audio of the next shot starts *before* the picture. Pulls the viewer forward; great for dialogue and interviews.
- **L-cut** — audio of the current shot continues *over* the next picture. Lets a reaction breathe; smooths interview-to-broll.
- **Match cut** — shape, motion, or action carries across the cut. Strong, use sparingly.
- **Cutaway / B-roll** — cover a jump, compress time, or illustrate a point. Also hides edits in a talking-head track.
- **Cross-dissolve** — softens, signals a time/place shift. In modern editing, often a crutch — a hard cut is usually stronger.
- **Cut on action** — cut mid-movement (a turn, a reach, a sit). The motion masks the edit; it's the most invisible cut there is.

## Pacing and rhythm

Pace is felt, not measured — but these are reliable levers:

- **Shot duration** sets energy. Shorter shots = higher intensity. Vary it; a metronomic cut is boring.
- **Cut on the beat** when there's music, but break the grid deliberately so it doesn't feel mechanical.
- **Let key moments breathe.** After a big reveal or emotional beat, hold. Give the viewer a second to absorb it.
- **Start late, leave early.** Enter a scene as late as you can and exit as soon as the point lands. Trim the hellos and goodbyes.
- **Front-load the hook.** Especially online: the first 3–5 seconds decide whether they stay. Open on the strongest moment, question, or tension.

## Talking-head / interview editing

- Cut the verbal clutter — "um," false starts, throat-clears, the run-up before the real answer.
- Use **B-roll over the cuts** to hide jump cuts and keep visual interest.
- A **paper edit** (select the best lines from the transcript first, in text) is faster than hunting on the timeline.
- Watch for "Frankenbites" — cutting words together to make someone say something they didn't. Don't. It's an integrity line.

## Continuity — don't break the spell

- **Screen direction** — keep subjects moving/looking consistently (the 180° line). Crossing it disorients unless you cut to a neutral shot first.
- **Eyeline** — a person looking off-frame should be matched by what they're looking at.
- **No jump cuts** unless intentional (a stylistic stutter) — avoid cutting between two near-identical framings of the same subject; either change the angle 30°+ or cut away.
- **Continuity of action** — a hand that's raised in the outgoing frame is raised in the incoming one.

## Output format

```
## Edit plan: <title> (<target length>, <platform/aspect>)

### Structure
1. <Section / beat> — <purpose> (~<duration>)
   - Hook: <what opens it>
   ...

### Shot sequence (fine-cut decisions)
| # | Shot / source | In–Out | Cut into next | Why |
|---|---|---|---|---|
| 1 | <clip @ ts> | 00:04–00:11 | L-cut | <reason> |
...

### Pacing notes
- <where it should accelerate / breathe>

### Open questions
- <missing coverage, risky deletions, music sync points>
```

Always flag where you're **guessing at footage you can't see** and where coverage gaps will force a compromise. Recommend the cut you'd make, then note the alternative.
