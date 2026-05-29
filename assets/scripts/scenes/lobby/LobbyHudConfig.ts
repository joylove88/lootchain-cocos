import {
  LobbyActivityItemConfig,
  LobbyChallengeItemConfig,
  LobbyNavItemConfig,
  LobbySceneHotspotConfig,
  LobbySystemIconKey,
  rgba,
} from './LobbyHudTypes';

export const LOBBY_SYSTEM_ICONS: LobbySystemIconKey[] = ['friends', 'mail', 'settings', 'menu'];

export const LOBBY_ACTIVITY_ITEMS: LobbyActivityItemConfig[] = [
  { icon: 'event', title: '活动', subline: '21:47:56', hot: true },
  { icon: 'summon', title: '深渊召唤', subline: 'UP召唤中', hot: true },
  { icon: 'contract', title: '圣契之路', subline: '15天 21小时', hot: true },
  { icon: 'market', title: '黑市', subline: '刷新中', hot: false },
  { icon: 'gift', title: '首充礼包', subline: '暂未开放', hot: false },
];

export const LOBBY_SCENE_HOTSPOTS: LobbySceneHotspotConfig[] = [
  { label: '召唤祭坛', x: 0.172, y: 0.393, width: 136, hot: false, hitX: 0.167, hitY: 0.405, hitW: 0.09, hitH: 0.15 },
  { label: '公会', x: 0.302, y: 0.566, width: 112, hot: true, hitX: 0.302, hitY: 0.615, hitW: 0.105, hitH: 0.215 },
  { label: '排行榜', x: 0.493, y: 0.606, width: 122, hot: false, hitX: 0.496, hitY: 0.64, hitW: 0.1, hitH: 0.18 },
  { label: '旅者集会', x: 0.552, y: 0.492, width: 136, hot: true, hitX: 0.552, hitY: 0.462, hitW: 0.1, hitH: 0.135 },
  { label: '熔铸工坊', x: 0.388, y: 0.342, width: 136, hot: true, hitX: 0.39, hitY: 0.342, hitW: 0.105, hitH: 0.135 },
  { label: '深渊之门', x: 0.72, y: 0.635, width: 140, hot: true, hitX: 0.72, hitY: 0.592, hitW: 0.105, hitH: 0.235 },
  { label: '战役', x: 0.746, y: 0.372, width: 112, hot: true, hitX: 0.748, hitY: 0.355, hitW: 0.11, hitH: 0.135 },
  { label: '商店', x: 0.564, y: 0.274, width: 110, hot: true, hitX: 0.565, hitY: 0.255, hitW: 0.09, hitH: 0.1 },
];

export const LOBBY_CHALLENGE_ITEMS: LobbyChallengeItemConfig[] = [
  { title: '世界BOSS', subline: '挑战中', tint: rgba(100, 100, 100), hot: false },
  { title: '无尽深渊', subline: '120层', tint: rgba(47, 149, 133), hot: false },
  { title: '跨服竞技', subline: '赛季进行中', tint: rgba(173, 97, 55), hot: false },
  { title: '资源副本', subline: '今日双倍', tint: rgba(75, 129, 171), hot: false },
];

export const LOBBY_NAV_ITEMS: LobbyNavItemConfig[] = [
  { key: 'hero', label: '英雄', hot: false },
  { key: 'bag', label: '背包', hot: false },
  { key: 'contract', label: '圣契', hot: false },
  { key: 'codex', label: '图鉴', hot: true },
  { key: 'quest', label: '任务', hot: true },
  { key: 'forge', label: '锻造', hot: false },
  { key: 'shop', label: '商店', hot: true },
];
