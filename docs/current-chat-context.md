# LootChain Cocos 当前聊天窗口交接上下文

更新时间：2026-06-03

本文用于其他 Codex 窗口快速接手当前阶段。先读本文件，再按 LootChain 规则读取服务端 `D:\project\LootChain` 下的 `README.md`、`AGENTS.md`、`AI_RULE.md`、`PROJECT_CONTEXT1.md`、`PROJECT_CONTEXT2.md`、`docs/`、`sql/`、`team-history/CURRENT_PROGRESS.md`。

## 当前目标

- 游戏前端当前阶段是 Cocos-only 登录页 + 资源加载页 + 大厅 HUD 可见体验。
- 不再使用 `web-vue` 作为当前验收路径；`web-vue` 仅为历史实验目录。
- 当前验收入口是 Cocos Creator 3.8.8 的 `D:\project\lootchain-cocos\assets\main.scene`。
- 登录阶段只接入玩家 `dev-login`。
- dev-login 成功后先检查/创建服务端主角色，再进入 Cocos 资源加载进度页，加载 `assets/resources/lobby` 下的大厅背景资源。
- 加载完成后切换到大厅背景界面；当前大厅已包含背景视频、左上玩家信息、只读资料场景页、顶部资源栏、右上系统图标、左侧活动、中央建筑热点、右侧挑战卡、底部导航、聊天预览、冒险按钮和统一未开放占位场景页。
- 大厅当前开放资料、公告、图鉴、英雄队列等只读展示；其他玩法/经济入口仍是本地 placeholder。
- 当前继续推进 `Stage 4AR：大厅功能入口全屏新场景化`，大厅内资料、公告、冒险、编队、英雄、英雄详情、图鉴、占位入口都不再浮在大厅背景/HUD 上，而是进入独立全屏逻辑场景。
- `Stage 4AK/4AO：Gacha 本地 mock 结果展示` 当前只进入 `gachaResult` 全屏逻辑场景，展示前端固定 mock 结果，不请求真实抽卡、不扣资源、不发放英雄、不写入抽卡记录或保底。
- 2026-06-01 追加修复：点击主角页“进入游戏”出现“系统异常”的本地根因是 `lootchain` 库未执行 `sql/12_protagonist_module.sql`，缺少 `player_protagonist` 表；已在本机执行该 SQL，并用测试玩家复验 `POST /api/player/protagonist` 成功。
- 不开放抽卡、英雄养成、背包使用/出售、USDT、资金池、领取、购买、结算或任何经济写入口。
- Zeno 子代理继续作为“用户视角监督 agent”，负责从玩家验收角度拦截体验断点；当前监督口径要求直到完整游玩流程打通前持续检查流程可达性、误触、文案误导和经济红线。

## 2026-06-03 Backend Table Comment UTF8 Repair

- 用户反馈本地数据库 `mq_consume_log` 与 `gacha_pool_display_config` 的表注释显示乱码。
- 已在后端仓库新增并执行 `D:\project\LootChain\sql\19_table_comment_utf8_fix.sql`，修复两张表的表级 COMMENT 与列级 COMMENT。
- 已为 `D:\project\LootChain\sql\10_mq_consumer_module.sql`、`D:\project\LootChain\sql\17_gacha_pool_display_config.sql` 增加 `SET NAMES utf8mb4;`，避免后续本地重新导入再次写坏注释。
- 本次只改数据库元数据注释与初始化脚本字符集声明；Cocos 前端代码、接口契约、抽卡概率、奖池物品、保底、消耗、奖励、重复转碎片、EX V1 与经济写入口均未改变。

## 2026-06-03 Gacha Pool Tab Logo Slot

- 用户反馈召唤页左侧卡池页签右侧金/紫/蓝/红色块也应预留为 logo 背景，并由 `gacha_pool_display_config` 控制。
- 后端新增增量 SQL `D:\project\LootChain\sql\20_gacha_pool_tab_logo_asset.sql`，为 `gacha_pool_display_config` 增加 `tab_logo_asset` 字段。
- `GachaPoolVO` 新增 `tabLogoAsset`；Cocos `GachaPreviewPool` 同步新增 `tabLogoAsset`。
- Cocos 召唤页左侧卡池页签现在会在右侧色块上叠加 `tabLogoAsset` 图片；为空时 fallback 到 `logoAsset`，再 fallback 到原主题色块。
- 本地库已执行 SQL 20，默认四个卡池的 `tab_logo_asset` 均填充为对应 `ui/gacha/logo_*`。
- 本次只增加 UI 展示字段和前端渲染，不修改 `gacha_pool_item`、概率、权重、保底、消耗、奖励、重复转碎片、EX V1、兑换/补发或任何经济写入口。

## 硬规则

- 不允许改变游戏经济规则。
- EX 英雄 V1 只预埋，不开放获取。
- USDT 奖励必须后台审核。
- 资金池每日释放限制保持 0.5%~1%。
- 后端 Controller 返回 `Result<T>`，不返回 Entity，必须使用 DTO/VO。
- 后台前端如需修改，只能改 `D:\project\lootchain-admin\apps\web-antd`。
- 当前 Cocos 登录页工作只改 `D:\project\lootchain-cocos`。

## 文档更新约定

- 每次阶段性上下文或代码变更完成后，必须同步更新对应项目文档。
- Cocos-only 登录页、资源加载、大厅背景、场景布局、预览验证、检查脚本等上下文，优先更新本文件和 `D:\project\lootchain-cocos\README.md`。
- 涉及服务端启动、接口、规则、SQL 或后端联调上下文时，同时更新 `D:\project\LootChain` 下对应文档。
- 不要只改代码不更新交接文档；下一窗口需要先从本文恢复当前阶段。

## 近期已完成的 Cocos 登录页调整

1. 登录 UI 已放在 Cocos `assets/main.scene` 中，由 `LootChainGameRoot` 生成登录按钮、弹框、协议勾选、右侧入口占位和登录成功状态。
2. 鼠标悬浮在可点击按钮上时已切换为小手 cursor。
   - 文件：`D:\project\lootchain-cocos\assets\scripts\scenes\LootChainGameRoot.ts`
   - 关键方法：`applyPointerCursor()`、`setPointerCursor()`。
3. 登录背景视频已支持按运行环境自动切换：
   - PC / 横屏：`D:\project\lootchain-cocos\assets\resources\login-bg`
   - 手机 / 竖屏：`D:\project\lootchain-cocos\assets\resources\login-bg-h5`
   - 文件：`D:\project\lootchain-cocos\assets\resources\login-bg\scripts\login\LoginVideoBackground.ts`
   - 判定逻辑：`sys.isMobile || view.getVisibleSize().height > view.getVisibleSize().width` 时使用 H5 资源。
4. H5 新增资源目录：
   - `D:\project\lootchain-cocos\assets\resources\login-bg-h5\login_bg_loop.mp4`
   - `D:\project\lootchain-cocos\assets\resources\login-bg-h5\login_bg_loop_raw.mp4`
   - `D:\project\lootchain-cocos\assets\resources\login-bg-h5\login_bg_poster.jpg`
5. `LoginVideoBackground` 已兼容 H5 poster 以 texture 方式导入的情况；如果找不到 spriteFrame，会 fallback 到 texture 并运行时创建 `SpriteFrame`。
6. `VideoPlayer` 和 poster 会按当前可视区域尺寸铺满，避免横竖屏切换后尺寸不对。
7. Cocos-only 登录根脚本已修复：
   - `LootChainGameRoot.start()` 会清理旧 token，避免 Cocos 预览未点击登录就直接进入“登录验收通过”。
   - 登录弹框已恢复第三方登录占位图标，只提示暂未开放，不接入真实第三方登录。
   - 密码输入框已使用 Cocos `EditBox.InputFlag.PASSWORD`，并增加 `applyPasswordMask()` 兜底，显示为 `*`。
   - 首页状态文案已移到主登录按钮上方，避免与按钮边缘重叠。
8. 本轮按用户要求新增登录后流程：
   - 点击“进入游戏”后不再显示“登录验收通过”。
   - dev-login 返回 `code=0` 后进入“资源加载中”进度条界面。
   - 加载 `assets/resources/lobby/lobby_bg_poster.jpg` 与 `assets/resources/lobby/lobby_bg_loop.mp4`。
   - 大厅背景加载完成后切换到“圣契大厅”背景界面。
   - 大厅背景视频已恢复播放；poster 仅作为首帧兜底，视频开始播放后淡出。
   - 大厅界面当前不放抽卡、英雄、背包等功能按钮。
9. `scripts/check-layout.mjs` 已补充当前阶段门禁：
   - 校验 `assets/main.scene` JSON。
   - 校验登录根脚本不调用 `this.api.gacha`、`this.api.hero`、`this.api.bag`，不出现抽卡/英雄/背包写入口路径。
   - 校验旧 token 清理、第三方占位、密码输入保护、资源加载页和大厅背景页仍保留。

## 2026-05-28 Cocos 登录页布局与特效补充

- 左上 Logo、主登录按钮、右侧四个按钮图片资源已接入 `LootChainGameRoot` 的 SpriteFrame 属性，避免预览中出现洋红色缺图块。
- 登录页 UI 已从固定舞台尺寸改为按 `BG_Main / FG_Architecture` 的 `UITransform.contentSize * node.scale` 计算舞台边界；背景 Scale 恢复为 `1` 时，Logo、右侧按钮、主登录按钮仍按背景舞台自适应定位。
- `renderLoginBrand()` 使用 `layout.stageLeft / stageTop` 计算 Logo 位置；`renderRightRail()` 使用 `layout.stageRight` 计算右侧按钮位置，右侧按钮水平内边距为舞台宽度 `2%`，比之前更靠右。
- CloudLayers 下各云层 `VortexLayerMotion.rotationSpeed` 已按用户要求提高到原始速度的 16 倍；`L08_CoreVoid` 原值为 `0`，保持不旋转。
- 用户试验过缩小 CloudLayers 的 UITransform Content Size，后续已按要求恢复全部尺寸，并恢复 Sprite `Size Mode=TRIMMED`。
- `scripts/check-layout.mjs` 已新增自适应布局门禁：禁止回退到 `LOGIN_STAGE_WIDTH / LOGIN_STAGE_HEIGHT` 固定舞台常量，并用当前 `assets/main.scene` 推算 `LoginLogo`、右侧首个按钮、主登录按钮是否仍在背景舞台内。
- 当前如果 Cocos Editor 预览仍显示旧位置，优先重开 Preview 或刷新脚本编译缓存；源码侧已经是背景舞台自适应逻辑。

## 背景视频资源约定

PC 当前默认资源：

- 视频：`resources/login-bg/login_bg_loop_1080p`
- 首帧图：`resources/login-bg/login_bg_first`

H5 当前默认资源：

- 视频：`resources/login-bg-h5/login_bg_loop`
- 首帧图：`resources/login-bg-h5/login_bg_poster`

如果后续替换资源，优先保持同名文件；这样无需改代码。若必须改名，只改 `LoginVideoBackground.ts` 顶部常量：

```ts
const PC_VIDEO_PATH = 'login-bg/login_bg_loop_1080p';
const PC_POSTER_PATH = 'login-bg/login_bg_first';
const H5_VIDEO_PATH = 'login-bg-h5/login_bg_loop';
const H5_POSTER_PATH = 'login-bg-h5/login_bg_poster';
```

2026-05-29 历史记录：用户曾替换 PC 登录背景视频与首帧图为 `login_bg_loop.mp4`，当时曾短暂将 PC 视频路径从 `login-bg/login_bg_loop_1080p` 改为 `login-bg/login_bg_loop`；随后用户确认视频改回 `login_bg_loop_1080p`，当前以最新记录为准。

2026-05-29 追加检查：用户再次更新登录背景后，当前目录最新变更是 `assets/resources/login-bg/login_bg_first.jpg`；H5 目录 `assets/resources/login-bg-h5` 未变化。由于登录视频真正播放后会淡出 poster，若只替换首帧图，预览主体仍会显示当前 PC 视频画面；竖屏预览还需替换 H5 资源。

2026-05-29 再次更新：用户确认视频已更换为 `login_bg_loop_1080p`，已将 PC 视频路径改回 `login-bg/login_bg_loop_1080p`。本地检查时 `assets/resources/login-bg/login_bg_loop_1080p.mp4` 未显示为 git 修改且时间戳仍为 `2026-05-26 09:08:59`，若预览仍是旧画面，需要确认新视频是否确实覆盖到该文件。

## 当前工作区状态

`D:\project\lootchain-cocos` 当前有未提交变更：

- `assets/main.scene`
- `assets/resources/login-bg/login_bg_first.jpg`
- `assets/resources/login-bg/login_bg_loop_1080p.mp4`
- `assets/resources/login-bg/login_bg_loop_1080p.mp4.meta`
- `assets/resources/login-bg/login_bg_loop_raw.mp4`
- `assets/resources/login-bg/login_bg_loop_raw.mp4.meta`
- `assets/scripts/scenes/LootChainGameRoot.ts`
- `scripts/check-layout.mjs`
- `README.md`
- `docs/current-chat-context.md`
- `docs/lobby-feature-analysis.md`
- `settings/v2/packages/cocos-service.json`

注意：其中不全是本窗口新改内容，其他窗口接手时不要随意 revert 用户或 Cocos 编辑器生成的变更。

`D:\project\LootChain` 当前有本轮新增的本地游戏服启动脚本与文档变更；详见服务端仓库 `README.md`、`docs/local-game-server-start.md`、`team-history/CURRENT_PROGRESS.md`。

## 已跑过的检查

Cocos 项目检查：

```powershell
cd D:\project\lootchain-cocos
npm.cmd run check:layout
```

结果：通过，输出 `layout ok`。

本轮补充：`check:layout` 现在还会执行 Cocos-only 阶段门禁检查，确认登录根脚本没有调用抽卡、英雄、背包写入口，并确认 loading/lobby 流程仍存在；同时检查登录页 UI 没有回退到固定舞台常量，Logo、右侧按钮、主登录按钮仍在背景舞台内。

Cocos TS 检查：

```powershell
$tsc = 'D:\office app\cocos\editors\Creator\3.8.8\resources\resources\3d\engine\node_modules\.bin\tsc.cmd'
& $tsc --target ES2020 --module ESNext --moduleResolution Node --experimentalDecorators --skipLibCheck --noEmit --types D:\project\lootchain-cocos\temp\declarations\cc D:\project\lootchain-cocos\assets\scripts\scenes\LootChainGameRoot.ts D:\project\lootchain-cocos\assets\scripts\app\AppConfig.ts D:\project\lootchain-cocos\assets\scripts\api\LootChainApi.ts D:\project\lootchain-cocos\assets\scripts\api\PlayerProfileApi.ts D:\project\lootchain-cocos\assets\scripts\net\HttpClient.ts D:\project\lootchain-cocos\assets\scripts\store\TokenStore.ts D:\project\lootchain-cocos\assets\scripts\types\PlayerTypes.ts D:\project\lootchain-cocos\assets\resources\login-bg\scripts\login\LoginVideoBackground.ts
```

结果：通过。

本轮补充：已使用 Cocos Creator 3.8.8 自带 TypeScript 对大厅根脚本、API、类型和登录背景脚本执行 Cocos 声明检查，结果通过。

场景 JSON 校验：

```powershell
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('D:/project/lootchain-cocos/assets/main.scene','utf8')); console.log('main.scene json ok')"
```

结果：通过，输出 `main.scene json ok`。

登录接口联调：

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:8081/api/player/auth/dev-login `
  -ContentType 'application/json' `
  -Body '{"userId":1}'
```

结果：通过，返回 `code=0`，`data.tokenName=satoken`。

## 游戏服务启动方式

用户在终端直接执行以下命令时遇到父工程无 main class 报错：

```powershell
mvn -pl lootchain-game -am spring-boot:run "-Dspring-boot.run.profiles=local"
```

原因：`-am` 把父 POM 也拉进 reactor，`spring-boot:run` 先在父工程执行，父工程没有 main class。

当前推荐使用服务端一键启动脚本：

```powershell
Set-Location D:\project\LootChain
.\start-game-server.bat
```

该脚本内部使用：

```powershell
mvn.cmd --no-transfer-progress -pl lootchain-game -am -DskipTests install
mvn.cmd --no-transfer-progress -f .\lootchain-game\pom.xml spring-boot:run -DskipTests -Dspring-boot.run.profiles=local -Dspring-boot.run.arguments=--server.port=8081 -Dspring-boot.run.jvmArguments=-Dfile.encoding=UTF-8
```

注意：不要直接执行 `mvn -pl lootchain-game -am spring-boot:run`。`-am` 会把父 POM 加进 reactor，`spring-boot:run` 会先落到 `lootchain-parent` 并因没有 main class 失败。服务端启动脚本已修复为先 `install` 依赖模块，再用 `-f .\lootchain-game\pom.xml` 只启动游戏服。

2026-05-28 修复后验证：服务端脚本 dry-run 输出两步命令，`mvn.cmd --no-transfer-progress -pl lootchain-game -am -DskipTests install` 已执行通过。

## 玩家登录当前状态

- 当前 `game_user` 是玩家主档表，没有玩家密码字段。
- 当前 Cocos-only 登录页只对接 `POST /api/player/auth/dev-login`，传参为 `userId`。
- `LootChainGameRoot` 中账号输入为数字时按 `userId` 传给 `dev-login`；非数字账号/邮箱兜底为 `AppConfig.defaultDevUserId`。
- 登录弹框中的密码输入框当前只是 UI/后续正式登录占位，现阶段不会传给后端，也不会参与鉴权。
- 正式账号密码、钱包签名、邮箱验证码、第三方登录等玩家登录体系尚未落库；服务端文档 `D:\project\LootChain\docs\22-数据库设计.md` 已记录建议后续新增独立凭证/身份表，不把密码直接放入 `game_user`。

本地配置：

- 游戏服务端口：`8081`
- MySQL：`localhost:3306/lootchain`
- Redis：`localhost:6379`
- `local` profile 会开启 `lootchain.player.dev-login-enabled=true`

测试登录接口：

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:8081/api/player/auth/dev-login `
  -ContentType 'application/json' `
  -Body '{"userId":1}'
```

如果 `8081` 被占用：

```powershell
Get-NetTCPConnection -LocalPort 8081 | Select-Object LocalAddress,LocalPort,State,OwningProcess
Stop-Process -Id 进程ID -Force
```

## 已知环境提示

- 用户的 `C:\Users\Ethan\.m2\settings.xml` 第 61 行附近存在 XML 格式 warning：

```text
expected START_TAG or END_TAG not TEXT ... settings.xml, line 61, column 15
```

这不是上次 `spring-boot:run` 失败主因，但后续建议修复 Maven settings，避免依赖解析异常。

## 后续接手建议

1. 如果继续处理登录页视觉，优先在 Cocos Creator Preview 中验证，不要回到 `web-vue`。
2. 如果处理接口联调，先确认 `lootchain-game` 8081、Redis 6379、MySQL 3306 都在线。
3. 如果要更新进度，必须同步更新本项目文档；涉及服务端时同时更新 `D:\project\LootChain\team-history\CURRENT_PROGRESS.md`。
4. 对 Cocos 场景文件谨慎处理，Cocos 编辑器会产生 `assets/main.scene` 和 settings 变更，不要未经确认回滚。

## 2026-05-28 大厅参考图产品拆解

- 用户提供 `D:\project\lootchain-cocos\docs\ui-reference\dragonheir\lobby\lobby.png` 作为后续游戏大厅对标参考。
- 已从产品视角拆解顶部玩家信息、资源栏、系统入口、左侧活动列表、中央场景热点、右侧挑战卡片、底部导航、聊天栏和主冒险入口。
- 已新增文档 `D:\project\lootchain-cocos\docs\lobby-feature-analysis.md`，记录各功能点、点击弹窗建议、开发清单、开发顺序和当前阶段边界。
- 当前仅做产品总结，不改代码，不开放 EX V1，不新增任何经济写入口。

## 2026-05-28 大厅开发阶段 1

- 当前大厅开发从阶段 1 开始，只实现“大厅背景壳 + 左上玩家信息只读展示 + 玩家资料只读弹窗”。
- `D:\project\lootchain-cocos\assets\scripts\scenes\LootChainGameRoot.ts` 新增 `renderLobbyHud()`、`renderLobbyPlayerInfo()`、`renderPlayerProfileDialog()`、`openPlayerProfileDialog()`、`closePlayerProfileDialog()`。
- 大厅左上玩家信息按背景舞台边界自适应，节点包括 `LobbyPlayerInfoButton`、`LobbyPlayerAvatar`、`LobbyPlayerName`、`LobbyPlayerLevel`、`LobbyPlayerPower`、`LobbyPlayerExpBadge`。
- 玩家资料弹窗节点包括 `LobbyProfileDim`、`LobbyProfilePanel`、`LobbyProfileCloseButton`；只展示资料，不提供写操作。
- 新增 Cocos API 文件 `assets/scripts/api/PlayerProfileApi.ts` 与类型 `assets/scripts/types/PlayerTypes.ts`，只读调用 `GET /api/player/me/lobby`。
- `scripts/check-layout.mjs` 已加入阶段 1 门禁，确认大厅资料节点、只读接口、弹窗布局状态 key 存在，并继续禁止抽卡、英雄、背包、领取、购买、提现、USDT 等入口进入根脚本。
- 服务端新增只读资料接口，详见 `D:\project\LootChain\team-history\CURRENT_PROGRESS.md`。
- Code Review 发现服务端 `PlayerProfileController` 需要排除出后台应用扫描；已在 `D:\project\LootChain\lootchain-admin\src\main\java\com\lootchain\bootstrap\AdminApplication.java` 加入排除，避免 admin 启动依赖玩家 Sa-Token Bean。
- 已执行 `npm.cmd run check:layout` 通过；后端 `PlayerLobbyProfileServiceTest` 通过；`mvn.cmd --no-transfer-progress -pl lootchain-admin,lootchain-game -am -DskipTests compile` 通过。
- 当前可使用 Cocos Creator 3.8.8 自带 TypeScript 进行根脚本级声明检查；完整视觉与视频播放仍需在 Cocos Creator Preview 中做运行态确认。

### 2026-05-28 大厅 HUD 不显示修复

- 用户在 Cocos Preview 反馈大厅左上玩家信息没有显示。
- 排查后确认 `renderLobbyPlayerInfo()` 已执行渲染链，但大厅背景同时创建了全屏 `VideoPlayer` 节点；Cocos Web Preview 中原生视频层可能覆盖 Canvas UI，导致 HUD 被遮住。
- 已将 `USE_LOBBY_NATIVE_VIDEO_BACKGROUND` 设为 `false`，大厅阶段 1 使用 poster 背景优先，不再创建或强制加载原生视频背景，保证 `LobbyPlayerInfoButton`、资料弹窗等 HUD 在 Canvas 层可见。
- `scripts/check-layout.mjs` 已加入门禁，防止阶段 1 误开原生视频背景覆盖 HUD。

### 2026-05-29 大厅背景视频恢复

- 用户反馈游戏大厅背景视频没有播放。
- 根因：上一轮为规避 `VideoPlayer` 覆盖 HUD，将 `USE_LOBBY_NATIVE_VIDEO_BACKGROUND` 临时设为 `false`，导致 loading 阶段不加载 `lobby_bg_loop.mp4`，大厅只显示 poster。
- 已恢复 `USE_LOBBY_NATIVE_VIDEO_BACKGROUND = true`，加载 `assets/resources/lobby/lobby_bg_loop.mp4` 并创建 `Lobby_BG_Video`。
- 按登录背景实现方式设置 `VideoPlayer.stayOnBottom = true`、静音循环、`keepAspectRatio = false`，并监听 `READY_TO_PLAY / PLAYING / COMPLETED / ERROR`。
- `Lobby_BG_Poster` 新增 `UIOpacity`，视频真正进入 `PLAYING` 后再淡出 poster；视频失败时保留 poster，避免黑屏。
- 全局点击/触摸会重试 `tryPlayLobbyVideo()`，用于兼容浏览器或移动端自动播放限制。
- `scripts/check-layout.mjs` 已同步改为要求动态视频开启、poster 淡出和 `stayOnBottom` 保护存在。

### 2026-05-28 背景叠加元素自适应规则

- 用户明确要求所有叠在视频/背景上的元素都必须按不同分辨率自适应，不能写死坐标。
- `LootChainGameRoot.resolveLayout()` 已扩展统一安全区字段：`safeLeft`、`safeRight`、`safeTop`、`safeBottom`、`safeWidth`、`safeHeight`、`safeInsetX`、`safeInsetY`。
- 登录 Logo、右侧四按钮、主登录按钮、登录弹框、加载面板、大厅左上玩家信息、玩家资料弹窗已改为使用安全区/舞台中心定位。
- 玩家资料弹窗从固定世界坐标 `0,0` 改为按当前舞台中心定位，避免背景舞台中心发生变化时错位。
- `makeLayoutKey()` 已加入舞台边界信息，背景节点尺寸/缩放变化时会触发重渲染。
- `scripts/check-layout.mjs` 已扩展多分辨率门禁，覆盖 `1920x1080`、`1600x900`、`1366x768`、`1280x720`、`1024x768`、横屏移动、竖屏移动和最小视口，校验登录 Logo/右侧按钮/主按钮/登录弹框/加载面板与大厅阶段 1 HUD/弹窗不越出舞台。
- 后续新增任何背景叠加 UI，都必须接入安全区并同步补充 `check-layout` 几何校验。

### 2026-05-28 左上玩家信息视觉深化

- 用户反馈左上角 UI 与参考图差距过大，需要深度优化布局和排版。
- `renderLobbyPlayerInfo()` 已从普通矩形面板改为徽章式玩家铭牌：大头像徽章在左，右侧为半透明暗金底纹和细线延展。
- 新增 `drawLobbyPlayerInfoFrame()`、`addLobbyNameSigil()`、`addLobbyPowerUnderline()`、`drawArmoredAvatarPortrait()`，运行时绘制暗黑金属风头像框、盔甲头像剪影、名称徽记和战力下划线。
- `addLobbyAvatar()` 不再显示玩家名缩写大字，改为金属放射外框 + 盔甲头像剪影 + 小型 crest 字母。
- `LobbyPlayerExpBadge` 调整为贴附头像底部的小铜金牌，更接近参考图的 EXP 标识。
- `scripts/check-layout.mjs` 已同步更新左上玩家信息尺寸公式，并增加头像放射外框视觉范围校验，确保多分辨率下不越界。

### 2026-05-28 左上玩家信息返修

- 用户反馈上一版头像仍偏卡通，且文字与头像重叠。
- 根因：`addChildLabel()` 对 `Label.HorizontalAlign.LEFT` 的坐标仍按节点中心处理，左对齐文字实际起点被向左偏移半个文本框宽度。
- 已新增 `resolveAlignedLabelX()`，将左对齐坐标解释为文本框左边界、右对齐坐标解释为文本框右边界，修复玩家名/等级/战力压住头像的问题。
- 已移除头像外圈的三角放射造型，改为更克制的暗金属圆环、局部弧线高光和上下小型金属饰件。
- 已将左上铭牌文本区整体右移，给头像外框预留间距。
- 已移除铭牌右下角的“资料读取中/资料占位”调试文案，避免破坏参考图式布局；资料异常只在资料弹窗中展示。

### 2026-05-28 左上玩家信息高质量图片资产接入

- 用户要求左上玩家信息与参考图保持一致，并建议使用 image 2.0 生成高质量 UI。
- 已使用内置 imagegen 生成黑金暗黑幻想玩家铭牌资产，原始输出保留在 `C:\Users\Ethan\.codex\generated_images\019e547a-17f7-7db3-b84e-b4a1858b94c3\ig_07e312bd804b5022016a18653b8de88191aa608e4a90991262.png`。
- 已在本地用 PowerShell/.NET 去除绿幕并裁剪成项目资源：`D:\project\lootchain-cocos\assets\resources\ui\lobby\lobby_player_info_panel.png`，尺寸 `1600x577`，四角 alpha 为 `0`。
- 已新增 Cocos 资源 meta：`assets/resources/ui/lobby.meta` 与 `assets/resources/ui/lobby/lobby_player_info_panel.png.meta`。
- `renderLobbyPlayerInfo()` 已切换为图片资产驱动，优先加载 `ui/lobby/lobby_player_info_panel/spriteFrame`，只保留等级、名称、战力、EXP 文字动态覆盖；图片加载失败时才使用 Graphics 兜底。
- 已移除代码层额外红点绘制，避免与图片资产自带红色菱形重复。
- `scripts/check-layout.mjs` 已加入图片资产存在性、资源常量和多分辨率尺寸公式校验。

### 2026-05-29 大厅 Stage 1A 左上玩家信息自适应修正

- 用户确认进入下一阶段，当前阶段聚焦大厅 UI 左上玩家信息、视频/背景上的 UI 自适应和参考图一致性。
- `renderLobbyPlayerInfo()` 已从通用 `safeLeft/safeTop` 改为基于舞台安全区派生的 `lobbyHudEdgeInset()` 小边距定位，使铭牌更贴近参考图左上角，同时仍随舞台尺寸自适应。
- 动态文字区域已收窄到头像右侧有效信息区，避免覆盖 `lobby_player_info_panel.png` 中央装饰件；玩家名与战力使用 `Label.Overflow.SHRINK` 防止长文本溢出。
- 玩家信息文字已增加 `enableOutline` 黑色描边，提高动态视频背景上的可读性。
- 图片资产未加载完成时的兜底绘制会同时显示 `LobbyPlayerAvatar`，避免首帧只有框没有头像。
- 玩家信息按钮 hover/touch 缩放幅度已降低，减少贴边 HUD 在小分辨率下被交互缩放挤出舞台的风险。
- `scripts/check-layout.mjs` 已同步新的边距公式、文字描边、文本缩放和多分辨率边界门禁。

## 2026-05-29 Lobby Stage 1B player HUD reference rebuild

- Scope: Cocos-only lobby top-left player info HUD. No backend economy rules were changed, EX V1 remains unopened, and no new economy write entry was added.
- Rebuilt `assets/resources/ui/lobby/lobby_player_info_panel.png` as a compact high-resolution `1080x436` PNG, matching a `540x218` logical reference grid for the provided screenshot direction.
- Updated `assets/resources/ui/lobby/lobby_player_info_panel.png.meta` so the SpriteFrame uses `rawWidth=1080`, `rawHeight=436`, `width=1080`, `height=436`, `trimX=0`, `trimY=0`, `offsetX=0`, and `offsetY=0`. This avoids the previous auto-trim coordinate drift that made dynamic text collide with the frame.
- Updated `LootChainGameRoot.renderLobbyPlayerInfo()` to use `LOBBY_PLAYER_INFO_PANEL_ASPECT = 540 / 218`, wider `420..540` adaptive HUD sizing, and explicit safe slots for `Lv`, player name, combat power, underline, sigil, and `EXP`.
- `LobbyPlayerLevel`, `LobbyPlayerName`, and `LobbyPlayerPower` now use shrink-safe text boxes positioned to the right of the avatar frame, preventing the level label from overlapping the avatar/background frame.
- Updated `scripts/check-layout.mjs` to verify the HUD PNG dimensions, SpriteFrame meta trim values, and multi-resolution internal label boxes for level/name/power/EXP/sigil.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check for `LootChainGameRoot.ts` and dependent scripts -> passed.

### 2026-05-29 Lobby Stage 1B revision after visual rejection

- User rejected the first Stage 1B HUD bitmap because it still differed too much from the provided reference.
- Current correction: `assets/resources/ui/lobby/lobby_player_info_panel.png` now reuses the higher-quality original portrait/frame/EXP cluster only on the left side and keeps the right text area transparent. This removes the previous visible custom dark panel/blob and lets the lobby video/background show through like the reference image.
- `addLobbyNameSigil()` was changed from a diamond-style icon to a thin gold anchor-like sigil.
- `addLobbyPowerUnderline()` was simplified to a thin gold line; the previous red diamond ornament was removed.
- Rechecked after this revision:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.

### 2026-05-29 Lobby Stage 1B high-quality avatar frame regeneration

- User rejected the screenshot-crop avatar frame quality. The current HUD asset was regenerated using imagegen instead of cropping the old screenshot-like frame.
- Generated source image: `C:\Users\axian\.codex\generated_images\019e6dfe-8486-7d32-a92f-9eaea25168f8\ig_07b83f41cd8e8d4e016a193fe1f8188191a7a50f262aadf9c6.png`.
- Local processing: removed the flat green chroma-key background, despilled green edges, extracted the avatar medallion/badge, and composited it into `assets/resources/ui/lobby/lobby_player_info_panel.png` as a `1080x436` transparent HUD art canvas.
- `assets/resources/ui/lobby/lobby_player_info_panel.png.meta` remains pinned to the full `1080x436` SpriteFrame grid to prevent auto-trim coordinate drift.
- Rechecked after this regeneration:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.

### 2026-05-29 Lobby profile dialog close flash fix

- User reported that closing the top-left player profile dialog could briefly flash the login-page background.
- Root cause: `openPlayerProfileDialog()`, `closePlayerProfileDialog()`, and lobby profile refresh previously rebuilt the full lobby via `renderLobby()`. That path calls `renderBase()`, releases the lobby video runtime, and clears all content children, so the original scene/login background could show for one frame before the lobby background was rebuilt.
- Fix: profile dialog open/close now only adds or removes `LobbyProfileDim` and `LobbyProfilePanel`. Lobby profile data refresh now calls `refreshLobbyOverlay()`, which refreshes only `LobbyPlayerInfoButton` and the optional profile dialog without touching `Lobby_BG_Poster` or `Lobby_BG_Video`.
- Added `removePlayerProfileDialog()` and `removeNodeFromContent()` helpers.
- Updated `scripts/check-layout.mjs` to forbid full `renderLobby()` calls from profile dialog open/close/profile-refresh paths.
- Rechecked after this fix:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.

### 2026-05-29 Lobby Stage 1C top resource bar

- Current next-stage increment: the lobby now renders a top resource bar through `renderLobbyResourceBar()` after the top-left player HUD.
- The bar is explicitly read-only. It shows stamina from the existing lobby profile VO plus reference-style coin/ruby/crystal visual placeholders until a read-only asset-summary contract is available.
- The visible `+` marks in the top resource bar are disabled visual marks only. No purchase, claim, exchange, fund-pool, gacha, hero, bag, chain reward, or EX V1 write entry was added.
- `refreshLobbyOverlay()` now also refreshes/removes `LobbyResourceBar` without rebuilding the lobby background video/poster.
- `scripts/check-layout.mjs` now requires the resource bar methods/nodes and verifies that the resource bar stays inside the adaptive stage and does not overlap the top-left player info panel across the supported viewport set.
- Rechecked after this stage:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.

### 2026-05-29 Lobby Stage 1D refinement

- User requested larger fonts matching the reference image, more accurate center function-point placement near buildings, and building hover/click interaction.
- Current implementation changes:
  - Activity-row title/subtitle, center hotspot label, right challenge card, bottom-nav, chat, and adventure-button fonts are larger.
  - Center hotspots were repositioned closer to their reference buildings.
  - Each center hotspot now has a transparent `LobbyHotspotHitArea_*` building interaction area behind the visible label.
  - Hovering the building area sets the same local unopened-status hint as hovering the label.
  - Clicking either the building area or the label calls `activateLobbyHotspot()` and plays `LobbyClickEffect`, a short red-gold pulse at that function point.
- This remains Cocos-only local UI behavior. No backend gameplay/economy write API was added or called.
- Rechecked after this refinement:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.

### 2026-05-29 Lobby Stage 1D hotspot alignment correction

- User preview showed that the transparent center building hit areas were too large, not aligned with the visible buildings, and displayed a large red rectangle on hover.
- Correction made in `renderLobbySceneHotspots()`:
  - Each center function now has independent label coordinates, label width, hit-area center, hit-area width, and hit-area height.
  - `召唤祭坛`, `公会`, `排行榜`, `旅者集会`, `熔铸工坊`, `深渊之门`, `战役`, and `商店` were retuned against the current 16:9 lobby background.
  - `drawLobbyHotspotHover()` now draws a small local red-gold target pulse instead of outlining the whole hit area.
  - Hit-area fill alpha is now `0`, keeping building hit zones invisible during preview.
- This remains local Cocos UI behavior only; no backend gameplay/economy endpoint was opened.
- Rechecked after this correction:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.
  - `git diff --check` -> passed, only existing CRLF warnings.
- Next recommended Stage 1 item after user confirmation: bottom navigation and central hotspot placeholders, still read-only/locked and without any economy write entry.

### 2026-05-29 Lobby Stage 1D reference-style HUD skeleton

- User provided `D:\project\lootchain-cocos\docs\ui-reference\dragonheir\lobby\lobby.png` again and required the lobby UI to follow it with higher quality.
- Current implementation extends the Cocos-only lobby overlay beyond the top-left HUD:
  - `renderLobbySystemIcons()` draws the top-right friends/mail/settings/menu icon group.
  - `renderLobbyActivityRail()` draws the left activity list with dark-gold rows, icon medallions, and red-dot markers.
  - `renderLobbySceneHotspots()` draws central map plaques such as guild, ranking, abyss gate, battle, forge, and shop.
  - `renderLobbyChallengeRail()` draws the right-side challenge cards.
  - `renderLobbyBottomHud()` draws the bottom translucent band, compass, bottom navigation, chat preview, and red adventure button.
- These are all Cocos `Graphics`/`Label`/`Button` UI nodes, not screenshot crops, so they remain sharp when scaled.
- All newly visible module clicks are placeholder-only and call no backend gameplay/economy endpoint. They only set an unopened status message locally.
- `scripts/check-layout.mjs` now verifies the new system icon group, resource spacing beside it, activity rail, scene hotspot plaques, challenge rail, and bottom HUD across the supported viewport set.
- Rechecked after this stage:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` no-emit check -> passed.

### 2026-05-29 Lobby Stage 1D hotspot alignment correction v2

- User preview still showed the center function text and building placement too far from the reference feel.
- Recalibrated `renderLobbySceneHotspots()` against the current 3840x2160 16:9 `assets/resources/lobby/lobby_bg_poster.jpg`, because the provided reference image uses a different crop ratio.
- Updated plaque anchors and hit-area anchors for `召唤祭坛`, `公会`, `排行榜`, `旅者集会`, `熔铸工坊`, `深渊之门`, `战役`, and `商店`.
- Reduced the center plaque height from `36 * scale` to `32 * scale` and the label font from `25 * scale` to `22 * scale`, so nameplates sit closer to the building proportions.
- Narrowed the transparent hit areas again to the building cores. Hover/click remains local placeholder UI only and does not call gameplay or economy write APIs.
- Rechecked after this correction:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check with `cc.d.ts` -> passed.

### 2026-05-29 Lobby Stage 1D code modularization

- User requested that code should no longer be piled into `LootChainGameRoot`.
- Current split:
  - `LootChainGameRoot.ts` remains the Cocos root component for lifecycle, route switching, login/loading, lobby background, profile state, and generic UI primitives.
  - `assets/scripts/scenes/lobby/LobbyHudRenderer.ts` owns the lobby HUD rendering chain and local placeholder interactions.
  - `assets/scripts/scenes/lobby/LobbyHudConfig.ts` owns editable HUD data such as central hotspot anchors/hit areas, activity rows, challenge cards, and bottom navigation items.
  - `assets/scripts/scenes/lobby/LobbyHudTypes.ts` owns the HUD host contract, HUD-only types, constants, and small helpers.
- `LootChainGameRoot.renderLobbyHud()` now delegates to `LobbyHudRenderer.render(layout)` instead of containing every HUD method directly.
- `scripts/check-layout.mjs` now treats the lobby HUD as a module group and verifies the new `.ts` and `.meta` files.
- Root script line count after this split is about 1.6k lines; lobby HUD renderer/config/types are separated for future UI iteration.
- This was a structure-only frontend refactor. No gameplay/economy endpoint was opened, no economy rules changed, and EX V1 remains closed.
- Rechecked after modularization:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check with `cc.d.ts` -> passed.

### 2026-05-30 Lobby Stage 1E 玩家资料弹窗模块化

- 本阶段只做结构拆分，不改变大厅行为与弹窗视觉逻辑。
- 新增 `assets/scripts/scenes/lobby/LobbyProfileDialogRenderer.ts` 与 `LobbyProfileDialogRenderer.ts.meta`。
- `LobbyProfileDialogRenderer` 负责 `LobbyProfileDim`、`LobbyProfilePanel`、关闭按钮、头像、标题、资料行、只读提示和钱包地址脱敏展示。
- `LootChainGameRoot.ts` 只保留玩家资料状态、`openPlayerProfileDialog()` / `closePlayerProfileDialog()` / `removePlayerProfileDialog()` 调度、资料接口加载和通用 UI host 方法。
- 打开/关闭玩家资料弹窗仍然只增删 overlay 节点，不调用 `renderLobby()`，继续避免大厅视频/poster 被重建导致闪回登录背景。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，并校验弹窗模块的关键节点/只读逻辑 token。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1F 大厅背景控制器模块化

- 本阶段继续只做结构拆分，不改变大厅背景行为。
- 新增 `assets/scripts/scenes/lobby/LobbyBackgroundController.ts` 与 `LobbyBackgroundController.ts.meta`。
- `LobbyBackgroundController` 负责大厅 poster/video runtime：`Lobby_BG_Poster`、`Lobby_BG_Video`、`Lobby_BG_Fallback`、`VideoPlayer` 参数、播放重试、`READY_TO_PLAY` / `PLAYING` / `COMPLETED` / `ERROR` 事件、poster 淡出、停止与事件解绑。
- `LootChainGameRoot.ts` 现在只保留背景生命周期入口：`renderLobbyBackground()`、`tryPlayLobbyVideo()`、`updateLobbyPosterFade()`、`releaseLobbyVideoRuntime()` 都委托给 controller。
- 保留关键行为：poster 仍按全画布 `layout.width/layout.height` 铺底；动态背景仍为静音循环；`VideoPlayer.stayOnBottom=true` 继续防止 native video 压住 HUD；视频进入 `PLAYING` 后 poster 以 0.4s 淡出；视频错误时保留 poster。
- `loadLobbyResources()` 在写入 background controller 资源前新增 loading ticket 检查，避免过期资源加载流程覆盖新状态。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，并将背景视频关键 token 校验迁移到 `LobbyBackgroundController.ts`。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1G 大厅头像绘制模块化

- 本阶段继续只做结构拆分，不改变大厅行为与视觉参数。
- 新增 `assets/scripts/scenes/lobby/LobbyAvatarRenderer.ts` 与 `LobbyAvatarRenderer.ts.meta`。
- `LobbyAvatarRenderer` 负责 `LobbyPlayerAvatar` 的暗金圆形头像框、上下金属饰件、盔甲头像剪影、红色细节线和 `AvatarCrestLetter`。
- `LootChainGameRoot.addLobbyAvatar()` 现在只委托 `lobbyAvatarRenderer.add(...)`，HUD 与玩家资料弹窗仍通过同一个 host 方法使用头像。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，并将头像绘制函数 token 从根脚本迁移到 `LobbyAvatarRenderer.ts`。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1H 玩家资料状态模块化

- 本阶段继续只做结构拆分，不改变玩家资料读取接口与 UI 行为。
- 新增 `assets/scripts/scenes/lobby/LobbyProfileState.ts` 与 `LobbyProfileState.ts.meta`。
- `LobbyProfileState` 负责当前玩家 `userId`、资料 loading/error、fallback profile、`GET /api/player/me/lobby` 返回数据归一化和过期 userId 防护。
- `LootChainGameRoot.ts` 仍负责调用 `this.api.profile.lobbyProfile()`、捕获异常、刷新大厅 overlay，但不再内置 `fallbackLobbyProfile()` / `normalizeLobbyProfile()`。
- 登录成功后通过 `lobbyProfileState.resetForLogin(userId)` 清空上一位玩家资料；资料加载完成/失败时通过 `applyLoadedProfile()` / `applyLoadError()` 判断是否仍属于当前玩家。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，并继续把 profile 相关逻辑限定为只读展示，不允许新增玩法/经济写接口。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1I 资源加载页渲染模块化

- 本阶段继续只做结构拆分，不改变加载流程与大厅进入逻辑。
- 新增 `assets/scripts/scenes/lobby/LobbyLoadingRenderer.ts` 与 `LobbyLoadingRenderer.ts.meta`。
- `LobbyLoadingRenderer` 负责 `LoadingMask`、`LoadingPanel`、加载标题、加载消息/错误、进度条、百分比文本和“重试加载”按钮的渲染。
- `LootChainGameRoot.ts` 仍负责 loading 状态、资源加载 ticket、防过期流程、背景资源加载、错误捕获和切换到 lobby。
- `renderLoading()` 现在只调用 `lobbyLoadingRenderer.render(layout, { progress, message, error })`；重试按钮通过 host 回调 `retryLobbyLoading()` 回到原 `startLobbyLoading()` 流程。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查；原有多分辨率 `LoadingPanel` 边界校验继续保留。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1J 资源加载器模块化

- 本阶段继续只做结构拆分，不改变资源加载流程与大厅进入逻辑。
- 新增 `assets/scripts/scenes/lobby/LobbyResourceLoader.ts` 和 `LobbyResourceLoader.ts.meta`。
- `LobbyResourceLoader` 负责大厅 poster/video 的 Cocos `resources.load()`：`lobby/lobby_bg_poster`、`lobby/lobby_bg_loop`，以及 poster `SpriteFrame` 不存在时的 `Texture2D` 兜底生成。
- `LootChainGameRoot.ts` 仍负责 loading ticket、进度状态、错误捕获、过期流程拦截，以及资源加载完成后切换到 `lobby`。
- 过期 ticket 会在进度回调和写入 `LobbyBackgroundController` 前被拦截，避免旧加载流程覆盖新状态。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，并把 `LobbyResourceLoader.ts` 纳入禁止经济写入口 token 扫描。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed。
  - `git diff --check` -> passed，仅有已有 CRLF warning。
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1K 登录渲染器模块化

- 本阶段继续只做结构拆分，不改变登录流程、loading 流程与大厅进入逻辑。
- 新增 `assets/scripts/scenes/login.meta`、`assets/scripts/scenes/login/LoginRenderer.ts` 和 `LoginRenderer.ts.meta`。
- `LoginRenderer` 负责登录页与登录弹窗的可见 UI 组合：`LoginLogo`、`MainAccountLoginButton`、右侧登录页 rail、`DialogDim`、`LoginDialogPanel`、账号/密码输入框位置、第三方登录占位、协议勾选行、返回按钮和“进入游戏”按钮。
- `LootChainGameRoot.ts` 仍负责登录行为和状态：`currentView`、`agreementAccepted`、`accountInput`、`passwordInput`、`statusLabel`、`login()`、`dev-login` API 调用、资源加载切换、大厅资料读取。
- 新增 host 回调 `setLoginInputs()`、`openLoginDialog()`、`submitLogin()`、`toggleLoginAgreement()`，让渲染模块只触发 root 行为，不直接碰 API 或路由终态。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，把 `LoginRenderer.ts` 纳入禁止经济写入口 token 扫描，并额外禁止 login renderer 内出现 `this.api`、`devLogin`、`startLobbyLoading`、`loadLobbyProfile`、`renderLobby()`、`renderLoading()`。
- 多分辨率检查已扩展到登录弹窗内部控件：账号输入框、密码输入框、进入游戏按钮、第三方按钮行、协议勾选/文案、返回按钮。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed。
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1L 自适应布局解析器模块化

- 本阶段继续只做结构拆分，不改变登录页、大厅页、loading 页的自适应公式和渲染行为。
- 新增 `assets/scripts/scenes/AdaptiveStageLayoutResolver.ts` 和 `AdaptiveStageLayoutResolver.ts.meta`。
- `AdaptiveStageLayoutResolver` 负责 `LOGIN_REFERENCE_WIDTH`、`LOGIN_REFERENCE_HEIGHT`、`LOGIN_STAGE_NODE_NAMES`、最小可见尺寸、`view.getVisibleSize()` fallback、舞台节点尺寸解析、`safeLeft/safeRight/safeTop/safeBottom` 安全区公式。
- `LootChainGameRoot.ts` 仍负责生命周期、视图路由、`renderBase()`、`applyRootSize()`、`makeLayoutKey()`、清理 `contentRoot` 和释放 lobby video runtime 的时机。
- `UiLayout` 已统一从 `LobbyHudTypes.ts` 引入，避免 root 和各模块维护重复布局结构。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，把 `AdaptiveStageLayoutResolver.ts` 纳入禁止经济写入口 token 扫描，并反向禁止 root 再出现 `StageBounds`、`resolveStageBounds()`、`visibleSize()`、`runtimeWindowSize()` 等布局实现。
- 多分辨率检查继续覆盖登录 logo/rail/主按钮、登录弹窗内部控件、loading panel、大厅 HUD/热点/底部栏。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed。
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1M UI SpriteFrame 缓存模块化

- 本阶段继续只做结构拆分，不改变登录页、大厅页的图片加载优先级和渲染行为。
- 新增 `assets/scripts/scenes/UiSpriteFrameCache.ts` 和 `UiSpriteFrameCache.ts.meta`。
- `UiSpriteFrameCache` 负责 UI `SpriteFrame` 缓存 Map、加载中 Set、防重复加载、`resources.load(path, SpriteFrame)`、登录图片预加载和大厅玩家信息面板图片预加载。
- `LootChainGameRoot.ts` 仍负责 Cocos Inspector 绑定的 `logoFrame`、`mainButtonFrame`、`rightRailFrames`，并保持这些手动绑定资源优先于缓存资源。
- `addSprite()` 和 `addImageButton()` 仍作为 root 的通用 UI host 方法保留，但现在通过 `uiSpriteFrameCache.resolve/request` 解析或请求图片帧。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，把 `UiSpriteFrameCache.ts` 纳入禁止经济写入口 token 扫描，并反向禁止 root 再出现 `spriteFrames`、`loadingSpriteFrames`、`resources.load(path, SpriteFrame)` 等缓存实现。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed。
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1N 只读大厅资料加载器模块化

- 本阶段继续只做结构拆分，不改变登录顺序、大厅进入逻辑和资料展示行为。
- 新增 `assets/scripts/scenes/lobby/LobbyProfileLoader.ts` 和 `LobbyProfileLoader.ts.meta`。
- `LobbyProfileLoader` 现在持有 `LobbyProfileState`，负责 `startLoading -> GET /api/player/me/lobby -> applyLoadedProfile/applyLoadError -> finishLoading` 的只读资料加载编排。
- `LootChainGameRoot.ts` 仍负责 `dev-login`、`setApiBaseUrl`、资源 loading、切换大厅、资料弹窗开关和实际 overlay 节点刷新。
- root 的 `currentLobbyProfile()`、`isLobbyProfileLoading()`、`getLobbyProfileError()` 和登录成功后的 `resetForLogin(userId)` 都改为委托 `LobbyProfileLoader`。
- `LobbyProfileLoader` 只能通过 `isLobbyViewActive()` 和 `refreshLobbyOverlay()` 通知 root 刷新 overlay，继续禁止在资料加载路径里调用 `renderLobby()` 全量重建大厅。
- `scripts/check-layout.mjs` 已加入新模块和 `.meta` 文件检查，把 `LobbyProfileLoader.ts` 纳入禁止经济写入口 token 扫描，并反向禁止 root 再出现 profile loading 实现细节。
- `PlayerProfileApi.ts` 现在也纳入检查：必须保持精确只读 `return this.http.get<PlayerLobbyProfileVO>('/api/player/me/lobby');`，并禁止 `post/put/patch/delete`。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed。
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1O Loading Flow Controller Split

- 本阶段继续只做结构拆分，不改变登录、资源加载、大厅进入或 HUD 行为。
- 新增 `assets/scripts/scenes/lobby/LobbyLoadingFlow.ts` 和 `LobbyLoadingFlow.ts.meta`。
- `LobbyLoadingFlow` 现在负责 loading ticket、progress/message/error 状态、retry、过期加载保护、错误捕获，以及调用 `LobbyResourceLoader` 完成 poster/video 本地资源加载。
- `LootChainGameRoot.ts` 不再持有 `loadingProgress`、`loadingMessage`、`loadingError`、`resourceLoadTicket` 或 `LobbyResourceLoader`；root 只通过 host 回调显示/刷新 loading、写入大厅背景资源、切换进入大厅。
- `LobbyLoadingRenderer` 仍只渲染 loading UI；`LobbyResourceLoader` 仍只负责本地 Cocos 资源加载。
- `scripts/check-layout.mjs` 已加入 `LobbyLoadingFlow.ts` 与 `.meta` 检查，纳入禁用经济写入口 token 扫描，并反向禁止 loading flow 实现回到 root。
- `docs/api-contract.md` 已同步当前开放范围：`POST /api/player/auth/dev-login` 加只读 `GET /api/player/me/lobby`，其余玩法/经济接口仍不开放。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed。
- 阶段边界不变：不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1P Login Flow Split

- 本阶段继续只做结构拆分，不改变登录入口、登录 UI、大厅进入顺序或只读资料加载行为。
- 新增 `assets/scripts/scenes/login/LoginFlow.ts` 和 `LoginFlow.ts.meta`。
- `LoginFlow` 现在负责账号输入引用、协议勾选状态、默认 dev user 兜底、`userId` 解析、`PlayerAuthApi.devLogin(userId)`、登录错误格式化，以及 loading retry 使用的最近 token name。
- `LootChainGameRoot.ts` 不再持有 `accountInput`、`passwordInput`、`agreementAccepted`、`lastTokenName`、`login()`、`resolveDevUserId()` 或 `formatApiError()`；root 只通过 host 回调设置 API base URL、设置状态文案、重置只读 profile、启动 loading、异步加载只读 profile。
- `LoginRenderer` 仍只负责可视 UI 渲染，不触碰 API；`LoginFlow` 只接收 `PlayerAuthApi`，不接收完整 `LootChainApi`，避免带入 gacha/hero/bag 等经济模块。
- `scripts/check-layout.mjs` 已加入 `LoginFlow.ts` 与 `.meta` 检查，纳入禁用经济写入口 token 扫描，并反向禁止 dev-login flow 实现回到 root。
- 验证结果：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed。
- 阶段边界不变：当前只开放 `POST /api/player/auth/dev-login` 和只读 `GET /api/player/me/lobby`；不改变经济规则，不开放 EX V1，不新增任何玩法或经济写入口。

### 2026-05-30 Lobby Stage 1Q Shared Text And Status Modules

- User changed the workflow: modularization stages no longer require confirmation between phases. Continue autonomously until the current Cocos lobby/frontend refactor is complete.
- Added `assets/scripts/scenes/UiTextFormatter.ts` and `.meta`.
- `UiTextFormatter` owns pure helpers: `positiveInteger()`, `formatInteger()`, `compactResourceValue()`, `trimText()`, and `safeText()`.
- Root, avatar renderer, profile state, and profile dialog now share the formatter instead of carrying duplicate private helpers.
- Added `assets/scripts/scenes/StatusPresenter.ts` and `.meta`.
- `StatusPresenter` owns the current status `Label`, status add/set behavior, and reset after content-root clearing so status updates do not target detached labels.
- `LootChainGameRoot.ts` keeps only `addStatus()` and `setStatus()` wrappers for existing renderer host contracts.
- `scripts/check-layout.mjs` now validates both modules and forbids formatter/status implementation from returning to root.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
  - `assets/scripts/**/*.ts` Chinese-content scan -> all TypeScript files contain Chinese comments or Chinese UI text.
  - `git diff --check` -> passed, with only existing LF/CRLF conversion warnings.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 2F Readonly Codex Panel

- 当前继续以 `D:\business\project\lootchain-cocos` 的 Cocos-only 大厅为准，不回到 web-vue。
- 多角色结论：
  - 产品：底部 `图鉴` 是大厅基础可达入口，但当前只能做只读预览，不能进入英雄养成。
  - UI/设计：用暗金弹框、卡片网格和统计芯片表达“收录/已拥有/只读预览”，保持与大厅 HUD 风格一致。
  - 接口：前端不直接调用带有升级、升星、觉醒、精炼写入口的英雄 Controller，改走大厅专用只读门面 `GET /api/player/lobby/codex`。
  - 审查/测试：后端过滤 EX/锁定内容，前端二次过滤 `EX` rarity 和 `EX_` heroCode；检查脚本固定该只读 allowlist 与 modal 阻断行为。
- 本轮完成：
  - 新增 `LobbyCodexApi`、`LobbyCodexTypes`、`LobbyCodexState`、`LobbyCodexLoader`、`LobbyCodexPanelRenderer`。
  - `LootChainGameRoot` 增加图鉴弹框打开、关闭、刷新、状态读取和重绘清理。
  - `LobbyHudRenderer` 的底部 `图鉴` 与小屏 compact `图鉴` 会打开只读图鉴面板。
  - 图鉴面板内部点击不会关闭弹框；仅外层遮罩或关闭按钮关闭。
  - 面板只显示英雄基础信息和拥有状态，不提供升级、升星、觉醒、精炼、获取、领奖、购买、出售、结算、抽卡或任何经济写操作。
- 后端配套：
  - `LootChain` 新增 `PlayerLobbyCodexController`、`PlayerLobbyCodexService`、`PlayerLobbyCodexServiceImpl`、`PlayerLobbyCodexItemVO`。
  - `lootchain-admin` 已排除该玩家端 Controller，避免后台应用加载玩家 Sa-Token 链路。
- 验收状态：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed。
  - `mvn.cmd --no-transfer-progress -pl lootchain-game -am -DskipTests compile` -> passed。
- 边界不变：不改变经济规则，不开放 EX V1，不新增任何经济写入口；当前图鉴是只读展示。

### 2026-05-30 Lobby Stage 2D Readonly Notice Panel And Interface Guardrails

- Continued the lobby work through product, UI/design, backend-interface, review, and test roles without waiting for per-stage confirmation.
- Backend interface added in `D:\business\project\LootChain`: `GET /api/player/lobby/notices`, `PlayerLobbyNoticeController`, `PlayerLobbyNoticeService`, `PlayerLobbyNoticeServiceImpl`, and `PlayerLobbyNoticeVO`.
- The new backend endpoint requires the player Sa-Token login context and only reads published, in-window `notice_config` rows. It does not create rewards, does not update player state, and does not add any economy write path.
- Admin/game scan boundary updated: `PlayerLobbyNoticeController` is excluded from `lootchain-admin` through `AdminApplication`, matching the existing player-controller isolation pattern.
- Cocos frontend added `LobbyNoticeTypes.ts`, `LobbyNoticeApi.ts`, `LobbyNoticeState.ts`, `LobbyNoticeLoader.ts`, and `LobbyNoticePanelRenderer.ts`.
- `LootChainGameRoot.ts` now owns the notice panel open/close state, loads notices after login, and keeps notice/profile/placeholder panels mutually exclusive.
- `LobbyHudRenderer.ts` now routes the desktop activity entry and compact `活动` entry to the readonly notice panel. Other lobby entries still open the unified local unopened dialog.
- `scripts/check-layout.mjs` now requires the new notice API/type/loader/state/panel files and their `.meta` files, scans login/lobby scene modules by directory, adds explicit forbidden tokens for EX V1-style and fund-pool-style client access, and enforces a lobby readonly API allowlist.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
  - Backend `mvn.cmd --no-transfer-progress -pl lootchain-game -am -DskipTests compile` -> passed. Maven still reports the existing local `settings.xml` format warning, but compilation succeeds.
- Boundary update: active Cocos client API surface is now `POST /api/player/auth/dev-login`, readonly `GET /api/player/me/lobby`, and readonly `GET /api/player/lobby/notices`. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 2E Notice Error Fallback And Modal Click Blocking

- User reported the notice/activity panel displayed `读取失败：系统异常`, and clicking inside dialogs could close them.
- Backend fix:
  - `PlayerLobbyNoticeServiceImpl.listActiveNotices()` now catches local read failures and returns an empty readonly list.
  - This is mainly for local/dev databases where `notice_config` may not be initialized yet; the server logs a warning but does not break the lobby notice panel.
- Cocos modal fix:
  - `LobbyNoticePanelRenderer.ts` adds `BlockInputEvents` to `LobbyNoticePanel`.
  - `LobbyProfileDialogRenderer.ts` adds `BlockInputEvents` to `LobbyProfilePanel`.
  - `LootChainGameRoot.ts` adds `BlockInputEvents` to `LobbyPlaceholderPanel`.
  - Result: only outside dim clicks or explicit close buttons close dialogs; clicks inside panel content no longer pass through to the dim layer.
- Notice UI wording fix:
  - When the notice endpoint is unavailable, the panel now shows a soft fallback status instead of a red `读取失败：系统异常` prompt.
- Guardrail update:
  - `scripts/check-layout.mjs` now requires the modal `BlockInputEvents` tokens for notice/profile/placeholder panels.
- Verification:
  - `npm.cmd run check:layout` -> passed.
  - Focused Cocos `tsc.cmd --noEmit` -> passed.
  - Backend `mvn.cmd --no-transfer-progress -pl lootchain-game -am -DskipTests compile` -> passed.
- Boundary unchanged: no gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

## 2026-05-30 Lobby Stage 1W 统一未开放弹窗

- 用户已明确要求停止继续拆模块，本阶段改为推进可见功能体验。
- 本阶段新增大厅统一“功能暂未开放”本地弹窗：
  - 根脚本状态：`lobbyPlaceholderDialog`
  - 打开/关闭/移除：`openLobbyPlaceholderDialog()`、`closeLobbyPlaceholderDialog()`、`removeLobbyPlaceholderDialog()`
  - 渲染节点：`LobbyPlaceholderDim`、`LobbyPlaceholderPanel`、`Button_知道了`
- 触发范围：
  - 左侧活动入口
  - 中央建筑热点与铭牌
  - 右侧挑战卡片
  - 底部导航
  - 右下冒险按钮
  - 右上系统图标
- 所有触发仍然只是本地 placeholder，不跳转玩法页面，不调用玩法接口，不新增经济写入口。
- `scripts/check-layout.mjs` 已补充：
  - 检查弹窗方法和节点存在。
  - 检查打开/关闭弹窗路径不能调用 `renderLobby()`，避免重建大厅背景。
  - 多分辨率校验 `LobbyPlaceholderPanel` 保持在舞台内。
- 验证完成：
  - `npm.cmd run check:layout` -> passed with `layout ok`
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed
  - 触达代码中文注释/中文文案扫描 -> passed
- 边界不变：当前只开放 `POST /api/player/auth/dev-login` 与只读 `GET /api/player/me/lobby`。不改变经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-05-30 Lobby Stage 1X 多角色大厅推进

- 本阶段按产品、设计、美术、UI、开发、接口边界、代码审查、测试七个角色推进。
- 产品结论：
  - 当前不缺大厅功能骨架，下一批优先做不接后端的可见体验、占位反馈、断点体验和视觉质感。
  - 必须后置真实资产、邮件、公告、排行榜、聊天、红点、倒计时、活动、战斗、结算、领取、购买、兑换、抽卡、背包使用、任务奖励、USDT/资金池等。
- 设计/美术结论：
  - 当前 HUD 偏“控件覆盖层”，参考图更像“场景建筑承载入口 + 暗金压边 HUD”。
  - 下一批优先做暗角压层、中央铭牌质感、右侧挑战卡伪插画、资源栏禁用态、底部地台、活动徽章感。
- 接口边界结论：
  - 当前客户端开放面仍只允许 `POST /api/player/auth/dev-login` 和只读 `GET /api/player/me/lobby`。
  - `LootChainApi` 中历史 gacha/hero/bag API 不代表当前阶段开放，Lobby 不得调用。
- 审查修复：
  - `UiContentRootController.clear()` 改为逐个 `removeFromParent()` + `destroy()`，避免旧 Button/Label/Tween/Video 节点脱离父节点后继续存活。
  - `LobbyLoadingFlow.cancel()` 用于 root 销毁时让 loading ticket 失效，避免异步资源加载完成后写入已销毁场景。
  - `renderCurrentView()` 在大厅已有背景时走 `refreshLobbyViewPreservingBackground()`，只重排背景尺寸与 HUD overlay，不再强制 stop/play 背景视频。
  - `LobbyBackgroundController` 增加 `isRendered()`、`resize()`、背景节点引用和销毁 helper，用于 preserve/resize 背景。
  - 窄屏右上系统图标会在可能撞到玩家信息面板时隐藏。
  - 未开放弹窗的“知道了”按钮改为 `LobbyPlaceholderPanel` 子节点 `LobbyPlaceholderOkButton`，不再依赖 root 下的 `Button_知道了` 硬编码清理。
- 本阶段新交互：
  - 顶部资源格点击打开统一未开放弹窗。体力说明来自只读 profile；金币/红宝石/水晶说明仍为视觉占位。
  - 底部聊天预览点击打开统一未开放弹窗，不创建发送框，不连接聊天服务。
- 本阶段新视觉：
  - `LobbyAtmosphereOverlay` 通过 Cocos Graphics 多层半透明压边制造暗角和底部压暗。
  - 中央建筑铭牌增加投影、内外暗金描边和细金线。
  - 右侧挑战卡增加暗色剪影、斜切高光和弱红光，先用 Graphics 提升质感，不新增 bitmap 资产。
- `scripts/check-layout.mjs` 已增强：
  - 资源栏/聊天栏 placeholder token。
  - Lobby HUD 点击契约：除玩家信息外，点击必须走未开放弹窗或受控热点入口。
  - content-root 必须 destroy 旧子节点。
  - loading flow 必须有 `cancel()`。
  - background controller 必须支持 `isRendered()`/`resize()`，用于大厅内保留背景。
  - 系统图标按窄屏重叠规则校验。
  - 增加 839/840、899/900、999/1000、1179/1180、499/500、519/520、559/560、1536x1024、2560x1080、3440x1440 等 viewport 检查。
- 验证完成：
  - `npm.cmd run check:layout` -> passed with `layout ok`
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed
- 边界不变：不改变经济规则，不开放 EX V1，不新增任何经济写入口。

### 2026-05-30 Lobby Stage 1U HUD Layout Metrics Split

- User requested the next stage to continue automatically.
- This stage continues lobby HUD modularization without changing behavior.
- Added `assets/scripts/scenes/lobby/LobbyHudLayout.ts` and `LobbyHudLayout.ts.meta`.
- `LobbyHudLayout` owns pure geometry helpers:
  - `lobbyHudScale(layout)`
  - `lobbyHudEdgeInset(layout, axis, scale)`
  - `resolveLobbyPlayerInfoLayout(layout)`
- `LobbyHudRenderer.ts` keeps the same render order and wrapper method names, but delegates these formulas to `LobbyHudLayout`.
- `scripts/check-layout.mjs` now:
  - requires `LobbyHudLayout.ts` and `.meta`;
  - includes the layout module in the guarded client-source scan;
  - includes it in the combined lobby HUD module token checks;
  - requires the extracted layout formulas in `LobbyHudLayout`;
  - forbids those formulas from returning to `LobbyHudRenderer.ts`.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
  - `assets/scripts/**/*.ts` Chinese-content scan -> all TypeScript files contain Chinese comments or Chinese UI text.
  - `git diff --check` -> passed, with only existing LF/CRLF conversion warnings.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 1V Top HUD Renderer Split

- User requested the next stage.
- This stage continues lobby HUD modularization without changing visible behavior or API boundaries.
- Added `assets/scripts/scenes/lobby/LobbyTopHudRenderer.ts` and `LobbyTopHudRenderer.ts.meta`.
- `LobbyTopHudRenderer` owns:
  - `LobbyPlayerInfoButton`, player info art/fallback frame, level/name/power/EXP labels, profile-dialog click.
  - `LobbyResourceBar`, stamina display, readonly coin/ruby/crystal visual placeholders, disabled `+` marks.
  - `LobbySystemIcons`, friends/mail/settings/menu local placeholder buttons.
- `LobbyHudRenderer.ts` now:
  - constructs `private readonly topHudRenderer`;
  - calls `this.topHudRenderer.render(layout)` first;
  - keeps activity rail, center hotspots, right challenge cards, bottom HUD, local click effects, shared red-dot rendering, and shared text outline style.
- `LobbyHudLayout.ts` remains the single source for top HUD geometry, so the split does not fork multi-resolution formulas.
- `scripts/check-layout.mjs` now:
  - requires `LobbyTopHudRenderer.ts` and `.meta`;
  - includes it in guarded client-source scans and combined lobby HUD module checks;
  - requires player/resource/system top-HUD tokens inside the new module;
  - forbids top-HUD implementation tokens from returning to `LobbyHudRenderer.ts`.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
  - `assets/scripts/**/*.ts` Chinese-content scan -> all TypeScript files contain Chinese comments or Chinese UI text.
  - `git diff --check` -> passed, with only existing LF/CRLF conversion warnings.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 1R UI Primitive Factory Split

- Added `assets/scripts/scenes/UiPrimitiveFactory.ts` and `.meta`.
- `UiPrimitiveFactory` owns shared low-level Cocos UI construction: labels, edit boxes, password masking, framed inputs, buttons, image buttons, sprites, child labels, account glyphs, rectangles, beveled panels, progress bars, hover/press feedback, pointer cursor binding, and button frame drawing.
- The factory uses `UiSpriteFrameCache` for SpriteFrame resolve/request while root still supplies Inspector-bound override frames.
- `LootChainGameRoot.ts` now keeps thin wrapper methods so existing host interfaces for `LoginRenderer`, `LobbyHudRenderer`, `LobbyLoadingRenderer`, `LobbyProfileDialogRenderer`, and `LobbyBackgroundController` remain stable.
- `scripts/check-layout.mjs` now validates the primitive factory, forbids API/economy/gameplay responsibilities inside it, and blocks primitive implementation from returning to root.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 1S Content Root Controller Split

- Added `assets/scripts/scenes/UiContentRootController.ts` and `.meta`.
- `UiContentRootController` owns Cocos root sizing, `LootChainCocosLoginUIRoot` creation, UI node creation, node removal, full content clearing, and content-root validity recovery.
- `LootChainGameRoot.ts` no longer stores `contentRoot`; root delegates `createUiNode()`, `removeNodeFromContent()`, `ensureContentRoot()`, and `applyRootSize()` to the controller.
- Route/view switching remains in root by design, matching the current root responsibility: Cocos lifecycle plus login/loading/lobby transitions.
- `scripts/check-layout.mjs` now validates the content-root controller, forbids API/economy/gameplay responsibilities inside it, and blocks content-root implementation from returning to root.
- Current important modules after Stage 1S:
  - Root/lifecycle: `assets/scripts/scenes/LootChainGameRoot.ts`
  - Layout: `assets/scripts/scenes/AdaptiveStageLayoutResolver.ts`
  - Content root: `assets/scripts/scenes/UiContentRootController.ts`
  - UI primitives: `assets/scripts/scenes/UiPrimitiveFactory.ts`
  - Text/status: `assets/scripts/scenes/UiTextFormatter.ts`, `assets/scripts/scenes/StatusPresenter.ts`
  - Sprite cache: `assets/scripts/scenes/UiSpriteFrameCache.ts`
  - Login: `assets/scripts/scenes/login/LoginRenderer.ts`, `assets/scripts/scenes/login/LoginFlow.ts`
  - Lobby: `assets/scripts/scenes/lobby/LobbyHudRenderer.ts`, `LobbyHudConfig.ts`, `LobbyHudTypes.ts`, `LobbyBackgroundController.ts`, `LobbyLoadingFlow.ts`, `LobbyLoadingRenderer.ts`, `LobbyResourceLoader.ts`, `LobbyProfileLoader.ts`, `LobbyProfileState.ts`, `LobbyProfileDialogRenderer.ts`, `LobbyAvatarRenderer.ts`
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 1T Chinese Code Comments

- User requested that code should include Chinese comments so future reading is easier.
- Added Chinese comments across the current Cocos frontend code path:
  - Root/lifecycle: `assets/scripts/scenes/LootChainGameRoot.ts`
  - Shared infrastructure: `AdaptiveStageLayoutResolver.ts`, `StatusPresenter.ts`, `UiContentRootController.ts`, `UiPrimitiveFactory.ts`, `UiTextFormatter.ts`, `UiSpriteFrameCache.ts`
  - Login: `assets/scripts/scenes/login/LoginRenderer.ts`, `LoginFlow.ts`
  - Lobby: HUD/config/types, avatar, background, loading, profile dialog/state/loader, resource loader
  - Login VFX scripts under `assets/scripts/login/`, plus `LootChainLoginEffectLayer.ts` and `VortexCloudMaterialController.ts`
  - API/config/storage/types: `AppConfig.ts`, API wrappers, `HttpClient.ts`, `TokenStore.ts`, and shared VO/type files
- Future comment style:
  - Use Chinese comments for module ownership, safety boundaries, async stale-state guards, adaptive layout formulas, resource fallbacks, and placeholder-only restrictions.
  - Do not write noisy line-by-line comments for obvious assignments.
  - Comments inside guarded modules must avoid forbidden responsibility tokens, because `scripts/check-layout.mjs` scans comments too.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled `tsc.cmd` focused no-emit check -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 1Y HUD Placeholder State And Safety Polish

- User asked to continue the remaining lobby work with multiple roles and no per-stage confirmation.
- Product/design/art/UI/development/review/test conclusions:
  - keep Cocos-only lobby as the current acceptance path;
  - do not connect gameplay, economy, reward, chat sending, ranking, shop, battle, or settlement systems;
  - make visible HUD entries clearer as `预览/未开放/占位`, not fake live operations.
- Implemented config state cleanup:
  - `LobbyHudConfig.ts` activity sublines now use `预览中` / `未开放` / `占位展示` / `暂未开放`;
  - challenge sublines now use `预览中` / `锁定` / `未开放` / `占位展示`;
  - bottom nav red dots are disabled for this placeholder-only stage.
- Implemented visible HUD polish:
  - `LobbyHudRenderer.ts` bottom HUD now draws a layered dark platform with segmented gold rail;
  - activity rows now use dark-gold banner plates and `LobbyActivityPreviewBadge`;
  - challenge cards now use `LobbyChallengePreviewBadge`;
  - bottom nav slots now have muted metal bases and separators;
  - chat preview now uses `LobbyChatChannel` plus ticker-style message text.
- Implemented top-resource safety polish:
  - stamina remains the only readonly profile-backed resource in the top bar;
  - coin/ruby/crystal now display `未开放` instead of fake wallet-like quantities.
- Implemented readonly profile safety polish:
  - `LobbyProfileLoader.cancel()` invalidates stale profile requests on root destroy and login reset;
  - `LobbyProfileState.applyLoadedProfile()` rejects mismatched `profile.userId` into local fallback state with `资料账号不匹配`.
- `scripts/check-layout.mjs` now guards the new visual tokens and profile async/identity safeguards.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 2B Multi-Role Polish And Safety

- 当前实际工作目录：`D:\business\project\lootchain-cocos`。历史段落中的 `D:\project\lootchain-cocos` 是早期路径记录，新窗口继续以前者为准。
- 用户已授权大厅剩余任务不再逐阶段等待确认，按产品、设计、美术/UI、开发、接口边界、审查、测试多角色自动推进。
- 本轮完成 UI/视觉：
  - 中央场景热点牌匾升级为暗金多层 nameplate，并保持所有未开放入口 `hot: false`，避免真实红点误导。
  - 右侧挑战卡改为非矩形暗金卡片轮廓，增加侧边轨道和更强伪插画遮罩。
  - 底部 HUD 改为三层阶梯式黑金平台；右下“冒险”副标题改为 `未开放`，不再显示假章节进度。
  - 玩家资料弹窗改用安全区拟合缩放，窄屏自动单列展示资料，避免头像、昵称、状态和资料行挤压。
- 本轮完成运行安全：
  - `PlayerAuthApi.devLogin()` 只返回 token，不立即保存。
  - `LoginFlow` 在当前 ticket 校验通过后才调用 `saveToken()`，旧登录响应不会覆盖新 token。
  - `LootChainGameRoot.onDestroy()` 会调用 `loginFlow.cancel()`，销毁时让未完成登录回调失效。
- 本轮完成守卫：
  - `scripts/check-layout.mjs` 检查新牌匾、挑战卡、底部平台、窄屏资料弹窗 token。
  - 检查 lobby config 不能出现 `hot: true`。
  - 检查大厅背景 preserve 刷新顺序、stale-safe token 保存、固定资源栏占位顺序和 disabled plus 非交互。
- 已验证：
  - `npm.cmd run check:layout` -> 通过，输出 `layout ok`。
  - Cocos Creator 3.8.8 自带 `tsc.cmd --noEmit` focused 编译 -> 通过。
  - `git diff --check` -> 通过，仅有已有 LF/CRLF 转换 warning。
- 当前边界仍不变：只开放 `POST /api/player/auth/dev-login` 和只读 `GET /api/player/me/lobby`；不开放 EX V1；不新增抽卡、英雄、背包、商店、领取、购买、结算、资金池、链上领取等任何经济写入口；大厅所有入口仍是本地 placeholder 弹窗。

### 2026-05-30 Lobby Poster SpriteFrame Import Fix

- 用户点击登录后资源加载页报错：`Bundle resources doesn't contain lobby/lobby_bg_poster/spriteFrame`。
- 根因：`assets/resources/lobby/lobby_bg_poster.jpg.meta` 只有 `texture` 子资源，没有 `spriteFrame` 子资源；而 `LobbyResourceLoader` 正确加载的是 `lobby/lobby_bg_poster/spriteFrame`。
- 已修复：
  - `lobby_bg_poster.jpg.meta` 增加 `f9941` 的 `sprite-frame` 子资源，尺寸为 `3840x2160`。
  - `userData.type` 改为 `sprite-frame`。
  - `scripts/check-layout.mjs` 新增 poster meta 守卫，确认 `lobby_bg_poster.jpg.meta` 存在、poster 仍是 3840x2160、且导入类型为 `sprite-frame`。
- 已验证：
  - `npm.cmd run check:layout` -> 通过，输出 `layout ok`。
- 如果 Cocos Preview 还缓存旧 bundle，重启/刷新 Preview 或重新导入该资源后再点登录。
- 边界不变：只是本地资源导入元数据修复，不新增任何接口或经济写入口。

### 2026-05-30 Lobby Stage 2C Compact Action Access

- 继续大厅剩余任务，优先补小屏可达性。
- 问题背景：Stage 2A 已给中央 8 个场景热点加了 `LobbyCompactSceneEntrances`，但小屏下活动栏、右侧挑战、底部导航、冒险和聊天仍可能被隐藏。
- 本轮完成：
  - `LobbyHudRenderer.ts` 新增 `renderCompactActionEntrances()`。
  - 在侧栏或底部 HUD 因分辨率隐藏时，渲染 `LobbyCompactActionEntrances`。
  - 快捷入口包含：`活动`、`挑战`、`冒险`、`聊天`、`英雄`、`背包`、`任务`、`商店`。
  - 所有入口只打开统一未开放弹窗，不跳转、不战斗、不结算、不发奖、不写入经济数据。
  - `LootChainGameRoot.rerenderLobbyOverlay()` 现在会清理 `LobbyCompactActionEntrances` 和 `LobbyCompactSceneEntrances`，避免 resize 或资料刷新后叠出重复面板。
  - `scripts/check-layout.mjs` 已补充 compact action token 和多分辨率边界校验。
- 已验证：
  - `npm.cmd run check:layout` -> 通过，输出 `layout ok`。
  - Cocos Creator 3.8.8 自带 `tsc.cmd --noEmit` focused 编译 -> 通过。
- 边界不变：只开放 `POST /api/player/auth/dev-login` 和只读 `GET /api/player/me/lobby`；不开放 EX V1；不新增任何经济写入口。

### 2026-05-30 Lobby Stage 1Z Profile And Placeholder Clarity

- Continued remaining lobby work without waiting for per-stage confirmation.
- `LobbyProfileDialogRenderer.ts` now keeps the original readonly rows and, when space allows, adds local placeholder rows:
  - `主线进度` -> `未开放`
  - `深渊层数` -> `未开放`
  - `公会` -> `未加入`
  - `称号` -> `圣契旅者`
- The profile dialog still has no edit, bind, logout, reward, or economy action.
- `LootChainGameRoot.ts` unopened dialog now derives subtitles by entry type:
  - resource entries show `只读/占位资源`;
  - chat preview shows `本地聊天预览`;
  - system icons show `系统入口占位`;
  - battle/settlement-like entries show `玩法未开放`.
- `LobbyPlaceholderBoundaryNote` gives an extra local-only boundary message when panel height allows.
- `scripts/check-layout.mjs` now guards the profile placeholder rows and placeholder boundary note.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Lobby Stage 2A Small-Screen Access And Guardrails

- User asked to continue with multiple roles.
- Product role found the main remaining gap: small layouts hid too many lobby entries, so core scene hotspots were not reachable on mobile/compact previews.
- Design/art role recommended continuing with Cocos `Graphics`, especially resource capsules and better compact UI instead of adding bitmap assets.
- Interface/review/test roles recommended login stale-response guards and stronger dependency-free checks.
- Implemented UI/accessibility:
  - `LobbyHudRenderer.ts` now renders `LobbyCompactSceneEntrances` when normal scene hotspots are hidden by size thresholds.
  - The compact panel includes all eight local scene entries: 召唤祭坛、公会、排行榜、旅者集会、熔铸工坊、深渊之门、战役、商店.
  - Compact entries call the same placeholder path as desktop hotspots; no gameplay/economy route is opened.
- Implemented top-resource polish:
  - `LobbyTopHudRenderer.ts` resource cells now draw `drawResourceCapsule()` dark-gold beveled capsules.
  - Resource glyphs gained extra highlight/cut lines.
  - If the full resource bar cannot fit, `LobbyCompactStaminaChip` preserves a local stamina entry where there is enough vertical space.
- Implemented runtime hardening:
  - `LoginFlow.ts` now uses `loginTicket`, `nextLoginTicket()`, and `isCurrentLogin()` so stale `dev-login` responses cannot start loading/profile flow after a newer login attempt.
  - `LobbyResourceLoader.ts` now requires `${LOBBY_POSTER_PATH}/spriteFrame` and no longer builds runtime SpriteFrame from texture fallback.
- Implemented guardrail hardening:
  - `scripts/check-layout.mjs` now parses `LOBBY_SCENE_HOTSPOTS` from `LobbyHudConfig.ts` instead of using a duplicate coordinate array.
  - It validates normalized hotspot/hit-area bounds and keeps config data-only.
  - It guards compact scene entries, compact stamina chip, resource capsules, login ticket, resource loader hard-fail behavior, and non-stamina resource placeholders.
  - It adds threshold viewport checks around 719/720, 1000x519, and 1180x500.
- Verification completed:
  - `npm.cmd run check:layout` -> passed with `layout ok`.
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed.
- Boundary unchanged: only `POST /api/player/auth/dev-login` and readonly `GET /api/player/me/lobby` are active. No gameplay/economy endpoint was opened, no economy rule changed, and EX V1 remains closed.

### 2026-05-30 Latest Context: Lobby Stage 2G Readonly Hero Roster

- 最新阶段是 Cocos-only 大厅 `英雄` 只读队列，不回到 web-vue。
- 前端新增 `LobbyCodexApi`、`LobbyCodexTypes`、`LobbyCodexState`、`LobbyCodexLoader`、`LobbyCodexPanelRenderer`，底部 `图鉴` 和 compact `图鉴` 都打开该面板。
- 后端新增大厅专用只读门面 `GET /api/player/lobby/codex`，对应 `PlayerLobbyCodexController`、`PlayerLobbyCodexService`、`PlayerLobbyCodexServiceImpl`、`PlayerLobbyCodexItemVO`。
- 前端新增 `LobbyHeroApi`、`LobbyHeroTypes`、`LobbyHeroRosterState`、`LobbyHeroRosterLoader`、`LobbyHeroRosterPanelRenderer`，底部 `英雄` 和 compact `英雄` 都打开该面板。
- 后端新增大厅专用只读门面 `GET /api/player/lobby/heroes`，对应 `PlayerLobbyHeroController`、`PlayerLobbyHeroService`、`PlayerLobbyHeroServiceImpl`、`PlayerLobbyHeroItemVO`。
- 前端不直接调用包含升级、升星、觉醒、精炼写入口的英雄 Controller；图鉴面板不提供任何养成、获取、领奖、购买、出售、结算或经济写操作。
- 英雄队列面板展示主角和已拥有英雄，主角按 `protagonist=true` 置顶，面板不提供任何养成、抽卡、领奖、购买、出售、结算或经济写操作。
- EX/锁定内容由后端过滤，Cocos API 包装层再过滤 `EX` rarity 和 `EX_` heroCode。
- 图鉴弹框内部点击通过 `BlockInputEvents` 阻断，不会误关闭；只允许外层遮罩或关闭按钮关闭。
- 英雄队列弹框内部点击通过 `BlockInputEvents` 阻断，不会误关闭；只允许外层遮罩或关闭按钮关闭。
- 文档与检查脚本已同步增加只读 API allowlist、modal 阻断、EX 过滤、主角置顶和多分辨率边界守卫。
- 边界不变：不改变经济规则，不开放 EX V1，不新增任何经济写入口。

### 2026-05-30 Normal Player Flow Analysis

- 用户要求分析“正常玩家登录进入游戏后会做什么”，并按产品、设计、玩家、UI、美术、研发、审查、验收多角色拆解。
- 已新增文档：`D:\business\project\lootchain-cocos\docs\normal-player-flow-analysis.md`。
- 结论：下一阶段不应继续扩大厅占位入口，而应推进第一条真实游玩主线。
- 推荐下个开发阶段：`Stage 3A：大厅右下冒险入口 -> 主线推荐状态 -> 章节地图只读壳`。
- 标准玩家闭环定义为：登录 -> 加载账号状态 -> 进入大厅 -> 明确下一目标 -> 主线/冒险 -> 编队确认 -> 战斗 -> 结算 -> 成长 -> 回到大厅继续。
- 研发顺序建议：先只读主线推荐和章节地图，再做队伍确认，再做战斗表现壳，最后单独审查后端战斗结算。
- 审查边界：前端不能决定奖励、掉落、经验、金币、材料或关卡完成；经济写入口必须后端事务、幂等和日志；EX V1 仍然不开放。

### 2026-05-30 Protagonist Create Design

- 用户提出登录成功后应先进入主角色选择/创建界面：男/女二选一、起名、点击进入游戏。
- 主角色设计边界：
  - 主角不是抽卡池英雄，不参与抽卡概率，不产出抽卡碎片。
  - 主角建议为 `SSR 主角`，属性按 SSR 档，但属于主角专属 SSR。
  - 主角在英雄列表第一位，以卡牌形式展示，可加入战斗。
  - 主角有攻击、防御、辅助三形态；默认攻击形态，防御/辅助通过主线剧情道具或主线进度解锁。
  - 当前不开放 EX V1，不新增经济写入口。
- 多角色结论：
  - 产品/玩家：主角是“玩家身份载体 + 新手保底战斗单位”，V1 先做创建、攻击形态、英雄列表置顶、可参战。
  - UI/美术：角色创建页使用暗黑哥特、黑金、深渊红、影视级主菜单风格；文字和按钮后续用 Cocos 原生 UI，不烘焙在 AI 图里。
  - 研发/审查：主角创建是账号初始化能力；建议 `player_protagonist` + `user_hero source_type=PROTAGONIST`；创建接口只能后端固定模板，不能让客户端传 heroCode/rarity/stats。
- 已用 imagegen 生成影视级角色创建界面概念图，并复制到：
  - `D:\business\project\lootchain-cocos\docs\ui-reference\protagonist\protagonist-create-concept-v1.png`
- 已新增设计文档：
  - `D:\business\project\lootchain-cocos\docs\protagonist-create-design.md`
- 推荐下一阶段：
  - `Stage P1：角色创建产品壳`，先做 Cocos 前端 UI、男/女选择、名字输入、本地进入大厅流程。
  - 后端主角创建接口属于高风险玩家状态写入，应单独设计、审查和验收后再接入。

### 2026-05-30 Protagonist Stage P1 Cocos Shell

- 已按上一阶段设计开始实现 `Stage P1：角色创建产品壳`。
- 当前仍只改 Cocos 前端，不新增后端接口，不写数据库，不新增经济写入口。
- 新增文件：
  - `assets\scripts\types\ProtagonistTypes.ts`
  - `assets\scripts\scenes\protagonist.meta`
  - `assets\scripts\scenes\protagonist\ProtagonistCreateState.ts`
  - `assets\scripts\scenes\protagonist\ProtagonistCreateFlow.ts`
  - `assets\scripts\scenes\protagonist\ProtagonistCreateRenderer.ts`
- 路由变化：
  - `LoginFlow` 登录成功后调用 `handleLoginSuccess(userId, tokenName)`。
  - `LootChainGameRoot` 新增 `protagonistCreate` view。
  - 新账号本地预览状态会进入主角创建页。
  - 本地已创建过主角的账号跳过创建页，继续原来的 loading -> lobby 流程。
- 角色创建页能力：
  - 男/女主角二选一。
  - 输入角色名，长度 2-12，支持中文、英文、数字、下划线。
  - 展示 `SSR 主角` 和三形态。
  - 攻击形态默认开放。
  - 防御/辅助形态只显示锁定提示：需要主线剧情道具解锁。
- 本地预览状态：
  - 使用 `lootchain.protagonist.preview.v1.{userId}` 保存创建预览。
  - 该状态仅用于前端流程验证，不等同于正式账号主角。
- `scripts/check-layout.mjs` 已增加主角创建模块、关键 token、禁止接口/经济词、以及多分辨率 bounds 守卫。
- 已验证：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
- 边界不变：不改变经济规则，不开放 EX V1，不新增经济写入口；正式主角创建接口后续单独审查。

### 2026-05-30 Protagonist Character Art Patch

- 用户反馈主角创建页只有剪影，没有人物图，需要按概念图放入角色。
- 已从 `docs/ui-reference/protagonist/protagonist-create-concept-v1.png` 裁切并接入男女主角图：
  - `assets/resources/ui/protagonist/protagonist_male_attack.png`
  - `assets/resources/ui/protagonist/protagonist_female_attack.png`
- 已新增：
  - `assets/resources/ui/protagonist.meta`
  - `assets/resources/ui/protagonist/protagonist_male_attack.png.meta`
  - `assets/resources/ui/protagonist/protagonist_female_attack.png.meta`
- `ProtagonistCreateRenderer.ts` 现在通过 `addSprite()` 优先渲染 `ui/protagonist/protagonist_*_attack/spriteFrame`。
- 剪影仅作为资源加载失败兜底保留。
- `scripts/check-layout.mjs` 已加入 protagonist 资源必需项和 renderer 资源路径守卫。
- 已验证：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
- 边界不变：只接入本地 UI 资产，不新增接口、不写数据库、不改变经济规则、不开放 EX V1。

### 2026-05-30 Protagonist Generated Art Replacement

- 用户反馈上一版主角图来自概念图裁切，裁剪质量不足。
- 已使用 imagegen 重新生成接近概念方向的高质量影视级男女主角卡面，并覆盖现有资源：
  - `assets/resources/ui/protagonist/protagonist_male_attack.png`
  - `assets/resources/ui/protagonist/protagonist_female_attack.png`
- 两张图片已统一为 `512x768`，保留原 `.meta` 和现有 `spriteFrame` 加载路径。
- `ProtagonistCreateRenderer.ts` 无需改路径，仍优先加载 `ui/protagonist/protagonist_*_attack/spriteFrame`。
- 下一窗口接手时，如需继续优化角色创建页，优先在现有卡面资源基础上调卡框、标题、输入框和按钮，不要回退到剪影或概念图裁切版。
- 边界不变：本次只替换本地 UI 资产，不新增后端接口，不写数据库，不改变经济规则，不开放 EX V1。

### 2026-05-30 Protagonist DB Sync Clarification

- 历史状态：当时创建角色不会同步到数据库。
- 当时 `ProtagonistCreateFlow.submitCreate()` 只调用 `ProtagonistCreateState.createLocalProfile()`，没有调用任何后端 `POST` 创建接口。
- 当时保存位置是 Cocos 预览环境的本地状态：
  - 内存 `memoryProfiles`
  - `localStorage` key：`lootchain.protagonist.preview.v1.{userId}`
- 本地创建成功当时只用于跳过创建页并进入 loading/lobby；不同设备、不同浏览器或清空本地存储后不会保留。

### 2026-05-30 Protagonist DB Sync Stage

- 当前最新状态：主角色创建已经从本地预览改为服务端权威创建。
- Cocos 登录成功后会先调用：
  - `GET /api/player/protagonist/state`
  - `POST /api/player/protagonist`
- 前端只允许提交：
  - `gender`
  - `protagonistName`
- 前端不提交 `heroCode`、`rarity`、等级、星级、战力、属性或奖励字段；这些都由后端固定生成。
- 后端新增主角色模块：
  - `PlayerProtagonistController`
  - `PlayerProtagonistService`
  - `PlayerProtagonistServiceImpl`
  - `PlayerProtagonistMapper`
  - `PlayerProtagonist`
  - `PlayerProtagonistVO`
  - `PlayerProtagonistStateVO`
  - `PlayerProtagonistCreateDTO`
- 数据库新增/更新：
  - `player_protagonist`
  - `user_hero.source_type`
  - `user_hero.sort_weight`
  - 主角模板 `PROTAGONIST_MALE_ATTACK` / `PROTAGONIST_FEMALE_ATTACK`
  - SQL 脚本：`D:\business\project\LootChain\sql\12_protagonist_module.sql`
- 创建行为：
  - 使用玩家侧 Sa-Token 登录态。
  - `game_user` 行级锁保护创建流程。
  - `player_protagonist.user_id` 唯一，重复点击或重复请求返回已有主角，不生成第二个主角。
  - 后端创建 `user_hero source_type=PROTAGONIST`，并给主角高 `sort_weight`，用于英雄列表置顶。
  - 防御/辅助形态仍锁定，后续只能由主线剧情/道具链路解锁。
- Cocos 本地 `localStorage` 现在只作为诊断镜像，不再作为是否跳过创建页的权威依据。
- 已执行本地 SQL 迁移，当前本地 `lootchain` schema 已存在 `player_protagonist` 和 `user_hero` 新字段。
- 边界不变：主角色创建是账号初始化写入，不是抽卡、奖励、购买、结算、资金池或链上领取入口；不改变经济规则，不开放 EX V1，不新增经济写入口。

### 2026-05-30 Lobby Stage 2G Readonly Hero Roster

- 下一阶段已推进到 `Stage P3：英雄列表主角置顶` 的大厅只读版本。
- 后端新增大厅专用只读门面：
  - `GET /api/player/lobby/heroes`
  - `PlayerLobbyHeroController`
  - `PlayerLobbyHeroService`
  - `PlayerLobbyHeroServiceImpl`
  - `PlayerLobbyHeroItemVO`
- 该门面复用玩家已拥有英雄列表，但输出更窄的大厅 VO，并额外保证：
  - `source_type=PROTAGONIST` / `protagonist=true` 主角排在第一位。
  - EX 稀有度和 `EX_` 英雄编码过滤。
  - 只读展示，不提供升级、升星、觉醒、精炼、抽卡、领取、购买、出售、结算或任何经济写入口。
- `lootchain-admin` 的 `AdminApplication` 已排除 `PlayerLobbyHeroController`，避免后台应用加载玩家端 Sa-Token Controller。
- Cocos 前端新增：
  - `assets/scripts/types/LobbyHeroTypes.ts`
  - `assets/scripts/api/LobbyHeroApi.ts`
  - `assets/scripts/scenes/lobby/LobbyHeroRosterState.ts`
  - `assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts`
  - `assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts`
- 底部 `英雄` 和小屏 compact `英雄` 会打开只读英雄队列面板。
- 面板展示主角卡、形态、等级、星级、战力和已拥有英雄；主角有 `主角` 标识，攻击形态显示为 `攻击形态`。
- 弹框内部点击通过 `BlockInputEvents` 阻断，不会误关闭；只允许遮罩或关闭按钮关闭。
- `scripts/check-layout.mjs` 已增加只读 API allowlist、英雄面板模块、EX 过滤、主角置顶和多分辨率边界守卫。
- 已验证：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
  - `mvn.cmd --no-transfer-progress -pl lootchain-core "-Dtest=PlayerLobbyHeroServiceImplTest,PlayerProtagonistServiceImplTest" test` -> passed。
  - `mvn.cmd --no-transfer-progress -pl lootchain-admin,lootchain-game -am -DskipTests compile` -> passed。
- 边界不变：不改变经济规则，不开放 EX V1，不新增经济写入口。

## 2026-05-31 Lobby Stage 3A Readonly Adventure Shell

- 当前最新阶段已推进到 `Stage 3A：大厅冒险入口 -> 主线推荐状态 -> 章节地图只读壳`。
- 监督口径：项目当前真实流程为 `登录 -> 主角检查/创建 -> 加载 -> 大厅 -> 公告/图鉴/英雄队列只读 -> 冒险主线只读地图`。
- 后端新增玩家侧只读接口：
  - `GET /api/player/lobby/adventure`
  - `PlayerLobbyAdventureController`
  - `PlayerLobbyAdventureService`
  - `PlayerLobbyAdventureServiceImpl`
  - `PlayerLobbyAdventureVO`
  - `PlayerLobbyAdventureChapterVO`
  - `PlayerLobbyAdventureStageVO`
- `lootchain-admin` 的 `AdminApplication` 已排除 `PlayerLobbyAdventureController`，避免后台应用加载玩家端 Sa-Token Controller。
- 当前冒险数据是服务端静态主线展示壳，复用大厅资料读取玩家等级和战力，只返回章节、关卡、推荐战力、敌人摘要和掉落预览文案。
- Cocos 前端新增：
  - `assets/scripts/types/LobbyAdventureTypes.ts`
  - `assets/scripts/api/LobbyAdventureApi.ts`
  - `assets/scripts/scenes/lobby/LobbyAdventureState.ts`
  - `assets/scripts/scenes/lobby/LobbyAdventureLoader.ts`
  - `assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts`
- 大厅右下 `冒险` 主按钮和小屏 compact `冒险` 快捷入口会打开 `LobbyAdventurePanel`。
- 大厅右下 `冒险` 副标题会优先使用已加载的后端推荐关卡名；未加载时才兜底显示 `主线 1-1 暗影城门`。
- 面板内部点击通过 `BlockInputEvents` 阻断，不会误关闭；面板只允许遮罩或关闭按钮关闭。
- 面板右侧 `编队未开放` 是禁用视觉按钮，当前不保存编队、不进入战斗。
- `scripts/check-layout.mjs` 已同步：
  - 新增 adventure API/module/meta 必需项；
  - 允许只读 `GET /api/player/lobby/adventure`；
  - 检查冒险面板自适应边界；
  - 检查 HUD 点击契约允许 `openLobbyAdventurePanel()`。
- 已验证：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
  - `mvn.cmd --no-transfer-progress -pl lootchain-core "-Dtest=PlayerLobbyAdventureServiceImplTest" test` -> passed。
  - `mvn.cmd --no-transfer-progress -pl lootchain-admin,lootchain-game -am -DskipTests compile` -> passed。
- 下一阶段建议：
  - `Stage 3B`：关卡详情/编队确认只读或本地选择壳。
  - 队伍保存属于玩家状态写入，必须单独审查。
  - 战斗启动和结算仍未开放；奖励、体力、进度必须由后端事务控制。
- 边界不变：不改变经济规则，不开放 EX V1，不新增经济写入口；当前不保存主线进度、不保存编队、不创建战斗、不结算、不扣体力、不发放奖励。

## 2026-05-31 Lobby Stage 3B Readonly Formation Shell

- 当前最新阶段已继续推进到 `Stage 3B：关卡详情 -> 编队确认只读壳`。
- Cocos 前端新增：
  - `assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts`
- `LobbyAdventurePanelRenderer` 中可解锁关卡的 `编队确认` 按钮现在打开 `LobbyFormationPanel`。
- `LobbyFormationPanel` 复用已有 `LobbyHeroRosterLoader` / `GET /api/player/lobby/heroes` 的只读英雄数据，不新增后端写接口。
- 面板显示：
  - 五个默认上阵槽；
  - 主角优先作为队长/第一槽；
  - 候选英雄只读列表；
  - `战斗未开放` 禁用视觉按钮。
- 面板内部点击通过 `BlockInputEvents` 阻断，不会误关闭；只允许遮罩或关闭按钮关闭。
- `scripts/check-layout.mjs` 已同步新增 formation 模块、root wiring、modal bounds 和边界 token。
- 已验证：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
- 下一阶段建议：
  - `Stage 3C`：战斗表现壳或战斗启动前的服务端 session 设计。
  - 如果要保存编队，必须新增玩家状态写接口并单独审查；当前阶段没有保存编队。
- 边界不变：不改变经济规则，不开放 EX V1，不新增经济写入口；当前不保存编队、不创建战斗、不结算、不扣体力、不发放奖励。

## 2026-05-31 Lobby Stage 3C Local Battle Preview Shell

- 当前阶段继续推进到 `冒险关卡详情 -> 编队确认 -> 本地战斗预演`。
- Cocos 前端新增 `assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts` 与 `.meta`。
- `LobbyFormationPanelRenderer` 底部按钮从禁用的“战斗未开放”升级为“战斗预演”，点击后只打开本地表现壳。
- `LobbyBattlePreviewPanelRenderer` 只读取 `GET /api/player/lobby/heroes` 已有的只读英雄队列状态，展示我方五个槽位、主角优先、敌方占位单位和本地战斗日志。
- 当前没有新增后端接口，没有创建 battle session，没有保存编队，没有扣体力，没有写主线进度，没有结算，没有发奖，没有任何经济写入口。
- 弹框内部通过 `BlockInputEvents` 阻断点击穿透；只允许点击遮罩或“返回编队”关闭。
- `scripts/check-layout.mjs` 已补齐 battle preview 模块、root wiring、节点名、禁用结算按钮和多分辨率 bounds 守卫。
- 已验证：`npm.cmd run check:layout` 通过；Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` 通过。
- 下一阶段建议：设计并实现后端权威的 battle session/settlement 闭环，但 reward、stamina、progress、drop 必须由后端事务控制，且先做最小安全模型。

## 2026-05-31 Lobby Stage 4A Backend Battle Session And No-Reward Settlement

- 当前阶段已经从本地战斗预演推进到后端权威的最小战斗闭环：
  - `POST /api/player/battles/start`
  - `POST /api/player/battles/{battleNo}/settle`
- 本阶段 settlement 只是“战斗结果记录”，不是经济结算。
- Cocos 新增：
  - `assets/scripts/types/BattleTypes.ts`
  - `assets/scripts/api/BattleApi.ts`
  - `assets/scripts/scenes/lobby/LobbyBattleState.ts`
  - `assets/scripts/scenes/lobby/LobbyBattleFlow.ts`
- `LobbyBattlePreviewPanelRenderer.ts` 已从纯本地预演升级为读取 battle flow 状态：创建会话、记录无奖励结算、显示错误、返回大厅。
- `LootChainGameRoot.ts` 打开战斗面板时会先刷新英雄队列，然后自动创建 battle session；结算完成后可从结果面板返回大厅。
- Cocos 只提交关卡、英雄 ID、队长 ID、requestId 和客户端版本；不提交奖励、体力、进度、掉落、属性或资源变化。
- `BattleApi` 会强制校验 `readonlyEconomy=true` 且 `rewardGranted=false`，避免后端误返回经济结算语义。
- 后端已新增 `battle_session` 与 `battle_settlement`，并通过 JDBC 在本地 `lootchain` schema 执行 `sql/13_battle_session_module.sql`。
- 已验证：Cocos `check:layout`、Cocos focused `tsc`、后端 battle/adventure/hero/protagonist 单测、后端 game/admin compile 全部通过。
- 边界不变：不扣体力，不写主线进度，不发奖励，不写背包/货币/USDT/资金池，不开放 EX V1。

## 2026-05-31 Stage 4B Player Flow Smoke Verification

- 后端项目新增 `D:\business\project\LootChain\scripts\smoke-player-flow.ps1`。
- 脚本用于新窗口/本地环境快速复核当前 Cocos 正常玩家链路：
  `dev-login -> protagonist state -> lobby profile -> adventure -> hero roster -> battle start -> no-reward settlement -> lobby profile re-read`。
- 已在本机 `http://localhost:8081`、`userId=1`、`MAIN_1_1` 执行通过。
- 关键结果：
  - `heroIds=4,1,2`
  - `rewardGranted=false`
  - `readonlyEconomy=true`
  - `staminaBefore=100`
  - `staminaAfter=100`
  - `combatPowerBefore=15448`
  - `combatPowerAfter=15448`
- 若后续新窗口需要先确认后端是否为最新代码，优先运行：

```powershell
cd D:\business\project\LootChain
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\smoke-player-flow.ps1 -BaseUrl http://localhost:8081 -UserId 1 -StageCode MAIN_1_1
```

- Stage 4B 仍然只是无奖励战斗记录闭环；真实奖励、体力消耗、主线进度推进必须单独立项审查。

## 2026-05-31 Lobby Stage 4C Battle Presentation Pass

- 当前最新阶段进入 `Stage 4C：战斗表现层第一版`。
- UI 审查代理指出的断点已处理：
  - 小屏/compact 冒险面板新增 `LobbyAdventureCompactFormationButton`，可以继续进入编队。
  - 冒险详情中的奖励文案降级为 `关卡配置预览（当前不发放）`，避免误导玩家以为当前会发奖。
- 新增战斗表现模块：
  - `assets/scripts/scenes/lobby/LobbyBattlePresentationLayout.ts`
  - `assets/scripts/scenes/lobby/LobbyBattlePresentationState.ts`
- `LobbyBattlePreviewPanelRenderer.ts` 已从列表式预览改为暗黑影视风战斗表现面板：
  - `LobbyBattleCinematicBackdrop`
  - `LobbyBattleActor_Ally_*` / `LobbyBattleActor_Enemy_*`
  - `LobbyBattleActorHpBar`
  - `LobbyBattleEffectLayer`
  - `LobbyBattleBoundaryBadge`
  - compact footer 纵向/双行重排
- 战斗状态语义：
  - 创建会话中：禁用主按钮。
  - 会话已创建：展示战斗演出与“记录结果”。
  - 记录中：禁用主按钮。
  - 已记录：只显示战斗记录完成和“返回大厅”，不出现领取、战利品、资源增长或奖励动画。
- `scripts/check-layout.mjs` 已同步守卫新增模块、compact 冒险 CTA、战斗表现节点和 no-reward 文案。
- Stage 4D 第一层防误触/防重叠已追加：
  - `LobbyBattlePresentationLayout.ts` 在极小视口减少 actor 数量，避免演员卡片和日志区互相覆盖。
  - `scripts/check-layout.mjs` 现在会计算战斗演员、日志和 footer 按钮内部矩形，发现越界或重叠会直接失败。
  - 该门禁曾捕获日志压到第 5 个演员的问题，已通过缩小日志宽度和调整站位修复。
- 验证：
  - `npm.cmd run check:layout` 通过。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` 通过。
  - 后端 `scripts/smoke-player-flow.ps1` 再次通过：
    - `battleNo=B0ffc7b31c3c541c1827ff9dfc3a8124f`
    - `settlementNo=S8eb5e55fe9794e00aa3687faf9ecff01`
    - `rewardGranted=false`
    - `readonlyEconomy=true`
    - 体力 `100 -> 100`
    - 战力 `15448 -> 15448`
- 边界不变：不扣体力，不写主线进度，不发奖励，不写背包/货币/USDT/资金池，不开放 EX V1。

## 2026-05-31 Lobby Stage 4E Local Battle Timeline

- 当前继续推进到 `Stage 4E：本地战斗表现时间轴`。
- `LobbyBattleState.ts` 新增：
  - `presentationStep`
  - `presentationComplete`
- `LobbyBattleFlow.ts` 新增本地表现计时：
  - battle session 创建成功后，自动推进 4 个演出 step。
  - 演出过程中主按钮显示 `演出中`，节点为 `LobbyBattlePlaybackPending`，不会提交 settlement。
  - 演出完成后才允许点击 `记录结果` 调用无奖励 settlement。
  - `cancel()`、登录重置、重新开始、结算时都会清理本地计时器。
- `LobbyBattlePresentationState.ts` 会根据 step 输出：
  - timeline 文案；
  - 战斗日志；
  - 伤害浮字；
  - 敌方首位 HP 展示比例。
- 该时间轴只服务 Cocos 表现，不参与服务端胜负权威，不决定奖励、体力、进度、掉落或资源变化。
- 验证：
  - `npm.cmd run check:layout` 通过。
- focused Cocos TypeScript 检查通过。

## 2026-05-31 Lobby Stage 4F Selected Stage Propagation

- 当前继续收紧 `冒险 -> 编队 -> 战斗` 的关卡选择链路。
- 已修复的问题：战斗启动不再只使用推荐关卡或默认 `MAIN_1_1`；从冒险详情或 compact 冒险按钮进入编队时，会把当前 `stageCode` 传给编队页，再传给战斗预览和 `POST /api/player/battles/start`。
- Cocos 修改点：
  - `LobbyAdventurePanelRenderer.ts`：`openLobbyFormationPanel(stageCode?: string)` 现在从推荐关卡和详情关卡按钮传入具体 `stageCode`。
  - `LobbyFormationPanelRenderer.ts`：读取 `currentLobbySelectedStageCode()`，在编队页标题区展示当前目标关卡；开始战斗时沿用已选择关卡。
  - `LootChainGameRoot.ts`：新增可空的 `selectedLobbyStageCode`，统一保存当前关卡选择；非法、空值或 `EX_` 关卡会提示“关卡选择已失效，请重新选择主线关卡”，并返回冒险面板。
  - `LobbyBattleFlow.ts`：`prepare()` 与 `start()` 不再把空关卡或 `EX_` 关卡静默回落到 `MAIN_1_1`，而是进入错误提示状态。
  - `LobbyBattleState.ts`：默认 `stageCode` 改为空字符串，避免伪造已选择关卡。
  - `scripts/check-layout.mjs`：新增 Stage 4F 守卫，检查关卡传递、非法关卡拦截和禁止静默 fallback。
- Zeno 监督要求：
  - 未来开放多关卡时，玩家选择的关卡必须在编队、战斗预览、battle start 请求和结果页保持一致。
  - 如果关卡选择丢失，必须阻断战斗并要求玩家重新选择，不能默认打 `MAIN_1_1`。
- 已验证：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
  - 后端 `scripts/smoke-player-flow.ps1` 再次通过：
    - `battleNo=Ba947cb2ef2de493895a9dbe54922c08f`
    - `settlementNo=S76dbe01e0eca48a194acd428a21029a0`
    - `rewardGranted=false`
    - `readonlyEconomy=true`
    - 体力 `100 -> 100`
    - 战力 `15448 -> 15448`
  - 非默认关卡 smoke 也已通过：`StageCode=MAIN_1_2`，`battleNo=Becd2976bae65460c936a1e412733f05a`，`settlementNo=S623734689f164676b36228fe5ae6e309`，同样保持 `rewardGranted=false`、`readonlyEconomy=true`、体力/战力不变。
- 边界不变：本阶段只传递关卡选择，不保存编队，不扣体力，不写主线进度，不发奖励，不写背包/货币/USDT/资金池，不开放 EX V1，不新增经济写入口。

## 2026-05-31 Stage 4G Backend Stage Guard Test

- 后端 battle start 代码已存在 `STAGE_ALLOWLIST` 与 `EX_` 拦截，本轮补充单测把该红线固化下来。
- 后端测试新增覆盖：
  - `MAIN_9_9` 未开放主线关卡必须拒绝；
  - `EX_1_1` 必须拒绝；
  - 非法关卡被拒绝后不能继续读取英雄队列，也不能插入 `battle_session`。
- 已验证：
  - `mvn.cmd --no-transfer-progress -pl lootchain-core "-Dtest=PlayerBattleServiceImplTest" test` -> passed，`Tests run: 6, Failures: 0, Errors: 0`。
  - running game HTTP + MySQL 验收通过：
    - `MAIN_9_9` 返回业务错误 `关卡暂未开放`，对应 requestId 的 `battle_session` 写入数 `0 -> 0`。
    - `EX_1_1` 返回业务错误 `关卡暂未开放`，对应 requestId 的 `battle_session` 写入数 `0 -> 0`。
  - 后端新增并已执行通过 `D:\business\project\LootChain\scripts\smoke-battle-stage-guard.ps1`，用于新窗口重复验证非法关卡不会创建 battle session。
- 本阶段只补后端测试，不改变 battle 接口行为，不开放奖励、体力、进度、资金池、USDT 或 EX V1。

## 2026-05-31 Lobby Stage 4H Battle Stage Visibility

- 按 Zeno 用户视角监督要求，战斗表现页必须让玩家确认当前目标关卡。
- `LobbyBattlePresentationState.ts` 已补强文案：
  - ready 状态 subtitle 显示 `目标关卡 {stageCode}`；
  - result recorded 状态 subtitle 与日志都显示 settlement 返回的 `stageCode`。
- `scripts/check-layout.mjs` 新增 `目标关卡：` 守卫，防止后续战斗结果页丢失关卡可见性。
- 已验证：
  - `npm.cmd run check:layout` -> passed。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
- 边界不变：只改前端展示文案，不改变接口、结算、奖励、体力、进度或经济规则。

## 2026-05-31 Lobby Stage 4I Formation Explicit Battle Stage

- 继续收紧 Zeno 指出的“不能沿用旧关卡”风险。
- `LobbyFormationPanelRenderer.ts` 的 `LobbyFormationBattlePreviewButton` 现在显式调用 `openLobbyBattlePreviewPanel(stageCode)`，不再依赖 root 中可能残留的上一次选择。
- `LootChainGameRoot.openLobbyBattlePreviewPanel(stageCode: string)` 改为必须传入关卡；`resolveLobbyStageCode()` 只接受 `MAIN_数字_数字` 格式，展示文案或空值不能被误当作关卡。
- `scripts/check-layout.mjs` 已增加显式 stage 传递和主线格式守卫。
- 已验证：
  - `npm.cmd run check:layout` -> passed。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
- 边界不变：只改前端状态传递，不新增接口，不保存编队，不扣体力，不写进度，不发奖励，不开放 EX V1。

## 2026-05-31 Lobby Stage 4J Return-To-Lobby Refresh

- 继续补齐 `战斗记录完成 -> 返回大厅` 的闭环体验。
- `LootChainGameRoot.returnToLobbyFromBattlePreview()` 现在会：
  - 调用 `lobbyBattleFlow.cancel()` 清理本地战斗表现计时，避免回到大厅后旧 timer 继续刷新战斗面板；
  - 关闭 battle preview 与 formation 面板；
  - 调用 `refreshLobbyReadonlyStateAfterBattle()` 回读只读大厅资料、冒险状态和英雄队列。
- `LobbyBattleFlow.normalizeStageCode()` 已与 root 对齐，只接受 `MAIN_数字_数字` 主线关卡格式。
- `scripts/check-layout.mjs` 已加入回大厅刷新和 Flow 内部主线格式守卫。
- 已验证：
  - `npm.cmd run check:layout` -> passed。
  - Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
- 边界不变：只做前端状态清理和只读刷新，不改变后端接口，不扣体力，不写进度，不发奖励，不新增经济写入口。

## 2026-05-31 Stage 4K New Player Full-Flow Smoke

- Current Cocos-only playable path is verified for a fresh local player:
  `dev-login -> empty protagonist state -> create SSR protagonist -> lobby -> heroes -> adventure -> battle start -> no-reward settlement -> lobby reread`.
- Backend script:
  - `D:\business\project\LootChain\scripts\smoke-new-player-flow.ps1`
- Script behavior:
  - creates only a local `game_user` QA shell when `-UserId 0`;
  - uses `POST /api/player/protagonist` for protagonist creation;
  - checks SSR rarity, attack default form, locked defense/support forms, and `userHeroId`;
  - calls protagonist create a second time and verifies idempotency with exactly one `player_protagonist` row and one `user_hero source_type=PROTAGONIST` row;
  - verifies hero roster first item is the protagonist;
  - starts `MAIN_1_1` battle with protagonist-only lineup;
  - settles with no reward and rereads lobby profile;
  - asserts stamina and combat power do not change.
- Latest successful run:
  - `userId=12`
  - `protagonistName=SmokeHero12`
  - `protagonistHeroId=9`
  - `stageCode=MAIN_1_1`
  - `battleNo=Bf8f08ea10fc945ab9022db1bbfa3f548`
  - `settlementNo=S52c47a1c10ba4ec9ba9733c9e4216a90`
  - `rewardGranted=false`
  - `readonlyEconomy=true`
  - stamina `100 -> 100`
  - combat power `9269 -> 9269`
- Verification completed:
  - `npm.cmd run check:layout`
  - focused Cocos Creator 3.8.8 `tsc.cmd --noEmit`
  - backend `PlayerProtagonistServiceImplTest,PlayerBattleServiceImplTest`
  - `scripts/smoke-player-flow.ps1 -UserId 1 -StageCode MAIN_1_2`
  - `scripts/smoke-battle-stage-guard.ps1`
- Zeno supervisor remains active with these P0 follow-ups:
  - capture or manually verify the visible Cocos UI chain from no protagonist to lobby/battle/result;
  - ensure duplicate create/settlement buttons cannot create duplicate state in UI;
  - keep stage code visible through adventure, formation, battle, and result;
  - keep EX blocked before `battle_session` insert.
- Boundary unchanged: no rewards, stamina cost, progress write, bag/currency/USDT/fund-pool write, EX V1, or new economy write entry was opened.

## 2026-05-31 Stage 4L Frontend Repeat-Submit Guard

- Review agent Carver checked duplicate-click risks in Cocos:
  - protagonist create had no flow-level busy guard;
  - repeated battle preview opening could enqueue more than one battle start chain;
  - settlement had a settling guard but no existing-settlement guard.
- Implemented frontend guards:
  - `ProtagonistCreateFlow.submitCreate()` returns while `current.creating` is true and shows "主角色创建中，请勿重复提交。";
  - `ProtagonistCreateRenderer` disables the create button while creating;
  - `LootChainGameRoot.openLobbyBattlePreviewPanel()` returns if the same stage already has a busy battle flow;
  - the post-hero-roster auto-start callback verifies lobby view, battle panel open state, unchanged stage, and non-busy battle state before calling start;
  - `LobbyBattleFlow.start()` blocks repeated start for the same stage while starting/started/settling/settled;
  - `LobbyBattleFlow.settle()` returns if a settlement already exists.
- Guardrail updated:
  - `scripts/check-layout.mjs` now checks these repeat-submit guard tokens.
- Verification:
  - `npm.cmd run check:layout`
  - focused Cocos Creator 3.8.8 `tsc.cmd --noEmit`
- Boundary unchanged: this is Cocos-only UI/state hardening. No backend API, SQL, reward, stamina, progress, currency, USDT, fund-pool, EX V1, or economy rule change.

## 2026-05-31 Stage 4M Battle Resume And Contract Hardening

- Zeno/Russell/Kierkegaard supervisor pass found the next real-play P0: closing battle preview after session creation could leave the same-stage battle state busy and make the player unable to reopen battle/settle from formation.
- Cocos fixes:
  - `openLobbyBattlePreviewPanel(stageCode)` reuses existing same-stage battle state for display instead of silently returning;
  - returning from recorded battle result clears local battle state with `lobbyBattleFlow.cancel(true)`;
  - `LobbyBattleFlow.settle()` rejects settlement if returned `stageCode` differs from the battle session;
  - `BattleApi` validates explicit `MAIN_x_y` stage codes and no longer falls back to `MAIN_1_1`;
  - `ProtagonistApi` was rewritten so create/state calls actually return validated backend data; client still submits only `gender` and `protagonistName`;
  - `LobbyAdventureApi` filters illegal/EX stages before UI display;
  - `LobbyHeroApi` filters `id<=0` heroes before roster/formation display.
- Docs/API cleanup:
  - `docs/api-contract.md` now states battle start/settle are implemented only as no-reward session/record endpoints, while team save, dungeon, and Boss remain unimplemented.
- Verification:
  - Cocos `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 `tsc.cmd --noEmit` passed.
  - Existing-player smoke passed for `MAIN_1_2`: `battleNo=B161c2bdd5a2b4314b2c047cca6f053c6`, `settlementNo=S098d0cf575a04c3d8daf4a52e7db8c61`, stamina/combat power unchanged.
  - Fresh-player smoke passed with `userId=13`, `protagonistHeroId=10`, `battleNo=Bffd294803cb74937a1d5776bec5a932d`, `settlementNo=S51eaac6618a5420ab2859ef01913a537`.
  - Stage guard smoke passed for `MAIN_9_9` and `EX_1_1`, both rejected before `battle_session` insert.
- Boundary unchanged: no backend API/SQL change, no reward, stamina cost, progress write, bag/currency/USDT/fund-pool write, EX V1, or new economy write entry.

## 2026-05-31 Stage 4N Compact Responsive Hardening

- Current supervisor mode remains active: Zeno continues to act as the user-like gatekeeper until the full Cocos game flow is playable end to end.
- This stage changed only `D:\business\project\lootchain-cocos` frontend layout code and `scripts/check-layout.mjs`; backend API/SQL/economy code was not changed.
- Cocos layout fixes:
  - compact lobby action entries no longer disappear at short heights before key access is preserved; under `300px` stage height the compact action panel keeps `公告 / 冒险 / 英雄 / 图鉴`;
  - decorative compact scene shortcut panel now waits for `stageHeight >= 340`, reducing collision with core action access;
  - protagonist create controls now avoid input/button overlap and use dense form chips on compact layouts;
  - formation compact rows now derive from available body height so five slots stay inside the panel;
  - battle presentation field now clears boundary note and footer buttons in vertical-cramped panels.
- Guardrail updates:
  - `scripts/check-layout.mjs` now includes `compact-playable-390x300` and `compact-floor-360x240` viewports;
  - layout checks now assert protagonist input/button minimum gap for playable heights, formation internal non-overlap, and battle field/boundary/footer non-overlap.
- Verification completed:
  - `npm.cmd run check:layout`
  - focused Cocos Creator 3.8.8 `tsc.cmd --noEmit`
- Boundary unchanged: no reward, stamina cost, mainline progress write, bag/currency/USDT/fund-pool write, EX V1, backend API/SQL change, or new economy write endpoint was opened.

## 2026-05-31 Stage 4O Local Formation Selection

- Current stage continues the Cocos-only playable chain under Zeno supervision.
- Cocos changed files:
  - `assets/scripts/scenes/LootChainGameRoot.ts`
  - `assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts`
  - `assets/scripts/scenes/lobby/LobbyBattleFlow.ts`
  - `scripts/check-layout.mjs`
- Player-facing behavior:
  - formation panel is no longer only a read-only default preview;
  - clicking candidate heroes toggles them in/out of the current battle lineup;
  - protagonist remains fixed as leader and cannot be removed from the current lineup;
  - battle start uses the confirmed local lineup IDs through the existing battle start contract.
- Backend unchanged:
  - no team-save endpoint;
  - no new SQL;
  - no persistent formation write;
  - no reward/stamina/progress/bag/currency/USDT/fund-pool write;
  - EX V1 remains blocked.
- Verification completed:
  - `npm.cmd run check:layout`
  - focused Cocos Creator 3.8.8 `tsc.cmd --noEmit`
  - Cocos `git diff --check`
- Next high-risk recommendations from agents:
  - add backend player API allowlist / feature gate for the current Cocos phase;
  - make battle no-reward/economy-readonly flags persistent in `battle_settlement`;
  - strengthen battle start idempotency against reused `requestId` with different payload;
  - add a unified smoke runner with DB table snapshots for economy red lines.

## 2026-05-31 Stage 4P Player API Cocos Phase Gate

- Current supervisor mode remains active: do not stop before the Cocos game flow is genuinely playable and guarded.
- Backend changed files:
  - `D:\business\project\LootChain\lootchain-core\src\main\java\com\lootchain\config\PlayerApiPhaseGate.java`
  - `D:\business\project\LootChain\lootchain-core\src\main\java\com\lootchain\config\PlayerModuleProperties.java`
  - `D:\business\project\LootChain\lootchain-core\src\main\java\com\lootchain\config\PlayerWebMvcConfig.java`
  - `D:\business\project\LootChain\lootchain-core\src\test\java\com\lootchain\config\PlayerApiPhaseGateTest.java`
  - `D:\business\project\LootChain\lootchain-game\src\main\resources\application.yml`
  - `D:\business\project\LootChain\lootchain-game\src\main\resources\application-local.yml`
- Cocos changed files:
  - `assets/scripts/api/GachaApi.ts`
  - `scripts/check-layout.mjs`
- Default `lootchain.player.cocos-phase-gate-enabled=true`.
- Allowlist during the current Cocos phase:
  - `POST /api/player/auth/dev-login`
  - `GET /api/player/me/lobby`
  - `GET /api/player/protagonist/state`
  - `POST /api/player/protagonist`
  - `GET /api/player/lobby/adventure`
  - `GET /api/player/lobby/codex`
  - `GET /api/player/lobby/heroes`
  - `GET /api/player/lobby/notices`
  - `POST /api/player/battles/start`
  - `POST /api/player/battles/{battleNo}/settle`
- Blocked during this phase:
  - gacha draw/pools/logs;
  - full hero growth/detail endpoints;
  - full bag/use endpoints;
  - any reward, currency, USDT, fund-pool, or EX V1 path not explicitly listed above.
- Verification completed:
  - backend `PlayerApiPhaseGateTest`
  - backend `lootchain-admin,lootchain-game -am -DskipTests compile`
  - Cocos `npm.cmd run check:layout`
  - focused Cocos TypeScript check for `GachaApi`
- Next high-risk recommendations:
  - persist no-reward/economy-readonly mode on `battle_settlement`;
  - strengthen battle start idempotency so reused `requestId` with different payload fails closed;
  - create a unified smoke runner with DB table snapshots for the red-line economy tables.

## 2026-05-31 Stage 4Q Battle Start Idempotency Contract

- Backend changed files:
  - `D:\business\project\LootChain\lootchain-core\src\main\java\com\lootchain\game\battle\service\impl\PlayerBattleServiceImpl.java`
  - `D:\business\project\LootChain\lootchain-core\src\test\java\com\lootchain\game\battle\service\impl\PlayerBattleServiceImplTest.java`
- Contract changes:
  - `POST /api/player/battles/start` now requires `requestId`;
  - backend no longer generates missing battle start request IDs;
  - repeated `requestId` returns the existing session only if `stageCode`, ordered `heroIds`, and `leaderHeroId` match the original session;
  - repeated `requestId` with different payload fails closed with `重复战斗请求参数不一致`.
- Cocos implications:
  - `LobbyBattleFlow` already creates a fresh `battle-start-*` request ID per start attempt;
  - if the player changes stage or local formation, the next start must use a new request ID.
- Verification completed:
  - backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest`
  - backend `lootchain-admin,lootchain-game -am -DskipTests compile`
- Remaining high-risk recommendations:
  - persist no-reward/economy-readonly mode on `battle_settlement`;
  - create a unified smoke runner with DB table snapshots for economy red lines;
  - run latest-code HTTP smoke after restarting `lootchain-game`, because an already-running server may still be on older compiled code.

## 2026-05-31 Stage 4R Battle Settlement No-Economy Persistence

- Backend changed files:
  - `D:\business\project\LootChain\lootchain-core\src\main\java\com\lootchain\game\battle\entity\PlayerBattleSettlement.java`
  - `D:\business\project\LootChain\lootchain-core\src\main\java\com\lootchain\game\battle\service\impl\PlayerBattleServiceImpl.java`
  - `D:\business\project\LootChain\lootchain-core\src\test\java\com\lootchain\game\battle\service\impl\PlayerBattleServiceImplTest.java`
  - `D:\business\project\LootChain\sql\13_battle_session_module.sql`
  - `D:\business\project\LootChain\sql\14_battle_settlement_guard_flags.sql`
- Local MySQL `lootchain` schema was migrated with SQL 14.
- `battle_settlement` now has persistent no-economy flags:
  - `settlement_mode='NO_REWARD'`
  - `reward_granted=0`
  - `readonly_economy=1`
  - `economy_applied=0`
- `PlayerBattleServiceImpl` sets those flags when recording current Cocos no-reward settlement.
- Verification completed:
  - local `information_schema.columns` check for all four columns;
  - backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest`;
  - backend `lootchain-admin,lootchain-game -am -DskipTests compile`.
- Remaining high-risk recommendations:
  - create a unified smoke runner with DB table snapshots for economy red lines;
  - run latest-code HTTP smoke after restarting `lootchain-game`;
  - continue Cocos visual QA/screenshots across target resolutions.

## 2026-05-31 Stage 4S Latest-Code HTTP Smoke Guard

- Current supervisor mode remains active: Zeno is the user-like gatekeeper until the full Cocos game flow is genuinely playable and guarded.
- Local backend was restarted from current source:
  - `D:\business\project\LootChain`
  - port `8081`
  - process: `com.lootchain.bootstrap.GameApplication`
  - classes: `lootchain-game\target\classes`
- Added backend smoke script:
  - `D:\business\project\LootChain\scripts\smoke-cocos-current-flow.ps1`
- HTTP verification passed after restart:
  - existing-player flow: dev-login, lobby profile, adventure, heroes, battle start, no-reward settle, lobby reread;
  - fresh-player flow: local QA `game_user`, dev-login, create SSR protagonist, protagonist first in roster, protagonist-only battle, no-reward settle;
  - stage guard: `MAIN_9_9` and `EX_1_1` rejected with no `battle_session` insert;
  - current-flow guard: phase gate blocks gacha pool/draw, bag read/use, and hero level-up;
  - economy snapshots do not change around forbidden API calls or no-reward settlement;
  - settlement row persists `NO_REWARD`, `reward_granted=0`, `readonly_economy=1`, and `economy_applied=0`;
  - battle start idempotency accepts same request payload and rejects same `requestId` with changed lineup.
- Latest current-flow guard smoke result:
  - `battleNo=Bd5d5e5e6d7404df09016f33fb038f917`
  - `settlementNo=S49d8682eb89b4871a6f3fc4bc079bb35`
  - `rewardGranted=false`
  - `readonlyEconomy=true`
- Boundary unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.
- Remaining high-risk recommendation:
  - continue Cocos visual QA/screenshots across target resolutions.

## 2026-05-31 Stage 4T Recent Battle Readback + Physical Viewport Guard

- Supervisor mode remains active until the complete Cocos playable loop is genuinely accepted.
- Cocos frontend changes:
  - `assets/scripts/types/BattleTypes.ts` added `PlayerBattleRecentVO`.
  - `assets/scripts/api/BattleApi.ts` added `recentBattles()` and validates that recent records keep `rewardGranted=false`, `readonlyEconomy=true`, and `economyApplied=false`.
  - `assets/scripts/scenes/lobby/LobbyBattleState.ts` and `LobbyBattleFlow.ts` now cache readonly recent battle records and refresh the overlay after loading them.
  - `assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts` displays a recent no-reward challenge summary in the adventure detail panel.
  - `assets/scripts/scenes/AdaptiveStageLayoutResolver.ts`, `LootChainGameRoot.ts`, `LobbyHudTypes.ts`, and `LobbyHudRenderer.ts` now support physical viewport sizing and a micro HUD path.
  - `scripts/check-layout.mjs` mirrors the Preview design-resolution/physical-viewport split and includes `390x300` and `390x340` guard cases.
- Backend/API dependency:
  - new readonly endpoint: `GET /api/player/battles/recent`;
  - current phase gate allows this GET only;
  - no new player economy write endpoint was added.
- Verification passed:
  - Cocos `npm.cmd run check:layout`;
  - focused Cocos Creator 3.8.8 TypeScript check;
  - backend `mvn.cmd --no-transfer-progress -pl lootchain-core "-Dtest=PlayerBattleServiceImplTest,PlayerApiPhaseGateTest" test`;
  - backend `mvn.cmd --no-transfer-progress -pl lootchain-admin,lootchain-game -am -DskipTests compile`;
  - `scripts/smoke-cocos-current-flow.ps1 -BaseUrl http://localhost:8081 -UserId 1 -StageCode MAIN_1_1`, including recent record readback;
  - `scripts/smoke-new-player-flow.ps1 -BaseUrl http://localhost:8081 -StageCode MAIN_1_1 -Gender female`;
  - `scripts/smoke-battle-stage-guard.ps1 -BaseUrl http://localhost:8081 -UserId 1`.
- Latest smoke IDs:
  - current-flow: `battleNo=Bde67add6067843ae9c6e51eff03f4dc2`, `settlementNo=Sf11d24af1cab49fe9a6560f5b7d0d4d6`;
  - fresh-player: user `15`, protagonist hero `12`, `battleNo=B168d051a70e34a3f9168ee36716db904`, `settlementNo=Sb51323780bf24038a94fc38187020dca`.
- Visual QA note:
  - existing Preview on `7456` was serving old compiled cache without `viewportWidth/viewportHeight`;
  - source and static guards are current, but final screenshot acceptance needs Creator Preview restart/reopen.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4X Runtime Visual Loop Acceptance

- User-like supervisor role is now assigned to existing sub-agent `Zeno`; a new agent could not be spawned because the current thread had reached the agent limit.
- The previously stale running Preview has been refreshed without killing the user's original Cocos Creator process:
  - `npm.cmd run check:preview` now passes with `preview freshness ok`;
  - the running Preview on `http://localhost:7456` is serving chunks that contain the physical viewport and micro-HUD code.
- Runtime visual QA was executed through Chrome DevTools Protocol against the live Cocos Preview, calling Cocos root methods directly instead of relying on fragile screen-coordinate clicks.
- Screenshot evidence was written to:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\desktop-1920x900-04-lobby.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\desktop-1920x900-05-hero-roster.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\desktop-1920x900-06-adventure.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\desktop-1920x900-07-formation.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\desktop-1920x900-08-battle-running.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\desktop-1920x900-09-battle-settlement.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\desktop-1920x900-10-return-lobby.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\micro-390x340-04-lobby.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\micro-390x300-04-lobby.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\new-player-21-02-protagonist-create.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4x-runtime\new-player-21-03-lobby.png`
- Visual/runtime flow covered:
  - existing player login dialog -> login -> loading -> lobby;
  - lobby -> hero roster -> adventure -> formation -> battle preview/start -> presentation complete -> no-reward settlement -> return lobby;
  - micro viewports `390x340` and `390x300` keep the compact HUD path visible;
  - local QA user `21` was inserted as a plain `game_user` test row, then Cocos Preview verified first-login protagonist creation and lobby entry.
- Latest verification passed:
  - Cocos `npm.cmd run check:layout`;
  - Cocos `npm.cmd run check:preview`;
  - Cocos Creator 3.8.8 TypeScript no-emit over 84 `assets/scripts` TS files;
  - backend current-flow smoke: `battleNo=B9b348c1923cd4aa6bc1955cbe0fd5226`, `settlementNo=S181511c2f3a14089a45dd65c2c1a3280`;
  - backend fresh-player smoke: user `22`, protagonist hero `19`, `battleNo=B6711d99ceced46bfb3e51d94554cd437`, `settlementNo=S4b35e542e8a84b2988e44ecc75805ca4`;
  - backend focused unit tests `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest,PlayerProtagonistServiceImplTest`: 16 tests passed.
- Product note:
  - Cocos lobby player HUD currently displays `game_user.nickname`; the protagonist creation name is stored through the protagonist API but is not used as the lobby display name yet.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4AE Runtime Flow Acceptance And Micro HUD Follow-up

- Runtime Cocos Preview acceptance was executed through Chrome DevTools Protocol against `http://localhost:7456`.
- Evidence folder:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ae-lobby-goal-tracker`
- Screenshots captured:
  - `desktop-1920x900-01-lobby-goal-tracker-before.png`
  - `desktop-1920x900-02-adventure-from-goal.png`
  - `desktop-1920x900-03-formation-main-1-1.png`
  - `desktop-1920x900-04-battle-preview-started.png`
  - `desktop-1920x900-05-settlement-receipt.png`
  - `desktop-1920x900-06-lobby-goal-tracker-after.png`
  - `desktop-1920x900-07-adventure-recent-readback.png`
  - `micro-390x340-08-lobby-goal-chip.png`
- Runtime facts:
  - logged in through Cocos dev-login and entered lobby;
  - `LobbyGoalTracker` displayed the next mainline target;
  - opening adventure, formation, battle preview, no-reward settlement, return-to-lobby, and adventure recent readback completed;
  - runtime battle `B81f5c9e9f0274c3a81654dcfeeede8e6`;
  - runtime settlement `S0bdab68da86e4438850a87e8a1f5cade`;
  - settlement returned `rewardGranted=false` and `readonlyEconomy=true`;
  - after returning to lobby, recent readback loaded `S0bdab68da86e4438850a87e8a1f5cade`;
  - `LobbyGoalTracker` is now mounted under `LootChainCocosLoginUIRoot`, so overlay refresh can remove/rerender it.
- Follow-up source correction:
  - micro HUD scale was corrected in `LobbyHudRenderer.viewportUnit()` from design-resolution/window ratio to `clamp(layout.uiScale, 0.72, 1)`;
  - this prevents the 390x340 Preview crop from over-scaling micro target chip and bottom action text.
- Verification after the correction:
  - `npm.cmd run check:layout` passed;
  - focused Cocos Creator TypeScript no-emit passed;
  - backend `smoke-cocos-current-flow.ps1` passed for user `1`, battle `Bd59ddfb0093d4356a05d83425677b93e`, settlement `Sa06408bc4c614ab8a714125e6692c913`, `rewardGranted=false`, `readonlyEconomy=true`;
  - backend `smoke-new-player-flow.ps1` passed for user `26`, protagonist `SmokeHero26`, battle `Be77d09e3caaa46e49adfd95193aaf518`, settlement `S403f91ee819e47efbc14b3934e9002ad`, stamina and combat power unchanged.
- Current Preview cache status:
  - the open Preview has served the Stage 4AE tracker and content-root fix;
  - after the final micro-scale source tweak, `npm.cmd run check:preview` is intentionally failing until Creator recompiles `LobbyHudRenderer.ts` again;
  - missing token: `layout.uiScale, 0.72, 1`.
- Backend code/API/SQL did not change in this follow-up.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4AB Locked Stage Frontend UX Guard

- Multi-agent review accepted the next P0: locked stages must be visibly locked, must not become selected, and must not enter formation/battle even before backend rejection.
- Cocos changes:
  - `LobbyAdventurePanelRenderer.ts`
    - desktop map locked nodes now show `LobbyAdventureStageLockBadge` with `锁`;
    - locked node names use `锁定 {stageName}`;
    - compact rows use a dim locked style and `锁定` prefix;
    - locked node/row taps call `previewLockedLobbyAdventureStage(stageCode)` only, so the player gets a clear status message but no selected-stage mutation.
  - `LootChainGameRoot.ts`
    - added `previewLockedLobbyAdventureStage(stageCode)`;
    - `openLobbyFormationPanel()` and `openLobbyBattlePreviewPanel()` now repeat the unlock check, so future UI mistakes cannot pass locked stages into formation or battle preview.
  - `scripts/check-layout.mjs`
    - added guards for locked-stage UI tokens and root entry-point unlock checks.
  - `scripts/check-preview-freshness.mjs`
    - now probes Preview chunks for locked-stage UX tokens.
- Verification:
  - `npm.cmd run check:layout` passed;
  - focused Cocos Creator TypeScript no-emit passed for `LootChainGameRoot.ts`, `LobbyAdventurePanelRenderer.ts`, and related adventure/battle types.
- Current Preview cache status:
  - stale chunk blocker was cleared by returning focus to Creator and letting Preview rebuild;
  - `npm.cmd run check:preview` now passes and confirms the running chunks include `previewLockedLobbyAdventureStage`, `LobbyAdventureStageLockBadge`, and `锁定`.
- Runtime QA evidence:
  - screenshots captured under `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ab-locked-stage`;
  - locked `MAIN_1_2` (`裂隙回廊`) is present with `unlocked=false`, `LobbyAdventureStageLockBadge`, and `锁定 裂隙回廊`;
  - tapping/previewing locked `MAIN_1_2` kept `adventureOpen=true`, `formationOpen=false`, `battleOpen=false`, and did not mutate the selected stage;
  - forcing `openLobbyFormationPanel('MAIN_1_2')` also stayed in adventure and did not open formation/battle;
  - legal `MAIN_1_1` then opened formation, started battle `B675f7d4555e744f08720f213d61cbbab`, settled `Sb69829a75ad04a3f99dd251828025ccd`, and returned to lobby;
  - settlement stayed `rewardGranted=false`, `readonlyEconomy=true`, `stageCode=MAIN_1_1`.
- Fresh-player evidence:
  - backend `smoke-new-player-flow.ps1` passed for user `24`, protagonist `SmokeHero24`, battle `B42b76a5c3df5492097789795e91e18ce`, settlement `S127c753f3e0747b682963f8506fe69ab`;
  - Cocos Preview visual QA created local user `25`, entered the protagonist creation screen, created `VisualHero25`, and verified the lobby top-left name shows `VisualHero25`;
  - screenshots:
    - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ab-locked-stage\desktop-1920x900-08-new-player-create-screen.png`
    - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ab-locked-stage\desktop-1920x900-09-new-player-created-lobby.png`
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4AA Backend Locked Stage Guard

- Product/supervisor review found one remaining authority gap: Cocos hides locked adventure stages, but a modified client could still try `POST /api/player/battles/start` for an allowlisted but locked stage.
- Backend `PlayerBattleServiceImpl` now injects `PlayerLobbyAdventureService` and checks the current player's readonly adventure unlock snapshot before creating a battle session.
- Locked `MAIN_x_y` stages now fail before hero lookup and before `battle_session` insert; user `1` rejects `MAIN_1_2` with the locked-stage business error.
- Updated backend test and smoke coverage:
  - `PlayerBattleServiceImplTest.startRejectsLockedMainlineStageBeforeCreatingSession()`;
  - `scripts/smoke-battle-stage-guard.ps1` now reads the adventure payload, finds a locked stage, and verifies no session row is written.
- Verification already run:
  - backend focused tests passed with 16 tests;
  - `lootchain-admin,lootchain-game` compile passed;
  - restarted local `lootchain-game` on `http://localhost:8081`;
  - current-flow smoke passed for `MAIN_1_1`: `battleNo=B89bc55ec53ef46e6954005307f74247d`, `settlementNo=S30208205c7884abf8b2fdcb697bf9870`, `rewardGranted=false`, `readonlyEconomy=true`;
  - expanded stage guard smoke passed, including locked `MAIN_1_2`.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4U Verification Refresh + Preview Reimport Gate

- The user-like supervisor agent remains active and is still treating visual Preview acceptance as blocked until the running Preview uses the latest compiled chunks.
- Latest verification rerun:
  - Cocos `npm.cmd run check:layout` passed.
  - Focused Cocos Creator 3.8.8 TypeScript check passed.
  - Backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed.
  - Backend `lootchain-admin,lootchain-game -am -DskipTests compile` passed.
  - Current-flow smoke passed with `battleNo=Bf09e32b56989422085f2c35e00c94b58`, `settlementNo=S8901223518b349639c56a0297fe30bb9`.
  - Fresh-player smoke passed with user `16`, protagonist hero `13`, `battleNo=Bbad8694fd4234ba68c1844cedb37210e`, `settlementNo=Sa18861ae01c7410ebf7e8d6c107b6e14`.
  - Stage guard smoke passed for `MAIN_9_9` and `EX_1_1`.
  - `git diff --check` passed in both Cocos and backend repos; only line-ending warnings were printed.
- Preview cache probe:
  - `http://localhost:7456/scripting/x/import-map.json` is reachable.
  - The mapped chunk for `AdaptiveStageLayoutResolver.ts` is still `./chunks/a3/a35bebda9e6bec087e22a9df1d4e9c0b9633ca8c.js`.
  - Direct HTTP probing still reports `viewportWidth=False` and `viewportHeight=False`.
  - Updating source mtimes did not trigger the running Creator Preview to rebuild the chunk.
- Added optional probe script:
  - `npm.cmd run check:preview`
  - current result: fails as expected because both `AdaptiveStageLayoutResolver.ts` and `LobbyHudRenderer.ts` chunks are stale.
- Required next visual step in Cocos Creator:
  1. Assets panel -> right-click `assets/scripts/scenes/AdaptiveStageLayoutResolver.ts`.
  2. Choose `Reimport Asset`.
  3. Run `Project -> Refresh Device` (`Ctrl+Shift+P`) or close/reopen the Preview browser tab/window.
  4. Re-probe the chunk and only accept screenshots after `viewportWidth=True` and `viewportHeight=True`.
- Do not kill the user's Cocos Creator process or delete `temp` / `library` unless the user explicitly approves; unsaved editor state may exist.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4V Recent Readback Fail-Closed + Result Exit

- Product/review/test agents found and confirmed fixes for the next flow risks:
  - result-recorded battle panels must not route players back to old formation state;
  - recent battle readback must not expose non-`NO_REWARD` or economy-applied records.
- Cocos frontend:
  - `assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts`
    - result-state dim click now returns to lobby instead of closing to formation;
    - result-state bottom back slot is disabled and displays `已记录`.
  - `assets/scripts/api/BattleApi.ts`
    - requires non-empty `battleNo`, `settlementNo`, `serverSeed`, and recent `recordedTime`;
    - rejects recent records unless `settlementMode === 'NO_REWARD'`, `rewardGranted=false`, `readonlyEconomy=true`, and `economyApplied=false`.
  - `assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts`
    - adventure copy now says no-reward battle preview;
    - stage detail distinguishes same-stage record from global latest record.
  - `assets/scripts/scenes/lobby/LobbyBattlePresentationState.ts`
    - result copy now uses `无奖励记录完成` and `演出结果`.
  - `assets/scripts/scenes/lobby/LobbyBattleFlow.ts`
    - non-force recent-record loading retries when `recentError` is present, so stale cached records do not trap the panel in an error state.
- Backend:
  - `PlayerBattleServiceImpl.recentBattles()` filters query and mapper results to no-reward readonly rows only.
  - `scripts/smoke-cocos-current-flow.ps1` now asserts `settlementMode=NO_REWARD` for recent records.
  - `scripts/smoke-new-player-flow.ps1` now checks the fresh-player settlement appears in recent readback.
- Latest verification:
  - Cocos `npm.cmd run check:layout` passed.
  - Focused Cocos TypeScript check passed.
  - Backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed.
  - Backend `lootchain-admin,lootchain-game -am -DskipTests compile` passed.
  - Runtime `lootchain-game` restarted from latest install on `8081`.
  - Current-flow smoke: `battleNo=B3f19c9e199234d75be3ac7c2efe8fe56`, `settlementNo=S193a31a22dce42168975334095850464`.
  - Fresh-player smoke: user `18`, protagonist hero `15`, `battleNo=B4c525184a1ff4b6ebcf5d59800752ebd`, `settlementNo=Sd82006f8403142c6856f69eb62de7ebe`.
  - Stage guard smoke passed for `MAIN_9_9` and `EX_1_1`.
- `npm.cmd run check:preview` currently fails by design until the open Cocos Preview regenerates its chunks.
- Remaining visual blocker unchanged:
  - Cocos Preview `7456` still serves stale `AdaptiveStageLayoutResolver.ts` chunk until Creator-side `Reimport Asset` + `Refresh Device` or Preview reopen.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4W Battle Request/Settle Guard Hardening

- User-like supervisor agent remains active until the whole Cocos playable loop is visually accepted.
- Backend contract hardening that Cocos must respect:
  - `requestId` is still required for battle start and settle;
  - `requestId` now rejects values longer than 80 characters instead of truncating them, preventing idempotency-key collisions;
  - repeated battle start with the same `requestId` is accepted only for the exact same `stageCode`, ordered `heroIds`, and `leaderHeroId`;
  - repeated battle settle returns the original no-reward settlement and must not create another `battle_settlement` row.
- Backend smoke coverage added/expanded:
  - `scripts/smoke-battle-request-guard.ps1` covers missing/null/blank/overlong `requestId` and verifies no `battle_session` write;
  - `scripts/smoke-battle-settle-guard.ps1` covers unknown battle, missing/blank/overlong settle `requestId`, illegal result, and settle idempotency;
  - `scripts/smoke-battle-stage-guard.ps1` now covers empty, malformed, BOSS, EX, Unicode, and overlong stage codes;
  - `scripts/smoke-cocos-current-flow.ps1` now rejects same start `requestId` with changed stage or changed leader, and tolerates Windows PowerShell UTF-8 mojibake while still requiring the Cocos PhaseGate message.
- Latest verification:
  - Backend `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed with 14 tests.
  - Runtime `lootchain-game` restarted from current source on `8081`; active listener PID was `67976`.
  - Request guard smoke passed.
  - Expanded stage guard smoke passed.
  - Lineup guard smoke passed.
  - Settle guard smoke passed.
  - Current-flow smoke passed: `battleNo=B93139c6b24bf4060ae542647119dd6c8`, `settlementNo=S943593aabf5e4f2da68a8358a7e65568`.
  - Fresh-player smoke passed: user `20`, protagonist hero `17`, `battleNo=B197e082c17c447e9b81bbae5d38b4c7f`, `settlementNo=Sb6ca9e9a401b4567a7433a98a8c6b28d`.
  - Cocos `npm.cmd run check:layout`, focused Cocos TypeScript check, and `git diff --check` remained green before this backend guard stage.
- Cocos Preview visual blocker remains unchanged:
  - `npm.cmd run check:preview` still fails because the already-running Preview serves stale `AdaptiveStageLayoutResolver.ts` and `LobbyHudRenderer.ts` chunks;
  - final screenshot acceptance still needs Creator-side `Reimport Asset` + `Refresh Device` or Preview reopen.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4Y Lobby Display Name Uses Protagonist Name

- User request: the lobby top-left name must show the protagonist name entered on the creation screen.
- Backend contract changed:
  - `GET /api/player/me/lobby` now returns `protagonistName`;
  - `displayName` now prefers `player_protagonist.protagonist_name` when the current login user has a protagonist;
  - if no protagonist exists, `displayName` falls back to account nickname, username, then `Player{userId}`.
- Cocos change:
  - `PlayerLobbyProfileVO` includes optional `protagonistName`;
  - `LobbyProfileState` normalizes `protagonistName` and still renders all HUD/profile name slots through `displayName`.
- Verification:
  - backend restarted from current source on `8081`, active listener PID `20152`;
  - direct HTTP for user `23`: `displayName=SmokeHero23`, `protagonistName=SmokeHero23`, original account nickname preserved;
  - Cocos Preview screenshot: `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4y-protagonist-name\user-23-lobby-protagonist-name.png`;
  - Cocos `npm.cmd run check:layout` passed;
  - Cocos TypeScript no-emit over 84 TS files passed;
  - Cocos `npm.cmd run check:preview` passed;
  - backend focused tests `PlayerLobbyProfileServiceTest,PlayerLobbyAdventureServiceImplTest,PlayerProtagonistServiceImplTest,PlayerBattleServiceImplTest,PlayerApiPhaseGateTest` passed with 20 tests;
  - backend current-flow smoke passed: `battleNo=Befab91a1e3c64308984b772ad7d4f0d7`, `settlementNo=Sf1126bc496bf4adb9be29fde828c699c`;
  - backend fresh-player smoke passed: user `23`, protagonist hero `20`, `battleNo=B7079b818521d4bd294da06bba99013c9`, `settlementNo=S7a6c3c600f7046028dfc22f11c5deb86`.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4Z Adventure Stage Local Selection

- Current next-stage goal: make the lobby adventure panel support explicit local stage selection before entering formation, so the selected stage does not drift between adventure detail, formation, battle start, and result readback.
- Cocos source changes:
  - `assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts`
    - unlocked map nodes and compact stage rows are clickable;
    - selected stage is highlighted and labeled with `已选`;
    - right-side detail and compact CTA now follow the selected stage instead of always using the recommended/default stage;
    - clicks only update local UI state and do not start battle, save progress, write rewards, or touch economy.
  - `assets/scripts/scenes/LootChainGameRoot.ts`
    - added `selectLobbyAdventureStage(stageCode)` and `findLobbyAdventureStage(stageCode)`;
    - selection accepts only valid `MAIN_x_y` values and only unlocked stages from the loaded adventure snapshot;
    - selected stage is still passed through the existing formation and battle-preview path.
  - `scripts/check-layout.mjs`
    - guards the new stage-selection wiring and the new `LobbyAdventureStageVO` import.
  - `scripts/check-preview-freshness.mjs`
    - now also probes `LootChainGameRoot.ts` and `LobbyAdventurePanelRenderer.ts` chunks for stage-selection tokens, so stale Preview chunks no longer produce a false green.
- Multi-role review notes:
  - Product/supervisor agents agreed the player must never wonder whether the battle target differs from the clicked stage.
  - R&D review confirmed no new economy/progress write should be added; current selection remains local UI state.
  - Existing Stage 4V result-exit fix already keeps recorded results returning to lobby instead of old formation state.
- Verification:
  - Cocos `npm.cmd run check:layout` passed.
  - Cocos Creator 3.8.8 TypeScript no-emit over `assets/scripts` passed.
  - Backend focused tests passed with 18 tests: `PlayerBattleServiceImplTest,PlayerApiPhaseGateTest,PlayerLobbyAdventureServiceImplTest,PlayerLobbyHeroServiceImplTest,PlayerProtagonistServiceImplTest`.
  - Backend current-flow smoke passed for user `1`, `MAIN_1_1`: `battleNo=B788c766665fd46a6ad956cb2528a32ba`, `settlementNo=S83a66cbc858d43a4826efee9f22990dd`, `rewardGranted=false`, `readonlyEconomy=true`.
- Runtime visual blocker:
  - the already-running Cocos Preview on `http://localhost:7456` still serves stale chunks for `LootChainGameRoot.ts` and `LobbyAdventurePanelRenderer.ts`;
  - `npm.cmd run check:preview` now fails intentionally until Creator regenerates those chunks;
  - low-risk unblock remains Creator-side `Reimport Asset` for the two source files plus `Project -> Refresh Device` or reopen Preview. Do not kill Creator or delete `temp/library` without user approval.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4Z Runtime Acceptance Follow-up

- The previously stale Cocos Preview refreshed successfully; `npm.cmd run check:preview` now passes again.
- Runtime QA was executed through Chrome DevTools Protocol against `http://localhost:7456`.
- Desktop visual evidence:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4z-adventure-selection\desktop-1920x900-01-adventure-selected.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4z-adventure-selection\desktop-1920x900-02-formation-selected-stage.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4z-adventure-selection\desktop-1920x900-03-battle-selected-stage.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4z-adventure-selection\desktop-1920x900-04-battle-settlement-selected-stage.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4z-adventure-selection\desktop-1920x900-05-return-lobby-after-selected-stage.png`
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4z-adventure-selection\desktop-1920x900-06-adventure-recent-readback.png`
- Compact visual evidence:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4z-adventure-selection\micro-390x340-01-adventure-selected.png`
- Runtime facts:
  - selected stage stayed `MAIN_1_1` from adventure detail into formation and battle preview;
  - battle start used `battleNo=B810204a94e064015a052f806dc199bec`;
  - result settlement used `settlementNo=Sf4ebb68f5cec4eb890141477df987b1c`;
  - settlement returned `stageCode=MAIN_1_1`, `rewardGranted=false`, `readonlyEconomy=true`;
  - return-to-lobby closed both battle preview and formation overlays.
  - a fresh login/adventure readback then loaded the same latest settlement `Sf4ebb68f5cec4eb890141477df987b1c` from recent records with `rewardGranted=false` and `readonlyEconomy=true`.
- Latest local checks:
  - `npm.cmd run check:layout` passed.
  - `npm.cmd run check:preview` passed.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4AC Battle Result Guidance And Recent Readback UX

- Cocos frontend-only stage; backend code/API/SQL did not change.
- Product goal:
  - after a no-reward battle settlement, the result panel must clearly tell the player what was recorded and what to do next;
  - the adventure detail panel must make the latest no-reward readback understandable without implying claimable rewards.
- Source changes:
  - `assets/scripts/scenes/lobby/LobbyBattlePresentationState.ts`
    - result-recorded copy now says the no-reward record was written;
    - boundary copy explains the next step: return to lobby and view the recent record in mainline adventure;
    - player-facing wording uses “奖励未开放 / 资源未变更 / 主线进度不推进” instead of raw debug fields;
    - the code comment still preserves the guard phrase `rewardGranted=false` for automated checks.
  - `assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts`
    - added `LobbyBattleSettlementReceipt`, a desktop result receipt card that shows settlement number, battle number, reward status, resource status, and progress status;
    - the receipt is attached inside the battle panel, so panel-internal clicks still do not pass through to the dim layer.
  - `assets/scripts/scenes/lobby/LobbyAdventurePanelRenderer.ts`
    - replaced the single recent-record line with `LobbyAdventureRecentBattleSummaryCard`;
    - the card now separates recent result, record time/target, and no-reward/resource guard wording.
  - `scripts/check-layout.mjs`
    - now guards the new result receipt, result guidance copy, and recent-record card tokens.
  - `scripts/check-preview-freshness.mjs`
    - now checks the battle preview chunk for the result receipt and the adventure chunk for the recent-record card.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos Creator TypeScript no-emit passed for the battle/adventure result files.
  - `git diff --check` passed with existing LF->CRLF warnings only.
- Current Preview status:
  - `npm.cmd run check:preview` intentionally fails because the already-running Cocos Preview is still serving stale chunks:
    - `LobbyAdventurePanelRenderer.ts` chunk missing `LobbyAdventureRecentBattleSummaryCard`;
    - `LobbyBattlePreviewPanelRenderer.ts` chunk missing `LobbyBattleSettlementReceipt`.
  - Source is updated and static checks pass; runtime screenshot acceptance needs Creator-side script refresh/reimport or Preview reopen before rerunning `check:preview`.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4AD Runtime Acceptance For Result Guidance

- Scope:
  - no source behavior change in this follow-up;
  - cleared Stage 4AC runtime acceptance by verifying the running Cocos Preview now serves the new battle result and adventure recent-record chunks.
- Preview/cache status:
  - `npm.cmd run check:preview` now passes again;
  - packer-driver detected and transformed:
    - `LobbyAdventurePanelRenderer.ts`;
    - `LobbyBattlePresentationState.ts`;
    - `LobbyBattlePreviewPanelRenderer.ts`.
- Runtime visual QA was executed through Chrome DevTools Protocol against `http://localhost:7456`.
- Evidence folder:
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ad-result-guidance`
- Screenshots:
  - `desktop-1920x900-01-adventure-recent-card-before.png`
  - `desktop-1920x900-02-formation-main-1-1.png`
  - `desktop-1920x900-03-battle-ready-to-record.png`
  - `desktop-1920x900-04-battle-settlement-receipt.png`
  - `desktop-1920x900-05-adventure-recent-card-after.png`
- Runtime facts:
  - Cocos selected and battled `MAIN_1_1`;
  - battle start: `B05d15599907544cea526baba82b0cb12`;
  - settlement: `Sc6ee0f5062f44317a0333c5c3d7fde30`;
  - the result scene contained:
    - `LobbyBattleSettlementReceipt`;
    - `LobbyBattleSettlementReceiptTitle`;
    - `LobbyBattleSettlementReceiptLine_0..4`;
  - settlement returned `rewardGranted=false` and `readonlyEconomy=true`;
  - after returning to lobby, reopening adventure loaded the same latest settlement in `LobbyAdventureRecentBattleSummaryCard`.
- Verification:
  - `npm.cmd run check:layout` passed.
  - `npm.cmd run check:preview` passed.
  - Focused Cocos Creator TypeScript no-emit passed for the changed battle/adventure files.
  - Backend `scripts/smoke-cocos-current-flow.ps1 -BaseUrl http://localhost:8081 -UserId 1 -StageCode MAIN_1_1` passed with:
    - battle `B482c0b55c4c545589855c30b69b1e50d`;
    - settlement `S335a2554c0c74ba1b462d97f27de8e9e`;
    - `rewardGranted=false`;
    - `readonlyEconomy=true`;
    - unchanged economy snapshots.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.

## 2026-05-31 Stage 4AE Lobby Next-Step Goal Tracker

- Scope:
  - Cocos frontend-only source change;
  - backend code/API/SQL did not change.
- Product goal:
  - after returning to lobby from the no-reward battle/readback loop, the player should immediately see what to do next;
  - the lobby should show the current mainline target and latest readonly battle record without implying rewards, stamina spend, or progress.
- Source changes:
  - `assets/scripts/scenes/lobby/LobbyHudTypes.ts`
    - `LobbyHudHost` now exposes `currentLobbyBattleState()` and `currentLobbySelectedStageCode()` as read-only HUD inputs.
  - `assets/scripts/scenes/lobby/LobbyHudRenderer.ts`
    - added `LobbyGoalTracker` for desktop;
    - added `LobbyCompactGoalTracker` for constrained non-micro layouts;
    - added `LobbyMicroGoalChip` for very small Preview/mobile viewports;
    - tracker derives target stage from current selected/recommended adventure state and recent battle records only;
    - tracker click only opens the existing adventure panel and never starts battle, skips formation, grants rewards, spends stamina, or writes progress.
  - `assets/scripts/scenes/LootChainGameRoot.ts`
    - overlay refresh now removes the new tracker nodes before rerendering HUD.
  - `scripts/check-layout.mjs`
    - guards the new tracker nodes, host methods, allowed click contract, and multi-resolution tracker bounds.
  - `scripts/check-preview-freshness.mjs`
    - now checks the HUD chunk for `LobbyGoalTracker`, `LobbyCompactGoalTracker`, `LobbyMicroGoalChip`, and `currentLobbyBattleState`.
- Verification:
  - `npm.cmd run check:layout` passed.
  - Focused Cocos Creator TypeScript no-emit passed for root/HUD/type files.
  - Cocos `git diff --check` passed with existing LF->CRLF warnings only.
  - Backend `git diff --check` passed with existing LF->CRLF warnings only.
  - Backend `scripts/smoke-cocos-current-flow.ps1 -BaseUrl http://localhost:8081 -UserId 1 -StageCode MAIN_1_1` passed:
    - battle `B3c2c3bee321449cf9ffe379e32f947fd`;
    - settlement `S4fd31cbe921e4edbb1af0c60438682bd`;
    - `rewardGranted=false`;
    - `readonlyEconomy=true`;
    - economy snapshots unchanged.
- Current Preview status:
  - `npm.cmd run check:preview` currently fails because the already-running Cocos Preview is still serving stale `LobbyHudRenderer.ts` chunk `b23bf0ad3ece87ab6871a1675b5151e5718ec414.js`;
  - the stale chunk is missing `LobbyGoalTracker`, `LobbyCompactGoalTracker`, `LobbyMicroGoalChip`, and `currentLobbyBattleState`;
  - a Cocos CLI build attempt hung without producing a build log and the spawned process was stopped;
  - runtime screenshot acceptance for Stage 4AE still needs Creator-side script refresh/reimport or Preview reopen before rerunning `npm.cmd run check:preview`.
- Red line unchanged:
  - no reward;
  - no stamina cost;
  - no mainline progress write;
  - no saved formation write;
  - no bag/currency/USDT/fund-pool mutation;
  - no EX V1;
  - no new economy write endpoint.
## 2026-05-31 Stage 4AF Fresh Player Runtime Closure And Hero Roster Race Fix

- 当前阶段仍以 Cocos-only 为准，不回到 `web-vue`。
- 本轮补齐了新玩家端到端运行时证据：在最新 Cocos Preview 下新建本地 `game_user` userId `29`，通过 Cocos 登录后进入主角创建页，创建主角 `VisualHero29`，随后进入大厅。
- 大厅左上角显示名使用创建时输入的主角名 `VisualHero29`；该账号主角英雄为 `user_hero.id=26`，英雄队列中主角自动进入本地编队。
- 最新 Cocos 运行时闭环：
  - 创建主角 -> 大厅目标引导 -> 冒险 `MAIN_1_1` -> 编队 -> 战斗预演 -> 无奖励结算 -> 返回大厅 -> 冒险最近记录回读；
  - battle `B8a2ffc4fea6e40689e3a03030d156d03`；
  - settlement `S013e12191ed944ca89b43cecf79a5fc6`；
  - `rewardGranted=false`；
  - `readonlyEconomy=true`；
  - 最近记录回读同一 settlement `S013e12191ed944ca89b43cecf79a5fc6`。
- 本轮修复了一个真实前端竞态：
  - `assets/scripts/scenes/lobby/LobbyHeroRosterLoader.ts` 现在会复用正在进行中的英雄队列加载 Promise；
  - `cancel()` 现在会真正递增请求票据并清空 in-flight 请求，避免重新登录或切换玩家后旧响应覆盖新玩家英雄队列；
  - 这防止玩家快速从编队进入战斗预演时，战斗 start 在英雄队列还未完成加载前拿到空阵容。
- Cocos Preview 已通过 Creator 脚本构建刷新，运行中的 Preview chunk 能搜到 `inFlightLoad`，`npm.cmd run check:preview` 已通过，不再停留在 Stage 4AE 的 stale HUD caveat。
- 截图证据目录：
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ae-lobby-goal-tracker`
  - 新玩家截图包括 `desktop-1920x900-09-fresh-protagonist-create.png`、`desktop-1920x900-10-fresh-lobby-goal-tracker.png`、`desktop-1920x900-11-fresh-settlement-receipt.png`、`desktop-1920x900-12-fresh-recent-readback.png`。
- 本轮已跑检查：
  - `npm.cmd run check:layout` 通过；
  - `npm.cmd run check:preview` 通过；
  - Cocos Creator 3.8.8 focused TypeScript no-emit 通过；
  - 后端 current-flow smoke 通过：user `1`，battle `B7af2444b982847219d02983aa45d5443`，settlement `S7d2455aff3604567ae56a4c83d2c3390`；
  - 后端 fresh-player smoke 通过：user `30`，protagonist `SmokeHero30`，hero `27`，battle `B7bf0f5841814478396d8b9d4a4d001ab`，settlement `Sa3d6e79624f34e4ab217b8f32efad150`，stamina `100 -> 100`，combatPower `9432 -> 9432`。
- 红线保持不变：
  - 不发奖励；
  - 不扣体力；
  - 不推进主线进度；
  - 不保存编队；
  - 不改背包、货币、USDT、资金池；
  - 不开放 EX V1；
  - 不新增任何经济写入口。

## 2026-05-31 Stage 4AG Resilience Closure

- 当前阶段仍然以 Cocos-only 为准，不回到 `web-vue`。
- 本轮目标是把“登录 -> 大厅 -> 冒险 -> 编队 -> 战斗预演 -> 无奖励结算 -> 返回/重登回读”从可玩闭环提升到抗误触、抗竞态、可复验闭环。
- 前端补齐：
  - `assets/scripts/scenes/login/LoginRenderer.ts` 的登录弹框内容区已挂 `BlockInputEvents`，弹框内部点击不会穿透到底层登录按钮；
  - 所有大厅弹框仍保留内容区输入阻断，运行时已覆盖个人信息、公告、图鉴、英雄、占位、冒险、编队、战斗预演；
  - `assets/scripts/scenes/lobby/LobbyFormationPanelRenderer.ts` 增加出战预览准入：英雄队列加载中、加载失败或为空时按钮显示 `读取中`/`不可出战` 并禁用；
  - `scripts/check-preview-freshness.mjs` 已同步检查登录弹框阻断、面板阻断、目标追踪、战斗结算和英雄队列竞态 token；
  - 新增运行时 QA 脚本 `tmp/stage4ag-resilience-qa.mjs`，用于复验弹框阻断、非法/锁定路径、快速点击去重、刷新/重登回读和多分辨率 HUD。
- 最新 Cocos Preview 运行时验收：
  - user `1`，大厅显示主角名 `圣契1`；
  - 非法 `EX_1_1` 和锁定 `MAIN_1_2` 都没有进入编队/战斗；
  - 快速点击只创建 1 次 battle start 和 1 次 settle；
  - battle `B3525e4db77d94108a1c0379773366153`；
  - settlement `S6f721e05eee049658795824d15ddce0f`；
  - 返回大厅和重登后最近记录均回读同一 settlement；
  - `rewardGranted=false`，`readonlyEconomy=true`，`economyApplied=false`。
- 截图证据目录：
  - `D:\business\project\lootchain-cocos\docs\visual-qa\stage-4ag-resilience`
  - 覆盖 `1920x900`、`1280x720`、`390x340`。
- 最新验证：
  - `npm.cmd run check:layout` 通过；
  - `npm.cmd run check:preview` 通过；
  - Cocos Creator 3.8.8 focused TypeScript no-emit 通过；
  - 后端 current-flow、stage guard、lineup guard、request guard、settle guard、fresh-player smoke 全部通过。
- 后端 smoke 最新关键 ID：
  - current-flow battle `B4031d43401ee4f2ca943675aa2dcf88a`，settlement `Secdd9cd5dcbd487bacaada9cb7f6ddfb`；
  - fresh-player user `31`，protagonist `SmokeHero31`，hero `28`，battle `Bf4ce3ccc1a4949cfbf8a534d21495f02`，settlement `S747eaef629204fe3a737933183504b5e`；
  - fresh-player stamina `100 -> 100`，combatPower `9432 -> 9432`。
- 红线不变：
  - 不发奖励；
  - 不扣体力；
  - 不推进主线进度；
  - 不保存编队；
  - 不修改背包、货币、USDT、资金池；
  - 不开放 EX V1；
  - 不新增任何经济写入口。

### 下一阶段建议

- 继续往正常游玩流程推进时，优先做“只读剧情/关卡目标展示 + 本地战斗表现占位”的玩家体验补强。
- 在经济规则正式确认前，仍保持 no-reward settlement，不接真实掉落、体力消耗、主线进度推进和资源写入。

## 2026-05-31 Stage 4AH Full-Screen Battle And Hero Detail

- 当前阶段仍然以 Cocos-only 为准，不回到 `web-vue`。
- 多角色结论：
  - 产品：战斗必须进入全屏/新场景式表现，不再使用缩小弹框承载核心战斗；
  - 设计/UI：本轮先在大厅内切到 `battle` 逻辑视图，保持全屏画面、明确返回入口和无奖励结果记录；
  - 美术：使用高质量暗黑哥特战斗背景、英雄详情背景和主角立绘素材，避免卡通化；
  - 研发：复用现有 no-reward battle session/settlement/readback，不新增经济写入；
  - 审查/验收：英雄详情为只读展示，战斗仍不发奖励、不扣体力、不推进主线。
- 本轮 Cocos 代码变更：
  - `assets/scripts/scenes/LootChainGameRoot.ts`
    - 增加 `battle` 视图；
    - 增加 `renderBattleScene()`；
    - 打开战斗时切换 `this.currentView = 'battle'`，关闭/返回时回到大厅；
    - 增加 `openLobbyHeroDetail()`、`closeLobbyHeroDetailPanel()`、`backToLobbyHeroRosterPanel()` 和当前英雄详情状态。
  - `assets/scripts/scenes/lobby/LobbyBattlePreviewPanelRenderer.ts`
    - 使用 `LobbyBattleSceneRoot` 作为全屏战斗表现层；
    - 增加战斗背景精灵、暗角、粒子/余烬动效、角色突进 tween 和命中特效 tween；
    - 保留 `LobbyBattleSettlementReceipt`、只读结算、内容区 `BlockInputEvents`。
  - `assets/scripts/scenes/lobby/LobbyHeroRosterPanelRenderer.ts`
    - 英雄卡增加点击反馈和 `openLobbyHeroDetail(hero.id)`。
  - `assets/scripts/scenes/lobby/LobbyHeroDetailPanelRenderer.ts`
    - 新增英雄详情只读展示层；
    - 展示英雄动态图/立绘、名称、稀有度、星级、主角形态、属性、技能和只读说明；
    - 不接升级、升星、觉醒、装备、抽卡、领取等入口。
  - `assets/scripts/scenes/UiSpriteFrameCache.ts`
    - 预加载本轮新增 UI 素材。
- 本轮新增素材：
  - `assets/resources/ui/battle/battle_scene_cathedral.png`
  - `assets/resources/ui/hero-detail/hero_detail_backdrop.png`
  - `assets/resources/ui/hero-detail/hero_detail_protagonist.png`
- 守卫脚本已同步：
  - `scripts/check-layout.mjs`
  - `scripts/check-preview-freshness.mjs`
- 已跑验证：
  - `npm.cmd run check:layout` 通过；
  - Cocos Creator 3.8.8 focused TypeScript no-emit 通过；
  - `git diff --check` 通过，仅有既有 LF->CRLF warning；
  - `npm.cmd run check:preview` 失败，原因是当前 Cocos Preview 仍在服务旧 chunk，缺少本阶段新 token 和 `LobbyHeroDetailPanelRenderer.ts` import-map entry。下一次需要刷新/重开 Creator Preview 后重新执行。
- 红线不变：
  - 不发奖励；
  - 不扣体力；
  - 不推进主线进度；
  - 不保存编队；
  - 不修改背包、货币、USDT、资金池；
  - 不开放 EX V1；
  - 不新增任何经济写入口。

### 下一阶段建议

- 刷新 Cocos Preview 后先跑 `npm.cmd run check:preview` 和一次运行时 QA，确认全屏战斗层、英雄详情层、多分辨率布局都进入最新预览包。
- Preview 刷新通过后，再继续做剧情/关卡目标的只读呈现和战斗表现动画细化。

## 2026-05-31 Stage 4AI Lobby Popups Converted To Scene Pages

- 当前阶段仍然以 Cocos-only 为准，不回到 `web-vue`。
- 用户要求：`将全部弹框改成，切换场景`。
- 本轮实现口径：
  - 当前没有拆多个物理 Cocos `.scene` 文件；
  - 采用单 Cocos 主场景内的 `currentView` 逻辑场景切换；
  - 这样可以满足“视觉和交互上切场景，不再弹框覆盖 HUD”，同时避免登录态、资源缓存、背景视频和 no-reward battle flow 被大范围重写。
- 已改的入口：
  - 登录账号页 -> `loginDialog` 场景页；
  - 个人信息 -> `profile` 场景页；
  - 公告/活动 -> `notice` 场景页；
  - 冒险 -> `adventure` 场景页；
  - 编队 -> `formation` 场景页；
  - 英雄 -> `heroes` 场景页；
  - 英雄详情 -> `heroDetail` 场景页；
  - 图鉴 -> `codex` 场景页；
  - 未开放占位入口 -> `placeholder` 场景页；
  - 战斗仍走上一阶段 `battle` 全屏逻辑场景。
- 代码变更：
  - `assets/scripts/scenes/LootChainGameRoot.ts`
    - `ViewName` 扩展到所有大厅功能页；
    - 新增 `renderLobbyScenePage()`；
    - 新增 `isLobbyScenePageView()`；
    - 新增 `returnToLobbyFromScenePage()`；
    - `renderLobby()` 只渲染大厅背景和 HUD；
    - 打开功能页时设置对应 `currentView` 并整页重绘；
    - 关闭功能页时返回大厅，英雄详情“返回英雄”回英雄列表。
  - `LobbyAdventurePanelRenderer.ts`
  - `assets/scripts/scenes/login/LoginRenderer.ts`
  - `LobbyFormationPanelRenderer.ts`
  - `LobbyHeroRosterPanelRenderer.ts`
  - `LobbyHeroDetailPanelRenderer.ts`
  - `LobbyCodexPanelRenderer.ts`
  - `LobbyNoticePanelRenderer.ts`
  - `LobbyProfileDialogRenderer.ts`
    - 面板尺寸改为安全区全屏页面；
    - 遮罩层只做 `BlockInputEvents`；
    - 不再点击遮罩关闭；
    - 主要关闭按钮改为 `返回大厅`。
  - `scripts/check-layout.mjs`
    - 增加逻辑场景页和全屏页面布局守卫；
    - 增加遮罩不关闭、返回大厅按钮 token。
  - `scripts/check-preview-freshness.mjs`
    - 增加 Preview chunk 新鲜度 token，覆盖所有逻辑场景页。
- 已跑验证：
  - `npm.cmd run check:layout` 通过；
  - Cocos Creator 3.8.8 focused TypeScript no-emit 通过；
  - `git diff --check` 通过，仅有既有 LF->CRLF warning；
  - `npm.cmd run check:preview` 仍失败，原因是 Cocos Preview 继续服务旧 chunk。下一次需要刷新/重开 Preview 后复验。
- 红线不变：
  - 不发奖励；
  - 不扣体力；
  - 不推进主线进度；
  - 不保存编队；
  - 不修改背包、货币、USDT、资金池；
  - 不开放 EX V1；
  - 不新增任何经济写入口。

### 下一阶段建议

- 刷新 Cocos Preview 后优先跑 `npm.cmd run check:preview`；
- 做一轮运行时点击 QA：大厅入口 -> 对应场景页 -> 返回大厅；英雄页 -> 英雄详情 -> 返回英雄 -> 返回大厅；冒险 -> 编队 -> 战斗；
- 如果后续确实需要物理 Cocos Scene，再单独规划 scene asset、预制体、跨 scene 状态持有和资源生命周期。

## 2026-05-31 Stage 4AJ Gacha Summon Preview

- 当前阶段仍然以 Cocos-only 为准，不回到 `web-vue`。
- 本轮已读取 `D:\project\LootChain\docs\gacha` 全部文档，并按产品、数值、架构、UI、美术、VFX、后端、前端、QA、Review 角色完成当前阶段输出。
- 后端边界：
  - 当前真实玩家接口路径是 `/api/player/gacha/*`；
  - 文档旧口径 `/api/game/gacha/*` 不作为本轮实现路径；
  - `PlayerApiPhaseGate` 当前仍阻断玩家侧 gacha 接口；
  - 真实单抽/十连/兑换/补发属于经济写入口，本轮未开放。
- Cocos 本轮实现：
  - 新增 `assets/scripts/scenes/gacha/GachaSceneConfig.ts`；
  - 新增 `assets/scripts/scenes/gacha/GachaSceneRenderer.ts`；
  - 新增 `assets/resources/ui/gacha/gacha_bg_cathedral.png` 及 meta；
  - `UiSpriteFrameCache.ts` 预加载 gacha 背景；
  - `LootChainGameRoot.ts` 新增 `gacha` 逻辑场景页；
  - `LobbyHudRenderer.ts` 将活动入口 `深渊召唤` 和场景热点 `召唤祭坛` 接到全屏召唤预览页；
  - 单抽/十连按钮只提示未开放，不调用后端写接口。
- 生成素材：
  - `D:\project\lootchain-cocos\docs\ui-reference\gacha\generated\gacha_bg_cathedral.png`
  - `D:\project\lootchain-cocos\docs\ui-reference\gacha\generated\gacha_ui_target_mockup.png`
- 后端项目同步文档：
  - `D:\project\LootChain\docs\gacha\gacha-current-stage-output.md`
  - `D:\project\LootChain\docs\gacha\gacha-art-pack-manifest.json`
- 已跑验证：
  - `npm.cmd run check:layout` 通过；
  - Cocos Creator 3.8.8 focused TypeScript no-emit 通过。
- 下次继续建议：
  - 先补透明卡框、按钮、图标、召唤阵和粒子素材；
  - 再做 gacha 结果展示层；
  - 真实抽卡前必须先单独做后端 G1 只读白名单和 G2 测试环境单抽授权。
- 红线不变：不发奖励、不扣资源、不发放英雄、不更新保底、不开放兑换、不开放 EX V1、不新增任何经济写入口。

## 2026-06-01 Stage 4AK Gacha Local Mock Result Layer

- 当前阶段继续保持 Cocos-only，不回到 `web-vue`。
- 本轮只修改 Cocos 前端展示层：
  - `assets/scripts/scenes/gacha/GachaSceneConfig.ts` 新增 `GachaMockResultItem`、`GACHA_MOCK_RESULT_ONCE`、`GACHA_MOCK_RESULT_TEN`；
  - `assets/scripts/scenes/gacha/GachaSceneRenderer.ts` 新增 `GachaMockResultLayer`、`GachaMockResultPanel`、`GachaMockResultNoWriteNote`、`GachaMockResultConfirmButton`；
  - 单抽/十连按钮从单纯状态提示升级为打开本地 mock 结果弹层；
  - 结果卡片仍由 Cocos `Graphics` 绘制，避免截图式模糊资源。
- 行为边界：
  - 结果内容是固定本地 mock，只用于 UI/动效验收；
  - 不调用 `GachaApi`，不请求 `/api/player/gacha/draw`；
  - 不扣资源、不发英雄、不写入抽卡记录、不更新保底、不开放兑换或补发。
- 守卫同步：
  - `scripts/check-layout.mjs` 新增 gacha mock 配置、结果弹层节点和前端-only 禁止项检查；
  - `scripts/check-preview-freshness.mjs` 新增 Gacha 结果弹层 chunk freshness token，刷新/重开 Cocos Preview 后可复验运行包是否最新。
- 已跑验证：
  - `npm.cmd run check:layout` 通过；
  - Cocos Creator 3.8.8 focused TypeScript no-emit 通过。
- Preview 状态：
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Cocos Preview 仍在服务旧 `GachaSceneRenderer.ts` chunk，缺少 `GachaMockResultLayer`、`GachaMockResultPanel`、`GachaMockResultNoWriteNote`、`GachaMockResultConfirmButton`；
  - 需要在 Cocos Creator 中刷新/重开 Preview 后再复验。
- 下次继续建议：
  - 重开/刷新 Cocos Creator Preview 后运行 `npm.cmd run check:preview`；
  - 做一次大厅 `深渊召唤`、场景热点 `召唤祭坛`、小屏 `召唤` 到 Gacha 页的点击 QA；
  - 继续补透明卡框、按钮三态、概率/记录/兑换/保底图标、召唤阵和粒子素材。
- 红线不变：真实单抽、十连、兑换、补发仍全部关闭；不改变经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-01 Stage 4AL Protagonist Full-Screen Scene

- 用户反馈“选择角色弹框需要更改为全屏场景”。
- 本轮只修改 Cocos 前端主角选择/创建页，不改后端接口、SQL 或经济配置。
- Cocos 本轮实现：
  - `assets/scripts/scenes/protagonist/ProtagonistCreateRenderer.ts` 保留 `currentView = 'protagonistCreate'` 逻辑视图；
  - `ProtagonistCreatePanel` 从居中弹框尺寸改为安全区全屏场景尺寸；
  - 新增 `drawFullSceneFrame()`，只绘制薄边框和顶部/底部暗色压层，不再使用居中弹框视觉；
  - 男/女主角卡、SSR 形态预览、角色名输入和“进入游戏”按钮按全屏舞台重新排布；
  - `ProtagonistCreatePanel` 加入 `BlockInputEvents`，作为独立全屏场景吞掉输入。
- 行为边界：
  - 仍只提交 `gender` 和 `protagonistName`；
  - 不允许客户端提交 `heroCode`、稀有度、等级、星级、战力或属性；
  - 主角色创建仍是账号初始化写入，不是抽卡、奖励、购买、结算、资金池或链上领取入口。
- 守卫同步：
  - `scripts/check-layout.mjs` 已更新主角选择页的全屏场景布局公式和多分辨率边界/重叠检查；
  - `scripts/check-preview-freshness.mjs` 已新增 `ProtagonistCreateRenderer.ts` 全屏场景 token。
- 已跑验证：
  - `npm.cmd run check:layout` 通过；
  - Cocos Creator 3.8.8 focused TypeScript no-emit 通过。
- Preview 状态：
  - `npm.cmd run check:preview` 当前失败，运行中的 Cocos Preview 仍在服务旧 `ProtagonistCreateRenderer.ts` chunk，缺少 `drawFullSceneFrame`、`scene.addComponent(BlockInputEvents)` 和全屏场景说明 token；
  - 同时旧 `GachaSceneRenderer.ts` chunk 仍缺少 Stage 4AK 的 Gacha 结果层 token；
  - 需要在 Cocos Creator 中刷新/重开 Preview 后再复验。
- 下次继续建议：
  - 刷新/重开 Cocos Creator Preview 后运行 `npm.cmd run check:preview`；
  - 用新账号走一遍 `登录 -> 全屏选择角色 -> 创建主角 -> loading -> 大厅` 运行时 QA。
- 红线不变：不改变经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-01 Stage 4AM Protagonist Local Schema Fix

- 用户反馈点击主角选择页“进入游戏”提示“系统异常”。
- 本地接口实调定位：
  - `POST /api/player/auth/dev-login` 对 `userId=1` 返回 `code=0`；
  - `GET /api/player/protagonist/state` 返回 `code=500 / 系统异常`；
  - MySQL 查询确认本地 `lootchain` schema 缺少 `player_protagonist` 表。
- 修复动作：
  - 已执行 `D:\project\LootChain\sql\12_protagonist_module.sql` 到本地 `lootchain` 数据库；
  - 该脚本创建 `player_protagonist`，补齐 `user_hero.source_type/sort_weight`，并插入男女主角攻击形态模板；
  - 这是既有主角模块迁移，不改变概率、消耗、保底、奖励、USDT、资金池或 EX 规则。
- 复验结果：
  - `userId=1` 的 `GET /api/player/protagonist/state` 已恢复 `code=0`，当前仍为 `created=false`，没有被提前创建主角；
  - 用已有测试玩家 `userId=3` 调用 `POST /api/player/protagonist` 成功，返回 `rarity=SSR`、`currentForm=attack`、`heroCode=PROTAGONIST_FEMALE_ATTACK`、`userHeroId=4`；
  - `npm.cmd run check:layout` 通过，focused Cocos Creator TypeScript no-emit 通过，前后端 `git diff --check` 通过且仅有既有 LF->CRLF warning；
  - 后续在 Cocos Preview 中用默认 `userId=1` 点击“进入游戏”应进入正常创建流程。
- 注意：本次修复了本机数据库缺失迁移；如果其他机器或数据库重置后再次出现同样 500，先执行 `sql/12_protagonist_module.sql`。

## 2026-06-01 Stage 4AN Lobby Scene Page Background Flash Fix

- 用户反馈点击部分大厅功能弹框/功能页时，会短暂闪出登录界面的背景视频。
- 根因：
  - 主场景里登录背景节点 `Login_BG_Video`、`Login_BG_Poster`、`BG_Main`、`Sky_Effects`、`Foreground_Effects` 等仍是 Canvas 的常驻静态节点；
  - 部分大厅功能页进入时走 `renderBase()`，会先 `releaseLobbyVideoRuntime()` 并 `contentRootController.clear()`，导致 `Lobby_BG_Poster` / `Lobby_BG_Video` 被销毁；
  - 大厅背景重建前的这一帧会露出底层登录视频。
- 修复：
  - `LootChainGameRoot.ts` 新增 `LOGIN_SCENE_STAGE_NODE_NAMES`，离开 `login/loginDialog` 后统一隐藏登录静态舞台节点；
  - 新增 `tryPlayLoginSceneVideo()`，回到 `login/loginDialog` 时递归尝试恢复登录背景 `VideoPlayer` 播放，避免登录页视频被上一轮隐藏动作永久停掉；
  - 新增 `LOBBY_BACKGROUND_NODE_NAMES` 与 `renderLobbyWorldBase()`，大厅功能页切换时只清掉 HUD/页面层，保留现有 `Lobby_BG_Poster`、`Lobby_BG_Video`、`Lobby_BG_Fallback`；
  - `UiContentRootController.ts` 新增 `clearExcept()`，支撑保留指定运行时节点；
  - `returnToLobbyFromScenePage()` 和 `closeGachaScene()` 改为回到 `renderCurrentView()`，能复用已存在的大厅背景保活路径；
  - `scripts/check-layout.mjs` 与 `scripts/check-preview-freshness.mjs` 加入本次背景保活和登录舞台隐藏 token。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Cocos Preview 仍在服务旧 `LootChainGameRoot.ts` chunk，缺少 `renderLobbyWorldBase`、`clearExcept(LOBBY_BACKGROUND_NODE_NAMES)`、`LOGIN_SCENE_STAGE_NODE_NAMES`、`setLoginSceneStageVisible`；需要刷新/重开 Preview 后复验。
- 红线不变：本次只改 Cocos 前端渲染生命周期，不改变经济规则，不开放 EX V1，不新增任何经济写入口。

### 2026-06-01 Stage 4AN Login Video Restore Patch

- 用户反馈上一轮修复后登录背景视频没了。
- 修正：
  - 移除离开登录态时主动 `VideoPlayer.stop()` / `AudioSource.stop()` 的逻辑；
  - 登录舞台隐藏只控制节点 `active`，不销毁登录背景节点，也不永久停止登录视频；
  - 回到 `login/loginDialog` 时通过 `tryPlayLoginSceneVideo()` 对登录背景视频执行静音播放尝试。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过。

## 2026-06-01 Stage 4AO Remaining Popup Paths Converted To Full-Screen Scenes

- 用户要求：全部弹框都改为切换新的全屏场景。
- 当前仍按项目既定方案使用单 Cocos 主场景内的 `currentView` 逻辑场景切换，未拆新的物理 `.scene` 文件，避免破坏登录态、资源缓存、背景视频保活和当前 no-write 预览流。
- 本轮已收敛剩余弹层路径：
  - 登录账号页可见节点改为 `LoginAccountSceneRoot` / `LoginAccountScenePanel`，面板按安全区全屏铺开并阻断底层输入；
  - Gacha 单抽/十连本地 mock 结果从 `GachaMockResultLayer` 覆盖层改为 `currentView = 'gachaResult'` 的全屏结果场景，由 `renderResultScene()` 渲染；
  - 未开放/占位入口可见节点改为 `LobbyPlaceholderSceneRoot` / `LobbyPlaceholderScenePanel`，继续只做本地提示，不跳转、不发奖、不写入经济数据。
- 已确认核心源码和守卫脚本不再包含旧的 `DialogDim`、`LoginDialogPanel`、`GachaMockResultLayer`、`GachaMockResultPanel`、`GachaMockResultNoWriteNote`、`GachaMockResultConfirmButton`、`LobbyPlaceholderDim`、`LobbyPlaceholderPanel` token。
- `scripts/check-layout.mjs` 与 `scripts/check-preview-freshness.mjs` 已同步改为检查新的全屏场景 token。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Cocos Preview 仍在服务旧 chunk，缺少 `LobbyPlaceholderSceneRoot`、`LoginAccountSceneRoot`、`GachaResultSceneRoot` 和 `gachaResult` 相关 token；需要刷新/重开 Preview 后复验。
- 红线不变：不改变经济规则，不开放 EX V1，不请求真实抽卡，不扣资源，不发英雄，不写抽卡记录/保底，不新增任何经济写入口。

## 2026-06-01 Stage 4AP Login Account Scene And Video Restore Hardening

- 用户反馈：预览里“没有变”，登录页背景视频没了，账号登录仍像弹框而不是新场景切换。
- 本轮修正：
  - `LootChainGameRoot.ts` 将登录账号页逻辑视图从 `loginDialog` 改为 `loginAccount`；
  - `LoginRenderer.ts` 将 `renderLoginDialog()` / `openLoginDialog()` 语义改为 `renderLoginAccountScene()` / `openLoginAccountScene()`；
  - 账号登录页不再渲染登录首页 Logo rail/右侧占位按钮/主登录入口，进入后只显示独立账号登录全屏场景；
  - `LoginAccountScenePanel` 从大号 beveled 弹框改为全屏半透明场景面，增加顶部/底部场景压层；
  - `LoginVideoBackground.ts` 新增 `resumeForLoginView()`，回到登录/账号登录场景时恢复 video 节点、poster 兜底和静音播放；
  - `LootChainGameRoot.ts` 在恢复登录舞台时递归调用 `resumeForLoginView()`，避免 poster 已淡出但视频未恢复时出现黑屏/空背景。
- 守卫同步：
  - `scripts/check-layout.mjs` 已改为检查 `renderLoginAccountScene()`、`openLoginAccountScene()`；
  - `scripts/check-preview-freshness.mjs` 已增加 `loginAccount`、`resumeForLoginView()` 和账号登录场景 chrome token。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - 旧弹层/旧登录弹框 token 扫描无匹配；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Cocos Preview 仍在服务旧 chunk，缺少 `resumeForLoginView`、`loginAccount`、`renderLoginAccountScene`、`openLoginAccountScene` 和 `drawAccountSceneChrome`；需要刷新/重开 Preview 后复验。
- 红线不变：本轮只改 Cocos 前端 UI/视频恢复路径，不改后端、不改 SQL、不改经济规则、不开放 EX V1、不新增经济写入口。

## 2026-06-01 Stage 4AQ Login Background Poster/Video Only

- 用户反馈：登录页展示的是静态图，不是背景视频；登录页仅需要展示 `Login_BG_Poster`、`Login_BG_Video`。
- 本轮修正：
  - `LootChainGameRoot.ts` 拆分 `LOGIN_SCENE_BACKGROUND_NODE_NAMES` 与 `LOGIN_SCENE_LEGACY_NODE_NAMES`；
  - 登录态只激活 `Login_BG_Poster`、`Login_BG_Video`；
  - `BG_Main`、`BG_Main-001`、`BG_Main-002`、`Sky_Effects`、`FG_Architecture`、`Dragon_Layer`、`Character_Effects`、`Foreground_Effects` 等旧静态舞台层即使在登录态也强制关闭；
  - `AdaptiveStageLayoutResolver.ts` 的登录舞台测量节点改为 `Login_BG_Poster` / `Login_BG_Video`，不再依赖 `BG_Main`；
  - `LoginVideoBackground.ts` 增加 `schedulePosterHideFallback()` 与 `hidePosterForVideo()`，视频播放请求后如果 `PLAYING` 事件没有及时淡出 poster，也会在短延迟后隐藏 poster，避免 poster 永远挡住 video。
- 守卫同步：
  - `scripts/check-layout.mjs` 更新登录背景节点守卫与 main.scene 登录舞台测量节点；
  - `scripts/check-preview-freshness.mjs` 增加 legacy 节点关闭、poster 隐藏 fallback token。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Cocos Preview 仍在服务旧 chunk，缺少 `LOGIN_SCENE_BACKGROUND_NODE_NAMES`、`LOGIN_SCENE_LEGACY_NODE_NAMES`、`stageNode.active = false`、`schedulePosterHideFallback`、`hidePosterForVideo`；需要刷新/重开 Preview 后复验。
- 红线不变：只改 Cocos 前端背景显示与布局测量，不改后端、不改 SQL、不改经济规则、不开放 EX V1、不新增经济写入口。

## 2026-06-01 Stage 4AR Lobby Feature Entries Full-Screen Scenes

- 用户反馈：游戏大厅内点击某个功能时仍然是弹框，需要换成全屏新场景。
- 本轮修正：
  - `LootChainGameRoot.ts` 的 `renderLobbyScenePage()` 不再走 `renderLobbyWorldBase()` 保留大厅背景，也不再渲染大厅背景；
  - 大厅功能页改走 `renderBase()`，清空当前大厅运行时内容后渲染 `LobbyFeatureSceneBackdrop`，形成独立全屏逻辑场景；
  - `LobbyAdventurePanelRenderer.ts` 改为 `LobbyAdventureSceneContent` / `LobbyAdventureSceneFrame`，内容尺寸使用 `layout.stageWidth/stageHeight`；
  - `LobbyCodexPanelRenderer.ts` 改为 `LobbyCodexSceneContent` / `LobbyCodexSceneFrame`；
  - `LobbyFormationPanelRenderer.ts` 改为 `LobbyFormationSceneContent` / `LobbyFormationSceneFrame`；
  - `LobbyHeroRosterPanelRenderer.ts` 改为 `LobbyHeroRosterSceneContent` / `LobbyHeroRosterSceneFrame`；
  - `LobbyHeroDetailPanelRenderer.ts` 改为 `LobbyHeroDetailSceneContent` / `LobbyHeroDetailSceneFrame`；
  - `LobbyNoticePanelRenderer.ts` 改为 `LobbyNoticeSceneContent` / `LobbyNoticeSceneFrame`；
  - `LobbyProfileDialogRenderer.ts` 改为 `LobbyProfileSceneRoot` / `LobbyProfileSceneContent`；
  - 未开放占位入口同步铺满 `layout.stageWidth/stageHeight`。
- 守卫同步：
  - `scripts/check-layout.mjs` 更新功能页全屏场景 token 与多分辨率边界公式；
  - `scripts/check-preview-freshness.mjs` 更新各功能页 Preview chunk token，检查新 `SceneContent/SceneFrame`。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `npm.cmd run check:preview` 当前失败，原因是运行中的 Cocos Preview 仍在服务旧 chunk，缺少 `LobbyFeatureSceneBackdrop` 及各 `Lobby*SceneContent/SceneFrame` token；需要刷新/重开 Preview 后复验。
- 红线不变：本轮只改 Cocos 前端场景承载方式，不改后端、不改 SQL、不改经济规则、不开放 EX V1、不新增经济写入口。

## 2026-06-01 Stage 4AS Unified Full-Screen Scene Back Button

- 用户反馈：所有功能进入的新场景的返回按钮需要统一成抽奖模块里的样式。
- 本轮修正：
  - 新增 `assets/scripts/scenes/UiSceneBackButton.ts`，抽出与 Gacha 一致的左上角箭头返回按钮，统一位置、尺寸、金色线条和按压反馈；
  - `GachaSceneRenderer.ts` 改为调用共享 `renderSceneBackButton()`，避免 Gacha 和其他场景后续样式分叉；
  - 大厅功能页、资料页、未开放占位页和战斗预览页全部接入同一返回按钮；
  - 旧底部“返回大厅”文字按钮从大厅功能页移除，底部仅保留刷新、战斗预演等非返回操作按钮。
- 验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过；`npm.cmd run check:preview` 当前失败，原因是运行中的 Cocos Preview 仍在服务旧 chunk，需刷新/重开 Preview 后复验。
- 红线不变：只改 Cocos 前端 UI 组件和场景返回交互，不改后端、不改 SQL、不改经济规则、不开放 EX V1、不新增任何经济写入口。

## 2026-06-01 Stage 4AT Gacha Center Spine Animation

- 用户要求：召唤界面中心展示的背景卡牌替换成 `D:\project\lootchain-cocos\assets\spine\gacha\Lord of the Dark Abyss` 里的 Spine 骨骼动画。
- 本轮修正：
  - `GachaSceneConfig.ts` 新增 `GACHA_ABYSS_SPINE_UUID`、`GACHA_ABYSS_SPINE_SKIN`、`GACHA_ABYSS_SPINE_INTRO_ANIMATION`、`GACHA_ABYSS_SPINE_IDLE_ANIMATION`；
  - `GachaSceneRenderer.ts` 中心展示区改为 `GachaAbyssSpineStage` / `GachaAbyssSpineNode`，通过 `assetManager.loadAny({ uuid: GACHA_ABYSS_SPINE_UUID })` 加载 `sp.SkeletonData`；
  - 动画先播放 `appear`，随后循环 `idle`；加载期间显示本地前端 fallback，不请求后端；
  - 召唤结果预览页仍使用本地 mock 卡片，不接真实单抽/十连/兑换/补发。
- 守卫同步：`scripts/check-layout.mjs` 检查 Spine 资源文件、Gacha Spine 配置和渲染 token；`scripts/check-preview-freshness.mjs` 检查 Preview chunk 是否包含最新 Spine 渲染逻辑。
- 验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过；运行中的 Preview 可能仍是旧 chunk，需要刷新/重开后复验。
- 红线不变：不改后端、不改 SQL、不改经济规则、不开放 EX V1、不新增任何经济写入口，不接真实抽卡写接口。

## 2026-06-01 Stage 4AU Remove Friendship Summon Pool

- 用户要求：移除“友情召唤”。
- 本轮修正：
  - `GachaSceneConfig.ts` 从 `GACHA_PREVIEW_POOLS` 删除 `id: 'friend'` 池；
  - Gacha 卡池预览当前只保留限定召唤、英雄召唤、普通召唤、光暗召唤锁定占位；
  - `scripts/check-layout.mjs` 新增守卫，禁止 Gacha 配置回退出现 `id: 'friend'` 或“友情召唤”。
- 范围说明：大厅右上角社交 friends 图标不是友情召唤池，本轮不改社交占位图标。
- 红线不变：不改后端、不改 SQL、不改经济规则、不开放 EX V1、不新增任何经济写入口，不接真实抽卡写接口。

## 2026-06-01 Backend Hero Roster Art Sync

- 用户指定英雄素材：
  - `act_21053` -> `UR_EVELYN` / 深渊魔女·伊芙琳；
  - `act_21023` -> `UR_ARTHAS` / 永夜龙骑·阿尔萨斯。
- 后端新增 `hero_template.portrait_asset` 展示字段，并通过 `D:\project\LootChain\sql\15_hero_roster_art_refresh.sql` 同步本地数据库。
- R/SR 当前启用模板已收敛为六职业各一个；SSR 当前启用法师、坦克、战士、刺客各一个；UR 已补齐战士、辅助、刺客、法师、射手、坦克六职业各一个。
- 新增 UR：`UR_SERAPHINA` 辅助、`UR_NYX` 刺客、`UR_AURELIA` 射手、`UR_ATLAS` 坦克。
- 新增 UR 没有加入 `gacha_pool_item`，避免改变普通英雄池概率、权重、保底、消耗或掉落分布。
- Cocos 当前仍只做召唤预览/mock，不开放真实抽卡写接口；立绘文件当前在 `C:\Users\axian\Desktop\hero`，后续如要前端展示需单独导入 `assets/resources`。

## 2026-06-01 Stage 4AV Hero Portrait Resource Keys And Gacha Spine Swap

- 后端 `hero_template.portrait_asset` 已从“文件名”语义收敛为不带扩展名的 `act_数字` 资源编号；本地 `lootchain` 库已执行 `sql/15_hero_roster_art_refresh.sql`，复验 `.png` 后缀计数为 `0`。
- 后端只读英雄/图鉴 VO 已带出 `portraitAsset`：`UserHeroListItemVO`、`UserHeroDetailVO`、`HeroCodexItemVO`、`PlayerLobbyHeroItemVO`、`PlayerLobbyCodexItemVO`。
- Cocos 只读 API/types 已接收 `portraitAsset`：`LobbyHeroApi`、`LobbyCodexApi`、`LobbyHeroTypes`、`LobbyCodexTypes`、`HeroTypes`；当前仅建立资源映射字段，不新增渲染写入口。
- Gacha 中心 Spine 从 `Lord of the Dark Abyss` 切换为 `assets/spine/gacha/huangfengjiaozong/huangfengjiaozong.skel`，UUID 为 `ef87498c-2ef4-44e6-bee9-2d499e6ac570`，使用 `default` 皮肤并循环 `idle`。
- Gacha 背景/中心舞台已移除原先可见的红色圆圈/法阵环；`check:layout` 增加回归守卫，禁止旧红圈颜色 token 回来。
- 新补 UR 仍未写入 `gacha_pool_item`；真实单抽、十连、兑换、补发、扣资源、发英雄、记录、保底全部仍关闭。
- 已验证：Cocos `npm.cmd run check:layout`、focused Cocos TypeScript no-emit、后端 Maven compile、后台 typecheck、`PlayerLobbyHeroServiceImplTest` 均通过；Preview 仍需要刷新/重开后看最新运行 chunk。

## 2026-06-01 Stage 4AW Gacha Spine Runtime Resource Fix

- 用户反馈：Gacha 中心 Spine 已切到 `huangfengjiaozong`，但 Preview 中没有展示新的骨骼动画。
- 定位结论：旧实现只按 UUID 动态加载，Spine 文件位于 `assets/spine/...`，不在 Cocos `resources` 运行时包内；当前 Preview 还在服务旧 chunk，因此运行时可能拿不到新 SkeletonData。
- Cocos 修正：
  - 已将 Gacha Spine 资源移动到 `assets/resources/spine/gacha/huangfengjiaozong/`，保留原 `skel/atlas/png` 及 meta UUID；
  - `GachaSceneConfig.ts` 新增 `GACHA_ABYSS_SPINE_RESOURCE = 'spine/gacha/huangfengjiaozong/huangfengjiaozong'`；
  - `GachaSceneRenderer.ts` 改为优先 `resources.load(GACHA_ABYSS_SPINE_RESOURCE, sp.SkeletonData)`，UUID `assetManager.loadAny` 只作为兜底；
  - 加载或播放失败时会保留本地 fallback，并给出明确状态提示，避免静默失败。
- 守卫同步：
  - `scripts/check-layout.mjs` 已改为检查 `assets/resources/spine/gacha/huangfengjiaozong` 路径和 `resources.load` token；
  - `scripts/check-preview-freshness.mjs` 已改为检查 Gacha 最新 chunk 中的 `GACHA_ABYSS_SPINE_RESOURCE` / `resources.load` / UUID 兜底 token。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - `node .\scripts\check-preview-freshness.mjs` 当前仍失败，原因是运行中的 Cocos Preview 还在服务旧 chunk；需要在 Cocos Creator 里刷新/重开 Preview，等待资源重新导入后再复验。
- 红线不变：本轮只改 Cocos 前端资源加载与文档，不改后端、不改 SQL、不改经济规则、不开放 EX V1、不新增任何经济写入口，不接真实抽卡写接口。

## 2026-06-01 Stage 4AX Gacha Spine Skin/Animation Auto Resolve

- 用户继续反馈：Gacha 中心仍然空白。
- 追加定位：
  - `assets/resources/config.json` 已能在 Preview 中访问，且已包含 `spine/gacha/huangfengjiaozong/huangfengjiaozong` 与 UUID `ef87498c-2ef4-44e6-bee9-2d499e6ac570`；
  - SkeletonData、`.bin`、texture PNG 都能被 Preview HTTP 正常返回；
  - 因此剩余高概率问题是 `huangfengjiaozong` 的实际皮肤/动画名并非固定的 `default` / `idle`；
  - Cocos `sp.Skeleton.setAnimation()` 找不到动画时只返回 `null`，不抛异常，旧逻辑会误判成功并销毁 fallback，表现为空白。
- Cocos 修正：
  - `GachaSceneRenderer.ts` 改为读取 `SkeletonData.getSkinsEnum()` / `getAnimsEnum()`；
  - 若找不到配置的 `default` / `idle`，自动选择资源实际存在的第一个皮肤和第一个可播放动画；
  - 只有 `setAnimation()` 或 `addAnimation()` 返回有效 TrackEntry 后才销毁 fallback；
  - 新增运行时 `console.info`，会打印实际使用的 `skin`、`animation` 和 Spine 原始尺寸，便于继续排查缩放/位置。
- 守卫同步：
  - `scripts/check-layout.mjs` 已加入 skin/animation 自动解析 token；
  - `scripts/check-preview-freshness.mjs` 已更新 Gacha chunk token。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - 当前运行中的 Preview 仍是旧 chunk，必须重开/刷新 Preview 后才能看到本轮修正。
- 红线不变：只修 Cocos 前端 Spine 播放逻辑，不改后端、不改 SQL、不接真实抽卡、不新增经济写入口。

## 2026-06-01 Stage 4AY Gacha Spine No-Animation Static Pose Fallback

- 用户截图显示：Gacha 中心一直停留在 `黄风教宗准备中`，底部提示 `召唤 Spine 未找到可播放动画，请检查 huangfengjiaozong 的导出动画列表。`
- 结论：
  - 这说明 `huangfengjiaozong` SkeletonData 已加载，但 Cocos 运行时没有从该资源中枚举到可播放 animation；
  - 该问题不属于抽卡或后端问题，而是当前 Spine 导出资源缺少 Cocos 可识别的动画列表，或导出的动画数据未包含在当前 `.skel` 中。
- Cocos 修正：
  - `GachaSceneRenderer.ts` 在 `data.getRuntimeData(true)` 成功后，如果没有 animation，不再停留在 loading fallback；
  - 调用 `skeleton.setToSetupPose()` 展示静态骨骼首帧，并提示 `huangfengjiaozong 未找到导出动画，已显示静态骨骼首帧。`；
  - 只有运行时解析失败（skel/atlas/texture 不匹配）才继续保留 fallback。
- 守卫同步：
  - `scripts/check-layout.mjs` 增加 `setToSetupPose`、`<setup-pose>` 和静态骨骼首帧提示 token；
  - `scripts/check-preview-freshness.mjs` 同步检查最新 Gacha chunk。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - `git diff --check` 通过，仅有既有 LF/CRLF warning。
- 后续美术要求：如必须播放动态动画，需要重新导出 `huangfengjiaozong`，确保 Cocos Inspector 能看到至少一个 animation 名称；前端会自动使用实际可用动画。
- 红线不变：只改 Cocos 前端展示兜底，不改后端、不改 SQL、不接真实抽卡、不新增经济写入口。
## 2026-06-01 Stage 4AZ Gacha Spine Runtime Fallback

- 用户截图显示：Gacha 中心继续停留在 `黄风教宗准备中`，状态提示变为 `召唤 Spine 运行时解析失败，请检查 huangfengjiaozong 的 skel/atlas/texture 是否匹配。`
- 定位结论：
  - `huangfengjiaozong` 的 `SkeletonData`、`.bin` 和贴图资源已经能被 Cocos 加载；
  - 失败点是 `data.getRuntimeData(true)` 返回空，说明当前 `.skel/atlas/texture` 组合无法被 Cocos 3.8.8 Spine runtime 正常解析；
  - 这不是前端资源路径问题，也不是动画名问题，当前资源需要重新导出或重新匹配 atlas/texture。
- Cocos 修正：
  - Gacha 中心仍优先加载 `spine/gacha/huangfengjiaozong/huangfengjiaozong`；
  - 如果运行时解析失败，自动加载已验证可播放的 `spine/gacha/Lord of the Dark Abyss/1605` 作为临时视觉预览，避免中心区域继续空白；
  - fallback 成功后状态提示：`huangfengjiaozong Spine 运行时解析失败，已临时显示可用预览 Spine；需要重新导出 huangfengjiaozong。`
- 守卫同步：
  - `scripts/check-layout.mjs` 增加 fallback Spine 资源存在性、fallback 配置与渲染 token；
  - `scripts/check-preview-freshness.mjs` 增加 fallback 运行时 token。
- 红线不变：只改 Cocos 前端视觉兜底和诊断，不改后端、不改 SQL、不接真实抽卡、不扣资源、不发英雄、不写抽卡记录/保底、不新增经济写入口、不开放 EX V1。

## 2026-06-01 Stage 4BA Gacha Status Text Position Fix

- 当前阶段仍然以 Cocos-only 为准，不回到 `web-vue`。
- 用户截图反馈：Gacha 页蓝色状态提示压住底部 `召唤1次` / `召唤10次` 按钮。
- 根因：
  - Spine 解析失败、fallback 成功等诊断信息会调用全局 `setStatus`；
  - `StatusPresenter` 默认把状态文字放在底部安全区；
  - Gacha 页底部同时放置召唤按钮，导致状态文字遮挡按钮。
- Cocos 修正：
  - `assets/scripts/scenes/StatusPresenter.ts` 的 `set(text)` 扩展为 `set(text, layout?, y?)`，支持更新已有状态文字位置；
  - `assets/scripts/scenes/LootChainGameRoot.ts` 在 `gacha` / `gachaResult` 视图里把状态提示移动到 `layout.stageBottom + 210 * layout.uiScale`；
  - 该位置在底部召唤按钮上方，不再覆盖按钮。
- 守卫同步：
  - `scripts/check-layout.mjs` 增加 Gacha/GachaResult 专用状态条位置 token；
  - `scripts/check-preview-freshness.mjs` 增加 Preview 新鲜度 token，确保刷新后的 Preview 包含新位置逻辑。
- 已跑验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - `git diff --check` 通过，仅有既有 LF/CRLF warning。
- 当前 Preview 状态：
  - `npm.cmd run check:preview` 仍失败；
  - 运行中的 Cocos Preview 还在服务旧 chunk，`LootChainGameRoot.ts` chunk 缺少 `gachaStatusY` 新逻辑；
  - 需要重开或刷新 Cocos Creator Preview 后复验 Gacha 页面。
- 红线不变：只改 Cocos 前端状态文字位置，不改后端、不改 SQL、不接真实抽卡、不扣资源、不发英雄、不写抽卡记录/保底、不新增经济写入口、不开放 EX V1。

## 2026-06-01 Hero Detail Spine Asset Field Sync

- 当前仍以前端 Cocos-only 为准，不回到 `web-vue`。
- 后端英雄模板新增 `hero_template.spine_asset` 展示字段，用于英雄详情页骨骼动画资源目录；初始值按 `portrait_asset` 复制并将 `act` 替换为 `npc`。
- 已新增并执行 `D:\project\LootChain\sql\16_hero_spine_asset.sql`；本地 `lootchain` 库复验 `spine_asset` 列存在，`spine_asset <> REPLACE(portrait_asset, 'act', 'npc')` 计数为 `0`。
- 后端 DTO/VO、玩家英雄列表、英雄详情、图鉴、Cocos 大厅英雄/图鉴只读门面均已带出 `spineAsset`。
- Cocos 已同步 `LobbyHeroApi`、`LobbyCodexApi`、`LobbyHeroTypes`、`LobbyCodexTypes`、`HeroTypes` 和 `check-layout` 守卫；当前只接收资源映射字段，不新增渲染写入口。
- 验证通过：后端 Maven compile、`PlayerLobbyHeroServiceImplTest`、Cocos `npm.cmd run check:layout`、focused Cocos TypeScript no-emit。
- 红线不变：不改抽卡概率/消耗/保底/奖励，不写 `gacha_pool_item`，不接真实抽卡，不扣资源，不发英雄，不写抽卡记录/保底，不开放 EX V1，不新增经济写入口。

## 2026-06-01 Stage 4BB Gacha Spine JSON Export Handoff

- 用户已重新导出 `huangfengjiaozong` Spine JSON 资源到 `assets/resources/spine/gacha/huangfengjiaozong/`。
- 本地复验：`huangfengjiaozong.json` 当前 `skeleton.spine=3.8.75`，包含 `default` skin 和 `idle` animation；`huangfengjiaozong.atlas` 引用两张图集页：`huangfengjiaozong.png` 与 `huangfengjiaozong2.png`。
- 同目录仍保留旧 `huangfengjiaozong.skel`，为避免 `resources.load('spine/gacha/huangfengjiaozong/huangfengjiaozong')` 命中旧二进制资源，Gacha 目标 Spine 改为优先 `assetManager.loadAny({ uuid: '178d1dbd-5a53-459b-83bb-2f05c623d99e' })` 加载新 JSON SkeletonData，资源路径只作兜底。
- `scripts/check-layout.mjs` 已改为要求 JSON runtime 文件、两张 atlas page，并校验导出版本为 Spine 3.8.x、存在 `default` skin 与 `idle` animation。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过；`git diff --check` 通过（仅既有 LF/CRLF warning）。
- `npm.cmd run check:preview` 当前仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk，缺少最新返回按钮、Gacha 状态文字位置与 Gacha renderer token；需要重开或刷新 Preview 后再跑。
- 下一步：重开或刷新 Cocos Creator Preview，让 Creator 重新导入新 JSON/atlas/texture 后进入 Gacha 页面复验；若仍 fallback，重点看控制台是否仍报 3.8.75 runtime 解析问题。
- 红线不变：只调整 Cocos 前端资源加载优先级与检查脚本，不改后端、不改 SQL、不接真实抽卡、不扣资源、不发英雄、不写抽卡记录/保底、不新增经济写入口、不开放 EX V1。

## 2026-06-01 Stage 4BC Gacha Huangfeng Ground Alignment

- 用户复验后确认 `huangfengjiaozong` 已显示，但角色位置看起来悬在空中，需要落到地面。
- `GachaSceneRenderer.ts` 中 Gacha 中心 Spine 节点的本地 Y 从原先接近舞台中段的 `-stageHeight * 0.23` 下调为 `spineGroundY = -stageHeight * 0.49`，并让底部阴影跟随 `spineGroundY - 22 * scale`，使脚底更接近背景中央地面/法阵区域。
- 为降低角色与背景红窗/高亮建筑的冲突，已移除中心舞台背后的局部矩形遮罩，改为加深背景之后、UI/Spine 之前的全屏 `GachaAbyssAtmosphere` 暗幕，避免中间出现透明框。
- `scripts/check-layout.mjs` 与 `scripts/check-preview-freshness.mjs` 已加入新的地面基准与全屏暗幕 token，并禁止中心局部矩形遮罩回归。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过；`git diff --check` 通过（仅既有 LF/CRLF warning）。
- `npm.cmd run check:preview` 当前仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk，尚未包含 `GachaAbyssAtmosphere` 全屏暗幕加深、`spineGroundY = -stageHeight * 0.49` 等最新 token。
- 需要重开或刷新 Cocos Creator Preview 后复验视觉位置；若仍偏高，可继续只调 `spineGroundY` 系数；若背景仍抢眼，可继续微调整体暗幕 alpha。
- 红线不变：只调整 Cocos 前端视觉坐标，不改后端、不改 SQL、不接真实抽卡、不扣资源、不发英雄、不写抽卡记录/保底、不新增经济写入口、不开放 EX V1。

## 2026-06-01 Stage 4BD Gacha Huangfeng Size And Lower Placement

- 用户继续反馈：中间骨骼动画可以再大一些，位置再往下一点。
- `GachaSceneRenderer.ts` 已将 `spineGroundY` 从 `-stageHeight * 0.49` 下调为 `-stageHeight * 0.55`，并将 `resolveAbyssSpineScale()` 的基数从 `0.36` 提高到 `0.43`，让 `huangfengjiaozong` 更大且更贴近地面。
- 全屏背景压暗仍通过 `GachaAbyssAtmosphere` 完成，不恢复中心局部透明框。
- `scripts/check-layout.mjs` 与 `scripts/check-preview-freshness.mjs` 已同步新位置/缩放 token。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过；`git diff --check` 通过（仅既有 LF/CRLF warning）。
- `npm.cmd run check:preview` 当前仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk，尚未包含 `spineGroundY = -stageHeight * 0.55` 与 `return 0.43 * scale * stageFactor` 最新 token。
- 待验证：重开或刷新 Cocos Creator Preview 后进入 Gacha，确认角色尺寸和脚底位置；如果过大或压到底部文案，可把 scale 基数回调到 `0.40~0.42` 或把 `spineGroundY` 调回 `0.52`。
- 红线不变：只调整 Cocos 前端视觉坐标/缩放，不改后端、不改 SQL、不接真实抽卡、不扣资源、不发英雄、不写抽卡记录/保底、不新增经济写入口、不开放 EX V1。

## 2026-06-01 Stage 4BE Hero Detail Spine Preview

- 当前继续以 Cocos-only 为准，不回到 `web-vue`。
- 英雄详情页左侧主视觉已消费只读 `spineAsset`，按 `assets/resources/spine/hero/{spineAsset}/{spineAsset}` 加载 Cocos `sp.SkeletonData`；当前已有 `npc_1001` 资源契约守卫。
- 加载失败、runtime 解析失败或动画播放失败时，只保留当前详情页静态占位，不串用其它英雄或 Gacha 怪物资源兜底。
- 已移除英雄详情原有红色动态圆环与面板红圆，替换为暗色脚底投影和低透明暗金地线；compact 布局按 art stage、info panel、gap 重新计算，避免窄屏遮挡。
- 守卫同步：`scripts/check-layout.mjs` 增加 hero Spine 资源、meta/atlas、详情页 Spine token、红圈/aura 禁止 token；`scripts/check-preview-freshness.mjs` 增加详情页 Spine 最新 chunk token。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- 红线不变：只读展示英雄详情，不提供升级、升星、觉醒、装备、抽卡、领取或资源变更入口；不新增经济写入口，不开放 EX V1，不接真实抽卡写接口。
## 2026-06-02 Stage 4BF Hero Detail Secondary Animation And Layout Polish

- 当前继续以 Cocos-only 为准，不回到 `web-vue`。
- 英雄详情页骨骼动画现在会从 `sp.SkeletonData.getAnimsEnum()` 解析主/副动画：优先循环主动画，每隔 15 秒插播一次第二动画，播放完自动回到主循环；`npc_1001` 当前可识别到 `1001_skill1_1` 与 `1001_skill2_1` 等动画名。
- 视觉层移除了英雄详情大背景/主视觉区域的金色边框与红圈语言，保留暗色地面投影，避免画面里出现抢眼的框线。
- 右侧信息区重新拉开层级：稀有度/拥有状态在首行，星级单独成行，来源说明、属性格、技能列表依次下移，减少文字互相覆盖。
- 守卫同步：`scripts/check-layout.mjs` 与 `scripts/check-preview-freshness.mjs` 已要求第二动画 15 秒插播、Hero Spine 详情 token，并禁止大金框/红圈回归。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- 边界不变：英雄详情仍为只读展示，不开放升级、升星、觉醒、装备、抽卡、领取、发放、扣费、保底或任何经济写入口；EX V1 仍不开放，Gacha 仍只做视觉预览和本地 mock。
### 2026-06-02 Stage 4BF Validation Note

- `git diff --check` 通过，仅保留既有 LF/CRLF warning。
- `npm.cmd run check:preview` 仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk；其中 `LobbyHeroDetailPanelRenderer.ts` chunk 缺少 `spine/hero/${asset}/${asset}`、`resolveHeroSpineAnimationNames`、`startHeroSpineSecondaryCycle`、`.delay(15)`、`skeleton.addAnimation(0, primaryAnimation, true, 0)` 等本轮 token。需要重开或刷新 Cocos Creator Preview 后复验英雄详情。
## 2026-06-02 Stage 4BG Gacha Background Reuse Hero Detail Backdrop

- 当前继续以 Cocos-only 为准，不回到 `web-vue`。
- 召唤页背景资源从 `ui/gacha/gacha_bg_cathedral/spriteFrame` 切换为英雄详情页同款 `ui/hero-detail/hero_detail_backdrop/spriteFrame`，统一召唤与英雄详情的暗黑殿堂背景语义。
- `GachaSceneRenderer.ts` 仍通过 `GACHA_BACKGROUND_ASSET` 渲染背景，不改变召唤页按钮、Spine、mock 结果或本地预览流程。
- 守卫同步：`scripts/check-layout.mjs` 要求 `GACHA_BACKGROUND_ASSET` 指向英雄详情背景，并禁止旧召唤背景路径回归；`scripts/check-preview-freshness.mjs` 增加 `GachaSceneConfig.ts` 背景资源 token。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- 边界不变：Gacha 当前仍只做视觉预览和本地 mock，不扣资源、不发英雄、不写抽卡记录、不更新保底、不开放真实抽卡写接口；EX V1 仍不开放。
### 2026-06-02 Stage 4BG Validation Note

- `git diff --check` 通过，仅保留既有 LF/CRLF warning。
- `npm.cmd run check:preview` 仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk；本轮新增检查明确指出 `GachaSceneConfig.ts` chunk 仍缺少 `ui/hero-detail/hero_detail_backdrop/spriteFrame`。重开或刷新 Cocos Creator Preview 后再复验召唤页背景。
## 2026-06-02 Stage 4BH Generated Gacha Abyss Ring Background And Hero Grounding

- 当前继续以 Cocos-only 为准，不回到 `web-vue`。
- 使用 built-in imagegen 生成新的抽奖背景 `assets/resources/ui/gacha/gacha_bg_abyss_ring.png`，配色为深冷蓝黑主调、低饱和暗红环、少量暗金地面反光；画面中央下方留出暗色角色站位区，用于凸显暗色/灰色骨骼动画人物。
- `GachaSceneConfig.ts` 的 `GACHA_BACKGROUND_ASSET` 已切换为 `ui/gacha/gacha_bg_abyss_ring/spriteFrame`，不再复用英雄详情背景，也不回到旧 `gacha_bg_cathedral`。
- 英雄详情桌面主视觉位置调整到面板中心：`artX = 0`，让角色位于背景中间红环下方；Spine 节点、静态兜底和脚底投影统一使用 `resolveHeroDetailGroundY(height)`，人物与地面基线距离为 0，不再悬空。
- 守卫同步：`scripts/check-layout.mjs` 新增生成背景资源存在性、Gacha 背景路径、旧背景路径禁止回归、英雄详情中心站位和地面基线 token；`scripts/check-preview-freshness.mjs` 同步检查最新 chunk token。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- 边界不变：Gacha 当前仍只做视觉预览和本地 mock，不扣资源、不发英雄、不写抽卡记录、不更新保底、不开放真实抽卡写接口；英雄详情仍为只读展示；EX V1 仍不开放。
### 2026-06-02 Stage 4BH Validation Note

- `git diff --check` 通过，仅保留既有 LF/CRLF warning。
- `npm.cmd run check:preview` 仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk；当前旧包缺少 `ui/gacha/gacha_bg_abyss_ring/spriteFrame`、`const artX = 0;`、`resolveHeroDetailGroundY(height)`、`graphics.ellipse(0, groundY` 等本轮 token。需要重开或刷新 Cocos Creator Preview，并等待新 PNG/meta 重新导入后复验召唤页和英雄详情。
## 2026-06-02 Stage 4BI Gacha Background Dark Overlay Removal

- 当前继续以 Cocos-only 为准，不回到 `web-vue`。
- 按反馈移除召唤页与本地结果页背景上的全屏暗层：`GachaSceneRenderer.ts` 不再调用/渲染 `GachaAbyssAtmosphere`，新生成的 `gacha_bg_abyss_ring` 背景按原色直接展示。
- Spine loading fallback 自身的小透明呼吸动画保留；移除的只是覆盖整张召唤背景的黑色氛围遮罩。
- 守卫同步：`scripts/check-layout.mjs` 不再要求暗层 token，并将 `GachaAbyssAtmosphere`、`rgba(0, 0, 0, 132)`、`opacity.opacity = 226`、1.8 秒暗层呼吸 tween 列为禁止回归；`scripts/check-preview-freshness.mjs` 同步移除暗层必需 token。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- 边界不变：Gacha 当前仍只做视觉预览和本地 mock，不扣资源、不发英雄、不写抽卡记录、不更新保底、不开放真实抽卡写接口；EX V1 仍不开放。
### 2026-06-02 Stage 4BI Validation Note

- `git diff --check` 通过，仅保留既有 LF/CRLF warning。
- `npm.cmd run check:preview` 仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk；需要重开或刷新 Cocos Creator Preview 后，才能看到召唤页移除全屏暗层后的背景原色。
## 2026-06-02 Stage 4BJ Hero Detail Overlay And Identity Plate Polish

- 当前继续以 Cocos-only 为准，不回到 `web-vue`。
- 按反馈移除英雄详情页中间半屏暗带：`drawPanelShade()` 不再绘制第二层横向暗矩形，并将全屏遮罩从 `rgba(0, 0, 0, 116)` 降到 `rgba(0, 0, 0, 64)`，保留背景可见度。
- 左上角英雄名称、等级、战力不再固定在左上角，改为角色下方居中的 `LobbyHeroDetailIdentityPlate`，与红环下方的角色主视觉形成同一焦点。
- 移除 `LobbyHeroDetailArtCaption`，底部只保留一条只读边界说明，并将说明下移到 `-height / 2 + 38 * scale`，避免下方两行文字重叠。
- 守卫同步：`scripts/check-layout.mjs` 增加身份牌位置 token，禁止旧左上角标题位置、半屏暗带、旧高透明度遮罩和底部 art caption 回归；`scripts/check-preview-freshness.mjs` 同步身份牌 token。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- 边界不变：英雄详情仍为只读展示，不开放升级、升星、觉醒、装备、抽卡、领取、发放、扣费、保底或任何经济写入口；EX V1 仍不开放。
### 2026-06-02 Stage 4BJ Validation Note

- `git diff --check` 通过，仅保留既有 LF/CRLF warning。
- `npm.cmd run check:preview` 仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk；旧 `LobbyHeroDetailPanelRenderer.ts` chunk 缺少 `LobbyHeroDetailIdentityPlate`、`plateY = -height / 2 + 118 * scale` 等本轮 token。重开或刷新 Cocos Creator Preview 后复验英雄详情页遮罩、身份牌和底部说明。
## 2026-06-02 Stage 4BK Hero Detail Initial Secondary Animation

- 当前继续以 Cocos-only 为准，不回到 `web-vue`。
- 英雄详情页 Spine 播放顺序调整：若当前英雄资源存在第二动画，进入详情时先立即播放第二动画一次，然后自动接回主动画循环。
- 进入后的周期逻辑保留：`startHeroSpineSecondaryCycle()` 仍每 15 秒插播一次第二动画，播放完继续回到主动画循环。
- 若第二动画播放失败，则降级为直接播放主动画循环，不影响详情页展示。
- 守卫同步：`scripts/check-layout.mjs` 与 `scripts/check-preview-freshness.mjs` 新增初始第二动画播放 token，确保不会退回“首次只播主循环、15 秒后才播第二动画”的旧逻辑。
- 已验证：`npm.cmd run check:layout` 通过；focused Cocos Creator 3.8.8 TypeScript no-emit 通过。
- 边界不变：英雄详情仍为只读展示，不开放升级、升星、觉醒、装备、抽卡、领取、发放、扣费、保底或任何经济写入口；EX V1 仍不开放。
### 2026-06-02 Stage 4BK Validation Note

- `git diff --check` 通过，仅保留既有 LF/CRLF warning。
- `npm.cmd run check:preview` 仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk；旧 `LobbyHeroDetailPanelRenderer.ts` chunk 缺少 `const secondaryAnimation = animationNames.secondary`、`skeleton.addAnimation(0, animationName, true, 0)` 等本轮 token。重开或刷新 Cocos Creator Preview 后复验进入英雄详情时的初始第二动画。
## 2026-06-02 Stage 4BL Hero Detail Spine Company Preview Diagnosis

- 用户反馈：家里电脑昨天英雄详情骨骼动画可正常展示；公司电脑更新代码后，王国巡逻兵详情页仍显示静态占位图形，没有显示骨骼动画。
- 本机检查结论：
  - `assets/resources/spine/hero/npc_1001/npc_1001.skel|atlas|png` 资源存在，王国巡逻兵按规则应使用 `spine_asset=npc_1001`；
  - `npm.cmd run check:layout` 通过，说明工作区代码和资源守卫正常；
  - `npm.cmd run check:preview` 失败，当前 Cocos Preview 仍在服务旧 chunk，其中 `LobbyHeroDetailPanelRenderer.ts` 运行包缺少 `spine/hero/${asset}/${asset}`、`resolveHeroSpineAnimationNames`、`startHeroSpineSecondaryCycle`、`const secondaryAnimation = animationNames.secondary` 等英雄详情 Spine token；
  - 因此公司电脑当前预览看不到骨骼动画的首要原因是 Preview 未刷新/未重开，运行包没有进入最新代码。
- MySQL 同步补充：
  - 英雄详情 Spine 依赖后端返回 `spineAsset`，本地库需要执行 `D:\project\LootChain\sql\16_hero_spine_asset.sql`；
  - 当前尝试无密码 `mysql -uroot` 查询失败：`Access denied for user 'root'@'localhost' (using password: NO)`，需要用户用本机 MySQL 密码执行；
  - 验证 SQL：`SELECT hero_code, hero_name, portrait_asset, spine_asset FROM hero_template WHERE hero_code='R_PATROL_01';` 应返回 `act_1001 / npc_1001`。
- 复验顺序：先同步 MySQL SQL 16，再重开 Cocos Creator Preview，等待资源重新导入后进入英雄详情页。
- 边界不变：只处理只读展示资源映射和 Cocos Preview 刷新问题，不开放升级、升星、觉醒、装备、抽卡、领取、扣费、保底或任何经济写入口；EX V1 仍不开放。

## 2026-06-02 Stage 4BM Hero Detail Spine Fallback And Company SQL Sync

- 当前继续以 Cocos-only 为准，不回到 `web-vue`。
- 针对公司电脑英雄详情仍显示静态占位的问题，Cocos 只读 API 增加字段兼容：
  - `LobbyHeroApi` 和 `LobbyCodexApi` 仍优先使用后端返回的 `spineAsset`；
  - 如果后端暂未返回 `spineAsset`，则从 `portraitAsset` 派生骨骼目录：去掉图片扩展名后将 `act_数字` 转为 `npc_数字`，例如 `act_1001 -> npc_1001`；
  - 该逻辑只影响展示资源路径，不新增任何后端请求、抽卡、养成、奖励、扣费或经济写入。
- `scripts/check-layout.mjs` 已同步守卫该兼容逻辑，避免后续退回到“只依赖数据库 `spine_asset` 字段，换机器未同步 SQL 就空白”的状态。
- 已在 `D:\project\LootChain` 按顺序执行本地 SQL：
  - `sql/12_protagonist_module.sql`
  - `sql/15_hero_roster_art_refresh.sql`
  - `sql/16_hero_spine_asset.sql`
- SQL 复验结果：
  - `hero_template` 已存在 `portrait_asset` 与 `spine_asset`；
  - `R_PATROL_01 / 王国巡逻兵` 返回 `portrait_asset=act_1001`、`spine_asset=npc_1001`；
  - 有 `portrait_asset` 的模板中，`spine_asset <> REPLACE(portrait_asset, 'act', 'npc')` 的 mismatch 计数为 `0`。
- 卡池边界复查：
  - 本次 SQL 15/16 不写入 `gacha_pool_item`，本次前端改动也不触碰任何卡池写入；
  - 当前本地 `gacha_pool_item` 中 `NORMAL_HERO` 已存在 `UR_ARTHAS` 与 `UR_EVELYN` 两条 UR 基础池记录，来源是既有 `sql/07_gacha_module.sql` 初始普通池配置，不是本阶段新增；
  - 不自动删除或调整该经济表，后续若要变更卡池权重/掉落，必须单独评审。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `git diff --check` 通过，仅保留既有 LF/CRLF warning；
  - `npm.cmd run check:preview` 仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk，`LobbyHeroDetailPanelRenderer.ts` 等运行包仍缺少 `spine/hero/${asset}/${asset}`、`const artX = 0;`、初始第二动画和统一返回按钮等最新 token。
- 下一步复验顺序：
  1. 在 Cocos Creator 中关闭并重开 Preview，必要时 Reimport 相关 TS/Spine 资源；
  2. 等资源导入完成后重新进入英雄详情；
  3. 王国巡逻兵应按 `assets/resources/spine/hero/npc_1001/npc_1001` 加载骨骼动画；
  4. 如果仍是静态占位，优先看控制台 `[HeroDetail]` 日志和 `/api/player/lobby/heroes` 响应中的 `portraitAsset/spineAsset`。
- 边界不变：英雄详情仍为只读展示；Gacha 仍只做视觉预览和本地 mock，不扣资源、不发英雄、不写抽卡记录、不更新保底、不开放真实抽卡写接口；不改变经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-02 Stage 4BN Spine Resources Dynamic URL Conflict Cleanup

- 用户提供 Cocos 控制台关键日志：`huangfengjiaozong.json` 与同目录旧 `huangfengjiaozong.skel` 动态加载 URL 相同，`.atlas` 与 `.spine` 动态加载 URL 相同；`npc_1001.atlas` 与 `npc_1001.spine` 动态加载 URL 相同。
- 根因确认：
  - Cocos `resources` 动态加载路径会按目录和 basename 生成，例如 `spine/hero/npc_1001/npc_1001`；
  - 同一目录下同时存在同 basename 的 `.json/.skel/.spine/.atlas` 源文件时，可能出现动态 URL 冲突，导致 `resources.load(..., sp.SkeletonData)` 命中错误资产或运行时异常；
  - 因此即使数据库和素材文件存在，英雄详情或 Gacha Spine 仍可能不显示。
- 资源结构修正：
  - `assets/resources/spine/gacha/huangfengjiaozong/` 运行时只保留新 JSON 入口及其 atlas/png：`huangfengjiaozong.json|atlas|png|huangfengjiaozong2.png`；
  - 移出旧 `huangfengjiaozong.skel|.skel.meta` 和 `huangfengjiaozong.spine|.spine.meta`；
  - `assets/resources/spine/hero/npc_1001/` 运行时只保留 `npc_1001.skel|atlas|png`；
  - 移出 `npc_1001.spine|.spine.meta`；
  - 移出 `assets/resources/spine/hero/act_1001/act_1001.spine|.spine.meta`；
  - 移出 `assets/resources/spine/gacha/Lord of the Dark Abyss/085.spine|.spine.meta`。
- 归档位置：
  - 非运行时源文件已移动到 `docs/spine-source-archive/resources-conflict-backup/`，不再进入 Cocos `resources` 动态加载链路。
- 守卫同步：
  - `scripts/check-layout.mjs` 增加运行时资源冲突检查；
  - 明确禁止 `.spine` / `.spine.meta` 留在 `assets/resources/spine/**`；
  - 明确禁止已知冲突文件回到 `assets/resources`。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - 手动扫描 `assets/resources/spine` 未再发现 `.spine` 源文件，也未发现同 basename 同时存在 `.json` 与 `.skel` 的运行时冲突。
- 复验要求：
  - 需要在 Cocos Creator 中重新导入 `assets/resources/spine` 相关目录，或关闭并重开 Preview；
  - 旧 Preview / 旧资源库缓存仍可能继续报旧冲突，必须等 Creator 完成资源重新导入后再复验英雄详情和 Gacha。
- 边界不变：只调整 Cocos 资源目录结构和守卫脚本；不改后端、不改 SQL、不改抽卡概率/权重/保底/消耗/奖励/卡池，不开放真实抽卡写接口，不开放 EX V1，不新增任何经济写入口。
## 2026-06-02 Stage 4BO Hero Detail Spine Runtime Fallback Diagnosis

- 用户反馈：公司电脑英雄详情仍显示静态占位，且控制台没有新的 `[HeroDetail]` 输出。
- 本轮复查结论：
  - `npm.cmd run check:preview` 仍失败，`http://localhost:7456` 的 Cocos Preview 继续服务旧 `LobbyHeroDetailPanelRenderer.ts` chunk，缺少 `spine/hero/${asset}/${asset}`、`const artX = 0;`、第二动画与新返回按钮 token；
  - 旧 chunk 没有当前的 Spine 加载诊断逻辑，所以控制台无输出并不代表当前源码没有执行日志，而是 Preview 还没刷新到新代码；
  - 当前运行中的 `GET /api/player/lobby/heroes` 响应也暂未带出 `portraitAsset` / `spineAsset` 字段，说明本地后端服务可能仍是旧运行包或未重启。
- Cocos 只读兜底已补强：
  - `LobbyHeroApi` / `LobbyCodexApi` 在后端缺少资源字段时，先尝试 `portraitAsset -> spineAsset`；
  - 若字段完全缺失，则对当前已知样例 `R_PATROL_01` 使用本地只读映射 `act_1001 / npc_1001`；
  - 该兜底只用于英雄详情资源展示，不扣资源、不发英雄、不写抽卡、不改变经济规则。
- 英雄详情诊断日志已补充：
  - 无资源名时输出 `[HeroDetail] hero spine asset missing`；
  - 开始加载时输出 `[HeroDetail] hero spine load start`；
  - 加载失败、运行时解析失败、动画应用成功仍保留原有 `[HeroDetail]` 日志。
- 本轮验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - `git diff --check` 通过，仅有既有 LF/CRLF warning；
  - `npm.cmd run check:preview` 仍失败，Preview 旧 chunk 缺少 `hero spine asset missing`、`hero spine load start` 等本轮 token。
- 下一步复验重点：
  - 必须关闭并重开 Cocos Creator Preview，等待资源重新导入；
  - 如仍旧 chunk，需要关闭 Cocos Creator 后清理/移动 `temp`、`library` 生成缓存，再重新打开项目；
  - 后端服务也建议重启，使只读英雄列表正式返回 `portraitAsset/spineAsset`，但当前 Cocos 对 `R_PATROL_01` 已可本地兜底。

## 2026-06-02 Stage 4BP Hero Detail Spine Audio Events

- 用户反馈：骨骼动画本身有音效，但英雄详情中听不到。
- 定位结论：
  - Cocos `sp.Skeleton` 不会自动播放 Spine event timeline 中的音频引用；
  - `npc_1001.skel` 中可提取到音频引用：`1001_skill1_1.mp3`、`1001_skill2_1.mp3`、`1001_skill4_3.mp3`；
  - 当前 `D:\project\lootchain-cocos\assets` 下没有这些音频文件，只有登录 BGM，因此即使监听事件也暂时没有实际 `AudioClip` 可播放。
- 前端实现：
  - `LobbyHeroDetailPanelRenderer.ts` 已为英雄详情 Spine 节点添加 `AudioSource`；
  - 已通过 `skeleton.setEventListener()` 监听 Spine 事件；
  - 事件触发时读取 `event.data.audioPath`，优先尝试加载当前 Spine 目录下的同名音频，再尝试 `audio/` 子目录和通用 `audio/spine/hero/` 目录；
  - 加载成功后用 `AudioSource.playOneShot()` 播放，并按 Spine event 的 `volume` 控制音量；
  - 加载失败会输出一次 `[HeroDetail] hero spine audio missing`，方便确认缺的是哪几个音频文件。
- 音频资源放置建议：
  - `assets/resources/spine/hero/npc_1001/1001_skill1_1.mp3`
  - `assets/resources/spine/hero/npc_1001/1001_skill2_1.mp3`
  - `assets/resources/spine/hero/npc_1001/1001_skill4_3.mp3`
  - 或放入 `assets/resources/spine/hero/npc_1001/audio/` 同名文件；Cocos 重新导入后即可被运行时加载。
- 验证：
  - focused Cocos Creator TypeScript no-emit 通过；
  - `npm.cmd run check:layout` 通过；
  - `git diff --check` 通过，仅有既有 LF/CRLF warning；
  - `npm.cmd run check:preview` 仍失败，当前运行 Preview 旧 chunk 缺少 `AudioSource`、`AudioClip`、`bindHeroSpineAudioEvents`、`hero spine audio missing` 等本轮音频事件 token，需要重开/清理 Preview 缓存后复验。
- 边界不变：本轮只处理 Cocos 前端只读展示音效，不改后端、不改 SQL、不新增经济写入口、不开放真实抽卡、不开放 EX V1。

## 2026-06-02 Stage 4BQ Gacha Reveal Preview Scene

- 用户要求开始召唤功能下一阶段，并允许多角色分工；本轮已结合代码、资源、规则三个只读智能体结论推进。
- 新增召唤演出逻辑场景：
  - `LootChainGameRoot` 增加 `gachaReveal` view；
  - 召唤页点击 `召唤1次` / `召唤10次` 后不再直接进入结果页，而是先进入 `GachaRevealSceneRoot`；
  - 演出页使用统一全屏返回按钮 `GachaRevealBackButton`，返回召唤页；
  - 演出页底部 `GachaRevealContinueButton` 才进入现有本地结果页。
- Gacha 演出视觉：
  - `GachaSceneConfig.ts` 新增 `GACHA_REVEAL_STEPS`，包含聚魂、裂隙、显影三个本地演出步骤；
  - `GachaSceneRenderer.ts` 新增仪式暗幕、红金召唤阵呼吸、卡背阵列、步骤进度线、只读边界条；
  - 单抽显示 1 张卡背，十连显示 2x5 卡背阵列，并带本地淡入节奏。
- 守卫同步：
  - `scripts/check-layout.mjs` 增加 `gachaReveal` 根状态、演出页 token、配置 token；
  - `scripts/check-preview-freshness.mjs` 增加 `GachaRevealSceneRoot` / `GachaRevealContinueButton` / `GACHA_REVEAL_STEPS` 等 token，便于重开 Preview 后验证运行 chunk 是否已刷新。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - `git diff --check` 通过，仅有既有 LF/CRLF warning；
  - `npm.cmd run check:preview` 仍失败，运行中的 Cocos Preview 旧 chunk 缺少 `GACHA_REVEAL_STEPS`、`GachaRevealSceneRoot`、`GachaRevealContinueButton` 等本轮 token，需要重开/刷新 Preview 后复验。
- 边界不变：Gacha 仍只做视觉预览和本地 mock，不调用 `GachaApi.draw()`，不请求 `/api/player/gacha/draw`，不扣资源、不发英雄、不写抽卡记录、不更新保底、不开放兑换/补发/真实单抽/十连，不改变经济规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-02 Stage 4BR Real Gacha API And Display Config

- 用户明确要求当前可以接真实抽卡接口，并要求卡池、中心 Spine、右侧按钮信息由后台配置驱动。
- Cocos 前端更新：
  - `GachaApi.draw()` 已改为调用既有 `POST /api/player/gacha/draw`；
  - `LootChainGameRoot` 新增 Gacha state，进入召唤页后读取 `GET /api/player/gacha/pools`；
  - 切换左侧卡池时按 poolCode 切换中心 Spine、右侧按钮说明、按钮文案、真实保底；
  - 真实可抽卡池点击 `召唤1次` / `召唤10次` 会生成 requestId 并调用 draw；
  - 成功后结果页展示真实 `drawNo` 和后端返回 items；失败时停留召唤页并显示错误；
  - `再召唤 N 次必得 ...` 已上移到顶部并读取真实 `pity`；
  - 单抽/十连按钮改为显式 `72 * scale` 间距；
  - 左侧卡池新增 logo 预留圆槽，支持限定/英雄/普通/锁定色彩区分。
- 后端/SQL 同步：
  - 新增 `sql/17_gacha_pool_display_config.sql`，只创建/写入卡池展示配置，不改概率、权重、保底、消耗、奖励；
  - 后端 `GachaPoolVO` 增加展示字段，`GachaPoolServiceImpl` 合并展示配置；
  - `PlayerApiPhaseGate` 放行已有 Gacha 读写接口以及背包/英雄/图鉴只读 GET；
  - `bag/use`、`batch-use`、`sell`、英雄养成、exchange/reissue 仍阻断。
- SQL 执行状态：
  - `sql/17_gacha_pool_display_config.sql` 已在本机 `lootchain` 库执行；
  - 第一次未指定字符集导入时因中文字段编码失败，已使用 `mysql --default-character-set=utf8mb4` 重新执行成功；
  - 复验 `gacha_pool_display_config` 表存在，当前有 4 条展示配置：限定召唤、英雄召唤、普通召唤、光暗召唤。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - 后端 `PlayerApiPhaseGateTest,GachaPoolServiceImplTest` 通过：10 tests；
  - 两个仓库 `git diff --check` 通过，仅有既有 LF/CRLF warning；
  - `npm.cmd run check:preview` 仍失败，运行中的 Cocos Preview 旧 chunk 缺少 `startGachaDraw(mode)` 等最新 token，需要重开/刷新 Preview。
- 边界：本轮只接入已有真实 `draw` 经济写接口，不新增任何经济写入口；未修改 `gacha_pool_rate_config`、`gacha_pool_item`、`gacha_pity_config`、消耗、奖励、重复转碎片或 EX V1 规则；兑换、补发、背包 use、英雄养成仍未开放。

### 2026-06-02 Stage 4BR Documentation Sync

- 已同步更新 Cocos `README.md`、`docs/lobby-feature-analysis.md`，以及后端 `README.md`、`team-history/CURRENT_PROGRESS.md`、`docs/gacha/gacha-current-stage-output.md`。
- 文档口径统一为：当前仅开放既有 `/api/player/gacha/draw` 真实抽卡事务入口；卡池展示配置来自 SQL 17；兑换、补发、背包使用/出售、英雄养成、EX V1 和新增经济写入口仍关闭。

## 2026-06-02 Stage 4BS Gacha Spine Async Callback Error Fix

- 用户反馈召唤页出现 Cocos Preview Error：`Cannot read properties of null (reading 'isValid')`，堆栈落在 `GachaSceneRenderer.finishAbyssSpineLoad()` 后的 Spine 加载回调。
- 根因：召唤页重绘、切换卡池或离开页面时，旧的异步 Spine 回调仍可能返回；原回调直接读取 `skeleton.node.isValid`，当 `sp.Skeleton.node` 已被释放为 `null` 时会触发运行时错误。
- Cocos 前端修复：
  - `GachaSceneRenderer.ts` 新增 `isNodeAlive()` / `isSkeletonNodeAlive()`，所有 Gacha 中心 Spine 回调先确认节点仍存活；
  - `fallback.destroy()` 前统一走 `isNodeAlive(fallback)`，避免 fallback 节点已销毁时再次访问；
  - `finishAbyssSpineLoad()` / `finishAbyssFallbackSpineLoad()` 通过 `runSpineLoadCallbacks()` 分发回调，过期回调失败只输出 warning，不再打断 Preview；
  - 资源加载失败和 Spine 解析失败路径仍保留原有 `console.warn` 与 `setStatus()`，不会被过期回调保护吞掉。
- 守卫同步：`scripts/check-layout.mjs` 新增 Gacha Spine 节点存活 helper token，并禁止 `skeleton.node.isValid` / `fallback.isValid` 直接访问回归。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - `rg -n "\.node\.isValid|fallback\.isValid"` 未在 `GachaSceneRenderer.ts` 中发现直接访问回归；
  - `git diff --check` 通过，仅保留既有 LF/CRLF warning；
  - Browser 打开 `http://localhost:7456/` 后，当前页面未再检出 `Cannot read properties of null` / `reading 'isValid'` 文本，控制台暂无 warning/error；
  - `npm.cmd run check:preview` 仍失败，运行中的 Cocos Preview 继续服务旧 chunk，旧 `GachaSceneRenderer.ts` chunk 缺少 `renderSceneBackButton(this.host, parent, layout` 和 `const spineGroundY = -stageHeight * 0.55` 等最新 token，需要重开/刷新 Cocos Creator Preview 后复验。
- 验收角色结果：
  - 本轮 `isValid` 报错修复点通过：旧/过期 Spine 回调不会再访问 null node；
  - fallback 销毁前存活判断通过；
  - 资源加载失败提示仍保留；
  - 验收角色提示：当前工作区同时包含 Stage 4BR 已获准的真实抽卡接入，因此若按“整工作区不得出现真实 draw 调用”验收会有边界差异；该真实 draw 接入不是本轮报错修复新增内容。
- 本轮边界：只修复 Cocos Gacha Spine 异步回调空节点崩溃和布局守卫；不修改后端、SQL、概率、权重、保底、消耗、奖励、卡池、EX V1，不新增任何经济写入口。

## 2026-06-02 Stage 4BT Real Gacha Draw Local Redis Fix

- 用户反馈：Cocos 召唤页点击召唤后显示“召唤失败：系统异常”。
- 复现与定位：
  - 不带玩家 token 调用 `GET /api/player/gacha/pools` / `POST /api/player/gacha/draw` 返回 401，说明鉴权链路正常；
  - 使用 `POST /api/player/auth/dev-login` 获取 `satoken` 后，`GET /api/player/gacha/pools` 与 `GET /api/player/gacha/pity/NORMAL_HERO` 正常；
  - 带 token 调用 `POST /api/player/gacha/draw` 在 Redis `127.0.0.1:6379` 不可达时返回 `code=500,msg=系统异常`；
  - `NORMAL_HERO` 卡池、概率、条目、英雄模板均存在且启用，玩家 1 状态正常，`DIAMOND=1000`，满足单抽 280 但不足十连 2800。
- 根因：真实抽卡事务在后端 `GachaDrawServiceImpl` 中依赖 `RedisTemplate SETNX` 幂等键与 Redisson 玩家锁；本机 Redis 未监听 6379 时，draw 会在进入事务锁阶段失败并被全局异常包装为“系统异常”。
- 本机处理：
  - 启动 Docker Desktop；
  - 复用已存在的 `redis:7-alpine` 容器 `usdt-monitor-redis`，当前映射为 `0.0.0.0:6379->6379/tcp`；
  - `Test-NetConnection localhost -Port 6379` 通过。
- 复验结果：
  - 带 dev-login token 调用 `POST /api/player/gacha/draw`，`poolCode=NORMAL_HERO, drawCount=1` 返回 `code=0`；
  - 后端生成真实 `drawNo=GACHA6c7808f3dd2143679f662e74bd43a11b`，返回 1 个 R 英雄结果；
  - DB 复核：该 drawNo 写入 `gacha_draw_log`，`draw_count=1`，消耗 `DIAMOND 280`；`gacha_draw_result` 第 0 个结果为 `HERO/R_ACOLY_02/R`；
  - 抽后玩家 1 的 `DIAMOND=720`，当前玩家钻石不足十连，点击十连应走业务失败“余额不足或货币账户并发更新失败”，不是本次 Redis 系统异常。
- Cocos Preview 状态：
  - Browser 已登录进入大厅，但当前停留在英雄详情页，Canvas 返回按钮没有稳定命中；未完成前端按钮复点；
  - 后端真实单抽接口已完成复验，用户在 Creator Preview 中重回召唤页后应可再次点单抽验收；
  - 若仍显示“系统异常”，优先确认 Redis `6379` 是否仍可达，以及 Cocos Preview 是否仍在使用旧 chunk。
- 边界不变：本轮只修复本地依赖环境导致的真实 draw 500，不修改 Cocos/后端代码，不修改 SQL，不改变概率、权重、保底、消耗、奖励、卡池、重复转碎片或 EX V1，不新增任何经济写入口。

## 2026-06-02 Stage 4BU Lobby Bag Readonly Scene

- 用户要求接入背包功能；当前阶段按只读背包场景处理，不开放使用、出售、批量使用、兑换、领取或任何资源变更入口。
- Cocos 前端更新：
  - `BagApi` 当前只保留 `GET /api/player/bag` 与 `GET /api/player/bag/items/{itemCode}/source`；
  - 新增 `LobbyBagState` / `LobbyBagLoader` / `LobbyBagPanelRenderer`，背包从大厅底部“背包”和小屏“背包”入口进入独立 full-screen 逻辑场景 `currentView='bag'`；
  - 背包页展示分类、道具列表、选中道具详情、服务端来源说明，并提供“刷新”和“查看来源”；
  - “使用/出售关闭”为禁用视觉按钮，不绑定写接口；
  - 切换账号会清空旧背包快照，异步读取通过 ticket 防止旧请求覆盖新玩家状态。
- 守卫同步：
  - `check:layout` 允许背包只读 GET，但继续禁止 `/api/player/bag/use`、`/api/player/bag/batch-use`、`/api/player/bag/sell`；
  - `check:layout` 与 `check:preview` 均加入背包 full-screen 场景、loader/state/API token；
  - 多分辨率布局校验已覆盖 `LobbyBagSceneContent`。
- 验证状态：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator 3.8.8 TypeScript no-emit 通过；
  - `git diff --check` 通过，仅有既有 LF/CRLF warning；
  - Browser 当前打开 `http://localhost:7456/`，控制台暂无 warning/error；
  - `npm.cmd run check:preview` 仍失败，运行中的 Cocos Preview 旧 chunk 缺少 `openLobbyBagPanel`、`renderLobbyBagPanel`、`LobbyBagSceneContent`，且没有新背包模块 import-map entry，需要重开/刷新 Cocos Creator Preview 后复验。
- 边界不变：本阶段只接入已有背包只读查询和来源查询；不开放 EX V1，不新增经济写入口，不改变概率、权重、保底、消耗、奖励、卡池、重复转碎片、背包 use/sell 或英雄养成规则。

## 2026-06-02 Stage 4BV Gacha Readonly Side Pages And Fragment Bag Merge

- 用户要求补齐召唤重复英雄转碎片查看入口、顶部金币/钻石真实资产、召唤页右侧功能接口，以及奖池内容全屏页。
- 后端确认：
  - 重复英雄最终写入 `user_hero_fragment`，不是 `user_bag`；
  - 当前 Cocos 背包只在前端把 `GET /api/player/heroes/fragments/list` 聚合成“英雄碎片”分组展示，不改存储结构；
  - 大厅资料 `GET /api/player/me/lobby` 新增只读 `gold` / `diamond` 字段，读取 `user_currency` 当前余额，缺失账户按 0 展示，不调用补建或写账逻辑；
  - 新增玩家只读卡池展示详情 `GET /api/player/gacha/pools/{poolCode}/detail`，复用现有卡池详情结构给 Cocos 展示概率、保底、重复转碎片规则和池项；
  - `PlayerApiPhaseGate` 仅放行该新增 GET，仍阻断 exchange/reissue/bag use/sell/hero growth。
- Cocos 前端更新：
  - 大厅 HUD 与 Gacha 顶栏的金币、钻石均从 `PlayerLobbyProfileVO.gold/diamond` 展示，不再使用 `3,456K`、`8,888`、`2,450` 等硬编码假值；
  - `LobbyBagLoader` 并行读取背包与英雄碎片，碎片以 `HERO_FRAGMENT:{heroCode}` 伪条目进入“英雄碎片”分组；
  - 点击碎片“查看来源”时显示本地只读说明：来源为重复抽到同名英雄自动转化，不调用背包物品来源接口；
  - Gacha 右侧按钮从状态提示升级为全屏逻辑页：`gachaInfo` 概率/保底、`gachaRecord` 记录、`gachaExchange` 兑换说明、`gachaPoolContent` 奖池内容；
  - 概率/保底合并页读取卡池详情与当前玩家 pity；记录页读取 `GET /api/player/gacha/logs`；兑换页只展示说明和禁用按钮；奖池内容页展示当前卡池英雄/物品条目；
  - 真实 draw 成功后会重新读取大厅资料并刷新 Gacha 相关页面的顶部资产。
- 守卫同步：
  - `check:layout` 允许 `profile.gold/diamond` 只读展示与 `HeroApi.fragments()` 背包聚合；
  - `check:layout` 继续阻断假资产值、`/api/player/gacha/exchange`、`/api/player/gacha/reissue`、`/api/player/bag/use`、`/api/player/bag/batch-use`、`/api/player/bag/sell`；
  - `check:preview` 已加入 Gacha 子页、碎片聚合和资产刷新 token。
- 当前验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - 后端 `PlayerApiPhaseGateTest,PlayerLobbyAdventureServiceImplTest,PlayerLobbyProfileServiceTest` 通过：7 tests；
  - 两个仓库 `git diff --check` 通过，仅有既有 LF/CRLF warning；
  - `npm.cmd run check:preview` 仍失败，运行中的 Cocos Preview 继续服务旧 chunk，缺少 `renderGachaActionScene`、`this.heroApi.fragments()`、`GachaActionScenePanel_` 等本轮 token，需要重开/刷新 Cocos Creator Preview 后复验；
  - 后端 Maven 仍提示本机 `C:\Users\axian\.m2\settings.xml` 第 61 行格式 warning，但聚焦测试通过。
- 边界不变：没有修改概率、权重、保底、消耗、奖励、重复转碎片规则、`gacha_pool_item` 或 EX V1；没有新增兑换、补发、背包使用/出售、英雄养成或其它经济写入口。

## 2026-06-02 Stage 4BW Gacha Result Back Button Fix

- 用户反馈：召唤结果页左上角返回箭头点击无反应。
- 定位结论：
  - 主召唤页 `render()` 被误绑定成 `GachaResultBackButton` 与 `closeGachaMockResultScene()`，导致主页面返回逻辑串到结果页；
  - 结果页 `renderResultScene()` 先绘制顶部返回栏、后绘制全屏结果内容层，后绘制的 `GachaResultScenePanel` / backdrop 可能覆盖并拦截左上角返回按钮点击。
- Cocos 前端修复：
  - 主召唤页恢复默认 `GachaBackButton -> closeGachaScene()`；
  - 结果页先绘制背景和结果内容，再最后绘制 `GachaResultBackButton -> closeGachaMockResultScene()`，标题保持“召唤结果”，确保返回按钮位于最上层；
  - `scripts/check-layout.mjs` 增加结构守卫：主召唤页不得包含结果页返回按钮/关闭结果页逻辑，结果页必须在内容层之后绘制结果返回栏；
  - `scripts/check-preview-freshness.mjs` 增加结果页返回按钮 token，便于识别运行中的 Cocos Preview 是否仍在服务旧 chunk。
- 边界不变：本次只修复 Cocos Gacha 结果页返回按钮层级与绑定，不修改后端、SQL、概率、权重、保底、消耗、奖励、重复转碎片、卡池、EX V1，也不新增任何经济写入口。

## 2026-06-03 Stage 4BX Unified Scene Back Header

- 当前继续以 Cocos-only 前端为准，不回到 web-vue。
- 用户要求：左上角返回按钮替换为高质量 UI，并在右侧显示当前全屏场景标题，例如召唤、英雄、背包。
- Cocos 前端更新：
  - 新增高清透明返回按钮素材 `assets/resources/ui/common/scene_back_button.png`，并添加对应 Cocos `.meta`；
  - `UiSceneBackButton.ts` 统一加载 `ui/common/scene_back_button/spriteFrame`，加载失败时保留暗金描边 fallback；
  - `renderSceneBackButton()` 新增 `titleText`，返回按钮右侧渲染 `SceneBackTitle`；
  - 召唤、召唤结果、召唤仪式、Gacha 右侧子页、英雄、英雄详情、背包、图鉴、冒险、编队、公告、资料、战斗、占位功能页均接入统一标题；
  - `UiSpriteFrameCache` 预加载新返回按钮素材，降低首次进入全屏场景时的闪烁风险。
- 守卫同步：
  - `scripts/check-layout.mjs` 增加新按钮素材存在性、PNG 尺寸、spriteFrame meta、标题节点和新坐标 token；
  - `scripts/check-preview-freshness.mjs` 增加 `SCENE_BACK_BUTTON_ASSET`、`SceneBackButtonArt`、`SceneBackTitle` 等运行时 freshness token。
- 边界不变：本阶段只改 Cocos 前端 UI 资产、标题和本地守卫脚本；不修改后端、SQL、抽卡概率/权重/保底/消耗/奖励/重复转碎片/卡池规则，不开放 EX V1，不新增任何经济写入口。
## 2026-06-03 Stage 4BY Lobby Hidden Chat/Right Rail And Compact Gacha Action Panels

- 当前继续以 Cocos-only 前端为准，不回到 web-vue。
- 用户要求：
  - 世界聊天隐藏，当前不开放；
  - 大厅右侧按钮全部隐藏；
  - 召唤界面右侧按钮打开的新界面内容太少时不要铺满全屏，改成较小的非全屏面板。
- Cocos 前端更新：
  - `LobbyHudRenderer.ts` 增加 `SHOW_LOBBY_WORLD_CHAT=false` 与 `SHOW_LOBBY_RIGHT_CHALLENGE_RAIL=false`；
  - 宽屏大厅不再渲染 `LobbyChallengeRail` 右侧挑战卡片；
  - 底部大厅不再渲染 `LobbyChatPreview` 世界聊天条；
  - 小屏快捷入口过滤聊天项，避免聊天从紧凑入口出现；
  - 大厅下一目标布局不再为隐藏的右侧挑战栏预留空间；
  - `GachaSceneRenderer.ts` 的 Gacha 右侧功能页改为 `resolveActionPanelFrame()` 自适应居中面板，概率/兑换等内容少的页不再接近全屏；
  - Gacha 兑换说明页为底部禁用按钮预留列表空间，避免内容和按钮挤压。
- 守卫同步：
  - `scripts/check-layout.mjs` 增加大厅聊天/右侧挑战栏关闭 token，以及 Gacha 小面板尺寸计算 token；
  - `scripts/check-preview-freshness.mjs` 增加相同 freshness token，用于识别 Preview 是否仍在服务旧 chunk。
- 边界不变：本阶段只改 Cocos 前端显示与本地守卫脚本；不修改后端、SQL、抽卡概率/权重/保底/消耗/奖励/重复转碎片/卡池规则，不开放 EX V1，不新增任何经济写入口。

## 2026-06-03 Backend Hero Template Text Repair

- 用户反馈后台 `hero_template` 中新增英雄/主角模板出现大量 `????`。
- 当前定位：Cocos 侧无需改资源路径；SQL 源文件中的中文正常，实际本地 MySQL 数据因非 utf8mb4 客户端导入被写坏。
- 后端已新增并执行 `D:\project\LootChain\sql\18_hero_template_text_encoding_fix.sql`，只修复 `hero_template` 展示字段。
- 已修复模板：
  - `PROTAGONIST_MALE_ATTACK` / `PROTAGONIST_FEMALE_ATTACK`；
  - `UR_SERAPHINA` / `UR_NYX` / `UR_AURELIA` / `UR_ATLAS`。
- 后端 `sql/05_hero_module.sql`、`sql/12_protagonist_module.sql`、`sql/15_hero_roster_art_refresh.sql` 已补 `SET NAMES utf8mb4;`，后续重新导入时应继续使用 `mysql --default-character-set=utf8mb4`。
- 本地复验：受影响 6 条 `????` 计数为 `0`；`UR_ARTHAS`、`UR_EVELYN` 保持正常。
- 边界不变：没有改 Cocos 经济入口，没有改 `gacha_pool_item`、概率、权重、保底、消耗、奖励、重复转碎片、EX V1 或任何新增经济写入口。

## 2026-06-03 Stage 4BZ Gacha Action Modal And Pool Display Config Sync

- 用户要求：召唤页右侧 `概率保底`、`记录`、`兑换`、`奖池内容` 不再切换到全屏新界面，改为召唤页内弹框；点击空白关闭，右上角提供关闭按钮。
- Cocos 前端更新：
  - `GachaSceneState` 新增 `activeAction`，右侧按钮只设置页内弹框状态，`currentView` 保持 `gacha`；
  - `GachaSceneRenderer` 新增 `GachaActionModalOverlay_*`，遮罩吞输入，点击遮罩空白关闭；
  - 弹框右上角接入新生成高清关闭按钮 `assets/resources/ui/common/modal_close_button.png`；
  - 左侧卡池 logo 槽现在优先加载后端 `logoAsset` 对应的 spriteFrame，加载失败才显示文字兜底；
  - 新增默认 logo 资源：`ui/gacha/logo_limited`、`ui/gacha/logo_hero`、`ui/gacha/logo_normal`、`ui/gacha/logo_locked`；
  - 召唤页停留期间每 15 秒重新拉取一次 `GET /api/player/gacha/pools`，后台修改 `logo_asset` 或 `center_spine_resource` 后，前端下一轮刷新会重绘。
- 后端核查：
  - 左侧卡池列表已由 `GET /api/player/gacha/pools` 拉取；
  - 展示配置表是 `gacha_pool_display_config`；
  - 已有字段覆盖 `logo_asset`、`theme_color`、`center_spine_resource`、`center_spine_uuid`、`center_spine_skin`、`center_intro_animation`、`center_idle_animation`、右侧说明、按钮文案、锁定/可抽标记；
  - 本轮不需要新增玩家侧接口或新增展示配置表。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - 数据库确认 `gacha_pool_display_config` 默认 4 条展示配置均有 logo 与 center Spine 路径。
- 边界不变：未新增兑换、补发、背包使用/出售、英雄养成或其它经济写入口；未修改概率、权重、保底、消耗、奖励、重复转碎片、`gacha_pool_item` 或 EX V1。

## 2026-06-03 Stage 4CA Spine 资源冲突清理与英雄 UUID 绑定

- 用户反馈：刚向 `assets/resources/spine/hero`、`assets/resources/spine/gacha` 新增大量素材后，Cocos 控制台提示需要调整目录结构以避免动态加载异常；同时要求 `hero_template` 增加骨骼动画 uuid 绑定，仅更新启用英雄。
- 日志读取：
  - 已读取 `D:\project\lootchain-cocos\temp\logs\project.log`；
  - 最新相关 warning 指向 `.atlas` 与同 basename `.spine` 在 `resources` 下产生相同动态加载 URL，例如 `spine/hero/npc_1006/npc_1006`；
  - 这是 Cocos `resources` 动态加载路径冲突，不是经济或卡池配置问题。
- 资源处理：
  - 运行时 `assets/resources/spine` 仅保留 `.skel` 或 `.json` 加 `.atlas`/贴图；
  - `.spine` 源文件和重复的旧 `hunka_nima.skel` 已移至 `docs/spine-source-archive/`；
  - 扫描确认 `.atlas/.json/.skel/.spine` 动态加载分组 `conflictCount=0`。
- Cocos 前端：
  - `LobbyHeroTypes`、`LobbyCodexTypes`、`HeroTypes` 增加 `spineUuid`；
  - `LobbyHeroApi`、`LobbyCodexApi` 透传 `spineUuid`；
  - `LobbyHeroDetailPanelRenderer` 优先 `assetManager.loadAny({ uuid })` 加载 `sp.SkeletonData`，失败时回退到 `resources.load('spine/hero/{spineAsset}/{spineAsset}')`；
  - 英雄详情仍为只读展示，不新增升级、升星、觉醒、装备、领取、资源变更或经济写入口。
- 后端/数据库同步：
  - 已执行 `D:\project\LootChain\sql\21_hero_spine_uuid.sql`；
  - 本地 `lootchain.hero_template` 新增/确认 `spine_uuid` 字段；
  - 仅 `status=1` 的 22 个启用英雄写入 `spine_uuid`；
  - 复验 `enabled_missing_uuid=0`、`disabled_with_uuid=0`、`enabled_uuid_count=22`；
  - 数据库 `spine_uuid` 与 Cocos `assets/resources/spine/hero/{spineAsset}/{spineAsset}.skel.meta` uuid 一一比对通过：`checked=22`、`errors=0`。
- 验证：
  - `npm.cmd run check:layout` 通过；
  - focused Cocos Creator TypeScript no-emit 通过；
  - 后端聚焦单测 `PlayerApiPhaseGateTest,PlayerLobbyAdventureServiceImplTest,PlayerLobbyProfileServiceTest,GachaPoolServiceImplTest,PlayerLobbyHeroServiceImplTest` 通过，15 tests；
  - `mvn.cmd --no-transfer-progress -pl lootchain-admin,lootchain-game -am -DskipTests compile` 通过；
  - 两个仓库 `git diff --check` 通过，仅有既有 LF/CRLF warning；
  - `npm.cmd run check:preview` 仍失败，原因是运行中的 Cocos Preview 继续服务旧 chunk，需要重开/刷新 Creator Preview 并等待资源重新导入后复验画面。
- 边界不变：本阶段只处理 Cocos Spine 资源结构、英雄展示元数据和只读接口字段；不修改 `gacha_pool_item`、概率、权重、保底、消耗、奖励、重复转碎片、EX V1、兑换/补发、背包使用/出售、英雄养成或任何新增经济写入口。

## 2026-06-03 Stage 4CB Preview 固定主场景修复

- 用户反馈 Cocos Preview 顶部报错：`无法查到当前场景 JSON 数据(start_scene) = current_scene`。
- 定位：
  - `D:\project\lootchain-cocos\temp\logs\project.log` 在 18:15 记录同一错误；
  - `assets/main.scene` 与 `assets/main.scene.meta` 正常存在，主场景 uuid 为 `623f777a-eb33-4d74-ae88-eb79e749fcfe`；
  - `profiles/v2/packages/preview.json` 中 `general.start_scene` 原值为 `current_scene`，当 Creator 没有可解析的当前场景上下文时，Preview 服务端无法拿到场景 JSON。
- 修复：
  - `profiles/v2/packages/preview.json` 改为固定 `start_scene=623f777a-eb33-4d74-ae88-eb79e749fcfe`；
  - `scripts/check-layout.mjs` 新增守卫：读取 `assets/main.scene.meta` 与 `profiles/v2/packages/preview.json`，要求 Preview 启动场景始终等于主场景 uuid，避免回退到 `current_scene`；
  - 新加的 `act_1012` / `npc_1012`、`act_1046` / `npc_1046` `.spine` 源文件已移到 `docs/spine-source-archive/preview-start-scene-fix-20260603/`，运行时 `assets/resources/spine` 继续保持无 `.spine` 源文件。
- 验证：
  - `http://localhost:7456/settings.js?scene=current_scene` 返回 200；
  - `http://localhost:7456/?scene=623f777a-eb33-4d74-ae88-eb79e749fcfe` 返回 200；
  - `npm.cmd run check:layout` 通过；
  - Spine 动态加载冲突扫描：`fileCount=102`、`conflictCount=0`。
- 边界不变：本阶段只改 Cocos Preview 本地配置、检查脚本和资源源文件归档；不修改后端、SQL、抽卡概率、卡池条目、权重、保底、消耗、奖励、重复转碎片、EX V1 或任何新增经济写入口。
