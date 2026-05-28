# LootChain 玩家端接口契约

后端统一返回：

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

客户端必须先判断 `code === 0`，再读取 `data`。

## 阶段开放范围

当前 Cocos 客户端只开放登录请求：

- `POST /api/player/auth/dev-login`

本文件后续列出的抽卡、英雄、背包接口只是后端已存在的玩家侧契约，不代表当前 UI 可以开放。当前 Cocos 流程在 dev-login 成功后只进入资源加载进度页，并在大厅资源准备完成后展示大厅背景界面。

## 认证

- `POST /api/player/auth/dev-login`
  - body: `{ "userId": 1 }`
  - response data: `{ "tokenName": "player-token", "tokenValue": "..." }`

除 dev-login 外，所有 `/api/player/**` 请求都需要带登录接口返回的 token header。

当前默认只做登录联调。真实抽卡、英雄培养、背包使用/出售等写入口需要专项测试账号和清理策略后再显式接入。

## 抽卡

- `GET /api/player/gacha/pools`
- `GET /api/player/gacha/pools/{poolCode}`
- `GET /api/player/gacha/pity/{poolCode}`
- `POST /api/player/gacha/draw`
  - body: `{ "poolCode": "NORMAL_HERO", "requestId": "...", "drawCount": 1, "useTicket": false }`
- `GET /api/player/gacha/logs`

## 英雄

- `GET /api/player/heroes`
- `GET /api/player/heroes/{heroId}`
- `GET /api/player/heroes/fragments/list`
- `GET /api/player/heroes/codex`
- `POST /api/player/heroes/{heroId}/level-up`
- `POST /api/player/heroes/{heroId}/star-up`
- `POST /api/player/heroes/{heroId}/awaken`
- `POST /api/player/heroes/refine`

## 背包

- `GET /api/player/bag`
- `POST /api/player/bag/use`
- `POST /api/player/bag/batch-use`
- `POST /api/player/bag/sell`
- `GET /api/player/bag/items/{itemCode}/source`

## 当前缺口

- 正式注册/登录/邮箱登录/钱包登录未实现。
- 玩家 `/me`、等级、货币、体力总览接口未实现。
- 队伍、副本、Boss 玩家侧接口未实现。
- Cocos 本地预览跨域需要后端 CORS 或同源代理支持。
