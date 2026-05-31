import type { PlayerBattleRecentVO, PlayerBattleSettlementVO, PlayerBattleStartVO } from '../../types/BattleTypes';

/** 大厅战斗面板状态。当前战斗闭环只记录无奖励结算。 */
export interface LobbyBattlePanelState {
  starting: boolean;
  settling: boolean;
  stageCode: string;
  error: string;
  start: PlayerBattleStartVO | null;
  settlement: PlayerBattleSettlementVO | null;
  presentationStep: number;
  presentationComplete: boolean;
  recentLoading: boolean;
  recentError: string;
  recentBattles: PlayerBattleRecentVO[];
  version: number;
}

export function createLobbyBattlePanelState(): LobbyBattlePanelState {
  return {
    starting: false,
    settling: false,
    stageCode: '',
    error: '',
    start: null,
    settlement: null,
    presentationStep: 0,
    presentationComplete: false,
    recentLoading: false,
    recentError: '',
    recentBattles: [],
    version: 0,
  };
}
