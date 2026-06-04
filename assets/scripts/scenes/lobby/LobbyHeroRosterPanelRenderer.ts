import {
  BlockInputEvents,
  Button,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Node,
  resources,
  Size,
  sp,
  Sprite,
  UITransform,
  Vec3,
} from 'cc';
import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../../types/LobbyHeroTypes';
import { safeText } from '../UiTextFormatter';
import { renderSceneBackButton } from '../UiSceneBackButton';
import { clamp, rgba, type UiLayout } from './LobbyHudTypes';

export const LOBBY_HERO_ROSTER_BACKDROP_ASSET = 'ui/hero-detail/hero_detail_backdrop/spriteFrame';
export const LOBBY_HERO_ROSTER_CARD_ASSETS = [
  'ui/hero-roster/card_r/spriteFrame',
  'ui/hero-roster/card_sr/spriteFrame',
  'ui/hero-roster/card_ssr/spriteFrame',
  'ui/hero-roster/card_ur/spriteFrame',
];

const HERO_FILTER_TABS = ['全部', '坦克', '近战', '远程', '物理', '法术'];
const HERO_ROSTER_CARD_ASPECT_WIDTH = 224;
const HERO_ROSTER_CARD_ASPECT_HEIGHT = 406;
const HERO_ROSTER_CARD_DESKTOP_TARGET_HEIGHT = 452;
const HERO_ROSTER_CARD_DESKTOP_MAX_HEIGHT = 474;
const HERO_ROSTER_CARD_COMPACT_TARGET_HEIGHT = 298;
const HERO_ROSTER_CARD_COMPACT_MAX_HEIGHT = 328;
const HERO_ROSTER_CARD_LEFT_INSET = 12;
const HERO_ROSTER_CARD_TOP_INSET = 14;
const HERO_ROSTER_CARD_LEVEL_INSET_X = 19;
const HERO_ROSTER_CARD_LEVEL_INSET_Y = 36;
const HERO_ROSTER_CARD_BADGE_INSET_X = 22;
const HERO_ROSTER_CARD_BADGE_INSET_Y = 33;
const HERO_ROSTER_BORDER_EFFECT_RESOURCE = 'spine/ui/hero-roster/goods_1_border/goods_1';
const HERO_ROSTER_BORDER_ANIMATION_BY_RARITY: Record<string, string> = {
  R: 'K3',
  SR: 'K4',
  SSR: 'K5',
  UR: 'K7',
};
const HERO_ROSTER_CARD_RARITY_Y_RATIO = 0.218;
const HERO_ROSTER_CARD_INFO_PLATE_BASE_ALPHA = 255;
const HERO_ROSTER_CARD_INFO_PLATE_TINT_ALPHA = 46;

const HERO_CARD_ASSET_BY_RARITY: Record<string, string> = {
  R: 'ui/hero-roster/card_r/spriteFrame',
  SR: 'ui/hero-roster/card_sr/spriteFrame',
  SSR: 'ui/hero-roster/card_ssr/spriteFrame',
  UR: 'ui/hero-roster/card_ur/spriteFrame',
};

const USE_HERO_ROSTER_EXTERNAL_PORTRAITS = false;

export interface LobbyHeroRosterPanelHost {
  node: Node;
  currentLobbyHeroRosterState(): LobbyHeroRosterPanelState;
  closeLobbyHeroRosterPanel(): void;
  reloadLobbyHeroRoster(): void;
  openLobbyHeroDetail(heroId: number): void;
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
    contentSize?: Size,
    horizontalAlign?: HorizontalTextAlignment,
  ): Label;
  applyImageButtonFeedback(node: Node, hoverScale?: number, pressedScale?: number): void;
}

/** 大厅英雄队列只读面板。参考竖卡英雄墙排版，但保持当前阶段无养成写入口。 */
export class LobbyHeroRosterPanelRenderer {
  private borderEffectData: sp.SkeletonData | null = null;
  private borderEffectLoading = false;
  private readonly borderEffectCallbacks: Array<(data: sp.SkeletonData | null) => void> = [];

  constructor(private readonly host: LobbyHeroRosterPanelHost) {}

  render(layout: UiLayout): void {
    const state = this.host.currentLobbyHeroRosterState();
    const scale = clamp(layout.uiScale, 0.62, 1);
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
    dim.addComponent(BlockInputEvents);

    const panelGroup = this.createUiNode('LobbyHeroRosterSceneContent');
    panelGroup.setPosition(new Vec3(centerX, centerY, 0));
    panelGroup.addComponent(UITransform).setContentSize(new Size(panelWidth, panelHeight));
    panelGroup.addComponent(BlockInputEvents);

    const panel = this.host.addChildBeveledPanelNode(
      panelGroup,
      'LobbyHeroRosterSceneFrame',
      0,
      0,
      panelWidth,
      panelHeight,
      rgba(4, 5, 7, 236),
      rgba(0, 0, 0, 0),
      14 * scale,
    );
    if (!this.host.addSprite('LobbyHeroRosterBackdropSprite', LOBBY_HERO_ROSTER_BACKDROP_ASSET, 0, 0, panelWidth, panelHeight, panel)) {
      this.drawFallbackBackdrop(panel, panelWidth, panelHeight, scale);
    }
    this.drawSceneShade(panel, panelWidth, panelHeight, scale);
    this.renderTopBar(panel, panelWidth, panelHeight, scale, state);
    const filterMetrics = this.renderFilterRail(panel, panelWidth, panelHeight, scale);
    this.renderHeroBody(panel, panelWidth, panelHeight, scale, state, filterMetrics);
    this.renderUpgradeDock(panel, panelWidth, panelHeight, scale);
    this.renderFooter(panel, panelWidth, panelHeight, scale);
    renderSceneBackButton(this.host, panelGroup, layout, 'LobbyHeroRosterBackButton', () => this.host.closeLobbyHeroRosterPanel(), scale, '英雄');
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private renderTopBar(parent: Node, width: number, height: number, scale: number, state: LobbyHeroRosterPanelState): void {
    const y = height / 2 - 42 * scale;
    const topBarRightInset = 42 * scale;
    const topBarLeftReserve = -width / 2 + 170 * scale;
    const right = width / 2 - topBarRightInset;
    const compact = width < 760 * scale;
    const power = state.heroes.reduce((sum, hero) => sum + Math.max(0, Number(hero.power) || 0), 0);
    const capsules = compact ? [
      { name: 'Owned', text: `拥有 ${state.heroes.length}`, width: 116 * scale, interactive: false },
      { name: 'Readonly', text: '只读', width: 76 * scale, interactive: false },
    ] : [
      { name: 'Owned', text: `拥有 ${state.heroes.length}`, width: 116 * scale, interactive: false },
      { name: 'Power', text: `战力 ${formatCompactInteger(power)}`, width: 152 * scale, interactive: false },
      { name: 'Readonly', text: '只读', width: 76 * scale, interactive: false },
    ];
    let cursorX = right;
    for (let index = capsules.length - 1; index >= 0; index -= 1) {
      const item = capsules[index];
      this.addTopCapsule(parent, `LobbyHeroRosterTop${item.name}`, item.text, cursorX - item.width / 2, y, item.width, 30 * scale, scale);
      cursorX -= item.width + 8 * scale;
    }

    const reloadWidth = 86 * scale;
    if (cursorX - reloadWidth < topBarLeftReserve) {
      return;
    }
    const reload = this.addTopCapsule(parent, 'LobbyHeroRosterReloadButton', '刷新', cursorX - reloadWidth / 2, y, reloadWidth, 30 * scale, scale, true);
    reload.addComponent(Button);
    reload.on(Button.EventType.CLICK, () => this.host.reloadLobbyHeroRoster(), this);
    this.host.applyImageButtonFeedback(reload, 1.025, 0.97);

    if (compact) {
      return;
    }
    const statusText = state.loading ? '读取中' : state.error ? '读取失败' : state.loaded ? '已同步' : '待同步';
    const statusWidth = 94 * scale;
    const statusX = cursorX - reloadWidth - 60 * scale;
    if (statusX - statusWidth / 2 < topBarLeftReserve) {
      return;
    }
    const status = this.host.addChildLabel(
      parent,
      'LobbyHeroRosterStatus',
      statusText,
      statusX,
      y,
      15 * scale,
      state.error ? rgba(238, 116, 92) : rgba(213, 191, 137),
      new Size(statusWidth, 24 * scale),
    );
    status.overflow = Label.Overflow.SHRINK;
  }

  private addTopCapsule(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, scale: number, active = false): Node {
    const node = this.host.addChildPlainNode(parent, name, x, y, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = active ? rgba(54, 38, 24, 218) : rgba(14, 14, 18, 202);
    this.traceSlantRect(graphics, width, height, 8 * scale);
    graphics.fill();
    graphics.strokeColor = active ? rgba(226, 176, 83, 206) : rgba(112, 92, 58, 150);
    graphics.lineWidth = Math.max(1, 1.2 * scale);
    this.traceSlantRect(graphics, width, height, 8 * scale);
    graphics.stroke();
    const label = this.host.addChildLabel(node, `${name}Label`, text, 0, 0, 14 * scale, rgba(238, 218, 166), new Size(width - 12 * scale, height));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
    return node;
  }

  private renderFilterRail(parent: Node, width: number, height: number, scale: number): { railWidth: number; railHeight: number; horizontal: boolean } {
    const horizontal = width < 720 * scale || height < 430 * scale;
    if (horizontal) {
      return this.renderHorizontalFilters(parent, width, height, scale);
    }
    const railWidth = clamp(width * 0.14, 126 * scale, 168 * scale);
    const railHeight = Math.min(height - 138 * scale, 370 * scale);
    const railX = -width / 2 + railWidth / 2 + 30 * scale;
    const railY = height / 2 - 116 * scale - railHeight / 2;
    const rail = this.host.addChildPlainNode(parent, 'LobbyHeroRosterFilterRail', railX, railY, railWidth, railHeight);
    const graphics = rail.addComponent(Graphics);
    graphics.fillColor = rgba(7, 7, 10, 154);
    graphics.rect(-railWidth / 2, -railHeight / 2, railWidth, railHeight);
    graphics.fill();
    graphics.strokeColor = rgba(117, 90, 58, 102);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.moveTo(railWidth / 2, railHeight / 2);
    graphics.lineTo(railWidth / 2, -railHeight / 2);
    graphics.stroke();

    const tabHeight = Math.min(54 * scale, railHeight / HERO_FILTER_TABS.length);
    const top = railHeight / 2 - tabHeight / 2;
    HERO_FILTER_TABS.forEach((tab, index) => {
      this.renderFilterTab(rail, index, tab, 0, top - index * tabHeight, railWidth, tabHeight, scale, index === 0, false);
    });
    return { railWidth: railWidth + 46 * scale, railHeight, horizontal: false };
  }

  private renderHorizontalFilters(parent: Node, width: number, height: number, scale: number): { railWidth: number; railHeight: number; horizontal: boolean } {
    const railWidth = width - 56 * scale;
    const railHeight = 46 * scale;
    const rail = this.host.addChildPlainNode(parent, 'LobbyHeroRosterFilterRail', 0, height / 2 - 92 * scale, railWidth, railHeight);
    const tabWidth = railWidth / HERO_FILTER_TABS.length;
    HERO_FILTER_TABS.forEach((tab, index) => {
      this.renderFilterTab(rail, index, tab, -railWidth / 2 + tabWidth / 2 + index * tabWidth, 0, tabWidth - 4 * scale, railHeight - 4 * scale, scale, index === 0, true);
    });
    return { railWidth: 0, railHeight: railHeight + 18 * scale, horizontal: true };
  }

  private renderFilterTab(parent: Node, index: number, text: string, x: number, y: number, width: number, height: number, scale: number, active: boolean, horizontal: boolean): void {
    const tab = this.host.addChildPlainNode(parent, `LobbyHeroRosterFilterTab_${index}`, x, y, width, height);
    const graphics = tab.addComponent(Graphics);
    graphics.fillColor = active ? rgba(82, 55, 31, 218) : rgba(10, 10, 13, horizontal ? 142 : 118);
    this.traceSlantRect(graphics, width, height, active ? 9 * scale : 5 * scale);
    graphics.fill();
    graphics.strokeColor = active ? rgba(232, 177, 82, 206) : rgba(87, 73, 55, 92);
    graphics.lineWidth = Math.max(1, active ? 1.4 * scale : 1 * scale);
    this.traceSlantRect(graphics, width, height, active ? 9 * scale : 5 * scale);
    graphics.stroke();
    if (active && !horizontal) {
      graphics.fillColor = rgba(230, 180, 82, 214);
      graphics.moveTo(width / 2 - 4 * scale, 0);
      graphics.lineTo(width / 2 + 8 * scale, 9 * scale);
      graphics.lineTo(width / 2 + 8 * scale, -9 * scale);
      graphics.close();
      graphics.fill();
    }
    const label = this.host.addChildLabel(tab, 'LobbyHeroRosterFilterLabel', text, 0, 0, 17 * scale, active ? rgba(252, 226, 164) : rgba(158, 146, 125), new Size(width - 12 * scale, height));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, active);
  }

  private renderHeroBody(
    parent: Node,
    width: number,
    height: number,
    scale: number,
    state: LobbyHeroRosterPanelState,
    filterMetrics: { railWidth: number; railHeight: number; horizontal: boolean },
  ): void {
    const bodyLeft = -width / 2 + 32 * scale + filterMetrics.railWidth;
    const bodyRight = width / 2 - 42 * scale;
    const bodyTop = height / 2 - (filterMetrics.horizontal ? 138 : 102) * scale;
    const bodyBottom = -height / 2 + 118 * scale;
    const bodyWidth = Math.max(180 * scale, bodyRight - bodyLeft);
    const bodyHeight = Math.max(110 * scale, bodyTop - bodyBottom);
    const bodyCenterX = (bodyLeft + bodyRight) / 2;
    const bodyCenterY = (bodyTop + bodyBottom) / 2;

    this.drawCardStage(parent, bodyCenterX, bodyCenterY, bodyWidth, bodyHeight, scale);

    if (state.loading && state.heroes.length === 0) {
      this.renderEmpty(parent, bodyCenterX, bodyCenterY, bodyWidth, bodyHeight, scale, '英雄队列读取中，请稍候。');
      return;
    }
    if (state.heroes.length === 0) {
      this.renderEmpty(parent, bodyCenterX, bodyCenterY, bodyWidth, bodyHeight, scale, '当前暂无可展示的已拥有英雄。');
      return;
    }

    const gap = (filterMetrics.horizontal ? 12 : 22) * scale;
    const preferredCardHeight = filterMetrics.horizontal
      ? Math.min(HERO_ROSTER_CARD_COMPACT_TARGET_HEIGHT * scale, bodyHeight * 0.98)
      : Math.min(HERO_ROSTER_CARD_DESKTOP_TARGET_HEIGHT * scale, bodyHeight * 0.99);
    const cardHeight = clamp(preferredCardHeight, 168 * scale, (filterMetrics.horizontal ? HERO_ROSTER_CARD_COMPACT_MAX_HEIGHT : HERO_ROSTER_CARD_DESKTOP_MAX_HEIGHT) * scale);
    const cardWidth = cardHeight * HERO_ROSTER_CARD_ASPECT_WIDTH / HERO_ROSTER_CARD_ASPECT_HEIGHT;
    const columns = Math.max(1, Math.min(state.heroes.length, Math.floor((bodyWidth + gap) / (cardWidth + gap))));
    const visibleCount = Math.max(1, columns);
    const cardInsetX = HERO_ROSTER_CARD_LEFT_INSET * scale;
    const cardInsetY = HERO_ROSTER_CARD_TOP_INSET * scale;
    const startX = bodyLeft + cardInsetX + cardWidth / 2;
    const cardY = bodyTop - cardInsetY - cardHeight / 2;

    state.heroes.slice(0, visibleCount).forEach((hero, index) => {
      this.renderHeroCard(parent, hero, index, startX + index * (cardWidth + gap), cardY, cardWidth, cardHeight, scale);
    });

    if (state.heroes.length > visibleCount) {
      const more = this.host.addChildLabel(
        parent,
        'LobbyHeroRosterOverflowHint',
        `已展示前 ${visibleCount} / ${state.heroes.length}，后续接滚动列表。`,
        bodyCenterX,
        bodyBottom + 18 * scale,
        14 * scale,
        rgba(171, 154, 113),
        new Size(bodyWidth - 16 * scale, 22 * scale),
      );
      more.overflow = Label.Overflow.SHRINK;
    }
  }

  private drawCardStage(parent: Node, x: number, y: number, width: number, height: number, scale: number): void {
    const stage = this.host.addChildPlainNode(parent, 'LobbyHeroRosterCardStage', x, y, width, height);
    const graphics = stage.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 68);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = rgba(86, 17, 12, 28);
    graphics.ellipse(0, -height * 0.34, width * 0.32, height * 0.075);
    graphics.fill();
    graphics.fillColor = rgba(214, 154, 72, 18);
    graphics.ellipse(0, -height * 0.34, width * 0.18, height * 0.036);
    graphics.fill();
    graphics.strokeColor = rgba(190, 146, 70, 46);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.moveTo(-width / 2 + 18 * scale, height / 2 - 6 * scale);
    graphics.lineTo(width / 2 - 18 * scale, height / 2 - 6 * scale);
    graphics.moveTo(-width / 2 + 22 * scale, -height / 2 + 8 * scale);
    graphics.lineTo(width / 2 - 22 * scale, -height / 2 + 8 * scale);
    graphics.stroke();

    const dust = this.host.addChildPlainNode(stage, 'LobbyHeroRosterAbyssDust', 0, 0, width, height);
    const dustGraphics = dust.addComponent(Graphics);
    for (let index = 0; index < 34; index += 1) {
      const t = (index * 37 % 101) / 100;
      const u = (index * 53 % 97) / 96;
      const px = -width * 0.45 + t * width * 0.9;
      const py = -height * 0.31 + u * height * 0.54;
      const warm = index % 3 !== 0;
      dustGraphics.fillColor = warm ? rgba(216, 146, 64, 30 + (index % 5) * 5) : rgba(150, 30, 24, 34);
      dustGraphics.circle(px, py, (0.8 + (index % 3) * 0.35) * scale);
      dustGraphics.fill();
    }
  }

  private renderEmpty(parent: Node, x: number, y: number, width: number, height: number, scale: number, text: string): void {
    const boxWidth = Math.min(width - 24 * scale, 460 * scale);
    const box = this.host.addChildPlainNode(parent, 'LobbyHeroRosterEmptyBox', x, y, boxWidth, Math.min(132 * scale, height));
    const graphics = box.addComponent(Graphics);
    graphics.fillColor = rgba(7, 7, 10, 172);
    this.traceSlantRect(graphics, boxWidth, 118 * scale, 14 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(148, 110, 56, 124);
    this.traceSlantRect(graphics, boxWidth, 118 * scale, 14 * scale);
    graphics.stroke();
    const label = this.host.addChildLabel(box, 'LobbyHeroRosterEmptyText', text, 0, 0, 18 * scale, rgba(213, 193, 151), new Size(boxWidth - 36 * scale, 48 * scale));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
  }

  private renderHeroCard(parent: Node, hero: LobbyHeroItemVO, index: number, x: number, y: number, width: number, height: number, scale: number): void {
    const card = this.host.addChildPlainNode(parent, `LobbyHeroRosterCard_${index}`, x, y, width, height);
    card.addComponent(Button);
    card.on(Button.EventType.CLICK, () => this.host.openLobbyHeroDetail(hero.id), this);
    this.host.applyImageButtonFeedback(card, 1.024, 0.982);

    this.drawHeroCardShadow(card, width, height, scale);
    const cardAsset = this.resolveHeroRosterCardAsset(hero);
    if (!this.host.addSprite('LobbyHeroRosterCardSkin', cardAsset, 0, 0, width, height, card)) {
      this.drawHeroCardFallback(card, width, height, scale, hero);
    }
    this.renderHeroCardBorderEffect(card, hero, width, height);
    this.renderHeroPortrait(card, hero, width, height, scale);
    this.renderHeroCardChrome(card, hero, width, height, scale);
  }

  private drawHeroCardShadow(card: Node, width: number, height: number, scale: number): void {
    const shadow = this.host.addChildPlainNode(card, 'LobbyHeroRosterCardShadow', 0, -7 * scale, width * 1.02, height * 1.02);
    const graphics = shadow.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 88);
    this.traceSlantRect(graphics, width * 1.02, height * 1.02, 18 * scale);
    graphics.fill();
  }

  private drawHeroCardFallback(card: Node, width: number, height: number, scale: number, hero: LobbyHeroItemVO): void {
    const graphics = card.addComponent(Graphics);
    graphics.fillColor = hero.protagonist ? rgba(50, 18, 17, 226) : rgba(22, 18, 16, 214);
    this.traceSlantRect(graphics, width, height, 16 * scale);
    graphics.fill();
    graphics.fillColor = this.rarityFill(hero.rarity);
    graphics.rect(-width / 2 + 8 * scale, -height / 2 + 14 * scale, width - 16 * scale, height * 0.28);
    graphics.fill();
    graphics.strokeColor = this.rarityStroke(hero.rarity);
    graphics.lineWidth = Math.max(1, 1.6 * scale);
    this.traceSlantRect(graphics, width, height, 16 * scale);
    graphics.stroke();
  }

  private renderHeroCardBorderEffect(card: Node, hero: LobbyHeroItemVO, width: number, height: number): void {
    const rarity = safeText(hero.rarity).toUpperCase();
    if (!HERO_ROSTER_BORDER_ANIMATION_BY_RARITY[rarity]) {
      return;
    }
    this.renderRarityGoodsBorderSpine(card, rarity, width, height);
  }

  private renderRarityGoodsBorderSpine(card: Node, rarity: string, width: number, height: number): void {
    const effectNode = this.host.addChildPlainNode(card, `LobbyHeroRosterRarityGoodsBorderSpine_${rarity}`, 0, 0, width, height);
    effectNode.setScale(new Vec3(clamp((width + 12) / 120, 1.05, 2.3), clamp((height + 30) / 120, 1.6, 3.85), 1));
    const skeleton = effectNode.addComponent(sp.Skeleton);
    skeleton.premultipliedAlpha = false;
    this.loadBorderEffectData((data) => {
      if (!data || !effectNode.isValid) {
        return;
      }
      skeleton.skeletonData = data;
      const animationName = this.resolveRarityBorderAnimationName(data, rarity);
      if (animationName) {
        skeleton.setAnimation(0, animationName, true);
      }
    });
  }

  private loadBorderEffectData(callback: (data: sp.SkeletonData | null) => void): void {
    if (this.borderEffectData) {
      callback(this.borderEffectData);
      return;
    }
    this.borderEffectCallbacks.push(callback);
    if (this.borderEffectLoading) {
      return;
    }
    this.borderEffectLoading = true;
    resources.load(HERO_ROSTER_BORDER_EFFECT_RESOURCE, sp.SkeletonData, (error, data) => {
      this.borderEffectLoading = false;
      this.borderEffectData = error ? null : data ?? null;
      const callbacks = this.borderEffectCallbacks.splice(0);
      callbacks.forEach((queued) => queued(this.borderEffectData));
    });
  }

  private resolveRarityBorderAnimationName(data: sp.SkeletonData, rarity: string): string | null {
    const target = HERO_ROSTER_BORDER_ANIMATION_BY_RARITY[rarity.toUpperCase()];
    if (!target) {
      return null;
    }
    const enumMap = data.getAnimsEnum();
    if (!enumMap) {
      return null;
    }
    const names = Object.keys(enumMap).filter((name) => name !== '<None>' && typeof enumMap[name] === 'number');
    const targetLower = target.toLowerCase();
    return names.find((name) => name.toLowerCase() === targetLower)
      ?? names.find((name) => name.toLowerCase().includes(targetLower))
      ?? null;
  }

  private renderHeroPortrait(card: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const portraitAsset = this.resolveHeroRosterPortraitAsset(hero);
    const portraitWidth = width * 0.82;
    const portraitHeight = height * 0.46;
    const portraitY = height * 0.15;
    if (portraitAsset && this.host.addSprite('LobbyHeroRosterPortraitSprite', portraitAsset, 0, portraitY, portraitWidth, portraitHeight, card)) {
      return;
    }
    this.drawHeroReliefPortrait(card, hero, 0, portraitY, portraitWidth, portraitHeight, scale);
  }

  private drawHeroCardInfoPlate(card: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const plateWidth = width * 0.83;
    const plateHeight = height * 0.275;
    const plateY = -height / 2 + height * 0.15;
    const plate = this.host.addChildPlainNode(card, 'LobbyHeroRosterInfoPlate', 0, plateY, plateWidth, plateHeight);
    const graphics = plate.addComponent(Graphics);
    const stroke = this.rarityStroke(hero.rarity);
    graphics.fillColor = rgba(2, 3, 6, HERO_ROSTER_CARD_INFO_PLATE_BASE_ALPHA);
    this.traceSlantRect(graphics, plateWidth, plateHeight, 8 * scale);
    graphics.fill();
    graphics.fillColor = new Color(stroke.r, stroke.g, stroke.b, HERO_ROSTER_CARD_INFO_PLATE_TINT_ALPHA);
    this.traceSlantRect(graphics, plateWidth, plateHeight, 8 * scale);
    graphics.fill();
    graphics.strokeColor = new Color(stroke.r, stroke.g, stroke.b, 118);
    graphics.lineWidth = Math.max(1, 1 * scale);
    this.traceInfoPlateLowerFrame(graphics, plateWidth, plateHeight, 8 * scale);
    graphics.stroke();
  }

  private renderHeroCardChrome(card: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const rarity = safeText(hero.rarity || 'R').toUpperCase();
    const badgeSize = 38 * scale;
    const badgeInsetX = HERO_ROSTER_CARD_BADGE_INSET_X * scale;
    const badgeInsetY = HERO_ROSTER_CARD_BADGE_INSET_Y * scale;
    const badgeX = width / 2 - badgeInsetX - badgeSize / 2;
    const badgeY = height / 2 - badgeInsetY - badgeSize / 2;
    const topBadge = this.host.addChildPlainNode(card, 'LobbyHeroRosterClassBadge', badgeX, badgeY, badgeSize, badgeSize);
    this.drawDiamondBadge(topBadge, badgeSize, this.rarityStroke(rarity), scale);
    const topLabel = this.host.addChildLabel(topBadge, 'LobbyHeroRosterClassBadgeText', hero.protagonist ? '主' : '英', 0, 0, 15 * scale, rgba(255, 235, 181), new Size(30 * scale, 26 * scale));
    topLabel.overflow = Label.Overflow.SHRINK;
    this.applyOutline(topLabel, scale, false);

    if (hero.protagonist) {
      const mark = this.host.addChildPlainNode(card, 'LobbyHeroRosterProtagonistDot', badgeX + 10 * scale, badgeY + 10 * scale, 12 * scale, 12 * scale);
      const graphics = mark.addComponent(Graphics);
      graphics.fillColor = rgba(238, 55, 44, 238);
      graphics.circle(0, 0, 5 * scale);
      graphics.fill();
    }

    this.drawHeroCardInfoPlate(card, hero, width, height, scale);

    const infoTop = -height / 2 + height * HERO_ROSTER_CARD_RARITY_Y_RATIO;
    const rarityLabel = this.host.addChildLabel(card, 'LobbyHeroRosterRarity', rarity, 0, infoTop, Math.min(34 * scale, height * 0.105), this.rarityTextColor(rarity), new Size(width - 46 * scale, height * 0.12));
    rarityLabel.overflow = Label.Overflow.SHRINK;
    this.applyOutline(rarityLabel, scale, true);

    const name = this.host.addChildLabel(card, 'LobbyHeroRosterHeroName', safeText(hero.heroName), 0, -height / 2 + height * 0.145, Math.min(17 * scale, height * 0.052), rgba(250, 218, 146), new Size(width - 42 * scale, height * 0.08));
    name.overflow = Label.Overflow.SHRINK;
    this.applyOutline(name, scale, true);

    const star = this.host.addChildLabel(card, 'LobbyHeroRosterStars', starText(hero.star), 0, -height / 2 + height * 0.068, Math.min(15 * scale, height * 0.046), rgba(245, 202, 82), new Size(width - 50 * scale, height * 0.066));
    star.overflow = Label.Overflow.SHRINK;
    this.applyOutline(star, scale, false);

    const levelWidth = 68 * scale;
    const levelHeight = 26 * scale;
    const levelInsetX = HERO_ROSTER_CARD_LEVEL_INSET_X * scale;
    const levelInsetY = HERO_ROSTER_CARD_LEVEL_INSET_Y * scale;
    const levelX = -width / 2 + levelInsetX + levelWidth / 2;
    const levelY = height / 2 - levelInsetY - levelHeight / 2;
    const levelPlate = this.host.addChildPlainNode(card, 'LobbyHeroRosterLevelPlate', levelX, levelY, levelWidth, levelHeight);
    const levelGraphics = levelPlate.addComponent(Graphics);
    levelGraphics.fillColor = rgba(12, 9, 6, 188);
    this.traceSlantRect(levelGraphics, levelWidth, levelHeight, 6 * scale);
    levelGraphics.fill();
    levelGraphics.strokeColor = rgba(222, 178, 82, 122);
    levelGraphics.lineWidth = Math.max(1, 1 * scale);
    this.traceSlantRect(levelGraphics, levelWidth, levelHeight, 6 * scale);
    levelGraphics.stroke();
    const level = this.host.addChildLabel(levelPlate, 'LobbyHeroRosterLevelText', `Lv.${Math.max(1, hero.level)}`, 0, 0, 16 * scale, rgba(246, 225, 170), new Size(levelWidth - 10 * scale, levelHeight), HorizontalTextAlignment.CENTER);
    level.overflow = Label.Overflow.SHRINK;
    this.applyOutline(level, scale, false);
  }

  private drawHeroReliefPortrait(parent: Node, hero: LobbyHeroItemVO, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, 'LobbyHeroRosterHeroRelief', x, y, width, height);
    const graphics = node.addComponent(Graphics);
    const stroke = this.rarityStroke(hero.rarity);
    const seed = Math.max(1, Math.abs(Math.trunc(hero.id || 1)));
    graphics.fillColor = rgba(0, 0, 0, 96);
    graphics.ellipse(0, -height * 0.43, width * 0.42, height * 0.06);
    graphics.fill();

    graphics.fillColor = new Color(stroke.r, stroke.g, stroke.b, 22);
    graphics.ellipse(0, height * 0.02, width * 0.36, height * 0.44);
    graphics.fill();
    graphics.strokeColor = new Color(stroke.r, stroke.g, stroke.b, 74);
    graphics.lineWidth = Math.max(1, 0.8 * scale);
    graphics.ellipse(0, height * 0.02, width * 0.35, height * 0.43);
    graphics.stroke();

    for (let index = 0; index < 12; index += 1) {
      const px = ((seed * (index + 7) * 17) % 100) / 100 * width - width / 2;
      const py = ((seed * (index + 11) * 19) % 100) / 100 * height - height / 2;
      graphics.fillColor = index % 2 === 0 ? rgba(210, 145, 70, 42) : new Color(stroke.r, stroke.g, stroke.b, 38);
      graphics.circle(px * 0.74, py * 0.72, (0.7 + (index % 3) * 0.3) * scale);
      graphics.fill();
    }

    graphics.fillColor = hero.protagonist ? rgba(63, 17, 15, 230) : rgba(8, 9, 13, 228);
    graphics.moveTo(-width * 0.3, -height * 0.38);
    graphics.lineTo(-width * 0.18, -height * 0.06);
    graphics.lineTo(-width * 0.1, height * 0.14);
    graphics.lineTo(width * 0.1, height * 0.14);
    graphics.lineTo(width * 0.18, -height * 0.06);
    graphics.lineTo(width * 0.3, -height * 0.38);
    graphics.close();
    graphics.fill();

    graphics.fillColor = rgba(16, 17, 22, 238);
    graphics.moveTo(-width * 0.36, -height * 0.18);
    graphics.lineTo(-width * 0.18, -height * 0.02);
    graphics.lineTo(width * 0.18, -height * 0.02);
    graphics.lineTo(width * 0.36, -height * 0.18);
    graphics.lineTo(width * 0.24, -height * 0.34);
    graphics.lineTo(-width * 0.24, -height * 0.34);
    graphics.close();
    graphics.fill();

    graphics.fillColor = rgba(3, 4, 7, 246);
    graphics.moveTo(0, height * 0.32);
    graphics.lineTo(width * 0.19, height * 0.11);
    graphics.lineTo(width * 0.12, -height * 0.02);
    graphics.lineTo(-width * 0.12, -height * 0.02);
    graphics.lineTo(-width * 0.19, height * 0.11);
    graphics.close();
    graphics.fill();

    graphics.strokeColor = new Color(stroke.r, stroke.g, stroke.b, 122);
    graphics.lineWidth = Math.max(1, 1.15 * scale);
    graphics.moveTo(-width * 0.22, -height * 0.18);
    graphics.lineTo(-width * 0.1, height * 0.03);
    graphics.lineTo(-width * 0.16, height * 0.12);
    graphics.moveTo(width * 0.22, -height * 0.18);
    graphics.lineTo(width * 0.1, height * 0.03);
    graphics.lineTo(width * 0.16, height * 0.12);
    graphics.stroke();

    graphics.fillColor = hero.protagonist ? rgba(214, 58, 43, 204) : new Color(stroke.r, stroke.g, stroke.b, 158);
    graphics.moveTo(0, height * 0.2);
    graphics.lineTo(width * 0.1, -height * 0.14);
    graphics.lineTo(0, -height * 0.05);
    graphics.lineTo(-width * 0.1, -height * 0.14);
    graphics.close();
    graphics.fill();

    graphics.strokeColor = rgba(214, 184, 126, 80);
    graphics.lineWidth = Math.max(1, 0.9 * scale);
    graphics.moveTo(0, height * 0.34);
    graphics.lineTo(0, -height * 0.36);
    graphics.moveTo(-width * 0.28, -height * 0.3);
    graphics.lineTo(width * 0.28, -height * 0.3);
    graphics.stroke();
  }

  private renderUpgradeDock(parent: Node, width: number, height: number, scale: number): void {
    const dockWidth = Math.min(320 * scale, width * 0.34);
    const dockHeight = 86 * scale;
    const dockX = width / 2 - dockWidth / 2 - 34 * scale;
    const dockY = -height / 2 + 70 * scale;
    const dock = this.host.addChildPlainNode(parent, 'LobbyHeroRosterUpgradeDock', dockX, dockY, dockWidth, dockHeight);
    const graphics = dock.addComponent(Graphics);
    graphics.fillColor = rgba(25, 18, 21, 210);
    this.traceSlantRect(graphics, dockWidth, dockHeight, 22 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(122, 85, 70, 148);
    graphics.lineWidth = Math.max(1, 1 * scale);
    this.traceSlantRect(graphics, dockWidth, dockHeight, 22 * scale);
    graphics.stroke();

    const note = this.host.addChildLabel(dock, 'LobbyHeroRosterUpgradeCostDisabled', '养成入口未开放', -dockWidth / 2 + 18 * scale, 14 * scale, 14 * scale, rgba(177, 158, 125), new Size(dockWidth - 116 * scale, 22 * scale), HorizontalTextAlignment.LEFT);
    note.overflow = Label.Overflow.SHRINK;

    const button = this.host.addChildPlainNode(dock, 'LobbyHeroRosterUpgradeButtonDisabled', dockWidth / 2 - 58 * scale, 0, 92 * scale, 60 * scale);
    const buttonGraphics = button.addComponent(Graphics);
    buttonGraphics.fillColor = rgba(54, 36, 34, 190);
    this.traceSlantRect(buttonGraphics, 92 * scale, 60 * scale, 16 * scale);
    buttonGraphics.fill();
    buttonGraphics.strokeColor = rgba(188, 145, 82, 148);
    buttonGraphics.lineWidth = Math.max(1, 1.3 * scale);
    this.traceSlantRect(buttonGraphics, 92 * scale, 60 * scale, 16 * scale);
    buttonGraphics.stroke();
    const label = this.host.addChildLabel(button, 'LobbyHeroRosterUpgradeButtonLabel', '升级关闭', 0, 0, 17 * scale, rgba(222, 198, 146), new Size(78 * scale, 42 * scale));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
  }

  private renderFooter(parent: Node, width: number, height: number, scale: number): void {
    const maxWidth = Math.max(160 * scale, width - 420 * scale);
    const note = this.host.addChildLabel(
      parent,
      'LobbyHeroRosterBoundaryNote',
      '当前英雄页只读展示已拥有英雄；不提供升级、升星、觉醒、抽卡、领取或资源变更入口。',
      -width / 2 + 42 * scale,
      -height / 2 + 30 * scale,
      14 * scale,
      rgba(170, 150, 109),
      new Size(maxWidth, 24 * scale),
      HorizontalTextAlignment.LEFT,
    );
    note.overflow = Label.Overflow.SHRINK;
  }

  private drawFallbackBackdrop(parent: Node, width: number, height: number, scale: number): void {
    const graphics = parent.addComponent(Graphics);
    graphics.fillColor = rgba(13, 15, 18, 236);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = rgba(53, 35, 24, 92);
    graphics.rect(-width / 2, -height * 0.12, width, height * 0.28);
    graphics.fill();
    graphics.strokeColor = rgba(150, 108, 58, 74);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.moveTo(-width / 2 + 20 * scale, height / 2 - 78 * scale);
    graphics.lineTo(width / 2 - 20 * scale, height / 2 - 78 * scale);
    graphics.stroke();
  }

  private drawSceneShade(parent: Node, width: number, height: number, scale: number): void {
    const shade = this.host.addChildPlainNode(parent, 'LobbyHeroRosterSceneShade', 0, 0, width, height);
    const graphics = shade.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 88);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = rgba(0, 0, 0, 132);
    graphics.rect(-width / 2, -height / 2, width, height * 0.24);
    graphics.fill();
  }

  private resolveHeroRosterCardAsset(hero: LobbyHeroItemVO): string {
    return HERO_CARD_ASSET_BY_RARITY[safeText(hero.rarity).toUpperCase()] ?? HERO_CARD_ASSET_BY_RARITY.R;
  }

  private resolveHeroRosterPortraitAsset(hero: LobbyHeroItemVO): string | null {
    if (!USE_HERO_ROSTER_EXTERNAL_PORTRAITS) {
      return null;
    }
    return safeText(hero.portraitAsset || hero.spineAsset || '').trim() ? null : null;
  }

  private drawDiamondBadge(parent: Node, size: number, color: Color, scale: number): void {
    const graphics = parent.addComponent(Graphics);
    graphics.fillColor = new Color(color.r, color.g, color.b, 128);
    graphics.moveTo(0, size / 2);
    graphics.lineTo(size / 2, 0);
    graphics.lineTo(0, -size / 2);
    graphics.lineTo(-size / 2, 0);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = color;
    graphics.lineWidth = Math.max(1, 1.4 * scale);
    graphics.moveTo(0, size / 2);
    graphics.lineTo(size / 2, 0);
    graphics.lineTo(0, -size / 2);
    graphics.lineTo(-size / 2, 0);
    graphics.close();
    graphics.stroke();
  }

  private traceSlantRect(graphics: Graphics, width: number, height: number, bevel: number): void {
    const left = -width / 2;
    const right = width / 2;
    const top = height / 2;
    const bottom = -height / 2;
    const corner = Math.min(bevel, width * 0.2, height * 0.45);
    graphics.moveTo(left + corner, top);
    graphics.lineTo(right - corner, top);
    graphics.lineTo(right, top - corner);
    graphics.lineTo(right, bottom + corner);
    graphics.lineTo(right - corner, bottom);
    graphics.lineTo(left + corner, bottom);
    graphics.lineTo(left, bottom + corner);
    graphics.lineTo(left, top - corner);
    graphics.close();
  }

  private traceInfoPlateLowerFrame(graphics: Graphics, width: number, height: number, bevel: number): void {
    const left = -width / 2;
    const right = width / 2;
    const top = height / 2;
    const bottom = -height / 2;
    const corner = Math.min(bevel, width * 0.2, height * 0.45);
    graphics.moveTo(left, top - corner);
    graphics.lineTo(left, bottom + corner);
    graphics.lineTo(left + corner, bottom);
    graphics.lineTo(right - corner, bottom);
    graphics.lineTo(right, bottom + corner);
    graphics.lineTo(right, top - corner);
  }

  private rarityTextColor(rarity: string): Color {
    const key = rarity.toUpperCase();
    if (key === 'UR') {
      return rgba(255, 219, 124);
    }
    if (key === 'SSR') {
      return rgba(255, 168, 98);
    }
    if (key === 'SR') {
      return rgba(222, 176, 255);
    }
    return rgba(150, 203, 255);
  }

  private rarityStroke(rarity: string): Color {
    const key = rarity.toUpperCase();
    if (key === 'UR') {
      return rgba(236, 190, 84, 220);
    }
    if (key === 'SSR') {
      return rgba(218, 92, 58, 220);
    }
    if (key === 'SR') {
      return rgba(148, 92, 218, 218);
    }
    return rgba(78, 142, 212, 210);
  }

  private rarityFill(rarity: string): Color {
    const stroke = this.rarityStroke(rarity);
    return new Color(stroke.r, stroke.g, stroke.b, 92);
  }

  private applyOutline(label: Label, scale: number, strong: boolean): void {
    label.enableOutline = true;
    label.outlineColor = rgba(0, 0, 0, strong ? 232 : 190);
    label.outlineWidth = Math.max(1, (strong ? 1.5 : 1) * scale);
  }
}

function formatCompactInteger(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  if (safe >= 1000000) {
    return `${(safe / 1000000).toFixed(safe >= 10000000 ? 0 : 1)}M`;
  }
  if (safe >= 10000) {
    return `${(safe / 10000).toFixed(safe >= 100000 ? 0 : 1)}万`;
  }
  return safe.toLocaleString('en-US');
}

function starText(star: number): string {
  const count = Math.max(1, Math.min(6, Math.trunc(star || 1)));
  return `${'★'.repeat(count)}${'☆'.repeat(Math.max(0, 6 - count))}`;
}
