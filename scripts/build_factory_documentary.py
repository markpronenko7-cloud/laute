"""Author the 20-second documentary insert from supplied handheld footage.

The generated still illustrations are NOT used as moving video. This edit has
one full frame, seven selected shots, a shared color pipeline and no narration.
Requires ffmpeg and NumPy for the authoring-only translation stabilization.
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

# source, in point, duration, vertical composition anchor (0=top, 1=bottom)
SHOTS = [
    ('IMG_3561.MOV', 8.3, 2.4, 0.56),
    ('IMG_5795.MOV', 12.2, 2.6, 0.48),
    ('IMG_3567.MOV', 10.0, 3.6, 0.40),
    ('IMG_3568.MOV', 32.0, 2.8, 0.45),
    ('IMG_8239.MOV', 2.4, 3.2, 0.46),
    ('IMG_8238.MOV', 4.0, 3.0, 0.58),
    ('IMG_8238.MOV', 1.7, 2.4, 0.36),
]
FPS = 30
SOURCE_WIDTH, SOURCE_HEIGHT = 1080, 1920


def run(ffmpeg, args):
    result = subprocess.run(
        [ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-threads', '2',
         '-filter_threads', '2', '-filter_complex_threads', '2', *map(str, args)],
        capture_output=True,
    )
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf8', errors='replace')[-4000:])
    return result.stdout


def stabilization(ffmpeg, source, start, duration):
    """Estimate small global translation; retain deliberate camera movement.

    Work on low-resolution luminance. Clamp compensation so subject motion or
    parallax cannot cause a large reframe. No optical-flow synthesis is used.
    """
    raw = run(ffmpeg, ['-ss', start, '-t', duration, '-i', source, '-an',
                      '-vf', f'scale=180:320,fps={FPS}', '-pix_fmt', 'gray',
                      '-f', 'rawvideo', '-'])
    frames = np.frombuffer(raw, np.uint8).reshape(-1, 320, 180).astype(np.float32)
    window = np.outer(np.hanning(320), np.hanning(180))
    path = [np.zeros(2)]
    previous = None
    for frame in frames:
        current = np.fft.fft2((frame - frame.mean()) * window)
        if previous is not None:
            cross = previous * current.conj()
            cross /= np.maximum(np.abs(cross), 1e-8)
            correlation = np.fft.fftshift(np.fft.ifft2(cross).real)
            region = correlation[154:167, 84:97]
            y, x = np.unravel_index(np.argmax(region), region.shape)
            shift = np.array([x - 6, y - 6])
            path.append(path[-1] - shift)
        previous = current
    path = np.array(path[:len(frames)])
    padded = np.pad(path, ((9, 9), (0, 0)), mode='edge')
    smooth = np.column_stack([np.convolve(padded[:, i], np.ones(19)/19, 'valid') for i in range(2)])
    correction = np.clip((path - smooth) * 6, -26, 26)
    return correction


def motion_expression(values, base):
    # Sparse, linearly interpolated keyframes prevent quantized crop jumps.
    indices = list(range(0, len(values), 3))
    if indices[-1] != len(values)-1:
        indices.append(len(values)-1)
    result = f'{base + values[indices[-1]]:.3f}'
    for left, right in reversed(list(zip(indices[:-1], indices[1:]))):
        t0, t1 = left/FPS, right/FPS
        v0, v1 = base+values[left], base+values[right]
        result = f'if(lt(t,{t1:.3f}),{v0:.3f}+({v1-v0:.3f})*(t-{t0:.3f})/{t1-t0:.3f},{result})'
    return result


def grade(ffmpeg, source):
    info = subprocess.run([ffmpeg, '-hide_banner', '-i', str(source)], capture_output=True).stderr.decode(errors='replace')
    hdr = 'arib-std-b67' in info or 'smpte2084' in info
    conversion = ('zscale=t=linear:npl=100,format=gbrpf32le,'
                  'tonemap=tonemap=hable:desat=2,zscale=p=bt709:t=bt709:m=bt709:r=tv,'
                  'format=yuv420p,' if hdr else '')
    return conversion + 'eq=contrast=1.02:saturation=0.82'


def build(source, ffmpeg):
    work = Path('.temp/factory-director-cut')
    work.mkdir(parents=True, exist_ok=True)
    media = Path('public/media')
    find = lambda name: next(source.rglob(name))
    duration = round(sum(shot[2] for shot in SHOTS), 2)
    manifest = []
    corrections = []
    for name, start, length, anchor in SHOTS:
        corrections.append(stabilization(ffmpeg, find(name), start, length))
    for mode in ['wide', 'mobile']:
        paths = []
        position = 0
        for i, ((name, start, length, anchor), correction) in enumerate(zip(SHOTS, corrections)):
            crop_width = 1024
            crop_height = 576 if mode == 'wide' else 1280
            x = motion_expression(correction[:, 0], (SOURCE_WIDTH-crop_width)/2)
            y = motion_expression(correction[:, 1], (SOURCE_HEIGHT-crop_height)*anchor)
            output_size = '1280:720' if mode == 'wide' else '720:900'
            filter_graph = (
                f'setpts=PTS-STARTPTS,scale={SOURCE_WIDTH}:{SOURCE_HEIGHT},'
                f'{grade(ffmpeg, find(name))},'
                f"crop={crop_width}:{crop_height}:x='{x}':y='{y}',"
                f'scale={output_size}:flags=lanczos,setsar=1,fps={FPS}'
            )
            target = work/f'{mode}-{i:02}.mp4'
            run(ffmpeg, ['-ss', start, '-t', length, '-i', find(name), '-an',
                         '-vf', filter_graph, '-c:v', 'libx264', '-threads', '2',
                         '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p',
                         '-color_primaries', 'bt709', '-color_trc', 'bt709',
                         '-colorspace', 'bt709', '-video_track_timescale', '30000',
                         '-map_metadata', '-1', target])
            paths.append(target)
            if mode == 'wide':
                manifest.append(dict(source=name, in_point=start, duration=length,
                                     timeline=round(position, 2), vertical_anchor=anchor))
                position += length
            print(f'{mode}: {i+1}/{len(SHOTS)}', flush=True)
        listing = work/f'{mode}.txt'
        listing.write_text('\n'.join("file '"+path.resolve().as_posix()+"'" for path in paths), encoding='utf8')
        stitched = work/f'{mode}-silent.mp4'
        run(ffmpeg, ['-f', 'concat', '-safe', '0', '-i', listing, '-c', 'copy', stitched])
        # A speech-free interval of actual machinery, crossfaded into a quiet bed.
        # No improvised voice, generated music, stock sound or synthetic video.
        bed = work/'room-tone.wav'
        if not bed.exists():
            run(ffmpeg, ['-ss', '9.1', '-t', '7.4', '-i', find('IMG_3567.MOV'), '-vn',
                         '-af', 'highpass=f=100,lowpass=f=2800,afftdn=nr=5,loudnorm=I=-27:TP=-7:LRA=4',
                         '-ar', '48000', '-ac', '2', bed])
        output = media/('laute-factory-documentary.mp4' if mode == 'wide' else 'laute-factory-mobile.mp4')
        filters = (
            '[1:a]asplit=3[a][b][c];[a][b]acrossfade=d=0.4:c1=tri:c2=tri[ab];'
            f'[ab][c]acrossfade=d=0.4:c1=tri:c2=tri,apad=whole_dur={duration},atrim=duration={duration},'
            f'afade=t=in:d=0.5,afade=t=out:st={duration-0.8}:d=0.8[audio]'
        )
        run(ffmpeg, ['-i', stitched, '-i', bed, '-filter_complex', filters,
                     '-map', '0:v', '-map', '[audio]',
                     '-vf', f'fps={FPS},setpts=N/({FPS}*TB),tpad=stop_mode=clone:stop_duration=1,trim=duration={duration},fade=t=out:st={duration-0.35}:d=0.35',
                     '-c:v', 'libx264', '-threads', '2', '-preset', 'fast', '-crf', '19',
                     '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                     '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000',
                     '-t', duration, '-map_metadata', '-1', '-movflags', '+faststart', output])
    (work/'edit-decision-list.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    print(f'Completed single-frame documentary insert: {duration}s', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--ffmpeg', required=True)
    args = parser.parse_args()
    build(args.source, args.ffmpeg)
