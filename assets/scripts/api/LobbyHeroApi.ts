import { HttpClient } from '../net/HttpClient';
import type { LobbyHeroFilterOptionsVO, LobbyHeroItemVO } from '../types/LobbyHeroTypes';

type UnknownRecord = Record<string, unknown>;

const MAX_HERO_COUNT = 80;
const MAX_TEXT_LENGTH = 96;
const HERO_ASSET_FALLBACKS: Record<string, { portraitAsset: string; spineAsset: string }> = {
  // 只读展示兜底：当前公司/家里本地服务未重启时，英雄列表可能暂时不带资源字段。
  R_PATROL_01: { portraitAsset: 'act_1001', spineAsset: 'npc_1001' },
};
const HERO_CLASS_FALLBACKS: Record<string, string> = {
  PROTAGONIST_MALE_ATTACK: '战士',
  PROTAGONIST_FEMALE_ATTACK: '战士',
  R_PATROL_01: '战士',
  R_ACOLY_02: '辅助',
  R_SCOUT_03: '刺客',
  R_MILITIA_04: '战士',
  R_CULT_05: '法师',
  R_RANGER_06: '射手',
  R_GUARD_07: '坦克',
  R_HERB_08: '辅助',
  R_THUG_09: '战士',
  R_WOLF_10: '刺客',
  SR_PRIEST_01: '辅助',
  SR_PALADIN_02: '坦克',
  SR_WITCH_03: '法师',
  SR_BLADE_04: '战士',
  SR_SNIPER_05: '射手',
  SR_ABYSS_06: '刺客',
  SR_TEMPLAR_07: '战士',
  SR_CHAIN_08: '坦克',
  SSR_LIVIA: '法师',
  SSR_KANE: '坦克',
  SSR_MICHAEL: '战士',
  SSR_DRACULA: '战士',
  SSR_RON: '刺客',
  UR_ARTHAS: '战士',
  UR_EVELYN: '法师',
  UR_SERAPHINA: '辅助',
  UR_NYX: '刺客',
  UR_AURELIA: '射手',
  UR_ATLAS: '坦克',
};

/** 大厅英雄只读 API；只读取大厅门面，不调用带养成写入口的英雄 Controller。 */
export class LobbyHeroApi {
  constructor(private readonly http: HttpClient) {}

  lobbyHeroes(): Promise<LobbyHeroItemVO[]> {
    // 英雄队列当前只用于验证主角入库和置顶展示，不提供升级、升星、觉醒或洗练动作。
    return this.http.get<unknown>('/api/player/lobby/heroes').then(validateLobbyHeroes);
  }

  lobbyHeroFilterOptions(): Promise<LobbyHeroFilterOptionsVO> {
    return this.http.get<unknown>('/api/player/lobby/heroes/filter-options').then(validateHeroFilterOptions);
  }
}

function validateLobbyHeroes(data: unknown): LobbyHeroItemVO[] {
  if (!Array.isArray(data)) {
    throw new Error('大厅英雄响应格式错误：data 不是数组');
  }
  if (data.length > MAX_HERO_COUNT) {
    throw new Error('大厅英雄响应格式错误：英雄数量超过上限');
  }
  return data
    .map((item, index) => normalizeHeroItem(item, index))
    .filter((item): item is LobbyHeroItemVO => item !== null)
    .sort((a, b) => Number(b.protagonist) - Number(a.protagonist) || b.power - a.power);
}

function normalizeHeroItem(item: unknown, index: number): LobbyHeroItemVO | null {
  if (!isRecord(item)) {
    throw new Error(`大厅英雄响应格式错误：第 ${index + 1} 项不是对象`);
  }
  const heroCode = readText(item, 'heroCode', MAX_TEXT_LENGTH, `hero-${index + 1}`);
  const rarity = readText(item, 'rarity', 16, 'R');
  // 未开放稀有度前端再做一层过滤，避免服务端配置漂移导致大厅露出。
  if (rarity.toUpperCase() === 'EX' || heroCode.toUpperCase().startsWith('EX_')) {
    return null;
  }
  const id = readInteger(item.id, 0, Number.MAX_SAFE_INTEGER);
  if (id <= 0) {
    // 英雄队列只展示可用于编队/战斗的已拥有英雄，避免 UI 显示 id=0 但开战时被过滤。
    return null;
  }
  const fallbackAssets = resolveHeroAssetFallback(heroCode);
  const fallbackHeroClass = resolveHeroClassFallback(heroCode);
  const portraitAsset = readOptionalText(item, 'portraitAsset', 64) ?? fallbackAssets?.portraitAsset ?? null;
  const spineAsset = readOptionalText(item, 'spineAsset', 128) ?? deriveSpineAssetFromPortrait(portraitAsset) ?? fallbackAssets?.spineAsset ?? null;
  const spineUuid = readOptionalText(item, 'spineUuid', 64);
  return {
    id,
    heroCode,
    heroName: readText(item, 'heroName', MAX_TEXT_LENGTH, '未命名英雄'),
    rarity,
    faction: readOptionalText(item, 'faction', 64),
    heroClass: readOptionalText(item, 'heroClass', 32) ?? fallbackHeroClass,
    level: readInteger(item.level, 1, 999),
    star: readInteger(item.star, 0, 99),
    power: readInteger(item.power, 0, Number.MAX_SAFE_INTEGER),
    protagonist: item.protagonist === true,
    sourceType: readText(item, 'sourceType', 32, ''),
    portraitAsset,
    spineAsset,
    spineUuid,
    currentForm: readOptionalText(item, 'currentForm', 32),
    formLabel: readOptionalText(item, 'formLabel', 32),
  };
}

function validateHeroFilterOptions(data: unknown): LobbyHeroFilterOptionsVO {
  if (!isRecord(data)) {
    throw new Error('invalid lobby hero filter options response');
  }
  const rawClasses = Array.isArray(data.heroClasses) ? data.heroClasses : [];
  const heroClasses = rawClasses
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item, index, list) => item.length > 0 && item.length <= 32 && list.indexOf(item) === index)
    .slice(0, 16);
  return { heroClasses };
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(record: UnknownRecord, key: string, maxLength: number, fallback: string): string {
  const value = record[key];
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function readOptionalText(record: UnknownRecord, key: string, maxLength: number): string | null {
  const value = record[key];
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function deriveSpineAssetFromPortrait(portraitAsset: string | null): string | null {
  const normalized = (portraitAsset ?? '').replace(/\.(png|jpg|jpeg|webp)$/i, '').trim();
  if (!/^act_[A-Za-z0-9_-]+$/i.test(normalized)) {
    return null;
  }
  return normalized.replace(/^act/i, 'npc').slice(0, 128);
}

function resolveHeroAssetFallback(heroCode: string): { portraitAsset: string; spineAsset: string } | null {
  return HERO_ASSET_FALLBACKS[heroCode.trim().toUpperCase()] ?? null;
}

function resolveHeroClassFallback(heroCode: string): string | null {
  return HERO_CLASS_FALLBACKS[heroCode.trim().toUpperCase()] ?? null;
}

function readInteger(value: unknown, min: number, max: number): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.trunc(numeric)));
}
