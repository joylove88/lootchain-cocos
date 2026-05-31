import type { LobbyBattlePanelState } from './LobbyBattleState';

export type LobbyBattlePresentationPhase =
  | 'creatingSession'
  | 'ready'
  | 'roundPlaying'
  | 'resultRecording'
  | 'resultRecorded'
  | 'error';

export interface LobbyBattlePresentationState {
  phase: LobbyBattlePresentationPhase;
  title: string;
  subtitle: string;
  boundaryText: string;
  timelineText: string;
  logLines: string[];
  settlementReceiptLines?: string[];
  nextStepText?: string;
  actionLabel: string;
  actionNodeName: string;
  actionEnabled: boolean;
  returnToLobby: boolean;
  damageText: string;
  leadEnemyHp: number;
}

/** 将接口状态翻译成战斗表现状态，避免渲染层直接拼接业务阶段；结果页必须保持 rewardGranted=false 的验收口径。 */
export function resolveLobbyBattlePresentationState(state: LobbyBattlePanelState): LobbyBattlePresentationState {
  if (state.starting) {
    return {
      phase: 'creatingSession',
      title: '主线战斗',
      subtitle: '正在创建后端战斗会话...',
      boundaryText: '仅创建 battle session，不扣体力，不写进度，不发奖励。',
      timelineText: '会话创建中',
      logLines: ['编队已锁定为本次预演阵容。', '等待后端返回战斗种子与敌方快照。'],
      actionLabel: '会话创建中',
      actionNodeName: 'LobbyBattleStartPending',
      actionEnabled: false,
      returnToLobby: false,
      damageText: '',
      leadEnemyHp: 0.72,
    };
  }
  if (state.settling) {
    return {
      phase: 'resultRecording',
      title: '主线战斗',
      subtitle: '正在记录无奖励战斗结果...',
      boundaryText: '当前只写 battle_settlement 记录，不触发奖励、体力或进度。',
      timelineText: '结果记录中',
      logLines: ['战斗演出已完成。', '正在提交无奖励结果记录，请勿重复点击。'],
      actionLabel: '记录中',
      actionNodeName: 'LobbyBattleSettlePending',
      actionEnabled: false,
      returnToLobby: false,
      damageText: 'REC',
      leadEnemyHp: 0.18,
    };
  }
  if (state.settlement) {
    const settlement = state.settlement;
    // 验收口径：后端必须保持 rewardGranted=false 且 readonlyEconomy=true；玩家侧只看到“奖励未开放、资源未变更”。
    const rewardGuardText = settlement.rewardGranted ? '异常：奖励状态不应开启。' : '奖励未开放';
    const readonlyGuardText = settlement.readonlyEconomy ? '资源未变更' : '异常：资源只读校验未通过';
    return {
      phase: 'resultRecorded',
      title: '无奖励记录完成',
      subtitle: `关卡 ${settlement.stageCode} / 无奖励记录已写入 / ${settlement.message}`,
      boundaryText: '下一步：返回大厅后可在主线冒险查看本关最近记录；奖励、体力、主线进度、背包和货币均未变更。',
      timelineText: '无奖励结算完成',
      logLines: [
        `Battle：${settlement.battleNo}`,
        `Settlement：${settlement.settlementNo}`,
        `目标关卡：${settlement.stageCode}`,
        `结果：${settlement.result} / 状态：${settlement.status}`,
        `${rewardGuardText}；${readonlyGuardText}；主线进度不推进。`,
        '下一步：返回大厅，进入主线冒险查看最近挑战记录。',
      ],
      // 结算回执只展示后端只读记录，不承担奖励、体力、主线进度或背包变更。
      settlementReceiptLines: [
        `结算单：${settlement.settlementNo}`,
        `战斗号：${settlement.battleNo}`,
        '奖励：未开放',
        settlement.readonlyEconomy ? '资源：未变更' : '资源：只读校验异常',
        '进度：不推进',
      ],
      nextStepText: '返回大厅后，主线冒险面板会展示本关最近记录；当前仍不会发放奖励或推进主线。',
      actionLabel: '返回大厅',
      actionNodeName: 'LobbyBattleReturnLobbyButton',
      actionEnabled: true,
      returnToLobby: true,
      damageText: 'RECORDED',
      leadEnemyHp: 0.08,
    };
  }
  if (state.error && !state.start) {
    return {
      phase: 'error',
      title: '战斗暂不可用',
      subtitle: state.error,
      boundaryText: '失败状态不会写入奖励、体力、进度或资源。',
      timelineText: '创建失败',
      logLines: ['战斗会话未创建。', state.error],
      actionLabel: '重试创建',
      actionNodeName: 'LobbyBattleStartButton',
      actionEnabled: true,
      returnToLobby: false,
      damageText: '',
      leadEnemyHp: 0.72,
    };
  }
  if (state.start) {
    const round = resolveRoundCopy(state.presentationStep);
    const complete = state.presentationComplete;
    return {
      phase: 'roundPlaying',
      title: '主线战斗',
      subtitle: `关卡 ${state.start.stageCode} / 会话 ${state.start.battleNo}`,
      boundaryText: '战斗演出仅记录结果：不扣体力，不写主线进度，不发奖励。',
      timelineText: complete ? '演出完成 / 等待记录' : round.timelineText,
      logLines: [
        `服务器种子：${state.start.serverSeed.slice(0, 12)}...`,
        ...round.logLines,
        complete ? '演出已完成，可记录无奖励结果。' : '演出进行中，结算按钮暂不可用。',
      ],
      actionLabel: complete ? '记录结果' : '演出中',
      actionNodeName: complete ? 'LobbyBattleSettlementButton' : 'LobbyBattlePlaybackPending',
      actionEnabled: complete,
      returnToLobby: false,
      damageText: round.damageText,
      leadEnemyHp: round.leadEnemyHp,
    };
  }
  return {
    phase: 'ready',
    title: '主线战斗',
    subtitle: `目标关卡 ${state.stageCode || '未选择'} / 准备创建战斗会话，本阶段不发奖励、不扣体力。`,
    boundaryText: '点击开始只创建 battle session，不改变玩家资源。',
    timelineText: '等待开始',
    logLines: ['我方编队已就绪。', '点击开始后由后端生成战斗会话。'],
    actionLabel: '开始战斗',
    actionNodeName: 'LobbyBattleStartButton',
    actionEnabled: true,
    returnToLobby: false,
    damageText: '',
    leadEnemyHp: 0.72,
  };
}

function resolveRoundCopy(step: number): { timelineText: string; logLines: string[]; damageText: string; leadEnemyHp: number } {
  if (step <= 0) {
    return {
      timelineText: '第 1 回合 / 接敌',
      logLines: ['主角攻击形态前压，队伍进入战斗位置。', '敌方黑甲守卫正在蓄势。'],
      damageText: '-684',
      leadEnemyHp: 0.62,
    };
  }
  if (step === 1) {
    return {
      timelineText: '第 1 回合 / 主角出手',
      logLines: ['主角斩击命中裂隙前锋。', '敌方前排护甲被削弱。'],
      damageText: '-1284',
      leadEnemyHp: 0.48,
    };
  }
  if (step === 2) {
    return {
      timelineText: '第 2 回合 / 敌方反击',
      logLines: ['敌方释放暗焰反击。', '我方队长格挡，队伍保持阵线。'],
      damageText: '-392',
      leadEnemyHp: 0.42,
    };
  }
  if (step === 3) {
    return {
      timelineText: '第 3 回合 / 终结斩',
      logLines: ['主角攻击形态爆发，压制敌方核心。', '敌方阵线崩解，等待记录结果。'],
      damageText: '-2406',
      leadEnemyHp: 0.18,
    };
  }
  return {
    timelineText: '演出完成 / 等待记录',
    logLines: ['敌方前排被击退。', '战斗表现完成，等待提交无奖励结果记录。'],
    damageText: 'FINISH',
    leadEnemyHp: 0.08,
  };
}
