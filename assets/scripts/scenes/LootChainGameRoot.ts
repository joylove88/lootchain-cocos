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
  UITransform,
  Vec3,
  view,
} from 'cc';
import { AppConfig } from '../app/AppConfig';
import { lootChainApi, LootChainApi } from '../api/LootChainApi';
import { ApiError } from '../net/HttpClient';

const { ccclass, property } = _decorator;

type AsyncAction = () => Promise<void>;
type ButtonVisualState = 'hover' | 'normal' | 'pressed';
type ViewName = 'login' | 'loginDialog' | 'loginAccepted';

function rgba(red: number, green: number, blue: number, alpha = 255): Color {
  return new Color(red, green, blue, alpha);
}

interface UiLayout {
  width: number;
  height: number;
  contentWidth: number;
  topY: number;
  inputHeight: number;
  buttonHeight: number;
  statusWidth: number;
  bodyFont: number;
}

interface RailButtonAsset {
  label: string;
  path: string;
}

const UI_ASSETS = {
  logo: 'ui/login/login_logo/spriteFrame',
  mainButton: 'ui/login/login_button_main/spriteFrame',
  rightRail: [
    { label: '谕言', path: 'ui/login/side_btn_prophecy/spriteFrame' },
    { label: '客服', path: 'ui/login/side_btn_service/spriteFrame' },
    { label: '公告', path: 'ui/login/side_btn_notice/spriteFrame' },
    { label: '修复', path: 'ui/login/side_btn_repair/spriteFrame' },
  ] satisfies RailButtonAsset[],
};

const SHOW_LOGIN_BRAND = false;
const SHOW_RIGHT_RAIL = false;
const USE_IMAGE_LOGIN_BUTTON = false;

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

  start(): void {
    this.currentView = this.api.tokenStore.isLoggedIn() ? 'loginAccepted' : 'login';
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
    if (this.currentView === 'loginAccepted') {
      this.renderLoginAccepted();
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
    const buttonWidth = Math.min(660, Math.max(520, layout.contentWidth * 0.5));
    const buttonHeight = Math.round(buttonWidth * 0.244);
    if (USE_IMAGE_LOGIN_BUTTON) {
      this.addImageButton(
        'MainAccountLoginButton',
        UI_ASSETS.mainButton,
        '账号登录',
        0,
        -layout.height * 0.31,
        () => this.renderLoginDialog(),
        layout,
        buttonWidth,
        buttonHeight,
        Math.max(28, layout.bodyFont + 10),
      );
    } else {
      this.addGoldButton('账号登录', 0, -layout.height * 0.31, () => this.renderLoginDialog(), layout, Math.min(430, layout.contentWidth * 0.42), 64);
    }
    this.addStatus('等待圣契召唤。', layout);
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

    const panelWidth = Math.min(620, layout.contentWidth * 0.7);
    const panelHeight = 430;
    const panelY = -layout.height * 0.08;
    const inputWidth = Math.min(430, panelWidth - 130);
    this.addBeveledPanel('LoginDialogPanel', 0, panelY, panelWidth, panelHeight, rgba(10, 8, 9, 226), rgba(214, 177, 94, 230), 18);
    this.addLabel('账号登录', 0, panelY + 168, 30, rgba(245, 210, 122), new Size(panelWidth - 80, 46));

    this.addLabel('账号 / 邮箱', 0, panelY + 102, 17, rgba(215, 210, 198), new Size(inputWidth, 28));
    this.accountInput = this.addFramedEditBox(String(AppConfig.defaultDevUserId), 0, panelY + 62, inputWidth, layout);
    this.addLabel('密码', 0, panelY + 12, 17, rgba(215, 210, 198), new Size(inputWidth, 28));
    this.passwordInput = this.addFramedEditBox('', 0, panelY - 28, inputWidth, layout);

    this.addGoldButton('进入游戏', 0, panelY - 96, () => this.run(() => this.login()), layout, Math.min(360, inputWidth), 54);
    this.renderThirdPartyLogin(panelY - 154, layout);
    this.renderAgreement(panelY - 202, layout);
    this.addButton('返回', -panelWidth / 2 + 68, panelY + panelHeight / 2 - 42, () => this.renderLogin(), layout, 92, 38);
    this.addStatus('当前阶段只接入 dev-login；账号为数字时作为 User ID。', layout);
  }

  private renderLoginAccepted(): void {
    this.currentView = 'loginAccepted';
    const layout = this.renderBase();
    if (SHOW_LOGIN_BRAND) {
      this.renderLoginBrand(layout);
    }
    if (SHOW_RIGHT_RAIL) {
      this.renderRightRail(layout);
    }

    const panelWidth = Math.min(560, layout.contentWidth * 0.62);
    this.addBeveledPanel('LoginAcceptedPanel', 0, -18, panelWidth, 250, rgba(12, 10, 12, 218), rgba(214, 177, 94, 230), 18);
    this.addLabel('登录验收通过', 0, 48, 34, rgba(245, 210, 122), new Size(panelWidth - 56, 58));
    this.addLabel(`Token: ${this.lastTokenName || 'player-token'}`, 0, -6, 18, rgba(127, 214, 255), new Size(panelWidth - 80, 36));
    this.addGoldButton('重新登录', 0, -76, () => {
      this.api.auth.logout();
      this.lastTokenName = '';
      this.renderLogin();
    }, layout, Math.min(300, panelWidth - 90), 52);
    this.addStatus('第一阶段只完成登录验收；大厅等功能下一阶段再进入。', layout);
  }

  private renderBase(): UiLayout {
    const layout = this.resolveLayout();
    this.applyRootSize(layout);
    this.layoutKey = this.makeLayoutKey();
    this.ensureContentRoot().removeAllChildren();
    return layout;
  }

  private renderLoginBrand(layout: UiLayout): void {
    const logoWidth = Math.min(560, Math.max(390, layout.width * 0.28));
    const logoHeight = Math.round(logoWidth * 0.51);
    const logoX = -layout.width / 2 + logoWidth / 2 + 24;
    const logoY = layout.height / 2 - logoHeight / 2 - 22;
    if (!this.addSprite('LoginLogo', UI_ASSETS.logo, logoX, logoY, logoWidth, logoHeight)) {
      this.addLabel('LOOTCHAIN', logoX, logoY + 22, 46, rgba(245, 210, 122), new Size(450, 62));
      this.addLabel('SILENT GODS', logoX, logoY - 30, 17, rgba(214, 177, 94), new Size(390, 28));
    }
  }

  private renderRightRail(layout: UiLayout): void {
    const x = layout.width / 2 - 74;
    const yStart = layout.height / 2 - 102;
    UI_ASSETS.rightRail.forEach((asset, index) => {
      this.addRailImageButton(asset, x, yStart - index * 88, layout);
    });
  }

  private renderThirdPartyLogin(y: number, layout: UiLayout): void {
    this.addLabel('其他登录方式', 0, y + 30, 16, rgba(214, 177, 94), new Size(260, 28));
    const labels = ['G', 'A', 'D', 'X'];
    const gap = 68;
    labels.forEach((label, index) => {
      const x = (index - (labels.length - 1) / 2) * gap;
      this.addDiamondButton(label, x, y - 8, () => this.setStatus('第三方登录暂未开放。'), layout);
    });
  }

  private renderAgreement(y: number, layout: UiLayout): void {
    const boxSize = 24;
    const x = -152;
    this.addButton(this.agreementAccepted ? '✓' : '', x, y, () => {
      this.agreementAccepted = !this.agreementAccepted;
      this.renderLoginDialog();
    }, layout, boxSize, boxSize);
    this.addLabel('我已阅读并同意《用户协议》和《隐私政策》', 54, y, 16, rgba(215, 210, 198), new Size(430, 34));
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
      this.lastTokenName = token.tokenName;
      this.renderLoginAccepted();
      this.setStatus(`登录成功：${token.tokenName}`);
    } catch (error) {
      this.setStatus(this.formatApiError(error, AppConfig.apiBaseUrl));
    }
  }

  private resolveDevUserId(account: string): number {
    const parsed = Number(account);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return AppConfig.defaultDevUserId;
  }

  private addStatus(text: string, layout?: UiLayout): void {
    const currentLayout = layout ?? this.resolveLayout();
    this.statusLabel = this.addLabel(text, 0, -currentLayout.height / 2 + 30, currentLayout.bodyFont, rgba(127, 214, 255), new Size(currentLayout.statusWidth, 48));
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

  private addEditBox(initialText: string, x: number, y: number, width: number, layout?: UiLayout): EditBox {
    const currentLayout = layout ?? this.resolveLayout();
    const node = this.createUiNode('EditBox');
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(width, currentLayout.inputHeight));
    const editBox = node.addComponent(EditBox);
    editBox.maxLength = 256;
    editBox.placeholder = '';

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
    return editBox;
  }

  private addFramedEditBox(initialText: string, x: number, y: number, width: number, layout: UiLayout): EditBox {
    this.addBeveledPanel('InputFrame', x, y, width + 28, layout.inputHeight + 8, rgba(8, 7, 9, 220), rgba(185, 138, 58, 190), 8);
    return this.addEditBox(initialText, x, y, width, layout);
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
      return this.addGoldButton(text, x, y, callback, layout, Math.min(width * 0.74, layout.contentWidth * 0.52), Math.min(height * 0.56, 72));
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

    this.addAccountGlyph(node, -56, 0, 1);
    this.addChildLabel(node, 'Label', text, 22, 0, fontSize, rgba(235, 213, 166), new Size(width * 0.58, height * 0.52));
    return button;
  }

  private addRailImageButton(asset: RailButtonAsset, x: number, y: number, layout: UiLayout): Button {
    const node = this.createUiNode(`Rail_${asset.label}`);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(92, 78));
    const button = node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.setStatus('该入口为登录页占位，当前阶段暂未开放。'), this);
    this.applyImageButtonFeedback(node);

    if (!this.addSprite('Icon', asset.path, 0, 14, 42, 42, node)) {
      this.addDiamondButton('', x, y + 14, () => this.setStatus('该入口为登录页占位，当前阶段暂未开放。'), layout);
    }
    this.addChildLabel(node, 'Label', asset.label, 0, -26, 19, rgba(229, 196, 122), new Size(82, 28));
    return button;
  }

  private addDiamondButton(text: string, x: number, y: number, callback: () => void, layout: UiLayout): Button {
    const size = 48;
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

  private addChildLabel(parent: Node, name: string, text: string, x: number, y: number, size: number, color: Color, contentSize: Size): Label {
    const labelNode = new Node(name);
    labelNode.layer = this.node.layer;
    parent.addChild(labelNode);
    labelNode.setPosition(new Vec3(x, y, 0));
    labelNode.addComponent(UITransform).setContentSize(contentSize);
    const label = labelNode.addComponent(Label);
    label.string = this.trimText(text);
    label.fontSize = size;
    label.lineHeight = size + 8;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.CLAMP;
    label.color = color;
    return label;
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

  private applyButtonVisual(node: Node, width: number, height: number): void {
    const graphics = node.addComponent(Graphics);
    this.drawButtonFrame(graphics, width, height, 'normal');
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
    node.on(Node.EventType.MOUSE_ENTER, () => node.setScale(new Vec3(1.035, 1.035, 1)), this);
    node.on(Node.EventType.MOUSE_LEAVE, () => node.setScale(Vec3.ONE), this);
    node.on(Node.EventType.TOUCH_START, () => node.setScale(new Vec3(0.975, 0.975, 1)), this);
    node.on(Node.EventType.TOUCH_END, () => node.setScale(Vec3.ONE), this);
    node.on(Node.EventType.TOUCH_CANCEL, () => node.setScale(Vec3.ONE), this);
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

  private trimText(text: string): string {
    return text.length > 1200 ? `${text.slice(0, 1200)}...` : text;
  }

  private resolveLayout(): UiLayout {
    const visibleSize = this.visibleSize();
    const width = Math.max(960, visibleSize.width);
    const height = Math.max(540, visibleSize.height);
    const contentWidth = Math.min(width - 120, 1100);
    return {
      width,
      height,
      contentWidth,
      topY: height / 2 - 48,
      inputHeight: 46,
      buttonHeight: 48,
      statusWidth: Math.min(contentWidth, 760),
      bodyFont: 18,
    };
  }

  private applyRootSize(layout: UiLayout): void {
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(new Size(layout.width, layout.height));
  }

  private visibleSize(): Size {
    const runtimeSize = this.runtimeWindowSize();
    if (runtimeSize) {
      return runtimeSize;
    }
    const size = view.getVisibleSize();
    return new Size(Math.max(960, Math.round(size.width || 1280)), Math.max(540, Math.round(size.height || 720)));
  }

  private runtimeWindowSize(): Size | null {
    const runtime = globalThis as { innerHeight?: number; innerWidth?: number };
    const width = Math.round(runtime.innerWidth || 0);
    const height = Math.round(runtime.innerHeight || 0);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return new Size(Math.max(960, width), Math.max(540, height));
    }
    return null;
  }

  private makeLayoutKey(): string {
    const visible = this.visibleSize();
    return `${this.currentView}:${visible.width}x${visible.height}:${this.agreementAccepted ? 'agree' : 'deny'}`;
  }
}
