import {
  _decorator,
  Button,
  Color,
  Component,
  EditBox,
  Graphics,
  Label,
  Node,
  resources,
  Size,
  Sprite,
  SpriteFrame,
  Texture2D,
  UITransform,
  Vec3,
  VideoClip,
  VideoPlayer,
  view,
} from 'cc';
import { AppConfig } from '../app/AppConfig';
import { lootChainApi, LootChainApi } from '../api/LootChainApi';
import { ApiError } from '../net/HttpClient';
import type { PlayerLobbyProfileVO } from '../types/PlayerTypes';

const { ccclass, property } = _decorator;

type AsyncAction = () => Promise<void>;
type ButtonVisualState = 'hover' | 'normal' | 'pressed';
type CursorDocument = { body?: { style?: { cursor: string } } };
type ViewName = 'login' | 'loginDialog' | 'loading' | 'lobby';

function rgba(red: number, green: number, blue: number, alpha = 255): Color {
  return new Color(red, green, blue, alpha);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface UiLayout {
  width: number;
  height: number;
  stageWidth: number;
  stageHeight: number;
  stageLeft: number;
  stageRight: number;
  stageTop: number;
  stageBottom: number;
  safeLeft: number;
  safeRight: number;
  safeTop: number;
  safeBottom: number;
  safeWidth: number;
  safeHeight: number;
  safeInsetX: number;
  safeInsetY: number;
  uiScale: number;
  contentWidth: number;
  topY: number;
  inputHeight: number;
  buttonHeight: number;
  statusWidth: number;
  bodyFont: number;
}

interface StageBounds {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

interface RailButtonAsset {
  label: string;
  path: string;
}

const UI_ASSETS = {
  logo: 'ui/login/login_logo/spriteFrame',
  mainButton: 'ui/login/login_button_main/spriteFrame',
  lobbyPlayerInfoPanel: 'ui/lobby/lobby_player_info_panel/spriteFrame',
  rightRail: [
    { label: '谕言', path: 'ui/login/side_btn_prophecy/spriteFrame' },
    { label: '客服', path: 'ui/login/side_btn_service/spriteFrame' },
    { label: '公告', path: 'ui/login/side_btn_notice/spriteFrame' },
    { label: '修复', path: 'ui/login/side_btn_repair/spriteFrame' },
  ] satisfies RailButtonAsset[],
};

const SHOW_LOGIN_BRAND = true;
const SHOW_RIGHT_RAIL = true;
const USE_IMAGE_LOGIN_BUTTON = true;
const SHOW_DIALOG_THIRD_PARTY_LOGIN = true;
const LOGIN_REFERENCE_WIDTH = 1920;
const LOGIN_REFERENCE_HEIGHT = 1080;
const LOGIN_STAGE_NODE_NAMES = ['BG_Main', 'FG_Architecture'] as const;
const LOBBY_VIDEO_PATH = 'lobby/lobby_bg_loop';
const LOBBY_POSTER_PATH = 'lobby/lobby_bg_poster';
const USE_LOBBY_NATIVE_VIDEO_BACKGROUND = false;
const LOBBY_PLAYER_INFO_PANEL_ASPECT = 1600 / 577;
const LOBBY_PROFILE_SERVER_NAME = '本地开发服';
const LOBBY_PROFILE_PLACEHOLDER = '-';
const MIN_VISIBLE_WIDTH = 320;
const MIN_VISIBLE_HEIGHT = 180;

@ccclass('LootChainGameRoot')
export class LootChainGameRoot extends Component {
  @property(SpriteFrame)
  logoFrame: SpriteFrame | null = null;

  @property(SpriteFrame)
  mainButtonFrame: SpriteFrame | null = null;

  @property([SpriteFrame])
  rightRailFrames: SpriteFrame[] = [];

  private readonly api: LootChainApi = lootChainApi;
  private readonly spriteFrames = new Map<string, SpriteFrame>();
  private readonly loadingSpriteFrames = new Set<string>();
  private accountInput: EditBox | null = null;
  private passwordInput: EditBox | null = null;
  private statusLabel: Label | null = null;
  private contentRoot: Node | null = null;
  private currentView: ViewName = 'login';
  private layoutKey = '';
  private lastTokenName = '';
  private agreementAccepted = true;
  private loadingProgress = 0;
  private loadingMessage = '准备进入游戏...';
  private loadingError = '';
  private resourceLoadTicket = 0;
  private lobbyPosterFrame: SpriteFrame | null = null;
  private lobbyVideoClip: VideoClip | null = null;
  private lobbyProfile: PlayerLobbyProfileVO | null = null;
  private lobbyProfileOpen = false;
  private lobbyProfileLoading = false;
  private lobbyProfileError = '';
  private lastDevUserId = AppConfig.defaultDevUserId;

  start(): void {
    // 登录验收必须从真实点击开始，避免历史 token 让预览直接进入通过态。
    this.api.auth.logout();
    this.currentView = 'login';
    this.preloadUiSprites();
    this.renderCurrentView();
  }

  update(): void {
    const nextKey = this.makeLayoutKey();
    if (this.layoutKey && this.layoutKey !== nextKey) {
      this.renderCurrentView();
    }
  }

  private renderCurrentView(): void {
    if (this.currentView === 'lobby') {
      this.renderLobby();
      return;
    }
    if (this.currentView === 'loading') {
      this.renderLoading();
      return;
    }
    if (this.currentView === 'loginDialog') {
      this.renderLoginDialog();
      return;
    }
    this.renderLogin();
  }

  private renderLogin(): void {
    this.currentView = 'login';
    const layout = this.renderBase();
    if (SHOW_LOGIN_BRAND) {
      this.renderLoginBrand(layout);
    }
    if (SHOW_RIGHT_RAIL) {
      this.renderRightRail(layout);
    }
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const buttonWidth = clamp(layout.contentWidth * 0.34, 300 * layout.uiScale, 450 * layout.uiScale);
    const buttonHeight = Math.round(buttonWidth * 0.23);
    const buttonY = layout.safeBottom + Math.max(12 * layout.uiScale, layout.safeHeight * 0.02) + buttonHeight / 2;
    if (USE_IMAGE_LOGIN_BUTTON) {
      this.addImageButton(
        'MainAccountLoginButton',
        UI_ASSETS.mainButton,
        '账号登录',
        centerX,
        buttonY,
        () => this.renderLoginDialog(),
        layout,
        buttonWidth,
        buttonHeight,
        Math.max(18 * layout.uiScale, layout.bodyFont + 7 * layout.uiScale),
      );
    } else {
      this.addGoldButton('账号登录', centerX, buttonY, () => this.renderLoginDialog(), layout, Math.min(320 * layout.uiScale, layout.contentWidth * 0.3), 48 * layout.uiScale);
    }
    this.addStatus('等待圣契召唤。', layout, buttonY + buttonHeight / 2 + 28 * layout.uiScale);
  }

  private renderLoginDialog(): void {
    this.currentView = 'loginDialog';
    const layout = this.renderBase();
    if (SHOW_LOGIN_BRAND) {
      this.renderLoginBrand(layout);
    }
    if (SHOW_RIGHT_RAIL) {
      this.renderRightRail(layout);
    }
    this.addRect('DialogDim', 0, 0, layout.width, layout.height, rgba(0, 0, 0, 88));

    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;
    const panelWidth = Math.min(620 * layout.uiScale, layout.contentWidth * 0.7);
    const panelHeight = (SHOW_DIALOG_THIRD_PARTY_LOGIN ? 560 : 430) * layout.uiScale;
    const panelY = centerY - layout.stageHeight * 0.08;
    const inputWidth = Math.min(430 * layout.uiScale, panelWidth - 130 * layout.uiScale);
    this.addBeveledPanel('LoginDialogPanel', centerX, panelY, panelWidth, panelHeight, rgba(10, 8, 9, 226), rgba(214, 177, 94, 230), 18 * layout.uiScale);
    const titleY = panelY + (SHOW_DIALOG_THIRD_PARTY_LOGIN ? 210 : 168) * layout.uiScale;
    const accountLabelY = panelY + (SHOW_DIALOG_THIRD_PARTY_LOGIN ? 138 : 102) * layout.uiScale;
    const accountInputY = panelY + (SHOW_DIALOG_THIRD_PARTY_LOGIN ? 98 : 62) * layout.uiScale;
    const passwordLabelY = panelY + (SHOW_DIALOG_THIRD_PARTY_LOGIN ? 48 : 12) * layout.uiScale;
    const passwordInputY = panelY + (SHOW_DIALOG_THIRD_PARTY_LOGIN ? 8 : -28) * layout.uiScale;
    const enterButtonY = panelY + (SHOW_DIALOG_THIRD_PARTY_LOGIN ? -70 : -96) * layout.uiScale;
    const thirdPartyY = panelY - 162 * layout.uiScale;
    const agreementY = SHOW_DIALOG_THIRD_PARTY_LOGIN ? panelY - 226 * layout.uiScale : panelY - 164 * layout.uiScale;
    this.addLabel('账号登录', centerX, titleY, 30 * layout.uiScale, rgba(245, 210, 122), new Size(panelWidth - 80 * layout.uiScale, 46 * layout.uiScale));

    this.addLabel('账号 / 邮箱', centerX, accountLabelY, 17 * layout.uiScale, rgba(215, 210, 198), new Size(inputWidth, 28 * layout.uiScale));
    this.accountInput = this.addFramedEditBox(String(AppConfig.defaultDevUserId), centerX, accountInputY, inputWidth, layout);
    this.addLabel('密码', centerX, passwordLabelY, 17 * layout.uiScale, rgba(215, 210, 198), new Size(inputWidth, 28 * layout.uiScale));
    this.passwordInput = this.addFramedEditBox('', centerX, passwordInputY, inputWidth, layout, true);

    this.addGoldButton('进入游戏', centerX, enterButtonY, () => this.run(() => this.login()), layout, Math.min(360 * layout.uiScale, inputWidth), 54 * layout.uiScale);
    if (SHOW_DIALOG_THIRD_PARTY_LOGIN) {
      this.renderThirdPartyLogin(thirdPartyY, layout, centerX);
    }
    this.renderAgreement(agreementY, layout, centerX);
    this.addButton('返回', centerX - panelWidth / 2 + 68 * layout.uiScale, panelY + panelHeight / 2 - 42 * layout.uiScale, () => this.renderLogin(), layout, 92 * layout.uiScale, 38 * layout.uiScale);
    this.addStatus('当前阶段只接入 dev-login；账号为数字时作为 User ID。', layout);
  }

  private renderLoading(): void {
    this.currentView = 'loading';
    const layout = this.renderBase();
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;

    this.addRect('LoadingMask', 0, 0, layout.width, layout.height, rgba(3, 3, 5, 210));
    const panelWidth = Math.min(660 * layout.uiScale, layout.contentWidth * 0.72);
    const panelHeight = 260 * layout.uiScale;
    const panelY = centerY - 12 * layout.uiScale;
    this.addBeveledPanel('LoadingPanel', centerX, panelY, panelWidth, panelHeight, rgba(10, 8, 10, 232), rgba(214, 177, 94, 230), 18 * layout.uiScale);
    this.addLabel('资源加载中', centerX, panelY + 74 * layout.uiScale, 32 * layout.uiScale, rgba(245, 210, 122), new Size(panelWidth - 70 * layout.uiScale, 54 * layout.uiScale));
    this.addLabel(this.loadingError || this.loadingMessage, centerX, panelY + 26 * layout.uiScale, 17 * layout.uiScale, this.loadingError ? rgba(255, 107, 124) : rgba(215, 210, 198), new Size(panelWidth - 96 * layout.uiScale, 42 * layout.uiScale));
    this.addProgressBar(centerX, panelY - 24 * layout.uiScale, panelWidth - 120 * layout.uiScale, 20 * layout.uiScale, clamp(this.loadingProgress, 0, 1));
    this.addLabel(`${Math.round(clamp(this.loadingProgress, 0, 1) * 100)}%`, centerX, panelY - 64 * layout.uiScale, 18 * layout.uiScale, rgba(127, 214, 255), new Size(panelWidth - 110 * layout.uiScale, 34 * layout.uiScale));
    if (this.loadingError) {
      this.addGoldButton('重试加载', centerX, panelY - 104 * layout.uiScale, () => this.startLobbyLoading(), layout, Math.min(260 * layout.uiScale, panelWidth - 130 * layout.uiScale), 46 * layout.uiScale);
    }
  }

  private renderLobby(): void {
    this.currentView = 'lobby';
    const layout = this.renderBase();
    this.renderLobbyBackground(layout);
    this.renderLobbyHud(layout);
    if (this.lobbyProfileOpen) {
      this.renderPlayerProfileDialog(layout);
    }
  }

  private renderLobbyHud(layout: UiLayout): void {
    this.renderLobbyPlayerInfo(layout);
  }

  private renderLobbyPlayerInfo(layout: UiLayout): void {
    const profile = this.currentLobbyProfile();
    const baseHudScale = this.lobbyHudScale(layout);
    let panelWidth = Math.min(
      clamp(layout.stageWidth * 0.23, 330 * baseHudScale, 390 * baseHudScale),
      layout.safeWidth,
    );
    let panelHeight = panelWidth / LOBBY_PLAYER_INFO_PANEL_ASPECT;
    const maxPanelHeight = layout.safeHeight * 0.5;
    if (panelHeight > maxPanelHeight) {
      panelHeight = maxPanelHeight;
      panelWidth = panelHeight * LOBBY_PLAYER_INFO_PANEL_ASPECT;
    }
    const hudScale = panelWidth / 390;
    const x = layout.safeLeft + panelWidth / 2;
    const y = layout.safeTop - panelHeight / 2;
    const panel = this.createUiNode('LobbyPlayerInfoButton');
    panel.setPosition(new Vec3(x, y, 0));
    panel.addComponent(UITransform).setContentSize(new Size(panelWidth, panelHeight));
    if (!this.addSprite('LobbyPlayerInfoArt', UI_ASSETS.lobbyPlayerInfoPanel, 0, 0, panelWidth, panelHeight, panel)) {
      this.drawLobbyPlayerInfoFrame(panel, panelWidth, panelHeight, hudScale);
    }
    panel.addComponent(Button);
    panel.on(Button.EventType.CLICK, () => this.openPlayerProfileDialog(), this);
    this.applyImageButtonFeedback(panel);

    const textX = -panelWidth / 2 + 132 * hudScale;
    const textWidth = Math.max(120 * hudScale, panelWidth - 162 * hudScale);
    this.addChildLabel(
      panel,
      'LobbyPlayerLevel',
      `Lv.${profile.playerLevel}`,
      textX,
      40 * hudScale,
      18 * hudScale,
      rgba(226, 201, 145),
      new Size(textWidth, 25 * hudScale),
      Label.HorizontalAlign.LEFT,
    );
    this.addChildLabel(
      panel,
      'LobbyPlayerName',
      profile.displayName,
      textX,
      14 * hudScale,
      24 * hudScale,
      rgba(250, 226, 164),
      new Size(textWidth, 32 * hudScale),
      Label.HorizontalAlign.LEFT,
    );
    this.addLobbyNameSigil(panel, textX + Math.min(142 * hudScale, textWidth - 18 * hudScale), 16 * hudScale, hudScale);
    this.addChildLabel(
      panel,
      'LobbyPlayerPower',
      `战力 ${this.formatInteger(profile.combatPower)}`,
      textX,
      -18 * hudScale,
      19 * hudScale,
      rgba(224, 190, 112),
      new Size(textWidth, 28 * hudScale),
      Label.HorizontalAlign.LEFT,
    );
    this.addLobbyPowerUnderline(panel, textX + textWidth * 0.44, -38 * hudScale, Math.min(textWidth * 0.92, 210 * hudScale), hudScale);
    this.addChildLabel(
      panel,
      'LobbyPlayerExpBadge',
      'EXP',
      -panelWidth / 2 + 63 * hudScale,
      -panelHeight / 2 + 22 * hudScale,
      13 * hudScale,
      rgba(245, 210, 122),
      new Size(44 * hudScale, 18 * hudScale),
    );

  }

  private renderPlayerProfileDialog(layout: UiLayout): void {
    const profile = this.currentLobbyProfile();
    const dim = this.addRect('LobbyProfileDim', 0, 0, layout.width, layout.height, rgba(0, 0, 0, 126));
    dim.node.addComponent(Button);
    dim.node.on(Button.EventType.CLICK, () => this.closePlayerProfileDialog(), this);

    const panelWidth = Math.min(840 * layout.uiScale, Math.max(260 * layout.uiScale, layout.safeWidth - 24 * layout.uiScale));
    const panelHeight = Math.min(620 * layout.uiScale, Math.max(280 * layout.uiScale, layout.safeHeight - 24 * layout.uiScale));
    const panelX = (layout.stageLeft + layout.stageRight) / 2;
    const panelY = (layout.stageTop + layout.stageBottom) / 2;
    const panel = this.addBeveledPanelNode(
      'LobbyProfilePanel',
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      rgba(8, 7, 10, 238),
      rgba(215, 170, 82, 238),
      20 * layout.uiScale,
    );
    panel.addComponent(Button);

    this.addChildLabel(
      panel,
      'LobbyProfileTitle',
      '玩家资料',
      0,
      panelHeight / 2 - 46 * layout.uiScale,
      Math.max(18, 30 * layout.uiScale),
      rgba(245, 210, 122),
      new Size(panelWidth - 160 * layout.uiScale, 46 * layout.uiScale),
    );

    const closeSize = 42 * layout.uiScale;
    const closeNode = new Node('LobbyProfileCloseButton');
    closeNode.layer = this.node.layer;
    panel.addChild(closeNode);
    closeNode.setPosition(new Vec3(panelWidth / 2 - 38 * layout.uiScale, panelHeight / 2 - 36 * layout.uiScale, 0));
    closeNode.addComponent(UITransform).setContentSize(new Size(closeSize, closeSize));
    const closeGraphics = closeNode.addComponent(Graphics);
    this.drawButtonFrame(closeGraphics, closeSize, closeSize, 'normal');
    closeNode.addComponent(Button);
    closeNode.on(Button.EventType.CLICK, () => this.closePlayerProfileDialog(), this);
    this.applyPointerCursor(closeNode);
    this.addChildLabel(closeNode, 'Label', 'X', 0, 1 * layout.uiScale, Math.max(15, 20 * layout.uiScale), rgba(245, 210, 122), new Size(closeSize, closeSize));

    const avatarSize = 126 * layout.uiScale;
    const avatarX = -panelWidth / 2 + 118 * layout.uiScale;
    const avatarY = panelHeight / 2 - 132 * layout.uiScale;
    this.addLobbyAvatar(panel, avatarX, avatarY, avatarSize, profile.displayName);
    this.addChildLabel(
      panel,
      'LobbyProfileName',
      profile.displayName,
      avatarX + 96 * layout.uiScale,
      avatarY + 30 * layout.uiScale,
      Math.max(17, 28 * layout.uiScale),
      rgba(250, 226, 164),
      new Size(panelWidth - 260 * layout.uiScale, 40 * layout.uiScale),
      Label.HorizontalAlign.LEFT,
    );
    this.addChildLabel(
      panel,
      'LobbyProfileSubline',
      `UID ${profile.userId}  |  ${LOBBY_PROFILE_SERVER_NAME}`,
      avatarX + 96 * layout.uiScale,
      avatarY - 8 * layout.uiScale,
      Math.max(12, 17 * layout.uiScale),
      rgba(209, 199, 176),
      new Size(panelWidth - 280 * layout.uiScale, 30 * layout.uiScale),
      Label.HorizontalAlign.LEFT,
    );
    this.addChildLabel(
      panel,
      'LobbyProfileStatus',
      this.profileStatusText(profile),
      avatarX + 96 * layout.uiScale,
      avatarY - 42 * layout.uiScale,
      Math.max(12, 16 * layout.uiScale),
      this.lobbyProfileError ? rgba(255, 162, 92) : rgba(127, 214, 255),
      new Size(panelWidth - 280 * layout.uiScale, 28 * layout.uiScale),
      Label.HorizontalAlign.LEFT,
    );

    const rowTop = avatarY - 104 * layout.uiScale;
    const columnWidth = (panelWidth - 104 * layout.uiScale) / 2;
    const leftX = -panelWidth / 4 + 16 * layout.uiScale;
    const rightX = panelWidth / 4 - 16 * layout.uiScale;
    const rowGap = 46 * layout.uiScale;
    this.addProfileRow(panel, '等级', `Lv.${profile.playerLevel}`, leftX, rowTop, columnWidth, layout);
    this.addProfileRow(panel, '经验', this.formatInteger(profile.exp), rightX, rowTop, columnWidth, layout);
    this.addProfileRow(panel, '战力', this.formatInteger(profile.combatPower), leftX, rowTop - rowGap, columnWidth, layout);
    this.addProfileRow(panel, '体力', `${this.formatInteger(profile.stamina)}/${this.formatInteger(profile.maxStamina)}`, rightX, rowTop - rowGap, columnWidth, layout);
    this.addProfileRow(panel, '账号状态', profile.accountStatus, leftX, rowTop - rowGap * 2, columnWidth, layout);
    this.addProfileRow(panel, '登录方式', profile.loginMethod, rightX, rowTop - rowGap * 2, columnWidth, layout);
    this.addProfileRow(panel, '钱包绑定', profile.walletBound ? '已绑定' : '未绑定', leftX, rowTop - rowGap * 3, columnWidth, layout);
    this.addProfileRow(panel, '钱包地址', this.maskWalletAddress(profile.walletAddress), rightX, rowTop - rowGap * 3, columnWidth, layout);

    this.addChildLabel(
      panel,
      'LobbyProfileReadonlyNote',
      '当前阶段仅展示只读资料；头像、昵称、绑定、登出等操作暂不开放。',
      0,
      -panelHeight / 2 + 34 * layout.uiScale,
      Math.max(11, 15 * layout.uiScale),
      rgba(173, 158, 130),
      new Size(panelWidth - 90 * layout.uiScale, 28 * layout.uiScale),
    );
  }

  private lobbyHudScale(layout: UiLayout): number {
    return clamp(layout.uiScale, 0.62, 1);
  }

  private drawLobbyPlayerInfoFrame(parent: Node, width: number, height: number, scale: number): void {
    const graphics = parent.addComponent(Graphics);
    const left = -width / 2;
    const right = width / 2;
    const top = height / 2;
    const bottom = -height / 2;
    const avatarCenterX = left + 58 * scale;

    graphics.fillColor = rgba(3, 4, 7, 84);
    graphics.moveTo(left + 72 * scale, top - 30 * scale);
    graphics.lineTo(right - 38 * scale, top - 27 * scale);
    graphics.lineTo(right - 14 * scale, top - 43 * scale);
    graphics.lineTo(right - 56 * scale, bottom + 38 * scale);
    graphics.lineTo(left + 90 * scale, bottom + 24 * scale);
    graphics.close();
    graphics.fill();

    graphics.fillColor = rgba(28, 16, 11, 86);
    graphics.moveTo(left + 96 * scale, top - 50 * scale);
    graphics.lineTo(right - 72 * scale, top - 48 * scale);
    graphics.lineTo(right - 42 * scale, top - 58 * scale);
    graphics.lineTo(right - 92 * scale, bottom + 48 * scale);
    graphics.lineTo(left + 112 * scale, bottom + 42 * scale);
    graphics.close();
    graphics.fill();

    graphics.strokeColor = rgba(213, 166, 77, 160);
    graphics.lineWidth = 1.6 * scale;
    graphics.moveTo(left + 118 * scale, top - 30 * scale);
    graphics.lineTo(right - 58 * scale, top - 29 * scale);
    graphics.stroke();
    graphics.strokeColor = rgba(213, 166, 77, 214);
    graphics.lineWidth = 1.2 * scale;
    graphics.moveTo(left + 112 * scale, bottom + 33 * scale);
    graphics.lineTo(right - 64 * scale, bottom + 27 * scale);
    graphics.stroke();

    graphics.strokeColor = rgba(119, 86, 39, 150);
    graphics.lineWidth = 1 * scale;
    graphics.moveTo(avatarCenterX + 42 * scale, top - 19 * scale);
    graphics.lineTo(avatarCenterX + 64 * scale, top - 30 * scale);
    graphics.moveTo(avatarCenterX + 42 * scale, bottom + 23 * scale);
    graphics.lineTo(avatarCenterX + 72 * scale, bottom + 34 * scale);
    graphics.stroke();

    const ornamentY = top - 31 * scale;
    graphics.fillColor = rgba(197, 36, 47, 220);
    graphics.moveTo(right - 20 * scale, ornamentY + 7 * scale);
    graphics.lineTo(right - 13 * scale, ornamentY);
    graphics.lineTo(right - 20 * scale, ornamentY - 7 * scale);
    graphics.lineTo(right - 27 * scale, ornamentY);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = rgba(244, 122, 91, 205);
    graphics.lineWidth = 1 * scale;
    graphics.stroke();
  }

  private addLobbyNameSigil(parent: Node, x: number, y: number, scale: number): void {
    const sigil = new Node('LobbyPlayerNameSigil');
    sigil.layer = this.node.layer;
    parent.addChild(sigil);
    sigil.setPosition(new Vec3(x, y, 0));
    sigil.addComponent(UITransform).setContentSize(new Size(24 * scale, 24 * scale));
    const graphics = sigil.addComponent(Graphics);
    graphics.strokeColor = rgba(235, 192, 90, 230);
    graphics.lineWidth = 1.5 * scale;
    graphics.moveTo(0, 11 * scale);
    graphics.lineTo(0, -11 * scale);
    graphics.moveTo(-9 * scale, 0);
    graphics.lineTo(9 * scale, 0);
    graphics.stroke();
    graphics.fillColor = rgba(62, 31, 18, 215);
    graphics.moveTo(0, 8 * scale);
    graphics.lineTo(6 * scale, 0);
    graphics.lineTo(0, -8 * scale);
    graphics.lineTo(-6 * scale, 0);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = rgba(245, 210, 122, 230);
    graphics.stroke();
  }

  private addLobbyPowerUnderline(parent: Node, x: number, y: number, width: number, scale: number): void {
    const line = new Node('LobbyPlayerPowerUnderline');
    line.layer = this.node.layer;
    parent.addChild(line);
    line.setPosition(new Vec3(x, y, 0));
    line.addComponent(UITransform).setContentSize(new Size(width, 14 * scale));
    const graphics = line.addComponent(Graphics);
    graphics.strokeColor = rgba(210, 166, 78, 150);
    graphics.lineWidth = 1 * scale;
    graphics.moveTo(-width / 2, 0);
    graphics.lineTo(width / 2 - 18 * scale, 0);
    graphics.stroke();
    graphics.fillColor = rgba(213, 47, 50, 210);
    graphics.moveTo(width / 2 - 8 * scale, 6 * scale);
    graphics.lineTo(width / 2 - 2 * scale, 0);
    graphics.lineTo(width / 2 - 8 * scale, -6 * scale);
    graphics.lineTo(width / 2 - 14 * scale, 0);
    graphics.close();
    graphics.fill();
  }

  private openPlayerProfileDialog(): void {
    this.lobbyProfileOpen = true;
    if (this.currentView === 'lobby') {
      this.renderLobby();
    }
  }

  private closePlayerProfileDialog(): void {
    this.lobbyProfileOpen = false;
    if (this.currentView === 'lobby') {
      this.renderLobby();
    }
  }

  private async loadLobbyProfile(userId: number): Promise<void> {
    this.lobbyProfileLoading = true;
    this.lobbyProfileError = '';
    if (this.currentView === 'lobby') {
      this.renderLobby();
    }
    try {
      const profile = await this.api.profile.lobbyProfile();
      if (userId !== this.lastDevUserId) {
        return;
      }
      this.lobbyProfile = this.normalizeLobbyProfile(profile);
      this.lobbyProfileError = '';
    } catch (error) {
      if (userId !== this.lastDevUserId) {
        return;
      }
      this.lobbyProfile = null;
      this.lobbyProfileError = error instanceof Error ? error.message : String(error);
      console.warn('[LootChain] lobby profile load failed:', error);
    } finally {
      if (userId !== this.lastDevUserId) {
        return;
      }
      this.lobbyProfileLoading = false;
      if (this.currentView === 'lobby') {
        this.renderLobby();
      }
    }
  }

  private currentLobbyProfile(): PlayerLobbyProfileVO {
    return this.lobbyProfile ?? this.fallbackLobbyProfile();
  }

  private fallbackLobbyProfile(): PlayerLobbyProfileVO {
    return {
      userId: this.lastDevUserId,
      displayName: 'LootChain',
      username: `player${this.lastDevUserId}`,
      nickname: null,
      avatar: null,
      playerLevel: 1,
      exp: 0,
      stamina: 0,
      maxStamina: 120,
      combatPower: 0,
      status: null,
      accountStatus: this.lobbyProfileError ? '资料占位' : '读取中',
      walletBound: false,
      walletAddress: null,
      loginMethod: 'dev-login',
    };
  }

  private normalizeLobbyProfile(profile: PlayerLobbyProfileVO): PlayerLobbyProfileVO {
    const userId = this.positiveInteger(profile.userId, this.lastDevUserId);
    const displayName = this.safeText(profile.displayName || profile.nickname || profile.username || `Player${userId}`);
    return {
      userId,
      displayName,
      username: profile.username ?? null,
      nickname: profile.nickname ?? null,
      avatar: profile.avatar ?? null,
      playerLevel: this.positiveInteger(profile.playerLevel, 1),
      exp: this.positiveInteger(profile.exp, 0),
      stamina: this.positiveInteger(profile.stamina, 0),
      maxStamina: this.positiveInteger(profile.maxStamina, 120),
      combatPower: this.positiveInteger(profile.combatPower, 0),
      status: profile.status ?? null,
      accountStatus: this.safeText(profile.accountStatus || '未知'),
      walletBound: Boolean(profile.walletBound),
      walletAddress: profile.walletAddress ?? null,
      loginMethod: this.safeText(profile.loginMethod || 'dev-login'),
    };
  }

  private profileStatusText(profile: PlayerLobbyProfileVO): string {
    if (this.lobbyProfileLoading) {
      return '资料读取中...';
    }
    if (this.lobbyProfileError) {
      return '资料接口暂不可用，已使用本地占位';
    }
    return `账号状态：${profile.accountStatus}`;
  }

  private renderBase(): UiLayout {
    const layout = this.resolveLayout();
    this.applyRootSize(layout);
    this.layoutKey = this.makeLayoutKey();
    this.setPointerCursor(false);
    this.ensureContentRoot().removeAllChildren();
    return layout;
  }

  private renderLoginBrand(layout: UiLayout): void {
    const logoWidth = clamp(layout.stageWidth * 0.23, 210 * layout.uiScale, 320 * layout.uiScale);
    const logoHeight = Math.round(logoWidth * 0.51);
    const logoX = layout.safeLeft + logoWidth / 2;
    const logoY = layout.safeTop - logoHeight / 2;
    if (!this.addSprite('LoginLogo', UI_ASSETS.logo, logoX, logoY, logoWidth, logoHeight)) {
      this.addLabel('LOOTCHAIN', logoX, logoY + 22 * layout.uiScale, 46 * layout.uiScale, rgba(245, 210, 122), new Size(logoWidth * 1.35, 62 * layout.uiScale));
      this.addLabel('SILENT GODS', logoX, logoY - 30 * layout.uiScale, 17 * layout.uiScale, rgba(214, 177, 94), new Size(logoWidth * 1.2, 28 * layout.uiScale));
    }
  }

  private renderRightRail(layout: UiLayout): void {
    const railWidth = 76 * layout.uiScale;
    const railHeight = 74 * layout.uiScale;
    const x = layout.safeRight - railWidth / 2;
    const yStart = layout.safeTop - Math.max(8 * layout.uiScale, layout.safeInsetY * 0.4) - railHeight / 2;
    const railGap = 84 * layout.uiScale;
    UI_ASSETS.rightRail.forEach((asset, index) => {
      this.addRailImageButton(asset, x, yStart - index * railGap, layout);
    });
  }

  private renderThirdPartyLogin(y: number, layout: UiLayout, centerX = 0): void {
    this.addLabel('其他登录方式', centerX, y + 30 * layout.uiScale, 16 * layout.uiScale, rgba(214, 177, 94), new Size(260 * layout.uiScale, 28 * layout.uiScale));
    const labels = ['G', 'A', 'D', 'X'];
    const gap = 68 * layout.uiScale;
    labels.forEach((label, index) => {
      const x = centerX + (index - (labels.length - 1) / 2) * gap;
      this.addDiamondButton(label, x, y - 8 * layout.uiScale, () => this.setStatus('第三方登录暂未开放。'), layout);
    });
  }

  private renderAgreement(y: number, layout: UiLayout, centerX = 0): void {
    const boxSize = 24 * layout.uiScale;
    const x = centerX - 152 * layout.uiScale;
    this.addButton(this.agreementAccepted ? '✓' : '', x, y, () => {
      this.agreementAccepted = !this.agreementAccepted;
      this.renderLoginDialog();
    }, layout, boxSize, boxSize);
    this.addLabel('我已阅读并同意《用户协议》和《隐私政策》', centerX + 54 * layout.uiScale, y, 16 * layout.uiScale, rgba(215, 210, 198), new Size(430 * layout.uiScale, 34 * layout.uiScale));
  }

  private renderLobbyBackground(layout: UiLayout): void {
    if (this.lobbyPosterFrame) {
      const posterNode = this.createUiNode('Lobby_BG_Poster');
      posterNode.setPosition(Vec3.ZERO);
      posterNode.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
      const poster = posterNode.addComponent(Sprite);
      poster.type = Sprite.Type.SIMPLE;
      poster.sizeMode = Sprite.SizeMode.CUSTOM;
      poster.spriteFrame = this.lobbyPosterFrame;
    } else {
      this.addRect('Lobby_BG_Fallback', 0, 0, layout.width, layout.height, rgba(5, 4, 7, 255));
    }

    if (!USE_LOBBY_NATIVE_VIDEO_BACKGROUND || !this.lobbyVideoClip) {
      return;
    }

    const videoNode = this.createUiNode('Lobby_BG_Video');
    videoNode.setPosition(Vec3.ZERO);
    videoNode.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const video = videoNode.addComponent(VideoPlayer);
    video.clip = this.lobbyVideoClip;
    video.mute = true;
    video.volume = 0;
    video.loop = true;
    video.playOnAwake = false;
    try {
      video.play();
    } catch (error) {
      console.warn('[LootChain] lobby background video play failed:', error);
    }
  }

  private addLobbyAvatar(parent: Node, x: number, y: number, size: number, displayName: string): void {
    const avatarNode = new Node('LobbyPlayerAvatar');
    avatarNode.layer = this.node.layer;
    parent.addChild(avatarNode);
    avatarNode.setPosition(new Vec3(x, y, 0));
    avatarNode.addComponent(UITransform).setContentSize(new Size(size, size));
    const graphics = avatarNode.addComponent(Graphics);
    const radius = size / 2;

    graphics.fillColor = rgba(15, 10, 7, 230);
    graphics.circle(0, 0, radius * 1.08);
    graphics.fill();
    graphics.strokeColor = rgba(95, 67, 31, 190);
    graphics.lineWidth = Math.max(2, size * 0.04);
    graphics.circle(0, 0, radius * 1.03);
    graphics.stroke();
    graphics.strokeColor = rgba(205, 160, 73, 210);
    graphics.lineWidth = Math.max(1, size * 0.015);
    graphics.arc(0, 0, radius * 1.08, Math.PI * 0.74, Math.PI * 1.34, false);
    graphics.stroke();
    graphics.arc(0, 0, radius * 1.08, Math.PI * 1.74, Math.PI * 0.34, false);
    graphics.stroke();

    this.drawAvatarFrameOrnaments(graphics, size);

    graphics.fillColor = rgba(8, 9, 13, 252);
    graphics.circle(0, 0, radius * 0.98);
    graphics.fill();

    graphics.fillColor = rgba(24, 28, 36, 246);
    graphics.circle(0, -radius * 0.02, radius * 0.78);
    graphics.fill();

    this.drawArmoredAvatarPortrait(graphics, size);

    graphics.strokeColor = rgba(37, 25, 15, 255);
    graphics.lineWidth = Math.max(2, size * 0.065);
    graphics.circle(0, 0, radius * 0.96 - graphics.lineWidth / 2);
    graphics.stroke();
    graphics.strokeColor = rgba(232, 186, 82, 240);
    graphics.lineWidth = Math.max(2, size * 0.026);
    graphics.circle(0, 0, radius * 0.82);
    graphics.stroke();

    graphics.strokeColor = rgba(255, 228, 150, 170);
    graphics.lineWidth = Math.max(1, size * 0.011);
    graphics.arc(0, 0, radius * 0.72, Math.PI * 0.08, Math.PI * 0.58, false);
    graphics.stroke();

    const crest = this.safeText(displayName).slice(0, 1).toUpperCase() || 'L';
    this.addChildLabel(avatarNode, 'AvatarCrestLetter', crest, 0, -size * 0.34, Math.max(10, size * 0.13), rgba(238, 208, 142), new Size(size * 0.44, size * 0.18));
  }

  private drawAvatarFrameOrnaments(graphics: Graphics, size: number): void {
    const scale = size / 104;
    const top = size * 0.56;
    const bottom = -size * 0.56;
    const left = -size * 0.56;
    const right = size * 0.56;
    graphics.fillColor = rgba(108, 77, 34, 190);
    graphics.moveTo(0, top + 7 * scale);
    graphics.lineTo(8 * scale, top - 5 * scale);
    graphics.lineTo(0, top - 15 * scale);
    graphics.lineTo(-8 * scale, top - 5 * scale);
    graphics.close();
    graphics.fill();
    graphics.moveTo(0, bottom - 7 * scale);
    graphics.lineTo(8 * scale, bottom + 5 * scale);
    graphics.lineTo(0, bottom + 15 * scale);
    graphics.lineTo(-8 * scale, bottom + 5 * scale);
    graphics.close();
    graphics.fill();

    graphics.strokeColor = rgba(206, 162, 78, 165);
    graphics.lineWidth = 1.2 * scale;
    graphics.moveTo(left - 6 * scale, 0);
    graphics.lineTo(left + 12 * scale, 0);
    graphics.moveTo(right - 12 * scale, 0);
    graphics.lineTo(right + 6 * scale, 0);
    graphics.stroke();
  }

  private drawArmoredAvatarPortrait(graphics: Graphics, size: number): void {
    const scale = size / 104;
    graphics.fillColor = rgba(7, 8, 12, 250);
    graphics.moveTo(-27 * scale, -26 * scale);
    graphics.lineTo(-16 * scale, -4 * scale);
    graphics.lineTo(0, 6 * scale);
    graphics.lineTo(17 * scale, -4 * scale);
    graphics.lineTo(30 * scale, -28 * scale);
    graphics.lineTo(22 * scale, -39 * scale);
    graphics.lineTo(-22 * scale, -39 * scale);
    graphics.close();
    graphics.fill();

    graphics.fillColor = rgba(83, 86, 96, 245);
    graphics.moveTo(-26 * scale, 12 * scale);
    graphics.lineTo(-14 * scale, 34 * scale);
    graphics.lineTo(0, 41 * scale);
    graphics.lineTo(15 * scale, 34 * scale);
    graphics.lineTo(27 * scale, 12 * scale);
    graphics.lineTo(18 * scale, -11 * scale);
    graphics.lineTo(-18 * scale, -11 * scale);
    graphics.close();
    graphics.fill();

    graphics.fillColor = rgba(19, 20, 25, 245);
    graphics.moveTo(-20 * scale, 10 * scale);
    graphics.lineTo(-9 * scale, 27 * scale);
    graphics.lineTo(0, 31 * scale);
    graphics.lineTo(10 * scale, 27 * scale);
    graphics.lineTo(21 * scale, 10 * scale);
    graphics.lineTo(12 * scale, -18 * scale);
    graphics.lineTo(-12 * scale, -18 * scale);
    graphics.close();
    graphics.fill();

    graphics.fillColor = rgba(168, 145, 116, 238);
    graphics.moveTo(-8 * scale, 8 * scale);
    graphics.lineTo(0, 21 * scale);
    graphics.lineTo(9 * scale, 8 * scale);
    graphics.lineTo(6 * scale, -10 * scale);
    graphics.lineTo(-6 * scale, -10 * scale);
    graphics.close();
    graphics.fill();

    graphics.strokeColor = rgba(219, 173, 74, 210);
    graphics.lineWidth = 1.7 * scale;
    graphics.moveTo(-28 * scale, 12 * scale);
    graphics.lineTo(0, 42 * scale);
    graphics.lineTo(29 * scale, 12 * scale);
    graphics.moveTo(0, 38 * scale);
    graphics.lineTo(0, -18 * scale);
    graphics.stroke();

    graphics.strokeColor = rgba(221, 45, 48, 170);
    graphics.lineWidth = 1.3 * scale;
    graphics.moveTo(-18 * scale, -9 * scale);
    graphics.lineTo(18 * scale, -9 * scale);
    graphics.stroke();
  }

  private addExpBadge(parent: Node, x: number, y: number, scale: number): void {
    const width = 50 * scale;
    const height = 24 * scale;
    const badge = this.addChildBeveledPanelNode(parent, 'LobbyPlayerExpBadge', x, y, width, height, rgba(84, 42, 13, 238), rgba(224, 174, 73, 235), 5 * scale);
    this.addChildLabel(badge, 'Label', 'EXP', 0, 0, 14 * scale, rgba(245, 210, 122), new Size(width, height));
  }

  private addProfileRow(parent: Node, label: string, value: string, x: number, y: number, width: number, layout: UiLayout): void {
    const height = 34 * layout.uiScale;
    const row = this.addChildBeveledPanelNode(parent, `LobbyProfileRow_${label}`, x, y, width, height, rgba(18, 15, 16, 184), rgba(91, 70, 39, 190), 8 * layout.uiScale);
    this.addChildLabel(
      row,
      'RowLabel',
      label,
      -width / 2 + 18 * layout.uiScale,
      0,
      Math.max(11, 15 * layout.uiScale),
      rgba(178, 159, 119),
      new Size(width * 0.35, height),
      Label.HorizontalAlign.LEFT,
    );
    this.addChildLabel(
      row,
      'RowValue',
      value || LOBBY_PROFILE_PLACEHOLDER,
      width * 0.05,
      0,
      Math.max(12, 16 * layout.uiScale),
      rgba(236, 216, 169),
      new Size(width * 0.56, height),
      Label.HorizontalAlign.LEFT,
    );
  }

  private addBeveledPanelNode(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel = 10): Node {
    const node = this.createUiNode(name);
    node.setPosition(new Vec3(x, y, 0));
    this.drawBeveledPanelOnNode(node, width, height, fill, stroke, bevel);
    return node;
  }

  private addChildBeveledPanelNode(parent: Node, name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel = 10): Node {
    const node = new Node(name);
    node.layer = this.node.layer;
    parent.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    this.drawBeveledPanelOnNode(node, width, height, fill, stroke, bevel);
    return node;
  }

  private drawBeveledPanelOnNode(node: Node, width: number, height: number, fill: Color, stroke: Color, bevel: number): Graphics {
    node.addComponent(UITransform).setContentSize(new Size(width, height));
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = fill;
    this.traceBeveledRect(graphics, width, height, bevel);
    graphics.fill();
    graphics.strokeColor = stroke;
    graphics.lineWidth = 2;
    this.traceBeveledRect(graphics, width, height, bevel);
    graphics.stroke();
    return graphics;
  }

  private async login(): Promise<void> {
    if (!this.agreementAccepted) {
      this.setStatus('请先同意用户协议和隐私政策。');
      return;
    }

    const account = this.accountInput?.string.trim() || String(AppConfig.defaultDevUserId);
    const userId = this.resolveDevUserId(account);
    this.api.setApiBaseUrl(AppConfig.apiBaseUrl);
    this.setStatus(`登录请求：${AppConfig.apiBaseUrl}`);
    try {
      const token = await this.api.auth.devLogin(userId);
      this.lastDevUserId = userId;
      this.lobbyProfile = null;
      this.lobbyProfileOpen = false;
      this.lobbyProfileError = '';
      this.lastTokenName = token.tokenName;
      this.startLobbyLoading();
      void this.loadLobbyProfile(userId);
    } catch (error) {
      this.setStatus(this.formatApiError(error, AppConfig.apiBaseUrl));
    }
  }

  private startLobbyLoading(): void {
    const ticket = ++this.resourceLoadTicket;
    this.loadingProgress = 0.04;
    this.loadingMessage = `登录成功：${this.lastTokenName || 'player-token'}，准备资源清单...`;
    this.loadingError = '';
    this.currentView = 'loading';
    this.renderLoading();
    this.loadLobbyResources(ticket).catch((error: unknown) => {
      if (ticket !== this.resourceLoadTicket) {
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.loadingProgress = 0;
      this.loadingError = `资源加载失败：${message}`;
      this.renderLoading();
    });
  }

  private async loadLobbyResources(ticket: number): Promise<void> {
    await this.setLoadingProgress(ticket, 0.16, '检查大厅背景资源...');
    this.lobbyPosterFrame = await this.loadSpriteFrameResource(LOBBY_POSTER_PATH);
    if (USE_LOBBY_NATIVE_VIDEO_BACKGROUND) {
      await this.setLoadingProgress(ticket, 0.48, '大厅首帧准备完成，加载动态背景...');
      this.lobbyVideoClip = await this.loadVideoClipResource(LOBBY_VIDEO_PATH);
      await this.setLoadingProgress(ticket, 0.82, '大厅动态背景准备完成，整理界面状态...');
    } else {
      this.lobbyVideoClip = null;
      await this.setLoadingProgress(ticket, 0.82, '大厅静态背景准备完成，整理界面状态...');
    }
    await this.setLoadingProgress(ticket, 1, '资源加载完成，进入圣契大厅...');
    if (ticket !== this.resourceLoadTicket) {
      return;
    }
    this.currentView = 'lobby';
    this.renderLobby();
  }

  private async setLoadingProgress(ticket: number, progress: number, message: string): Promise<void> {
    if (ticket !== this.resourceLoadTicket) {
      return;
    }
    this.loadingProgress = progress;
    this.loadingMessage = message;
    this.loadingError = '';
    if (this.currentView === 'loading') {
      this.renderLoading();
    }
    await this.delay(80);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private loadVideoClipResource(path: string): Promise<VideoClip> {
    return new Promise((resolve, reject) => {
      resources.load(path, VideoClip, (error, clip) => {
        if (error || !clip) {
          reject(error ?? new Error(`video clip not found: ${path}`));
          return;
        }
        resolve(clip);
      });
    });
  }

  private loadSpriteFrameResource(path: string): Promise<SpriteFrame> {
    return new Promise((resolve, reject) => {
      resources.load(`${path}/spriteFrame`, SpriteFrame, (spriteError, spriteFrame) => {
        if (!spriteError && spriteFrame) {
          resolve(spriteFrame);
          return;
        }

        resources.load(`${path}/texture`, Texture2D, (textureError, texture) => {
          if (textureError || !texture) {
            reject(textureError ?? spriteError ?? new Error(`sprite frame not found: ${path}`));
            return;
          }
          const runtimeSpriteFrame = new SpriteFrame();
          runtimeSpriteFrame.texture = texture;
          resolve(runtimeSpriteFrame);
        });
      });
    });
  }

  private resolveDevUserId(account: string): number {
    const parsed = Number(account);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return AppConfig.defaultDevUserId;
  }

  private addStatus(text: string, layout?: UiLayout, y?: number): void {
    const currentLayout = layout ?? this.resolveLayout();
    const statusY = y ?? currentLayout.safeBottom + Math.max(8 * currentLayout.uiScale, currentLayout.safeHeight * 0.01);
    const centerX = (currentLayout.stageLeft + currentLayout.stageRight) / 2;
    this.statusLabel = this.addLabel(text, centerX, statusY, currentLayout.bodyFont, rgba(127, 214, 255), new Size(currentLayout.statusWidth, 48 * currentLayout.uiScale));
  }

  private setStatus(text: string): void {
    if (!this.statusLabel) {
      this.addStatus(text);
      return;
    }
    this.statusLabel.string = this.trimText(text);
  }

  private addLabel(text: string, x: number, y: number, size = 20, color = new Color(230, 230, 230), contentSize?: Size): Label {
    const node = this.createUiNode('Label');
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    transform.setContentSize(contentSize ?? new Size(this.resolveLayout().statusWidth, 80));
    const label = node.addComponent(Label);
    label.string = this.trimText(text);
    label.fontSize = size;
    label.lineHeight = size + 8;
    label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.RESIZE_HEIGHT;
    return label;
  }

  private addEditBox(initialText: string, x: number, y: number, width: number, layout?: UiLayout, password = false): EditBox {
    const currentLayout = layout ?? this.resolveLayout();
    const node = this.createUiNode('EditBox');
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(width, currentLayout.inputHeight));
    const editBox = node.addComponent(EditBox);
    editBox.maxLength = 256;
    editBox.placeholder = '';
    if (password) {
      editBox.inputFlag = EditBox.InputFlag.PASSWORD;
    }

    const textNode = new Node('TextLabel');
    textNode.layer = node.layer;
    node.addChild(textNode);
    textNode.setPosition(Vec3.ZERO);
    textNode.addComponent(UITransform).setContentSize(new Size(width - 28, currentLayout.inputHeight));
    const textLabel = textNode.addComponent(Label);
    textLabel.fontSize = Math.max(13, currentLayout.bodyFont - 1);
    textLabel.lineHeight = currentLayout.bodyFont + 5;
    textLabel.color = rgba(231, 226, 214);
    textLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
    textLabel.verticalAlign = Label.VerticalAlign.CENTER;
    textLabel.overflow = Label.Overflow.CLAMP;

    const placeholderNode = new Node('PlaceholderLabel');
    placeholderNode.layer = node.layer;
    node.addChild(placeholderNode);
    placeholderNode.setPosition(Vec3.ZERO);
    placeholderNode.addComponent(UITransform).setContentSize(new Size(width - 28, currentLayout.inputHeight));
    const placeholderLabel = placeholderNode.addComponent(Label);
    placeholderLabel.fontSize = Math.max(13, currentLayout.bodyFont - 1);
    placeholderLabel.lineHeight = currentLayout.bodyFont + 5;
    placeholderLabel.color = rgba(120, 114, 105);
    placeholderLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
    placeholderLabel.verticalAlign = Label.VerticalAlign.CENTER;
    placeholderLabel.overflow = Label.Overflow.CLAMP;
    placeholderLabel.string = '';

    editBox.textLabel = textLabel;
    editBox.placeholderLabel = placeholderLabel;
    editBox.string = initialText;
    if (password) {
      editBox.inputFlag = EditBox.InputFlag.PASSWORD;
      this.applyPasswordMask(editBox, textLabel);
    }
    return editBox;
  }

  private applyPasswordMask(editBox: EditBox, textLabel: Label): void {
    const mask = () => {
      textLabel.string = '*'.repeat(editBox.string.length);
    };
    mask();
    editBox.node.on(EditBox.EventType.TEXT_CHANGED, mask, this);
    editBox.node.on(EditBox.EventType.EDITING_DID_ENDED, mask, this);
    editBox.node.on(EditBox.EventType.EDITING_RETURN, mask, this);
  }

  private addFramedEditBox(initialText: string, x: number, y: number, width: number, layout: UiLayout, password = false): EditBox {
    this.addBeveledPanel('InputFrame', x, y, width + 28, layout.inputHeight + 8, rgba(8, 7, 9, 220), rgba(185, 138, 58, 190), 8);
    return this.addEditBox(initialText, x, y, width, layout, password);
  }

  private addButton(text: string, x: number, y: number, callback: () => void, layout?: UiLayout, width?: number, height?: number): Button {
    const currentLayout = layout ?? this.resolveLayout();
    const buttonWidth = width ?? 140;
    const buttonHeight = height ?? currentLayout.buttonHeight;
    const node = this.createUiNode(`Button_${text || 'empty'}`);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(buttonWidth, buttonHeight));
    this.applyButtonVisual(node, buttonWidth, buttonHeight);
    const button = node.addComponent(Button);
    node.on(Button.EventType.CLICK, callback, this);

    const labelNode = new Node('Label');
    labelNode.layer = node.layer;
    node.addChild(labelNode);
    labelNode.setPosition(Vec3.ZERO);
    labelNode.addComponent(UITransform).setContentSize(new Size(buttonWidth, buttonHeight));
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = Math.max(14, Math.min(currentLayout.bodyFont + 2, buttonHeight * 0.46));
    label.lineHeight = label.fontSize + 8;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.color = rgba(245, 210, 122);
    return button;
  }

  private addGoldButton(text: string, x: number, y: number, callback: () => void, layout: UiLayout, width: number, height: number): Button {
    return this.addButton(text, x, y, callback, layout, width, height);
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
    const frame = this.resolveUiSpriteFrame(assetPath);
    if (!frame) {
      this.requestSpriteFrame(assetPath);
      return this.addGoldButton(text, x, y, callback, layout, Math.min(width * 0.74, layout.contentWidth * 0.52), Math.min(height * 0.56, 72 * layout.uiScale));
    }

    const node = this.createUiNode(name);
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    const sprite = node.addComponent(Sprite);
    sprite.type = Sprite.Type.SIMPLE;
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.spriteFrame = frame;
    transform.setContentSize(new Size(width, height));
    const button = node.addComponent(Button);
    node.on(Button.EventType.CLICK, callback, this);
    this.applyImageButtonFeedback(node);

    const iconScale = Math.max(0.5, Math.min(0.62, fontSize / 46));
    this.addAccountGlyph(node, -54 * layout.uiScale, -1 * layout.uiScale, iconScale);
    this.addChildLabel(node, 'Label', text, 22 * layout.uiScale, 0, fontSize, rgba(235, 213, 166), new Size(width * 0.58, height * 0.52));
    return button;
  }

  private addRailImageButton(asset: RailButtonAsset, x: number, y: number, layout: UiLayout): Button {
    const railWidth = 76 * layout.uiScale;
    const railHeight = 74 * layout.uiScale;
    const iconSize = 46 * layout.uiScale;
    const node = this.createUiNode(`Rail_${asset.label}`);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(railWidth, railHeight));
    const button = node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.setStatus('该入口为登录页占位，当前阶段暂未开放。'), this);
    this.applyImageButtonFeedback(node);

    if (!this.addSprite('Icon', asset.path, 0, 15 * layout.uiScale, iconSize, iconSize, node)) {
      this.addDiamondButton('', x, y + 14, () => this.setStatus('该入口为登录页占位，当前阶段暂未开放。'), layout);
    }
    this.addChildLabel(node, 'Label', asset.label, 0, -27 * layout.uiScale, Math.max(13, 18 * layout.uiScale), rgba(229, 196, 122), new Size(72 * layout.uiScale, 28 * layout.uiScale));
    return button;
  }

  private addDiamondButton(text: string, x: number, y: number, callback: () => void, layout: UiLayout): Button {
    const size = 48 * layout.uiScale;
    const node = this.createUiNode(`Diamond_${text}`);
    node.setPosition(new Vec3(x, y, 0));
    node.angle = 45;
    node.addComponent(UITransform).setContentSize(new Size(size, size));
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(10, 8, 9, 232);
    graphics.strokeColor = rgba(185, 138, 58, 210);
    graphics.lineWidth = 2;
    graphics.rect(-size / 2, -size / 2, size, size);
    graphics.fill();
    graphics.stroke();
    const button = node.addComponent(Button);
    node.on(Button.EventType.CLICK, callback, this);
    this.applyPointerCursor(node);

    const labelNode = new Node('Label');
    labelNode.layer = node.layer;
    node.addChild(labelNode);
    labelNode.angle = -45;
    labelNode.setPosition(Vec3.ZERO);
    labelNode.addComponent(UITransform).setContentSize(new Size(size, size));
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = Math.max(14, layout.bodyFont + 2);
    label.lineHeight = label.fontSize + 8;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.color = rgba(245, 210, 122);
    return button;
  }

  private addSprite(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null {
    const frame = this.resolveUiSpriteFrame(assetPath);
    if (!frame) {
      this.requestSpriteFrame(assetPath);
      return null;
    }
    const node = new Node(name);
    node.layer = this.node.layer;
    (parent ?? this.ensureContentRoot()).addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    const sprite = node.addComponent(Sprite);
    sprite.type = Sprite.Type.SIMPLE;
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.spriteFrame = frame;
    transform.setContentSize(new Size(width, height));
    return sprite;
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
    horizontalAlign: Label.HorizontalAlign = Label.HorizontalAlign.CENTER,
  ): Label {
    const labelNode = new Node(name);
    labelNode.layer = this.node.layer;
    parent.addChild(labelNode);
    labelNode.setPosition(new Vec3(this.resolveAlignedLabelX(x, contentSize.width, horizontalAlign), y, 0));
    labelNode.addComponent(UITransform).setContentSize(contentSize);
    const label = labelNode.addComponent(Label);
    label.string = this.trimText(text);
    label.fontSize = size;
    label.lineHeight = size + 8;
    label.horizontalAlign = horizontalAlign;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.CLAMP;
    label.color = color;
    return label;
  }

  private resolveAlignedLabelX(x: number, width: number, horizontalAlign: Label.HorizontalAlign): number {
    if (horizontalAlign === Label.HorizontalAlign.LEFT) {
      return x + width / 2;
    }
    if (horizontalAlign === Label.HorizontalAlign.RIGHT) {
      return x - width / 2;
    }
    return x;
  }

  private addAccountGlyph(parent: Node, x: number, y: number, scale: number): void {
    const iconNode = new Node('AccountGlyph');
    iconNode.layer = this.node.layer;
    parent.addChild(iconNode);
    iconNode.setPosition(new Vec3(x, y, 0));
    iconNode.setScale(new Vec3(scale, scale, 1));
    iconNode.addComponent(UITransform).setContentSize(new Size(34, 38));
    const graphics = iconNode.addComponent(Graphics);
    graphics.fillColor = rgba(226, 203, 154, 246);
    graphics.circle(0, 10, 11);
    graphics.fill();
    graphics.rect(-10, -16, 20, 18);
    graphics.fill();
    graphics.circle(0, -16, 10);
    graphics.fill();
  }

  private addRect(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke?: Color, lineWidth = 1): Graphics {
    const node = this.createUiNode(name);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(width, height));
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = fill;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    if (stroke) {
      graphics.strokeColor = stroke;
      graphics.lineWidth = lineWidth;
      graphics.rect(-width / 2, -height / 2, width, height);
      graphics.stroke();
    }
    return graphics;
  }

  private addBeveledPanel(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel = 10): Graphics {
    const node = this.createUiNode(name);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(width, height));
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = fill;
    this.traceBeveledRect(graphics, width, height, bevel);
    graphics.fill();
    graphics.strokeColor = stroke;
    graphics.lineWidth = 2;
    this.traceBeveledRect(graphics, width, height, bevel);
    graphics.stroke();
    return graphics;
  }

  private addProgressBar(x: number, y: number, width: number, height: number, progress: number): void {
    const background = this.addRect('LoadingProgressTrack', x, y, width, height, rgba(8, 7, 9, 236), rgba(185, 138, 58, 210), 2);
    background.lineWidth = 2;
    const fillWidth = Math.max(0, width * clamp(progress, 0, 1));
    if (fillWidth <= 0) {
      return;
    }
    const fillNode = this.createUiNode('LoadingProgressFill');
    fillNode.setPosition(new Vec3(x - width / 2 + fillWidth / 2, y, 0));
    fillNode.addComponent(UITransform).setContentSize(new Size(fillWidth, height - 6));
    const fill = fillNode.addComponent(Graphics);
    fill.fillColor = rgba(201, 39, 61, 230);
    fill.rect(-fillWidth / 2, -(height - 6) / 2, fillWidth, height - 6);
    fill.fill();
    fill.strokeColor = rgba(245, 210, 122, 180);
    fill.lineWidth = 1;
    fill.rect(-fillWidth / 2, -(height - 6) / 2, fillWidth, height - 6);
    fill.stroke();
  }

  private applyButtonVisual(node: Node, width: number, height: number): void {
    const graphics = node.addComponent(Graphics);
    this.drawButtonFrame(graphics, width, height, 'normal');
    this.applyPointerCursor(node);
    node.on(Node.EventType.MOUSE_ENTER, () => this.drawButtonFrame(graphics, width, height, 'hover'), this);
    node.on(Node.EventType.MOUSE_LEAVE, () => {
      node.setScale(Vec3.ONE);
      this.drawButtonFrame(graphics, width, height, 'normal');
    }, this);
    node.on(Node.EventType.TOUCH_START, () => {
      node.setScale(new Vec3(0.96, 0.96, 1));
      this.drawButtonFrame(graphics, width, height, 'pressed');
    }, this);
    node.on(Node.EventType.TOUCH_END, () => {
      node.setScale(Vec3.ONE);
      this.drawButtonFrame(graphics, width, height, 'hover');
    }, this);
    node.on(Node.EventType.TOUCH_CANCEL, () => {
      node.setScale(Vec3.ONE);
      this.drawButtonFrame(graphics, width, height, 'normal');
    }, this);
  }

  private applyImageButtonFeedback(node: Node): void {
    this.applyPointerCursor(node);
    node.on(Node.EventType.MOUSE_ENTER, () => node.setScale(new Vec3(1.035, 1.035, 1)), this);
    node.on(Node.EventType.MOUSE_LEAVE, () => node.setScale(Vec3.ONE), this);
    node.on(Node.EventType.TOUCH_START, () => node.setScale(new Vec3(0.975, 0.975, 1)), this);
    node.on(Node.EventType.TOUCH_END, () => node.setScale(Vec3.ONE), this);
    node.on(Node.EventType.TOUCH_CANCEL, () => node.setScale(Vec3.ONE), this);
  }

  private applyPointerCursor(node: Node): void {
    node.on(Node.EventType.MOUSE_ENTER, () => this.setPointerCursor(true), this);
    node.on(Node.EventType.MOUSE_LEAVE, () => this.setPointerCursor(false), this);
  }

  private setPointerCursor(enabled: boolean): void {
    const maybeDocument = (globalThis as { document?: CursorDocument }).document;
    const style = maybeDocument?.body?.style;
    if (style) {
      style.cursor = enabled ? 'pointer' : '';
    }
  }

  private preloadUiSprites(): void {
    if (!SHOW_LOGIN_BRAND && !SHOW_RIGHT_RAIL && !USE_IMAGE_LOGIN_BUTTON) {
      return;
    }
    if (SHOW_LOGIN_BRAND && !this.logoFrame) {
      this.requestSpriteFrame(UI_ASSETS.logo);
    }
    if (USE_IMAGE_LOGIN_BUTTON && !this.mainButtonFrame) {
      this.requestSpriteFrame(UI_ASSETS.mainButton);
    }
    if (SHOW_RIGHT_RAIL && this.rightRailFrames.length < UI_ASSETS.rightRail.length) {
      UI_ASSETS.rightRail.forEach((asset) => this.requestSpriteFrame(asset.path));
    }
  }

  private requestSpriteFrame(path: string): void {
    if (this.spriteFrames.has(path) || this.loadingSpriteFrames.has(path)) {
      return;
    }
    this.loadingSpriteFrames.add(path);
    resources.load(path, SpriteFrame, (error, frame) => {
      this.loadingSpriteFrames.delete(path);
      if (error) {
        console.warn(`[LootChain] UI sprite load failed: ${path}`, error);
        return;
      }
      if (!error && frame) {
        this.spriteFrames.set(path, frame);
        if (this.node.isValid) {
          this.renderCurrentView();
        }
      }
    });
  }

  private resolveUiSpriteFrame(path: string): SpriteFrame | undefined {
    if (path === UI_ASSETS.logo && this.logoFrame) {
      return this.logoFrame;
    }
    if (path === UI_ASSETS.mainButton && this.mainButtonFrame) {
      return this.mainButtonFrame;
    }
    const railIndex = UI_ASSETS.rightRail.findIndex((asset) => asset.path === path);
    if (railIndex >= 0 && this.rightRailFrames[railIndex]) {
      return this.rightRailFrames[railIndex];
    }
    return this.spriteFrames.get(path);
  }

  private drawButtonFrame(graphics: Graphics, width: number, height: number, state: ButtonVisualState): void {
    graphics.clear();
    const fill = state === 'pressed' ? rgba(78, 20, 25, 232) : state === 'hover' ? rgba(62, 47, 30, 236) : rgba(22, 18, 17, 224);
    const stroke = state === 'pressed' ? rgba(201, 39, 61, 235) : state === 'hover' ? rgba(245, 210, 122, 245) : rgba(185, 138, 58, 218);
    graphics.fillColor = fill;
    this.traceBeveledRect(graphics, width, height, Math.min(16, height * 0.28));
    graphics.fill();
    graphics.strokeColor = stroke;
    graphics.lineWidth = state === 'normal' ? 2 : 3;
    this.traceBeveledRect(graphics, width, height, Math.min(16, height * 0.28));
    graphics.stroke();
  }

  private traceBeveledRect(graphics: Graphics, width: number, height: number, bevel: number): void {
    const left = -width / 2;
    const right = width / 2;
    const top = height / 2;
    const bottom = -height / 2;
    const cut = Math.min(bevel, width / 5, height / 3);
    graphics.moveTo(left + cut, top);
    graphics.lineTo(right - cut, top);
    graphics.lineTo(right, top - cut);
    graphics.lineTo(right, bottom + cut);
    graphics.lineTo(right - cut, bottom);
    graphics.lineTo(left + cut, bottom);
    graphics.lineTo(left, bottom + cut);
    graphics.lineTo(left, top - cut);
    graphics.close();
  }

  private createUiNode(name: string): Node {
    const node = new Node(name);
    node.layer = this.node.layer;
    this.ensureContentRoot().addChild(node);
    return node;
  }

  private ensureContentRoot(): Node {
    if (this.contentRoot?.isValid) {
      return this.contentRoot;
    }
    const root = new Node('LootChainCocosLoginUIRoot');
    root.layer = this.node.layer;
    this.node.addChild(root);
    this.contentRoot = root;
    return root;
  }

  private run(action: AsyncAction): void {
    this.setStatus('请求中...');
    action().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(message);
    });
  }

  private formatApiError(error: unknown, fallbackBaseUrl: string): string {
    if (error instanceof ApiError) {
      const requestUrl = error.requestUrl || `${fallbackBaseUrl}/api/player/auth/dev-login`;
      return `登录失败：${error.message}\ncode=${error.code}\nurl=${requestUrl}\n检查 lootchain-game 是否运行在 http://localhost:8081。`;
    }
    const message = error instanceof Error ? error.message : String(error);
    return `登录失败：${message}\nurl=${fallbackBaseUrl}/api/player/auth/dev-login`;
  }

  private maskWalletAddress(address?: string | null): string {
    const clean = this.safeText(address || '');
    if (!clean) {
      return LOBBY_PROFILE_PLACEHOLDER;
    }
    if (clean.length <= 12) {
      return clean;
    }
    return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
  }

  private formatInteger(value: number | null | undefined): string {
    const safeValue = this.positiveInteger(value, 0);
    return String(safeValue).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private positiveInteger(value: number | null | undefined, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return fallback;
    }
    return Math.floor(parsed);
  }

  private safeText(value: string | null | undefined): string {
    return this.trimText(String(value ?? '').trim());
  }

  private trimText(text: string): string {
    return text.length > 1200 ? `${text.slice(0, 1200)}...` : text;
  }

  private resolveLayout(): UiLayout {
    const visibleSize = this.visibleSize();
    const width = Math.max(MIN_VISIBLE_WIDTH, visibleSize.width);
    const height = Math.max(MIN_VISIBLE_HEIGHT, visibleSize.height);
    const stage = this.resolveStageBounds(width, height);
    const stageWidth = stage.width;
    const stageHeight = stage.height;
    const uiScale = Math.min(1, stageWidth / LOGIN_REFERENCE_WIDTH, stageHeight / LOGIN_REFERENCE_HEIGHT);
    const stageLeft = stage.centerX - stageWidth / 2;
    const stageRight = stage.centerX + stageWidth / 2;
    const stageTop = stage.centerY + stageHeight / 2;
    const stageBottom = stage.centerY - stageHeight / 2;
    const safeInsetX = clamp(stageWidth * 0.035, 12, 68 * Math.max(uiScale, 0.75));
    const safeInsetY = clamp(stageHeight * 0.035, 10, 54 * Math.max(uiScale, 0.75));
    const safeLeft = stageLeft + safeInsetX;
    const safeRight = stageRight - safeInsetX;
    const safeTop = stageTop - safeInsetY;
    const safeBottom = stageBottom + safeInsetY;
    const safeWidth = Math.max(120 * uiScale, safeRight - safeLeft);
    const safeHeight = Math.max(100 * uiScale, safeTop - safeBottom);
    const contentWidth = Math.max(260 * uiScale, safeWidth);
    return {
      width,
      height,
      stageWidth,
      stageHeight,
      stageLeft,
      stageRight,
      stageTop,
      stageBottom,
      safeLeft,
      safeRight,
      safeTop,
      safeBottom,
      safeWidth,
      safeHeight,
      safeInsetX,
      safeInsetY,
      uiScale,
      contentWidth,
      topY: safeTop - 48 * uiScale,
      inputHeight: 46 * uiScale,
      buttonHeight: 48 * uiScale,
      statusWidth: Math.min(contentWidth, 760 * uiScale),
      bodyFont: Math.max(13, 18 * uiScale),
    };
  }

  private resolveStageBounds(visibleWidth: number, visibleHeight: number): StageBounds {
    const stageNode = this.findStageNode();
    const transform = stageNode?.getComponent(UITransform);
    if (stageNode && transform) {
      const nodeScale = stageNode.scale;
      const contentSize = transform.contentSize;
      const stageWidth = Math.min(visibleWidth, Math.abs(contentSize.width * nodeScale.x));
      const stageHeight = Math.min(visibleHeight, Math.abs(contentSize.height * nodeScale.y));
      return {
        width: Math.max(MIN_VISIBLE_WIDTH, stageWidth),
        height: Math.max(MIN_VISIBLE_HEIGHT, stageHeight),
        centerX: stageNode.position.x,
        centerY: stageNode.position.y,
      };
    }
    return {
      width: visibleWidth,
      height: visibleHeight,
      centerX: 0,
      centerY: 0,
    };
  }

  private findStageNode(): Node | null {
    for (const name of LOGIN_STAGE_NODE_NAMES) {
      const stageNode = this.node.getChildByName(name);
      if (stageNode?.activeInHierarchy) {
        return stageNode;
      }
    }
    return null;
  }

  private applyRootSize(layout: UiLayout): void {
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(new Size(layout.width, layout.height));
  }

  private visibleSize(): Size {
    const size = view.getVisibleSize();
    const width = Math.round(size.width || 0);
    const height = Math.round(size.height || 0);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return new Size(width, height);
    }
    const runtimeSize = this.runtimeWindowSize();
    if (runtimeSize) {
      return runtimeSize;
    }
    return new Size(LOGIN_REFERENCE_WIDTH, LOGIN_REFERENCE_HEIGHT);
  }

  private runtimeWindowSize(): Size | null {
    const runtime = globalThis as { innerHeight?: number; innerWidth?: number };
    const width = Math.round(runtime.innerWidth || 0);
    const height = Math.round(runtime.innerHeight || 0);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return new Size(width, height);
    }
    return null;
  }

  private makeLayoutKey(): string {
    const layout = this.resolveLayout();
    const stageKey = `${Math.round(layout.stageLeft)},${Math.round(layout.stageBottom)},${Math.round(layout.stageWidth)}x${Math.round(layout.stageHeight)}`;
    return `${this.currentView}:${layout.width}x${layout.height}:${stageKey}:${this.agreementAccepted ? 'agree' : 'deny'}:${this.lobbyProfileOpen ? 'profile-open' : 'profile-closed'}`;
  }
}
