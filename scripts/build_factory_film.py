"""Rebuild the LAUTE documentary from user-supplied footage.
Requires ffmpeg, Pillow and NumPy (authoring only; no website dependencies).
Usage: python scripts/build_factory_film.py --source DIR --ffmpeg PATH
"""
import argparse, json, pathlib, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

SHOTS = [
 ('IMG_3557.MOV',16,0), ('IMG_3560.MOV',1.5,1), ('IMG_3561.MOV',2,1),
 ('IMG_3562.MOV',7,1), ('IMG_5795.MOV',16.8,2), ('IMG_3559.MOV',18,2),
 ('IMG_3566.MOV',4,3), ('IMG_3567.MOV',10,3), ('IMG_3568.MOV',34,3),
 ('IMG_8239.MOV',8,4), ('IMG_8239.MOV',16,4), ('IMG_3558.MOV',18,5),
 ('IMG_3563.MOV',23,5), ('IMG_3567.MOV',17,6)
]
CAPTIONS = [
 ('Внутри производства','INSIDE THE FACTORY'),
 ('Всё начинается с металла','IT STARTS WITH METAL'),
 ('Точность в каждой детали','PRECISION IN EVERY DETAIL'),
 ('Технологии в движении','TECHNOLOGY IN MOTION'),
 ('Прикосновение мастера','THE HUMAN TOUCH'),
 ('От детали — к изделию','FROM COMPONENT TO PRODUCT'),
 ('Характер создаётся здесь','CHARACTER STARTS HERE')
]
NARRATION = [
 ('IMG_3560.MOV',2.0,9.3,4.0,'Так выглядит внутренняя структура душевой системы. Латунная, необработанная.','This is the internal structure of a shower system. Brass, before finishing.'),
 ('IMG_3561.MOV',0.9,6.7,12.0,'А это будущий смеситель для умывальника завода LAUTE.','And this will become a LAUTE basin mixer.'),
 ('IMG_3566.MOV',1.75,11.15,24.8,'Роботизированная обработка изделий на заводе смесителей LAUTE.','Robotic finishing of products at the LAUTE mixer factory.'),
 ('IMG_3559.MOV',17.5,22.85,46.0,'На заводе смесителей LAUTE ничего не проходит мимо контроля качества.','At the LAUTE mixer factory, nothing escapes quality control.')
]

def run(ff, args):
 p = subprocess.run([ff,'-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True)
 if p.returncode: raise RuntimeError(p.stderr.decode('utf8',errors='replace')[-4000:])

def overlay(path, chapter):
 im=Image.new('RGBA',(1080,1920));pix=np.zeros((1920,1080,4),dtype=np.uint8)
 pix[:,:,:3]=[6,9,14]
 pix[:,:,3]=np.maximum(np.clip((400-np.arange(1920))*.46,0,180),np.clip((np.arange(1920)-1300)*.37,0,225))[:,None].astype(np.uint8)
 im=Image.fromarray(pix);d=ImageDraw.Draw(im)
 font=lambda n,bold=False:ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if bold else 'arial.ttf'),n)
 logo=Image.open('public/official-laute-logo.png').convert('RGB');mask=ImageOps.invert(logo.convert('L'));mask=mask.resize((270,87),Image.Resampling.LANCZOS);im.paste((255,255,255),(68,65,338,152),mask)
 d.text((72,179),'FACTORY JOURNAL / 01',font=font(19),fill='#ddd4c5')
 d.line((68,222,1012,222),fill='#ffffff66',width=1)
 d.text((72,1485),f'{min(chapter+1,6):02d} / 06',font=font(22),fill='#e4d1ac')
 title,en=CAPTIONS[chapter]
 # Fit the original Russian headline without wrapping into unsafe screen edges.
 size=60
 while d.textlength(title,font=font(size,True))>940:size-=1
 d.text((68,1558),title,font=font(size,True),fill='white')
 d.text((72,1650),en,font=font(27),fill='#e4d9c5')
 d.line((72,1730,1008,1730),fill='#ffffff66',width=1)
 d.text((72,1765),'LAUTE / MATERIAL. PROCESS. PEOPLE.',font=font(19),fill='#e2e5e9')
 if chapter==0:
  d.text((72,1310),'ДМИТРИЙ',font=font(34,True),fill='white')
  d.text((72,1364),'CEO / ЦЕНТРАЛЬНАЯ АЗИЯ И СИБИРЬ',font=font(21),fill='#e4d9c5')
  d.text((72,1407),'DMITRY / CEO / CENTRAL ASIA & SIBERIA',font=font(19),fill='#e4d9c5')
 im.save(path)

def narrate(ff, source, work, master):
 # These are genuine excerpts of Dmitry's on-site narration, not cloned speech.
 media=pathlib.Path('public/media');media.mkdir(parents=True,exist_ok=True)
 stamp=lambda seconds: f'{int(seconds//3600):02}:{int(seconds%3600//60):02}:{seconds%60:06.3f}'
 for lang,index in [('ru',4),('en',5)]:
  cues=[f'{stamp(row[3])} --> {stamp(row[3]+row[2]-row[1])}\n{row[index]}' for row in NARRATION]
  web_cues=[cue.replace('\n',' line:65% position:50% align:center size:85%\n',1) for cue in cues]
  (media/f'laute-factory-{lang}.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(web_cues)+'\n',encoding='utf8')
  (work/f'{lang}.srt').write_text('\n\n'.join(f'{i+1}\n'+cue.replace('.',',',2) for i,cue in enumerate(cues))+'\n',encoding='utf8')
 args=['-f','concat','-safe',0,'-i',work/'concat.txt','-i',work/'original-score.wav']
 filters=[]
 for i,(name,start,end,timeline,ru,en) in enumerate(NARRATION):
  args+=['-ss',start,'-t',end-start,'-i',next(source.rglob(name))]
  filters.append(f'[{i+2}:a]aresample=48000,highpass=f=85,lowpass=f=7500,afftdn=nr=7:nf=-28:tn=1,loudnorm=I=-17:TP=-2:LRA=7,afade=t=in:d=0.05,afade=t=out:st={end-start-.08}:d=0.08,adelay={int(timeline*1000)}:all=1[voice{i}]')
 filters.append(''.join(f'[voice{i}]' for i in range(len(NARRATION)))+f'amix=inputs={len(NARRATION)}:normalize=0:duration=longest,apad=whole_dur=56,asplit=2[voice][duck]')
 filters.append('[1:a][duck]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=500[bed]')
 filters.append('[bed][voice]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-2:LRA=8[audio]')
 args+=['-i',work/'ru.srt','-i',work/'en.srt','-filter_complex',';'.join(filters),'-map','0:v','-map','[audio]','-map',str(2+len(NARRATION))+':0','-map',str(3+len(NARRATION))+':0','-c:v','copy','-c:a','aac','-b:a','192k','-ar',48000,'-c:s','mov_text','-metadata:s:s:0','language=rus','-metadata:s:s:1','language=eng','-disposition:s:0','default','-movflags','+faststart','-t',56,master]
 run(ff,args)

def score(path,duration):
 # Original instrumental bed: restrained minor-key pads, plucks and a soft pulse.
 sr=48000;n=int(sr*duration);a=np.zeros((n,2),dtype=np.float32);rng=np.random.default_rng(2026)
 chords=[(45,52,57,60),(41,48,53,57),(48,55,60,64),(43,50,55,59)]
 for bar in range(int(duration/4)):
  start=bar*4;ch=chords[bar%4];t=np.arange(sr*4)/sr
  for j,midi in enumerate(ch):
   f=440*2**((midi-69)/12);env=np.sin(np.pi*np.minimum(t/4,1))**.7
   sig=(np.sin(2*np.pi*f*t)+.17*np.sin(2*np.pi*f*2.002*t))*env*.023
   pan=.25+.5*(j/3);idx=slice(start*sr,(start+4)*sr);a[idx,0]+=sig*(1-pan);a[idx,1]+=sig*pan
  for beat in range(8):
   pos=int((start+beat*.5)*sr);tt=np.arange(int(sr*.36))/sr
   freq=440*2**((ch[beat%4]+24-69)/12)
   sig=np.sin(2*np.pi*freq*tt)*np.exp(-tt*16)*.037
   a[pos:pos+len(tt),0]+=sig*.7;a[pos:pos+len(tt),1]+=sig*.7
   if beat%2==0:
    kt=np.arange(int(sr*.22))/sr;k=np.sin(2*np.pi*(45*kt+30*(1-np.exp(-kt*25))/25))*np.exp(-kt*22)*.14
    a[pos:pos+len(kt),:]+=k[:,None]
   ht=np.arange(int(sr*.075))/sr;noise=rng.normal(0,1,len(ht));noise=np.diff(noise,prepend=0)*np.exp(-ht*85)*.006
   a[pos:pos+len(ht),0]+=noise*.4;a[pos:pos+len(ht),1]+=noise*.6
 t=np.arange(n)/sr;env=np.minimum(t/2,1)*np.minimum((duration-t)/3,1);a*=env[:,None];a=np.tanh(a*2.1)
 with wave.open(str(path),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((a*32767).astype('<i2').tobytes())

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source',required=True);parser.add_argument('--ffmpeg',required=True);parser.add_argument('--output',default='public/media/laute-factory-film.mp4');args=parser.parse_args()
 source=pathlib.Path(args.source);out=pathlib.Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);work=pathlib.Path('.temp/factory-render');work.mkdir(parents=True,exist_ok=True)
 manifest=[]
 for i,(name,start,chapter) in enumerate(SHOTS):
  p=next(source.rglob(name));graphic=work/f'overlay-{chapter}.png'
  overlay(graphic,chapter)
  filt='[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,eq=contrast=1.035:saturation=0.94:brightness=-0.01[v];[v][1:v]overlay=0:0,format=yuv420p'
  if i==0:filt+=',fade=t=in:st=0:d=0.6'
  if i==len(SHOTS)-1:filt+=',fade=t=out:st=3:d=1'
  target=work/f'clip-{i:02d}.mp4'
  run(args.ffmpeg,['-ss',start,'-i',p,'-i',graphic,'-filter_complex',filt,'-t',4,'-an','-c:v','libx264','-preset','fast','-crf',20,'-metadata:s:v','rotate=0',target])
  manifest.append({'source':name,'in':start,'out':start+4,'timeline':i*4,'chapter':CAPTIONS[chapter]});print(f'Rendered {i+1}/{len(SHOTS)}',flush=True)
 concat=work/'concat.txt';concat.write_text('\n'.join("file '"+(work/f'clip-{i:02d}.mp4').resolve().as_posix()+"'" for i in range(len(SHOTS))),encoding='utf8')
 music=work/'original-score.wav';score(music,len(SHOTS)*4)
 master=work/'laute-factory-film-1080p.mp4';narrate(args.ffmpeg,source,work,master)
 run(args.ffmpeg,['-i',master,'-map','0:v','-map','0:a','-vf','scale=720:1280','-c:v','libx264','-preset','slow','-crf',23,'-c:a','aac','-b:a','128k','-movflags','+faststart',out])
 images=pathlib.Path('public/images/factory');images.mkdir(parents=True,exist_ok=True)
 for name,clip,sec in [('brass','IMG_3560.MOV',4),('machining','IMG_5795.MOV',18),('robot','IMG_3567.MOV',12),('polishing','IMG_3566.MOV',7),('finishing','IMG_8239.MOV',10),('geometry','IMG_3562.MOV',8)]:
  run(args.ffmpeg,['-ss',sec,'-i',next(source.rglob(clip)),'-frames:v',1,'-vf','scale=720:-2','-q:v',3,images/(name+'.jpg')])
 (work/'edit-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
 print(json.dumps({'master':str(master),'web':str(out),'seconds':len(SHOTS)*4,'bytes':out.stat().st_size}),flush=True)
