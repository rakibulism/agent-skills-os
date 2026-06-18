# FFmpeg recipe cookbook

Copy-ready commands for common tasks. Replace `in.mp4` / `out.mp4`. Every recipe writes to a **new file** — never the source. Prefer the stream-copy version when it appears.

## Inspect first

```bash
# Full info
ffprobe -hide_banner in.mp4

# Just the essentials (codec, resolution, fps, duration)
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate \
  -show_entries format=duration -of default=nw=1 in.mp4
```

## Trim / cut

```bash
# Lossless cut on keyframes (fast, no quality loss) — start at 30s, length 45s
ffmpeg -ss 00:00:30 -i in.mp4 -t 45 -c copy out.mp4

# Frame-accurate cut (re-encodes) — from 30s to 1:15 exactly
ffmpeg -ss 00:00:30 -to 00:01:15 -i in.mp4 -c:v libx264 -crf 18 -c:a aac out.mp4
```
`-t` = duration, `-to` = end timestamp. `-ss` before `-i` seeks fast.

## Concatenate / merge

```bash
# Same codec/params — demuxer, lossless. Build a list file:
printf "file '%s'\n" clip1.mp4 clip2.mp4 clip3.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4

# Different formats/resolutions — concat filter (re-encodes)
ffmpeg -i a.mp4 -i b.mp4 -filter_complex \
  "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 20 out.mp4
```

## Transcode / compress

```bash
# Good quality, reasonable size (H.264)
ffmpeg -i in.mp4 -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 192k out.mp4

# Smaller files, same quality (H.265 / HEVC)
ffmpeg -i in.mp4 -c:v libx265 -crf 28 -preset medium -c:a aac -b:a 128k out.mp4

# Target a specific size with two-pass (e.g. ~8 MB for an 8 MB cap):
# bitrate(kbps) ≈ (target_MB * 8192) / duration_sec − audio_kbps
ffmpeg -y -i in.mp4 -c:v libx264 -b:v 1400k -pass 1 -an -f mp4 /dev/null && \
ffmpeg -i in.mp4 -c:v libx264 -b:v 1400k -pass 2 -c:a aac -b:a 128k out.mp4
```

## Scale / crop / reframe

```bash
# Resize to 1080p, keep aspect, guarantee even dimensions
ffmpeg -i in.mp4 -vf "scale=-2:1080" -c:a copy out.mp4

# 16:9 → 9:16 vertical: crop center to 9:16 then scale to 1080x1920
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy out.mp4

# Pad (letterbox) to a target canvas instead of cropping
ffmpeg -i in.mp4 -vf "scale=1080:-2,pad=1080:1920:0:(oh-ih)/2:black" out.mp4
```

## Extract

```bash
# Extract audio losslessly (keep original codec)
ffmpeg -i in.mp4 -vn -c:a copy out.m4a

# Extract audio as MP3
ffmpeg -i in.mp4 -vn -c:a libmp3lame -q:a 2 out.mp3

# One frame as an image at 5s
ffmpeg -ss 00:00:05 -i in.mp4 -frames:v 1 -q:v 2 frame.jpg

# Every 1 second as numbered frames
ffmpeg -i in.mp4 -vf fps=1 frame_%04d.png
```

## Overlay / watermark / subtitles

```bash
# Image watermark, bottom-right with 20px margin
ffmpeg -i in.mp4 -i logo.png -filter_complex \
  "overlay=W-w-20:H-h-20" -c:a copy out.mp4

# Burn in subtitles (hard subs)
ffmpeg -i in.mp4 -vf "subtitles=subs.srt" -c:a copy out.mp4

# Add soft subtitle track (toggleable, no re-encode of video)
ffmpeg -i in.mp4 -i subs.srt -c copy -c:s mov_text out.mp4
```

## Speed / framerate / GIF

```bash
# 2x faster video and audio
ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" \
  -map "[v]" -map "[a]" out.mp4

# Normalize variable frame rate to constant 30fps (fixes A/V drift)
ffmpeg -i in.mp4 -vsync cfr -r 30 -c:v libx264 -crf 20 -c:a aac out.mp4

# High-quality GIF (two-pass palette)
ffmpeg -i in.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,palettegen" palette.png && \
ffmpeg -i in.mp4 -i palette.png -filter_complex \
  "fps=15,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse" out.gif
```

## Mux / streams

```bash
# Replace the audio of a video with a separate track
ffmpeg -i video.mp4 -i music.mp3 -map 0:v -map 1:a -c:v copy -shortest out.mp4

# Remove all audio
ffmpeg -i in.mp4 -an -c:v copy out.mp4

# Change container only (e.g. .mkv → .mp4), no re-encode
ffmpeg -i in.mkv -c copy out.mp4
```

## Batch (shell)

```bash
# Re-encode every .mov in a folder to .mp4 (new files, originals untouched)
for f in *.mov; do
  ffmpeg -i "$f" -c:v libx264 -crf 23 -pix_fmt yuv420p -c:a aac "${f%.mov}.mp4"
done
```

## Reminders

- Stream-copy (`-c copy`) is lossless and fast — reach for it whenever the task allows.
- Filters (`-vf`, `-filter_complex`) always force a re-encode; you can't combine them with `-c copy` on that stream.
- Include `-pix_fmt yuv420p` for anything that must play in browsers/QuickTime/social.
- Verify the result with `ffprobe` — don't trust exit code 0 alone.
