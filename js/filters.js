(function(){
 "use strict";
 const state={primary:"all",colors:new Set(),rarities:new Set(),types:new Set(),costs:new Set(),query:"",tags:new Set(),tagMode:"and"};
 function statusOf(card,pair){return window.FRA_TAGS.getCardState(pair,card.collector_number).status}
 function match(card,pair){
   const U=window.FRA_UTILS,T=window.FRA_TAGS,status=statusOf(card,pair);
   if(state.primary==="threat"&&status!=="threat")return false;
   if(state.primary==="nonthreat"&&status!=="nonthreat")return false;
   if(state.colors.size&&!state.colors.has(U.colorBucket(card,pair)))return false;
   if(state.rarities.size&&!state.rarities.has(card.rarity))return false;
   const type=U.isCreature(card)?"creature":"noncreature";if(state.types.size&&!state.types.has(type))return false;
   const mv=U.manaValue(card.mana_cost),costBucket=mv>=6?"6+":String(mv);if(state.costs.size&&!state.costs.has(costBucket))return false;
   const tags=T.getCardState(pair,card.collector_number).tags||[];
   if(state.tags.size){const chosen=[...state.tags],ok=state.tagMode==="or"?chosen.some(x=>tags.includes(x)):chosen.every(x=>tags.includes(x));if(!ok)return false}
   const q=state.query.trim().toLowerCase();
   if(q){const hay=[card.name_cn,card.name_en,card.text_cn,card.text_en,...tags].filter(Boolean).join("\n").toLowerCase();if(!hay.includes(q))return false}
   return true;
 }
 function bind(root,onChange){
   root.querySelectorAll("[data-primary]").forEach(btn=>btn.addEventListener("click",()=>{state.primary=btn.dataset.primary;root.querySelectorAll("[data-primary]").forEach(x=>x.classList.toggle("active",x===btn));onChange()}));
   root.querySelectorAll("[data-filter-group]").forEach(btn=>btn.addEventListener("click",()=>{const set=state[btn.dataset.filterGroup],value=btn.dataset.value;if(!set)return;set.has(value)?set.delete(value):set.add(value);btn.classList.toggle("active",set.has(value));onChange()}));
   const q=root.querySelector("[data-search]");if(q)q.addEventListener("input",()=>{state.query=q.value;onChange()});
   const clear=root.querySelector("[data-clear-secondary]");if(clear)clear.addEventListener("click",()=>{state.colors.clear();state.rarities.clear();state.types.clear();state.costs.clear();state.tags.clear();state.query="";root.querySelectorAll("[data-filter-group]").forEach(x=>x.classList.remove("active"));root.querySelectorAll("[data-tag-filter]").forEach(x=>x.classList.remove("active"));if(q)q.value="";onChange()});
 }
 window.FRA_FILTERS={state,match,bind};
})();
