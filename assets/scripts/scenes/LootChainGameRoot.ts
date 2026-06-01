import {
  _decorator,
  BlockInputEvents,
  Button,
  Color,
  Component,
  EditBox,
  Graphics,
  HorizontalTextAlignment,
  Input,
  Label,
  Node,
  input,
  Size,
  Sprite,
  SpriteFrame,
  VideoClip,
  VideoPlayer,
} from 'cc';
import { AppConfig } from '../app/AppConfig';
import { lootChainApi, LootChainApi } from '../api/LootChainApi';
import type { PlayerLobbyProfileVO } from '../types/PlayerTypes';
import { AdaptiveStageLayoutResolver, type AdaptiveStageLayoutHost } from './AdaptiveStageLayoutResolver';
import { StatusPresenter, type StatusPresenterHost } from './StatusPresenter';
import { UiContentRootController, type UiContentRootHost } from './UiContentRootController';
import { UiPrimitiveFactory, type ButtonVisualState, type UiPrimitiveFactoryHost } from './UiPrimitiveFactory';
import { renderSceneBackButton, type SceneBackButtonHost } from './UiSceneBackButton';
import {
  compactResourceValue as compactUiResourceValue,
  formatInteger as formatUiInteger,
  trimText as trimUiText,
} from './UiTextFormatter';
import { UiSpriteFrameCache, type UiSpriteFrameCacheHost, type UiSpriteFrameOverrides } from './UiSpriteFrameCache';
import { GachaSceneRenderer, type GachaPreviewResultMode, type GachaSceneHost } from './gacha/GachaSceneRenderer';
import { LoginFlow, type LoginFlowHost } from './login/LoginFlow';
import {
  LoginRenderer,
  type LoginRendererHost,
} from './login/LoginRenderer';
import { ProtagonistCreateFlow, type ProtagonistCreateFlowHost } from './protagonist/ProtagonistCreateFlow';
import { ProtagonistCreateRenderer, type ProtagonistCreateRendererHost } from './protagonist/ProtagonistCreateRenderer';
import {
  LobbyBackgroundController,
  type LobbyBackgroundHost,
} from './lobby/LobbyBackgroundController';
import { LobbyAdventureLoader, type LobbyAdventureLoaderHost } from './lobby/LobbyAdventureLoader';
import { LobbyAdventurePanelRenderer, type LobbyAdventurePanelHost } from './lobby/LobbyAdventurePanelRenderer';
import { LobbyAvatarRenderer, type LobbyAvatarHost } from './lobby/LobbyAvatarRenderer';
import { LobbyBattleFlow, type LobbyBattleFlowHost } from './lobby/LobbyBattleFlow';
import { LobbyBattlePreviewPanelRenderer, type LobbyBattlePreviewPanelHost } from './lobby/LobbyBattlePreviewPanelRenderer';
import { LobbyCodexLoader, type LobbyCodexLoaderHost } from './lobby/LobbyCodexLoader';
import { LobbyCodexPanelRenderer, type LobbyCodexPanelHost } from './lobby/LobbyCodexPanelRenderer';
import { LobbyFormationPanelRenderer, type LobbyFormationPanelHost } from './lobby/LobbyFormationPanelRenderer';
import { LobbyHeroDetailPanelRenderer, type LobbyHeroDetailPanelHost } from './lobby/LobbyHeroDetailPanelRenderer';
import { LobbyHeroRosterLoader, type LobbyHeroRosterLoaderHost } from './lobby/LobbyHeroRosterLoader';
import { LobbyHeroRosterPanelRenderer, type LobbyHeroRosterPanelHost } from './lobby/LobbyHeroRosterPanelRenderer';
import { LobbyHudRenderer, type LobbyHudHost } from './lobby/LobbyHudRenderer';
import type { UiLayout } from './lobby/LobbyHudTypes';
import { LobbyLoadingFlow, type LobbyLoadingFlowHost } from './lobby/LobbyLoadingFlow';
import { LobbyLoadingRenderer, type LobbyLoadingHost } from './lobby/LobbyLoadingRenderer';
import { LobbyNoticeLoader, type LobbyNoticeLoaderHost } from './lobby/LobbyNoticeLoader';
import { LobbyNoticePanelRenderer, type LobbyNoticePanelHost } from './lobby/LobbyNoticePanelRenderer';
import { LobbyProfileDialogRenderer, type LobbyProfileDialogHost } from './lobby/LobbyProfileDialogRenderer';
import { LobbyProfileLoader, type LobbyProfileLoaderHost } from './lobby/LobbyProfileLoader';
import type { LobbyAdventurePanelState, LobbyAdventureStageVO } from '../types/LobbyAdventureTypes';
import type { LobbyBattlePanelState } from './lobby/LobbyBattleState';
import type { LobbyCodexPanelState } from '../types/LobbyCodexTypes';
import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../types/LobbyHeroTypes';
import type { LobbyNoticePanelState } from '../types/LobbyNoticeTypes';
import type { ProtagonistCreateFormState, ProtagonistForm, ProtagonistGender } from '../types/ProtagonistTypes';
import { LoginVideoBackground } from '../../resources/login-bg/scripts/login/LoginVideoBackground';

const { ccclass, property } = _decorator;

type AsyncAction = () => Promise<void>;
type CursorDocument = { body?: { style?: { cursor: string } } };
type ViewName =
  | 'login'
  | 'loginAccount'
  | 'protagonistCreate'
  | 'loading'
  | 'lobby'
  | 'profile'
  | 'adventure'
  | 'battle'
  | 'codex'
  | 'formation'
  | 'heroes'
  | 'heroDetail'
  | 'notice'
  | 'gacha'
  | 'gachaResult'
  | 'placeholder';
type LobbyPlaceholderDialogState = {
  title: string;
  detail: string;
};

const LOGIN_SCENE_BACKGROUND_NODE_NAMES = [
  'Login_BG_Poster',
  'Login_BG_Video',
] as const;

const LOGIN_SCENE_LEGACY_NODE_NAMES = [
  'Audio_BGM',
  'BG_Main',
  'BG_Main-001',
  'BG_Main-002',
  'Sky_Effects',
  'Vortex_Center_Debug',
  'Sky_Mask',
  'Sky_MaskNew2',
  'Sky_MaskNew',
  'FG_Architecture',
  'Architecture_Edge_Shadow_Soft',
  'Architecture_Edge_Shadow_Tight',
  'Crystal_Effects',
  'Dragon_Layer',
  'Character_Effects',
  'Lightning_Particle',
  'Foreground_Effects',
] as const;

const LOGIN_SCENE_STAGE_NODE_NAMES = [...LOGIN_SCENE_BACKGROUND_NODE_NAMES, ...LOGIN_SCENE_LEGACY_NODE_NAMES] as const;

const LOBBY_BACKGROUND_NODE_NAMES = ['Lobby_BG_Poster', 'Lobby_BG_Video', 'Lobby_BG_Fallback'] as const;

/**
 * Cocos 场景根组件。
 *
 * 这里只保留根职责：生命周期、视图切换、资源/资料调度，以及给各渲染模块提供 host wrapper。
 * 具体 UI 绘制、登录流程、loading 流程和背景控制都拆到独立模块，避免大厅代码继续堆在根组件里。
 */
@ccclass('LootChainGameRoot')
export class LootChainGameRoot extends Component {
  @property(SpriteFrame)
  logoFrame: SpriteFrame | null = null;

  @property(SpriteFrame)
  mainButtonFrame: SpriteFrame | null = null;

  @property([SpriteFrame])
  rightRailFrames: SpriteFrame[] = [];

  private readonly api: LootChainApi = lootChainApi;
  private readonly layoutResolver = new AdaptiveStageLayoutResolver(this as unknown as AdaptiveStageLayoutHost);
  private readonly statusPresenter = new StatusPresenter(this as unknown as StatusPresenterHost);
  private readonly contentRootController = new UiContentRootController(this as unknown as UiContentRootHost);
  private readonly uiSpriteFrameCache = new UiSpriteFrameCache(this as unknown as UiSpriteFrameCacheHost);
  private readonly uiPrimitiveFactory = new UiPrimitiveFactory(
    this as unknown as UiPrimitiveFactoryHost,
    this.uiSpriteFrameCache,
    () => this.uiSpriteFrameOverrides(),
  );
  private readonly gachaSceneRenderer = new GachaSceneRenderer(this as unknown as GachaSceneHost);
  private readonly loginFlow = new LoginFlow(this.api.auth, {
    apiBaseUrl: AppConfig.apiBaseUrl,
    defaultDevUserId: AppConfig.defaultDevUserId,
  }, this as unknown as LoginFlowHost);
  private readonly loginRenderer = new LoginRenderer(this as unknown as LoginRendererHost);
  private readonly protagonistCreateFlow = new ProtagonistCreateFlow(this.api.protagonist, this as unknown as ProtagonistCreateFlowHost);
  private readonly protagonistCreateRenderer = new ProtagonistCreateRenderer(this as unknown as ProtagonistCreateRendererHost);
  private readonly lobbyBackgroundController = new LobbyBackgroundController(this as unknown as LobbyBackgroundHost);
  private readonly lobbyAdventureLoader = new LobbyAdventureLoader(this.api.lobbyAdventure, this as unknown as LobbyAdventureLoaderHost);
  private readonly lobbyAdventurePanelRenderer = new LobbyAdventurePanelRenderer(this as unknown as LobbyAdventurePanelHost);
  private readonly lobbyAvatarRenderer = new LobbyAvatarRenderer(this as unknown as LobbyAvatarHost);
  private readonly lobbyBattleFlow = new LobbyBattleFlow(this.api.battle, this as unknown as LobbyBattleFlowHost);
  private readonly lobbyBattlePreviewPanelRenderer = new LobbyBattlePreviewPanelRenderer(this as unknown as LobbyBattlePreviewPanelHost);
  private readonly lobbyHudRenderer = new LobbyHudRenderer(this as unknown as LobbyHudHost);
  private readonly lobbyLoadingFlow = new LobbyLoadingFlow(this as unknown as LobbyLoadingFlowHost);
  private readonly lobbyLoadingRenderer = new LobbyLoadingRenderer(this as unknown as LobbyLoadingHost);
  private readonly lobbyCodexLoader = new LobbyCodexLoader(this.api.lobbyCodex, this as unknown as LobbyCodexLoaderHost);
  private readonly lobbyCodexPanelRenderer = new LobbyCodexPanelRenderer(this as unknown as LobbyCodexPanelHost);
  private readonly lobbyFormationPanelRenderer = new LobbyFormationPanelRenderer(this as unknown as LobbyFormationPanelHost);
  private readonly lobbyHeroDetailPanelRenderer = new LobbyHeroDetailPanelRenderer(this as unknown as LobbyHeroDetailPanelHost);
  private readonly lobbyHeroRosterLoader = new LobbyHeroRosterLoader(this.api.lobbyHero, this as unknown as LobbyHeroRosterLoaderHost);
  private readonly lobbyHeroRosterPanelRenderer = new LobbyHeroRosterPanelRenderer(this as unknown as LobbyHeroRosterPanelHost);
  private readonly lobbyNoticeLoader = new LobbyNoticeLoader(this.api.lobbyNotice, this as unknown as LobbyNoticeLoaderHost);
  private readonly lobbyNoticePanelRenderer = new LobbyNoticePanelRenderer(this as unknown as LobbyNoticePanelHost);
  private readonly lobbyProfileDialogRenderer = new LobbyProfileDialogRenderer(this as unknown as LobbyProfileDialogHost);
  private readonly lobbyProfileLoader = new LobbyProfileLoader(this.api.profile, AppConfig.defaultDevUserId, this as unknown as LobbyProfileLoaderHost);
  private currentView: ViewName = 'login';
  private layoutKey = '';
  private lobbyProfileOpen = false;
  private lobbyAdventurePanelOpen = false;
  private lobbyBattlePreviewPanelOpen = false;
  private lobbyCodexPanelOpen = false;
  private lobbyFormationPanelOpen = false;
  private lobbyHeroDetailHeroId: number | null = null;
  private lobbyHeroRosterPanelOpen = false;
  private lobbyNoticePanelOpen = false;
  private lobbyPlaceholderDialog: LobbyPlaceholderDialogState | null = null;
  private gachaResultMode: GachaPreviewResultMode | null = null;
  private selectedLobbyStageCode: string | null = null;
  private selectedLobbyFormationHeroIds: number[] = [];

  start(): void {
    // 登录验收必须从真实点击开始，避免历史 token 让预览直接进入通过态。
    this.api.auth.logout();
    this.currentView = 'login';
    this.preloadUiSprites();
    input.on(Input.EventType.MOUSE_DOWN, this.tryPlayLobbyVideo, this);
    input.on(Input.EventType.TOUCH_START, this.tryPlayLobbyVideo, this);
    this.renderCurrentView();
  }

  update(deltaTime: number): void {
    const nextKey = this.makeLayoutKey();
    if (this.layoutKey && this.layoutKey !== nextKey) {
      this.renderCurrentView();
    }
    this.updateLobbyPosterFade(deltaTime);
  }

  onDestroy(): void {
    input.off(Input.EventType.MOUSE_DOWN, this.tryPlayLobbyVideo, this);
    input.off(Input.EventType.TOUCH_START, this.tryPlayLobbyVideo, this);
    this.loginFlow.cancel();
    this.protagonistCreateFlow.cancel();
    this.lobbyLoadingFlow.cancel();
    this.lobbyAdventureLoader.cancel();
    this.lobbyBattleFlow.cancel();
    this.lobbyCodexLoader.cancel();
    this.lobbyHeroRosterLoader.cancel();
    this.lobbyNoticeLoader.cancel();
    this.lobbyProfileLoader.cancel();
    this.releaseLobbyVideoRuntime();
  }

  private renderCurrentView(): void {
    // 所有视图入口集中在这里，resize 或状态变化时按 currentView 重绘。
    if (this.currentView === 'lobby') {
      if (this.lobbyBackgroundController.isRendered()) {
        this.refreshLobbyViewPreservingBackground();
        return;
      }
      this.renderLobby();
      return;
    }
    if (this.currentView === 'battle') {
      this.renderBattleScene();
      return;
    }
    if (this.currentView === 'gacha') {
      this.renderGachaScene();
      return;
    }
    if (this.currentView === 'gachaResult') {
      this.renderGachaResultScene();
      return;
    }
    if (this.isLobbyScenePageView(this.currentView)) {
      this.renderLobbyScenePage();
      return;
    }
    if (this.currentView === 'loading') {
      this.renderLoading();
      return;
    }
    if (this.currentView === 'protagonistCreate') {
      this.renderProtagonistCreate();
      return;
    }
    if (this.currentView === 'loginAccount') {
      this.renderLoginAccountScene();
      return;
    }
    this.renderLogin();
  }

  private renderLogin(): void {
    this.currentView = 'login';
    const layout = this.renderBase();
    this.loginRenderer.renderLogin(layout);
  }

  private renderLoginAccountScene(): void {
    this.currentView = 'loginAccount';
    const layout = this.renderBase();
    this.loginRenderer.renderLoginAccountScene(layout, {
      agreementAccepted: this.loginFlow.agreementAccepted,
      defaultDevUserId: this.loginFlow.defaultDevUserId,
    });
  }

  private renderLoading(): void {
    this.currentView = 'loading';
    const layout = this.renderBase();
    this.lobbyLoadingRenderer.render(layout, this.lobbyLoadingFlow.state);
  }

  private renderProtagonistCreate(): void {
    this.currentView = 'protagonistCreate';
    const layout = this.renderBase();
    this.protagonistCreateRenderer.render(layout, this.protagonistCreateFlow.currentState());
  }

  private renderLobby(): void {
    this.currentView = 'lobby';
    const layout = this.renderBase();
    // 大厅只保留主界面 HUD；功能入口统一进入独立逻辑场景，不再作为弹框覆盖大厅。
    this.renderLobbyBackground(layout);
    this.renderLobbyHud(layout);
  }

  private renderBattleScene(): void {
    this.currentView = 'battle';
    const layout = this.renderBase();
    // 战斗从大厅弹框升级为全屏逻辑视图，但仍复用现有 no-reward battle flow。
    this.renderLobbyBattlePreviewPanel(layout);
  }

  private renderGachaScene(): void {
    this.currentView = 'gacha';
    const layout = this.renderBase();
    // 抽奖页当前只做独立场景预览，不能从这里接入扣费、发奖、保底或兑换写入。
    this.gachaSceneRenderer.render(layout);
  }

  private renderGachaResultScene(): void {
    this.currentView = 'gachaResult';
    const layout = this.renderBase();
    this.gachaSceneRenderer.renderResultScene(layout, this.gachaResultMode ?? 'once');
  }

  private renderLobbyScenePage(): void {
    const layout = this.renderBase();
    // 大厅功能入口必须切换到独立全屏逻辑场景，不再把内容浮在大厅背景/HUD 上。
    this.renderLobbyFeatureSceneBackdrop(layout);
    if (this.currentView === 'profile') {
      this.renderPlayerProfileDialog(layout);
      return;
    }
    if (this.currentView === 'adventure') {
      this.renderLobbyAdventurePanel(layout);
      return;
    }
    if (this.currentView === 'codex') {
      this.renderLobbyCodexPanel(layout);
      return;
    }
    if (this.currentView === 'formation') {
      this.renderLobbyFormationPanel(layout);
      return;
    }
    if (this.currentView === 'heroes') {
      this.renderLobbyHeroRosterPanel(layout);
      return;
    }
    if (this.currentView === 'heroDetail') {
      this.renderLobbyHeroDetailPanel(layout);
      return;
    }
    if (this.currentView === 'notice') {
      this.renderLobbyNoticePanel(layout);
      return;
    }
    if (this.currentView === 'placeholder') {
      this.renderLobbyPlaceholderDialog(layout);
    }
  }

  private renderLobbyHud(layout: UiLayout): void {
    this.lobbyHudRenderer.render(layout);
  }

  private refreshLobbyOverlay(): void {
    if (this.isLobbyScenePageView(this.currentView)) {
      this.renderCurrentView();
      return;
    }
    if (this.currentView !== 'lobby') {
      return;
    }
    // 大厅态只刷新 HUD；功能页已经独立成逻辑场景，会走整页重绘。
    const layout = this.resolveLayout();
    this.applyRootSize(layout);
    this.setPointerCursor(false);
    this.resizeLobbyBackground(layout);
    this.rerenderLobbyOverlay(layout);
  }

  private refreshLobbyViewPreservingBackground(): void {
    if (this.currentView !== 'lobby') {
      return;
    }
    // 资源补帧或窗口尺寸变化时保留现有背景视频，只重排背景尺寸和 HUD 覆盖层。
    const layout = this.resolveLayout();
    this.applyRootSize(layout);
    this.setPointerCursor(false);
    this.resizeLobbyBackground(layout);
    this.rerenderLobbyOverlay(layout);
  }

  private rerenderLobbyOverlay(layout: UiLayout): void {
    this.removeNodeFromContent('LobbyAtmosphereOverlay');
    this.removeNodeFromContent('LobbyPlayerInfoButton');
    this.removeNodeFromContent('LobbyResourceBar');
    this.removeNodeFromContent('LobbySystemIcons');
    this.removeNodeFromContent('LobbyActivityRail');
    this.removeNodeFromContent('LobbySceneHotspots');
    this.removeNodeFromContent('LobbyGoalTracker');
    this.removeNodeFromContent('LobbyCompactGoalTracker');
    this.removeNodeFromContent('LobbyMicroGoalChip');
    this.removeNodeFromContent('LobbyChallengeRail');
    this.removeNodeFromContent('LobbyBottomHud');
    this.removeNodeFromContent('LobbyCompactActionEntrances');
    this.removeNodeFromContent('LobbyCompactSceneEntrances');
    this.removeLobbyAdventurePanel();
    this.removeLobbyBattlePreviewPanel();
    this.removeLobbyCodexPanel();
    this.removeLobbyFormationPanel();
    this.removeLobbyHeroDetailPanel();
    this.removeLobbyHeroRosterPanel();
    this.removeLobbyNoticePanel();
    this.removePlayerProfileDialog();
    this.removeLobbyPlaceholderDialog();
    this.renderLobbyHud(layout);
    this.layoutKey = this.makeLayoutKey();
  }

  private renderPlayerProfileDialog(layout: UiLayout): void {
    this.lobbyProfileDialogRenderer.render(layout);
  }

  private renderLobbyAdventurePanel(layout: UiLayout): void {
    this.lobbyAdventurePanelRenderer.render(layout);
  }

  private renderLobbyBattlePreviewPanel(layout: UiLayout): void {
    this.lobbyBattlePreviewPanelRenderer.render(layout);
  }

  private renderLobbyCodexPanel(layout: UiLayout): void {
    this.lobbyCodexPanelRenderer.render(layout);
  }

  private renderLobbyFormationPanel(layout: UiLayout): void {
    this.lobbyFormationPanelRenderer.render(layout);
  }

  private renderLobbyHeroDetailPanel(layout: UiLayout): void {
    this.lobbyHeroDetailPanelRenderer.render(layout);
  }

  private renderLobbyHeroRosterPanel(layout: UiLayout): void {
    this.lobbyHeroRosterPanelRenderer.render(layout);
  }

  private renderLobbyNoticePanel(layout: UiLayout): void {
    this.lobbyNoticePanelRenderer.render(layout);
  }

  private renderLobbyPlaceholderDialog(layout: UiLayout): void {
    const dialog = this.lobbyPlaceholderDialog;
    if (!dialog) {
      return;
    }
    const scale = Math.max(0.7, Math.min(1, layout.uiScale));
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const panelWidth = Math.max(280 * scale, layout.stageWidth);
    const panelHeight = Math.max(220 * scale, layout.stageHeight);

    // 未开放入口以独立全屏逻辑场景承载，只给本地反馈，不承载任何跳转、领取、购买或经济写入逻辑。
    const scene = this.addRect('LobbyPlaceholderSceneRoot', centerX, centerY, layout.width, layout.height, new Color(0, 0, 0, 178));
    scene.node.addComponent(BlockInputEvents);

    const panel = this.addBeveledPanelNode(
      'LobbyPlaceholderScenePanel',
      centerX,
      centerY,
      panelWidth,
      panelHeight,
      new Color(8, 7, 9, 232),
      new Color(185, 138, 58, 220),
      16 * scale,
    );
    // 场景页本体阻挡输入事件，避免内容区点击穿透到底层大厅。
    panel.addComponent(BlockInputEvents);
    const titleLabel = this.addChildLabel(
      panel,
      'LobbyPlaceholderTitle',
      dialog.title,
      0,
      panelHeight / 2 - 48 * scale,
      26 * scale,
      new Color(247, 222, 165),
      new Size(panelWidth - 58 * scale, 38 * scale),
    );
    titleLabel.overflow = Label.Overflow.SHRINK;
    titleLabel.enableOutline = true;
    titleLabel.outlineColor = new Color(0, 0, 0, 215);
    titleLabel.outlineWidth = Math.max(1, 1.4 * scale);

    const subtitle = this.addChildLabel(
      panel,
      'LobbyPlaceholderSubtitle',
      this.placeholderSubtitle(dialog.title, dialog.detail),
      0,
      panelHeight / 2 - 88 * scale,
      21 * scale,
      new Color(218, 170, 76),
      new Size(panelWidth - 72 * scale, 30 * scale),
    );
    subtitle.overflow = Label.Overflow.SHRINK;

    const detail = this.addChildLabel(
      panel,
      'LobbyPlaceholderDetail',
      dialog.detail,
      0,
      0,
      18 * scale,
      new Color(210, 196, 166),
      new Size(panelWidth - 74 * scale, Math.max(58 * scale, panelHeight - 202 * scale)),
    );
    detail.lineHeight = 27 * scale;
    detail.overflow = Label.Overflow.RESIZE_HEIGHT;

    if (panelHeight >= 230 * scale) {
      const boundary = this.addChildLabel(
        panel,
        'LobbyPlaceholderBoundaryNote',
        this.placeholderBoundaryNote(dialog.detail),
        0,
        -panelHeight / 2 + 84 * scale,
        15 * scale,
        new Color(168, 146, 104),
        new Size(panelWidth - 80 * scale, 26 * scale),
      );
      boundary.overflow = Label.Overflow.SHRINK;
    }

    renderSceneBackButton(
      this as unknown as SceneBackButtonHost,
      panel,
      layout,
      'LobbyPlaceholderBackButton',
      () => this.closeLobbyPlaceholderDialog(),
      scale,
    );
  }

  private placeholderSubtitle(title: string, detail: string): string {
    if (title.startsWith('资源：')) {
      return '只读/占位资源';
    }
    if (detail.includes('聊天系统')) {
      return '本地聊天预览';
    }
    if (detail.includes('系统入口')) {
      return '系统入口占位';
    }
    if (detail.includes('战斗') || detail.includes('结算')) {
      return '玩法未开放';
    }
    return '功能暂未开放';
  }

  private placeholderBoundaryNote(detail: string): string {
    if (detail.includes('只读')) {
      return '当前仅展示资料，不提供任何增减入口。';
    }
    return '当前仅本地展示，不跳转、不发奖、不写入经济数据。';
  }

  private isLobbyScenePageView(view: ViewName): boolean {
    return view === 'profile'
      || view === 'adventure'
      || view === 'codex'
      || view === 'formation'
      || view === 'heroes'
      || view === 'heroDetail'
      || view === 'notice'
      || view === 'placeholder';
  }

  private returnToLobbyFromScenePage(): void {
    this.lobbyProfileOpen = false;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'lobby';
    this.renderCurrentView();
  }

  private renderCurrentLobbyScenePage(): void {
    if (this.isLobbyScenePageView(this.currentView)) {
      this.renderCurrentView();
    }
  }






























  private openPlayerProfileDialog(): void {
    if (this.lobbyProfileOpen && this.currentView === 'profile') {
      return;
    }
    this.lobbyProfileOpen = true;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'profile';
    this.renderCurrentView();
  }

  private closePlayerProfileDialog(): void {
    if (!this.lobbyProfileOpen) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removePlayerProfileDialog(): void {
    this.removeNodeFromContent('LobbyProfileDim');
    this.removeNodeFromContent('LobbyProfilePanel');
    this.removeNodeFromContent('LobbyProfileSceneRoot');
    this.removeNodeFromContent('LobbyProfileSceneContent');
  }

  private openLobbyAdventurePanel(): void {
    this.lobbyAdventurePanelOpen = true;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'adventure';
    this.renderCurrentView();
    void this.loadLobbyAdventure();
    void this.loadLobbyBattleRecent();
  }

  private closeLobbyAdventurePanel(): void {
    if (!this.lobbyAdventurePanelOpen) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removeLobbyAdventurePanel(): void {
    this.removeNodeFromContent('LobbyAdventureDim');
    this.removeNodeFromContent('LobbyAdventurePanel');
    this.removeNodeFromContent('LobbyAdventureSceneContent');
  }

  private reloadLobbyAdventure(): void {
    void this.loadLobbyAdventure(true);
    void this.loadLobbyBattleRecent(true);
  }

  private currentLobbyAdventureState(): LobbyAdventurePanelState {
    return this.lobbyAdventureLoader.currentState();
  }

  private selectLobbyAdventureStage(stageCode: string): void {
    const resolvedStageCode = this.resolveLobbyStageCode(stageCode);
    if (!resolvedStageCode) {
      this.rejectInvalidLobbyStageSelection();
      return;
    }
    const stage = this.findLobbyAdventureStage(resolvedStageCode);
    if (!stage) {
      this.setStatus('该主线关卡暂不可选，请刷新冒险面板。');
      return;
    }
    if (!stage.unlocked) {
      this.setStatus(`${stage.stageName} 尚未解锁，当前只展示预告。`);
      return;
    }
    // 只保存本地本次关卡选择，让详情、编队和战斗预览保持同一目标；不写入主线进度。
    this.selectedLobbyStageCode = resolvedStageCode;
    this.setStatus(`已选择 ${stage.stageName}，可进入编队确认。`);
    if (this.currentView === 'adventure' && this.lobbyAdventurePanelOpen) {
      this.renderCurrentView();
    }
  }

  private previewLockedLobbyAdventureStage(stageCode: string): void {
    const resolvedStageCode = this.resolveLobbyStageCode(stageCode);
    if (!resolvedStageCode) {
      this.rejectInvalidLobbyStageSelection();
      return;
    }
    const stage = this.findLobbyAdventureStage(resolvedStageCode);
    if (!stage) {
      this.setStatus('该主线关卡暂不可选，请刷新冒险面板。');
      return;
    }
    if (stage.unlocked) {
      this.selectLobbyAdventureStage(resolvedStageCode);
      return;
    }
    // 锁定关卡只展示原因，不写入本地选择，也不会打开编队或触发 battle start。
    this.setStatus(`${stage.stageName} 尚未解锁，当前只展示预告，不会进入编队。`);
  }

  private openLobbyBattlePreviewPanel(stageCode: string): void {
    const resolvedStageCode = this.resolveLobbyStageCode(stageCode);
    if (!resolvedStageCode) {
      this.rejectInvalidLobbyStageSelection();
      return;
    }
    const stage = this.findLobbyAdventureStage(resolvedStageCode);
    if (!stage) {
      this.setStatus('该主线关卡暂不可选，请刷新冒险面板。');
      this.openLobbyAdventurePanel();
      return;
    }
    if (!stage.unlocked) {
      this.previewLockedLobbyAdventureStage(resolvedStageCode);
      this.openLobbyAdventurePanel();
      return;
    }
    const reuseExistingBattleState = this.isLobbyBattleFlowBusyForStage(resolvedStageCode);
    this.selectedLobbyStageCode = resolvedStageCode;
    if (!reuseExistingBattleState) {
      this.lobbyBattleFlow.prepare(this.selectedLobbyStageCode);
    }
    this.lobbyBattlePreviewPanelOpen = true;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.removePlayerProfileDialog();
    this.removeLobbyAdventurePanel();
    this.removeLobbyCodexPanel();
    this.removeLobbyFormationPanel();
    this.removeLobbyHeroDetailPanel();
    this.removeLobbyHeroRosterPanel();
    this.removeLobbyNoticePanel();
    this.removeLobbyPlaceholderDialog();
    this.removeLobbyBattlePreviewPanel();
    this.currentView = 'battle';
    this.renderBattleScene();
    const startStageCode = resolvedStageCode;
    if (reuseExistingBattleState) {
      return;
    }
    void this.loadLobbyHeroRoster().then(() => {
      if (this.currentView !== 'battle' || !this.lobbyBattlePreviewPanelOpen || this.selectedLobbyStageCode !== startStageCode || this.isLobbyBattleFlowBusyForStage(startStageCode)) {
        return;
      }
      this.startLobbyBattleSession();
    });
  }

  private closeLobbyBattlePreviewPanel(): void {
    if (!this.lobbyBattlePreviewPanelOpen) {
      return;
    }
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyFormationPanelOpen = true;
    this.currentView = 'formation';
    this.renderCurrentView();
  }

  private removeLobbyBattlePreviewPanel(): void {
    this.removeNodeFromContent('LobbyBattlePreviewDim');
    this.removeNodeFromContent('LobbyBattlePreviewPanel');
    this.removeNodeFromContent('LobbyBattleSceneRoot');
  }

  private refreshLobbyBattlePreviewPanel(): void {
    if (!this.lobbyBattlePreviewPanelOpen) {
      return;
    }
    if (this.currentView === 'battle') {
      this.renderBattleScene();
      return;
    }
    if (this.currentView !== 'lobby') {
      return;
    }
    this.removeLobbyBattlePreviewPanel();
    this.renderLobbyBattlePreviewPanel(this.resolveLayout());
    this.layoutKey = this.makeLayoutKey();
  }

  private currentLobbyBattleState(): LobbyBattlePanelState {
    return this.lobbyBattleFlow.currentState();
  }

  private isLobbyBattleFlowBusyForStage(stageCode: string): boolean {
    const state = this.lobbyBattleFlow.currentState();
    return state.stageCode === stageCode && (state.starting || !!state.start || state.settling || !!state.settlement);
  }

  private startLobbyBattleSession(): void {
    if (!this.selectedLobbyStageCode) {
      this.rejectInvalidLobbyStageSelection();
      return;
    }
    this.reconcileLobbyFormationSelection();
    void this.lobbyBattleFlow.start(this.selectedLobbyStageCode);
  }

  private settleLobbyBattleSession(): void {
    void this.lobbyBattleFlow.settle();
  }

  private returnToLobbyFromBattlePreview(): void {
    // 回到大厅时结束战斗表现计时，并回读只读大厅数据，保证闭环后的 HUD 与入口状态是最新快照。
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyBattleFlow.cancel(true);
    this.currentView = 'lobby';
    this.removeLobbyBattlePreviewPanel();
    this.removeLobbyFormationPanel();
    this.renderLobby();
    this.refreshLobbyReadonlyStateAfterBattle();
  }

  private openLobbyCodexPanel(): void {
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = true;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'codex';
    this.renderCurrentView();
    void this.loadLobbyCodex();
  }

  private openLobbyFormationPanel(stageCode?: string): void {
    const resolvedStageCode = this.resolveLobbyStageCode(stageCode);
    if (!resolvedStageCode) {
      this.rejectInvalidLobbyStageSelection();
      return;
    }
    const stage = this.findLobbyAdventureStage(resolvedStageCode);
    if (!stage) {
      this.setStatus('该主线关卡暂不可选，请刷新冒险面板。');
      this.openLobbyAdventurePanel();
      return;
    }
    if (!stage.unlocked) {
      this.previewLockedLobbyAdventureStage(resolvedStageCode);
      this.openLobbyAdventurePanel();
      return;
    }
    // 编队入口也重复校验 unlock，防止未来 UI 误把锁定关卡传进来。
    this.selectedLobbyStageCode = resolvedStageCode;
    this.lobbyFormationPanelOpen = true;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'formation';
    this.renderCurrentView();
    void this.loadLobbyHeroRoster();
  }

  private closeLobbyFormationPanel(): void {
    if (!this.lobbyFormationPanelOpen) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removeLobbyFormationPanel(): void {
    this.removeNodeFromContent('LobbyFormationDim');
    this.removeNodeFromContent('LobbyFormationPanel');
    this.removeNodeFromContent('LobbyFormationSceneContent');
  }

  private closeLobbyCodexPanel(): void {
    if (!this.lobbyCodexPanelOpen) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removeLobbyCodexPanel(): void {
    this.removeNodeFromContent('LobbyCodexDim');
    this.removeNodeFromContent('LobbyCodexPanel');
    this.removeNodeFromContent('LobbyCodexSceneContent');
  }

  private reloadLobbyCodex(): void {
    void this.loadLobbyCodex(true);
  }

  private currentLobbyCodexState(): LobbyCodexPanelState {
    return this.lobbyCodexLoader.currentState();
  }

  private openLobbyHeroRosterPanel(): void {
    this.lobbyHeroRosterPanelOpen = true;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'heroes';
    this.renderCurrentView();
    void this.loadLobbyHeroRoster();
  }

  private closeLobbyHeroRosterPanel(): void {
    if (!this.lobbyHeroRosterPanelOpen) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removeLobbyHeroRosterPanel(): void {
    this.removeNodeFromContent('LobbyHeroRosterDim');
    this.removeNodeFromContent('LobbyHeroRosterPanel');
    this.removeNodeFromContent('LobbyHeroRosterSceneContent');
  }

  private reloadLobbyHeroRoster(): void {
    void this.loadLobbyHeroRoster(true);
  }

  private currentLobbyHeroRosterState(): LobbyHeroRosterPanelState {
    return this.lobbyHeroRosterLoader.currentState();
  }

  private openLobbyHeroDetail(heroId: number): void {
    const hero = this.lobbyHeroRosterLoader.currentState().heroes.find((item) => item.id === heroId);
    if (!hero || hero.rarity.toUpperCase() === 'EX' || hero.heroCode.toUpperCase().startsWith('EX_')) {
      this.setStatus('该英雄当前不可查看详情。');
      return;
    }
    this.lobbyHeroDetailHeroId = hero.id;
    this.lobbyHeroRosterPanelOpen = true;
    this.currentView = 'heroDetail';
    this.renderCurrentView();
  }

  private closeLobbyHeroDetailPanel(): void {
    if (this.lobbyHeroDetailHeroId === null) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private backToLobbyHeroRosterPanel(): void {
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = true;
    this.currentView = 'heroes';
    this.renderCurrentView();
  }

  private removeLobbyHeroDetailPanel(): void {
    this.removeNodeFromContent('LobbyHeroDetailDim');
    this.removeNodeFromContent('LobbyHeroDetailPanel');
    this.removeNodeFromContent('LobbyHeroDetailSceneContent');
  }

  private currentLobbyHeroDetailHero(): LobbyHeroItemVO | null {
    if (this.lobbyHeroDetailHeroId === null) {
      return null;
    }
    return this.lobbyHeroRosterLoader.currentState().heroes.find((hero) => hero.id === this.lobbyHeroDetailHeroId) ?? null;
  }

  private currentLobbySelectedStageCode(): string {
    return this.selectedLobbyStageCode ?? '未选择关卡';
  }

  private currentLobbyFormationHeroIds(): number[] {
    return this.resolveLobbyFormationHeroIds();
  }

  private toggleLobbyFormationHero(heroId: number): void {
    const heroes = this.selectableLobbyHeroes();
    const hero = heroes.find((item) => item.id === heroId);
    if (!hero) {
      this.setStatus('该英雄当前不可上阵。');
      return;
    }
    const current = this.resolveLobbyFormationHeroIds();
    if (hero.protagonist) {
      this.setStatus('主角当前固定为队长，不能从本次阵容移除。');
      return;
    }
    if (current.includes(hero.id)) {
      this.selectedLobbyFormationHeroIds = this.normalizeLobbyFormationHeroIds(current.filter((id) => id !== hero.id));
      this.setStatus(`${hero.heroName} 已移出本次阵容。`);
    } else {
      const next = [...current];
      if (next.length >= 5) {
        const replaceIndex = next.findIndex((id) => !heroes.find((item) => item.id === id)?.protagonist);
        next[replaceIndex >= 0 ? replaceIndex : next.length - 1] = hero.id;
      } else {
        next.push(hero.id);
      }
      this.selectedLobbyFormationHeroIds = this.normalizeLobbyFormationHeroIds(next);
      this.setStatus(`${hero.heroName} 已加入本次阵容。`);
    }
    if (this.currentView === 'formation' && this.lobbyFormationPanelOpen) {
      this.renderCurrentView();
    }
  }

  private openLobbyNoticePanel(): void {
    this.lobbyNoticePanelOpen = true;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'notice';
    this.renderCurrentView();
    void this.loadLobbyNotices();
  }

  private openLobbyGachaScene(): void {
    this.lobbyProfileOpen = false;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.gachaResultMode = null;
    this.currentView = 'gacha';
    this.renderCurrentView();
    this.setStatus('已进入召唤预览页，当前不会扣资源或发放英雄。');
  }

  private openGachaMockResultScene(mode: GachaPreviewResultMode): void {
    this.gachaResultMode = mode;
    this.currentView = 'gachaResult';
    this.renderCurrentView();
    this.setStatus('本地结果预览：不扣资源、不发英雄、不写入抽卡记录或保底。');
  }

  private closeGachaMockResultScene(): void {
    if (this.currentView !== 'gachaResult') {
      return;
    }
    this.gachaResultMode = null;
    this.currentView = 'gacha';
    this.renderCurrentView();
  }

  private closeGachaScene(): void {
    if (this.currentView !== 'gacha' && this.currentView !== 'gachaResult') {
      return;
    }
    this.gachaResultMode = null;
    this.currentView = 'lobby';
    this.renderCurrentView();
  }

  private closeLobbyNoticePanel(): void {
    if (!this.lobbyNoticePanelOpen) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removeLobbyNoticePanel(): void {
    this.removeNodeFromContent('LobbyNoticeDim');
    this.removeNodeFromContent('LobbyNoticePanel');
    this.removeNodeFromContent('LobbyNoticeSceneContent');
  }

  private reloadLobbyNotices(): void {
    void this.loadLobbyNotices(true);
  }

  private currentLobbyNoticeState(): LobbyNoticePanelState {
    return this.lobbyNoticeLoader.currentState();
  }

  private openLobbyPlaceholderDialog(title: string, detail?: string): void {
    const safeTitle = this.trimText(title || '大厅入口');
    const safeDetail = this.trimText(detail || '当前阶段仅开放登录、大厅只读展示和玩家资料查看。该入口暂不连接玩法或经济写接口。');
    this.lobbyPlaceholderDialog = {
      title: safeTitle,
      detail: safeDetail,
    };
    this.lobbyProfileOpen = false;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.setStatus(`${safeTitle} 暂未开放。`);
    this.currentView = 'placeholder';
    this.renderCurrentView();
  }

  private closeLobbyPlaceholderDialog(): void {
    if (!this.lobbyPlaceholderDialog) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removeLobbyPlaceholderDialog(): void {
    this.removeNodeFromContent('LobbyPlaceholderSceneRoot');
    this.removeNodeFromContent('LobbyPlaceholderScenePanel');
  }

  private async loadLobbyProfile(userId: number): Promise<void> {
    await this.lobbyProfileLoader.load(userId);
  }

  private async loadLobbyNotices(force = false): Promise<void> {
    await this.lobbyNoticeLoader.load(force);
  }

  private async loadLobbyCodex(force = false): Promise<void> {
    await this.lobbyCodexLoader.load(force);
  }

  private async loadLobbyHeroRoster(force = false): Promise<void> {
    await this.lobbyHeroRosterLoader.load(force);
    if (this.reconcileLobbyFormationSelection()) {
      if (this.currentView === 'formation' || this.currentView === 'heroes' || this.currentView === 'heroDetail') {
        this.renderCurrentView();
      } else if (this.currentView === 'lobby') {
        this.refreshLobbyOverlay();
      }
    }
  }

  private async loadLobbyAdventure(force = false): Promise<void> {
    await this.lobbyAdventureLoader.load(force);
  }

  private async loadLobbyBattleRecent(force = false): Promise<void> {
    await this.lobbyBattleFlow.loadRecentBattles(force);
  }

  private refreshLobbyReadonlyStateAfterBattle(): void {
    const profile = this.currentLobbyProfile();
    void this.loadLobbyProfile(profile.userId);
    void this.loadLobbyAdventure(true);
    void this.loadLobbyHeroRoster(true);
    void this.loadLobbyBattleRecent(true);
  }

  private currentLobbyProfile(): PlayerLobbyProfileVO {
    return this.lobbyProfileLoader.currentProfile();
  }

  private isLobbyProfileLoading(): boolean {
    return this.lobbyProfileLoader.loading;
  }

  private getLobbyProfileError(): string {
    return this.lobbyProfileLoader.error;
  }

  private renderBase(): UiLayout {
    this.setLoginSceneStageVisible(this.isLoginSceneView(this.currentView));
    const layout = this.resolveLayout();
    this.applyRootSize(layout);
    this.layoutKey = this.makeLayoutKey();
    this.setPointerCursor(false);
    this.releaseLobbyVideoRuntime();
    this.statusPresenter.reset();
    // 整页重绘会清空 UI 根；局部 overlay 刷新不要走这个路径。
    this.contentRootController.clear();
    return layout;
  }

  private renderLobbyWorldBase(): UiLayout {
    this.setLoginSceneStageVisible(false);
    const layout = this.resolveLayout();
    this.applyRootSize(layout);
    this.layoutKey = this.makeLayoutKey();
    this.setPointerCursor(false);
    this.statusPresenter.reset();
    // 大厅功能页只替换 HUD/页面层，保留已在播放的大厅 poster/video，避免露出登录背景。
    this.contentRootController.clearExcept(LOBBY_BACKGROUND_NODE_NAMES);
    return layout;
  }

  private renderLobbyBackground(layout: UiLayout): void {
    this.lobbyBackgroundController.render(layout);
  }

  private renderLobbyFeatureSceneBackdrop(layout: UiLayout): void {
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const backdrop = this.addRect('LobbyFeatureSceneBackdrop', centerX, centerY, layout.width, layout.height, new Color(2, 2, 5, 255));
    backdrop.fillColor = new Color(12, 8, 10, 230);
    backdrop.rect(layout.stageLeft - centerX, layout.stageBottom - centerY, layout.stageWidth, layout.stageHeight);
    backdrop.fill();
    backdrop.fillColor = new Color(72, 10, 16, 74);
    backdrop.circle(layout.stageRight - centerX - layout.stageWidth * 0.2, layout.stageTop - centerY - layout.stageHeight * 0.22, Math.min(layout.stageWidth, layout.stageHeight) * 0.42);
    backdrop.fill();
    backdrop.strokeColor = new Color(154, 105, 48, 86);
    backdrop.lineWidth = Math.max(1, 1.4 * layout.uiScale);
    backdrop.moveTo(layout.stageLeft - centerX + 28 * layout.uiScale, layout.stageTop - centerY - 72 * layout.uiScale);
    backdrop.lineTo(layout.stageRight - centerX - 28 * layout.uiScale, layout.stageTop - centerY - 72 * layout.uiScale);
    backdrop.moveTo(layout.stageLeft - centerX + 28 * layout.uiScale, layout.stageBottom - centerY + 70 * layout.uiScale);
    backdrop.lineTo(layout.stageRight - centerX - 28 * layout.uiScale, layout.stageBottom - centerY + 70 * layout.uiScale);
    backdrop.stroke();
  }

  private resizeLobbyBackground(layout: UiLayout): void {
    this.lobbyBackgroundController.resize(layout);
  }

  private tryPlayLobbyVideo(): void {
    this.lobbyBackgroundController.tryPlay();
  }

  private updateLobbyPosterFade(deltaTime: number): void {
    this.lobbyBackgroundController.update(deltaTime);
  }

  private releaseLobbyVideoRuntime(): void {
    this.lobbyBackgroundController.release();
  }

  private isLobbyViewActive(): boolean {
    return this.currentView === 'lobby' || this.isLobbyScenePageView(this.currentView);
  }

  private isLoginSceneView(view: ViewName): boolean {
    return view === 'login' || view === 'loginAccount';
  }

  private setLoginSceneStageVisible(visible: boolean): void {
    // 登录页当前只允许展示 Login_BG_Poster / Login_BG_Video；旧静态舞台层会压住视频，统一关闭。
    for (const nodeName of LOGIN_SCENE_BACKGROUND_NODE_NAMES) {
      const stageNode = this.node.getChildByName(nodeName);
      if (!stageNode) {
        continue;
      }
      stageNode.active = visible;
      if (visible) {
        this.tryPlayLoginSceneVideo(stageNode);
      }
    }
    for (const nodeName of LOGIN_SCENE_LEGACY_NODE_NAMES) {
      const stageNode = this.node.getChildByName(nodeName);
      if (stageNode) {
        stageNode.active = false;
      }
    }
  }

  private tryPlayLoginSceneVideo(node: Node): void {
    for (const background of node.getComponents(LoginVideoBackground)) {
      background.resumeForLoginView();
    }
    for (const video of node.getComponents(VideoPlayer)) {
      try {
        video.mute = true;
        video.volume = 0;
        video.play();
      } catch (error) {
        console.warn('[LootChain] login background video play failed:', error);
      }
    }
    for (const child of node.children) {
      this.tryPlayLoginSceneVideo(child);
    }
  }

  private showLobbyLoadingView(): void {
    this.currentView = 'loading';
    this.renderLoading();
  }

  private refreshLobbyLoadingView(): void {
    if (this.currentView === 'loading') {
      this.renderLoading();
    }
  }

  private setLobbyBackgroundResources(posterFrame: SpriteFrame, videoClip: VideoClip | null): void {
    this.lobbyBackgroundController.setResources(posterFrame, videoClip);
  }

  private enterLobbyView(): void {
    this.currentView = 'lobby';
    this.renderLobby();
  }

  private addLobbyAvatar(parent: Node, x: number, y: number, size: number, displayName: string): void {
    this.lobbyAvatarRenderer.add(parent, x, y, size, displayName);
  }


  private addBeveledPanelNode(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel = 10): Node {
    return this.uiPrimitiveFactory.addBeveledPanelNode(name, x, y, width, height, fill, stroke, bevel);
  }

  private addChildBeveledPanelNode(parent: Node, name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel = 10): Node {
    return this.uiPrimitiveFactory.addChildBeveledPanelNode(parent, name, x, y, width, height, fill, stroke, bevel);
  }

  private addChildPlainNode(parent: Node, name: string, x: number, y: number, width: number, height: number): Node {
    return this.uiPrimitiveFactory.addChildPlainNode(parent, name, x, y, width, height);
  }

  private drawBeveledPanelOnNode(node: Node, width: number, height: number, fill: Color, stroke: Color, bevel: number): Graphics {
    return this.uiPrimitiveFactory.drawBeveledPanelOnNode(node, width, height, fill, stroke, bevel);
  }

  private setLoginInputs(accountInput: EditBox | null, passwordInput: EditBox | null): void {
    this.loginFlow.setInputs(accountInput, passwordInput);
  }

  private setProtagonistNameInput(input: EditBox | null): void {
    this.protagonistCreateFlow.setNameInput(input);
  }

  private openLoginAccountScene(): void {
    this.renderLoginAccountScene();
  }

  private submitLogin(): void {
    this.run(() => this.loginFlow.login());
  }

  private toggleLoginAgreement(): void {
    this.loginFlow.toggleAgreement();
    this.renderLoginAccountScene();
  }

  private showProtagonistCreateView(): void {
    this.renderProtagonistCreate();
  }

  private handleLoginSuccess(userId: number, tokenName: string): void {
    this.protagonistCreateFlow.handleLoginSuccess(userId, tokenName);
  }

  private selectProtagonistGender(gender: ProtagonistGender): void {
    this.protagonistCreateFlow.selectGender(gender);
  }

  private previewProtagonistForm(form: ProtagonistForm): void {
    this.protagonistCreateFlow.previewForm(form);
  }

  private submitProtagonistCreate(): void {
    this.protagonistCreateFlow.submitCreate();
  }

  private setApiBaseUrl(baseUrl: string): void {
    this.api.setApiBaseUrl(baseUrl);
  }

  private resetLobbyProfileForLogin(userId: number): void {
    // 切换登录用户时必须清空上一位玩家资料，防止大厅左上角短暂显示旧数据。
    this.lobbyProfileLoader.resetForLogin(userId);
    this.lobbyAdventureLoader.resetForLogin();
    this.lobbyBattleFlow.resetForLogin();
    this.lobbyCodexLoader.resetForLogin();
    this.lobbyHeroRosterLoader.resetForLogin();
    this.lobbyNoticeLoader.resetForLogin();
    this.selectedLobbyStageCode = null;
    this.selectedLobbyFormationHeroIds = [];
    this.lobbyProfileOpen = false;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyPlaceholderDialog = null;
  }

  private loadLobbyProfileAfterLogin(userId: number): void {
    void this.loadLobbyProfile(userId);
    void this.loadLobbyNotices();
    void this.loadLobbyAdventure();
    void this.loadLobbyBattleRecent();
  }

  private startLobbyLoading(tokenName: string): void {
    this.lobbyLoadingFlow.start(tokenName);
  }

  private currentProtagonistCreateState(): ProtagonistCreateFormState {
    return this.protagonistCreateFlow.currentState();
  }

  private retryLobbyLoading(): void {
    this.lobbyLoadingFlow.retry(this.loginFlow.lastTokenName);
  }

  private addStatus(text: string, layout?: UiLayout, y?: number): void {
    this.statusPresenter.add(text, layout, y);
  }

  private setStatus(text: string): void {
    this.statusPresenter.set(text);
  }

  private addLabel(text: string, x: number, y: number, size = 20, color = new Color(230, 230, 230), contentSize?: Size): Label {
    return this.uiPrimitiveFactory.addLabel(text, x, y, size, color, contentSize);
  }

  private addEditBox(initialText: string, x: number, y: number, width: number, layout?: UiLayout, password = false): EditBox {
    return this.uiPrimitiveFactory.addEditBox(initialText, x, y, width, layout, password);
  }

  private applyPasswordMask(editBox: EditBox, textLabel: Label): void {
    this.uiPrimitiveFactory.applyPasswordMask(editBox, textLabel);
  }

  private addFramedEditBox(initialText: string, x: number, y: number, width: number, layout: UiLayout, password = false): EditBox {
    return this.uiPrimitiveFactory.addFramedEditBox(initialText, x, y, width, layout, password);
  }

  private addButton(text: string, x: number, y: number, callback: () => void, layout?: UiLayout, width?: number, height?: number): Button {
    return this.uiPrimitiveFactory.addButton(text, x, y, callback, layout, width, height);
  }

  private addGoldButton(text: string, x: number, y: number, callback: () => void, layout: UiLayout, width: number, height: number): Button {
    return this.uiPrimitiveFactory.addGoldButton(text, x, y, callback, layout, width, height);
  }

  private addImageButton(
    name: string,
    assetPath: string,
    text: string,
    x: number,
    y: number,
    callback: () => void,
    layout: UiLayout,
    width: number,
    height: number,
    fontSize: number,
  ): Button {
    return this.uiPrimitiveFactory.addImageButton(name, assetPath, text, x, y, callback, layout, width, height, fontSize);
  }

  private addSprite(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null {
    return this.uiPrimitiveFactory.addSprite(name, assetPath, x, y, width, height, parent);
  }

  private addChildLabel(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    size: number,
    color: Color,
    contentSize: Size,
    horizontalAlign: HorizontalTextAlignment = HorizontalTextAlignment.CENTER,
  ): Label {
    return this.uiPrimitiveFactory.addChildLabel(parent, name, text, x, y, size, color, contentSize, horizontalAlign);
  }

  private resolveAlignedLabelX(x: number, width: number, horizontalAlign: HorizontalTextAlignment): number {
    return this.uiPrimitiveFactory.resolveAlignedLabelX(x, width, horizontalAlign);
  }

  private addAccountGlyph(parent: Node, x: number, y: number, scale: number): void {
    this.uiPrimitiveFactory.addAccountGlyph(parent, x, y, scale);
  }

  private addRect(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke?: Color, lineWidth = 1): Graphics {
    return this.uiPrimitiveFactory.addRect(name, x, y, width, height, fill, stroke, lineWidth);
  }

  private addBeveledPanel(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel = 10): Graphics {
    return this.uiPrimitiveFactory.addBeveledPanel(name, x, y, width, height, fill, stroke, bevel);
  }

  private addProgressBar(x: number, y: number, width: number, height: number, progress: number): void {
    this.uiPrimitiveFactory.addProgressBar(x, y, width, height, progress);
  }

  private applyButtonVisual(node: Node, width: number, height: number): void {
    this.uiPrimitiveFactory.applyButtonVisual(node, width, height);
  }

  private applyImageButtonFeedback(node: Node, hoverScale = 1.035, pressedScale = 0.975): void {
    this.uiPrimitiveFactory.applyImageButtonFeedback(node, hoverScale, pressedScale);
  }

  private applyPointerCursor(node: Node): void {
    this.uiPrimitiveFactory.applyPointerCursor(node);
  }

  private setPointerCursor(enabled: boolean): void {
    const maybeDocument = (globalThis as { document?: CursorDocument }).document;
    const style = maybeDocument?.body?.style;
    if (style) {
      style.cursor = enabled ? 'pointer' : '';
    }
  }

  private preloadUiSprites(): void {
    this.uiSpriteFrameCache.preload(this.uiSpriteFrameOverrides());
  }

  private uiSpriteFrameOverrides(): UiSpriteFrameOverrides {
    return {
      logoFrame: this.logoFrame,
      mainButtonFrame: this.mainButtonFrame,
      rightRailFrames: this.rightRailFrames,
    };
  }

  private drawButtonFrame(graphics: Graphics, width: number, height: number, state: ButtonVisualState): void {
    this.uiPrimitiveFactory.drawButtonFrame(graphics, width, height, state);
  }

  private createUiNode(name: string): Node {
    return this.contentRootController.createNode(name);
  }

  private removeNodeFromContent(name: string): void {
    this.contentRootController.removeNode(name);
  }

  private ensureContentRoot(): Node {
    return this.contentRootController.ensure();
  }

  private run(action: AsyncAction): void {
    this.setStatus('请求中...');
    action().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(message);
    });
  }

  private formatInteger(value: number | null | undefined): string {
    return formatUiInteger(value);
  }

  private compactResourceValue(value: number | null | undefined): string {
    return compactUiResourceValue(value);
  }

  private trimText(text: string): string {
    return trimUiText(text);
  }

  private resolveLayout(): UiLayout {
    return this.layoutResolver.resolve();
  }

  private applyRootSize(layout: UiLayout): void {
    this.contentRootController.applyRootSize(layout);
  }

  private makeLayoutKey(): string {
    const layout = this.resolveLayout();
    const stageKey = `${Math.round(layout.stageLeft)},${Math.round(layout.stageBottom)},${Math.round(layout.stageWidth)}x${Math.round(layout.stageHeight)}`;
    // Cocos Preview 在固定设计分辨率下可能只改变浏览器物理视口，必须纳入 key 才会重排 HUD。
    const viewportKey = `${Math.round(layout.viewportWidth)}x${Math.round(layout.viewportHeight)}`;
    return `${this.currentView}:${layout.width}x${layout.height}:${viewportKey}:${stageKey}:${this.loginFlow.agreementAccepted ? 'agree' : 'deny'}:${this.protagonistCreateFlow.version}:${this.lobbyProfileOpen ? 'profile-open' : 'profile-closed'}:${this.lobbyAdventurePanelOpen ? 'adventure-open' : 'adventure-closed'}:${this.lobbyAdventureLoader.version}:${this.selectedLobbyStageCode}:${this.lobbyBattlePreviewPanelOpen ? 'battle-open' : 'battle-closed'}:${this.lobbyBattleFlow.currentState().version}:${this.lobbyCodexPanelOpen ? 'codex-open' : 'codex-closed'}:${this.lobbyCodexLoader.version}:${this.lobbyFormationPanelOpen ? 'formation-open' : 'formation-closed'}:${this.selectedLobbyFormationHeroIds.join(',')}:${this.lobbyHeroRosterPanelOpen ? 'heroes-open' : 'heroes-closed'}:${this.lobbyHeroDetailHeroId ?? 'detail-closed'}:${this.lobbyHeroRosterLoader.version}:${this.lobbyNoticePanelOpen ? 'notice-open' : 'notice-closed'}:${this.lobbyNoticeLoader.version}:${this.currentView === 'gacha' ? 'gacha-open' : 'gacha-closed'}:${this.gachaResultMode ?? 'gacha-result-closed'}:${this.lobbyPlaceholderDialog ? 'placeholder-open' : 'placeholder-closed'}`;
  }

  private resolveLobbyStageCode(stageCode?: string | null): string | null {
    const value = (stageCode ?? '').trim().toUpperCase();
    return /^MAIN_\d+_\d+$/.test(value) ? value : null;
  }

  private findLobbyAdventureStage(stageCode: string): LobbyAdventureStageVO | null {
    const adventure = this.lobbyAdventureLoader.currentState().adventure;
    if (!adventure) {
      return null;
    }
    return adventure.chapters
      .flatMap((chapter) => chapter.stages)
      .find((stage) => stage.stageCode === stageCode) ?? null;
  }

  private selectableLobbyHeroes(): LobbyHeroItemVO[] {
    return this.lobbyHeroRosterLoader.currentState().heroes
      .filter((hero) => hero.id > 0 && hero.rarity.toUpperCase() !== 'EX' && !hero.heroCode.toUpperCase().startsWith('EX_'));
  }

  private resolveLobbyFormationHeroIds(): number[] {
    const normalized = this.normalizeLobbyFormationHeroIds(this.selectedLobbyFormationHeroIds);
    if (normalized.length > 0) {
      return normalized;
    }
    return this.defaultLobbyFormationHeroIds();
  }

  private defaultLobbyFormationHeroIds(): number[] {
    return [...this.selectableLobbyHeroes()]
      .sort((a, b) => Number(b.protagonist) - Number(a.protagonist) || b.power - a.power)
      .slice(0, 5)
      .map((hero) => hero.id);
  }

  private normalizeLobbyFormationHeroIds(heroIds: number[]): number[] {
    const heroes = this.selectableLobbyHeroes();
    const byId = new Map(heroes.map((hero) => [hero.id, hero]));
    const protagonist = heroes.find((hero) => hero.protagonist);
    const normalized: number[] = [];
    if (protagonist) {
      normalized.push(protagonist.id);
    }
    for (const heroId of heroIds) {
      if (normalized.length >= 5) {
        break;
      }
      if (byId.has(heroId) && !normalized.includes(heroId)) {
        normalized.push(heroId);
      }
    }
    return normalized.slice(0, 5);
  }

  private reconcileLobbyFormationSelection(): boolean {
    const before = this.selectedLobbyFormationHeroIds.join(',');
    this.selectedLobbyFormationHeroIds = this.normalizeLobbyFormationHeroIds(this.selectedLobbyFormationHeroIds);
    if (this.selectedLobbyFormationHeroIds.length === 0) {
      this.selectedLobbyFormationHeroIds = this.defaultLobbyFormationHeroIds();
    }
    return before !== this.selectedLobbyFormationHeroIds.join(',');
  }

  private rejectInvalidLobbyStageSelection(): void {
    // 关卡丢失或非法时必须回到冒险选择，避免未来多关卡阶段误打默认 MAIN_1_1。
    this.selectedLobbyStageCode = null;
    this.setStatus('关卡选择已失效，请重新选择主线关卡。');
    if (this.currentView === 'lobby') {
      this.openLobbyAdventurePanel();
    }
  }
}
