# LootChain Cocos Client

LootChain 玩家游戏前端。当前阶段的登录页、UI、按钮、全屏逻辑场景页、输入框、状态提示、背景和动态特效全部在 Cocos Creator 内实现，不再使用 HTML、Vue、CSS 或 H5 作为登录验收路径。

## 当前路线

- Cocos Creator 负责登录页完整内容：背景、粒子、UI、全屏逻辑场景页和 `dev-login` 联调。
- `web-vue` 仅作为历史实验目录保留，不作为当前阶段验收入口；除非用户明确要求，不再修改或运行它。
- 当前流程为 Cocos 登录页 -> 主角色检查/创建 -> 资源加载进度页 -> 大厅背景页 + 大厅 HUD。
- 登录成功后先检查/创建服务端主角色，再加载 `assets/resources/lobby` 下的大厅资源，资源准备完成后进入大厅背景界面，并展示玩家资料、公告活动和图鉴等只读/占位入口。
- 大厅阶段 1 已恢复播放 `assets/resources/lobby/lobby_bg_loop.mp4`；poster 作为首帧兜底，`VideoPlayer.stayOnBottom=true`，视频开始播放后淡出 poster，避免视频层覆盖 HUD。
- 所有叠在背景上的 UI 元素必须使用 `LootChainGameRoot.resolveLayout()` 计算出的舞台安全区定位，不能写死屏幕坐标；`check:layout` 会按多种分辨率校验关键 HUD 不越界。
- 左上玩家信息已按参考图方向深化为徽章式铭牌：头像徽章、EXP 小牌、等级/名称/战力三层排版、名称徽记和暗金细线底纹。
- 左上铭牌返修后，左对齐文字按文本框左边界布局，头像框改为低饱和暗金属风格，不再使用卡通化放射三角。
- 左上铭牌主体已切换为高质量图片资产 `assets/resources/ui/lobby/lobby_player_info_panel.png`，Cocos 只动态覆盖等级、名称、战力和 EXP 文本。
- 大厅 Stage 1A 已将左上铭牌改为参考图式贴近左上角的小边距定位，动态文字限制在头像右侧有效区域内，并增加描边与缩放，提升视频背景上的可读性。

## 登录背景资源

- PC 横屏预览加载 `assets/resources/login-bg/login_bg_loop_1080p.mp4` 与 `assets/resources/login-bg/login_bg_first.jpg`。
- H5/竖屏预览加载 `assets/resources/login-bg-h5/login_bg_loop.mp4` 与 `assets/resources/login-bg-h5/login_bg_poster.jpg`。
- 替换登录背景时优先保持上述同名文件；如果只替换 PC 资源，竖屏或移动端预览仍会显示 H5 资源。

## 本阶段范围

- 当前只交付 Cocos 登录页和 Cocos 大厅，不以 web-vue 作为验收入口。
- 登录只对接现有 `/api/player/auth/dev-login`。
- 登录成功后对接主角色初始化接口：`GET /api/player/protagonist/state` 与 `POST /api/player/protagonist`。该写入只创建账号主角色和对应 `user_hero source_type=PROTAGONIST` 实例，不涉及抽卡、奖励、扣费、资金池或 EX。
- 大厅只对接只读接口：`GET /api/player/me/lobby`、`GET /api/player/lobby/notices`、`GET /api/player/lobby/codex`、`GET /api/player/lobby/heroes`。
- 不修改游戏经济规则。
- 不开放 EX 获取。
- 不做 USDT 直接领取。
- 不直连 MySQL、Redis、RabbitMQ。
- 大厅当前可展示背景、HUD、玩家资料只读场景页、公告活动只读场景页、图鉴只读场景页和本地未开放占位场景页。
- 不开放抽卡、英雄养成、背包使用/出售、队伍、装备、商店交易、副本结算、Boss 奖励、资金池、链上领取入口。

## Cocos 打开方式

1. 安装 Cocos Creator 3.8.x。
2. 用 Cocos Dashboard 打开本目录：

```text
D:\project\lootchain-cocos
```

3. 打开 `assets/main.scene`。
4. 确认 Canvas 下挂载 `LootChainGameRoot`，背景和粒子节点保留在场景中。
5. 点击编辑器预览运行。

## 后端联调

本地联调要求后端 `lootchain-game` 运行在 `http://localhost:8081`，并打开本地模拟登录：

```powershell
cd D:\project\LootChain
.\start-game-server.bat
```

Cocos 登录弹框中账号输入为数字时，会作为本地 `userId` 调用：

```text
POST http://localhost:8081/api/player/auth/dev-login
```

当前默认 `userId=1`。非数字账号/邮箱暂按本地验收兜底为 `userId=1`，正式账号体系后续由后端登录接口补齐。

登录成功后会先检查/创建主角色：

```text
GET http://localhost:8081/api/player/protagonist/state
POST http://localhost:8081/api/player/protagonist
```

主角色创建请求只允许提交：

```json
{ "gender": "male", "protagonistName": "圣契1" }
```

客户端不能提交 `heroCode`、稀有度、等级、星级、战力或属性。后端会固定创建 SSR 主角色模板和 `user_hero source_type=PROTAGONIST` 实例，并保证重复点击不生成第二个主角色。

主角色准备完成后，大厅会读取玩家只读资料、公告活动和图鉴预览：

```text
GET http://localhost:8081/api/player/me/lobby
GET http://localhost:8081/api/player/lobby/notices
GET http://localhost:8081/api/player/lobby/codex
GET http://localhost:8081/api/player/lobby/heroes
```

这些接口只返回大厅展示所需的 VO，不执行写入，不返回 Entity，不开放 EX V1 或任何经济写入口。

## 文档同步约定

每次阶段性上下文或代码变更完成后，必须同步更新对应项目文档。本项目的 Cocos-only 登录页、资源加载、大厅背景、预览验证、脚本检查等上下文优先更新：

- `D:\project\lootchain-cocos\README.md`
- `D:\project\lootchain-cocos\docs\current-chat-context.md`

涉及服务端启动、接口、规则或 SQL 的上下文，同时更新 `D:\project\LootChain` 下对应文档。

## 当前可用入口

- 主界面：左上 Logo、右侧“谕言 / 客服 / 公告 / 修复”占位按钮、一个“账号登录”按钮。
- 登录弹框：账号/邮箱、密码、进入游戏、第三方登录占位图标、协议勾选。
- 登录成功：进入资源加载进度页，加载完成后切换到大厅背景界面。
- 大厅：左上玩家信息入口打开资料只读弹窗；公告/活动打开只读公告面板；底部 `图鉴` 打开只读图鉴面板；其他玩法入口仍是本地未开放占位弹窗。

客户端只展示和发送请求，所有扣费、保底、发奖和道具消耗都以后端事务为准。

## 2026-05-29 Lobby Stage 1B HUD update

- The lobby top-left player info HUD now follows a `540x218` logical reference layout and uses a `1080x436` high-resolution PNG asset at `assets/resources/ui/lobby/lobby_player_info_panel.png`.
- Dynamic Cocos labels for level, player name, combat power, and EXP are positioned in explicit safe slots to avoid overlap with the avatar frame/background.
- `scripts/check-layout.mjs` now checks the HUD PNG dimensions, SpriteFrame trim metadata, and internal label boxes across the supported viewport set.
- Verification: `npm.cmd run check:layout` passed; Cocos Creator 3.8.8 bundled TypeScript no-emit check passed.
- Boundary unchanged: no economy rule changes, no EX V1 opening, and no new economy write entry.

### Revision

- The first Stage 1B bitmap pass was rejected because it still looked like a heavy custom panel. The current asset reuses the higher-quality original portrait/frame crop only on the left side and leaves the right text area transparent, matching the reference direction more closely.
- The name sigil and combat-power underline are now drawn as thin gold Cocos graphics; the previous red diamond ornament has been removed.

### High Quality Avatar Frame Regeneration

- The screenshot-crop avatar frame pass was rejected. The current `lobby_player_info_panel.png` now uses a newly generated high-resolution avatar medallion from imagegen, with chroma-key removal and local transparent compositing into the existing `1080x436` HUD canvas.
- The generated source is retained at `C:\Users\axian\.codex\generated_images\019e6dfe-8486-7d32-a92f-9eaea25168f8\ig_07b83f41cd8e8d4e016a193fe1f8188191a7a50f262aadf9c6.png`; the project consumes only `assets/resources/ui/lobby/lobby_player_info_panel.png`.
- `lobby_player_info_panel.png.meta` is fixed to the full `1080x436` SpriteFrame grid so the dynamic Cocos labels stay aligned with the generated frame.

### Profile Dialog Close Flash Fix

- Opening/closing the lobby player profile dialog no longer rebuilds the full lobby scene. It now only adds/removes `LobbyProfileDim` and `LobbyProfilePanel`, keeping `Lobby_BG_Poster` and `Lobby_BG_Video` alive.
- Profile data refresh now updates the lobby HUD/profile overlay only, preventing the login background from appearing for a frame while the lobby background is recreated.
- `check:layout` includes a guard that blocks `renderLobby()` from the profile dialog open/close/profile-refresh paths.

## 2026-05-29 Lobby Stage 1C Top Resource Bar

- Added a Cocos-only top resource bar on the lobby HUD through `LootChainGameRoot.renderLobbyResourceBar()`.
- The bar is read-only: it displays stamina plus reference-style coin/ruby/crystal visual placeholders, with no purchase flow, no claim flow, and no backend write call.
- Stamina reuses the existing read-only `GET /api/player/me/lobby` profile VO. Coin/ruby/crystal values are visual placeholders until a read-only asset summary contract is explicitly available.
- The resource bar uses adaptive item counts and collision checks so it does not overlap the top-left player HUD on desktop, tablet, landscape mobile, portrait mobile, or minimum viewport checks.
- `scripts/check-layout.mjs` now verifies the resource bar node, resource item/value rendering path, and multi-resolution bounds next to the player info panel.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.
- `git diff --check` -> passed, with only existing CRLF warnings.
- Boundary unchanged: no economy rule changes, no EX V1 opening, and no new economy write entry.

## 2026-05-29 Lobby Stage 1D Reference-Style HUD Skeleton

- Reworked the lobby overlay toward `docs/ui-reference/dragonheir/lobby/lobby.png`: dark-gold thin HUD pieces, icon-first resource cells, red-dot markers, top-right system icons, left activity rail, center scene plaques, right challenge cards, bottom navigation, chat preview, and the red adventure button.
- All new lobby surfaces are Cocos UI/Graphics nodes, so they stay sharp under Cocos scaling instead of relying on blurred screenshots.
- The `+` marks in the top resource bar are disabled visual marks only. Resource cells do not register purchase or claim actions.
- Activity, hotspot, challenge, bottom-nav, and adventure clicks only show a temporary unopened status message; no gameplay/economy API is called.
- `scripts/check-layout.mjs` now checks the new top system icons, resource bar spacing, activity rail, scene hotspots, challenge rail, and bottom HUD against the supported viewport set.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.
- Boundary unchanged: no economy rule changes, no EX V1 opening, and no new economy write entry.

### Stage 1D refinement: building hotspots and larger text

- Increased lobby HUD text sizes to better match the visual proportions in `docs/ui-reference/dragonheir/lobby/lobby.png`, especially activity rows, center scene labels, right challenge cards, bottom navigation, chat preview, and the adventure button.
- Repositioned center scene labels so they sit closer to their corresponding buildings instead of floating away from the background architecture.
- Added transparent building hit areas behind every center function point. Hovering a building area now triggers the same local unopened-status hint as hovering the label.
- Clicking a building hit area or its label now plays a red-gold click pulse at the building/function location, then shows the local unopened-status hint.
- These interactions remain local placeholder behavior only; no gameplay, economy, purchase, claim, gacha, hero, bag, shop, fund-pool, or chain write API is called.

### Stage 1D hotspot alignment correction

- Corrected the first hotspot pass after preview showed the building hit boxes were too large and not aligned with the buildings.
- Center function labels now use per-building plaque widths and per-building anchor coordinates instead of one shared center/size formula.
- Transparent building hit areas are now individually sized to the visible building mass and no longer show a full red debug-like rectangle on hover.
- Hover feedback is now a small local red-gold target pulse near the building center, while click feedback remains the red-gold pulse effect.

### Stage 1D hotspot alignment correction v2

- Recalibrated the center function labels against the current 3840x2160 16:9 lobby poster instead of the earlier reference-image crop.
- Moved the visible plaques closer to the actual architecture anchors for summon altar, guild, ranking, traveler gathering, forge, abyss gate, campaign, and shop.
- Reduced hotspot plaque height/font size slightly so labels read more like attached building nameplates and less like oversized floating buttons.
- Further narrowed transparent building hit areas to the visible building cores while keeping hover/click placeholder behavior local only.

### Stage 1D code modularization

- Split the lobby HUD out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- `LootChainGameRoot` now keeps lifecycle, route switching, login/loading flow, lobby background, profile data state, and shared UI primitives.
- Lobby HUD code now lives under `assets/scripts/scenes/lobby/`:
  - `LobbyHudRenderer.ts`: renders player info, top resources, system icons, activity rail, scene hotspots, challenge rail, bottom HUD, and local placeholder interactions.
  - `LobbyHudConfig.ts`: holds editable HUD configuration such as activity rows, central hotspot coordinates, challenge cards, and bottom navigation items.
  - `LobbyHudTypes.ts`: holds HUD host/type contracts, constants, and small shared helpers.
- `scripts/check-layout.mjs` now validates the split lobby module files and their Cocos `.meta` files.
- Boundary unchanged: no economy rule changes, no EX V1 opening, and no new economy write entry.

## 2026-05-30 Lobby Stage 1E Profile Dialog Module Split

- Split the readonly lobby player profile dialog out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyProfileDialogRenderer.ts`, with Cocos meta `LobbyProfileDialogRenderer.ts.meta`.
- `LootChainGameRoot` now keeps only profile state, open/close/remove orchestration, profile loading, and the small host methods required by the dialog renderer.
- Dialog behavior is unchanged: `LobbyProfileDim` and `LobbyProfilePanel` are still added/removed as overlay nodes only, so opening/closing the profile dialog does not rebuild the lobby background video/poster.
- `scripts/check-layout.mjs` now validates the profile dialog module and meta file.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1F Background Controller Split

- Split the lobby poster/video runtime control out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyBackgroundController.ts`, with Cocos meta `LobbyBackgroundController.ts.meta`.
- `LootChainGameRoot` now delegates lobby background render/play/update/release to the controller and keeps only lifecycle/resource-loading orchestration.
- Behavior is unchanged: poster still fills the full visible canvas, video still uses `VideoPlayer.stayOnBottom=true`, muted looping playback, autoplay retry, poster fade after `PLAYING`, replay on `COMPLETED`, and poster fallback on `ERROR`.
- Resource loading now guards against stale loading tickets before writing poster/video resources into the background controller.
- `scripts/check-layout.mjs` now validates the background module and keeps the lobby video safety tokens out of the root script.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1G Avatar Renderer Split

- Split the shared lobby avatar drawing out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyAvatarRenderer.ts`, with Cocos meta `LobbyAvatarRenderer.ts.meta`.
- `LootChainGameRoot.addLobbyAvatar()` now delegates to the avatar renderer; HUD and profile dialog behavior stays unchanged.
- The renderer owns the dark-gold circular frame, ornament strokes, armored portrait silhouette, and `AvatarCrestLetter` label.
- `scripts/check-layout.mjs` now validates the avatar module and no longer requires the avatar drawing functions to live in the root scene script.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1H Profile State Split

- Split readonly lobby profile state normalization out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyProfileState.ts`, with Cocos meta `LobbyProfileState.ts.meta`.
- The state module owns current player id, loading/error flags, fallback profile, and normalization for `GET /api/player/me/lobby` responses.
- `LootChainGameRoot` still owns the API call and overlay refresh timing, but no longer contains profile fallback/normalization data code.
- `scripts/check-layout.mjs` now validates the profile state module and keeps the readonly endpoint/economy guardrails active across the split.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1I Loading Renderer Split

- Split the lobby resource-loading screen renderer out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyLoadingRenderer.ts`, with Cocos meta `LobbyLoadingRenderer.ts.meta`.
- The renderer owns `LoadingMask`, `LoadingPanel`, progress label/bar, loading message/error text, and the retry button layout.
- `LootChainGameRoot` still owns resource loading state, retry flow, ticket checks, and transition into the lobby.
- `scripts/check-layout.mjs` now validates the loading renderer module while keeping the existing multi-resolution loading panel bounds check.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1J Resource Loader Split

- Split lobby poster/video resource loading out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyResourceLoader.ts`, with Cocos meta `LobbyResourceLoader.ts.meta`.
- `LobbyResourceLoader` now owns the Cocos `resources.load()` calls for `lobby/lobby_bg_poster` and `lobby/lobby_bg_loop`, including the poster `SpriteFrame` fallback path through `Texture2D`.
- `LootChainGameRoot` still owns loading tickets, progress state, error handling, and the final transition into the lobby. Stale loading flows return before writing resources into `LobbyBackgroundController`.
- `scripts/check-layout.mjs` now validates the resource loader module and includes it in the forbidden economy token scan.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
  - `git diff --check` -> passed, with only existing CRLF warnings.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1K Login Renderer Split

- Split the login page and login dialog UI composition out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/login/LoginRenderer.ts`, with Cocos meta files for the new `login` folder and renderer script.
- `LoginRenderer` owns `LoginLogo`, `MainAccountLoginButton`, right-side login rail, `DialogDim`, `LoginDialogPanel`, account/password input placement, third-party placeholder buttons, agreement row, back button, and enter-game button layout.
- `LootChainGameRoot` still owns login flow and state: `currentView`, `agreementAccepted`, `accountInput`, `passwordInput`, `statusLabel`, `login()`, dev-login API call, loading transition, and lobby/profile loading.
- `scripts/check-layout.mjs` now validates the login renderer module, forbids API/gameplay routing inside it, and checks login-dialog inner controls across the supported viewport set.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1L Adaptive Layout Resolver Split

- Split viewport/stage/safe-area layout calculation out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/AdaptiveStageLayoutResolver.ts`, with Cocos meta `AdaptiveStageLayoutResolver.ts.meta`.
- `AdaptiveStageLayoutResolver` owns `LOGIN_REFERENCE_WIDTH`, `LOGIN_REFERENCE_HEIGHT`, `LOGIN_STAGE_NODE_NAMES`, minimum viewport dimensions, Cocos `view.getVisibleSize()` fallback, active stage-node detection, and the `safeLeft/safeRight/safeTop/safeBottom` formula.
- `LootChainGameRoot` still owns route state, `renderBase()`, `applyRootSize()`, `makeLayoutKey()`, content-root clearing, and lobby video release timing.
- `UiLayout` is now imported from `LobbyHudTypes.ts` instead of being duplicated inside the root scene script.
- `scripts/check-layout.mjs` now validates the adaptive layout module, forbids layout implementation from drifting back into the root script, and keeps the multi-resolution formula mirror aligned.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1M UI SpriteFrame Cache Split

- Split UI SpriteFrame cache/preload logic out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/UiSpriteFrameCache.ts`, with Cocos meta `UiSpriteFrameCache.ts.meta`.
- `UiSpriteFrameCache` owns cached `SpriteFrame` map/set state, duplicate-load prevention, Cocos `resources.load(path, SpriteFrame)`, login image preloading, and lobby player-panel preloading.
- `LootChainGameRoot` still owns Cocos Inspector-bound frame overrides: `logoFrame`, `mainButtonFrame`, and `rightRailFrames`, plus UI node creation and render timing.
- `addSprite()` and `addImageButton()` still live in the root as shared UI primitives, but now resolve/request frames through `uiSpriteFrameCache`.
- `scripts/check-layout.mjs` now validates the sprite cache module, forbids business/API/UI-node responsibilities inside it, and prevents SpriteFrame cache maps/loaders from drifting back into the root script.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1N Readonly Profile Loader Split

- Split readonly lobby profile loading orchestration out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyProfileLoader.ts`, with Cocos meta `LobbyProfileLoader.ts.meta`.
- `LobbyProfileLoader` now owns `LobbyProfileState`, loading/error state transitions, the readonly `PlayerProfileApi.lobbyProfile()` call, stale user protection, and profile overlay refresh callbacks.
- `LootChainGameRoot` still owns login order, `dev-login`, loading-resource transition, profile dialog open/close state, and Cocos overlay node refresh implementation.
- Root now delegates `currentLobbyProfile()`, `isLobbyProfileLoading()`, `getLobbyProfileError()`, `resetForLogin()`, and profile loading to `LobbyProfileLoader`.
- `scripts/check-layout.mjs` now validates the loader module, forbids profile loading implementation in the root script, and enforces `PlayerProfileApi` as exact read-only `GET /api/player/me/lobby` with no write methods.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1O Loading Flow Controller Split

- Split lobby resource-loading flow orchestration out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyLoadingFlow.ts`, with Cocos meta `LobbyLoadingFlow.ts.meta`.
- `LobbyLoadingFlow` now owns loading ticket state, progress/message/error state, retry startup, stale-load protection, error capture, and the `LobbyResourceLoader` orchestration.
- `LootChainGameRoot` now only exposes narrow host callbacks for loading: show/refresh loading view, write poster/video resources into `LobbyBackgroundController`, and enter the lobby view.
- `LobbyLoadingRenderer` remains pure UI rendering, and `LobbyResourceLoader` remains pure local poster/video loading.
- `scripts/check-layout.mjs` now validates the loading-flow module, scans it for forbidden gameplay/economy tokens, and prevents loading ticket/progress implementation from drifting back into the root script.
- `docs/api-contract.md` was synchronized so the current Cocos open scope is explicit: `POST /api/player/auth/dev-login` plus readonly `GET /api/player/me/lobby`.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1P Login Flow Split

- Split the Cocos-only `dev-login` flow out of `assets/scripts/scenes/LootChainGameRoot.ts`.
- New module: `assets/scripts/scenes/login/LoginFlow.ts`, with Cocos meta `LoginFlow.ts.meta`.
- `LoginFlow` now owns account input references, agreement state, default dev user fallback, `userId` parsing, `PlayerAuthApi.devLogin(userId)`, login error formatting, and the last token name used by loading retry.
- `LootChainGameRoot` keeps only narrow login host callbacks: set API base URL, set status text, reset readonly lobby profile state, start lobby loading, and trigger readonly profile loading after login.
- `LoginRenderer` remains presentation-only and does not call API or route to gameplay/economy modules.
- `scripts/check-layout.mjs` now validates the login-flow module, scans it for forbidden gameplay/economy responsibilities, and prevents `dev-login` implementation details from drifting back into the root scene script.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` remain active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1Q Shared Text And Status Modules

- Split shared text/number helpers out of `assets/scripts/scenes/LootChainGameRoot.ts` into `assets/scripts/scenes/UiTextFormatter.ts`, with Cocos meta `UiTextFormatter.ts.meta`.
- `UiTextFormatter` now owns `positiveInteger()`, `formatInteger()`, `compactResourceValue()`, `trimText()`, and `safeText()` for root, avatar, profile state, and profile dialog use.
- Split status-label ownership out of the root into `assets/scripts/scenes/StatusPresenter.ts`, with Cocos meta `StatusPresenter.ts.meta`.
- `StatusPresenter` now owns the live `Label` reference, `add()`/`set()` status behavior, and stale-label reset after view cleanup. This prevents status updates from targeting a label removed during route rerender.
- `LootChainGameRoot` keeps only host wrappers for `addStatus()` and `setStatus()`.
- `scripts/check-layout.mjs` now requires both modules, scans them for forbidden API/economy/gameplay tokens, and prevents formatter/status implementations from drifting back into the root scene script.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` remain active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1R UI Primitive Factory Split

- Split shared Cocos UI primitive creation out of `assets/scripts/scenes/LootChainGameRoot.ts` into `assets/scripts/scenes/UiPrimitiveFactory.ts`, with Cocos meta `UiPrimitiveFactory.ts.meta`.
- `UiPrimitiveFactory` now owns low-level node composition for labels, edit boxes, password masking, framed inputs, buttons, image buttons, sprites, child labels, account glyphs, rectangles, beveled panels, progress bars, button feedback, pointer hover wiring, and button-frame drawing.
- SpriteFrame resolution/request inside image primitives now goes through the existing `UiSpriteFrameCache`, while Cocos Inspector overrides still come from `LootChainGameRoot`.
- `LootChainGameRoot` keeps thin wrapper methods only, preserving existing renderer host contracts for login, loading, HUD, avatar, background, and profile dialog modules.
- `scripts/check-layout.mjs` now requires `UiPrimitiveFactory.ts`, scans it for forbidden API/economy/gameplay responsibilities, and prevents UI primitive implementation details from returning to the root scene script.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` remain active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1S Content Root Controller Split

- Split Cocos content-root management out of `assets/scripts/scenes/LootChainGameRoot.ts` into `assets/scripts/scenes/UiContentRootController.ts`, with Cocos meta `UiContentRootController.ts.meta`.
- `UiContentRootController` now owns root-size application, `LootChainCocosLoginUIRoot` creation, UI node creation, node removal, content clearing, and content-root validity recovery.
- `LootChainGameRoot` no longer stores `contentRoot`; it delegates `createUiNode()`, `removeNodeFromContent()`, `ensureContentRoot()`, and `applyRootSize()` to the controller.
- Route switching remains in `LootChainGameRoot`, because current root responsibility is still lifecycle plus login/loading/lobby view transitions.
- `scripts/check-layout.mjs` now requires the content-root controller, scans it for forbidden API/economy/gameplay responsibilities, and prevents content-root implementation from returning to the root scene script.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` remain active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1T Chinese Code Comments

- Added Chinese maintainability comments across the current Cocos frontend code path.
- Commented module/class responsibilities and non-obvious logic in the scene root, adaptive layout, status presenter, content-root controller, UI primitive factory, text formatter, SpriteFrame cache, login renderer/flow, lobby HUD modules, loading/profile/background/resource modules, login VFX scripts, API wrappers, token storage, HTTP client, and shared type models.
- Comment style rule for future work: use Chinese comments for module ownership, safety boundaries, async stale-state guards, adaptive layout formulas, resource fallbacks, and placeholder-only restrictions. Avoid line-by-line narration for obvious assignments.
- Existing product boundary remains unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.

## 2026-05-30 Lobby Stage 1U HUD Layout Metrics Split

- Split pure lobby HUD geometry formulas out of `assets/scripts/scenes/lobby/LobbyHudRenderer.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyHudLayout.ts`, with Cocos meta `LobbyHudLayout.ts.meta`.
- `LobbyHudLayout` now owns HUD scale, HUD edge inset, and top-left player-info panel size/position calculation.
- `LobbyHudRenderer` keeps thin wrapper methods for the existing renderer flow, but no longer carries the multi-resolution formulas directly.
- `scripts/check-layout.mjs` now requires the layout module, scans it in the client guard set, and forbids the extracted geometry formulas from drifting back into `LobbyHudRenderer.ts`.
- Chinese comment rule remains active: the new module includes Chinese ownership comments.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
  - `assets/scripts/**/*.ts` Chinese-content scan -> all TypeScript files contain Chinese comments or Chinese UI text.
  - `git diff --check` -> passed, with only existing LF/CRLF conversion warnings.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 2D Readonly Notice Panel

- Added a readonly lobby notice/activity path for the current Cocos-only lobby stage.
- New Cocos files:
  - `assets/scripts/types/LobbyNoticeTypes.ts`
  - `assets/scripts/api/LobbyNoticeApi.ts`
  - `assets/scripts/scenes/lobby/LobbyNoticeState.ts`
  - `assets/scripts/scenes/lobby/LobbyNoticeLoader.ts`
  - `assets/scripts/scenes/lobby/LobbyNoticePanelRenderer.ts`
- The activity entry now opens an API-backed readonly notice panel. Compact small-screen `活动` uses the same panel.
- All non-notice lobby entries remain local unopened placeholders.
- `scripts/check-layout.mjs` now has a readonly lobby API allowlist and verifies `GET /api/player/lobby/notices` plus panel bounds.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` passed.
  - Backend `mvn.cmd --no-transfer-progress -pl lootchain-game -am -DskipTests compile` passed.
- Active Cocos APIs are now `POST /api/player/auth/dev-login`, readonly `GET /api/player/me/lobby`, and readonly `GET /api/player/lobby/notices`. No gameplay/economy write path was opened.

## 2026-05-30 Lobby Stage 2E Modal Blocking And Notice Fallback

- Notice API local failure fallback:
  - backend now returns an empty readonly notice list if the local notice query fails, instead of letting the lobby show `系统异常`.
- Dialog click behavior:
  - `LobbyNoticePanel`, `LobbyProfilePanel`, and `LobbyPlaceholderPanel` now block input events inside the panel.
  - Clicking inside dialog content no longer closes the dialog; only the outer dim layer or explicit close/confirm buttons close it.
- `scripts/check-layout.mjs` now guards these modal input-blocking tokens.

## 2026-05-30 Lobby Stage 1Y HUD Placeholder State And Safety Polish

- Continued the lobby with product, design, art, UI, development, interface-boundary, review, and test roles.
- Updated lobby config so activity and challenge entries no longer look like live operations:
  - activity sublines now use `预览中` / `未开放` / `占位展示` / `暂未开放`;
  - challenge cards now use `预览中` / `锁定` / `未开放` / `占位展示`;
  - bottom navigation red dots are disabled for this local placeholder stage.
- Improved visible HUD quality using Cocos `Graphics` only:
  - bottom HUD now has a darker layered platform and segmented gold top rail;
  - activity rows now use dark-gold banner plates with small preview badges;
  - challenge cards now show local preview/locked badges;
  - bottom navigation slots now have muted metal bases and separators;
  - chat preview now uses a glass ticker style with a separate `[世界]` channel label.
- Top resource bar now keeps stamina as readonly profile data, while coin/ruby/crystal display `未开放` instead of fake wallet-like balances.
- Hardened readonly profile loading:
  - `LobbyProfileLoader.cancel()` invalidates stale profile requests on root destroy and user reset;
  - profile responses whose `profile.userId` does not match the current login user are rejected into local fallback state.
- `scripts/check-layout.mjs` now guards the new HUD polish tokens, profile-loader cancel path, and profile identity mismatch guard.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` remain active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1Z Profile And Placeholder Clarity

- Expanded the readonly player profile dialog without adding any write operation:
  - core rows remain level, exp, combat power, stamina, account status, login method, wallet binding, and masked wallet address;
  - when panel space is available, additional local placeholder rows show main progress, abyss depth, guild, and title.
- Improved unopened-feature dialog copy:
  - subtitle now differentiates readonly/placeholder resources, local chat preview, system placeholder, and gameplay-unopened entries;
  - dialog can show `LobbyPlaceholderBoundaryNote` to state that the entry is local display only and does not write economy data.
- `scripts/check-layout.mjs` now guards the new profile placeholder rows and placeholder-dialog boundary note.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 2A Small-Screen Access And Guardrails

- Continued the remaining lobby work with product, design, art, interface-boundary, review, and test roles.
- Added small-screen scene-entry fallback:
  - desktop and large tablet still use the positioned building plaques and transparent hit areas;
  - smaller layouts render `LobbyCompactSceneEntrances`, a local two/four-column entry panel for all eight scene hotspots;
  - every compact entry still opens the unified unopened dialog and never navigates or calls gameplay/economy APIs.
- Improved top resource UI:
  - resource cells now use dark-gold beveled capsules drawn with Cocos `Graphics`;
  - resource glyphs gained extra highlights/cut lines;
  - when the full resource bar cannot fit, `LobbyCompactStaminaChip` preserves a local stamina entry where space allows.
- Hardened login/resource runtime:
  - `LoginFlow` now has `loginTicket` / `isCurrentLogin()` so stale dev-login responses cannot start a new loading/profile flow after a newer login attempt.
  - `LobbyResourceLoader` now hard-fails missing lobby poster `spriteFrame` instead of constructing a runtime SpriteFrame from texture fallback.
- Strengthened `scripts/check-layout.mjs`:
  - parses `LOBBY_SCENE_HOTSPOTS` from config instead of checking a duplicate hard-coded hotspot list;
  - checks hotspot normalized bounds and keeps config data-only;
  - guards compact scene entries, compact stamina chip, resource capsules, login ticket, resource loader hard-fail behavior, and non-stamina resource placeholders;
  - adds threshold viewports around 719/720, 1000x519, and 1180x500.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` remain active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1X Multi-Role Lobby Polish

- Advanced the lobby through product, design, art, UI, development, interface-boundary, review, and test roles.
- Added local readonly placeholder feedback for the top resource bar. Clicking stamina/coin/ruby/crystal now opens the unified unopened dialog; stamina explains it comes from readonly profile data, while other resources are explicitly marked as visual placeholders.
- Added local placeholder feedback for the bottom chat preview. Clicking chat opens the unified unopened dialog and does not create a send box or chat-service call.
- Hardened runtime cleanup:
  - `UiContentRootController.clear()` now destroys old children instead of only removing them.
  - `LobbyLoadingFlow.cancel()` invalidates stale loading callbacks during root destroy.
  - Lobby background resize/resource-refresh paths preserve the current background video where possible instead of forcing a stop/play rebuild.
  - Narrow top HUD now hides right-side system icons when they would collide with the player panel.
- Improved lobby visual depth with a local Cocos `LobbyAtmosphereOverlay`, darker stage edge pressure, richer central hotspot plaques, and heavier pseudo-illustration treatment on right challenge cards.
- Strengthened `scripts/check-layout.mjs`:
  - resource/chat placeholder tokens,
  - HUD click-contract guard,
  - content-root destroy guard,
  - loading cancel guard,
  - background preserve/resize guard,
  - system-icon overlap handling,
  - additional viewport threshold checks.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
  - `git diff --check` -> passed, with only existing LF/CRLF conversion warnings.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1W Unified Placeholder Dialog

- Stopped further lobby modularization for this stage and moved to visible product behavior polish.
- Added a unified local unopened-feature dialog for lobby placeholder entries: activity rail, central scene hotspots, right challenge cards, bottom navigation, adventure button, and top-right system icons.
- The dialog uses adaptive stage-safe sizing and dark-gold Cocos UI styling, with nodes `LobbyPlaceholderDim` and `LobbyPlaceholderPanel`.
- The dialog is local feedback only. It does not navigate to gameplay pages, does not call gameplay APIs, and does not create any economy write path.
- `scripts/check-layout.mjs` now guards the placeholder dialog methods, nodes, and multi-resolution panel bounds.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
  - Touched-code Chinese comment/text scan -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1V Top HUD Renderer Split

- Split the lobby top HUD rendering out of `assets/scripts/scenes/lobby/LobbyHudRenderer.ts`.
- New module: `assets/scripts/scenes/lobby/LobbyTopHudRenderer.ts`, with Cocos meta `LobbyTopHudRenderer.ts.meta`.
- `LobbyTopHudRenderer` now owns the top-left player info panel, top resource bar, and top-right system icon group.
- `LobbyHudRenderer` now delegates the top HUD through `topHudRenderer.render(layout)` and keeps activity rail, scene hotspots, challenge rail, and bottom HUD.
- `LobbyHudLayout.ts` remains the single geometry source for HUD scale, edge inset, and player-info panel bounds, so both top HUD and the rest of the lobby overlay share the same adaptive formulas.
- `scripts/check-layout.mjs` now requires and scans the top HUD renderer, requires key player/resource/system-icon tokens there, and forbids that implementation from drifting back into `LobbyHudRenderer.ts`.
- Chinese comment rule remains active: the new top HUD module includes Chinese ownership and safety comments.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
  - `assets/scripts/**/*.ts` Chinese-content scan -> all TypeScript files contain Chinese comments or Chinese UI text.
  - `git diff --check` -> passed, with only existing LF/CRLF conversion warnings.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 2B Multi-Role Lobby Polish And Safety

- Current working path is `D:\business\project\lootchain-cocos`; older document entries may still mention the previous `D:\project\lootchain-cocos` path.
- Continued the remaining lobby work through product, design, art/UI, development, interface-boundary, review, and test roles.
- Visual/UI updates:
  - central building plaques now use richer dark-gold layered nameplates and all hotspot `hot` flags are disabled while entries remain placeholders;
  - right-side challenge cards now use polygonal dark-gold card traces plus a side rail instead of plain rectangular blocks;
  - bottom HUD now has a three-layer stepped black-gold platform, subtle red glow zones, and the adventure subtitle now shows `未开放` instead of fake chapter progress;
  - profile dialog now uses a safety-zone based dialog scale and switches to a single-column row layout on narrow panels, preventing avatar/text/row overlap.
- Runtime safety update:
  - `PlayerAuthApi.devLogin()` no longer writes the token immediately;
  - `LoginFlow` saves the token only after the current login ticket passes stale-response validation;
  - `LootChainGameRoot.onDestroy()` now cancels pending login callbacks.
- Guardrail updates:
  - `scripts/check-layout.mjs` now guards the new plaque/card/platform/profile-dialog tokens;
  - checks that unopened lobby config does not show `hot: true`;
  - checks preserve-background refresh order, stale-safe auth token saving, fixed readonly resource order, and disabled resource plus signs.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Poster SpriteFrame Import Fix

- Fixed the login-to-lobby loading error: `Bundle resources doesn't contain lobby/lobby_bg_poster/spriteFrame`.
- Root cause: `assets/resources/lobby/lobby_bg_poster.jpg.meta` had been imported as `texture` only, so Cocos had no `spriteFrame` sub-resource for `LobbyResourceLoader`.
- The lobby poster meta now includes a `spriteFrame` sub-meta for the 3840x2160 image while keeping the existing texture sub-resource.
- `scripts/check-layout.mjs` now requires `lobby_bg_poster.jpg.meta` and verifies that the poster remains a 3840x2160 `sprite-frame` import, so this regression is caught before preview.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
- Boundary unchanged: this only fixes local asset import metadata; no gameplay/economy endpoint was opened.

## 2026-05-30 Lobby Stage 2C Compact Action Access

- Added `LobbyCompactActionEntrances` for small or compressed lobby layouts where side rails or the bottom HUD are hidden.
- The compact action panel exposes local placeholder shortcuts for `活动`、`挑战`、`冒险`、`聊天`、`英雄`、`背包`、`任务`、`商店`.
- These shortcuts only open the unified unopened dialog. They do not navigate to gameplay, do not call battle/settlement/reward APIs, and do not create any economy write path.
- `LootChainGameRoot.rerenderLobbyOverlay()` now removes `LobbyCompactActionEntrances` and `LobbyCompactSceneEntrances` before redrawing, preventing duplicate compact panels after resize/profile refresh.
- `scripts/check-layout.mjs` now guards the compact action renderer tokens and checks its adaptive bounds across the existing viewport matrix.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active; no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 2F Readonly Codex Panel

- Added a Cocos-only readonly hero codex panel for the bottom `图鉴` entry and compact `图鉴` shortcut.
- New frontend modules:
  - `assets/scripts/types/LobbyCodexTypes.ts`
  - `assets/scripts/api/LobbyCodexApi.ts`
  - `assets/scripts/scenes/lobby/LobbyCodexState.ts`
  - `assets/scripts/scenes/lobby/LobbyCodexLoader.ts`
  - `assets/scripts/scenes/lobby/LobbyCodexPanelRenderer.ts`
- The client calls only `GET /api/player/lobby/codex`, a narrow lobby facade endpoint. It does not call the broader hero controller that contains growth write operations.
- The panel displays collection, owned count, rarity/faction/class/role, and readonly status. It has no upgrade, star-up, awaken, refine, acquire, reward, purchase, sell, gacha, settlement, or economy write action.
- EX content is filtered on both sides: backend filters locked/EX records, and the Cocos API wrapper filters `EX` rarity and `EX_` hero codes again before rendering.
- Modal behavior follows the current lobby rule: clicks inside the panel are blocked by `BlockInputEvents`; only the outer dim layer or explicit close button closes it.
- `scripts/check-layout.mjs` now validates the codex API allowlist, stale-request loader, modal blocking, EX filtering, and multi-resolution panel bounds.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
  - Backend `mvn.cmd --no-transfer-progress -pl lootchain-game -am -DskipTests compile` -> passed.
- Boundary unchanged: no economy rule changes, no EX V1 opening, and no new economy write entry.

## 2026-05-30 Normal Player Flow Analysis

- Added `docs/normal-player-flow-analysis.md` to define what a normal player should do after login.
- Multi-role conclusion: the next stage should move from lobby placeholders toward the first real gameplay loop, centered on `冒险/战役`.
- Recommended next stage: `Stage 3A` with lobby adventure CTA, readonly mainline recommendation state, and a readonly chapter-map shell.
- Full intended loop: login -> account state -> lobby target -> adventure -> team confirmation -> battle -> settlement -> growth -> back to lobby.
- Safety boundary: battle settlement and rewards must be backend-owned later; the current analysis does not change economy rules, does not open EX V1, and does not add an economy write entry.

## 2026-05-30 Protagonist Create Design

- Added `docs/protagonist-create-design.md` for the login-success protagonist creation flow.
- Generated and archived a cinematic UI concept image at `docs/ui-reference/protagonist/protagonist-create-concept-v1.png`.
- Product direction: after login, a new account should create a main protagonist before entering the lobby; existing accounts skip this step.
- Protagonist rules:
  - male/female selection plus character name;
  - unique `SSR 主角`, not a gacha-pool hero;
  - appears as the first hero card in the hero list;
  - can join battle;
  - has Attack, Defense, and Support forms, with Attack unlocked by default and other forms unlocked by mainline story progress/items.
- Recommended next frontend stage: `Stage P1` protagonist creation shell with Cocos UI, adaptive layout, native text/input/button controls, and local flow into the lobby.
- Backend creation is a high-risk player-state write and should be handled in a separate reviewed stage. Boundary unchanged: no economy rule changes, no EX V1 opening, and no economy write entry added in this design pass.

## 2026-05-30 Protagonist Stage P1 Cocos Shell

- Implemented the first Cocos-only protagonist creation shell.
- New modules:
  - `assets/scripts/types/ProtagonistTypes.ts`
  - `assets/scripts/scenes/protagonist/ProtagonistCreateState.ts`
  - `assets/scripts/scenes/protagonist/ProtagonistCreateFlow.ts`
  - `assets/scripts/scenes/protagonist/ProtagonistCreateRenderer.ts`
- Login success now routes through the protagonist flow before lobby loading.
- New local view: `protagonistCreate`.
- New accounts in local preview see male/female protagonist selection, name input, SSR protagonist framing, and Attack/Defense/Support form preview.
- Attack form is unlocked by default; Defense and Support stay locked with mainline-unlock copy.
- The shell stores preview-only local state under `lootchain.protagonist.preview.v1.{userId}` so repeat preview logins can skip creation.
- No backend protagonist creation API was added in this stage. No database write, no economy write, and no EX V1 opening.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.

### Protagonist Character Art Patch

- Cropped male/female protagonist card art from the generated concept image and added it to Cocos resources:
  - `assets/resources/ui/protagonist/protagonist_male_attack.png`
  - `assets/resources/ui/protagonist/protagonist_female_attack.png`
- Added image `.meta` files and required resource checks.
- `ProtagonistCreateRenderer.ts` now loads these SpriteFrames into the male/female cards first and uses the old Cocos silhouette only as a fallback.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.

### Protagonist Generated Art Replacement

- Replaced the first cropped protagonist card images with newly generated high-quality cinematic card art.
- Resource paths stay unchanged, so `ProtagonistCreateRenderer.ts` still loads:
  - `assets/resources/ui/protagonist/protagonist_male_attack.png`
  - `assets/resources/ui/protagonist/protagonist_female_attack.png`
- The existing `.meta` files were preserved, and the PNGs were resized to the current `512x768` SpriteFrame card size.
- This is a local UI asset replacement only. No backend API, database write, economy rule, or EX V1 behavior was changed.

### Protagonist DB Sync Stage

- Added backend-backed protagonist creation to the Cocos flow.
- After `dev-login`, the client calls `GET /api/player/protagonist/state`.
- If no protagonist exists, the create page calls `POST /api/player/protagonist` with only `gender` and `protagonistName`.
- The old local preview state remains only as a diagnostic mirror; it is no longer authoritative for skipping the create page.
- The backend creates `player_protagonist` plus a `user_hero` instance marked `source_type=PROTAGONIST`.
- Boundary unchanged: no gacha, reward, purchase, settlement, fund-pool, chain-claim, or EX V1 path was opened.

## 2026-05-30 Lobby Stage 2G Readonly Hero Roster

- Added a Cocos-only readonly hero roster panel for the bottom `英雄` entry and compact `英雄` shortcut.
- New frontend modules:
  - `assets/scripts/types/LobbyHeroTypes.ts`
  - `assets/scripts/api/LobbyHeroApi.ts`
  - `assets/scripts/scenes/lobby/LobbyHeroRosterState.ts`
  - `assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts`
  - `assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts`
- The client calls only `GET /api/player/lobby/heroes`, a narrow lobby facade endpoint. It does not call the broader hero controller that contains growth write operations.
- The panel pins `protagonist=true` heroes first, displays SSR protagonist form state, level, star, and power, and has no upgrade, star-up, awaken, refine, gacha, reward, purchase, sell, settlement, or economy write action.
- EX content is filtered on both sides: backend filters EX records, and the Cocos API wrapper filters `EX` rarity and `EX_` hero codes again before rendering.
- Modal behavior follows the current lobby rule: clicks inside the panel are blocked by `BlockInputEvents`; only the outer dim layer or explicit close button closes it.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
  - Backend `mvn.cmd --no-transfer-progress -pl lootchain-core "-Dtest=PlayerLobbyHeroServiceImplTest,PlayerProtagonistServiceImplTest" test` -> passed.
  - Backend `mvn.cmd --no-transfer-progress -pl lootchain-admin,lootchain-game -am -DskipTests compile` -> passed.
- Boundary unchanged: no economy rule changes, no EX V1 opening, and no new economy write entry.

## 2026-05-31 Lobby Stage 3A Readonly Adventure Shell

- Added the first playable-flow bridge after the lobby: the right-bottom `冒险` button and compact `冒险` shortcut now open a Cocos-only mainline adventure panel.
- New frontend modules:
  - `assets/scripts/types/LobbyAdventureTypes.ts`
  - `assets/scripts/api/LobbyAdventureApi.ts`
  - `assets/scripts/scenes/lobby/LobbyAdventureState.ts`
  - `assets/scripts/scenes/lobby/LobbyAdventureLoader.ts`
  - `assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts`
- The client calls only `GET /api/player/lobby/adventure`, a narrow readonly lobby facade.
- The panel shows current chapter, recommended stage, level requirement, recommended power, enemy summary, reward-preview text, and a disabled `编队未开放` button.
- The lobby adventure CTA subtitle now reads from the loaded readonly recommendation state when available, falling back to `主线 1-1 暗影城门` before the API response arrives.
- Modal behavior follows the lobby rule: clicks inside the panel are blocked by `BlockInputEvents`; only the outer dim layer or explicit close button closes it.
- `scripts/check-layout.mjs` now validates the adventure API allowlist, module files, panel bounds across supported viewports, and the HUD click contract for `openLobbyAdventurePanel()`.
- Boundary unchanged: no team save, no battle start, no settlement, no stamina cost, no reward grant, no economy rule changes, and no EX V1 opening.

## 2026-05-31 Lobby Stage 3B Readonly Formation Shell

- Added the next local flow step after adventure stage details: unlocked adventure stages can open a readonly `编队确认` panel.
- New frontend module:
  - `assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts`
- The formation shell reuses the existing readonly hero roster state from `GET /api/player/lobby/heroes`; no new backend write endpoint was added.
- The panel displays five default slots, pins the protagonist as the first/leader candidate when available, and lists candidate heroes for scanability.
- `战斗未开放` is a disabled visual state only. There is no team-save, battle-start, settlement, stamina-cost, reward-grant, or economy write action.
- `scripts/check-layout.mjs` now validates the formation module, modal bounds, root wiring, and `BlockInputEvents` behavior.

## 2026-05-31 Lobby Stage 3C Local Battle Preview Shell

- Continued the normal play path from `Adventure detail -> Formation confirm -> Battle preview`.
- New frontend module:
  - `assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts`
- The formation footer now exposes `Battle Preview`, which opens a local-only battle presentation shell.
- The preview renders ally slots from the readonly hero roster state, keeps the protagonist first when present, and shows placeholder enemy units plus a battle log.
- The preview has no battle-session creation, no team-save, no settlement, no stamina cost, no progress write, no reward grant, no economy rule change, and no EX V1 opening.
- Modal behavior follows the lobby rule: `BlockInputEvents` blocks clicks inside the panel; only the dim layer or explicit back button closes it.
- `scripts/check-layout.mjs` now validates the battle-preview module, root wiring, modal node names, `BlockInputEvents`, disabled settlement button, and responsive bounds.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed.

## 2026-05-31 Lobby Stage 4A Backend Battle Session And No-Reward Settlement

- Continued the playable flow from `Adventure -> Formation -> Battle Preview` into real backend battle-session APIs.
- New frontend files:
  - `assets/scripts/types/BattleTypes.ts`
  - `assets/scripts/api/BattleApi.ts`
  - `assets/scripts/scenes/lobby/LobbyBattleState.ts`
  - `assets/scripts/scenes/lobby/LobbyBattleFlow.ts`
- `LobbyBattlePreviewPanelRenderer.ts` now renders backend battle session state, no-reward settlement state, errors, and a return-to-lobby action.
- New backend endpoints consumed by Cocos:
  - `POST /api/player/battles/start`
  - `POST /api/player/battles/{battleNo}/settle`
- The frontend only sends `stageCode`, owned hero ids, leader hero id, request id, and client metadata. It never sends rewards, resource deltas, stamina deltas, progress, drops, or hero attributes.
- `BattleApi` validates that backend settlement keeps `readonlyEconomy=true` and `rewardGranted=false`.
- `scripts/check-layout.mjs` now requires the battle API/types/flow/state files and guards against EX content and accidental economy semantics in the battle response.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed.
  - Backend `PlayerBattleServiceImplTest`, adventure, hero roster, and protagonist tests -> passed.
  - Backend `lootchain-admin,lootchain-game` compile -> passed.
- Local database migration `sql/13_battle_session_module.sql` was executed through JDBC; `battle_session` and `battle_settlement` exist in the local `lootchain` schema.
- Boundary unchanged: no stamina cost, no progress write, no reward grant, no bag/currency/USDT/fund-pool write, no economy rule change, and no EX V1 opening.

## 2026-05-31 Stage 4B Player Flow Smoke Verification

- Backend project added `D:\business\project\LootChain\scripts\smoke-player-flow.ps1`.
- The script verifies the current Cocos path against `lootchain-game`:
  `dev-login -> protagonist state -> lobby profile -> adventure -> hero roster -> battle start -> no-reward settlement -> lobby profile re-read`.
- Local verification passed against `http://localhost:8081` with `userId=1` and `MAIN_1_1`.
- The script confirmed:
  - battle routes are exposed by the running server;
  - the legal lineup used `heroIds=4,1,2`;
  - battle start returned `readonlyEconomy=true`;
  - settlement returned `rewardGranted=false` and `readonlyEconomy=true`;
  - stamina stayed `100 -> 100`;
  - combat power stayed `15448 -> 15448`.
- This is still a no-reward battle-record loop. It does not unlock stamina cost, progress writes, rewards, bag/currency/USDT/fund-pool writes, or EX V1.

## 2026-05-31 Lobby Stage 4C Battle Presentation Pass

- Fixed the compact/mobile adventure path: `LobbyAdventureCompactFormationButton` now lets narrow layouts continue from adventure to formation.
- Renamed reward copy in the adventure detail from pure drop language to `关卡配置预览（当前不发放）`.
- Added battle presentation helpers:
  - `assets/scripts/scenes/lobby/LobbyBattlePresentationLayout.ts`
  - `assets/scripts/scenes/lobby/LobbyBattlePresentationState.ts`
- Reworked `LobbyBattlePreviewPanelRenderer.ts` from a list-style preview into a battle presentation panel:
  - cinematic dark backdrop;
  - ally/enemy actor lanes;
  - HP bars;
  - timeline/boundary badge;
  - hit effect layer and damage text;
  - compact footer layout for narrow screens;
  - result state that only says battle record completed, with no reward claim UI.
- `scripts/check-layout.mjs` now guards the compact formation CTA, battle presentation modules, cinematic backdrop, actor/effect nodes, footer behavior, and no-reward wording.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` passed.
  - Backend smoke script passed again: `rewardGranted=false`, `readonlyEconomy=true`, stamina `100 -> 100`, combat power `15448 -> 15448`.
- Stage 4D guardrail follow-up:
  - `LobbyBattlePresentationLayout.ts` now reduces actor count in extreme compact panels and keeps log width clear of actor lanes.
  - `scripts/check-layout.mjs` now checks battle actors, log, and footer buttons for internal bounds and overlap across the viewport matrix.
- Boundary unchanged: no stamina cost, no progress write, no reward grant, no bag/currency/USDT/fund-pool write, no economy rule change, and no EX V1 opening.

## 2026-05-31 Lobby Stage 4E Local Battle Timeline

- Added a local-only presentation timeline to `LobbyBattleFlow`.
- After the backend battle session is created, the panel advances through several visual steps before settlement can be recorded.
- `LobbyBattleState` now tracks `presentationStep` and `presentationComplete`.
- While the local presentation is running, the action button shows `演出中` through `LobbyBattlePlaybackPending` and does not call settlement.
- `LobbyBattlePresentationState` now drives timeline text, log lines, damage text, and lead enemy HP display from the current visual step.
- This timeline is presentation-only. It does not decide combat authority, rewards, stamina, progress, drops, or resources.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos TypeScript check passed.

## 2026-05-31 Lobby Stage 4F Selected Stage Propagation

- The adventure-to-battle path now keeps the selected stage explicit through `Adventure detail -> Formation confirm -> Battle preview -> battle start`.
- `LobbyAdventurePanelRenderer.ts` passes the actual `stageCode` from both detail and compact adventure entry buttons.
- `LobbyFormationPanelRenderer.ts` displays the current target stage and starts battle preview using the selected stage held by `LootChainGameRoot`.
- `LootChainGameRoot.ts` owns `selectedLobbyStageCode`; missing, empty, or `EX_` stage codes now stop the flow, show `关卡选择已失效，请重新选择主线关卡。`, and return to the adventure panel.
- `LobbyBattleFlow.ts` no longer silently falls back to `MAIN_1_1` when a stage is missing or illegal.
- `scripts/check-layout.mjs` guards the selected-stage propagation and the no-silent-fallback rule.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos TypeScript check passed.
  - Backend player-flow smoke passed again with `rewardGranted=false`, `readonlyEconomy=true`, stamina `100 -> 100`, and combat power `15448 -> 15448`.
  - Backend player-flow smoke also passed with non-default `StageCode=MAIN_1_2`, confirming the battle API echoes and records the selected stage without reward/economy changes.
- Boundary unchanged: this stage only preserves the selected stage. It does not save teams, spend stamina, write mainline progress, grant rewards, write bag/currency/USDT/fund-pool state, change economy rules, or open EX V1.

## 2026-05-31 Lobby Stage 4H Battle Stage Visibility

- Battle presentation copy now keeps the target stage visible to the player.
- The ready state subtitle shows `目标关卡 {stageCode}` before the battle session is created.
- The recorded-result state shows the settlement `stageCode` in both the subtitle and battle log.
- `scripts/check-layout.mjs` guards this copy so future battle UI changes do not hide the selected stage.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos TypeScript check passed.
- Boundary unchanged: display-only change, no backend contract change, no stamina/progress/reward/economy write, and no EX V1 opening.

## 2026-05-31 Lobby Stage 4I Formation Explicit Battle Stage

- The formation panel now passes its visible target `stageCode` directly into battle preview.
- `LootChainGameRoot.openLobbyBattlePreviewPanel(stageCode: string)` no longer uses an implicit previous selected stage fallback.
- Frontend stage normalization now only accepts `MAIN_数字_数字` codes, preventing display text such as `未选择关卡` from becoming a stage value.
- `scripts/check-layout.mjs` guards explicit formation-to-battle stage propagation.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos TypeScript check passed.
- Boundary unchanged: frontend state-flow hardening only, no backend contract change and no economy write.

## 2026-05-31 Lobby Stage 4J Return-To-Lobby Refresh

- Returning from the battle recorded-result panel now cleans up the local battle flow and refreshes readonly lobby data.
- `returnToLobbyFromBattlePreview()` calls `lobbyBattleFlow.cancel()` before closing panels, then reloads lobby profile, adventure state, and hero roster.
- `LobbyBattleFlow` now uses the same `MAIN_数字_数字` stage-code shape guard as the root flow.
- `scripts/check-layout.mjs` guards the return-to-lobby refresh path.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos TypeScript check passed.
- Boundary unchanged: readonly refresh and local timer cleanup only, no backend contract change and no economy write.

## 2026-05-31 Lobby Stage 4K New Player Full-Flow Smoke

- Current playable Cocos path has been verified end to end for a fresh local player:
  `dev-login -> protagonist state empty -> create SSR protagonist -> lobby profile -> hero roster -> adventure -> MAIN_1_1 battle start -> no-reward settlement -> lobby profile reread`.
- Backend project added `D:\business\project\LootChain\scripts\smoke-new-player-flow.ps1`.
- The smoke script creates only a local `game_user` shell for QA, then uses player APIs for protagonist and hero creation.
- It verifies:
  - created protagonist is SSR and defaults to attack form;
  - defense/support forms remain locked;
  - repeated create returns the existing protagonist and does not create another `player_protagonist` or `PROTAGONIST` `user_hero`;
  - hero roster keeps the protagonist as the first item;
  - battle start uses explicit `MAIN_1_1`;
  - settlement stays `rewardGranted=false` and `readonlyEconomy=true`;
  - stamina and combat power are unchanged after settlement.
- Latest local verification used `userId=12`, `protagonistHeroId=9`, `battleNo=Bf8f08ea10fc945ab9022db1bbfa3f548`, and `settlementNo=S52c47a1c10ba4ec9ba9733c9e4216a90`.
- Additional verification in this pass:
  - `npm.cmd run check:layout` passed.
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` passed.
  - Backend `PlayerProtagonistServiceImplTest` and `PlayerBattleServiceImplTest` passed.
  - `smoke-player-flow.ps1 -UserId 1 -StageCode MAIN_1_2` passed.
  - `smoke-battle-stage-guard.ps1` passed for `MAIN_9_9` and `EX_1_1`, with `battle_session` rows staying `0 -> 0`.
- Boundary unchanged: this stage only adds verification coverage and a local QA script. It does not open rewards, stamina cost, progress writes, bag/currency/USDT/fund-pool writes, EX V1, or any new economy write entry.

## 2026-05-31 Lobby Stage 4L Frontend Repeat-Submit Guard

- Added Cocos UI/state guards for the P0 duplicate-click risks found by the review agent.
- `ProtagonistCreateFlow.submitCreate()` now returns immediately while `creating=true`; the create button is also non-interactable during creation.
- `LootChainGameRoot.openLobbyBattlePreviewPanel()` and the async hero-roster callback now check the same selected stage and current battle-flow busy state before auto-starting battle.
- `LobbyBattleFlow.start()` now blocks repeated battle-start POSTs for the same stage while a session is starting, started, settling, or settled.
- `LobbyBattleFlow.settle()` now also returns when a settlement already exists.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 `tsc.cmd --noEmit` passed for protagonist and battle flow files.
- Boundary unchanged: frontend debounce/state hardening only. No backend contract change, no reward, no stamina cost, no progress write, no bag/currency/USDT/fund-pool write, no EX V1, and no new economy write entry.

## 2026-05-31 Lobby Stage 4M Battle Resume And Contract Hardening

- Fixed a real Cocos protagonist-create break: `ProtagonistApi.create()` now returns the backend POST result instead of being swallowed by a bad inline comment, and validates protagonist state/create responses before entering lobby.
- `LootChainGameRoot.openLobbyBattlePreviewPanel()` now reopens an existing same-stage battle state instead of silently blocking after the player returns from battle preview to formation.
- `returnToLobbyFromBattlePreview()` now clears the local battle snapshot with `lobbyBattleFlow.cancel(true)`, so the same stage can be entered again after the recorded-result flow returns to lobby.
- `BattleApi` no longer falls back to `MAIN_1_1` when the backend omits/changes `stageCode`; battle start must echo the requested `MAIN_x_y`, and settlement must match the session stage.
- `LobbyAdventureApi` filters illegal/EX stages before they reach the adventure UI, and `LobbyHeroApi` filters `id<=0` heroes so formation does not show units that battle start will later reject.
- `scripts/check-layout.mjs` now guards these Stage 4M contracts.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 `tsc.cmd --noEmit` passed.
  - `smoke-player-flow.ps1 -UserId 1 -StageCode MAIN_1_2` passed: `battleNo=B161c2bdd5a2b4314b2c047cca6f053c6`, `settlementNo=S098d0cf575a04c3d8daf4a52e7db8c61`.
  - `smoke-new-player-flow.ps1 -StageCode MAIN_1_1 -Gender female` passed with `userId=13`, `protagonistHeroId=10`, `battleNo=Bffd294803cb74937a1d5776bec5a932d`.
  - `smoke-battle-stage-guard.ps1` passed for `MAIN_9_9` and `EX_1_1` with `battle_session` rows staying `0 -> 0`.
- Boundary unchanged: no backend API or SQL change, no reward, stamina cost, progress write, bag/currency/USDT/fund-pool write, EX V1, or new economy write entry.

## 2026-05-31 Lobby Stage 4N Compact Responsive Hardening

- Hardened Cocos-only responsive layout for the current playable flow.
- `LobbyHudRenderer` now keeps compact action access available down to short viewports; below `300px` stage height it prioritizes `公告 / 冒险 / 英雄 / 图鉴`, while decorative scene shortcut panels wait until there is enough vertical room.
- `ProtagonistCreateRenderer` now uses tighter compact controls and a dense form-chip layout so the name input and `进入游戏` button do not touch or overlap on portrait/narrow screens.
- `LobbyFormationPanelRenderer` now sizes compact formation rows from the available body height, keeping five slots inside the panel without pressing into the footer.
- `LobbyBattlePresentationLayout` now separates the battle field from boundary text and footer buttons in very short panels.
- `scripts/check-layout.mjs` now verifies new compact viewports `390x300` and `360x240`, checks protagonist input/button spacing, formation internal bounds, and battle field/boundary/footer non-overlap.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 `tsc.cmd --noEmit` passed.
- Boundary unchanged: frontend layout only. No backend API/SQL change, no reward, stamina cost, progress write, bag/currency/USDT/fund-pool write, EX V1, or new economy write endpoint.

## 2026-05-31 Lobby Stage 4O Local Formation Selection

- Added local formation confirmation for the Cocos lobby flow.
- `LobbyFormationPanelRenderer` now lets the player click candidate heroes to add/remove them from the current battle lineup; the protagonist remains fixed as the leader.
- `LootChainGameRoot` now owns `selectedLobbyFormationHeroIds`, reconciles it after hero roster loads, and refreshes the formation panel when the local lineup changes.
- `LobbyBattleFlow` now sends the confirmed local lineup to the existing `POST /api/player/battles/start` request instead of always using the default top-power roster.
- This is not a saved team feature: no new backend endpoint, SQL table, long-term formation save, reward, stamina, progress, bag/currency/USDT/fund-pool write, or EX V1 path was opened.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 `tsc.cmd --noEmit` passed.
  - `git diff --check` passed for the Cocos project.

## 2026-05-31 Lobby Stage 4P Player API Phase Gate

- Backend added a current Cocos phase player API whitelist; Cocos docs must now treat it as active by default.
- Cocos-side change:
  - `assets/scripts/api/GachaApi.ts` now fails closed in `draw()` with "当前 Cocos 阶段未开放抽卡" instead of POSTing `/api/player/gacha/draw`.
  - `scripts/check-layout.mjs` now guards that draw remains client-blocked during this phase.
- Current playable API surface remains:
  - dev login;
  - protagonist state/create;
  - lobby readonly profile/notices/codex/heroes/adventure;
  - battle start and no-reward settlement.
- Economy/growth routes remain blocked: gacha draw, hero growth, bag use, full hero/bag/gacha endpoints, rewards, currency, USDT, fund pool, and EX V1.
- Verification:
  - Cocos `npm.cmd run check:layout` passed.
  - Focused Cocos TypeScript check for `GachaApi` passed.
  - Backend `PlayerApiPhaseGateTest` passed.
  - Backend game/admin compile passed.

## 2026-05-31 Lobby Stage 4Q Battle Start Idempotency Contract

- Backend tightened the existing `POST /api/player/battles/start` contract.
- Cocos already sends explicit `requestId`, `stageCode`, `heroIds`, and `leaderHeroId`; that request must now stay stable when retried.
- Reusing a `requestId` with different stage, lineup, or leader now fails on the backend instead of returning an old session.
- Cocos implication:
  - do not reuse a battle start `requestId` after the player changes formation or stage;
  - current `LobbyBattleFlow` already creates a fresh `battle-start-*` request ID per start attempt.
- Verification:
  - backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed;
  - backend game/admin compile passed.
- Boundary unchanged: no reward, stamina, progress, bag/currency/USDT/fund-pool write, EX V1, or new economy route opened.

## 2026-05-31 Lobby Stage 4R Battle Settlement No-Economy Persistence

- Backend `battle_settlement` now persists explicit no-economy flags for the current Cocos battle result records.
- Persisted flags:
  - `settlement_mode='NO_REWARD'`
  - `reward_granted=0`
  - `readonly_economy=1`
  - `economy_applied=0`
- Local MySQL schema was migrated with `D:\business\project\LootChain\sql\14_battle_settlement_guard_flags.sql`.
- Cocos impact:
  - settlement response still reports `rewardGranted=false` and `readonlyEconomy=true`;
  - no client behavior change is required;
  - future reward/progress work must check these persisted flags before any real economy settlement.
- Verification:
  - local MySQL column check passed;
  - backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed;
  - backend game/admin compile passed.
- Boundary unchanged: no reward, stamina, progress, bag/currency/USDT/fund-pool write, EX V1, or economy route opened.

## 2026-05-31 Lobby Stage 4S Latest-Code Flow Smoke Guard

- Backend `lootchain-game` was restarted from current source on port `8081` before HTTP smoke verification.
- Backend added `D:\business\project\LootChain\scripts\smoke-cocos-current-flow.ps1` as a current Cocos phase guard smoke.
- Current Cocos playable path verified against the restarted backend:
  - existing player dev-login -> lobby -> heroes -> adventure -> battle start -> no-reward settlement -> lobby reread;
  - fresh player local QA shell -> dev-login -> protagonist create -> hero roster first protagonist -> protagonist-only battle -> no-reward settlement;
  - invalid `MAIN_9_9` and `EX_1_1` battle stages rejected before `battle_session` insert;
  - forbidden player endpoints for gacha, bag, and hero growth are blocked by backend phase gate;
  - economy snapshots stay unchanged around blocked calls and no-reward settlement;
  - settlement DB row persists `NO_REWARD`, `reward_granted=0`, `readonly_economy=1`, and `economy_applied=0`.
- Cocos code behavior did not change in this stage; this is latest-code integration verification and documentation sync.
- Boundary unchanged: no reward, stamina, progress, bag/currency/USDT/fund-pool write, EX V1, or economy route opened.

## 2026-05-31 Lobby Stage 4T Recent Battle Readback And Micro Viewport Guard

- Added Cocos support for the backend readonly recent battle record endpoint:
  - `BattleApi.recentBattles()` reads `GET /api/player/battles/recent`;
  - `LobbyBattleFlow` caches recent records and refreshes lobby overlays without writing rewards, stamina, progress, bag, currency, USDT, or fund-pool data;
  - `LobbyAdventurePanelRenderer` shows a compact "recent no-reward challenge" summary beside the recommended stage.
- Hardened physical viewport adaptation for Cocos Preview/browser cases where the design resolution remains `1920x1080` while the actual browser viewport is much smaller:
  - `UiLayout` now carries `viewportWidth` and `viewportHeight`;
  - `LootChainGameRoot.makeLayoutKey()` includes the physical viewport key, so HUD overlays rerender when only the browser viewport changes;
  - `LobbyHudRenderer` has a micro HUD path for `<640px` width or `<420px` height, keeping player entry, stamina, and `公告/冒险/英雄/图鉴` visible.
- `scripts/check-layout.mjs` now mirrors this physical viewport mode and includes `390x300` / `390x340` design-resolution Preview guard cases.
- Verification:
  - Cocos `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 TypeScript check passed.
  - Backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed.
  - Backend `lootchain-admin,lootchain-game -am -DskipTests compile` passed.
  - Backend current-flow smoke passed and verified recent battle readback for settlement `Sf11d24af1cab49fe9a6560f5b7d0d4d6`.
- Note: the old running Cocos Preview on port `7456` was serving stale compiled script cache during visual QA; source checks and layout guards are current, and Creator Preview should be restarted/reopened before visual screenshot acceptance.
- Boundary unchanged: the new endpoint is GET-only and read-only. No reward, stamina cost, progress write, bag/currency/USDT/fund-pool mutation, EX V1, or economy write endpoint was opened.

## 2026-05-31 Stage 4U Verification Refresh And Preview Reimport Gate

- Supervisor agent remains active as the user-perspective reviewer until the whole playable loop is visually accepted.
- Re-ran latest-code verification on 2026-05-31:
  - Cocos `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 TypeScript check passed.
  - Backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed.
  - Backend `lootchain-admin,lootchain-game -am -DskipTests compile` passed.
  - Current-flow smoke passed: `battleNo=Bf09e32b56989422085f2c35e00c94b58`, `settlementNo=S8901223518b349639c56a0297fe30bb9`.
  - Fresh-player smoke passed: created user `16`, protagonist hero `13`, `battleNo=Bbad8694fd4234ba68c1844cedb37210e`, `settlementNo=Sa18861ae01c7410ebf7e8d6c107b6e14`.
  - Stage guard smoke passed for `MAIN_9_9` and `EX_1_1`, with no `battle_session` insert.
- Live Preview cache status:
  - `http://localhost:7456/scripting/x/import-map.json` still maps `AdaptiveStageLayoutResolver.ts` to `./chunks/a3/a35bebda9e6bec087e22a9df1d4e9c0b9633ca8c.js`;
  - direct HTTP probing shows that chunk still does **not** contain `viewportWidth` or `viewportHeight`;
  - updating the source file modification times did not make the running Preview regenerate the chunk.
- Added optional Preview freshness gate:
  - `npm.cmd run check:preview`
  - it reads the running Preview import-map/chunks and fails until `AdaptiveStageLayoutResolver.ts` and `LobbyHudRenderer.ts` serve the latest physical-viewport/micro-HUD code.
- Before final screenshot acceptance, use the low-risk Creator-side refresh path:
  1. In Cocos Creator Assets, right-click `assets/scripts/scenes/AdaptiveStageLayoutResolver.ts`.
  2. Run `Reimport Asset`.
  3. Run `Project -> Refresh Device` (`Ctrl+Shift+P`) or close the browser Preview tab/window and start Preview again.
  4. Verify the chunk probe returns `True` for both `viewportWidth` and `viewportHeight`.
- Boundary unchanged: no reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or economy write endpoint was opened.

## 2026-05-31 Stage 4V Recent Readback Fail-Closed And Result Exit

- Product/review agents found two remaining real-play risks and they were fixed:
  - battle result state could still close back to formation through the dim layer or bottom back button;
  - recent battle readback needed to fail closed on `NO_REWARD` records only.
- Cocos changes:
  - `LobbyBattlePreviewPanelRenderer.ts` maps result-state dim clicks to `returnToLobbyFromBattlePreview()` and replaces the bottom `返回编队` action with a disabled `已记录` indicator.
  - `BattleApi.ts` now requires `battleNo`, `settlementNo`, `serverSeed`, and recent `recordedTime`, and rejects recent records unless `settlementMode === 'NO_REWARD'`, `rewardGranted=false`, `readonlyEconomy=true`, and `economyApplied=false`.
  - `LobbyAdventurePanelRenderer.ts` uses clearer copy: current adventure is a no-reward battle preview, not a real reward/progress flow; stage detail only labels same-stage records as `本关`.
  - `LobbyBattlePresentationState.ts` uses `无奖励记录完成` / `演出结果` copy to avoid implying real progression.
  - `LobbyBattleFlow.ts` now retries recent-record loading when a previous error exists, instead of letting stale cached records block the next non-force refresh.
- Backend/API dependency:
  - `GET /api/player/battles/recent` now queries only `settlement_mode='NO_REWARD'`, `reward_granted=0`, `readonly_economy=1`, `economy_applied=0`.
  - `PlayerBattleServiceImpl` also filters the mapper result in Java before mapping VO data.
- Verification after restarting `lootchain-game` from the latest install:
  - Cocos `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 TypeScript check passed.
  - Backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed.
  - Backend `lootchain-admin,lootchain-game -am -DskipTests compile` passed.
  - Current-flow smoke passed: `battleNo=B3f19c9e199234d75be3ac7c2efe8fe56`, `settlementNo=S193a31a22dce42168975334095850464`.
  - Fresh-player smoke passed with recent readback: user `18`, protagonist hero `15`, `battleNo=B4c525184a1ff4b6ebcf5d59800752ebd`, `settlementNo=Sd82006f8403142c6856f69eb62de7ebe`.
  - Stage guard smoke passed for `MAIN_9_9` and `EX_1_1`.
- Preview freshness script status:
  - `npm.cmd run check:preview` currently fails as expected because the already-running Preview still serves stale chunks; rerun it after Creator-side reimport/Preview refresh.
- Boundary unchanged: this remains a no-reward readback/playable preview loop. No reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or economy write endpoint was opened.

## 2026-05-31 Stage 4W Battle Request/Settle Guard Hardening

- Backend battle contract was tightened for the Cocos-only playable loop:
  - battle `requestId` is required and now rejects values longer than 80 characters instead of truncating;
  - same battle-start `requestId` must keep the same stage, ordered lineup, and leader;
  - repeated settle returns the original no-reward settlement and does not write another settlement row.
- Added/expanded backend guard smoke scripts:
  - `D:\business\project\LootChain\scripts\smoke-battle-request-guard.ps1`
  - `D:\business\project\LootChain\scripts\smoke-battle-settle-guard.ps1`
  - expanded `smoke-battle-stage-guard.ps1`
  - hardened `smoke-cocos-current-flow.ps1`
- Verification passed against restarted `lootchain-game` on `http://localhost:8081`:
  - backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest`: 14 tests passed;
  - request guard, stage guard, lineup guard, settle guard, current-flow, and fresh-player smoke all passed.
- Cocos source did not need behavior changes in this stage. Keep generating fresh battle/settle `requestId` values from the existing Cocos flow.
- Preview visual acceptance is still blocked only by stale running Preview chunks; run `npm.cmd run check:preview` again after Creator reimport/refresh.
- Boundary unchanged: no reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or economy write endpoint was opened.

## 2026-05-31 Stage 4X Runtime Visual Loop Acceptance

- The running Cocos Preview on `http://localhost:7456` has been refreshed and now passes `npm.cmd run check:preview`.
- Runtime QA used Chrome DevTools Protocol to call the Cocos root component methods directly, avoiding false failures from coordinate clicks.
- Captured visual evidence is under `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime`.
- Desktop evidence covers:
  - lobby HUD;
  - hero roster with the protagonist card;
  - adventure panel;
  - formation panel;
  - battle running state;
  - no-reward settlement result;
  - return to lobby.
- Compact viewport evidence covers:
  - `390x340` lobby;
  - `390x300` lobby;
  - both use the micro HUD path and keep core navigation visible.
- First-login visual evidence covers local QA user `21`:
  - protagonist creation screen with male/female SSR character art;
  - lobby entry after protagonist creation.
- Latest frontend verification:
  - `npm.cmd run check:layout` passed;
  - `npm.cmd run check:preview` passed;
  - Cocos Creator 3.8.8 TypeScript no-emit passed over 84 TS files under `assets/scripts`.
- Latest backend integration evidence:
  - current-flow smoke passed with `battleNo=B9b348c1923cd4aa6bc1955cbe0fd5226`, `settlementNo=S181511c2f3a14089a45dd65c2c1a3280`;
  - fresh-player smoke passed with user `22`, protagonist hero `19`, `battleNo=B6711d99ceced46bfb3e51d94554cd437`, `settlementNo=S4b35e542e8a84b2988e44ecc75805ca4`;
  - backend focused unit tests passed with 16 tests.
- Product note: the lobby top-left HUD still displays `game_user.nickname`; the protagonist name created on the first-login screen is stored separately and is not yet the lobby display name.
- Boundary unchanged: no reward, stamina cost, mainline progress write, saved formation write, bag/currency/USDT/fund-pool mutation, EX V1, or new economy write endpoint was opened.

## 2026-05-31 Stage 4Y Lobby Display Name Uses Protagonist Name

- The lobby top-left HUD now displays the created protagonist name through the existing `displayName` field.
- Backend `GET /api/player/me/lobby` now returns:
  - `displayName`: protagonist name first, then account nickname/username fallback;
  - `protagonistName`: the current player's stored protagonist name.
- Frontend `PlayerLobbyProfileVO` and `LobbyProfileState` now carry/normalize `protagonistName`; HUD and profile dialog continue rendering from `displayName`.
- Visual evidence:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4y-protagonist-name\user-23-lobby-protagonist-name.png`
  - the top-left name is `SmokeHero23`, matching the protagonist name rather than the account nickname.
- Verification:
  - `npm.cmd run check:layout` passed;
  - `npm.cmd run check:preview` passed;
  - Cocos Creator TypeScript no-emit passed over 84 TS files;
  - backend profile HTTP check returned `displayName=SmokeHero23` and `protagonistName=SmokeHero23`;
  - current-flow and fresh-player backend smokes passed.
- Boundary unchanged: this is a read-only profile-display correction. No reward, stamina cost, mainline progress write, saved formation write, bag/currency/USDT/fund-pool mutation, EX V1, or new economy write endpoint was opened.

## 2026-05-31 Stage 4Z Adventure Stage Local Selection

- Adventure panel now supports explicit local selection of unlocked mainline stages:
  - desktop map nodes and compact rows are clickable;
  - selected rows/nodes show `已选`;
  - adventure detail and the formation CTA follow the selected stage.
- The selection is Cocos-local flow state only:
  - no mainline progress write;
  - no stamina cost;
  - no reward grant;
  - no saved formation;
  - no economy endpoint was opened.
- Files changed:
  - `assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts`
  - `assets/scripts/scenes/LootChainGameRoot.ts`
  - `scripts/check-layout.mjs`
  - `scripts/check-preview-freshness.mjs`
- Verification:
  - `npm.cmd run check:layout` passed;
  - Cocos Creator TypeScript no-emit passed over `assets/scripts`;
  - backend focused tests passed with 18 tests;
  - backend current-flow smoke passed for user `1`, `MAIN_1_1`, with `rewardGranted=false` and `readonlyEconomy=true`.
- Preview note:
  - `npm.cmd run check:preview` now intentionally checks the new adventure-selection chunks;
  - the currently open Preview on `7456` is still serving stale `LootChainGameRoot.ts` and `LobbyAdventurePanelRenderer.ts` chunks, so visual screenshot acceptance requires Creator-side reimport/refresh before rerunning the check.

### Stage 4Z Runtime Follow-up

- The Cocos Preview refreshed and `npm.cmd run check:preview` now passes.
- Runtime visual QA evidence is under:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4z-adventure-selection`
- Verified path:
  - adventure selected `MAIN_1_1`;
  - formation kept `MAIN_1_1`;
  - battle preview started `battleNo=B810204a94e064015a052f806dc199bec`;
  - no-reward settlement completed with `settlementNo=Sf4ebb68f5cec4eb890141477df987b1c`;
  - settlement still returned `rewardGranted=false` and `readonlyEconomy=true`;
  - return-to-lobby closed battle and formation overlays.
- Re-login/readback verification:
  - opening adventure after the settlement loaded recent record `Sf4ebb68f5cec4eb890141477df987b1c`;
  - recent record kept `rewardGranted=false` and `readonlyEconomy=true`.
- Compact `390x340` adventure selection screenshot was also captured to verify the compact path remains usable.

## 2026-05-31 Stage 4AA Backend Locked Stage Guard

- Backend battle start now follows the same readonly adventure unlock state as the Cocos adventure panel.
- A modified client can no longer start an allowlisted but locked stage such as `MAIN_1_2`; the request is rejected before hero lookup and before `battle_session` insert.
- Cocos behavior remains unchanged: unlocked stage selection is local UI state, and locked choices are not offered as playable targets.
- Backend verification:
  - focused tests passed with 16 tests;
  - `lootchain-admin,lootchain-game` compile passed;
  - `smoke-cocos-current-flow.ps1` passed for `MAIN_1_1` with `battleNo=B89bc55ec53ef46e6954005307f74247d`, `settlementNo=S30208205c7884abf8b2fdcb697bf9870`;
  - `smoke-battle-stage-guard.ps1` passed and now covers locked `MAIN_1_2` in addition to malformed, unavailable, and EX stages.
- Red line unchanged: no reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or new economy write endpoint was opened.

### Stage 4AE Runtime Flow Acceptance And Micro HUD Follow-up

- Runtime Cocos QA evidence was captured under:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ae-lobby-goal-tracker`
- Verified Cocos path:
  - login -> lobby goal tracker -> adventure -> formation -> battle preview -> no-reward settlement -> return lobby -> adventure recent readback.
- Runtime IDs:
  - battle `B81f5c9e9f0274c3a81654dcfeeede8e6`;
  - settlement `S0bdab68da86e4438850a87e8a1f5cade`;
  - `rewardGranted=false`;
  - `readonlyEconomy=true`.
- HUD lifecycle fix:
  - Stage 4AE tracker nodes are mounted under `LootChainCocosLoginUIRoot`, not directly under `Canvas`;
  - this keeps different-resolution rerender and overlay cleanup consistent.
- Micro HUD source follow-up:
  - micro scale now uses `clamp(layout.uiScale, 0.72, 1)` instead of design-resolution/window ratio;
  - this prevents the 390x340 Preview from over-scaling target chip and bottom action-bar text.
- Latest verification:
  - `npm.cmd run check:layout` passed;
  - focused Cocos TypeScript no-emit passed;
  - backend current-player smoke passed with battle `Bd59ddfb0093d4356a05d83425677b93e`, settlement `Sa06408bc4c614ab8a714125e6692c913`;
  - backend new-player smoke passed with user `26`, protagonist `SmokeHero26`, battle `Be77d09e3caaa46e49adfd95193aaf518`, settlement `S403f91ee819e47efbc14b3934e9002ad`.
- Preview caveat:
  - the open Preview still needs Creator to refresh/reimport `LobbyHudRenderer.ts` for the final micro-scale token;
  - current `npm.cmd run check:preview` failure is limited to missing `layout.uiScale, 0.72, 1`.
- Red line unchanged: no reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or new economy write endpoint was opened.

## 2026-05-31 Stage 4AB Locked Stage Frontend UX Guard

- Cocos adventure panel now makes locked stages explicit:
  - desktop map nodes show a `锁` badge and `锁定 {stageName}`;
  - compact rows use dim locked styling and `锁定` prefix;
  - locked taps only show a status message and do not change the current selected stage.
- Root entry points are also hardened:
  - `openLobbyFormationPanel()` rejects locked stages before opening formation;
  - `openLobbyBattlePreviewPanel()` rejects locked stages before preparing battle preview.
- Checks:
  - `npm.cmd run check:layout` passed;
  - focused Cocos Creator TypeScript no-emit passed for the adventure/root files.
- Preview status:
  - `npm.cmd run check:preview` now passes after Creator refreshed the stale chunks.
- Runtime visual QA:
  - evidence folder: `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ab-locked-stage`;
  - locked `MAIN_1_2` shows `锁` / `锁定 裂隙回廊`;
  - locked taps and forced formation entry both stay in adventure and do not open formation/battle;
  - legal `MAIN_1_1` then completed formation -> battle preview -> battle start `B675f7d4555e744f08720f213d61cbbab` -> no-reward settlement `Sb69829a75ad04a3f99dd251828025ccd` -> return lobby.
- Fresh-player verification:
  - backend `smoke-new-player-flow.ps1` passed for user `24`, protagonist `SmokeHero24`, battle `B42b76a5c3df5492097789795e91e18ce`, settlement `S127c753f3e0747b682963f8506fe69ab`;
  - Cocos visual QA created user `25` as `VisualHero25`; the creation screen and lobby entry screenshots are in the same evidence folder.
- Red line unchanged: no reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or new economy write endpoint was opened.

## 2026-05-31 Stage 4AC Battle Result Guidance And Recent Readback UX

- Cocos frontend-only stage; backend code/API/SQL did not change.
- Battle result panel now has a clearer no-reward completion state:
  - result copy says the no-reward record was written;
  - desktop battle result shows `LobbyBattleSettlementReceipt` with settlement number, battle number, reward status, resource status, and progress status;
  - player-facing wording avoids raw debug fields and says “奖励未开放 / 资源未变更 / 进度不推进”.
- Adventure detail now uses `LobbyAdventureRecentBattleSummaryCard`:
  - recent battle result, time/target, and no-reward resource guard are separated into readable lines;
  - empty/loading/error states still do not imply rewards or progression.
- Guard scripts updated:
  - `scripts/check-layout.mjs` checks the new result/readback nodes and copy tokens;
  - `scripts/check-preview-freshness.mjs` now probes the battle-preview chunk too, so stale Preview output is caught.
- Verification:
  - `npm.cmd run check:layout` passed;
  - focused Cocos Creator TypeScript no-emit passed for the changed battle/adventure files;
  - `git diff --check` passed with existing LF->CRLF warnings only.
- Preview note:
  - the currently running Preview on `7456` is stale for this stage and `npm.cmd run check:preview` fails until Creator refreshes/reimports the changed scripts or Preview is reopened.
- Red line unchanged: no reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or new economy write endpoint was opened.

### Stage 4AD Runtime Acceptance Follow-up

- The Stage 4AC Preview cache blocker is cleared: `npm.cmd run check:preview` now passes.
- Runtime visual QA evidence is under:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ad-result-guidance`
- Verified screenshots:
  - adventure recent-record card before battle;
  - formation targeting `MAIN_1_1`;
  - battle ready-to-record state;
  - result page with `LobbyBattleSettlementReceipt`;
  - adventure recent-record card after returning to lobby.
- Runtime Cocos settlement:
  - stage `MAIN_1_1`;
  - battle `B05d15599907544cea526baba82b0cb12`;
  - settlement `Sc6ee0f5062f44317a0333c5c3d7fde30`;
  - `rewardGranted=false`;
  - `readonlyEconomy=true`.
- Backend smoke rerun:
  - `scripts/smoke-cocos-current-flow.ps1` passed for user `1`, `MAIN_1_1`;
  - latest smoke settlement `S335a2554c0c74ba1b462d97f27de8e9e` still kept `rewardGranted=false` and `readonlyEconomy=true`.
- Latest checks:
  - `npm.cmd run check:layout` passed;
  - `npm.cmd run check:preview` passed;
  - focused Cocos Creator TypeScript no-emit passed.
- Red line unchanged: no reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or new economy write endpoint was opened.

### Stage 4AE Lobby Next-Step Goal Tracker

- Cocos frontend-only stage; backend code/API/SQL did not change.
- Lobby HUD now has a read-only next-step target:
  - desktop: `LobbyGoalTracker`;
  - compact: `LobbyCompactGoalTracker`;
  - micro viewport: `LobbyMicroGoalChip`.
- Tracker data is derived only from existing lobby adventure state, current local selected stage, and recent battle readback.
- Tracker click only opens the existing adventure panel. It does not start battle, bypass formation, grant rewards, spend stamina, save formation, or advance mainline progress.
- Guard scripts updated:
  - `check-layout` checks host methods, allowed click contract, and tracker bounds across desktop/compact/micro layouts;
  - `check-preview` checks the HUD Preview chunk for the new tracker tokens.
- Verification:
  - `npm.cmd run check:layout` passed;
  - focused Cocos Creator TypeScript no-emit passed;
  - Cocos and backend `git diff --check` passed with existing LF->CRLF warnings only;
  - backend current-flow smoke passed for user `1`, `MAIN_1_1`, battle `B3c2c3bee321449cf9ffe379e32f947fd`, settlement `S4fd31cbe921e4edbb1af0c60438682bd`, `rewardGranted=false`, `readonlyEconomy=true`.
- Preview note:
  - the running Preview on `7456` is stale for `LobbyHudRenderer.ts` and `npm.cmd run check:preview` fails until Creator refreshes/reimports or Preview is reopened;
  - no runtime screenshots were captured for this stage yet because the served chunk still misses the new tracker.
- Red line unchanged: no reward, stamina cost, progress write, saved formation, bag/currency/USDT/fund-pool mutation, EX V1, or new economy write endpoint was opened.
## 2026-05-31 Stage 4AF Fresh Player Runtime Closure

- Cocos-only 新玩家完整流程已在最新 Preview 下跑通：
  - 新建本地 userId `29`;
  - Cocos dev-login;
  - 主角创建页创建 `VisualHero29`;
  - 大厅左上角显示 `VisualHero29`;
  - 主角英雄 `26` 自动作为第一位可上阵英雄进入本地编队;
  - 冒险 `MAIN_1_1` -> 编队 -> 战斗预演 -> 无奖励结算 -> 返回大厅 -> 最近记录回读。
- 运行时 ID：
  - battle `B8a2ffc4fea6e40689e3a03030d156d03`;
  - settlement `S013e12191ed944ca89b43cecf79a5fc6`;
  - `rewardGranted=false`;
  - `readonlyEconomy=true`。
- 新增/修复：
  - `assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts` 复用正在加载中的英雄队列 Promise，修复快速打开编队/战斗预演时可能拿到空阵容的竞态；
  - `cancel()` 会让旧请求失效，避免切换登录玩家后慢响应覆盖新玩家队列；
  - `tmp/stage4ae-fresh-player-qa.mjs` 拆分等待步骤：创建/进入大厅、冒险选关、编队队列加载、战斗预演、结算、最近记录回读。
- 视觉证据：
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ae-lobby-goal-tracker`
- 验证通过：
  - `npm.cmd run check:layout`;
  - `npm.cmd run check:preview`;
  - focused Cocos Creator TypeScript no-emit;
  - 后端 current-flow smoke：battle `B7af2444b982847219d02983aa45d5443`，settlement `S7d2455aff3604567ae56a4c83d2c3390`;
  - 后端 fresh-player smoke：user `30`，protagonist `SmokeHero30`，hero `27`，battle `B7bf0f5841814478396d8b9d4a4d001ab`，settlement `Sa3d6e79624f34e4ab217b8f32efad150`。
- 当前闭环仍是 no-reward playable preview：不发奖励、不扣体力、不推进进度、不保存编队、不改背包/货币/USDT/资金池、不开放 EX V1、不新增经济写入口。

## 2026-05-31 Stage 4AG 韧性闭环验收

- 本阶段继续保持 Cocos-only，不回到 `web-vue`。
- 产品/玩家视角：
  - 正常玩家可以从登录进入大厅，再进入冒险、编队、战斗预演、无奖励结算、返回大厅并看到最近记录；
  - 刷新或重新登录后，最近战斗记录仍能回读；
  - 非法 `EX_1_1` 和锁定 `MAIN_1_2` 不会打开编队或战斗。
- UI/交互修复：
  - 登录弹框内容区新增 `BlockInputEvents`，弹框内点击不会穿透到底层登录按钮；
  - 大厅所有弹框内容区已运行时复验阻断：个人信息、公告、图鉴、英雄、占位、冒险、编队、战斗；
  - 编队页在英雄队列加载中、加载失败或为空时禁用 `战斗预演`，避免空阵容误入战斗预览。
- 研发/测试补充：
  - 新增 `tmp/stage4ag-resilience-qa.mjs` 作为 Cocos Preview 运行时韧性脚本；
  - `scripts/check-layout.mjs` 和 `scripts/check-preview-freshness.mjs` 已同步守卫登录阻断、面板阻断、目标追踪、英雄队列竞态、战斗结算与回读 token。
- 最新 Cocos 运行时证据：
  - 证据目录 `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ag-resilience`；
  - 覆盖 `1920x900`、`1280x720`、`390x340`；
  - battle `B3525e4db77d94108a1c0379773366153`；
  - settlement `S6f721e05eee049658795824d15ddce0f`；
  - `rewardGranted=false`，`readonlyEconomy=true`，`economyApplied=false`；
  - 快速点击计数：battle start `1` 次，settle `1` 次。
- 最新验证通过：
  - `npm.cmd run check:layout`；
  - `npm.cmd run check:preview`；
  - focused Cocos Creator TypeScript no-emit；
  - 后端 current-flow、stage guard、lineup guard、request guard、settle guard、fresh-player smoke。
- 后端 smoke 最新记录：
  - current-flow user `1`：battle `B4031d43401ee4f2ca943675aa2dcf88a`，settlement `Secdd9cd5dcbd487bacaada9cb7f6ddfb`；
  - fresh-player user `31`：protagonist `SmokeHero31`，hero `28`，battle `Bf4ce3ccc1a4949cfbf8a534d21495f02`，settlement `S747eaef629204fe3a737933183504b5e`；
  - fresh-player stamina `100 -> 100`，combatPower `9432 -> 9432`。
- 红线不变：不发奖励、不扣体力、不推进进度、不保存编队、不改背包/货币/USDT/资金池、不开放 EX V1、不新增经济写入口。

## 2026-05-31 Stage 4AH 全屏战斗与英雄详情只读展示

- 本阶段继续保持 Cocos-only，不回到 `web-vue`。
- 产品/设计结论：
  - 战斗不再作为缩小弹框呈现，而是进入大厅内的全屏战斗逻辑视图；
  - 当前仍不切换到独立 Cocos Scene，先用 `currentView = 'battle'` 和 `LobbyBattleSceneRoot` 打通完整流程，降低资源和生命周期风险；
  - 英雄列表中的英雄卡可点击进入详情，详情只做信息展示，不提供升级、升星、觉醒、装备、抽卡或领取入口。
- UI/美术落地：
  - 新增高质量战斗背景素材 `assets/resources/ui/battle/battle_scene_cathedral.png`；
  - 新增英雄详情背景 `assets/resources/ui/hero-detail/hero_detail_backdrop.png`；
  - 新增主角详情动态立绘素材 `assets/resources/ui/hero-detail/hero_detail_protagonist.png`；
  - 详情层包含动态光效、主角立绘呼吸动画、名称、稀有度、星级、形态、属性、技能和只读说明。
- 研发落地：
  - `LootChainGameRoot.ts` 增加 `battle` 视图、`renderBattleScene()`、英雄详情打开/关闭/返回英雄列表流程；
  - `LobbyBattlePreviewPanelRenderer.ts` 升级为全屏战斗表现层，保留 no-reward battle flow、结算回执和内容区输入阻断；
  - `LobbyHeroRosterPanelRenderer.ts` 支持点击英雄卡打开详情；
  - 新增 `LobbyHeroDetailPanelRenderer.ts`，所有英雄详情数据均来自只读英雄队列本地派生；
  - `UiSpriteFrameCache.ts` 预加载本阶段新增 UI 资源；
  - `scripts/check-layout.mjs` 和 `scripts/check-preview-freshness.mjs` 已同步守卫全屏战斗、英雄详情、资源预加载和英雄卡点击 token。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - `git diff --check` 通过，仅保留仓库既有 LF->CRLF warning；
  - `npm.cmd run check:preview` 未通过，原因是当前打开的 Cocos Preview 仍在服务旧 chunk：缺少 `renderBattleScene`、`LobbyBattleSceneRoot`、`openLobbyHeroDetail` 和 `LobbyHeroDetailPanelRenderer` import-map entry。需要刷新/重开 Creator Preview 后复验。
- 红线不变：
  - 不发奖励；
  - 不扣体力；
  - 不推进主线进度；
  - 不保存编队；
  - 不改背包、货币、USDT、资金池；
  - 不开放 EX V1；
  - 不新增任何经济写入口。

## 2026-06-01 Stage 4AO Remaining Popup Paths Converted To Full-Screen Scenes

- 本阶段继续保持 Cocos-only，不回到 `web-vue`。
- 剩余弹层式路径已改为全屏逻辑场景：
  - 登录账号页：`LoginAccountSceneRoot` / `LoginAccountScenePanel`；
  - Gacha 本地 mock 结果：`currentView = 'gachaResult'` + `GachaResultSceneRoot`；
  - 未开放占位入口：`LobbyPlaceholderSceneRoot` / `LobbyPlaceholderScenePanel`。
- Gacha 结果仍只使用本地固定 mock，不请求真实抽卡、不扣资源、不发英雄、不写抽卡记录或保底。
- `check:layout` 和 Preview freshness 守卫已改为检查新的全屏场景 token，不再检查旧弹层节点。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Cocos Preview 仍在服务旧 chunk；刷新/重开 Creator Preview 后需要复验。
- 红线不变：不改经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-01 Stage 4AR Lobby Feature Entries Full-Screen Scenes

- 大厅功能入口不再保留大厅背景作为底图，也不再把功能内容浮在大厅 HUD 上。
- `renderLobbyScenePage()` 现在走 `renderBase()` 清空当前内容，再渲染 `LobbyFeatureSceneBackdrop` 作为独立全屏功能场景。
- 资料、公告、冒险、编队、英雄、英雄详情、图鉴、占位入口的内容层已改为 `Lobby*SceneContent` / `Lobby*SceneFrame`，并按 `layout.stageWidth/stageHeight` 铺满舞台。
- `check:layout` 和 `check:preview` 已同步检查新的全屏场景 token。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Creator Preview 还在服务旧 chunk；刷新/重开 Preview 后需要复验。
- 红线不变：不改经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-01 Stage 4AQ Login Background Poster/Video Only

- 登录页背景现在只允许激活 `Login_BG_Poster` 和 `Login_BG_Video`。
- `BG_Main`、`Sky_Effects`、`FG_Architecture`、`Dragon_Layer`、`Character_Effects`、`Foreground_Effects` 等旧静态舞台层在登录态也会被强制关闭，避免盖住视频。
- 登录布局测量节点改为 `Login_BG_Poster` / `Login_BG_Video`。
- `LoginVideoBackground` 增加 poster 隐藏兜底：视频播放请求后即使 `PLAYING` 事件没有及时触发，也会隐藏 poster，避免一直显示静态图。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Creator Preview 还在服务旧 chunk；刷新/重开 Preview 后需要复验。
- 红线不变：不改经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-01 Stage 4AP Login Account Scene And Video Restore Hardening

- 针对“登录背景视频没了、账号登录仍像弹框”的反馈，账号登录页已从 `loginDialog` 逻辑名改为 `loginAccount`。
- `LoginRenderer` 改为 `renderLoginAccountScene()` / `openLoginAccountScene()`，账号页不再渲染登录首页的右侧 rail 和主入口按钮。
- `LoginAccountScenePanel` 改为全屏半透明场景面，并增加顶部/底部场景压层，避免继续像居中弹框。
- `LoginVideoBackground` 新增 `resumeForLoginView()`，Root 回到登录/账号登录场景时会恢复视频节点、poster 兜底和静音播放。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Creator Preview 还在服务旧 chunk；刷新/重开 Preview 后需要复验。
- 红线不变：不改经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-01 Stage 4AM 主角创建本地库修复

- 用户反馈点击主角选择页“进入游戏”提示“系统异常”。
- 排查结论：
  - Cocos 登录与 `dev-login` 成功；
  - `GET /api/player/protagonist/state` 返回后端 `code=500`；
  - 本地 MySQL `lootchain` schema 缺少 `player_protagonist` 表。
- 本机已执行后端既有迁移脚本 `D:\project\LootChain\sql\12_protagonist_module.sql`：
  - 创建 `player_protagonist`；
  - 补齐 `user_hero.source_type` 与 `user_hero.sort_weight`；
  - 插入男女主角攻击形态服务端模板。
- 验证结果：
  - 默认 `userId=1` 的 `GET /api/player/protagonist/state` 已返回 `code=0` 且 `created=false`，未提前创建玩家主角；
  - 使用测试玩家 `userId=3` 复验 `POST /api/player/protagonist` 成功，确认创建链路恢复；
  - `npm.cmd run check:layout` 与 focused Cocos Creator TypeScript no-emit 已通过，前后端 `git diff --check` 已通过且仅有既有 LF->CRLF warning；
  - 如重置本地库或换机器后再次出现同类 500，先确认 SQL 12 是否已执行。
- 红线不变：未改经济规则，未开放 EX V1，未新增抽卡、奖励、购买、资金池或任何经济写入口。

## 2026-06-01 Stage 4AN 大厅功能页闪登录背景修复

- 问题：点击部分大厅功能弹框/功能页时，会短暂闪出登录页背景视频。
- 根因：功能页整页重绘会先释放并清空大厅 `Lobby_BG_Poster` / `Lobby_BG_Video`，而主场景里的登录背景视频节点仍在底层常驻，导致大厅背景重建前露出登录视频。
- Cocos 修复：
  - `LootChainGameRoot.ts` 新增登录舞台节点显隐控制，离开 `login/loginDialog` 后隐藏 `Login_BG_Video`、`Login_BG_Poster`、`BG_Main`、`Sky_Effects` 等登录静态节点；
  - 登录舞台隐藏只控制节点 `active`，不再主动 `stop()` 登录背景视频；
  - 回到登录页时通过 `tryPlayLoginSceneVideo()` 尝试恢复登录背景视频播放；
  - 新增 `renderLobbyWorldBase()`，大厅功能页切换时保留 `Lobby_BG_Poster`、`Lobby_BG_Video`、`Lobby_BG_Fallback`，只替换 HUD/页面层；
  - `UiContentRootController.ts` 新增 `clearExcept()`，用于保留指定运行时背景节点；
  - 返回大厅时走 `renderCurrentView()`，复用已有大厅背景保活刷新路径。
- 守卫同步：
  - `scripts/check-layout.mjs` 已加入登录舞台隐藏、背景节点保留、功能页不释放大厅背景的检查；
  - `scripts/check-preview-freshness.mjs` 已加入 Preview chunk freshness token。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，运行中的 Cocos Preview 仍在服务旧 `LootChainGameRoot.ts` chunk；刷新/重开 Preview 后再复验。
- 追加修正：
  - 上一版主动停止登录视频会导致回到登录页后背景视频不再播放；
  - 当前已改为隐藏/显示登录舞台，并在登录页显示时重新尝试播放视频。
- 红线不变：本次不改经济规则，不开放 EX V1，不新增抽卡、奖励、购买、资金池或任何经济写入口。

## 2026-05-31 Stage 4AJ 召唤祭坛 Gacha 全屏预览

- 本阶段继续保持 Cocos-only，不回到 `web-vue`。
- 多角色结论：
  - 产品：召唤祭坛应作为独立全屏页面承载，不再用大厅弹框；
  - 数值：当前只记录 `NORMAL_HERO` 现有配置，不修改概率、保底、消耗或碎片规则；
  - 架构/审查：真实单抽、十连、兑换、补发都属于经济写入，当前不能开放；
  - UI/美术：按参考图方向建立暗黑哥特召唤大厅、左卡池、中央卡牌、右功能栏、底部召唤按钮。
- 本轮 Cocos 落地：
  - 新增 `assets/scripts/scenes/gacha/GachaSceneConfig.ts`；
  - 新增 `assets/scripts/scenes/gacha/GachaSceneRenderer.ts`；
  - 新增运行时背景 `assets/resources/ui/gacha/gacha_bg_cathedral.png`；
  - `深渊召唤` 活动入口和 `召唤祭坛` 场景热点进入 `currentView = 'gacha'` 全屏预览；
  - 单抽/十连按钮只显示关闭提示，不调用后端抽卡接口。
- 文档/素材：
  - 新增视觉参考 `docs/ui-reference/gacha/generated/gacha_bg_cathedral.png`；
  - 新增视觉目标稿 `docs/ui-reference/gacha/generated/gacha_ui_target_mockup.png`；
  - 后端项目新增 `docs/gacha/gacha-current-stage-output.md` 和 `docs/gacha/gacha-art-pack-manifest.json`。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过。
- 红线不变：不发奖励、不扣资源、不发放英雄、不更新保底、不开放兑换、不开放 EX V1、不新增任何经济写入口。

## 2026-06-01 Stage 4AK Gacha 本地结果预览层

- 本阶段只推进 Cocos 前端，不改后端代码、接口、SQL 或经济配置。
- 新增本地 mock 结果配置：
  - `GachaMockResultItem`
  - `GACHA_MOCK_RESULT_ONCE`
  - `GACHA_MOCK_RESULT_TEN`
- 单抽/十连按钮现在打开 `GachaMockResultLayer` 全屏遮罩结果层，展示固定 mock 卡牌结果；弹层内明确提示“未扣资源、未写入抽卡记录、未发放英雄、未更新保底”。
- 结果卡、遮罩、按钮和描边都由 Cocos `Graphics` 绘制，保持高清矢量式显示，不依赖模糊截图素材。
- `scripts/check-layout.mjs` 已新增 Gacha 本地结果层和前端-only 守卫；`scripts/check-preview-freshness.mjs` 已加入 Gacha 结果层运行包 freshness token。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- Preview 状态：`npm.cmd run check:preview` 当前失败，运行中的 Cocos Preview 仍在服务旧 `GachaSceneRenderer.ts` chunk，刷新/重开 Preview 后再复验。
- 红线不变：不调用真实抽卡接口，不扣资源，不发英雄，不写入抽卡记录/保底，不开放兑换/补发，不开放 EX V1，不新增任何经济写入口。

## 2026-06-01 Stage 4AL 主角选择页全屏场景化

- `protagonistCreate` 仍是单 Cocos 主场景内的逻辑视图，但选择角色 UI 已从居中弹框改成全屏场景。
- `ProtagonistCreatePanel` 现在按安全区全屏铺开，使用 `drawFullSceneFrame()` 绘制薄边框、顶部/底部暗色压层和全屏输入拦截。
- 男/女主角卡、SSR 形态预览、角色名输入与“进入游戏”按钮按全屏舞台重新排布，避免看起来像登录后的弹窗。
- 本阶段不改主角创建接口：客户端仍只提交 `gender` 和 `protagonistName`，不提交英雄模板、稀有度、等级、星级、战力或属性。
- 守卫同步：
  - `scripts/check-layout.mjs` 已更新主角选择全屏场景的多分辨率布局检查；
  - `scripts/check-preview-freshness.mjs` 已新增 `ProtagonistCreateRenderer.ts` 全屏场景 freshness token。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- Preview 状态：`npm.cmd run check:preview` 当前失败，运行中的 Cocos Preview 仍在服务旧 `ProtagonistCreateRenderer.ts` 和旧 `GachaSceneRenderer.ts` chunk；刷新/重开 Preview 后再复验。
- 红线不变：主角创建仍只是账号初始化能力，不开放抽卡、奖励、购买、结算、资金池、链上领取、EX V1 或任何经济写入口。

## 2026-05-31 Stage 4AI 大厅弹框改为场景式切换

- 本阶段继续保持 Cocos-only，不回到 `web-vue`。
- 产品/交互调整：
  - 登录账号页也纳入场景页规则，不再保持小弹框比例；
  - 大厅里的个人信息、公告、冒险、编队、英雄、英雄详情、图鉴、占位入口全部从“弹框覆盖大厅 HUD”改为“场景式页面切换”；
  - 当前实现仍在同一个 Cocos 主场景内完成，通过 `currentView` 切换逻辑场景，避免拆多个 `.scene` 导致登录态、资源缓存和 no-reward battle flow 被大范围重写；
  - 功能页保留大厅动态背景作为世界底图，但不再渲染大厅 HUD，因此视觉和交互上不再是弹框。
- 研发落地：
  - `LootChainGameRoot.ts` 的 `ViewName` 新增 `profile`、`adventure`、`codex`、`formation`、`heroes`、`heroDetail`、`notice`、`placeholder`；
  - 新增 `renderLobbyScenePage()`、`isLobbyScenePageView()`、`returnToLobbyFromScenePage()`；
  - 大厅 `renderLobby()` 只渲染背景和 HUD，不再渲染任何功能弹框；
  - 打开各入口时设置对应 `currentView` 并整页重绘；
  - 关闭/返回按钮统一回大厅，英雄详情的“返回英雄”回英雄列表；
  - loader 的刷新回调在功能页下会重绘当前逻辑场景。
- UI 调整：
  - 登录账号页改为按安全区铺开的全屏页面；
  - 公告、冒险、编队、英雄、图鉴、英雄详情、个人资料、占位页的面板尺寸改为按安全区铺开的全屏页面；
  - 遮罩层只挂 `BlockInputEvents` 阻断底层输入，不再点击遮罩关闭；
  - 主要关闭按钮文案改为 `返回大厅`，避免继续表达“弹框关闭”。
- 守卫脚本：
  - `scripts/check-layout.mjs` 已加入场景式页面 token、全屏页面尺寸断言和遮罩不关闭规则；
  - `scripts/check-preview-freshness.mjs` 已加入新逻辑场景切换 token 和各页面 `返回大厅`/`dim.addComponent(BlockInputEvents)` token。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前仍失败，原因是 Cocos Preview 继续服务旧 chunk，需要刷新/重开 Creator Preview；
  - `git diff --check` 通过，仅有仓库既有 LF->CRLF warning。
- 红线不变：
  - 不发奖励；
  - 不扣体力；
  - 不推进主线进度；
  - 不保存编队；
  - 不改背包、货币、USDT、资金池；
  - 不开放 EX V1；
  - 不新增任何经济写入口。

## 2026-06-01 Stage 4AS 全屏功能页返回按钮统一

- 所有大厅功能页的返回入口统一为 Gacha 同款左上角金色箭头按钮。
- 新增共享组件 `assets/scripts/scenes/UiSceneBackButton.ts`，Gacha 和大厅功能页都走同一个 `renderSceneBackButton()`。
- 已接入页面：资料、公告、冒险、编队、英雄、英雄详情、图鉴、未开放占位页、战斗预览页。
- 旧底部“返回大厅”文字按钮已从大厅功能页移除，底部仅保留刷新、战斗预演等非返回操作。
- 验证状态：`npm.cmd run check:layout` 通过；focused Cocos Creator TypeScript no-emit 通过；`npm.cmd run check:preview` 当前仍提示运行中的 Preview 是旧 chunk，需要刷新/重开 Cocos Creator Preview 后复验。
- 红线不变：不改经济规则，不开放 EX V1，不新增任何经济写入口，不接真实抽卡写接口。

## 2026-06-01 Stage 4AT 召唤中心 Spine 动画接入

- 召唤预览页中心展示从 5 张本地占位卡替换为 `assets/spine/gacha/Lord of the Dark Abyss/1605.json` 导入的 Spine 骨骼动画。
- 新增 Gacha Spine 配置：UUID `ce6aee72-45cb-4315-abfd-74ac40b8d0ce`，皮肤 `0`，先播 `appear`，再循环 `idle`。
- `GachaSceneRenderer.ts` 通过 `assetManager.loadAny` 运行时加载 `sp.SkeletonData`，渲染 `GachaAbyssSpineStage` / `GachaAbyssSpineNode`；真实抽卡结果页的本地 mock 卡片保持不变。
- `check:layout` 与 `check-preview-freshness` 已加入 Spine 资源存在性和 Gacha 渲染 token 守卫。
- 验证状态：`npm.cmd run check:layout` 通过；focused Cocos Creator TypeScript no-emit 通过；Preview 仍需刷新/重开后复验最新 chunk。
- 红线不变：不改经济规则，不开放 EX V1，不新增任何经济写入口，不接真实抽卡写接口。

## 2026-06-01 Stage 4AU 移除友情召唤入口

- 按反馈移除 Gacha 预览卡池中的 `friend` / “友情召唤”入口。
- 当前召唤预览仅保留：限定召唤、英雄召唤、普通召唤、光暗召唤锁定占位。
- `scripts/check-layout.mjs` 新增守卫，阻止 Gacha 配置重新出现 `id: 'friend'` 或“友情召唤”。
- 红线不变：不改经济规则，不开放 EX V1，不新增任何经济写入口，不接真实抽卡写接口。

## 2026-06-01 Backend Hero Roster Art Sync

- 后端 `hero_template` 已新增 `portrait_asset` 纯展示字段，记录不带扩展名的 `act_数字` 立绘资源编号。
- 用户指定素材已同步到数据库与文档：
  - 深渊魔女·伊芙琳：`act_21053`
  - 永夜龙骑·阿尔萨斯：`act_21023`
- R/SR/SSR 启用模板已按职业收敛；UR 已补齐战士、辅助、刺客、法师、射手、坦克六职业各一个。
- 新增 UR 当前仅作为模板与图鉴展示数据，未加入 `gacha_pool_item`，因此 Cocos 召唤页仍保持本地预览/mock，不接真实抽卡、不发英雄、不写抽卡记录或保底。
- 立绘源文件当前仍位于 `C:\Users\axian\Desktop\hero`；如需 Cocos 直接显示，需要后续单独导入到 `assets/resources` 并刷新 Creator 生成 `.meta`。

## 2026-06-01 Stage 4AV Hero Portrait Resource Keys And Gacha Spine Swap

- Cocos 只读英雄/图鉴类型与 API 已接收后端 `portraitAsset` 字段，语义为不带扩展名的 `act_数字` 资源编号，后续可按资源目录约定加载对应 PNG/SpriteFrame。
- 当前不改变英雄列表/图鉴渲染，只建立资源映射字段；不调用养成、抽卡、背包、奖励、购买、出售或任何经济写入口。
- Gacha 中心 Spine 已改用 `assets/spine/gacha/huangfengjiaozong/huangfengjiaozong.skel`，UUID `ef87498c-2ef4-44e6-bee9-2d499e6ac570`，`default` 皮肤循环 `idle`。
- Gacha 背景与中心舞台已移除原有红色圆圈/法阵环，保留暗色背景、Spine 和本地 mock 结果预览。
- `scripts/check-layout.mjs` 已同步检查 huangfengjiaozong Spine 资源、`portraitAsset` 只读解析、旧红圈颜色回归守卫，以及友情召唤仍移除。
- 验证通过：`npm.cmd run check:layout`；focused Cocos Creator TypeScript no-emit。
- 边界不变：不开放真实抽卡，不扣资源，不发英雄，不写抽卡记录/保底，不开放 EX V1，不新增经济写入口。
## 2026-06-01 Stage 4AZ Gacha Spine Runtime Fallback

- 当前 `huangfengjiaozong` 能被资源系统加载，但 Cocos Spine runtime 在 `getRuntimeData(true)` 阶段解析失败，通常表示 `.skel/atlas/texture` 不匹配或导出格式不被当前运行时支持。
- Gacha 中心现在仍优先尝试 `spine/gacha/huangfengjiaozong/huangfengjiaozong`；如果运行时解析失败，会临时显示已验证可播放的 `spine/gacha/Lord of the Dark Abyss/1605`，避免中心区域继续空白。
- 页面会保留明确诊断提示：`huangfengjiaozong Spine 运行时解析失败，已临时显示可用预览 Spine；需要重新导出 huangfengjiaozong。`
- `check:layout` 与 `check-preview-freshness` 已同步检查 fallback Spine 配置、资源和渲染 token。
- 边界不变：不开放真实抽卡，不扣资源，不发英雄，不写抽卡记录/保底，不开放 EX V1，不新增经济写入口。

## 2026-06-01 Stage 4AW Gacha Spine Runtime Resource Fix

- `huangfengjiaozong` Spine 已从非运行时资源目录移入 `assets/resources/spine/gacha/huangfengjiaozong/`，供 Cocos `resources` bundle 正常加载。
- Gacha 中心动画现在优先通过 `resources.load('spine/gacha/huangfengjiaozong/huangfengjiaozong', sp.SkeletonData)` 加载；保留 UUID `ef87498c-2ef4-44e6-bee9-2d499e6ac570` 作为兜底。
- 这次修正解释了 Preview 没显示新 Spine 的原因：代码配置已切换，但旧目录不在 `resources` 运行时包内，同时运行中的 Preview 仍可能服务旧 chunk。
- `check:layout` 与 `check-preview-freshness` 已同步到新资源路径和加载方式。
- 验证通过：`npm.cmd run check:layout`；focused Cocos Creator TypeScript no-emit。
- Preview 复验：需要在 Cocos Creator 中刷新/重开 Preview，等待资源重新导入后再进入 Gacha；当前运行中的旧 Preview 会继续提示 stale chunk。
- 边界不变：不开放真实抽卡，不扣资源，不发英雄，不写抽卡记录/保底，不开放 EX V1，不新增经济写入口。

## 2026-06-01 Stage 4AX Gacha Spine Skin/Animation Auto Resolve

- Preview 已确认能服务 `huangfengjiaozong` SkeletonData、`.bin` 和贴图资源；空白原因进一步收敛为资源内部皮肤/动画名与代码固定的 `default` / `idle` 不一致。
- `GachaSceneRenderer.ts` 现在会通过 `getSkinsEnum()` / `getAnimsEnum()` 自动选择可用皮肤和动画；找不到 `default` 或 `idle` 时不再静默失败。
- 只有实际拿到 Spine TrackEntry 后才移除加载 fallback，避免“动画没播但界面空白”。
- 运行时会在控制台输出 `[Gacha] huangfengjiaozong spine applied: skin=..., animation=..., size=...`，用于复验实际命中的皮肤、动画和尺寸。
- 验证通过：`npm.cmd run check:layout`；focused Cocos Creator TypeScript no-emit。
- Preview 复验：需要重开/刷新 Cocos Creator Preview 后再进入 Gacha；旧 Preview chunk 不包含本轮自动解析逻辑。
- 边界不变：不开放真实抽卡，不扣资源，不发英雄，不写抽卡记录/保底，不开放 EX V1，不新增经济写入口。

## 2026-06-01 Stage 4AY Gacha Spine No-Animation Static Pose Fallback

- 当前 `huangfengjiaozong` 已能被 Cocos 加载，但运行时未枚举到可播放 animation，界面会提示导出动画列表缺失。
- Gacha 中心 Spine 现在在无 animation 时不再一直显示 `黄风教宗准备中`，而是调用 `setToSetupPose()` 展示静态骨骼首帧。
- 如果 `skel/atlas/texture` 匹配失败，仍保留 fallback 并显示运行时解析失败提示。
- `check:layout` 与 `check-preview-freshness` 已同步静态骨骼首帧兜底 token。
- 验证通过：`npm.cmd run check:layout`；focused Cocos Creator TypeScript no-emit；`git diff --check`。
- 后续如要动态播放，需要美术重新导出包含 animation 的 `huangfengjiaozong` Spine；前端会自动选择实际存在的动画名。
- 边界不变：不开放真实抽卡，不扣资源，不发英雄，不写抽卡记录/保底，不开放 EX V1，不新增经济写入口。
