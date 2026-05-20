import {
  _decorator,
  Button,
  Color,
  Component,
  EditBox,
  Graphics,
  Label,
  Node,
  Size,
  UITransform,
  Vec3,
  view,
} from 'cc';
import { AppConfig } from '../app/AppConfig';
import { lootChainApi, LootChainApi } from '../api/LootChainApi';
import { ApiError } from '../net/HttpClient';
import type { BagItemEntryVO } from '../types/BagTypes';
import type { GachaPoolVO } from '../types/GachaTypes';
import type { UserHeroListItemVO } from '../types/HeroTypes';

const { ccclass } = _decorator;

type AsyncAction = () => Promise<void>;
type ButtonVisualState = 'hover' | 'normal' | 'pressed';
type ScreenMode = 'web' | 'h5';
type ViewName = 'login' | 'loginAccepted' | 'lobby' | 'gacha' | 'heroes' | 'bag';

function rgba(red: number, green: number, blue: number, alpha = 255): Color {
  return new Color(red, green, blue, alpha);
}

interface UiLayout {
  mode: ScreenMode;
  width: number;
  height: number;
  contentWidth: number;
  topY: number;
  contentTopY: number;
  loginContentTopY: number;
  gap: number;
  rowGap: number;
  buttonWidth: number;
  buttonHeight: number;
  inputWidth: number;
  inputHeight: number;
  statusWidth: number;
  statusHeight: number;
  titleFont: number;
  sectionFont: number;
  bodyFont: number;
}

@ccclass('LootChainGameRoot')
export class LootChainGameRoot extends Component {
  private readonly api: LootChainApi = lootChainApi;
  private apiUrlInput: EditBox | null = null;
  private userIdInput: EditBox | null = null;
  private poolCodeInput: EditBox | null = null;
  private itemCodeInput: EditBox | null = null;
  private statusLabel: Label | null = null;
  private contentRoot: Node | null = null;
  private pools: GachaPoolVO[] = [];
  private lastTokenName = '';
  private currentView: ViewName = 'login';
  private layoutKey = '';

  start(): void {
    this.currentView = this.api.tokenStore.isLoggedIn() ? 'loginAccepted' : 'login';
    this.renderCurrentView();
  }

  update(): void {
    const nextKey = this.makeLayoutKey();
    if (this.layoutKey && this.layoutKey !== nextKey) {
      this.renderCurrentView();
    }
  }

  private renderCurrentView(): void {
    switch (this.currentView) {
      case 'loginAccepted':
        this.renderLoginAccepted();
        break;
      case 'lobby':
        this.renderLobby();
        break;
      case 'gacha':
        this.renderGacha();
        break;
      case 'heroes':
        this.renderHeroes();
        break;
      case 'bag':
        this.renderBag();
        break;
      default:
        this.renderLogin();
        break;
    }
  }

  private renderLogin(): void {
    this.currentView = 'login';
    const layout = this.renderBase('');
    const isH5 = layout.mode === 'h5';
    const coreY = layout.height / 2 - (isH5 ? 160 : 150);
    const titleY = coreY - (isH5 ? 142 : 192);
    const formWidth = Math.min(layout.contentWidth, isH5 ? 350 : 540);
    const inputWidth = Math.min(formWidth - 58, isH5 ? 292 : 430);
    const inputStartY = titleY - (isH5 ? 103 : 112);

    this.renderLoginBrand(layout);
    this.renderRightRail(layout);
    this.addAbyssCore(0, coreY, isH5 ? 46 : 62);

    this.addLabel('欢迎来到', 0, titleY + 78, isH5 ? 20 : 24, rgba(245, 210, 122), new Size(formWidth, 42));
    this.addLabel('LOOTCHAIN', 0, titleY + 18, isH5 ? 40 : 56, rgba(245, 210, 122), new Size(formWidth, 70));
    this.addLabel('暗影之下，圣契永恒', 0, titleY - 36, isH5 ? 18 : 23, rgba(215, 210, 198), new Size(formWidth, 40));

    this.addBeveledPanel('LoginPanel', 0, inputStartY - (isH5 ? 45 : 48), formWidth, isH5 ? 205 : 220, rgba(15, 12, 12, 186), rgba(185, 138, 58, 190), 12);
    this.addLabel('API 地址', 0, inputStartY + 42, isH5 ? 15 : 17, rgba(215, 210, 198), new Size(inputWidth, 28));
    this.apiUrlInput = this.addFramedEditBox(AppConfig.apiBaseUrl, 0, inputStartY, inputWidth, layout);
    this.addLabel('User ID', 0, inputStartY - 60, isH5 ? 15 : 17, rgba(215, 210, 198), new Size(inputWidth, 28));
    this.userIdInput = this.addFramedEditBox(String(AppConfig.defaultDevUserId), 0, inputStartY - (isH5 ? 100 : 104), Math.min(230, inputWidth), layout);
    this.addGoldButton('账号登录', 0, inputStartY - (isH5 ? 158 : 168), () => this.run(() => this.login()), layout, Math.min(360, inputWidth));
    this.addStatus('等待登录。', layout);
  }

  private renderLoginAccepted(): void {
    this.currentView = 'loginAccepted';
    const layout = this.renderBase('');
    const isH5 = layout.mode === 'h5';
    const panelWidth = Math.min(layout.contentWidth, isH5 ? 350 : 560);
    const panelHeight = isH5 ? 260 : 300;

    this.renderLoginBrand(layout);
    this.addAbyssCore(0, layout.height / 2 - (isH5 ? 165 : 150), isH5 ? 42 : 58);
    this.addBeveledPanel('LoginAcceptedPanel', 0, -35, panelWidth, panelHeight, rgba(12, 10, 12, 212), rgba(214, 177, 94, 220), 14);
    this.addLabel('登录验收通过', 0, 64, isH5 ? 30 : 38, rgba(245, 210, 122), new Size(panelWidth - 40, 56));
    this.addLabel('LootChain', 0, 14, isH5 ? 22 : 28, rgba(215, 210, 198), new Size(panelWidth - 40, 42));
    this.addLabel(`Token: ${this.lastTokenName || 'player-token'}`, 0, -30, isH5 ? 16 : 18, rgba(127, 214, 255), new Size(panelWidth - 60, 36));
    this.addGoldButton('重新登录', 0, -105, () => {
      this.api.auth.logout();
      this.lastTokenName = '';
      this.renderLogin();
    }, layout, Math.min(300, panelWidth - 90));
    this.addStatus('第一阶段登录已完成。下一阶段再制作大厅。', layout);
  }

  private renderLobby(): void {
    this.currentView = 'lobby';
    const layout = this.renderBase('大厅');
    this.renderNav(layout);
    this.addLabel('圣契召唤师', 0, layout.contentTopY, layout.sectionFont, new Color(255, 226, 140));
    this.addLabel('已接入玩家抽卡、英雄、背包接口。战斗、副本、Boss 与正式钱包登录等待后端接口。', 0, layout.contentTopY - layout.rowGap, layout.bodyFont);
    this.addButton('退出登录', 0, layout.contentTopY - layout.rowGap * 2 - 25, () => {
      this.api.auth.logout();
      this.renderLogin();
    }, layout);
    this.addStatus(`当前模式：${layout.mode === 'h5' ? 'H5 窄屏' : 'Web 桌面'}。`, layout);
  }

  private renderGacha(): void {
    this.currentView = 'gacha';
    const layout = this.renderBase('抽卡');
    this.renderNav(layout);

    const actionTop = layout.contentTopY;
    if (layout.mode === 'h5') {
      this.addButton('加载卡池', this.gridX(layout, 0, 2), actionTop, () => this.run(() => this.loadPools()), layout, this.gridButtonWidth(layout, 2));
      this.addButton('查询保底', this.gridX(layout, 1, 2), actionTop, () => this.run(() => this.loadPity()), layout, this.gridButtonWidth(layout, 2));
      if (AppConfig.enableWriteActions) {
        this.addButton('单抽', this.gridX(layout, 0, 2), actionTop - layout.rowGap, () => this.run(() => this.draw(1)), layout, this.gridButtonWidth(layout, 2));
        this.addButton('十连', this.gridX(layout, 1, 2), actionTop - layout.rowGap, () => this.run(() => this.draw(10)), layout, this.gridButtonWidth(layout, 2));
      }
      const poolY = actionTop - layout.rowGap * (AppConfig.enableWriteActions ? 2 : 1);
      this.addLabel('Pool', 0, poolY, layout.bodyFont);
      this.poolCodeInput = this.addEditBox(this.pools[0]?.poolCode ?? 'NORMAL_HERO', 0, poolY - 44, layout.inputWidth, layout);
      this.addButton('历史', 0, poolY - layout.rowGap - 48, () => this.run(() => this.loadGachaLogs()), layout);
    } else {
      this.addButton('加载卡池', this.gridX(layout, 0, 4), actionTop, () => this.run(() => this.loadPools()), layout);
      this.addButton('查询保底', this.gridX(layout, 1, 4), actionTop, () => this.run(() => this.loadPity()), layout);
      if (AppConfig.enableWriteActions) {
        this.addButton('单抽', this.gridX(layout, 2, 4), actionTop, () => this.run(() => this.draw(1)), layout);
        this.addButton('十连', this.gridX(layout, 3, 4), actionTop, () => this.run(() => this.draw(10)), layout);
      }
      this.addLabel('Pool', -layout.inputWidth / 2 - 62, actionTop - layout.rowGap, layout.bodyFont, new Color(230, 230, 230), new Size(120, 42));
      this.poolCodeInput = this.addEditBox(this.pools[0]?.poolCode ?? 'NORMAL_HERO', -45, actionTop - layout.rowGap, Math.min(360, layout.inputWidth), layout);
      this.addButton('历史', 245, actionTop - layout.rowGap, () => this.run(() => this.loadGachaLogs()), layout, 120);
    }
    this.addStatus(AppConfig.enableWriteActions ? '加载卡池后可查询保底或发起抽卡。' : '当前为只读联调模式，真实抽卡写入入口默认关闭。', layout);
  }

  private renderHeroes(): void {
    this.currentView = 'heroes';
    const layout = this.renderBase('英雄');
    this.renderNav(layout);
    const actionTop = layout.contentTopY;
    const columns = layout.mode === 'h5' ? 2 : 3;
    this.addButton('我的英雄', this.gridX(layout, 0, columns), actionTop, () => this.run(() => this.loadHeroes()), layout, this.gridButtonWidth(layout, columns));
    this.addButton('碎片', this.gridX(layout, 1, columns), actionTop, () => this.run(() => this.loadHeroFragments()), layout, this.gridButtonWidth(layout, columns));
    this.addButton('图鉴', this.gridX(layout, layout.mode === 'h5' ? 0 : 2, columns), actionTop - (layout.mode === 'h5' ? layout.rowGap : 0), () => this.run(() => this.loadCodex()), layout, this.gridButtonWidth(layout, columns));
    this.addStatus('英雄升级、升星、觉醒、洗练入口本阶段不主动开放，避免误触经济消耗。', layout);
  }

  private renderBag(): void {
    this.currentView = 'bag';
    const layout = this.renderBase('背包');
    this.renderNav(layout);
    const actionTop = layout.contentTopY;
    this.addButton('加载背包', layout.mode === 'h5' ? 0 : -210, actionTop, () => this.run(() => this.loadBag()), layout);
    this.addLabel('Item Code', layout.mode === 'h5' ? 0 : -layout.inputWidth / 2 - 65, actionTop - layout.rowGap, layout.bodyFont, new Color(230, 230, 230), new Size(140, 42));
    this.itemCodeInput = this.addEditBox('GOLD_BOX_SMALL', layout.mode === 'h5' ? 0 : -45, actionTop - layout.rowGap - (layout.mode === 'h5' ? 42 : 0), layout.mode === 'h5' ? layout.inputWidth : Math.min(360, layout.inputWidth), layout);
    this.addButton('来源', layout.mode === 'h5' ? 0 : 245, actionTop - layout.rowGap - (layout.mode === 'h5' ? 92 : 0), () => this.run(() => this.loadItemSource()), layout, 120);
    this.addStatus('道具使用、出售本阶段先不开放，避免误触道具消耗。', layout);
  }

  private async login(): Promise<void> {
    const apiUrl = this.normalizeApiBaseUrl(this.apiUrlInput?.string || AppConfig.apiBaseUrl);
    const userId = Number(this.userIdInput?.string || AppConfig.defaultDevUserId);
    if (!Number.isFinite(userId) || userId <= 0) {
      this.setStatus('User ID 不合法。');
      return;
    }
    if (this.apiUrlInput) {
      this.apiUrlInput.string = apiUrl;
    }
    this.api.setApiBaseUrl(apiUrl);
    this.setStatus(`登录请求：${apiUrl}`);
    try {
      const token = await this.api.auth.devLogin(userId);
      this.lastTokenName = token.tokenName;
      this.renderLoginAccepted();
      this.setStatus(`登录成功：${token.tokenName}`);
    } catch (error) {
      this.setStatus(this.formatApiError(error, apiUrl));
    }
  }

  private async loadPools(): Promise<void> {
    this.pools = await this.api.gacha.pools();
    if (this.poolCodeInput && this.pools[0]) {
      this.poolCodeInput.string = this.pools[0].poolCode;
    }
    const lines = this.pools.map((pool) => `${pool.poolName} / ${pool.poolCode} / ${pool.singleCost} ${pool.costCode}`);
    this.setStatus(lines.length ? lines.join('\n') : '暂无开放卡池。');
  }

  private async loadPity(): Promise<void> {
    const poolCode = this.currentPoolCode();
    const pity = await this.api.gacha.pity(poolCode);
    this.setStatus(pity.map((item) => `${item.rarity}: ${item.counter}/${item.pityCount}`).join('\n') || '暂无保底数据。');
  }

  private async draw(drawCount: 1 | 10): Promise<void> {
    if (!AppConfig.enableWriteActions) {
      this.setStatus('真实抽卡写入入口未开启。请准备专门测试账号、测试卡池、余额和清理策略后再打开写入开关。');
      return;
    }
    const poolCode = this.currentPoolCode();
    const result = await this.api.gacha.draw({
      poolCode,
      drawCount,
      requestId: this.makeRequestId(poolCode, drawCount),
      useTicket: false,
    });
    const lines = result.items.map((item) => {
      const duplicate = item.duplicate ? ` 重复转碎片${item.fragmentCount ?? ''}` : '';
      return `${item.rarity} ${item.rewardName || item.rewardCode}${duplicate}`;
    });
    this.setStatus(`批次：${result.drawNo}\n${lines.join('\n')}`);
  }

  private async loadGachaLogs(): Promise<void> {
    const page = await this.api.gacha.logs(1, 10, this.currentPoolCode());
    const lines = page.records.map((log) => `${log.drawNo} ${log.drawCount}抽 ${log.costAmount}${log.costCode}`);
    this.setStatus(lines.length ? lines.join('\n') : '暂无抽卡记录。');
  }

  private async loadHeroes(): Promise<void> {
    const heroes = await this.api.hero.list();
    const lines = heroes.map((hero: UserHeroListItemVO) => `${hero.rarity} ${hero.heroName} Lv.${hero.level} 星${hero.star} 战力${hero.power}`);
    this.setStatus(lines.length ? lines.join('\n') : '暂无英雄。');
  }

  private async loadHeroFragments(): Promise<void> {
    const fragments = await this.api.hero.fragments();
    const lines = fragments.map((item) => `${item.rarity} ${item.heroName}: ${item.fragmentCount}`);
    this.setStatus(lines.length ? lines.join('\n') : '暂无英雄碎片。');
  }

  private async loadCodex(): Promise<void> {
    const codex = await this.api.hero.codex();
    const lines = codex.map((item) => `${item.owned ? '已拥有' : '未拥有'} ${item.rarity} ${item.heroName}${item.exLocked ? ' / EX锁定' : ''}`);
    this.setStatus(lines.length ? lines.join('\n') : '暂无图鉴数据。');
  }

  private async loadBag(): Promise<void> {
    const bag = await this.api.bag.myBag();
    const items: BagItemEntryVO[] = [];
    for (const group of bag.groups ?? []) {
      items.push(...(group.items ?? []));
    }
    const lines = items.map((item) => `${item.itemName} x${item.itemCount} [${item.itemType}]`);
    this.setStatus(lines.length ? lines.join('\n') : '背包为空。');
  }

  private async loadItemSource(): Promise<void> {
    const itemCode = this.itemCodeInput?.string.trim() || '';
    if (!itemCode) {
      this.setStatus('请输入道具编码。');
      return;
    }
    const source = await this.api.bag.source(itemCode);
    this.setStatus(`${source.itemCode}\n${source.sourceDesc || '暂无来源说明。'}`);
  }

  private renderBase(title: string): UiLayout {
    const layout = this.resolveLayout();
    this.applyRootSize(layout);
    this.layoutKey = this.makeLayoutKey();
    this.ensureContentRoot().removeAllChildren();
    this.renderSceneBackground(layout);
    if (title) {
      this.addLabel(title, 0, layout.topY, layout.titleFont, rgba(255, 226, 140), new Size(layout.statusWidth, 58));
    }
    return layout;
  }

  private renderNav(layout: UiLayout): void {
    if (layout.mode === 'h5') {
      const width = this.gridButtonWidth(layout, 2);
      const y1 = layout.topY - 58;
      const y2 = y1 - layout.rowGap;
      this.addButton('大厅', this.gridX(layout, 0, 2), y1, () => this.renderLobby(), layout, width);
      this.addButton('抽卡', this.gridX(layout, 1, 2), y1, () => this.renderGacha(), layout, width);
      this.addButton('英雄', this.gridX(layout, 0, 2), y2, () => this.renderHeroes(), layout, width);
      this.addButton('背包', this.gridX(layout, 1, 2), y2, () => this.renderBag(), layout, width);
      return;
    }

    this.addButton('大厅', this.gridX(layout, 0, 4), layout.topY - 62, () => this.renderLobby(), layout);
    this.addButton('抽卡', this.gridX(layout, 1, 4), layout.topY - 62, () => this.renderGacha(), layout);
    this.addButton('英雄', this.gridX(layout, 2, 4), layout.topY - 62, () => this.renderHeroes(), layout);
    this.addButton('背包', this.gridX(layout, 3, 4), layout.topY - 62, () => this.renderBag(), layout);
  }

  private addStatus(text: string, layout?: UiLayout): void {
    const currentLayout = layout ?? this.resolveLayout();
    const preferredY = -currentLayout.height / 2 + (currentLayout.mode === 'h5' ? 120 : 14);
    const statusSize = new Size(currentLayout.statusWidth, currentLayout.mode === 'h5' ? 74 : 64);
    this.statusLabel = this.addLabel(text, 0, preferredY, currentLayout.bodyFont, rgba(127, 214, 255), statusSize);
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
    textNode.addComponent(UITransform).setContentSize(new Size(width - 24, currentLayout.inputHeight));
    const textLabel = textNode.addComponent(Label);
    textLabel.fontSize = Math.max(13, currentLayout.bodyFont - 2);
    textLabel.lineHeight = currentLayout.bodyFont + 4;
    textLabel.color = rgba(231, 226, 214);
    textLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
    textLabel.verticalAlign = Label.VerticalAlign.CENTER;
    textLabel.overflow = Label.Overflow.CLAMP;

    const placeholderNode = new Node('PlaceholderLabel');
    placeholderNode.layer = node.layer;
    node.addChild(placeholderNode);
    placeholderNode.setPosition(Vec3.ZERO);
    placeholderNode.addComponent(UITransform).setContentSize(new Size(width - 24, currentLayout.inputHeight));
    const placeholderLabel = placeholderNode.addComponent(Label);
    placeholderLabel.fontSize = Math.max(13, currentLayout.bodyFont - 2);
    placeholderLabel.lineHeight = currentLayout.bodyFont + 4;
    placeholderLabel.color = rgba(120, 114, 105);
    placeholderLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
    placeholderLabel.verticalAlign = Label.VerticalAlign.CENTER;
    placeholderLabel.overflow = Label.Overflow.CLAMP;
    placeholderLabel.string = '';

    editBox.textLabel = textLabel;
    editBox.placeholderLabel = placeholderLabel;
    editBox.string = initialText;

    const styledEditBox = editBox as EditBox & { fontColor?: Color; fontSize?: number };
    styledEditBox.fontSize = currentLayout.bodyFont;
    styledEditBox.fontColor = rgba(231, 226, 214);
    return editBox;
  }

  private addFramedEditBox(initialText: string, x: number, y: number, width: number, layout: UiLayout): EditBox {
    this.addBeveledPanel('InputFrame', x, y, width + 26, layout.inputHeight + 8, rgba(8, 7, 9, 218), rgba(185, 138, 58, 185), 8);
    return this.addEditBox(initialText, x, y, width, layout);
  }

  private addButton(text: string, x: number, y: number, callback: () => void, layout?: UiLayout, width?: number): Button {
    const currentLayout = layout ?? this.resolveLayout();
    const buttonWidth = width ?? currentLayout.buttonWidth;
    const node = this.createUiNode(`Button_${text}`);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(buttonWidth, currentLayout.buttonHeight));
    this.applyButtonVisual(node, buttonWidth, currentLayout.buttonHeight);
    const button = node.addComponent(Button);
    node.on(Button.EventType.CLICK, callback, this);

    const labelNode = new Node('Label');
    labelNode.layer = node.layer;
    node.addChild(labelNode);
    labelNode.setPosition(Vec3.ZERO);
    labelNode.addComponent(UITransform).setContentSize(new Size(buttonWidth, currentLayout.buttonHeight));
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = currentLayout.bodyFont;
    label.lineHeight = currentLayout.bodyFont + 8;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.color = rgba(245, 210, 122);
    return button;
  }

  private addGoldButton(text: string, x: number, y: number, callback: () => void, layout: UiLayout, width: number): Button {
    return this.addButton(text, x, y, callback, layout, width);
  }

  private renderSceneBackground(layout: UiLayout): void {
    this.addRect('DarkTempleBg', 0, 0, layout.width, layout.height, rgba(5, 4, 7));
    this.addRect('TopVignette', 0, layout.height / 2 - 78, layout.width, 160, rgba(12, 10, 16, 190));
    this.addRect('BottomVignette', 0, -layout.height / 2 + 84, layout.width, 170, rgba(0, 0, 0, 188));
    this.addCircle('AbyssGlowOuter', 0, layout.height / 2 - (layout.mode === 'h5' ? 166 : 150), Math.min(layout.width, layout.height) * 0.25, rgba(122, 16, 32, 34), rgba(201, 39, 61, 55), 2);
    this.addCircle('AbyssGlowMid', 0, layout.height / 2 - (layout.mode === 'h5' ? 166 : 150), Math.min(layout.width, layout.height) * 0.15, rgba(201, 39, 61, 42), rgba(245, 210, 122, 64), 1);
    this.addTempleSilhouette(layout);
    this.addRuneFloor(layout);
  }

  private renderLoginBrand(layout: UiLayout): void {
    const isH5 = layout.mode === 'h5';
    if (isH5) {
      return;
    }
    const logoX = isH5 ? 0 : -layout.width / 2 + Math.min(230, layout.width * 0.2);
    const logoY = layout.height / 2 - (isH5 ? 55 : 70);
    const titleWidth = isH5 ? Math.min(layout.contentWidth, 340) : 420;
    this.addLabel('LootChain', logoX, logoY, isH5 ? 32 : 42, rgba(245, 210, 122), new Size(titleWidth, 62));
    this.addLabel('COVENANT OF ETERNAL NIGHT', logoX, logoY - (isH5 ? 38 : 46), isH5 ? 12 : 16, rgba(214, 177, 94), new Size(titleWidth, 28));
  }

  private renderRightRail(layout: UiLayout): void {
    if (layout.mode === 'h5' && layout.width < 520) {
      return;
    }
    const x = layout.width / 2 - (layout.mode === 'h5' ? 54 : 78);
    const yStart = layout.height / 2 - 96;
    ['谕言', '客服', '公告', '修复'].forEach((label, index) => {
      this.addButton(label, x, yStart - index * 74, () => this.setStatus('功能即将开放。'), layout, layout.mode === 'h5' ? 76 : 88);
    });
  }

  private addAbyssCore(x: number, y: number, radius: number): void {
    this.addCircle('AbyssRingOuter', x, y, radius * 1.9, rgba(122, 16, 32, 18), rgba(201, 39, 61, 116), 2);
    this.addCircle('AbyssRingInner', x, y, radius * 1.14, rgba(201, 39, 61, 24), rgba(245, 210, 122, 82), 1);

    const node = this.createUiNode('AbyssCrystal');
    node.setPosition(new Vec3(x, y - radius * 0.12, 0));
    node.addComponent(UITransform).setContentSize(new Size(radius * 1.2, radius * 1.9));
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(201, 39, 61, 215);
    graphics.strokeColor = rgba(245, 210, 122, 170);
    graphics.lineWidth = 2;
    graphics.moveTo(0, radius * 0.9);
    graphics.lineTo(radius * 0.46, 0);
    graphics.lineTo(0, -radius);
    graphics.lineTo(-radius * 0.46, 0);
    graphics.close();
    graphics.fill();
    graphics.stroke();

    const beam = this.createUiNode('AbyssBeam');
    beam.setPosition(new Vec3(x, y + radius * 0.08, 0));
    beam.addComponent(UITransform).setContentSize(new Size(6, radius * 4.2));
    const beamGraphics = beam.addComponent(Graphics);
    beamGraphics.fillColor = rgba(201, 39, 61, 120);
    beamGraphics.rect(-2, -radius * 2.1, 4, radius * 4.2);
    beamGraphics.fill();
  }

  private addTempleSilhouette(layout: UiLayout): void {
    const node = this.createUiNode('DarkTempleSilhouette');
    node.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const graphics = node.addComponent(Graphics);
    const bottom = -layout.height / 2;
    const baseY = bottom + layout.height * 0.28;
    const count = layout.mode === 'h5' ? 9 : 15;
    const spacing = layout.width / (count - 1);
    graphics.fillColor = rgba(8, 7, 10, 224);
    for (let index = 0; index < count; index += 1) {
      const x = -layout.width / 2 + index * spacing;
      const height = layout.height * (0.16 + (index % 4) * 0.045);
      const width = spacing * 0.46;
      graphics.moveTo(x - width / 2, bottom);
      graphics.lineTo(x - width / 2, baseY);
      graphics.lineTo(x - width * 0.18, baseY + height);
      graphics.lineTo(x, baseY + height + layout.height * 0.1);
      graphics.lineTo(x + width * 0.18, baseY + height);
      graphics.lineTo(x + width / 2, baseY);
      graphics.lineTo(x + width / 2, bottom);
      graphics.close();
      graphics.fill();
    }
  }

  private addRuneFloor(layout: UiLayout): void {
    const y = -layout.height / 2 + (layout.mode === 'h5' ? 94 : 108);
    const radius = Math.min(layout.width, layout.height) * (layout.mode === 'h5' ? 0.28 : 0.32);
    this.addCircle('RuneFloorOuter', 0, y, radius, rgba(0, 0, 0, 0), rgba(185, 138, 58, 95), 2);
    this.addCircle('RuneFloorInner', 0, y, radius * 0.66, rgba(0, 0, 0, 0), rgba(201, 39, 61, 80), 1);
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

  private addCircle(name: string, x: number, y: number, radius: number, fill: Color, stroke?: Color, lineWidth = 1): Graphics {
    const node = this.createUiNode(name);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(new Size(radius * 2, radius * 2));
    const graphics = node.addComponent(Graphics);
    if (fill.a > 0) {
      graphics.fillColor = fill;
      graphics.circle(0, 0, radius);
      graphics.fill();
    }
    if (stroke) {
      graphics.strokeColor = stroke;
      graphics.lineWidth = lineWidth;
      graphics.circle(0, 0, radius);
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

  private drawButtonFrame(graphics: Graphics, width: number, height: number, state: ButtonVisualState): void {
    graphics.clear();
    const fill = state === 'pressed' ? rgba(78, 20, 25, 232) : state === 'hover' ? rgba(42, 32, 24, 236) : rgba(22, 18, 17, 224);
    const stroke = state === 'pressed' ? rgba(201, 39, 61, 235) : state === 'hover' ? rgba(245, 210, 122, 245) : rgba(185, 138, 58, 218);
    graphics.fillColor = fill;
    this.traceBeveledRect(graphics, width, height, 10);
    graphics.fill();
    graphics.strokeColor = stroke;
    graphics.lineWidth = state === 'normal' ? 2 : 3;
    this.traceBeveledRect(graphics, width, height, 10);
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
    const root = new Node('LootChainUIRoot');
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

  private currentPoolCode(): string {
    return this.poolCodeInput?.string.trim() || this.pools[0]?.poolCode || 'NORMAL_HERO';
  }

  private normalizeApiBaseUrl(apiUrl: string): string {
    const trimmed = apiUrl.trim().replace(/\/$/, '');
    if (trimmed === 'http://localhost:808' || trimmed === 'http://127.0.0.1:808') {
      return `${trimmed}1`;
    }
    return trimmed || AppConfig.apiBaseUrl;
  }

  private formatApiError(error: unknown, fallbackBaseUrl: string): string {
    if (error instanceof ApiError) {
      const requestUrl = error.requestUrl || `${fallbackBaseUrl}/api/player/auth/dev-login`;
      return `登录失败：${error.message}\ncode=${error.code}\nurl=${requestUrl}\n检查 API 地址是否为 http://localhost:8081，并刷新 Cocos 预览页。`;
    }
    const message = error instanceof Error ? error.message : String(error);
    return `登录失败：${message}\nurl=${fallbackBaseUrl}/api/player/auth/dev-login`;
  }

  private makeRequestId(poolCode: string, drawCount: number): string {
    return `CC_${poolCode}_${drawCount}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  private trimText(text: string): string {
    return text.length > 1200 ? `${text.slice(0, 1200)}...` : text;
  }

  private resolveLayout(): UiLayout {
    const visibleSize = this.visibleSize();
    const frameSize = this.frameSize();
    const h5 = frameSize.width <= 760 || frameSize.height > frameSize.width * 1.12 || visibleSize.width <= 700;
    const width = Math.max(360, visibleSize.width);
    const height = Math.max(560, visibleSize.height);
    const contentWidth = h5 ? Math.min(width - 40, 430) : Math.min(width - 80, 860);
    const topY = height / 2 - (h5 ? 38 : 44);
    const rowGap = h5 ? 52 : 58;

    return {
      mode: h5 ? 'h5' : 'web',
      width,
      height,
      contentWidth,
      topY,
      contentTopY: topY - (h5 ? 165 : 130),
      loginContentTopY: topY - (h5 ? 74 : 82),
      gap: h5 ? 12 : 18,
      rowGap,
      buttonWidth: h5 ? Math.min(180, (contentWidth - 12) / 2) : 140,
      buttonHeight: h5 ? 42 : 44,
      inputWidth: h5 ? contentWidth : Math.min(560, contentWidth - 120),
      inputHeight: h5 ? 42 : 44,
      statusWidth: contentWidth,
      statusHeight: h5 ? Math.min(220, height * 0.26) : 250,
      titleFont: h5 ? 28 : 32,
      sectionFont: h5 ? 24 : 30,
      bodyFont: h5 ? 18 : 20,
    };
  }

  private applyRootSize(layout: UiLayout): void {
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(new Size(layout.width, layout.height));
  }

  private gridButtonWidth(layout: UiLayout, columns: number): number {
    return Math.min(layout.buttonWidth, (layout.contentWidth - layout.gap * (columns - 1)) / columns);
  }

  private gridX(layout: UiLayout, index: number, columns: number): number {
    const buttonWidth = this.gridButtonWidth(layout, columns);
    const totalWidth = buttonWidth * columns + layout.gap * (columns - 1);
    return -totalWidth / 2 + buttonWidth / 2 + index * (buttonWidth + layout.gap);
  }

  private visibleSize(): Size {
    const runtimeSize = this.runtimeWindowSize();
    if (runtimeSize) {
      return runtimeSize;
    }
    const size = view.getVisibleSize();
    return new Size(Math.max(360, Math.round(size.width || 900)), Math.max(560, Math.round(size.height || 600)));
  }

  private frameSize(): Size {
    const runtimeSize = this.runtimeWindowSize();
    if (runtimeSize) {
      return runtimeSize;
    }
    const size = view.getFrameSize();
    return new Size(Math.max(360, Math.round(size.width || 900)), Math.max(560, Math.round(size.height || 600)));
  }

  private runtimeWindowSize(): Size | null {
    const runtime = globalThis as { innerHeight?: number; innerWidth?: number };
    const width = Math.round(runtime.innerWidth || 0);
    const height = Math.round(runtime.innerHeight || 0);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return new Size(Math.max(360, width), Math.max(560, height));
    }
    return null;
  }

  private makeLayoutKey(): string {
    const visible = this.visibleSize();
    const frame = this.frameSize();
    return `${this.currentView}:${visible.width}x${visible.height}:${frame.width}x${frame.height}`;
  }
}
