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
  'assets/scripts/scenes/LootChainLoginEffectLayer.ts',
  'assets/resources/login-bg/scripts/login/LoginVideoBackground.ts',
  'assets/resources/lobby/lobby_bg_poster.jpg',
  'assets/resources/lobby/lobby_bg_loop.mp4',
  'assets/resources/ui/lobby/lobby_player_info_panel.png',
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
const profileApiPath = 'assets/scripts/api/PlayerProfileApi.ts';
const gameRoot = readFileSync(gameRootPath, 'utf8');
const profileApi = readFileSync(profileApiPath, 'utf8');
const sceneText = readFileSync(scenePath, 'utf8');
let scene = null;

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
  if (gameRoot.includes(token)) {
    console.error(`forbidden login-stage token in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const requiredLoginRootTokens = [
  'this.api.auth.logout();',
  'const SHOW_DIALOG_THIRD_PARTY_LOGIN = true;',
  'EditBox.InputFlag.PASSWORD',
  'private applyPasswordMask(editBox: EditBox, textLabel: Label): void',
  "type ViewName = 'login' | 'loginDialog' | 'loading' | 'lobby';",
  "const LOBBY_VIDEO_PATH = 'lobby/lobby_bg_loop';",
  "const LOBBY_POSTER_PATH = 'lobby/lobby_bg_poster';",
  'const USE_LOBBY_NATIVE_VIDEO_BACKGROUND = false;',
  'const LOBBY_PLAYER_INFO_PANEL_ASPECT = 1600 / 577;',
  'private renderLoading(): void',
  'private renderLobby(): void',
  'private renderLobbyHud(layout: UiLayout): void',
  'private renderLobbyPlayerInfo(layout: UiLayout): void',
  'private renderPlayerProfileDialog(layout: UiLayout): void',
  'private drawLobbyPlayerInfoFrame(parent: Node, width: number, height: number, scale: number): void',
  'private addLobbyNameSigil(parent: Node, x: number, y: number, scale: number): void',
  'private drawArmoredAvatarPortrait(graphics: Graphics, size: number): void',
  'private drawAvatarFrameOrnaments(graphics: Graphics, size: number): void',
  'private resolveAlignedLabelX(x: number, width: number, horizontalAlign: Label.HorizontalAlign): number',
  'private lobbyHudScale(layout: UiLayout): number',
  'private openPlayerProfileDialog(): void',
  'private closePlayerProfileDialog(): void',
  'safeLeft: number;',
  'safeRight: number;',
  'safeTop: number;',
  'safeBottom: number;',
  'const safeInsetX = clamp(stageWidth * 0.035',
  'this.api.profile.lobbyProfile()',
  'LobbyPlayerInfoButton',
  'LobbyPlayerInfoArt',
  'LobbyPlayerAvatar',
  'LobbyPlayerName',
  'LobbyPlayerLevel',
  'LobbyPlayerPower',
  'LobbyPlayerExpBadge',
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

if (!profileApi.includes("'/api/player/me/lobby'")) {
  console.error(`missing read-only lobby profile endpoint in ${profileApiPath}`);
  ok = false;
}

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
  let playerWidth = Math.min(clamp(layout.stageWidth * 0.23, 330 * baseHudScale, 390 * baseHudScale), layout.safeWidth);
  let playerHeight = playerWidth / (1600 / 577);
  const maxPlayerHeight = layout.safeHeight * 0.5;
  if (playerHeight > maxPlayerHeight) {
    playerHeight = maxPlayerHeight;
    playerWidth = playerHeight * (1600 / 577);
  }
  const hudScale = playerWidth / 390;
  const playerX = layout.safeLeft + playerWidth / 2;
  const playerY = layout.safeTop - playerHeight / 2;
  assertInsideStage(`${name}:LobbyPlayerInfoButton`, playerX - playerWidth / 2, playerX + playerWidth / 2, playerY + playerHeight / 2, playerY - playerHeight / 2, stage);
  const avatarSize = 104 * hudScale;
  const avatarX = playerX - playerWidth / 2 + 58 * hudScale;
  const avatarY = playerY + 4 * hudScale;
  const avatarOuterRadius = (avatarSize / 2) * 1.26;
  assertInsideStage(`${name}:LobbyPlayerAvatarVisual`, avatarX - avatarOuterRadius, avatarX + avatarOuterRadius, avatarY + avatarOuterRadius, avatarY - avatarOuterRadius, stage);

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
