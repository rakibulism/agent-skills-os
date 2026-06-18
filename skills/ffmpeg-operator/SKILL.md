---
name: ffmpeg-operator
description: Generate correct, safe FFmpeg commands for programmatic video/audio editing — trim, concat, transcode, scale, crop, overlay, extract, mux, and filter. Produces runnable commands with each flag explained and the gotchas called out. Use when the user asks to convert, compress, trim, merge, resize, extract audio/frames, add subtitles/watermarks, or batch-process video from the command line.
version: 0.1.0
tags: [video, ffmpeg, cli, transcode, automation]
inputs:
  - name: task
    description: What to do — "compress this to under 10MB," "trim 0:30–1:15," "merge these three clips," "extract the audio," "make a 9:16 crop," etc.
    required: true
  - name: source
    description: Input details if known — filename(s), codec/container, resolution, framerate, duration.
    required: false
  - name: target
    description: Desired output — container/codec, resolution, quality or size budget, platform.
    required: false
---

# FFmpeg Operator

FFmpeg is the most capable and most error-prone video tool there is. The same command can be fast and lossless or slow and destructive depending on one flag. Your job is to produce a command that is **correct, the least destructive that satisfies the request, and explained** — never a copy-paste mystery.

For the full command cookbook, see [references/recipes.md](references/recipes.md).

## Principles

1. **Stream-copy when you can.** If the operation doesn't require re-encoding (cutting on keyframes, changing container, removing a stream), use `-c copy`. It's near-instant and lossless. Only re-encode when the task demands it (scaling, filtering, format change, frame-accurate cuts).
2. **Never overwrite the source.** Always write to a new file. Warn before any in-place pattern. Don't use the same name for input and output.
3. **Explain every flag.** The user should understand what the command does before running it.
4. **State the quality trade-off.** Re-encoding is lossy; say so and pick sane quality (CRF), not arbitrary bitrates.
5. **Verify assumptions.** If codec/resolution/duration matter and aren't given, show the `ffprobe` command to find out first.

## The command skeleton

```
ffmpeg -i input.mp4 [input options] [filters] [codec/quality] [mapping] output.mp4
```

- **Order matters.** Options *before* `-i` apply to the input (e.g. `-ss` for fast seek); options *after* apply to the output. Putting `-ss` before `-i` is fast (keyframe seek); after `-i` is frame-accurate but slower.
- **`-ss` and `-t`/`-to`** — start time and duration/end. For lossless cuts, `-ss` before `-i` + `-c copy` (snaps to nearest keyframe). For frame-accurate cuts, re-encode.
- **`-map`** controls which streams go to the output. Without it, FFmpeg auto-selects one stream per type. Use `-map` when juggling multiple audio/subtitle tracks.

## Quality knobs

- **`-crf`** (Constant Rate Factor) — the quality dial for x264/x265. **Lower = better quality + bigger file.** Sane defaults: **x264 ≈ 18–23** (18 ≈ visually lossless, 23 = default), **x265 ≈ 24–28**. Use CRF for "look good at a reasonable size."
- **`-b:v`** (target bitrate) — use only when you need a **specific file size** (e.g. upload caps). For an exact size budget, do a **two-pass** encode.
- **`-preset`** — speed/compression trade-off (`ultrafast`…`veryslow`). Slower = smaller file at same quality, more CPU. `medium` default; `slow` for archival.
- **`-pix_fmt yuv420p`** — include this for H.264/H.265 meant for broad playback (browsers, QuickTime, social). Many encoders default to a pixel format these players can't show.
- **Audio** — `-c:a aac -b:a 192k` is a safe general default; `-c:a copy` if you're not touching audio.

## Hard gotchas (these bite everyone)

- **Re-encoding silently degrades.** Every lossy re-encode loses quality; don't re-encode in a loop.
- **`-ss` after `-i` is slow** on long files (decodes from the start). Put it before `-i` for fast seeking.
- **`concat` has two modes:** the **demuxer** (`-f concat`, for files with *identical* codecs/params — fast, can `-c copy`) vs the **filter** (`concat` filter, for *different* formats — re-encodes). Mixing them up is the #1 concat failure.
- **Filters force a re-encode** — you can't `-c copy` and apply `-vf` at the same time.
- **Odd dimensions break H.264** — `yuv420p` needs even width/height. When scaling, use `scale=trunc(iw/2)*2:trunc(ih/2)*2` or `-2` for one axis.
- **Variable frame rate (VFR)** from screen recordings/phones can desync audio — consider `-vsync cfr -r 30` to normalize.
- **Always check the output**, not just exit code 0 — verify duration, A/V sync, and resolution with `ffprobe`.

## Output format

For each request, produce:

```
### What this does
<one-line plain summary>

### Check first (if needed)
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -of default=nw=1 input.mp4

### Command
ffmpeg -i input.mp4 ... output.mp4

### Flags
- <flag> — <what it does here>

### Notes
- Lossless? <yes/no + why>
- Trade-offs / risks: <quality, size, sync>
```

When the task is ambiguous (target size? exact frame or nearest keyframe? keep audio?), state the assumption you made and show the one-flag change for the alternative. Prefer the **least destructive** command that does the job, and never hand over a command that overwrites the input.
