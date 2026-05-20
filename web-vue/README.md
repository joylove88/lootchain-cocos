# LootChain Web/Vue Game Shell

这是 LootChain 玩家端 Web/H5 UI 壳。当前只实现第一阶段登录页，Cocos 工程保留给后续战斗场景。

## 运行

```powershell
cd D:\project\lootchain-cocos\web-vue
npm install
npm run dev
```

打开：

```text
http://localhost:7460
```

后端玩家服务需使用 `local` profile 启动在 `http://localhost:8081`：

```powershell
cd D:\project\LootChain
mvn -pl lootchain-game spring-boot:run "-Dspring-boot.run.profiles=local"
```

## 当前范围

- 只开放账号登录按钮，对接 `POST /api/player/auth/dev-login`。
- 邮箱登录、钱包登录、右侧入口、社交登录均为 UI 占位，只提示“功能即将开放”。
- 不开放大厅、抽卡、英雄、背包等入口。
- 不接入任何扣费、发奖、USDT、资金池或链上领取操作。
