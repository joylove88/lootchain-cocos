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
  GACHA_MOCK_RESULT_ONCE,
  GACHA_MOCK_RESULT_TEN,
  GACHA_PREVIEW_POOLS,
  GACHA_RIGHT_ACTIONS,
  gachaRarityTone,
  type GachaMockResultItem,
  type GachaPreviewPool,
  type GachaRarity,
} from './GachaSceneConfig';

export type GachaPreviewResultMode = 'once' | 'ten';

export interface GachaSceneHost {
  node: Node;
  closeGachaScene(): void;
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
    this.renderTopBar(root, layout, scale);
    if (layout.safeWidth < 900 || layout.safeHeight < 520) {
      this.renderCompactContent(root, layout, scale);
      return;
    }
    this.renderPoolRail(root, layout, scale);
    this.renderCenterStage(root, layout, scale);
    this.renderRightPanel(root, layout, scale);
    this.renderBottomSummonBar(root, layout, scale);
  }

  renderResultScene(layout: UiLayout, mode: GachaPreviewResultMode): void {
    const scale = this.resolveScale(layout);
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const root = this.createUiNode('GachaResultSceneRoot');
    root.setPosition(new Vec3(centerX, centerY, 0));
    root.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    root.addComponent(BlockInputEvents);

    this.renderBackground(root, layout);
    this.renderTopBar(root, layout, scale);
    this.renderMockResultSceneContent(root, layout, scale, mode);
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

  private renderTopBar(parent: Node, layout: UiLayout, scale: number): void {
    const y = layout.stageTop - 42 * scale;
    const titleX = layout.stageLeft + 112 * scale;
    renderSceneBackButton(this.host, parent, layout, 'GachaBackButton', () => this.host.closeGachaScene(), scale);

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

  private renderCenterStage(parent: Node, layout: UiLayout, scale: number): void {
    this.renderAbyssSpineStage(parent, layout, scale);
    this.renderPityLine(parent, layout, scale);
  }

  private renderAbyssSpineStage(parent: Node, layout: UiLayout, scale: number): void {
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
    this.ensureAbyssSpineData((data) => {
      if (!skeleton.node.isValid) {
        return;
      }
      if (this.applyAbyssSpineData(skeleton, data, 'huangfengjiaozong', GACHA_ABYSS_SPINE_SKIN, GACHA_ABYSS_SPINE_INTRO_ANIMATION, GACHA_ABYSS_SPINE_IDLE_ANIMATION)) {
        if (fallback.isValid) {
          fallback.destroy();
        }
        return;
      }
      this.ensureAbyssFallbackSpineData((fallbackData) => {
        if (!skeleton.node.isValid) {
          return;
        }
        if (this.applyAbyssSpineData(skeleton, fallbackData, 'Lord of the Dark Abyss', GACHA_ABYSS_FALLBACK_SPINE_SKIN, GACHA_ABYSS_FALLBACK_SPINE_INTRO_ANIMATION, GACHA_ABYSS_FALLBACK_SPINE_IDLE_ANIMATION)) {
          if (fallback.isValid) {
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
    callbacks.forEach((callback) => callback(data));
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
    callbacks.forEach((callback) => callback(data));
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
    this.renderSummonButton(parent, layout, 'once', 'GachaSummonOnceButton', '召唤1次', '消耗预览 1', -onceWidth * 0.56, y, onceWidth, 58 * scale, scale, false);
    this.renderSummonButton(parent, layout, 'ten', 'GachaSummonTenButton', '召唤10次', '消耗预览 10', tenWidth * 0.46, y, tenWidth, 62 * scale, scale, true);
  }

  private renderSummonButton(parent: Node, layout: UiLayout, mode: GachaPreviewResultMode, name: string, title: string, cost: string, x: number, y: number, width: number, height: number, scale: number, strong: boolean): void {
    const node = this.host.addChildPlainNode(parent, name, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => {
      this.host.setStatus('本地结果预览：不扣资源、不发英雄、不写入抽卡记录或保底。');
      this.host.openGachaMockResultScene(mode);
    }, this);
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

  private renderMockResultSceneContent(parent: Node, layout: UiLayout, scale: number, mode: GachaPreviewResultMode): void {
    const results = mode === 'once' ? GACHA_MOCK_RESULT_ONCE : GACHA_MOCK_RESULT_TEN;
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

    const title = this.host.addChildLabel(panel, 'GachaResultSceneTitle', mode === 'once' ? '召唤结果预览' : '十连结果预览', 0, panelHeight / 2 - 48 * scale, 31 * scale, rgba(252, 222, 153), new Size(panelWidth - 118 * scale, 46 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);

    const subtitle = this.host.addChildLabel(panel, 'GachaResultSceneNoWriteNote', '本结果为本地 mock：未扣资源、未写入抽卡记录、未发放英雄、未更新保底。', 0, -panelHeight / 2 + 82 * scale, 15 * scale, rgba(186, 162, 116), new Size(panelWidth - 52 * scale, 30 * scale));
    subtitle.overflow = Label.Overflow.SHRINK;

    this.renderMockResultCards(panel, results, mode, panelWidth, panelHeight, scale);
    this.renderMockResultCloseButton(panel, panelWidth, panelHeight, scale);
    this.renderMockResultConfirmButton(panel, panelWidth, panelHeight, scale);
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
      this.host.setStatus('已关闭本地结果预览，真实抽卡写入仍未开放。');
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
      this.host.setStatus('Gacha 仍处于视觉预览阶段：真实单抽、十连、兑换、补发全部关闭。');
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

  private renderCompactContent(parent: Node, layout: UiLayout, scale: number): void {
    const tabsY = layout.stageTop - 92 * scale;
    const tabWidth = Math.max(92 * scale, Math.min(150 * scale, layout.stageWidth / 4.8));
    const tabGap = 7 * scale;
    const visiblePools = GACHA_PREVIEW_POOLS.slice(0, 4);
    const startX = -((visiblePools.length - 1) * (tabWidth + tabGap)) / 2;
    visiblePools.forEach((pool, index) => {
      this.renderCompactPoolTab(parent, pool, startX + index * (tabWidth + tabGap), tabsY, tabWidth, 42 * scale, scale);
    });
    this.renderCenterStage(parent, layout, scale * 0.9);
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
