import http from 'node:http';

const PREVIEW_ORIGIN = process.env.COCOS_PREVIEW_ORIGIN || 'http://localhost:7456';
const IMPORT_MAP_URL = `${PREVIEW_ORIGIN}/scripting/x/import-map.json`;

const REQUIRED_CHUNKS = [
  {
    source: 'assets/scripts/scenes/AdaptiveStageLayoutResolver.ts',
    tokens: ['viewportWidth', 'viewportHeight', 'runtimeWindowSize'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHudRenderer.ts',
    tokens: ['renderMicroLobbyHud', 'isMicroViewport', 'createSizedUiNode', 'Math.max(widthUnit, heightUnit), 1, 4', 'LobbyMicroActionBar', 'LobbyGoalTracker', 'LobbyCompactGoalTracker', 'LobbyMicroGoalChip', 'currentLobbyBattleState'],
  },
  {
    source: 'assets/scripts/scenes/LootChainGameRoot.ts',
    tokens: ['selectLobbyAdventureStage', 'previewLockedLobbyAdventureStage', 'findLobbyAdventureStage', 'this.selectedLobbyStageCode = resolvedStageCode', 'LobbyFeatureSceneBackdrop', 'renderLobbyFeatureSceneBackdrop', 'LobbyPlaceholderSceneRoot', 'LobbyPlaceholderScenePanel', 'LobbyPlaceholderBackButton', 'renderSceneBackButton', 'panel.addComponent(BlockInputEvents)', 'renderLobbyScenePage', 'LOGIN_SCENE_BACKGROUND_NODE_NAMES', 'LOGIN_SCENE_LEGACY_NODE_NAMES', 'stageNode.active = false', 'setLoginSceneStageVisible', 'tryPlayLoginSceneVideo', 'resumeForLoginView', 'isLobbyScenePageView', 'returnToLobbyFromScenePage', 'renderGachaResultScene', 'openGachaMockResultScene', 'closeGachaMockResultScene', "this.currentView = 'adventure'", "this.currentView = 'formation'", "this.currentView = 'heroes'", "this.currentView = 'heroDetail'", "this.currentView = 'notice'", "this.currentView = 'placeholder'", "this.currentView = 'battle'", "this.currentView = 'gachaResult'", "this.currentView = 'loginAccount'", 'const gachaStatusY = layout.stageBottom + 210 * layout.uiScale;', 'this.statusPresenter.set(text, layout, gachaStatusY);', 'renderBattleScene', 'openLobbyHeroDetail', 'LobbyHeroDetailSceneContent'],
  },
  {
    source: 'assets/scripts/scenes/UiSceneBackButton.ts',
    tokens: ['layout.stageLeft + 46 * buttonScale', 'layout.stageTop - 42 * buttonScale', 'host.applyImageButtonFeedback(button, 1.04, 0.96)'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts',
    // 鍐掗櫓闈㈡澘鏃㈣鏄剧ず閿佸畾鍏冲崱锛屼篃瑕佷綔涓哄満鏅〉鎷︽埅搴曞眰鐐瑰嚮銆?
    tokens: ['selectLobbyAdventureStage(stage.stageCode)', 'previewLockedLobbyAdventureStage(stage.stageCode)', 'LobbyAdventureSceneContent', 'LobbyAdventureSceneFrame', 'layout.stageWidth', 'LobbyAdventureStageLockBadge', 'LobbyAdventureRecentBattleSummaryCard', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'LobbyAdventureBackButton', 'renderSceneBackButton(this.host, panelGroup, layout'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts',
    // 鎴樻枟棰勮宸插崌绾т负鍏ㄥ睆鎴樻枟閫昏緫瑙嗗浘锛屽悓鏃跺繀椤讳繚鐣欏彧璇荤粨绠楀洖鎵у拰鍐呭鍖虹偣鍑绘嫤鎴€?
    tokens: ['LobbyBattleSceneRoot', 'LobbyBattleSceneBackdropSprite', 'LobbyBattlePreviewBackButton', 'renderSceneBackButton(this.host, sceneRoot, layout', 'LobbyBattleSceneEmberMotion', 'LobbyBattleSettlementReceipt', 'LobbyBattleSettlementReceiptLine_', 'panelGroup.addComponent(BlockInputEvents)'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts',
    // 缂栭槦鍜屾垬鏂楅瑙堝揩閫熻繛鐐规椂澶嶇敤鍚屼竴涓嫳闆勫垪琛ㄨ姹傦紝閬垮厤绌洪樀瀹规垨閲嶅璇汇€?
    tokens: ['inFlightLoad', 'this.inFlightLoad', 'loadPromise'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyNoticePanelRenderer.ts',
    tokens: ['LobbyNoticeSceneContent', 'LobbyNoticeSceneFrame', 'layout.stageWidth', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'LobbyNoticeBackButton', 'renderSceneBackButton(this.host, panelGroup, layout'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts',
    tokens: ['LobbyFormationSceneContent', 'LobbyFormationSceneFrame', 'layout.stageWidth', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'canOpenBattlePreview', 'buttonComponent.interactable = enabled', 'LobbyFormationBackButton', 'renderSceneBackButton(this.host, panelGroup, layout'],
  },
  {
    source: 'assets/scripts/scenes/login/LoginRenderer.ts',
    tokens: ['renderLoginAccountScene', 'openLoginAccountScene', 'LoginAccountSceneRoot', 'LoginAccountScenePanel', 'scene.node.addComponent(BlockInputEvents)', 'panelGraphics.node.addComponent(BlockInputEvents)', 'drawAccountSceneChrome'],
  },
  {
    source: 'assets/resources/login-bg/scripts/login/LoginVideoBackground.ts',
    tokens: ['resumeForLoginView', 'schedulePosterHideFallback', 'hidePosterForVideo', 'this.posterOpacity.opacity = 0', 'this.tryPlayVideo()'],
  },
  {
    source: 'assets/scripts/scenes/protagonist/ProtagonistCreateRenderer.ts',
    tokens: ['drawFullSceneFrame', 'scene.addComponent(BlockInputEvents)', 'ProtagonistCreatePanel'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyCodexPanelRenderer.ts',
    tokens: ['LobbyCodexSceneContent', 'LobbyCodexSceneFrame', 'layout.stageWidth', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'LobbyCodexBackButton', 'renderSceneBackButton(this.host, panelGroup, layout'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyProfileDialogRenderer.ts',
    tokens: ['LobbyProfileSceneRoot', 'LobbyProfileSceneContent', 'sceneRoot.addComponent(BlockInputEvents)', 'panel.addComponent(BlockInputEvents)', 'LobbyProfileBackButton', 'renderSceneBackButton(this.host, panel, layout'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts',
    tokens: ['LobbyHeroRosterSceneContent', 'LobbyHeroRosterSceneFrame', 'layout.stageWidth', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'openLobbyHeroDetail(hero.id)', 'LobbyHeroRosterBackButton', 'renderSceneBackButton(this.host, panelGroup, layout'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHeroDetailPanelRenderer.ts',
    tokens: ['LobbyHeroDetailSceneContent', 'LobbyHeroDetailSceneFrame', 'layout.stageWidth', 'layout.safeWidth < 1154 * scale', 'const artX = 0;', 'LobbyHeroDetailIdentityPlate', 'plateY = -height / 2 + 118 * scale', 'LobbyHeroDetailDynamicPortrait', 'LobbyHeroDetailSpineNode', 'LobbyHeroDetailStageDepth', 'resolveHeroSpineResource(hero)', 'spine/hero/${asset}/${asset}', 'resources.load(path, sp.SkeletonData', 'getRuntimeData(true)', 'resolveHeroSpineAnimationNames', 'startHeroSpineSecondaryCycle', 'const secondaryAnimation = animationNames.secondary', 'skeleton.setAnimation(0, secondaryAnimation, false)', 'skeleton.addAnimation(0, animationName, true, 0)', '.delay(15)', 'skeleton.addAnimation(0, primaryAnimation, true, 0)', 'resolveHeroDetailGroundY(height)', 'graphics.ellipse(0, groundY', 'LobbyHeroDetailAttributeGrid', 'LobbyHeroDetailSkillList', 'LOBBY_HERO_DETAIL_PROTAGONIST_ASSET', 'dim.addComponent(BlockInputEvents)', 'LobbyHeroDetailBackButton', 'renderSceneBackButton(this.host, panelGroup, layout'],
  },
  {
    source: 'assets/scripts/scenes/gacha/GachaSceneConfig.ts',
    tokens: ['GACHA_BACKGROUND_ASSET', 'ui/gacha/gacha_bg_abyss_ring/spriteFrame', 'GACHA_ABYSS_SPINE_RESOURCE'],
  },
  {
    source: 'assets/scripts/scenes/gacha/GachaSceneRenderer.ts',
    tokens: [
      'renderSceneBackButton(this.host, parent, layout',
      'GachaBackButton',
      'GachaAbyssSpineStage',
      'GachaAbyssSpineNode',
      'const spineGroundY = -stageHeight * 0.55',
      'graphics.ellipse(0, spineGroundY - 22 * scale',
      "addChildPlainNode(stage, 'GachaAbyssSpineNode', 0, spineGroundY",
      'return 0.43 * scale * stageFactor',
      'GACHA_ABYSS_SPINE_RESOURCE',
      'resources.load',
      'GACHA_ABYSS_SPINE_UUID',
      'assetManager.loadAny',
      'finishAbyssSpineLoad',
      'GACHA_ABYSS_FALLBACK_SPINE_RESOURCE',
      'GACHA_ABYSS_FALLBACK_SPINE_UUID',
      'ensureAbyssFallbackSpineData',
      'finishAbyssFallbackSpineLoad',
      '已临时显示可用预览 Spine',
      '需要重新导出 huangfengjiaozong',
      'data.getRuntimeData(true)',
      'skeleton.setToSetupPose',
      '<setup-pose>',
      'resolveAbyssSpineSkinName',
      'resolveAbyssSpineAnimationName',
      'skeleton.setSlotsToSetupPose',
      'skeleton.setAnimation(0, idleAnimation, true)',
      'huangfengjiaozong',
      'renderResultScene(layout',
      'GachaResultSceneRoot',
      'GachaResultScenePanel',
      'GachaResultSceneNoWriteNote',
      'GachaResultSceneConfirmButton',
      'openGachaMockResultScene(mode)',
      'closeGachaMockResultScene()',
    ],
  },
];

main().catch((error) => {
  console.error(`[preview freshness] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

async function main() {
  const importMap = JSON.parse(await getText(IMPORT_MAP_URL));
  const imports = importMap.imports ?? {};
  const failures = [];

  for (const requirement of REQUIRED_CHUNKS) {
    const specifier = Object.keys(imports).find((key) => normalize(key).endsWith(requirement.source));
    if (!specifier) {
      failures.push(`${requirement.source}: import-map entry not found`);
      continue;
    }
    const chunkPath = imports[specifier];
    const chunkUrl = new URL(`scripting/x/${String(chunkPath).replace(/^\.\//, '')}`, `${PREVIEW_ORIGIN}/`).href;
    const chunk = await getText(chunkUrl);
    const missing = requirement.tokens.filter((token) => !chunk.includes(token));
    if (missing.length > 0) {
      failures.push(`${requirement.source}: stale chunk ${chunkPath}, missing ${missing.join(', ')}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Cocos Preview is not serving latest chunks.\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  }

  console.log('preview freshness ok');
}

function normalize(value) {
  return decodeURIComponent(String(value)).replace(/\\/g, '/');
}

function getText(url) {
  return new Promise((resolve, reject) => {
    // 鍙鍙栨湰鏈?Preview 鐨勯潤鎬佷骇鐗╋紝涓嶈Е鍙?Cocos 璧勬簮鍐欏叆銆?
    const request = http.get(url, { timeout: 5000 }, (response) => {
      const chunks = [];
      response.setEncoding('utf8');
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        if (response.statusCode !== 200) {
          reject(new Error(`${url} returned HTTP ${response.statusCode}`));
          return;
        }
        resolve(chunks.join(''));
      });
    });
    request.on('timeout', () => {
      request.destroy(new Error(`${url} timed out`));
    });
    request.on('error', reject);
  });
}
