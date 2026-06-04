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
    tokens: ['renderMicroLobbyHud', 'isMicroViewport', 'createSizedUiNode', 'Math.max(widthUnit, heightUnit), 1, 4', 'LobbyMicroActionBar', 'LobbyGoalTracker', 'LobbyCompactGoalTracker', 'LobbyMicroGoalChip', 'currentLobbyBattleState', 'openLobbyBagPanel', 'SHOW_LOBBY_WORLD_CHAT = false', 'SHOW_LOBBY_RIGHT_CHALLENGE_RAIL = false', 'entries.filter((_, index) => index !== 4)'],
  },
  {
    source: 'assets/scripts/scenes/LootChainGameRoot.ts',
    tokens: ['selectLobbyAdventureStage', 'previewLockedLobbyAdventureStage', 'findLobbyAdventureStage', 'this.selectedLobbyStageCode = resolvedStageCode', 'LobbyFeatureSceneBackdrop', 'renderLobbyFeatureSceneBackdrop', 'LobbyPlaceholderSceneRoot', 'LobbyPlaceholderScenePanel', 'LobbyPlaceholderBackButton', 'renderSceneBackButton', 'panel.addComponent(BlockInputEvents)', 'renderLobbyScenePage', 'LOGIN_SCENE_BACKGROUND_NODE_NAMES', 'LOGIN_SCENE_LEGACY_NODE_NAMES', 'stageNode.active = false', 'setLoginSceneStageVisible', 'tryPlayLoginSceneVideo', 'resumeForLoginView', 'isLobbyScenePageView', 'returnToLobbyFromScenePage', 'renderGachaResultScene', 'renderGachaActionScene', 'openGachaActionScene(action', 'closeGachaActionScene', 'loadGachaPoolDetail(poolCode', 'loadGachaLogs(force', 'refreshReadonlyAssetsAfterGacha', 'openGachaMockResultScene', 'closeGachaMockResultScene', 'activeAction: action', 'activeAction: null', 'updateGachaConfigRefresh(deltaTime', "this.currentView = 'adventure'", "this.currentView = 'bag'", "this.currentView = 'formation'", "this.currentView = 'heroes'", "this.currentView = 'heroDetail'", "this.currentView = 'notice'", "this.currentView = 'placeholder'", "this.currentView = 'battle'", "this.currentView = 'gachaResult'", "this.currentView = 'loginAccount'", 'const gachaStatusY = layout.stageBottom + 210 * layout.uiScale;', 'this.statusPresenter.set(text, layout, gachaStatusY);', 'renderBattleScene', 'openLobbyHeroDetail', 'LobbyHeroDetailSceneContent', 'renderLobbyBagPanel', 'LobbyBagSceneContent'],
  },
  {
    source: 'assets/scripts/scenes/UiSceneBackButton.ts',
    tokens: ['SCENE_BACK_BUTTON_ASSET', 'ui/common/scene_back_button/spriteFrame', 'layout.stageLeft + 58 * buttonScale', 'layout.stageTop - 42 * buttonScale', 'SceneBackButtonArt', 'SceneBackTitle', 'renderBackTitle(host, parent, layout, buttonScale, titleText)', 'host.applyImageButtonFeedback(button, 1.04, 0.96)'],
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
    source: 'assets/scripts/scenes/lobby/LobbyBagLoader.ts',
    tokens: ['this.bagApi.myBag()', 'this.heroApi.fragments()', 'mergeBagGroupsWithFragments(bag.groups ?? [], fragments)', "itemType: 'HERO_FRAGMENT'", 'heroFragmentSourceDesc(fragmentItem)', 'this.bagApi.source(safeCode)', 'this.host.refreshLobbyOverlay()'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyBagPanelRenderer.ts',
    tokens: ['LobbyBagSceneContent', 'LobbyBagSceneFrame', 'layout.stageWidth', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'LobbyBagBackButton', 'renderSceneBackButton(this.host, panelGroup, layout', 'LobbyBagBoundaryNote', '使用/出售关闭', 'reloadLobbyBagItemSource'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyProfileDialogRenderer.ts',
    tokens: ['LobbyProfileSceneRoot', 'LobbyProfileSceneContent', 'sceneRoot.addComponent(BlockInputEvents)', 'panel.addComponent(BlockInputEvents)', 'LobbyProfileBackButton', 'renderSceneBackButton(this.host, panel, layout'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts',
    tokens: ['LobbyHeroRosterSceneContent', 'LobbyHeroRosterSceneFrame', 'layout.stageWidth', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'openLobbyHeroDetail(hero.id)', 'LobbyHeroRosterBackButton', 'renderSceneBackButton(this.host, panelGroup, layout', 'LOBBY_HERO_ROSTER_CARD_FRAME_ASSET', 'ui/hero-roster/hero_card_frame/spriteFrame', 'LOBBY_HERO_ROSTER_CARD_ASSETS', 'LobbyHeroRosterFilterRail', 'bodyLeft + cardInsetX + cardWidth / 2', 'bodyTop - cardInsetY - cardHeight / 2', 'HERO_ROSTER_CARD_ASPECT_WIDTH = 937', 'HERO_ROSTER_CARD_ASPECT_HEIGHT = 1676', 'HERO_ROSTER_CARD_DISPLAY_WIDTH_SCALE = 1.2', 'HERO_ROSTER_CARD_MAX_COLUMNS = 5', 'const HERO_ROSTER_CARD_DESKTOP_TARGET_HEIGHT = 468;', 'const HERO_ROSTER_CARD_DESKTOP_MAX_HEIGHT = 492;', 'const HERO_ROSTER_CARD_COMPACT_TARGET_HEIGHT = 310;', 'const HERO_ROSTER_CARD_COMPACT_MAX_HEIGHT = 340;', 'HERO_ROSTER_RARITY_DISPLAY_ORDER', 'UR: 0', 'SSR: 1', 'SR: 2', 'R: 3', 'sortHeroesForRosterDisplay', 'resolveRarityDisplayRank', 'const displayHeroes = this.sortHeroesForRosterDisplay(state.heroes);', 'const maxCardsInRow = Math.max(1, Math.min(displayHeroes.length, HERO_ROSTER_CARD_MAX_COLUMNS))', 'const maxCardWidthForRow = Math.max(96 * scale', '* HERO_ROSTER_CARD_DISPLAY_WIDTH_SCALE', 'HERO_ROSTER_CARD_LEVEL_X_RATIO = -0.38', 'HERO_ROSTER_CARD_LEVEL_Y_RATIO = 0.38', 'HERO_ROSTER_CARD_LEVEL_TEXT_WIDTH_RATIO = 0.29', 'HERO_ROSTER_CARD_BADGE_X_RATIO = 0.37', 'HERO_ROSTER_CARD_BADGE_Y_RATIO = 0.38', 'HERO_ROSTER_CARD_BADGE_SIZE_RATIO = 0.17', 'HERO_ROSTER_CARD_RARITY_Y_RATIO = 0.324', 'HERO_ROSTER_CARD_NAME_Y_RATIO = 0.132', 'HERO_ROSTER_CARD_STARS_Y_RATIO = 0.815', 'Math.min(16 * scale, height * 0.048)', 'new Size(width - 54 * scale, height * 0.06)', 'LobbyHeroRosterHeroName', 'safeText(hero.heroName)', 'formatHeroCardLevel(hero.level)', 'safeLevel >= 100 ? `Lv${safeLevel}` : `Lv.${safeLevel}`', 'topBarLeftReserve', 'LobbyHeroRosterLevelText', 'width * HERO_ROSTER_CARD_LEVEL_X_RATIO', 'height * HERO_ROSTER_CARD_LEVEL_Y_RATIO', 'drawCircleBadge', 'const badgeSize = clamp(width * HERO_ROSTER_CARD_BADGE_SIZE_RATIO', 'const badgeX = width * HERO_ROSTER_CARD_BADGE_X_RATIO', 'const badgeY = height * HERO_ROSTER_CARD_BADGE_Y_RATIO', 'USE_HERO_ROSTER_EXTERNAL_PORTRAITS = false', 'LobbyHeroRosterHeroRelief', 'graphics.lineTo(width * 0.18, -height * 0.26)', 'HERO_ROSTER_BORDER_EFFECT_RESOURCE', 'HERO_ROSTER_BORDER_ANIMATION_BY_RARITY', "R: 'K3'", "SR: 'K4'", "SSR: 'K5'", "UR: 'K7'", 'HERO_ROSTER_UR_SEQUENCE_BORDER_PATH_PREFIX', 'HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_COUNT = 12', 'HERO_ROSTER_UR_SEQUENCE_BORDER_ALPHA = 255', 'HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_WIDTH_RATIO = 1.25', 'HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_HEIGHT_RATIO = 1.25', 'HERO_ROSTER_UR_SEQUENCE_BORDER_OUTER_Y_RATIO = -0.01', 'HERO_ROSTER_UR_SEQUENCE_BORDER_FRAME_PATHS', 'HERO_ROSTER_GOODS_BORDER_WIDTH_PADDING = 30', 'HERO_ROSTER_GOODS_BORDER_HEIGHT_PADDING = 54', 'HERO_ROSTER_GOODS_BORDER_Y_RATIO = -0.01', 'ui/hero-roster/UR-card-border', 'renderUrCardSequenceBorder', 'LobbyHeroRosterUrSequenceBorderSprite', 'loadUrSequenceBorderFrames', 'startSequenceBorderAnimation', 'resources.load(path, SpriteFrame', 'spine/ui/hero-roster/goods_1_border/goods_1', 'renderHeroCardBorderEffect', 'renderRarityGoodsBorderSpine', 'LobbyHeroRosterRarityGoodsBorderSpine_${rarity}', 'loadBorderEffectData', 'resolveRarityBorderAnimationName', 'name.toLowerCase() === targetLower', 'clamp((width + HERO_ROSTER_GOODS_BORDER_WIDTH_PADDING) / 120', 'clamp((height + HERO_ROSTER_GOODS_BORDER_HEIGHT_PADDING) / 120', 'LobbyHeroRosterAbyssDust', 'LobbyHeroRosterUpgradeButtonDisabled', 'resolveHeroRosterPortraitAsset'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHeroDetailPanelRenderer.ts',
    tokens: ['LobbyHeroDetailSceneContent', 'LobbyHeroDetailSceneFrame', 'layout.stageWidth', 'layout.safeWidth < 1154 * scale', 'const artX = 0;', 'LobbyHeroDetailIdentityPlate', 'plateY = -height / 2 + 118 * scale', 'LobbyHeroDetailDynamicPortrait', 'LobbyHeroDetailSpineNode', 'LobbyHeroDetailStageDepth', 'resolveHeroSpineResource(hero)', 'spine/hero/${asset}/${asset}', 'resources.load(path, sp.SkeletonData', 'hero spine asset missing', 'hero spine load start', 'AudioSource', 'AudioClip', 'bindHeroSpineAudioEvents', 'playHeroSpineAudioEvent', 'event.data?.audioPath', 'resources.load(path, AudioClip', 'hero spine audio missing', 'getRuntimeData(true)', 'resolveHeroSpineAnimationNames', 'startHeroSpineSecondaryCycle', 'const secondaryAnimation = animationNames.secondary', 'skeleton.setAnimation(0, secondaryAnimation, false)', 'skeleton.addAnimation(0, animationName, true, 0)', '.delay(15)', 'skeleton.addAnimation(0, primaryAnimation, true, 0)', 'resolveHeroDetailGroundY(height)', 'graphics.ellipse(0, groundY', 'LobbyHeroDetailAttributeGrid', 'LobbyHeroDetailSkillList', 'LOBBY_HERO_DETAIL_PROTAGONIST_ASSET', 'dim.addComponent(BlockInputEvents)', 'LobbyHeroDetailBackButton', 'renderSceneBackButton(this.host, panelGroup, layout'],
  },
  {
    source: 'assets/scripts/scenes/gacha/GachaSceneConfig.ts',
    tokens: ['GACHA_BACKGROUND_ASSET', 'ui/gacha/gacha_bg_abyss_ring/spriteFrame', 'GACHA_MODAL_CLOSE_BUTTON_ASSET', 'ui/common/modal_close_button/spriteFrame', 'GACHA_POOL_LOGO_ASSETS', 'ui/gacha/logo_limited/spriteFrame', 'GACHA_ABYSS_SPINE_RESOURCE', 'GACHA_REVEAL_STEPS'],
  },
  {
    source: 'assets/scripts/scenes/gacha/GachaSceneRenderer.ts',
    tokens: [
      'renderSceneBackButton(this.host, parent, layout',
      'GachaBackButton',
      'renderActionModal(parent',
      'GachaActionModalOverlay_',
      'GachaActionScenePanel_',
      'GachaActionModalCloseArt',
      'GACHA_MODAL_CLOSE_BUTTON_ASSET',
      'GachaPoolLogoImage',
      'GachaPoolTabLogoBackdrop',
      'tabLogoAsset || pool.logoAsset',
      'normalizeSpriteFramePath',
      'resolveActionPanelFrame(layout, scale, action, rows.length)',
      'bodyOuterHeight',
      '概率保底',
      '奖池内容',
      'openGachaActionScene(key)',
      'currentLobbyProfile()',
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
      'renderRevealScene(layout',
      'GachaRevealSceneRoot',
      'GachaRevealSceneContent',
      'GachaRevealBackButton',
      'GachaRevealCardBack',
      'GachaRevealContinueButton',
      'GachaRevealNoWriteStrip',
      'startGachaDraw(mode)',
      'closeGachaMockRevealScene()',
      'renderResultScene(layout',
      'GachaResultSceneRoot',
      'GachaResultBackButton',
      'GachaResultScenePanel',
      'GachaResultSceneNoWriteNote',
      'GachaResultSceneConfirmButton',
      "this.renderTopBar(root, layout, scale, 'GachaResultBackButton', () => this.host.closeGachaMockResultScene(), '召唤结果');",
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
