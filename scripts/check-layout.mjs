import { existsSync, readFileSync } from 'node:fs';

const required = [
  'assets/scripts/app/AppConfig.ts',
  'assets/scripts/net/HttpClient.ts',
  'assets/scripts/api/PlayerAuthApi.ts',
  'assets/scripts/api/GachaApi.ts',
  'assets/scripts/api/HeroApi.ts',
  'assets/scripts/api/BagApi.ts',
  'assets/scripts/scenes/LootChainGameRoot.ts',
  'assets/scripts/scenes/LootChainLoginEffectLayer.ts',
  'assets/resources/login-bg/scripts/login/LoginVideoBackground.ts',
  'assets/resources/lobby/lobby_bg_poster.jpg',
  'assets/resources/lobby/lobby_bg_loop.mp4',
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
const gameRoot = readFileSync(gameRootPath, 'utf8');
const sceneText = readFileSync(scenePath, 'utf8');

try {
  JSON.parse(sceneText);
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
  'private renderLoading(): void',
  'private renderLobby(): void',
];

for (const token of requiredLoginRootTokens) {
  if (!gameRoot.includes(token)) {
    console.error(`missing login-stage safeguard in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log('layout ok');
