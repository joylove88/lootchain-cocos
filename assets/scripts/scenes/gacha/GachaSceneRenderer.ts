import {
  BlockInputEvents,
  Button,
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
import { safeText } from '../UiTextFormatter';
import { clamp, rgba, type UiLayout } from '../lobby/LobbyHudTypes';
import {
  GACHA_BACKGROUND_ASSET,
  GACHA_PREVIEW_CARDS,
  GACHA_PREVIEW_POOLS,
  GACHA_RIGHT_ACTIONS,
  gachaRarityTone,
  type GachaPreviewCard,
  type GachaPreviewPool,
  type GachaRarity,
} from './GachaSceneConfig';

export interface GachaSceneHost {
  node: Node;
  closeGachaScene(): void;
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
}

/** 抽奖全屏预览页。
 * 当前阶段只做视觉、布局和只读规则入口，不触发真实扣费、发奖、保底或兑换写入。 */
export class GachaSceneRenderer {
  constructor(private readonly host: GachaSceneHost) {}

  render(layout: UiLayout): void {
    const scale = this.resolveScale(layout);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const root = this.createUiNode('GachaSceneRoot');
    root.setPosition(new Vec3(centerX, centerY, 0));
    root.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    // 全屏页面必须吞掉底层大厅输入，避免召唤按钮或功能图标穿透到大厅热点。
    root.addComponent(BlockInputEvents);

    this.renderBackground(root, layout);
    this.renderAbyssAtmosphere(root, layout, scale);
    this.renderTopBar(root, layout, scale);
    if (layout.safeWidth < 900 || layout.safeHeight < 520) {
      this.renderCompactContent(root, layout, scale);
      return;
    }
    this.renderPoolRail(root, layout, scale);
    this.renderCenterStage(root, layout, scale, GACHA_PREVIEW_CARDS);
    this.renderRightPanel(root, layout, scale);
    this.renderBottomSummonBar(root, layout, scale);
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private resolveScale(layout: UiLayout): number {
    return clamp(Math.min(layout.uiScale, layout.safeWidth / 1280, layout.safeHeight / 720), 0.56, 1);
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

  private renderAbyssAtmosphere(parent: Node, layout: UiLayout, scale: number): void {
    const layer = this.host.addChildPlainNode(parent, 'GachaAbyssAtmosphere', 0, 0, layout.width, layout.height);
    const graphics = layer.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 84);
    graphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    graphics.fill();
    graphics.fillColor = rgba(103, 0, 16, 34);
    graphics.circle(0, layout.stageHeight * 0.16, Math.min(layout.stageWidth, layout.stageHeight) * 0.38);
    graphics.fill();
    graphics.strokeColor = rgba(225, 48, 58, 76);
    graphics.lineWidth = Math.max(1, 2 * scale);
    for (let index = 0; index < 3; index += 1) {
      const radius = (128 + index * 52) * scale;
      graphics.circle(0, -layout.stageHeight * 0.17, radius);
    }
    graphics.stroke();
    const opacity = layer.addComponent(UIOpacity);
    opacity.opacity = 190;
    // 只用低频透明度呼吸，保证预览页有生命感但不会影响低端设备。
    tween(opacity).repeatForever(tween().to(1.8, { opacity: 225 }).to(1.8, { opacity: 168 })).start();
  }

  private renderTopBar(parent: Node, layout: UiLayout, scale: number): void {
    const y = layout.stageTop - 42 * scale;
    const titleX = layout.stageLeft + 112 * scale;
    const back = this.host.addChildPlainNode(parent, 'GachaBackButton', layout.stageLeft + 46 * scale, y, 60 * scale, 44 * scale);
    back.addComponent(Button);
    back.on(Button.EventType.CLICK, () => this.host.closeGachaScene(), this);
    this.host.applyImageButtonFeedback(back, 1.04, 0.96);
    const backGraphics = back.addComponent(Graphics);
    backGraphics.strokeColor = rgba(218, 170, 84, 220);
    backGraphics.lineWidth = Math.max(2, 2 * scale);
    backGraphics.moveTo(14 * scale, 15 * scale);
    backGraphics.lineTo(-13 * scale, 0);
    backGraphics.lineTo(14 * scale, -15 * scale);
    backGraphics.stroke();

    const title = this.host.addChildLabel(parent, 'GachaTitle', '召唤', titleX, y + 1 * scale, 31 * scale, rgba(250, 221, 156), new Size(150 * scale, 46 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    const resources = [
      { label: '契约晶簇', value: '0', color: rgba(126, 201, 255) },
      { label: '源晶', value: '2,450', color: rgba(171, 129, 255) },
      { label: '血晶', value: '8,888', color: rgba(245, 93, 88) },
      { label: '金币', value: '3,456K', color: rgba(232, 189, 103) },
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

  private renderPoolRail(parent: Node, layout: UiLayout, scale: number): void {
    const railWidth = clamp(layout.safeWidth * 0.185, 238 * scale, 320 * scale);
    const itemHeight = clamp(layout.safeHeight * 0.115, 84 * scale, 112 * scale);
    const gap = 10 * scale;
    const totalHeight = GACHA_PREVIEW_POOLS.length * itemHeight + (GACHA_PREVIEW_POOLS.length - 1) * gap;
    const x = layout.stageLeft + railWidth / 2 + 22 * scale;
    const y = (layout.stageTop + layout.stageBottom) / 2 + 4 * scale;
    const rail = this.host.addChildPlainNode(parent, 'GachaPoolRail', x, y, railWidth, totalHeight);
    let cursorY = totalHeight / 2 - itemHeight / 2;
    for (const pool of GACHA_PREVIEW_POOLS) {
      this.renderPoolItem(rail, pool, 0, cursorY, railWidth, itemHeight, scale);
      cursorY -= itemHeight + gap;
    }
  }

  private renderPoolItem(parent: Node, pool: GachaPreviewPool, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, `GachaPool_${pool.id}`, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.host.setStatus(`${pool.title} 当前为只读预览，真实卡池切换将在后端配置开放后接入。`), this);
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
    if (pool.locked) {
      graphics.fillColor = rgba(0, 0, 0, 116);
      graphics.rect(-width / 2, -height / 2, width, height);
      graphics.fill();
    }
    const title = this.host.addChildLabel(node, 'GachaPoolTitle', pool.title, -width / 2 + 18 * scale, 13 * scale, 21 * scale, rgba(248, 218, 150), new Size(width - 46 * scale, 28 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const subline = this.host.addChildLabel(node, 'GachaPoolSubline', pool.locked ? '锁定' : pool.subline, -width / 2 + 18 * scale, -19 * scale, 16 * scale, pool.locked ? rgba(151, 137, 110) : rgba(214, 170, 86), new Size(width - 48 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    subline.overflow = Label.Overflow.SHRINK;
  }

  private renderCenterStage(parent: Node, layout: UiLayout, scale: number, cards: GachaPreviewCard[]): void {
    const stageWidth = layout.stageWidth;
    const centerY = (layout.stageTop + layout.stageBottom) / 2 - 8 * scale;
    const baseCardWidth = clamp(stageWidth * 0.12, 126 * scale, 238 * scale);
    const baseCardHeight = baseCardWidth * 1.58;
    const spacing = clamp(stageWidth * 0.105, 110 * scale, 205 * scale);
    const offsets = cards.length === 3 ? [-1, 0, 1] : [-2, -1, 0, 1, 2];
    const activeIndex = Math.floor(cards.length / 2);
    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      const offset = offsets[index] ?? 0;
      const width = baseCardWidth * card.scale;
      const height = baseCardHeight * card.scale;
      const x = offset * spacing;
      const y = centerY + (card.scale < 1 ? -22 * scale : 0);
      this.renderPreviewCard(parent, card, x, y, width, height, scale, index === activeIndex);
    }
    this.renderPityLine(parent, layout, scale);
  }

  private renderPreviewCard(parent: Node, card: GachaPreviewCard, x: number, y: number, width: number, height: number, scale: number, active: boolean): void {
    const node = this.host.addChildPlainNode(parent, `GachaPreviewCard_${card.rarity}_${safeText(card.name)}`, x, y, width, height);
    const tone = gachaRarityTone(card.rarity);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = tone.fill;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = tone.stroke;
    graphics.lineWidth = Math.max(1.4, active ? 3 * scale : 1.6 * scale);
    graphics.stroke();
    graphics.fillColor = tone.glow;
    graphics.rect(-width / 2, height * 0.12, width, height * 0.38);
    graphics.fill();
    this.drawCardOrnaments(graphics, width, height, scale, active);
    this.drawPortraitSilhouette(graphics, width, height, scale, card.rarity);

    const rarity = this.host.addChildLabel(node, 'GachaCardRarity', card.rarity, -width / 2 + 18 * scale, height / 2 - 34 * scale, active ? 34 * scale : 26 * scale, tone.text, new Size(width - 36 * scale, 44 * scale), HorizontalTextAlignment.LEFT);
    rarity.overflow = Label.Overflow.SHRINK;
    this.applyOutline(rarity, scale, true);
    const name = this.host.addChildLabel(node, 'GachaCardName', card.name, 0, -height / 2 + 72 * scale, active ? 27 * scale : 20 * scale, rgba(249, 223, 161), new Size(width - 28 * scale, 35 * scale));
    name.overflow = Label.Overflow.SHRINK;
    this.applyOutline(name, scale, true);
    const title = this.host.addChildLabel(node, 'GachaCardTitle', card.title, 0, -height / 2 + 38 * scale, active ? 18 * scale : 14 * scale, rgba(204, 171, 111), new Size(width - 32 * scale, 25 * scale));
    title.overflow = Label.Overflow.SHRINK;
    const stars = this.host.addChildLabel(node, 'GachaCardStars', '★'.repeat(card.stars), 0, -height / 2 + 15 * scale, active ? 21 * scale : 16 * scale, tone.text, new Size(width - 32 * scale, 24 * scale));
    stars.overflow = Label.Overflow.SHRINK;
    if (active) {
      // 中央主卡做轻微呼吸，模拟召唤卡待机，不涉及任何结果随机。
      tween(node).repeatForever(tween().to(1.25, { scale: new Vec3(1.018, 1.018, 1) }).to(1.25, { scale: Vec3.ONE })).start();
    }
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

  private renderPityLine(parent: Node, layout: UiLayout, scale: number): void {
    const y = layout.stageBottom + 134 * scale;
    const text = this.host.addChildLabel(parent, 'GachaPityLine', '再召唤 30 次必得 传说英雄', 0, y, 26 * scale, rgba(248, 216, 143), new Size(layout.stageWidth * 0.58, 38 * scale));
    text.overflow = Label.Overflow.SHRINK;
    this.applyOutline(text, scale, true);
    const note = this.host.addChildLabel(parent, 'GachaPhaseGuardNote', '当前为视觉预览：按钮不扣资源，不发放英雄，不更新保底。', 0, y - 34 * scale, 15 * scale, rgba(166, 145, 105), new Size(layout.stageWidth * 0.66, 24 * scale));
    note.overflow = Label.Overflow.SHRINK;
  }

  private renderRightPanel(parent: Node, layout: UiLayout, scale: number): void {
    const actionSize = 62 * scale;
    const gap = 22 * scale;
    const totalHeight = GACHA_RIGHT_ACTIONS.length * actionSize + (GACHA_RIGHT_ACTIONS.length - 1) * gap;
    const x = layout.stageRight - 86 * scale;
    let cursorY = (layout.stageTop + layout.stageBottom) / 2 + totalHeight / 2 - actionSize / 2;
    for (const action of GACHA_RIGHT_ACTIONS) {
      this.renderActionButton(parent, action.key, action.label, action.note, x, cursorY, actionSize, scale);
      cursorY -= actionSize + gap;
    }
    this.renderUpPreview(parent, layout, scale);
  }

  private renderActionButton(parent: Node, key: string, label: string, note: string, x: number, y: number, size: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, `GachaAction_${key}`, x, y, size, size + 28 * scale);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.host.setStatus(note), this);
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

  private drawActionGlyph(graphics: Graphics, key: string, size: number, scale: number): void {
    graphics.strokeColor = rgba(244, 203, 113, 230);
    graphics.lineWidth = Math.max(2, 2 * scale);
    if (key === 'rate') {
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

  private renderBottomSummonBar(parent: Node, layout: UiLayout, scale: number): void {
    const y = layout.stageBottom + 62 * scale;
    const onceWidth = 300 * scale;
    const tenWidth = 360 * scale;
    this.renderSummonButton(parent, 'GachaSummonOnceButton', '召唤1次', '消耗预览 1', -onceWidth * 0.56, y, onceWidth, 58 * scale, scale, false);
    this.renderSummonButton(parent, 'GachaSummonTenButton', '召唤10次', '消耗预览 10', tenWidth * 0.46, y, tenWidth, 62 * scale, scale, true);
  }

  private renderSummonButton(parent: Node, name: string, title: string, cost: string, x: number, y: number, width: number, height: number, scale: number, strong: boolean): void {
    const node = this.host.addChildPlainNode(parent, name, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.host.setStatus('抽奖写入尚未开放：当前不会扣资源、不会发奖、不会更新保底。'), this);
    this.host.applyImageButtonFeedback(node, 1.028, 0.965);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = strong ? rgba(82, 15, 17, 232) : rgba(9, 9, 12, 226);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = strong ? rgba(229, 67, 47, 230) : rgba(205, 154, 72, 214);
    graphics.lineWidth = Math.max(1.5, 1.8 * scale);
    graphics.stroke();
    graphics.fillColor = strong ? rgba(231, 37, 38, 36) : rgba(231, 182, 92, 24);
    graphics.rect(-width / 2, 0, width, height / 2);
    graphics.fill();
    const label = this.host.addChildLabel(node, `${name}Label`, title, 28 * scale, 2 * scale, 25 * scale, rgba(248, 221, 160), new Size(width * 0.62, height), HorizontalTextAlignment.CENTER);
    label.overflow = Label.Overflow.SHRINK;
    this.applyOutline(label, scale, true);
    const costLabel = this.host.addChildLabel(node, `${name}Cost`, cost, -width / 2 + 80 * scale, 0, 16 * scale, rgba(181, 209, 255), new Size(118 * scale, height), HorizontalTextAlignment.LEFT);
    costLabel.overflow = Label.Overflow.SHRINK;
  }

  private renderCompactContent(parent: Node, layout: UiLayout, scale: number): void {
    const tabsY = layout.stageTop - 92 * scale;
    const tabWidth = Math.max(92 * scale, Math.min(150 * scale, layout.stageWidth / 4.8));
    const tabGap = 7 * scale;
    const visiblePools = GACHA_PREVIEW_POOLS.slice(0, 4);
    const startX = -((visiblePools.length - 1) * (tabWidth + tabGap)) / 2;
    visiblePools.forEach((pool, index) => {
      this.renderCompactPoolTab(parent, pool, startX + index * (tabWidth + tabGap), tabsY, tabWidth, 42 * scale, scale);
    });
    const visibleCards = [GACHA_PREVIEW_CARDS[1], GACHA_PREVIEW_CARDS[2], GACHA_PREVIEW_CARDS[3]];
    this.renderCenterStage(parent, layout, scale * 0.9, visibleCards);
    this.renderBottomSummonBar(parent, layout, scale);
  }

  private renderCompactPoolTab(parent: Node, pool: GachaPreviewPool, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.host.addChildPlainNode(parent, `GachaCompactPool_${pool.id}`, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.host.setStatus(`${pool.title} 当前只做卡池标签预览。`), this);
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
