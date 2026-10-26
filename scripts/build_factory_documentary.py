"""Build the LAUTE factory documentary tour from authentic production footage and Dmitry's on-site voice.

Authoring only: Python with Pillow, NumPy and ffmpeg.
Usage: python scripts/build_factory_documentary.py --source DIR --ffmpeg PATH
"""
import argparse
import json
from pathlib import Path
import subprocess
import wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

CHAPTERS = [
    ('01 / 06', 'Внутри производства', 'INSIDE THE FACTORY', True),
    ('02 / 06', 'Всё начинается с металла', 'IT STARTS WITH METAL', False),
    ('03 / 06', 'Геометрия корпуса', 'BODY GEOMETRY', False),
    ('04 / 06', 'Роботизированная шлифовка', 'ROBOTIC FINISHING', False),
    ('05 / 06', 'Прикосновение мастера', 'THE HUMAN TOUCH', False),
    ('06 / 06', 'Контроль качества', 'QUALITY CONTROL', True),
]

SHOTS = [
    ('IMG_3557.MOV', 16.0, 4.0, 0),
    ('IMG_3560.MOV', 1.5, 4.0, 1),
    ('IMG_3560.MOV', 5.5, 4.0, 1),
    ('IMG_3561.MOV', 0.9, 5.8, 2),
    ('IMG_5795.MOV', 13.0, 4.0, 2),
    ('IMG_3566.MOV', 1.75, 5.0, 3),
    ('IMG_3566.MOV', 6.75, 4.4, 3),
    ('IMG_3567.MOV', 10.0, 4.0, 3),
    ('IMG_8239.MOV', 8.0, 4.4, 4),
    ('IMG_3558.MOV', 18.0, 4.0, 4),
    ('IMG_3559.MOV', 17.5, 5.4, 5),
]

NARRATION = [
    (
        'IMG_3557.MOV', 0.0, 5.2, 0.2,
        'С чего начинается производство смесителей? Конечно же, с литья форм.',
        'Where does mixer production begin? With casting the moulds, of course.'
    ),
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
    p = subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)], capture_output=True)
    if p.returncode:
        raise RuntimeError(p.stderr.decode('utf8', errors='replace')[-4000:])


def font(size, bold=False):
    name = 'arialbd.ttf' if bold else 'arial.ttf'
    return ImageFont.truetype('C:/Windows/Fonts/' + name, size)


def make_overlay(path, chapter_idx):
    im = Image.new('RGBA', (1080, 1920))
    pix = np.zeros((1920, 1080, 4), dtype=np.uint8)
    pix[:, :, :3] = [6, 9, 14]
    top_grad = np.clip((380 - np.arange(1920)) * 0.50, 0, 195)
    bot_grad = np.clip((np.arange(1920) - 1220) * 0.38, 0, 235)
    pix[:, :, 3] = np.maximum(top_grad, bot_grad)[:, None].astype(np.uint8)
    im = Image.fromarray(pix)
    d = ImageDraw.Draw(im)

    logo = Image.open('public/official-laute-logo.png').convert('RGB')
    mask = ImageOps.invert(logo.convert('L')).resize((260, 84), Image.Resampling.LANCZOS)
    im.paste((255, 255, 255), (68, 62, 328, 146), mask)

    d.text((72, 168), 'FACTORY JOURNAL / PRODUCTION TOUR', font=font(18), fill='#ddd4c5')
    d.text((760, 92), 'LAUTE OFFICIAL', font=font(17, True), fill='#e4d1ac')
    d.line((68, 210, 1012, 210), fill='#ffffff55', width=1)

    step_num, title_ru, title_en, show_ceo = CHAPTERS[chapter_idx]
    if show_ceo:
        d.rounded_rectangle((68, 1295, 680, 1435), radius=8, fill=(8, 12, 18, 205), outline=(228, 209, 172, 110), width=1)
        d.text((92, 1314), 'ДМИТРИЙ · ЭКСКУРСИЯ ПО ЗАВОДУ', font=font(25, True), fill='#ffffff')
        d.text((92, 1352), 'CEO / ЦЕНТРАЛЬНАЯ АЗИЯ И СИБИРЬ', font=font(18), fill='#e4d1ac')
        d.text((92, 1384), 'DMITRY · CEO CENTRAL ASIA & SIBERIA', font=font(17), fill='#c4ccd6')

    d.text((72, 1475), step_num, font=font(22, True), fill='#e4d1ac')
    size = 56
    while d.textlength(title_ru, font=font(size, True)) > 936 and size > 32:
        size -= 1
    d.text((68, 1525), title_ru, font=font(size, True), fill='#ffffff')
    d.text((72, 1608), title_en, font=font(25), fill='#e4d9c5')
    d.line((72, 1742, 1008, 1742), fill='#ffffff55', width=1)
    d.text((72, 1774), 'LAUTE / MATERIAL · TECHNOLOGY · QUALITY CONTROL', font=font(18), fill='#d8dee6')
    im.save(path)


def score(path, duration):
    sr = 48000
    n = int(sr * duration)
    a = np.zeros((n, 2), dtype=np.float32)
    rng = np.random.default_rng(2026)
    chords = [(45, 52, 57, 60), (41, 48, 53, 57), (48, 55, 60, 64), (43, 50, 55, 59)]
    bars = int(np.ceil(duration / 4))
    for bar in range(bars):
        start = bar * 4
        ch = chords[bar % 4]
        seg_len = min(sr * 4, n - start * sr)
        if seg_len <= 0:
            break
        t = np.arange(seg_len) / sr
        for j, midi in enumerate(ch):
            f = 440 * 2 ** ((midi - 69) / 12)
            env = np.sin(np.pi * np.minimum(t / 4, 1)) ** 0.7
            sig = (np.sin(2 * np.pi * f * t) + 0.17 * np.sin(2 * np.pi * f * 2.002 * t)) * env * 0.022
            pan = 0.25 + 0.5 * (j / 3)
            idx = slice(start * sr, start * sr + seg_len)
            a[idx, 0] += sig * (1 - pan)
            a[idx, 1] += sig * pan
        for beat in range(8):
            pos = int((start + beat * 0.5) * sr)
            if pos >= n:
                break
            tt = np.arange(min(int(sr * 0.36), n - pos)) / sr
            freq = 440 * 2 ** ((ch[beat % 4] + 24 - 69) / 12)
            sig = np.sin(2 * np.pi * freq * tt) * np.exp(-tt * 16) * 0.034
            a[pos:pos + len(tt), 0] += sig * 0.7
            a[pos:pos + len(tt), 1] += sig * 0.7
            if beat % 2 == 0:
                kt = np.arange(min(int(sr * 0.22), n - pos)) / sr
                k = np.sin(2 * np.pi * (45 * kt + 30 * (1 - np.exp(-kt * 25)) / 25)) * np.exp(-kt * 22) * 0.13
                a[pos:pos + len(kt), :] += k[:, None]
            ht = np.arange(min(int(sr * 0.075), n - pos)) / sr
            if len(ht) > 1:
                noise = rng.normal(0, 1, len(ht))
                noise = np.diff(noise, prepend=0) * np.exp(-ht * 85) * 0.005
                a[pos:pos + len(ht), 0] += noise * 0.4
                a[pos:pos + len(ht), 1] += noise * 0.6
    t = np.arange(n) / sr
    env = np.minimum(t / 1.8, 1) * np.minimum((duration - t) / 2.5, 1)
    a *= env[:, None]
    a = np.tanh(a * 2.0)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((a * 32767).astype('<i2').tobytes())


def build(source, ffmpeg):
    work = Path('.temp/factory-documentary')
    work.mkdir(parents=True, exist_ok=True)
    media = Path('public/media')
    media.mkdir(exist_ok=True)

    total_duration = round(sum(s[2] for s in SHOTS), 2)
    for ch_idx in range(len(CHAPTERS)):
        make_overlay(work / f'overlay-{ch_idx}.png', ch_idx)

    manifest = []
    position = 0.0
    for i, (name, start, duration, ch_idx) in enumerate(SHOTS):
        path = next(source.rglob(name))
        target = work / f'shot-{i:02d}.mp4'
        graphic = work / f'overlay-{ch_idx}.png'
        vfade = ''
        if i == 0:
            vfade += ',fade=t=in:st=0:d=0.5'
        if i == len(SHOTS) - 1:
            vfade += f',fade=t=out:st={max(0.0, duration - 0.9):.2f}:d=0.9'
        filt = (
            '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,'
            'crop=1080:1920,setsar=1,fps=30,'
            'eq=contrast=1.04:saturation=0.96:brightness=-0.01[v];'
            f'[v][1:v]overlay=0:0,format=yuv420p{vfade}[outv]'
        )
        afilt = f'aresample=48000,highpass=f=90,lowpass=f=6000,volume=0.14,afade=t=in:d=0.08,afade=t=out:st={max(0.0, duration - 0.1):.2f}:d=0.1'
        run(ffmpeg, [
            '-ss', start, '-t', duration, '-i', path, '-i', graphic,
            '-filter_complex', filt,
            '-map', '[outv]', '-map', '0:a:0', '-af', afilt,
            '-ar', 48000, '-ac', 2,
            '-c:v', 'libx264', '-preset', 'fast', '-crf', 20,
            '-c:a', 'aac', '-b:a', '128k',
            '-metadata:s:v', 'rotate=0', target
        ])
        manifest.append({
            'source': name,
            'in': start,
            'duration': duration,
            'timeline': round(position, 2),
            'chapter': CHAPTERS[ch_idx][1]
        })
        position += duration
        print(f'Rendered shot {i + 1}/{len(SHOTS)}', flush=True)

    concat = work / 'concat.txt'
    concat.write_text(
        '\n'.join("file '" + (work / f'shot-{i:02d}.mp4').resolve().as_posix() + "'" for i in range(len(SHOTS))),
        encoding='utf8'
    )
    stitched = work / 'stitched.mp4'
    run(ffmpeg, ['-f', 'concat', '-safe', 0, '-i', concat, '-c', 'copy', stitched])

    music_wav = work / 'score.wav'
    score(music_wav, total_duration)

    stamp = lambda s: f'{int(s // 3600):02}:{int(s % 3600 // 60):02}:{s % 60:06.3f}'
    for lang, idx in [('ru', 4), ('en', 5)]:
        cues = [
            f'{stamp(row[3])} --> {stamp(row[3] + (row[2] - row[1]))} line:63% position:50% align:center size:86%\n{row[idx]}'
            for row in NARRATION
        ]
        (media / f'laute-documentary-{lang}.vtt').write_text('WEBVTT\n\n' + '\n\n'.join(cues) + '\n', encoding='utf8')
        (media / f'laute-factory-{lang}.vtt').write_text('WEBVTT\n\n' + '\n\n'.join(cues) + '\n', encoding='utf8')

    args = ['-i', stitched, '-i', music_wav]
    filters = ['[0:a][1:a]amix=inputs=2:weights=0.45 0.85:normalize=0[amb]']
    for i, (name, start, end, timeline, ru, en) in enumerate(NARRATION):
        dur = round(end - start, 3)
        args += ['-ss', start, '-t', dur, '-i', next(source.rglob(name))]
        filters.append(
            f'[{i + 2}:a]aresample=48000,highpass=f=90,lowpass=f=7600,'
            f'afftdn=nr=12:nf=-30:tn=1,'
            f'equalizer=f=220:width_type=o:width=1.2:g=2.5,'
            f'equalizer=f=3200:width_type=o:width=1.4:g=2.0,'
            f'acompressor=threshold=-19dB:ratio=3.2:attack=8:release=140:makeup=3,'
            f'loudnorm=I=-15:TP=-1.5:LRA=6,'
            f'afade=t=in:d=0.06,afade=t=out:st={max(0.0, dur - 0.1):.2f}:d=0.1,'
            f'adelay={int(timeline * 1000)}:all=1[v{i}]'
        )
    voice_inputs = ''.join(f'[v{i}]' for i in range(len(NARRATION)))
    filters.append(
        f'{voice_inputs}amix=inputs={len(NARRATION)}:normalize=0:duration=longest,'
        f'apad=whole_dur={total_duration},asplit=2[voice][duck]'
    )
    filters.append('[amb][duck]sidechaincompress=threshold=0.018:ratio=7:attack=15:release=420[bed]')
    filters.append('[bed][voice]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-15.5:TP=-1.5:LRA=7[outa]')

    master = work / 'laute-factory-documentary-1080p.mp4'
    run(ffmpeg, [
        *args,
        '-filter_complex', ';'.join(filters),
        '-map', '0:v', '-map', '[outa]',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', 48000,
        '-t', total_duration, '-movflags', '+faststart', master
    ])

    out_doc = media / 'laute-factory-documentary.mp4'
    run(ffmpeg, [
        '-i', master,
        '-vf', 'scale=720:1280',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', 22,
        '-c:a', 'aac', '-b:a', '144k',
        '-movflags', '+faststart', out_doc
    ])

    run(ffmpeg, ['-ss', 23.5, '-i', out_doc, '-frames:v', 1, '-q:v', 2, 'public/images/factory/documentary-poster.jpg'])
    run(ffmpeg, ['-ss', 13, '-i', next(source.rglob('IMG_5795.MOV')), '-frames:v', 1, '-vf', 'scale=720:-2', '-q:v', 2, 'public/images/factory/machining.jpg'])
    (work / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    print(f'Documentary ready: {out_doc} ({out_doc.stat().st_size} bytes, {total_duration}s)', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--ffmpeg', required=True)
    args = parser.parse_args()
    build(args.source, args.ffmpeg)
