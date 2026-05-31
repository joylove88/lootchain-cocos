import {
  BlockInputEvents,
  Button,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Node,
  Size,
  UITransform,
  Vec3,
} from 'cc';
import type { LobbyAdventureChapterVO, LobbyAdventurePanelState, LobbyAdventureStageVO } from '../../types/LobbyAdventureTypes';
import { safeText } from '../UiTextFormatter';
import { rgba, type UiLayout } from './LobbyHudTypes';
import type { LobbyBattlePanelState } from './LobbyBattleState';

export interface LobbyAdventurePanelHost {
  node: Node;
  currentLobbyAdventureState(): LobbyAdventurePanelState;
  currentLobbyBattleState(): LobbyBattlePanelState;
  currentLobbySelectedStageCode(): string;
  selectLobbyAdventureStage(stageCode: string): void;
  previewLockedLobbyAdventureStage(stageCode: string): void;
  openLobbyFormationPanel(stageCode?: string): void;
  closeLobbyAdventurePanel(): void;
  reloadLobbyAdventure(): void;
  createUiNode(name: string): Node;
  addChildPlainNode(parent: Node, name: string, x: number, y: number, width: number, height: number): Node;
  addChildBeveledPanelNode(parent: Node, name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel?: number): Node;
  addChildLabel(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
    contentSize?: Size,
    horizontalAlign?: HorizontalTextAlignment,
  ): Label;
  applyImageButtonFeedback(node: Node, hoverScale?: number, pressedScale?: number): void;
}

/** 大厅冒险主线地图面板。当前只进入无奖励战斗预演，不推进真实主线。 */
export class LobbyAdventurePanelRenderer {
  constructor(private readonly host: LobbyAdventurePanelHost) {}

  render(layout: UiLayout): void {
    const state = this.host.currentLobbyAdventureState();
    const scale = Math.max(0.62, Math.min(1, layout.uiScale));
    const pagePadding = Math.max(14 * scale, Math.min(30 * scale, layout.safeWidth * 0.024));
    const panelWidth = Math.max(330 * scale, layout.safeWidth - pagePadding * 2);
    const panelHeight = Math.max(270 * scale, layout.safeHeight - pagePadding * 2);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;

    const dim = this.createUiNode('LobbyAdventureDim');
    dim.setPosition(new Vec3(centerX, centerY, 0));
    dim.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const dimGraphics = dim.addComponent(Graphics);
    dimGraphics.fillColor = rgba(0, 0, 0, 154);
    dimGraphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    dimGraphics.fill();
    // 功能页采用场景式导航，遮罩只阻断底层输入，不再承担点击关闭语义。
    dim.addComponent(BlockInputEvents);

    const panelGroup = this.createUiNode('LobbyAdventurePanel');
    panelGroup.setPosition(new Vec3(centerX, centerY, 0));
    panelGroup.addComponent(UITransform).setContentSize(new Size(panelWidth, panelHeight));
    // 面板内容区必须吞掉点击，避免点地图节点时穿透遮罩关闭面板。
    panelGroup.addComponent(BlockInputEvents);
    const panel = this.host.addChildBeveledPanelNode(
      panelGroup,
      'LobbyAdventurePanelFrame',
      0,
      0,
      panelWidth,
      panelHeight,
      rgba(5, 5, 8, 244),
      rgba(196, 145, 62, 230),
      20 * scale,
    );
    this.drawPanelAtmosphere(panel, panelWidth, panelHeight, scale);
    this.renderHeader(panel, panelWidth, panelHeight, scale, state);
    this.renderBody(panel, panelWidth, panelHeight, scale, state);
    this.renderFooter(panel, panelWidth, panelHeight, scale);
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private renderHeader(parent: Node, width: number, height: number, scale: number, state: LobbyAdventurePanelState): void {
    const title = this.host.addChildLabel(
      parent,
      'LobbyAdventureTitle',
      '主线冒险',
      0,
      height / 2 - 44 * scale,
      30 * scale,
      rgba(252, 225, 158),
      new Size(width - 110 * scale, 40 * scale),
    );
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    const adventure = state.adventure;
    const statusText = state.loading
      ? '正在读取主线推荐...'
      : state.error
        ? '主线推荐暂不可用，当前不进入战斗。'
        : adventure
          ? safeText(adventure.recommendationText)
          : '等待主线数据';
    const status = this.host.addChildLabel(
      parent,
      'LobbyAdventureStatus',
      statusText,
      0,
      height / 2 - 80 * scale,
      17 * scale,
      rgba(204, 167, 88),
      new Size(width - 116 * scale, 28 * scale),
    );
    status.overflow = Label.Overflow.SHRINK;
    this.applyOutline(status, scale, false);
  }

  private renderBody(parent: Node, width: number, height: number, scale: number, state: LobbyAdventurePanelState): void {
    const top = height / 2 - 112 * scale;
    const bottom = -height / 2 + 86 * scale;
    const bodyHeight = Math.max(160 * scale, top - bottom);
    const bodyWidth = width - 76 * scale;
    if (state.loading && !state.adventure) {
      this.renderEmpty(parent, bodyWidth, bodyHeight, scale, '主线地图读取中，请稍候。');
      return;
    }
    if (!state.adventure) {
      this.renderEmpty(parent, bodyWidth, bodyHeight, scale, '主线地图暂不可用；不会进入战斗或结算。');
      return;
    }

    const compact = width < 780 * scale || height < 480 * scale;
    if (compact) {
      this.renderCompactBody(parent, bodyWidth, bodyHeight, scale, state);
      return;
    }

    const leftWidth = bodyWidth * 0.26;
    const rightWidth = bodyWidth * 0.3;
    const mapWidth = bodyWidth - leftWidth - rightWidth - 30 * scale;
    const leftX = -bodyWidth / 2 + leftWidth / 2;
    const mapX = leftX + leftWidth / 2 + 15 * scale + mapWidth / 2;
    const rightX = bodyWidth / 2 - rightWidth / 2;
    const bodyY = (top + bottom) / 2;
    this.renderChapterList(parent, state.adventure.chapters, leftX, bodyY, leftWidth, bodyHeight, scale);
    const selectedStage = this.resolveSelectedStage(state);
    this.renderStageMap(parent, state.adventure.chapters, mapX, bodyY, mapWidth, bodyHeight, scale, selectedStage?.stageCode ?? '');
    this.renderStageDetail(parent, selectedStage, rightX, bodyY, rightWidth, bodyHeight, scale, state);
  }

  private renderCompactBody(parent: Node, width: number, height: number, scale: number, state: LobbyAdventurePanelState): void {
    const panel = this.host.addChildPlainNode(parent, 'LobbyAdventureCompactMap', 0, -4 * scale, width, height);
    const graphics = panel.addComponent(Graphics);
    graphics.fillColor = rgba(8, 8, 12, 186);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(138, 99, 50, 142);
    graphics.stroke();
    const stages = state.adventure?.chapters.flatMap((chapter) => chapter.stages).slice(0, 5) ?? [];
    const selectedStage = this.resolveSelectedStage(state);
    const ctaHeight = 38 * scale;
    const rowAreaHeight = Math.max(80 * scale, height - ctaHeight - 18 * scale);
    const rowHeight = Math.min(44 * scale, Math.max(30 * scale, rowAreaHeight / Math.max(1, stages.length)));
    let y = height / 2 - rowHeight * 0.62;
    for (const [index, stage] of stages.entries()) {
      this.renderCompactStageRow(panel, stage, index, 0, y, width - 28 * scale, rowHeight - 6 * scale, scale, stage.stageCode === selectedStage?.stageCode);
      y -= rowHeight;
    }
    const recommended = selectedStage ?? stages.find((stage) => stage.recommended) ?? stages.find((stage) => stage.unlocked) ?? null;
    const ctaWidth = Math.min(width - 34 * scale, 220 * scale);
    const cta = this.host.addChildPlainNode(panel, 'LobbyAdventureCompactFormationButton', 0, -height / 2 + ctaHeight / 2 + 10 * scale, ctaWidth, ctaHeight);
    if (recommended?.unlocked) {
      const ctaGraphics = cta.addComponent(Graphics);
      ctaGraphics.fillColor = rgba(34, 24, 17, 226);
      ctaGraphics.rect(-ctaWidth / 2, -ctaHeight / 2, ctaWidth, ctaHeight);
      ctaGraphics.fill();
      ctaGraphics.strokeColor = rgba(188, 137, 58, 216);
      ctaGraphics.stroke();
      cta.addComponent(Button);
      cta.on(Button.EventType.CLICK, () => this.host.openLobbyFormationPanel(recommended.stageCode), this);
      this.host.applyImageButtonFeedback(cta, 1.025, 0.975);
    } else {
      this.drawDisabledButton(cta, ctaWidth, ctaHeight, scale);
    }
    const ctaLabel = this.host.addChildLabel(
      cta,
      'LobbyAdventureCompactFormationButtonLabel',
      recommended?.unlocked ? '编队确认' : '暂无可进入关卡',
      0,
      0,
      17 * scale,
      recommended?.unlocked ? rgba(245, 211, 123) : rgba(179, 150, 91),
      new Size(ctaWidth - 16 * scale, ctaHeight),
    );
    ctaLabel.overflow = Label.Overflow.SHRINK;
  }

  private renderChapterList(parent: Node, chapters: LobbyAdventureChapterVO[], x: number, y: number, width: number, height: number, scale: number): void {
    const panel = this.host.addChildPlainNode(parent, 'LobbyAdventureChapterList', x, y, width, height);
    const graphics = panel.addComponent(Graphics);
    this.drawSectionFrame(graphics, width, height, scale, rgba(7, 7, 10, 186));
    const title = this.host.addChildLabel(panel, 'LobbyAdventureChapterListTitle', '章节', 0, height / 2 - 26 * scale, 19 * scale, rgba(238, 204, 138), new Size(width - 24 * scale, 26 * scale));
    title.overflow = Label.Overflow.SHRINK;
    const rowHeight = Math.min(72 * scale, Math.max(46 * scale, (height - 58 * scale) / Math.max(1, chapters.length)));
    let rowY = height / 2 - 60 * scale;
    chapters.slice(0, 5).forEach((chapter, index) => {
      this.renderChapterRow(panel, chapter, index, 0, rowY - rowHeight / 2, width - 22 * scale, rowHeight - 8 * scale, scale);
      rowY -= rowHeight;
    });
  }

  private renderChapterRow(parent: Node, chapter: LobbyAdventureChapterVO, index: number, x: number, y: number, width: number, height: number, scale: number): void {
    const row = this.host.addChildPlainNode(parent, `LobbyAdventureChapter_${index}`, x, y, width, height);
    const graphics = row.addComponent(Graphics);
    graphics.fillColor = index === 0 ? rgba(45, 14, 14, 218) : rgba(10, 10, 12, 180);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = index === 0 ? rgba(207, 145, 64, 196) : rgba(118, 88, 48, 124);
    graphics.stroke();
    const subtitle = this.host.addChildLabel(row, 'LobbyAdventureChapterSubtitle', safeText(chapter.subtitle), -width / 2 + 14 * scale, height / 2 - 18 * scale, 14 * scale, rgba(188, 142, 74), new Size(width - 24 * scale, 18 * scale), HorizontalTextAlignment.LEFT);
    subtitle.overflow = Label.Overflow.SHRINK;
    const title = this.host.addChildLabel(row, 'LobbyAdventureChapterName', safeText(chapter.chapterName), -width / 2 + 14 * scale, -8 * scale, 19 * scale, rgba(244, 214, 151), new Size(width - 28 * scale, 28 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
  }

  private renderStageMap(parent: Node, chapters: LobbyAdventureChapterVO[], x: number, y: number, width: number, height: number, scale: number, selectedStageCode: string): void {
    const panel = this.host.addChildPlainNode(parent, 'LobbyAdventureStageMap', x, y, width, height);
    const graphics = panel.addComponent(Graphics);
    this.drawSectionFrame(graphics, width, height, scale, rgba(4, 5, 7, 176));
    this.drawMapVeins(graphics, width, height, scale);
    const stages = chapters.flatMap((chapter) => chapter.stages).slice(0, 7);
    const usableWidth = width - 90 * scale;
    stages.forEach((stage, index) => {
      const progress = stages.length <= 1 ? 0.5 : index / (stages.length - 1);
      const nodeX = -usableWidth / 2 + usableWidth * progress;
      const nodeY = Math.sin(progress * Math.PI * 2.2) * 42 * scale;
      this.renderStageNode(panel, stage, index, nodeX, nodeY, 78 * scale, scale, stage.stageCode === selectedStageCode);
    });
  }

  private renderStageNode(parent: Node, stage: LobbyAdventureStageVO, index: number, x: number, y: number, size: number, scale: number, selected: boolean): void {
    const node = this.host.addChildPlainNode(parent, `LobbyAdventureStageNode_${index}`, x, y, size, size);
    const graphics = node.addComponent(Graphics);
    const active = selected || stage.recommended;
    graphics.fillColor = selected ? rgba(112, 28, 24, 236) : stage.recommended ? rgba(102, 18, 22, 228) : stage.unlocked ? rgba(26, 20, 16, 216) : rgba(12, 12, 15, 170);
    graphics.circle(0, 0, size * 0.34);
    graphics.fill();
    graphics.strokeColor = selected ? rgba(255, 215, 118, 250) : active ? rgba(245, 184, 76, 232) : stage.unlocked ? rgba(168, 124, 61, 178) : rgba(88, 78, 66, 132);
    graphics.lineWidth = Math.max(1, selected ? 2.4 * scale : active ? 2 * scale : 1.2 * scale);
    graphics.circle(0, 0, size * 0.34);
    graphics.stroke();
    if (stage.unlocked) {
      // 点击关卡只更新本地本次选择，不保存主线进度，也不触发战斗或经济写入。
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, () => this.host.selectLobbyAdventureStage(stage.stageCode), this);
      this.host.applyImageButtonFeedback(node, 1.035, 0.965);
    } else {
      // 锁定节点允许轻触查看原因，但绝不改变 selected stage，也不会进入编队或战斗。
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, () => this.host.previewLockedLobbyAdventureStage(stage.stageCode), this);
      this.host.applyImageButtonFeedback(node, 1.012, 0.988);
    }
    const label = this.host.addChildLabel(node, 'LobbyAdventureStageLabel', `${stage.orderNo}`, 0, 2 * scale, 22 * scale, active ? rgba(255, 222, 148) : rgba(210, 181, 125), new Size(size, 28 * scale));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, true);
    if (!stage.unlocked) {
      const lockBadge = this.host.addChildLabel(node, 'LobbyAdventureStageLockBadge', '锁', size * 0.22, size * 0.22, 13 * scale, rgba(151, 128, 82), new Size(size * 0.42, 20 * scale));
      lockBadge.overflow = Label.Overflow.SHRINK;
      this.applyOutline(lockBadge, scale, false);
    }
    const stageName = selected ? `已选 ${safeText(stage.stageName)}` : stage.unlocked ? safeText(stage.stageName) : `锁定 ${safeText(stage.stageName)}`;
    const name = this.host.addChildLabel(node, 'LobbyAdventureStageName', stageName, 0, -size * 0.48, 14 * scale, selected ? rgba(255, 222, 148) : stage.unlocked ? rgba(214, 188, 128) : rgba(151, 128, 82), new Size(size * 1.45, 22 * scale));
    name.overflow = Label.Overflow.SHRINK;
  }

  private renderStageDetail(parent: Node, stage: LobbyAdventureStageVO | null, x: number, y: number, width: number, height: number, scale: number, state: LobbyAdventurePanelState): void {
    const panel = this.host.addChildPlainNode(parent, 'LobbyAdventureStageDetail', x, y, width, height);
    const graphics = panel.addComponent(Graphics);
    this.drawSectionFrame(graphics, width, height, scale, rgba(8, 8, 10, 196));
    const adventure = state.adventure;
    const titleText = stage ? safeText(stage.stageName) : safeText(adventure?.recommendedStageName || '推荐关卡');
    const title = this.host.addChildLabel(panel, 'LobbyAdventureStageDetailTitle', titleText, 0, height / 2 - 34 * scale, 24 * scale, rgba(248, 219, 151), new Size(width - 34 * scale, 34 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    if (!stage) {
      const empty = this.host.addChildLabel(panel, 'LobbyAdventureStageDetailEmpty', '暂无推荐关卡。', 0, 0, 18 * scale, rgba(205, 185, 146), new Size(width - 40 * scale, 44 * scale));
      empty.overflow = Label.Overflow.SHRINK;
      return;
    }
    this.addDetailLine(panel, 'LobbyAdventureReqLevel', `等级要求 Lv.${stage.requiredLevel}`, -height * 0, height / 2 - 78 * scale, width, scale);
    this.addDetailLine(panel, 'LobbyAdventureReqPower', `推荐战力 ${formatInteger(stage.recommendedPower)}`, 0, height / 2 - 108 * scale, width, scale);
    this.addDetailLine(panel, 'LobbyAdventureEnemy', `敌方：${safeText(stage.enemySummary)}`, 0, height / 2 - 146 * scale, width, scale);
    const rewardTitle = this.host.addChildLabel(panel, 'LobbyAdventureRewardTitle', '关卡配置预览（当前不发放）', -width / 2 + 20 * scale, height / 2 - 190 * scale, 17 * scale, rgba(221, 173, 85), new Size(width - 40 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    rewardTitle.overflow = Label.Overflow.SHRINK;
    const rewards = stage.rewardPreview.length > 0 ? stage.rewardPreview : ['当前阶段不发放奖励；仅展示关卡配置占位'];
    rewards.slice(0, 4).forEach((reward, index) => {
      this.addDetailLine(panel, `LobbyAdventureReward_${index}`, `· ${safeText(reward)}（预览）`, 0, height / 2 - (222 + index * 28) * scale, width, scale);
    });
    this.renderRecentBattleSummary(panel, stage.stageCode, width, height, scale);
    const lockedText = stage.unlocked ? '可进入本次编队确认与无奖励战斗预演，不保存长期阵容。' : '等级不足，仅展示关卡预告。';
    const lock = this.host.addChildLabel(panel, 'LobbyAdventureReadonlyNote', lockedText, 0, -height / 2 + 58 * scale, 15 * scale, rgba(170, 148, 105), new Size(width - 36 * scale, 42 * scale));
    lock.lineHeight = 21 * scale;
    lock.overflow = Label.Overflow.SHRINK;
    const buttonWidth = Math.min(160 * scale, width - 40 * scale);
    const formationButton = this.host.addChildPlainNode(panel, 'LobbyAdventureFormationButton', 0, -height / 2 + 24 * scale, buttonWidth, 36 * scale);
    if (stage.unlocked) {
      const graphics = formationButton.addComponent(Graphics);
      graphics.fillColor = rgba(34, 24, 17, 226);
      graphics.rect(-buttonWidth / 2, -18 * scale, buttonWidth, 36 * scale);
      graphics.fill();
      graphics.strokeColor = rgba(188, 137, 58, 216);
      graphics.stroke();
      formationButton.addComponent(Button);
      formationButton.on(Button.EventType.CLICK, () => this.host.openLobbyFormationPanel(stage.stageCode), this);
      this.host.applyImageButtonFeedback(formationButton, 1.025, 0.975);
    } else {
      this.drawDisabledButton(formationButton, buttonWidth, 36 * scale, scale);
    }
    const formationLabel = this.host.addChildLabel(formationButton, 'LobbyAdventureFormationButtonLabel', stage.unlocked ? '编队确认' : '等级不足', 0, 0, 17 * scale, stage.unlocked ? rgba(245, 211, 123) : rgba(179, 150, 91), new Size(buttonWidth, 34 * scale));
    formationLabel.overflow = Label.Overflow.SHRINK;
  }

  private renderRecentBattleSummary(parent: Node, stageCode: string, width: number, height: number, scale: number): void {
    const battleState = this.host.currentLobbyBattleState();
    const stageRecord = battleState.recentBattles.find((record) => record.stageCode === stageCode) ?? null;
    const latest = battleState.recentBattles[0] ?? null;
    const primaryText = battleState.recentLoading
      ? '最近挑战记录读取中...'
      : battleState.recentError
        ? '最近挑战记录暂不可用'
        : stageRecord
          ? `本关 ${stageRecord.result} · ${formatRecentTime(stageRecord.recordedTime)}`
          : latest
            ? `本关暂无记录；最近挑战 ${latest.stageCode}`
            : '本关暂无最近挑战记录';
    const guardText = battleState.recentLoading
      ? '只读接口同步中，不进入结算。'
      : battleState.recentError
        ? '可刷新重试；失败不会改变玩家资源。'
        : stageRecord
          // 守卫脚本关注“只读经济通过”语义，但玩家侧显示为更自然的资源状态。
          ? `${stageRecord.rewardGranted ? '奖励状态异常' : '无奖励记录'} · ${stageRecord.readonlyEconomy && !stageRecord.economyApplied ? '资源未变更' : '资源校验异常'}`
          : latest
            ? `${latest.result} · 无奖励记录 · 只读展示`
            : '完成一次无奖励战斗后会在这里显示记录。';
    const cardWidth = width - 38 * scale;
    const cardHeight = 54 * scale;
    const card = this.host.addChildPlainNode(parent, 'LobbyAdventureRecentBattleSummaryCard', 0, -height / 2 + 118 * scale, cardWidth, cardHeight);
    const graphics = card.addComponent(Graphics);
    graphics.fillColor = rgba(6, 7, 10, 202);
    graphics.rect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
    graphics.fill();
    graphics.strokeColor = stageRecord ? rgba(94, 151, 164, 154) : rgba(124, 96, 51, 128);
    graphics.lineWidth = Math.max(1, scale);
    graphics.stroke();
    const title = this.host.addChildLabel(card, 'LobbyAdventureRecentBattleTitle', '最近战斗记录', -cardWidth / 2 + 12 * scale, 11 * scale, 13 * scale, rgba(221, 173, 85), new Size(cardWidth - 24 * scale, 18 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    const label = this.host.addChildLabel(card, 'LobbyAdventureRecentBattleSummary', primaryText, -cardWidth / 2 + 12 * scale, -4 * scale, 13 * scale, latest || stageRecord ? rgba(186, 218, 231) : rgba(156, 139, 101), new Size(cardWidth - 24 * scale, 18 * scale), HorizontalTextAlignment.LEFT);
    label.overflow = Label.Overflow.SHRINK;
    const guard = this.host.addChildLabel(card, 'LobbyAdventureRecentBattleGuard', guardText, -cardWidth / 2 + 12 * scale, -18 * scale, 11 * scale, rgba(162, 145, 106), new Size(cardWidth - 24 * scale, 16 * scale), HorizontalTextAlignment.LEFT);
    guard.overflow = Label.Overflow.SHRINK;
  }

  private addDetailLine(parent: Node, name: string, text: string, x: number, y: number, width: number, scale: number): void {
    const label = this.host.addChildLabel(parent, name, text, x, y, 16 * scale, rgba(211, 192, 151), new Size(width - 40 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    label.overflow = Label.Overflow.SHRINK;
  }

  private renderCompactStageRow(parent: Node, stage: LobbyAdventureStageVO, index: number, x: number, y: number, width: number, height: number, scale: number, selected: boolean): void {
    const row = this.host.addChildPlainNode(parent, `LobbyAdventureCompactStage_${index}`, x, y, width, height);
    const graphics = row.addComponent(Graphics);
    graphics.fillColor = selected ? rgba(82, 22, 20, 230) : !stage.unlocked ? rgba(12, 12, 15, 156) : stage.recommended ? rgba(67, 16, 18, 220) : rgba(10, 10, 13, 178);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = selected ? rgba(245, 190, 84, 230) : !stage.unlocked ? rgba(83, 73, 58, 126) : stage.recommended ? rgba(225, 162, 69, 190) : rgba(120, 90, 48, 126);
    graphics.stroke();
    if (stage.unlocked) {
      row.addComponent(Button);
      row.on(Button.EventType.CLICK, () => this.host.selectLobbyAdventureStage(stage.stageCode), this);
      this.host.applyImageButtonFeedback(row, 1.012, 0.988);
    } else {
      // 紧凑视图同样只给锁定提示，不把锁定关卡传入编队确认。
      row.addComponent(Button);
      row.on(Button.EventType.CLICK, () => this.host.previewLockedLobbyAdventureStage(stage.stageCode), this);
      this.host.applyImageButtonFeedback(row, 1.006, 0.994);
    }
    const text = `${selected ? '已选 ' : stage.unlocked ? '' : '锁定 '}${stage.stageName}  Lv.${stage.requiredLevel}  ${stage.statusLabel}`;
    const label = this.host.addChildLabel(row, 'LobbyAdventureCompactStageText', text, 0, 0, 16 * scale, selected ? rgba(255, 222, 148) : stage.unlocked ? rgba(226, 199, 139) : rgba(154, 132, 91), new Size(width - 18 * scale, height), HorizontalTextAlignment.LEFT);
    label.overflow = Label.Overflow.SHRINK;
  }

  private renderEmpty(parent: Node, width: number, bodyHeight: number, scale: number, text: string): void {
    const box = this.host.addChildPlainNode(parent, 'LobbyAdventureEmptyBox', 0, -8 * scale, width, Math.min(160 * scale, bodyHeight));
    const graphics = box.addComponent(Graphics);
    graphics.fillColor = rgba(9, 9, 12, 168);
    graphics.rect(-width / 2, -60 * scale, width, 120 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(148, 110, 56, 124);
    graphics.stroke();
    const label = this.host.addChildLabel(box, 'LobbyAdventureEmptyText', text, 0, 0, 19 * scale, rgba(213, 193, 151), new Size(width - 48 * scale, 48 * scale));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
  }

  private renderFooter(parent: Node, width: number, height: number, scale: number): void {
    const note = this.host.addChildLabel(
      parent,
      'LobbyAdventureBoundaryNote',
      '当前可进入无奖励战斗预演；不保存长期编队，不扣体力，不改变玩家资源。',
      0,
      -height / 2 + 62 * scale,
      15 * scale,
      rgba(168, 146, 105),
      new Size(width - 112 * scale, 24 * scale),
    );
    note.overflow = Label.Overflow.SHRINK;
    const reload = this.addFooterButton(parent, 'LobbyAdventureReloadButton', '刷新', -70 * scale, -height / 2 + 30 * scale, 112 * scale, 36 * scale, scale);
    reload.on(Button.EventType.CLICK, () => this.host.reloadLobbyAdventure(), this);
    const close = this.addFooterButton(parent, 'LobbyAdventureCloseButton', '返回大厅', 70 * scale, -height / 2 + 30 * scale, 128 * scale, 36 * scale, scale);
    close.on(Button.EventType.CLICK, () => this.host.closeLobbyAdventurePanel(), this);
  }

  private addFooterButton(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, scale: number): Node {
    const button = this.host.addChildPlainNode(parent, name, x, y, width, height);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = rgba(20, 16, 15, 226);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(188, 137, 58, 216);
    graphics.stroke();
    button.addComponent(Button);
    this.host.applyImageButtonFeedback(button, 1.025, 0.975);
    const label = this.host.addChildLabel(button, `${name}Label`, text, 0, 0, 18 * scale, rgba(245, 211, 123), new Size(width, height));
    label.overflow = Label.Overflow.SHRINK;
    return button;
  }

  private resolveSelectedStage(state: LobbyAdventurePanelState): LobbyAdventureStageVO | null {
    const adventure = state.adventure;
    if (!adventure) {
      return null;
    }
    const stages = adventure.chapters.flatMap((chapter) => chapter.stages);
    const selectedStageCode = this.host.currentLobbySelectedStageCode();
    return stages.find((stage) => stage.stageCode === selectedStageCode && stage.unlocked)
      ?? stages.find((stage) => stage.stageCode === adventure.recommendedStageCode && stage.unlocked)
      ?? stages.find((stage) => stage.recommended && stage.unlocked)
      ?? stages.find((stage) => stage.unlocked)
      ?? null;
  }

  private drawPanelAtmosphere(parent: Node, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, 'LobbyAdventurePanelAtmosphere', 0, 0, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(99, 12, 19, 44);
    graphics.rect(-width / 2 + 18 * scale, height / 2 - 94 * scale, width - 36 * scale, 50 * scale);
    graphics.fill();
    graphics.fillColor = rgba(197, 64, 42, 36);
    graphics.circle(width * 0.16, height * 0.06, Math.min(width, height) * 0.22);
    graphics.fill();
  }

  private drawSectionFrame(graphics: Graphics, width: number, height: number, scale: number, fill: Color): void {
    graphics.fillColor = fill;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(137, 100, 50, 136);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.stroke();
  }

  private drawMapVeins(graphics: Graphics, width: number, height: number, scale: number): void {
    graphics.strokeColor = rgba(107, 40, 38, 120);
    graphics.lineWidth = Math.max(1, 1.2 * scale);
    graphics.moveTo(-width / 2 + 40 * scale, -height * 0.05);
    graphics.bezierCurveTo(-width * 0.18, height * 0.22, width * 0.08, -height * 0.18, width / 2 - 44 * scale, height * 0.06);
    graphics.stroke();
  }

  private drawDisabledButton(node: Node, width: number, height: number, scale: number): void {
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(24, 21, 18, 184);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(119, 91, 48, 148);
    graphics.lineWidth = Math.max(1, scale);
    graphics.stroke();
  }

  private applyOutline(label: Label, scale: number, strong: boolean): void {
    label.enableOutline = true;
    label.outlineColor = rgba(0, 0, 0, strong ? 226 : 190);
    label.outlineWidth = Math.max(1, (strong ? 1.4 : 1) * scale);
  }
}

function formatInteger(value: number | null | undefined): string {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return numeric.toLocaleString('en-US');
}

function formatRecentTime(value: string): string {
  const safe = safeText(value);
  if (!safe) {
    return '时间未知';
  }
  return safe.slice(0, 16).replace('T', ' ');
}
