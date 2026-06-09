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
import { lootChainI18n, type LootChainLanguage } from '../i18n/LootChainI18n';
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
import { GachaSceneRenderer, type GachaPreviewResultMode, type GachaSceneHost, type GachaSceneState } from './gacha/GachaSceneRenderer';
import { GACHA_PREVIEW_POOLS, type GachaActionKey, type GachaPreviewPool, type GachaRarity } from './gacha/GachaSceneConfig';
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
import { LobbyBagLoader, type LobbyBagLoaderHost } from './lobby/LobbyBagLoader';
import { LobbyBagPanelRenderer, type LobbyBagPanelHost } from './lobby/LobbyBagPanelRenderer';
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
import { LobbySettingsPanelRenderer, type LobbySettingsPanelHost } from './lobby/LobbySettingsPanelRenderer';
import type { LobbyAdventurePanelState, LobbyAdventureStageVO } from '../types/LobbyAdventureTypes';
import type { LobbyBagPanelState } from '../types/BagTypes';
import type { LobbyBattlePanelState } from './lobby/LobbyBattleState';
import type { LobbyCodexPanelState } from '../types/LobbyCodexTypes';
import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../types/LobbyHeroTypes';
import type { LobbyNoticePanelState } from '../types/LobbyNoticeTypes';
import type { GachaDrawResultVO, GachaPoolVO } from '../types/GachaTypes';
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
  | 'bag'
  | 'battle'
  | 'codex'
  | 'formation'
  | 'heroes'
  | 'heroDetail'
  | 'notice'
  | 'settings'
  | 'gacha'
  | 'gachaInfo'
  | 'gachaRecord'
  | 'gachaExchange'
  | 'gachaPoolContent'
  | 'gachaReveal'
  | 'gachaSummon'
  | 'gachaResult'
  | 'placeholder';
type LobbyPlaceholderDialogState = {
  title: string;
  detail: string;
};
type PendingGachaDraw = {
  ticket: number;
  mode: GachaPreviewResultMode;
  poolCode: string;
  drawCount: 1 | 10;
  requestId: string;
  result: GachaDrawResultVO | null;
  highestRarity: GachaRarity | null;
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
  private readonly lobbyBagLoader = new LobbyBagLoader(this.api.bag, this.api.hero, this as unknown as LobbyBagLoaderHost);
  private readonly lobbyBagPanelRenderer = new LobbyBagPanelRenderer(this as unknown as LobbyBagPanelHost);
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
  private readonly lobbySettingsPanelRenderer = new LobbySettingsPanelRenderer(this as unknown as LobbySettingsPanelHost);
  private currentView: ViewName = 'login';
  private layoutKey = '';
  private lobbyProfileOpen = false;
  private lobbyAdventurePanelOpen = false;
  private lobbyBagPanelOpen = false;
  private lobbyBattlePreviewPanelOpen = false;
  private lobbyCodexPanelOpen = false;
  private lobbyFormationPanelOpen = false;
  private lobbyHeroDetailHeroId: number | null = null;
  private lobbyHeroRosterPanelOpen = false;
  private lobbyNoticePanelOpen = false;
  private lobbySettingsPanelOpen = false;
  private loginLanguageDialogOpen = false;
  private lobbyPlaceholderDialog: LobbyPlaceholderDialogState | null = null;
  private gachaResultMode: GachaPreviewResultMode | null = null;
  private pendingGachaDraw: PendingGachaDraw | null = null;
  private gachaSummonRarity: GachaRarity | null = null;
  private gachaSummonTicket = 0;
  private gachaConfigRefreshElapsed = 0;
  private gachaSceneState: GachaSceneState = {
    loading: false,
    drawing: false,
    error: null,
    pools: GACHA_PREVIEW_POOLS,
    selectedPoolCode: GACHA_PREVIEW_POOLS[0]?.id ?? null,
    pity: [],
    poolDetail: null,
    poolDetailLoading: false,
    poolDetailError: '',
    logs: [],
    logsLoading: false,
    logsError: '',
    lastDrawResult: null,
    activeAction: null,
  };
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
    this.updateGachaConfigRefresh(deltaTime);
    this.updateLobbyPosterFade(deltaTime);
  }

  onDestroy(): void {
    input.off(Input.EventType.MOUSE_DOWN, this.tryPlayLobbyVideo, this);
    input.off(Input.EventType.TOUCH_START, this.tryPlayLobbyVideo, this);
    this.loginFlow.cancel();
    this.protagonistCreateFlow.cancel();
    this.lobbyLoadingFlow.cancel();
    this.lobbyAdventureLoader.cancel();
    this.lobbyBagLoader.cancel();
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
    if (this.currentView === 'gachaReveal') {
      this.renderGachaRevealScene();
      return;
    }
    if (this.currentView === 'gachaSummon') {
      this.renderGachaSummonVideoScene();
      return;
    }
    if (this.currentView === 'gachaResult') {
      this.renderGachaResultScene();
      return;
    }
    if (this.isGachaActionSceneView(this.currentView)) {
      this.renderGachaActionScene();
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
    this.renderLoginLanguageDialog(layout);
  }

  private renderLoginAccountScene(): void {
    this.currentView = 'loginAccount';
    this.loginLanguageDialogOpen = false;
    const layout = this.renderBase();
    this.loginRenderer.renderLoginAccountScene(layout, {
      agreementAccepted: this.loginFlow.agreementAccepted,
      defaultDevUserId: this.loginFlow.defaultDevUserId,
    });
  }

  private renderLoginLanguageDialog(layout: UiLayout): void {
    if (!this.loginLanguageDialogOpen) {
      return;
    }
    const scale = Math.max(0.72, Math.min(1, layout.uiScale));
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageBottom + layout.stageTop) / 2;
    const dim = this.addRect('LoginLanguageDialogDim', centerX, centerY, layout.width, layout.height, new Color(0, 0, 0, 184));
    dim.node.addComponent(BlockInputEvents);
    dim.node.addComponent(Button);
    dim.node.on(Button.EventType.CLICK, () => this.closeLoginLanguageDialog());

    const panelWidth = Math.min(layout.stageWidth - 40 * scale, 460 * scale);
    const panelHeight = 320 * scale;
    const panel = this.addBeveledPanelNode(
      'LoginLanguageDialogPanel',
      centerX,
      centerY,
      panelWidth,
      panelHeight,
      new Color(13, 11, 10, 244),
      new Color(204, 158, 80, 230),
      18 * scale,
    );
    panel.addComponent(BlockInputEvents);

    const closeButton = this.addChildBeveledPanelNode(
      panel,
      'LoginLanguageDialogClose',
      panelWidth / 2 - 34 * scale,
      panelHeight / 2 - 32 * scale,
      42 * scale,
      32 * scale,
      new Color(34, 25, 24, 238),
      new Color(204, 158, 80, 210),
      8 * scale,
    );
    closeButton.addComponent(Button);
    closeButton.on(Button.EventType.CLICK, () => this.closeLoginLanguageDialog());
    this.applyImageButtonFeedback(closeButton, 1.04, 0.96);
    this.addChildLabel(closeButton, 'CloseLabel', 'X', 0, 0, 18 * scale, new Color(245, 210, 122), new Size(38 * scale, 24 * scale));

    const title = this.addChildLabel(
      panel,
      'LoginLanguageDialogTitle',
      lootChainI18n.t('language.title'),
      0,
      panelHeight / 2 - 58 * scale,
      28 * scale,
      new Color(245, 210, 122),
      new Size(panelWidth - 96 * scale, 40 * scale),
    );
    title.enableOutline = true;
    title.outlineColor = new Color(0, 0, 0, 220);
    title.outlineWidth = Math.max(1, 1.5 * scale);

    const subtitle = this.addChildLabel(
      panel,
      'LoginLanguageDialogSubtitle',
      lootChainI18n.t('language.subtitle'),
      0,
      panelHeight / 2 - 96 * scale,
      17 * scale,
      new Color(196, 178, 138),
      new Size(panelWidth - 80 * scale, 28 * scale),
    );
    subtitle.overflow = Label.Overflow.SHRINK;

    const currentLanguage = lootChainI18n.currentLanguage();
    this.renderLoginLanguageOption(panel, 'zh-CN', -56 * scale, currentLanguage, panelWidth, scale);
    this.renderLoginLanguageOption(panel, 'en-US', -126 * scale, currentLanguage, panelWidth, scale);

    this.addChildLabel(
      panel,
      'LoginLanguageDialogTip',
      '点击空白关闭',
      0,
      -panelHeight / 2 + 26 * scale,
      14 * scale,
      new Color(132, 119, 94),
      new Size(panelWidth - 70 * scale, 22 * scale),
    );
  }

  private renderLoginLanguageOption(
    panel: Node,
    language: LootChainLanguage,
    y: number,
    currentLanguage: LootChainLanguage,
    panelWidth: number,
    scale: number,
  ): void {
    const selected = language === currentLanguage;
    const optionWidth = panelWidth - 92 * scale;
    const option = this.addChildBeveledPanelNode(
      panel,
      `LoginLanguageOption_${language}`,
      0,
      y,
      optionWidth,
      52 * scale,
      selected ? new Color(61, 44, 19, 242) : new Color(23, 18, 17, 238),
      selected ? new Color(245, 210, 122, 238) : new Color(119, 91, 54, 210),
      10 * scale,
    );
    option.addComponent(Button);
    option.on(Button.EventType.CLICK, () => this.selectLoginLanguage(language));
    this.applyImageButtonFeedback(option, 1.02, 0.98);

    const labelKey = language === 'zh-CN' ? 'language.simplifiedChinese' : 'language.english';
    this.addChildLabel(
      option,
      'LanguageName',
      lootChainI18n.t(labelKey),
      -optionWidth / 2 + 24 * scale,
      0,
      19 * scale,
      new Color(238, 218, 166),
      new Size(optionWidth - 76 * scale, 32 * scale),
      HorizontalTextAlignment.LEFT,
    );
    if (selected) {
      this.addChildLabel(
        option,
        'SelectedMark',
        lootChainI18n.t('language.current'),
        optionWidth / 2 - 74 * scale,
        0,
        15 * scale,
        new Color(245, 210, 122),
        new Size(116 * scale, 28 * scale),
      );
    }
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
    // 抽奖页读取后端卡池展示配置；真实抽卡只通过已有 gacha draw 接口触发。
    this.gachaSceneRenderer.render(layout, this.gachaSceneState);
  }

  private renderGachaRevealScene(): void {
    this.currentView = 'gachaReveal';
    const layout = this.renderBase();
    // 召唤演出同样只消费本地 mock 数据，不生成 drawNo、不扣资源、不发奖。
    this.gachaSceneRenderer.renderRevealScene(layout, this.gachaResultMode ?? 'once');
  }

  private renderGachaSummonVideoScene(): void {
    this.currentView = 'gachaSummon';
    const layout = this.renderBase();
    this.gachaSceneRenderer.renderSummonVideoScene(layout, this.gachaResultMode ?? 'once', this.gachaSummonRarity);
  }

  private renderGachaResultScene(): void {
    this.currentView = 'gachaResult';
    const layout = this.renderBase();
    this.gachaSceneRenderer.renderResultScene(layout, this.gachaResultMode ?? 'once', this.gachaSceneState);
  }

  private renderGachaActionScene(): void {
    const action = this.gachaActionForView(this.currentView);
    if (!action) {
      this.currentView = 'gacha';
      this.renderGachaScene();
      return;
    }
    const layout = this.renderBase();
    this.gachaSceneRenderer.renderActionScene(layout, this.gachaSceneState, action);
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
    if (this.currentView === 'bag') {
      this.renderLobbyBagPanel(layout);
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
    if (this.currentView === 'settings') {
      this.renderLobbySettingsPanel(layout);
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
    this.removeLobbyBagPanel();
    this.removeLobbyBattlePreviewPanel();
    this.removeLobbyCodexPanel();
    this.removeLobbyFormationPanel();
    this.removeLobbyHeroDetailPanel();
    this.removeLobbyHeroRosterPanel();
    this.removeLobbyNoticePanel();
    this.removeLobbySettingsPanel();
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

  private renderLobbyBagPanel(layout: UiLayout): void {
    this.lobbyBagPanelRenderer.render(layout);
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

  private renderLobbySettingsPanel(layout: UiLayout): void {
    this.lobbySettingsPanelRenderer.render(layout);
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
      dialog.title,
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
      || view === 'bag'
      || view === 'codex'
      || view === 'formation'
      || view === 'heroes'
      || view === 'heroDetail'
      || view === 'notice'
      || view === 'settings'
      || view === 'placeholder';
  }

  private returnToLobbyFromScenePage(): void {
    this.lobbyProfileOpen = false;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBagPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbySettingsPanelOpen = false;
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
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbySettingsPanelOpen = false;
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
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbySettingsPanelOpen = false;
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

  private openLobbyBagPanel(): void {
    this.lobbyBagPanelOpen = true;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbySettingsPanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'bag';
    this.renderCurrentView();
    void this.loadLobbyBag();
  }

  private closeLobbyBagPanel(): void {
    if (!this.lobbyBagPanelOpen) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removeLobbyBagPanel(): void {
    this.removeNodeFromContent('LobbyBagDim');
    this.removeNodeFromContent('LobbyBagSceneContent');
    this.removeNodeFromContent('LobbyBagSceneFrame');
  }

  private reloadLobbyBag(): void {
    void this.loadLobbyBag(true);
  }

  private currentLobbyBagState(): LobbyBagPanelState {
    return this.lobbyBagLoader.currentState();
  }

  private selectLobbyBagItem(itemCode: string): void {
    if (!this.lobbyBagLoader.selectItem(itemCode)) {
      this.setStatus('该道具不在当前背包列表中。');
      return;
    }
    void this.loadLobbyBagItemSource(itemCode);
  }

  private reloadLobbyBagItemSource(itemCode: string): void {
    void this.loadLobbyBagItemSource(itemCode, true);
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
    this.lobbyBagPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbySettingsPanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.removePlayerProfileDialog();
    this.removeLobbyAdventurePanel();
    this.removeLobbyBagPanel();
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
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = true;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbySettingsPanelOpen = false;
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
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbySettingsPanelOpen = false;
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
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbySettingsPanelOpen = false;
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
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyProfileOpen = false;
    this.lobbySettingsPanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'notice';
    this.renderCurrentView();
    void this.loadLobbyNotices();
  }

  private openLobbyGachaScene(): void {
    this.lobbyProfileOpen = false;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbySettingsPanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.gachaResultMode = null;
    this.pendingGachaDraw = null;
    this.gachaSummonRarity = null;
    this.gachaSummonTicket += 1;
    this.gachaConfigRefreshElapsed = 0;
    this.gachaSceneState = { ...this.gachaSceneState, activeAction: null };
    this.currentView = 'gacha';
    this.renderCurrentView();
    this.setStatus('正在读取召唤卡池配置。');
    void this.loadGachaPools(true);
  }

  private selectGachaPool(poolCode: string): void {
    const pool = this.gachaSceneState.pools.find((item) => item.poolCode === poolCode || item.id === poolCode);
    if (!pool) {
      this.setStatus('该卡池配置不存在，请刷新召唤页。');
      return;
    }
    this.gachaSceneState = {
      ...this.gachaSceneState,
      selectedPoolCode: pool.poolCode ?? pool.id,
      lastDrawResult: null,
      poolDetail: null,
      poolDetailError: '',
      logs: [],
      logsError: '',
      error: null,
      activeAction: null,
    };
    this.renderCurrentView();
    this.setStatus(pool.noticeText ?? `${pool.title} 已选中。`);
    if (!pool.locked && !pool.previewOnly && pool.drawEnabled !== false) {
      void this.loadGachaPity(pool.poolCode ?? pool.id);
    }
  }

  private openGachaActionScene(action: GachaActionKey): void {
    const pool = this.gachaSceneState.pools.find((item) => item.poolCode === this.gachaSceneState.selectedPoolCode || item.id === this.gachaSceneState.selectedPoolCode);
    const poolCode = pool?.poolCode ?? pool?.id ?? this.gachaSceneState.selectedPoolCode;
    if (!poolCode) {
      this.setStatus('当前没有可读取的召唤卡池。');
      return;
    }
    this.currentView = 'gacha';
    this.gachaSceneState = { ...this.gachaSceneState, activeAction: action };
    this.renderCurrentView();
    if (action === 'record') {
      void this.loadGachaLogs(true);
      return;
    }
    void this.loadGachaPoolDetail(poolCode, true);
    if (action === 'info' && !pool?.locked && !pool?.previewOnly && pool?.drawEnabled !== false) {
      void this.loadGachaPity(poolCode);
    }
  }

  private closeGachaActionScene(): void {
    if (!this.gachaSceneState.activeAction && !this.isGachaActionSceneView(this.currentView)) {
      return;
    }
    this.gachaSceneState = { ...this.gachaSceneState, activeAction: null };
    this.currentView = 'gacha';
    this.renderCurrentView();
  }

  private async loadGachaPools(force = false): Promise<void> {
    if (this.gachaSceneState.loading && !force) {
      return;
    }
    this.gachaSceneState = { ...this.gachaSceneState, loading: true, error: null };
    if (this.currentView === 'gacha') {
      this.renderCurrentView();
    }
    try {
      const pools = (await this.api.gacha.pools())
        .map((pool) => this.toGachaPreviewPool(pool))
        .filter((pool) => this.isVisibleGachaPool(pool));
      const selectedPoolCode = pools.find((pool) => pool.poolCode === this.gachaSceneState.selectedPoolCode || pool.id === this.gachaSceneState.selectedPoolCode)?.poolCode
        ?? pools.find((pool) => !pool.locked && !pool.previewOnly && pool.drawEnabled !== false)?.poolCode
        ?? pools[0]?.poolCode
        ?? pools[0]?.id
        ?? null;
      this.gachaSceneState = {
        ...this.gachaSceneState,
        loading: false,
        pools: pools.length > 0 ? pools : GACHA_PREVIEW_POOLS,
        selectedPoolCode,
      };
      if (this.currentView === 'gacha' || this.isGachaActionSceneView(this.currentView)) {
        this.renderCurrentView();
      }
      const selectedPool = this.gachaSceneState.pools.find((pool) => pool.poolCode === selectedPoolCode || pool.id === selectedPoolCode);
      if (selectedPoolCode && selectedPool && !selectedPool.locked && !selectedPool.previewOnly && selectedPool.drawEnabled !== false) {
        void this.loadGachaPity(selectedPoolCode);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.gachaSceneState = {
        ...this.gachaSceneState,
        loading: false,
        error: message,
        pools: GACHA_PREVIEW_POOLS,
      };
      if (this.currentView === 'gacha' || this.isGachaActionSceneView(this.currentView)) {
        this.renderCurrentView();
      }
      this.setStatus(`召唤卡池读取失败，已使用本地展示兜底：${message}`);
    }
  }

  private async loadGachaPity(poolCode: string): Promise<void> {
    try {
      const pity = await this.api.gacha.pity(poolCode);
      if (this.gachaSceneState.selectedPoolCode !== poolCode) {
        return;
      }
      this.gachaSceneState = { ...this.gachaSceneState, pity };
      if (this.currentView === 'gacha') {
        this.renderCurrentView();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.gachaSceneState = { ...this.gachaSceneState, pity: [], error: message };
      this.setStatus(`保底信息读取失败：${message}`);
    }
  }

  private async loadGachaPoolDetail(poolCode: string, force = false): Promise<void> {
    if (this.gachaSceneState.poolDetailLoading && !force) {
      return;
    }
    this.gachaSceneState = {
      ...this.gachaSceneState,
      poolDetailLoading: true,
      poolDetailError: '',
    };
    if (this.isGachaActionSceneView(this.currentView)) {
      this.renderCurrentView();
    }
    try {
      const detail = await this.api.gacha.poolDetail(poolCode);
      if (this.gachaSceneState.selectedPoolCode !== poolCode) {
        return;
      }
      this.gachaSceneState = {
        ...this.gachaSceneState,
        poolDetail: detail,
        poolDetailLoading: false,
        poolDetailError: '',
      };
      if (this.currentView === 'gacha' || this.isGachaActionSceneView(this.currentView)) {
        this.renderCurrentView();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.gachaSceneState = {
        ...this.gachaSceneState,
        poolDetailLoading: false,
        poolDetailError: message,
      };
      if (this.currentView === 'gacha' || this.isGachaActionSceneView(this.currentView)) {
        this.renderCurrentView();
      }
      this.setStatus(`卡池详情读取失败：${message}`);
    }
  }

  private async loadGachaLogs(force = false): Promise<void> {
    if (this.gachaSceneState.logsLoading && !force) {
      return;
    }
    const poolCode = this.gachaSceneState.selectedPoolCode ?? undefined;
    this.gachaSceneState = {
      ...this.gachaSceneState,
      logsLoading: true,
      logsError: '',
    };
    if (this.currentView === 'gacha' || this.currentView === 'gachaRecord') {
      this.renderCurrentView();
    }
    try {
      const page = await this.api.gacha.logs(1, 30, poolCode);
      this.gachaSceneState = {
        ...this.gachaSceneState,
        logs: page.records ?? [],
        logsLoading: false,
        logsError: '',
      };
      if (this.currentView === 'gacha' || this.currentView === 'gachaRecord') {
        this.renderCurrentView();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.gachaSceneState = {
        ...this.gachaSceneState,
        logsLoading: false,
        logsError: message,
      };
      if (this.currentView === 'gacha' || this.currentView === 'gachaRecord') {
        this.renderCurrentView();
      }
      this.setStatus(`召唤记录读取失败：${message}`);
    }
  }

  private toGachaPreviewPool(pool: GachaPoolVO): GachaPreviewPool {
    const theme = (pool.themeColor ?? '').toLowerCase();
    const displayType = (pool.displayType ?? pool.poolType ?? '').toUpperCase();
    const rarity: GachaRarity = theme === 'red' || displayType === 'LIMITED'
      ? 'SSR'
      : theme === 'blue' || displayType === 'NORMAL'
        ? 'R'
        : displayType === 'LOCKED'
          ? 'UR'
          : 'SR';
    const title = this.trimText(pool.tabTitle || pool.poolName || pool.poolCode).slice(0, 24);
    return {
      id: pool.poolCode,
      poolCode: pool.poolCode,
      poolType: pool.poolType ?? null,
      displayType: pool.displayType ?? null,
      title,
      subline: this.trimText(pool.tabSubtitle || pool.poolType || '召唤卡池').slice(0, 40),
      rarity,
      active: pool.poolCode === this.gachaSceneState.selectedPoolCode,
      locked: Boolean(pool.locked) || pool.status !== 1,
      drawEnabled: pool.drawEnabled !== false && !pool.previewOnly && pool.status === 1,
      previewOnly: Boolean(pool.previewOnly),
      logoAsset: pool.logoAsset ?? null,
      tabLogoAsset: pool.tabLogoAsset ?? null,
      logoText: pool.badgeText ?? (displayType === 'LIMITED' ? 'UP' : displayType === 'HERO' ? 'H' : displayType === 'NORMAL' ? 'N' : '锁'),
      themeColor: pool.themeColor ?? null,
      badgeText: pool.badgeText ?? null,
      centerSpineResource: pool.centerSpineResource ?? null,
      centerSpineUuid: pool.centerSpineUuid ?? null,
      centerSpineSkin: pool.centerSpineSkin ?? null,
      centerIntroAnimation: pool.centerIntroAnimation ?? null,
      centerIdleAnimation: pool.centerIdleAnimation ?? null,
      rateNote: pool.rateNote ?? null,
      recordNote: pool.recordNote ?? null,
      exchangeNote: pool.exchangeNote ?? null,
      guaranteeNote: pool.guaranteeNote ?? null,
      buttonSingleText: pool.buttonSingleText ?? null,
      buttonTenText: pool.buttonTenText ?? null,
      buttonDisabledReason: pool.buttonDisabledReason ?? null,
      noticeText: pool.noticeText ?? null,
      singleCost: pool.singleCost ?? null,
      tenCost: pool.tenCost ?? null,
      costCode: pool.costCode ?? null,
    };
  }

  private isVisibleGachaPool(pool: GachaPreviewPool): boolean {
    const poolCode = (pool.poolCode ?? pool.id).toUpperCase();
    const theme = (pool.themeColor ?? '').toLowerCase();
    const displayType = (pool.displayType ?? '').toUpperCase();
    return poolCode !== 'SEALED_LIGHT_DARK' && displayType !== 'LOCKED' && theme !== 'locked';
  }

  private createGachaRequestId(poolCode: string, drawCount: 1 | 10): string {
    const random = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
    return `cocos-${poolCode}-${drawCount}-${Date.now()}-${random}`;
  }

  private startGachaDraw(mode: GachaPreviewResultMode): void {
    if (this.gachaSceneState.drawing || this.pendingGachaDraw) {
      this.setStatus('召唤请求处理中，请勿重复点击。');
      return;
    }
    const pool = this.gachaSceneState.pools.find((item) => item.poolCode === this.gachaSceneState.selectedPoolCode || item.id === this.gachaSceneState.selectedPoolCode);
    if (!pool || !pool.poolCode) {
      this.setStatus('当前卡池缺少真实 poolCode，无法召唤。');
      return;
    }
    if (pool.locked || pool.previewOnly || pool.drawEnabled === false) {
      this.setStatus(pool.buttonDisabledReason ?? '该卡池暂未开放真实抽卡。');
      return;
    }
    const drawCount: 1 | 10 = mode === 'ten' ? 10 : 1;
    const ticket = this.gachaSummonTicket + 1;
    this.gachaSummonTicket = ticket;
    const requestId = this.createGachaRequestId(pool.poolCode, drawCount);
    this.pendingGachaDraw = { ticket, mode, poolCode: pool.poolCode, drawCount, requestId, result: null, highestRarity: null };
    this.gachaSummonRarity = null;
    this.gachaResultMode = mode;
    this.gachaSceneState = { ...this.gachaSceneState, drawing: true, lastDrawResult: null, error: null, activeAction: null };
    this.renderCurrentView();
    this.setStatus('召唤请求提交中，正在确认契约结果。');
    this.executeGachaDrawBeforeVideo(ticket);
  }

  private executeGachaDrawBeforeVideo(ticket: number): void {
    const pending = this.pendingGachaDraw;
    if (!pending || pending.ticket !== ticket) {
      return;
    }
    void this.api.gacha.draw({ poolCode: pending.poolCode, drawCount: pending.drawCount, requestId: pending.requestId })
      .then((result) => {
        if (!this.pendingGachaDraw || this.pendingGachaDraw.ticket !== ticket) {
          return;
        }
        const pending = this.pendingGachaDraw;
        pending.result = result;
        pending.highestRarity = this.resolveGachaDrawResultHighestRarity(result);
        this.presentPendingGachaDrawVideo(ticket);
      })
      .catch((error) => {
        if (!this.pendingGachaDraw || this.pendingGachaDraw.ticket !== ticket) {
          return;
        }
        const pending = this.pendingGachaDraw;
        const message = error instanceof Error ? error.message : String(error);
        this.presentPendingGachaDrawFailure(ticket, message);
      });
  }

  private presentPendingGachaDrawVideo(ticket: number): void {
    const pending = this.pendingGachaDraw;
    if (!pending || pending.ticket !== ticket || !pending.result) {
      return;
    }
    this.gachaSummonRarity = pending.highestRarity;
    this.gachaResultMode = pending.mode;
    this.currentView = 'gachaSummon';
    this.renderCurrentView();
    this.setStatus(pending.highestRarity === 'SSR' || pending.highestRarity === 'UR' ? '高阶契约响应，播放稀有召唤影像。' : '契约响应完成，播放召唤影像。');
  }

  private finishGachaSummonVideoScene(): void {
    if (this.currentView !== 'gachaSummon') {
      return;
    }
    const pending = this.pendingGachaDraw;
    if (!pending || !pending.result) {
      return;
    }
    this.presentPendingGachaDrawResult(pending.ticket);
  }

  private presentPendingGachaDrawResult(ticket: number): void {
    const pending = this.pendingGachaDraw;
    if (!pending || pending.ticket !== ticket || !pending.result) {
      return;
    }
    const result = pending.result;
    this.pendingGachaDraw = null;
    this.gachaSummonRarity = null;
    this.gachaSceneState = { ...this.gachaSceneState, drawing: false, lastDrawResult: result };
    this.gachaResultMode = pending.mode;
    this.currentView = 'gachaResult';
    this.renderCurrentView();
    this.setStatus(`召唤完成：${result.drawNo}`);
    void this.loadGachaPity(pending.poolCode);
    void this.refreshReadonlyAssetsAfterGacha();
  }

  private presentPendingGachaDrawFailure(ticket: number, message: string): void {
    const pending = this.pendingGachaDraw;
    if (!pending || pending.ticket !== ticket) {
      return;
    }
    this.pendingGachaDraw = null;
    this.gachaSummonRarity = null;
    this.gachaSceneState = { ...this.gachaSceneState, drawing: false, error: message };
    this.currentView = 'gacha';
    this.renderCurrentView();
    this.setStatus(`召唤失败：${message}`);
  }

  private resolveGachaDrawResultHighestRarity(result: GachaDrawResultVO): GachaRarity | null {
    return result.items.reduce<GachaRarity | null>((highest, item) => {
      const rarity = this.normalizeGachaRarity(item.rarity);
      if (!rarity) {
        return highest;
      }
      return this.compareGachaRarity(rarity, highest) > 0 ? rarity : highest;
    }, null);
  }

  private compareGachaRarity(left: string | null | undefined, right: string | null | undefined): number {
    const ranks: Record<GachaRarity, number> = { R: 0, SR: 1, SSR: 2, UR: 3 };
    const leftRarity = this.normalizeGachaRarity(left);
    const rightRarity = this.normalizeGachaRarity(right);
    return (leftRarity ? ranks[leftRarity] : -1) - (rightRarity ? ranks[rightRarity] : -1);
  }

  private normalizeGachaRarity(value: string | null | undefined): GachaRarity | null {
    const normalized = (value ?? '').trim().toUpperCase();
    return normalized === 'R' || normalized === 'SR' || normalized === 'SSR' || normalized === 'UR' ? normalized : null;
  }

  private openGachaMockRevealScene(mode: GachaPreviewResultMode): void {
    this.gachaResultMode = mode;
    this.currentView = 'gachaReveal';
    this.renderCurrentView();
    this.setStatus('召唤演出为本地 mock：不生成 drawNo、不扣资源、不发英雄。');
  }

  private closeGachaMockRevealScene(): void {
    if (this.currentView !== 'gachaReveal') {
      return;
    }
    this.gachaResultMode = null;
    this.currentView = 'gacha';
    this.renderCurrentView();
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
    if (this.currentView === 'gachaSummon') {
      this.setStatus('召唤视频正在播放，请稍候。');
      return;
    }
    if (this.currentView !== 'gacha' && this.currentView !== 'gachaReveal' && this.currentView !== 'gachaResult' && !this.isGachaActionSceneView(this.currentView)) {
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

  private openLobbySettingsPanel(): void {
    if (this.lobbySettingsPanelOpen && this.currentView === 'settings') {
      return;
    }
    this.lobbySettingsPanelOpen = true;
    this.lobbyProfileOpen = false;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.currentView = 'settings';
    this.renderCurrentView();
  }

  private closeLobbySettingsPanel(): void {
    if (!this.lobbySettingsPanelOpen) {
      return;
    }
    this.returnToLobbyFromScenePage();
  }

  private removeLobbySettingsPanel(): void {
    this.removeNodeFromContent('LobbySettingsDim');
    this.removeNodeFromContent('LobbySettingsSceneContent');
  }

  private setLobbyLanguage(language: LootChainLanguage): void {
    lootChainI18n.setLanguage(language);
    this.renderCurrentView();
    this.refreshLocalizedPlayerDataAfterLanguageChange();
    this.setStatus(lootChainI18n.t('language.changed', { language: lootChainI18n.languageLabel(language) }));
  }

  private refreshLocalizedPlayerDataAfterLanguageChange(): void {
    const profile = this.currentLobbyProfile();
    void this.loadLobbyProfile(profile.userId);
    void this.loadLobbyNotices(true);
    void this.loadLobbyAdventure(true);
    void this.loadLobbyHeroRoster(true);
    void this.loadLobbyCodex(true);
    void this.loadLobbyBag(true);
    void this.loadLobbyBattleRecent(true);
    void this.loadGachaPools(true);
    if (this.gachaSceneState.selectedPoolCode) {
      void this.loadGachaPoolDetail(this.gachaSceneState.selectedPoolCode, true);
      void this.loadGachaPity(this.gachaSceneState.selectedPoolCode);
    }
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
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbySettingsPanelOpen = false;
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

  private async loadLobbyBag(force = false): Promise<void> {
    await this.lobbyBagLoader.load(force);
  }

  private async loadLobbyBagItemSource(itemCode: string, force = false): Promise<void> {
    await this.lobbyBagLoader.loadSource(itemCode, force);
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

  private async refreshReadonlyAssetsAfterGacha(): Promise<void> {
    const userId = this.currentLobbyProfile().userId;
    await this.loadLobbyProfile(userId);
    await this.loadLobbyHeroRoster(true);
    if (this.currentView === 'gacha' || this.currentView === 'gachaResult' || this.isGachaActionSceneView(this.currentView)) {
      this.renderCurrentView();
    }
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

  private updateGachaConfigRefresh(deltaTime: number): void {
    if (this.currentView !== 'gacha') {
      this.gachaConfigRefreshElapsed = 0;
      return;
    }
    if (this.gachaSceneState.loading || this.gachaSceneState.drawing) {
      return;
    }
    this.gachaConfigRefreshElapsed += deltaTime;
    if (this.gachaConfigRefreshElapsed < 15) {
      return;
    }
    this.gachaConfigRefreshElapsed = 0;
    void this.loadGachaPools(true);
  }

  private isLobbyViewActive(): boolean {
    return this.currentView === 'lobby' || this.isLobbyScenePageView(this.currentView);
  }

  private isGachaActionSceneView(view: ViewName): boolean {
    return this.gachaActionForView(view) !== null;
  }

  private gachaActionForView(view: ViewName): GachaActionKey | null {
    if (view === 'gachaInfo') {
      return 'info';
    }
    if (view === 'gachaRecord') {
      return 'record';
    }
    if (view === 'gachaExchange') {
      return 'exchange';
    }
    if (view === 'gachaPoolContent') {
      return 'pool';
    }
    return null;
  }

  private viewForGachaAction(action: GachaActionKey): ViewName {
    if (action === 'info') {
      return 'gachaInfo';
    }
    if (action === 'record') {
      return 'gachaRecord';
    }
    if (action === 'exchange') {
      return 'gachaExchange';
    }
    return 'gachaPoolContent';
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

  private openLoginLanguageDialog(): void {
    this.currentView = 'login';
    this.loginLanguageDialogOpen = true;
    this.renderLogin();
  }

  private closeLoginLanguageDialog(): void {
    if (!this.loginLanguageDialogOpen) {
      return;
    }
    this.loginLanguageDialogOpen = false;
    this.renderLogin();
  }

  private selectLoginLanguage(language: LootChainLanguage): void {
    const nextLanguage = lootChainI18n.setLanguage(language);
    this.loginLanguageDialogOpen = false;
    this.renderLogin();
    this.setStatus(lootChainI18n.t('language.changed', { language: lootChainI18n.languageLabel(nextLanguage) }));
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
    this.lobbyBagLoader.resetForLogin();
    this.lobbyBattleFlow.resetForLogin();
    this.lobbyCodexLoader.resetForLogin();
    this.lobbyHeroRosterLoader.resetForLogin();
    this.lobbyNoticeLoader.resetForLogin();
    this.selectedLobbyStageCode = null;
    this.selectedLobbyFormationHeroIds = [];
    this.lobbyProfileOpen = false;
    this.lobbyAdventurePanelOpen = false;
    this.lobbyBagPanelOpen = false;
    this.lobbyBattlePreviewPanelOpen = false;
    this.lobbyCodexPanelOpen = false;
    this.lobbyFormationPanelOpen = false;
    this.lobbyHeroDetailHeroId = null;
    this.lobbyHeroRosterPanelOpen = false;
    this.lobbyNoticePanelOpen = false;
    this.lobbySettingsPanelOpen = false;
    this.lobbyPlaceholderDialog = null;
    this.gachaResultMode = null;
    this.pendingGachaDraw = null;
    this.gachaSummonRarity = null;
    this.gachaSummonTicket += 1;
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
    if (this.currentView === 'gacha' || this.currentView === 'gachaReveal' || this.currentView === 'gachaSummon' || this.currentView === 'gachaResult' || this.isGachaActionSceneView(this.currentView)) {
      const layout = this.resolveLayout();
      const gachaStatusY = layout.stageBottom + 210 * layout.uiScale;
      this.statusPresenter.set(text, layout, gachaStatusY);
      return;
    }
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
    const languageKey = lootChainI18n.currentLanguage();
    const gachaOpen = this.currentView === 'gacha' || this.currentView === 'gachaReveal' || this.currentView === 'gachaSummon' || this.currentView === 'gachaResult' || this.isGachaActionSceneView(this.currentView);
    return `${this.currentView}:${languageKey}:${layout.width}x${layout.height}:${viewportKey}:${stageKey}:${this.loginLanguageDialogOpen ? 'login-language-open' : 'login-language-closed'}:${this.loginFlow.agreementAccepted ? 'agree' : 'deny'}:${this.protagonistCreateFlow.version}:${this.lobbyProfileOpen ? 'profile-open' : 'profile-closed'}:${this.lobbyAdventurePanelOpen ? 'adventure-open' : 'adventure-closed'}:${this.lobbyAdventureLoader.version}:${this.lobbyBagPanelOpen ? 'bag-open' : 'bag-closed'}:${this.lobbyBagLoader.version}:${this.selectedLobbyStageCode}:${this.lobbyBattlePreviewPanelOpen ? 'battle-open' : 'battle-closed'}:${this.lobbyBattleFlow.currentState().version}:${this.lobbyCodexPanelOpen ? 'codex-open' : 'codex-closed'}:${this.lobbyCodexLoader.version}:${this.lobbyFormationPanelOpen ? 'formation-open' : 'formation-closed'}:${this.selectedLobbyFormationHeroIds.join(',')}:${this.lobbyHeroRosterPanelOpen ? 'heroes-open' : 'heroes-closed'}:${this.lobbyHeroDetailHeroId ?? 'detail-closed'}:${this.lobbyHeroRosterLoader.version}:${this.lobbyNoticePanelOpen ? 'notice-open' : 'notice-closed'}:${this.lobbyNoticeLoader.version}:${this.lobbySettingsPanelOpen ? 'settings-open' : 'settings-closed'}:${gachaOpen ? 'gacha-open' : 'gacha-closed'}:${this.gachaSceneState.activeAction ?? 'gacha-action-closed'}:${this.gachaSceneState.selectedPoolCode ?? 'gacha-pool-none'}:${this.gachaSceneState.poolDetailLoading ? 'gacha-detail-loading' : 'gacha-detail-idle'}:${this.gachaSceneState.logsLoading ? 'gacha-logs-loading' : 'gacha-logs-idle'}:${this.gachaSceneState.poolDetail?.items.length ?? 0}:${this.gachaSceneState.logs.length}:${this.gachaResultMode ?? 'gacha-result-closed'}:${this.lobbyPlaceholderDialog ? 'placeholder-open' : 'placeholder-closed'}`;
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
