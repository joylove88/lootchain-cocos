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

export interface LobbyHeroRosterPanelHost {
  node: Node;
  currentLobbyHeroRosterState(): LobbyHeroRosterPanelState;
  closeLobbyHeroRosterPanel(): void;
  reloadLobbyHeroRoster(): void;
  openLobbyHeroDetail(heroId: number): void;
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

/** 大厅英雄队列只读面板，当前用于展示主角入库后置顶。 */
export class LobbyHeroRosterPanelRenderer {
  constructor(private readonly host: LobbyHeroRosterPanelHost) {}

  render(layout: UiLayout): void {
    const state = this.host.currentLobbyHeroRosterState();
    const scale = Math.max(0.64, Math.min(1, layout.uiScale));
    const panelWidth = Math.max(320 * scale, layout.stageWidth);
    const panelHeight = Math.max(280 * scale, layout.stageHeight);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;

    const dim = this.createUiNode('LobbyHeroRosterDim');
    dim.setPosition(new Vec3(centerX, centerY, 0));
    dim.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const dimGraphics = dim.addComponent(Graphics);
    dimGraphics.fillColor = rgba(0, 0, 0, 0);
    dimGraphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    dimGraphics.fill();
    // 功能页采用场景式导航，遮罩只阻断底层输入，不再承担点击关闭语义。
    dim.addComponent(BlockInputEvents);

    const panelGroup = this.createUiNode('LobbyHeroRosterSceneContent');
    panelGroup.setPosition(new Vec3(centerX, centerY, 0));
    panelGroup.addComponent(UITransform).setContentSize(new Size(panelWidth, panelHeight));
    // 英雄队列内容区必须吞掉点击，避免点击卡牌区域时穿透遮罩关闭弹框。
    panelGroup.addComponent(BlockInputEvents);
    const panel = this.host.addChildBeveledPanelNode(
      panelGroup,
      'LobbyHeroRosterSceneFrame',
      0,
      0,
      panelWidth,
      panelHeight,
      rgba(6, 6, 9, 232),
      rgba(194, 144, 62, 228),
      18 * scale,
    );
    this.drawPanelAtmosphere(panel, panelWidth, panelHeight, scale);
    this.renderHeader(panel, panelWidth, panelHeight, scale, state);
    this.renderHeroBody(panel, panelWidth, panelHeight, scale, state);
    this.renderFooter(panel, panelWidth, panelHeight, scale);
    renderSceneBackButton(this.host, panelGroup, layout, 'LobbyHeroRosterBackButton', () => this.host.closeLobbyHeroRosterPanel(), scale);
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private renderHeader(parent: Node, width: number, height: number, scale: number, state: LobbyHeroRosterPanelState): void {
    const title = this.host.addChildLabel(
      parent,
      'LobbyHeroRosterTitle',
      '英雄队列',
      0,
      height / 2 - 42 * scale,
      28 * scale,
      rgba(251, 223, 158),
      new Size(width - 96 * scale, 38 * scale),
    );
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    const statusText = state.loading ? '正在读取已拥有英雄...' : state.error ? '英雄队列暂不可用，已显示空状态' : state.loaded ? '只读英雄列表' : '等待英雄数据';
    const status = this.host.addChildLabel(
      parent,
      'LobbyHeroRosterStatus',
      statusText,
      0,
      height / 2 - 76 * scale,
      17 * scale,
      rgba(200, 164, 91),
      new Size(width - 104 * scale, 27 * scale),
    );
    status.overflow = Label.Overflow.SHRINK;
    this.applyOutline(status, scale, false);

    const protagonist = state.heroes.find((hero) => hero.protagonist);
    this.addRosterChip(parent, 'LobbyHeroRosterChipTotal', `拥有 ${state.heroes.length}`, -148 * scale, height / 2 - 108 * scale, 130 * scale, scale);
    this.addRosterChip(parent, 'LobbyHeroRosterChipMain', protagonist ? '主角已入队' : '主角未读取', 0, height / 2 - 108 * scale, 130 * scale, scale);
    this.addRosterChip(parent, 'LobbyHeroRosterChipReadonly', '只读预览', 148 * scale, height / 2 - 108 * scale, 130 * scale, scale);
  }

  private addRosterChip(parent: Node, name: string, text: string, x: number, y: number, width: number, scale: number): void {
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

  private renderHeroBody(parent: Node, width: number, height: number, scale: number, state: LobbyHeroRosterPanelState): void {
    const bodyTop = height / 2 - 134 * scale;
    const bodyBottom = -height / 2 + 82 * scale;
    const bodyHeight = Math.max(130 * scale, bodyTop - bodyBottom);
    if (state.loading && state.heroes.length === 0) {
      this.renderEmpty(parent, width, bodyHeight, scale, '英雄队列读取中，请稍候。');
      return;
    }
    if (state.heroes.length === 0) {
      this.renderEmpty(parent, width, bodyHeight, scale, '当前暂无可展示的已拥有英雄。');
      return;
    }

    const columns = width >= 760 * scale ? 3 : width >= 540 * scale ? 2 : 1;
    const gap = 11 * scale;
    const cardWidth = Math.min(250 * scale, (width - 86 * scale - gap * (columns - 1)) / columns);
    const cardHeight = Math.min(132 * scale, Math.max(108 * scale, cardWidth * 0.53));
    const rows = Math.max(1, Math.min(Math.floor((bodyHeight + gap) / (cardHeight + gap)), Math.ceil(state.heroes.length / columns)));
    const maxItems = Math.min(state.heroes.length, columns * rows);
    const gridWidth = cardWidth * columns + gap * (columns - 1);
    const startX = -gridWidth / 2 + cardWidth / 2;
    const startY = bodyTop - cardHeight / 2;

    for (let index = 0; index < maxItems; index += 1) {
      const hero = state.heroes[index];
      if (!hero) {
        continue;
      }
      const column = index % columns;
      const row = Math.floor(index / columns);
      this.renderHeroCard(parent, hero, index, startX + column * (cardWidth + gap), startY - row * (cardHeight + gap), cardWidth, cardHeight, scale);
    }
  }

  private renderEmpty(parent: Node, width: number, bodyHeight: number, scale: number, text: string): void {
    const box = this.host.addChildPlainNode(parent, 'LobbyHeroRosterEmptyBox', 0, -12 * scale, width - 96 * scale, Math.min(150 * scale, bodyHeight));
    const graphics = box.addComponent(Graphics);
    graphics.fillColor = rgba(9, 9, 12, 164);
    graphics.rect(-(width - 96 * scale) / 2, -60 * scale, width - 96 * scale, 120 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(148, 110, 56, 124);
    graphics.stroke();
    const label = this.host.addChildLabel(box, 'LobbyHeroRosterEmptyText', text, 0, 0, 19 * scale, rgba(213, 193, 151), new Size(width - 128 * scale, 48 * scale));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
  }

  private renderHeroCard(parent: Node, hero: LobbyHeroItemVO, index: number, x: number, y: number, width: number, height: number, scale: number): void {
    const card = this.host.addChildPlainNode(parent, `LobbyHeroRosterCard_${index}`, x, y, width, height);
    card.addComponent(Button);
    card.on(Button.EventType.CLICK, () => this.host.openLobbyHeroDetail(hero.id), this);
    this.host.applyImageButtonFeedback(card, 1.018, 0.985);
    const graphics = card.addComponent(Graphics);
    this.drawHeroCard(graphics, width, height, scale, hero);

    const portraitSize = Math.min(76 * scale, height - 26 * scale);
    this.drawPortrait(card, hero, -width / 2 + 48 * scale, 3 * scale, portraitSize, scale);

    const rarity = this.host.addChildLabel(card, 'LobbyHeroRosterRarity', safeText(hero.rarity || 'R'), -width / 2 + 18 * scale, height / 2 - 17 * scale, 14 * scale, this.rarityColor(hero.rarity), new Size(44 * scale, 20 * scale), HorizontalTextAlignment.LEFT);
    rarity.overflow = Label.Overflow.SHRINK;
    this.applyOutline(rarity, scale, true);

    if (hero.protagonist) {
      this.addProtagonistBadge(card, width / 2 - 42 * scale, height / 2 - 18 * scale, 64 * scale, 22 * scale, scale);
    }

    const name = this.host.addChildLabel(card, 'LobbyHeroRosterHeroName', safeText(hero.heroName), -width / 2 + 96 * scale, height / 2 - 28 * scale, 20 * scale, rgba(246, 220, 163), new Size(width - 116 * scale, 28 * scale), HorizontalTextAlignment.LEFT);
    name.overflow = Label.Overflow.SHRINK;
    this.applyOutline(name, scale, true);

    const formText = hero.protagonist ? safeText(hero.formLabel || '攻击形态') : sourceLabel(hero.sourceType);
    const form = this.host.addChildLabel(card, 'LobbyHeroRosterForm', formText, -width / 2 + 96 * scale, height / 2 - 56 * scale, 15 * scale, hero.protagonist ? rgba(229, 166, 76) : rgba(181, 160, 118), new Size(width - 116 * scale, 22 * scale), HorizontalTextAlignment.LEFT);
    form.overflow = Label.Overflow.SHRINK;

    const level = this.host.addChildLabel(card, 'LobbyHeroRosterLevel', `Lv.${hero.level}  星级 ${hero.star}`, -width / 2 + 96 * scale, -8 * scale, 15 * scale, rgba(197, 177, 136), new Size(width - 116 * scale, 22 * scale), HorizontalTextAlignment.LEFT);
    level.overflow = Label.Overflow.SHRINK;

    const power = this.host.addChildLabel(card, 'LobbyHeroRosterPower', `战力 ${formatInteger(hero.power)}`, -width / 2 + 96 * scale, -34 * scale, 17 * scale, rgba(231, 207, 143), new Size(width - 116 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    power.overflow = Label.Overflow.SHRINK;
    this.applyOutline(power, scale, false);
  }

  private drawHeroCard(graphics: Graphics, width: number, height: number, scale: number, hero: LobbyHeroItemVO): void {
    graphics.fillColor = hero.protagonist ? rgba(28, 7, 8, 216) : rgba(8, 8, 12, 190);
    graphics.moveTo(-width / 2 + 14 * scale, height / 2);
    graphics.lineTo(width / 2 - 14 * scale, height / 2);
    graphics.lineTo(width / 2, height / 2 - 14 * scale);
    graphics.lineTo(width / 2, -height / 2 + 14 * scale);
    graphics.lineTo(width / 2 - 14 * scale, -height / 2);
    graphics.lineTo(-width / 2 + 14 * scale, -height / 2);
    graphics.lineTo(-width / 2, -height / 2 + 14 * scale);
    graphics.lineTo(-width / 2, height / 2 - 14 * scale);
    graphics.close();
    graphics.fill();
    graphics.fillColor = this.rarityFill(hero.rarity);
    graphics.rect(-width / 2 + 7 * scale, -height / 2 + 8 * scale, 5 * scale, height - 16 * scale);
    graphics.fill();
    graphics.strokeColor = hero.protagonist ? rgba(224, 171, 76, 210) : rgba(137, 104, 59, 150);
    graphics.lineWidth = Math.max(1, hero.protagonist ? 1.35 * scale : 0.95 * scale);
    graphics.stroke();
  }

  private drawPortrait(parent: Node, hero: LobbyHeroItemVO, x: number, y: number, size: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, 'LobbyHeroRosterPortrait', x, y, size, size);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = hero.protagonist ? rgba(46, 11, 12, 226) : rgba(13, 13, 16, 218);
    graphics.circle(0, 0, size * 0.46);
    graphics.fill();
    graphics.strokeColor = hero.protagonist ? rgba(221, 165, 75, 214) : rgba(137, 106, 63, 172);
    graphics.lineWidth = Math.max(1, 1.4 * scale);
    graphics.circle(0, 0, size * 0.45);
    graphics.stroke();
    graphics.fillColor = hero.protagonist ? rgba(207, 55, 49, 210) : rgba(118, 103, 82, 190);
    graphics.moveTo(0, size * 0.23);
    graphics.lineTo(size * 0.2, -size * 0.25);
    graphics.lineTo(0, -size * 0.12);
    graphics.lineTo(-size * 0.2, -size * 0.25);
    graphics.close();
    graphics.fill();
  }

  private addProtagonistBadge(parent: Node, x: number, y: number, width: number, height: number, scale: number): void {
    const badge = this.host.addChildPlainNode(parent, 'LobbyHeroRosterProtagonistBadge', x, y, width, height);
    const graphics = badge.addComponent(Graphics);
    graphics.fillColor = rgba(105, 17, 22, 210);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(214, 160, 72, 190);
    graphics.stroke();
    const label = this.host.addChildLabel(badge, 'LobbyHeroRosterProtagonistText', '主角', 0, 0, 14 * scale, rgba(247, 214, 142), new Size(width - 8 * scale, height));
    label.overflow = Label.Overflow.SHRINK;
  }

  private renderFooter(parent: Node, width: number, height: number, scale: number): void {
    const note = this.host.addChildLabel(
      parent,
      'LobbyHeroRosterBoundaryNote',
      '当前英雄队列只读展示主角与已拥有英雄，不提供升级、升星、抽卡、领取或资源变更入口。',
      0,
      -height / 2 + 62 * scale,
      15 * scale,
      rgba(167, 146, 105),
      new Size(width - 110 * scale, 24 * scale),
    );
    note.overflow = Label.Overflow.SHRINK;

    const reload = this.addFooterButton(parent, 'LobbyHeroRosterReloadButton', '刷新', 0, -height / 2 + 30 * scale, 112 * scale, 36 * scale, scale);
    reload.on(Button.EventType.CLICK, () => this.host.reloadLobbyHeroRoster(), this);
  }

  private addFooterButton(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, scale: number): Node {
    const button = this.host.addChildPlainNode(parent, name, x, y, width, height);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = rgba(22, 18, 17, 224);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(184, 138, 62, 210);
    graphics.stroke();
    button.addComponent(Button);
    this.host.applyImageButtonFeedback(button, 1.025, 0.97);
    const label = this.host.addChildLabel(button, `${name}Label`, text, 0, 0, 18 * scale, rgba(242, 207, 122), new Size(width, height));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
    return button;
  }

  private drawPanelAtmosphere(panel: Node, width: number, height: number, scale: number): void {
    const graphics = panel.addComponent(Graphics);
    graphics.fillColor = rgba(117, 12, 20, 28);
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
    const key = rarity.toUpperCase();
    if (key === 'SSR') {
      return rgba(255, 202, 102);
    }
    if (key === 'SR') {
      return rgba(184, 148, 255);
    }
    if (key === 'R') {
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

function formatInteger(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return safe.toLocaleString('en-US');
}

function sourceLabel(sourceType: string): string {
  if (sourceType === 'ADMIN_GRANT') {
    return '后台补发';
  }
  if (sourceType === 'REWARD_GRANT') {
    return '奖励获得';
  }
  if (sourceType === 'GACHA') {
    return '已拥有英雄';
  }
  return '英雄';
}
