# LootChain Cocos 当前聊天窗口交接上下文

更新时间：2026-05-28

本文用于其他 Codex 窗口快速接手当前阶段。先读本文件，再按 LootChain 规则读取服务端 `D:\business\project\LootChain` 下的 `AGENTS.md`、`AI_RULE.md`、`PROJECT_CONTEXT1.md`、`PROJECT_CONTEXT2.md`、`docs/`、`sql/`、`team-history/CURRENT_PROGRESS.md`。

## 当前目标

- 游戏前端当前阶段是 Cocos-only 登录页。
- 不再使用 `web-vue` 作为当前验收路径；`web-vue` 仅为历史实验目录。
- 当前验收入口是 Cocos Creator 3.8.8 的 `D:\business\project\lootchain-cocos\assets\main.scene`。
- 登录阶段只接入玩家 `dev-login`。
- dev-login 成功后进入 Cocos 资源加载进度页，加载 `assets/resources/lobby` 下的大厅背景资源。
- 加载完成后切换到大厅背景界面；当前大厅只展示背景与资源就绪状态，不开放抽卡、英雄、背包、USDT、资金池或任何经济写入口。

## 硬规则

- 不允许改变游戏经济规则。
- EX 英雄 V1 只预埋，不开放获取。
- USDT 奖励必须后台审核。
- 资金池每日释放限制保持 0.5%~1%。
- 后端 Controller 返回 `Result<T>`，不返回 Entity，必须使用 DTO/VO。
- 后台前端如需修改，只能改 `D:\business\project\lootchain-admin\apps\web-antd`。
- 当前 Cocos 登录页工作只改 `D:\business\project\lootchain-cocos`。

## 文档更新约定

- 每次阶段性上下文或代码变更完成后，必须同步更新对应项目文档。
- Cocos-only 登录页、资源加载、大厅背景、场景布局、预览验证、检查脚本等上下文，优先更新本文件和 `D:\business\project\lootchain-cocos\README.md`。
- 涉及服务端启动、接口、规则、SQL 或后端联调上下文时，同时更新 `D:\business\project\LootChain` 下对应文档。
- 不要只改代码不更新交接文档；下一窗口需要先从本文恢复当前阶段。

## 近期已完成的 Cocos 登录页调整

1. 登录 UI 已放在 Cocos `assets/main.scene` 中，由 `LootChainGameRoot` 生成登录按钮、弹框、协议勾选、右侧入口占位和登录成功状态。
2. 鼠标悬浮在可点击按钮上时已切换为小手 cursor。
   - 文件：`D:\business\project\lootchain-cocos\assets\scripts\scenes\LootChainGameRoot.ts`
   - 关键方法：`applyPointerCursor()`、`setPointerCursor()`。
3. 登录背景视频已支持按运行环境自动切换：
   - PC / 横屏：`D:\business\project\lootchain-cocos\assets\resources\login-bg`
   - 手机 / 竖屏：`D:\business\project\lootchain-cocos\assets\resources\login-bg-h5`
   - 文件：`D:\business\project\lootchain-cocos\assets\resources\login-bg\scripts\login\LoginVideoBackground.ts`
   - 判定逻辑：`sys.isMobile || view.getVisibleSize().height > view.getVisibleSize().width` 时使用 H5 资源。
4. H5 新增资源目录：
   - `D:\business\project\lootchain-cocos\assets\resources\login-bg-h5\login_bg_loop.mp4`
   - `D:\business\project\lootchain-cocos\assets\resources\login-bg-h5\login_bg_loop_raw.mp4`
   - `D:\business\project\lootchain-cocos\assets\resources\login-bg-h5\login_bg_poster.jpg`
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

## 当前工作区状态

`D:\business\project\lootchain-cocos` 当前有未提交变更：

- `scripts/check-layout.mjs`
- `README.md`
- `docs/current-chat-context.md`
- `settings/v2/packages/cocos-service.json`

注意：其中不全是本窗口新改内容，其他窗口接手时不要随意 revert 用户或 Cocos 编辑器生成的变更。

`D:\business\project\LootChain` 当前有本轮新增的本地游戏服启动脚本与文档变更；详见服务端仓库 `README.md`、`docs/local-game-server-start.md`、`team-history/CURRENT_PROGRESS.md`。

## 已跑过的检查

Cocos 项目检查：

```powershell
cd D:\business\project\lootchain-cocos
npm.cmd run check:layout
```

结果：通过，输出 `layout ok`。

本轮补充：`check:layout` 现在还会执行 Cocos-only 阶段门禁检查，确认登录根脚本没有调用抽卡、英雄、背包写入口，并确认 loading/lobby 流程仍存在；同时检查登录页 UI 没有回退到固定舞台常量，Logo、右侧按钮、主登录按钮仍在背景舞台内。

Cocos TS 检查：

```powershell
$tsc = 'D:\business\project\lootchain-cocos\web-vue\node_modules\typescript\bin\tsc'
node $tsc --target ES2020 --module ESNext --moduleResolution Node --experimentalDecorators --skipLibCheck --noEmit --types D:\business\project\lootchain-cocos\temp\declarations\cc D:\business\project\lootchain-cocos\assets\scripts\scenes\LootChainGameRoot.ts D:\business\project\lootchain-cocos\assets\scripts\app\AppConfig.ts D:\business\project\lootchain-cocos\assets\scripts\api\LootChainApi.ts D:\business\project\lootchain-cocos\assets\scripts\net\HttpClient.ts D:\business\project\lootchain-cocos\assets\scripts\store\TokenStore.ts D:\business\project\lootchain-cocos\assets\resources\login-bg\scripts\login\LoginVideoBackground.ts
```

结果：通过。

本轮补充：已额外对 `assets/scripts/` 与 `assets/resources/login-bg/scripts/` 下全部 TypeScript 执行 Cocos 声明检查，结果通过。

场景 JSON 校验：

```powershell
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('D:/business/project/lootchain-cocos/assets/main.scene','utf8')); console.log('main.scene json ok')"
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
Set-Location D:\business\project\LootChain
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
- 正式账号密码、钱包签名、邮箱验证码、第三方登录等玩家登录体系尚未落库；服务端文档 `D:\business\project\LootChain\docs\22-数据库设计.md` 已记录建议后续新增独立凭证/身份表，不把密码直接放入 `game_user`。

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
3. 如果要更新进度，必须同步更新本项目文档；涉及服务端时同时更新 `D:\business\project\LootChain\team-history\CURRENT_PROGRESS.md`。
4. 对 Cocos 场景文件谨慎处理，Cocos 编辑器会产生 `assets/main.scene` 和 settings 变更，不要未经确认回滚。

## 2026-05-28 大厅参考图产品拆解

- 用户提供 `D:\business\project\lootchain-cocos\docs\ui-reference\dragonheir\lobby\lobby.png` 作为后续游戏大厅对标参考。
- 已从产品视角拆解顶部玩家信息、资源栏、系统入口、左侧活动列表、中央场景热点、右侧挑战卡片、底部导航、聊天栏和主冒险入口。
- 已新增文档 `D:\business\project\lootchain-cocos\docs\lobby-feature-analysis.md`，记录各功能点、点击弹窗建议、开发清单、开发顺序和当前阶段边界。
- 当前仅做产品总结，不改代码，不开放 EX V1，不新增任何经济写入口。

## 2026-05-28 大厅开发阶段 1

- 当前大厅开发从阶段 1 开始，只实现“大厅背景壳 + 左上玩家信息只读展示 + 玩家资料只读弹窗”。
- `D:\business\project\lootchain-cocos\assets\scripts\scenes\LootChainGameRoot.ts` 新增 `renderLobbyHud()`、`renderLobbyPlayerInfo()`、`renderPlayerProfileDialog()`、`openPlayerProfileDialog()`、`closePlayerProfileDialog()`。
- 大厅左上玩家信息按背景舞台边界自适应，节点包括 `LobbyPlayerInfoButton`、`LobbyPlayerAvatar`、`LobbyPlayerName`、`LobbyPlayerLevel`、`LobbyPlayerPower`、`LobbyPlayerExpBadge`。
- 玩家资料弹窗节点包括 `LobbyProfileDim`、`LobbyProfilePanel`、`LobbyProfileCloseButton`；只展示资料，不提供写操作。
- 新增 Cocos API 文件 `assets/scripts/api/PlayerProfileApi.ts` 与类型 `assets/scripts/types/PlayerTypes.ts`，只读调用 `GET /api/player/me/lobby`。
- `scripts/check-layout.mjs` 已加入阶段 1 门禁，确认大厅资料节点、只读接口、弹窗布局状态 key 存在，并继续禁止抽卡、英雄、背包、领取、购买、提现、USDT 等入口进入根脚本。
- 服务端新增只读资料接口，详见 `D:\business\project\LootChain\team-history\CURRENT_PROGRESS.md`。
- Code Review 发现服务端 `PlayerProfileController` 需要排除出后台应用扫描；已在 `D:\business\project\LootChain\lootchain-admin\src\main\java\com\lootchain\bootstrap\AdminApplication.java` 加入排除，避免 admin 启动依赖玩家 Sa-Token Bean。
- 已执行 `npm.cmd run check:layout` 通过；后端 `PlayerLobbyProfileServiceTest` 通过；`mvn.cmd --no-transfer-progress -pl lootchain-admin,lootchain-game -am -DskipTests compile` 通过。
- 当前项目没有可用 TypeScript 编译器依赖，无法复跑独立 Cocos TS 声明检查；需在 Cocos Creator Preview 中做最终运行态确认。

### 2026-05-28 大厅 HUD 不显示修复

- 用户在 Cocos Preview 反馈大厅左上玩家信息没有显示。
- 排查后确认 `renderLobbyPlayerInfo()` 已执行渲染链，但大厅背景同时创建了全屏 `VideoPlayer` 节点；Cocos Web Preview 中原生视频层可能覆盖 Canvas UI，导致 HUD 被遮住。
- 已将 `USE_LOBBY_NATIVE_VIDEO_BACKGROUND` 设为 `false`，大厅阶段 1 使用 poster 背景优先，不再创建或强制加载原生视频背景，保证 `LobbyPlayerInfoButton`、资料弹窗等 HUD 在 Canvas 层可见。
- `scripts/check-layout.mjs` 已加入门禁，防止阶段 1 误开原生视频背景覆盖 HUD。

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
- 已在本地用 PowerShell/.NET 去除绿幕并裁剪成项目资源：`D:\business\project\lootchain-cocos\assets\resources\ui\lobby\lobby_player_info_panel.png`，尺寸 `1600x577`，四角 alpha 为 `0`。
- 已新增 Cocos 资源 meta：`assets/resources/ui/lobby.meta` 与 `assets/resources/ui/lobby/lobby_player_info_panel.png.meta`。
- `renderLobbyPlayerInfo()` 已切换为图片资产驱动，优先加载 `ui/lobby/lobby_player_info_panel/spriteFrame`，只保留等级、名称、战力、EXP 文字动态覆盖；图片加载失败时才使用 Graphics 兜底。
- 已移除代码层额外红点绘制，避免与图片资产自带红色菱形重复。
- `scripts/check-layout.mjs` 已加入图片资产存在性、资源常量和多分辨率尺寸公式校验。
