import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

// Cocos 前端阶段守卫脚本。
// 这里集中检查必需文件、模块边界、只读接口约束、多分辨率布局公式和关键资源元数据。
const required = [
  'assets/scripts/app/AppConfig.ts',
  'assets/scripts/net/HttpClient.ts',
  'assets/scripts/api/PlayerAuthApi.ts',
  'assets/scripts/api/PlayerProfileApi.ts',
  'assets/scripts/api/ProtagonistApi.ts',
  'assets/scripts/api/ProtagonistApi.ts.meta',
  'assets/scripts/api/BattleApi.ts',
  'assets/scripts/api/BattleApi.ts.meta',
  'assets/scripts/api/LobbyAdventureApi.ts',
  'assets/scripts/api/LobbyAdventureApi.ts.meta',
  'assets/scripts/api/LobbyCodexApi.ts',
  'assets/scripts/api/LobbyCodexApi.ts.meta',
  'assets/scripts/api/LobbyHeroApi.ts',
  'assets/scripts/api/LobbyHeroApi.ts.meta',
  'assets/scripts/api/LobbyNoticeApi.ts',
  'assets/scripts/api/LobbyNoticeApi.ts.meta',
  'assets/scripts/api/GachaApi.ts',
  'assets/scripts/api/HeroApi.ts',
  'assets/scripts/api/BagApi.ts',
  'assets/scripts/types/PlayerTypes.ts',
  'assets/scripts/types/BattleTypes.ts',
  'assets/scripts/types/BattleTypes.ts.meta',
  'assets/scripts/types/LobbyAdventureTypes.ts',
  'assets/scripts/types/LobbyAdventureTypes.ts.meta',
  'assets/scripts/types/LobbyCodexTypes.ts',
  'assets/scripts/types/LobbyCodexTypes.ts.meta',
  'assets/scripts/types/LobbyHeroTypes.ts',
  'assets/scripts/types/LobbyHeroTypes.ts.meta',
  'assets/scripts/types/LobbyNoticeTypes.ts',
  'assets/scripts/types/LobbyNoticeTypes.ts.meta',
  'assets/scripts/scenes/AdaptiveStageLayoutResolver.ts',
  'assets/scripts/scenes/AdaptiveStageLayoutResolver.ts.meta',
  'assets/scripts/scenes/LootChainGameRoot.ts',
  'assets/scripts/scenes/StatusPresenter.ts',
  'assets/scripts/scenes/StatusPresenter.ts.meta',
  'assets/scripts/scenes/UiContentRootController.ts',
  'assets/scripts/scenes/UiContentRootController.ts.meta',
  'assets/scripts/scenes/UiPrimitiveFactory.ts',
  'assets/scripts/scenes/UiPrimitiveFactory.ts.meta',
  'assets/scripts/scenes/UiSceneBackButton.ts',
  'assets/scripts/scenes/UiSceneBackButton.ts.meta',
  'assets/scripts/scenes/UiTextFormatter.ts',
  'assets/scripts/scenes/UiTextFormatter.ts.meta',
  'assets/scripts/scenes/UiSpriteFrameCache.ts',
  'assets/scripts/scenes/UiSpriteFrameCache.ts.meta',
  'assets/scripts/scenes/login.meta',
  'assets/scripts/scenes/login/LoginFlow.ts',
  'assets/scripts/scenes/login/LoginFlow.ts.meta',
  'assets/scripts/scenes/login/LoginRenderer.ts',
  'assets/scripts/scenes/login/LoginRenderer.ts.meta',
  'assets/scripts/scenes/protagonist.meta',
  'assets/scripts/scenes/protagonist/ProtagonistCreateFlow.ts',
  'assets/scripts/scenes/protagonist/ProtagonistCreateFlow.ts.meta',
  'assets/scripts/scenes/protagonist/ProtagonistCreateRenderer.ts',
  'assets/scripts/scenes/protagonist/ProtagonistCreateRenderer.ts.meta',
  'assets/scripts/scenes/protagonist/ProtagonistCreateState.ts',
  'assets/scripts/scenes/protagonist/ProtagonistCreateState.ts.meta',
  'assets/scripts/scenes/gacha.meta',
  'assets/scripts/scenes/gacha/GachaSceneConfig.ts',
  'assets/scripts/scenes/gacha/GachaSceneConfig.ts.meta',
  'assets/scripts/scenes/gacha/GachaSceneRenderer.ts',
  'assets/scripts/scenes/gacha/GachaSceneRenderer.ts.meta',
  'assets/scripts/types/ProtagonistTypes.ts',
  'assets/scripts/types/ProtagonistTypes.ts.meta',
  'assets/scripts/scenes/lobby.meta',
  'assets/scripts/scenes/lobby/LobbyAvatarRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyAvatarRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyBackgroundController.ts',
  'assets/scripts/scenes/lobby/LobbyBackgroundController.ts.meta',
  'assets/scripts/scenes/lobby/LobbyAdventureLoader.ts',
  'assets/scripts/scenes/lobby/LobbyAdventureLoader.ts.meta',
  'assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyAdventureState.ts',
  'assets/scripts/scenes/lobby/LobbyAdventureState.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHudConfig.ts',
  'assets/scripts/scenes/lobby/LobbyHudConfig.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHudLayout.ts',
  'assets/scripts/scenes/lobby/LobbyHudLayout.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHudRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyHudRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyTopHudRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyTopHudRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHudTypes.ts',
  'assets/scripts/scenes/lobby/LobbyHudTypes.ts.meta',
  'assets/scripts/scenes/lobby/LobbyLoadingFlow.ts',
  'assets/scripts/scenes/lobby/LobbyLoadingFlow.ts.meta',
  'assets/scripts/scenes/lobby/LobbyLoadingRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyLoadingRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyCodexLoader.ts',
  'assets/scripts/scenes/lobby/LobbyCodexLoader.ts.meta',
  'assets/scripts/scenes/lobby/LobbyCodexPanelRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyCodexPanelRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyCodexState.ts',
  'assets/scripts/scenes/lobby/LobbyCodexState.ts.meta',
  'assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyBattleFlow.ts',
  'assets/scripts/scenes/lobby/LobbyBattleFlow.ts.meta',
  'assets/scripts/scenes/lobby/LobbyBattlePresentationLayout.ts',
  'assets/scripts/scenes/lobby/LobbyBattlePresentationLayout.ts.meta',
  'assets/scripts/scenes/lobby/LobbyBattlePresentationState.ts',
  'assets/scripts/scenes/lobby/LobbyBattlePresentationState.ts.meta',
  'assets/scripts/scenes/lobby/LobbyBattleState.ts',
  'assets/scripts/scenes/lobby/LobbyBattleState.ts.meta',
  'assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHeroDetailPanelRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyHeroDetailPanelRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts',
  'assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyHeroRosterState.ts',
  'assets/scripts/scenes/lobby/LobbyHeroRosterState.ts.meta',
  'assets/scripts/scenes/lobby/LobbyNoticeLoader.ts',
  'assets/scripts/scenes/lobby/LobbyNoticeLoader.ts.meta',
  'assets/scripts/scenes/lobby/LobbyNoticePanelRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyNoticePanelRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyNoticeState.ts',
  'assets/scripts/scenes/lobby/LobbyNoticeState.ts.meta',
  'assets/scripts/scenes/lobby/LobbyProfileDialogRenderer.ts',
  'assets/scripts/scenes/lobby/LobbyProfileDialogRenderer.ts.meta',
  'assets/scripts/scenes/lobby/LobbyProfileLoader.ts',
  'assets/scripts/scenes/lobby/LobbyProfileLoader.ts.meta',
  'assets/scripts/scenes/lobby/LobbyProfileState.ts',
  'assets/scripts/scenes/lobby/LobbyProfileState.ts.meta',
  'assets/scripts/scenes/lobby/LobbyResourceLoader.ts',
  'assets/scripts/scenes/lobby/LobbyResourceLoader.ts.meta',
  'assets/scripts/scenes/LootChainLoginEffectLayer.ts',
  'assets/resources/login-bg/scripts/login/LoginVideoBackground.ts',
  'assets/resources/lobby/lobby_bg_poster.jpg',
  'assets/resources/lobby/lobby_bg_poster.jpg.meta',
  'assets/resources/lobby/lobby_bg_loop.mp4',
  'assets/resources/ui/battle/battle_scene_cathedral.png',
  'assets/resources/ui/battle/battle_scene_cathedral.png.meta',
  'assets/resources/ui/hero-detail/hero_detail_backdrop.png',
  'assets/resources/ui/hero-detail/hero_detail_backdrop.png.meta',
  'assets/resources/ui/hero-detail/hero_detail_protagonist.png',
  'assets/resources/ui/hero-detail/hero_detail_protagonist.png.meta',
  'assets/resources/ui/gacha.meta',
  'assets/resources/ui/gacha/gacha_bg_cathedral.png',
  'assets/resources/ui/gacha/gacha_bg_cathedral.png.meta',
  'assets/resources/spine.meta',
  'assets/resources/spine/gacha.meta',
  'assets/resources/spine/gacha/huangfengjiaozong.meta',
  'assets/resources/spine/gacha/huangfengjiaozong/huangfengjiaozong.skel',
  'assets/resources/spine/gacha/huangfengjiaozong/huangfengjiaozong.skel.meta',
  'assets/resources/spine/gacha/huangfengjiaozong/huangfengjiaozong.atlas',
  'assets/resources/spine/gacha/huangfengjiaozong/huangfengjiaozong.atlas.meta',
  'assets/resources/spine/gacha/huangfengjiaozong/huangfengjiaozong.png',
  'assets/resources/spine/gacha/huangfengjiaozong/huangfengjiaozong.png.meta',
  'assets/resources/spine/gacha/Lord of the Dark Abyss/1605.json',
  'assets/resources/spine/gacha/Lord of the Dark Abyss/1605.json.meta',
  'assets/resources/spine/gacha/Lord of the Dark Abyss/1605.atlas',
  'assets/resources/spine/gacha/Lord of the Dark Abyss/1605.atlas.meta',
  'assets/resources/ui/lobby/lobby_player_info_panel.png',
  'assets/resources/ui/lobby/lobby_player_info_panel.png.meta',
  'assets/resources/ui/protagonist.meta',
  'assets/resources/ui/protagonist/protagonist_male_attack.png',
  'assets/resources/ui/protagonist/protagonist_male_attack.png.meta',
  'assets/resources/ui/protagonist/protagonist_female_attack.png',
  'assets/resources/ui/protagonist/protagonist_female_attack.png.meta',
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
const adaptiveLayoutPath = 'assets/scripts/scenes/AdaptiveStageLayoutResolver.ts';
const gameRootPath = 'assets/scripts/scenes/LootChainGameRoot.ts';
const statusPresenterPath = 'assets/scripts/scenes/StatusPresenter.ts';
const uiContentRootPath = 'assets/scripts/scenes/UiContentRootController.ts';
const uiPrimitiveFactoryPath = 'assets/scripts/scenes/UiPrimitiveFactory.ts';
const uiSceneBackButtonPath = 'assets/scripts/scenes/UiSceneBackButton.ts';
const uiTextFormatterPath = 'assets/scripts/scenes/UiTextFormatter.ts';
const uiSpriteFrameCachePath = 'assets/scripts/scenes/UiSpriteFrameCache.ts';
const loginFlowPath = 'assets/scripts/scenes/login/LoginFlow.ts';
const loginRendererPath = 'assets/scripts/scenes/login/LoginRenderer.ts';
const protagonistFlowPath = 'assets/scripts/scenes/protagonist/ProtagonistCreateFlow.ts';
const protagonistRendererPath = 'assets/scripts/scenes/protagonist/ProtagonistCreateRenderer.ts';
const protagonistStatePath = 'assets/scripts/scenes/protagonist/ProtagonistCreateState.ts';
const protagonistTypesPath = 'assets/scripts/types/ProtagonistTypes.ts';
const lobbyAvatarPath = 'assets/scripts/scenes/lobby/LobbyAvatarRenderer.ts';
const lobbyBackgroundPath = 'assets/scripts/scenes/lobby/LobbyBackgroundController.ts';
const battleApiPath = 'assets/scripts/api/BattleApi.ts';
const battleTypesPath = 'assets/scripts/types/BattleTypes.ts';
const lobbyAdventureApiPath = 'assets/scripts/api/LobbyAdventureApi.ts';
const lobbyAdventureTypesPath = 'assets/scripts/types/LobbyAdventureTypes.ts';
const lobbyAdventureLoaderPath = 'assets/scripts/scenes/lobby/LobbyAdventureLoader.ts';
const lobbyAdventurePanelPath = 'assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts';
const lobbyAdventureStatePath = 'assets/scripts/scenes/lobby/LobbyAdventureState.ts';
const lobbyHudConfigPath = 'assets/scripts/scenes/lobby/LobbyHudConfig.ts';
const lobbyHudLayoutPath = 'assets/scripts/scenes/lobby/LobbyHudLayout.ts';
const lobbyHudPath = 'assets/scripts/scenes/lobby/LobbyHudRenderer.ts';
const lobbyTopHudPath = 'assets/scripts/scenes/lobby/LobbyTopHudRenderer.ts';
const lobbyHudTypesPath = 'assets/scripts/scenes/lobby/LobbyHudTypes.ts';
const lobbyLoadingFlowPath = 'assets/scripts/scenes/lobby/LobbyLoadingFlow.ts';
const lobbyLoadingPath = 'assets/scripts/scenes/lobby/LobbyLoadingRenderer.ts';
const lobbyCodexApiPath = 'assets/scripts/api/LobbyCodexApi.ts';
const lobbyCodexTypesPath = 'assets/scripts/types/LobbyCodexTypes.ts';
const lobbyCodexLoaderPath = 'assets/scripts/scenes/lobby/LobbyCodexLoader.ts';
const lobbyCodexPanelPath = 'assets/scripts/scenes/lobby/LobbyCodexPanelRenderer.ts';
const lobbyCodexStatePath = 'assets/scripts/scenes/lobby/LobbyCodexState.ts';
const lobbyBattlePreviewPanelPath = 'assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts';
const lobbyBattleFlowPath = 'assets/scripts/scenes/lobby/LobbyBattleFlow.ts';
const lobbyBattlePresentationLayoutPath = 'assets/scripts/scenes/lobby/LobbyBattlePresentationLayout.ts';
const lobbyBattlePresentationStatePath = 'assets/scripts/scenes/lobby/LobbyBattlePresentationState.ts';
const lobbyBattleStatePath = 'assets/scripts/scenes/lobby/LobbyBattleState.ts';
const lobbyFormationPanelPath = 'assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts';
const lobbyHeroDetailPanelPath = 'assets/scripts/scenes/lobby/LobbyHeroDetailPanelRenderer.ts';
const lobbyHeroApiPath = 'assets/scripts/api/LobbyHeroApi.ts';
const lobbyHeroTypesPath = 'assets/scripts/types/LobbyHeroTypes.ts';
const lobbyHeroRosterLoaderPath = 'assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts';
const lobbyHeroRosterPanelPath = 'assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts';
const lobbyHeroRosterStatePath = 'assets/scripts/scenes/lobby/LobbyHeroRosterState.ts';
const lobbyNoticeApiPath = 'assets/scripts/api/LobbyNoticeApi.ts';
const lobbyNoticeTypesPath = 'assets/scripts/types/LobbyNoticeTypes.ts';
const lobbyNoticeLoaderPath = 'assets/scripts/scenes/lobby/LobbyNoticeLoader.ts';
const lobbyNoticePanelPath = 'assets/scripts/scenes/lobby/LobbyNoticePanelRenderer.ts';
const lobbyNoticeStatePath = 'assets/scripts/scenes/lobby/LobbyNoticeState.ts';
const lobbyProfileDialogPath = 'assets/scripts/scenes/lobby/LobbyProfileDialogRenderer.ts';
const lobbyProfileLoaderPath = 'assets/scripts/scenes/lobby/LobbyProfileLoader.ts';
const lobbyProfileStatePath = 'assets/scripts/scenes/lobby/LobbyProfileState.ts';
const lobbyResourceLoaderPath = 'assets/scripts/scenes/lobby/LobbyResourceLoader.ts';
const gachaSceneConfigPath = 'assets/scripts/scenes/gacha/GachaSceneConfig.ts';
const gachaSceneRendererPath = 'assets/scripts/scenes/gacha/GachaSceneRenderer.ts';
const authApiPath = 'assets/scripts/api/PlayerAuthApi.ts';
const profileApiPath = 'assets/scripts/api/PlayerProfileApi.ts';
const protagonistApiPath = 'assets/scripts/api/ProtagonistApi.ts';
const gachaApiPath = 'assets/scripts/api/GachaApi.ts';
const lobbyPosterAssetPath = 'assets/resources/lobby/lobby_bg_poster.jpg';
const lobbyPosterMetaPath = 'assets/resources/lobby/lobby_bg_poster.jpg.meta';
const lobbyPanelAssetPath = 'assets/resources/ui/lobby/lobby_player_info_panel.png';
const lobbyPanelMetaPath = 'assets/resources/ui/lobby/lobby_player_info_panel.png.meta';
const adaptiveLayout = readFileSync(adaptiveLayoutPath, 'utf8');
const gameRoot = readFileSync(gameRootPath, 'utf8');
const statusPresenter = readFileSync(statusPresenterPath, 'utf8');
const uiContentRoot = readFileSync(uiContentRootPath, 'utf8');
const uiPrimitiveFactory = readFileSync(uiPrimitiveFactoryPath, 'utf8');
const uiSceneBackButton = readFileSync(uiSceneBackButtonPath, 'utf8');
const uiTextFormatter = readFileSync(uiTextFormatterPath, 'utf8');
const uiSpriteFrameCache = readFileSync(uiSpriteFrameCachePath, 'utf8');
const loginFlow = readFileSync(loginFlowPath, 'utf8');
const loginRenderer = readFileSync(loginRendererPath, 'utf8');
const protagonistFlow = readFileSync(protagonistFlowPath, 'utf8');
const protagonistRenderer = readFileSync(protagonistRendererPath, 'utf8');
const protagonistState = readFileSync(protagonistStatePath, 'utf8');
const protagonistTypes = readFileSync(protagonistTypesPath, 'utf8');
const lobbyAvatar = readFileSync(lobbyAvatarPath, 'utf8');
const lobbyBackground = readFileSync(lobbyBackgroundPath, 'utf8');
const battleApi = readFileSync(battleApiPath, 'utf8');
const battleTypes = readFileSync(battleTypesPath, 'utf8');
const lobbyAdventureApi = readFileSync(lobbyAdventureApiPath, 'utf8');
const lobbyAdventureTypes = readFileSync(lobbyAdventureTypesPath, 'utf8');
const lobbyAdventureLoader = readFileSync(lobbyAdventureLoaderPath, 'utf8');
const lobbyAdventurePanel = readFileSync(lobbyAdventurePanelPath, 'utf8');
const lobbyAdventureState = readFileSync(lobbyAdventureStatePath, 'utf8');
const lobbyHudConfig = readFileSync(lobbyHudConfigPath, 'utf8');
const lobbyHudLayout = readFileSync(lobbyHudLayoutPath, 'utf8');
const lobbyHud = readFileSync(lobbyHudPath, 'utf8');
const lobbyTopHud = readFileSync(lobbyTopHudPath, 'utf8');
const lobbyHudTypes = readFileSync(lobbyHudTypesPath, 'utf8');
const lobbyLoadingFlow = readFileSync(lobbyLoadingFlowPath, 'utf8');
const lobbyLoading = readFileSync(lobbyLoadingPath, 'utf8');
const lobbyCodexApi = readFileSync(lobbyCodexApiPath, 'utf8');
const lobbyCodexTypes = readFileSync(lobbyCodexTypesPath, 'utf8');
const lobbyCodexLoader = readFileSync(lobbyCodexLoaderPath, 'utf8');
const lobbyCodexPanel = readFileSync(lobbyCodexPanelPath, 'utf8');
const lobbyCodexState = readFileSync(lobbyCodexStatePath, 'utf8');
const lobbyBattlePreviewPanel = readFileSync(lobbyBattlePreviewPanelPath, 'utf8');
const lobbyBattleFlow = readFileSync(lobbyBattleFlowPath, 'utf8');
const lobbyBattlePresentationLayout = readFileSync(lobbyBattlePresentationLayoutPath, 'utf8');
const lobbyBattlePresentationState = readFileSync(lobbyBattlePresentationStatePath, 'utf8');
const lobbyBattleState = readFileSync(lobbyBattleStatePath, 'utf8');
const lobbyFormationPanel = readFileSync(lobbyFormationPanelPath, 'utf8');
const lobbyHeroDetailPanel = readFileSync(lobbyHeroDetailPanelPath, 'utf8');
const lobbyHeroApi = readFileSync(lobbyHeroApiPath, 'utf8');
const lobbyHeroTypes = readFileSync(lobbyHeroTypesPath, 'utf8');
const lobbyHeroRosterLoader = readFileSync(lobbyHeroRosterLoaderPath, 'utf8');
const lobbyHeroRosterPanel = readFileSync(lobbyHeroRosterPanelPath, 'utf8');
const lobbyHeroRosterState = readFileSync(lobbyHeroRosterStatePath, 'utf8');
const lobbyNoticeApi = readFileSync(lobbyNoticeApiPath, 'utf8');
const lobbyNoticeTypes = readFileSync(lobbyNoticeTypesPath, 'utf8');
const lobbyNoticeLoader = readFileSync(lobbyNoticeLoaderPath, 'utf8');
const lobbyNoticePanel = readFileSync(lobbyNoticePanelPath, 'utf8');
const lobbyNoticeState = readFileSync(lobbyNoticeStatePath, 'utf8');
const lobbyProfileDialog = readFileSync(lobbyProfileDialogPath, 'utf8');
const lobbyProfileLoader = readFileSync(lobbyProfileLoaderPath, 'utf8');
const lobbyProfileState = readFileSync(lobbyProfileStatePath, 'utf8');
const lobbyResourceLoader = readFileSync(lobbyResourceLoaderPath, 'utf8');
const gachaSceneConfig = readFileSync(gachaSceneConfigPath, 'utf8');
const gachaSceneRenderer = readFileSync(gachaSceneRendererPath, 'utf8');
const authApi = readFileSync(authApiPath, 'utf8');
const profileApi = readFileSync(profileApiPath, 'utf8');
const protagonistApi = readFileSync(protagonistApiPath, 'utf8');
const gachaApi = readFileSync(gachaApiPath, 'utf8');
const sceneText = readFileSync(scenePath, 'utf8');
let scene = null;

function collectTsFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = `${dir}/${entry}`;
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...collectTsFiles(path));
    } else if (entry.endsWith('.ts')) {
      files.push(path);
    }
  }
  return files;
}

function sourceEntry(path) {
  return { path, text: readFileSync(path, 'utf8') };
}

function uniqueSources(entries) {
  const seen = new Map();
  for (const entry of entries) {
    seen.set(entry.path, entry);
  }
  return [...seen.values()];
}

const loginAndLobbyModuleSources = [
  ...collectTsFiles('assets/scripts/scenes/login').map(sourceEntry),
  ...collectTsFiles('assets/scripts/scenes/protagonist').map(sourceEntry),
  ...collectTsFiles('assets/scripts/scenes/lobby').map(sourceEntry),
];

const checkedClientSources = uniqueSources([
  { path: adaptiveLayoutPath, text: adaptiveLayout },
  { path: gameRootPath, text: gameRoot },
  { path: statusPresenterPath, text: statusPresenter },
  { path: uiContentRootPath, text: uiContentRoot },
  { path: uiPrimitiveFactoryPath, text: uiPrimitiveFactory },
  { path: uiSceneBackButtonPath, text: uiSceneBackButton },
  { path: uiTextFormatterPath, text: uiTextFormatter },
  { path: uiSpriteFrameCachePath, text: uiSpriteFrameCache },
  { path: loginFlowPath, text: loginFlow },
  { path: loginRendererPath, text: loginRenderer },
  { path: protagonistFlowPath, text: protagonistFlow },
  { path: protagonistRendererPath, text: protagonistRenderer },
  { path: protagonistStatePath, text: protagonistState },
  { path: protagonistTypesPath, text: protagonistTypes },
  { path: lobbyAvatarPath, text: lobbyAvatar },
  { path: lobbyBackgroundPath, text: lobbyBackground },
  { path: battleApiPath, text: battleApi },
  { path: battleTypesPath, text: battleTypes },
  { path: lobbyAdventureApiPath, text: lobbyAdventureApi },
  { path: lobbyAdventureTypesPath, text: lobbyAdventureTypes },
  { path: lobbyAdventureLoaderPath, text: lobbyAdventureLoader },
  { path: lobbyAdventurePanelPath, text: lobbyAdventurePanel },
  { path: lobbyAdventureStatePath, text: lobbyAdventureState },
  { path: lobbyHudConfigPath, text: lobbyHudConfig },
  { path: lobbyHudLayoutPath, text: lobbyHudLayout },
  { path: lobbyHudPath, text: lobbyHud },
  { path: lobbyTopHudPath, text: lobbyTopHud },
  { path: lobbyHudTypesPath, text: lobbyHudTypes },
  { path: lobbyLoadingFlowPath, text: lobbyLoadingFlow },
  { path: lobbyLoadingPath, text: lobbyLoading },
  { path: lobbyCodexApiPath, text: lobbyCodexApi },
  { path: lobbyCodexTypesPath, text: lobbyCodexTypes },
  { path: lobbyCodexLoaderPath, text: lobbyCodexLoader },
  { path: lobbyCodexPanelPath, text: lobbyCodexPanel },
  { path: lobbyCodexStatePath, text: lobbyCodexState },
  { path: lobbyBattlePreviewPanelPath, text: lobbyBattlePreviewPanel },
  { path: lobbyBattleFlowPath, text: lobbyBattleFlow },
  { path: lobbyBattlePresentationLayoutPath, text: lobbyBattlePresentationLayout },
  { path: lobbyBattlePresentationStatePath, text: lobbyBattlePresentationState },
  { path: lobbyBattleStatePath, text: lobbyBattleState },
  { path: lobbyFormationPanelPath, text: lobbyFormationPanel },
  { path: lobbyHeroDetailPanelPath, text: lobbyHeroDetailPanel },
  { path: lobbyHeroApiPath, text: lobbyHeroApi },
  { path: lobbyHeroTypesPath, text: lobbyHeroTypes },
  { path: lobbyHeroRosterLoaderPath, text: lobbyHeroRosterLoader },
  { path: lobbyHeroRosterPanelPath, text: lobbyHeroRosterPanel },
  { path: lobbyHeroRosterStatePath, text: lobbyHeroRosterState },
  { path: lobbyNoticeApiPath, text: lobbyNoticeApi },
  { path: lobbyNoticeTypesPath, text: lobbyNoticeTypes },
  { path: lobbyNoticeLoaderPath, text: lobbyNoticeLoader },
  { path: lobbyNoticePanelPath, text: lobbyNoticePanel },
  { path: lobbyNoticeStatePath, text: lobbyNoticeState },
  { path: lobbyProfileDialogPath, text: lobbyProfileDialog },
  { path: lobbyProfileLoaderPath, text: lobbyProfileLoader },
  { path: lobbyProfileStatePath, text: lobbyProfileState },
  { path: lobbyResourceLoaderPath, text: lobbyResourceLoader },
  { path: authApiPath, text: authApi },
  { path: profileApiPath, text: profileApi },
  { path: protagonistApiPath, text: protagonistApi },
  ...loginAndLobbyModuleSources,
]);
const lobbyHudModule = `${lobbyHudConfig}\n${lobbyHudLayout}\n${lobbyHud}\n${lobbyTopHud}\n${lobbyHudTypes}`;

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
  'EX V1',
  'exV1',
  '/api/ex',
  '/api/v1/ex',
  'fund-pool',
  'fundPool',
      'USDT',
      'lootChainApi.gacha',
      'lootChainApi.hero',
      'lootChainApi.bag',
      'new GachaApi',
      'new HeroApi',
      'new BagApi',
      'this.api.http',
      "request('POST'",
      'request("POST"',
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
  "import {",
  "from './AdaptiveStageLayoutResolver';",
  "import { StatusPresenter, type StatusPresenterHost } from './StatusPresenter';",
  "import { UiContentRootController, type UiContentRootHost } from './UiContentRootController';",
  "import { UiPrimitiveFactory, type ButtonVisualState, type UiPrimitiveFactoryHost } from './UiPrimitiveFactory';",
  "import { renderSceneBackButton, type SceneBackButtonHost } from './UiSceneBackButton';",
  "from './UiTextFormatter';",
  "from './UiSpriteFrameCache';",
  "import { LoginFlow, type LoginFlowHost } from './login/LoginFlow';",
  "from './login/LoginRenderer';",
  "import { ProtagonistCreateFlow, type ProtagonistCreateFlowHost } from './protagonist/ProtagonistCreateFlow';",
  "import { ProtagonistCreateRenderer, type ProtagonistCreateRendererHost } from './protagonist/ProtagonistCreateRenderer';",
  "from './lobby/LobbyBackgroundController';",
  "import { LobbyAdventureLoader, type LobbyAdventureLoaderHost } from './lobby/LobbyAdventureLoader';",
  "import { LobbyAdventurePanelRenderer, type LobbyAdventurePanelHost } from './lobby/LobbyAdventurePanelRenderer';",
  "import { LobbyAvatarRenderer, type LobbyAvatarHost } from './lobby/LobbyAvatarRenderer';",
  "import { LobbyBattleFlow, type LobbyBattleFlowHost } from './lobby/LobbyBattleFlow';",
  "import { LobbyBattlePreviewPanelRenderer, type LobbyBattlePreviewPanelHost } from './lobby/LobbyBattlePreviewPanelRenderer';",
  "import { LobbyCodexLoader, type LobbyCodexLoaderHost } from './lobby/LobbyCodexLoader';",
  "import { LobbyCodexPanelRenderer, type LobbyCodexPanelHost } from './lobby/LobbyCodexPanelRenderer';",
  "import { LobbyFormationPanelRenderer, type LobbyFormationPanelHost } from './lobby/LobbyFormationPanelRenderer';",
  "import { LobbyHeroDetailPanelRenderer, type LobbyHeroDetailPanelHost } from './lobby/LobbyHeroDetailPanelRenderer';",
  "import { LobbyHeroRosterLoader, type LobbyHeroRosterLoaderHost } from './lobby/LobbyHeroRosterLoader';",
  "import { LobbyHeroRosterPanelRenderer, type LobbyHeroRosterPanelHost } from './lobby/LobbyHeroRosterPanelRenderer';",
  "import { LobbyHudRenderer, type LobbyHudHost } from './lobby/LobbyHudRenderer';",
  "import { LobbyLoadingFlow, type LobbyLoadingFlowHost } from './lobby/LobbyLoadingFlow';",
  "import { LobbyLoadingRenderer, type LobbyLoadingHost } from './lobby/LobbyLoadingRenderer';",
  "import { LobbyNoticeLoader, type LobbyNoticeLoaderHost } from './lobby/LobbyNoticeLoader';",
  "import { LobbyNoticePanelRenderer, type LobbyNoticePanelHost } from './lobby/LobbyNoticePanelRenderer';",
  "import { LobbyProfileDialogRenderer, type LobbyProfileDialogHost } from './lobby/LobbyProfileDialogRenderer';",
  "import { LobbyProfileLoader, type LobbyProfileLoaderHost } from './lobby/LobbyProfileLoader';",
  "import type { LobbyAdventurePanelState, LobbyAdventureStageVO } from '../types/LobbyAdventureTypes';",
  "import type { LobbyCodexPanelState } from '../types/LobbyCodexTypes';",
    "import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../types/LobbyHeroTypes';",
  "import type { ProtagonistCreateFormState, ProtagonistForm, ProtagonistGender } from '../types/ProtagonistTypes';",
  'private applyPasswordMask(editBox: EditBox, textLabel: Label): void',
  'type ViewName =',
  'const LOGIN_SCENE_BACKGROUND_NODE_NAMES = [',
  'const LOGIN_SCENE_LEGACY_NODE_NAMES = [',
  'const LOGIN_SCENE_STAGE_NODE_NAMES = [...LOGIN_SCENE_BACKGROUND_NODE_NAMES, ...LOGIN_SCENE_LEGACY_NODE_NAMES] as const;',
  "'Login_BG_Poster'",
  "'Login_BG_Video'",
  'stageNode.active = false;',
  "const LOBBY_BACKGROUND_NODE_NAMES = ['Lobby_BG_Poster', 'Lobby_BG_Video', 'Lobby_BG_Fallback'] as const;",
  "| 'profile'",
  "| 'adventure'",
  "| 'heroDetail'",
  "| 'placeholder';",
  'private readonly layoutResolver = new AdaptiveStageLayoutResolver',
  'private readonly statusPresenter = new StatusPresenter',
  'private readonly contentRootController = new UiContentRootController',
  'private readonly uiPrimitiveFactory = new UiPrimitiveFactory',
  'private readonly uiSpriteFrameCache = new UiSpriteFrameCache',
  'private readonly loginFlow = new LoginFlow',
  'private readonly loginRenderer = new LoginRenderer',
  'private readonly protagonistCreateFlow = new ProtagonistCreateFlow',
  'private readonly protagonistCreateRenderer = new ProtagonistCreateRenderer',
  'private readonly lobbyBackgroundController = new LobbyBackgroundController',
  'private readonly lobbyAdventureLoader = new LobbyAdventureLoader',
  'private readonly lobbyAdventurePanelRenderer = new LobbyAdventurePanelRenderer',
  'private readonly lobbyAvatarRenderer = new LobbyAvatarRenderer',
  'private readonly lobbyBattleFlow = new LobbyBattleFlow',
  'private readonly lobbyBattlePreviewPanelRenderer = new LobbyBattlePreviewPanelRenderer',
  'private readonly lobbyLoadingRenderer = new LobbyLoadingRenderer',
  'private readonly lobbyLoadingFlow = new LobbyLoadingFlow',
  'private readonly lobbyCodexLoader = new LobbyCodexLoader',
  'private readonly lobbyCodexPanelRenderer = new LobbyCodexPanelRenderer',
  'private readonly lobbyFormationPanelRenderer = new LobbyFormationPanelRenderer',
  'private readonly lobbyHeroDetailPanelRenderer = new LobbyHeroDetailPanelRenderer',
  'private readonly lobbyHeroRosterLoader = new LobbyHeroRosterLoader',
  'private readonly lobbyHeroRosterPanelRenderer = new LobbyHeroRosterPanelRenderer',
  'private readonly lobbyNoticeLoader = new LobbyNoticeLoader',
  'private readonly lobbyNoticePanelRenderer = new LobbyNoticePanelRenderer',
  'private readonly lobbyProfileLoader = new LobbyProfileLoader',
  'private tryPlayLobbyVideo(): void',
  'private updateLobbyPosterFade(deltaTime: number): void',
  'private releaseLobbyVideoRuntime(): void',
  'private isLobbyViewActive(): boolean',
  'this.lobbyBackgroundController.render(layout);',
  'private resizeLobbyBackground(layout: UiLayout): void',
  'this.lobbyBackgroundController.resize(layout);',
  'this.lobbyBackgroundController.isRendered()',
  'this.lobbyBackgroundController.tryPlay();',
  'this.lobbyBackgroundController.update(deltaTime);',
  'this.lobbyBackgroundController.release();',
  'this.loginFlow.cancel();',
  'this.protagonistCreateFlow.cancel();',
  'this.lobbyLoadingFlow.cancel();',
  'this.lobbyAdventureLoader.cancel();',
  'this.lobbyBattleFlow.cancel();',
  'this.lobbyCodexLoader.cancel();',
  'this.lobbyHeroRosterLoader.cancel();',
  'this.lobbyNoticeLoader.cancel();',
  'this.lobbyProfileLoader.cancel();',
  'private showLobbyLoadingView(): void',
  'private refreshLobbyLoadingView(): void',
  'private setLobbyBackgroundResources(posterFrame: SpriteFrame, videoClip: VideoClip | null): void',
  'this.lobbyBackgroundController.setResources(posterFrame, videoClip);',
  'private enterLobbyView(): void',
  'private renderLoading(): void',
  'private renderProtagonistCreate(): void',
  "this.currentView === 'protagonistCreate'",
  'this.protagonistCreateRenderer.render(layout, this.protagonistCreateFlow.currentState());',
  'this.lobbyLoadingRenderer.render(layout, this.lobbyLoadingFlow.state);',
  'private renderLobbyCodexPanel(layout: UiLayout): void',
  'private renderLobbyAdventurePanel(layout: UiLayout): void',
  'private openLobbyAdventurePanel(): void',
  'private closeLobbyAdventurePanel(): void',
  'private reloadLobbyAdventure(): void',
  'private currentLobbyAdventureState(): LobbyAdventurePanelState',
  'private async loadLobbyAdventure(force = false): Promise<void>',
  'private renderLobbyBattlePreviewPanel(layout: UiLayout): void',
  'private renderBattleScene(): void',
  'private openLobbyBattlePreviewPanel(stageCode: string): void',
  'private closeLobbyBattlePreviewPanel(): void',
  'private removeLobbyBattlePreviewPanel(): void',
  'private refreshLobbyBattlePreviewPanel(): void',
  'private currentLobbyBattleState(): LobbyBattlePanelState',
  'private isLobbyBattleFlowBusyForStage(stageCode: string): boolean',
  'private startLobbyBattleSession(): void',
  'private settleLobbyBattleSession(): void',
  'private returnToLobbyFromBattlePreview(): void',
  'private refreshLobbyReadonlyStateAfterBattle(): void',
  'this.refreshLobbyReadonlyStateAfterBattle();',
  'const reuseExistingBattleState = this.isLobbyBattleFlowBusyForStage(resolvedStageCode);',
  'this.lobbyBattleFlow.cancel(true);',
  'this.selectedLobbyStageCode !== startStageCode',
  'void this.loadLobbyAdventure(true);',
  'void this.loadLobbyHeroRoster(true);',
  'private openLobbyCodexPanel(): void',
  'private closeLobbyCodexPanel(): void',
  'private reloadLobbyCodex(): void',
  'private currentLobbyCodexState(): LobbyCodexPanelState',
  'private async loadLobbyCodex(force = false): Promise<void>',
      'private renderLobbyFormationPanel(layout: UiLayout): void',
      'private openLobbyFormationPanel(stageCode?: string): void',
    'private currentLobbySelectedStageCode(): string',
      'private selectLobbyAdventureStage(stageCode: string): void',
      'private previewLockedLobbyAdventureStage(stageCode: string): void',
    'private currentLobbyFormationHeroIds(): number[]',
    'private toggleLobbyFormationHero(heroId: number): void',
    'private reconcileLobbyFormationSelection(): boolean',
      'private resolveLobbyStageCode(stageCode?: string | null): string | null',
    '/^MAIN_\\d+_\\d+$/.test(value)',
      '防止未来 UI 误把锁定关卡传进来',
      'this.previewLockedLobbyAdventureStage(resolvedStageCode)',
    'private rejectInvalidLobbyStageSelection(): void',
  'private closeLobbyFormationPanel(): void',
  'private renderLobbyHeroRosterPanel(layout: UiLayout): void',
  'private renderLobbyHeroDetailPanel(layout: UiLayout): void',
  'private openLobbyHeroRosterPanel(): void',
  'private openLobbyHeroDetail(heroId: number): void',
  'private closeLobbyHeroDetailPanel(): void',
  'private currentLobbyHeroDetailHero(): LobbyHeroItemVO | null',
  'private closeLobbyHeroRosterPanel(): void',
  'private reloadLobbyHeroRoster(): void',
  'private currentLobbyHeroRosterState(): LobbyHeroRosterPanelState',
  'private async loadLobbyHeroRoster(force = false): Promise<void>',
  'private renderLobbyNoticePanel(layout: UiLayout): void',
  'private openLobbyNoticePanel(): void',
  'private closeLobbyNoticePanel(): void',
  'private reloadLobbyNotices(): void',
  'private currentLobbyNoticeState(): LobbyNoticePanelState',
  'private async loadLobbyNotices(force = false): Promise<void>',
  'this.loginRenderer.renderLogin(layout);',
  'this.loginRenderer.renderLoginAccountScene(layout, {',
  'agreementAccepted: this.loginFlow.agreementAccepted',
  'defaultDevUserId: this.loginFlow.defaultDevUserId',
  'private setLoginInputs(accountInput: EditBox | null, passwordInput: EditBox | null): void',
  'this.loginFlow.setInputs(accountInput, passwordInput);',
  'private setProtagonistNameInput(input: EditBox | null): void',
  'this.protagonistCreateFlow.setNameInput(input);',
  'private openLoginAccountScene(): void',
  'private submitLogin(): void',
  'this.run(() => this.loginFlow.login());',
  'private toggleLoginAgreement(): void',
  'this.loginFlow.toggleAgreement();',
  'private setApiBaseUrl(baseUrl: string): void',
  'private showProtagonistCreateView(): void',
  'private handleLoginSuccess(userId: number, tokenName: string): void',
  'this.protagonistCreateFlow.handleLoginSuccess(userId, tokenName);',
  'private selectProtagonistGender(gender: ProtagonistGender): void',
  'private previewProtagonistForm(form: ProtagonistForm): void',
  'private submitProtagonistCreate(): void',
  'private currentProtagonistCreateState(): ProtagonistCreateFormState',
  'private resetLobbyProfileForLogin(userId: number): void',
  'private loadLobbyProfileAfterLogin(userId: number): void',
  'private retryLobbyLoading(): void',
  'private renderLobby(): void',
  'private renderGachaResultScene(): void',
  'private openGachaMockResultScene(mode: GachaPreviewResultMode): void',
  'private closeGachaMockResultScene(): void',
  'private renderLobbyScenePage(): void',
  'private renderLobbyWorldBase(): UiLayout',
  'this.contentRootController.clearExcept(LOBBY_BACKGROUND_NODE_NAMES);',
  'private isLobbyScenePageView(view: ViewName): boolean',
  'private returnToLobbyFromScenePage(): void',
  'private isLoginSceneView(view: ViewName): boolean',
  'private setLoginSceneStageVisible(visible: boolean): void',
  'private tryPlayLoginSceneVideo(node: Node): void',
  'this.setLoginSceneStageVisible(this.isLoginSceneView(this.currentView));',
  'video.play();',
  'private renderLobbyHud(layout: UiLayout): void',
  'this.lobbyHudRenderer.render(layout);',
  'this.lobbyProfileDialogRenderer.render(layout);',
  'private compactResourceValue(value: number | null | undefined): string',
  'this.statusPresenter.reset();',
  'this.statusPresenter.add(text, layout, y);',
  'this.statusPresenter.set(text);',
  'return formatUiInteger(value);',
  'return compactUiResourceValue(value);',
  'return trimUiText(text);',
  'private refreshLobbyOverlay(): void',
  'private refreshLobbyViewPreservingBackground(): void',
  'private rerenderLobbyOverlay(layout: UiLayout): void',
  'private renderPlayerProfileDialog(layout: UiLayout): void',
  'private renderLobbyPlaceholderDialog(layout: UiLayout): void',
  'private placeholderSubtitle(title: string, detail: string): string',
  'private placeholderBoundaryNote(detail: string): string',
  'private removePlayerProfileDialog(): void',
  'private openLobbyPlaceholderDialog(title: string, detail?: string): void',
  'private closeLobbyPlaceholderDialog(): void',
  'private removeLobbyPlaceholderDialog(): void',
  'private isLobbyProfileLoading(): boolean',
  'private getLobbyProfileError(): string',
  'private addLobbyAvatar(parent: Node, x: number, y: number, size: number, displayName: string): void',
  'this.lobbyAvatarRenderer.add(parent, x, y, size, displayName);',
  'private resolveAlignedLabelX(x: number, width: number, horizontalAlign: HorizontalTextAlignment): number',
  'private openPlayerProfileDialog(): void',
  'private closePlayerProfileDialog(): void',
  'private removeNodeFromContent(name: string): void',
  'private resolveLayout(): UiLayout',
  'return this.layoutResolver.resolve();',
  'private applyRootSize(layout: UiLayout): void',
  'this.contentRootController.clear();',
  'return this.contentRootController.createNode(name);',
  'this.contentRootController.removeNode(name);',
  'return this.contentRootController.ensure();',
  'this.contentRootController.applyRootSize(layout);',
  'private makeLayoutKey(): string',
  'this.uiSpriteFrameCache.preload(this.uiSpriteFrameOverrides());',
  'private uiSpriteFrameOverrides(): UiSpriteFrameOverrides',
  'this.uiPrimitiveFactory.addLabel(text, x, y, size, color, contentSize);',
  'this.uiPrimitiveFactory.addImageButton(name, assetPath, text, x, y, callback, layout, width, height, fontSize);',
  'this.uiPrimitiveFactory.addSprite(name, assetPath, x, y, width, height, parent);',
  'this.uiPrimitiveFactory.applyImageButtonFeedback(node, hoverScale, pressedScale);',
  'this.uiPrimitiveFactory.drawButtonFrame(graphics, width, height, state);',
  'await this.lobbyProfileLoader.load(userId);',
  'await this.lobbyAdventureLoader.load(force);',
  'this.lobbyAdventureLoader.currentState();',
  'this.lobbyAdventureLoader.resetForLogin();',
  'this.lobbyBattleFlow.resetForLogin();',
  'this.lobbyProfileLoader.currentProfile();',
  'await this.lobbyCodexLoader.load(force);',
  'this.lobbyCodexLoader.currentState();',
  'this.lobbyCodexLoader.resetForLogin();',
  'await this.lobbyHeroRosterLoader.load(force);',
  'this.lobbyHeroRosterLoader.currentState();',
  'this.lobbyHeroRosterLoader.resetForLogin();',
  'this.lobbyProfileLoader.loading',
  'this.lobbyProfileLoader.error',
  'this.lobbyProfileLoader.resetForLogin(userId);',
  'this.lobbyLoadingFlow.start(tokenName);',
  'this.lobbyLoadingFlow.retry(this.loginFlow.lastTokenName);',
  'LobbyPlayerInfoButton',
  'LobbyResourceBar',
  'LobbySystemIcons',
  'LobbyAtmosphereOverlay',
  'LobbyActivityRail',
  'LobbySceneHotspots',
  'LobbyGoalTracker',
  'LobbyCompactGoalTracker',
  'LobbyMicroGoalChip',
  'LobbyChallengeRail',
  'LobbyBottomHud',
  'LobbyCompactActionEntrances',
  'LobbyAdventureDim',
  'LobbyAdventurePanel',
  'LobbyBattlePreviewDim',
  'LobbyBattlePreviewPanel',
  'LobbyBattleSceneRoot',
  'LobbyCodexDim',
  'LobbyCodexPanel',
  'LobbyFormationDim',
  'LobbyFormationPanel',
  'LobbyHeroDetailDim',
  'LobbyHeroDetailPanel',
  'LobbyHeroRosterDim',
  'LobbyHeroRosterPanel',
  'LobbyProfileDim',
  'LobbyProfilePanel',
  'LobbyPlaceholderSceneRoot',
  'LobbyPlaceholderScenePanel',
  'LobbyPlaceholderBackButton',
  'LobbyPlaceholderBoundaryNote',
  'renderSceneBackButton(',
  'panel.addComponent(BlockInputEvents);',
  "this.currentView = 'profile';",
  "this.currentView = 'adventure';",
  "this.currentView = 'codex';",
  "this.currentView = 'formation';",
  "this.currentView = 'heroes';",
  "this.currentView = 'heroDetail';",
  "this.currentView = 'notice';",
  "this.currentView = 'gachaResult';",
  "this.currentView = 'placeholder';",
  'profile-open',
  'placeholder-open',
];

for (const token of requiredLoginRootTokens) {
  if (!gameRoot.includes(token)) {
    console.error(`missing login-stage safeguard in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenSceneModuleApiTokens = [
  'lootChainApi',
  'new HttpClient',
  'private readonly http',
  'this.api.http',
  '.request(',
  '.post(',
  '.put(',
  '.patch(',
  '.delete(',
];

for (const token of forbiddenSceneModuleApiTokens) {
  for (const source of loginAndLobbyModuleSources) {
    if (source.text.includes(token)) {
      console.error(`scene module must not call transport/API directly in ${source.path}: ${token}`);
      ok = false;
    }
  }
}

const lobbyReadonlyApiAllowlist = new Map([
  [profileApiPath, new Set(['/api/player/me/lobby'])],
  [lobbyAdventureApiPath, new Set(['/api/player/lobby/adventure'])],
  [lobbyCodexApiPath, new Set(['/api/player/lobby/codex'])],
  [lobbyHeroApiPath, new Set(['/api/player/lobby/heroes'])],
  [lobbyNoticeApiPath, new Set(['/api/player/lobby/notices'])],
]);

function assertLobbyReadonlyApi(path, text) {
  const allowed = lobbyReadonlyApiAllowlist.get(path);
  if (!allowed) {
    return;
  }
  const calls = Array.from(text.matchAll(/this\.http\.(get|post|put|patch|delete)<[^>]*>\((['"`])([^'"`]+)\2/g));
  if (calls.length === 0) {
    console.error(`readonly lobby API has no checked http call: ${path}`);
    ok = false;
    return;
  }
  for (const call of calls) {
    const method = call[1];
    const endpoint = call[3];
    if (method !== 'get') {
      console.error(`readonly lobby API must use GET only in ${path}: ${method}`);
      ok = false;
    }
    if (!allowed.has(endpoint)) {
      console.error(`readonly lobby API endpoint is not allowlisted in ${path}: ${endpoint}`);
      ok = false;
    }
  }
}

assertLobbyReadonlyApi(profileApiPath, profileApi);
assertLobbyReadonlyApi(lobbyAdventureApiPath, lobbyAdventureApi);
assertLobbyReadonlyApi(lobbyCodexApiPath, lobbyCodexApi);
assertLobbyReadonlyApi(lobbyHeroApiPath, lobbyHeroApi);
assertLobbyReadonlyApi(lobbyNoticeApiPath, lobbyNoticeApi);

for (const token of [
  'export class BattleApi',
  "this.http.post<unknown>('/api/player/battles/start'",
  '`/api/player/battles/${encodeURIComponent(safeBattleNo)}/settle`',
  'data.rewardGranted === true || data.readonlyEconomy !== true',
  "rarity.toUpperCase() === 'EX'",
  'normalizeStartDTO(dto: PlayerBattleStartDTO)',
  'validateBattleStart(data, request.stageCode)',
  'stageCode !== expectedStageCode',
  'normalizeMainStageCode(stageCode: string)',
  '不允许默认兜底',
]) {
  if (!battleApi.includes(token)) {
    console.error(`missing battle API safety guard in ${battleApiPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export interface PlayerBattleStartDTO',
  'export interface PlayerBattleSettlementVO',
  'rewardGranted: boolean;',
  'readonlyEconomy: boolean;',
]) {
  if (!battleTypes.includes(token)) {
    console.error(`missing battle type contract in ${battleTypesPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyBattleFlow',
  'prepare(stageCode: string): void',
  'this.battleApi.startBattle(dto)',
  'this.battleApi.settleBattle(currentStart.battleNo, dto)',
  "result: 'WIN'",
  'createRequestId',
  "hero.rarity.toUpperCase() !== 'EX'",
  'schedulePresentationTicks',
  'this.state.starting || this.state.start',
  'this.state.settlement || !this.state.presentationComplete',
  '!this.state.presentationComplete',
  'cancel(clearState = false): void',
    'settlement.stageCode !== currentStart.stageCode',
    'normalizeStageCode',
    'currentLobbyFormationHeroIds(): number[]',
    'this.resolveLineupHeroes(this.host.currentLobbyFormationHeroIds())',
    'clientVersion: \'cocos-lobby-stage-4o\'',
    "this.state.stageCode = '';",
  '关卡选择已失效，请重新选择主线关卡。',
  '/^MAIN_\\d+_\\d+$/.test(value)',
]) {
  if (!lobbyBattleFlow.includes(token)) {
    console.error(`missing lobby battle flow guard in ${lobbyBattleFlowPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export interface LobbyBattlePanelState',
  'starting: boolean;',
  'settlement: PlayerBattleSettlementVO | null;',
  'presentationStep: number;',
  'presentationComplete: boolean;',
  'version: number;',
]) {
  if (!lobbyBattleState.includes(token)) {
    console.error(`missing lobby battle state guard in ${lobbyBattleStatePath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export function resolveBattlePresentationLayout',
  'stackedFooter',
  'allySlots',
  'enemySlots',
  'footerButtons',
  'verticalCramped',
  'footerClearBottom',
]) {
  if (!lobbyBattlePresentationLayout.includes(token)) {
    console.error(`missing lobby battle presentation layout guard in ${lobbyBattlePresentationLayoutPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export function resolveLobbyBattlePresentationState',
  "'creatingSession'",
  "'roundPlaying'",
  "'resultRecorded'",
  'LobbyBattlePlaybackPending',
  'damageText',
  'leadEnemyHp',
  'settlementReceiptLines',
  '目标关卡：',
  'rewardGranted=false',
  '下一步：返回大厅',
]) {
  if (!lobbyBattlePresentationState.includes(token)) {
    console.error(`missing lobby battle presentation state guard in ${lobbyBattlePresentationStatePath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyAdventureApi',
  "this.http.get<unknown>('/api/player/lobby/adventure')",
  'function validateLobbyAdventure(data: unknown): LobbyAdventureVO',
  'function normalizeStage(item: unknown): LobbyAdventureStageVO | null',
  'normalizeMainStageCode(readText(item',
  'filter((stage): stage is LobbyAdventureStageVO => stage !== null)',
  "value.toUpperCase().includes('EX_')",
]) {
  if (!lobbyAdventureApi.includes(token)) {
    console.error(`missing lobby adventure API guard in ${lobbyAdventureApiPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyAdventureLoader',
  'private loadTicket = 0;',
  'this.adventureApi.lobbyAdventure()',
  'private isCurrentRequest(ticket: number): boolean',
]) {
  if (!lobbyAdventureLoader.includes(token)) {
    console.error(`missing lobby adventure loader guard in ${lobbyAdventureLoaderPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyAdventurePanelRenderer',
  'LobbyAdventureSceneContent',
  'LobbyAdventureSceneFrame',
  'layout.stageWidth',
  'layout.stageHeight',
  'dim.addComponent(BlockInputEvents);',
  'panelGroup.addComponent(BlockInputEvents);',
  'LobbyAdventureBoundaryNote',
  'openLobbyFormationPanel(stageCode?: string)',
    'this.host.openLobbyFormationPanel(stage.stageCode)',
    'this.host.openLobbyFormationPanel(recommended.stageCode)',
  'selectLobbyAdventureStage(stage.stageCode)',
    'previewLockedLobbyAdventureStage(stage.stageCode)',
    'currentLobbySelectedStageCode(): string',
    'LobbyAdventureStageLockBadge',
    '锁定 ',
    'LobbyAdventureRecentBattleSummaryCard',
    '只读经济通过',
    'reloadLobbyAdventure()',
  'closeLobbyAdventurePanel()',
  'LobbyAdventureBackButton',
  'renderSceneBackButton(this.host, panelGroup, layout',
  'LobbyAdventureStageMap',
  'LobbyAdventureFormationButton',
  'LobbyAdventureCompactFormationButton',
  '关卡配置预览（当前不发放）',
]) {
  if (!lobbyAdventurePanel.includes(token)) {
    console.error(`missing lobby adventure panel guard in ${lobbyAdventurePanelPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyFormationPanelRenderer',
  'LobbyFormationSceneContent',
  'LobbyFormationSceneFrame',
  'layout.stageWidth',
  'layout.stageHeight',
  'dim.addComponent(BlockInputEvents);',
  'panelGroup.addComponent(BlockInputEvents);',
  'LobbyFormationBoundaryNote',
    'reloadLobbyHeroRoster()',
    'closeLobbyFormationPanel()',
    'currentLobbySelectedStageCode()',
    'currentLobbyFormationHeroIds()',
    'toggleLobbyFormationHero(hero.id)',
    'this.host.openLobbyBattlePreviewPanel(stageCode)',
    'private canOpenBattlePreview(state: LobbyHeroRosterPanelState, stageCode: string): boolean',
    'buttonComponent.interactable = enabled;',
    "state.loading ? '读取中' : '不可出战'",
    'LobbyFormationSlot_',
    'LobbyFormationCandidateButton_',
    '点击候选英雄调整本次出战',
  'LobbyFormationBattlePreviewButton',
  'LobbyFormationBackButton',
  'renderSceneBackButton(this.host, panelGroup, layout',
]) {
  if (!lobbyFormationPanel.includes(token)) {
    console.error(`missing lobby formation panel guard in ${lobbyFormationPanelPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyBattlePreviewPanelRenderer',
  'LOBBY_BATTLE_SCENE_BG_ASSET',
  'LobbyBattleSceneRoot',
  'LobbyBattleSceneBackdropSprite',
  'LobbyBattlePreviewBackButton',
  'renderSceneBackButton(this.host, sceneRoot, layout',
  'LobbyBattleSceneEmberMotion',
  'panelGroup.addComponent(BlockInputEvents);',
  'LobbyBattlePreviewBoundaryNote',
  'LobbyBattleSettleDisabled',
  'LobbyBattleSettlementButton',
  'LobbyBattleReturnLobbyButton',
  'currentLobbyBattleState()',
  'settleLobbyBattleSession()',
  'returnToLobbyFromBattlePreview()',
  'closeLobbyBattlePreviewPanel()',
  'LobbyBattlePreviewField',
  'LobbyBattleCinematicBackdrop',
  'LobbyBattleActor_',
  'LobbyBattleEffectLayer',
  'LobbyBattleBoundaryBadge',
  'LobbyBattleSettlementReceipt',
  'resolveBattlePresentationLayout',
  'resolveLobbyBattlePresentationState',
]) {
  if (!lobbyBattlePreviewPanel.includes(token)) {
    console.error(`missing lobby battle preview panel guard in ${lobbyBattlePreviewPanelPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyCodexApi',
  "this.http.get<unknown>('/api/player/lobby/codex')",
  'function validateLobbyCodex(data: unknown): LobbyCodexItemVO[]',
  "portraitAsset: readOptionalText(item, 'portraitAsset', 64)",
  "rarity.toUpperCase() === 'EX'",
  "heroCode.toUpperCase().startsWith('EX_')",
]) {
  if (!lobbyCodexApi.includes(token)) {
    console.error(`missing lobby codex API guard in ${lobbyCodexApiPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyHeroApi',
  "this.http.get<unknown>('/api/player/lobby/heroes')",
  'function validateLobbyHeroes(data: unknown): LobbyHeroItemVO[]',
  "portraitAsset: readOptionalText(item, 'portraitAsset', 64)",
  "rarity.toUpperCase() === 'EX'",
  "heroCode.toUpperCase().startsWith('EX_')",
  'if (id <= 0)',
  'Number(b.protagonist) - Number(a.protagonist)',
]) {
  if (!lobbyHeroApi.includes(token)) {
    console.error(`missing lobby hero API guard in ${lobbyHeroApiPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyCodexLoader',
  'private loadTicket = 0;',
  'this.codexApi.lobbyCodex()',
  'private isCurrentRequest(ticket: number): boolean',
]) {
  if (!lobbyCodexLoader.includes(token)) {
    console.error(`missing lobby codex loader guard in ${lobbyCodexLoaderPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyCodexPanelRenderer',
  'LobbyCodexSceneContent',
  'LobbyCodexSceneFrame',
  'layout.stageWidth',
  'layout.stageHeight',
  'dim.addComponent(BlockInputEvents);',
  'panelGroup.addComponent(BlockInputEvents);',
  'LobbyCodexBoundaryNote',
  'reloadLobbyCodex()',
  'closeLobbyCodexPanel()',
  'LobbyCodexBackButton',
  'renderSceneBackButton(this.host, panelGroup, layout',
  'LobbyCodexCard_',
]) {
  if (!lobbyCodexPanel.includes(token)) {
    console.error(`missing lobby codex panel guard in ${lobbyCodexPanelPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyHeroRosterLoader',
  'private loadTicket = 0;',
  'this.heroApi.lobbyHeroes()',
  'private isCurrentRequest(ticket: number): boolean',
]) {
  if (!lobbyHeroRosterLoader.includes(token)) {
    console.error(`missing lobby hero roster loader guard in ${lobbyHeroRosterLoaderPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyHeroDetailPanelRenderer',
  'LOBBY_HERO_DETAIL_BACKDROP_ASSET',
  'LOBBY_HERO_DETAIL_PROTAGONIST_ASSET',
  'LobbyHeroDetailSceneContent',
  'LobbyHeroDetailSceneFrame',
  'layout.stageWidth',
  'layout.stageHeight',
  'LobbyHeroDetailDynamicPortrait',
  'LobbyHeroDetailAttributeGrid',
  'LobbyHeroDetailSkillList',
  'dim.addComponent(BlockInputEvents);',
  'LobbyHeroDetailBackButton',
  'renderSceneBackButton(this.host, panelGroup, layout',
  'backToLobbyHeroRosterPanel()',
  'closeLobbyHeroDetailPanel()',
  '不提供升级、升星、觉醒、装备、抽卡、领取或资源变更入口',
]) {
  if (!lobbyHeroDetailPanel.includes(token)) {
    console.error(`missing lobby hero detail panel guard in ${lobbyHeroDetailPanelPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyHeroRosterPanelRenderer',
  'LobbyHeroRosterSceneContent',
  'LobbyHeroRosterSceneFrame',
  'layout.stageWidth',
  'layout.stageHeight',
  'dim.addComponent(BlockInputEvents);',
  'panelGroup.addComponent(BlockInputEvents);',
  'LobbyHeroRosterBoundaryNote',
  'reloadLobbyHeroRoster()',
  'closeLobbyHeroRosterPanel()',
  'openLobbyHeroDetail(hero.id)',
  'LobbyHeroRosterBackButton',
  'renderSceneBackButton(this.host, panelGroup, layout',
  'LobbyHeroRosterProtagonistBadge',
  'hero.protagonist',
]) {
  if (!lobbyHeroRosterPanel.includes(token)) {
    console.error(`missing lobby hero roster panel guard in ${lobbyHeroRosterPanelPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyNoticeApi',
  "this.http.get<unknown>('/api/player/lobby/notices')",
  'function validateLobbyNotices(data: unknown): LobbyNoticeVO[]',
]) {
  if (!lobbyNoticeApi.includes(token)) {
    console.error(`missing lobby notice API guard in ${lobbyNoticeApiPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyNoticeLoader',
  'private loadTicket = 0;',
  'this.noticeApi.lobbyNotices()',
  'private isCurrentRequest(ticket: number): boolean',
]) {
  if (!lobbyNoticeLoader.includes(token)) {
    console.error(`missing lobby notice loader guard in ${lobbyNoticeLoaderPath}: ${token}`);
    ok = false;
  }
}

for (const token of [
  'export class LobbyNoticePanelRenderer',
  'LobbyNoticeSceneContent',
  'LobbyNoticeSceneFrame',
  'layout.stageWidth',
  'layout.stageHeight',
  'dim.addComponent(BlockInputEvents);',
  'panelGroup.addComponent(BlockInputEvents);',
  'LobbyNoticeBoundaryNote',
  'reloadLobbyNotices()',
  'closeLobbyNoticePanel()',
  'LobbyNoticeBackButton',
  'renderSceneBackButton(this.host, panelGroup, layout',
]) {
  if (!lobbyNoticePanel.includes(token)) {
    console.error(`missing lobby notice panel guard in ${lobbyNoticePanelPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootLayoutTokens = [
  'interface StageBounds',
  'const LOGIN_REFERENCE_WIDTH',
  'const LOGIN_STAGE_NODE_NAMES',
  'const MIN_VISIBLE_WIDTH',
  'private resolveStageBounds(',
  'private findStageNode(',
  'private visibleSize(',
  'private runtimeWindowSize(',
  'view.getVisibleSize()',
];

for (const token of forbiddenRootLayoutTokens) {
  if (gameRoot.includes(token)) {
    console.error(`layout resolver implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootSpriteCacheTokens = [
  'private readonly spriteFrames',
  'private readonly loadingSpriteFrames',
  'resources.load(path, SpriteFrame',
  'private requestSpriteFrame(',
  'private resolveUiSpriteFrame(',
];

for (const token of forbiddenRootSpriteCacheTokens) {
  if (gameRoot.includes(token)) {
    console.error(`UI sprite cache implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootProfileLoaderTokens = [
  'private readonly lobbyProfileState',
  'new LobbyProfileState',
  'this.api.profile.lobbyProfile()',
  'this.lobbyProfileState.startLoading();',
  'this.lobbyProfileState.applyLoadedProfile(userId, profile)',
  'this.lobbyProfileState.applyLoadError(userId, error)',
  'this.lobbyProfileState.finishLoading(userId)',
  "console.warn('[LootChain] lobby profile load failed:'",
];

for (const token of forbiddenRootProfileLoaderTokens) {
  if (gameRoot.includes(token)) {
    console.error(`lobby profile loading implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootLoadingFlowTokens = [
  'private readonly lobbyResourceLoader',
  'private loadingProgress',
  'private loadingMessage',
  'private loadingError',
  'private resourceLoadTicket',
  'private async loadLobbyResources(',
  'private async setLoadingProgress(',
  'private delay(ms: number): Promise<void>',
  'this.lobbyResourceLoader.load(',
];

for (const token of forbiddenRootLoadingFlowTokens) {
  if (gameRoot.includes(token)) {
    console.error(`lobby loading flow implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootLoginFlowTokens = [
  'private accountInput: EditBox',
  'private passwordInput: EditBox',
  'private lastTokenName',
  'private agreementAccepted',
  'private async login(): Promise<void>',
  'this.api.auth.devLogin',
  'private resolveDevUserId(',
  'private formatApiError(',
  'error instanceof ApiError',
];

for (const token of forbiddenRootLoginFlowTokens) {
  if (gameRoot.includes(token)) {
    console.error(`login flow implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootStatusPresenterTokens = [
  'private statusLabel: Label | null',
  'this.statusLabel = this.addLabel',
  'this.statusLabel.string',
];

for (const token of forbiddenRootStatusPresenterTokens) {
  if (gameRoot.includes(token)) {
    console.error(`status presenter implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootTextFormatterTokens = [
  'String(safeValue).replace',
  'safeValue >= 1_000_000_000',
  'Number.isFinite(parsed)',
  'String(value ?? \'\').trim()',
  'text.length > 1200',
];

for (const token of forbiddenRootTextFormatterTokens) {
  if (gameRoot.includes(token)) {
    console.error(`text formatter implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootPrimitiveFactoryTokens = [
  'EditBox.InputFlag.PASSWORD',
  'Vec3.ZERO',
  'new Vec3(',
  'Label.Overflow.CLAMP',
  'Sprite.SizeMode.CUSTOM',
  'this.traceBeveledRect',
  'graphics.circle(',
  'graphics.moveTo(',
  'Button.EventType.CLICK, callback, this',
];

for (const token of forbiddenRootPrimitiveFactoryTokens) {
  if (gameRoot.includes(token)) {
    console.error(`UI primitive implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenRootContentRootTokens = [
  'private contentRoot: Node | null',
  "new Node('LootChainCocosLoginUIRoot')",
  'this.contentRoot?.getChildByName',
  'removeAllChildren();',
  'this.node.addChild(root);',
];

for (const token of forbiddenRootContentRootTokens) {
  if (gameRoot.includes(token)) {
    console.error(`content root implementation must not live in ${gameRootPath}: ${token}`);
    ok = false;
  }
}

const forbiddenAdaptiveLayoutTokens = [
  'lootChainApi',
  'this.api',
  'devLogin',
  'lobbyProfile',
  '/api/player',
  'Button',
  'EditBox',
  'Label',
  'SpriteFrame',
  'VideoPlayer',
  'resources.load',
];

const forbiddenStatusPresenterTokens = [
  'lootChainApi',
  'this.api',
  'devLogin',
  'lobbyProfile',
  '/api/player',
  'Button',
  'EditBox',
  'SpriteFrame',
  'VideoPlayer',
  'resources.load',
  'new Node',
];

const forbiddenUiPrimitiveFactoryTokens = [
  'lootChainApi',
  'this.api',
  'devLogin',
  'lobbyProfile',
  '/api/player',
  'PlayerAuthApi',
  'PlayerProfileApi',
  'VideoPlayer',
  'resources.load',
  'renderLobby(',
  'renderLoading(',
];

const forbiddenUiContentRootTokens = [
  'lootChainApi',
  'this.api',
  'devLogin',
  'lobbyProfile',
  '/api/player',
  'Button',
  'EditBox',
  'Label',
  'SpriteFrame',
  'VideoPlayer',
  'resources.load',
  'renderLobby(',
  'renderLoading(',
];

for (const token of forbiddenUiContentRootTokens) {
  if (uiContentRoot.includes(token)) {
    console.error(`forbidden content root responsibility in ${uiContentRootPath}: ${token}`);
    ok = false;
  }
}

const requiredUiContentRootTokens = [
  'export class UiContentRootController',
  'export interface UiContentRootHost',
  'private contentRoot: Node | null = null;',
  'applyRootSize(layout: UiLayout): void',
  'createNode(name: string): Node',
  'removeNode(name: string): void',
  'clear(): void',
  'clearExcept(preservedNodeNames: readonly string[]): void',
  'const preserved = new Set(preservedNodeNames);',
  'preserved.has(child.name)',
  'ensure(): Node',
  "new Node('LootChainCocosLoginUIRoot')",
  'this.host.node.addChild(root);',
  'const children = [...root.children];',
  'child.removeFromParent();',
  'child.destroy();',
  'transform.setContentSize(new Size(layout.width, layout.height));',
];

for (const token of requiredUiContentRootTokens) {
  if (!uiContentRoot.includes(token)) {
    console.error(`missing content root safeguard in ${uiContentRootPath}: ${token}`);
    ok = false;
  }
}

for (const token of forbiddenUiPrimitiveFactoryTokens) {
  if (uiPrimitiveFactory.includes(token)) {
    console.error(`forbidden UI primitive factory responsibility in ${uiPrimitiveFactoryPath}: ${token}`);
    ok = false;
  }
}

const requiredUiPrimitiveFactoryTokens = [
  'export class UiPrimitiveFactory',
  'export interface UiPrimitiveFactoryHost',
  "export type ButtonVisualState = 'hover' | 'normal' | 'pressed';",
  'private readonly spriteFrameCache: UiSpriteFrameCache',
  'private readonly spriteFrameOverrides: () => UiSpriteFrameOverrides',
  'addLabel(text: string, x: number, y: number',
  'addEditBox(initialText: string, x: number, y: number, width: number',
  'applyPasswordMask(editBox: EditBox, textLabel: Label): void',
  'addFramedEditBox(initialText: string, x: number, y: number, width: number',
  'addButton(text: string, x: number, y: number, callback: () => void',
  'addImageButton(',
  'addSprite(name: string, assetPath: string',
  'addChildLabel(',
  'resolveAlignedLabelX(x: number, width: number',
  'addAccountGlyph(parent: Node, x: number, y: number, scale: number): void',
  'addRect(name: string, x: number, y: number, width: number, height: number',
  'addBeveledPanel(name: string, x: number, y: number, width: number, height: number',
  'addProgressBar(x: number, y: number, width: number, height: number, progress: number): void',
  'addBeveledPanelNode(name: string, x: number, y: number, width: number, height: number',
  'addChildBeveledPanelNode(parent: Node, name: string',
  'addChildPlainNode(parent: Node, name: string',
  'drawBeveledPanelOnNode(node: Node, width: number, height: number',
  'applyButtonVisual(node: Node, width: number, height: number): void',
  'applyImageButtonFeedback(node: Node, hoverScale = 1.035, pressedScale = 0.975): void',
  'applyPointerCursor(node: Node): void',
  'drawButtonFrame(graphics: Graphics, width: number, height: number, state: ButtonVisualState): void',
  'private traceBeveledRect(graphics: Graphics, width: number, height: number, bevel: number): void',
  'EditBox.InputFlag.PASSWORD',
  'Sprite.SizeMode.CUSTOM',
  'this.spriteFrameCache.resolve(assetPath, this.spriteFrameOverrides())',
  'this.spriteFrameCache.request(assetPath)',
  'this.host.ensureContentRoot()',
  'this.host.setPointerCursor(true)',
  'trimText(text)',
];

for (const token of requiredUiPrimitiveFactoryTokens) {
  if (!uiPrimitiveFactory.includes(token)) {
    console.error(`missing UI primitive factory safeguard in ${uiPrimitiveFactoryPath}: ${token}`);
    ok = false;
  }
}

const requiredUiSceneBackButtonTokens = [
  'export interface SceneBackButtonHost',
  'export function renderSceneBackButton(',
  'layout.stageLeft + 46 * buttonScale',
  'layout.stageTop - 42 * buttonScale',
  '60 * buttonScale',
  '44 * buttonScale',
  'Button.EventType.CLICK',
  'host.applyImageButtonFeedback(button, 1.04, 0.96)',
  'rgba(218, 170, 84, 220)',
  'graphics.moveTo(14 * buttonScale, 15 * buttonScale)',
  'graphics.lineTo(-13 * buttonScale, 0)',
];

for (const token of requiredUiSceneBackButtonTokens) {
  if (!uiSceneBackButton.includes(token)) {
    console.error(`missing scene back button safeguard in ${uiSceneBackButtonPath}: ${token}`);
    ok = false;
  }
}

for (const token of forbiddenStatusPresenterTokens) {
  if (statusPresenter.includes(token)) {
    console.error(`forbidden status presenter responsibility in ${statusPresenterPath}: ${token}`);
    ok = false;
  }
}

const requiredStatusPresenterTokens = [
  'export class StatusPresenter',
  'export interface StatusPresenterHost',
  'private label: Label | null = null;',
  'reset(): void',
  'add(text: string, layout?: UiLayout, y?: number): void',
  'set(text: string): void',
  'this.host.addLabel(',
  'this.host.resolveLayout()',
  'this.host.trimText(text)',
  'this.label.node?.isValid',
];

for (const token of requiredStatusPresenterTokens) {
  if (!statusPresenter.includes(token)) {
    console.error(`missing status presenter safeguard in ${statusPresenterPath}: ${token}`);
    ok = false;
  }
}

const forbiddenUiTextFormatterTokens = [
  'from \'cc\'',
  'lootChainApi',
  'this.api',
  'devLogin',
  'lobbyProfile',
  '/api/player',
  'Button',
  'EditBox',
  'Node',
  'Label',
  'SpriteFrame',
  'VideoPlayer',
  'resources.load',
];

for (const token of forbiddenUiTextFormatterTokens) {
  if (uiTextFormatter.includes(token)) {
    console.error(`forbidden UI text formatter responsibility in ${uiTextFormatterPath}: ${token}`);
    ok = false;
  }
}

const requiredUiTextFormatterTokens = [
  'export const UI_TEXT_MAX_LENGTH = 1200;',
  'export function positiveInteger(value: number | null | undefined, fallback: number): number',
  'export function formatInteger(value: number | null | undefined): string',
  'export function compactResourceValue(value: number | null | undefined): string',
  'export function trimText(text: string): string',
  'export function safeText(value: string | null | undefined): string',
  'String(safeValue).replace',
  'safeValue >= 1_000_000_000',
  'Number.isFinite(parsed)',
];

for (const token of requiredUiTextFormatterTokens) {
  if (!uiTextFormatter.includes(token)) {
    console.error(`missing UI text formatter safeguard in ${uiTextFormatterPath}: ${token}`);
    ok = false;
  }
}

for (const token of forbiddenAdaptiveLayoutTokens) {
  if (adaptiveLayout.includes(token)) {
    console.error(`forbidden adaptive layout responsibility in ${adaptiveLayoutPath}: ${token}`);
    ok = false;
  }
}

const requiredAdaptiveLayoutTokens = [
  'export class AdaptiveStageLayoutResolver',
  'export interface AdaptiveStageLayoutHost',
  'export const LOGIN_REFERENCE_WIDTH = 1920;',
  'export const LOGIN_REFERENCE_HEIGHT = 1080;',
  "export const LOGIN_STAGE_NODE_NAMES = ['Login_BG_Poster', 'Login_BG_Video'] as const;",
  'export const MIN_VISIBLE_WIDTH = 320;',
  'export const MIN_VISIBLE_HEIGHT = 180;',
  'resolve(): UiLayout',
  'const safeInsetX = clamp(stageWidth * 0.035',
  'const safeInsetY = clamp(stageHeight * 0.035',
  'safeLeft',
  'safeRight',
  'safeTop',
  'safeBottom',
  'topY: safeTop - 48 * uiScale',
  'inputHeight: 46 * uiScale',
  'buttonHeight: 48 * uiScale',
  'statusWidth: Math.min(contentWidth, 760 * uiScale)',
  'bodyFont: Math.max(13, 18 * uiScale)',
  'private resolveStageBounds(visibleWidth: number, visibleHeight: number): StageBounds',
  'const transform = stageNode?.getComponent(UITransform);',
  'stageNode.position.x',
  'private findStageNode(): Node | null',
  'view.getVisibleSize()',
  'private runtimeWindowSize(): Size | null',
];

for (const token of requiredAdaptiveLayoutTokens) {
  if (!adaptiveLayout.includes(token)) {
    console.error(`missing adaptive layout safeguard in ${adaptiveLayoutPath}: ${token}`);
    ok = false;
  }
}

const forbiddenUiSpriteFrameCacheTokens = [
  'lootChainApi',
  'this.api',
  'devLogin',
  'lobbyProfile',
  '/api/player',
  'VideoPlayer',
  'Button,',
  'EditBox,',
  'Label,',
  'Graphics,',
  'UITransform,',
  'new Node',
];

for (const token of forbiddenUiSpriteFrameCacheTokens) {
  if (uiSpriteFrameCache.includes(token)) {
    console.error(`forbidden UI sprite cache responsibility in ${uiSpriteFrameCachePath}: ${token}`);
    ok = false;
  }
}

const requiredUiSpriteFrameCacheTokens = [
  'export class UiSpriteFrameCache',
  'export interface UiSpriteFrameCacheHost',
  'export interface UiSpriteFrameOverrides',
  'private readonly spriteFrames = new Map<string, SpriteFrame>();',
  'private readonly loadingSpriteFrames = new Set<string>();',
  'resources.load(path, SpriteFrame',
  'LOGIN_UI_ASSETS.logo',
  'LOGIN_UI_ASSETS.mainButton',
  'LOGIN_UI_ASSETS.rightRail',
  'LOBBY_PLAYER_INFO_PANEL_ASSET',
  'LOBBY_BATTLE_SCENE_BG_ASSET',
  'LOBBY_HERO_DETAIL_BACKDROP_ASSET',
  'LOBBY_HERO_DETAIL_PROTAGONIST_ASSET',
  'SHOW_LOGIN_BRAND',
  'SHOW_RIGHT_RAIL',
  'USE_IMAGE_LOGIN_BUTTON',
  'preload(overrides: UiSpriteFrameOverrides): void',
  'request(path: string): void',
  'resolve(path: string, overrides: UiSpriteFrameOverrides): SpriteFrame | undefined',
  'this.host.renderCurrentView();',
  'overrides.logoFrame',
  'overrides.mainButtonFrame',
  'overrides.rightRailFrames[railIndex]',
];

for (const token of requiredUiSpriteFrameCacheTokens) {
  if (!uiSpriteFrameCache.includes(token)) {
    console.error(`missing UI sprite cache safeguard in ${uiSpriteFrameCachePath}: ${token}`);
    ok = false;
  }
}

const forbiddenLoginFlowTokens = [
  'lootChainApi',
  'LootChainApi',
  'GachaApi',
  'HeroApi',
  'BagApi',
  'this.api',
  'this.authApi.gacha',
  'this.authApi.hero',
  'this.authApi.bag',
  'lobbyProfile()',
  'PlayerProfileApi',
  'LobbyProfileLoader',
  'LobbyLoadingFlow',
  'Button',
  'Graphics',
  'Node',
  'UITransform',
  'renderLobby(',
];

for (const token of forbiddenLoginFlowTokens) {
  if (loginFlow.includes(token)) {
    console.error(`forbidden login flow responsibility in ${loginFlowPath}: ${token}`);
    ok = false;
  }
}

const requiredLoginFlowTokens = [
  'export class LoginFlow',
  'export interface LoginFlowHost',
  'export interface LoginFlowConfig',
  'private accountInput: EditBox | null = null;',
  'private passwordInput: EditBox | null = null;',
  'private acceptedAgreement = true;',
  'private tokenName =',
  'private loginTicket = 0;',
  'private readonly authApi: PlayerAuthApi',
  'get agreementAccepted(): boolean',
  'get defaultDevUserId(): number',
  'get lastTokenName(): string',
  'setInputs(accountInput: EditBox | null, passwordInput: EditBox | null): void',
  'toggleAgreement(): void',
  'async login(): Promise<void>',
  'this.host.setApiBaseUrl(this.config.apiBaseUrl);',
  'const ticket = this.nextLoginTicket();',
  'this.authApi.devLogin(userId)',
  'this.isCurrentLogin(ticket)',
  'this.authApi.saveToken(token);',
  'this.host.resetLobbyProfileForLogin(userId);',
  'handleLoginSuccess(userId: number, tokenName: string): void;',
  'this.host.handleLoginSuccess(userId, this.tokenName);',
  'cancel(): void',
  'private nextLoginTicket(): number',
  'private isCurrentLogin(ticket: number): boolean',
  'private resolveDevUserId(account: string): number',
  'private formatApiError(error: unknown, fallbackBaseUrl: string): string',
  'error instanceof ApiError',
  '/api/player/auth/dev-login',
];

for (const token of requiredLoginFlowTokens) {
  if (!loginFlow.includes(token)) {
    console.error(`missing login flow safeguard in ${loginFlowPath}: ${token}`);
    ok = false;
  }
}

const forbiddenLoginRendererTokens = [
  'this.api',
  'devLogin',
  'startLobbyLoading',
  'loadLobbyProfile',
  'renderLobby(',
  'renderLoading(',
  '/api/player',
];

for (const token of forbiddenLoginRendererTokens) {
  if (loginRenderer.includes(token)) {
    console.error(`forbidden login renderer behavior in ${loginRendererPath}: ${token}`);
    ok = false;
  }
}

const requiredLoginRendererTokens = [
  'export class LoginRenderer',
  'export interface LoginRendererHost',
  'export interface LoginRendererState',
  'export const LOGIN_UI_ASSETS',
  'export const SHOW_LOGIN_BRAND = true;',
  'export const SHOW_RIGHT_RAIL = true;',
  'export const USE_IMAGE_LOGIN_BUTTON = true;',
  'export const SHOW_DIALOG_THIRD_PARTY_LOGIN = true;',
  'renderLogin(layout: UiLayout): void',
  'renderLoginAccountScene(layout: UiLayout, state: LoginRendererState): void',
  'LOGIN_UI_ASSETS.rightRail',
  'MainAccountLoginButton',
  'LoginLogo',
  'LoginAccountSceneRoot',
  'LoginAccountScenePanel',
  'BlockInputEvents',
  'scene.node.addComponent(BlockInputEvents);',
  'panelGraphics.node.addComponent(BlockInputEvents);',
  '账号登录',
  '账号 / 邮箱',
  '密码',
  '进入游戏',
  '其他登录方式',
  '第三方登录暂未开放',
  '我已阅读并同意《用户协议》和《隐私政策》',
  '当前阶段只接入 dev-login',
  '该入口为登录页占位',
  'setLoginInputs(accountInput, passwordInput);',
  'this.host.openLoginAccountScene()',
  'this.host.submitLogin()',
  'this.host.toggleLoginAgreement()',
  'this.host.renderLogin()',
  'private addRailImageButton(asset: RailButtonAsset',
  'private addDiamondButton(text: string',
  'layout.safeRight - railWidth / 2',
];

for (const token of requiredLoginRendererTokens) {
  if (!loginRenderer.includes(token)) {
    console.error(`missing login renderer safeguard in ${loginRendererPath}: ${token}`);
    ok = false;
  }
}

const forbiddenProtagonistTokens = [
  '/api/player/gacha',
  '/api/player/bag',
  '/api/player/heroes/',
  'RewardGrant',
  'gacha',
  'claim',
  'purchase',
  'EX V1',
  'source_type=PROTAGONIST',
];

for (const token of forbiddenProtagonistTokens) {
  for (const source of [
    { path: protagonistFlowPath, text: protagonistFlow },
    { path: protagonistRendererPath, text: protagonistRenderer },
    { path: protagonistStatePath, text: protagonistState },
    { path: protagonistTypesPath, text: protagonistTypes },
  ]) {
    if (source.text.includes(token)) {
      console.error(`forbidden protagonist P1 token in ${source.path}: ${token}`);
      ok = false;
    }
  }
}

const requiredProtagonistFlowTokens = [
  'export class ProtagonistCreateFlow',
  'export interface ProtagonistCreateFlowHost',
  "import type { ProtagonistApi } from '../../api/ProtagonistApi';",
  'showProtagonistCreateView(): void;',
  'startLobbyLoading(tokenName: string): void;',
  'loadLobbyProfileAfterLogin(userId: number): void;',
  'setNameInput(input: EditBox | null): void',
  'async handleLoginSuccess(userId: number, tokenName: string): Promise<void>',
  'const serverState = await this.protagonistApi.state();',
  'serverState.created && serverState.profile',
  'this.state.rememberServerProfile(serverState.profile);',
  'this.state.beginCreate(userId);',
  'this.host.showProtagonistCreateView();',
  'selectGender(gender: ProtagonistGender): void',
  'previewForm(form: ProtagonistForm): void',
  "form === 'attack'",
  'async submitCreate(): Promise<void>',
  'if (current.creating)',
  '主角色创建中，请勿重复提交。',
  'this.state.validateName(nextName)',
  'await this.protagonistApi.create({',
  'this.state.rememberServerProfile(profile);',
  'this.host.startLobbyLoading(this.currentTokenName);',
  'this.host.loadLobbyProfileAfterLogin(this.currentUserId);',
  'private nextTicket(): number',
  'private isCurrent(ticket: number): boolean',
  'cancel(): void',
];

for (const token of requiredProtagonistFlowTokens) {
  if (!protagonistFlow.includes(token)) {
    console.error(`missing protagonist flow safeguard in ${protagonistFlowPath}: ${token}`);
    ok = false;
  }
}

const requiredProtagonistStateTokens = [
  'export class ProtagonistCreateState',
  'lootchain.protagonist.preview.v1.',
  'beginCreate(userId: number): void',
  'rememberServerProfile(profile: ProtagonistServerProfile): void',
  '是否已创建仍以后端 state 接口为准',
  "selectedGender: 'male'",
  'selectedForm: DEFAULT_ATTACK_FORM',
  'createLocalProfile(userId: number, rawName: string): ProtagonistLocalProfile | null',
  "rarity: 'SSR'",
  'validateName(name: string): string',
  '角色名至少需要 2 个字符。',
  '角色名最多 12 个字符。',
  'localStorage',
  'isValidProfile(userId: number, value: Partial<ProtagonistLocalProfile>)',
];

for (const token of requiredProtagonistStateTokens) {
  if (!protagonistState.includes(token)) {
    console.error(`missing protagonist state safeguard in ${protagonistStatePath}: ${token}`);
    ok = false;
  }
}

const requiredProtagonistApiTokens = [
  'export class ProtagonistApi',
  "'/api/player/protagonist/state'",
  "'/api/player/protagonist'",
  '客户端只提交性别和名字',
  'this.http.get<unknown>',
  'this.http.post<unknown>',
  'validateProtagonistState',
  'validateProtagonistProfile',
  "rarity !== 'SSR'",
  "heroCode.toUpperCase().startsWith('EX_')",
];

for (const token of requiredProtagonistApiTokens) {
  if (!protagonistApi.includes(token)) {
    console.error(`missing protagonist API safeguard in ${protagonistApiPath}: ${token}`);
    ok = false;
  }
}

for (const token of ['heroCode', 'rarity', 'power', 'attrs', 'star', 'level']) {
  const createBody = extractMethodBody(protagonistApi, 'create(request: ProtagonistCreateRequest): Promise<ProtagonistServerProfile>');
  if (createBody && createBody.includes(`${token}:`)) {
    console.error(`protagonist create request must not send server-owned strength field in ${protagonistApiPath}: ${token}`);
    ok = false;
  }
}

const gachaDrawBody = extractMethodBody(gachaApi, 'draw(dto: GachaDrawDTO): Promise<GachaDrawResultVO>');
if (!gachaDrawBody || !gachaDrawBody.includes('当前 Cocos 阶段未开放抽卡') || gachaDrawBody.includes('/api/player/gacha/draw')) {
  console.error(`gacha draw must stay client-blocked during current Cocos phase in ${gachaApiPath}`);
  ok = false;
}

const requiredGachaConfigTokens = [
  'GACHA_ABYSS_SPINE_RESOURCE',
  'spine/gacha/huangfengjiaozong/huangfengjiaozong',
  'GACHA_ABYSS_SPINE_UUID',
  'ef87498c-2ef4-44e6-bee9-2d499e6ac570',
  'GACHA_ABYSS_SPINE_SKIN',
  'GACHA_ABYSS_SPINE_INTRO_ANIMATION',
  'GACHA_ABYSS_SPINE_IDLE_ANIMATION',
  'GACHA_ABYSS_FALLBACK_SPINE_RESOURCE',
  'spine/gacha/Lord of the Dark Abyss/1605',
  'GACHA_ABYSS_FALLBACK_SPINE_UUID',
  'ce6aee72-45cb-4315-abfd-74ac40b8d0ce',
  'GACHA_ABYSS_FALLBACK_SPINE_SKIN',
  'GACHA_ABYSS_FALLBACK_SPINE_INTRO_ANIMATION',
  'GACHA_ABYSS_FALLBACK_SPINE_IDLE_ANIMATION',
  'export interface GachaMockResultItem',
  'GACHA_MOCK_RESULT_ONCE',
  'GACHA_MOCK_RESULT_TEN',
  '本地 mock 结果只用于前端验收动效',
  "kind: 'hero'",
  "kind: 'shard'",
  "kind: 'material'",
];

for (const token of requiredGachaConfigTokens) {
  if (!gachaSceneConfig.includes(token)) {
    console.error(`missing gacha local mock config token in ${gachaSceneConfigPath}: ${token}`);
    ok = false;
  }
}

for (const token of ["id: 'friend'", '友情召唤']) {
  if (gachaSceneConfig.includes(token)) {
    console.error(`friendship summon pool must stay removed in ${gachaSceneConfigPath}: ${token}`);
    ok = false;
  }
}

const requiredGachaRendererTokens = [
  "export type GachaPreviewResultMode = 'once' | 'ten';",
  'GACHA_MOCK_RESULT_ONCE',
  'GACHA_MOCK_RESULT_TEN',
  'renderResultScene(layout: UiLayout, mode: GachaPreviewResultMode): void',
  'renderSceneBackButton(this.host, parent, layout',
  'GachaBackButton',
  'GachaAbyssSpineStage',
  'GachaAbyssSpineNode',
  'GACHA_ABYSS_SPINE_RESOURCE',
  'resources.load(GACHA_ABYSS_SPINE_RESOURCE, sp.SkeletonData',
  'GACHA_ABYSS_SPINE_UUID',
  'assetManager.loadAny({ uuid: GACHA_ABYSS_SPINE_UUID },',
  'GACHA_ABYSS_FALLBACK_SPINE_RESOURCE',
  'resources.load(GACHA_ABYSS_FALLBACK_SPINE_RESOURCE, sp.SkeletonData',
  'GACHA_ABYSS_FALLBACK_SPINE_UUID',
  'assetManager.loadAny({ uuid: GACHA_ABYSS_FALLBACK_SPINE_UUID },',
  'ensureAbyssFallbackSpineData',
  'finishAbyssFallbackSpineLoad',
  '已临时显示可用预览 Spine',
  '需要重新导出 huangfengjiaozong',
  'finishAbyssSpineLoad(data)',
  'finishAbyssSpineLoad(asset as sp.SkeletonData)',
  'const runtimeData = data.getRuntimeData(true)',
  'skeleton.setToSetupPose()',
  "logAbyssSpineResolved(data, skinName, '<setup-pose>', assetLabel)",
  '已显示静态骨骼首帧',
  'resolveAbyssSpineSkinName(data, preferredSkin)',
  'resolveAbyssSpineAnimationName(data, preferredIdleAnimation)',
  'resolveAbyssSpineAnimationName(data, preferredIntroAnimation)',
  'skeleton.setSlotsToSetupPose()',
  'skeleton.setAnimation(0, introAnimation, false)',
  'skeleton.addAnimation(0, idleAnimation, true, 0)',
  'skeleton.setAnimation(0, idleAnimation, true)',
  'logAbyssSpineResolved(data, skinName, idleAnimation, assetLabel)',
  'openGachaMockResultScene(mode)',
  'GachaResultSceneRoot',
  'GachaResultScenePanel',
  'GachaResultSceneNoWriteNote',
  'GachaResultSceneConfirmButton',
  '本地结果预览：不扣资源、不发英雄、不写入抽卡记录或保底。',
  '真实单抽、十连、兑换、补发全部关闭',
  'root.addComponent(BlockInputEvents);',
  '未扣资源、未写入抽卡记录、未发放英雄、未更新保底',
];

for (const token of requiredGachaRendererTokens) {
  if (!gachaSceneRenderer.includes(token)) {
    console.error(`missing gacha result preview safeguard in ${gachaSceneRendererPath}: ${token}`);
    ok = false;
  }
}

const forbiddenGachaRendererTokens = [
  'rgba(103, 0, 16, 34)',
  'rgba(225, 48, 58, 76)',
  'rgba(115, 8, 16, 42)',
  'rgba(236, 46, 55, 92)',
  'GachaApi',
  'this.api.gacha',
  'lootChainApi.gacha',
  '/api/player/gacha/draw',
  '/api/player/gacha/exchange',
  '/api/player/gacha/reissue',
  "request('POST'",
  'request("POST"',
];

for (const token of forbiddenGachaRendererTokens) {
  if (gachaSceneRenderer.includes(token)) {
    console.error(`gacha renderer must remain frontend-only in ${gachaSceneRendererPath}: ${token}`);
    ok = false;
  }
}

const requiredProtagonistRendererTokens = [
  'export class ProtagonistCreateRenderer',
  'export interface ProtagonistCreateRendererHost',
  'PROTAGONIST_ART_ASSETS',
  "male: 'ui/protagonist/protagonist_male_attack/spriteFrame'",
  "female: 'ui/protagonist/protagonist_female_attack/spriteFrame'",
  'addSprite(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null;',
  'renderCharacterArt(parent: Node, gender: ProtagonistGender',
  'ProtagonistCreateBackdrop',
  'ProtagonistCreatePanel',
  'drawFullSceneFrame(scene, metrics.panelWidth, metrics.panelHeight, metrics.scale)',
  'scene.addComponent(BlockInputEvents);',
  'ProtagonistGenderCard_${gender}',
  'ProtagonistFormPreview',
  'SSR 主角',
  '攻击形态',
  '角色名',
  '进入游戏',
  'createButton.interactable = !state.creating;',
  'setProtagonistNameInput(input)',
  'selectProtagonistGender(gender)',
  'previewProtagonistForm(form)',
  'submitProtagonistCreate()',
  'resolveMetrics(layout: UiLayout): ProtagonistMetrics',
  'private isDenseCompact(metrics: ProtagonistMetrics): boolean',
  'ProtagonistDenseForm_${form}',
  'layout.safeWidth - 16',
  'layout.safeHeight - 12',
];

for (const token of requiredProtagonistRendererTokens) {
  if (!protagonistRenderer.includes(token)) {
    console.error(`missing protagonist renderer safeguard in ${protagonistRendererPath}: ${token}`);
    ok = false;
  }
}

const requiredProtagonistTypeTokens = [
  "export type ProtagonistGender = 'male' | 'female';",
  "export type ProtagonistForm = 'attack' | 'defense' | 'support';",
  'export interface ProtagonistLocalProfile',
  "rarity: 'SSR';",
  'export const PROTAGONIST_FORM_OPTIONS',
  "code: 'attack'",
  "code: 'defense'",
  "code: 'support'",
  '攻击形态',
  '防御形态',
  '辅助形态',
  '主线剧情后解锁',
  'unlocked: false',
];

for (const token of requiredProtagonistTypeTokens) {
  if (!protagonistTypes.includes(token)) {
    console.error(`missing protagonist type safeguard in ${protagonistTypesPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyBackgroundTokens = [
  'export class LobbyBackgroundController',
  'export interface LobbyBackgroundHost',
  "export const LOBBY_VIDEO_PATH = 'lobby/lobby_bg_loop';",
  "export const LOBBY_POSTER_PATH = 'lobby/lobby_bg_poster';",
  'export const USE_LOBBY_NATIVE_VIDEO_BACKGROUND = true;',
  'const LOBBY_POSTER_FADE_DURATION = 0.4;',
  'setResources(posterFrame: SpriteFrame | null, videoClip: VideoClip | null): void',
  'render(layout: UiLayout): void',
  'isRendered(): boolean',
  'resize(layout: UiLayout): void',
  'tryPlay(): void',
  'update(deltaTime: number): void',
  'release(): void',
  'private resizeNode(node: Node | null, width: number, height: number): void',
  'private destroyNode(node: Node | null): void',
  'renderedPosterFrame',
  'renderedVideoClip',
  'this.host.isLobbyViewActive()',
  'this.host.scheduleOnce(() => this.tryPlay(), 0.1);',
  'if (!this.posterHidden) {',
  'VideoPlayer.EventType.READY_TO_PLAY',
  'VideoPlayer.EventType.PLAYING',
  'VideoPlayer.EventType.COMPLETED',
  'VideoPlayer.EventType.ERROR',
  'video.mute = true;',
  'video.volume = 0;',
  'video.loop = true;',
  'video.playOnAwake = false;',
  'video.fullScreenOnAwake = false;',
  'video.keepAspectRatio = false;',
  'video.stayOnBottom = true;',
  "this.host.addRect('Lobby_BG_Fallback'",
  "this.host.createUiNode('Lobby_BG_Poster')",
  "this.host.createUiNode('Lobby_BG_Video')",
];

for (const token of requiredLobbyBackgroundTokens) {
  if (!lobbyBackground.includes(token)) {
    console.error(`missing lobby background module safeguard in ${lobbyBackgroundPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyAvatarTokens = [
  'export class LobbyAvatarRenderer',
  'export interface LobbyAvatarHost',
  "import { safeText } from '../UiTextFormatter';",
  "const avatarNode = new Node('LobbyPlayerAvatar');",
  'private drawAvatarFrameOrnaments(graphics: Graphics, size: number): void',
  'private drawArmoredAvatarPortrait(graphics: Graphics, size: number): void',
  'AvatarCrestLetter',
  "const crest = safeText(displayName).slice(0, 1).toUpperCase() || 'L';",
  'this.host.addChildLabel(avatarNode',
];

for (const token of requiredLobbyAvatarTokens) {
  if (!lobbyAvatar.includes(token)) {
    console.error(`missing lobby avatar module safeguard in ${lobbyAvatarPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyHudTokens = [
  'export class LobbyHudRenderer',
  'render(layout: UiLayout): void',
  "from './LobbyHudConfig';",
  "from './LobbyHudLayout';",
  "from './LobbyHudTypes';",
  "import { LobbyTopHudRenderer } from './LobbyTopHudRenderer';",
  'private readonly topHudRenderer: LobbyTopHudRenderer;',
  'this.topHudRenderer = new LobbyTopHudRenderer(host);',
  'this.topHudRenderer.render(layout);',
  'private renderLobbyAtmosphere(layout: UiLayout): void',
  'private renderLobbyActivityRail(layout: UiLayout): void',
  'private renderLobbySceneHotspots(layout: UiLayout): void',
  'private renderLobbyGoalTracker(layout: UiLayout): void',
  'private renderCompactGoalTracker(layout: UiLayout): void',
  'private renderMicroGoalChip(layout: UiLayout, unit: number): void',
  'private renderLobbyChallengeRail(layout: UiLayout): void',
  'private renderLobbyBottomHud(layout: UiLayout): void',
  'private showUnopenedFeature(title: string, detail?: string): void',
  'this.openLobbyPlaceholderDialog(title, detail);',
  'private openLobbyNoticePanel(): void',
  'private openLobbyHeroRosterPanel(): void',
  'private openLobbyAdventurePanel(): void',
  "this.showUnopenedFeature('世界聊天'",
  'private resolveLobbyPlayerInfoLayout(layout: UiLayout): LobbyPlayerInfoLayout',
  'private addLobbyHotspotHitArea(parent: Node, label: string',
  'private addLobbyHotspotPlaque(parent: Node, label: string',
  'private traceLobbyPlaque(graphics: Graphics',
  'private activateLobbyHotspot(parent: Node, label: string',
  'private playLobbyClickEffect(parent: Node, x: number',
  'private addLobbyChallengeCard(parent: Node, title: string',
  'private drawLobbyChallengeRailTrack(graphics: Graphics',
  'private traceLobbyChallengeCard(graphics: Graphics',
  'private addLobbyAdventureButton(parent: Node, x: number',
  'private resolveAdventureCtaText(): string',
  'private resolveLobbyNextGoalView(): LobbyNextGoalView',
  'private resolveLobbyGoalStage(stages: LobbyAdventureStageVO[], preferredStageCode: string | null): LobbyAdventureStageVO | null',
  'private activateLobbyNextGoal(goal: LobbyNextGoalView): void',
  'private addLobbyBottomNav(parent: Node, x: number',
  'private lobbyHudScale(layout: UiLayout): number',
  'private lobbyHudEdgeInset(layout: UiLayout, axis: LobbyHudEdgeAxis, scale: number): number',
  'return resolveHudPlayerInfoLayout(layout);',
  'return resolveLobbyHudScale(layout);',
  'return resolveLobbyHudEdgeInset(layout, axis, scale);',
  'label.enableOutline = true;',
  'LobbyHotspotHitArea_${label}',
  'LobbyClickEffect',
  'LobbyAdventureButton',
  'LobbyChatPreview',
  'LobbyChatChannel',
  'LobbyAtmosphereOverlay',
  'LobbyGoalTracker',
  'LobbyGoalTrackerButton',
  'LobbyCompactGoalTracker',
  'LobbyMicroGoalChip',
  'LobbyCompactSceneEntrances',
  'LobbyCompactSceneEntrance_${label}',
  'private renderCompactSceneEntrances(layout: UiLayout): void',
  'LobbyCompactActionEntrances',
  'LobbyCompactAction_${label}',
  'private renderCompactActionEntrances(layout: UiLayout): void',
  'private compactActionEntries(): Array<{ label: string; detail: string; notice?: boolean; codex?: boolean; heroRoster?: boolean; adventure?: boolean; gacha?: boolean }>',
  'private filterCompactActionEntries(',
  'private drawCompactActionPanel(graphics: Graphics',
  'private addCompactActionEntrance(parent: Node, label: string',
  'this.openLobbyHeroRosterPanel();',
  'this.openLobbyAdventurePanel();',
  'private drawLobbyBottomPlatform(graphics: Graphics, width: number, height: number, scale: number): void',
  'private drawLobbyBottomPlatformStep(graphics: Graphics',
  'private drawLobbyNavSlot(graphics: Graphics, width: number, height: number, scale: number, hot: boolean): void',
  'LobbyActivityPreviewBadge',
  'LobbyChallengePreviewBadge',
];

for (const token of requiredLobbyHudTokens) {
  if (!lobbyHud.includes(token)) {
    console.error(`missing lobby HUD module safeguard in ${lobbyHudPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyTopHudTokens = [
  'export class LobbyTopHudRenderer',
  'render(layout: UiLayout): void',
  "import { LOBBY_SYSTEM_ICONS } from './LobbyHudConfig';",
  "from './LobbyHudLayout';",
  "from './LobbyHudTypes';",
  'private renderPlayerInfo(layout: UiLayout): void',
  'private renderResourceBar(layout: UiLayout): void',
  'private renderSystemIcons(layout: UiLayout): void',
  'private openLobbyPlaceholderDialog(title: string, detail?: string): void',
  'private systemIconTitle(key: LobbySystemIconKey): string',
  'private resourcePlaceholderDetail(item: LobbyResourceItem): string',
  'private resourceItems(profile: PlayerLobbyProfileVO): LobbyResourceItem[]',
  'private addResourceGlyph(',
  'private addSystemIcon(parent: Node, key: LobbySystemIconKey',
  'private drawPlayerInfoFallbackFrame(parent: Node, width: number, height: number, scale: number): void',
  'private addNameSigil(parent: Node, x: number, y: number, scale: number): void',
  'private addDisabledPlus(parent: Node',
  'resolveLobbyPlayerInfoLayout(layout)',
  'this.applyImageButtonFeedback(panel, 1.006, 0.994);',
  'nameLabel.overflow = Label.Overflow.SHRINK;',
  'levelLabel.overflow = Label.Overflow.SHRINK;',
  'LobbyPlayerInfoArt',
  'LobbyPlayerName',
  'LobbyPlayerLevel',
  'LobbyPlayerPower',
  'LobbyPlayerExpBadge',
  'LobbyResourceItem_${item.key}',
  'LobbyCompactStaminaChip',
  'private renderCompactStaminaChip(',
  'private drawResourceCapsule(graphics: Graphics, width: number, height: number, scale: number): void',
  '资源：${item.label}',
  '该资源当前为大厅视觉占位',
  'LobbyResourceValue_${item.key}',
  "value: '未开放'",
  'LobbySystemIcon_${key}',
];

for (const token of requiredLobbyTopHudTokens) {
  if (!lobbyTopHud.includes(token)) {
    console.error(`missing lobby top HUD module safeguard in ${lobbyTopHudPath}: ${token}`);
    ok = false;
  }
}

const forbiddenLobbyHudTopRendererTokens = [
  'private renderPlayerInfo(layout: UiLayout): void',
  'private renderResourceBar(layout: UiLayout): void',
  'private renderSystemIcons(layout: UiLayout): void',
  'private addResourceGlyph(',
  'private addSystemIcon(parent: Node, key: LobbySystemIconKey',
  'LobbyPlayerInfoArt',
  'LobbyResourceValue_${item.key}',
  'LobbySystemIcon_${key}',
];

for (const token of forbiddenLobbyHudTopRendererTokens) {
  if (lobbyHud.includes(token)) {
    console.error(`lobby top HUD implementation must live in ${lobbyTopHudPath}, not ${lobbyHudPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyHudLayoutTokens = [
  'export function lobbyHudScale(layout: UiLayout): number',
  'export function lobbyHudEdgeInset(layout: UiLayout, axis: LobbyHudEdgeAxis, scale: number): number',
  'export function resolveLobbyPlayerInfoLayout(layout: UiLayout): LobbyPlayerInfoLayout',
  'return clamp(layout.uiScale, 0.62, 1);',
  'return clamp(safeInset * 0.38, minInset, maxInset);',
  'clamp(layout.stageWidth * 0.28, 420 * baseHudScale, 540 * baseHudScale)',
  'width = height * LOBBY_PLAYER_INFO_PANEL_ASPECT;',
];

for (const token of requiredLobbyHudLayoutTokens) {
  if (!lobbyHudLayout.includes(token)) {
    console.error(`missing lobby HUD layout safeguard in ${lobbyHudLayoutPath}: ${token}`);
    ok = false;
  }
}

const forbiddenLobbyHudRendererLayoutTokens = [
  'clamp(layout.stageWidth * 0.28',
  'return clamp(layout.uiScale, 0.62, 1);',
  'safeInset * 0.38',
];

for (const token of forbiddenLobbyHudRendererLayoutTokens) {
  if (lobbyHud.includes(token)) {
    console.error(`lobby HUD layout formula must live in ${lobbyHudLayoutPath}, not ${lobbyHudPath}: ${token}`);
    ok = false;
  }
}

const forbiddenLobbyRendererRuntimeTokens = [
  'this.api',
  'lootChainApi',
  'currentView =',
  'enterLobbyView',
  'renderLoading',
  'renderLobby(',
  '/api/player',
  '/draw',
  '/claim',
  '/purchase',
  '/withdraw',
];

for (const token of forbiddenLobbyRendererRuntimeTokens) {
  for (const source of [
    { path: lobbyHudPath, text: lobbyHud },
    { path: lobbyTopHudPath, text: lobbyTopHud },
  ]) {
    if (source.text.includes(token)) {
      console.error(`lobby HUD renderers must remain local placeholder UI in ${source.path}: ${token}`);
      ok = false;
    }
  }
}

function assertClickContract(sourcePath, sourceText, allowedExceptions) {
  const matches = Array.from(sourceText.matchAll(/node\.on\(Button\.EventType\.CLICK,[\s\S]{0,180}/g));
  for (const match of matches) {
    const snippet = match[0];
    const allowed = snippet.includes('showUnopenedFeature') ||
      snippet.includes('openLobbyPlaceholderDialog') ||
      allowedExceptions.some((exception) => snippet.includes(exception));
    if (!allowed) {
      console.error(`unexpected lobby click contract in ${sourcePath}: ${snippet.replace(/\s+/g, ' ')}`);
      ok = false;
    }
  }
}

assertClickContract(lobbyHudPath, lobbyHud, ['activateLobbyHotspot', 'activateLobbyNextGoal', 'openLobbyNoticePanel', 'openLobbyCodexPanel', 'openLobbyHeroRosterPanel', 'openLobbyAdventurePanel', 'openLobbyGachaScene', 'openPlayerProfileDialog']);
assertClickContract(lobbyTopHudPath, lobbyTopHud, ['openPlayerProfileDialog']);

function assertMethodExcludes(sourcePath, sourceText, signature, forbiddenTokens, reason) {
  const body = extractMethodBody(sourceText, signature);
  if (!body) {
    console.error(`missing method for guard in ${sourcePath}: ${signature}`);
    ok = false;
    return;
  }
  for (const token of forbiddenTokens) {
    if (body.includes(token)) {
      console.error(`${signature} ${reason}: ${token}`);
      ok = false;
    }
  }
}

function assertContainsOrder(sourcePath, sourceText, signature, orderedTokens, reason) {
  const body = extractMethodBody(sourceText, signature);
  if (!body) {
    console.error(`missing method for order guard in ${sourcePath}: ${signature}`);
    ok = false;
    return;
  }
  let cursor = -1;
  for (const token of orderedTokens) {
    const index = body.indexOf(token);
    if (index < 0) {
      console.error(`${signature} missing ordered token for ${reason}: ${token}`);
      ok = false;
      return;
    }
    if (index <= cursor) {
      console.error(`${signature} order guard failed for ${reason}: ${token}`);
      ok = false;
      return;
    }
    cursor = index;
  }
}

function extractMethodBody(sourceText, signature) {
  const start = sourceText.indexOf(signature);
  if (start < 0) {
    return '';
  }
  const open = sourceText.indexOf('{', start);
  if (open < 0) {
    return '';
  }
  let depth = 0;
  for (let index = open; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return sourceText.slice(open, index + 1);
      }
    }
  }
  return '';
}

assertMethodExcludes(
  lobbyHudPath,
  lobbyHud,
  'private activateLobbyHotspot(parent: Node, label: string, x: number, y: number, scale: number): void',
  ['this.api', 'lootChainApi', '/api/', 'renderLobby', 'startLobbyLoading', 'claim', 'purchase', 'withdraw', 'draw'],
  'must stay local placeholder-only',
);

for (const signature of [
  'private refreshLobbyOverlay(): void',
  'private refreshLobbyViewPreservingBackground(): void',
]) {
  assertContainsOrder(
    gameRootPath,
    gameRoot,
    signature,
    ['this.resizeLobbyBackground(layout);', 'this.rerenderLobbyOverlay(layout);'],
    'lobby background preserve path',
  );
  assertMethodExcludes(
    gameRootPath,
    gameRoot,
    signature,
    ['this.renderBase()', 'this.renderLobbyBackground(layout)', 'this.contentRootController.clear()', 'this.lobbyBackgroundController.release()'],
    'must preserve existing lobby background',
  );
}

assertContainsOrder(
  gameRootPath,
  gameRoot,
  'private renderLobby(): void',
  ['this.renderLobbyBackground(layout);', 'this.renderLobbyHud(layout);'],
  'lobby background must render before HUD',
);

assertContainsOrder(
  gameRootPath,
  gameRoot,
  'private renderLobbyScenePage(): void',
  ['const layout = this.renderBase();', 'this.renderLobbyFeatureSceneBackdrop(layout);'],
  'lobby scene pages must switch to an independent full-screen scene backdrop',
);

assertMethodExcludes(
  gameRootPath,
  gameRoot,
  'private renderLobbyWorldBase(): UiLayout',
  ['this.releaseLobbyVideoRuntime()', 'this.lobbyBackgroundController.release()', 'this.contentRootController.clear();'],
  'lobby scene pages must not release or clear the live lobby background',
);

assertMethodExcludes(
  gameRootPath,
  gameRoot,
  'private returnToLobbyFromScenePage(): void',
  ['this.renderLobby();'],
  'returning from scene pages must preserve the live lobby background',
);

const devLoginBody = extractMethodBody(authApi, 'async devLogin(userId: number): Promise<PlayerTokenVO>');
if (!devLoginBody || devLoginBody.includes('tokenStore.save') || devLoginBody.includes('.save(token)')) {
  console.error(`devLogin must not save token before LoginFlow stale-ticket validation in ${authApiPath}`);
  ok = false;
}
if (!authApi.includes('saveToken(token: PlayerTokenVO): void')) {
  console.error(`missing stale-safe saveToken method in ${authApiPath}`);
  ok = false;
}

const resourceItemsBody = extractMethodBody(lobbyTopHud, 'private resourceItems(profile: PlayerLobbyProfileVO): LobbyResourceItem[]');
if (!resourceItemsBody.includes('profile.stamina') || !resourceItemsBody.includes('profile.maxStamina')) {
  console.error('resourceItems must keep stamina/maxStamina as the only profile-backed top resource');
  ok = false;
}
let resourceKeyCursor = -1;
for (const token of ["key: 'stamina'", "key: 'coin'", "key: 'ruby'", "key: 'crystal'"]) {
  const index = resourceItemsBody.indexOf(token);
  if (index < 0 || index <= resourceKeyCursor) {
    console.error(`resourceItems must keep fixed readonly order: ${token}`);
    ok = false;
    break;
  }
  resourceKeyCursor = index;
}
const unopenedResourceValues = Array.from(resourceItemsBody.matchAll(/value:\s*'未开放'/g)).length;
if (unopenedResourceValues !== 3) {
  console.error(`coin/ruby/crystal must remain unopened placeholders, got ${unopenedResourceValues} unopened resource values`);
  ok = false;
}
for (const token of ['profile.coin', 'profile.gold', 'profile.ruby', 'profile.crystal', 'profile.usdt', '3,456', '8,888', '2,450']) {
  if (resourceItemsBody.includes(token)) {
    console.error(`non-stamina top resources must stay unopened placeholders: ${token}`);
    ok = false;
  }
}

const disabledPlusBody = extractMethodBody(lobbyTopHud, 'private addDisabledPlus(parent: Node');
const disabledPlusRuntimeBody = disabledPlusBody.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
for (const token of ['Button', '.on(', 'api', '购买', '领取', 'claim', 'purchase']) {
  if (disabledPlusRuntimeBody.includes(token)) {
    console.error(`disabled plus must remain non-interactive placeholder in ${lobbyTopHudPath}: ${token}`);
    ok = false;
  }
}

const forbiddenLobbyLoadingFlowTokens = [
  'lootChainApi',
  'LootChainApi',
  'devLogin',
  'lobbyProfile',
  'this.api.gacha',
  'this.api.hero',
  'this.api.bag',
  '/api/player',
  '/draw',
  '/claim',
  '/purchase',
  '/withdraw',
  'Button',
  'Graphics',
  'Node',
  'UITransform',
];

for (const token of forbiddenLobbyLoadingFlowTokens) {
  if (lobbyLoadingFlow.includes(token)) {
    console.error(`forbidden lobby loading flow responsibility in ${lobbyLoadingFlowPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyLoadingFlowTokens = [
  'export class LobbyLoadingFlow',
  'export interface LobbyLoadingFlowHost',
  'private readonly resourceLoader = new LobbyResourceLoader();',
  'private loadingTicket = 0;',
  'get state(): LobbyLoadingState',
  'start(tokenName: string): void',
  'retry(tokenName: string): void',
  'cancel(): void',
  'this.resourceLoader.load((progress, message) => this.setLoadingProgress(ticket, progress, message))',
  'this.host.showLobbyLoadingView();',
  'this.host.refreshLobbyLoadingView();',
  'this.host.setLobbyBackgroundResources(loadedResources.posterFrame, loadedResources.videoClip);',
  'this.host.enterLobbyView();',
  'private async setLoadingProgress(ticket: number, progress: number, message: string): Promise<boolean>',
  'private fail(ticket: number, error: unknown): void',
  'private isCurrentTicket(ticket: number): boolean',
  'private delay(ms: number): Promise<void>',
  'PROGRESS_FRAME_DELAY_MS',
];

for (const token of requiredLobbyLoadingFlowTokens) {
  if (!lobbyLoadingFlow.includes(token)) {
    console.error(`missing lobby loading flow safeguard in ${lobbyLoadingFlowPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyLoadingTokens = [
  'export class LobbyLoadingRenderer',
  'export interface LobbyLoadingHost',
  'export interface LobbyLoadingState',
  "this.host.addRect('LoadingMask'",
  "this.host.addBeveledPanel('LoadingPanel'",
  "'资源加载中'",
  'state.error || state.message',
  'this.host.addProgressBar(',
  "this.host.addGoldButton('重试加载'",
  'this.host.retryLobbyLoading()',
  'clamp(state.progress, 0, 1)',
];

for (const token of requiredLobbyLoadingTokens) {
  if (!lobbyLoading.includes(token)) {
    console.error(`missing lobby loading module safeguard in ${lobbyLoadingPath}: ${token}`);
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
  'currentLobbyAdventureState(): LobbyAdventurePanelState;',
  'currentLobbyBattleState(): LobbyBattlePanelState;',
  'currentLobbySelectedStageCode(): string;',
  'openLobbyNoticePanel(): void;',
  'openLobbyCodexPanel(): void;',
  'openLobbyHeroRosterPanel(): void;',
  'openLobbyAdventurePanel(): void;',
  'openLobbyPlaceholderDialog(title: string, detail?: string): void;',
  'export class LobbyTopHudRenderer',
  '召唤祭坛',
  '深渊之门',
  '战役',
  '商店',
  '预览中',
  '占位展示',
  '未开放',
  '图鉴',
  'codex?: boolean',
  'adventure?: boolean',
];

for (const token of requiredLobbyHudModuleTokens) {
  if (!lobbyHudModule.includes(token)) {
    console.error(`missing lobby HUD module token: ${token}`);
    ok = false;
  }
}

const requiredLobbyProfileDialogTokens = [
  'export class LobbyProfileDialogRenderer',
  'export interface LobbyProfileDialogHost',
  "import { safeText } from '../UiTextFormatter';",
  'render(layout: UiLayout): void',
  'LobbyProfileSceneRoot',
  'LobbyProfileSceneContent',
  'sceneRoot.addComponent(BlockInputEvents);',
  'layout.stageWidth',
  'layout.stageHeight',
  'panel.addComponent(BlockInputEvents);',
  'LobbyProfileBackButton',
  'renderSceneBackButton(this.host, panel, layout',
  'LobbyProfileTitle',
  'LobbyProfileName',
  'LobbyProfileSubline',
  'LobbyProfileStatus',
  'LobbyProfileReadonlyNote',
  'private profileDialogScale(layout: UiLayout): number',
  'private isNarrowProfileDialog(panelWidth: number, scale: number): boolean',
  'private addProfileRow(parent: Node, label: string',
  '主线进度',
  '圣契旅者',
  'const visibleRows = Math.max(4',
  'private profileStatusText(profile: PlayerLobbyProfileVO): string',
  'private maskWalletAddress(address?: string | null): string',
  "const clean = safeText(address || '');",
  "const LOBBY_PROFILE_SERVER_NAME = '本地开发服';",
  "const LOBBY_PROFILE_PLACEHOLDER = '-';",
  'this.host.closePlayerProfileDialog()',
  'this.host.isLobbyProfileLoading()',
  'this.host.getLobbyProfileError()',
];

for (const token of requiredLobbyProfileDialogTokens) {
  if (!lobbyProfileDialog.includes(token)) {
    console.error(`missing lobby profile dialog module safeguard in ${lobbyProfileDialogPath}: ${token}`);
    ok = false;
  }
}

const forbiddenLobbyProfileLoaderTokens = [
  'lootChainApi',
  'LootChainApi',
  'devLogin',
  'this.api.gacha',
  'this.api.hero',
  'this.api.bag',
  '/draw',
  '/claim',
  '/purchase',
  '/withdraw',
  'Button',
  'Graphics',
  'Node',
  'UITransform',
  'renderLobby(',
];

for (const token of forbiddenLobbyProfileLoaderTokens) {
  if (lobbyProfileLoader.includes(token)) {
    console.error(`forbidden lobby profile loader responsibility in ${lobbyProfileLoaderPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyProfileLoaderTokens = [
  'export class LobbyProfileLoader',
  'export interface LobbyProfileLoaderHost',
  'private readonly profileState: LobbyProfileState;',
  'new LobbyProfileState(defaultUserId)',
  'get loading(): boolean',
  'get error(): string',
  'resetForLogin(userId: number): void',
  'cancel(): void',
  'currentProfile(): PlayerLobbyProfileVO',
  'load(userId: number): Promise<void>',
  'private loadTicket = 0;',
  'const ticket = this.nextTicket();',
  'this.isCurrentRequest(ticket, userId)',
  'this.profileState.startLoading();',
  'this.profileApi.lobbyProfile()',
  'this.profileState.applyLoadedProfile(userId, profile)',
  'this.profileState.applyLoadError(userId, error)',
  'this.profileState.finishLoading(userId)',
  'this.host.isLobbyViewActive()',
  'this.host.refreshLobbyOverlay();',
  "console.warn('[LootChain] lobby profile load failed:'",
];

for (const token of requiredLobbyProfileLoaderTokens) {
  if (!lobbyProfileLoader.includes(token)) {
    console.error(`missing lobby profile loader safeguard in ${lobbyProfileLoaderPath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyProfileStateTokens = [
  'export class LobbyProfileState',
  "import { positiveInteger, safeText } from '../UiTextFormatter';",
  'resetForLogin(userId: number): void',
  'startLoading(): void',
  'applyLoadedProfile(userId: number, profile: PlayerLobbyProfileVO): boolean',
  'applyLoadError(userId: number, error: unknown): boolean',
  'finishLoading(userId: number): boolean',
  'isCurrentUser(userId: number): boolean',
  'currentProfile(): PlayerLobbyProfileVO',
  "this.profileError = '资料账号不匹配';",
  'private fallback(): PlayerLobbyProfileVO',
  'private normalize(profile: PlayerLobbyProfileVO): PlayerLobbyProfileVO',
  "accountStatus: this.profileError ? '资料占位' : '读取中'",
  "loginMethod: 'dev-login'",
  "safeText(profile.accountStatus || '未知')",
  "safeText(profile.loginMethod || 'dev-login')",
  'positiveInteger(profile.playerLevel, 1)',
];

for (const token of requiredLobbyProfileStateTokens) {
  if (!lobbyProfileState.includes(token)) {
    console.error(`missing lobby profile state safeguard in ${lobbyProfileStatePath}: ${token}`);
    ok = false;
  }
}

const requiredLobbyResourceLoaderTokens = [
  'export class LobbyResourceLoader',
  'export interface LobbyResourceLoadResult',
  'export type LobbyResourceProgressReporter',
  'LOBBY_POSTER_PATH',
  'LOBBY_VIDEO_PATH',
  'USE_LOBBY_NATIVE_VIDEO_BACKGROUND',
  'load(progress: LobbyResourceProgressReporter): Promise<LobbyResourceLoadResult | null>',
  'private loadVideoClipResource(path: string): Promise<VideoClip>',
  'private loadSpriteFrameResource(path: string): Promise<SpriteFrame>',
  'resources.load(path, VideoClip',
  'resources.load(`${path}/spriteFrame`, SpriteFrame',
  'sprite frame not found: ${path}',
  'progress(0.16,',
  'progress(0.48,',
  'progress(0.82,',
];

for (const token of requiredLobbyResourceLoaderTokens) {
  if (!lobbyResourceLoader.includes(token)) {
    console.error(`missing lobby resource loader safeguard in ${lobbyResourceLoaderPath}: ${token}`);
    ok = false;
  }
}

for (const token of ['Texture2D', 'new SpriteFrame()', '${path}/texture']) {
  if (lobbyResourceLoader.includes(token)) {
    console.error(`lobby background resource loader must hard-fail missing spriteFrame in ${lobbyResourceLoaderPath}: ${token}`);
    ok = false;
  }
}

if (!profileApi.includes("'/api/player/me/lobby'")) {
  console.error(`missing read-only lobby profile endpoint in ${profileApiPath}`);
  ok = false;
}

const forbiddenProfileApiWriteTokens = [
  '.post<',
  '.put<',
  '.patch<',
  '.delete<',
  '.post(',
  '.put(',
  '.patch(',
  '.delete(',
];

for (const token of forbiddenProfileApiWriteTokens) {
  if (profileApi.includes(token)) {
    console.error(`profile API must remain read-only in ${profileApiPath}: ${token}`);
    ok = false;
  }
}

if (!profileApi.includes("return this.http.get<PlayerLobbyProfileVO>('/api/player/me/lobby');")) {
  console.error(`profile API must use exact read-only lobby endpoint in ${profileApiPath}`);
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

function readJpgDimensions(filePath) {
  const bytes = readFileSync(filePath);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    console.error(`invalid jpg signature: ${filePath}`);
    ok = false;
    return { width: 0, height: 0 };
  }
  let offset = 2;
  while (offset < bytes.length) {
    while (bytes[offset] === 0xff) {
      offset += 1;
    }
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) {
      break;
    }
    if (offset + 2 > bytes.length) {
      break;
    }
    const segmentLength = bytes.readUInt16BE(offset);
    const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    if (sofMarkers.has(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }
  console.error(`jpg dimensions not found: ${filePath}`);
  ok = false;
  return { width: 0, height: 0 };
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

function assertLobbyPosterSpriteFrameAsset() {
  const dimensions = readJpgDimensions(lobbyPosterAssetPath);
  if (dimensions.width !== 3840 || dimensions.height !== 2160) {
    console.error(`lobby poster must remain the 16:9 3840x2160 background, got ${dimensions.width}x${dimensions.height}`);
    ok = false;
  }

  let meta = null;
  try {
    meta = JSON.parse(readFileSync(lobbyPosterMetaPath, 'utf8'));
  } catch (error) {
    console.error(`invalid json: ${lobbyPosterMetaPath}`);
    console.error(error instanceof Error ? error.message : String(error));
    ok = false;
    return;
  }

  const spriteMeta = meta?.subMetas?.f9941?.userData;
  if (meta?.userData?.type !== 'sprite-frame' || !spriteMeta) {
    console.error(`lobby poster must import as sprite-frame so resources.load('lobby/lobby_bg_poster/spriteFrame') works`);
    ok = false;
    return;
  }

  const expected = {
    width: 3840,
    height: 2160,
    rawWidth: 3840,
    rawHeight: 2160,
    trimX: 0,
    trimY: 0,
    offsetX: 0,
    offsetY: 0,
  };

  for (const [key, value] of Object.entries(expected)) {
    if (spriteMeta[key] !== value) {
      console.error(`lobby poster spriteFrame meta ${key} expected ${value}, got ${spriteMeta[key]}`);
      ok = false;
    }
  }
}

assertLobbyPosterSpriteFrameAsset();

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
  'private openLobbyPlaceholderDialog(title: string, detail?: string): void',
  'private closeLobbyPlaceholderDialog(): void',
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

function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
}

function assertNoOverlap(name, a, b) {
  if (rectsOverlap(a, b)) {
    console.error(`${name} overlap: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
    ok = false;
  }
}

function localRect(centerX, centerY, width, height) {
  return {
    left: centerX - width / 2,
    right: centerX + width / 2,
    top: centerY + height / 2,
    bottom: centerY - height / 2,
  };
}

function assertInsideLocalRect(name, inner, outer) {
  const tolerance = 0.01;
  if (inner.left < outer.left - tolerance || inner.right > outer.right + tolerance || inner.top > outer.top + tolerance || inner.bottom < outer.bottom - tolerance) {
    console.error(`${name} outside local rect: inner=${JSON.stringify(inner)}, outer=${JSON.stringify(outer)}`);
    ok = false;
  }
}

function resolveAdaptiveLayout(visibleWidth, visibleHeight, stageSize, stageScale, stagePosition, runtimeWidth = visibleWidth, runtimeHeight = visibleHeight) {
  const width = Math.max(320, visibleWidth);
  const height = Math.max(180, visibleHeight);
  const viewportWidth = Math.max(320, runtimeWidth);
  const viewportHeight = Math.max(180, runtimeHeight);
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
    viewportWidth,
    viewportHeight,
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

function parseObjectArrayBlock(sourceText, exportName) {
  const marker = `export const ${exportName}`;
  const start = sourceText.indexOf(marker);
  if (start < 0) {
    return [];
  }
  const assignment = sourceText.indexOf('=', start);
  const open = assignment >= 0 ? sourceText.indexOf('[', assignment) : -1;
  if (open < 0) {
    return [];
  }
  let depth = 0;
  for (let index = open; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === '[') {
      depth += 1;
    } else if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return Array.from(sourceText.slice(open, index + 1).matchAll(/\{([^}]+)\}/g)).map((match) => match[1]);
      }
    }
  }
  return [];
}

function parseNumberField(objectText, field) {
  const match = objectText.match(new RegExp(`${field}:\\s*([0-9.]+)`));
  return match ? Number(match[1]) : Number.NaN;
}

function parseStringField(objectText, field) {
  const match = objectText.match(new RegExp(`${field}:\\s*'([^']+)'`));
  return match ? match[1] : '';
}

const hotspotObjects = parseObjectArrayBlock(lobbyHudConfig, 'LOBBY_SCENE_HOTSPOTS');
if (hotspotObjects.length !== 8) {
  console.error(`LOBBY_SCENE_HOTSPOTS must keep 8 local placeholder entries, got ${hotspotObjects.length}`);
  ok = false;
}
for (const objectText of hotspotObjects) {
  const label = parseStringField(objectText, 'label') || 'unknown';
  if (/\bhot:\s*true\b/.test(objectText)) {
    console.error(`hotspot ${label} is still marked hot while lobby entries are placeholder-only`);
    ok = false;
  }
  for (const field of ['x', 'y', 'hitX', 'hitY', 'hitW', 'hitH']) {
    const value = parseNumberField(objectText, field);
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      console.error(`invalid hotspot ${label}.${field}: ${value}`);
      ok = false;
    }
  }
  const hitX = parseNumberField(objectText, 'hitX');
  const hitY = parseNumberField(objectText, 'hitY');
  const hitW = parseNumberField(objectText, 'hitW');
  const hitH = parseNumberField(objectText, 'hitH');
  const width = parseNumberField(objectText, 'width');
  if (!(width > 0) || !(hitW > 0) || !(hitH > 0) || hitX - hitW / 2 < 0 || hitX + hitW / 2 > 1 || hitY - hitH / 2 < 0 || hitY + hitH / 2 > 1) {
    console.error(`hotspot hit area out of normalized bounds: ${label}`);
    ok = false;
  }
}

if (/\bhot:\s*true\b/.test(lobbyHudConfig)) {
  console.error('lobby HUD config must not show red-dot urgency while entries are unopened placeholders');
  ok = false;
}

for (const token of ['api', '/api/', 'resources.load', 'Button', 'Node', 'purchase', 'claim', 'withdraw', 'draw']) {
  if (lobbyHudConfig.includes(token)) {
    console.error(`lobby HUD config must stay data-only and placeholder-safe: ${token}`);
    ok = false;
  }
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

  const loginPagePadding = Math.max(18 * layout.uiScale, Math.min(36 * layout.uiScale, layout.safeWidth * 0.03));
  const dialogWidth = Math.max(320 * layout.uiScale, layout.safeWidth - loginPagePadding * 2);
  const dialogHeight = Math.max(560 * layout.uiScale, layout.safeHeight - loginPagePadding * 2);
  const dialogY = centerY;
  assertInsideStage(`${name}:LoginAccountScenePanel`, centerX - dialogWidth / 2, centerX + dialogWidth / 2, dialogY + dialogHeight / 2, dialogY - dialogHeight / 2, stage);
  const inputWidth = Math.min(430 * layout.uiScale, dialogWidth - 130 * layout.uiScale);
  const inputFrameWidth = inputWidth + 28;
  const inputFrameHeight = layout.inputHeight + 8;
  const accountInputY = dialogY + 98 * layout.uiScale;
  const passwordInputY = dialogY + 8 * layout.uiScale;
  assertInsideStage(`${name}:LoginAccountInput`, centerX - inputFrameWidth / 2, centerX + inputFrameWidth / 2, accountInputY + inputFrameHeight / 2, accountInputY - inputFrameHeight / 2, stage);
  assertInsideStage(`${name}:LoginPasswordInput`, centerX - inputFrameWidth / 2, centerX + inputFrameWidth / 2, passwordInputY + inputFrameHeight / 2, passwordInputY - inputFrameHeight / 2, stage);
  const enterWidth = Math.min(360 * layout.uiScale, inputWidth);
  const enterHeight = 54 * layout.uiScale;
  const enterY = dialogY - 70 * layout.uiScale;
  assertInsideStage(`${name}:LoginEnterButton`, centerX - enterWidth / 2, centerX + enterWidth / 2, enterY + enterHeight / 2, enterY - enterHeight / 2, stage);
  const thirdPartyY = dialogY - 170 * layout.uiScale;
  const diamondSize = 48 * layout.uiScale;
  const thirdPartyGap = 68 * layout.uiScale;
  for (let index = 0; index < 4; index += 1) {
    const diamondX = centerX + (index - 1.5) * thirdPartyGap;
    assertInsideStage(`${name}:LoginThirdParty${index + 1}`, diamondX - diamondSize / 2, diamondX + diamondSize / 2, thirdPartyY + diamondSize / 2, thirdPartyY - diamondSize / 2, stage);
  }
  const agreementY = dialogY - 226 * layout.uiScale;
  const agreementBoxSize = 24 * layout.uiScale;
  const agreementBoxX = centerX - 152 * layout.uiScale;
  assertInsideStage(`${name}:LoginAgreementCheck`, agreementBoxX - agreementBoxSize / 2, agreementBoxX + agreementBoxSize / 2, agreementY + agreementBoxSize / 2, agreementY - agreementBoxSize / 2, stage);
  const agreementLabelWidth = 430 * layout.uiScale;
  const agreementLabelHeight = 34 * layout.uiScale;
  const agreementLabelX = centerX + 54 * layout.uiScale;
  assertInsideStage(`${name}:LoginAgreementLabel`, agreementLabelX - agreementLabelWidth / 2, agreementLabelX + agreementLabelWidth / 2, agreementY + agreementLabelHeight / 2, agreementY - agreementLabelHeight / 2, stage);
  const backWidth = 92 * layout.uiScale;
  const backHeight = 38 * layout.uiScale;
  const backX = centerX - dialogWidth / 2 + 68 * layout.uiScale;
  const backY = dialogY + dialogHeight / 2 - 42 * layout.uiScale;
  assertInsideStage(`${name}:LoginBackButton`, backX - backWidth / 2, backX + backWidth / 2, backY + backHeight / 2, backY - backHeight / 2, stage);

  const loadingWidth = Math.min(660 * layout.uiScale, layout.contentWidth * 0.72);
  const loadingHeight = 260 * layout.uiScale;
  const loadingY = centerY - 12 * layout.uiScale;
  assertInsideStage(`${name}:LoadingPanel`, centerX - loadingWidth / 2, centerX + loadingWidth / 2, loadingY + loadingHeight / 2, loadingY - loadingHeight / 2, stage);
}

function assertProtagonistCreateBounds(layout, name) {
  const stage = stageBox(layout);
  const centerX = (layout.safeLeft + layout.safeRight) / 2;
  const centerY = (layout.safeTop + layout.safeBottom) / 2;
  const rawScale = Math.min(layout.safeWidth / 1520, layout.safeHeight / 860);
  const scale = clamp(rawScale, 0.34, 1);
  const panelWidth = Math.max(320 * scale, layout.safeWidth - 16 * scale);
  const panelHeight = Math.max(180 * scale, layout.safeHeight - 12 * scale);
  assertInsideStage(`${name}:ProtagonistCreatePanel`, centerX - panelWidth / 2, centerX + panelWidth / 2, centerY + panelHeight / 2, centerY - panelHeight / 2, stage);
  assertInsideStage(`${name}:ProtagonistCreateBackdrop`, layout.stageLeft, layout.stageRight, layout.stageTop, layout.stageBottom, stage);

  const compact = panelWidth < 720 || panelHeight < 420;
  const dense = compact;
  const cardWidth = compact ? panelWidth * 0.31 : Math.min(panelWidth * 0.22, 330 * scale);
  const cardHeight = compact ? panelHeight * (dense ? 0.34 : 0.4) : Math.min(panelHeight * 0.66, 520 * scale);
  const cardY = centerY + (compact ? panelHeight * (dense ? 0.26 : 0.2) : -panelHeight * 0.01);
  const gap = compact ? panelWidth * 0.1 : Math.max(72 * scale, panelWidth * 0.07);
  const maleLocalX = compact ? -cardWidth / 2 - gap / 2 : -panelWidth * 0.21;
  const femaleLocalX = compact ? cardWidth / 2 + gap / 2 : maleLocalX + cardWidth + gap;
  const maleX = centerX + maleLocalX;
  const femaleX = centerX + femaleLocalX;
  assertInsideStage(`${name}:ProtagonistGenderCard_male`, maleX - cardWidth / 2, maleX + cardWidth / 2, cardY + cardHeight / 2, cardY - cardHeight / 2, stage);
  assertInsideStage(`${name}:ProtagonistGenderCard_female`, femaleX - cardWidth / 2, femaleX + cardWidth / 2, cardY + cardHeight / 2, cardY - cardHeight / 2, stage);

  const formAreaX = centerX + (compact ? 0 : panelWidth * 0.34);
  const formAreaY = centerY + (compact ? -panelHeight * (dense ? 0.08 : 0.14) : 8 * scale);
  const formAreaWidth = compact ? panelWidth * 0.78 : Math.min(panelWidth * 0.26, 440 * scale);
  const formAreaHeight = compact ? panelHeight * (dense ? 0.17 : 0.2) : Math.min(panelHeight * 0.44, 390 * scale);
  assertInsideStage(`${name}:ProtagonistFormPreview`, formAreaX - formAreaWidth / 2, formAreaX + formAreaWidth / 2, formAreaY + formAreaHeight / 2, formAreaY - formAreaHeight / 2, stage);

  const controlX = centerX + (compact ? 0 : panelWidth * 0.34);
  const inputWidth = Math.min(390 * scale, panelWidth * (dense ? 0.62 : 0.28));
  const compactControls = dense || layout.inputHeight > 30 * scale;
  const inputY = centerY - panelHeight / 2 + (dense ? 128 : compactControls ? 132 : 154) * scale;
  const inputFrameWidth = inputWidth + 28;
  const inputFrameHeight = layout.inputHeight + 8;
  assertInsideStage(`${name}:ProtagonistNameInput`, controlX - inputFrameWidth / 2, controlX + inputFrameWidth / 2, inputY + inputFrameHeight / 2, inputY - inputFrameHeight / 2, stage);
  const buttonYOffset = dense ? 20 : compactControls ? 46 : 70;
  const enterWidth = Math.min(360 * scale, panelWidth * (dense ? 0.54 : 0.42));
  const enterHeight = (dense ? 32 : compactControls ? 42 : 54) * scale;
  const enterY = centerY - panelHeight / 2 + buttonYOffset * scale;
  assertInsideStage(`${name}:ProtagonistEnterButton`, controlX - enterWidth / 2, controlX + enterWidth / 2, enterY + enterHeight / 2, enterY - enterHeight / 2, stage);

  const panelLocal = localRect(0, 0, panelWidth, panelHeight);
  const cardLocal = localRect(maleLocalX, compact ? panelHeight * (dense ? 0.26 : 0.2) : -panelHeight * 0.01, cardWidth, cardHeight);
  const femaleCardLocal = localRect(femaleLocalX, compact ? panelHeight * (dense ? 0.26 : 0.2) : -panelHeight * 0.01, cardWidth, cardHeight);
  const formLocal = localRect(compact ? 0 : panelWidth * 0.34, compact ? -panelHeight * (dense ? 0.08 : 0.14) : 8 * scale, formAreaWidth, formAreaHeight);
  const inputLocal = localRect(compact ? 0 : panelWidth * 0.34, -panelHeight / 2 + (dense ? 128 : compactControls ? 132 : 154) * scale, inputFrameWidth, inputFrameHeight);
  const buttonLocal = localRect(compact ? 0 : panelWidth * 0.34, -panelHeight / 2 + buttonYOffset * scale, enterWidth, enterHeight);
  for (const rect of [
    ['card', cardLocal],
    ['femaleCard', femaleCardLocal],
    ['form', formLocal],
    ['input', inputLocal],
    ['button', buttonLocal],
  ]) {
    assertInsideLocalRect(`${name}:ProtagonistCreate ${rect[0]} in panel`, rect[1], panelLocal);
  }
  assertNoOverlap(`${name}:Protagonist cards vs form`, cardLocal, formLocal);
  assertNoOverlap(`${name}:Protagonist female card vs form`, femaleCardLocal, formLocal);
  assertNoOverlap(`${name}:Protagonist form vs input`, formLocal, inputLocal);
  assertNoOverlap(`${name}:Protagonist input vs button`, inputLocal, buttonLocal);
  if (layout.stageHeight >= 300 && inputLocal.bottom - buttonLocal.top < 8) {
    console.error(`${name}:Protagonist input/button gap below 8px`);
    ok = false;
  }
}

function assertLobbyMicroHudBounds(layout, name, stage) {
  const unit = clamp(Math.max(layout.stageWidth / Math.max(1, layout.viewportWidth), layout.stageHeight / Math.max(1, layout.viewportHeight)), 1, 4);
  const margin = 8 * unit;

  const playerWidth = Math.min(190 * unit, layout.stageWidth * 0.52);
  const playerHeight = 58 * unit;
  const playerX = layout.stageLeft + margin + playerWidth / 2;
  const playerY = layout.stageTop - margin - playerHeight / 2;
  assertInsideStage(`${name}:LobbyMicroPlayerInfo`, playerX - playerWidth / 2, playerX + playerWidth / 2, playerY + playerHeight / 2, playerY - playerHeight / 2, stage);

  const staminaWidth = Math.min(112 * unit, layout.stageWidth * 0.34);
  const staminaHeight = 24 * unit;
  const staminaX = layout.stageRight - margin - staminaWidth / 2;
  const staminaY = layout.stageTop - margin - staminaHeight / 2;
  assertInsideStage(`${name}:LobbyMicroStamina`, staminaX - staminaWidth / 2, staminaX + staminaWidth / 2, staminaY + staminaHeight / 2, staminaY - staminaHeight / 2, stage);
  assertNoOverlap(`${name}:LobbyMicroPlayerInfo vs LobbyMicroStamina`, localRect(playerX, playerY, playerWidth, playerHeight), localRect(staminaX, staminaY, staminaWidth, staminaHeight));

  const actionWidth = Math.min(340 * unit, layout.stageWidth - margin * 2);
  const actionHeight = 38 * unit;
  const actionX = (layout.stageLeft + layout.stageRight) / 2;
  const actionY = layout.stageBottom + margin + actionHeight / 2;
  assertInsideStage(`${name}:LobbyMicroActionBar`, actionX - actionWidth / 2, actionX + actionWidth / 2, actionY + actionHeight / 2, actionY - actionHeight / 2, stage);
  assertNoOverlap(`${name}:LobbyMicroActionBar vs LobbyMicroPlayerInfo`, localRect(actionX, actionY, actionWidth, actionHeight), localRect(playerX, playerY, playerWidth, playerHeight));

  if (layout.viewportHeight >= 260) {
    const goalWidth = Math.min(330 * unit, layout.stageWidth - margin * 2);
    const goalHeight = 28 * unit;
    const goalX = (layout.stageLeft + layout.stageRight) / 2;
    const goalY = layout.stageBottom + margin + actionHeight + 8 * unit + goalHeight / 2;
    if (goalY + goalHeight / 2 <= layout.stageTop - margin - 64 * unit) {
      assertInsideStage(`${name}:LobbyMicroGoalChip`, goalX - goalWidth / 2, goalX + goalWidth / 2, goalY + goalHeight / 2, goalY - goalHeight / 2, stage);
      assertNoOverlap(`${name}:LobbyMicroGoalChip vs LobbyMicroActionBar`, localRect(goalX, goalY, goalWidth, goalHeight), localRect(actionX, actionY, actionWidth, actionHeight));
      assertNoOverlap(`${name}:LobbyMicroGoalChip vs LobbyMicroPlayerInfo`, localRect(goalX, goalY, goalWidth, goalHeight), localRect(playerX, playerY, playerWidth, playerHeight));
    }
  }
}

function assertLobbyOverlayBounds(layout, name) {
  const stage = stageBox(layout);
  const baseHudScale = clamp(layout.uiScale, 0.62, 1);
  const hudInsetX = clamp(layout.safeInsetX * 0.38, 10 * baseHudScale, 26 * baseHudScale);
  const hudInsetY = clamp(layout.safeInsetY * 0.38, 8 * baseHudScale, 18 * baseHudScale);
  assertInsideStage(`${name}:LobbyAtmosphereOverlay`, layout.stageLeft, layout.stageRight, layout.stageTop, layout.stageBottom, stage);
  const microViewport = layout.viewportWidth < 640 || layout.viewportHeight < 420;
  if (microViewport) {
    assertLobbyMicroHudBounds(layout, name, stage);
  } else {
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

  const playerRight = playerX + playerWidth / 2;
  const systemIconSize = 32 * baseHudScale;
  const systemGap = 14 * baseHudScale;
  const systemWidth = systemIconSize * 4 + systemGap * 3;
  const systemRight = layout.stageRight - hudInsetX;
  const systemLeft = systemRight - systemWidth;
  const systemTop = layout.stageTop - hudInsetY;
  const systemBottom = systemTop - systemIconSize;
  const systemVisible = layout.stageWidth >= 720 && systemLeft >= playerRight + 14 * baseHudScale;
  if (systemVisible) {
    assertInsideStage(`${name}:LobbySystemIcons`, systemLeft, systemRight, systemTop, systemBottom, stage);
  }

  let resourceCount = layout.stageWidth < 720 ? 1 : layout.stageWidth < 840 ? 2 : layout.stageWidth < 1180 ? 3 : 4;
  let resourceWidths = [128, 122, 112, 112].slice(0, resourceCount).map((width) => width * baseHudScale);
  const resourceGap = 14 * baseHudScale;
  const resourceHeight = 34 * baseHudScale;
  const resourceRight = layout.stageRight - hudInsetX - (systemVisible ? systemWidth + 22 * baseHudScale : 0);
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
    if (systemVisible && resourceRight > systemLeft - 20 * baseHudScale) {
      console.error(`${name}:LobbyResourceBar overlaps system icons`);
      ok = false;
    }
  } else if (layout.stageHeight >= 340) {
    const compactWidth = Math.min(132 * baseHudScale, layout.stageWidth - hudInsetX * 2);
    const compactHeight = 32 * baseHudScale;
    const compactX = Math.min(layout.stageRight - hudInsetX - compactWidth / 2, Math.max(layout.stageLeft + hudInsetX + compactWidth / 2, playerRight - compactWidth / 2));
    const compactY = playerY - playerHeight / 2 - 12 * baseHudScale - compactHeight / 2;
    if (compactY - compactHeight / 2 >= layout.stageBottom + 8 * baseHudScale) {
      assertInsideStage(`${name}:LobbyCompactStaminaChip`, compactX - compactWidth / 2, compactX + compactWidth / 2, compactY + compactHeight / 2, compactY - compactHeight / 2, stage);
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
    for (const [index, hotspotText] of hotspotObjects.entries()) {
      const x = layout.stageLeft + layout.stageWidth * parseNumberField(hotspotText, 'x');
      const y = layout.stageBottom + layout.stageHeight * parseNumberField(hotspotText, 'y');
      const plaqueWidth = parseNumberField(hotspotText, 'width') * baseHudScale;
      assertInsideStage(`${name}:LobbyHotspot${index + 1}`, x - plaqueWidth / 2, x + plaqueWidth / 2, y + plaqueHeight / 2, y - plaqueHeight / 2, stage);
      const hitX = layout.stageLeft + layout.stageWidth * parseNumberField(hotspotText, 'hitX');
      const hitY = layout.stageBottom + layout.stageHeight * parseNumberField(hotspotText, 'hitY');
      const hitWidth = layout.stageWidth * parseNumberField(hotspotText, 'hitW');
      const hitHeight = layout.stageHeight * parseNumberField(hotspotText, 'hitH');
      assertInsideStage(`${name}:LobbyHotspotHitArea${index + 1}`, hitX - hitWidth / 2, hitX + hitWidth / 2, hitY + hitHeight / 2, hitY - hitHeight / 2, stage);
    }
  } else if (layout.stageHeight >= 260) {
    const columns = layout.stageWidth >= 720 ? 4 : 2;
    const rows = Math.ceil(hotspotObjects.length / columns);
    const compactWidth = Math.min(layout.stageWidth - hudInsetX * 2, columns * 110 * baseHudScale + 22 * baseHudScale);
    const compactHeight = rows * 34 * baseHudScale + 18 * baseHudScale;
    const minY = layout.stageBottom + compactHeight / 2 + 10 * baseHudScale;
    const maxY = layout.stageTop - hudInsetY - compactHeight / 2;
    const compactY = Math.max(minY, Math.min(maxY, layout.stageBottom + layout.stageHeight * 0.36));
    const compactX = (layout.stageLeft + layout.stageRight) / 2;
    assertInsideStage(`${name}:LobbyCompactSceneEntrances`, compactX - compactWidth / 2, compactX + compactWidth / 2, compactY + compactHeight / 2, compactY - compactHeight / 2, stage);
  }

  if (layout.stageWidth >= 1180 && layout.stageHeight >= 620) {
    const goalWidth = Math.min(410 * baseHudScale, Math.max(330 * baseHudScale, layout.stageWidth * 0.24));
    const goalHeight = 126 * baseHudScale;
    const leftRailReserve = Math.min(206 * baseHudScale, layout.stageWidth * 0.18) + 18 * baseHudScale;
    const rightRailReserve = Math.min(184 * baseHudScale, layout.stageWidth * 0.16) + 18 * baseHudScale;
    const goalMinX = layout.stageLeft + hudInsetX + leftRailReserve + goalWidth / 2;
    const goalMaxX = layout.stageRight - hudInsetX - rightRailReserve - goalWidth / 2;
    const goalX = goalMinX <= goalMaxX ? clamp(layout.stageLeft + layout.stageWidth * 0.34, goalMinX, goalMaxX) : (layout.stageLeft + layout.stageRight) / 2;
    const goalY = layout.stageBottom + 96 * baseHudScale + goalHeight / 2 + 12 * baseHudScale;
    const goalRect = localRect(goalX, goalY, goalWidth, goalHeight);
    assertInsideStage(`${name}:LobbyGoalTracker`, goalRect.left, goalRect.right, goalRect.top, goalRect.bottom, stage);
    if (goalRect.bottom < layout.stageBottom + 96 * baseHudScale) {
      console.error(`${name}:LobbyGoalTracker overlaps bottom HUD`);
      ok = false;
    }
  } else if (layout.viewportWidth >= 640 && layout.viewportHeight >= 420 && layout.stageHeight >= 360) {
    const bottomHudVisibleForGoal = layout.stageWidth >= 900 && layout.stageHeight >= 500;
    const goalWidth = bottomHudVisibleForGoal
      ? Math.min(330 * baseHudScale, Math.max(270 * baseHudScale, layout.stageWidth * 0.34))
      : Math.min(300 * baseHudScale, Math.max(230 * baseHudScale, layout.stageWidth * 0.32));
    const goalHeight = bottomHudVisibleForGoal ? 68 * baseHudScale : 48 * baseHudScale;
    let goalX;
    let goalY;
    if (bottomHudVisibleForGoal) {
      const leftRailReserve = layout.stageWidth >= 900 && layout.stageHeight >= 520 ? Math.min(206 * baseHudScale, layout.stageWidth * 0.18) + 18 * baseHudScale : 0;
      const goalMinX = layout.stageLeft + hudInsetX + leftRailReserve + goalWidth / 2;
      const goalMaxX = layout.stageRight - hudInsetX - goalWidth / 2;
      goalX = goalMinX <= goalMaxX ? clamp(layout.stageLeft + layout.stageWidth * 0.34, goalMinX, goalMaxX) : (layout.stageLeft + layout.stageRight) / 2;
      goalY = layout.stageBottom + 96 * baseHudScale + goalHeight / 2 + 10 * baseHudScale;
    } else {
      goalX = layout.stageRight - hudInsetX - goalWidth / 2;
      goalY = layout.stageTop - hudInsetY - 46 * baseHudScale - goalHeight / 2;
    }
    const goalRect = localRect(goalX, goalY, goalWidth, goalHeight);
    assertInsideStage(`${name}:LobbyCompactGoalTracker`, goalRect.left, goalRect.right, goalRect.top, goalRect.bottom, stage);
    if (bottomHudVisibleForGoal && goalRect.bottom < layout.stageBottom + 96 * baseHudScale) {
      console.error(`${name}:LobbyCompactGoalTracker overlaps bottom HUD`);
      ok = false;
    }
  }

  const sideRailsVisible = layout.stageWidth >= 1000 && layout.stageHeight >= 520;
  const bottomHudVisible = layout.stageWidth >= 900 && layout.stageHeight >= 500;
  if (!(sideRailsVisible && bottomHudVisible) && layout.stageHeight >= 220) {
    const compactActionEntryCount = layout.stageHeight < 300 ? 4 : 9;
    const compactActionColumns = layout.stageWidth >= 720 && compactActionEntryCount > 2 ? 4 : 2;
    const compactActionRows = Math.ceil(compactActionEntryCount / compactActionColumns);
    const compactActionWidth = Math.min(layout.stageWidth - hudInsetX * 2, compactActionColumns * 116 * baseHudScale + 20 * baseHudScale);
    const compactActionItemHeight = (layout.stageHeight < 300 ? 30 : 32) * baseHudScale;
    const compactActionHeight = compactActionRows * compactActionItemHeight + 18 * baseHudScale;
    const compactActionBottomReserved = bottomHudVisible ? 106 * baseHudScale : layout.stageHeight < 300 ? 6 * baseHudScale : 10 * baseHudScale;
    const compactActionMinY = layout.stageBottom + compactActionBottomReserved + compactActionHeight / 2;
    const compactActionMaxY = layout.stageTop - hudInsetY - compactActionHeight / 2;
    if (compactActionMinY <= compactActionMaxY) {
      const compactActionY = compactActionMinY;
      const compactActionX = (layout.stageLeft + layout.stageRight) / 2;
      assertInsideStage(
        `${name}:LobbyCompactActionEntrances`,
        compactActionX - compactActionWidth / 2,
        compactActionX + compactActionWidth / 2,
        compactActionY + compactActionHeight / 2,
        compactActionY - compactActionHeight / 2,
        stage,
      );
      if (bottomHudVisible && compactActionY - compactActionHeight / 2 < layout.stageBottom + 96 * baseHudScale) {
        console.error(`${name}:LobbyCompactActionEntrances overlaps bottom HUD`);
        ok = false;
      }
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
  }

  const adventureScale = clamp(layout.uiScale, 0.62, 1);
  const adventureWidth = Math.max(330 * adventureScale, layout.stageWidth);
  const adventureHeight = Math.max(270 * adventureScale, layout.stageHeight);
  const adventureX = (layout.stageLeft + layout.stageRight) / 2;
  const adventureY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(
    `${name}:LobbyAdventureSceneContent`,
    adventureX - adventureWidth / 2,
    adventureX + adventureWidth / 2,
    adventureY + adventureHeight / 2,
    adventureY - adventureHeight / 2,
    stage,
  );

  const formationScale = clamp(layout.uiScale, 0.62, 1);
  const formationWidth = Math.max(320 * formationScale, layout.stageWidth);
  const formationHeight = Math.max(270 * formationScale, layout.stageHeight);
  const formationX = (layout.stageLeft + layout.stageRight) / 2;
  const formationY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(
    `${name}:LobbyFormationSceneContent`,
    formationX - formationWidth / 2,
    formationX + formationWidth / 2,
    formationY + formationHeight / 2,
    formationY - formationHeight / 2,
    stage,
  );
  assertFormationInternalBounds(name, formationWidth, formationHeight, formationScale);

  const battlePreviewScale = clamp(layout.uiScale, 0.62, 1);
  const battlePreviewWidth = Math.max(330 * battlePreviewScale, layout.stageWidth);
  const battlePreviewHeight = Math.max(270 * battlePreviewScale, layout.stageHeight);
  const battlePreviewX = (layout.stageLeft + layout.stageRight) / 2;
  const battlePreviewY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(
    `${name}:LobbyBattlePreviewPanel`,
    battlePreviewX - battlePreviewWidth / 2,
    battlePreviewX + battlePreviewWidth / 2,
    battlePreviewY + battlePreviewHeight / 2,
    battlePreviewY - battlePreviewHeight / 2,
    stage,
  );
  assertBattlePresentationInternalBounds(name, battlePreviewWidth, battlePreviewHeight, battlePreviewScale);

  const codexScale = clamp(layout.uiScale, 0.64, 1);
  const codexWidth = Math.max(300 * codexScale, layout.stageWidth);
  const codexHeight = Math.max(260 * codexScale, layout.stageHeight);
  const codexX = (layout.stageLeft + layout.stageRight) / 2;
  const codexY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(
    `${name}:LobbyCodexSceneContent`,
    codexX - codexWidth / 2,
    codexX + codexWidth / 2,
    codexY + codexHeight / 2,
    codexY - codexHeight / 2,
    stage,
  );

  const heroScale = clamp(layout.uiScale, 0.64, 1);
  const heroWidth = Math.max(320 * heroScale, layout.stageWidth);
  const heroHeight = Math.max(280 * heroScale, layout.stageHeight);
  const heroX = (layout.stageLeft + layout.stageRight) / 2;
  const heroY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(
    `${name}:LobbyHeroRosterSceneContent`,
    heroX - heroWidth / 2,
    heroX + heroWidth / 2,
    heroY + heroHeight / 2,
    heroY - heroHeight / 2,
    stage,
  );

  const noticeScale = clamp(layout.uiScale, 0.68, 1);
  const noticeWidth = Math.max(300 * noticeScale, layout.stageWidth);
  const noticeHeight = Math.max(260 * noticeScale, layout.stageHeight);
  const noticeX = (layout.stageLeft + layout.stageRight) / 2;
  const noticeY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(
    `${name}:LobbyNoticeSceneContent`,
    noticeX - noticeWidth / 2,
    noticeX + noticeWidth / 2,
    noticeY + noticeHeight / 2,
    noticeY - noticeHeight / 2,
    stage,
  );

  const placeholderScale = clamp(layout.uiScale, 0.7, 1);
  const placeholderWidth = Math.max(280 * placeholderScale, layout.stageWidth);
  const placeholderHeight = Math.max(220 * placeholderScale, layout.stageHeight);
  const placeholderX = (layout.stageLeft + layout.stageRight) / 2;
  const placeholderY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(
    `${name}:LobbyPlaceholderScenePanel`,
    placeholderX - placeholderWidth / 2,
    placeholderX + placeholderWidth / 2,
    placeholderY + placeholderHeight / 2,
    placeholderY - placeholderHeight / 2,
    stage,
  );

  const profileScale = Math.min(1, Math.max(0.42, Math.min(layout.safeWidth / 840, layout.safeHeight / 620)));
  const modalWidth = Math.max(300 * profileScale, layout.stageWidth);
  const modalHeight = Math.max(280 * profileScale, layout.stageHeight);
  const modalX = (layout.stageLeft + layout.stageRight) / 2;
  const modalY = (layout.stageTop + layout.stageBottom) / 2;
  assertInsideStage(`${name}:LobbyProfileSceneContent`, modalX - modalWidth / 2, modalX + modalWidth / 2, modalY + modalHeight / 2, modalY - modalHeight / 2, stage);
}

function assertFormationInternalBounds(name, panelWidth, panelHeight, scale) {
  const panelRect = localRect(0, 0, panelWidth, panelHeight);
  const compact = panelWidth < 720 * scale || panelHeight < 450 * scale;
  const top = panelHeight / 2 - 112 * scale;
  const bottom = -panelHeight / 2 + 86 * scale;
  const availableBodyHeight = Math.max(40 * scale, top - bottom);
  const bodyHeight = compact ? availableBodyHeight : Math.max(150 * scale, availableBodyHeight);
  const bodyWidth = panelWidth - 76 * scale;
  const bodyRect = localRect(0, compact ? -4 * scale : (top + bottom) / 2, bodyWidth, bodyHeight);
  const statusRect = localRect(0, panelHeight / 2 - 78 * scale, panelWidth - 112 * scale, 28 * scale);
  const boundaryNoteRect = localRect(0, -panelHeight / 2 + 62 * scale, panelWidth - 110 * scale, 24 * scale);
  const footerButtons = [
    localRect(-142 * scale, -panelHeight / 2 + 30 * scale, 124 * scale, 36 * scale),
    localRect(0, -panelHeight / 2 + 30 * scale, 138 * scale, 36 * scale),
    localRect(142 * scale, -panelHeight / 2 + 30 * scale, 112 * scale, 36 * scale),
  ];
  assertInsideLocalRect(`${name}:LobbyFormationBody`, bodyRect, panelRect);
  assertNoOverlap(`${name}:LobbyFormationBody vs status`, bodyRect, statusRect);
  assertNoOverlap(`${name}:LobbyFormationBody vs boundary`, bodyRect, boundaryNoteRect);
  footerButtons.forEach((button, index) => {
    assertInsideLocalRect(`${name}:LobbyFormationFooterButton${index}`, button, panelRect);
    assertNoOverlap(`${name}:LobbyFormationBody vs footer ${index}`, bodyRect, button);
  });

  if (compact) {
    const rowHeight = Math.max(10 * scale, Math.min(42 * scale, (bodyHeight - 12 * scale) / 5));
    const startY = bodyHeight / 2 - 6 * scale - rowHeight / 2;
    const bodyLocalRect = localRect(0, 0, bodyWidth, bodyHeight);
    for (let index = 0; index < 5; index += 1) {
      assertInsideLocalRect(`${name}:LobbyFormationCompactSlot${index}`, localRect(0, startY - index * rowHeight, bodyWidth - 28 * scale, rowHeight), bodyLocalRect);
    }
  }
}

function assertBattlePresentationInternalBounds(name, panelWidth, panelHeight, scale) {
  const stackedFooter = panelWidth < 620 * scale;
  const compact = panelWidth < 760 * scale || panelHeight < 470 * scale;
  const verticalCramped = panelHeight < 360 * scale;
  const boundaryHeight = (verticalCramped ? 18 : 24) * scale;
  const boundaryY = -panelHeight / 2 + (stackedFooter ? (verticalCramped ? 84 : 86) : (verticalCramped ? 54 : 62)) * scale;
  const fieldTop = panelHeight / 2 - (verticalCramped ? 84 : 126) * scale;
  const baseFieldBottom = -panelHeight / 2 + (stackedFooter ? 122 : 94) * scale;
  const footerClearBottom = boundaryY + boundaryHeight / 2 + (verticalCramped ? 6 : 8) * scale;
  const fieldBottom = Math.max(baseFieldBottom, footerClearBottom);
  const fieldWidth = panelWidth - 78 * scale;
  const fieldHeight = Math.max(32 * scale, fieldTop - fieldBottom);
  const fieldRect = localRect(0, (fieldTop + fieldBottom) / 2, fieldWidth, fieldHeight);
  const panelRect = localRect(0, 0, panelWidth, panelHeight);
  assertInsideLocalRect(`${name}:LobbyBattlePreviewField internal`, fieldRect, panelRect);

  const compactSlotCount = compact && fieldHeight < 190 * scale ? 1 : compact ? 3 : 5;
  const actorWidth = compact ? Math.min((verticalCramped ? 132 : 152) * scale, fieldWidth * 0.3) : Math.min(178 * scale, fieldWidth * 0.24);
  const actorHeight = compact ? Math.min((verticalCramped ? 40 : 54) * scale, fieldHeight * 0.42) : Math.min(70 * scale, fieldHeight * 0.32);
  const laneGap = compact ? 44 * scale : 58 * scale;
  const allyX = compact ? -fieldWidth * 0.24 : -fieldWidth * 0.32;
  const enemyX = compact ? fieldWidth * 0.24 : fieldWidth * 0.32;
  const startY = compactSlotCount === 1 ? fieldHeight * 0.18 : compact ? fieldHeight * 0.12 : 0;
  const actorRects = [];
  for (let index = 0; index < compactSlotCount; index += 1) {
    const row = index - (compactSlotCount - 1) / 2;
    const allyOffset = -(index % 2) * 18;
    const enemyOffset = (index % 2) * 18;
    actorRects.push({ name: `Ally${index}`, rect: localRect(allyX + allyOffset, startY - row * laneGap, actorWidth, actorHeight) });
    actorRects.push({ name: `Enemy${index}`, rect: localRect(enemyX + enemyOffset, startY - row * laneGap, actorWidth, actorHeight) });
  }
  const fieldLocalRect = localRect(0, 0, fieldWidth, fieldHeight);
  for (const actor of actorRects) {
    assertInsideLocalRect(`${name}:LobbyBattleActor_${actor.name}`, actor.rect, fieldLocalRect);
  }

  const logHeight = compact ? Math.min((verticalCramped ? 28 : 58) * scale, Math.max((verticalCramped ? 18 : 30) * scale, fieldHeight * 0.3)) : Math.min(78 * scale, fieldHeight * 0.32);
  const logRect = localRect(0, -fieldHeight / 2 + (compact ? logHeight / 2 + 8 * scale : 44 * scale), Math.min(fieldWidth - 34 * scale, compact ? fieldWidth - 40 * scale : 340 * scale), logHeight);
  assertInsideLocalRect(`${name}:LobbyBattlePreviewLog`, logRect, fieldLocalRect);
  for (const actor of actorRects) {
    assertNoOverlap(`${name}:LobbyBattlePreviewLog vs ${actor.name}`, logRect, actor.rect);
  }

  const footerButtons = stackedFooter
    ? [
        localRect(0, -panelHeight / 2 + 52 * scale, 168 * scale, 34 * scale),
        localRect(-86 * scale, -panelHeight / 2 + 16 * scale, 144 * scale, 32 * scale),
        localRect(86 * scale, -panelHeight / 2 + 16 * scale, 144 * scale, 32 * scale),
      ]
    : [
        localRect(-190 * scale, -panelHeight / 2 + 30 * scale, 132 * scale, 36 * scale),
        localRect(-36 * scale, -panelHeight / 2 + 30 * scale, 136 * scale, 36 * scale),
        localRect(128 * scale, -panelHeight / 2 + 30 * scale, 126 * scale, 36 * scale),
      ];
  footerButtons.forEach((button, index) => assertInsideLocalRect(`${name}:LobbyBattleFooterButton${index}`, button, panelRect));
  for (let index = 0; index < footerButtons.length; index += 1) {
    for (let other = index + 1; other < footerButtons.length; other += 1) {
      assertNoOverlap(`${name}:LobbyBattleFooterButton${index}-${other}`, footerButtons[index], footerButtons[other]);
    }
  }
  const boundaryRect = localRect(0, boundaryY, panelWidth - 110 * scale, boundaryHeight);
  assertInsideLocalRect(`${name}:LobbyBattleBoundaryBadge`, boundaryRect, panelRect);
  assertNoOverlap(`${name}:LobbyBattleField vs boundary`, fieldRect, boundaryRect);
  for (const [index, button] of footerButtons.entries()) {
    assertNoOverlap(`${name}:LobbyBattleField vs footer ${index}`, fieldRect, button);
    assertNoOverlap(`${name}:LobbyBattleBoundary vs footer ${index}`, boundaryRect, button);
  }
}

if (scene) {
  const canvasNodeId = findNodeIdByName('Canvas');
  const stageNodeId = findNodeIdByName('Login_BG_Poster');
  const canvasTransform = findUiTransform(canvasNodeId);
  const stageTransform = findUiTransform(stageNodeId);
  const stageNode = scene[stageNodeId];

  if (!canvasTransform || !stageTransform || !stageNode) {
    console.error('missing Canvas/Login_BG_Poster transform for login adaptive layout check');
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
      { name: 'ultrawide-2560x1080', width: 2560, height: 1080 },
      { name: 'ultrawide-3440x1440', width: 3440, height: 1440 },
      { name: 'tablet-1536x1024', width: 1536, height: 1024 },
      { name: 'tablet-1024x768', width: 1024, height: 768 },
      { name: 'threshold-719x520', width: 719, height: 520 },
      { name: 'threshold-720x520', width: 720, height: 520 },
      { name: 'threshold-839x520', width: 839, height: 520 },
      { name: 'threshold-840x520', width: 840, height: 520 },
      { name: 'threshold-899x560', width: 899, height: 560 },
      { name: 'threshold-900x560', width: 900, height: 560 },
      { name: 'threshold-999x520', width: 999, height: 520 },
      { name: 'threshold-1000x520', width: 1000, height: 520 },
      { name: 'threshold-1000x519', width: 1000, height: 519 },
      { name: 'threshold-1179x720', width: 1179, height: 720 },
      { name: 'threshold-1180x720', width: 1180, height: 720 },
      { name: 'threshold-1180x500', width: 1180, height: 500 },
      { name: 'threshold-900x499', width: 900, height: 499 },
      { name: 'threshold-900x500', width: 900, height: 500 },
      { name: 'threshold-900x519', width: 900, height: 519 },
      { name: 'threshold-900x520', width: 900, height: 520 },
      { name: 'threshold-900x559', width: 900, height: 559 },
      { name: 'threshold-900x560', width: 900, height: 560 },
      { name: 'mobile-844x390', width: 844, height: 390 },
      { name: 'mobile-812x375', width: 812, height: 375 },
      { name: 'mobile-390x844', width: 390, height: 844 },
      { name: 'compact-playable-390x300', width: 390, height: 300 },
      { name: 'compact-floor-360x240', width: 360, height: 240 },
      { name: 'preview-design-1920x1080-physical-390x300', width: 1920, height: 1080, runtimeWidth: 390, runtimeHeight: 300 },
      { name: 'preview-design-1920x1080-physical-390x340', width: 1920, height: 1080, runtimeWidth: 390, runtimeHeight: 340 },
      { name: 'minimum-320x180', width: 320, height: 180 },
    ];

    for (const viewport of viewports) {
      const layout = resolveAdaptiveLayout(viewport.width, viewport.height, stageSize, stageScale, stagePosition, viewport.runtimeWidth, viewport.runtimeHeight);
      assertLoginOverlayBounds(layout, viewport.name);
      assertProtagonistCreateBounds(layout, viewport.name);
      assertLobbyOverlayBounds(layout, viewport.name);
    }
  }
}

if (!ok) {
  process.exit(1);
}

console.log('layout ok');
