import { existsSync, readFileSync } from 'node:fs';

const required = [
  'assets/scripts/app/AppConfig.ts',
  'assets/scripts/net/HttpClient.ts',
  'assets/scripts/api/PlayerAuthApi.ts',
  'assets/scripts/api/PlayerProfileApi.ts',
  'assets/scripts/api/GachaApi.ts',
  'assets/scripts/api/HeroApi.ts',
  'assets/scripts/api/BagApi.ts',
  'assets/scripts/types/PlayerTypes.ts',
  'assets/scripts/scenes/LootChainGameRoot.ts',
  'assets/scripts/scenes/lobby.meta',
  'assets/scripts/scenes/lobby/LobbyHudConfig.ts',
  'assets/scripts/scenes/lobby/LobbyHudConfig.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHudRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyHudRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHudTypes.ts',
  'assets/scripts/scenes/lobby/LobbyHudTypes.ts.meta',
  'assets/scripts/scenes/LootChainLoginEffectLayer.ts',
  'assets/resources/login-bg/scripts/login/LoginVideoBackground.ts',
  'assets/resources/lobby/lobby_bg_poster.jpg',
  'assets/resources/lobby/lobby_bg_loop.mp4',
  'assets/resources/ui/lobby/lobby_player_info_panel.png',
  'assets/resources/ui/lobby/lobby_player_info_panel.png.meta',
  'docs/api-contract.md',
  'docs/web-h5-build.md',
  'docs/art-vfx-pipeline.md',
  'docs/login-vfx-final-plan.md',
];

let ok = true;
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`missing: ${file}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

const scenePath = 'assets/main.scene';
const gameRootPath = 'assets/scripts/scenes/LootChainGameRoot.ts';
const lobbyHudConfigPath = 'assets/scripts/scenes/lobby/LobbyHudConfig.ts';
const lobbyHudPath = 'assets/scripts/scenes/lobby/LobbyHudRenderer.ts';
const lobbyHudTypesPath = 'assets/scripts/scenes/lobby/LobbyHudTypes.ts';
const profileApiPath = 'assets/scripts/api/PlayerProfileApi.ts';
const lobbyPanelAssetPath = 'assets/resources/ui/lobby/lobby_player_info_panel.png';
const lobbyPanelMetaPath = 'assets/resources/ui/lobby/lobby_player_info_panel.png.meta';
const gameRoot = readFileSync(gameRootPath, 'utf8');
const lobbyHudConfig = readFileSync(lobbyHudConfigPath, 'utf8');
const lobbyHud = readFileSync(lobbyHudPath, 'utf8');
const lobbyHudTypes = readFileSync(lobbyHudTypesPath, 'utf8');
const profileApi = readFileSync(profileApiPath, 'utf8');
const sceneText = readFileSync(scenePath, 'utf8');
let scene = null;
const checkedClientSources = [
  { path: gameRootPath, text: gameRoot },
  { path: lobbyHudConfigPath, text: lobbyHudConfig },
  { path: lobbyHudPath, text: lobbyHud },
  { path: lobbyHudTypesPath, text: lobbyHudTypes },
];
const lobbyHudModule = `${lobbyHudConfig}\n${lobbyHud}\n${lobbyHudTypes}`;

try {
  scene = JSON.parse(sceneText);
} catch (error) {
  console.error(`invalid json: ${scenePath}`);
  console.error(error instanceof Error ? error.message : String(error));
  ok = false;
}

const forbiddenLoginRootTokens = [
  'this.api.gacha',
  'this.api.hero',
  'this.api.bag',
  '/api/player/gacha/draw',
  '/api/player/heroes/',
  '/api/player/bag/use',
  '/api/player/bag/sell',
  '/claim',
  '/purchase',
  '/withdraw',
  'USDT',
  '登录验收通过',
];

for (const token of forbiddenLoginRootTokens) {
  for (const source of checkedClientSources) {
    if (source.text.includes(token)) {
      console.error(`forbidden login-stage token in ${source.path}: ${token}`);
      ok = false;
    }
  }
}

const requiredLoginRootTokens = [
  'this.api.auth.logout();',
  "import { LobbyHudRenderer, type LobbyHudHost } from './lobby/LobbyHudRenderer';",
  'const SHOW_DIALOG_THIRD_PARTY_LOGIN = true;',
  'EditBox.InputFlag.PASSWORD',
  'private applyPasswordMask(editBox: EditBox, textLabel: Label): void',
  "type ViewName = 'login' | 'loginDialog' | 'loading' | 'lobby';",
  "const LOBBY_VIDEO_PATH = 'lobby/lobby_bg_loop';",
  "const LOBBY_POSTER_PATH = 'lobby/lobby_bg_poster';",
  'const USE_LOBBY_NATIVE_VIDEO_BACKGROUND = true;',
  'const LOBBY_POSTER_FADE_DURATION = 0.4;',
  'private tryPlayLobbyVideo(): void',
  'private updateLobbyPosterFade(deltaTime: number): void',
  'video.stayOnBottom = true;',
  'VideoPlayer.EventType.PLAYING',
  'private renderLoading(): void',
  'private renderLobby(): void',
  'private renderLobbyHud(layout: UiLayout): void',
  'this.lobbyHudRenderer.render(layout);',
  'private compactResourceValue(value: number | null | undefined): string',
  'private refreshLobbyOverlay(): void',
  'private renderPlayerProfileDialog(layout: UiLayout): void',
  'private removePlayerProfileDialog(): void',
  'private drawArmoredAvatarPortrait(graphics: Graphics, size: number): void',
  'private drawAvatarFrameOrnaments(graphics: Graphics, size: number): void',
  'private resolveAlignedLabelX(x: number, width: number, horizontalAlign: HorizontalTextAlignment): number',
  'private openPlayerProfileDialog(): void',
  'private closePlayerProfileDialog(): void',
  'private removeNodeFromContent(name: string): void',
  'safeLeft: number;',
  'safeRight: number;',
  'safeTop: number;',
  'safeBottom: number;',
  'const safeInsetX = clamp(stageWidth * 0.035',
  'this.api.profile.lobbyProfile()',
  'LobbyPlayerAvatar',
  'LobbyPlayerInfoButton',
  'LobbyResourceBar',
  'LobbySystemIcons',
  'LobbyActivityRail',
  'LobbySceneHotspots',
  'LobbyChallengeRail',
  'LobbyBottomHud',
  'LobbyProfileDim',
  'LobbyProfilePanel',
  'LobbyProfileCloseButton',
  'profile-open',
  "const LOGIN_STAGE_NODE_NAMES = ['BG_Main', 'FG_Architecture'] as const;",
  'private resolveStageBounds(visibleWidth: number, visibleHeight: number): StageBounds',
  'const transform = stageNode?.getComponent(UITransform);',
  'stageNode.position.x',
  'layout.safeRight - railWidth / 2',
];

for (const token of requiredLoginRootTokens) {
  if (!gameRoot.includes(token)) {
    console.error(`missing login-stage safeguard in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyHudTokens = [
  'export class LobbyHudRenderer',
  'render(layout: UiLayout): void',
  "from './LobbyHudConfig';",
  "from './LobbyHudTypes';",
  'private renderLobbyPlayerInfo(layout: UiLayout): void',
  'private renderLobbyResourceBar(layout: UiLayout): void',
  'private renderLobbySystemIcons(layout: UiLayout): void',
  'private renderLobbyActivityRail(layout: UiLayout): void',
  'private renderLobbySceneHotspots(layout: UiLayout): void',
  'private renderLobbyChallengeRail(layout: UiLayout): void',
  'private renderLobbyBottomHud(layout: UiLayout): void',
  'private resolveLobbyPlayerInfoLayout(layout: UiLayout): LobbyPlayerInfoLayout',
  'private lobbyResourceItems(profile: PlayerLobbyProfileVO): LobbyResourceItem[]',
  'private addLobbyResourceGlyph(',
  'private addLobbySystemIcon(parent: Node, key: LobbySystemIconKey',
  'private addLobbyHotspotHitArea(parent: Node, label: string',
  'private addLobbyHotspotPlaque(parent: Node, label: string',
  'private activateLobbyHotspot(parent: Node, label: string',
  'private playLobbyClickEffect(parent: Node, x: number',
  'private addLobbyChallengeCard(parent: Node, title: string',
  'private addLobbyAdventureButton(parent: Node, x: number',
  'private addLobbyBottomNav(parent: Node, x: number',
  'private addLobbyDisabledPlus(parent: Node',
  'private drawLobbyPlayerInfoFrame(parent: Node, width: number, height: number, scale: number): void',
  'private addLobbyNameSigil(parent: Node, x: number, y: number, scale: number): void',
  'private lobbyHudScale(layout: UiLayout): number',
  "private lobbyHudEdgeInset(layout: UiLayout, axis: 'x' | 'y', scale: number): number",
  'private applyLobbyPlayerTextStyle(label: Label, scale: number, strong: boolean): void',
  'this.applyImageButtonFeedback(panel, 1.006, 0.994);',
  'nameLabel.overflow = Label.Overflow.SHRINK;',
  'levelLabel.overflow = Label.Overflow.SHRINK;',
  'label.enableOutline = true;',
  'LobbyPlayerInfoArt',
  'LobbyPlayerName',
  'LobbyPlayerLevel',
  'LobbyPlayerPower',
  'LobbyPlayerExpBadge',
  'LobbyResourceItem_${item.key}',
  'LobbyResourceValue_${item.key}',
  'LobbyHotspotHitArea_${label}',
  'LobbyClickEffect',
  'LobbyAdventureButton',
];

for (const token of requiredLobbyHudTokens) {
  if (!lobbyHud.includes(token)) {
    console.error(`missing lobby HUD module safeguard in ${lobbyHudPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyHudModuleTokens = [
  'export const LOBBY_PLAYER_INFO_PANEL_ASPECT = 540 / 218;',
  "export const LOBBY_PLAYER_INFO_PANEL_ASSET = 'ui/lobby/lobby_player_info_panel/spriteFrame';",
  'export const LOBBY_SYSTEM_ICONS',
  'export const LOBBY_ACTIVITY_ITEMS',
  'export const LOBBY_SCENE_HOTSPOTS',
  'export const LOBBY_CHALLENGE_ITEMS',
  'export const LOBBY_NAV_ITEMS',
  'LobbySceneHotspotConfig',
  'LobbyActivityItemConfig',
  'LobbyChallengeItemConfig',
  'LobbyNavItemConfig',
  'export interface LobbyHudHost',
  '召唤祭坛',
  '深渊之门',
  '战役',
  '商店',
];

for (const token of requiredLobbyHudModuleTokens) {
  if (!lobbyHudModule.includes(token)) {
    console.error(`missing lobby HUD module token: ${token}`);
    ok = false;
  }
}

if (!profileApi.includes("'/api/player/me/lobby'")) {
  console.error(`missing read-only lobby profile endpoint in ${profileApiPath}`);
  ok = false;
}

function readPngDimensions(filePath) {
  const bytes = readFileSync(filePath);
  const signature = bytes.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    console.error(`invalid png signature: ${filePath}`);
    ok = false;
    return { width: 0, height: 0 };
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function assertLobbyPlayerPanelAsset() {
  const dimensions = readPngDimensions(lobbyPanelAssetPath);
  if (dimensions.width !== 1080 || dimensions.height !== 436) {
    console.error(`lobby player panel must be a 2x 540:218 asset, got ${dimensions.width}x${dimensions.height}`);
    ok = false;
  }

  let meta = null;
  try {
    meta = JSON.parse(readFileSync(lobbyPanelMetaPath, 'utf8'));
  } catch (error) {
    console.error(`invalid json: ${lobbyPanelMetaPath}`);
    console.error(error instanceof Error ? error.message : String(error));
    ok = false;
    return;
  }

  const spriteMeta = meta?.subMetas?.f9941?.userData;
  if (!spriteMeta) {
    console.error(`missing lobby player panel spriteFrame metadata: ${lobbyPanelMetaPath}`);
    ok = false;
    return;
  }

  const expected = {
    width: 1080,
    height: 436,
    rawWidth: 1080,
    rawHeight: 436,
    trimX: 0,
    trimY: 0,
    offsetX: 0,
    offsetY: 0,
  };

  for (const [key, value] of Object.entries(expected)) {
    if (spriteMeta[key] !== value) {
      console.error(`lobby player panel meta ${key} expected ${value}, got ${spriteMeta[key]}`);
      ok = false;
    }
  }
}

assertLobbyPlayerPanelAsset();

const forbiddenFixedLayoutTokens = [
  'const LOGIN_STAGE_WIDTH',
  'const LOGIN_STAGE_HEIGHT',
];

for (const token of forbiddenFixedLayoutTokens) {
  if (gameRoot.includes(token)) {
    console.error(`fixed login-stage layout token in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

function methodBody(signature) {
  const start = gameRoot.indexOf(signature);
  if (start < 0) {
    return '';
  }
  const next = gameRoot.indexOf('\n  private ', start + signature.length);
  return gameRoot.slice(start, next < 0 ? undefined : next);
}

for (const signature of [
  'private openPlayerProfileDialog(): void',
  'private closePlayerProfileDialog(): void',
  'private async loadLobbyProfile(userId: number): Promise<void>',
]) {
  const body = methodBody(signature);
  if (body.includes('this.renderLobby();')) {
    console.error(`${signature} must not rebuild the full lobby; refresh overlay nodes only to avoid background flash`);
    ok = false;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function nodeName(entry) {
  return entry && entry.__type__ === 'cc.Node' ? entry._name : '';
}

function findNodeIdByName(name) {
  if (!Array.isArray(scene)) {
    return -1;
  }
  return scene.findIndex((entry) => nodeName(entry) === name);
}

function findUiTransform(nodeId) {
  if (!Array.isArray(scene)) {
    return null;
  }
  return scene.find((entry) => entry?.__type__ === 'cc.UITransform' && entry.node?.__id__ === nodeId) ?? null;
}

function getNodeScale(node) {
  return node?._lscale ?? { x: 1, y: 1 };
}

function getNodePosition(node) {
  return node?._lpos ?? { x: 0, y: 0 };
}

function assertInsideStage(name, left, right, top, bottom, stage) {
  const tolerance = 0.01;
  if (left < stage.left - tolerance || right > stage.right + tolerance || top > stage.top + tolerance || bottom < stage.bottom - tolerance) {
    console.error(
      `${name} outside adaptive stage: left=${left.toFixed(2)}, right=${right.toFixed(2)}, top=${top.toFixed(2)}, bottom=${bottom.toFixed(2)}, stage=${JSON.stringify(stage)}`,
    );
    ok = false;
  }
}

function resolveAdaptiveLayout(viewportWidth, viewportHeight, stageSize, stageScale, stagePosition) {
  const width = Math.max(320, viewportWidth);
  const height = Math.max(180, viewportHeight);
  const measuredStageWidth = Math.min(width, Math.abs(stageSize.width * stageScale.x));
  const measuredStageHeight = Math.min(height, Math.abs(stageSize.height * stageScale.y));
  const stageWidth = Math.max(320, measuredStageWidth);
  const stageHeight = Math.max(180, measuredStageHeight);
  const uiScale = Math.min(1, stageWidth / 1920, stageHeight / 1080);
  const stageLeft = stagePosition.x - stageWidth / 2;
  const stageRight = stagePosition.x + stageWidth / 2;
  const stageTop = stagePosition.y + stageHeight / 2;
  const stageBottom = stagePosition.y - stageHeight / 2;
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
  };
}

function stageBox(layout) {
  return {
    left: layout.stageLeft,
    right: layout.stageRight,
    top: layout.stageTop,
    bottom: layout.stageBottom,
  };
}

function assertLoginOverlayBounds(layout, name) {
  const stage = stageBox(layout);
  const centerX = (layout.stageLeft + layout.stageRight) / 2;
  const centerY = (layout.stageTop + layout.stageBottom) / 2;

  const logoWidth = clamp(layout.stageWidth * 0.23, 210 * layout.uiScale, 320 * layout.uiScale);
  const logoHeight = Math.round(logoWidth * 0.51);
  const logoX = layout.safeLeft + logoWidth / 2;
  const logoY = layout.safeTop - logoHeight / 2;
  assertInsideStage(`${name}:LoginLogo`, logoX - logoWidth / 2, logoX + logoWidth / 2, logoY + logoHeight / 2, logoY - logoHeight / 2, stage);

  const railWidth = 76 * layout.uiScale;
  const railHeight = 74 * layout.uiScale;
  const railX = layout.safeRight - railWidth / 2;
  const railYStart = layout.safeTop - Math.max(8 * layout.uiScale, layout.safeInsetY * 0.4) - railHeight / 2;
  const railGap = 84 * layout.uiScale;
  for (let index = 0; index < 4; index += 1) {
    const railY = railYStart - index * railGap;
    assertInsideStage(`${name}:LoginRightRail${index + 1}`, railX - railWidth / 2, railX + railWidth / 2, railY + railHeight / 2, railY - railHeight / 2, stage);
  }

  const buttonWidth = clamp(layout.contentWidth * 0.34, 300 * layout.uiScale, 450 * layout.uiScale);
  const buttonHeight = Math.round(buttonWidth * 0.23);
  const buttonY = layout.safeBottom + Math.max(12 * layout.uiScale, layout.safeHeight * 0.02) + buttonHeight / 2;
  assertInsideStage(`${name}:LoginMainButton`, centerX - buttonWidth / 2, centerX + buttonWidth / 2, buttonY + buttonHeight / 2, buttonY - buttonHeight / 2, stage);

  const dialogWidth = Math.min(620 * layout.uiScale, layout.contentWidth * 0.7);
  const dialogHeight = 560 * layout.uiScale;
  const dialogY = centerY - layout.stageHeight * 0.08;
  assertInsideStage(`${name}:LoginDialogPanel`, centerX - dialogWidth / 2, centerX + dialogWidth / 2, dialogY + dialogHeight / 2, dialogY - dialogHeight / 2, stage);

  const loadingWidth = Math.min(660 * layout.uiScale, layout.contentWidth * 0.72);
  const loadingHeight = 260 * layout.uiScale;
  const loadingY = centerY - 12 * layout.uiScale;
  assertInsideStage(`${name}:LoadingPanel`, centerX - loadingWidth / 2, centerX + loadingWidth / 2, loadingY + loadingHeight / 2, loadingY - loadingHeight / 2, stage);
}

function assertLobbyOverlayBounds(layout, name) {
  const stage = stageBox(layout);
  const baseHudScale = clamp(layout.uiScale, 0.62, 1);
  const hudInsetX = clamp(layout.safeInsetX * 0.38, 10 * baseHudScale, 26 * baseHudScale);
  const hudInsetY = clamp(layout.safeInsetY * 0.38, 8 * baseHudScale, 18 * baseHudScale);
  let playerWidth = Math.min(
    clamp(layout.stageWidth * 0.28, 420 * baseHudScale, 540 * baseHudScale),
    layout.safeWidth,
    layout.stageWidth - hudInsetX * 2,
  );
  let playerHeight = playerWidth / (540 / 218);
  const maxPlayerHeight = layout.stageHeight - hudInsetY * 2;
  if (playerHeight > maxPlayerHeight) {
    playerHeight = maxPlayerHeight;
    playerWidth = playerHeight * (540 / 218);
  }
  const hudScale = playerWidth / 540;
  const playerX = layout.stageLeft + hudInsetX + playerWidth / 2;
  const playerY = layout.stageTop - hudInsetY - playerHeight / 2;
  assertInsideStage(`${name}:LobbyPlayerInfoButton`, playerX - playerWidth / 2, playerX + playerWidth / 2, playerY + playerHeight / 2, playerY - playerHeight / 2, stage);
  const playerLeft = playerX - playerWidth / 2;
  const playerTop = playerY + playerHeight / 2;
  const avatarSize = 125 * hudScale;
  const avatarX = playerLeft + 80 * hudScale;
  const avatarY = playerTop - 90 * hudScale;
  const avatarOuterRadius = (avatarSize / 2) * 1.26;
  assertInsideStage(`${name}:LobbyPlayerAvatarVisual`, avatarX - avatarOuterRadius, avatarX + avatarOuterRadius, avatarY + avatarOuterRadius, avatarY - avatarOuterRadius, stage);
  const textX = playerLeft + 160 * hudScale;
  const textWidth = Math.max(190 * hudScale, Math.min(playerWidth - 178 * hudScale, 340 * hudScale));
  const labelBoxes = [
    { name: 'LobbyPlayerLevel', left: textX, right: textX + 118 * hudScale, top: playerTop - 37 * hudScale, bottom: playerTop - 67 * hudScale },
    { name: 'LobbyPlayerName', left: textX, right: textX + textWidth, top: playerTop - 68 * hudScale, bottom: playerTop - 104 * hudScale },
    { name: 'LobbyPlayerPower', left: textX, right: textX + textWidth, top: playerTop - 112 * hudScale, bottom: playerTop - 144 * hudScale },
    { name: 'LobbyPlayerExpBadge', left: playerLeft + 45 * hudScale, right: playerLeft + 115 * hudScale, top: playerTop - 147 * hudScale, bottom: playerTop - 173 * hudScale },
  ];
  const avatarSafeRight = avatarX + 75 * hudScale;
  for (const box of labelBoxes) {
    assertInsideStage(`${name}:${box.name}`, box.left, box.right, box.top, box.bottom, stage);
    if (box.name !== 'LobbyPlayerExpBadge' && box.left < avatarSafeRight) {
      console.error(`${name}:${box.name} overlaps lobby avatar safe zone: labelLeft=${box.left.toFixed(2)}, avatarRight=${avatarSafeRight.toFixed(2)}`);
      ok = false;
    }
  }
  for (let index = 0; index < labelBoxes.length - 1; index += 1) {
    const upper = labelBoxes[index];
    const lower = labelBoxes[index + 1];
    if (upper.bottom < lower.top) {
      console.error(`${name}: lobby label vertical overlap between ${upper.name} and ${lower.name}`);
      ok = false;
    }
  }
  const sigilLeft = textX + Math.min(154 * hudScale, textWidth + 12 * hudScale) - 12 * hudScale;
  const sigilRight = sigilLeft + 24 * hudScale;
  if (sigilRight > playerX + playerWidth / 2) {
    console.error(`${name}:LobbyPlayerNameSigil outside player panel`);
    ok = false;
  }

  const systemIconSize = 32 * baseHudScale;
  const systemGap = 14 * baseHudScale;
  const systemWidth = systemIconSize * 4 + systemGap * 3;
  const systemRight = layout.stageRight - hudInsetX;
  const systemLeft = systemRight - systemWidth;
  const systemTop = layout.stageTop - hudInsetY;
  const systemBottom = systemTop - systemIconSize;
  assertInsideStage(`${name}:LobbySystemIcons`, systemLeft, systemRight, systemTop, systemBottom, stage);

  let resourceCount = layout.stageWidth < 840 ? 2 : layout.stageWidth < 1180 ? 3 : 4;
  let resourceWidths = [128, 122, 112, 112].slice(0, resourceCount).map((width) => width * baseHudScale);
  const resourceGap = 14 * baseHudScale;
  const resourceHeight = 34 * baseHudScale;
  const resourceRight = systemLeft - 22 * baseHudScale;
  const playerRight = playerX + playerWidth / 2;
  const minResourceGap = 18 * baseHudScale;
  const totalResourceWidth = () =>
    resourceWidths.reduce((total, width) => total + width, 0) + Math.max(0, resourceWidths.length - 1) * resourceGap;
  let resourceTotalWidth = totalResourceWidth();
  while (resourceCount > 0 && resourceRight - resourceTotalWidth < playerRight + minResourceGap) {
    resourceCount -= 1;
    resourceWidths = resourceWidths.slice(0, -1);
    resourceTotalWidth = totalResourceWidth();
  }
  if (resourceCount > 0) {
    const resourceLeft = resourceRight - resourceTotalWidth;
    const resourceTop = layout.stageTop - hudInsetY;
    const resourceBottom = resourceTop - resourceHeight;
    assertInsideStage(`${name}:LobbyResourceBar`, resourceLeft, resourceRight, resourceTop, resourceBottom, stage);
    if (resourceLeft < playerRight + minResourceGap) {
      console.error(`${name}:LobbyResourceBar overlaps player info: resourceLeft=${resourceLeft.toFixed(2)}, playerRight=${playerRight.toFixed(2)}`);
      ok = false;
    }
    if (resourceRight > systemLeft - 20 * baseHudScale) {
      console.error(`${name}:LobbyResourceBar overlaps system icons`);
      ok = false;
    }
  }

  if (layout.stageWidth >= 900 && layout.stageHeight >= 520) {
    const activityWidth = Math.min(206 * baseHudScale, layout.stageWidth * 0.18);
    const activityHeight = 68 * baseHudScale;
    const activityGap = 6 * baseHudScale;
    const activityTop = playerY - playerHeight / 2 - 26 * baseHudScale;
    const activityBottomLimit = layout.stageBottom + Math.max(96 * baseHudScale, layout.stageHeight * 0.11);
    const activityCount = Math.min(5, Math.max(0, Math.floor((activityTop - activityBottomLimit + activityGap) / (activityHeight + activityGap))));
    if (activityCount > 0) {
      const activityTotalHeight = activityCount * activityHeight + Math.max(0, activityCount - 1) * activityGap;
      const activityX = layout.stageLeft + hudInsetX + activityWidth / 2;
      const activityY = activityTop - activityTotalHeight / 2;
      assertInsideStage(
        `${name}:LobbyActivityRail`,
        activityX - activityWidth / 2,
        activityX + activityWidth / 2,
        activityY + activityTotalHeight / 2,
        activityY - activityTotalHeight / 2,
        stage,
      );
    }
  }

  if (layout.stageWidth >= 900 && layout.stageHeight >= 560) {
    const plaqueHeight = 32 * baseHudScale;
    for (const [index, point] of [
      [0.172, 0.393, 136, 0.167, 0.405, 0.09, 0.15],
      [0.302, 0.566, 112, 0.302, 0.615, 0.105, 0.215],
      [0.493, 0.606, 122, 0.496, 0.64, 0.1, 0.18],
      [0.552, 0.492, 136, 0.552, 0.462, 0.1, 0.135],
      [0.388, 0.342, 136, 0.39, 0.342, 0.105, 0.135],
      [0.72, 0.635, 140, 0.72, 0.592, 0.105, 0.235],
      [0.746, 0.372, 112, 0.748, 0.355, 0.11, 0.135],
      [0.564, 0.274, 110, 0.565, 0.255, 0.09, 0.1],
    ].entries()) {
      const x = layout.stageLeft + layout.stageWidth * point[0];
      const y = layout.stageBottom + layout.stageHeight * point[1];
      const plaqueWidth = point[2] * baseHudScale;
      assertInsideStage(`${name}:LobbyHotspot${index + 1}`, x - plaqueWidth / 2, x + plaqueWidth / 2, y + plaqueHeight / 2, y - plaqueHeight / 2, stage);
      const hitX = layout.stageLeft + layout.stageWidth * point[3];
      const hitY = layout.stageBottom + layout.stageHeight * point[4];
      const hitWidth = layout.stageWidth * point[5];
      const hitHeight = layout.stageHeight * point[6];
      assertInsideStage(`${name}:LobbyHotspotHitArea${index + 1}`, hitX - hitWidth / 2, hitX + hitWidth / 2, hitY + hitHeight / 2, hitY - hitHeight / 2, stage);
    }
  }

  if (layout.stageWidth >= 1000 && layout.stageHeight >= 520) {
    const cardWidth = Math.min(184 * baseHudScale, layout.stageWidth * 0.16);
    const cardHeight = 94 * baseHudScale;
    const cardGap = 8 * baseHudScale;
    const cardTopLimit = layout.stageTop - Math.max(130 * baseHudScale, layout.stageHeight * 0.14);
    const cardBottomLimit = layout.stageBottom + Math.max(98 * baseHudScale, layout.stageHeight * 0.12);
    const cardCount = Math.min(4, Math.max(0, Math.floor((cardTopLimit - cardBottomLimit + cardGap) / (cardHeight + cardGap))));
    if (cardCount > 0) {
      const cardTotalHeight = cardCount * cardHeight + Math.max(0, cardCount - 1) * cardGap;
      const cardX = layout.stageRight - hudInsetX - cardWidth / 2;
      const cardY = cardTopLimit - cardTotalHeight / 2;
      assertInsideStage(`${name}:LobbyChallengeRail`, cardX - cardWidth / 2, cardX + cardWidth / 2, cardY + cardTotalHeight / 2, cardY - cardTotalHeight / 2, stage);
    }
  }

  if (layout.stageWidth >= 900 && layout.stageHeight >= 500) {
    const bottomHeight = 96 * baseHudScale;
    assertInsideStage(`${name}:LobbyBottomHud`, layout.stageLeft, layout.stageRight, layout.stageBottom + bottomHeight, layout.stageBottom, stage);
  }

  const modalWidth = Math.min(840 * layout.uiScale, Math.max(260 * layout.uiScale, layout.safeWidth - 24 * layout.uiScale));
  const modalHeight = Math.min(620 * layout.uiScale, Math.max(280 * layout.uiScale, layout.safeHeight - 24 * layout.uiScale));
  const modalX = (layout.stageLeft + layout.stageRight) / 2;
  const modalY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(`${name}:LobbyProfilePanel`, modalX - modalWidth / 2, modalX + modalWidth / 2, modalY + modalHeight / 2, modalY - modalHeight / 2, stage);
}

if (scene) {
  const canvasNodeId = findNodeIdByName('Canvas');
  const stageNodeId = findNodeIdByName('BG_Main');
  const canvasTransform = findUiTransform(canvasNodeId);
  const stageTransform = findUiTransform(stageNodeId);
  const stageNode = scene[stageNodeId];

  if (!canvasTransform || !stageTransform || !stageNode) {
    console.error('missing Canvas/BG_Main transform for login adaptive layout check');
    ok = false;
  } else {
    const canvasSize = canvasTransform._contentSize;
    const stageSize = stageTransform._contentSize;
    const stageScale = getNodeScale(stageNode);
    const stagePosition = getNodePosition(stageNode);
    const viewports = [
      { name: 'scene', width: canvasSize.width, height: canvasSize.height },
      { name: 'desktop-1920x1080', width: 1920, height: 1080 },
      { name: 'desktop-1600x900', width: 1600, height: 900 },
      { name: 'desktop-1366x768', width: 1366, height: 768 },
      { name: 'desktop-1280x720', width: 1280, height: 720 },
      { name: 'tablet-1024x768', width: 1024, height: 768 },
      { name: 'mobile-844x390', width: 844, height: 390 },
      { name: 'mobile-390x844', width: 390, height: 844 },
      { name: 'minimum-320x180', width: 320, height: 180 },
    ];

    for (const viewport of viewports) {
      const layout = resolveAdaptiveLayout(viewport.width, viewport.height, stageSize, stageScale, stagePosition);
      assertLoginOverlayBounds(layout, viewport.name);
      assertLobbyOverlayBounds(layout, viewport.name);
    }
  }
}

if (!ok) {
  process.exit(1);
}

console.log('layout ok');
