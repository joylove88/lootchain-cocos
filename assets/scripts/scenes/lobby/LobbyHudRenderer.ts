import {
  Button,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Node,
  Size,
  Sprite,
  UIOpacity,
  UITransform,
  Vec3,
  tween,
} from 'cc';
import type { PlayerLobbyProfileVO } from '../../types/PlayerTypes';
import {
  LOBBY_ACTIVITY_ITEMS,
  LOBBY_CHALLENGE_ITEMS,
  LOBBY_NAV_ITEMS,
  LOBBY_SCENE_HOTSPOTS,
  LOBBY_SYSTEM_ICONS,
} from './LobbyHudConfig';
import {
  LOBBY_PLAYER_INFO_PANEL_ASPECT,
  LOBBY_PLAYER_INFO_PANEL_ASSET,
  clamp,
  rgba,
  type LobbyActivityIconKey,
  type LobbyHudHost,
  type LobbyNavIconKey,
  type LobbyPlayerInfoLayout,
  type LobbyResourceItem,
  type LobbySystemIconKey,
  type UiLayout,
} from './LobbyHudTypes';
export type { LobbyHudHost } from './LobbyHudTypes';

export class LobbyHudRenderer {
  constructor(private readonly host: LobbyHudHost) {}

  render(layout: UiLayout): void {
    this.renderLobbyPlayerInfo(layout);
    this.renderLobbyResourceBar(layout);
    this.renderLobbySystemIcons(layout);
    this.renderLobbyActivityRail(layout);
    this.renderLobbySceneHotspots(layout);
    this.renderLobbyChallengeRail(layout);
    this.renderLobbyBottomHud(layout);
  }

  private get node(): Node {
    return this.host.node;
  }

  private currentLobbyProfile(): PlayerLobbyProfileVO {
    return this.host.currentLobbyProfile();
  }

  private openPlayerProfileDialog(): void {
    this.host.openPlayerProfileDialog();
  }

  private createUiNode(name: string): Node {
    return this.host.createUiNode(name);
  }

  private addSprite(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null {
    return this.host.addSprite(name, assetPath, x, y, width, height, parent);
  }

  private addChildLabel(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
    contentSize?: Size,
    horizontalAlign: HorizontalTextAlignment = HorizontalTextAlignment.CENTER,
  ): Label {
    return this.host.addChildLabel(parent, name, text, x, y, fontSize, color, contentSize, horizontalAlign);
  }

  private addChildPlainNode(parent: Node, name: string, x: number, y: number, width: number, height: number): Node {
    return this.host.addChildPlainNode(parent, name, x, y, width, height);
  }

  private addChildBeveledPanelNode(parent: Node, name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel = 10): Node {
    return this.host.addChildBeveledPanelNode(parent, name, x, y, width, height, fill, stroke, bevel);
  }

  private addLobbyAvatar(parent: Node, x: number, y: number, size: number, displayName: string): void {
    this.host.addLobbyAvatar(parent, x, y, size, displayName);
  }

  private applyImageButtonFeedback(node: Node, hoverScale = 1.035, pressedScale = 0.975): void {
    this.host.applyImageButtonFeedback(node, hoverScale, pressedScale);
  }

  private applyPointerCursor(node: Node): void {
    this.host.applyPointerCursor(node);
  }

  private setStatus(text: string): void {
    this.host.setStatus(text);
  }

  private formatInteger(value: number | null | undefined): string {
    return this.host.formatInteger(value);
  }

  private compactResourceValue(value: number | null | undefined): string {
    return this.host.compactResourceValue(value);
  }

  private renderLobbyPlayerInfo(layout: UiLayout): void {
    const profile = this.currentLobbyProfile();
    const playerLayout = this.resolveLobbyPlayerInfoLayout(layout);
    const panelWidth = playerLayout.width;
    const panelHeight = playerLayout.height;
    const hudScale = playerLayout.scale;
    const x = playerLayout.x;
    const y = playerLayout.y;
    const panel = this.createUiNode('LobbyPlayerInfoButton');
    panel.setPosition(new Vec3(x, y, 0));
    panel.addComponent(UITransform).setContentSize(new Size(panelWidth, panelHeight));
    if (!this.addSprite('LobbyPlayerInfoArt', LOBBY_PLAYER_INFO_PANEL_ASSET, 0, 0, panelWidth, panelHeight, panel)) {
      this.drawLobbyPlayerInfoFrame(panel, panelWidth, panelHeight, hudScale);
      this.addLobbyAvatar(panel, -panelWidth / 2 + 80 * hudScale, panelHeight / 2 - 90 * hudScale, 125 * hudScale, profile.displayName);
    }
    panel.addComponent(Button);
    panel.on(Button.EventType.CLICK, () => this.openPlayerProfileDialog(), this);
    this.applyImageButtonFeedback(panel, 1.006, 0.994);

    const panelLeft = -panelWidth / 2;
    const panelTop = panelHeight / 2;
    const textX = panelLeft + 160 * hudScale;
    const textWidth = Math.max(190 * hudScale, Math.min(panelWidth - 178 * hudScale, 340 * hudScale));
    const levelLabel = this.addChildLabel(
      panel,
      'LobbyPlayerLevel',
      `Lv.${profile.playerLevel}`,
      textX,
      panelTop - 52 * hudScale,
      21 * hudScale,
      rgba(226, 201, 145),
      new Size(118 * hudScale, 30 * hudScale),
      HorizontalTextAlignment.LEFT,
    );
    levelLabel.overflow = Label.Overflow.SHRINK;
    this.applyLobbyPlayerTextStyle(levelLabel, hudScale, false);
    const nameLabel = this.addChildLabel(
      panel,
      'LobbyPlayerName',
      profile.displayName,
      textX,
      panelTop - 86 * hudScale,
      27 * hudScale,
      rgba(250, 226, 164),
      new Size(textWidth, 36 * hudScale),
      HorizontalTextAlignment.LEFT,
    );
    nameLabel.overflow = Label.Overflow.SHRINK;
    this.applyLobbyPlayerTextStyle(nameLabel, hudScale, true);
    this.addLobbyNameSigil(panel, textX + Math.min(154 * hudScale, textWidth + 12 * hudScale), panelTop - 86 * hudScale, hudScale);
    const powerLabel = this.addChildLabel(
      panel,
      'LobbyPlayerPower',
      `战力 ${this.formatInteger(profile.combatPower)}`,
      textX,
      panelTop - 128 * hudScale,
      22 * hudScale,
      rgba(224, 190, 112),
      new Size(textWidth, 32 * hudScale),
      HorizontalTextAlignment.LEFT,
    );
    powerLabel.overflow = Label.Overflow.SHRINK;
    this.applyLobbyPlayerTextStyle(powerLabel, hudScale, false);
    this.addLobbyPowerUnderline(panel, panelLeft + 366 * hudScale, panelTop - 150 * hudScale, 250 * hudScale, hudScale);
    const expLabel = this.addChildLabel(
      panel,
      'LobbyPlayerExpBadge',
      'EXP',
      panelLeft + 80 * hudScale,
      panelTop - 160 * hudScale,
      17 * hudScale,
      rgba(245, 210, 122),
      new Size(70 * hudScale, 26 * hudScale),
    );
    this.applyLobbyPlayerTextStyle(expLabel, hudScale, false);

  }

  private renderLobbyResourceBar(layout: UiLayout): void {
    const profile = this.currentLobbyProfile();
    const playerLayout = this.resolveLobbyPlayerInfoLayout(layout);
    const scale = this.lobbyHudScale(layout);
    const hudInsetX = this.lobbyHudEdgeInset(layout, 'x', scale);
    const hudInsetY = this.lobbyHudEdgeInset(layout, 'y', scale);
    const itemHeight = 34 * scale;
    const gap = 14 * scale;
    let items = this.lobbyResourceItems(profile);
    if (layout.stageWidth < 840) {
      items = items.slice(0, 2);
    } else if (layout.stageWidth < 1180) {
      items = items.slice(0, 3);
    }

    let itemWidths = items.map((item) => this.lobbyResourceItemWidth(item.key, scale));
    let totalWidth = this.sumWithGaps(itemWidths, gap);
    const systemWidth = this.lobbySystemIconsWidth(layout, scale);
    const right = layout.stageRight - hudInsetX - systemWidth - 22 * scale;
    const minGapFromPlayer = 18 * scale;
    while (items.length > 0 && right - totalWidth < playerLayout.right + minGapFromPlayer) {
      items = items.slice(0, -1);
      itemWidths = itemWidths.slice(0, -1);
      totalWidth = this.sumWithGaps(itemWidths, gap);
    }
    if (items.length === 0) {
      return;
    }

    const bar = this.createUiNode('LobbyResourceBar');
    const barX = right - totalWidth / 2;
    const barY = layout.stageTop - hudInsetY - itemHeight / 2;
    bar.setPosition(new Vec3(barX, barY, 0));
    bar.addComponent(UITransform).setContentSize(new Size(totalWidth, itemHeight));

    let cursorX = -totalWidth / 2;
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const width = itemWidths[index] ?? 0;
      if (!item || width <= 0) {
        continue;
      }
      this.addLobbyResourceItem(bar, item, cursorX + width / 2, width, itemHeight, scale);
      cursorX += width + gap;
    }
  }

  private resolveLobbyPlayerInfoLayout(layout: UiLayout): LobbyPlayerInfoLayout {
    const baseHudScale = this.lobbyHudScale(layout);
    const hudInsetX = this.lobbyHudEdgeInset(layout, 'x', baseHudScale);
    const hudInsetY = this.lobbyHudEdgeInset(layout, 'y', baseHudScale);
    let width = Math.min(
      clamp(layout.stageWidth * 0.28, 420 * baseHudScale, 540 * baseHudScale),
      layout.safeWidth,
      layout.stageWidth - hudInsetX * 2,
    );
    let height = width / LOBBY_PLAYER_INFO_PANEL_ASPECT;
    const maxHeight = layout.stageHeight - hudInsetY * 2;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * LOBBY_PLAYER_INFO_PANEL_ASPECT;
    }
    const x = layout.stageLeft + hudInsetX + width / 2;
    const y = layout.stageTop - hudInsetY - height / 2;
    return {
      x,
      y,
      width,
      height,
      scale: width / 540,
      left: x - width / 2,
      right: x + width / 2,
      top: y + height / 2,
      bottom: y - height / 2,
    };
  }

  private lobbyResourceItems(profile: PlayerLobbyProfileVO): LobbyResourceItem[] {
    return [
      {
        key: 'stamina',
        label: '体力',
        value: `${this.formatInteger(profile.stamina)}/${this.formatInteger(profile.maxStamina)}`,
        tint: rgba(104, 202, 226),
      },
      {
        key: 'coin',
        label: '金币',
        value: '3,456K',
        tint: rgba(222, 172, 84),
      },
      {
        key: 'ruby',
        label: '红宝石',
        value: '8,888',
        tint: rgba(212, 50, 73),
      },
      {
        key: 'crystal',
        label: '水晶',
        value: '2,450',
        tint: rgba(132, 94, 226),
      },
    ];
  }

  private lobbyResourceItemWidth(key: LobbyResourceItem['key'], scale: number): number {
    if (key === 'stamina') {
      return 128 * scale;
    }
    if (key === 'coin') {
      return 122 * scale;
    }
    return 112 * scale;
  }

  private sumWithGaps(values: number[], gap: number): number {
    return values.reduce((total, value) => total + value, 0) + Math.max(0, values.length - 1) * gap;
  }

  private renderLobbySystemIcons(layout: UiLayout): void {
    const scale = this.lobbyHudScale(layout);
    const hudInsetX = this.lobbyHudEdgeInset(layout, 'x', scale);
    const hudInsetY = this.lobbyHudEdgeInset(layout, 'y', scale);
    const iconSize = this.lobbySystemIconSize(scale);
    const gap = 14 * scale;
    const items = LOBBY_SYSTEM_ICONS;
    const totalWidth = this.lobbySystemIconsWidth(layout, scale);
    const x = layout.stageRight - hudInsetX - totalWidth / 2;
    const y = layout.stageTop - hudInsetY - iconSize / 2;
    const group = this.createUiNode('LobbySystemIcons');
    group.setPosition(new Vec3(x, y, 0));
    group.addComponent(UITransform).setContentSize(new Size(totalWidth, iconSize));

    let cursorX = -totalWidth / 2 + iconSize / 2;
    for (const key of items) {
      this.addLobbySystemIcon(group, key, cursorX, 0, iconSize, scale, key === 'menu');
      cursorX += iconSize + gap;
    }
  }

  private renderLobbyActivityRail(layout: UiLayout): void {
    if (layout.stageWidth < 900 || layout.stageHeight < 520) {
      return;
    }
    const playerLayout = this.resolveLobbyPlayerInfoLayout(layout);
    const scale = this.lobbyHudScale(layout);
    const hudInsetX = this.lobbyHudEdgeInset(layout, 'x', scale);
    const itemWidth = Math.min(206 * scale, layout.stageWidth * 0.18);
    const itemHeight = 68 * scale;
    const gap = 6 * scale;
    const railX = layout.stageLeft + hudInsetX + itemWidth / 2;
    const top = playerLayout.bottom - 26 * scale;
    const bottomLimit = layout.stageBottom + Math.max(96 * scale, layout.stageHeight * 0.11);
    const maxCount = Math.max(0, Math.floor((top - bottomLimit + gap) / (itemHeight + gap)));
    const items = LOBBY_ACTIVITY_ITEMS.slice(0, maxCount);
    if (items.length === 0) {
      return;
    }

    const totalHeight = items.length * itemHeight + Math.max(0, items.length - 1) * gap;
    const group = this.createUiNode('LobbyActivityRail');
    group.setPosition(new Vec3(railX, top - totalHeight / 2, 0));
    group.addComponent(UITransform).setContentSize(new Size(itemWidth, totalHeight));
    let cursorY = totalHeight / 2 - itemHeight / 2;
    for (const item of items) {
      this.addLobbyActivityItem(group, item.icon, item.title, item.subline, item.hot, 0, cursorY, itemWidth, itemHeight, scale);
      cursorY -= itemHeight + gap;
    }
  }

  private renderLobbySceneHotspots(layout: UiLayout): void {
    if (layout.stageWidth < 900 || layout.stageHeight < 560) {
      return;
    }
    const scale = this.lobbyHudScale(layout);
    const group = this.createUiNode('LobbySceneHotspots');
    group.setPosition(Vec3.ZERO);
    group.addComponent(UITransform).setContentSize(new Size(layout.width, layout.height));
    const hotspots = LOBBY_SCENE_HOTSPOTS;
    const plaqueHeight = 32 * scale;
    for (const hotspot of hotspots) {
      const x = layout.stageLeft + layout.stageWidth * hotspot.x;
      const y = layout.stageBottom + layout.stageHeight * hotspot.y;
      const hitX = layout.stageLeft + layout.stageWidth * hotspot.hitX;
      const hitY = layout.stageBottom + layout.stageHeight * hotspot.hitY;
      this.addLobbyHotspotHitArea(group, hotspot.label, hitX, hitY, layout.stageWidth * hotspot.hitW, layout.stageHeight * hotspot.hitH, scale);
      this.addLobbyHotspotPlaque(group, hotspot.label, x, y, hotspot.width * scale, plaqueHeight, scale, hotspot.hot);
    }
  }

  private renderLobbyChallengeRail(layout: UiLayout): void {
    if (layout.stageWidth < 1000 || layout.stageHeight < 520) {
      return;
    }
    const scale = this.lobbyHudScale(layout);
    const hudInsetX = this.lobbyHudEdgeInset(layout, 'x', scale);
    const cardWidth = Math.min(184 * scale, layout.stageWidth * 0.16);
    const cardHeight = 94 * scale;
    const gap = 8 * scale;
    const items = LOBBY_CHALLENGE_ITEMS;
    const topLimit = layout.stageTop - Math.max(130 * scale, layout.stageHeight * 0.14);
    const bottomLimit = layout.stageBottom + Math.max(98 * scale, layout.stageHeight * 0.12);
    const maxCount = Math.max(0, Math.min(items.length, Math.floor((topLimit - bottomLimit + gap) / (cardHeight + gap))));
    const visible = items.slice(0, maxCount);
    if (visible.length === 0) {
      return;
    }
    const totalHeight = visible.length * cardHeight + Math.max(0, visible.length - 1) * gap;
    const groupX = layout.stageRight - hudInsetX - cardWidth / 2;
    const groupY = topLimit - totalHeight / 2;
    const group = this.createUiNode('LobbyChallengeRail');
    group.setPosition(new Vec3(groupX, groupY, 0));
    group.addComponent(UITransform).setContentSize(new Size(cardWidth, totalHeight));

    let cursorY = totalHeight / 2 - cardHeight / 2;
    for (const item of visible) {
      this.addLobbyChallengeCard(group, item.title, item.subline, item.tint, item.hot, 0, cursorY, cardWidth, cardHeight, scale);
      cursorY -= cardHeight + gap;
    }
  }

  private renderLobbyBottomHud(layout: UiLayout): void {
    if (layout.stageWidth < 900 || layout.stageHeight < 500) {
      return;
    }
    const scale = this.lobbyHudScale(layout);
    const hudInsetX = this.lobbyHudEdgeInset(layout, 'x', scale);
    const bandHeight = 96 * scale;
    const groupY = layout.stageBottom + bandHeight / 2;
    const group = this.createUiNode('LobbyBottomHud');
    group.setPosition(new Vec3((layout.stageLeft + layout.stageRight) / 2, groupY, 0));
    group.addComponent(UITransform).setContentSize(new Size(layout.stageWidth, bandHeight));
    const graphics = group.addComponent(Graphics);
    graphics.fillColor = rgba(3, 4, 7, 168);
    graphics.rect(-layout.stageWidth / 2, -bandHeight / 2, layout.stageWidth, bandHeight);
    graphics.fill();
    graphics.strokeColor = rgba(160, 119, 61, 88);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.moveTo(-layout.stageWidth / 2, bandHeight / 2 - 2 * scale);
    graphics.lineTo(layout.stageWidth / 2, bandHeight / 2 - 2 * scale);
    graphics.stroke();

    const compassSize = 86 * scale;
    this.addLobbyCompass(group, -layout.stageWidth / 2 + hudInsetX + compassSize / 2, 4 * scale, compassSize, scale);

    const adventureWidth = Math.min(320 * scale, layout.stageWidth * 0.24);
    const adventureHeight = 84 * scale;
    const adventureX = layout.stageWidth / 2 - hudInsetX - adventureWidth / 2;
    this.addLobbyAdventureButton(group, adventureX, 0, adventureWidth, adventureHeight, scale);

    const navLeft = -layout.stageWidth / 2 + hudInsetX + compassSize + 30 * scale;
    const navRight = adventureX - adventureWidth / 2 - 28 * scale;
    const navWidth = navRight - navLeft;
    if (navWidth > 360 * scale) {
      this.addLobbyBottomNav(group, navLeft + navWidth / 2, 0, navWidth, bandHeight, scale);
    }
    this.addLobbyChatPreview(group, -layout.stageWidth / 2 + hudInsetX, -bandHeight / 2 + 14 * scale, Math.min(520 * scale, navWidth), scale);
  }

  private lobbyHudScale(layout: UiLayout): number {
    return clamp(layout.uiScale, 0.62, 1);
  }

  private lobbyHudEdgeInset(layout: UiLayout, axis: 'x' | 'y', scale: number): number {
    const safeInset = axis === 'x' ? layout.safeInsetX : layout.safeInsetY;
    const minInset = (axis === 'x' ? 10 : 8) * scale;
    const maxInset = (axis === 'x' ? 26 : 18) * scale;
    return clamp(safeInset * 0.38, minInset, maxInset);
  }

  private applyLobbyPlayerTextStyle(label: Label, scale: number, strong: boolean): void {
    label.enableOutline = true;
    label.outlineColor = strong ? rgba(0, 0, 0, 230) : rgba(0, 0, 0, 205);
    label.outlineWidth = Math.max(1, (strong ? 1.8 : 1.25) * scale);
  }

  private drawLobbyPlayerInfoFrame(parent: Node, width: number, height: number, scale: number): void {
    const graphics = parent.addComponent(Graphics);
    const left = -width / 2;
    const right = width / 2;
    const top = height / 2;
    const avatarCenterX = left + 80 * scale;

    graphics.fillColor = rgba(3, 5, 9, 54);
    graphics.moveTo(left + 126 * scale, top - 34 * scale);
    graphics.lineTo(right - 22 * scale, top - 54 * scale);
    graphics.lineTo(right - 54 * scale, top - 156 * scale);
    graphics.lineTo(left + 130 * scale, top - 176 * scale);
    graphics.lineTo(left + 116 * scale, top - 98 * scale);
    graphics.close();
    graphics.fill();

    graphics.fillColor = rgba(16, 18, 22, 48);
    graphics.moveTo(left + 152 * scale, top - 58 * scale);
    graphics.lineTo(right - 92 * scale, top - 70 * scale);
    graphics.lineTo(right - 126 * scale, top - 140 * scale);
    graphics.lineTo(left + 154 * scale, top - 150 * scale);
    graphics.close();
    graphics.fill();

    graphics.strokeColor = rgba(210, 166, 78, 125);
    graphics.lineWidth = 1.1 * scale;
    graphics.moveTo(left + 146 * scale, top - 150 * scale);
    graphics.lineTo(right - 57 * scale, top - 150 * scale);
    graphics.stroke();

    graphics.fillColor = rgba(90, 53, 17, 215);
    graphics.moveTo(avatarCenterX - 30 * scale, top - 159 * scale);
    graphics.lineTo(avatarCenterX + 38 * scale, top - 159 * scale);
    graphics.lineTo(avatarCenterX + 48 * scale, top - 176 * scale);
    graphics.lineTo(avatarCenterX + 34 * scale, top - 202 * scale);
    graphics.lineTo(avatarCenterX - 34 * scale, top - 202 * scale);
    graphics.lineTo(avatarCenterX - 48 * scale, top - 176 * scale);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = rgba(229, 177, 74, 210);
    graphics.lineWidth = 1.5 * scale;
    graphics.stroke();
  }

  private addLobbyNameSigil(parent: Node, x: number, y: number, scale: number): void {
    const sigil = new Node('LobbyPlayerNameSigil');
    sigil.layer = this.node.layer;
    parent.addChild(sigil);
    sigil.setPosition(new Vec3(x, y, 0));
    sigil.addComponent(UITransform).setContentSize(new Size(24 * scale, 24 * scale));
    const graphics = sigil.addComponent(Graphics);
    graphics.strokeColor = rgba(209, 164, 78, 214);
    graphics.lineWidth = Math.max(1, 1.35 * scale);
    graphics.moveTo(0, 11 * scale);
    graphics.lineTo(0, -8 * scale);
    graphics.moveTo(-8 * scale, 2 * scale);
    graphics.lineTo(8 * scale, 2 * scale);
    graphics.arc(0, -5 * scale, 7 * scale, Math.PI * 0.08, Math.PI * 0.92, false);
    graphics.moveTo(-7 * scale, -5 * scale);
    graphics.lineTo(-10 * scale, -2 * scale);
    graphics.moveTo(7 * scale, -5 * scale);
    graphics.lineTo(10 * scale, -2 * scale);
    graphics.stroke();
  }

  private addLobbyPowerUnderline(parent: Node, x: number, y: number, width: number, scale: number): void {
    const line = new Node('LobbyPlayerPowerUnderline');
    line.layer = this.node.layer;
    parent.addChild(line);
    line.setPosition(new Vec3(x, y, 0));
    line.addComponent(UITransform).setContentSize(new Size(width, 14 * scale));
    const graphics = line.addComponent(Graphics);
    graphics.strokeColor = rgba(178, 137, 72, 130);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.moveTo(-width / 2, 0);
    graphics.lineTo(width / 2, 0);
    graphics.stroke();
  }

  private addLobbyResourceItem(parent: Node, item: LobbyResourceItem, x: number, width: number, height: number, scale: number): void {
    const node = this.addChildPlainNode(parent, `LobbyResourceItem_${item.key}`, x, 0, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(5, 6, 9, 130);
    graphics.rect(-width / 2, -height / 2 + 2 * scale, width, height - 4 * scale);
    graphics.fill();
    graphics.strokeColor = rgba(93, 69, 35, 130);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.moveTo(-width / 2 + 4 * scale, height / 2 - 2 * scale);
    graphics.lineTo(width / 2 - 4 * scale, height / 2 - 2 * scale);
    graphics.moveTo(-width / 2 + 4 * scale, -height / 2 + 2 * scale);
    graphics.lineTo(width / 2 - 4 * scale, -height / 2 + 2 * scale);
    graphics.stroke();

    const glyphSize = 22 * scale;
    this.addLobbyResourceGlyph(node, item.key, -width / 2 + 16 * scale, 0, glyphSize, item.tint, scale);
    const textX = -width / 2 + 37 * scale;
    const textWidth = Math.max(28 * scale, width - 66 * scale);
    const value = this.addChildLabel(
      node,
      `LobbyResourceValue_${item.key}`,
      item.value,
      textX,
      0,
      21 * scale,
      rgba(245, 222, 168),
      new Size(textWidth, 28 * scale),
      HorizontalTextAlignment.LEFT,
    );
    value.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(value, scale, true);
    this.addLobbyDisabledPlus(node, width / 2 - 15 * scale, 0, 16 * scale, scale);
  }

  private addLobbyResourceGlyph(
    parent: Node,
    key: LobbyResourceItem['key'],
    x: number,
    y: number,
    size: number,
    tint: Color,
    scale: number,
  ): void {
    const glyph = new Node(`LobbyResourceGlyph_${key}`);
    glyph.layer = this.node.layer;
    parent.addChild(glyph);
    glyph.setPosition(new Vec3(x, y, 0));
    glyph.addComponent(UITransform).setContentSize(new Size(size, size));
    const graphics = glyph.addComponent(Graphics);
    graphics.fillColor = rgba(tint.r, tint.g, tint.b, 225);
    graphics.strokeColor = rgba(18, 13, 8, 220);
    graphics.lineWidth = Math.max(1, 1 * scale);
    const half = size / 2;

    if (key === 'stamina') {
      graphics.moveTo(-half * 0.05, half * 0.9);
      graphics.lineTo(half * 0.46, half * 0.12);
      graphics.lineTo(half * 0.12, half * 0.12);
      graphics.lineTo(half * 0.38, -half * 0.9);
      graphics.lineTo(-half * 0.5, -half * 0.02);
      graphics.lineTo(-half * 0.12, -half * 0.02);
      graphics.close();
      graphics.fill();
      graphics.stroke();
      return;
    }

    if (key === 'coin') {
      graphics.circle(0, 0, half * 0.72);
      graphics.fill();
      graphics.stroke();
      graphics.strokeColor = rgba(255, 234, 151, 190);
      graphics.lineWidth = Math.max(1, 0.8 * scale);
      graphics.circle(0, 0, half * 0.43);
      graphics.stroke();
      return;
    }

    if (key === 'ruby' || key === 'crystal') {
      graphics.moveTo(0, half * 0.82);
      graphics.lineTo(half * 0.74, 0);
      graphics.lineTo(0, -half * 0.82);
      graphics.lineTo(-half * 0.74, 0);
      graphics.close();
      graphics.fill();
      graphics.stroke();
      graphics.strokeColor = rgba(255, 218, 255, 180);
      graphics.moveTo(-half * 0.43, 0);
      graphics.lineTo(half * 0.43, 0);
      graphics.stroke();
      return;
    }
  }

  private applyLobbyResourceTextStyle(label: Label, scale: number, strong: boolean): void {
    label.enableOutline = true;
    label.outlineColor = rgba(0, 0, 0, strong ? 220 : 185);
    label.outlineWidth = Math.max(1, (strong ? 1.2 : 0.9) * scale);
  }

  private lobbySystemIconSize(scale: number): number {
    return 32 * scale;
  }

  private lobbySystemIconsWidth(_layout: UiLayout, scale: number): number {
    const iconSize = this.lobbySystemIconSize(scale);
    return iconSize * 4 + 14 * scale * 3;
  }

  private addLobbySystemIcon(parent: Node, key: LobbySystemIconKey, x: number, y: number, size: number, scale: number, hot: boolean): void {
    const node = this.addChildPlainNode(parent, `LobbySystemIcon_${key}`, x, y, size, size);
    const button = node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.setStatus('大厅系统入口暂未开放。'), this);
    this.applyImageButtonFeedback(node, 1.08, 0.94);
    const graphics = node.addComponent(Graphics);
    graphics.strokeColor = rgba(206, 171, 112, 230);
    graphics.fillColor = rgba(198, 159, 96, 230);
    graphics.lineWidth = Math.max(2, 2.2 * scale);
    const half = size / 2;

    if (key === 'friends') {
      graphics.circle(-half * 0.22, half * 0.2, half * 0.2);
      graphics.fill();
      graphics.circle(half * 0.22, half * 0.2, half * 0.2);
      graphics.fill();
      graphics.moveTo(-half * 0.48, -half * 0.32);
      graphics.bezierCurveTo(-half * 0.42, -half * 0.02, -half * 0.02, half * 0.02, half * 0.02, -half * 0.32);
      graphics.stroke();
      graphics.moveTo(-half * 0.02, -half * 0.32);
      graphics.bezierCurveTo(half * 0.04, -half * 0.02, half * 0.44, half * 0.02, half * 0.48, -half * 0.32);
      graphics.stroke();
    } else if (key === 'mail') {
      graphics.rect(-half * 0.72, -half * 0.42, half * 1.44, half * 0.9);
      graphics.stroke();
      graphics.moveTo(-half * 0.68, half * 0.44);
      graphics.lineTo(0, -half * 0.08);
      graphics.lineTo(half * 0.68, half * 0.44);
      graphics.stroke();
    } else if (key === 'settings') {
      graphics.circle(0, 0, half * 0.55);
      graphics.stroke();
      graphics.circle(0, 0, half * 0.2);
      graphics.stroke();
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8;
        const start = half * 0.68;
        const end = half * 0.88;
        graphics.moveTo(Math.cos(angle) * start, Math.sin(angle) * start);
        graphics.lineTo(Math.cos(angle) * end, Math.sin(angle) * end);
      }
      graphics.stroke();
    } else {
      for (let i = -1; i <= 1; i += 1) {
        graphics.moveTo(-half * 0.55, i * half * 0.35);
        graphics.lineTo(half * 0.55, i * half * 0.35);
      }
      graphics.stroke();
    }

    if (hot) {
      this.addLobbyRedDot(node, half * 0.42, half * 0.42, 6 * scale, true);
    }
    void button;
  }

  private addLobbyActivityItem(
    parent: Node,
    icon: LobbyActivityIconKey,
    title: string,
    subline: string,
    hot: boolean,
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number,
  ): void {
    const node = this.addChildPlainNode(parent, `LobbyActivityItem_${icon}`, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.setStatus('活动入口暂未开放。'), this);
    this.applyImageButtonFeedback(node, 1.025, 0.98);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(5, 5, 7, 142);
    graphics.rect(-width / 2 + 4 * scale, -height / 2 + 4 * scale, width - 8 * scale, height - 8 * scale);
    graphics.fill();
    graphics.strokeColor = hot ? rgba(150, 34, 38, 190) : rgba(116, 86, 50, 135);
    graphics.lineWidth = Math.max(1, 1.1 * scale);
    graphics.moveTo(-width / 2 + 5 * scale, height / 2 - 5 * scale);
    graphics.lineTo(width / 2 - 12 * scale, height / 2 - 5 * scale);
    graphics.moveTo(-width / 2 + 5 * scale, -height / 2 + 5 * scale);
    graphics.lineTo(width / 2 - 12 * scale, -height / 2 + 5 * scale);
    graphics.stroke();

    this.addLobbyActivityIcon(node, icon, -width / 2 + 34 * scale, 0, 45 * scale, scale);
    const titleLabel = this.addChildLabel(node, `LobbyActivityTitle_${icon}`, title, -width / 2 + 66 * scale, 14 * scale, 22 * scale, rgba(243, 218, 164), new Size(width - 76 * scale, 27 * scale), HorizontalTextAlignment.LEFT);
    titleLabel.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(titleLabel, scale, true);
    const subLabel = this.addChildLabel(node, `LobbyActivitySubline_${icon}`, subline, -width / 2 + 66 * scale, -16 * scale, 20 * scale, hot ? rgba(231, 181, 63) : rgba(199, 169, 108), new Size(width - 76 * scale, 26 * scale), HorizontalTextAlignment.LEFT);
    subLabel.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(subLabel, scale, false);
    this.addLobbyRedDot(node, width / 2 - 26 * scale, height / 2 - 16 * scale, 6 * scale, hot);
  }

  private addLobbyActivityIcon(parent: Node, key: LobbyActivityIconKey, x: number, y: number, size: number, scale: number): void {
    const node = this.addChildPlainNode(parent, `LobbyActivityIcon_${key}`, x, y, size, size);
    const graphics = node.addComponent(Graphics);
    const half = size / 2;
    graphics.fillColor = rgba(15, 11, 9, 210);
    graphics.circle(0, 0, half * 0.92);
    graphics.fill();
    graphics.strokeColor = rgba(176, 128, 70, 210);
    graphics.lineWidth = Math.max(1, 1.4 * scale);
    graphics.circle(0, 0, half * 0.9);
    graphics.stroke();
    graphics.fillColor = rgba(201, 161, 94, 230);

    if (key === 'summon') {
      graphics.moveTo(0, half * 0.72);
      graphics.lineTo(half * 0.34, -half * 0.18);
      graphics.lineTo(-half * 0.52, half * 0.2);
      graphics.lineTo(half * 0.52, half * 0.2);
      graphics.lineTo(-half * 0.34, -half * 0.18);
      graphics.close();
    } else if (key === 'market') {
      graphics.moveTo(-half * 0.58, 0);
      graphics.lineTo(0, half * 0.58);
      graphics.lineTo(half * 0.58, 0);
      graphics.lineTo(0, -half * 0.58);
      graphics.close();
    } else if (key === 'gift') {
      graphics.rect(-half * 0.5, -half * 0.36, half, half * 0.72);
      graphics.moveTo(-half * 0.5, half * 0.03);
      graphics.lineTo(half * 0.5, half * 0.03);
      graphics.moveTo(0, -half * 0.36);
      graphics.lineTo(0, half * 0.36);
      graphics.stroke();
      return;
    } else if (key === 'contract') {
      graphics.moveTo(0, half * 0.68);
      graphics.lineTo(half * 0.58, half * 0.18);
      graphics.lineTo(half * 0.36, -half * 0.58);
      graphics.lineTo(0, -half * 0.22);
      graphics.lineTo(-half * 0.36, -half * 0.58);
      graphics.lineTo(-half * 0.58, half * 0.18);
      graphics.close();
    } else {
      graphics.moveTo(0, half * 0.7);
      graphics.lineTo(half * 0.22, half * 0.12);
      graphics.lineTo(half * 0.7, 0);
      graphics.lineTo(half * 0.22, -half * 0.12);
      graphics.lineTo(0, -half * 0.7);
      graphics.lineTo(-half * 0.22, -half * 0.12);
      graphics.lineTo(-half * 0.7, 0);
      graphics.lineTo(-half * 0.22, half * 0.12);
      graphics.close();
    }
    graphics.fill();
    graphics.stroke();
  }

  private addLobbyHotspotHitArea(parent: Node, label: string, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.addChildPlainNode(parent, `LobbyHotspotHitArea_${label}`, x, y, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(210, 36, 44, 0);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    node.addComponent(Button);
    node.on(Node.EventType.MOUSE_ENTER, () => {
      this.setStatus(`${label} 暂未开放。`);
      this.drawLobbyHotspotHover(node, width, height, scale, true);
    }, this);
    node.on(Node.EventType.MOUSE_LEAVE, () => this.drawLobbyHotspotHover(node, width, height, scale, false), this);
    node.on(Button.EventType.CLICK, () => this.activateLobbyHotspot(parent, label, x, y, scale), this);
    this.applyPointerCursor(node);
  }

  private addLobbyHotspotPlaque(parent: Node, label: string, x: number, y: number, width: number, height: number, scale: number, hot: boolean): void {
    const node = this.addChildPlainNode(parent, `LobbyHotspot_${label}`, x, y, width, height);
    node.addComponent(Button);
    node.on(Node.EventType.MOUSE_ENTER, () => this.setStatus(`${label} 暂未开放。`), this);
    node.on(Button.EventType.CLICK, () => this.activateLobbyHotspot(parent, label, x, y, scale), this);
    this.applyImageButtonFeedback(node, 1.035, 0.97);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(4, 4, 5, 172);
    graphics.moveTo(-width / 2 + 12 * scale, height / 2);
    graphics.lineTo(width / 2 - 12 * scale, height / 2);
    graphics.lineTo(width / 2, 0);
    graphics.lineTo(width / 2 - 12 * scale, -height / 2);
    graphics.lineTo(-width / 2 + 12 * scale, -height / 2);
    graphics.lineTo(-width / 2, 0);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = rgba(145, 106, 55, 140);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.stroke();
    const text = this.addChildLabel(node, 'LobbyHotspotLabel', label, 0, 1 * scale, 22 * scale, rgba(236, 208, 145), new Size(width - 18 * scale, height));
    text.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(text, scale, true);
    this.addLobbyRedDot(node, width / 2 - 8 * scale, height / 2 - 3 * scale, 5 * scale, hot);
  }

  private drawLobbyHotspotHover(node: Node, width: number, height: number, scale: number, visible: boolean): void {
    const old = node.getChildByName('LobbyHotspotHover');
    if (old) {
      old.removeFromParent();
      old.destroy();
    }
    if (!visible) {
      return;
    }
    const hoverSize = Math.min(Math.min(width, height) * 0.68, 92 * scale);
    const hover = this.addChildPlainNode(node, 'LobbyHotspotHover', 0, 0, hoverSize, hoverSize);
    const graphics = hover.addComponent(Graphics);
    graphics.strokeColor = rgba(214, 42, 52, 132);
    graphics.lineWidth = Math.max(1, 1.25 * scale);
    graphics.circle(0, 0, hoverSize * 0.28);
    graphics.moveTo(0, hoverSize * 0.43);
    graphics.lineTo(hoverSize * 0.43, 0);
    graphics.lineTo(0, -hoverSize * 0.43);
    graphics.lineTo(-hoverSize * 0.43, 0);
    graphics.close();
    graphics.stroke();
    graphics.strokeColor = rgba(232, 187, 94, 118);
    graphics.moveTo(-hoverSize * 0.55, 0);
    graphics.lineTo(-hoverSize * 0.36, 0);
    graphics.moveTo(hoverSize * 0.36, 0);
    graphics.lineTo(hoverSize * 0.55, 0);
    graphics.moveTo(0, -hoverSize * 0.55);
    graphics.lineTo(0, -hoverSize * 0.36);
    graphics.moveTo(0, hoverSize * 0.36);
    graphics.lineTo(0, hoverSize * 0.55);
    graphics.stroke();
  }

  private activateLobbyHotspot(parent: Node, label: string, x: number, y: number, scale: number): void {
    this.setStatus(`${label} 暂未开放。`);
    this.playLobbyClickEffect(parent, x, y, scale);
  }

  private playLobbyClickEffect(parent: Node, x: number, y: number, scale: number): void {
    const size = 92 * scale;
    const node = this.addChildPlainNode(parent, 'LobbyClickEffect', x, y, size, size);
    const opacity = node.addComponent(UIOpacity);
    opacity.opacity = 210;
    const graphics = node.addComponent(Graphics);
    graphics.strokeColor = rgba(229, 44, 55, 220);
    graphics.lineWidth = Math.max(1, 2 * scale);
    graphics.circle(0, 0, size * 0.28);
    graphics.moveTo(0, size * 0.44);
    graphics.lineTo(size * 0.44, 0);
    graphics.lineTo(0, -size * 0.44);
    graphics.lineTo(-size * 0.44, 0);
    graphics.close();
    graphics.stroke();
    graphics.strokeColor = rgba(244, 195, 96, 180);
    graphics.lineWidth = Math.max(1, 1 * scale);
    graphics.moveTo(-size * 0.58, 0);
    graphics.lineTo(-size * 0.34, 0);
    graphics.moveTo(size * 0.34, 0);
    graphics.lineTo(size * 0.58, 0);
    graphics.moveTo(0, -size * 0.58);
    graphics.lineTo(0, -size * 0.34);
    graphics.moveTo(0, size * 0.34);
    graphics.lineTo(0, size * 0.58);
    graphics.stroke();
    node.setScale(new Vec3(0.76, 0.76, 1));
    tween(node).to(0.22, { scale: new Vec3(1.25, 1.25, 1) }).call(() => {
      if (node.isValid) {
        node.removeFromParent();
        node.destroy();
      }
    }).start();
    tween(opacity).to(0.22, { opacity: 0 }).start();
  }

  private addLobbyChallengeCard(parent: Node, title: string, subline: string, tint: Color, hot: boolean, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.addChildPlainNode(parent, `LobbyChallengeCard_${title}`, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.setStatus('挑战入口暂未开放。'), this);
    this.applyImageButtonFeedback(node, 1.025, 0.975);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(5, 5, 7, 190);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = rgba(tint.r, tint.g, tint.b, 118);
    graphics.rect(-width / 2 + 5 * scale, -height / 2 + 5 * scale, width - 10 * scale, height - 10 * scale);
    graphics.fill();
    this.drawLobbyChallengeArt(graphics, width, height, scale);
    graphics.strokeColor = rgba(131, 93, 50, 185);
    graphics.lineWidth = Math.max(1, 1.2 * scale);
    graphics.rect(-width / 2 + 1 * scale, -height / 2 + 1 * scale, width - 2 * scale, height - 2 * scale);
    graphics.stroke();
    graphics.fillColor = rgba(0, 0, 0, 112);
    graphics.rect(-width / 2 + 4 * scale, -height / 2 + 4 * scale, width - 8 * scale, 36 * scale);
    graphics.fill();
    const titleLabel = this.addChildLabel(node, 'LobbyChallengeTitle', title, -width / 2 + 14 * scale, -height / 2 + 30 * scale, 22 * scale, rgba(247, 221, 162), new Size(width - 26 * scale, 28 * scale), HorizontalTextAlignment.LEFT);
    titleLabel.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(titleLabel, scale, true);
    const subLabel = this.addChildLabel(node, 'LobbyChallengeSubline', subline, -width / 2 + 14 * scale, -height / 2 + 10 * scale, 18 * scale, rgba(230, 179, 58), new Size(width - 26 * scale, 23 * scale), HorizontalTextAlignment.LEFT);
    subLabel.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(subLabel, scale, false);
    this.addLobbyRedDot(node, width / 2 - 9 * scale, height / 2 - 9 * scale, 5 * scale, hot);
  }

  private drawLobbyChallengeArt(graphics: Graphics, width: number, height: number, scale: number): void {
    graphics.strokeColor = rgba(226, 222, 211, 86);
    graphics.lineWidth = Math.max(1, 1 * scale);
    for (let index = 0; index < 5; index += 1) {
      const x = -width / 2 + (34 + index * 27) * scale;
      graphics.moveTo(x, height / 2 - 10 * scale);
      graphics.lineTo(x + 18 * scale, 4 * scale);
      graphics.lineTo(x + 4 * scale, -height / 2 + 39 * scale);
    }
    graphics.stroke();
  }

  private addLobbyCompass(parent: Node, x: number, y: number, size: number, scale: number): void {
    const node = this.addChildPlainNode(parent, 'LobbyCompass', x, y, size, size);
    const graphics = node.addComponent(Graphics);
    const half = size / 2;
    graphics.fillColor = rgba(8, 8, 9, 198);
    graphics.circle(0, 0, half * 0.88);
    graphics.fill();
    graphics.strokeColor = rgba(147, 110, 66, 205);
    graphics.lineWidth = Math.max(1, 1.5 * scale);
    graphics.circle(0, 0, half * 0.86);
    graphics.circle(0, 0, half * 0.58);
    graphics.stroke();
    graphics.fillColor = rgba(190, 150, 88, 230);
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const long = index % 2 === 0 ? half * 0.8 : half * 0.58;
      const short = half * 0.16;
      graphics.moveTo(Math.cos(angle) * long, Math.sin(angle) * long);
      graphics.lineTo(Math.cos(angle + 0.18) * short, Math.sin(angle + 0.18) * short);
      graphics.lineTo(Math.cos(angle - 0.18) * short, Math.sin(angle - 0.18) * short);
      graphics.close();
      graphics.fill();
    }
  }

  private addLobbyAdventureButton(parent: Node, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.addChildPlainNode(parent, 'LobbyAdventureButton', x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.setStatus('冒险入口暂未开放。'), this);
    this.applyImageButtonFeedback(node, 1.025, 0.97);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(72, 6, 10, 184);
    graphics.moveTo(-width / 2 + 28 * scale, height / 2);
    graphics.lineTo(width / 2 - 20 * scale, height / 2);
    graphics.lineTo(width / 2, 0);
    graphics.lineTo(width / 2 - 20 * scale, -height / 2);
    graphics.lineTo(-width / 2 + 28 * scale, -height / 2);
    graphics.lineTo(-width / 2, 0);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = rgba(163, 35, 40, 210);
    graphics.lineWidth = Math.max(1, 1.5 * scale);
    graphics.stroke();
    this.addLobbyCompass(node, -width / 2 + 48 * scale, 0, 66 * scale, scale * 0.78);
    const title = this.addChildLabel(node, 'LobbyAdventureTitle', '冒险', -width / 2 + 104 * scale, 14 * scale, 31 * scale, rgba(249, 220, 166), new Size(width - 130 * scale, 38 * scale), HorizontalTextAlignment.LEFT);
    title.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(title, scale, true);
    const chapter = this.addChildLabel(node, 'LobbyAdventureChapter', '24-15 暗影之堡', -width / 2 + 104 * scale, -20 * scale, 19 * scale, rgba(223, 185, 126), new Size(width - 130 * scale, 27 * scale), HorizontalTextAlignment.LEFT);
    chapter.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(chapter, scale, false);
  }

  private addLobbyBottomNav(parent: Node, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.addChildPlainNode(parent, 'LobbyBottomNav', x, y, width, height);
    const items = LOBBY_NAV_ITEMS;
    const slot = width / items.length;
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      this.addLobbyNavItem(node, item.key, item.label, item.hot, -width / 2 + slot * index + slot / 2, 6 * scale, slot, height, scale);
    }
  }

  private addLobbyNavItem(parent: Node, key: LobbyNavIconKey, label: string, hot: boolean, x: number, y: number, width: number, height: number, scale: number): void {
    const node = this.addChildPlainNode(parent, `LobbyNavItem_${key}`, x, y, width, height);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.setStatus('底部导航暂未开放。'), this);
    this.applyImageButtonFeedback(node, 1.04, 0.97);
    this.addLobbyNavIcon(node, key, 0, 13 * scale, 29 * scale, scale);
    const text = this.addChildLabel(node, `LobbyNavLabel_${key}`, label, 0, -26 * scale, 19 * scale, rgba(190, 167, 119), new Size(width, 25 * scale));
    text.overflow = Label.Overflow.SHRINK;
    this.applyLobbyResourceTextStyle(text, scale, false);
    this.addLobbyRedDot(node, 17 * scale, 30 * scale, 5 * scale, hot);
  }

  private addLobbyNavIcon(parent: Node, key: LobbyNavIconKey, x: number, y: number, size: number, scale: number): void {
    const node = this.addChildPlainNode(parent, `LobbyNavIcon_${key}`, x, y, size, size);
    const graphics = node.addComponent(Graphics);
    const half = size / 2;
    graphics.strokeColor = rgba(159, 132, 88, 220);
    graphics.fillColor = rgba(153, 123, 79, 190);
    graphics.lineWidth = Math.max(1, 1.3 * scale);
    if (key === 'bag') {
      graphics.rect(-half * 0.5, -half * 0.44, half, half * 0.82);
      graphics.stroke();
      graphics.moveTo(-half * 0.26, half * 0.38);
      graphics.bezierCurveTo(-half * 0.18, half * 0.72, half * 0.18, half * 0.72, half * 0.26, half * 0.38);
      graphics.stroke();
      return;
    }
    if (key === 'codex') {
      graphics.moveTo(-half * 0.62, half * 0.58);
      graphics.lineTo(0, half * 0.34);
      graphics.lineTo(half * 0.62, half * 0.58);
      graphics.lineTo(half * 0.62, -half * 0.52);
      graphics.lineTo(0, -half * 0.32);
      graphics.lineTo(-half * 0.62, -half * 0.52);
      graphics.close();
      graphics.stroke();
      return;
    }
    if (key === 'quest') {
      graphics.moveTo(0, half * 0.68);
      graphics.lineTo(half * 0.52, -half * 0.42);
      graphics.lineTo(0, -half * 0.18);
      graphics.lineTo(-half * 0.52, -half * 0.42);
      graphics.close();
      graphics.stroke();
      return;
    }
    if (key === 'shop') {
      graphics.rect(-half * 0.55, -half * 0.45, half * 1.1, half * 0.68);
      graphics.stroke();
      graphics.moveTo(-half * 0.62, half * 0.22);
      graphics.lineTo(half * 0.62, half * 0.22);
      graphics.stroke();
      return;
    }
    if (key === 'forge') {
      graphics.moveTo(-half * 0.55, -half * 0.42);
      graphics.lineTo(half * 0.5, half * 0.42);
      graphics.moveTo(-half * 0.12, half * 0.52);
      graphics.lineTo(half * 0.58, -half * 0.2);
      graphics.stroke();
      return;
    }
    if (key === 'contract') {
      graphics.moveTo(0, half * 0.68);
      graphics.lineTo(half * 0.56, 0);
      graphics.lineTo(0, -half * 0.68);
      graphics.lineTo(-half * 0.56, 0);
      graphics.close();
      graphics.stroke();
      return;
    }
    graphics.moveTo(0, half * 0.7);
    graphics.lineTo(half * 0.18, half * 0.16);
    graphics.lineTo(half * 0.64, 0);
    graphics.lineTo(half * 0.18, -half * 0.16);
    graphics.lineTo(0, -half * 0.7);
    graphics.lineTo(-half * 0.18, -half * 0.16);
    graphics.lineTo(-half * 0.64, 0);
    graphics.lineTo(-half * 0.18, half * 0.16);
    graphics.close();
    graphics.stroke();
  }

  private addLobbyChatPreview(parent: Node, x: number, y: number, width: number, scale: number): void {
    if (width < 260 * scale) {
      return;
    }
    const node = this.addChildPlainNode(parent, 'LobbyChatPreview', x + width / 2, y, width, 24 * scale);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(0, 0, 0, 92);
    graphics.rect(-width / 2, -12 * scale, width, 24 * scale);
    graphics.fill();
    this.addChildLabel(node, 'LobbyChatBubble', '...', -width / 2 + 15 * scale, 0, 18 * scale, rgba(177, 157, 112), new Size(35 * scale, 22 * scale));
    const text = this.addChildLabel(node, 'LobbyChatText', '[世界] LootChain: 欢迎来到LootChain的世界！', -width / 2 + 44 * scale, 0, 16 * scale, rgba(178, 169, 130), new Size(width - 50 * scale, 24 * scale), HorizontalTextAlignment.LEFT);
    text.overflow = Label.Overflow.SHRINK;
  }

  private addLobbyDisabledPlus(parent: Node, x: number, y: number, size: number, scale: number): void {
    const node = this.addChildPlainNode(parent, 'LobbyResourceDisabledPlus', x, y, size, size);
    const graphics = node.addComponent(Graphics);
    graphics.strokeColor = rgba(177, 135, 84, 160);
    graphics.lineWidth = Math.max(1, 2 * scale);
    graphics.moveTo(-size * 0.35, 0);
    graphics.lineTo(size * 0.35, 0);
    graphics.moveTo(0, -size * 0.35);
    graphics.lineTo(0, size * 0.35);
    graphics.stroke();
  }

  private addLobbyRedDot(parent: Node, x: number, y: number, size: number, visible: boolean): void {
    if (!visible) {
      return;
    }
    const node = this.addChildPlainNode(parent, 'LobbyRedDot', x, y, size * 2, size * 2);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = rgba(188, 28, 38, 235);
    graphics.moveTo(0, size);
    graphics.lineTo(size, 0);
    graphics.lineTo(0, -size);
    graphics.lineTo(-size, 0);
    graphics.close();
    graphics.fill();
    graphics.strokeColor = rgba(255, 91, 76, 210);
    graphics.lineWidth = Math.max(1, size * 0.18);
    graphics.stroke();
  }

}
