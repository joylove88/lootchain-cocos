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
    // 确认关卡守卫、场景式页面切换、全屏战斗视图、英雄详情和内容区输入拦截已经进入 Cocos Preview 最新运行包。
    tokens: ['selectLobbyAdventureStage', 'previewLockedLobbyAdventureStage', 'findLobbyAdventureStage', 'this.selectedLobbyStageCode = resolvedStageCode', 'LobbyPlaceholderPanel', 'panel.addComponent(BlockInputEvents)', 'renderLobbyScenePage', 'isLobbyScenePageView', 'returnToLobbyFromScenePage', "this.currentView = 'adventure'", "this.currentView = 'formation'", "this.currentView = 'heroes'", "this.currentView = 'heroDetail'", "this.currentView = 'notice'", "this.currentView = 'placeholder'", "this.currentView = 'battle'", 'renderBattleScene', 'openLobbyHeroDetail', 'LobbyHeroDetailPanel'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts',
    // 冒险面板既要显示锁定关卡，也要作为场景页拦截底层点击。
    tokens: ['selectLobbyAdventureStage(stage.stageCode)', 'previewLockedLobbyAdventureStage(stage.stageCode)', 'LobbyAdventureStageLockBadge', 'LobbyAdventureRecentBattleSummaryCard', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', '返回大厅'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts',
    // 战斗预览已升级为全屏战斗逻辑视图，同时必须保留只读结算回执和内容区点击拦截。
    tokens: ['LobbyBattleSceneRoot', 'LobbyBattleSceneBackdropSprite', 'LobbyBattleSceneEmberMotion', 'LobbyBattleSettlementReceipt', 'LobbyBattleSettlementReceiptLine_', 'panelGroup.addComponent(BlockInputEvents)'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts',
    // 编队和战斗预览快速连点时复用同一个英雄列表请求，避免空阵容或重复读。
    tokens: ['inFlightLoad', 'this.inFlightLoad', 'loadPromise'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyNoticePanelRenderer.ts',
    tokens: ['LobbyNoticePanel', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', '返回大厅'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts',
    tokens: ['LobbyFormationPanel', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'canOpenBattlePreview', 'buttonComponent.interactable = enabled', '返回大厅'],
  },
  {
    source: 'assets/scripts/scenes/login/LoginRenderer.ts',
    tokens: ['LoginDialogPanel', 'dim.node.addComponent(BlockInputEvents)', 'panelGraphics.node.addComponent(BlockInputEvents)'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyCodexPanelRenderer.ts',
    tokens: ['LobbyCodexPanel', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', '返回大厅'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyProfileDialogRenderer.ts',
    tokens: ['LobbyProfilePanel', 'dim.addComponent(BlockInputEvents)', 'panel.addComponent(BlockInputEvents)', '返回大厅'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts',
    tokens: ['LobbyHeroRosterPanel', 'dim.addComponent(BlockInputEvents)', 'panelGroup.addComponent(BlockInputEvents)', 'openLobbyHeroDetail(hero.id)', '返回大厅'],
  },
  {
    source: 'assets/scripts/scenes/lobby/LobbyHeroDetailPanelRenderer.ts',
    // 英雄详情必须是只读展示层，包含动态立绘、星级、技能、属性和主角形态说明。
    tokens: ['LobbyHeroDetailPanel', 'LobbyHeroDetailDynamicPortrait', 'LobbyHeroDetailAttributeGrid', 'LobbyHeroDetailSkillList', 'LOBBY_HERO_DETAIL_PROTAGONIST_ASSET', 'dim.addComponent(BlockInputEvents)', '返回大厅'],
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
    // 只读取本机 Preview 的静态产物，不触发 Cocos 资源写入。
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
