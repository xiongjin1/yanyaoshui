import{addDays,formatDate,parseDate,postoperativeDay,scheduleForDate,GLASS_START}from'./schedule.js';
const $=id=>document.getElementById(id),weekdays=['周日','周一','周二','周三','周四','周五','周六'];
const today=formatDate(new Date());let selected=today,done=[];
const displayDate=key=>{const d=parseDate(key);return`${d.getMonth()+1} 月 ${d.getDate()} 日 ${weekdays[d.getDay()]}`};
const minute=time=>{const[h,m]=time.split(':').map(Number);return h*60+m};
const saved=()=>{try{return JSON.parse(localStorage.getItem(`eye-drops:${selected}`))||[]}catch{return[]}};
const replacements=[{date:'2026-09-01',tube:2},{date:'2026-09-08',tube:3}];
const confirmedReplacements=()=>{try{return JSON.parse(localStorage.getItem('eye-drops:replacements'))||[]}catch{return[]}};

function render(){
  done=saved();const doses=scheduleForDate(selected),completed=done.filter(id=>doses.some(d=>d.id===id));
  const now=new Date(),nowMinute=now.getHours()*60+now.getMinutes();
  const next=selected===today?doses.find(d=>!done.includes(d.id)&&minute(d.time)>=nowMinute):doses.find(d=>!done.includes(d.id));
  $('dayBadge').textContent=postoperativeDay(selected)>0?`术后第 ${postoperativeDay(selected)} 天`:'';
  $('dateTitle').textContent=selected===today?'今天':displayDate(selected);$('dateSubtitle').textContent=selected===today?displayDate(selected):'点此返回今天';
  $('heroDate').textContent=displayDate(selected);$('nextDose').textContent=next?`下一次 ${next.time}`:doses.length?'今天已完成':'当天无计划';
  $('nextDetail').textContent=next?`${next.shortName} · ${next.detail.split('；')[0]}`:'完成情况只保存在这台手机上';$('progressCount').textContent=`${completed.length}/${doses.length}`;
  const replacement=replacements.find(item=>item.date<=selected&&!confirmedReplacements().includes(item.date));
  const replacementAlert=replacement?`<div class="alert replacement">🔄 <span><strong>${selected===replacement.date?'今天':'待完成'}：更换第 ${replacement.tube} 支速高捷</strong><br>上一支已使用一周，请换用新的一支。<button class="replacement-button" data-replacement="${replacement.date}">✓ 已更换</button></span></div>`:'';
  $('alerts').innerHTML=replacementAlert+(selected>=GLASS_START&&selected<='2026-09-03'?'<div class="alert">💡 <span><strong>思然已用完：</strong>按教材改用玻璃酸钠滴眼液，每天 4 次。</span></div>':'')+(selected>='2026-09-05'?'<div class="alert rose">⚠️ <span><strong>贝特舒需确认：</strong>教材只写“使用 ≥20 天”。9 月 6 日满 20 天，之后请按医生个体医嘱，不要根据本网页自行停药。</span></div>':'');
  const groups=doses.reduce((all,dose)=>((all[dose.slot]??=[]).push(dose),all),{});$('schedule').innerHTML=Object.entries(groups).map(([slot,items])=>`<article class="slot-card"><div class="slot-time"><strong>${items[0].time}</strong><small>${slot}</small></div><div>${items.map(dose=>`<label class="dose ${done.includes(dose.id)?'done':''}"><input type="checkbox" data-id="${dose.id}" ${done.includes(dose.id)?'checked':''} aria-label="${dose.time} ${dose.shortName}完成"><span class="dose-main"><img class="drug-image" src="./images/${dose.image}" alt="${dose.shortName}包装小图" data-name="${dose.shortName}"><span class="dose-copy"><strong>${dose.shortName}</strong><small>${dose.detail}</small></span></span><span class="dose-time">${dose.time}</span></label>`).join('')}</div></article>`).join('')||'<div class="slot-card empty">当天没有可由教材确定的用药安排。</div>';
  $('planHint').hidden=!doses.length;$('clearDone').hidden=!completed.length;
  document.querySelectorAll('input[data-id]').forEach(box=>box.addEventListener('change',()=>{const set=new Set(done);box.checked?set.add(box.dataset.id):set.delete(box.dataset.id);localStorage.setItem(`eye-drops:${selected}`,JSON.stringify([...set]));render()}));
  document.querySelectorAll('[data-replacement]').forEach(button=>button.addEventListener('click',()=>{const set=new Set(confirmedReplacements());set.add(button.dataset.replacement);localStorage.setItem('eye-drops:replacements',JSON.stringify([...set]));render()}));
  document.querySelectorAll('.drug-image').forEach(img=>img.addEventListener('click',event=>{event.preventDefault();$('largeImage').src=img.src;$('largeImage').alt=img.alt;$('largeImageName').textContent=img.dataset.name;$('medicineDialog').showModal()}));
}

$('previousDay').onclick=()=>{selected=addDays(selected,-1);render()};$('nextDay').onclick=()=>{selected=addDays(selected,1);render()};$('todayButton').onclick=()=>{selected=today;render()};
$('clearDone').onclick=()=>{localStorage.removeItem(`eye-drops:${selected}`);render()};$('closeDialog').onclick=()=>$('medicineDialog').close();$('medicineDialog').onclick=e=>{if(e.target===$('medicineDialog'))e.currentTarget.close()};
render();setInterval(render,60000);if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
