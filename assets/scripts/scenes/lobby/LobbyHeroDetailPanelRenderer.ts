import {
  BlockInputEvents,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Node,
  Size,
  Sprite,
  UITransform,
  UIOpacity,
  Vec3,
  tween,
} from 'cc';
import type { LobbyHeroItemVO } from '../../types/LobbyHeroTypes';
import { safeText } from '../UiTextFormatter';
import { renderSceneBackButton } from '../UiSceneBackButton';
import { rgba, type UiLayout } from './LobbyHudTypes';

export const LOBBY_HERO_DETAIL_BACKDROP_ASSET = 'ui/hero-detail/hero_detail_backdrop/spriteFrame';
export const LOBBY_HERO_DETAIL_PROTAGONIST_ASSET = 'ui/hero-detail/hero_detail_protagonist/spriteFrame';

interface HeroDetailAttribute {
  label: string;
  value: string;
}

interface HeroDetailSkill {
  name: string;
  tag: string;
  description: string;
}

export interface LobbyHeroDetailPanelHost {
  node: Node;
  currentLobbyHeroDetailHero(): LobbyHeroItemVO | null;
  closeLobbyHeroDetailPanel(): void;
  backToLobbyHeroRosterPanel(): void;
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
  addSprite(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null;
  applyImageButtonFeedback(node: Node, hoverScale?: number, pressedScale?: number): void;
}

/** 英雄详情只读面板：展示英雄信息、形态、技能与战斗展示属性，不提供任何养成或资源变更入口。 */
export class LobbyHeroDetailPanelRenderer {
  constructor(private readonly host: LobbyHeroDetailPanelHost) {}

  render(layout: UiLayout): void {
    const hero = this.host.currentLobbyHeroDetailHero();
    if (!hero) {
      return;
    }
    const scale = Math.max(0.62, Math.min(1, layout.uiScale));
    const compact = layout.safeWidth < 780 * scale || layout.safeHeight < 520 * scale;
    const panelWidth = Math.max(320 * scale, layout.stageWidth);
    const panelHeight = Math.max(260 * scale, layout.stageHeight);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;

    const dim = this.host.createUiNode('LobbyHeroDetailDim');
    dim.setPosition(new Vec3(centerX, centerY, 0));
    dim.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const dimGraphics = dim.addComponent(Graphics);
    dimGraphics.fillColor = rgba(0, 0, 0, 0);
    dimGraphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    dimGraphics.fill();
    // 英雄详情是独立逻辑场景，遮罩只阻断底层输入，不再点击关闭。
    dim.addComponent(BlockInputEvents);

    const panelGroup = this.host.createUiNode('LobbyHeroDetailSceneContent');
    panelGroup.setPosition(new Vec3(centerX, centerY, 0));
    panelGroup.addComponent(UITransform).setContentSize(new Size(panelWidth, panelHeight));
    // 内容区阻断点击，保证详情内部操作不会穿透到遮罩导致关闭。
    panelGroup.addComponent(BlockInputEvents);

    const panel = this.host.addChildBeveledPanelNode(
      panelGroup,
      'LobbyHeroDetailSceneFrame',
      0,
      0,
      panelWidth,
      panelHeight,
      rgba(5, 5, 8, 232),
      rgba(198, 147, 61, 230),
      18 * scale,
    );
    this.host.addSprite('LobbyHeroDetailBackdropSprite', LOBBY_HERO_DETAIL_BACKDROP_ASSET, 0, 0, panelWidth, panelHeight, panel);
    this.drawPanelShade(panel, panelWidth, panelHeight, scale);
    this.renderHeader(panel, hero, panelWidth, panelHeight, scale);
    if (compact) {
      this.renderCompact(panel, hero, panelWidth, panelHeight, scale);
    } else {
      this.renderDesktop(panel, hero, panelWidth, panelHeight, scale);
    }
    this.renderFooter(panel, panelWidth, panelHeight, scale);
    renderSceneBackButton(this.host, panelGroup, layout, 'LobbyHeroDetailBackButton', () => this.host.backToLobbyHeroRosterPanel(), scale);
  }

  private renderHeader(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const title = this.host.addChildLabel(parent, 'LobbyHeroDetailName', safeText(hero.heroName), -width / 2 + 54 * scale, height / 2 - 46 * scale, 30 * scale, rgba(252, 225, 156), new Size(width * 0.48, 40 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const meta = this.host.addChildLabel(parent, 'LobbyHeroDetailMeta', `${safeText(hero.rarity || 'R')}  /  Lv.${hero.level}  /  战力 ${formatInteger(hero.power)}`, -width / 2 + 54 * scale, height / 2 - 82 * scale, 17 * scale, rgba(206, 169, 87), new Size(width * 0.52, 26 * scale), HorizontalTextAlignment.LEFT);
    meta.overflow = Label.Overflow.SHRINK;
  }

  private renderDesktop(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const artWidth = 470 * scale;
    const artHeight = height - 154 * scale;
    const artX = -width / 2 + 42 * scale + artWidth / 2;
    const artY = -26 * scale;
    this.renderArtStage(parent, hero, artX, artY, artWidth, artHeight, scale);

    const infoX = width / 2 - 342 * scale;
    const infoY = 14 * scale;
    const infoWidth = 612 * scale;
    const infoHeight = height - 176 * scale;
    this.renderInfoPanel(parent, hero, infoX, infoY, infoWidth, infoHeight, scale);
  }

  private renderCompact(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const artWidth = Math.min(300 * scale, width * 0.44);
    const artHeight = Math.max(120 * scale, height * 0.42);
    this.renderArtStage(parent, hero, -width / 2 + 38 * scale + artWidth / 2, height * 0.05, artWidth, artHeight, scale);
    this.renderInfoPanel(parent, hero, width * 0.15, -18 * scale, width * 0.62, height - 156 * scale, scale);
  }

  private renderArtStage(parent: Node, hero: LobbyHeroItemVO, x: number, y: number, width: number, height: number, scale: number): void {
    const stage = this.host.addChildPlainNode(parent, 'LobbyHeroDetailArtStage', x, y, width, height);
    const graphics = stage.addComponent(Graphics);
    graphics.fillColor = rgba(5, 4, 6, 164);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(180, 132, 56, 180);
    graphics.stroke();

    const aura = this.host.addChildPlainNode(stage, 'LobbyHeroDetailDynamicAura', 0, -height * 0.1, Math.min(width, height) * 0.76, Math.min(width, height) * 0.76);
    const auraGraphics = aura.addComponent(Graphics);
    auraGraphics.strokeColor = rgba(219, 54, 42, 150);
    auraGraphics.lineWidth = Math.max(1, 1.4 * scale);
    auraGraphics.circle(0, 0, Math.min(width, height) * 0.28);
    auraGraphics.stroke();
    const auraOpacity = aura.addComponent(UIOpacity);
    auraOpacity.opacity = 150;
    tween(aura)
      .repeatForever(tween().by(2.8, { angle: 18 }).to(1.6, { scale: new Vec3(1.08, 1.08, 1) }).to(1.6, { scale: Vec3.ONE }))
      .start();
    tween(auraOpacity)
      .repeatForever(tween().to(1.2, { opacity: 218 }).to(1.2, { opacity: 112 }))
      .start();

    const portrait = this.host.addChildPlainNode(stage, 'LobbyHeroDetailDynamicPortrait', 0, -height * 0.02, width * 0.86, height * 0.92);
    const loaded = this.host.addSprite('LobbyHeroDetailDynamicPortraitSprite', LOBBY_HERO_DETAIL_PROTAGONIST_ASSET, 0, 0, width * 0.8, height * 0.9, portrait);
    if (!loaded) {
      this.drawFallbackPortrait(portrait, hero, width * 0.56, height * 0.72, scale);
    }
    tween(portrait)
      .repeatForever(tween().by(1.35, { position: new Vec3(0, 5 * scale, 0) }).by(1.35, { position: new Vec3(0, -5 * scale, 0) }))
      .start();

    const name = this.host.addChildLabel(stage, 'LobbyHeroDetailArtCaption', hero.protagonist ? 'SSR 主角 / 默认攻击形态' : sourceLabel(hero.sourceType), 0, -height / 2 + 28 * scale, 16 * scale, rgba(238, 204, 128), new Size(width - 28 * scale, 24 * scale));
    name.overflow = Label.Overflow.SHRINK;
  }

  private renderInfoPanel(parent: Node, hero: LobbyHeroItemVO, x: number, y: number, width: number, height: number, scale: number): void {
    const panel = this.host.addChildPlainNode(parent, 'LobbyHeroDetailInfoPanel', x, y, width, height);
    const graphics = panel.addComponent(Graphics);
    graphics.fillColor = rgba(6, 6, 8, 198);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(150, 112, 58, 150);
    graphics.stroke();

    this.renderHeroBadges(panel, hero, width, height, scale);
    this.renderAttributeGrid(panel, hero, width, height, scale);
    this.renderSkillList(panel, hero, width, height, scale);
  }

  private renderHeroBadges(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    this.addBadge(parent, 'LobbyHeroDetailRarity', safeText(hero.rarity || 'R'), -width / 2 + 72 * scale, height / 2 - 34 * scale, 104 * scale, 30 * scale, this.rarityColor(hero.rarity), scale);
    this.addBadge(parent, 'LobbyHeroDetailStars', starText(hero.star), 62 * scale, height / 2 - 34 * scale, 172 * scale, 30 * scale, rgba(220, 168, 69), scale);
    const formText = hero.protagonist ? safeText(hero.formLabel || '攻击形态') : '已拥有英雄';
    this.addBadge(parent, 'LobbyHeroDetailForm', formText, width / 2 - 118 * scale, height / 2 - 34 * scale, 188 * scale, 30 * scale, rgba(172, 54, 42), scale);
    const source = this.host.addChildLabel(parent, 'LobbyHeroDetailSource', hero.protagonist ? '主角不进入抽卡池；防御/辅助形态后续由主线道具解锁。' : `${sourceLabel(hero.sourceType)} / 只读展示`, 0, height / 2 - 72 * scale, 15 * scale, rgba(191, 171, 121), new Size(width - 44 * scale, 28 * scale));
    source.overflow = Label.Overflow.SHRINK;
  }

  private renderAttributeGrid(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const title = this.host.addChildLabel(parent, 'LobbyHeroDetailAttributeTitle', '战斗展示属性', -width / 2 + 24 * scale, height / 2 - 112 * scale, 18 * scale, rgba(247, 218, 148), new Size(width - 48 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    const grid = this.host.addChildPlainNode(parent, 'LobbyHeroDetailAttributeGrid', 0, height / 2 - 174 * scale, width - 48 * scale, 86 * scale);
    const attrs = resolveAttributes(hero);
    const cellWidth = (width - 64 * scale) / 2;
    attrs.slice(0, 6).forEach((attr, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const cell = this.host.addChildPlainNode(grid, `LobbyHeroDetailAttribute_${index}`, -cellWidth / 2 - 6 * scale + column * (cellWidth + 12 * scale), 28 * scale - row * 28 * scale, cellWidth, 24 * scale);
      const graphics = cell.addComponent(Graphics);
      graphics.fillColor = rgba(12, 10, 10, 172);
      graphics.rect(-cellWidth / 2, -12 * scale, cellWidth, 24 * scale);
      graphics.fill();
      graphics.strokeColor = rgba(124, 93, 50, 118);
      graphics.stroke();
      const label = this.host.addChildLabel(cell, 'LobbyHeroDetailAttributeLabel', `${attr.label}  ${attr.value}`, -cellWidth / 2 + 10 * scale, 0, 14 * scale, rgba(214, 193, 146), new Size(cellWidth - 18 * scale, 22 * scale), HorizontalTextAlignment.LEFT);
      label.overflow = Label.Overflow.SHRINK;
    });
  }

  private renderSkillList(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const titleY = height / 2 - 242 * scale;
    const title = this.host.addChildLabel(parent, 'LobbyHeroDetailSkillTitle', '技能预览', -width / 2 + 24 * scale, titleY, 18 * scale, rgba(247, 218, 148), new Size(width - 48 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    const list = this.host.addChildPlainNode(parent, 'LobbyHeroDetailSkillList', 0, titleY - 126 * scale, width - 48 * scale, Math.max(124 * scale, height - 330 * scale));
    const skills = resolveSkills(hero);
    const rowHeight = Math.min(68 * scale, Math.max(48 * scale, (height - 336 * scale) / 4));
    skills.slice(0, 4).forEach((skill, index) => {
      const row = this.host.addChildPlainNode(list, `LobbyHeroDetailSkillRow_${index}`, 0, list.getComponent(UITransform)!.contentSize.height / 2 - rowHeight / 2 - index * (rowHeight + 8 * scale), width - 60 * scale, rowHeight);
      const graphics = row.addComponent(Graphics);
      graphics.fillColor = index === 0 ? rgba(88, 18, 18, 176) : rgba(10, 9, 10, 170);
      graphics.rect(-(width - 60 * scale) / 2, -rowHeight / 2, width - 60 * scale, rowHeight);
      graphics.fill();
      graphics.strokeColor = rgba(146, 108, 54, 138);
      graphics.stroke();
      this.drawSkillIcon(row, -width / 2 + 54 * scale, 0, Math.min(42 * scale, rowHeight - 12 * scale), scale, index);
      const name = this.host.addChildLabel(row, 'LobbyHeroDetailSkillName', `${skill.name}  /  ${skill.tag}`, -width / 2 + 86 * scale, rowHeight / 2 - 18 * scale, 15 * scale, rgba(242, 214, 146), new Size(width - 148 * scale, 22 * scale), HorizontalTextAlignment.LEFT);
      name.overflow = Label.Overflow.SHRINK;
      const desc = this.host.addChildLabel(row, 'LobbyHeroDetailSkillDesc', skill.description, -width / 2 + 86 * scale, -8 * scale, 13 * scale, rgba(190, 173, 133), new Size(width - 148 * scale, rowHeight - 28 * scale), HorizontalTextAlignment.LEFT);
      desc.lineHeight = 16 * scale;
      desc.overflow = Label.Overflow.SHRINK;
    });
  }

  private renderFooter(parent: Node, width: number, height: number, scale: number): void {
    const note = this.host.addChildLabel(parent, 'LobbyHeroDetailReadonlyNote', '只读展示：不提供升级、升星、觉醒、装备、抽卡、领取或资源变更入口。', 0, -height / 2 + 62 * scale, 15 * scale, rgba(170, 148, 103), new Size(width - 120 * scale, 24 * scale));
    note.overflow = Label.Overflow.SHRINK;
  }

  private addBadge(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, fill: Color, scale: number): void {
    const badge = this.host.addChildPlainNode(parent, name, x, y, width, height);
    const graphics = badge.addComponent(Graphics);
    graphics.fillColor = new Color(fill.r, fill.g, fill.b, 182);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = rgba(225, 174, 82, 178);
    graphics.stroke();
    const label = this.host.addChildLabel(badge, `${name}Label`, text, 0, 0, 14 * scale, rgba(252, 223, 148), new Size(width - 10 * scale, height));
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, false);
  }

  private drawPanelShade(parent: Node, width: number, height: number, scale: number): void {
    const shade = this.host.addChildPlainNode(parent, 'LobbyHeroDetailPanelShade', 0, 0, width, height);
    const graphics = shade.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 116);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = rgba(130, 16, 23, 42);
    graphics.circle(-width * 0.28, -height * 0.08, Math.min(width, height) * 0.38);
    graphics.fill();
    graphics.strokeColor = rgba(211, 154, 64, 90);
    graphics.lineWidth = Math.max(1, scale);
    graphics.moveTo(-width / 2 + 34 * scale, height / 2 - 110 * scale);
    graphics.lineTo(width / 2 - 34 * scale, height / 2 - 110 * scale);
    graphics.moveTo(-width / 2 + 34 * scale, -height / 2 + 82 * scale);
    graphics.lineTo(width / 2 - 34 * scale, -height / 2 + 82 * scale);
    graphics.stroke();
  }

  private drawFallbackPortrait(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const graphics = parent.addComponent(Graphics);
    graphics.fillColor = hero.protagonist ? rgba(48, 12, 14, 210) : rgba(20, 20, 24, 210);
    graphics.circle(0, height * 0.18, width * 0.16);
    graphics.fill();
    graphics.fillColor = hero.protagonist ? rgba(169, 42, 39, 214) : rgba(110, 102, 85, 200);
    graphics.moveTo(0, height * 0.1);
    graphics.lineTo(width * 0.24, -height * 0.28);
    graphics.lineTo(width * 0.08, -height * 0.42);
    graphics.lineTo(-width * 0.08, -height * 0.42);
    graphics.lineTo(-width * 0.24, -height * 0.28);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = rgba(230, 178, 82, 160);
    graphics.lineWidth = Math.max(1, 1.2 * scale);
    graphics.moveTo(-width * 0.22, height * 0.02);
    graphics.lineTo(width * 0.24, -height * 0.24);
    graphics.stroke();
  }

  private drawSkillIcon(parent: Node, x: number, y: number, size: number, scale: number, index: number): void {
    const icon = this.host.addChildPlainNode(parent, `LobbyHeroDetailSkillIcon_${index}`, x, y, size, size);
    const graphics = icon.addComponent(Graphics);
    graphics.fillColor = index === 0 ? rgba(112, 28, 24, 224) : rgba(18, 17, 18, 226);
    graphics.circle(0, 0, size * 0.45);
    graphics.fill();
    graphics.strokeColor = rgba(222, 168, 72, 188);
    graphics.lineWidth = Math.max(1, 1.1 * scale);
    graphics.circle(0, 0, size * 0.43);
    graphics.stroke();
    graphics.strokeColor = rgba(246, 214, 136, 160);
    graphics.moveTo(-size * 0.18, 0);
    graphics.lineTo(size * 0.18, 0);
    graphics.moveTo(0, -size * 0.18);
    graphics.lineTo(0, size * 0.18);
    graphics.stroke();
  }

  private rarityColor(rarity: string): Color {
    const key = rarity.toUpperCase();
    if (key === 'SSR') {
      return rgba(197, 74, 38);
    }
    if (key === 'SR') {
      return rgba(104, 78, 176);
    }
    if (key === 'R') {
      return rgba(61, 100, 160);
    }
    return rgba(94, 82, 60);
  }

  private applyOutline(label: Label, scale: number, strong: boolean): void {
    label.enableOutline = true;
    label.outlineColor = rgba(0, 0, 0, strong ? 230 : 188);
    label.outlineWidth = Math.max(1, (strong ? 1.4 : 1) * scale);
  }
}

function resolveAttributes(hero: LobbyHeroItemVO): HeroDetailAttribute[] {
  const star = Math.max(1, hero.star);
  const level = Math.max(1, hero.level);
  const power = Math.max(0, hero.power);
  return [
    { label: '生命', value: formatInteger(Math.round(power * 1.55 + level * 120 + star * 420)) },
    { label: '攻击', value: formatInteger(Math.round(power * 0.32 + level * 42 + star * 135)) },
    { label: '防御', value: formatInteger(Math.round(power * 0.22 + level * 36 + star * 108)) },
    { label: '速度', value: `${112 + star * 3}` },
    { label: '暴击', value: `${14 + star * 2}%` },
    { label: '韧性', value: `${10 + star * 2}%` },
  ];
}

function resolveSkills(hero: LobbyHeroItemVO): HeroDetailSkill[] {
  if (hero.protagonist) {
    return [
      { name: '圣契斩击', tag: '普攻', description: '攻击形态默认开放，对单体目标造成暗金斩击伤害。' },
      { name: '深渊裂刃', tag: '主动', description: '凝聚裂隙能量打击前排，当前为战斗表现预览。' },
      { name: '誓约战意', tag: '被动', description: '主角在队首时提升本次预演的压制感与生存展示。' },
      { name: '守御/祷言形态', tag: '锁定', description: '防御形态与辅助形态后续通过主线剧情道具解锁。' },
    ];
  }
  return [
    { name: `${safeText(hero.heroName)}·普攻`, tag: '普攻', description: '已拥有英雄的基础攻击展示，具体数值以后端技能配置为准。' },
    { name: '战技预览', tag: '主动', description: '技能配置尚未开放写操作，当前只展示战斗定位。' },
    { name: '队伍协同', tag: '被动', description: '加入本次阵容时参与本地战斗演出，不保存长期编队。' },
    { name: '终结技', tag: '预留', description: '终结技等级与真实效果以后端只读配置为准。' },
  ];
}

function starText(star: number): string {
  const count = Math.max(1, Math.min(6, Math.trunc(star || 1)));
  return `${'★'.repeat(count)}${'☆'.repeat(Math.max(0, 6 - count))}`;
}

function sourceLabel(sourceType: string): string {
  if (sourceType === 'PROTAGONIST') {
    return '主角';
  }
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

function formatInteger(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return safe.toLocaleString('en-US');
}
