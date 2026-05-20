# LootChain Game Client

玩家游戏前端骨架，目标端为桌面 Web 与手机 H5。

当前路线：

- Vue/HTML/CSS 负责登录、大厅、背包、英雄、抽卡等非战斗 Web/H5 UI。
- Cocos Creator 负责登录动态特效预演，并保留为后续战斗场景、技能表现、Boss 镜头和实时战斗承载。
- 第一阶段只验收 Vue 登录页和 `dev-login` 联调，登录验收通过后再进入大厅阶段。

## 本阶段范围

- 第一阶段只交付登录页和 dev-login 联调。
- 只对接现有 `/api/player/**` 接口。
- 不修改游戏经济规则。
- 不开放 EX 获取。
- 不做 USDT 直接领取。
- 不直连 MySQL、Redis、RabbitMQ。
- 非战斗 UI 使用同一套 Vue 工程同时支持 Web 桌面端和 H5 端。
- Vue 登录页不再使用全屏 Canvas 2D 粒子动效，避免 Web/H5 卡顿；登录动态特效改由 Cocos 特效层或正式序列帧/粒子资源承载。
- Cocos 工程可作为登录特效预览入口，但不承载登录按钮和接口联调验收。

## Vue Web/H5 登录入口

```powershell
cd D:\project\lootchain-cocos\web-vue
npm install
npm run dev
```

默认访问：

```text
http://localhost:7460
```

本地联调要求后端 `lootchain-game` 运行在 `http://localhost:8081`，并打开本地模拟登录和跨域：

```powershell
cd D:\project\LootChain
mvn -pl lootchain-game spring-boot:run "-Dspring-boot.run.profiles=local"
```

## Cocos 打开方式

1. 安装 Cocos Creator 3.x，建议 3.8 LTS。
2. 用 Dashboard 打开本目录：`D:\project\lootchain-cocos`。
3. 当前 Cocos 工程仅作为后续战斗端预留；登录阶段不再要求把 `LootChainGameRoot.ts` 挂到 Canvas 做 UI 验收。

## Cocos 登录特效层

已预置登录页特效层原型：

```text
assets/scripts/scenes/LootChainLoginEffectLayer.ts
```

它只负责透明动态效果：云层、深渊红核心、红色光束、宝石光晕、火焰和灰烬。Vue 登录页仍负责按钮、状态和 `dev-login`，不再保留全屏 Canvas 2D 动效。若要在 Cocos 中预览特效，可在 Canvas 下创建空节点 `LoginEffectLayer`，挂载 `LootChainLoginEffectLayer` 组件。

美术资源、Spine/龙骨/序列帧/粒子/shader 的接入规范见 `docs/art-vfx-pipeline.md`。

Cocos Creator 3.x 以 `package.json` 和 `assets` 目录作为项目可打开的基础标记；`library`、`temp`、`profiles` 等目录由编辑器生成，不提交。

## Web/H5 适配

- 桌面 Web 使用宽屏布局。
- 手机 H5 使用窄屏布局。
- 视口变化时会自动重绘当前页面。
- API 默认地址会按当前浏览器域名推导：PC 本机为 `http://localhost:8081`，手机 H5 局域网访问时为 `http://当前访问域名:8081`。
- 默认关闭真实写入按钮；Web/H5 当前按登录联调验收。
- 详细构建与联调说明见 `docs/web-h5-build.md`。

## 当前可用入口

- 模拟登录：输入 `userId` 调用 `POST /api/player/auth/dev-login`。

登录验收通过后，再进入大厅制作阶段。抽卡、英雄、背包、队伍、装备、商店、副本、Boss、资金池等入口不属于第一阶段交付。

客户端只展示和发送请求，所有扣费、保底、发奖和道具消耗都以后端事务为准。
