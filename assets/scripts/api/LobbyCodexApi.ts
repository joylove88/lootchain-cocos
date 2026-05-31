import { HttpClient } from '../net/HttpClient';
import type { LobbyCodexItemVO } from '../types/LobbyCodexTypes';

type UnknownRecord = Record<string, unknown>;

const MAX_CODEX_COUNT = 96;
const MAX_TEXT_LENGTH = 96;

/** 大厅图鉴只读 API；只允许读取窄口径大厅门面，不能调用英雄养成 Controller。 */
export class LobbyCodexApi {
  constructor(private readonly http: HttpClient) {}

  lobbyCodex(): Promise<LobbyCodexItemVO[]> {
    // 大厅只读图鉴使用独立门面，避免前端直接依赖带养成写入口的英雄模块 Controller。
    return this.http.get<unknown>('/api/player/lobby/codex').then(validateLobbyCodex);
  }
}

function validateLobbyCodex(data: unknown): LobbyCodexItemVO[] {
  if (!Array.isArray(data)) {
    throw new Error('大厅图鉴响应格式错误：data 不是数组');
  }
  if (data.length > MAX_CODEX_COUNT) {
    throw new Error('大厅图鉴响应格式错误：图鉴数量超过上限');
  }
  return data
    .map((item, index) => normalizeCodexItem(item, index))
    .filter((item): item is LobbyCodexItemVO => item !== null);
}

function normalizeCodexItem(item: unknown, index: number): LobbyCodexItemVO | null {
  if (!isRecord(item)) {
    throw new Error(`大厅图鉴响应格式错误：第 ${index + 1} 项不是对象`);
  }
  const heroCode = readText(item, 'heroCode', MAX_TEXT_LENGTH, `hero-${index + 1}`);
  const rarity = readText(item, 'rarity', 16, 'R');
  // 前端再做一层过滤，防止服务端配置漂移时把未开放稀有度带到大厅。
  if (rarity.toUpperCase() === 'EX' || heroCode.toUpperCase().startsWith('EX_')) {
    return null;
  }
  return {
    heroCode,
    heroName: readText(item, 'heroName', MAX_TEXT_LENGTH, '未命名英雄'),
    rarity,
    faction: readText(item, 'faction', 32, '未知阵营'),
    heroClass: readText(item, 'heroClass', 32, '未知职业'),
    roleDesc: readOptionalText(item, 'roleDesc', MAX_TEXT_LENGTH),
    owned: item.owned === true,
    ownedCount: readInteger(item.ownedCount, 0, 999),
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
  if (!trimmed) {
    return fallback;
  }
  return trimmed.slice(0, maxLength);
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
