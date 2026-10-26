"""Edit the supplied factory footage, preserving real sound and camera orientation.

Authoring only: Python with Pillow and ffmpeg. No generated people or speech.
Usage: python scripts/build_factory_documentary.py --source DIR --ffmpeg PATH
"""
import argparse
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageOps

SHOTS = [
    ('IMG_3557.MOV', 16, 3, None, None),
    ('IMG_3560.MOV', 2, 7.3,
     'Так выглядит внутренняя структура душевой системы. Латунная, необработанная.',
     'This is the internal structure of a shower system. Brass, before finishing.'),
    ('IMG_3561.MOV', .9, 5.8,
     'А это будущий смеситель для умывальника завода LAUTE.',
     'And this will become a LAUTE basin mixer.'),
    ('IMG_3566.MOV', 1.75, 9.4,
     'Роботизированная обработка изделий на заводе смесителей LAUTE.',
     'Robotic finishing at the LAUTE mixer factory.'),
    ('IMG_8239.MOV', 8, 6.5, None, None),
]


def build(source, ffmpeg):
    work = Path('.temp/factory-documentary')
    work.mkdir(parents=True, exist_ok=True)
    media = Path('public/media')
    media.mkdir(exist_ok=True)
    # A restrained, readable LAUTE watermark, made from the official wordmark.
    logo = Image.open('public/official-laute-logo.png').convert('L')
    mask = ImageOps.invert(logo).resize((144, 46), Image.Resampling.LANCZOS)
    mark = Image.new('RGBA', (176, 74), (6, 8, 11, 210))
    mark.paste((255, 255, 255, 255), (16, 14, 160, 60), mask)
    mark.save(work / 'mark.png')

    def run(args):
        subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)], check=True)

    manifest, cues = [], {'ru': [], 'en': []}
    stamp = lambda t: f'{int(t//3600):02}:{int(t%3600//60):02}:{t%60:06.3f}'
    position = 0
    for i, (name, start, duration, ru, en) in enumerate(SHOTS):
        path = next(source.rglob(name))
        target = work / f'{i:02}.mp4'
        # ffmpeg autorotation honors the phone's original display matrix.
        # Preserve the entire portrait frame; never stretch it into landscape.
        run(['-ss', start, '-i', path, '-i', work / 'mark.png', '-t', duration,
             '-filter_complex', '[0:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v];[v][1:v]overlay=24:24,format=yuv420p[out]',
             '-map', '[out]', '-map', '0:a:0', '-af', 'highpass=f=75,alimiter=limit=0.9,afade=t=in:d=0.06,afade=t=out:st='+str(duration-.08)+':d=0.08',
             '-ar', 48000, '-ac', 2, '-c:v', 'libx264', '-preset', 'fast', '-crf', 22,
             '-c:a', 'aac', '-b:a', '128k', '-metadata:s:v', 'rotate=0', target])
        manifest.append({'source': name, 'in': start, 'duration': duration, 'timeline': position})
        for lang, text in [('ru', ru), ('en', en)]:
            if text:
                cues[lang].append(f'{stamp(position)} --> {stamp(position+duration)}\n{text}')
        position += duration
        print(f'Rendered {i+1}/{len(SHOTS)}', flush=True)
    concat = work / 'concat.txt'
    concat.write_text('\n'.join("file '"+(work/f'{i:02}.mp4').resolve().as_posix()+"'" for i in range(len(SHOTS))), encoding='utf8')
    run(['-f', 'concat', '-safe', 0, '-i', concat, '-c', 'copy', '-movflags', '+faststart', media/'laute-factory-documentary.mp4'])
    for lang, rows in cues.items():
        (media/f'laute-documentary-{lang}.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(rows)+'\n', encoding='utf8')
    run(['-ss', 17, '-i', media/'laute-factory-documentary.mp4', '-frames:v', 1, '-q:v', 2, 'public/images/factory/documentary-poster.jpg'])
    run(['-ss', 13, '-i', next(source.rglob('IMG_5795.MOV')), '-frames:v', 1,
         '-vf', 'scale=720:-2', '-q:v', 2, 'public/images/factory/machining.jpg'])
    (work/'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--ffmpeg', required=True)
    args = parser.parse_args()
    build(args.source, args.ffmpeg)
