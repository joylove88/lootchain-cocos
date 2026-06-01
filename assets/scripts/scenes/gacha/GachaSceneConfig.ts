import { Color } from 'cc';

export type GachaRarity = 'R' | 'SR' | 'SSR' | 'UR';

export interface GachaPreviewPool {
  id: string;
  title: string;
  subline: string;
  rarity: GachaRarity;
  active: boolean;
  locked: boolean;
}

export interface GachaPreviewCard {
  name: string;
  title: string;
  rarity: GachaRarity;
  stars: number;
  scale: number;
}

export interface GachaMockResultItem extends GachaPreviewCard {
  kind: 'hero' | 'shard' | 'material';
  featured: boolean;
}

export interface GachaActionItem {
  key: string;
  label: string;
  note: string;
}

export interface GachaRarityTone {
  fill: Color;
  stroke: Color;
  glow: Color;
  text: Color;
}

export const GACHA_BACKGROUND_ASSET = 'ui/gacha/gacha_bg_cathedral/spriteFrame';
export const GACHA_ABYSS_SPINE_RESOURCE = 'spine/gacha/huangfengjiaozong/huangfengjiaozong';
export const GACHA_ABYSS_SPINE_UUID = 'ef87498c-2ef4-44e6-bee9-2d499e6ac570';
export const GACHA_ABYSS_SPINE_SKIN = 'default';
export const GACHA_ABYSS_SPINE_INTRO_ANIMATION = 'idle';
export const GACHA_ABYSS_SPINE_IDLE_ANIMATION = 'idle';
export const GACHA_ABYSS_FALLBACK_SPINE_RESOURCE = 'spine/gacha/Lord of the Dark Abyss/1605';
export const GACHA_ABYSS_FALLBACK_SPINE_UUID = 'ce6aee72-45cb-4315-abfd-74ac40b8d0ce';
export const GACHA_ABYSS_FALLBACK_SPINE_SKIN = 'default';
export const GACHA_ABYSS_FALLBACK_SPINE_INTRO_ANIMATION = 'appear';
export const GACHA_ABYSS_FALLBACK_SPINE_IDLE_ANIMATION = 'idle';

// 当前为抽奖系统视觉预览配置，所有数据都只在客户端展示，不代表真实卡池概率或奖励。
export const GACHA_PREVIEW_POOLS: GachaPreviewPool[] = [
  { id: 'limited', title: '暗渊之主', subline: '限定召唤预览', rarity: 'SSR', active: true, locked: false },
  { id: 'hero', title: '永夜祭司', subline: '英雄召唤预览', rarity: 'SR', active: false, locked: false },
  { id: 'normal', title: '亡语者', subline: '普通召唤预览', rarity: 'R', active: false, locked: false },
  { id: 'sealed', title: '光暗召唤', subline: '后续章节解锁', rarity: 'UR', active: false, locked: true },
];

export const GACHA_PREVIEW_CARDS: GachaPreviewCard[] = [
  { name: '亡语者', title: '格雷夫', rarity: 'R', stars: 2, scale: 0.72 },
  { name: '月蚀之影', title: '莱奥娜', rarity: 'SR', stars: 4, scale: 0.86 },
  { name: '暗渊之主', title: '维洛斯', rarity: 'SSR', stars: 6, scale: 1 },
  { name: '永夜祭司', title: '艾莉西亚', rarity: 'SR', stars: 4, scale: 0.86 },
  { name: '荒野狂战', title: '克莱恩', rarity: 'R', stars: 2, scale: 0.72 },
];

// 本地 mock 结果只用于前端验收动效，不代表真实抽卡结果，不写入后端。
export const GACHA_MOCK_RESULT_ONCE: GachaMockResultItem[] = [
  { name: '暗渊之主', title: '维洛斯', rarity: 'SSR', stars: 6, scale: 1, kind: 'hero', featured: true },
];

export const GACHA_MOCK_RESULT_TEN: GachaMockResultItem[] = [
  { name: '亡语者', title: '格雷夫', rarity: 'R', stars: 2, scale: 0.72, kind: 'hero', featured: false },
  { name: '荒野狂战', title: '克莱恩', rarity: 'R', stars: 2, scale: 0.72, kind: 'hero', featured: false },
  { name: '月蚀之影', title: '莱奥娜', rarity: 'SR', stars: 4, scale: 0.86, kind: 'hero', featured: false },
  { name: '古堡密钥', title: '突破材料', rarity: 'R', stars: 2, scale: 0.72, kind: 'material', featured: false },
  { name: '暗渊之主', title: '维洛斯', rarity: 'SSR', stars: 6, scale: 1, kind: 'hero', featured: true },
  { name: '永夜祭司', title: '艾莉西亚', rarity: 'SR', stars: 4, scale: 0.86, kind: 'hero', featured: false },
  { name: '月蚀碎片', title: '英雄碎片', rarity: 'SR', stars: 4, scale: 0.86, kind: 'shard', featured: false },
  { name: '荒野狂战', title: '克莱恩', rarity: 'R', stars: 2, scale: 0.72, kind: 'hero', featured: false },
  { name: '亡语者', title: '格雷夫', rarity: 'R', stars: 2, scale: 0.72, kind: 'hero', featured: false },
  { name: '星陨余烬', title: '召唤材料', rarity: 'SR', stars: 4, scale: 0.86, kind: 'material', featured: false },
];

export const GACHA_RIGHT_ACTIONS: GachaActionItem[] = [
  { key: 'rate', label: '概率', note: '概率页将读取后端卡池配置，只展示规则，不写入资源。' },
  { key: 'record', label: '记录', note: '召唤记录将只读展示历史结果，不能补发或重抽。' },
  { key: 'exchange', label: '兑换', note: '召唤积分兑换属于经济写入，当前阶段保持关闭。' },
  { key: 'guarantee', label: '保底', note: '保底进度只做只读展示，真实计数只能由后端事务更新。' },
];

export function gachaRarityTone(rarity: GachaRarity): GachaRarityTone {
  if (rarity === 'UR') {
    return {
      fill: new Color(38, 8, 9, 222),
      stroke: new Color(234, 81, 50, 235),
      glow: new Color(255, 84, 53, 120),
      text: new Color(255, 191, 118, 255),
    };
  }
  if (rarity === 'SSR') {
    return {
      fill: new Color(42, 29, 8, 226),
      stroke: new Color(247, 202, 91, 245),
      glow: new Color(255, 213, 111, 140),
      text: new Color(255, 224, 147, 255),
    };
  }
  if (rarity === 'SR') {
    return {
      fill: new Color(29, 13, 43, 222),
      stroke: new Color(198, 91, 232, 230),
      glow: new Color(190, 82, 236, 105),
      text: new Color(233, 176, 255, 255),
    };
  }
  return {
    fill: new Color(9, 21, 38, 218),
    stroke: new Color(91, 158, 226, 220),
    glow: new Color(91, 159, 229, 92),
    text: new Color(163, 208, 255, 255),
  };
}
