import { HttpClient } from '../net/HttpClient';
import type {
  PlayerBattleEnemyVO,
  PlayerBattleLineupHeroVO,
  PlayerBattleRecentVO,
  PlayerBattleSettleDTO,
  PlayerBattleSettlementVO,
  PlayerBattleStartDTO,
  PlayerBattleStartVO,
} from '../types/BattleTypes';

type UnknownRecord = Record<string, unknown>;

const MAX_LINEUP = 5;
const MAX_ENEMIES = 8;
const MAX_TEXT = 128;

/** 玩家战斗 API：当前只创建 battle session 和记录无奖励 settlement，不接触体力、奖励、进度或经济写入。 */
export class BattleApi {
  constructor(private readonly http: HttpClient) {}

  startBattle(dto: PlayerBattleStartDTO): Promise<PlayerBattleStartVO> {
    const request = normalizeStartDTO(dto);
    return this.http.post<unknown>('/api/player/battles/start', request).then((data) => validateBattleStart(data, request.stageCode));
  }

  settleBattle(battleNo: string, dto: PlayerBattleSettleDTO): Promise<PlayerBattleSettlementVO> {
    const safeBattleNo = battleNo.trim();
    if (!safeBattleNo) {
      throw new Error('战斗结算请求缺少 battleNo');
    }
    return this.http.post<unknown>(`/api/player/battles/${encodeURIComponent(safeBattleNo)}/settle`, dto).then(validateBattleSettlement);
  }

  recentBattles(): Promise<PlayerBattleRecentVO[]> {
    return this.http.get<unknown>('/api/player/battles/recent').then(validateRecentBattles);
  }
}

function normalizeStartDTO(dto: PlayerBattleStartDTO): PlayerBattleStartDTO {
  const stageCode = normalizeMainStageCode(dto.stageCode);
  if (!Array.isArray(dto.heroIds) || dto.heroIds.length === 0 || dto.heroIds.length > MAX_LINEUP) {
    throw new Error('战斗启动请求阵容数量异常');
  }
  const heroIds = dto.heroIds.map((heroId) => readInteger(heroId, 0, Number.MAX_SAFE_INTEGER)).filter((heroId) => heroId > 0);
  if (heroIds.length !== dto.heroIds.length) {
    throw new Error('战斗启动请求包含非法英雄 ID');
  }
  const leaderHeroId = readInteger(dto.leaderHeroId, 0, Number.MAX_SAFE_INTEGER);
  if (leaderHeroId <= 0 || !heroIds.includes(leaderHeroId)) {
    throw new Error('战斗启动请求队长不在阵容中');
  }
  return {
    ...dto,
    stageCode,
    heroIds,
    leaderHeroId,
    requestId: String(dto.requestId || '').trim(),
    clientVersion: String(dto.clientVersion || '').trim(),
  };
}

function validateBattleStart(data: unknown, expectedStageCode: string): PlayerBattleStartVO {
  if (!isRecord(data)) {
    throw new Error('战斗会话响应格式错误：data 不是对象');
  }
  if (data.readonlyEconomy !== true) {
    throw new Error('战斗会话响应格式错误：readonlyEconomy 必须为 true');
  }
  const stageCode = readStageCode(data, 'stageCode');
  if (stageCode !== expectedStageCode) {
    throw new Error(`战斗会话关卡不一致：请求 ${expectedStageCode}，返回 ${stageCode}`);
  }
  return {
    battleNo: readRequiredText(data, 'battleNo', MAX_TEXT, '战斗会话响应缺少 battleNo'),
    stageCode,
    status: readText(data, 'status', 32, 'STARTED'),
    serverSeed: readRequiredText(data, 'serverSeed', MAX_TEXT, '战斗会话响应缺少 serverSeed'),
    lineup: readArray(data, 'lineup', MAX_LINEUP).map(normalizeLineupHero),
    enemyPreview: readArray(data, 'enemyPreview', MAX_ENEMIES).map(normalizeEnemy),
    expireTime: readText(data, 'expireTime', MAX_TEXT, ''),
    readonlyEconomy: true,
    guardrails: sanitizeTextArray(readArray(data, 'guardrails', 10), MAX_TEXT),
  };
}

function validateBattleSettlement(data: unknown): PlayerBattleSettlementVO {
  if (!isRecord(data)) {
    throw new Error('战斗结算响应格式错误：data 不是对象');
  }
  if (data.rewardGranted === true || data.readonlyEconomy !== true) {
    throw new Error('战斗结算响应格式错误：当前阶段必须保持无奖励结算');
  }
  return {
    battleNo: readRequiredText(data, 'battleNo', MAX_TEXT, '战斗结算响应缺少 battleNo'),
    settlementNo: readRequiredText(data, 'settlementNo', MAX_TEXT, '战斗结算响应缺少 settlementNo'),
    stageCode: readStageCode(data, 'stageCode'),
    result: readText(data, 'result', 16, 'WIN'),
    status: readText(data, 'status', 32, 'RECORDED'),
    rewardGranted: false,
    message: readText(data, 'message', 180, '战斗记录完成，奖励未开放'),
    rewardPreview: sanitizeTextArray(readArray(data, 'rewardPreview', 6), 80),
    readonlyEconomy: true,
  };
}

function validateRecentBattles(data: unknown): PlayerBattleRecentVO[] {
  if (!Array.isArray(data)) {
    throw new Error('最近战斗记录响应格式错误：data 不是数组');
  }
  return data.slice(0, 20).map(validateRecentBattle);
}

function validateRecentBattle(item: unknown): PlayerBattleRecentVO {
  if (!isRecord(item)) {
    throw new Error('最近战斗记录响应格式错误：记录不是对象');
  }
  const settlementMode = readText(item, 'settlementMode', 32, '');
  if (settlementMode !== 'NO_REWARD' || item.rewardGranted === true || item.readonlyEconomy !== true || item.economyApplied === true) {
    throw new Error('最近战斗记录响应越过无奖励红线');
  }
  return {
    battleNo: readRequiredText(item, 'battleNo', MAX_TEXT, '最近战斗记录缺少 battleNo'),
    settlementNo: readRequiredText(item, 'settlementNo', MAX_TEXT, '最近战斗记录缺少 settlementNo'),
    stageCode: readStageCode(item, 'stageCode'),
    result: readText(item, 'result', 16, 'WIN'),
    settlementMode,
    rewardGranted: false,
    readonlyEconomy: true,
    economyApplied: false,
    recordedTime: readRequiredText(item, 'recordedTime', MAX_TEXT, '最近战斗记录缺少 recordedTime'),
    message: readText(item, 'message', 180, '最近挑战记录只读展示，当前不发放奖励'),
    guardrails: sanitizeTextArray(readArray(item, 'guardrails', 10), MAX_TEXT),
  };
}

function normalizeLineupHero(item: unknown): PlayerBattleLineupHeroVO {
  if (!isRecord(item)) {
    throw new Error('战斗阵容响应格式错误：阵容项不是对象');
  }
  const heroCode = readText(item, 'heroCode', MAX_TEXT, '');
  const rarity = readText(item, 'rarity', 16, 'R');
  if (rarity.toUpperCase() === 'EX' || heroCode.toUpperCase().startsWith('EX_')) {
    throw new Error('战斗阵容响应包含未开放 EX 内容');
  }
  return {
    heroId: readInteger(item.heroId, 0, Number.MAX_SAFE_INTEGER),
    heroCode,
    heroName: readText(item, 'heroName', MAX_TEXT, '未命名英雄'),
    rarity,
    level: readInteger(item.level, 1, 999),
    star: readInteger(item.star, 0, 99),
    power: readInteger(item.power, 0, Number.MAX_SAFE_INTEGER),
    leader: item.leader === true,
    protagonist: item.protagonist === true,
    sourceType: readText(item, 'sourceType', 32, ''),
  };
}

function normalizeEnemy(item: unknown): PlayerBattleEnemyVO {
  if (!isRecord(item)) {
    throw new Error('战斗敌方响应格式错误：敌方项不是对象');
  }
  return {
    enemyCode: readText(item, 'enemyCode', MAX_TEXT, ''),
    enemyName: readText(item, 'enemyName', MAX_TEXT, '未知敌人'),
    level: readInteger(item.level, 1, 999),
    power: readInteger(item.power, 0, Number.MAX_SAFE_INTEGER),
    role: readText(item, 'role', 32, ''),
  };
}

function readStageCode(record: UnknownRecord, key: string): string {
  return normalizeMainStageCode(readText(record, key, MAX_TEXT, ''));
}

function normalizeMainStageCode(stageCode: string): string {
  const value = (stageCode || '').trim().toUpperCase();
  if (!/^MAIN_\d+_\d+$/.test(value)) {
    throw new Error('战斗关卡必须显式返回 MAIN_数字_数字，不允许默认兜底');
  }
  return value;
}

function sanitizeTextArray(values: unknown[], maxLength: number): string[] {
  return values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim().slice(0, maxLength))
    .filter((value) => value && !value.toUpperCase().includes('EX_'));
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readArray(record: UnknownRecord, key: string, maxLength: number): unknown[] {
  const value = record[key];
  return Array.isArray(value) ? value.slice(0, maxLength) : [];
}

function readText(record: UnknownRecord, key: string, maxLength: number, fallback: string): string {
  const value = record[key];
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function readRequiredText(record: UnknownRecord, key: string, maxLength: number, errorMessage: string): string {
  const value = readText(record, key, maxLength, '');
  if (!value) {
    throw new Error(errorMessage);
  }
  return value;
}

function readInteger(value: unknown, min: number, max: number): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.trunc(numeric)));
}
