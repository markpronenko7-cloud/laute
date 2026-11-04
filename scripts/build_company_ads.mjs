// Advertising edits from supplied footage. No generated scene or object branding.
// Usage: node scripts/build_company_ads.mjs <source-dir> <ffmpeg.exe> <Dream Culture.mp3> [process-id]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const [source, ffmpeg, music, only] = process.argv.slice(2);
if (!music) throw Error('Supply source directory, ffmpeg and the licensed music file.');
const work = '.temp/company-ads', output = 'public/media/processes';
fs.mkdirSync(work, { recursive: true });
fs.copyFileSync('C:/Windows/Fonts/segoeuib.ttf', `${work}/bold.ttf`);
fs.copyFileSync('C:/Windows/Fonts/segoeui.ttf', `${work}/regular.ttf`);
const beat = 60 / 110, fps = 30, mainFrames = Math.round(20 * beat * fps), endFrames = Math.round(4 * beat * fps), total = (mainFrames + endFrames) / fps;
const definitions = [
  ['casting', ['МЕТАЛЛ.', 'ФОРМА.'], 'ЛИТЬЁ ЗАГОТОВОК', ['Литейная оснастка', 'Работа с формой', 'Заготовка'], [['IMG_3565.MOV',16,.38,1],['IMG_5791.MOV',3.2,.38,1],['IMG_5791.MOV',10.5,.40,1.03],['IMG_5791.MOV',14,.40,1.06],['IMG_3562.MOV',6.2,.42,1.02]]],
  ['trimming', ['ФОРМА.', 'В РАБОТЕ.'], 'ЛИТЕЙНАЯ ФОРМА', ['Рабочий жест', 'Работа с формой', 'Собранные отливки'], [['IMG_5792.MOV',8.5,.36,1],['IMG_5792.MOV',11,.36,1],['IMG_5792.MOV',14.5,.36,1.03],['IMG_5792.MOV',17.3,.36,1],['IMG_5793.MOV',2.6,.53,1]]],
  ['machining', ['ДЕТАЛЬ.', 'В ФОКУСЕ.'], 'СТАНОЧНЫЙ УЧАСТОК', ['Рабочая зона', 'Партия заготовок', 'Металл и геометрия'], [['IMG_3558.MOV',35.5,.40,1],['IMG_5795.MOV',.2,.36,1],['IMG_5795.MOV',11.9,.32,1.08],['IMG_5795.MOV',4.2,.48,1.01],['IMG_5795.MOV',7.5,.48,1.04]]],
  ['robot-polishing', ['ДВИЖЕНИЕ.', 'РИТМ.'], 'РОБОТИЗИРОВАННАЯ ПОЛИРОВКА', ['Контакт с кругом', 'Движение манипулятора', 'Рабочий цикл'], [['IMG_3568.MOV',.8,.40,1],['IMG_3567.MOV',7.5,.30,1],['IMG_3567.MOV',9.68,.30,1.04],['IMG_3568.MOV',32,.38,1],['IMG_3566.MOV',8.5,.40,1]]],
  ['sink-finishing', ['ПОВЕРХНОСТЬ.', 'ХАРАКТЕР.'], 'РУЧНАЯ ОБРАБОТКА МОЕК', ['Работа инструментом', 'Доводка кромки', 'Внимание к поверхности'], [['IMG_8237.MOV',22,.38,1],['IMG_8237.MOV',2.4,.32,1],['IMG_8237.MOV',4.58,.32,1.04],['IMG_8237.MOV',50.3,.34,1],['IMG_8237.MOV',53.57,.34,1.03]]],
  ['sealing', ['ОДИН ШОВ.', 'ОДНО ДВИЖЕНИЕ.'], 'НАНЕСЕНИЕ ГЕРМЕТИКА', ['Вдоль стыка', 'Непрерывный рабочий жест', 'Шов крупным планом'], [['IMG_8238.MOV',.1,.45,1],['IMG_8238.MOV',1.19,.45,1],['IMG_8238.MOV',3.37,.47,1.03],['IMG_8238.MOV',5.55,.47,1.05],['IMG_8238.MOV',8.82,.48,1.03]]],
  ['packing', ['КАЖДАЯ ДЕТАЛЬ.', 'НА СВОЁМ МЕСТЕ.'], 'КОМПЛЕКТАЦИЯ И УПАКОВКА', ['Комплектующие', 'Закрытие коробки', 'Финальный этап'], [['IMG_3570.MOV',.6,.40,1],['IMG_3570.MOV',13.6,.40,1],['IMG_3570.MOV',54.7,.46,1.02],['IMG_3570.MOV',59.7,.46,1],['IMG_3570.MOV',63,.46,1]]]
];
const run = args => { const r = spawnSync(ffmpeg, ['-hide_banner','-loglevel','error','-y','-threads','2','-filter_threads','2',...args.map(String)], { encoding: 'utf8', maxBuffer: 8e6 }); if (r.status !== 0) throw Error(r.stderr); };
const encode = ['-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-video_track_timescale','30000'];
const textFile = (key, value) => { const p = `${work}/${key}.txt`; fs.writeFileSync(p, value); return p; };
const label = (key, value, size, x, y, start, end, color='white') => {
  const alpha = `min(1,max(0,(t-${start})/.22))*min(1,max(0,(${end}-t)/.18))`;
  const slide = `${x}-44*pow(max(0,1-(t-${start})/.4),3)`;
  return `drawtext=fontfile=${work}/bold.ttf:textfile=${textFile(key,value)}:fontsize=${size}:fontcolor=${color}:x='${slide}':y=${y}:alpha='${alpha}':enable='between(t,${start},${end})'`;
};
// A native compositing gradient, rather than an opaque strip across the footage.
run(['-f','lavfi','-i',"color=c=black@0:s=720x960,format=rgba,geq=r=0:g=0:b=0:a='170*pow(Y/H,3)+105*pow(1-Y/H,8)'",'-frames:v','1',`${work}/shade.png`]);
run(['-i','public/laute-logo.png','-vf','lutrgb=r=255:g=255:b=255,scale=160:-1','-frames:v','1',`${work}/logo.png`]);
run(['-i','public/laute-logo.png','-vf','lutrgb=r=255:g=255:b=255,scale=410:-1','-frames:v','1',`${work}/logo-large.png`]);
const report = [];
for (let ordinal=0; ordinal<definitions.length; ordinal++) {
  const [id, headline, chapter, phrases, shots] = definitions[ordinal];
  if (only && id !== only) continue;
  const started = Date.now(), parts = [], cuts = [];
  let accumulated = 0;
  const beats = [2,4,4,6,4];
  for (let i=0;i<shots.length;i++) {
    const [filename, start, anchor, detail] = shots[i];
    const frames = Math.round((accumulated + beats[i]) * beat * fps) - Math.round(accumulated * beat * fps);
    accumulated += beats[i];
    const p = path.join(source, filename), part = `${work}/${id}-${i}.mp4`;
    const probe = spawnSync(ffmpeg,['-hide_banner','-i',p],{encoding:'utf8'}).stderr;
    const hdr = /arib-std-b67|smpte2084/.test(probe);
    const tone = hdr ? 'zscale=t=linear:npl=100,format=gbrpf32le,tonemap=tonemap=hable:desat=1.3,zscale=p=bt709:t=bt709:m=bt709:r=tv,format=yuv420p,' : '';
    const cw = Math.round(1080/detail/2)*2, ch = Math.round(1440/detail/2)*2;
    const vf = `${tone}scale=1080:1920:flags=lanczos,crop=${cw}:${ch}:(iw-ow)/2:(ih-oh)*${anchor},scale=720:960:flags=lanczos,setsar=1,eq=contrast=1.035:brightness=.002:saturation=.97,unsharp=5:5:.28:3:3:0,fps=30,setpts=N/(30*TB)`;
    if (process.env.REUSE_AD_PARTS !== '1' || !fs.existsSync(part)) run(['-ss',start,'-i',p,'-an','-vf',vf,'-frames:v',frames,...encode,'-crf','16',part]);
    parts.push(part); cuts.push({ filename, in: start, frames, anchor, detail });
  }
  const listing = `${work}/${id}-concat.txt`;
  fs.writeFileSync(listing,parts.map(p=>`file '${path.resolve(p).replaceAll('\\','/')}'`).join('\n'));
  const filters = [
    '[0:v][1:v]overlay=0:0[shade]',
    '[shade][2:v]overlay=44:38[brand]',
    `[brand]${label(id+'-chapter',`${String(ordinal+1).padStart(2,'0')} / ${chapter}`,15,44,119,.1,10.8,'0xcde8df')},`+
    label(id+'-h1',headline[0],headline[0].length>13?49:61,44,655,.24,2.9)+','+
    label(id+'-h2',headline[1],headline[1].length>14?44:59,44,727,.5,2.9)+','+
    label(id+'-p1',phrases[0],31,44,811,3.35,5.35)+','+
    label(id+'-p2',phrases[1],31,44,811,5.55,8.65)+','+
    label(id+'-p3',phrases[2],31,44,811,8.9,10.82)+','+
    `drawbox=x=44:y=864:w=84:h=3:color=0xb3e2c4:t=fill,`+
    `drawtext=fontfile=${work}/regular.ttf:textfile=${textFile(id+'-source','Рекламный монтаж LAUTE · предоставленная съёмка')}:fontsize=12:fontcolor=white@.85:x=44:y=899[v]`
  ].join(';');
  run(['-f','concat','-safe','0','-i',listing,'-loop','1','-i',`${work}/shade.png`,'-loop','1','-i',`${work}/logo.png`,'-filter_complex_threads','2','-filter_complex',filters,'-map','[v]','-frames:v',mainFrames,'-an',...encode,`${work}/${id}-main.mp4`]);
  const endFilter = `[1:v]format=rgba,fade=t=in:st=0.1:d=0.3:alpha=1[logo];[0:v][logo]overlay=x=(W-w)/2:y='345+35*pow(max(0,1-t/.6),3)',`+
    label(id+'-end','ВНИМАНИЕ К ДЕТАЛЯМ',23,'(w-text_w)/2',527,.3,2.2,'0xcde8df')+','+
    label(id+'-cta','ОТКРОЙ КОЛЛЕКЦИИ LAUTE',22,'(w-text_w)/2',744,.55,2.2)+','+
    `drawbox=x=260:y=699:w=200:h=1:color=0xb3e2c4@.8:t=fill,fade=t=out:st=1.98:d=0.2[v]`;
  run(['-f','lavfi','-i','color=c=0x102922:s=720x960:r=30','-loop','1','-i',`${work}/logo-large.png`,'-filter_complex_threads','2','-filter_complex',endFilter,'-map','[v]','-frames:v',endFrames,'-an',...encode,`${work}/${id}-end.mp4`]);
  const finalList = `${work}/${id}-final.txt`;
  fs.writeFileSync(finalList,[`${work}/${id}-main.mp4`,`${work}/${id}-end.mp4`].map(p=>`file '${path.resolve(p).replaceAll('\\','/')}'`).join('\n'));
  const audio = `[1:a]atrim=start=${32}:duration=${total},asetpts=PTS-STARTPTS,loudnorm=I=-25:TP=-4:LRA=5,afade=t=in:d=0.35,afade=t=out:st=${total-.8}:d=0.8[a]`;
  run(['-f','concat','-safe','0','-i',finalList,'-i',music,'-filter_complex',audio,'-map','0:v:0','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t',total,'-metadata','comment=Dream Culture - Kevin MacLeod (incompetech.com). CC BY 4.0. Edited excerpt and mix; see music-credits.txt.','-movflags','+faststart',`${output}/${id}.mp4`]);
  run(['-ss','0.9','-i',`${output}/${id}.mp4`,'-frames:v','1','-c:v','libwebp','-quality','90',`public/images/factory/processes/${id}-poster.webp`]);
  report.push({id,frames:mainFrames+endFrames,duration:total,musicStart:32,cuts,renderSeconds:Math.round((Date.now()-started)/1000)});
  fs.writeFileSync(`${work}/edit-decisions${only?'-'+only:''}.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.at(-1)));
}
