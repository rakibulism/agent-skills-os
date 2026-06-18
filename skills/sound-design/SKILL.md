---
name: sound-design
description: Design and mix the audio for video — dialogue, music, ambience, and effects — into a clean, leveled mix. Produces a layered audio plan with level targets (LUFS/dBFS), EQ/processing notes, and a mix order. Use when the user asks to mix audio, fix muddy or quiet sound, add music or sound effects, design a soundscape, or master a video for a platform.
version: 0.1.0
tags: [audio, sound-design, mixing, video, post-production]
inputs:
  - name: material
    description: What you're working with — dialogue/voiceover, music, recorded ambience, and the problem (too quiet, noisy, muddy, music drowns the voice).
    required: true
  - name: deliverable
    description: Where it plays — YouTube, podcast, broadcast, theatrical, social — which sets the loudness target.
    required: false
  - name: mood
    description: The feeling the sound should create — tense, warm, epic, intimate, energetic.
    required: false
---

# Sound Design

Audiences forgive bad picture far more than bad sound. Muddy, inconsistent, or fatiguing audio reads as "amateur" instantly. The goal is a mix where every element is intelligible, the levels never surprise, and the sound serves the story.

## Build in layers

Most video audio is four stems. Mix them as separate layers, then balance:

1. **Dialogue / voiceover** — almost always the priority. The viewer must understand every word.
2. **Music** — sets emotion and pace; ducks under dialogue.
3. **Ambience / room tone** — the bed of background sound that makes a space feel real and hides edits.
4. **Sound effects (SFX / foley)** — specific sounds tied to on-screen actions, plus designed effects (whooshes, impacts, risers).

## Dialogue comes first

1. **Clean it** — denoise (gently — over-denoising creates underwater artifacts), remove hum (50/60Hz), de-ess harsh sibilance, and use a high-pass filter ~80–100Hz to cut rumble.
2. **EQ for clarity** — cut mud around 200–400Hz, add presence around 3–5kHz for intelligibility. Subtractive before additive.
3. **Compress** — even out the dynamics so quiet words and loud words sit close. Gentle ratio (2:1–4:1), catch the peaks.
4. **Level consistently** — every line/clip at a consistent perceived loudness before you add anything else.

If dialogue isn't clean and even, nothing layered on top will save it.

## Room tone hides your edits

Every time you cut dialogue, you cut the background too — and silence between clips is jarring. Lay a continuous bed of **room tone / ambience** under the whole track. It glues edits together and makes cuts inaudible. Record 30 seconds of "silence" on location for exactly this; if you don't have it, match with a library ambience.

## Music: serve, don't compete

- **Duck the music under dialogue** — automate it down 6–12dB whenever someone speaks (sidechain or manual). The viewer should never strain to hear words over a score.
- **Cut music to picture** — let musical hits land on visual beats, and edit the track so it resolves rather than fading mid-phrase.
- **Match energy to the scene.** Don't let a driving track flatten a quiet moment, or vice versa.
- **Mind the licensing** — note when a track needs clearance or is royalty-free/library.

## Sound effects and atmosphere

- **Sync foley to action** — footsteps, cloth, clicks, impacts. Even subtle foley massively increases realism.
- **Design transitions** — whooshes and risers smooth cuts and build anticipation; impacts punctuate.
- **Layer for depth** — a "big" sound is usually several sounds stacked (e.g. an impact = low boom + mid thud + high crack).
- **Use silence deliberately** — dropping sound out before a hit makes the hit land harder.

## Levels and loudness — hit the target

Mix to the platform's loudness standard so your video isn't quieter or louder than everything around it:

- **YouTube / streaming** — around **−14 LUFS** integrated.
- **Podcast / spoken** — **−16 LUFS** (mono often −19).
- **Broadcast (TV)** — **−23 LUFS** (EBU R128) / −24 LKFS (ATSC US).
- **True peak** — keep below **−1 dBTP** to avoid clipping on lossy playback.

Use a **loudness meter**, not just peak meters — perceived loudness ≠ peak level. Set dialogue as your anchor (e.g. dialogue averaging around −12 to −10 dBFS short-term), then build everything else relative to it.

## Mix order

1. Edit and clean dialogue → 2. level dialogue → 3. lay ambience/room tone → 4. add and duck music → 5. add SFX/foley → 6. balance the full mix → 7. master to the loudness target → 8. **check on small speakers** (phone, laptop) where most people will actually hear it.

## Output format

```
## Audio plan: <project> → <deliverable> (<LUFS target>)

### Dialogue chain
- Cleanup: <denoise / hum / HPF>
- EQ: <cuts/boosts>
- Compression: <ratio / target level>

### Layers
- Music: <track> — duck −<n>dB under VO, cut to <beats>
- Ambience: <bed> — continuous under whole track
- SFX/Foley: <key moments>

### Mastering
- Integrated: <LUFS>   True peak: <−1 dBTP>

### Cautions
- <noise floor, licensing, mono-compatibility, small-speaker check>
```

State the **loudness target up front** (it's deliverable-specific) and always recommend a final check on phone/laptop speakers — the mix that sounds great on monitors often loses the dialogue on a phone.
