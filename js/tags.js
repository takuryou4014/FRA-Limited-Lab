(function(){
 "use strict";
 const LEGACY_STATE_PREFIX="fra-limited-lab:v1:";
 const LEGACY_LIB_PREFIX="fra-limited-lab:tag-library:";
 const GLOBAL_TAGS_KEY="fra-limited-lab:global-card-tags:v1";
 const GLOBAL_STATUS_KEY="fra-limited-lab:global-card-status:v1";
 const GLOBAL_LIB_KEY="fra-limited-lab:global-tag-library:v1";
 const OLD_PAIR_STATE_PREFIX="fra-limited-lab:pair-state:v1:";
 const MIGRATION_KEY="fra-limited-lab:global-status-migrated:v2";
 const BASELINE_KEY="fra-limited-lab:baseline-version";
 const BASELINE_VERSION="0.3-beta2-20260923";
 const DEFAULT_TAGS=["刺探/占卜","聚能杰斯","回血","非战斗伤害","门槛","ramp","去除","trick","资源","反击咒语","飞行","警戒","延势","死触","系命","践踏","威慑","手牌干扰","磨牌","灵技","滤牌","坟场利用","+1+1指示物","辟邪","不灭","武具","牺牲","扫场","珍宝","群体膨胀","导师","反击","循环","特殊胜利","穿透","学员token","横置","咒语复制","地落","回收","水槽","云移","非生物税","连击","铺场","非生物去除","先攻","敏捷"];
 const PAIRS=["WU","UB","BR","RG","GW","WB","BG","GU","UR","RW"];
 function uniq(a){return Array.from(new Set((a||[]).map(x=>String(x).trim()).filter(Boolean)))}
 function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||"null");return v==null?fallback:v}catch(e){return fallback}}
 function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
 function defaults(id){const g=((((window.FRA_DEFAULT_RATINGS||{}).GLOBAL||{}).cards)||{})[String(id)]||{};return {status:g.status||"unclassified",tags:Array.isArray(g.tags)?g.tags.slice():[]}}
 function loadTags(){const v=read(GLOBAL_TAGS_KEY,{});return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}
 function saveTags(v){write(GLOBAL_TAGS_KEY,v)}
 function loadStatuses(){const v=read(GLOBAL_STATUS_KEY,{});return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}
 function saveStatuses(v){write(GLOBAL_STATUS_KEY,v)}
 function migrate(){
   if(localStorage.getItem(MIGRATION_KEY)==="1")return;
   const tags=loadTags(), statuses=loadStatuses(); let lib=read(GLOBAL_LIB_KEY,null);
   // Prefer existing WU edits, then fill missing values from other old pair stores.
   PAIRS.forEach(pair=>{
     const legacy=read(LEGACY_STATE_PREFIX+pair,{}), oldPair=read(OLD_PAIR_STATE_PREFIX+pair,{});
     Object.entries(legacy||{}).forEach(([id,v])=>{
       if(v&&Array.isArray(v.tags)&&!Object.prototype.hasOwnProperty.call(tags,id))tags[id]=uniq(v.tags);
       if(v&&v.status&&!Object.prototype.hasOwnProperty.call(statuses,id))statuses[id]=v.status;
     });
     Object.entries(oldPair||{}).forEach(([id,status])=>{if(status&&!Object.prototype.hasOwnProperty.call(statuses,id))statuses[id]=status});
     if(!Array.isArray(lib)){const oldLib=read(LEGACY_LIB_PREFIX+pair,null);if(Array.isArray(oldLib))lib=uniq(oldLib)}
   });
   saveTags(tags);saveStatuses(statuses);write(GLOBAL_LIB_KEY,Array.isArray(lib)?uniq(lib):DEFAULT_TAGS.slice());
   try{localStorage.setItem(MIGRATION_KEY,"1")}catch(e){}
 }
 migrate();
 // v0.3 beta2 canonical initialization:
 // discard stale pre-beta overrides once, then let all later browser edits persist normally.
 try{
   if(localStorage.getItem(BASELINE_KEY)!==BASELINE_VERSION){
     localStorage.removeItem(GLOBAL_TAGS_KEY);
     localStorage.removeItem(GLOBAL_STATUS_KEY);
     localStorage.removeItem(GLOBAL_LIB_KEY);
     localStorage.setItem(BASELINE_KEY,BASELINE_VERSION);
   }
 }catch(e){}
 function getCardState(_pair,id){id=String(id);const base=defaults(id),tm=loadTags(),sm=loadStatuses();return {status:Object.prototype.hasOwnProperty.call(sm,id)?sm[id]:base.status,tags:Object.prototype.hasOwnProperty.call(tm,id)?uniq(tm[id]):uniq(base.tags)}}
 function setCardState(_pair,id,next){id=String(id);const tm=loadTags(),sm=loadStatuses();tm[id]=uniq(next.tags);sm[id]=next.status||"unclassified";saveTags(tm);saveStatuses(sm)}
 function setStatus(_pair,id,status){const sm=loadStatuses();sm[String(id)]=status||"unclassified";saveStatuses(sm)}
 function getLibrary(){const v=read(GLOBAL_LIB_KEY,null);return Array.isArray(v)?uniq(v):DEFAULT_TAGS.slice()}
 function setLibrary(_pair,tags){const v=uniq(tags);write(GLOBAL_LIB_KEY,v);return v}
 function addLibraryTag(pair,tag){const t=String(tag||"").trim();if(!t)return getLibrary();return setLibrary(pair,[...getLibrary(),t])}
 function addTag(pair,id,tag){const t=String(tag||"").trim();if(!t)return;const tm=loadTags(),key=String(id),base=defaults(key);const cur=Object.prototype.hasOwnProperty.call(tm,key)?uniq(tm[key]):uniq(base.tags);if(!cur.includes(t))cur.push(t);tm[key]=cur;saveTags(tm);addLibraryTag(pair,t)}
 function removeTag(_pair,id,tag){const tm=loadTags(),key=String(id),base=defaults(key);const cur=Object.prototype.hasOwnProperty.call(tm,key)?uniq(tm[key]):uniq(base.tags);tm[key]=cur.filter(x=>x!==tag);saveTags(tm)}
 function renameLibraryTag(pair,oldTag,newTag){oldTag=String(oldTag||"").trim();newTag=String(newTag||"").trim();if(!oldTag||!newTag||oldTag===newTag)return;setLibrary(pair,getLibrary().map(x=>x===oldTag?newTag:x));const tm=loadTags();Object.keys(tm).forEach(id=>tm[id]=uniq(tm[id].map(x=>x===oldTag?newTag:x)));saveTags(tm)}
 function deleteLibraryTag(pair,tag){setLibrary(pair,getLibrary().filter(x=>x!==tag));const tm=loadTags();Object.keys(tm).forEach(id=>tm[id]=uniq(tm[id]).filter(x=>x!==tag));saveTags(tm)}
 function resetLibrary(){try{localStorage.removeItem(GLOBAL_LIB_KEY)}catch(e){}return DEFAULT_TAGS.slice()}
 function resetPair(pair){
   // Restore defaults for cards belonging to this pair. Because status/tags are global,
   // shared cards are restored globally too, exactly matching the synchronized model.
   const ids=Object.keys(((((window.FRA_DEFAULT_RATINGS||{})[pair]||{}).cards)||{}));
   const tm=loadTags(),sm=loadStatuses();ids.forEach(id=>{delete tm[id];delete sm[id]});saveTags(tm);saveStatuses(sm)
 }
 function resetAll(){try{localStorage.removeItem(GLOBAL_TAGS_KEY);localStorage.removeItem(GLOBAL_STATUS_KEY)}catch(e){}}
 function exportBackup(){
   const cards=Array.isArray(window.FRA_CARDS)?window.FRA_CARDS:[], tm=loadTags(),sm=loadStatuses(),cardTags={},cardStatuses={};
   cards.forEach(card=>{const id=String(card.collector_number??card.number??card.id??"");if(!id)return;const b=defaults(id);cardTags[id]=Object.prototype.hasOwnProperty.call(tm,id)?uniq(tm[id]):uniq(b.tags);cardStatuses[id]=Object.prototype.hasOwnProperty.call(sm,id)?sm[id]:b.status});
   return {format:"FRA-Limited-Lab-global-tags",version:4,snapshot:"resolved",scope:"all-pairs",exportedAt:new Date().toISOString(),tagLibrary:getLibrary(),cardTags,cardStatuses};
 }
 function importBackup(_pair,payload){
   if(!payload||typeof payload!=="object")throw new Error("不是有效的 FRA Tag 备份文件");
   if(payload.format==="FRA-Limited-Lab-tags"&&payload.cards){const tm=loadTags(),sm=loadStatuses();Object.entries(payload.cards).forEach(([id,v])=>{tm[String(id)]=uniq(v&&v.tags);if(v&&v.status)sm[String(id)]=v.status});saveTags(tm);saveStatuses(sm);if(Array.isArray(payload.tagLibrary))setLibrary(null,payload.tagLibrary);return Object.keys(payload.cards).length}
   if(payload.format!=="FRA-Limited-Lab-global-tags"||!payload.cardTags)throw new Error("不是有效的 FRA 全站 Tag 备份文件");
   const tm={};Object.entries(payload.cardTags).forEach(([id,tags])=>tm[String(id)]=uniq(tags));saveTags(tm);
   const sm={};
   if(payload.cardStatuses&&typeof payload.cardStatuses==="object")Object.entries(payload.cardStatuses).forEach(([id,status])=>sm[String(id)]=status||"unclassified");
   else if(payload.pairStates&&typeof payload.pairStates==="object"){
     // v3 compatibility: merge pair-specific status into one global value; WU then pair order wins only for missing IDs.
     PAIRS.forEach(pair=>Object.entries(payload.pairStates[pair]||{}).forEach(([id,status])=>{if(!Object.prototype.hasOwnProperty.call(sm,id))sm[String(id)]=status||"unclassified"}));
   }
   saveStatuses(sm);if(Array.isArray(payload.tagLibrary))setLibrary(null,payload.tagLibrary);return Object.keys(tm).length;
 }
 window.FRA_TAGS={DEFAULT_TAGS,getCardState,setCardState,setStatus,addTag,removeTag,resetPair,resetAll,getLibrary,setLibrary,addLibraryTag,renameLibraryTag,deleteLibraryTag,resetLibrary,exportBackup,importBackup};
})();
