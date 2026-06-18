---
name: motion-graphics
description: Design titles, lower thirds, captions, and animated graphics for video — what moves, when, and why, with legibility and timing that respect the edit. Produces a graphics spec with hierarchy, animation timing/easing, safe-area and legibility notes. Use when the user asks to design titles, lower thirds, captions/subtitles, an intro/outro, kinetic typography, or animated overlays.
version: 0.1.0
tags: [video, motion-graphics, animation, titles, typography]
inputs:
  - name: element
    description: What you're designing — title card, lower third, subtitle style, intro animation, kinetic type, callout/overlay, end screen.
    required: true
  - name: context
    description: The video it lives in — genre, brand, aspect ratio/platform, and the moment in the timeline it appears.
    required: false
  - name: brand
    description: Fonts, colors, logo, and any motion guidelines to honor.
    required: false
---

# Motion Graphics

Graphics in video have one job: deliver information without stealing attention from the story. A title that's hard to read, on too long, or animated for its own sake actively hurts the video. Legibility and timing beat flash every time.

## Legibility is non-negotiable

If the viewer can't read it in the time it's on screen, it failed — no matter how nice it looks.

- **Contrast** — text must separate from the footage *behind every frame it's over*. Footage moves; a title that's readable on frame 1 can vanish on frame 30. Use a scrim, drop shadow, subtle stroke, or a solid plate.
- **Size** — readable on a phone, not just your editing monitor. When in doubt, bigger.
- **Hold long enough to read twice** — the rough rule: time to read it aloud, plus a beat. Short titles ~1.5–2s on screen; longer ~3s+.
- **Limit words** — a title card is not a paragraph. Cut to the essential phrase.

## Respect the safe areas

- Keep text inside the **title-safe area** (~10% margin from edges) so nothing clips on different displays or gets covered by platform UI (captions, like buttons, progress bars).
- For **social/vertical (9:16)**, keep key text out of the top and bottom ~15% where the app's UI sits.
- Design for the **aspect ratio it ships in**, and check reframes (16:9 → 9:16 → 1:1) — text that's centered in one is often cropped in another.

## Hierarchy

Every graphic has a primary message and supporting detail. Make the order of reading obvious:

- **Size, weight, and color** establish what's read first. One clear focal point per graphic.
- **Lower thirds**: name = primary (largest/boldest), title/role = secondary (smaller, lighter). Don't make them equal.
- **Align to a grid.** Consistent margins and baselines across all graphics make the whole video feel designed, not assembled.

## Animation: motivated, fast, out of the way

- **Every animation needs a purpose** — reveal information, draw the eye, express brand. Motion without a reason is noise. (See `interaction-designer` for the same principle in UI.)
- **In and out, both matter.** Graphics that snap in and cut out feel cheap; design the exit as deliberately as the entrance.
- **Stagger** related elements (name in, then title in 4–6 frames later) instead of moving everything at once — it reads as intentional and guides the eye.
- **Ease, don't linear.** Ease-out for entrances (fast then settle), ease-in for exits. Linear motion feels robotic. A little overshoot adds life; too much feels gimmicky.
- **Keep it quick** — title animations live around 0.3–0.8s. The animation should be over well before the read time is up; people came to read it, not watch it arrive.
- **Match the video's energy** — punchy cuts → snappy graphics; calm doc → gentle fades.

## Common elements

- **Lower third** — animate in from the edge or with a wipe/fade, hold for the read, animate out. Don't leave it up the whole interview.
- **Title / intro card** — strong type, often with the video's hook. Keep brand intros short (<3–4s); long logo stings get skipped.
- **Kinetic typography** — words timed to a voiceover or beat. Powerful but labor-intensive; emphasize *key* words, don't animate every one.
- **Callouts / annotations** — arrows, highlights, boxes that point at on-screen things. Animate them in *when referenced*, out when done.
- **End screen / outro** — CTA, subscribe, next video. Leave room and time for the viewer to act; on YouTube, respect the end-screen template zones.

## Captions and subtitles

- **Burned-in captions** boost retention and serve sound-off viewers (most social viewing). Style them legibly: high contrast, a plate or stroke, comfortable line length (~1–2 lines, ~32–42 chars/line).
- **Time to speech** — captions appear with the words, not before or lagging behind.
- **Accessibility** — for true subtitles/SDH, include speaker IDs and key non-speech sound cues.

## Output format

```
## Graphics spec: <element>

Format: <aspect/platform>   Appears at: <timeline moment>   On screen: <duration>

### Layout
- Primary: <text> — <font/size/weight/color>
- Secondary: <text> — <…>
- Background: <scrim/plate/shadow for legibility over moving footage>
- Safe area: <margins, platform-UI clearance>

### Animation
| Element | In (timing/easing) | Hold | Out |
|---|---|---|---|
| <name> | fade+rise 0.4s ease-out | 2.0s | fade 0.3s ease-in |

### Cautions
- <contrast over busy footage, reframe crops, read-time, brand fonts>
```

Always check the graphic against the **actual footage behind it across its whole duration** and against the **shipping aspect ratio** — most motion-graphics failures are legibility-over-moving-background or text cropped on a reframe.
