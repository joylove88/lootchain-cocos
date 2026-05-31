/** 玩家战斗接口类型。当前只承载会话与无奖励结算，不承载经济结算。 */
export interface PlayerBattleStartDTO {
  requestId: string;
  stageCode: string;
  heroIds: number[];
  leaderHeroId: number;
  clientVersion: string;
}

export interface PlayerBattleSettleDTO {
  requestId: string;
  result: 'WIN' | 'LOSE' | 'ABORT';
  durationSeconds: number;
  roundCount: number;
  clientChecksum: string;
}

export interface PlayerBattleLineupHeroVO {
  heroId: number;
  heroCode: string;
  heroName: string;
  rarity: string;
  level: number;
  star: number;
  power: number;
  leader: boolean;
  protagonist: boolean;
  sourceType: string;
}

export interface PlayerBattleEnemyVO {
  enemyCode: string;
  enemyName: string;
  level: number;
  power: number;
  role: string;
}

export interface PlayerBattleStartVO {
  battleNo: string;
  stageCode: string;
  status: string;
  serverSeed: string;
  lineup: PlayerBattleLineupHeroVO[];
  enemyPreview: PlayerBattleEnemyVO[];
  expireTime: string;
  readonlyEconomy: boolean;
  guardrails: string[];
}

export interface PlayerBattleSettlementVO {
  battleNo: string;
  settlementNo: string;
  stageCode: string;
  result: string;
  status: string;
  rewardGranted: boolean;
  message: string;
  rewardPreview: string[];
  readonlyEconomy: boolean;
}

export interface PlayerBattleRecentVO {
  battleNo: string;
  settlementNo: string;
  stageCode: string;
  result: string;
  settlementMode: string;
  rewardGranted: boolean;
  readonlyEconomy: boolean;
  economyApplied: boolean;
  recordedTime: string;
  message: string;
  guardrails: string[];
}
