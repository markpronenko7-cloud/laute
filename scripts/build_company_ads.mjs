// Operation-led edits, rebuilt from the original archive. No synthetic footage.
// node scripts/build_company_ads.mjs <source-dir> <ffmpeg.exe> <Airport Lounge.mp3> [id]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const [source, ffmpeg, music, only] = process.argv.slice(2);
if (!music) throw Error('Supply source directory, ffmpeg and licensed music.');
const work = '.temp/company-edit-v5', output = 'public/media/processes';
fs.mkdirSync(work, { recursive: true });
fs.copyFileSync('C:/Windows/Fonts/segoeui.ttf', `${work}/regular.ttf`);
// source, in, duration, crop anchor. Durations follow the visible gesture,
// never a common beat grid. Adjacent moments stay continuous where possible.
const edits = [
  { id:'casting', title:'01 / ЛИТЕЙНЫЙ УЧАСТОК', musicIn:32, shots:[
    ['IMG_3565.MOV',16,4,.38,'Литейный участок'],
    ['IMG_5791.MOV',2,6,.38,'Рабочая зона'],
    ['IMG_5791.MOV',11,5,.40,'Оснастка'],
    ['IMG_3561.MOV',1,4,.42,'Заготовки'] ] },
  { id:'trimming', title:'02 / РАБОТА С ЛИТЕЙНОЙ ФОРМОЙ', musicIn:48, shots:[
    ['IMG_5792.MOV',5.5,3,.36,'Рабочее место'],
    ['IMG_5792.MOV',11,8,.34,'Работа с формой'],
    ['IMG_5793.MOV',1.5,4.5,.53,'Собранные отливки'] ] },
  { id:'machining', title:'03 / СТАНОЧНАЯ ОБРАБОТКА', musicIn:64, shots:[
    ['IMG_3558.MOV',32,3.5,.40,'Станочный участок'],
    ['IMG_5795.MOV',.2,5.5,.36,'Оснастка'],
    ['IMG_3560.MOV',1,6,.42,'Деталь крупным планом'],
    ['IMG_3560.MOV',10,3.5,.42,'Партия заготовок'] ] },
  { id:'robot-polishing', title:'04 / РОБОТИЗИРОВАННАЯ ПОЛИРОВКА', musicIn:84, shots:[
    ['IMG_3568.MOV',1,4,.40,'Рабочая ячейка'],
    ['IMG_3567.MOV',6,9,.30,'Движение манипулятора'],
    ['IMG_3568.MOV',30,6,.38,'Другой ракурс'],
    ['IMG_3566.MOV',7,4,.40,'Рабочий цикл'] ] },
  { id:'sink-finishing', title:'05 / РУЧНАЯ ОБРАБОТКА МОЕК', musicIn:112, shots:[
    ['IMG_8237.MOV',.8,10,.32,'Работа инструментом'],
    ['IMG_8237.MOV',47.5,10,.34,'Обработка кромки'],
    ['IMG_8239.MOV',17,3.5,.40,'Поверхность мойки'] ] },
  // There is only one angle. Preserve the complete movement in real time.
  { id:'sealing', title:'06 / НАНЕСЕНИЕ ГЕРМЕТИКА', musicIn:140, shots:[
    ['IMG_8238.MOV',.3,10.5,.46,'Один непрерывный рабочий жест'] ] },
  { id:'packing', title:'07 / КОМПЛЕКТАЦИЯ И УПАКОВКА', musicIn:160, shots:[
    ['IMG_3570.MOV',.8,4,.40,'Изделие и вкладыш'],
    ['IMG_3570.MOV',12,7,.40,'Укладка изделия'],
    ['IMG_3570.MOV',36,5,.42,'Комплектующие'],
    ['IMG_3570.MOV',54.5,5,.46,'Подготовка коробки'],
    ['IMG_3570.MOV',60,7,.46,'Закрытие коробки'] ] }
];
const run = args => {
  const r = spawnSync(ffmpeg, ['-hide_banner','-loglevel','error','-y','-threads','2','-filter_threads','2',...args.map(String)], { encoding:'utf8', maxBuffer:8e6 });
  if (r.status !== 0) throw Error(r.stderr);
};
const encode = ['-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-video_track_timescale','30000'];
const report = [];
for (const edit of edits) {
  if (only && only !== edit.id) continue;
  const parts = [], decisions = [];
  let timeline = 0;
  for (const [index, [filename, start, duration, anchor, note]] of edit.shots.entries()) {
    const input = path.join(source, filename), part = `${work}/${edit.id}-${index}.mp4`;
    const probe = spawnSync(ffmpeg, ['-hide_banner','-i',input], { encoding:'utf8' }).stderr;
    const tone = /arib-std-b67|smpte2084/.test(probe) ? 'zscale=t=linear:npl=100,format=gbrpf32le,tonemap=tonemap=hable:desat=1.3,zscale=p=bt709:t=bt709:m=bt709:r=tv,format=yuv420p,' : '';
    const framing = `${tone}scale=720:960:force_original_aspect_ratio=increase,crop=720:960:(iw-ow)/2:(ih-oh)*${anchor},setsar=1,eq=contrast=1.015:saturation=.94,fps=30,setpts=N/(30*TB)`;
    if (process.env.REUSE_EDIT_PARTS !== '1' || !fs.existsSync(part)) run(['-ss',start,'-i',input,'-an','-vf',framing,'-frames:v',Math.round(duration*30),...encode,part]);
    parts.push(part);
    decisions.push({ source:filename, in:start, out:start+duration, timelineIn:timeline, duration, note });
    timeline += duration;
  }
  const list = `${work}/${edit.id}-concat.txt`;
  fs.writeFileSync(list, parts.map(p=>`file '${path.resolve(p).replaceAll('\\','/')}'`).join('\n'));
  const caption = `${work}/${edit.id}-title.txt`; fs.writeFileSync(caption, edit.title);
  // Small identification; no slogans, fabricated result or stock end card.
  const video = `drawbox=x=24:y=26:w=672:h=54:color=0x102922@.78:t=fill:enable='lt(t,2.8)',drawtext=fontfile=${work}/regular.ttf:textfile=${caption}:fontsize=22:fontcolor=white:x=40:y=42:enable='lt(t,2.8)',fade=t=in:d=0.18,fade=t=out:st=${timeline-.35}:d=0.35`;
  const audio = `[1:a]atrim=start=${edit.musicIn}:duration=${timeline},asetpts=PTS-STARTPTS,loudnorm=I=-25:TP=-4:LRA=5,afade=t=in:d=0.7,afade=t=out:st=${timeline-1.2}:d=1.2[a]`;
  run(['-f','concat','-safe','0','-i',list,'-i',music,'-vf',video,'-filter_complex',audio,'-map','0:v:0','-map','[a]',...encode,'-c:a','aac','-b:a','160k','-ar','48000','-t',timeline,'-map_metadata','-1','-metadata','comment=Airport Lounge - Kevin MacLeod (incompetech.com), CC BY 4.0. Edited excerpt, fades and mix. See music-credits.txt.','-movflags','+faststart',`${output}/${edit.id}.mp4`]);
  run(['-ss','3','-i',`${output}/${edit.id}.mp4`,'-frames:v','1','-c:v','libwebp','-quality','88',`public/images/factory/processes/${edit.id}-poster.webp`]);
  report.push({id:edit.id,duration:timeline,musicIn:edit.musicIn,shots:decisions});
  fs.writeFileSync(`${work}/edit-decisions${only?'-'+only:''}.json`,JSON.stringify(report,null,2));
  console.log(`${edit.id}: ${timeline}s, ${parts.length} shots`);
}
