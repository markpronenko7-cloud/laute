// Authoring only. Download the licensed source listed in public/media/music-credits.txt.
// Usage: node scripts/mix_company_music.mjs <ffmpeg.exe> <music.mp3> <original.mp4> <output.mp4>
// Always pass the original video: mixing an already mixed file would duplicate music.
import { spawnSync } from 'node:child_process';
const [ffmpeg, music, original, output] = process.argv.slice(2);
if (!output || original === output) throw Error('Provide ffmpeg, music, original and a different output path.');
const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', original], { encoding: 'utf8' }).stderr;
const match = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
if (!match) throw Error('Cannot determine video duration.');
const duration = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
const hasAudio = /Audio:/.test(probe);
const bed = `[1:a]atrim=start=0:duration=${duration},asetpts=PTS-STARTPTS,loudnorm=I=-30:TP=-9:LRA=5,afade=t=in:d=1.5,afade=t=out:st=${Math.max(0, duration - 3)}:d=3`;
const filters = hasAudio ? `${bed}[music];[0:a][music]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.891:level=false[audio]` : `${bed}[audio]`;
const result = spawnSync(ffmpeg, ['-hide_banner', '-y', '-i', original, '-i', music, '-filter_complex', filters, '-map', '0:v:0', '-map', '[audio]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(duration), '-metadata', 'comment=Music: Meditation Impromptu 01 - Kevin MacLeod (incompetech.com), CC BY 4.0. Excerpt, level adjustment, fades and mix. See music-credits.txt.', '-movflags', '+faststart', output], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
