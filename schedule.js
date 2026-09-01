export const MEDICATION_START='2026-08-18',GLASS_START='2026-08-30',FINAL_DATE='2026-11-17';
const base={早:540,中:810,晚:1080,睡前:1350},order=['玻璃酸钠','露达舒','环孢素','贝特舒','速高捷'];
const range=(date,start,end)=>date>=start&&date<=end;
export const formatDate=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const parseDate=key=>{const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d,12)};
export const addDays=(key,n)=>{const date=parseDate(key);date.setDate(date.getDate()+n);return formatDate(date)};
export const postoperativeDay=date=>Math.round((parseDate(date)-parseDate(MEDICATION_START))/86400000)+1;

export function scheduleForDate(date){
  if(!range(date,MEDICATION_START,FINAL_DATE))return[];
  const doses=[];
  const add=(shortName,medicine,slot,detail,image)=>doses.push({shortName,medicine,slot,detail,image});
  if(range(date,GLASS_START,FINAL_DATE))for(const slot of ['早','中','晚','睡前'])add('玻璃酸钠','玻璃酸钠滴眼液',slot,'双眼各 1 滴；当天 1 支，单支有效 24 小时','hyaluronate.png');
  if(range(date,'2026-08-21','2026-08-30'))for(const slot of ['早','中','晚'])add('露达舒','露达舒',slot,'双眼各 1 滴；使用前摇匀','lotemax.png');
  else if(range(date,'2026-08-31','2026-09-09'))for(const slot of ['早','晚'])add('露达舒','露达舒',slot,'双眼各 1 滴；使用前摇匀','lotemax.png');
  else if(range(date,'2026-09-10','2026-09-19'))add('露达舒','露达舒','早','双眼各 1 滴；使用前摇匀','lotemax.png');
  if(range(date,'2026-08-18','2026-10-17'))for(const slot of ['早','晚'])add('环孢素','环孢素滴眼液',slot,'双眼各 1 滴；当天 1 支','cyclosporine.png');
  if(range(date,'2026-08-18','2026-09-06'))for(const slot of ['早','晚'])add('贝特舒','贝特舒',slot,'双眼各 1 滴；教材只明确“使用 ≥20 天”','betoptic.png');
  if(range(date,'2026-08-24','2026-09-13'))add('速高捷','速高捷眼用凝胶','睡前','双眼使用；每周用完 1 支','sinuojie.png');
  return doses.sort((a,b)=>base[a.slot]-base[b.slot]||order.indexOf(a.shortName)-order.indexOf(b.shortName)).map((dose,index,all)=>{
    const minutes=base[dose.slot]+all.slice(0,index).filter(item=>item.slot===dose.slot).length*5;
    const time=`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
    return{...dose,time,id:`${date}-${time}-${dose.shortName}`};
  });
}
