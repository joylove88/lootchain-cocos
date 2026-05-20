# Web 与 H5 构建联调说明

## 目标

Cocos 客户端同时面向：

- 桌面 Web：PC 浏览器访问。
- H5：手机浏览器访问。

当前非战斗 UI 实现为同一套 Vue/HTML/CSS 工程，通过响应式布局切换桌面 Web / H5 窄屏布局。Cocos Creator 保留为后续战斗场景承载。

当前第一阶段只验收登录页；大厅、抽卡、英雄、背包等页面在登录验收通过后再进入下一阶段。

## Vue Web/H5 运行

```powershell
cd D:\project\lootchain-cocos\web-vue
npm install
npm run dev
```

访问：

```text
http://localhost:7460
```

质量检查：

```powershell
npm run typecheck
npm run build
```

## 运行时适配

- `web-vue/src/api/playerAuth.ts` 会根据当前浏览器访问域名推导默认后端地址。
- PC 本机访问时默认使用 `http://localhost:8081`。
- 手机 H5 访问局域网预览页时，默认使用 `http://当前访问域名:8081`，避免手机浏览器把 `localhost` 解析成手机自身。
- 登录页仍保留 API 地址输入框，可手动覆盖接口地址。
- Web/H5 当前阶段不显示也不开放任何真实经济写入按钮。
- 登录页使用 CSS 媒体查询适配桌面宽屏和手机竖屏。
- 登录页已关闭全屏 Canvas 2D 粒子/火焰动效，避免高分屏和低端设备卡顿；动态特效后续走 Cocos 特效层或正式序列帧/粒子资源。

## Cocos Creator 构建

需要安装 Cocos Creator 3.x，建议 3.8 LTS。

用 Dashboard 打开：

```text
D:\project\lootchain-cocos
```

当前 Cocos 工程仅作为后续战斗阶段预留。战斗阶段开始后，构建建议：

1. 桌面 Web：使用 Web Desktop / Web 构建目标。
2. H5：使用 Web Mobile / Mobile Web 构建目标。
3. 本地联调时启动 `lootchain-game` 在 `http://localhost:8081`，并启用本地联调配置：

登录页特效层已预置 `assets/scripts/scenes/LootChainLoginEffectLayer.ts`。如需在 Cocos 中预览，可在 Canvas 下创建 `LoginEffectLayer` 节点并挂载该组件；该层只负责透明 VFX，不承载登录按钮和接口逻辑。后续将 Vue 登录 UI 与 Cocos WebGL 特效层整合时，仍要保持登录接口和按钮逻辑在 Vue UI 层。

```powershell
cd D:\project\LootChain
mvn -pl lootchain-game spring-boot:run "-Dspring-boot.run.profiles=local"
```

`local` profile 会打开模拟登录和本地 Web/H5 预览所需的 CORS；默认配置仍保持模拟登录关闭。

## H5 联调注意事项

- 手机和电脑需要在同一局域网。
- 手机访问 Cocos 预览地址时不要使用 `localhost`，应使用电脑局域网 IP。
- 如果浏览器报跨域错误，先确认 `lootchain-game` 是否使用 `local` profile 启动；手机 H5 还需要确认 Windows 防火墙允许手机访问电脑的 `8081` 端口。
- H5 生产环境建议走 HTTPS；若 HTTPS 页面请求 HTTP 后端，浏览器会拦截 mixed content。
- 当前只接入 `/api/player/**` 玩家接口，不接入后台、资金池、链上、USDT 直接领取等入口。
- 第一阶段只在 UI 上开放 `POST /api/player/auth/dev-login`。
- 真实抽卡会扣费和发奖；只有准备好专门测试账号、测试卡池、余额和清理策略后，才允许临时打开 `enableWriteActions`。

## 当前未完成

本机暂未发现 Cocos Creator CLI 或编辑器，因此还不能验证：

- 编辑器内 TypeScript 编译。
- 场景预览。
- Web Desktop 构建产物。
- Web Mobile / H5 构建产物。

## 第一阶段登录验收

1. 使用 `local` profile 启动 `lootchain-game`。
2. 打开 Vue Web/H5 预览页：`http://localhost:7460`。
3. API 地址保持 `http://localhost:8081`，手机 H5 使用电脑局域网 IP 对应的 `8081`。
4. 输入本地测试 `User ID`，默认 `1`。
5. 点击登录后，确认请求命中 `/api/player/auth/dev-login` 并返回 `code=0`。
6. 页面显示登录成功或登录验收通过状态。
