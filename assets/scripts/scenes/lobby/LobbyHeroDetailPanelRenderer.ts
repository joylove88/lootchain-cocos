import {
  assetManager,
  AudioClip,
  AudioSource,
  BlockInputEvents,
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
  tween,
} from 'cc';
import type { LobbyHeroItemVO } from '../../types/LobbyHeroTypes';
import { safeText } from '../UiTextFormatter';
import { renderSceneBackButton } from '../UiSceneBackButton';
import { clamp, rgba, type UiLayout } from './LobbyHudTypes';

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
  private readonly heroSpineData = new Map<string, sp.SkeletonData>();
  private readonly heroSpineLoadCallbacks = new Map<string, Array<(data: sp.SkeletonData | null) => void>>();
  private readonly heroSpineAudioClips = new Map<string, AudioClip>();
  private readonly heroSpineAudioLoadCallbacks = new Map<string, Array<(clip: AudioClip | null) => void>>();
  private readonly missingHeroSpineAudioLogs = new Set<string>();

  constructor(private readonly host: LobbyHeroDetailPanelHost) {}

  render(layout: UiLayout): void {
    const hero = this.host.currentLobbyHeroDetailHero();
    if (!hero) {
      return;
    }
    const scale = Math.max(0.62, Math.min(1, layout.uiScale));
    const compact = layout.safeWidth < 1154 * scale || layout.safeHeight < 520 * scale;
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
      rgba(0, 0, 0, 0),
      18 * scale,
    );
    this.host.addSprite('LobbyHeroDetailBackdropSprite', LOBBY_HERO_DETAIL_BACKDROP_ASSET, 0, 0, panelWidth, panelHeight, panel);
    this.drawPanelShade(panel, panelWidth, panelHeight, scale);
    if (compact) {
      this.renderCompact(panel, hero, panelWidth, panelHeight, scale);
    } else {
      this.renderDesktop(panel, hero, panelWidth, panelHeight, scale);
    }
    this.renderHeader(panel, hero, panelWidth, panelHeight, scale);
    this.renderFooter(panel, panelWidth, panelHeight, scale);
    renderSceneBackButton(this.host, panelGroup, layout, 'LobbyHeroDetailBackButton', () => this.host.backToLobbyHeroRosterPanel(), scale, '英雄');
  }

  private renderHeader(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const plateWidth = Math.min(520 * scale, Math.max(340 * scale, width * 0.36));
    const plateHeight = 74 * scale;
    const plateY = -height / 2 + 118 * scale;
    const plate = this.host.addChildPlainNode(parent, 'LobbyHeroDetailIdentityPlate', 0, plateY, plateWidth, plateHeight);
    const graphics = plate.addComponent(Graphics);
    graphics.fillColor = rgba(5, 5, 8, 142);
    graphics.rect(-plateWidth / 2, -plateHeight / 2, plateWidth, plateHeight);
    graphics.fill();
    const title = this.host.addChildLabel(plate, 'LobbyHeroDetailName', safeText(hero.heroName), 0, 13 * scale, 28 * scale, rgba(252, 225, 156), new Size(plateWidth - 30 * scale, 36 * scale));
    title.overflow = Label.Overflow.SHRINK;
    this.applyOutline(title, scale, true);
    const meta = this.host.addChildLabel(plate, 'LobbyHeroDetailMeta', `${safeText(hero.rarity || 'R')}  /  Lv.${hero.level}  /  战力 ${formatInteger(hero.power)}`, 0, -19 * scale, 16 * scale, rgba(206, 169, 87), new Size(plateWidth - 34 * scale, 24 * scale));
    meta.overflow = Label.Overflow.SHRINK;
  }

  private renderDesktop(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const artWidth = Math.min(620 * scale, Math.max(430 * scale, width * 0.44));
    const artHeight = height - 138 * scale;
    const artX = 0;
    const artY = -28 * scale;
    this.renderArtStage(parent, hero, artX, artY, artWidth, artHeight, scale);

    const infoX = width / 2 - 342 * scale;
    const infoY = 14 * scale;
    const infoWidth = 612 * scale;
    const infoHeight = height - 176 * scale;
    this.renderInfoPanel(parent, hero, infoX, infoY, infoWidth, infoHeight, scale);
  }

  private renderCompact(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const margin = 30 * scale;
    const gap = 14 * scale;
    const reservedInfoWidth = Math.min(420 * scale, Math.max(176 * scale, width * 0.56));
    const artWidth = clamp(width - margin * 2 - gap - reservedInfoWidth, 96 * scale, 288 * scale);
    const infoWidth = Math.max(168 * scale, width - margin * 2 - gap - artWidth);
    const artHeight = Math.max(170 * scale, height - 170 * scale);
    const infoHeight = Math.max(236 * scale, height - 156 * scale);
    const artX = -width / 2 + margin + artWidth / 2;
    const infoX = artX + artWidth / 2 + gap + infoWidth / 2;
    const sharedY = -18 * scale;
    this.renderArtStage(parent, hero, artX, sharedY, artWidth, artHeight, scale);
    this.renderInfoPanel(parent, hero, infoX, sharedY, infoWidth, infoHeight, scale);
  }

  private renderArtStage(parent: Node, hero: LobbyHeroItemVO, x: number, y: number, width: number, height: number, scale: number): void {
    const stage = this.host.addChildPlainNode(parent, 'LobbyHeroDetailArtStage', x, y, width, height);
    const graphics = stage.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 0);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    this.drawArtStageDepth(stage, width, height, scale);

    const fallbackPortrait = this.renderStaticHeroPortrait(stage, hero, width, height, scale);
    this.renderHeroSpinePreview(stage, hero, fallbackPortrait, width, height, scale);
  }

  private renderStaticHeroPortrait(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): Node {
    const portraitY = hero.protagonist ? this.resolveHeroDetailGroundY(height) + height * 0.45 : this.resolveHeroDetailGroundY(height) + height * 0.3;
    const portrait = this.host.addChildPlainNode(parent, 'LobbyHeroDetailDynamicPortrait', 0, portraitY, width * 0.86, height * 0.92);
    const loaded = hero.protagonist
      ? this.host.addSprite('LobbyHeroDetailDynamicPortraitSprite', LOBBY_HERO_DETAIL_PROTAGONIST_ASSET, 0, 0, width * 0.8, height * 0.9, portrait)
      : null;
    if (!loaded) {
      this.drawFallbackPortrait(portrait, hero, width * 0.56, height * 0.72, scale);
    }
    return portrait;
  }

  private renderHeroSpinePreview(parent: Node, hero: LobbyHeroItemVO, fallbackPortrait: Node, width: number, height: number, scale: number): void {
    const resourcePath = this.resolveHeroSpineResource(hero);
    if (!resourcePath) {
      if (!hero.protagonist) {
        console.warn(`[HeroDetail] hero spine asset missing: hero=${safeText(hero.heroCode)}, portrait=${safeText(hero.portraitAsset || '<empty>')}, spine=${safeText(hero.spineAsset || '<empty>')}`);
      }
      return;
    }
    const spineUuid = this.resolveHeroSpineUuid(hero);
    console.info(`[HeroDetail] hero spine load start: hero=${safeText(hero.heroCode)}, resource=${resourcePath}, uuid=${safeText(spineUuid || '<empty>')}`);
    const spineNode = this.host.addChildPlainNode(parent, 'LobbyHeroDetailSpineNode', 0, this.resolveHeroDetailGroundY(height), width, height);
    const skeleton = spineNode.addComponent(sp.Skeleton);
    const audioSource = spineNode.addComponent(AudioSource);
    skeleton.premultipliedAlpha = false;
    skeleton.timeScale = 0.86;
    this.loadHeroSpineData(resourcePath, spineUuid, (data) => {
      if (!parent.isValid || !spineNode.isValid) {
        return;
      }
      if (!data || !this.applyHeroSpineData(skeleton, data, hero, width, height, scale, resourcePath, audioSource)) {
        spineNode.destroy();
        return;
      }
      if (fallbackPortrait.isValid) {
        fallbackPortrait.destroy();
      }
    });
  }

  private resolveHeroSpineResource(hero: LobbyHeroItemVO): string | null {
    const asset = safeText(hero.spineAsset || '').trim();
    if (!asset || !/^[A-Za-z0-9_-]+$/.test(asset)) {
      return null;
    }
    return `spine/hero/${asset}/${asset}`;
  }

  private resolveHeroSpineUuid(hero: LobbyHeroItemVO): string | null {
    const uuid = safeText(hero.spineUuid || '').trim();
    return /^[0-9a-fA-F-]{36}$/.test(uuid) ? uuid : null;
  }

  private loadHeroSpineData(path: string, uuid: string | null, onLoaded: (data: sp.SkeletonData | null) => void): void {
    const cacheKey = uuid || path;
    const cached = this.heroSpineData.get(cacheKey);
    if (cached) {
      onLoaded(cached);
      return;
    }
    const pending = this.heroSpineLoadCallbacks.get(cacheKey);
    if (pending) {
      pending.push(onLoaded);
      return;
    }
    this.heroSpineLoadCallbacks.set(cacheKey, [onLoaded]);
    const finish = (data: sp.SkeletonData | null): void => {
      const callbacks = this.heroSpineLoadCallbacks.get(cacheKey) ?? [];
      this.heroSpineLoadCallbacks['delete'](cacheKey);
      if (data) {
        this.heroSpineData.set(cacheKey, data);
      }
      callbacks.forEach((callback) => callback(data));
    };
    const loadByPath = (): void => {
      resources.load(path, sp.SkeletonData, (error: Error | null, data: sp.SkeletonData | null) => {
        if (error || !data) {
          console.warn(`[HeroDetail] hero spine load failed: ${path}`, error);
          finish(null);
          return;
        }
        finish(data);
      });
    };
    if (uuid) {
      assetManager.loadAny({ uuid }, (error: Error | null, asset: unknown) => {
        if (!error && asset) {
          finish(asset as sp.SkeletonData);
          return;
        }
        console.warn(`[HeroDetail] hero spine uuid load failed, fallback to resource path: ${uuid}`, error);
        loadByPath();
      });
      return;
    }
    loadByPath();
  }

  private applyHeroSpineData(
    skeleton: sp.Skeleton,
    data: sp.SkeletonData,
    hero: LobbyHeroItemVO,
    width: number,
    height: number,
    scale: number,
    resourcePath: string,
    audioSource: AudioSource,
  ): boolean {
    try {
      skeleton.skeletonData = data;
      const runtimeData = data.getRuntimeData(true);
      if (!runtimeData) {
        console.warn(`[HeroDetail] hero spine runtime data missing: ${resourcePath}`);
        return false;
      }
      const skinName = this.resolveHeroSpineSkinName(data);
      if (skinName) {
        skeleton.setSkin(skinName);
        skeleton.setSlotsToSetupPose();
      }
      this.bindHeroSpineAudioEvents(skeleton, audioSource, resourcePath);
      const animationNames = this.resolveHeroSpineAnimationNames(data);
      const animationName = animationNames.primary;
      const spineScale = this.resolveHeroSpineScale(runtimeData.width, runtimeData.height, width, height, scale);
      skeleton.node.setScale(new Vec3(spineScale, spineScale, 1));
      skeleton.node.setPosition(new Vec3(0, this.resolveHeroDetailGroundY(height), 0));
      if (!animationName) {
        skeleton.setToSetupPose();
        this.logHeroSpineResolved(data, skinName, '<setup-pose>', hero, resourcePath);
        return true;
      }
      const secondaryAnimation = animationNames.secondary;
      if (secondaryAnimation) {
        const initialSecondaryTrack = skeleton.setAnimation(0, secondaryAnimation, false);
        if (initialSecondaryTrack) {
          skeleton.addAnimation(0, animationName, true, 0);
          this.startHeroSpineSecondaryCycle(skeleton, animationName, secondaryAnimation, resourcePath);
          this.logHeroSpineResolved(data, skinName, `${secondaryAnimation} -> ${animationName}`, hero, resourcePath);
          return true;
        }
        console.warn(`[HeroDetail] hero spine initial secondary animation failed: ${resourcePath}/${secondaryAnimation}`);
      }
      const track = skeleton.setAnimation(0, animationName, true);
      if (!track) {
        console.warn(`[HeroDetail] hero spine animation play failed: ${resourcePath}/${animationName}`);
        return false;
      }
      this.logHeroSpineResolved(data, skinName, animationName, hero, resourcePath);
      return true;
    } catch (error) {
      console.warn(`[HeroDetail] hero spine apply failed: ${resourcePath}`, error);
      return false;
    }
  }

  private resolveHeroSpineScale(rawWidth: number, rawHeight: number, stageWidth: number, stageHeight: number, scale: number): number {
    const safeWidth = Math.max(1, rawWidth || 1);
    const safeHeight = Math.max(1, rawHeight || 1);
    const targetWidth = stageWidth * 0.76;
    const targetHeight = stageHeight * 0.86;
    const fit = Math.min(targetWidth / safeWidth, targetHeight / safeHeight);
    return clamp(fit, 0.18 * scale, 1.45 * scale);
  }

  private resolveHeroSpineSkinName(data: sp.SkeletonData): string | null {
    return this.resolveSpineEnumName(data.getSkinsEnum(), 'default', []);
  }

  private resolveHeroSpineAnimationNames(data: sp.SkeletonData): { primary: string | null; secondary: string | null } {
    const enumMap = data.getAnimsEnum();
    const names = enumMap ? Object.keys(enumMap).filter((name) => name !== '<None>' && typeof enumMap[name] === 'number') : [];
    const primary = this.resolveSpineEnumName(enumMap, 'idle', ['stand', 'loop', 'animation', 'daiji', 'wait', 'run']);
    const secondaryEnum = names
      .filter((name) => name !== primary)
      .reduce<{ [key: string]: number }>((result, name, index) => {
        result[name] = index;
        return result;
      }, {});
    const secondary = this.resolveSpineEnumName(secondaryEnum, 'skill2', ['skill4', 'skill', 'attack', 'gongji', 'cast']);
    return { primary, secondary };
  }

  private startHeroSpineSecondaryCycle(skeleton: sp.Skeleton, primaryAnimation: string, secondaryAnimation: string, resourcePath: string): void {
    tween(skeleton.node)
      .repeatForever(
        tween()
          .delay(15)
          .call(() => {
            if (!skeleton.node.isValid) {
              return;
            }
            const secondaryTrack = skeleton.setAnimation(0, secondaryAnimation, false);
            if (!secondaryTrack) {
              console.warn(`[HeroDetail] hero spine secondary animation failed: ${resourcePath}/${secondaryAnimation}`);
              skeleton.setAnimation(0, primaryAnimation, true);
              return;
            }
            skeleton.addAnimation(0, primaryAnimation, true, 0);
          }),
      )
      .start();
  }

  private bindHeroSpineAudioEvents(skeleton: sp.Skeleton, audioSource: AudioSource, resourcePath: string): void {
    skeleton.setEventListener((_entry: sp.spine.TrackEntry, eventOrType: sp.spine.Event | number) => {
      if (!skeleton.node.isValid || typeof eventOrType === 'number') {
        return;
      }
      this.playHeroSpineAudioEvent(audioSource, resourcePath, eventOrType);
    });
  }

  private playHeroSpineAudioEvent(audioSource: AudioSource, resourcePath: string, event: sp.spine.Event): void {
    const audioPath = safeText(event.data?.audioPath || event.stringValue || event.data?.name || '').trim();
    if (!audioPath) {
      return;
    }
    const candidates = this.resolveHeroSpineAudioResourceCandidates(resourcePath, audioPath);
    if (candidates.length === 0) {
      return;
    }
    const volume = clamp(Number(event.volume || event.data?.volume || 1), 0, 1);
    this.loadFirstHeroSpineAudioClip(candidates, (clip, resolvedPath) => {
      if (!audioSource.node.isValid) {
        return;
      }
      if (!clip) {
        const logKey = `${resourcePath}:${audioPath}`;
        if (!this.missingHeroSpineAudioLogs.has(logKey)) {
          this.missingHeroSpineAudioLogs.add(logKey);
          console.warn(`[HeroDetail] hero spine audio missing: event=${safeText(event.data?.name || audioPath)}, audioPath=${audioPath}, candidates=${candidates.join(', ')}`);
        }
        return;
      }
      audioSource.playOneShot(clip, volume);
      console.info(`[HeroDetail] hero spine audio played: event=${safeText(event.data?.name || audioPath)}, resource=${resolvedPath}, volume=${volume.toFixed(2)}`);
    });
  }

  private resolveHeroSpineAudioResourceCandidates(resourcePath: string, audioPath: string): string[] {
    const normalizedAudioPath = audioPath.replace(/\\/g, '/').replace(/\.(mp3|wav|ogg|m4a|aac)$/i, '').replace(/^\/+/, '').trim();
    if (!normalizedAudioPath || normalizedAudioPath.includes('..')) {
      return [];
    }
    const directory = resourcePath.split('/').slice(0, -1).join('/');
    const fileName = normalizedAudioPath.split('/').pop() || normalizedAudioPath;
    const candidates = [
      `${directory}/${normalizedAudioPath}`,
      `${directory}/audio/${fileName}`,
      `audio/spine/hero/${fileName}`,
    ];
    return Array.from(new Set(candidates.filter((candidate) => /^[A-Za-z0-9_./-]+$/.test(candidate))));
  }

  private loadFirstHeroSpineAudioClip(candidates: string[], onLoaded: (clip: AudioClip | null, resolvedPath: string) => void): void {
    const [current, ...rest] = candidates;
    if (!current) {
      onLoaded(null, '');
      return;
    }
    this.loadHeroSpineAudioClip(current, (clip) => {
      if (clip) {
        onLoaded(clip, current);
        return;
      }
      this.loadFirstHeroSpineAudioClip(rest, onLoaded);
    });
  }

  private loadHeroSpineAudioClip(path: string, onLoaded: (clip: AudioClip | null) => void): void {
    const cached = this.heroSpineAudioClips.get(path);
    if (cached) {
      onLoaded(cached);
      return;
    }
    const pending = this.heroSpineAudioLoadCallbacks.get(path);
    if (pending) {
      pending.push(onLoaded);
      return;
    }
    this.heroSpineAudioLoadCallbacks.set(path, [onLoaded]);
    resources.load(path, AudioClip, (error: Error | null, clip: AudioClip | null) => {
      const callbacks = this.heroSpineAudioLoadCallbacks.get(path) ?? [];
      this.heroSpineAudioLoadCallbacks['delete'](path);
      if (error || !clip) {
        callbacks.forEach((callback) => callback(null));
        return;
      }
      this.heroSpineAudioClips.set(path, clip);
      callbacks.forEach((callback) => callback(clip));
    });
  }

  private resolveHeroSpineAnimationName(data: sp.SkeletonData): string | null {
    return this.resolveSpineEnumName(data.getAnimsEnum(), 'idle', ['stand', 'loop', 'animation', 'daiji', 'wait', 'run', '待机']);
  }

  private resolveSpineEnumName(enumMap: { [key: string]: number } | null, preferred: string, fallbackHints: string[]): string | null {
    if (!enumMap) {
      return null;
    }
    const names = Object.keys(enumMap).filter((name) => name !== '<None>' && typeof enumMap[name] === 'number');
    if (preferred && names.includes(preferred)) {
      return preferred;
    }
    const preferredLower = preferred.toLowerCase();
    if (preferredLower) {
      const loosePreferred = names.find((name) => name.toLowerCase().includes(preferredLower));
      if (loosePreferred) {
        return loosePreferred;
      }
    }
    for (const hint of fallbackHints) {
      const resolved = names.find((name) => name.toLowerCase().includes(hint.toLowerCase()));
      if (resolved) {
        return resolved;
      }
    }
    return names[0] ?? null;
  }

  private logHeroSpineResolved(data: sp.SkeletonData, skinName: string | null, animationName: string, hero: LobbyHeroItemVO, resourcePath: string): void {
    const runtimeData = data.getRuntimeData(true);
    const width = runtimeData?.width ?? 0;
    const height = runtimeData?.height ?? 0;
    console.info(`[HeroDetail] spine applied: hero=${safeText(hero.heroCode)}, resource=${resourcePath}, skin=${skinName ?? '<setup>'}, animation=${animationName}, size=${Math.round(width)}x${Math.round(height)}`);
  }

  private renderInfoPanel(parent: Node, hero: LobbyHeroItemVO, x: number, y: number, width: number, height: number, scale: number): void {
    const panel = this.host.addChildPlainNode(parent, 'LobbyHeroDetailInfoPanel', x, y, width, height);
    const graphics = panel.addComponent(Graphics);
    graphics.fillColor = rgba(6, 6, 8, 198);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();

    this.renderHeroBadges(panel, hero, width, height, scale);
    this.renderAttributeGrid(panel, hero, width, height, scale);
    this.renderSkillList(panel, hero, width, height, scale);
  }

  private renderHeroBadges(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const sideInset = 24 * scale;
    const gap = 12 * scale;
    const topY = height / 2 - 34 * scale;
    const rarityWidth = Math.min(104 * scale, Math.max(76 * scale, width * 0.2));
    const formWidth = Math.min(188 * scale, Math.max(132 * scale, width - sideInset * 2 - rarityWidth - gap));
    this.addBadge(parent, 'LobbyHeroDetailRarity', safeText(hero.rarity || 'R'), -width / 2 + sideInset + rarityWidth / 2, topY, rarityWidth, 30 * scale, this.rarityColor(hero.rarity), scale);
    this.addBadge(parent, 'LobbyHeroDetailStars', starText(hero.star), 0, height / 2 - 70 * scale, width - sideInset * 2, 26 * scale, rgba(220, 168, 69), scale);
    const formText = hero.protagonist ? safeText(hero.formLabel || '攻击形态') : '已拥有英雄';
    this.addBadge(parent, 'LobbyHeroDetailForm', formText, width / 2 - sideInset - formWidth / 2, topY, formWidth, 30 * scale, rgba(172, 54, 42), scale);
    const source = this.host.addChildLabel(parent, 'LobbyHeroDetailSource', hero.protagonist ? '主角不进入抽卡池；防御/辅助形态后续由主线道具解锁。' : `${sourceLabel(hero.sourceType)} / 只读展示`, 0, height / 2 - 72 * scale, 15 * scale, rgba(191, 171, 121), new Size(width - 44 * scale, 28 * scale));
    source.node.setPosition(new Vec3(0, height / 2 - 104 * scale, 0));
    source.overflow = Label.Overflow.SHRINK;
  }

  private renderAttributeGrid(parent: Node, hero: LobbyHeroItemVO, width: number, height: number, scale: number): void {
    const title = this.host.addChildLabel(parent, 'LobbyHeroDetailAttributeTitle', '战斗展示属性', -width / 2 + 24 * scale, height / 2 - 112 * scale, 18 * scale, rgba(247, 218, 148), new Size(width - 48 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    title.node.setPosition(new Vec3(-width / 2 + 24 * scale, height / 2 - 146 * scale, 0));
    title.overflow = Label.Overflow.SHRINK;
    const grid = this.host.addChildPlainNode(parent, 'LobbyHeroDetailAttributeGrid', 0, height / 2 - 210 * scale, width - 48 * scale, 86 * scale);
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
    const titleY = height / 2 - 286 * scale;
    const title = this.host.addChildLabel(parent, 'LobbyHeroDetailSkillTitle', '技能预览', -width / 2 + 24 * scale, titleY, 18 * scale, rgba(247, 218, 148), new Size(width - 48 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    const listTop = titleY - 34 * scale;
    const listBottom = -height / 2 + 44 * scale;
    const listHeight = Math.max(112 * scale, listTop - listBottom);
    const list = this.host.addChildPlainNode(parent, 'LobbyHeroDetailSkillList', 0, (listTop + listBottom) / 2, width - 48 * scale, listHeight);
    const skills = resolveSkills(hero);
    const rowHeight = Math.min(62 * scale, Math.max(42 * scale, (listHeight - 28 * scale) / 4));
    skills.slice(0, 4).forEach((skill, index) => {
      const row = this.host.addChildPlainNode(list, `LobbyHeroDetailSkillRow_${index}`, 0, listHeight / 2 - rowHeight / 2 - 8 * scale - index * (rowHeight + 8 * scale), width - 60 * scale, rowHeight);
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
    const note = this.host.addChildLabel(parent, 'LobbyHeroDetailReadonlyNote', '只读展示：不提供升级、升星、觉醒、装备、抽卡、领取或资源变更入口。', 0, -height / 2 + 38 * scale, 14 * scale, rgba(170, 148, 103), new Size(width - 160 * scale, 24 * scale));
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

  private drawArtStageDepth(parent: Node, width: number, height: number, scale: number): void {
    const depth = this.host.addChildPlainNode(parent, 'LobbyHeroDetailStageDepth', 0, 0, width, height);
    const graphics = depth.addComponent(Graphics);
    const groundY = this.resolveHeroDetailGroundY(height);
    graphics.fillColor = rgba(0, 0, 0, 92);
    graphics.rect(-width / 2, -height / 2, width, height * 0.38);
    graphics.fill();
    graphics.fillColor = rgba(0, 0, 0, 148);
    graphics.ellipse(0, groundY, width * 0.34, height * 0.06);
    graphics.fill();
  }

  private resolveHeroDetailGroundY(height: number): number {
    return -height * 0.43;
  }

  private drawPanelShade(parent: Node, width: number, height: number, scale: number): void {
    const shade = this.host.addChildPlainNode(parent, 'LobbyHeroDetailPanelShade', 0, 0, width, height);
    const graphics = shade.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 64);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
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
