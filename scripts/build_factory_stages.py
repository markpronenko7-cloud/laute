"""Reproduce the process edits from the supplied factory archive.

Only real footage; no invented scenes, interpolation, voice or music.
ffmpeg performs rotation, HDR-to-SDR conversion, restrained grading and cuts.
Source timecodes are seconds. Crop anchors refer to the upright portrait frame.
"""
import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path

# id, [(source, in, length, vertical crop anchor, detail magnification)], photo
# Each edit follows the operation: context -> working action -> visible result.
# Deliberate camera moves remain; stabilization corrects only small translations.
EDITS = [
    ('casting', [('IMG_3565.MOV', 16, 2.7, .38, 1), ('IMG_5791.MOV', 3.2, 4.2, .38, 1.05), ('IMG_5791.MOV', 10.5, 4.5, .40, 1.06), ('IMG_3562.MOV', 6.2, 3.0, .42, 1.02)], ('IMG_5791.MOV', 4.7, .35)),
    ('trimming', [('IMG_5792.MOV', 8.5, 3.0, .36, 1), ('IMG_5792.MOV', 14.5, 4.1, .32, 1.12), ('IMG_5793.MOV', 2.6, 3.8, .53, 1.02)], ('IMG_5792.MOV', 16.2, .40)),
    ('machining', [('IMG_3558.MOV', 35.5, 3.5, .40, 1), ('IMG_5795.MOV', .2, 2.0, .36, 1), ('IMG_5795.MOV', 11.9, 2.4, .32, 1.14), ('IMG_5795.MOV', 4.2, 3.2, .48, 1.03)], ('IMG_5795.MOV', 12.8, .36)),
    ('robot-polishing', [('IMG_3568.MOV', .8, 3.0, .40, 1), ('IMG_3567.MOV', 7.5, 5.5, .30, 1.08), ('IMG_3568.MOV', 32, 3.5, .38, 1.04), ('IMG_3566.MOV', 8.5, 2.8, .40, 1)], ('IMG_3567.MOV', 10, .3)),
    ('sink-finishing', [('IMG_8237.MOV', 22, 2.7, .38, 1), ('IMG_8237.MOV', 2.4, 4.2, .32, 1.09), ('IMG_8237.MOV', 7, 2.5, .31, 1.15), ('IMG_8237.MOV', 50.3, 3.7, .34, 1.06)], ('IMG_8237.MOV', 5, .32)),
    ('sealing', [('IMG_8238.MOV', .4, 2.5, .45, 1), ('IMG_8238.MOV', 2.9, 4.9, .47, 1.12), ('IMG_8238.MOV', 7.8, 1.5, .48, 1.05)], ('IMG_8238.MOV', 7, .46)),
    ('packing', [('IMG_3570.MOV', .6, 3.6, .40, 1), ('IMG_3570.MOV', 13.6, 3.8, .40, 1.07), ('IMG_3570.MOV', 54.7, 5, .46, 1.04), ('IMG_3570.MOV', 59.7, 6.6, .46, 1)], ('IMG_3570.MOV', 56.5, .42)),
]

# Typography is a navigation layer for the actual filmed operation. It must
# never name an unseen machine action or suggest a generated shot is footage.
TITLES = {
    'casting': ('Литьё', 'заготовок', 'CASTING', ['Литейный участок', 'Работа с расплавом', 'Литейная оснастка', 'Заготовка крупным планом'], 'От металла — к форме'),
    'trimming': ('Работа', 'с литейной формой', 'MOULD WORK', ['Рабочий участок', 'Ручная работа с формой', 'Собранные отливки'], 'Форма и отливки'),
    'machining': ('Станочная', 'обработка', 'MACHINE SHOP', ['Станочный участок', 'Рабочая зона', 'Оснастка крупным планом', 'Партия заготовок'], 'Оснастка и заготовки'),
    'robot-polishing': ('Роботизированная', 'полировка', 'ROBOTIC POLISHING', ['Загрузка рабочей зоны', 'Контакт с кругом', 'Движение манипулятора', 'Рабочая ячейка'], 'Ритм рабочего цикла'),
    'sink-finishing': ('Ручная обработка', 'моек', 'HAND FINISHING', ['Рабочее место', 'Работа инструментом', 'Поверхность крупным планом', 'Доводка кромки'], 'Внимание к каждой кромке'),
    'sealing': ('Нанесение', 'герметика', 'SEALANT APPLICATION', ['Положение мойки', 'Нанесение вдоль стыка', 'Шов крупным планом'], 'Шов — крупным планом'),
    'packing': ('Комплектация', 'и упаковка', 'KITTING & PACKING', ['Изделие и вкладыш', 'Укладка изделия', 'Комплектующие', 'Закрытие коробки'], 'Комплект упакован'),
}



def finish_endcap(ffmpeg, movie, font, ending, work):
    """Place the closing caption against the encoded CFR timeline, not source PTS."""
    info = subprocess.run([ffmpeg, '-hide_banner', '-i', str(movie)], capture_output=True).stderr.decode(errors='replace')
    match = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info)
    duration = int(match[1])*3600 + int(match[2])*60 + float(match[3])
    text = work/f'{movie.stem}-final-note.txt'; text.write_text(ending, encoding='utf8')
    target = work/f'{movie.stem}-capped.mp4'
    vf = (f"drawbox=x=24:y=796:w=672:h=94:color=0x102b26@0.94:t=fill:enable='gte(t,{duration-.9})',"
          f"drawtext=fontfile={font.as_posix()}:textfile={text.as_posix()}:fontcolor=white:fontsize=27:x=42:y=824:enable='gte(t,{duration-.9})',"
          f'fade=t=out:st={duration-.2}:d=0.2')
    result = subprocess.run([ffmpeg, '-loglevel', 'error', '-y', '-threads', '2', '-filter_threads', '2', '-i', str(movie), '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-video_track_timescale', '30000', '-map_metadata', '-1', '-movflags', '+faststart', str(target)], capture_output=True)
    if result.returncode: raise RuntimeError(result.stderr.decode(errors='replace'))
    target.replace(movie)


def build(source, ffmpeg, only=None):
    work = Path('.temp/factory-stages/render-v3'); work.mkdir(parents=True, exist_ok=True)
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
    def duration_of(path):
        info = subprocess.run([ffmpeg, '-hide_banner', '-i', str(path)], capture_output=True).stderr.decode(errors='replace')
        match = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info)
        return int(match[1])*3600 + int(match[2])*60 + float(match[3])
    font = work/'type.ttf'
    if not font.exists():
        shutil.copyfile(Path('C:/Windows/Fonts/segoeuib.ttf'), font)
    manifest = []
    for ordinal, (name, shots, photo) in enumerate(EDITS, 1):
        if only and name not in only: continue
        parts = []
        for i, (filename, start, duration, anchor, detail) in enumerate(shots):
            p = find(filename); part = work/f'{name}-{i}.mp4'
            cw = round(1080/detail/2)*2; ch = round(1440/detail/2)*2
            framing = grade(p) + f"scale=1080:1920,crop={cw}:{ch}:(iw-ow)/2:(ih-oh)*{anchor},scale=720:960:flags=lanczos,setsar=1,fps=30,setpts=N/(30*TB)"
            transforms = work/f'{name}-{i}.trf'
            run(['-ss', start, '-t', duration, '-i', p, '-an', '-vf', framing+f',vidstabdetect=shakiness=4:accuracy=9:result={transforms.as_posix()}', '-f', 'null', '-'])
            vf = framing + f',vidstabtransform=input={transforms.as_posix()}:smoothing=8:optalgo=avg:maxshift=14:maxangle=0:optzoom=0:zoom=5:crop=black:interpol=bicubic'
            run(['-ss', start, '-t', duration, '-i', p, '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-map_metadata', '-1', part])
            parts.append(part)
        listing = work/f'{name}.txt'
        listing.write_text('\n'.join("file '"+p.resolve().as_posix()+"'" for p in parts), encoding='utf8')
        lengths = [duration_of(part) for part in parts]
        timeline_duration = sum(lengths)
        total = timeline_duration + .6
        title_a, title_b, english, phases, ending = TITLES[name]
        def text_file(key, text):
            path = work/f'{name}-{key}.txt'; path.write_text(text, encoding='utf8'); return path.as_posix()
        def text_filter(key, text, size, x, y, enabled):
            return f"drawtext=fontfile={font.as_posix()}:textfile={text_file(key, text)}:fontcolor=white:fontsize={size}:x={x}:y={y}:enable='{enabled}'"
        filters = ['fps=30', 'setpts=N/(30*TB)', 'tpad=stop_mode=clone:stop_duration=0.6']
        # Opening headline remains over moving source footage, not a still.
        filters += ["drawbox=x=24:y=706:w=672:h=184:color=0x102b26@0.88:t=fill:enable='lt(t,1.65)'",
                    text_filter('opening-index', f'{ordinal:02} / ПРОИЗВОДСТВО', 13, 42, 725, 'lt(t,1.65)'),
                    text_filter('title-a', title_a, 41, 42, 751, 'lt(t,1.65)'),
                    text_filter('title-b', title_b, 41, 42, 803, 'lt(t,1.65)'),
                    text_filter('english', english, 13, 42, 865, 'lt(t,1.65)')]
        # Each actual shot receives a useful phase label and discrete progress.
        filters += [f"drawbox=x=24:y=814:w=672:h=76:color=0x102b26@0.82:t=fill:enable='between(t,1.65,{timeline_duration-.2})'"]
        position = 0
        for i, length in enumerate(lengths):
            start, end = max(1.65, position), min(position+length, timeline_duration-.2)
            enabled = f'between(t,{start:.3f},{end:.3f})'
            filters += [text_filter(f'phase-index-{i}', f'{i+1:02} / {len(phases):02}', 13, 42, 842, enabled),
                        text_filter(f'phase-{i}', phases[i], 21, 122, 835, enabled),
                        f"drawbox=x=42:y=877:w={round(636*(i+1)/len(phases))}:h=2:color=0xe0ebd8:t=fill:enable='{enabled}'"]
            position += length
        ending_start = timeline_duration-.2
        filters += [f"drawbox=x=24:y=796:w=672:h=94:color=0x102b26@0.9:t=fill:enable='gte(t,{ending_start})'",
                    text_filter('ending', ending, 27, 42, 824, f'gte(t,{ending_start})'),
                    'fade=t=in:d=0.12', f'fade=t=out:st={total-.2}:d=0.2']
        run(['-f', 'concat', '-safe', '0', '-i', listing, '-an', '-vf', ','.join(filters), '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-video_track_timescale', '30000', '-map_metadata', '-1', '-movflags', '+faststart', output/f'{name}.mp4'])
        finish_endcap(ffmpeg, output/f'{name}.mp4', font, ending, work)
        # Posters show the edited opening, while generated art is a separate asset.
        run(['-ss', '0.8', '-i', output/f'{name}.mp4', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '88', '-map_metadata', '-1', photos/f'{name}-poster.webp'])
        manifest.append({'id': name, 'duration': round(sum(s[2] for s in shots), 2), 'shots': shots, 'photo': photo})
        print(name, manifest[-1]['duration'], flush=True)
    (work/'edit-decisions.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--ffmpeg', required=True)
    parser.add_argument('--only', nargs='*')
    args = parser.parse_args()
    build(args.source, args.ffmpeg, args.only)
