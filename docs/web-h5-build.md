# Web/H5 历史说明

本文件只保留历史背景。当前登录阶段已经切换为 Cocos-only，不再使用 HTML、Vue、CSS 或 H5 作为验收路径。

## 当前有效入口

使用 Cocos Creator 3.8.x 打开：

```text
D:\project\lootchain-cocos
```

打开 `assets/main.scene` 后直接预览。登录页 UI、背景、动态特效和 `dev-login` 联调全部在 Cocos 场景内完成。

## 后端联调

```powershell
cd D:\project\LootChain
mvn -pl lootchain-game spring-boot:run "-Dspring-boot.run.profiles=local"
```

本地接口：

```text
POST http://localhost:8081/api/player/auth/dev-login
```

## 废弃内容

- `web-vue` 曾作为登录 UI 实验目录。
- 该目录不再作为当前阶段验收入口。
- 不再执行 `npm run dev`、`npm run build` 来验收登录页。
- 不再以手机 H5 适配作为第一阶段验收项。

## 第一阶段登录验收

1. 使用 `local` profile 启动 `lootchain-game`。
2. 在 Cocos Creator 中预览 `assets/main.scene`。
3. 点击主界面“账号登录”。
4. 在 Cocos 弹框内输入账号；数字账号会作为本地 `User ID`。
5. 点击“进入游戏”，确认请求命中 `/api/player/auth/dev-login` 并返回 `code=0`。
6. 场景进入资源加载进度页，加载完成后切换到大厅背景界面。
