import {
  BlockInputEvents,
  Button,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Mask,
  Node,
  resources,
  ScrollView,
  Size,
  sp,
  Sprite,
  SpriteFrame,
  tween,
  UITransform,
  Vec3,
} from 'cc';
import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../../types/LobbyHeroTypes';
import { safeText } from '../UiTextFormatter';
import { renderSceneBackButton } from '../UiSceneBackButton';
import { clamp, rgba, type UiLayout } from './LobbyHudTypes';

export const LOBBY_HERO_ROSTER_BACKDROP_ASSET = 'ui/hero-detail/hero_detail_backdrop/spriteFrame';
export const LOBBY_HERO_ROSTER_CARD_FRAME_ASSET = 'ui/hero-roster/hero_card_frame/spriteFrame';
export const LOBBY_HERO_ROSTER_CARD_ASSETS = [
  LOBBY_HERO_ROSTER_CARD_FRAME_ASSET,
];

const HERO_FILTER_ALL = '全部';
const HERO_CLASS_FILTER_ORDER = ['战士', '辅助', '刺客', '法师', '射手', '坦克'];
const HERO_CLASS_KEY_ALIASES: Record<string, string> = {
  '战士': '战士',
  '戰士': '战士',
  '鎴樺+': '战士',
  '辅助': '辅助',
  '輔助': '辅助',
  '杈呭姪': '辅助',
  '刺客': '刺客',
  '鍒哄': '刺客',
  '法师': '法师',
  '法師': '法师',
  '娉曞笀': '法师',
  '射手': '射手',
  '灏勬墜': '射手',
  '坦克': '坦克',
  '鍧﹀厠': '坦克',
};
const HERO_ROSTER_CARD_ASPECT_WIDTH = 937;
const HERO_ROSTER_CARD_ASPECT_HEIGHT = 1676;
const HERO_ROSTER_CARD_DISPLAY_WIDTH_SCALE = 1.2;
const HERO_ROSTER_CARD_MAX_COLUMNS = 5;
const HERO_ROSTER_CARD_DESKTOP_TARGET_HEIGHT = 468;
const HERO_ROSTER_CARD_DESKTOP_MAX_HEIGHT = 492;
const HERO_ROSTER_CARD_COMPACT_TARGET_HEIGHT = 310;
const HERO_ROSTER_CARD_COMPACT_MAX_HEIGHT = 340;
const HERO_ROSTER_CARD_LEFT_INSET = 12;
const HERO_ROSTER_CARD_TOP_INSET = 14;
const HERO_ROSTER_CARD_EFFECT_TOP_MASK_PADDING = 62;
const HERO_ROSTER_CARD_LEVEL_X_RATIO = -0.38;
const HERO_ROSTER_CARD_LEVEL_Y_RATIO = 0.38;
const HERO_ROSTER_CARD_LEVEL_TEXT_WIDTH_RATIO = 0.29;
const HERO_ROSTER_CARD_BADGE_X_RATIO = 0.37;
const HERO_ROSTER_CARD_BADGE_Y_RATIO = 0.38;
const HERO_ROSTER_CARD_BADGE_SIZE_RATIO = 0.17;
const HERO_ROSTER_BORDER_EFFECT_RESOURCE = 'spine/ui/hero-roster/goods_1_border/goods_1';
const HERO_ROSTER_BORDER_ANIMATION_BY_RARITY: Record<string, string> = {
  R: 'K3',
  SR: 'K4',
  SSR: 'K5',
  UR: 'K7',
};
const HERO_ROSTER_UR_SEQUENCE_BORDER_PATH_PREFIX = 'ui/hero-roster/UR-card-border';
const HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_COUNT = 12;
const HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_DURATION_SECONDS = 0.07;
const HERO_ROSTER_UR_SEQUENCE_BORDER_ALPHA = 255;
const HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_WIDTH_RATIO = 1.25;
const HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_HEIGHT_RATIO = 1.25;
const HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_Y_RATIO = -0.01;
const HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_PATHS = Array.from(
  { length: HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_COUNT },
  (_, index) => `${HERO_ROSTER_UR_SEQUENCE_BORDER_PATH_PREFIX}/${String(index + 1).padStart(2, '0')}/spriteFrame`,
);
const HERO_ROSTER_GOODS_BORDER_WIDTH_PADDING = 33;
const HERO_ROSTER_GOODS_BORDER_HEIGHT_PADDING = 61;
const HERO_ROSTER_GOODS_BORDER_Y_RATIO = -0.03;
const HERO_ROSTER_GOODS_BORDER_WIDTH_SCALE_MAX = 2.8;
const HERO_ROSTER_CARD_RARITY_Y_RATIO = 0.324;
const HERO_ROSTER_CARD_NAME_Y_RATIO = 0.132;
const HERO_ROSTER_CARD_POWER_Y_RATIO = 0.205;
const HERO_ROSTER_CARD_STARS_Y_RATIO = 0.815;
const HERO_ROSTER_RARITY_DISPLAY_ORDER: Record<string, number> = {
  UR: 0,
  SSR: 1,
  SR: 2,
  R: 3,
};

const USE_HERO_ROSTER_EXTERNAL_PORTRAITS = false;

export interface LobbyHeroRosterPanelHost {
  node: Node;
  currentLobbyHeroRosterState(): LobbyHeroRosterPanelState;
  closeLobbyHeroRosterPanel(): void;
  reloadLobbyHeroRoster(): void;
  refreshLobbyOverlay?(): void;
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
  private selectedHeroClass = HERO_FILTER_ALL;
  private borderEffectData: sp.SkeletonData | null = null;
  private borderEffectLoading = false;
  private readonly borderEffectCallbacks: Array<(data: sp.SkeletonData | null) => void> = [];
  private urSequenceBorderFrames: SpriteFrame[] | null = null;
  private urSequenceBorderLoading = false;
  private urSequenceBorderLoadFailed = false;
  private readonly urSequenceBorderCallbacks: Array<(frames: SpriteFrame[] | null) => void> = [];

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
    const filterTabs = this.resolveHeroFilterTabs(state.heroes, state.heroClassOptions);
    this.ensureSelectedHeroClass(filterTabs);
    const filterMetrics = this.renderFilterRail(panel, panelWidth, panelHeight, scale, filterTabs);
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

  private renderFilterRail(parent: Node, width: number, height: number, scale: number, tabs: string[]): { railWidth: number; railHeight: number; horizontal: boolean } {
    const horizontal = width < 720 * scale || height < 430 * scale;
    if (horizontal) {
      return this.renderHorizontalFilters(parent, width, height, scale, tabs);
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

    const tabHeight = Math.min(54 * scale, railHeight / Math.max(1, tabs.length));
    const top = railHeight / 2 - tabHeight / 2;
    tabs.forEach((tab, index) => {
      this.renderFilterTab(rail, index, tab, 0, top - index * tabHeight, railWidth, tabHeight, scale, this.isHeroClassTabActive(tab), false);
    });
    return { railWidth: railWidth + 46 * scale, railHeight, horizontal: false };
  }

  private renderHorizontalFilters(parent: Node, width: number, height: number, scale: number, tabs: string[]): { railWidth: number; railHeight: number; horizontal: boolean } {
    const railWidth = width - 56 * scale;
    const railHeight = 46 * scale;
    const rail = this.host.addChildPlainNode(parent, 'LobbyHeroRosterFilterRail', 0, height / 2 - 92 * scale, railWidth, railHeight);
    const tabWidth = railWidth / Math.max(1, tabs.length);
    tabs.forEach((tab, index) => {
      this.renderFilterTab(rail, index, tab, -railWidth / 2 + tabWidth / 2 + index * tabWidth, 0, tabWidth - 4 * scale, railHeight - 4 * scale, scale, this.isHeroClassTabActive(tab), true);
    });
    return { railWidth: 0, railHeight: railHeight + 18 * scale, horizontal: true };
  }

  private renderFilterTab(parent: Node, index: number, text: string, x: number, y: number, width: number, height: number, scale: number, active: boolean, horizontal: boolean): void {
    const tab = this.host.addChildPlainNode(parent, `LobbyHeroRosterFilterTab_${index}`, x, y, width, height);
    tab.addComponent(Button);
    tab.on(Button.EventType.CLICK, () => this.selectHeroClassFilter(text), this);
    this.host.applyImageButtonFeedback(tab, 1.025, 0.97);
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

  private selectHeroClassFilter(text: string): void {
    if (this.isHeroClassTabActive(text)) {
      return;
    }
    this.selectedHeroClass = text;
    if (this.host.refreshLobbyOverlay) {
      this.host.refreshLobbyOverlay();
      return;
    }
    this.host.reloadLobbyHeroRoster();
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

    const displayHeroes = this.filterHeroesBySelectedClass(this.sortHeroesForRosterDisplay(state.heroes));
    if (displayHeroes.length === 0) {
      this.renderEmpty(parent, bodyCenterX, bodyCenterY, bodyWidth, bodyHeight, scale, '暂无该职业英雄');
      return;
    }
    const gap = (filterMetrics.horizontal ? 10 : 16) * scale;
    const rowGap = (filterMetrics.horizontal ? 14 : 20) * scale;
    const preferredCardHeight = filterMetrics.horizontal
      ? Math.min(HERO_ROSTER_CARD_COMPACT_TARGET_HEIGHT * scale, bodyHeight * 0.98)
      : Math.min(HERO_ROSTER_CARD_DESKTOP_TARGET_HEIGHT * scale, bodyHeight * 0.99);
    const cardHeight = clamp(preferredCardHeight, 168 * scale, (filterMetrics.horizontal ? HERO_ROSTER_CARD_COMPACT_MAX_HEIGHT : HERO_ROSTER_CARD_DESKTOP_MAX_HEIGHT) * scale);
    const maxCardsInRow = Math.max(1, Math.min(displayHeroes.length, HERO_ROSTER_CARD_MAX_COLUMNS));
    const maxCardWidthForRow = Math.max(96 * scale, (bodyWidth - HERO_ROSTER_CARD_LEFT_INSET * scale * 2 - gap * Math.max(0, maxCardsInRow - 1)) / maxCardsInRow);
    const cardWidth = Math.min(cardHeight * HERO_ROSTER_CARD_ASPECT_WIDTH / HERO_ROSTER_CARD_ASPECT_HEIGHT * HERO_ROSTER_CARD_DISPLAY_WIDTH_SCALE, maxCardWidthForRow);
    const columns = Math.max(1, Math.min(maxCardsInRow, Math.floor((bodyWidth + gap) / (cardWidth + gap))));
    const cardInsetX = HERO_ROSTER_CARD_LEFT_INSET * scale;
    const cardInsetY = HERO_ROSTER_CARD_TOP_INSET * scale;
    const scrollEffectTopPadding = HERO_ROSTER_CARD_EFFECT_TOP_MASK_PADDING * scale;
    const viewportHeight = bodyHeight + scrollEffectTopPadding;
    const viewportCenterY = bodyCenterY + scrollEffectTopPadding / 2;
    const rows = Math.max(1, Math.ceil(displayHeroes.length / columns));
    const contentHeight = Math.max(viewportHeight, rows * cardHeight + Math.max(0, rows - 1) * rowGap + cardInsetY * 2 + scrollEffectTopPadding);
    const viewport = this.host.addChildPlainNode(parent, 'LobbyHeroRosterScrollView', bodyCenterX, viewportCenterY, bodyWidth, viewportHeight);
    const mask = viewport.addComponent(Mask);
    mask.type = Mask.Type.GRAPHICS_RECT;
    const scrollView = viewport.addComponent(ScrollView);
    scrollView.horizontal = false;
    scrollView.vertical = true;
    scrollView.inertia = true;
    scrollView.elastic = true;
    scrollView.cancelInnerEvents = true;
    const content = this.host.addChildPlainNode(viewport, 'LobbyHeroRosterScrollContent', 0, (viewportHeight - contentHeight) / 2, bodyWidth, contentHeight);
    scrollView.content = content;
    const startX = -bodyWidth / 2 + cardInsetX + cardWidth / 2;
    const startY = contentHeight / 2 - scrollEffectTopPadding - cardInsetY - cardHeight / 2;

    displayHeroes.forEach((hero, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      this.renderHeroCard(content, hero, index, startX + col * (cardWidth + gap), startY - row * (cardHeight + rowGap), cardWidth, cardHeight, scale);
    });
  }

  private resolveHeroFilterTabs(heroes: LobbyHeroItemVO[], heroClassOptions: string[] = []): string[] {
    const available = new Map<string, string>();
    HERO_CLASS_FILTER_ORDER.forEach((item) => this.addHeroClassTab(available, item));
    heroClassOptions.forEach((item) => {
      this.addHeroClassTab(available, item);
    });
    heroes.forEach((hero) => {
      this.addHeroClassTab(available, this.resolveHeroClass(hero));
    });
    const defaultKeys = new Set(HERO_CLASS_FILTER_ORDER.map((item) => this.normalizeHeroClassKey(item)));
    const ordered = HERO_CLASS_FILTER_ORDER
      .map((item) => available.get(this.normalizeHeroClassKey(item)))
      .filter((item): item is string => !!item);
    const rest = Array.from(available.entries())
      .filter(([key]) => !defaultKeys.has(key))
      .map(([, text]) => text)
      .sort((left, right) => left.localeCompare(right, 'zh-Hans-CN'));
    return [HERO_FILTER_ALL, ...ordered, ...rest];
  }

  private ensureSelectedHeroClass(tabs: string[]): void {
    if (this.selectedHeroClass === HERO_FILTER_ALL) {
      return;
    }
    const selectedKey = this.normalizeHeroClassKey(this.selectedHeroClass);
    const matched = tabs.find((tab) => this.normalizeHeroClassKey(tab) === selectedKey);
    if (matched) {
      this.selectedHeroClass = matched;
    } else {
      this.selectedHeroClass = HERO_FILTER_ALL;
    }
  }

  private filterHeroesBySelectedClass(heroes: LobbyHeroItemVO[]): LobbyHeroItemVO[] {
    if (this.selectedHeroClass === HERO_FILTER_ALL) {
      return heroes;
    }
    const selectedKey = this.normalizeHeroClassKey(this.selectedHeroClass);
    return heroes.filter((hero) => this.normalizeHeroClassKey(this.resolveHeroClass(hero)) === selectedKey);
  }

  private resolveHeroClass(hero: LobbyHeroItemVO): string | null {
    const value = safeText(hero.heroClass).trim();
    return value || null;
  }

  private addHeroClassTab(tabByKey: Map<string, string>, value: string | null | undefined): void {
    const text = safeText(value).trim();
    const key = this.normalizeHeroClassKey(text);
    if (!key || tabByKey.has(key)) {
      return;
    }
    tabByKey.set(key, text);
  }

  private isHeroClassTabActive(text: string): boolean {
    if (this.selectedHeroClass === HERO_FILTER_ALL || text === HERO_FILTER_ALL) {
      return this.selectedHeroClass === text;
    }
    return this.normalizeHeroClassKey(text) === this.normalizeHeroClassKey(this.selectedHeroClass);
  }

  private normalizeHeroClassKey(value: string | null | undefined): string {
    const text = safeText(value)
      .replace(/[\s\u00a0\u3000]/g, '')
      .replace(/[＋]/g, '+');
    return HERO_CLASS_KEY_ALIASES[text] ?? text;
  }

  private sortHeroesForRosterDisplay(heroes: LobbyHeroItemVO[]): LobbyHeroItemVO[] {
    return heroes
      .map((hero, index) => ({ hero, index }))
      .sort((left, right) => {
        const rarityDelta = this.resolveRarityDisplayRank(left.hero.rarity) - this.resolveRarityDisplayRank(right.hero.rarity);
        if (rarityDelta !== 0) {
          return rarityDelta;
        }
        return left.index - right.index;
      })
      .map(({ hero }) => hero);
  }

  private resolveRarityDisplayRank(rarity: string): number {
    const normalized = safeText(rarity || 'R').toUpperCase();
    return HERO_ROSTER_RARITY_DISPLAY_ORDER[normalized] ?? 99;
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
    const cardAsset = this.resolveHeroRosterCardAsset();
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
    if (rarity === 'UR') {
      this.renderUrCardSequenceBorder(card, width, height);
      this.renderRarityGoodsBorderSpine(card, 'UR', width, height);
      return;
    }
    this.renderRarityGoodsBorderSpine(card, rarity, width, height);
  }

  private renderUrCardSequenceBorder(card: Node, width: number, height: number): void {
    const effectWidth = width * HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_WIDTH_RATIO;
    const effectHeight = height * HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_HEIGHT_RATIO;
    const effectNode = this.host.addChildPlainNode(card, 'LobbyHeroRosterUrSequenceBorderSprite', 0, height * HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_Y_RATIO, effectWidth, effectHeight);
    const sprite = effectNode.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.color = rgba(255, 255, 255, HERO_ROSTER_UR_SEQUENCE_BORDER_ALPHA);
    this.loadUrSequenceBorderFrames((frames) => {
      if (!effectNode.isValid) {
        return;
      }
      if (!frames || frames.length === 0) {
        effectNode.removeFromParent();
        return;
      }
      this.startSequenceBorderAnimation(effectNode, sprite, frames, HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_DURATION_SECONDS);
    });
  }

  private startSequenceBorderAnimation(effectNode: Node, sprite: Sprite, frames: SpriteFrame[], frameDurationSeconds: number): void {
    let frameIndex = 0;
    sprite.spriteFrame = frames[frameIndex];
    tween(effectNode)
      .repeatForever(
        tween()
          .delay(frameDurationSeconds)
          .call(() => {
            if (!effectNode.isValid) {
              return;
            }
            frameIndex = (frameIndex + 1) % frames.length;
            sprite.spriteFrame = frames[frameIndex];
          }),
      )
      .start();
  }

  private renderRarityGoodsBorderSpine(card: Node, rarity: string, width: number, height: number, siblingIndex = -1): void {
    const effectNode = this.host.addChildPlainNode(card, `LobbyHeroRosterRarityGoodsBorderSpine_${rarity}`, 0, height * HERO_ROSTER_GOODS_BORDER_Y_RATIO, width, height);
    if (siblingIndex >= 0) {
      effectNode.setSiblingIndex(siblingIndex);
    }
    effectNode.setScale(new Vec3(
      clamp((width + HERO_ROSTER_GOODS_BORDER_WIDTH_PADDING) / 120, 1.12, HERO_ROSTER_GOODS_BORDER_WIDTH_SCALE_MAX),
      clamp((height + HERO_ROSTER_GOODS_BORDER_HEIGHT_PADDING) / 120, 1.75, 4.2),
      1,
    ));
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

  private loadUrSequenceBorderFrames(callback: (frames: SpriteFrame[] | null) => void): void {
    if (this.urSequenceBorderFrames) {
      callback(this.urSequenceBorderFrames);
      return;
    }
    if (this.urSequenceBorderLoadFailed) {
      callback(null);
      return;
    }
    this.urSequenceBorderCallbacks.push(callback);
    if (this.urSequenceBorderLoading) {
      return;
    }
    this.urSequenceBorderLoading = true;
    const frames: Array<SpriteFrame | null> = new Array(HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_PATHS.length).fill(null);
    let pending = HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_PATHS.length;
    let failed = false;
    HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_PATHS.forEach((path, index) => {
      resources.load(path, SpriteFrame, (error, frame) => {
        if (error || !frame) {
          failed = true;
        } else {
          frames[index] = frame;
        }
        pending -= 1;
        if (pending > 0) {
          return;
        }
        this.urSequenceBorderLoading = false;
        this.urSequenceBorderFrames = failed ? null : frames.filter((item): item is SpriteFrame => !!item);
        this.urSequenceBorderLoadFailed = failed;
        const callbacks = this.urSequenceBorderCallbacks.splice(0);
        callbacks.forEach((queued) => queued(this.urSequenceBorderFrames));
      });
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

  private renderHeroCardChrome(card: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const rarity = safeText(hero.rarity || 'R').toUpperCase();
    const badgeSize = clamp(width * HERO_ROSTER_CARD_BADGE_SIZE_RATIO, 28 * scale, 42 * scale);
    const badgeX = width * HERO_ROSTER_CARD_BADGE_X_RATIO;
    const badgeY = height * HERO_ROSTER_CARD_BADGE_Y_RATIO;
    const topBadge = this.host.addChildPlainNode(card, 'LobbyHeroRosterClassBadge', badgeX, badgeY, badgeSize, badgeSize);
    this.drawCircleBadge(topBadge, badgeSize, this.rarityStroke(rarity), scale);
    const topLabel = this.host.addChildLabel(topBadge, 'LobbyHeroRosterClassBadgeText', this.resolveHeroClassBadgeText(hero), 0, 0, 15 * scale, rgba(255, 235, 181), new Size(30 * scale, 26 * scale));
    topLabel.overflow = Label.Overflow.SHRINK;
    this.applyOutline(topLabel, scale, false);

    const infoTop = -height / 2 + height * HERO_ROSTER_CARD_RARITY_Y_RATIO;
    const rarityLabel = this.host.addChildLabel(card, 'LobbyHeroRosterRarity', rarity, 0, infoTop, Math.min(28 * scale, height * 0.078), this.rarityTextColor(rarity), new Size(width - 58 * scale, height * 0.086));
    rarityLabel.overflow = Label.Overflow.SHRINK;
    this.applyOutline(rarityLabel, scale, true);

    const star = this.host.addChildLabel(card, 'LobbyHeroRosterStars', starText(hero.star), 0, -height / 2 + height * HERO_ROSTER_CARD_STARS_Y_RATIO, Math.min(16 * scale, height * 0.048), rgba(245, 202, 82), new Size(width - 54 * scale, height * 0.06));
    star.overflow = Label.Overflow.SHRINK;
    this.applyOutline(star, scale, false);

    const name = this.host.addChildLabel(card, 'LobbyHeroRosterHeroName', safeText(hero.heroName), 0, -height / 2 + height * HERO_ROSTER_CARD_NAME_Y_RATIO, Math.min(13 * scale, height * 0.038), rgba(250, 218, 146), new Size(width - 72 * scale, height * 0.054));
    name.overflow = Label.Overflow.SHRINK;
    this.applyOutline(name, scale, true);

    const power = this.host.addChildLabel(card, 'LobbyHeroRosterHeroPower', `战力 ${formatCompactInteger(hero.power)}`, 0, -height / 2 + height * HERO_ROSTER_CARD_POWER_Y_RATIO, Math.min(15 * scale, height * 0.044), rgba(238, 210, 132), new Size(width - 64 * scale, height * 0.058));
    power.overflow = Label.Overflow.SHRINK;
    this.applyOutline(power, scale, false);

    const level = this.host.addChildLabel(card, 'LobbyHeroRosterLevelText', formatHeroCardLevel(hero.level), width * HERO_ROSTER_CARD_LEVEL_X_RATIO, height * HERO_ROSTER_CARD_LEVEL_Y_RATIO, Math.min(14 * scale, width * 0.078), rgba(246, 225, 170), new Size(width * HERO_ROSTER_CARD_LEVEL_TEXT_WIDTH_RATIO, height * 0.058), HorizontalTextAlignment.CENTER);
    level.overflow = Label.Overflow.SHRINK;
    this.applyOutline(level, scale, false);
  }

  private resolveHeroClassBadgeText(hero: LobbyHeroItemVO): string {
    if (hero.protagonist) {
      return '主';
    }
    const heroClass = this.resolveHeroClass(hero);
    if (!heroClass) {
      return '英';
    }
    const known: Record<string, string> = {
      战士: '战',
      辅助: '辅',
      刺客: '刺',
      法师: '法',
      射手: '射',
      坦克: '坦',
    };
    return known[this.normalizeHeroClassKey(heroClass)] ?? heroClass.slice(0, 1);
  }

  private drawHeroReliefPortrait(parent: Node, hero: LobbyHeroItemVO, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, 'LobbyHeroRosterHeroRelief', x, y, width, height);
    const graphics = node.addComponent(Graphics);
    const stroke = this.rarityStroke(hero.rarity);
    const color = hero.protagonist ? rgba(214, 58, 43, 224) : new Color(stroke.r, stroke.g, stroke.b, 214);
    graphics.fillColor = color;
    graphics.moveTo(0, height * 0.28);
    graphics.lineTo(width * 0.18, -height * 0.26);
    graphics.lineTo(-width * 0.18, -height * 0.26);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = rgba(0, 0, 0, 180);
    graphics.lineWidth = Math.max(1, 1.2 * scale);
    graphics.moveTo(0, height * 0.28);
    graphics.lineTo(width * 0.18, -height * 0.26);
    graphics.lineTo(-width * 0.18, -height * 0.26);
    graphics.close();
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

  private resolveHeroRosterCardAsset(): string {
    return LOBBY_HERO_ROSTER_CARD_FRAME_ASSET;
  }

  private resolveHeroRosterPortraitAsset(hero: LobbyHeroItemVO): string | null {
    if (!USE_HERO_ROSTER_EXTERNAL_PORTRAITS) {
      return null;
    }
    return safeText(hero.portraitAsset || hero.spineAsset || '').trim() ? null : null;
  }

  private drawCircleBadge(parent: Node, size: number, color: Color, scale: number): void {
    const graphics = parent.addComponent(Graphics);
    graphics.fillColor = new Color(color.r, color.g, color.b, 150);
    graphics.circle(0, 0, size * 0.45);
    graphics.fill();
    graphics.strokeColor = color;
    graphics.lineWidth = Math.max(1, 1.4 * scale);
    graphics.circle(0, 0, size * 0.45);
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

function formatHeroCardLevel(level: number): string {
  const safeLevel = Math.max(1, Math.trunc(Number(level) || 1));
  return safeLevel >= 100 ? `Lv${safeLevel}` : `Lv.${safeLevel}`;
}
