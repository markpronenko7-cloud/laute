"""Reproduce the process edits from the supplied factory archive.

Only real footage; no invented scenes, interpolation, voice or music.
ffmpeg performs rotation, HDR-to-SDR conversion, restrained grading and cuts.
Source timecodes are seconds. Crop anchors refer to the upright portrait frame.
"""
import argparse
import json
import subprocess
from pathlib import Path

# id, [(source, in, length, vertical crop anchor)], photographic frame
EDITS = [
    ('casting', [('IMG_5791.MOV', 2.2, 5.8, .38), ('IMG_5791.MOV', 12, 5, .48)], ('IMG_5791.MOV', 4.7, .35)),
    ('trimming', [('IMG_5792.MOV', 6.5, 1.5, .48), ('IMG_5792.MOV', 8, 5, .48), ('IMG_5793.MOV', 4, 3.5, .58)], ('IMG_5792.MOV', 11.5, .46)),
    ('machining', [('IMG_5795.MOV', .1, 1.9, .4), ('IMG_5795.MOV', 12, 2.3, .4), ('IMG_5795.MOV', 3.4, 3.3, .5)], ('IMG_5795.MOV', 12.8, .36)),
    ('robot-polishing', [('IMG_3566.MOV', 3, 3, .42), ('IMG_3567.MOV', 7, 6, .38), ('IMG_3568.MOV', 31, 5, .4)], ('IMG_3567.MOV', 10, .3)),
    ('sink-finishing', [('IMG_8237.MOV', 2, 5, .36), ('IMG_8237.MOV', 22, 5, .4), ('IMG_8237.MOV', 50, 4, .4)], ('IMG_8237.MOV', 5, .32)),
    ('sealing', [('IMG_8238.MOV', .3, 9.5, .5)], ('IMG_8238.MOV', 7, .46)),
    ('packing', [('IMG_3570.MOV', .6, 5.4, .45), ('IMG_3570.MOV', 12, 4, .45), ('IMG_3570.MOV', 55, 6, .48)], ('IMG_3570.MOV', 56.5, .42)),
]


def build(source, ffmpeg):
    work = Path('.temp/factory-stages/render'); work.mkdir(parents=True, exist_ok=True)
    output = Path('public/media/processes'); output.mkdir(parents=True, exist_ok=True)
    photos = Path('public/images/factory/processes'); photos.mkdir(parents=True, exist_ok=True)
    def find(name): return next(source.rglob(name))
    def run(args):
        result = subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', '-filter_threads', '2', *map(str, args)], capture_output=True)
        if result.returncode: raise RuntimeError(result.stderr.decode(errors='replace'))
    def grade(path):
        info = subprocess.run([ffmpeg, '-hide_banner', '-i', str(path)], capture_output=True).stderr.decode(errors='replace')
        hdr = 'arib-std-b67' in info or 'smpte2084' in info
        return ('zscale=t=linear:npl=100,format=gbrpf32le,tonemap=tonemap=hable:desat=2,zscale=p=bt709:t=bt709:m=bt709:r=tv,format=yuv420p,' if hdr else '') + 'eq=contrast=1.01:brightness=-0.012:saturation=0.9,'
    manifest = []
    for name, shots, photo in EDITS:
        parts = []
        for i, (filename, start, duration, anchor) in enumerate(shots):
            p = find(filename); part = work/f'{name}-{i}.mp4'
            vf = grade(p) + f"scale=1080:1920,crop=1080:1440:0:(ih-oh)*{anchor},scale=720:960:flags=lanczos,setsar=1,fps=30,setpts=PTS-STARTPTS"
            run(['-ss', start, '-t', duration, '-i', p, '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p', '-map_metadata', '-1', part])
            parts.append(part)
        listing = work/f'{name}.txt'
        listing.write_text('\n'.join("file '"+p.resolve().as_posix()+"'" for p in parts), encoding='utf8')
        run(['-f', 'concat', '-safe', '0', '-i', listing, '-c', 'copy', '-map_metadata', '-1', '-movflags', '+faststart', output/f'{name}.mp4'])
        p = find(photo[0]); vf = grade(p) + f'scale=1080:1920,crop=1080:810:0:(ih-oh)*{photo[2]},scale=960:720:flags=lanczos'
        run(['-ss', photo[1], '-i', p, '-frames:v', '1', '-vf', vf, '-c:v', 'libwebp', '-quality', '88', '-map_metadata', '-1', photos/f'{name}.webp'])
        # Separate, correctly composed portrait poster avoids stretching a still.
        first = find(shots[0][0])
        run(['-ss', shots[0][1]+.5, '-i', first, '-frames:v', '1', '-vf', grade(first)+f'scale=1080:1920,crop=1080:1440:0:(ih-oh)*{shots[0][3]},scale=720:960', '-c:v', 'libwebp', '-quality', '85', '-map_metadata', '-1', photos/f'{name}-poster.webp'])
        manifest.append({'id': name, 'duration': round(sum(s[2] for s in shots), 2), 'shots': shots, 'photo': photo})
        print(name, manifest[-1]['duration'], flush=True)
    (work/'edit-decisions.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--ffmpeg', required=True)
    args = parser.parse_args()
    build(args.source, args.ffmpeg)
