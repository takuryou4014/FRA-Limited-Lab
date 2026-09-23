FRA Limited Lab v16
- 10 个双色页面全部启用同一套浏览/筛选/翻面/Tag 功能。
- Tag 按 collector_number 全站共享；威胁状态按色组独立。
- ratings.js 已为 1–290 数据库中的牌生成默认 Tag，WU 既有默认标注优先保留。
- 卡池按实际费用可支付路径判断混血/备法；地牌排除。
- assets/cards 保持空目录，请放入对应编号卡图。

v18 基础 Tag 重标：
- 重新扫描中央卡牌数据库，为全套牌生成保守的基础 Tag。
- Tag 默认值保存在 data/ratings.js 的 GLOBAL.cards；同一张牌在所有双色页面共享。
- 已有 localStorage 人工修改仍优先于默认值，不会被新版默认 Tag 覆盖。
- 没有符合现有 29 类 Tag 的牌允许保持空 Tag，避免为了“有 Tag”而误标。

v19 changes:
- Threat/non-threat status is now global by collector number, exactly like tags.
- Changing status in any color-pair page immediately affects the same card in every other pair.
- Default status is seeded from the supplied Excel H-column classification: 威胁/弱威胁 => threat; 去除/资源/trick/ramp/干扰/康/导师 => nonthreat; blank/？ => unclassified.
- Backup format v4 exports one global cardStatuses map. v3 backups remain importable.

v22: Floating card editor is constrained to the current card width so first/last-column cards never overflow. Existing Tag delete × controls are restored and emphasized while editing.


FRA Limited Lab v0.1
- 10 个色组页面的重复运行逻辑整合到 js/pair-page.js
- 保留重构前的色组背景、真实 Mana 图标与现有 UI
- 保留全站 Tag / 威胁状态 localStorage 逻辑
- 保留备法生物按主生物面决定色组归属的逻辑
- 修复备法渲染映射：Ancestral Craving / Molten Tide / Enroot
- 备法咒语类型可显式区分瞬间 / 法术

- 初始 Tag/威胁状态已替换为 2026-09-23 人工校准全局快照
- 初始 Tag 词库扩展为人工校准的 48 项
- 保留浏览器已有 localStorage 用户修改优先级；不会强行覆盖现有本地编辑
