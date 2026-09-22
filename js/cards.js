(function(){
 "use strict";
 const PAIRS={WU:["W","U"],UB:["U","B"],BR:["B","R"],RG:["R","G"],GW:["G","W"],WB:["W","B"],BG:["B","G"],GU:["G","U"],UR:["U","R"],RW:["R","W"]};
 const RARITY_LABEL={common:"C",uncommon:"U",rare:"R",mythic:"M"};
 function list(value){return String(value||"").split(/[,\s]+/).map(x=>x.trim().toUpperCase()).filter(Boolean)}
 function symbols(cost){return [...String(cost||"").matchAll(/\{([^}]+)\}/g)].map(m=>m[1].toUpperCase())}
 function pairColors(pair){return PAIRS[String(pair||"").toUpperCase()]||[]}
 function symbolPayable(sym,allowed){if(/^\d+$/.test(sym)||/^[XYZCS]$/.test(sym))return true;return sym.split("/").some(p=>/^\d+$/.test(p)||p==="P"||p==="C"||p==="S"||allowed.includes(p))}
 function faceCastable(cost,allowed){return symbols(cost).every(s=>symbolPayable(s,allowed))}
 function belongsToPair(card,pair){const allowed=pairColors(pair);if(allowed.length!==2)return false;const costs=String(card.mana_cost||"").split("//").map(x=>x.trim());const preparedCreature=isCreature(card)&&costs.length>1&&/备法/.test(String(card.text_cn||""));if(preparedCreature)return faceCastable(costs[0],allowed);return costs.some(face=>faceCastable(face,allowed))}
 function manaColors(cost){const out=new Set();symbols(cost).forEach(s=>s.split("/").forEach(p=>{if("WUBRG".includes(p)&&p.length===1)out.add(p)}));return [...out]}
 function isCreature(card){return /生物|Creature/i.test(String(card.type_cn||""))}
 function isLand(card){return /地|Land/i.test(String(card.type_cn||""))}
 function manaValue(cost){const face=String(cost||"").split("//")[0];let total=0;symbols(face).forEach(s=>{if(/^\d+$/.test(s))total+=+s;else if(/^[XYZ]$/i.test(s))total+=0;else{const m=s.match(/^(\d+)\//);total+=m?+m[1]:1}});return total}
 function colorBucket(card,pair){const [a,b]=pairColors(pair),cost=String(card.mana_cost||"").split("//")[0],seen=new Set(manaColors(cost));const ha=seen.has(a),hb=seen.has(b);if(ha&&hb)return pair;if(ha)return a;if(hb)return b;return "C"}
 function imagePath(card,depth){return (depth||"")+"assets/cards/"+String(card.collector_number)+".png"}
 window.FRA_UTILS={PAIRS,RARITY_LABEL,list,symbols,manaColors,pairColors,belongsToPair,isCreature,isLand,manaValue,colorBucket,imagePath};
})();
