import type { BattleApi } from '../../api/BattleApi';
import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../../types/LobbyHeroTypes';
import type { PlayerBattleSettleDTO, PlayerBattleStartDTO } from '../../types/BattleTypes';
import { createLobbyBattlePanelState, type LobbyBattlePanelState } from './LobbyBattleState';

export interface LobbyBattleFlowHost {
  currentLobbyHeroRosterState(): LobbyHeroRosterPanelState;
  currentLobbyFormationHeroIds(): number[];
  refreshLobbyBattlePreviewPanel(): void;
  refreshLobbyOverlay(): void;
  setStatus(message: string): void;
}

/** 战斗流程控制器。只调用 battle session 和无奖励 settlement，不接触奖励、体力或进度写入。 */
export class LobbyBattleFlow {
  private readonly state = createLobbyBattlePanelState();
  private ticket = 0;
  private recentTicket = 0;
  private readonly presentationTimers: Array<ReturnType<typeof setTimeout>> = [];

  constructor(
    private readonly battleApi: BattleApi,
    private readonly host: LobbyBattleFlowHost,
  ) {}

  currentState(): LobbyBattlePanelState {
    return this.state;
  }

  resetForLogin(): void {
    this.clearPresentationTimers();
    this.ticket += 1;
    this.state.starting = false;
    this.state.settling = false;
    this.state.stageCode = '';
    this.state.error = '';
    this.state.start = null;
    this.state.settlement = null;
    this.state.presentationStep = 0;
    this.state.presentationComplete = false;
    this.state.recentLoading = false;
    this.state.recentError = '';
    this.state.recentBattles = [];
    this.recentTicket += 1;
    this.bump();
  }

  cancel(clearState = false): void {
    this.clearPresentationTimers();
    this.ticket += 1;
    if (clearState) {
      // 玩家从结算结果回到大厅时要清掉本地战斗快照，避免下一次进入同一关卡被旧 busy 状态拦住。
      this.state.starting = false;
      this.state.settling = false;
      this.state.stageCode = '';
      this.state.error = '';
      this.state.start = null;
      this.state.settlement = null;
      this.state.presentationStep = 0;
      this.state.presentationComplete = false;
      this.bump();
    }
  }

  prepare(stageCode: string): void {
    // 打开战斗面板前先清理上一场的会话/结算快照，避免 UI 闪现旧结果。
    const selectedStageCode = normalizeStageCode(stageCode);
    this.clearPresentationTimers();
    this.ticket += 1;
    this.state.starting = false;
    this.state.settling = false;
    this.state.stageCode = selectedStageCode ?? '';
    this.state.error = '';
    this.state.start = null;
    this.state.settlement = null;
    this.state.presentationStep = 0;
    this.state.presentationComplete = false;
    if (!selectedStageCode) {
      this.state.error = '关卡选择已失效，请重新选择主线关卡。';
      this.host.setStatus(this.state.error);
    }
    this.bump();
  }

  async start(stageCode: string): Promise<void> {
    const selectedStageCode = normalizeStageCode(stageCode);
    if (!selectedStageCode) {
      this.clearPresentationTimers();
      this.state.starting = false;
      this.state.settling = false;
      this.state.stageCode = '';
      this.state.error = '关卡选择已失效，请重新选择主线关卡。';
      this.state.start = null;
      this.state.settlement = null;
      this.state.presentationStep = 0;
      this.state.presentationComplete = false;
      this.host.setStatus(this.state.error);
      this.bump();
      return;
    }
    if (this.state.stageCode === selectedStageCode && (this.state.starting || this.state.start || this.state.settling || this.state.settlement)) {
      // 同一关卡的战斗会话已经在创建或已创建时，不再重复 POST battle start。
      return;
    }
    const currentTicket = ++this.ticket;
    this.state.starting = true;
    this.state.settling = false;
    this.state.stageCode = selectedStageCode;
    this.state.error = '';
    this.state.start = null;
    this.state.settlement = null;
    this.state.presentationStep = 0;
    this.state.presentationComplete = false;
    this.clearPresentationTimers();
    this.bump();
    try {
      const dto = this.buildStartDTO(this.state.stageCode);
      const start = await this.battleApi.startBattle(dto);
      if (!this.isCurrent(currentTicket)) {
        return;
      }
      this.state.start = start;
      this.state.stageCode = start.stageCode;
      this.state.starting = false;
      this.state.presentationStep = 0;
      this.state.presentationComplete = false;
      this.host.setStatus(`战斗会话已创建：${start.stageCode}`);
      this.schedulePresentationTicks(currentTicket);
    } catch (error) {
      if (!this.isCurrent(currentTicket)) {
        return;
      }
      this.state.error = error instanceof Error ? error.message : String(error);
      this.state.starting = false;
      this.host.setStatus(`战斗会话创建失败：${this.state.error}`);
    } finally {
      if (this.isCurrent(currentTicket)) {
        this.bump();
      }
    }
  }

  async settle(): Promise<void> {
    const currentStart = this.state.start;
    if (!currentStart || this.state.settling || this.state.settlement || !this.state.presentationComplete) {
      return;
    }
    const currentTicket = ++this.ticket;
    this.clearPresentationTimers();
    this.state.settling = true;
    this.state.error = '';
    this.bump();
    try {
      const dto: PlayerBattleSettleDTO = {
        requestId: createRequestId('battle-settle'),
        result: 'WIN',
        durationSeconds: 45,
        roundCount: 3,
        clientChecksum: currentStart.serverSeed.slice(0, 32),
      };
      const settlement = await this.battleApi.settleBattle(currentStart.battleNo, dto);
      if (!this.isCurrent(currentTicket)) {
        return;
      }
      if (settlement.stageCode !== currentStart.stageCode) {
        throw new Error(`战斗结算关卡不一致：会话 ${currentStart.stageCode}，结算 ${settlement.stageCode}`);
      }
      this.state.settlement = settlement;
      this.state.settling = false;
      this.host.setStatus(settlement.message || '战斗记录完成，奖励未开放。');
    } catch (error) {
      if (!this.isCurrent(currentTicket)) {
        return;
      }
      this.state.error = error instanceof Error ? error.message : String(error);
      this.state.settling = false;
      this.host.setStatus(`战斗记录失败：${this.state.error}`);
    } finally {
      if (this.isCurrent(currentTicket)) {
        this.bump();
      }
    }
  }

  async loadRecentBattles(force = false): Promise<void> {
    if (this.state.recentLoading) {
      return;
    }
    if (!force && this.state.recentBattles.length > 0 && !this.state.recentError) {
      return;
    }
    const currentTicket = ++this.recentTicket;
    this.state.recentLoading = true;
    this.state.recentError = '';
    this.bumpOverlay();
    try {
      const records = await this.battleApi.recentBattles();
      if (this.recentTicket !== currentTicket) {
        return;
      }
      // 最近战斗记录只读展示；接口校验已保证 rewardGranted=false 且 economyApplied=false。
      this.state.recentBattles = records;
      this.state.recentLoading = false;
      this.state.recentError = '';
    } catch (error) {
      if (this.recentTicket !== currentTicket) {
        return;
      }
      this.state.recentLoading = false;
      this.state.recentError = error instanceof Error ? error.message : String(error);
      console.warn('[LootChain] recent battle records load failed:', error);
    } finally {
      if (this.recentTicket === currentTicket) {
        this.bumpOverlay();
      }
    }
  }

  private buildStartDTO(stageCode: string): PlayerBattleStartDTO {
    const heroes = this.resolveLineupHeroes(this.host.currentLobbyFormationHeroIds());
    if (heroes.length === 0) {
      throw new Error('当前没有可上阵英雄，请先确认主角或英雄队列。');
    }
    const leader = heroes.find((hero) => hero.protagonist) ?? heroes[0];
    return {
      requestId: createRequestId('battle-start'),
      stageCode,
      heroIds: heroes.map((hero) => hero.id),
      leaderHeroId: leader.id,
      clientVersion: 'cocos-lobby-stage-4o',
    };
  }

  private resolveLineupHeroes(selectedHeroIds: number[]): LobbyHeroItemVO[] {
    const selectable = [...this.host.currentLobbyHeroRosterState().heroes]
      .filter((hero) => hero.id > 0 && hero.rarity.toUpperCase() !== 'EX' && !hero.heroCode.toUpperCase().startsWith('EX_'));
    const byId = new Map(selectable.map((hero) => [hero.id, hero]));
    if (selectedHeroIds.length > 0) {
      // 战斗请求只提交玩家当前确认的本地阵容 ID；属性、奖励、消耗仍由后端掌控。
      const selected = selectedHeroIds.map((heroId) => byId.get(heroId)).filter((hero): hero is LobbyHeroItemVO => !!hero).slice(0, 5);
      if (selected.length > 0) {
        return selected;
      }
      throw new Error('本次确认阵容已失效，请刷新英雄队列后重新编队。');
    }
    return selectable
      .sort((a, b) => Number(b.protagonist) - Number(a.protagonist) || b.power - a.power)
      .slice(0, 5);
  }

  private bump(): void {
    this.state.version += 1;
    this.host.refreshLobbyBattlePreviewPanel();
  }

  private bumpOverlay(): void {
    this.state.version += 1;
    this.host.refreshLobbyOverlay();
  }

  private isCurrent(currentTicket: number): boolean {
    return this.ticket === currentTicket;
  }

  private schedulePresentationTicks(currentTicket: number): void {
    // 本地表现时间轴只驱动画面节奏，不决定胜负、奖励、体力或主线进度。
    const steps = [1, 2, 3, 4];
    steps.forEach((step) => {
      const timer = setTimeout(() => {
        if (!this.isCurrent(currentTicket) || !this.state.start || this.state.settlement || this.state.settling) {
          return;
        }
        this.state.presentationStep = step;
        this.state.presentationComplete = step >= 4;
        if (this.state.presentationComplete) {
          this.host.setStatus('战斗演出完成，可记录无奖励结果。');
        }
        this.bump();
      }, step * 750);
      this.presentationTimers.push(timer);
    });
  }

  private clearPresentationTimers(): void {
    while (this.presentationTimers.length > 0) {
      const timer = this.presentationTimers.pop();
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }
}

function normalizeStageCode(stageCode: string): string | null {
  const value = (stageCode || '').trim().toUpperCase();
  return /^MAIN_\d+_\d+$/.test(value) ? value : null;
}

function createRequestId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}
