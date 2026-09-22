(function(){
 "use strict";
 function distribution(cards,predicate){
  const bins=[0,0,0,0,0,0,0];
  cards.filter(predicate||(()=>true)).forEach(c=>{
   const mv=window.FRA_UTILS.manaValue(c.mana_cost);
   bins[Math.min(mv,6)]++;
  });
  return bins;
 }
 function draw(el,bins,label){
  if(!el)return;
  const max=Math.max(1,...bins);
  el.innerHTML=bins.map((n,i)=>`<div class="barwrap"><b>${n}</b><div class="bar" style="height:${Math.max(2,n/max*126)}px"></div><small>${i===6?"6+":i}</small></div>`).join("");
  el.setAttribute("aria-label",label||"费用曲线");
 }
 function statusCounts(pair,cards){
  const out={threat:0,nonthreat:0,unclassified:0};
  cards.forEach(c=>{
   const state=window.FRA_TAGS.getCardState(pair,c.collector_number);
   const status=state&&state.status;
   if(status==="threat")out.threat++;
   else if(status==="nonthreat")out.nonthreat++;
   else out.unclassified++;
  });
  return out;
 }
 function drawStatusSummary(pair,cards){
  const charts=document.querySelector(".charts");
  if(!charts)return;
  let box=document.querySelector("#statusSummaryBox");
  if(!box){
   box=document.createElement("div");
   box.className="chartbox";
   box.id="statusSummaryBox";
   box.style.gridColumn="1 / -1";
   charts.appendChild(box);
  }
  const n=statusCounts(pair,cards);
  const total=cards.length||1;
  const item=(label,value,kind)=>`<div style="flex:1;min-width:150px;padding:18px 20px;border:1px solid #ffffff16;border-radius:14px;background:#081522"><div style="font-size:13px;color:#94a9be;margin-bottom:7px">${label}</div><div style="font-size:34px;font-weight:900;line-height:1">${value}</div><div style="height:5px;border-radius:999px;background:#ffffff10;margin-top:14px;overflow:hidden"><div style="height:100%;width:${(value/total*100).toFixed(1)}%;background:${kind==='threat'?'#d86b82':kind==='nonthreat'?'#79bde8':'#6f8294'}"></div></div></div>`;
  box.innerHTML=`<h3>威胁 / 非威胁数量</h3><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">${item('威胁',n.threat,'threat')}${item('非威胁',n.nonthreat,'nonthreat')}${item('未分类',n.unclassified,'unclassified')}</div>`;
  box.setAttribute("aria-label",`威胁 ${n.threat} 张，非威胁 ${n.nonthreat} 张，未分类 ${n.unclassified} 张`);
 }
 function render(pair,cards){
  draw(document.querySelector("#creatureCurve"),distribution(cards,c=>window.FRA_UTILS.isCreature(c)),"生物费用曲线");
  draw(document.querySelector("#threatCurve"),distribution(cards,c=>window.FRA_TAGS.getCardState(pair,c.collector_number).status==="threat"),"威胁牌费用分布");
  drawStatusSummary(pair,cards);
 }
 window.FRA_CHARTS={distribution,draw,statusCounts,drawStatusSummary,render};
})();
