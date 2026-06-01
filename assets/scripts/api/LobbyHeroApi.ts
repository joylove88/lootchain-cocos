import { HttpClient } from '../net/HttpClient';
import type { LobbyHeroItemVO } from '../types/LobbyHeroTypes';

type UnknownRecord = Record<string, unknown>;

const MAX_HERO_COUNT = 80;
const MAX_TEXT_LENGTH = 96;

/** 大厅英雄只读 API；只读取大厅门面，不调用带养成写入口的英雄 Controller。 */
export class LobbyHeroApi {
  constructor(private readonly http: HttpClient) {}

  lobbyHeroes(): Promise<LobbyHeroItemVO[]> {
    // 英雄队列当前只用于验证主角入库和置顶展示，不提供升级、升星、觉醒或洗练动作。
    return this.http.get<unknown>('/api/player/lobby/heroes').then(validateLobbyHeroes);
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
  return {
    id,
    heroCode,
    heroName: readText(item, 'heroName', MAX_TEXT_LENGTH, '未命名英雄'),
    rarity,
    level: readInteger(item.level, 1, 999),
    star: readInteger(item.star, 0, 99),
    power: readInteger(item.power, 0, Number.MAX_SAFE_INTEGER),
    protagonist: item.protagonist === true,
    sourceType: readText(item, 'sourceType', 32, ''),
    portraitAsset: readOptionalText(item, 'portraitAsset', 64),
    spineAsset: readOptionalText(item, 'spineAsset', 128),
    currentForm: readOptionalText(item, 'currentForm', 32),
    formLabel: readOptionalText(item, 'formLabel', 32),
  };
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

function readInteger(value: unknown, min: number, max: number): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.trunc(numeric)));
}
