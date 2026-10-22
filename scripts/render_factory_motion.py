"""Offline GPU product-motion film. Temporary authoring packages only; no site dependencies.
Run with Python after installing moderngl, numpy, Pillow and imageio-ffmpeg in .temp/render-tools.
The product is an artistic visualization, not a documentary or a catalog SKU.
"""
import sys, pathlib, subprocess, argparse, math
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.temp/render-tools'))
import moderngl
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
import imageio_ffmpeg

VERT = '''#version 330
in vec2 pos; out vec2 uv; void main(){uv=pos;gl_Position=vec4(pos,0,1);}'''
FRAG = '''#version 330
in vec2 uv; out vec4 frag; uniform vec2 resolution; uniform float time;
float sat(float x){return clamp(x,0.,1.);}
float box(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float cyl(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float ring(vec3 p,float r,float w){return length(vec2(length(p.xz)-r,p.y))-w;}
float capsule(vec3 p,vec3 a,vec3 b,float r){vec3 q=p-a,v=b-a;return length(q-v*clamp(dot(q,v)/dot(v,v),0.,1.))-r;}
float smoothstep01(float a,float b,float x){return smoothstep(a,b,x);}
vec2 pick(vec2 a,vec2 b){return a.x<b.x?a:b;}
float explosion(){return .85*(smoothstep(5.,8.,time)-smoothstep(13.,17.,time));}
vec2 scene(vec3 p){
 float e=explosion();
 float body=cyl(p-vec3(0.,.53,0.),.205,.58)-.025;
 // Hollow underside and rigid spout, with stable geometry throughout the film.
 body=max(body,-cyl(p-vec3(0.,-.17,0.),.145,.30));
 float spout=box(p-vec3(.42,1.03+e*.55,0.),vec3(.55,.075,.19),.055);
 float outlet=cyl(p-vec3(.89,.92+e*.55,0.),.105,.06);
 vec2 d=vec2(body,1.);d=pick(d,vec2(spout,1.));d=pick(d,vec2(outlet,1.));
 float lever=box(p-vec3(.20,1.25+e*1.7,0.),vec3(.39,.025,.085),.026);
 d=pick(d,vec2(lever,1.));
 float cart=cyl(p-vec3(0.,1.13+e*.98,0.),.12,.12);
 d=pick(d,vec2(cart,3.));
 d=pick(d,vec2(ring(p-vec3(0.,1.00+e*.73,0.),.15,.025),4.));
 d=pick(d,vec2(cyl(p-vec3(0.,-.13-e*.5,0.),.13,.11),2.));
 d=pick(d,vec2(ring(p-vec3(0.,-.25-e*.95,0.),.17,.025),4.));
 d=pick(d,vec2(cyl(p-vec3(0.,-.04,0.),.30,.025),1.));
 if(time>22.){vec3 q=p-vec3(.89,0.,0.);float wave=.0025*sin(q.y*48.-time*14.)+.0015*sin(q.y*85.+time*9.);
 float stream=cyl(q-vec3(0.,.32,0.),.037+wave,.56);d=pick(d,vec2(stream,5.));}
 return d;
}
vec3 normal(vec3 p){vec2 e=vec2(.001,0);return normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));}
vec3 environment(vec3 r){
 vec3 col=vec3(.025,.034,.045)+vec3(.10,.12,.14)*smoothstep(-.7,.65,r.y);
 // Large softboxes form coherent continuous reflections on actual moving geometry.
 float a=exp(-pow(abs((r.x+.45)/.22),8.))*exp(-pow(abs((r.y-.25)/.70),8.))*smoothstep(-.2,.4,r.z);
 float b=exp(-pow(abs((r.z+.55)/.10),4.))*exp(-pow(abs((r.y-.15)/.8),8.));
 float strip=exp(-pow(abs((r.x-.65)/.035),2.))*smoothstep(-.8,.1,r.y);
 col+=vec3(4.,4.25,4.6)*a+vec3(2.8,1.8,.85)*b+vec3(2.3,2.6,3.)*strip;
 col+=vec3(.10,.13,.18)*pow(max(r.y,0.),3.);
 return col;
}
void main(){
 vec2 v=uv;v.x*=resolution.x/resolution.y;
 float intro=1.-smoothstep(2.,5.,time);
 float closeTool=smoothstep(16.7,17.5,time)-smoothstep(21.,22.,time);
 float angle=.45+.35*sin(time*.22);
 float dist=4.1-intro*2.65-closeTool*1.4-smoothstep(22.,24.,time)*.65;
 vec3 target=vec3(.15,.85+explosion()*.35+intro*.25+closeTool*.35,0.);
 vec3 ro=target+vec3(sin(angle)*dist,1.35+intro*.15,cos(angle)*dist);
 vec3 ww=normalize(target-ro), uu=normalize(cross(ww,vec3(0,1,0))), vv=cross(uu,ww);
 // Position object right of the editorial text area.
 vec3 rd=normalize(ww*2.05+uu*(v.x-.38)+vv*v.y);
 vec3 col=vec3(.0015,.003,.006)+vec3(.002,.004,.007)*(1.-length(uv)*.4);
 float ground=(-.29-ro.y)/rd.y;
 if(ground>0.){vec3 p=ro+rd*ground;float shadow=exp(-dot(p.xz-vec2(.25,0),p.xz-vec2(.25,0))*1.7);
 col=vec3(.003,.005,.009)*(1.-.85*shadow);
 float glow=exp(-length(p.xz)*.55);col+=vec3(.002,.003,.005)*glow;
 if(time>22.){float radius=length(p.xz-vec2(.89,0.));float rip=sin(radius*57.-time*10.)*exp(-radius*3.);col+=vec3(.08,.13,.16)*max(rip,0.)*smoothstep(22.,24.,time);}}
 float t=0.;vec2 hit;bool found=false;
 for(int i=0;i<130;i++){vec3 p=ro+rd*t;hit=scene(p);if(hit.x<.0012){found=true;break;}t+=hit.x*.82;if(t>9.|| (ground>0.&&t>ground))break;}
 if(found){vec3 p=ro+rd*t,n=normal(p),r=reflect(rd,n);float fres=pow(1.-max(dot(-rd,n),0.),5.);vec3 env=environment(r);
 float warm=(1.-smoothstep(15.,22.,time));vec3 metal=mix(vec3(.68,.75,.82),vec3(.66,.39,.12),warm);
 if(hit.y>1.5&&hit.y<2.5)metal=vec3(.32,.37,.40);
 if(hit.y>2.5&&hit.y<3.5)metal=vec3(.06,.095,.09);
 if(hit.y>3.5&&hit.y<4.5)metal=vec3(.025);
 col=env*mix(metal,vec3(.96),fres)+metal*.018;
 float key=max(dot(n,normalize(vec3(-3,5,4))),0.);col+=metal*key*.065;
 if(hit.y>4.5){col=environment(refract(rd,n,.75))*.60+env*(.35+fres)+vec3(.04,.16,.20);}
 // Restrained micromachining texture on brass, never random frame noise.
 col*=1.+warm*.008*sin(p.y*1500.);
 float ao=clamp(scene(p+n*.09).x/.09,.15,1.);col*=.62+.38*ao;
 }
 // Lens response, vignette and film grain.
 col=col/(col+vec3(.65));col=pow(col,vec3(.4545));
 col*=1.-.18*dot(uv,uv);
 float grain=fract(sin(dot(gl_FragCoord.xy+time,vec2(12.9898,78.233)))*43758.5453)-.5;
 col+=grain*.006;frag=vec4(col,1.);
}'''

CHAPTERS = [
 (0,5,'МАТЕРИАЛ','С характера металла','начинается история.','EVERY STORY BEGINS WITH MATERIAL.'),
 (5,11,'ИНЖЕНЕРИЯ','У каждой детали','есть своё место.','EVERY COMPONENT HAS A PURPOSE.'),
 (11,17,'СБОРКА','Точность.','Изнутри наружу.','PRECISION. FROM THE INSIDE OUT.'),
 (17,22,'ПОВЕРХНОСТЬ','Форма. Фактура.','Каждая грань.','FORM. TEXTURE. EVERY DETAIL.'),
 (22,30,'РЕЗУЛЬТАТ','Металл. Вода.','Характер LAUTE.','METAL. WATER. THE LAUTE CHARACTER.'),
 (30,34,'LAUTE','Создавая сегодня.','Думая о будущем.','CREATING TODAY. THINKING AHEAD.')
]
def font(n,bold=False):return ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if bold else 'arial.ttf'),n)
def overlay(t,w,h):
 scale=w/1280; im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
 row=next(r for r in CHAPTERS if r[0]<=t<r[1]);a,b,label,line1,line2,en=row
 fade=min(1,max(0,(t-a)/.65),max(0,(b-t)/.45));alpha=int(fade*255)
 x=int(74*scale);y=int((285+18*(1-fade))*scale)
 logo=Image.open(ROOT/'public/official-laute-logo.png').convert('L');mask=ImageOps.invert(logo).resize((int(146*scale),int(47*scale)),Image.Resampling.LANCZOS);im.paste((235,239,242),(x,int(53*scale)),mask)
 d.text((x,int(123*scale)),'MATERIAL / ENGINEERING / WATER',font=font(max(8,int(10*scale))),fill=(137,155,172,230))
 d.line((x,int(245*scale),x+int(39*scale),int(245*scale)),fill=(207,170,107,alpha),width=max(1,int(2*scale)))
 d.text((x,int(258*scale)),label,font=font(max(9,int(12*scale))),fill=(211,177,123,alpha))
 for i,line in enumerate((line1,line2)):d.text((x,y+int(i*49*scale)),line,font=font(max(12,int(35*scale)),True),fill=(239,242,245,alpha))
 d.text((x,y+int(117*scale)),en,font=font(max(8,int(10*scale))),fill=(151,168,184,alpha))
 d.text((x,int(660*scale)),'LAUTE / ХУДОЖЕСТВЕННАЯ 3D-ВИЗУАЛИЗАЦИЯ',font=font(max(8,int(9*scale))),fill=(132,148,165,200))
 for i,r in enumerate(CHAPTERS):
  xx=x+int(i*30*scale);d.line((xx,int(626*scale),xx+int(21*scale),int(626*scale)),fill=(208,177,126,220) if r==row else (68,84,101,200),width=max(1,int(2*scale)))
 if 24<=t<29.35:
  d.text((x,int(535*scale)),'ДМИТРИЙ / CEO / ЦЕНТРАЛЬНАЯ АЗИЯ И СИБИРЬ',font=font(max(8,int(10*scale))),fill=(211,177,123,240))
  d.text((x,int(561*scale)),'At the LAUTE mixer factory,',font=font(max(10,int(16*scale))),fill=(239,242,245,255))
  d.text((x,int(584*scale)),'nothing escapes quality control.',font=font(max(10,int(16*scale))),fill=(239,242,245,255))
 if t>30:
  black=Image.new('RGBA',(w,h),(4,9,15,int(smooth((t-30)/1.2)*210)));im=Image.alpha_composite(black,im)
 return im
def smooth(x):x=min(1,max(0,x));return x*x*(3-2*x)
def finish(ff,work):
 from build_factory_film import score, run
 score(work/'motion-score.wav',36)
 voice=next((ROOT/'.temp/factory-source').rglob('IMG_3559.MOV'))
 output=work/'laute-motion-film-1080p.mp4'
 filters='[1:a]atrim=0:34,afade=t=out:st=30:d=4,volume=0.5[bed];[2:a]highpass=f=85,lowpass=f=7500,afftdn=nr=7,loudnorm=I=-17:TP=-2:LRA=7,afade=t=in:d=0.04,afade=t=out:st=5.25:d=0.10,adelay=24000:all=1,apad=whole_dur=34[voice];[bed][voice]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-2:LRA=8[a]'
 run(ff,['-i',work/'motion-silent.mp4','-i',work/'motion-score.wav','-ss','17.5','-t','5.35','-i',voice,'-filter_complex',filters,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t','34','-movflags','+faststart',output])
 run(ff,['-i',output,'-vf','scale=1280:720','-c:v','libx264','-preset','slow','-crf','21','-c:a','aac','-b:a','128k','-movflags','+faststart',ROOT/'public/media/laute-factory-film.mp4'])
 run(ff,['-ss','25','-i',output,'-frames:v','1','-q:v','2',ROOT/'public/images/factory/motion-poster.jpg'])
 for lang,text in [('ru','На заводе смесителей LAUTE ничего не проходит мимо контроля качества.'),('en','At the LAUTE mixer factory, nothing escapes quality control.')]:
  (ROOT/f'public/media/laute-factory-{lang}.vtt').write_text('WEBVTT\n\n00:00:24.000 --> 00:00:29.350 line:90% position:50% align:center size:85%\n'+text+'\n',encoding='utf8')
 print('Finished:',output,flush=True)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--preview',action='store_true');ap.add_argument('--width',type=int,default=1280);ap.add_argument('--fps',type=int,default=30);args=ap.parse_args()
 w=args.width;h=w*9//16;work=ROOT/'.temp/laute-film-v2';work.mkdir(exist_ok=True,parents=True)
 ctx=moderngl.create_standalone_context();print('GPU:',ctx.info['GL_RENDERER'],flush=True)
 prog=ctx.program(vertex_shader=VERT,fragment_shader=FRAG);vbo=ctx.buffer(np.array([-1,-1,1,-1,-1,1,1,1],dtype='f4').tobytes());vao=ctx.simple_vertex_array(prog,vbo,'pos');fbo=ctx.simple_framebuffer((w,h));fbo.use();prog['resolution'].value=(w,h)
 def frame(t):
  prog['time'].value=t;vao.render(moderngl.TRIANGLE_STRIP);im=Image.frombytes('RGB',(w,h),fbo.read(components=3)).transpose(Image.Transpose.FLIP_TOP_BOTTOM).convert('RGBA');return Image.alpha_composite(im,overlay(t,w,h)).convert('RGB')
 if args.preview:
  sheet=Image.new('RGB',(w*3,h*2))
  for i,t in enumerate([2.5,8,14,19,25,32]):sheet.paste(frame(t),(i%3*w,i//3*h))
  sheet.save(work/'motion-contact.png');return
 ff=imageio_ffmpeg.get_ffmpeg_exe();output=work/'motion-silent.mp4';fps=args.fps
 process=subprocess.Popen([ff,'-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(fps),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],stdin=subprocess.PIPE)
 for i in range(34*fps):
  process.stdin.write(frame(i/fps).tobytes())
  if i%fps==0:print(f'Rendered {i//fps}/34 seconds',flush=True)
 process.stdin.close();assert process.wait()==0;finish(ff,work)
if __name__=='__main__':main()
