// Restore the exact published video packets from the user-selected prior edit.
// Usage: node scripts/restore_company_films.mjs <ffmpeg.exe> <Dream Culture.mp3>
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
const [ffmpeg, music] = process.argv.slice(2);
if (!music) throw Error('Supply FFmpeg and the licensed Dream Culture source.');
const work = '.temp/company-restore-v6'; fs.mkdirSync(work,{recursive:true});
const ids=['casting','trimming','machining','robot-polishing','sink-finishing','sealing','packing'];
const run=args=>{const r=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y',...args.map(String)],{encoding:'utf8'});if(r.status)throw Error(r.stderr);};
run(['-ss',32,'-i',music,'-t',392/30,'-af','lowpass=f=7000,loudnorm=I=-25:TP=-4:LRA=5,afade=t=in:d=0.35,afade=t=out:st=12.2666667:d=0.8','-ar',48000,'-c:a','aac','-b:a','192k',`${work}/soundtrack.m4a`]);
for(const id of ids){
 const original=`${work}/${id}.mp4`;
 fs.writeFileSync(original,execFileSync('git',['show',`60abcd6:public/media/processes/${id}.mp4`],{maxBuffer:30e6}));
 run(['-i',original,'-i',`${work}/soundtrack.m4a`,'-map','0:v:0','-map','1:a:0','-c','copy','-t',392/30,'-map_metadata','-1','-metadata','comment=Dream Culture - Kevin MacLeod (incompetech.com), CC BY 4.0. Excerpt, low-pass, normalization and fades; see music-credits.txt.','-movflags','+faststart',`public/media/processes/${id}.mp4`]);
 const poster=`public/images/factory/processes/${id}-poster.webp`;
 fs.writeFileSync(poster,execFileSync('git',['show',`60abcd6:${poster}`],{maxBuffer:5e6}));
 console.log(`${id}: restored original video packets, shared calm soundtrack`);
}
