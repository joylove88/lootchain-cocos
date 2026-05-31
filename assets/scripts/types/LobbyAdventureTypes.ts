/** 大厅冒险关卡只读展示项；当前不代表真实战斗或结算配置。 */
export interface LobbyAdventureStageVO {
  stageCode: string;
  stageName: string;
  orderNo: number;
  unlocked: boolean;
  recommended: boolean;
  requiredLevel: number;
  recommendedPower: number;
  enemySummary: string;
  rewardPreview: string[];
  statusLabel: string;
}

/** 大厅冒险章节只读展示项。 */
export interface LobbyAdventureChapterVO {
  chapterCode: string;
  chapterName: string;
  subtitle: string;
  summary: string;
  unlocked: boolean;
  stages: LobbyAdventureStageVO[];
}

/** 大厅冒险只读状态；不包含任何战斗开始、奖励发放或进度写入动作。 */
export interface LobbyAdventureVO {
  mode: string;
  readonly: boolean;
  playerLevel: number;
  playerPower: number;
  currentChapterCode: string;
  currentChapterName: string;
  recommendedStageCode: string;
  recommendedStageName: string;
  recommendationText: string;
  guardrails: string[];
  chapters: LobbyAdventureChapterVO[];
}

/** 冒险地图面板渲染所需的本地状态快照。 */
export interface LobbyAdventurePanelState {
  loading: boolean;
  loaded: boolean;
  error: string;
  adventure: LobbyAdventureVO | null;
}
