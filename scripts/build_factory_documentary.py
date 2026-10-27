"""Render the factory editorial from original footage, with matched desktop/mobile edits.
No generated imagery, baked-in graphics or synthetic score. Authoring requires ffmpeg.
"""
import argparse
import json
from pathlib import Path
import subprocess

# Primary and companion shots: in points in seconds, shared timeline duration.
# Portrait originals are paired on desktop and individually reframed on mobile.
SHOTS = [
    ('IMG_3557.MOV',16, 'IMG_3557.MOV',26, 4.0),
    ('IMG_3560.MOV',2, 'IMG_3561.MOV',1, 4.0),
    ('IMG_3560.MOV',6, 'IMG_3562.MOV',5, 4.0),
    ('IMG_3561.MOV',1, 'IMG_3562.MOV',8, 5.8),
    ('IMG_5795.MOV',13, 'IMG_5795.MOV',5, 4.0),
    ('IMG_3566.MOV',1.75, 'IMG_3567.MOV',10, 5.0),
    ('IMG_3568.MOV',20, 'IMG_3567.MOV',15, 4.4),
    ('IMG_8239.MOV',4, 'IMG_8238.MOV',3, 4.0),
    ('IMG_5792.MOV',12, 'IMG_8237.MOV',35, 4.4),
    ('IMG_3558.MOV',25, 'IMG_5793.MOV',3, 4.0),
    ('IMG_3559.MOV',17.5, 'IMG_3562.MOV',5, 5.4),
]

NARRATION = [
    (
        'IMG_3560.MOV', 2.0, 9.2, 5.6,
        'Так выглядит внутренняя структура душевой системы — латунная, необработанная ещё.',
        'This is the internal structure of a shower system — solid brass, before finishing.'
    ),
    (
        'IMG_3561.MOV', 0.9, 6.6, 13.2,
        'А это будущий смеситель для умывальника завода LAUTE.',
        'And this will become a LAUTE basin mixer.'
    ),
    (
        'IMG_3566.MOV', 1.75, 11.05, 22.0,
        'Работа робота по шлифовке изделий на заводе смесителей LAUTE.',
        'Robotic polishing of components at the LAUTE mixer factory.'
    ),
    (
        'IMG_3557.MOV', 18.3, 20.5, 32.2,
        'Продукция завода смесителей LAUTE...',
        'Products of the LAUTE mixer factory...'
    ),
    (
        'IMG_3557.MOV', 27.0, 30.0, 34.6,
        '...проходит через руки только самых лучших специалистов.',
        '...pass through the hands of skilled specialists.'
    ),
    (
        'IMG_3559.MOV', 16.1, 22.7, 42.0,
        'Все поняли? На заводе смесителей LAUTE ничего не проходит мимо контроля качества.',
        'At the LAUTE mixer factory, nothing escapes quality control.'
    ),
]
def run(ffmpeg, args):
    result = subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', '-filter_complex_threads', '2', *map(str, args)], capture_output=True)
    if result.returncode:
        raise RuntimeError(f'ffmpeg exit {result.returncode}: ' + result.stderr.decode('utf8', errors='replace')[-4000:])


def build(source, ffmpeg):
    work = Path('.temp/factory-editorial')
    work.mkdir(parents=True, exist_ok=True)
    media = Path('public/media')
    total = round(sum(shot[4] for shot in SHOTS), 2)
    find = lambda name: next(source.rglob(name))
    color_filters = {}
    def grade(name):
        if name not in color_filters:
            info = subprocess.run([ffmpeg, '-hide_banner', '-i', str(find(name))], capture_output=True).stderr.decode(errors='replace')
            hdr = 'arib-std-b67' in info or 'smpte2084' in info
            color_filters[name] = ('zscale=t=linear:npl=100,format=gbrpf32le,tonemap=tonemap=hable:desat=2,'
                                   'zscale=p=bt709:t=bt709:m=bt709:r=tv,format=yuv420p,' if hdr else '')
        return color_filters[name] + 'setsar=1,fps=30,eq=contrast=1.025:saturation=0.90'
    manifest = []
    timeline = 0
    # The on-site voice is retained with the established, manually transcribed cues.
    narration = NARRATION
    for mode in ['wide', 'mobile']:
        clips = []
        for i, (primary, start, companion, other_start, duration) in enumerate(SHOTS):
            target = work / f'{mode}-{i:02}.mp4'
            args = ['-ss', start, '-t', duration, '-i', find(primary)]
            if mode == 'wide':
                args += ['-threads', '2', '-ss', other_start, '-i', find(companion)]
                filt = (f'[0:v]scale=800:900:force_original_aspect_ratio=increase,crop=800:900,{grade(primary)},setpts=PTS-STARTPTS[a];'
                        f'[1:v]scale=800:900:force_original_aspect_ratio=increase,crop=800:900,{grade(companion)},setpts=PTS-STARTPTS[b];'
                        '[a][b]hstack=inputs=2[v]')
            else:
                filt = f'[0:v]scale=720:900:force_original_aspect_ratio=increase,crop=720:900,{grade(primary)},setpts=PTS-STARTPTS[v]'
            run(ffmpeg, [*args, '-filter_complex', filt, '-map', '[v]', '-an', '-t', duration,
                         '-c:v', 'libx264', '-threads', '2', '-preset', 'fast', '-crf', '21', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-r', '30', '-video_track_timescale', '30000', target])
            clips.append(target)
            if mode == 'wide':
                manifest.append(dict(primary=primary, in_point=start, companion=companion,
                                     companion_in=other_start, duration=duration, timeline=round(timeline, 2)))
                timeline += duration
            print(f'{mode}: {i+1}/{len(SHOTS)}', flush=True)
        listing = work / f'{mode}.txt'
        listing.write_text('\n'.join("file '" + clip.resolve().as_posix() + "'" for clip in clips), encoding='utf8')
        stitched = work / f'{mode}-silent.mp4'
        run(ffmpeg, ['-f', 'concat', '-safe', 0, '-i', listing, '-c', 'copy', stitched])
        # Actual machinery ambience, filtered below speech, with no synthesized score.
        args = ['-i', stitched, '-stream_loop', '-1', '-ss', 16, '-i', find('IMG_3567.MOV')]
        filters = ['[1:a]aresample=48000,highpass=f=60,lowpass=f=400,volume=0.12,afade=t=in:d=0.5[amb]']
        for i, (name, start, end, position, ru, en) in enumerate(narration):
            dur = end-start
            args += ['-ss', start, '-t', dur, '-i', find(name)]
            filters.append(f'[{i+2}:a]aresample=48000,highpass=f=100,lowpass=f=7600,'
                           f'afftdn=nr=10:nf=-30:tn=1,loudnorm=I=-17:TP=-2:LRA=6,'
                           f'afade=t=in:d=0.04,afade=t=out:st={dur-0.08:.2f}:d=0.08,'
                           f'adelay={int(position*1000)}:all=1[v{i}]')
        voices=''.join(f'[v{i}]' for i in range(len(narration)))
        filters.append(f'{voices}amix=inputs={len(narration)}:normalize=0,apad=whole_dur={total},asplit=2[voice][duck]')
        filters.append('[amb][duck]sidechaincompress=threshold=0.015:ratio=5:attack=15:release=350[bed]')
        filters.append(f'[bed][voice]amix=inputs=2:normalize=0,atrim=duration={total},afade=t=out:st={total-0.7}:d=0.7,loudnorm=I=-18:TP=-2:LRA=7[outa]')
        output = media / ('laute-factory-documentary.mp4' if mode == 'wide' else 'laute-factory-mobile.mp4')
        run(ffmpeg, [*args, '-filter_complex', ';'.join(filters), '-map', '0:v', '-map', '[outa]',
                     '-vf', f'fps=30,setpts=N/(30*TB),fade=t=out:st={total-0.4}:d=0.4', '-c:v', 'libx264', '-threads', '2', '-preset', 'fast', '-crf', '22', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '160k', '-ar', 48000, '-ac', 2,
                     '-t', total, '-movflags', '+faststart', output])
    stamp = lambda s: f'{int(s//3600):02}:{int(s%3600//60):02}:{s%60:06.3f}'
    for lang, idx in [('ru',4),('en',5)]:
        cues=[f'{stamp(row[3])} --> {stamp(row[3]+row[2]-row[1])}\n{row[idx]}' for row in narration]
        (media/f'laute-documentary-{lang}.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(cues)+'\n',encoding='utf8')
    run(ffmpeg,['-ss',23,'-i',media/'laute-factory-documentary.mp4','-frames:v',1,'-q:v',2,'public/images/factory/documentary-poster.jpg'])
    (work/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
    print(f'Complete: {total}s, desktop + mobile',flush=True)


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',type=Path,required=True)
    parser.add_argument('--ffmpeg',required=True)
    args=parser.parse_args()
    build(args.source,args.ffmpeg)
