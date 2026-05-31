import {
  BlockInputEvents,
  Button,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Node,
  Size,
  UITransform,
  Vec3,
} from 'cc';
import type { PlayerLobbyProfileVO } from '../../types/PlayerTypes';
import { safeText } from '../UiTextFormatter';
import { rgba, type UiLayout } from './LobbyHudTypes';

type ButtonVisualState = 'hover' | 'normal' | 'pressed';

export interface LobbyProfileDialogHost {
  node: Node;
  currentLobbyProfile(): PlayerLobbyProfileVO;
  closePlayerProfileDialog(): void;
  createUiNode(name: string): Node;
  addBeveledPanelNode(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel?: number): Node;
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
  addChildBeveledPanelNode(parent: Node, name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel?: number): Node;
  addLobbyAvatar(parent: Node, x: number, y: number, size: number, displayName: string): void;
  applyPointerCursor(node: Node): void;
  drawButtonFrame(graphics: Graphics, width: number, height: number, state: ButtonVisualState): void;
  formatInteger(value: number | null | undefined): string;
  isLobbyProfileLoading(): boolean;
  getLobbyProfileError(): string;
}

const LOBBY_PROFILE_SERVER_NAME = '本地开发服';
const LOBBY_PROFILE_PLACEHOLDER = '-';

/**
 * 玩家资料弹窗渲染器。
 *
 * 当前阶段只做只读展示：等级、经验、战力、体力、账号状态、登录方式、钱包摘要和本地占位属性。
 * 不在弹窗中开放编辑、绑定、登出或领取等写操作。
 */
export class LobbyProfileDialogRenderer {
  constructor(private readonly host: LobbyProfileDialogHost) {}

  render(layout: UiLayout): void {
    const profile = this.host.currentLobbyProfile();
    const dim = this.addDim(layout);
    // 资料页采用场景式导航，遮罩只阻断底层输入，不再点击关闭。
    dim.addComponent(BlockInputEvents);

    // 弹窗使用独立缩放，避免竖屏或超窄屏被全局 uiScale 压到不可读。
    const dialogScale = this.profileDialogScale(layout);
    const pagePadding = Math.max(14 * dialogScale, Math.min(30 * dialogScale, layout.safeWidth * 0.024));
    const panelWidth = Math.max(300 * dialogScale, layout.safeWidth - pagePadding * 2);
    const panelHeight = Math.max(280 * dialogScale, layout.safeHeight - pagePadding * 2);
    const panelX = (layout.stageLeft + layout.stageRight) / 2;
    const panelY = (layout.stageTop + layout.stageBottom) / 2;
    const panel = this.host.addBeveledPanelNode(
      'LobbyProfilePanel',
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      rgba(8, 7, 10, 238),
      rgba(215, 170, 82, 238),
      20 * dialogScale,
    );
    // 面板本体阻挡输入事件，避免点击资料内容区时穿透到遮罩关闭弹框。
    panel.addComponent(BlockInputEvents);
    panel.addComponent(Button);

    const titleLabel = this.host.addChildLabel(
      panel,
      'LobbyProfileTitle',
      '玩家资料',
      0,
      panelHeight / 2 - 46 * dialogScale,
      Math.max(16, 30 * dialogScale),
      rgba(245, 210, 122),
      new Size(panelWidth - 160 * dialogScale, 46 * dialogScale),
    );
    titleLabel.overflow = Label.Overflow.SHRINK;

    this.addCloseButton(panel, panelWidth, panelHeight, dialogScale);
    this.addProfileHeader(panel, profile, panelWidth, panelHeight, dialogScale);
    this.addProfileRows(panel, profile, panelWidth, panelHeight, dialogScale);

    const note = this.host.addChildLabel(
      panel,
      'LobbyProfileReadonlyNote',
      '当前阶段仅展示只读资料；头像、昵称、绑定、登出等操作暂不开放。',
      0,
      -panelHeight / 2 + 34 * dialogScale,
      Math.max(10, 15 * dialogScale),
      rgba(173, 158, 130),
      new Size(panelWidth - 90 * dialogScale, 28 * dialogScale),
    );
    note.overflow = Label.Overflow.SHRINK;
  }

  private addDim(layout: UiLayout): Node {
    const node = this.host.createUiNode('LobbyProfileDim');
    node.setPosition(new Vec3(0, 0, 0));
    node.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 126);
    graphics.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    graphics.fill();
    return node;
  }

  private profileDialogScale(layout: UiLayout): number {
    const fitScale = Math.min(layout.safeWidth / 840, layout.safeHeight / 620);
    return Math.min(1, Math.max(0.42, fitScale));
  }

  private isNarrowProfileDialog(panelWidth: number, scale: number): boolean {
    return panelWidth < 560 * scale;
  }

  private addCloseButton(panel: Node, panelWidth: number, panelHeight: number, scale: number): void {
    const closeWidth = 96 * scale;
    const closeHeight = 38 * scale;
    const closeNode = new Node('LobbyProfileCloseButton');
    closeNode.layer = this.host.node.layer;
    panel.addChild(closeNode);
    closeNode.setPosition(new Vec3(panelWidth / 2 - closeWidth / 2 - 24 * scale, panelHeight / 2 - 38 * scale, 0));
    closeNode.addComponent(UITransform).setContentSize(new Size(closeWidth, closeHeight));
    const closeGraphics = closeNode.addComponent(Graphics);
    this.host.drawButtonFrame(closeGraphics, closeWidth, closeHeight, 'normal');
    closeNode.addComponent(Button);
    closeNode.on(Button.EventType.CLICK, () => this.host.closePlayerProfileDialog(), this);
    this.host.applyPointerCursor(closeNode);
    this.host.addChildLabel(closeNode, 'Label', '返回大厅', 0, 1 * scale, Math.max(12, 16 * scale), rgba(245, 210, 122), new Size(closeWidth - 8 * scale, closeHeight));
  }

  private addProfileHeader(panel: Node, profile: PlayerLobbyProfileVO, panelWidth: number, panelHeight: number, scale: number): void {
    const narrow = this.isNarrowProfileDialog(panelWidth, scale);
    const avatarSize = (narrow ? 88 : 126) * scale;
    const avatarX = -panelWidth / 2 + (narrow ? 72 : 118) * scale;
    const avatarY = panelHeight / 2 - (narrow ? 116 : 132) * scale;
    const textLeft = avatarX + (narrow ? 62 : 96) * scale;
    const textWidth = Math.max(116 * scale, panelWidth / 2 - 34 * scale - textLeft);
    this.host.addLobbyAvatar(panel, avatarX, avatarY, avatarSize, profile.displayName);
    const name = this.host.addChildLabel(
      panel,
      'LobbyProfileName',
      profile.displayName,
      textLeft,
      avatarY + (narrow ? 22 : 30) * scale,
      Math.max(14, (narrow ? 23 : 28) * scale),
      rgba(250, 226, 164),
      new Size(textWidth, 40 * scale),
      HorizontalTextAlignment.LEFT,
    );
    name.overflow = Label.Overflow.SHRINK;
    const subline = this.host.addChildLabel(
      panel,
      'LobbyProfileSubline',
      `UID ${profile.userId}  |  ${LOBBY_PROFILE_SERVER_NAME}`,
      textLeft,
      avatarY - (narrow ? 9 : 8) * scale,
      Math.max(10, (narrow ? 15 : 17) * scale),
      rgba(209, 199, 176),
      new Size(textWidth, 30 * scale),
      HorizontalTextAlignment.LEFT,
    );
    subline.overflow = Label.Overflow.SHRINK;
    const status = this.host.addChildLabel(
      panel,
      'LobbyProfileStatus',
      this.profileStatusText(profile),
      textLeft,
      avatarY - (narrow ? 38 : 42) * scale,
      Math.max(10, (narrow ? 14 : 16) * scale),
      this.host.getLobbyProfileError() ? rgba(255, 162, 92) : rgba(127, 214, 255),
      new Size(textWidth, 28 * scale),
      HorizontalTextAlignment.LEFT,
    );
    status.overflow = Label.Overflow.SHRINK;
  }

  private addProfileRows(panel: Node, profile: PlayerLobbyProfileVO, panelWidth: number, panelHeight: number, scale: number): void {
    const rows: [string, string, string, string][] = [
      ['等级', `Lv.${profile.playerLevel}`, '经验', this.host.formatInteger(profile.exp)],
      ['战力', this.host.formatInteger(profile.combatPower), '体力', `${this.host.formatInteger(profile.stamina)}/${this.host.formatInteger(profile.maxStamina)}`],
      ['账号状态', profile.accountStatus, '登录方式', profile.loginMethod],
      ['钱包绑定', profile.walletBound ? '已绑定' : '未绑定', '钱包地址', this.maskWalletAddress(profile.walletAddress)],
      ['主线进度', '未开放', '深渊层数', '未开放'],
      ['公会', '未加入', '称号', '圣契旅者'],
    ];

    if (this.isNarrowProfileDialog(panelWidth, scale)) {
      // 窄屏改为单列，优先保证头像、文字和每一行资料互不挤压。
      const flatRows: [string, string][] = [];
      for (const row of rows) {
        flatRows.push([row[0], row[1]], [row[2], row[3]]);
      }
      const rowTop = panelHeight / 2 - 188 * scale;
      const rowGap = 39 * scale;
      const rowWidth = panelWidth - 62 * scale;
      const bottomLimit = -panelHeight / 2 + 74 * scale;
      const visibleRows = Math.max(2, Math.min(flatRows.length, Math.floor((rowTop - bottomLimit) / rowGap) + 1));
      for (let index = 0; index < visibleRows; index += 1) {
        const row = flatRows[index];
        this.addProfileRow(panel, row[0], row[1], 0, rowTop - rowGap * index, rowWidth, scale);
      }
      return;
    }

    const avatarY = panelHeight / 2 - 132 * scale;
    const rowTop = avatarY - 104 * scale;
    const columnWidth = (panelWidth - 104 * scale) / 2;
    const leftX = -panelWidth / 4 + 16 * scale;
    const rightX = panelWidth / 4 - 16 * scale;
    const rowGap = 46 * scale;
    const bottomLimit = -panelHeight / 2 + 80 * scale;
    const visibleRows = Math.max(4, Math.min(rows.length, Math.floor((rowTop - bottomLimit) / rowGap) + 1));
    // 宽屏使用双列信息面板，继续展示只读资料和本地占位属性。
    for (let index = 0; index < visibleRows; index += 1) {
      const row = rows[index];
      const rowY = rowTop - rowGap * index;
      this.addProfileRow(panel, row[0], row[1], leftX, rowY, columnWidth, scale);
      this.addProfileRow(panel, row[2], row[3], rightX, rowY, columnWidth, scale);
    }
  }

  private addProfileRow(parent: Node, label: string, value: string, x: number, y: number, width: number, scale: number): void {
    const height = 34 * scale;
    const row = this.host.addChildBeveledPanelNode(parent, `LobbyProfileRow_${label}`, x, y, width, height, rgba(18, 15, 16, 184), rgba(91, 70, 39, 190), 8 * scale);
    const labelNode = this.host.addChildLabel(
      row,
      'RowLabel',
      label,
      -width / 2 + 18 * scale,
      0,
      Math.max(9, 15 * scale),
      rgba(178, 159, 119),
      new Size(width * 0.35, height),
      HorizontalTextAlignment.LEFT,
    );
    labelNode.overflow = Label.Overflow.SHRINK;
    const valueNode = this.host.addChildLabel(
      row,
      'RowValue',
      value || LOBBY_PROFILE_PLACEHOLDER,
      width * 0.05,
      0,
      Math.max(10, 16 * scale),
      rgba(236, 216, 169),
      new Size(width * 0.56, height),
      HorizontalTextAlignment.LEFT,
    );
    valueNode.overflow = Label.Overflow.SHRINK;
  }

  private profileStatusText(profile: PlayerLobbyProfileVO): string {
    if (this.host.isLobbyProfileLoading()) {
      return '资料读取中...';
    }
    if (this.host.getLobbyProfileError()) {
      return '资料接口暂不可用，已使用本地占位';
    }
    return `账号状态：${profile.accountStatus}`;
  }

  private maskWalletAddress(address?: string | null): string {
    // 钱包地址只做脱敏展示，当前阶段不提供绑定或修改入口。
    const clean = safeText(address || '');
    if (!clean) {
      return LOBBY_PROFILE_PLACEHOLDER;
    }
    if (clean.length <= 12) {
      return clean;
    }
    return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
  }

}
