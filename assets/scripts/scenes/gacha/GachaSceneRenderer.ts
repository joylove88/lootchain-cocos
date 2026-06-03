import {
  assetManager,
  BlockInputEvents,
  Button,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Node,
  resources,
  Size,
  Sprite,
  sp,
  UITransform,
  UIOpacity,
  Vec3,
  tween,
} from 'cc';
import { safeText } from '../UiTextFormatter';
import { renderSceneBackButton } from '../UiSceneBackButton';
import { clamp, rgba, type UiLayout } from '../lobby/LobbyHudTypes';
import type { PlayerLobbyProfileVO } from '../../types/PlayerTypes';
import type { GachaDrawItemVO, GachaDrawLogVO, GachaDrawResultVO, GachaPityVO, GachaPoolDetailVO } from '../../types/GachaTypes';
import {
  GACHA_ABYSS_FALLBACK_SPINE_IDLE_ANIMATION,
  GACHA_ABYSS_FALLBACK_SPINE_INTRO_ANIMATION,
  GACHA_ABYSS_FALLBACK_SPINE_RESOURCE,
  GACHA_ABYSS_FALLBACK_SPINE_SKIN,
  GACHA_ABYSS_FALLBACK_SPINE_UUID,
  GACHA_ABYSS_SPINE_RESOURCE,
  GACHA_ABYSS_SPINE_IDLE_ANIMATION,
  GACHA_ABYSS_SPINE_INTRO_ANIMATION,
  GACHA_ABYSS_SPINE_SKIN,
  GACHA_ABYSS_SPINE_UUID,
  GACHA_BACKGROUND_ASSET,
  GACHA_MODAL_CLOSE_BUTTON_ASSET,
  GACHA_MOCK_RESULT_ONCE,
  GACHA_MOCK_RESULT_TEN,
  GACHA_PREVIEW_POOLS,
  GACHA_REVEAL_STEPS,
  GACHA_RIGHT_ACTIONS,
  gachaRarityTone,
  type GachaActionKey,
  type GachaMockResultItem,
  type GachaPreviewPool,
  type GachaRarity,
  type GachaRevealStep,
} from './GachaSceneConfig';

export type GachaPreviewResultMode = 'once' | 'ten';

export interface GachaSceneState {
  loading: boolean;
  drawing: boolean;
  error: string | null;
  pools: GachaPreviewPool[];
  selectedPoolCode: string | null;
  pity: GachaPityVO[];
  poolDetail: GachaPoolDetailVO | null;
  poolDetailLoading: boolean;
  poolDetailError: string;
  logs: GachaDrawLogVO[];
  logsLoading: boolean;
  logsError: string;
  lastDrawResult: GachaDrawResultVO | null;
  activeAction: GachaActionKey | null;
}

export interface GachaSceneHost {
  node: Node;
  closeGachaScene(): void;
  closeGachaActionScene(): void;
  selectGachaPool(poolCode: string): void;
  startGachaDraw(mode: GachaPreviewResultMode): void;
  openGachaActionScene(action: GachaActionKey): void;
  openGachaMockRevealScene(mode: GachaPreviewResultMode): void;
  closeGachaMockRevealScene(): void;
  openGachaMockResultScene(mode: GachaPreviewResultMode): void;
  closeGachaMockResultScene(): void;
  createUiNode(name: string): Node;
  addSprite(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null;
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
    contentSize: Size,
    horizontalAlign?: HorizontalTextAlignment,
  ): Label;
  applyImageButtonFeedback(node: Node, hoverScale?: number, pressedScale?: number): void;
  setStatus(text: string): void;
  currentLobbyProfile(): PlayerLobbyProfileVO;
}

/** 抽奖全屏预览页。
 * 当前阶段只做视觉、布局和只读规则入口，不触发真实扣费、发奖、保底或兑换写入。 */
export class GachaSceneRenderer {
  private abyssSpineData: sp.SkeletonData | null = null;
  private abyssSpineLoading = false;
  private abyssSpineLoadFailed = false;
  private readonly abyssSpineLoadCallbacks: Array<(data: sp.SkeletonData) => void> = [];
  private abyssFallbackSpineData: sp.SkeletonData | null = null;
  private abyssFallbackSpineLoading = false;
  private abyssFallbackSpineLoadFailed = false;
  private readonly abyssFallbackSpineLoadCallbacks: Array<(data: sp.SkeletonData) => void> = [];

  constructor(private readonly host: GachaSceneHost) {}

  render(layout: UiLayout, state: GachaSceneState): void {
    const scale = this.resolveScale(layout);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const root = this.createUiNode('GachaSceneRoot');
    root.setPosition(new Vec3(centerX, centerY, 0));
    root.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    // 全屏页面必须吞掉底层大厅输入，避免召唤按钮或功能图标穿透到大厅热点。
    root.addComponent(BlockInputEvents);

    this.renderBackground(root, layout);
    this.renderTopBar(root, layout, scale);
    if (layout.safeWidth < 900 || layout.safeHeight < 520) {
      this.renderCompactContent(root, layout, scale, state);
      this.renderActionModal(root, layout, scale, state);
      return;
    }
    const selectedPool = this.resolveSelectedPool(state);
    this.renderPoolRail(root, layout, scale, state);
    this.renderCenterStage(root, layout, scale, selectedPool, state);
    this.renderRightPanel(root, layout, scale, selectedPool);
    this.renderBottomSummonBar(root, layout, scale, selectedPool, state);
    this.renderActionModal(root, layout, scale, state);
  }

  renderResultScene(layout: UiLayout, mode: GachaPreviewResultMode, state: GachaSceneState): void {
    const scale = this.resolveScale(layout);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const root = this.createUiNode('GachaResultSceneRoot');
    root.setPosition(new Vec3(centerX, centerY, 0));
    root.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    root.addComponent(BlockInputEvents);

    this.renderBackground(root, layout);
    this.renderMockResultSceneContent(root, layout, scale, mode, state.lastDrawResult);
    this.renderTopBar(root, layout, scale, 'GachaResultBackButton', () => this.host.closeGachaMockResultScene(), '召唤结果');
  }

  renderRevealScene(layout: UiLayout, mode: GachaPreviewResultMode): void {
    const scale = this.resolveScale(layout);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const root = this.createUiNode('GachaRevealSceneRoot');
    root.setPosition(new Vec3(centerX, centerY, 0));
    root.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    root.addComponent(BlockInputEvents);

    this.renderBackground(root, layout);
    this.renderRevealTopBar(root, layout, scale);
    this.renderRevealSceneContent(root, layout, scale, mode);
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private resolveScale(layout: UiLayout): number {
    return clamp(Math.min(layout.uiScale, layout.safeWidth / 1280, layout.safeHeight / 720), 0.56, 1);
  }

  private resolvePools(state: GachaSceneState): GachaPreviewPool[] {
    return state.pools.length > 0 ? state.pools : GACHA_PREVIEW_POOLS;
  }

  private resolveSelectedPool(state: GachaSceneState): GachaPreviewPool {
    const pools = this.resolvePools(state);
    return pools.find((pool) => pool.poolCode === state.selectedPoolCode || pool.id === state.selectedPoolCode || pool.active) ?? pools[0];
  }

  private renderBackground(parent: Node, layout: UiLayout): void {
    const aspect = 1672 / 941;
    let width = layout.width;
    let height = width / aspect;
    if (height < layout.height) {
      height = layout.height;
      width = height * aspect;
    }
    const sprite = this.host.addSprite('GachaSceneBackground', GACHA_BACKGROUND_ASSET, 0, 0, width, height, parent);
    if (!sprite) {
      const fallback = parent.addComponent(Graphics);
      fallback.fillColor = rgba(2, 2, 4);
      fallback.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
      fallback.fill();
    }
  }

  renderActionScene(layout: UiLayout, state: GachaSceneState, action: GachaActionKey): void {
    const scale = this.resolveScale(layout);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const root = this.createUiNode(`GachaActionSceneRoot_${action}`);
    root.setPosition(new Vec3(centerX, centerY, 0));
    root.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    root.addComponent(BlockInputEvents);

    this.renderBackground(root, layout);
    this.renderTopBar(root, layout, scale, 'GachaActionBackButton', () => this.host.closeGachaActionScene(), this.actionTitle(action));
    this.renderActionSceneContent(root, layout, scale, state, action);
  }

  private renderActionModal(parent: Node, layout: UiLayout, scale: number, state: GachaSceneState): void {
    const action = state.activeAction;
    if (!action) {
      return;
    }
    const overlay = this.host.addChildPlainNode(parent, `GachaActionModalOverlay_${action}`, 0, 0, layout.width, layout.height);
    overlay.addComponent(BlockInputEvents);
    overlay.addComponent(Button);
    overlay.on(Button.EventType.CLICK, () => this.host.closeGachaActionScene(), this);
    const graphics = overlay.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 128);
    graphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    graphics.fill();
    this.renderActionModalContent(overlay, layout, scale, state, action);
  }

  private renderTopBar(parent: Node, layout: UiLayout, scale: number, backName = 'GachaBackButton', onBack: () => void = () => this.host.closeGachaScene(), titleText = '召唤'): void {
    const y = layout.stageTop - 42 * scale;
    renderSceneBackButton(this.host, parent, layout, backName, onBack, scale, titleText);

    const profile = this.host.currentLobbyProfile();
    const resources = [
      { label: '体力', value: `${compactValue(profile.stamina)}/${compactValue(profile.maxStamina)}`, color: rgba(126, 201, 255) },
      { label: '钻石', value: compactValue(profile.diamond), color: rgba(171, 129, 255) },
      { label: '金币', value: compactValue(profile.gold), color: rgba(232, 189, 103) },
    ];
    const capsuleWidth = Math.max(118 * scale, Math.min(178 * scale, layout.safeWidth * 0.115));
    const gap = 14 * scale;
    let cursorX = layout.stageRight - 48 * scale - capsuleWidth / 2;
    for (let index = resources.length - 1; index >= 0; index -= 1) {
      const item = resources[index];
      this.renderResourceCapsule(parent, item.label, item.value, item.color, cursorX, y, capsuleWidth, 34 * scale, scale);
      cursorX -= capsuleWidth + gap;
    }
  }

  private renderRevealTopBar(parent: Node, layout: UiLayout, scale: number): void {
    const y = layout.stageTop - 42 * scale;
    renderSceneBackButton(this.host, parent, layout, 'GachaRevealBackButton', () => this.host.closeGachaMockRevealScene(), scale, '召唤仪式');
    const note = this.host.addChildLabel(parent, 'GachaRevealTopGuard', '本地演出预览', layout.stageRight - 138 * scale, y, 18 * scale, rgba(190, 166, 116), new Size(220 * scale, 34 * scale), HorizontalTextAlignment.RIGHT);
    note.overflow = Label.Overflow.SHRINK;
  }

  private renderResourceCapsule(parent: Node, label: string, value: string, tint: Color, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, `GachaResource_${label}`, x, y, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(4, 4, 7, 196);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(159, 113, 55, 150);
    graphics.stroke();
    graphics.fillColor = tint;
    graphics.circle(-width / 2 + 22 * scale, 0, 9 * scale);
    graphics.fill();
    const valueLabel = this.host.addChildLabel(node, 'GachaResourceValue', value, 12 * scale, 0, 20 * scale, rgba(244, 218, 159), new Size(width - 58 * scale, height), HorizontalTextAlignment.RIGHT);
    valueLabel.overflow = Label.Overflow.SHRINK;
    this.applyOutline(valueLabel, scale, false);
  }

  private renderActionSceneContent(parent: Node, layout: UiLayout, scale: number, state: GachaSceneState, action: GachaActionKey): void {
    this.renderActionModalContent(parent, layout, scale, state, action);
  }

  private renderActionModalContent(parent: Node, layout: UiLayout, scale: number, state: GachaSceneState, action: GachaActionKey): void {
    const selectedPool = this.resolveSelectedPool(state);
    const rows = this.actionRows(action, state, selectedPool);
    const frame = this.resolveActionPanelFrame(layout, scale, action, rows.length);
    const { width, height } = frame;
    const panel = this.host.addChildBeveledPanelNode(parent, `GachaActionScenePanel_${action}`, 0, frame.y, width, height, rgba(7, 7, 10, 230), rgba(199, 145, 64, 210), 16 * scale);
    panel.addComponent(BlockInputEvents);
    this.renderActionModalCloseButton(panel, width, height, scale);

    const title = this.host.addChildLabel(panel, 'GachaActionSceneTitle', `${this.actionTitle(action)} · ${safeText(selectedPool.title)}`, 0, height / 2 - 42 * scale, 28 * scale, rgba(251, 222, 154), new Size(width - 84 * scale, 38 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    const subtitle = this.host.addChildLabel(panel, 'GachaActionSceneSubtitle', this.actionSubtitle(action, state, selectedPool), 0, height / 2 - 76 * scale, 15 * scale, rgba(184, 159, 108), new Size(width - 96 * scale, 24 * scale));
    subtitle.overflow = Label.Overflow.SHRINK;

    if (rows.length === 0) {
      this.renderActionEmpty(panel, width, height, scale, this.emptyActionText(action, state));
    } else {
      this.renderActionRows(panel, width, height, scale, rows, action);
    }

    if (action === 'exchange') {
      this.renderExchangeDisabledButton(panel, width, height, scale);
    }
  }

  private renderActionModalCloseButton(parent: Node, width: number, height: number, scale: number): void {
    const size = 46 * scale;
    const x = width / 2 - 28 * scale;
    const y = height / 2 - 28 * scale;
    const sprite = this.host.addSprite('GachaActionModalCloseArt', GACHA_MODAL_CLOSE_BUTTON_ASSET, x, y, size, size, parent);
    const buttonNode = sprite?.node ?? this.host.addChildPlainNode(parent, 'GachaActionModalCloseFallback', x, y, size, size);
    buttonNode.addComponent(Button);
    buttonNode.on(Button.EventType.CLICK, () => this.host.closeGachaActionScene(), this);
    this.host.applyImageButtonFeedback(buttonNode, 1.08, 0.92);
    if (!sprite) {
      const graphics = buttonNode.addComponent(Graphics);
      graphics.fillColor = rgba(32, 7, 8, 220);
      graphics.circle(0, 0, size * 0.42);
      graphics.fill();
      graphics.strokeColor = rgba(226, 172, 82, 230);
      graphics.lineWidth = Math.max(1.5, 2 * scale);
      graphics.circle(0, 0, size * 0.42);
      graphics.moveTo(-size * 0.16, size * 0.16);
      graphics.lineTo(size * 0.16, -size * 0.16);
      graphics.moveTo(size * 0.16, size * 0.16);
      graphics.lineTo(-size * 0.16, -size * 0.16);
      graphics.stroke();
    }
  }

  private resolveActionPanelFrame(layout: UiLayout, scale: number, action: GachaActionKey, rowCount: number): { width: number; height: number; y: number } {
    const maxWidth = Math.max(360 * scale, Math.min(layout.safeWidth - 80 * scale, 980 * scale));
    const preferredWidth = action === 'record' || action === 'pool' ? 860 * scale : 720 * scale;
    const width = Math.min(maxWidth, Math.max(360 * scale, preferredWidth));
    const rowHeight = 27 * scale;
    const footerReserve = action === 'exchange' ? 58 * scale : 0;
    const visibleRows = rowCount === 0 ? 3 : Math.min(rowCount, action === 'pool' ? 15 : 12);
    const desiredHeight = 150 * scale + visibleRows * rowHeight + footerReserve;
    const maxHeight = Math.max(300 * scale, Math.min(layout.safeHeight - 180 * scale, action === 'record' || action === 'pool' ? 600 * scale : 520 * scale));
    const minHeight = Math.min(maxHeight, action === 'exchange' ? 360 * scale : 330 * scale);
    return {
      width,
      height: clamp(Math.max(desiredHeight, minHeight), minHeight, maxHeight),
      y: -8 * scale,
    };
  }

  private actionTitle(action: GachaActionKey): string {
    if (action === 'info') {
      return '概率保底';
    }
    if (action === 'record') {
      return '召唤记录';
    }
    if (action === 'exchange') {
      return '兑换';
    }
    return '奖池内容';
  }

  private actionSubtitle(action: GachaActionKey, state: GachaSceneState, selectedPool: GachaPreviewPool): string {
    if (action === 'record') {
      return state.logsLoading ? '正在读取召唤记录...' : state.logsError || '只读读取当前玩家召唤记录，不提供补发或重抽。';
    }
    if (state.poolDetailLoading) {
      return '正在读取卡池展示配置...';
    }
    if (state.poolDetailError) {
      return `卡池详情读取失败：${safeText(state.poolDetailError)}`;
    }
    if (action === 'exchange') {
      return selectedPool.exchangeNote ?? '兑换涉及经济写入，当前阶段仅展示规则说明并保持关闭。';
    }
    return selectedPool.noticeText ?? '信息来自后端卡池配置，只读展示。';
  }

  private actionRows(action: GachaActionKey, state: GachaSceneState, selectedPool: GachaPreviewPool): string[] {
    if (action === 'record') {
      return state.logs.slice(0, 14).map((log) => `${formatDateTime(log.createTime)}  ${log.drawCount}抽  ${safeText(log.poolCode)}  消耗 ${compactValue(log.costAmount)} ${safeText(log.costCode)}  ${safeText(log.drawNo)}`);
    }
    const detail = state.poolDetail;
    if (!detail) {
      return [];
    }
    if (action === 'info') {
      const rateRows = detail.rates
        .filter((rate) => rate.status === 1)
        .map((rate) => `概率 ${safeText(rate.rarity)}：${formatDecimalValue(rate.rate)}%`);
      const pityRows = detail.pityConfigs
        .filter((pity) => pity.status === 1)
        .map((pity) => `保底 ${safeText(pity.rarity)}：${pity.pityCount} 抽，重置 ${safeText(pity.resetRarity || '-')}`);
      const currentRows = state.pity.map((pity) => {
        const left = Math.max(0, Number(pity.pityCount) - Number(pity.counter));
        return `当前 ${safeText(pity.rarity)} 保底：已 ${pity.counter} / ${pity.pityCount}，还需 ${left} 抽`;
      });
      const duplicateRows = detail.duplicateConfigs
        .filter((config) => config.status === 1)
        .map((config) => `重复 ${safeText(config.rarity)} 英雄：转化 ${compactValue(config.fragmentCount)} 同名碎片`);
      return [...rateRows, ...pityRows, ...currentRows, ...duplicateRows];
    }
    if (action === 'exchange') {
      const exchangeNote = selectedPool.exchangeNote ? [`说明：${safeText(selectedPool.exchangeNote)}`] : [];
      const duplicateRows = detail.duplicateConfigs
        .filter((config) => config.status === 1)
        .map((config) => `碎片来源：重复 ${safeText(config.rarity)} 英雄转化 ${compactValue(config.fragmentCount)} 碎片`);
      return [...exchangeNote, ...duplicateRows, '当前不开放兑换、补发、碎片消耗或资源变更接口。'];
    }
    return detail.items
      .filter((item) => item.status === 1)
      .slice(0, 22)
      .map((item) => `${safeText(item.rarity)}  ${rewardTypeLabel(item.rewardType)}  ${safeText(item.rewardCode)}  权重 ${item.weight}${item.upFlag === 1 ? '  UP' : ''}${item.limitedFlag === 1 ? '  限定' : ''}`);
  }

  private renderActionRows(parent: Node, width: number, height: number, scale: number, rows: string[], action: GachaActionKey): void {
    const footerReserve = action === 'exchange' ? 58 * scale : 0;
    const bodyOuterWidth = width - 84 * scale;
    const bodyOuterHeight = Math.max(96 * scale, height - 138 * scale - footerReserve);
    const bodyY = -18 * scale + footerReserve / 2;
    const body = this.host.addChildPlainNode(parent, `GachaActionRows_${action}`, 0, bodyY, bodyOuterWidth, bodyOuterHeight);
    const graphics = body.addComponent(Graphics);
    graphics.fillColor = rgba(5, 5, 8, 168);
    graphics.rect(-bodyOuterWidth / 2, -bodyOuterHeight / 2, bodyOuterWidth, bodyOuterHeight);
    graphics.fill();
    graphics.strokeColor = rgba(140, 102, 54, 132);
    graphics.stroke();

    const bodyWidth = width - 116 * scale;
    const top = bodyOuterHeight / 2 - 24 * scale;
    const lineHeight = 27 * scale;
    const maxRows = Math.max(1, Math.floor((bodyOuterHeight - 38 * scale) / lineHeight));
    rows.slice(0, maxRows).forEach((row, index) => {
      const label = this.host.addChildLabel(body, `GachaActionRow_${index}`, row, -bodyWidth / 2, top - index * lineHeight, 15 * scale, rgba(220, 196, 135), new Size(bodyWidth, 23 * scale), HorizontalTextAlignment.LEFT);
      label.overflow = Label.Overflow.SHRINK;
    });
    if (rows.length > maxRows) {
      const more = this.host.addChildLabel(body, 'GachaActionRowsMore', `已显示 ${maxRows}/${rows.length} 条，后续补滚动列表。`, 0, -bodyOuterHeight / 2 + 18 * scale, 13 * scale, rgba(152, 130, 91), new Size(bodyWidth, 20 * scale));
      more.overflow = Label.Overflow.SHRINK;
    }
  }

  private renderActionEmpty(parent: Node, width: number, height: number, scale: number, text: string): void {
    const label = this.host.addChildLabel(parent, 'GachaActionSceneEmpty', text, 0, -4 * scale, 20 * scale, rgba(212, 188, 130), new Size(width - 98 * scale, 66 * scale));
    label.lineHeight = 27 * scale;
    label.overflow = Label.Overflow.RESIZE_HEIGHT;
    this.applyOutline(label, scale, false);
  }

  private emptyActionText(action: GachaActionKey, state: GachaSceneState): string {
    if (action === 'record') {
      return state.logsLoading ? '召唤记录读取中...' : state.logsError || '当前还没有召唤记录。';
    }
    return state.poolDetailLoading ? '卡池详情读取中...' : state.poolDetailError || '当前卡池暂未返回展示详情。';
  }

  private renderExchangeDisabledButton(parent: Node, width: number, height: number, scale: number): void {
    const buttonWidth = Math.min(260 * scale, width - 96 * scale);
    const button = this.host.addChildPlainNode(parent, 'GachaExchangeDisabledButton', 0, -height / 2 + 34 * scale, buttonWidth, 40 * scale);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = rgba(24, 20, 18, 142);
    graphics.rect(-buttonWidth / 2, -20 * scale, buttonWidth, 40 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(116, 95, 66, 160);
    graphics.stroke();
    const component = button.addComponent(Button);
    component.interactable = false;
    const label = this.host.addChildLabel(button, 'GachaExchangeDisabledLabel', '兑换未开放', 0, 0, 17 * scale, rgba(154, 137, 105), new Size(230 * scale, 34 * scale));
    label.overflow = Label.Overflow.SHRINK;
  }

  private renderPoolRail(parent: Node, layout: UiLayout, scale: number, state: GachaSceneState): void {
    const pools = this.resolvePools(state);
    const railWidth = clamp(layout.safeWidth * 0.185, 238 * scale, 320 * scale);
    const itemHeight = clamp(layout.safeHeight * 0.115, 84 * scale, 112 * scale);
    const gap = 10 * scale;
    const totalHeight = pools.length * itemHeight + (pools.length - 1) * gap;
    const x = layout.stageLeft + railWidth / 2 + 22 * scale;
    const y = (layout.stageTop + layout.stageBottom) / 2 + 4 * scale;
    const rail = this.host.addChildPlainNode(parent, 'GachaPoolRail', x, y, railWidth, totalHeight);
    let cursorY = totalHeight / 2 - itemHeight / 2;
    for (const pool of pools) {
      const active = pool.poolCode === state.selectedPoolCode || pool.id === state.selectedPoolCode || pool.active;
      this.renderPoolItem(rail, { ...pool, active }, 0, cursorY, railWidth, itemHeight, scale);
      cursorY -= itemHeight + gap;
    }
  }

  private renderPoolItem(parent: Node, pool: GachaPreviewPool, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, `GachaPool_${pool.id}`, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.host.selectGachaPool(pool.poolCode ?? pool.id), this);
    this.host.applyImageButtonFeedback(node, 1.025, 0.975);
    const tone = gachaRarityTone(pool.rarity);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = pool.active ? rgba(54, 8, 11, 218) : rgba(4, 4, 7, 184);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = pool.active ? tone.stroke : rgba(142, 105, 55, 126);
    graphics.lineWidth = Math.max(1, pool.active ? 2 * scale : 1 * scale);
    graphics.stroke();
    graphics.fillColor = tone.glow;
    graphics.rect(width * 0.12, -height / 2, width * 0.38, height);
    graphics.fill();
    this.drawPoolTabLogoBackdrop(node, pool, width, height);
    if (pool.locked) {
      graphics.fillColor = rgba(0, 0, 0, 116);
      graphics.rect(-width / 2, -height / 2, width, height);
      graphics.fill();
    }
    const logo = this.host.addChildPlainNode(node, 'GachaPoolLogoSlot', -width / 2 + 33 * scale, 5 * scale, 42 * scale, 42 * scale);
    this.drawPoolLogoSlot(logo, pool, 42 * scale, scale);
    const title = this.host.addChildLabel(node, 'GachaPoolTitle', pool.title, -width / 2 + 66 * scale, 13 * scale, 21 * scale, rgba(248, 218, 150), new Size(width - 92 * scale, 28 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const subline = this.host.addChildLabel(node, 'GachaPoolSubline', pool.locked ? (pool.buttonDisabledReason ?? '锁定') : pool.subline, -width / 2 + 66 * scale, -19 * scale, 16 * scale, pool.locked ? rgba(151, 137, 110) : rgba(214, 170, 86), new Size(width - 92 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    subline.overflow = Label.Overflow.SHRINK;
  }

  private drawPoolTabLogoBackdrop(parent: Node, pool: GachaPreviewPool, width: number, height: number): void {
    const logoPath = this.normalizeSpriteFramePath(pool.tabLogoAsset || pool.logoAsset);
    if (!logoPath) {
      return;
    }
    const logo = this.host.addSprite('GachaPoolTabLogoBackdrop', logoPath, width * 0.31, 0, width * 0.33, height * 0.82, parent);
    if (!logo) {
      return;
    }
    const opacity = logo.node.addComponent(UIOpacity);
    opacity.opacity = pool.active ? 118 : 86;
  }

  private drawPoolLogoSlot(parent: Node, pool: GachaPreviewPool, size: number, scale: number): void {
    const graphics = parent.addComponent(Graphics);
    const tone = gachaRarityTone(pool.rarity);
    graphics.fillColor = rgba(5, 5, 8, 196);
    graphics.circle(0, 0, size * 0.42);
    graphics.fill();
    graphics.strokeColor = tone.stroke;
    graphics.lineWidth = Math.max(1.2, 1.5 * scale);
    graphics.circle(0, 0, size * 0.42);
    graphics.stroke();
    const logoPath = this.normalizeSpriteFramePath(pool.logoAsset);
    const logo = logoPath ? this.host.addSprite('GachaPoolLogoImage', logoPath, 0, 0, size * 0.74, size * 0.74, parent) : null;
    if (!logo) {
      const label = this.host.addChildLabel(parent, 'GachaPoolLogoText', pool.logoText ?? pool.badgeText ?? pool.rarity, 0, 0, 13 * scale, tone.text, new Size(size * 0.72, size * 0.72));
      label.overflow = Label.Overflow.SHRINK;
      this.applyOutline(label, scale, false);
    }
  }

  private normalizeSpriteFramePath(path: string | null | undefined): string | null {
    const value = (path ?? '').trim();
    if (!value) {
      return null;
    }
    return value.endsWith('/spriteFrame') ? value : `${value}/spriteFrame`;
  }

  private renderCenterStage(parent: Node, layout: UiLayout, scale: number, selectedPool: GachaPreviewPool, state: GachaSceneState): void {
    this.renderAbyssSpineStage(parent, layout, scale, selectedPool);
    this.renderPityLine(parent, layout, scale, selectedPool, state);
  }

  private renderAbyssSpineStage(parent: Node, layout: UiLayout, scale: number, selectedPool: GachaPreviewPool): void {
    const stageWidth = clamp(layout.stageWidth * 0.46, 390 * scale, 730 * scale);
    const stageHeight = clamp(layout.stageHeight * 0.63, 360 * scale, 610 * scale);
    const centerY = (layout.stageTop + layout.stageBottom) / 2 - 18 * scale;
    const stage = this.host.addChildPlainNode(parent, 'GachaAbyssSpineStage', 0, centerY, stageWidth, stageHeight);
    const graphics = stage.addComponent(Graphics);
    const spineGroundY = -stageHeight * 0.55;
    graphics.fillColor = rgba(0, 0, 0, 70);
    graphics.ellipse(0, spineGroundY - 22 * scale, stageWidth * 0.34, stageHeight * 0.09);
    graphics.fill();

    const spineNode = this.host.addChildPlainNode(stage, 'GachaAbyssSpineNode', 0, spineGroundY, stageWidth, stageHeight);
    const skeleton = spineNode.addComponent(sp.Skeleton);
    skeleton.premultipliedAlpha = false;
    skeleton.timeScale = 0.78;
    const spineScale = this.resolveAbyssSpineScale(layout, scale);
    spineNode.setScale(new Vec3(spineScale, spineScale, 1));

    const fallback = this.renderAbyssSpineFallback(stage, stageWidth, stageHeight, scale);
    const resource = selectedPool.centerSpineResource || GACHA_ABYSS_SPINE_RESOURCE;
    const uuid = selectedPool.centerSpineUuid || GACHA_ABYSS_SPINE_UUID;
    const skin = selectedPool.centerSpineSkin || GACHA_ABYSS_SPINE_SKIN;
    const intro = selectedPool.centerIntroAnimation || GACHA_ABYSS_SPINE_INTRO_ANIMATION;
    const idle = selectedPool.centerIdleAnimation || GACHA_ABYSS_SPINE_IDLE_ANIMATION;
    this.ensureConfiguredSpineData(resource, uuid, (data) => {
      if (!this.isSkeletonNodeAlive(skeleton)) {
        return;
      }
      if (this.applyAbyssSpineData(skeleton, data, safeText(selectedPool.title), skin, intro, idle)) {
        if (this.isNodeAlive(fallback)) {
          fallback.destroy();
        }
        return;
      }
      this.ensureAbyssFallbackSpineData((fallbackData) => {
        if (!this.isSkeletonNodeAlive(skeleton)) {
          return;
        }
        if (this.applyAbyssSpineData(skeleton, fallbackData, 'Lord of the Dark Abyss', GACHA_ABYSS_FALLBACK_SPINE_SKIN, GACHA_ABYSS_FALLBACK_SPINE_INTRO_ANIMATION, GACHA_ABYSS_FALLBACK_SPINE_IDLE_ANIMATION)) {
          if (this.isNodeAlive(fallback)) {
            fallback.destroy();
          }
          this.host.setStatus('huangfengjiaozong Spine 运行时解析失败，已临时显示可用预览 Spine；需要重新导出 huangfengjiaozong。');
        }
      });
    });
  }

  private renderAbyssSpineFallback(parent: Node, width: number, height: number, scale: number): Node {
    const node = this.host.addChildPlainNode(parent, 'GachaAbyssSpineLoadingFallback', 0, -height * 0.12, width * 0.46, height * 0.52);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(10, 5, 8, 116);
    graphics.rect(-width * 0.23, -height * 0.26, width * 0.46, height * 0.52);
    graphics.fill();
    graphics.strokeColor = rgba(210, 154, 73, 140);
    graphics.lineWidth = Math.max(1, 1.2 * scale);
    graphics.stroke();
    graphics.fillColor = rgba(122, 12, 18, 78);
    graphics.circle(0, 0, Math.min(width, height) * 0.18);
    graphics.fill();
    const label = this.host.addChildLabel(node, 'GachaAbyssSpineLoadingLabel', '黄风教宗准备中', 0, -height * 0.18, 18 * scale, rgba(225, 190, 112), new Size(width * 0.42, 30 * scale));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
    const opacity = node.addComponent(UIOpacity);
    opacity.opacity = 160;
    tween(opacity).repeatForever(tween().to(0.9, { opacity: 230 }).to(0.9, { opacity: 130 })).start();
    return node;
  }

  private resolveAbyssSpineScale(layout: UiLayout, scale: number): number {
    const stageFactor = clamp(Math.min(layout.stageWidth / 1920, layout.stageHeight / 1080), 0.58, 1.15);
    return 0.43 * scale * stageFactor;
  }

  private ensureAbyssSpineData(onLoaded: (data: sp.SkeletonData) => void): void {
    if (this.abyssSpineData) {
      onLoaded(this.abyssSpineData);
      return;
    }
    if (this.abyssSpineLoadFailed) {
      return;
    }
    this.abyssSpineLoadCallbacks.push(onLoaded);
    if (this.abyssSpineLoading) {
      return;
    }
    this.abyssSpineLoading = true;
    assetManager.loadAny({ uuid: GACHA_ABYSS_SPINE_UUID }, (uuidError: Error | null, asset: unknown) => {
      if (!uuidError && asset) {
        this.finishAbyssSpineLoad(asset as sp.SkeletonData);
        return;
      }
      resources.load(GACHA_ABYSS_SPINE_RESOURCE, sp.SkeletonData, (resourceError: Error | null, data: sp.SkeletonData | null) => {
        if (!resourceError && data) {
          this.finishAbyssSpineLoad(data);
          return;
        }
        this.abyssSpineLoading = false;
        this.abyssSpineLoadFailed = true;
        this.abyssSpineLoadCallbacks.length = 0;
        const message = resourceError?.message || uuidError?.message || 'unknown error';
        console.warn(`[Gacha] huangfengjiaozong spine load failed: ${message}`);
        this.host.setStatus('召唤 Spine 资源加载失败，请确认 assets/resources/spine/gacha/huangfengjiaozong 已重新导入。');
      });
    });
  }

  private finishAbyssSpineLoad(data: sp.SkeletonData): void {
    this.abyssSpineLoading = false;
    this.abyssSpineData = data;
    const callbacks = this.abyssSpineLoadCallbacks.splice(0);
    this.runSpineLoadCallbacks(callbacks, data, 'huangfengjiaozong');
  }

  private ensureAbyssFallbackSpineData(onLoaded: (data: sp.SkeletonData) => void): void {
    if (this.abyssFallbackSpineData) {
      onLoaded(this.abyssFallbackSpineData);
      return;
    }
    if (this.abyssFallbackSpineLoadFailed) {
      return;
    }
    this.abyssFallbackSpineLoadCallbacks.push(onLoaded);
    if (this.abyssFallbackSpineLoading) {
      return;
    }
    this.abyssFallbackSpineLoading = true;
    resources.load(GACHA_ABYSS_FALLBACK_SPINE_RESOURCE, sp.SkeletonData, (resourceError: Error | null, data: sp.SkeletonData | null) => {
      if (!resourceError && data) {
        this.finishAbyssFallbackSpineLoad(data);
        return;
      }
      assetManager.loadAny({ uuid: GACHA_ABYSS_FALLBACK_SPINE_UUID }, (uuidError: Error | null, asset: unknown) => {
        if (!uuidError && asset) {
          this.finishAbyssFallbackSpineLoad(asset as sp.SkeletonData);
          return;
        }
        this.abyssFallbackSpineLoading = false;
        this.abyssFallbackSpineLoadFailed = true;
        this.abyssFallbackSpineLoadCallbacks.length = 0;
        const message = resourceError?.message || uuidError?.message || 'unknown error';
        console.warn(`[Gacha] fallback spine load failed: ${message}`);
        this.host.setStatus('huangfengjiaozong Spine 解析失败，备用预览 Spine 也加载失败，请检查 resources/spine/gacha 资源导入。');
      });
    });
  }

  private finishAbyssFallbackSpineLoad(data: sp.SkeletonData): void {
    this.abyssFallbackSpineLoading = false;
    this.abyssFallbackSpineData = data;
    const callbacks = this.abyssFallbackSpineLoadCallbacks.splice(0);
    this.runSpineLoadCallbacks(callbacks, data, 'fallback');
  }

  private runSpineLoadCallbacks(callbacks: Array<(data: sp.SkeletonData) => void>, data: sp.SkeletonData, label: string): void {
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[Gacha] ${label} spine callback failed after async load: ${message}`);
      }
    });
  }

  private isNodeAlive(node: Node | null | undefined): node is Node {
    return Boolean(node && node.isValid);
  }

  private isSkeletonNodeAlive(skeleton: sp.Skeleton): boolean {
    const node = skeleton.node as Node | null;
    return this.isNodeAlive(node);
  }

  private ensureConfiguredSpineData(resource: string, uuid: string | null, onLoaded: (data: sp.SkeletonData) => void): void {
    if (resource === GACHA_ABYSS_SPINE_RESOURCE || uuid === GACHA_ABYSS_SPINE_UUID) {
      this.ensureAbyssSpineData(onLoaded);
      return;
    }
    if (resource === GACHA_ABYSS_FALLBACK_SPINE_RESOURCE || uuid === GACHA_ABYSS_FALLBACK_SPINE_UUID) {
      this.ensureAbyssFallbackSpineData(onLoaded);
      return;
    }
    const loadByResource = () => {
      resources.load(resource, sp.SkeletonData, (resourceError: Error | null, data: sp.SkeletonData | null) => {
        if (!resourceError && data) {
          onLoaded(data);
          return;
        }
        const message = resourceError?.message || 'unknown error';
        console.warn(`[Gacha] configured spine load failed: ${resource}, ${message}`);
        this.host.setStatus(`卡池 Spine 资源加载失败：${resource}`);
      });
    };
    if (!uuid) {
      loadByResource();
      return;
    }
    assetManager.loadAny({ uuid }, (uuidError: Error | null, asset: unknown) => {
      if (!uuidError && asset) {
        onLoaded(asset as sp.SkeletonData);
        return;
      }
      loadByResource();
    });
  }

  private applyAbyssSpineData(
    skeleton: sp.Skeleton,
    data: sp.SkeletonData,
    assetLabel: string,
    preferredSkin: string,
    preferredIntroAnimation: string,
    preferredIdleAnimation: string,
  ): boolean {
    try {
      if (!this.isSkeletonNodeAlive(skeleton)) {
        return false;
      }
      skeleton.skeletonData = data;
      const runtimeData = data.getRuntimeData(true);
      if (!runtimeData) {
        console.warn(`[Gacha] ${assetLabel} spine runtime data missing; skel/atlas/texture may be mismatched or unsupported by Cocos Spine runtime.`);
        this.host.setStatus(`${assetLabel} Spine 运行时解析失败，请检查 skel/atlas/texture 是否匹配。`);
        return false;
      }
      const skinName = this.resolveAbyssSpineSkinName(data, preferredSkin);
      if (skinName) {
        skeleton.setSkin(skinName);
        skeleton.setSlotsToSetupPose();
      }
      const idleAnimation = this.resolveAbyssSpineAnimationName(data, preferredIdleAnimation);
      if (!idleAnimation) {
        skeleton.setToSetupPose();
        this.logAbyssSpineResolved(data, skinName, '<setup-pose>', assetLabel);
        this.host.setStatus(`${assetLabel} 未找到导出动画，已显示静态骨骼首帧。`);
        return true;
      }
      const introAnimation = this.resolveAbyssSpineAnimationName(data, preferredIntroAnimation);
      if (introAnimation && introAnimation !== idleAnimation) {
        const introTrack = skeleton.setAnimation(0, introAnimation, false);
        const idleTrack = skeleton.addAnimation(0, idleAnimation, true, 0);
        if (!introTrack && !idleTrack) {
          this.host.setStatus(`召唤 Spine 动画 ${introAnimation}/${idleAnimation} 播放失败。`);
          return false;
        }
        this.logAbyssSpineResolved(data, skinName, idleAnimation, assetLabel);
        return true;
      }
      const track = skeleton.setAnimation(0, idleAnimation, true);
      if (!track) {
        this.host.setStatus(`召唤 Spine 动画 ${idleAnimation} 播放失败。`);
        return false;
      }
      this.logAbyssSpineResolved(data, skinName, idleAnimation, assetLabel);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Gacha] ${assetLabel} spine apply failed: ${message}`);
      this.host.setStatus(`召唤 Spine 播放失败：${message}`);
      return false;
    }
  }

  private resolveAbyssSpineSkinName(data: sp.SkeletonData, preferred: string): string | null {
    return this.resolveSpineEnumName(data.getSkinsEnum(), preferred, []);
  }

  private resolveAbyssSpineAnimationName(data: sp.SkeletonData, preferred: string): string | null {
    return this.resolveSpineEnumName(data.getAnimsEnum(), preferred, ['idle', 'stand', 'loop', 'animation', 'daiji', 'wait', '待机']);
  }

  private resolveSpineEnumName(enumMap: { [key: string]: number } | null, preferred: string, fallbackHints: string[]): string | null {
    if (!enumMap) {
      return null;
    }
    const names = Object.keys(enumMap).filter((name) => name !== '<None>' && typeof enumMap[name] === 'number');
    if (preferred && names.includes(preferred)) {
      return preferred;
    }
    for (const hint of fallbackHints) {
      const matched = names.find((name) => name.toLowerCase().includes(hint.toLowerCase()));
      if (matched) {
        return matched;
      }
    }
    return names[0] ?? null;
  }

  private logAbyssSpineResolved(data: sp.SkeletonData, skinName: string | null, animationName: string, assetLabel: string): void {
    const runtimeData = data.getRuntimeData(true);
    const width = runtimeData?.width ?? 0;
    const height = runtimeData?.height ?? 0;
    console.info(`[Gacha] ${assetLabel} spine applied: skin=${skinName ?? '<setup>'}, animation=${animationName}, size=${Math.round(width)}x${Math.round(height)}`);
  }

  private drawCardOrnaments(graphics: Graphics, width: number, height: number, scale: number, active: boolean): void {
    const corner = 22 * scale;
    graphics.strokeColor = active ? rgba(255, 222, 122, 190) : rgba(220, 175, 96, 130);
    graphics.lineWidth = Math.max(1, 1.2 * scale);
    graphics.moveTo(-width / 2 + corner, height / 2 - 8 * scale);
    graphics.lineTo(width / 2 - corner, height / 2 - 8 * scale);
    graphics.moveTo(-width / 2 + corner, -height / 2 + 8 * scale);
    graphics.lineTo(width / 2 - corner, -height / 2 + 8 * scale);
    graphics.moveTo(-width / 2 + 8 * scale, height / 2 - corner);
    graphics.lineTo(-width / 2 + 8 * scale, -height / 2 + corner);
    graphics.moveTo(width / 2 - 8 * scale, height / 2 - corner);
    graphics.lineTo(width / 2 - 8 * scale, -height / 2 + corner);
    graphics.stroke();
  }

  private drawPortraitSilhouette(graphics: Graphics, width: number, height: number, scale: number, rarity: GachaRarity): void {
    const tone = gachaRarityTone(rarity);
    graphics.fillColor = new Color(tone.stroke.r, tone.stroke.g, tone.stroke.b, 42);
    graphics.circle(0, height * 0.14, width * 0.22);
    graphics.fill();
    graphics.fillColor = rgba(5, 5, 8, 210);
    graphics.circle(0, height * 0.08, width * 0.18);
    graphics.fill();
    graphics.moveTo(-width * 0.26, -height * 0.22);
    graphics.lineTo(-width * 0.14, -height * 0.02);
    graphics.lineTo(0, height * 0.05);
    graphics.lineTo(width * 0.15, -height * 0.02);
    graphics.lineTo(width * 0.28, -height * 0.22);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = new Color(tone.stroke.r, tone.stroke.g, tone.stroke.b, 120);
    graphics.lineWidth = Math.max(1, scale);
    graphics.moveTo(-width * 0.28, height * 0.2);
    graphics.lineTo(width * 0.28, height * 0.34);
    graphics.moveTo(width * 0.24, height * 0.2);
    graphics.lineTo(-width * 0.16, height * 0.34);
    graphics.stroke();
  }

  private renderPityLine(parent: Node, layout: UiLayout, scale: number, selectedPool: GachaPreviewPool, state: GachaSceneState): void {
    const y = layout.stageTop - 92 * scale;
    const pityText = this.resolvePityText(selectedPool, state);
    const text = this.host.addChildLabel(parent, 'GachaPityLine', pityText, 0, y, 24 * scale, rgba(248, 216, 143), new Size(layout.stageWidth * 0.5, 34 * scale));
    text.overflow = Label.Overflow.SHRINK;
    this.applyOutline(text, scale, true);
    const note = this.host.addChildLabel(parent, 'GachaPhaseGuardNote', selectedPool.noticeText ?? '卡池信息由后端配置驱动。', 0, y - 29 * scale, 14 * scale, rgba(166, 145, 105), new Size(layout.stageWidth * 0.62, 22 * scale));
    note.overflow = Label.Overflow.SHRINK;
  }

  private resolvePityText(selectedPool: GachaPreviewPool, state: GachaSceneState): string {
    if (selectedPool.locked || selectedPool.previewOnly || !selectedPool.drawEnabled) {
      return selectedPool.buttonDisabledReason ?? '该召唤暂未开放';
    }
    const priority = state.pity.find((pity) => pity.rarity === 'UR') ?? state.pity.find((pity) => pity.rarity === 'SSR') ?? state.pity[0];
    if (!priority) {
      return '再召唤 30 次必得 传说英雄';
    }
    const left = Math.max(0, priority.pityCount - priority.counter);
    const rarityText = priority.rarity === 'UR' ? '神话英雄' : priority.rarity === 'SSR' ? '传说英雄' : `${priority.rarity}英雄`;
    return `再召唤 ${left} 次必得 ${rarityText}`;
  }

  private renderRightPanel(parent: Node, layout: UiLayout, scale: number, selectedPool: GachaPreviewPool): void {
    const actionSize = 62 * scale;
    const gap = 22 * scale;
    const totalHeight = GACHA_RIGHT_ACTIONS.length * actionSize + (GACHA_RIGHT_ACTIONS.length - 1) * gap;
    const x = layout.stageRight - 86 * scale;
    let cursorY = (layout.stageTop + layout.stageBottom) / 2 + totalHeight / 2 - actionSize / 2;
    for (const action of this.resolveRightActions(selectedPool)) {
      this.renderActionButton(parent, action.key, action.label, action.note, x, cursorY, actionSize, scale);
      cursorY -= actionSize + gap;
    }
    this.renderUpPreview(parent, layout, scale);
  }

  private renderActionButton(parent: Node, key: GachaActionKey, label: string, note: string, x: number, y: number, size: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, `GachaAction_${key}`, x, y, size, size + 28 * scale);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => {
      this.host.setStatus(note);
      this.host.openGachaActionScene(key);
    }, this);
    this.host.applyImageButtonFeedback(node, 1.04, 0.96);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(5, 5, 8, 168);
    graphics.circle(0, 10 * scale, size * 0.42);
    graphics.fill();
    graphics.strokeColor = rgba(205, 154, 72, 205);
    graphics.lineWidth = Math.max(1.2, 1.5 * scale);
    graphics.circle(0, 10 * scale, size * 0.42);
    graphics.stroke();
    this.drawActionGlyph(graphics, key, size, scale);
    const text = this.host.addChildLabel(node, 'GachaActionLabel', label, 0, -size * 0.42, 17 * scale, rgba(225, 190, 112), new Size(size + 24 * scale, 24 * scale));
    text.overflow = Label.Overflow.SHRINK;
    this.applyOutline(text, scale, false);
  }

  private drawActionGlyph(graphics: Graphics, key: GachaActionKey, size: number, scale: number): void {
    graphics.strokeColor = rgba(244, 203, 113, 230);
    graphics.lineWidth = Math.max(2, 2 * scale);
    if (key === 'info') {
      graphics.moveTo(-size * 0.18, 10 * scale);
      graphics.lineTo(size * 0.18, 10 * scale);
      graphics.moveTo(-size * 0.1, size * 0.19);
      graphics.lineTo(-size * 0.2, -size * 0.05);
      graphics.moveTo(size * 0.1, size * 0.19);
      graphics.lineTo(size * 0.2, -size * 0.05);
      graphics.stroke();
      return;
    }
    if (key === 'record') {
      graphics.rect(-size * 0.16, -size * 0.08, size * 0.32, size * 0.32);
      graphics.moveTo(-size * 0.08, size * 0.14);
      graphics.lineTo(size * 0.08, size * 0.14);
      graphics.moveTo(-size * 0.08, size * 0.04);
      graphics.lineTo(size * 0.08, size * 0.04);
      graphics.stroke();
      return;
    }
    if (key === 'exchange') {
      graphics.moveTo(-size * 0.18, size * 0.08);
      graphics.lineTo(size * 0.14, size * 0.08);
      graphics.lineTo(size * 0.05, size * 0.17);
      graphics.moveTo(size * 0.18, -size * 0.08);
      graphics.lineTo(-size * 0.14, -size * 0.08);
      graphics.lineTo(-size * 0.05, -size * 0.17);
      graphics.stroke();
      return;
    }
    graphics.moveTo(0, size * 0.19);
    graphics.lineTo(size * 0.14, 4 * scale);
    graphics.lineTo(size * 0.08, -size * 0.18);
    graphics.lineTo(-size * 0.08, -size * 0.18);
    graphics.lineTo(-size * 0.14, 4 * scale);
    graphics.close();
    graphics.stroke();
  }

  private resolveRightActions(selectedPool: GachaPreviewPool): Array<{ key: GachaActionKey; label: string; note: string }> {
    return GACHA_RIGHT_ACTIONS.map((action) => ({
      key: action.key,
      label: action.label,
      note: action.key === 'info'
        ? [selectedPool.rateNote, selectedPool.guaranteeNote].filter((text) => Boolean(text)).join(' / ') || action.note
        : action.key === 'record'
          ? selectedPool.recordNote ?? action.note
          : action.key === 'exchange'
            ? selectedPool.exchangeNote ?? action.note
            : selectedPool.noticeText ?? action.note,
    }));
  }

  private renderUpPreview(parent: Node, layout: UiLayout, scale: number): void {
    const width = 238 * scale;
    const height = 132 * scale;
    const x = layout.stageRight - width / 2 - 22 * scale;
    const y = layout.stageBottom + height / 2 + 26 * scale;
    const panel = this.host.addChildBeveledPanelNode(parent, 'GachaUpPreviewPanel', x, y, width, height, rgba(8, 7, 8, 206), rgba(184, 134, 57, 184), 12 * scale);
    const title = this.host.addChildLabel(panel, 'GachaUpTitle', '概率提升预览', 0, 31 * scale, 21 * scale, rgba(245, 213, 139), new Size(width - 28 * scale, 30 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const line = this.host.addChildLabel(panel, 'GachaUpLine', '限定英雄卡池规则冻结后接入', 0, -3 * scale, 15 * scale, rgba(201, 170, 109), new Size(width - 32 * scale, 44 * scale));
    line.overflow = Label.Overflow.SHRINK;
  }

  private renderBottomSummonBar(parent: Node, layout: UiLayout, scale: number, selectedPool: GachaPreviewPool, state: GachaSceneState): void {
    const y = layout.stageBottom + 62 * scale;
    const onceWidth = 300 * scale;
    const tenWidth = 360 * scale;
    const buttonGap = 72 * scale;
    const onceX = -(tenWidth + buttonGap) / 2;
    const tenX = (onceWidth + buttonGap) / 2;
    const singleCost = selectedPool.singleCost ?? 1;
    const tenCost = selectedPool.tenCost ?? 10;
    const costCode = selectedPool.costCode ?? '预览';
    this.renderSummonButton(parent, layout, 'once', 'GachaSummonOnceButton', selectedPool.buttonSingleText ?? '召唤1次', `${costCode} ${singleCost}`, onceX, y, onceWidth, 58 * scale, scale, false, selectedPool, state);
    this.renderSummonButton(parent, layout, 'ten', 'GachaSummonTenButton', selectedPool.buttonTenText ?? '召唤10次', `${costCode} ${tenCost}`, tenX, y, tenWidth, 62 * scale, scale, true, selectedPool, state);
  }

  private renderSummonButton(parent: Node, layout: UiLayout, mode: GachaPreviewResultMode, name: string, title: string, cost: string, x: number, y: number, width: number, height: number, scale: number, strong: boolean, selectedPool: GachaPreviewPool, state: GachaSceneState): void {
    const node = this.host.addChildPlainNode(parent, name, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => {
      if (state.drawing) {
        this.host.setStatus('召唤请求处理中，请勿重复点击。');
        return;
      }
      if (selectedPool.locked || selectedPool.previewOnly || !selectedPool.drawEnabled) {
        this.host.setStatus(selectedPool.buttonDisabledReason ?? '该卡池暂未开放真实抽卡。');
        return;
      }
      this.host.startGachaDraw(mode);
    }, this);
    this.host.applyImageButtonFeedback(node, 1.028, 0.965);
    const graphics = node.addComponent(Graphics);
    const enabled = !state.drawing && !selectedPool.locked && !selectedPool.previewOnly && selectedPool.drawEnabled !== false;
    graphics.fillColor = enabled ? (strong ? rgba(82, 15, 17, 232) : rgba(9, 9, 12, 226)) : rgba(18, 18, 20, 214);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = enabled ? (strong ? rgba(229, 67, 47, 230) : rgba(205, 154, 72, 214)) : rgba(116, 102, 78, 170);
    graphics.lineWidth = Math.max(1.5, 1.8 * scale);
    graphics.stroke();
    graphics.fillColor = strong ? rgba(231, 37, 38, 36) : rgba(231, 182, 92, 24);
    graphics.rect(-width / 2, 0, width, height / 2);
    graphics.fill();
    const label = this.host.addChildLabel(node, `${name}Label`, state.drawing ? '召唤中' : title, 28 * scale, 2 * scale, 25 * scale, enabled ? rgba(248, 221, 160) : rgba(168, 154, 122), new Size(width * 0.62, height), HorizontalTextAlignment.CENTER);
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, true);
    const costLabel = this.host.addChildLabel(node, `${name}Cost`, cost, -width / 2 + 80 * scale, 0, 16 * scale, rgba(181, 209, 255), new Size(118 * scale, height), HorizontalTextAlignment.LEFT);
    costLabel.overflow = Label.Overflow.SHRINK;
  }

  private renderRevealSceneContent(parent: Node, layout: UiLayout, scale: number, mode: GachaPreviewResultMode): void {
    const results = mode === 'once' ? GACHA_MOCK_RESULT_ONCE : GACHA_MOCK_RESULT_TEN;
    const veil = this.host.addChildPlainNode(parent, 'GachaRevealSceneVeil', 0, 0, layout.width, layout.height);
    const veilGraphics = veil.addComponent(Graphics);
    veilGraphics.fillColor = rgba(0, 0, 0, 118);
    veilGraphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    veilGraphics.fill();

    const stageWidth = clamp(layout.stageWidth * 0.58, 430 * scale, 860 * scale);
    const stageHeight = clamp(layout.stageHeight * 0.58, 330 * scale, 560 * scale);
    const stage = this.host.addChildPlainNode(parent, 'GachaRevealSceneContent', 0, -10 * scale, stageWidth, stageHeight);
    stage.addComponent(BlockInputEvents);
    const graphics = stage.addComponent(Graphics);
    graphics.fillColor = rgba(8, 6, 8, 158);
    graphics.rect(-stageWidth / 2, -stageHeight / 2, stageWidth, stageHeight);
    graphics.fill();
    graphics.strokeColor = rgba(214, 157, 72, 152);
    graphics.lineWidth = Math.max(1.2, 1.6 * scale);
    graphics.stroke();

    this.drawRevealSigil(stage, stageWidth, stageHeight, scale);
    this.renderRevealHeader(stage, mode, stageWidth, stageHeight, scale);
    this.renderRevealCardFan(stage, results, mode, stageWidth, stageHeight, scale);
    this.renderRevealStepTimeline(stage, stageWidth, stageHeight, scale);
    this.renderRevealNoWriteStrip(parent, layout, scale);
    this.renderRevealContinueButton(parent, mode, layout, scale);
  }

  private renderRevealHeader(parent: Node, mode: GachaPreviewResultMode, width: number, height: number, scale: number): void {
    const title = this.host.addChildLabel(parent, 'GachaRevealSceneTitle', mode === 'once' ? '单次召唤演出预览' : '十连召唤演出预览', 0, height / 2 - 42 * scale, 30 * scale, rgba(253, 224, 151), new Size(width - 70 * scale, 42 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const subtitle = this.host.addChildLabel(parent, 'GachaRevealSceneSubtitle', '当前只展示本地 mock 揭示节奏，不代表真实概率或奖励。', 0, height / 2 - 76 * scale, 16 * scale, rgba(194, 168, 114), new Size(width - 78 * scale, 26 * scale));
    subtitle.overflow = Label.Overflow.SHRINK;
  }

  private renderRevealCardFan(parent: Node, results: GachaMockResultItem[], mode: GachaPreviewResultMode, width: number, height: number, scale: number): void {
    if (mode === 'once') {
      const cardHeight = Math.min(height * 0.52, 280 * scale);
      const cardWidth = cardHeight / 1.46;
      this.renderRevealCardBack(parent, results[0], 0, 0, 4 * scale, cardWidth, cardHeight, scale, true);
      return;
    }

    const columns = 5;
    const rows = 2;
    const gapX = 14 * scale;
    const gapY = 14 * scale;
    const maxWidth = width - 84 * scale;
    const maxHeight = height * 0.43;
    let cardWidth = Math.min(108 * scale, (maxWidth - gapX * (columns - 1)) / columns);
    let cardHeight = cardWidth * 1.46;
    const rowHeightLimit = (maxHeight - gapY * (rows - 1)) / rows;
    if (cardHeight > rowHeightLimit) {
      cardHeight = rowHeightLimit;
      cardWidth = cardHeight / 1.46;
    }
    const gridWidth = columns * cardWidth + (columns - 1) * gapX;
    const gridHeight = rows * cardHeight + (rows - 1) * gapY;
    const startX = -gridWidth / 2 + cardWidth / 2;
    const startY = 30 * scale + gridHeight / 2 - cardHeight / 2;
    results.forEach((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      this.renderRevealCardBack(parent, item, index, startX + column * (cardWidth + gapX), startY - row * (cardHeight + gapY), cardWidth, cardHeight, scale, item.featured);
    });
  }

  private renderRevealCardBack(parent: Node, item: GachaMockResultItem, index: number, x: number, y: number, width: number, height: number, scale: number, featured: boolean): void {
    const node = this.host.addChildPlainNode(parent, `GachaRevealCardBack_${index}_${item.rarity}`, x, y, width, height);
    const opacity = node.addComponent(UIOpacity);
    opacity.opacity = 0;
    tween(opacity).delay(index * 0.055).to(0.2, { opacity: 255 }).start();

    const tone = gachaRarityTone(item.rarity);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(5, 5, 8, 228);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = new Color(tone.glow.r, tone.glow.g, tone.glow.b, featured ? 92 : 58);
    graphics.rect(-width / 2, -height * 0.08, width, height * 0.58);
    graphics.fill();
    graphics.strokeColor = featured ? rgba(255, 224, 122, 255) : tone.stroke;
    graphics.lineWidth = Math.max(1.4, featured ? 2.8 * scale : 1.5 * scale);
    graphics.stroke();
    this.drawCardOrnaments(graphics, width, height, scale, featured);
    this.drawRevealCardSeal(graphics, width, height, scale, tone.stroke);
    const label = this.host.addChildLabel(node, 'GachaRevealCardBackLabel', featured ? 'UP' : item.rarity, 0, -height / 2 + 24 * scale, featured ? 20 * scale : 16 * scale, tone.text, new Size(width - 20 * scale, 26 * scale));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, true);
  }

  private drawRevealSigil(parent: Node, width: number, height: number, scale: number): void {
    const sigil = this.host.addChildPlainNode(parent, 'GachaRevealSigilPulse', 0, 34 * scale, width * 0.68, height * 0.54);
    const graphics = sigil.addComponent(Graphics);
    const radius = Math.min(width, height) * 0.23;
    graphics.strokeColor = rgba(230, 70, 54, 118);
    graphics.lineWidth = Math.max(1.4, 1.8 * scale);
    graphics.circle(0, 0, radius);
    graphics.circle(0, 0, radius * 0.68);
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const start = radius * 0.38;
      const end = radius * 1.08;
      graphics.moveTo(Math.cos(angle) * start, Math.sin(angle) * start);
      graphics.lineTo(Math.cos(angle) * end, Math.sin(angle) * end);
    }
    graphics.stroke();
    graphics.fillColor = rgba(180, 18, 26, 48);
    graphics.circle(0, 0, radius * 0.82);
    graphics.fill();
    const opacity = sigil.addComponent(UIOpacity);
    opacity.opacity = 160;
    tween(opacity).repeatForever(tween().to(0.75, { opacity: 238 }).to(0.75, { opacity: 132 })).start();
  }

  private drawRevealCardSeal(graphics: Graphics, width: number, height: number, scale: number, color: Color): void {
    graphics.strokeColor = new Color(color.r, color.g, color.b, 170);
    graphics.lineWidth = Math.max(1.2, 1.5 * scale);
    graphics.circle(0, height * 0.12, Math.min(width, height) * 0.18);
    graphics.moveTo(-width * 0.18, height * 0.12);
    graphics.lineTo(width * 0.18, height * 0.12);
    graphics.moveTo(0, height * 0.3);
    graphics.lineTo(0, -height * 0.06);
    graphics.moveTo(-width * 0.23, -height * 0.12);
    graphics.lineTo(width * 0.23, height * 0.36);
    graphics.moveTo(width * 0.23, -height * 0.12);
    graphics.lineTo(-width * 0.23, height * 0.36);
    graphics.stroke();
  }

  private renderRevealStepTimeline(parent: Node, width: number, height: number, scale: number): void {
    const y = -height / 2 + 58 * scale;
    const totalWidth = width - 112 * scale;
    const stepGap = totalWidth / Math.max(1, GACHA_REVEAL_STEPS.length - 1);
    const startX = -totalWidth / 2;
    const lineNode = this.host.addChildPlainNode(parent, 'GachaRevealStepProgressLine', 0, y + 16 * scale, totalWidth, 30 * scale);
    const graphics = lineNode.addComponent(Graphics);
    graphics.strokeColor = rgba(126, 91, 48, 176);
    graphics.lineWidth = Math.max(1.4, 1.8 * scale);
    graphics.moveTo(-totalWidth / 2, 0);
    graphics.lineTo(totalWidth / 2, 0);
    graphics.stroke();
    GACHA_REVEAL_STEPS.forEach((step, index) => {
      this.renderRevealStep(parent, step, startX + stepGap * index, y, totalWidth, scale, index);
    });
  }

  private renderRevealStep(parent: Node, step: GachaRevealStep, x: number, y: number, totalWidth: number, scale: number, index: number): void {
    const node = this.host.addChildPlainNode(parent, `GachaRevealStep_${index}`, x, y + 16 * scale, 132 * scale, 68 * scale);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(7, 6, 8, 196);
    graphics.circle(0, 0, 13 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(229, 175, 86, 210);
    graphics.lineWidth = Math.max(1.2, 1.5 * scale);
    graphics.circle(0, 0, 13 * scale);
    graphics.stroke();
    const title = this.host.addChildLabel(node, 'GachaRevealStepTitle', step.title, 0, -25 * scale, 16 * scale, rgba(238, 205, 132), new Size(96 * scale, 22 * scale));
    title.overflow = Label.Overflow.SHRINK;
    const detail = this.host.addChildLabel(node, 'GachaRevealStepDetail', step.detail, 0, -45 * scale, 12 * scale, rgba(161, 137, 96), new Size(Math.min(170 * scale, totalWidth / 3), 18 * scale));
    detail.overflow = Label.Overflow.SHRINK;
  }

  private renderRevealNoWriteStrip(parent: Node, layout: UiLayout, scale: number): void {
    const width = Math.min(layout.safeWidth - 72 * scale, 760 * scale);
    const y = layout.stageBottom + 124 * scale;
    const strip = this.host.addChildPlainNode(parent, 'GachaRevealNoWriteStrip', 0, y, width, 36 * scale);
    const graphics = strip.addComponent(Graphics);
    graphics.fillColor = rgba(3, 4, 7, 184);
    graphics.rect(-width / 2, -18 * scale, width, 36 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(181, 134, 65, 138);
    graphics.stroke();
    const label = this.host.addChildLabel(strip, 'GachaRevealNoWriteText', '视觉演出阶段：不扣资源、不生成 drawNo、不写记录、不更新保底。', 0, 1 * scale, 15 * scale, rgba(187, 164, 112), new Size(width - 28 * scale, 28 * scale));
    label.overflow = Label.Overflow.SHRINK;
  }

  private renderRevealContinueButton(parent: Node, mode: GachaPreviewResultMode, layout: UiLayout, scale: number): void {
    const width = mode === 'once' ? 270 * scale : 310 * scale;
    const height = 54 * scale;
    const y = layout.stageBottom + 62 * scale;
    const button = this.host.addChildPlainNode(parent, 'GachaRevealContinueButton', 0, y, width, height);
    button.addComponent(Button);
    button.on(Button.EventType.CLICK, () => {
      this.host.setStatus('查看本地 mock 结果：仍不扣资源、不发英雄、不写入抽卡记录或保底。');
      this.host.openGachaMockResultScene(mode);
    }, this);
    this.host.applyImageButtonFeedback(button, 1.035, 0.965);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = rgba(82, 15, 17, 235);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(230, 73, 52, 235);
    graphics.lineWidth = Math.max(1.5, 1.8 * scale);
    graphics.stroke();
    graphics.fillColor = rgba(231, 37, 38, 34);
    graphics.rect(-width / 2, 0, width, height / 2);
    graphics.fill();
    const label = this.host.addChildLabel(button, 'GachaRevealContinueLabel', '查看本地结果', 0, 1 * scale, 22 * scale, rgba(250, 224, 162), new Size(width - 36 * scale, height));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, true);
  }

  private renderMockResultSceneContent(parent: Node, layout: UiLayout, scale: number, mode: GachaPreviewResultMode, drawResult: GachaDrawResultVO | null): void {
    const results = drawResult ? this.toResultPreviewItems(drawResult.items) : (mode === 'once' ? GACHA_MOCK_RESULT_ONCE : GACHA_MOCK_RESULT_TEN);
    const backdropNode = this.host.addChildPlainNode(parent, 'GachaResultSceneBackdrop', 0, 0, layout.width, layout.height);
    const backdrop = backdropNode.addComponent(Graphics);
    backdrop.fillColor = rgba(0, 0, 0, 178);
    backdrop.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    backdrop.fill();
    backdrop.fillColor = rgba(104, 8, 14, 55);
    backdrop.circle(0, 0, Math.min(layout.width, layout.height) * 0.36);
    backdrop.fill();

    const panelWidth = Math.max(320 * scale, layout.safeWidth - 34 * scale);
    const panelHeight = Math.max(260 * scale, layout.safeHeight - 96 * scale);
    const panel = this.host.addChildBeveledPanelNode(parent, 'GachaResultScenePanel', 0, -24 * scale, panelWidth, panelHeight, rgba(8, 7, 8, 236), rgba(213, 160, 74, 224), 16 * scale);
    panel.addComponent(BlockInputEvents);

    const title = this.host.addChildLabel(panel, 'GachaResultSceneTitle', drawResult ? '召唤结果' : (mode === 'once' ? '召唤结果预览' : '十连结果预览'), 0, panelHeight / 2 - 48 * scale, 31 * scale, rgba(252, 222, 153), new Size(panelWidth - 118 * scale, 46 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    const subtitleText = drawResult ? `真实 drawNo：${drawResult.drawNo}` : '本结果为本地 mock：未扣资源、未写入抽卡记录、未发放英雄、未更新保底。';
    const subtitle = this.host.addChildLabel(panel, 'GachaResultSceneNoWriteNote', subtitleText, 0, -panelHeight / 2 + 82 * scale, 15 * scale, rgba(186, 162, 116), new Size(panelWidth - 52 * scale, 30 * scale));
    subtitle.overflow = Label.Overflow.SHRINK;

    this.renderMockResultCards(panel, results, mode, panelWidth, panelHeight, scale);
    this.renderMockResultCloseButton(panel, panelWidth, panelHeight, scale);
    this.renderMockResultConfirmButton(panel, panelWidth, panelHeight, scale);
  }

  private toResultPreviewItems(items: GachaDrawItemVO[]): GachaMockResultItem[] {
    return items.map((item) => {
      const rarity = this.normalizeRarity(item.rarity);
      return {
        name: item.rewardName || item.rewardCode,
        title: item.duplicate ? `重复转化 ${item.fragmentCount ?? 0} 碎片` : item.rewardCode,
        rarity,
        stars: rarity === 'UR' ? 7 : rarity === 'SSR' ? 6 : rarity === 'SR' ? 4 : 2,
        scale: rarity === 'UR' || rarity === 'SSR' ? 1 : rarity === 'SR' ? 0.86 : 0.72,
        kind: item.rewardType === 'HERO_FRAGMENT' ? 'shard' : item.rewardType === 'HERO' ? 'hero' : 'material',
        featured: item.up,
      };
    });
  }

  private normalizeRarity(rarity: string): GachaRarity {
    const value = rarity.toUpperCase();
    if (value === 'UR' || value === 'SSR' || value === 'SR') {
      return value;
    }
    return 'R';
  }

  private renderMockResultCards(parent: Node, results: GachaMockResultItem[], mode: GachaPreviewResultMode, panelWidth: number, panelHeight: number, scale: number): void {
    const top = panelHeight / 2 - 106 * scale;
    const bottom = -panelHeight / 2 + 126 * scale;
    const availableHeight = Math.max(120 * scale, top - bottom);
    if (mode === 'once') {
      const cardHeight = Math.min(availableHeight, 300 * scale);
      const cardWidth = cardHeight / 1.48;
      this.renderMockResultCard(parent, results[0], 0, (top + bottom) / 2, cardWidth, cardHeight, scale, true);
      return;
    }

    const columns = 5;
    const rows = Math.ceil(results.length / columns);
    const gapX = Math.max(6 * scale, 16 * scale);
    const gapY = Math.max(8 * scale, 18 * scale);
    const availableWidth = Math.max(220 * scale, panelWidth - 78 * scale);
    let cardWidth = Math.min(128 * scale, (availableWidth - gapX * (columns - 1)) / columns);
    let cardHeight = cardWidth * 1.46;
    const maxCardHeight = (availableHeight - gapY * (rows - 1)) / rows;
    if (cardHeight > maxCardHeight) {
      cardHeight = maxCardHeight;
      cardWidth = cardHeight / 1.46;
    }
    const gridWidth = columns * cardWidth + (columns - 1) * gapX;
    const gridHeight = rows * cardHeight + (rows - 1) * gapY;
    const startX = -gridWidth / 2 + cardWidth / 2;
    const startY = (top + bottom) / 2 + gridHeight / 2 - cardHeight / 2;
    results.forEach((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * (cardWidth + gapX);
      const y = startY - row * (cardHeight + gapY);
      this.renderMockResultCard(parent, item, x, y, cardWidth, cardHeight, scale, item.featured);
    });
  }

  private renderMockResultCard(parent: Node, item: GachaMockResultItem, x: number, y: number, width: number, height: number, scale: number, featured: boolean): void {
    const node = this.host.addChildPlainNode(parent, `GachaMockResultCard_${item.rarity}_${safeText(item.name)}`, x, y, width, height);
    const tone = gachaRarityTone(item.rarity);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = tone.fill;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = tone.glow;
    graphics.rect(-width / 2, height * 0.06, width, height * 0.44);
    graphics.fill();
    graphics.strokeColor = featured ? rgba(255, 224, 122, 255) : tone.stroke;
    graphics.lineWidth = Math.max(1.4, featured ? 3 * scale : 1.5 * scale);
    graphics.stroke();
    this.drawCardOrnaments(graphics, width, height, scale, featured);
    this.drawPortraitSilhouette(graphics, width, height, scale, item.rarity);

    const rarity = this.host.addChildLabel(node, 'GachaMockResultRarity', item.rarity, -width / 2 + 12 * scale, height / 2 - 24 * scale, featured ? 26 * scale : 21 * scale, tone.text, new Size(width - 24 * scale, 32 * scale), HorizontalTextAlignment.LEFT);
    rarity.overflow = Label.Overflow.SHRINK;
    this.applyOutline(rarity, scale, true);
    const kind = item.kind === 'hero' ? '英雄' : item.kind === 'shard' ? '碎片' : '材料';
    const kindLabel = this.host.addChildLabel(node, 'GachaMockResultKind', kind, width / 2 - 34 * scale, height / 2 - 24 * scale, 14 * scale, rgba(232, 199, 124), new Size(52 * scale, 24 * scale), HorizontalTextAlignment.RIGHT);
    kindLabel.overflow = Label.Overflow.SHRINK;

    const name = this.host.addChildLabel(node, 'GachaMockResultName', item.name, 0, -height / 2 + 54 * scale, featured ? 22 * scale : 17 * scale, rgba(249, 224, 166), new Size(width - 20 * scale, 30 * scale));
    name.overflow = Label.Overflow.SHRINK;
    this.applyOutline(name, scale, true);
    const title = this.host.addChildLabel(node, 'GachaMockResultSubtitle', item.title, 0, -height / 2 + 29 * scale, 14 * scale, rgba(201, 169, 111), new Size(width - 20 * scale, 22 * scale));
    title.overflow = Label.Overflow.SHRINK;
    const stars = this.host.addChildLabel(node, 'GachaMockResultStars', '★'.repeat(item.stars), 0, -height / 2 + 10 * scale, 15 * scale, tone.text, new Size(width - 18 * scale, 18 * scale));
    stars.overflow = Label.Overflow.SHRINK;
  }

  private renderMockResultCloseButton(parent: Node, panelWidth: number, panelHeight: number, scale: number): void {
    const button = this.host.addChildPlainNode(parent, 'GachaResultSceneCloseButton', panelWidth / 2 - 34 * scale, panelHeight / 2 - 34 * scale, 42 * scale, 42 * scale);
    button.addComponent(Button);
    button.on(Button.EventType.CLICK, () => {
      this.host.closeGachaMockResultScene();
      this.host.setStatus('已关闭召唤结果，兑换和补发入口仍未开放。');
    }, this);
    this.host.applyImageButtonFeedback(button, 1.08, 0.94);
    const graphics = button.addComponent(Graphics);
    graphics.strokeColor = rgba(221, 173, 86, 220);
    graphics.lineWidth = Math.max(1.5, 2 * scale);
    graphics.circle(0, 0, 18 * scale);
    graphics.moveTo(-7 * scale, 7 * scale);
    graphics.lineTo(7 * scale, -7 * scale);
    graphics.moveTo(7 * scale, 7 * scale);
    graphics.lineTo(-7 * scale, -7 * scale);
    graphics.stroke();
  }

  private renderMockResultConfirmButton(parent: Node, panelWidth: number, panelHeight: number, scale: number): void {
    const width = Math.min(260 * scale, panelWidth - 92 * scale);
    const height = 48 * scale;
    const button = this.host.addChildPlainNode(parent, 'GachaResultSceneConfirmButton', 0, -panelHeight / 2 + 38 * scale, width, height);
    button.addComponent(Button);
    button.on(Button.EventType.CLICK, () => {
      this.host.closeGachaMockResultScene();
      this.host.setStatus('已返回召唤页；兑换和补发入口仍未开放。');
    }, this);
    this.host.applyImageButtonFeedback(button, 1.035, 0.965);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = rgba(78, 14, 17, 232);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(226, 71, 52, 230);
    graphics.lineWidth = Math.max(1.5, 1.8 * scale);
    graphics.stroke();
    const label = this.host.addChildLabel(button, 'GachaResultSceneConfirmLabel', '返回召唤', 0, 1 * scale, 22 * scale, rgba(250, 224, 162), new Size(width - 30 * scale, height));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, true);
  }

  private renderCompactContent(parent: Node, layout: UiLayout, scale: number, state: GachaSceneState): void {
    const tabsY = layout.stageTop - 92 * scale;
    const tabWidth = Math.max(92 * scale, Math.min(150 * scale, layout.stageWidth / 4.8));
    const tabGap = 7 * scale;
    const visiblePools = this.resolvePools(state).slice(0, 4);
    const startX = -((visiblePools.length - 1) * (tabWidth + tabGap)) / 2;
    visiblePools.forEach((pool, index) => {
      const active = pool.poolCode === state.selectedPoolCode || pool.id === state.selectedPoolCode || pool.active;
      this.renderCompactPoolTab(parent, { ...pool, active }, startX + index * (tabWidth + tabGap), tabsY, tabWidth, 42 * scale, scale);
    });
    const selectedPool = this.resolveSelectedPool(state);
    this.renderCenterStage(parent, layout, scale * 0.9, selectedPool, state);
    this.renderCompactActionBar(parent, layout, scale, selectedPool);
    this.renderBottomSummonBar(parent, layout, scale, selectedPool, state);
  }

  private renderCompactActionBar(parent: Node, layout: UiLayout, scale: number, selectedPool: GachaPreviewPool): void {
    const actions = this.resolveRightActions(selectedPool);
    const width = Math.min(layout.safeWidth - 34 * scale, 520 * scale);
    const gap = 6 * scale;
    const buttonWidth = (width - gap * (actions.length - 1)) / actions.length;
    const y = layout.stageBottom + 134 * scale;
    const startX = -width / 2 + buttonWidth / 2;
    actions.forEach((action, index) => {
      const node = this.host.addChildPlainNode(parent, `GachaCompactAction_${action.key}`, startX + index * (buttonWidth + gap), y, buttonWidth, 34 * scale);
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, () => {
        this.host.setStatus(action.note);
        this.host.openGachaActionScene(action.key);
      }, this);
      this.host.applyImageButtonFeedback(node, 1.025, 0.97);
      const graphics = node.addComponent(Graphics);
      graphics.fillColor = rgba(7, 7, 10, 184);
      graphics.rect(-buttonWidth / 2, -17 * scale, buttonWidth, 34 * scale);
      graphics.fill();
      graphics.strokeColor = rgba(177, 127, 60, 160);
      graphics.stroke();
      const label = this.host.addChildLabel(node, 'GachaCompactActionLabel', action.label, 0, 0, 13 * scale, rgba(225, 190, 112), new Size(buttonWidth - 8 * scale, 30 * scale));
      label.overflow = Label.Overflow.SHRINK;
    });
  }

  private renderCompactPoolTab(parent: Node, pool: GachaPreviewPool, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, `GachaCompactPool_${pool.id}`, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.host.selectGachaPool(pool.poolCode ?? pool.id), this);
    this.host.applyImageButtonFeedback(node, 1.025, 0.975);
    const tone = gachaRarityTone(pool.rarity);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = pool.active ? rgba(62, 9, 12, 218) : rgba(5, 5, 8, 178);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = pool.active ? tone.stroke : rgba(145, 107, 56, 130);
    graphics.stroke();
    const label = this.host.addChildLabel(node, 'GachaCompactPoolLabel', pool.title, 0, 0, 16 * scale, rgba(240, 207, 134), new Size(width - 12 * scale, height));
    label.overflow = Label.Overflow.SHRINK;
  }

  private applyOutline(label: Label, scale: number, strong: boolean): void {
    label.enableOutline = true;
    label.outlineColor = rgba(0, 0, 0, strong ? 230 : 190);
    label.outlineWidth = Math.max(1, (strong ? 1.5 : 1) * scale);
  }
}

function compactValue(value: unknown): string {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return '0';
  }
  if (numberValue >= 1_000_000_000) {
    return `${Math.floor(numberValue / 100_000_000) / 10}B`;
  }
  if (numberValue >= 1_000_000) {
    return `${Math.floor(numberValue / 100_000) / 10}M`;
  }
  if (numberValue >= 100_000) {
    return `${Math.floor(numberValue / 100) / 10}K`;
  }
  return Math.floor(numberValue).toLocaleString('en-US');
}

function formatDecimalValue(value: unknown): string {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) {
    return '0';
  }
  return numberValue.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function rewardTypeLabel(rewardType: string): string {
  const type = (rewardType || '').toUpperCase();
  if (type === 'HERO') {
    return '英雄';
  }
  if (type === 'HERO_FRAGMENT') {
    return '英雄碎片';
  }
  if (type === 'ITEM') {
    return '道具';
  }
  if (type === 'CURRENCY') {
    return '货币';
  }
  return safeText(rewardType || '奖励');
}

function formatDateTime(value: string | null | undefined): string {
  const text = safeText(value || '');
  if (!text) {
    return '-';
  }
  return text.replace('T', ' ').slice(0, 19);
}
