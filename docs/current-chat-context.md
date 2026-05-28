# LootChain Cocos 当前聊天窗口交接上下文

更新时间：2026-05-28

本文用于其他 Codex 窗口快速接手当前阶段。先读本文件，再按 LootChain 规则读取服务端 `D:\project\LootChain` 下的 `AGENTS.md`、`AI_RULE.md`、`PROJECT_CONTEXT1.md`、`PROJECT_CONTEXT2.md`、`docs/`、`sql/`、`team-history/CURRENT_PROGRESS.md`。

## 当前目标

- 游戏前端当前阶段是 Cocos-only 登录页。
- 不再使用 `web-vue` 作为当前验收路径；`web-vue` 仅为历史实验目录。
- 当前验收入口是 Cocos Creator 3.8.8 的 `D:\project\lootchain-cocos\assets\main.scene`。
- 登录阶段只接入玩家 `dev-login`。
- dev-login 成功后进入 Cocos 资源加载进度页，加载 `assets/resources/lobby` 下的大厅背景资源。
- 加载完成后切换到大厅背景界面；当前大厅只展示背景与资源就绪状态，不开放抽卡、英雄、背包、USDT、资金池或任何经济写入口。

## 硬规则

- 不允许改变游戏经济规则。
- EX 英雄 V1 只预埋，不开放获取。
- USDT 奖励必须后台审核。
- 资金池每日释放限制保持 0.5%~1%。
- 后端 Controller 返回 `Result<T>`，不返回 Entity，必须使用 DTO/VO。
- 后台前端如需修改，只能改 `D:\project\lootchain-admin\apps\web-antd`。
- 当前 Cocos 登录页工作只改 `D:\project\lootchain-cocos`。

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
   - 大厅界面当前不放抽卡、英雄、背包等功能按钮。
9. `scripts/check-layout.mjs` 已补充当前阶段门禁：
   - 校验 `assets/main.scene` JSON。
   - 校验登录根脚本不调用 `this.api.gacha`、`this.api.hero`、`this.api.bag`，不出现抽卡/英雄/背包写入口路径。
   - 校验旧 token 清理、第三方占位、密码输入保护、资源加载页和大厅背景页仍保留。

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

`D:\project\lootchain-cocos` 当前有未提交变更：

- `assets/main.scene`
- `assets/resources/login-bg/scripts/login/LoginVideoBackground.ts`
- `assets/scripts/scenes/LootChainGameRoot.ts`
- `scripts/check-layout.mjs`
- `README.md`
- `agents/frontend.md`
- `docs/api-contract.md`
- `docs/art-vfx-pipeline.md`
- `docs/login-vfx-final-plan.md`
- `docs/ui-style-guide.md`
- `docs/web-h5-build.md`
- `settings/v2/packages/cocos-service.json`
- `assets/resources/lobby.meta`
- `assets/resources/lobby/`
- `assets/resources/login-bg-h5.meta`
- `assets/resources/login-bg-h5/`
- `docs/current-chat-context.md`
- `docs/ui-reference/dragonheir/lobby/lobby2.png`

注意：其中不全是本窗口新改内容，其他窗口接手时不要随意 revert 用户或 Cocos 编辑器生成的变更。

`D:\project\LootChain` 当前 `git status --short` 为空。

## 已跑过的检查

Cocos 项目检查：

```powershell
cd D:\project\lootchain-cocos
npm run check:layout
```

结果：通过，输出 `layout ok`。

本轮补充：`check:layout` 现在还会执行 Cocos-only 阶段门禁检查，确认登录根脚本没有调用抽卡、英雄、背包写入口，并确认 loading/lobby 流程仍存在。

Cocos TS 检查：

```powershell
$tsc = 'D:\project\lootchain-cocos\web-vue\node_modules\typescript\bin\tsc'
node $tsc --target ES2020 --module ESNext --moduleResolution Node --experimentalDecorators --skipLibCheck --noEmit --types D:\project\lootchain-cocos\temp\declarations\cc D:\project\lootchain-cocos\assets\scripts\scenes\LootChainGameRoot.ts D:\project\lootchain-cocos\assets\scripts\app\AppConfig.ts D:\project\lootchain-cocos\assets\scripts\api\LootChainApi.ts D:\project\lootchain-cocos\assets\scripts\net\HttpClient.ts D:\project\lootchain-cocos\assets\scripts\store\TokenStore.ts D:\project\lootchain-cocos\assets\resources\login-bg\scripts\login\LoginVideoBackground.ts
```

结果：通过。

本轮补充：已额外对 `assets/scripts/` 与 `assets/resources/login-bg/scripts/` 下全部 TypeScript 执行 Cocos 声明检查，结果通过。

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

推荐用两步启动：

```powershell
Set-Location D:\project\LootChain
mvn -pl lootchain-game -am -DskipTests install
mvn -f lootchain-game\pom.xml spring-boot:run "-Dspring-boot.run.profiles=local"
```

启动成功应看到：

```text
The following 1 profile is active: "local"
Tomcat started on port 8081
```

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

- 用户的 `C:\Users\axian\.m2\settings.xml` 第 61 行附近存在 XML 格式 warning：

```text
expected START_TAG or END_TAG not TEXT ... settings.xml, line 61, column 15
```

这不是上次 `spring-boot:run` 失败主因，但后续建议修复 Maven settings，避免依赖解析异常。

## 后续接手建议

1. 如果继续处理登录页视觉，优先在 Cocos Creator Preview 中验证，不要回到 `web-vue`。
2. 如果处理接口联调，先确认 `lootchain-game` 8081、Redis 6379、MySQL 3306 都在线。
3. 如果要更新进度，使用服务端仓库的 `D:\project\LootChain\team-history\CURRENT_PROGRESS.md`，但只有阶段完成时再更新。
4. 对 Cocos 场景文件谨慎处理，Cocos 编辑器会产生 `assets/main.scene` 和 settings 变更，不要未经确认回滚。
