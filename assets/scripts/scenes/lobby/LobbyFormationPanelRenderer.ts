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
import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../../types/LobbyHeroTypes';
import { safeText } from '../UiTextFormatter';
import { renderSceneBackButton } from '../UiSceneBackButton';
import { rgba, type UiLayout } from './LobbyHudTypes';

export interface LobbyFormationPanelHost {
  node: Node;
  currentLobbyHeroRosterState(): LobbyHeroRosterPanelState;
  currentLobbySelectedStageCode(): string;
  currentLobbyFormationHeroIds(): number[];
  toggleLobbyFormationHero(heroId: number): void;
  openLobbyBattlePreviewPanel(stageCode: string): void;
  closeLobbyFormationPanel(): void;
  reloadLobbyHeroRoster(): void;
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

/** 编队确认面板；只确认本次 battle start 阵容，不保存长期队伍，也不触发经济写入。 */
export class LobbyFormationPanelRenderer {
  constructor(private readonly host: LobbyFormationPanelHost) {}

  render(layout: UiLayout): void {
    const state = this.host.currentLobbyHeroRosterState();
    const selectedStageCode = this.host.currentLobbySelectedStageCode();
    const selectedHeroIds = this.host.currentLobbyFormationHeroIds();
    const scale = Math.max(0.62, Math.min(1, layout.uiScale));
    const panelWidth = Math.max(320 * scale, layout.stageWidth);
    const panelHeight = Math.max(270 * scale, layout.stageHeight);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;

    const dim = this.createUiNode('LobbyFormationDim');
    dim.setPosition(new Vec3(centerX, centerY, 0));
    dim.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const dimGraphics = dim.addComponent(Graphics);
    dimGraphics.fillColor = rgba(0, 0, 0, 0);
    dimGraphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    dimGraphics.fill();
    // 功能页采用场景式导航，遮罩只阻断底层输入，不再承担点击关闭语义。
    dim.addComponent(BlockInputEvents);

    const panelGroup = this.createUiNode('LobbyFormationSceneContent');
    panelGroup.setPosition(new Vec3(centerX, centerY, 0));
    panelGroup.addComponent(UITransform).setContentSize(new Size(panelWidth, panelHeight));
    // 面板内容区阻挡输入，避免点英雄槽时穿透遮罩关闭弹窗。
    panelGroup.addComponent(BlockInputEvents);
    const panel = this.host.addChildBeveledPanelNode(
      panelGroup,
      'LobbyFormationSceneFrame',
      0,
      0,
      panelWidth,
      panelHeight,
      rgba(5, 5, 8, 232),
      rgba(195, 144, 61, 230),
      18 * scale,
    );
    this.drawPanelAtmosphere(panel, panelWidth, panelHeight, scale);
    this.renderHeader(panel, panelWidth, panelHeight, scale, state, selectedStageCode, selectedHeroIds);
    this.renderBody(panel, panelWidth, panelHeight, scale, state, selectedHeroIds);
    this.renderFooter(panel, panelWidth, panelHeight, scale, selectedStageCode, state);
    renderSceneBackButton(this.host, panelGroup, layout, 'LobbyFormationBackButton', () => this.host.closeLobbyFormationPanel(), scale, '编队');
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private renderHeader(parent: Node, width: number, height: number, scale: number, state: LobbyHeroRosterPanelState, stageCode: string, selectedHeroIds: number[]): void {
    const title = this.host.addChildLabel(parent, 'LobbyFormationTitle', '编队确认', 0, height / 2 - 44 * scale, 29 * scale, rgba(252, 225, 158), new Size(width - 100 * scale, 40 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const selectedCount = this.resolveSelectedSlots(state.heroes, selectedHeroIds).filter((hero) => hero !== null).length;
    const statusText = state.loading
      ? '正在读取可上阵英雄...'
      : state.error
        ? '英雄队列暂不可用，当前不能进入战斗。'
        : `已确认 ${selectedCount}/5 名出战英雄：目标 ${stageCode}；本次阵容会用于战斗会话，不写经济。`;
    const status = this.host.addChildLabel(parent, 'LobbyFormationStatus', statusText, 0, height / 2 - 78 * scale, 17 * scale, rgba(204, 167, 88), new Size(width - 112 * scale, 28 * scale));
    status.overflow = Label.Overflow.SHRINK;
  }

  private renderBody(parent: Node, width: number, height: number, scale: number, state: LobbyHeroRosterPanelState, selectedHeroIds: number[]): void {
    const top = height / 2 - 112 * scale;
    const bottom = -height / 2 + 86 * scale;
    const compact = width < 720 * scale || height < 450 * scale;
    const availableBodyHeight = Math.max(40 * scale, top - bottom);
    const bodyHeight = compact ? availableBodyHeight : Math.max(150 * scale, availableBodyHeight);
    const bodyWidth = width - 76 * scale;
    if (state.loading && state.heroes.length === 0) {
      this.renderEmpty(parent, bodyWidth, bodyHeight, scale, '正在读取英雄队列，请稍候。');
      return;
    }
    if (state.heroes.length === 0) {
      this.renderEmpty(parent, bodyWidth, bodyHeight, scale, '暂无可展示英雄；请先完成主角创建或刷新英雄队列。');
      return;
    }
    const slots = this.resolveSelectedSlots(state.heroes, selectedHeroIds);
    if (compact) {
      this.renderCompactFormation(parent, slots, bodyWidth, bodyHeight, scale);
      return;
    }
    const slotWidth = (bodyWidth - 40 * scale) / 5;
    const slotHeight = Math.min(154 * scale, bodyHeight * 0.46);
    const slotY = top - slotHeight / 2 - 2 * scale;
    slots.forEach((hero, index) => {
      const x = -bodyWidth / 2 + slotWidth / 2 + index * slotWidth;
      this.renderFormationSlot(parent, hero, index, x, slotY, slotWidth - 8 * scale, slotHeight, scale);
    });
    this.renderCandidateList(parent, state.heroes, selectedHeroIds, 0, bottom + (bodyHeight - slotHeight - 20 * scale) / 2, bodyWidth, bodyHeight - slotHeight - 20 * scale, scale);
  }

  private renderCompactFormation(parent: Node, slots: Array<LobbyHeroItemVO | null>, width: number, height: number, scale: number): void {
    const panel = this.host.addChildPlainNode(parent, 'LobbyFormationCompactBody', 0, -4 * scale, width, height);
    const graphics = panel.addComponent(Graphics);
    this.drawSectionFrame(graphics, width, height, scale, rgba(8, 8, 12, 186));
    // 紧凑编队必须始终放下 5 个槽位，行高跟随实际 body 高度缩放。
    const rowHeight = Math.max(10 * scale, Math.min(42 * scale, (height - 12 * scale) / slots.length));
    const startY = height / 2 - 6 * scale - rowHeight / 2;
    const fontSize = Math.max(7, Math.min(16 * scale, rowHeight * 0.62));
    slots.forEach((hero, index) => {
      const y = startY - index * rowHeight;
      const text = hero ? `${index + 1}. ${hero.heroName}  Lv.${hero.level}  战力 ${formatInteger(hero.power)}` : `${index + 1}. 空位`;
      const label = this.host.addChildLabel(panel, `LobbyFormationCompactSlot_${index}`, text, 0, y, fontSize, rgba(226, 199, 139), new Size(width - 28 * scale, rowHeight), HorizontalTextAlignment.LEFT);
      label.overflow = Label.Overflow.SHRINK;
    });
  }

  private renderFormationSlot(parent: Node, hero: LobbyHeroItemVO | null, index: number, x: number, y: number, width: number, height: number, scale: number): void {
    const slot = this.host.addChildPlainNode(parent, `LobbyFormationSlot_${index}`, x, y, width, height);
    const graphics = slot.addComponent(Graphics);
    graphics.fillColor = hero ? (hero.protagonist ? rgba(45, 12, 14, 220) : rgba(10, 10, 13, 198)) : rgba(6, 6, 8, 170);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = hero?.protagonist ? rgba(226, 166, 72, 220) : rgba(132, 98, 52, 150);
    graphics.lineWidth = Math.max(1, hero?.protagonist ? 1.6 * scale : scale);
    graphics.stroke();
    const title = this.host.addChildLabel(slot, 'LobbyFormationSlotTitle', hero ? safeText(hero.heroName) : '空位', 0, height / 2 - 24 * scale, 18 * scale, rgba(246, 218, 156), new Size(width - 18 * scale, 26 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const badgeText = hero?.protagonist ? '队长 / 主角' : hero ? safeText(hero.rarity) : '待上阵';
    const badge = this.host.addChildLabel(slot, 'LobbyFormationSlotBadge', badgeText, 0, height / 2 - 52 * scale, 14 * scale, hero?.protagonist ? rgba(236, 172, 78) : rgba(185, 160, 105), new Size(width - 18 * scale, 20 * scale));
    badge.overflow = Label.Overflow.SHRINK;
    const level = this.host.addChildLabel(slot, 'LobbyFormationSlotLevel', hero ? `Lv.${hero.level}  星 ${hero.star}` : '未选择', 0, -8 * scale, 14 * scale, rgba(196, 176, 134), new Size(width - 18 * scale, 22 * scale));
    level.overflow = Label.Overflow.SHRINK;
    const power = this.host.addChildLabel(slot, 'LobbyFormationSlotPower', hero ? `战力 ${formatInteger(hero.power)}` : '战力 0', 0, -34 * scale, 16 * scale, rgba(231, 207, 143), new Size(width - 18 * scale, 24 * scale));
    power.overflow = Label.Overflow.SHRINK;
    if (hero && !hero.protagonist) {
      slot.addComponent(Button);
      slot.on(Button.EventType.CLICK, () => this.host.toggleLobbyFormationHero(hero.id), this);
      this.host.applyImageButtonFeedback(slot, 1.018, 0.982);
    }
  }

  private renderCandidateList(parent: Node, heroes: LobbyHeroItemVO[], selectedHeroIds: number[], x: number, y: number, width: number, height: number, scale: number): void {
    const panel = this.host.addChildPlainNode(parent, 'LobbyFormationCandidateList', x, y, width, height);
    const graphics = panel.addComponent(Graphics);
    this.drawSectionFrame(graphics, width, height, scale, rgba(6, 6, 9, 176));
    const title = this.host.addChildLabel(panel, 'LobbyFormationCandidateTitle', '候选英雄（点击上阵/下阵）', -width / 2 + 18 * scale, height / 2 - 24 * scale, 17 * scale, rgba(221, 173, 85), new Size(width - 36 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    const maxRows = Math.max(1, Math.min(4, Math.floor((height - 52 * scale) / (30 * scale))));
    const selectedSet = new Set(selectedHeroIds);
    this.visibleHeroes(heroes).slice(0, maxRows).forEach((hero, index) => {
      const y = height / 2 - 58 * scale - index * 30 * scale;
      const rowWidth = width - 28 * scale;
      const selected = selectedSet.has(hero.id);
      const row = this.host.addChildPlainNode(panel, `LobbyFormationCandidateButton_${hero.id}`, 0, y, rowWidth, 26 * scale);
      const rowGraphics = row.addComponent(Graphics);
      rowGraphics.fillColor = selected ? rgba(70, 20, 22, 190) : rgba(9, 9, 12, 112);
      rowGraphics.rect(-rowWidth / 2, -13 * scale, rowWidth, 26 * scale);
      rowGraphics.fill();
      rowGraphics.strokeColor = selected ? rgba(210, 152, 64, 190) : rgba(112, 83, 44, 120);
      rowGraphics.stroke();
      row.addComponent(Button);
      row.on(Button.EventType.CLICK, () => this.host.toggleLobbyFormationHero(hero.id), this);
      this.host.applyImageButtonFeedback(row, 1.012, 0.988);
      const text = `${selected ? '已上阵' : hero.protagonist ? '队长' : safeText(hero.rarity)}  ${safeText(hero.heroName)}  Lv.${hero.level}  战力 ${formatInteger(hero.power)}`;
      const label = this.host.addChildLabel(row, `LobbyFormationCandidate_${index}`, text, -rowWidth / 2 + 12 * scale, 0, 15 * scale, selected ? rgba(246, 218, 156) : rgba(207, 188, 145), new Size(rowWidth - 24 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
      label.overflow = Label.Overflow.SHRINK;
    });
  }

  private resolveSelectedSlots(heroes: LobbyHeroItemVO[], selectedHeroIds: number[]): Array<LobbyHeroItemVO | null> {
    const visible = this.visibleHeroes(heroes);
    const byId = new Map(visible.map((hero) => [hero.id, hero]));
    const ordered = selectedHeroIds.length > 0
      ? selectedHeroIds.map((heroId) => byId.get(heroId)).filter((hero): hero is LobbyHeroItemVO => !!hero)
      : this.defaultLineup(visible);
    const slots: Array<LobbyHeroItemVO | null> = [];
    for (const hero of ordered) {
      if (slots.length >= 5) {
        break;
      }
      if (!slots.some((slot) => slot?.id === hero.id)) {
        slots.push(hero);
      }
    }
    while (slots.length < 5) {
      slots.push(null);
    }
    return slots;
  }

  private visibleHeroes(heroes: LobbyHeroItemVO[]): LobbyHeroItemVO[] {
    return heroes.filter((hero) => hero.id > 0 && hero.rarity.toUpperCase() !== 'EX' && !hero.heroCode.toUpperCase().startsWith('EX_'));
  }

  private defaultLineup(heroes: LobbyHeroItemVO[]): LobbyHeroItemVO[] {
    return [...heroes].sort((a, b) => Number(b.protagonist) - Number(a.protagonist) || b.power - a.power).slice(0, 5);
  }

  private renderEmpty(parent: Node, width: number, bodyHeight: number, scale: number, text: string): void {
    const box = this.host.addChildPlainNode(parent, 'LobbyFormationEmptyBox', 0, -8 * scale, width, Math.min(160 * scale, bodyHeight));
    const graphics = box.addComponent(Graphics);
    graphics.fillColor = rgba(9, 9, 12, 168);
    graphics.rect(-width / 2, -60 * scale, width, 120 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(148, 110, 56, 124);
    graphics.stroke();
    const label = this.host.addChildLabel(box, 'LobbyFormationEmptyText', text, 0, 0, 18 * scale, rgba(213, 193, 151), new Size(width - 48 * scale, 48 * scale));
    label.overflow = Label.Overflow.SHRINK;
  }

  private renderFooter(parent: Node, width: number, height: number, scale: number, stageCode: string, state: LobbyHeroRosterPanelState): void {
    const note = this.host.addChildLabel(parent, 'LobbyFormationBoundaryNote', '点击候选英雄调整本次出战；阵容只用于 battle start 快照，不保存长期队伍，不改变玩家资源。', 0, -height / 2 + 62 * scale, 15 * scale, rgba(168, 146, 105), new Size(width - 110 * scale, 24 * scale));
    note.overflow = Label.Overflow.SHRINK;
    const reload = this.addFooterButton(parent, 'LobbyFormationReloadButton', '刷新英雄', -72 * scale, -height / 2 + 30 * scale, 124 * scale, 36 * scale, scale);
    reload.on(Button.EventType.CLICK, () => this.host.reloadLobbyHeroRoster(), this);
    const previewEnabled = this.canOpenBattlePreview(state, stageCode);
    const preview = this.addFooterButton(parent, 'LobbyFormationBattlePreviewButton', previewEnabled ? '战斗预演' : state.loading ? '读取中' : '不可出战', 72 * scale, -height / 2 + 30 * scale, 138 * scale, 36 * scale, scale, previewEnabled);
    if (previewEnabled) {
      preview.on(Button.EventType.CLICK, () => this.host.openLobbyBattlePreviewPanel(stageCode), this);
    }
  }

  private canOpenBattlePreview(state: LobbyHeroRosterPanelState, stageCode: string): boolean {
    // 战斗预演只允许在已有可上阵英雄、关卡有效、英雄接口无错误时进入；空阵容阶段直接禁用按钮，不让玩家先进错误页。
    return /^MAIN_\d+_\d+$/.test(stageCode) && !state.error && this.visibleHeroes(state.heroes).length > 0;
  }

  private addFooterButton(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, scale: number, enabled = true): Node {
    const button = this.host.addChildPlainNode(parent, name, x, y, width, height);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = enabled ? rgba(20, 16, 15, 226) : rgba(22, 20, 18, 168);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = enabled ? rgba(188, 137, 58, 216) : rgba(106, 84, 47, 142);
    graphics.stroke();
    const buttonComponent = button.addComponent(Button);
    buttonComponent.interactable = enabled;
    if (enabled) {
      this.host.applyImageButtonFeedback(button, 1.025, 0.975);
    }
    const label = this.host.addChildLabel(button, `${name}Label`, text, 0, 0, 18 * scale, enabled ? rgba(245, 211, 123) : rgba(151, 133, 93), new Size(width, height));
    label.overflow = Label.Overflow.SHRINK;
    return button;
  }

  private drawPanelAtmosphere(parent: Node, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, 'LobbyFormationPanelAtmosphere', 0, 0, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(102, 15, 21, 40);
    graphics.rect(-width / 2 + 18 * scale, height / 2 - 94 * scale, width - 36 * scale, 48 * scale);
    graphics.fill();
  }

  private drawSectionFrame(graphics: Graphics, width: number, height: number, scale: number, fill: Color): void {
    graphics.fillColor = fill;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(137, 100, 50, 136);
    graphics.lineWidth = Math.max(1, scale);
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
