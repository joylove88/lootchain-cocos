# LootChain Cocos Client

LootChain 玩家游戏前端。当前阶段的登录页、UI、按钮、弹框、输入框、状态提示、背景和动态特效全部在 Cocos Creator 内实现，不再使用 HTML、Vue、CSS 或 H5 作为登录验收路径。

## 当前路线

- Cocos Creator 负责登录页完整内容：背景、粒子、UI、弹框和 `dev-login` 联调。
- `web-vue` 仅作为历史实验目录保留，不作为当前阶段验收入口；除非用户明确要求，不再修改或运行它。
- 当前流程为 Cocos 登录页 -> 资源加载进度页 -> 大厅背景页 + 大厅 HUD 阶段 1。
- 登录成功后先加载 `assets/resources/lobby` 下的大厅资源，资源准备完成后进入大厅背景界面，并展示左上玩家信息入口。
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

- 只交付 Cocos 登录页。
- 只对接现有 `/api/player/auth/dev-login`。
- 不修改游戏经济规则。
- 不开放 EX 获取。
- 不做 USDT 直接领取。
- 不直连 MySQL、Redis、RabbitMQ。
- 大厅阶段当前只交付阶段 1：背景壳、左上玩家信息只读展示、玩家资料只读弹窗。
- 不开放抽卡、英雄、背包、队伍、装备、商店、副本、Boss、资金池、链上领取入口。

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

登录成功后，大厅阶段 1 会读取玩家只读资料：

```text
GET http://localhost:8081/api/player/me/lobby
```

该接口只返回大厅展示所需的玩家资料 VO，不执行写入，不返回 Entity。

## 文档同步约定

每次阶段性上下文或代码变更完成后，必须同步更新对应项目文档。本项目的 Cocos-only 登录页、资源加载、大厅背景、预览验证、脚本检查等上下文优先更新：

- `D:\project\lootchain-cocos\README.md`
- `D:\project\lootchain-cocos\docs\current-chat-context.md`

涉及服务端启动、接口、规则或 SQL 的上下文，同时更新 `D:\project\LootChain` 下对应文档。

## 当前可用入口

- 主界面：左上 Logo、右侧“谕言 / 客服 / 公告 / 修复”占位按钮、一个“账号登录”按钮。
- 登录弹框：账号/邮箱、密码、进入游戏、第三方登录占位图标、协议勾选。
- 登录成功：进入资源加载进度页，加载完成后切换到大厅背景界面。
- 大厅阶段 1：左上玩家信息入口展示头像框、等级、名称、战力、EXP 标识；点击后打开玩家资料只读弹窗。

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
