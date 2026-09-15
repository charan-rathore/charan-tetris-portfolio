/** Resolution-independent project illustrations. Explicit geometry; no raster noise or upscaling. */
import {mkdirSync,writeFileSync} from 'node:fs';
const out=new URL('../public/projects/precision/',import.meta.url);mkdirSync(out,{recursive:true});
const c={cyan:'#62e8ff',purple:'#ae91ff',green:'#71e0ad',amber:'#ffcb79',red:'#fb8ea5'};
const path=(d,fill='none',stroke='#33475e',w=2,extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" ${extra}/>`;
const line=(x1,y1,x2,y2,color=c.cyan,w=2,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" ${extra}/>`;
const ellipse=(x,y,rx,ry,fill,stroke='#294158')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const text=(x,y,s,color='#91a7bd',size=15)=>`<text x="${x}" y="${y}" fill="${color}" font-family="ui-monospace,monospace" font-size="${size}" letter-spacing="2">${s}</text>`;
function cube(x,y,s=40,h=40,col=c.cyan){return `<g>${path(`M${x} ${y+s}l${s} -${s/2}v${h}l-${s} ${s/2}Z`,'#101e32',col,1.5)}${path(`M${x-s} ${y+s/2}l${s} ${s/2}v${h}l-${s} -${s/2}Z`,'#182b43',col,1.5)}${path(`M${x} ${y}l${s} ${s/2} -${s} ${s/2} -${s} -${s/2}Z`,col,col,1)}${line(x-s+5,y+s/2,x,y+3,'#e9f6ff',1.5)}</g>`;}
const shapes={T:[[0,0],[1,0],[2,0],[1,1]],L:[[0,0],[0,1],[0,2],[1,2]],S:[[1,0],[2,0],[0,1],[1,1]],I:[[0,0],[1,0],[2,0],[3,0]]};
function piece(name,x,y,col=c.purple,s=45){return shapes[name].map(([a,b])=>cube(x+(a-b)*s,y+(a+b)*s/2,s-2,s*.65,col)).join('');}
function sheet(x,y,w=210,h=160,col=c.cyan){let s=path(`M${x} ${y}h${w}v${h}H${x}Z`,'#0f1c2c',col,1.5);for(let i=0;i<5;i++)s+=line(x+22,y+30+i*22,x+w-25-(i%3)*18,y+30+i*22,i===0?col:'#466079',i===0?4:2);return s;}
function frame(name,num,col,body){const stars=Array.from({length:36},(_,i)=>`<circle cx="${80+(i*197)%1440}" cy="${80+(i*137)%820}" r="${i%5===0?2:1}" fill="#819bb9" opacity="${i%5===0?.5:.2}"/>`).join('');return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" role="img" aria-label="${name}"><title>${name}</title><defs><radialGradient id="space"><stop stop-color="#152b43"/><stop offset="1" stop-color="#070c16"/></radialGradient><linearGradient id="metal" x2=".8" y2="1"><stop stop-color="#233e57"/><stop offset="1" stop-color="#0a1423"/></linearGradient></defs><rect width="1600" height="1000" fill="#070c16"/><ellipse cx="800" cy="560" rx="710" ry="430" fill="url(#space)"/>${stars}${path('M100 800Q800 460 1500 800','none','#1c334a',1)}${path('M160 840Q800 600 1440 840','none','#172c40',1)}${text(80,90,`${num} / ${name.toUpperCase()}`,col,18)}${line(80,120,1520,120,'#253448',1)}${body}${text(80,930,'CHARAN RATHORE / SYSTEMS IN PLAY','#667d95',14)}${line(1420,927,1520,927,col,4)}</svg>`;}
const scenes={};
scenes.intellirag=frame('Evidence has a path','01',c.purple,
 path('M460 480H590L750 560M930 555h130l85-170M1060 555l85 110','none',c.purple,3)+
 `<g transform="translate(200 300) rotate(-8)">${sheet(0,0,240,180,c.cyan)}</g><g transform="translate(250 430) rotate(-8)">${sheet(0,0,240,180,c.cyan)}</g>`+
 ellipse(810,710,220,66,'#080f1b')+piece('T',760,430,c.purple,75)+sheet(1150,290,245,150,c.green)+sheet(1150,595,245,150,c.green)+
 text(245,700,'SOURCE LINES')+text(696,795,'RETRIEVE · TRACE')+text(1145,800,'CHECK THE CLAIM',c.green));
let pages='';for(let i=0;i<5;i++)pages+=path(`M780 ${670-i*11}Q620 ${590-i*11} 390 ${645-i*13}V${375-i*13}Q620 ${320-i*8} 780 ${425-i*7}Q950 ${325-i*8} 1190 ${375-i*13}V${645-i*13}Q950 ${590-i*11} 780 ${670-i*11}Z`,i===4?'#162b42':'#0d1b2c',i===4?c.cyan:'#34506b',2);
scenes.memorable=frame('A page becomes a memory','02',c.cyan,pages+line(780,400,780,670,c.cyan,3)+piece('L',685,185,c.cyan,40)+piece('S',1070,245,c.purple,36)+path('M800 360Q790 250 840 190M940 360Q1050 375 1120 310','none','#648baf',2,'stroke-dasharray="6 10"')+text(550,785,'READ → REMEMBER → REUSE',c.cyan,20));
let thermo=path('M340 550 840 300 1270 515 770 765Z','url(#metal)',c.green,2)+path('M340 550v40l430 215 500-250v-40L770 765Z','#0b1725','#35516a',2);
for(let i=0;i<6;i++)thermo+=line(425+i*70,550+i*35,820+i*35,350+i*17.5,'#31546a',2);
thermo+=piece('T',730,395,c.green,45)+path('M1070 440V270a22 22 0 0 0-44 0v170a42 42 0 1 0 44 0Z','#102333',c.cyan,3)+line(1048,305,1048,465,c.amber,9)+ellipse(1048,472,20,20,c.amber,c.amber)+path('M485 445v-155m-12 18 12-18 12 18','none',c.green,3)+ellipse(485,265,70,27,'none',c.green)+ellipse(485,265,110,45,'none','#365b62')+text(510,865,'SENSE · TRANSMIT · RESPOND',c.green,20);
scenes.thermosense=frame('Turn temperature into a signal','03',c.green,thermo);
let kanban='';for(let i=0;i<3;i++){const x=280+i*350;kanban+=path(`M${x} 275l250-45v430l-250 45Z`,'url(#metal)','#456079',2)+line(x+25,330,x+220,295,[c.purple,c.amber,c.green][i],4);for(let j=0;j<3-i;j++)kanban+=piece(['S','L','T'][i],x+110,410+j*100,[c.purple,c.amber,c.green][i],27);}
kanban+=path('M580 740Q850 820 1170 700m-22-3 22 3-9 22','none',c.amber,3)+text(315,205,'TO DO',c.purple)+text(665,205,'IN MOTION',c.amber)+text(1015,205,'DONE',c.green);
scenes.kanban=frame('Make the next move visible','04',c.amber,kanban);
let finance=path('M270 730h1110M270 730V270','none','#40546b',2);const heights=[110,160,125,215,190,280,345,310];heights.forEach((h,i)=>{finance+=cube(355+i*125,695-h,39,h,i%3===2?c.purple:c.cyan);});finance+=path('M345 550 465 495 590 540 720 395 845 430 970 325 1095 245 1230 290','none',c.amber,5);heights.forEach((h,i)=>{finance+=line(355+i*125,745,355+i*125,758,'#58708b',2)});finance+=text(390,845,'COMPARE THE SIGNAL. WEIGH THE RISK.',c.cyan,20);
scenes.finance=frame('Decisions beyond the numbers','05',c.cyan,finance);
let wildlife=path('M270 670 750 430 1330 650 830 870Z','url(#metal)','#36556a',2)+ellipse(815,690,220,77,'none','#447b7d');
// A low-poly field subject and a four-rotor survey craft: distinct from generic block art.
wildlife+=path('M640 540 825 510 880 565 710 610Z','#35576b',c.green,2)+path('M825 510 855 420 925 405 955 440 880 565Z','#416f7c',c.green,2)+path('M855 420 838 340 865 386 882 340 892 412','none',c.green,5)+path('M685 589 665 710m72-108 18 118m83-151 22 103','none',c.green,12)+line(642,552,605,522,c.green,6);
wildlife+=line(660,265,990,390,c.cyan,9)+line(690,400,960,255,c.cyan,9)+cube(825,302,55,23,c.cyan);[[660,265],[990,390],[690,400],[960,255]].forEach(([x,y])=>{wildlife+=ellipse(x,y,65,25,'#102034',c.cyan)});wildlife+=path('M780 385 670 650M880 400l110 290','none','#4b90a1',2,'stroke-dasharray="7 12"')+text(500,920,'OBSERVE WITHOUT DISTURBING',c.green,18);
scenes.wildlife=frame('A quieter view of the wild','06',c.green,wildlife);
let cad=line(790,200,790,830,'#54667f',2,'stroke-dasharray="8 10"');for(const [y,col] of [[750,c.cyan],[585,c.purple],[415,c.amber]]){cad+=path(`M${790-120} ${y-30}l120-60 120 60v45l-120 60-120-60Z`,'url(#metal)',col,2)+path(`M670 ${y-30}l120 60 120-60M790 ${y+30}v45`,'none',col,2)+ellipse(790,y-30,44,20,'#070c16',col);}
cad+=path('M760 255v335l30 15 30-15V255Z','#335471',c.cyan,2);for(let j=0;j<10;j++)cad+=path(`M761 ${430+j*15}l29 15 29-15`,'none','#81a6be',2);cad+=cube(790,195,95,48,c.amber)+line(1050,225,1050,795,'#617790',2)+line(1030,225,1070,225,c.amber,3)+line(1030,795,1070,795,c.cyan,3)+text(1100,525,'FIT',c.amber,26)+text(430,900,'EVERY SURFACE HAS A PURPOSE',c.cyan,20);
scenes.cad=frame('Precision in every connection','07',c.cyan,cad);
for(const [name,svg] of Object.entries(scenes)){writeFileSync(new URL(name+'.svg',out),svg);console.log(name,Buffer.byteLength(svg));}
