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
import type { BagItemEntryVO, ItemTypeBagGroupVO, LobbyBagPanelState } from '../../types/BagTypes';
import { safeText } from '../UiTextFormatter';
import { renderSceneBackButton } from '../UiSceneBackButton';
import { rgba, type UiLayout } from './LobbyHudTypes';

export interface LobbyBagPanelHost {
  node: Node;
  currentLobbyBagState(): LobbyBagPanelState;
  closeLobbyBagPanel(): void;
  reloadLobbyBag(): void;
  selectLobbyBagItem(itemCode: string): void;
  reloadLobbyBagItemSource(itemCode: string): void;
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

/** 大厅背包只读场景。 */
export class LobbyBagPanelRenderer {
  constructor(private readonly host: LobbyBagPanelHost) {}

  render(layout: UiLayout): void {
    const state = this.host.currentLobbyBagState();
    const scale = Math.max(0.64, Math.min(1, layout.uiScale));
    const panelWidth = Math.max(320 * scale, layout.stageWidth);
    const panelHeight = Math.max(280 * scale, layout.stageHeight);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;

    const dim = this.createUiNode('LobbyBagDim');
    dim.setPosition(new Vec3(centerX, centerY, 0));
    dim.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const dimGraphics = dim.addComponent(Graphics);
    dimGraphics.fillColor = rgba(0, 0, 0, 0);
    dimGraphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    dimGraphics.fill();
    dim.addComponent(BlockInputEvents);

    const panelGroup = this.createUiNode('LobbyBagSceneContent');
    panelGroup.setPosition(new Vec3(centerX, centerY, 0));
    panelGroup.addComponent(UITransform).setContentSize(new Size(panelWidth, panelHeight));
    panelGroup.addComponent(BlockInputEvents);

    const panel = this.host.addChildBeveledPanelNode(
      panelGroup,
      'LobbyBagSceneFrame',
      0,
      0,
      panelWidth,
      panelHeight,
      rgba(6, 6, 9, 232),
      rgba(190, 142, 64, 228),
      18 * scale,
    );
    this.drawPanelAtmosphere(panel, panelWidth, panelHeight, scale);
    this.renderHeader(panel, panelWidth, panelHeight, scale, state);
    this.renderBagBody(panel, panelWidth, panelHeight, scale, state);
    this.renderFooter(panel, panelWidth, panelHeight, scale, state);
    renderSceneBackButton(this.host, panelGroup, layout, 'LobbyBagBackButton', () => this.host.closeLobbyBagPanel(), scale, '背包');
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private renderHeader(parent: Node, width: number, height: number, scale: number, state: LobbyBagPanelState): void {
    const title = this.host.addChildLabel(
      parent,
      'LobbyBagTitle',
      '背包',
      0,
      height / 2 - 42 * scale,
      28 * scale,
      rgba(251, 223, 158),
      new Size(width - 96 * scale, 38 * scale),
    );
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    const statusText = state.loading
      ? '正在读取背包道具...'
      : state.error
        ? '背包暂不可用，已显示空状态'
        : state.loaded
          ? '只读道具列表'
          : '等待背包数据';
    const status = this.host.addChildLabel(
      parent,
      'LobbyBagStatus',
      statusText,
      0,
      height / 2 - 76 * scale,
      17 * scale,
      rgba(200, 164, 91),
      new Size(width - 104 * scale, 27 * scale),
    );
    status.overflow = Label.Overflow.SHRINK;
    this.applyOutline(status, scale, false);

    const totalCount = flatItems(state.groups).reduce((sum, item) => sum + safeNumber(item.itemCount), 0);
    this.addBagChip(parent, 'LobbyBagChipTypes', `分类 ${state.groups.length}`, -148 * scale, height / 2 - 108 * scale, 130 * scale, scale);
    this.addBagChip(parent, 'LobbyBagChipItems', `总数 ${formatCompact(totalCount)}`, 0, height / 2 - 108 * scale, 130 * scale, scale);
    this.addBagChip(parent, 'LobbyBagChipReadonly', '只读预览', 148 * scale, height / 2 - 108 * scale, 130 * scale, scale);
  }

  private addBagChip(parent: Node, name: string, text: string, x: number, y: number, width: number, scale: number): void {
    const chip = this.host.addChildPlainNode(parent, name, x, y, width, 25 * scale);
    const graphics = chip.addComponent(Graphics);
    graphics.fillColor = rgba(12, 10, 10, 184);
    graphics.rect(-width / 2, -12.5 * scale, width, 25 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(157, 118, 60, 166);
    graphics.stroke();
    const label = this.host.addChildLabel(chip, `${name}Label`, text, 0, 0, 14 * scale, rgba(224, 190, 118), new Size(width - 10 * scale, 23 * scale));
    label.overflow = Label.Overflow.SHRINK;
  }

  private renderBagBody(parent: Node, width: number, height: number, scale: number, state: LobbyBagPanelState): void {
    const bodyTop = height / 2 - 134 * scale;
    const bodyBottom = -height / 2 + 86 * scale;
    const bodyHeight = Math.max(130 * scale, bodyTop - bodyBottom);
    const items = flatItems(state.groups);
    if (state.loading && items.length === 0) {
      this.renderEmpty(parent, width, bodyHeight, scale, '背包读取中，请稍候。');
      return;
    }
    if (items.length === 0) {
      this.renderEmpty(parent, width, bodyHeight, scale, state.error || '当前背包暂无可展示道具。');
      return;
    }

    const selectedItem = items.find((item) => item.itemCode === state.selectedItemCode) ?? items[0];
    const wide = width >= 860 * scale && bodyHeight >= 260 * scale;
    if (wide) {
      const railWidth = Math.min(176 * scale, width * 0.19);
      const detailWidth = Math.min(282 * scale, width * 0.28);
      const gap = 14 * scale;
      const gridWidth = Math.max(220 * scale, width - 92 * scale - railWidth - detailWidth - gap * 2);
      const railX = -width / 2 + 42 * scale + railWidth / 2;
      const gridX = railX + railWidth / 2 + gap + gridWidth / 2;
      const detailX = width / 2 - 42 * scale - detailWidth / 2;
      this.renderGroupRail(parent, state.groups, railX, (bodyTop + bodyBottom) / 2, railWidth, bodyHeight, scale);
      this.renderItemGrid(parent, items, selectedItem, gridX, (bodyTop + bodyBottom) / 2, gridWidth, bodyHeight, scale);
      this.renderDetail(parent, selectedItem, detailX, (bodyTop + bodyBottom) / 2, detailWidth, bodyHeight, scale, state);
      return;
    }

    const gridHeight = Math.max(104 * scale, bodyHeight * 0.58);
    const detailHeight = Math.max(92 * scale, bodyHeight - gridHeight - 10 * scale);
    const gridY = bodyTop - gridHeight / 2;
    const detailY = bodyBottom + detailHeight / 2;
    this.renderItemGrid(parent, items, selectedItem, 0, gridY, width - 82 * scale, gridHeight, scale);
    this.renderDetail(parent, selectedItem, 0, detailY, width - 82 * scale, detailHeight, scale, state);
  }

  private renderGroupRail(parent: Node, groups: ItemTypeBagGroupVO[], x: number, y: number, width: number, height: number, scale: number): void {
    const rail = this.host.addChildPlainNode(parent, 'LobbyBagGroupRail', x, y, width, height);
    const graphics = rail.addComponent(Graphics);
    graphics.fillColor = rgba(9, 9, 12, 162);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(143, 106, 58, 132);
    graphics.stroke();

    const maxRows = Math.max(1, Math.floor((height - 22 * scale) / (36 * scale)));
    groups.slice(0, maxRows).forEach((group, index) => {
      const rowY = height / 2 - 22 * scale - index * 36 * scale;
      const count = group.items.reduce((sum, item) => sum + safeNumber(item.itemCount), 0);
      const label = this.host.addChildLabel(
        rail,
        `LobbyBagGroup_${index}`,
        `${safeText(group.itemTypeLabel)} ${formatCompact(count)}`,
        0,
        rowY,
        15 * scale,
        rgba(216, 190, 133),
        new Size(width - 18 * scale, 28 * scale),
        HorizontalTextAlignment.LEFT,
      );
      label.overflow = Label.Overflow.SHRINK;
    });
  }

  private renderItemGrid(parent: Node, items: BagItemEntryVO[], selectedItem: BagItemEntryVO, x: number, y: number, width: number, height: number, scale: number): void {
    const grid = this.host.addChildPlainNode(parent, 'LobbyBagItemGrid', x, y, width, height);
    const graphics = grid.addComponent(Graphics);
    graphics.fillColor = rgba(8, 8, 12, 154);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(143, 106, 58, 128);
    graphics.stroke();

    const columns = width >= 560 * scale ? 3 : width >= 350 * scale ? 2 : 1;
    const gap = 10 * scale;
    const cardWidth = Math.min(180 * scale, (width - 24 * scale - gap * (columns - 1)) / columns);
    const cardHeight = Math.min(86 * scale, Math.max(68 * scale, cardWidth * 0.5));
    const rows = Math.max(1, Math.floor((height - 22 * scale + gap) / (cardHeight + gap)));
    const maxItems = Math.min(items.length, columns * rows);
    const gridWidth = cardWidth * columns + gap * (columns - 1);
    const startX = -gridWidth / 2 + cardWidth / 2;
    const startY = height / 2 - 14 * scale - cardHeight / 2;

    for (let index = 0; index < maxItems; index += 1) {
      const item = items[index];
      const column = index % columns;
      const row = Math.floor(index / columns);
      this.renderItemCard(grid, item, index, item.itemCode === selectedItem.itemCode, startX + column * (cardWidth + gap), startY - row * (cardHeight + gap), cardWidth, cardHeight, scale);
    }

    if (items.length > maxItems) {
      const more = this.host.addChildLabel(grid, 'LobbyBagMoreHint', `已显示 ${maxItems}/${items.length} 件`, 0, -height / 2 + 12 * scale, 12 * scale, rgba(145, 128, 96), new Size(width - 18 * scale, 18 * scale));
      more.overflow = Label.Overflow.SHRINK;
    }
  }

  private renderItemCard(parent: Node, item: BagItemEntryVO, index: number, selected: boolean, x: number, y: number, width: number, height: number, scale: number): void {
    const card = this.host.addChildPlainNode(parent, `LobbyBagItemCard_${index}`, x, y, width, height);
    card.addComponent(Button);
    card.on(Button.EventType.CLICK, () => this.host.selectLobbyBagItem(item.itemCode), this);
    this.host.applyImageButtonFeedback(card, 1.018, 0.985);
    const graphics = card.addComponent(Graphics);
    this.drawItemCard(graphics, width, height, scale, item, selected);

    const rarity = this.host.addChildLabel(card, 'LobbyBagItemRarity', safeText(item.rarity || 'N'), -width / 2 + 16 * scale, height / 2 - 15 * scale, 13 * scale, this.rarityColor(item.rarity), new Size(42 * scale, 18 * scale), HorizontalTextAlignment.LEFT);
    rarity.overflow = Label.Overflow.SHRINK;
    this.applyOutline(rarity, scale, true);

    const name = this.host.addChildLabel(card, 'LobbyBagItemName', safeText(item.itemName), -width / 2 + 44 * scale, height / 2 - 17 * scale, 16 * scale, rgba(244, 219, 163), new Size(width - 54 * scale, 23 * scale), HorizontalTextAlignment.LEFT);
    name.overflow = Label.Overflow.SHRINK;
    this.applyOutline(name, scale, true);

    const type = this.host.addChildLabel(card, 'LobbyBagItemType', itemTypeLabel(item.itemType), -width / 2 + 14 * scale, 2 * scale, 13 * scale, rgba(171, 153, 116), new Size(width - 28 * scale, 19 * scale), HorizontalTextAlignment.LEFT);
    type.overflow = Label.Overflow.SHRINK;

    const count = this.host.addChildLabel(card, 'LobbyBagItemCount', `x${formatCompact(safeNumber(item.itemCount))}`, width / 2 - 44 * scale, -height / 2 + 15 * scale, 15 * scale, rgba(230, 205, 142), new Size(78 * scale, 20 * scale), HorizontalTextAlignment.RIGHT);
    count.overflow = Label.Overflow.SHRINK;
  }

  private drawItemCard(graphics: Graphics, width: number, height: number, scale: number, item: BagItemEntryVO, selected: boolean): void {
    graphics.fillColor = selected ? rgba(31, 12, 10, 226) : rgba(9, 9, 12, 186);
    graphics.moveTo(-width / 2 + 12 * scale, height / 2);
    graphics.lineTo(width / 2 - 12 * scale, height / 2);
    graphics.lineTo(width / 2, height / 2 - 12 * scale);
    graphics.lineTo(width / 2, -height / 2 + 12 * scale);
    graphics.lineTo(width / 2 - 12 * scale, -height / 2);
    graphics.lineTo(-width / 2 + 12 * scale, -height / 2);
    graphics.lineTo(-width / 2, -height / 2 + 12 * scale);
    graphics.lineTo(-width / 2, height / 2 - 12 * scale);
    graphics.close();
    graphics.fill();
    graphics.fillColor = this.rarityFill(item.rarity);
    graphics.rect(-width / 2 + 6 * scale, -height / 2 + 7 * scale, 5 * scale, height - 14 * scale);
    graphics.fill();
    graphics.strokeColor = selected ? rgba(230, 176, 79, 228) : rgba(137, 104, 59, 150);
    graphics.lineWidth = Math.max(1, selected ? 1.35 * scale : 0.95 * scale);
    graphics.stroke();
  }

  private renderDetail(parent: Node, item: BagItemEntryVO, x: number, y: number, width: number, height: number, scale: number, state: LobbyBagPanelState): void {
    const detail = this.host.addChildPlainNode(parent, 'LobbyBagItemDetail', x, y, width, height);
    const graphics = detail.addComponent(Graphics);
    graphics.fillColor = rgba(10, 9, 11, 190);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(171, 126, 62, 154);
    graphics.stroke();

    const title = this.host.addChildLabel(detail, 'LobbyBagDetailName', safeText(item.itemName), 0, height / 2 - 24 * scale, 19 * scale, rgba(248, 220, 153), new Size(width - 28 * scale, 28 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    const rows = [
      `编码 ${safeText(item.itemCode)}`,
      `类型 ${itemTypeLabel(item.itemType)} / ${safeText(item.rarity || 'N')}`,
      `数量 ${formatCompact(safeNumber(item.itemCount))} / 堆叠 ${formatCompact(safeNumber(item.maxStack))}`,
      `出售价 ${formatMoney(item.sellGold)} 金币`,
      `效果 ${safeText(item.useEffectType || '仅展示')}`,
      `过期 ${item.expireTime ? safeText(String(item.expireTime)) : '永久'}`,
    ];
    rows.slice(0, height < 170 * scale ? 4 : rows.length).forEach((row, index) => {
      const label = this.host.addChildLabel(detail, `LobbyBagDetailRow_${index}`, row, -width / 2 + 16 * scale, height / 2 - 54 * scale - index * 24 * scale, 14 * scale, rgba(201, 181, 137), new Size(width - 32 * scale, 20 * scale), HorizontalTextAlignment.LEFT);
      label.overflow = Label.Overflow.SHRINK;
    });

    const sourceTop = Math.max(-height / 2 + 60 * scale, height / 2 - 204 * scale);
    const sourceText = state.sourceItemCode === item.itemCode && state.sourceLoading
      ? '来源读取中...'
      : state.sourceItemCode === item.itemCode && state.sourceError
        ? `来源读取失败：${safeText(state.sourceError)}`
        : state.sourceItemCode === item.itemCode && state.sourceDesc
          ? safeText(state.sourceDesc)
          : '点击“查看来源”读取服务端来源说明。';
    const source = this.host.addChildLabel(detail, 'LobbyBagSourceDesc', sourceText, 0, sourceTop, 14 * scale, rgba(170, 210, 222), new Size(width - 30 * scale, Math.max(34 * scale, height * 0.2)));
    source.lineHeight = 20 * scale;
    source.overflow = Label.Overflow.RESIZE_HEIGHT;

    const sourceButton = this.addFooterButton(detail, 'LobbyBagSourceButton', state.sourceLoading ? '读取中' : '查看来源', -56 * scale, -height / 2 + 28 * scale, 104 * scale, 34 * scale, scale, !state.sourceLoading);
    sourceButton.on(Button.EventType.CLICK, () => this.host.reloadLobbyBagItemSource(item.itemCode), this);
    const disabled = this.addFooterButton(detail, 'LobbyBagDisabledAction', '使用/出售关闭', 58 * scale, -height / 2 + 28 * scale, 124 * scale, 34 * scale, scale, false);
    const disabledButton = disabled.getComponent(Button);
    if (disabledButton) {
      disabledButton.interactable = false;
    }
  }

  private renderEmpty(parent: Node, width: number, bodyHeight: number, scale: number, text: string): void {
    const box = this.host.addChildPlainNode(parent, 'LobbyBagEmptyBox', 0, -12 * scale, width - 96 * scale, Math.min(150 * scale, bodyHeight));
    const graphics = box.addComponent(Graphics);
    graphics.fillColor = rgba(9, 9, 12, 164);
    graphics.rect(-(width - 96 * scale) / 2, -60 * scale, width - 96 * scale, 120 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(148, 110, 56, 124);
    graphics.stroke();
    const label = this.host.addChildLabel(box, 'LobbyBagEmptyText', text, 0, 0, 19 * scale, rgba(213, 193, 151), new Size(width - 128 * scale, 48 * scale));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
  }

  private renderFooter(parent: Node, width: number, height: number, scale: number, state: LobbyBagPanelState): void {
    const note = this.host.addChildLabel(
      parent,
      'LobbyBagBoundaryNote',
      '当前背包只读展示道具与来源，不提供使用、出售、兑换、领取或资源变更入口。',
      0,
      -height / 2 + 62 * scale,
      15 * scale,
      rgba(167, 146, 105),
      new Size(width - 110 * scale, 24 * scale),
    );
    note.overflow = Label.Overflow.SHRINK;

    const reload = this.addFooterButton(parent, 'LobbyBagReloadButton', state.loading ? '读取中' : '刷新', 0, -height / 2 + 30 * scale, 112 * scale, 36 * scale, scale, !state.loading);
    reload.on(Button.EventType.CLICK, () => this.host.reloadLobbyBag(), this);
  }

  private addFooterButton(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, scale: number, enabled = true): Node {
    const button = this.host.addChildPlainNode(parent, name, x, y, width, height);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = enabled ? rgba(22, 18, 17, 224) : rgba(20, 18, 18, 126);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = enabled ? rgba(184, 138, 62, 210) : rgba(107, 91, 66, 130);
    graphics.stroke();
    const component = button.addComponent(Button);
    component.interactable = enabled;
    if (enabled) {
      this.host.applyImageButtonFeedback(button, 1.025, 0.97);
    }
    const label = this.host.addChildLabel(button, `${name}Label`, text, 0, 0, 16 * scale, enabled ? rgba(242, 207, 122) : rgba(147, 134, 111), new Size(width, height));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
    return button;
  }

  private drawPanelAtmosphere(panel: Node, width: number, height: number, scale: number): void {
    const graphics = panel.addComponent(Graphics);
    graphics.fillColor = rgba(117, 12, 20, 24);
    graphics.rect(-width * 0.42, -height * 0.28, width * 0.34, height * 0.56);
    graphics.fill();
    graphics.strokeColor = rgba(229, 181, 92, 66);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.moveTo(-width / 2 + 36 * scale, height / 2 - 122 * scale);
    graphics.lineTo(width / 2 - 36 * scale, height / 2 - 122 * scale);
    graphics.moveTo(-width / 2 + 38 * scale, -height / 2 + 74 * scale);
    graphics.lineTo(width / 2 - 38 * scale, -height / 2 + 74 * scale);
    graphics.stroke();
  }

  private rarityColor(rarity: string): Color {
    const key = (rarity || '').toUpperCase();
    if (key === 'UR' || key === 'SSR') {
      return rgba(255, 202, 102);
    }
    if (key === 'SR' || key === 'EPIC') {
      return rgba(184, 148, 255);
    }
    if (key === 'R' || key === 'RARE') {
      return rgba(150, 190, 255);
    }
    return rgba(195, 178, 138);
  }

  private rarityFill(rarity: string): Color {
    const base = this.rarityColor(rarity);
    return new Color(base.r, base.g, base.b, 162);
  }

  private applyOutline(label: Label, scale: number, strong: boolean): void {
    label.enableOutline = true;
    label.outlineColor = rgba(0, 0, 0, strong ? 220 : 180);
    label.outlineWidth = Math.max(1, (strong ? 1.5 : 1) * scale);
  }
}

function flatItems(groups: ItemTypeBagGroupVO[]): BagItemEntryVO[] {
  return groups.flatMap((group) => group.items);
}

function safeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
}

function formatCompact(value: number): string {
  const safe = Math.max(0, Math.trunc(value));
  if (safe >= 1_000_000) {
    return `${Math.floor(safe / 100_000) / 10}M`;
  }
  if (safe >= 10_000) {
    return `${Math.floor(safe / 100) / 10}K`;
  }
  return safe.toLocaleString('en-US');
}

function formatMoney(value: unknown): string {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) {
    return '0';
  }
  return numberValue.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function itemTypeLabel(itemType: string): string {
  const key = (itemType || '').toUpperCase();
  if (key === 'GACHA_TICKET') {
    return '召唤券';
  }
  if (key === 'HERO_FRAGMENT') {
    return '英雄碎片';
  }
  if (key === 'CURRENCY_BOX') {
    return '资源箱';
  }
  if (key === 'MATERIAL') {
    return '材料';
  }
  if (key === 'EQUIPMENT') {
    return '装备';
  }
  if (key === 'CONSUMABLE') {
    return '消耗品';
  }
  return safeText(itemType || '道具');
}
