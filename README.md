# LootChain Cocos Client

LootChain 玩家游戏前端。当前阶段的登录页、UI、按钮、弹框、输入框、状态提示、背景和动态特效全部在 Cocos Creator 内实现，不再使用 HTML、Vue、CSS 或 H5 作为登录验收路径。

## 当前路线

- Cocos Creator 负责登录页完整内容：背景、粒子、UI、弹框和 `dev-login` 联调。
- `web-vue` 仅作为历史实验目录保留，不作为当前阶段验收入口；除非用户明确要求，不再修改或运行它。
- 当前流程为 Cocos 登录页 -> 资源加载进度页 -> 大厅背景页 + 大厅 HUD 阶段 1。
- 登录成功后先加载 `assets/resources/lobby` 下的大厅资源，资源准备完成后进入大厅背景界面，并展示左上玩家信息入口。
- 大厅阶段 1 使用 poster 背景优先；暂不启用 Cocos Web Preview 的原生 `VideoPlayer` 背景，避免视频层覆盖 HUD。
- 所有叠在背景上的 UI 元素必须使用 `LootChainGameRoot.resolveLayout()` 计算出的舞台安全区定位，不能写死屏幕坐标；`check:layout` 会按多种分辨率校验关键 HUD 不越界。
- 左上玩家信息已按参考图方向深化为徽章式铭牌：头像徽章、EXP 小牌、等级/名称/战力三层排版、名称徽记和暗金细线底纹。
- 左上铭牌返修后，左对齐文字按文本框左边界布局，头像框改为低饱和暗金属风格，不再使用卡通化放射三角。
- 左上铭牌主体已切换为高质量图片资产 `assets/resources/ui/lobby/lobby_player_info_panel.png`，Cocos 只动态覆盖等级、名称、战力和 EXP 文本。

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
D:\business\project\lootchain-cocos
```

3. 打开 `assets/main.scene`。
4. 确认 Canvas 下挂载 `LootChainGameRoot`，背景和粒子节点保留在场景中。
5. 点击编辑器预览运行。

## 后端联调

本地联调要求后端 `lootchain-game` 运行在 `http://localhost:8081`，并打开本地模拟登录：

```powershell
cd D:\business\project\LootChain
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

- `D:\business\project\lootchain-cocos\README.md`
- `D:\business\project\lootchain-cocos\docs\current-chat-context.md`

涉及服务端启动、接口、规则或 SQL 的上下文，同时更新 `D:\business\project\LootChain` 下对应文档。

## 当前可用入口

- 主界面：左上 Logo、右侧“谕言 / 客服 / 公告 / 修复”占位按钮、一个“账号登录”按钮。
- 登录弹框：账号/邮箱、密码、进入游戏、第三方登录占位图标、协议勾选。
- 登录成功：进入资源加载进度页，加载完成后切换到大厅背景界面。
- 大厅阶段 1：左上玩家信息入口展示头像框、等级、名称、战力、EXP 标识；点击后打开玩家资料只读弹窗。

客户端只展示和发送请求，所有扣费、保底、发奖和道具消耗都以后端事务为准。
