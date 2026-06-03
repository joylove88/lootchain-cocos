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

当前 Cocos 客户端只开放登录请求、主角色初始化请求、只读大厅资料请求、只读大厅公告请求和只读大厅图鉴请求：

- `POST /api/player/auth/dev-login`
- `GET /api/player/protagonist/state`，只用于判断当前玩家是否已经创建主角色。
- `POST /api/player/protagonist`，只用于账号初始化创建主角色。客户端只传 `gender` 和 `protagonistName`；SSR 主角模板、属性、战力、`user_hero` 实例、唯一性和幂等都由后端控制。
- `GET /api/player/me/lobby`，只用于大厅玩家信息和资料弹窗只读展示，不写入任何经济或玩法状态。
- `GET /api/player/lobby/notices`，只用于大厅公告/活动面板只读展示，读取已发布且处于有效期内的公告配置，不领取奖励、不改变玩家状态、不写入经济数据。
- `GET /api/player/lobby/codex`，只用于大厅英雄图鉴面板只读展示，后端会过滤 EX/锁定内容，前端不提供升级、升星、觉醒、精炼、获取、领奖或任何经济写入口。
- `GET /api/player/lobby/heroes`，只用于大厅英雄队列只读展示，后端会把 `source_type=PROTAGONIST` 主角置顶并过滤 EX，前端不提供升级、升星、觉醒、精炼、抽卡、领取或任何经济写入口。

本文件后续列出的抽卡、英雄、背包接口只是后端已存在的玩家侧契约，不代表当前 UI 可以开放。当前 Cocos 流程在 dev-login 成功后先检查/创建主角色，再进入资源加载进度页，并在大厅资源准备完成后展示大厅背景与只读玩家信息。

## 认证

- `POST /api/player/auth/dev-login`
  - body: `{ "userId": 1 }`
  - response data: `{ "tokenName": "player-token", "tokenValue": "..." }`

除 dev-login 外，所有 `/api/player/**` 请求都需要带登录接口返回的 token header。

当前默认只做登录联调。真实抽卡、英雄培养、背包使用/出售等写入口需要专项测试账号和清理策略后再显式接入。

## 主角色

- `GET /api/player/protagonist/state`
  - response data:
    ```json
    {
      "created": true,
      "profile": {
        "userId": 1,
        "protagonistNo": "PG...",
        "gender": "male",
        "protagonistName": "圣契1",
        "rarity": "SSR",
        "currentForm": "attack",
        "attackUnlocked": true,
        "defenseUnlocked": false,
        "supportUnlocked": false,
        "userHeroId": 1001,
        "heroCode": "PROTAGONIST_MALE_ATTACK",
        "power": 8300
      }
    }
    ```
- `POST /api/player/protagonist`
  - body: `{ "gender": "male", "protagonistName": "圣契1" }`
  - response data: 同 `profile`。

约束：
- 该接口是账号初始化写入，不是经济入口。
- 客户端禁止传 `heroCode`、`rarity`、`level`、`star`、`power`、属性或任何奖励字段。
- 重复创建会返回已有主角色，不会生成第二个主角色或第二条主角英雄实例。
- 防御/辅助形态仍保持锁定，后续只能由主线进度/道具解锁链路打开。

## 大厅玩家资料

- `GET /api/player/me/lobby`
  - response data:
    ```json
    {
      "userId": 1,
      "displayName": "圣契1",
      "protagonistName": "圣契1",
      "username": "player001",
      "nickname": "账号昵称",
      "avatar": null,
      "playerLevel": 1,
      "exp": 0,
      "stamina": 100,
      "maxStamina": 120,
      "combatPower": 9432,
      "status": 1,
      "accountStatus": "正常",
      "walletBound": false,
      "walletAddress": null,
      "loginMethod": "dev-login"
    }
    ```

约束：
- 该接口只读，只服务大厅左上角玩家信息、资源栏和资料弹窗展示。
- `displayName` 的优先级是：已创建主角色名 -> 账号昵称 -> 登录用户名 -> `Player{userId}`。
- `protagonistName` 只来自当前登录玩家自己的 `player_protagonist`，前端不能传 `userId` 查询其他玩家资料。
- 该接口不创建主角、不改昵称、不扣体力、不写战力、不写背包/货币/奖励/进度。

## 大厅英雄队列

- `GET /api/player/lobby/heroes`
  - response data:
    ```json
    [
      {
        "id": 1001,
        "heroCode": "PROTAGONIST_MALE_ATTACK",
        "heroName": "圣契1",
        "rarity": "SSR",
        "level": 1,
        "star": 1,
        "power": 8300,
        "protagonist": true,
        "sourceType": "PROTAGONIST",
        "portraitAsset": "act_1001",
        "spineAsset": "npc_1001",
        "spineUuid": "7196cf65-7226-4546-8f38-b60935a6a97a",
        "currentForm": "attack",
        "formLabel": "攻击形态"
      }
    ]
    ```

约束：
- 该接口只读，不执行英雄升级、升星、觉醒、洗练、抽卡、发奖、购买、出售或结算。
- 主角由后端按 `protagonist=true` / `sourceType=PROTAGONIST` 置顶；前端也会再按主角标记排序。
- EX 稀有度和 `EX_` 英雄编码会在后端和前端双重过滤。
- `portraitAsset`、`spineAsset`、`spineUuid` 仅用于 Cocos 英雄详情资源展示；`spineUuid` 对应 Cocos `sp.SkeletonData` 资源 uuid，前端优先按 uuid 加载，失败时才按 `assets/resources/spine/hero/{spineAsset}/{spineAsset}` 路径兜底。
- 这些展示字段不代表获取来源、概率、奖励、消耗、碎片转换或任何经济语义。

## 大厅冒险主线只读壳

- `GET /api/player/lobby/adventure`
  - response data:
    ```json
    {
      "mode": "mainline",
      "readonly": true,
      "playerLevel": 3,
      "playerPower": 8300,
      "currentChapterCode": "CHAPTER_01",
      "currentChapterName": "暗影之堡",
      "recommendedStageCode": "MAIN_1_1",
      "recommendedStageName": "暗影城门",
      "recommendationText": "继续主线 1-1，当前阶段只展示章节与关卡信息。",
      "guardrails": ["只读展示，不写入主线进度", "不扣体力，不发放奖励", "不进入战斗结算，不开放 EX V1"],
      "chapters": [
        {
          "chapterCode": "CHAPTER_01",
          "chapterName": "暗影之堡",
          "subtitle": "第一章",
          "summary": "从破碎城门进入深渊边境，确认第一条主线推进路径。",
          "unlocked": true,
          "stages": [
            {
              "stageCode": "MAIN_1_1",
              "stageName": "暗影城门",
              "orderNo": 1,
              "unlocked": true,
              "recommended": true,
              "requiredLevel": 1,
              "recommendedPower": 7500,
              "enemySummary": "黑甲守卫 x3 / 裂隙侍从 x2",
              "rewardPreview": ["玩家经验", "金币", "低阶强化石"],
              "statusLabel": "推荐"
            }
          ]
        }
      ]
    }
    ```

约束：
- 该接口只读，只服务大厅 `冒险` 面板展示当前主线目标、章节、关卡、推荐战力、敌人摘要和掉落预览。
- 当前不保存主线进度，不保存编队，不创建战斗，不结算，不扣体力，不发放奖励。
- 掉落预览只是文案，真实奖励必须等后续战斗结算阶段由后端事务和奖励服务控制。
- Cocos 只允许通过该 GET 门面读取，不调用战斗、奖励、背包、英雄养成或经济写接口。

## 抽卡

- `GET /api/player/gacha/pools`
- `GET /api/player/gacha/pools/{poolCode}`
- `GET /api/player/gacha/pity/{poolCode}`
- `POST /api/player/gacha/draw`
  - body: `{ "poolCode": "NORMAL_HERO", "requestId": "...", "drawCount": 1, "useTicket": false }`
- `GET /api/player/gacha/logs`

### 2026-06-03 Gacha pool display metadata

- `GET /api/player/gacha/pools` and `GET /api/player/gacha/pools/{poolCode}` now include `tabLogoAsset`.
- `tabLogoAsset` is a Cocos resources path for the right-side image slot inside each left summon-pool tab.
- `logoAsset` remains the small pool badge/icon path; `tabLogoAsset` is the larger tab background/logo slot. If `tabLogoAsset` is empty, Cocos falls back to `logoAsset` and then to the theme color block.
- This field is display-only and does not affect probability, pool items, pity, cost, rewards, duplicate conversion, exchange/reissue, EX V1, or any economy write path.

## 英雄

- `GET /api/player/heroes`
- `GET /api/player/heroes/{heroId}`
- `GET /api/player/heroes/fragments/list`

## 2026-06-02 Cocos Gacha/Asset Readonly Contract Update

- `GET /api/player/me/lobby`
  - adds readonly `gold` and `diamond` fields for Cocos top asset display;
  - values come from `user_currency`; missing rows are displayed as `0`;
  - the read path must not create accounts or write currency logs.
- `GET /api/player/gacha/pools/{poolCode}/detail`
  - readonly player-facing pool detail for Cocos side pages;
  - includes pool display metadata, rates, pool items, pity configs, duplicate conversion configs, and ticket configs;
  - used by Gacha `概率保底`, `兑换` explanation, and `奖池内容` pages.
- `GET /api/player/gacha/logs`
  - used by the Gacha `记录` page with current selected pool filter.
- `GET /api/player/heroes/fragments/list`
  - used by the Cocos backpack to merge duplicate-hero fragments into a read-only `英雄碎片` group;
  - fragments remain stored in `user_hero_fragment`, not `user_bag`.
- Still not available in this stage:
  - gacha exchange/reissue;
  - bag use/batch-use/sell;
  - hero growth writes;
  - EX V1;
  - any new economy write endpoint.
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
- 除主角色初始化、`GET /api/player/me/lobby` 只读大厅资料、`GET /api/player/lobby/notices` 只读公告、`GET /api/player/lobby/codex` 只读图鉴、`GET /api/player/lobby/heroes` 只读英雄队列、`GET /api/player/lobby/adventure` 只读冒险壳、`POST /api/player/battles/start` 战斗会话和 `POST /api/player/battles/{battleNo}/settle` 无奖励记录结算外，玩家 `/me` 总览、货币总览等更大接口仍未实现。
- 队伍保存、副本、Boss 玩家侧接口未实现；战斗启动/结算当前只用于无奖励 battle session 闭环，不扣体力、不写主线进度、不发放奖励。
- Cocos 本地预览跨域需要后端 CORS 或同源代理支持。

## 2026-05-31 Battle Session Contracts

Current Cocos battle flow can call only these battle endpoints:

- `POST /api/player/battles/start`
- `POST /api/player/battles/{battleNo}/settle`

`start` request fields:

- `requestId`
- `stageCode`
- `heroIds`
- `leaderHeroId`
- `clientVersion`

`settle` request fields:

- `requestId`
- `result`
- `durationSeconds`
- `roundCount`
- `clientChecksum`

Contract boundary:

- Client must not submit reward, drop, currency, bag, stamina, progress, hero attribute, USDT, fund-pool, or EX data.
- Server response must keep `readonlyEconomy=true`.
- Settlement response must keep `rewardGranted=false`.
- Real reward/stamina/progress settlement remains unopened and must be separately reviewed.

### 2026-05-31 Stage 4O Formation Use In Battle Start

- Cocos now keeps a local `selectedLobbyFormationHeroIds` list while the formation panel is open.
- The selected list is used only to populate existing battle-start request fields:
  - `heroIds`
  - `leaderHeroId`
- The protagonist is kept as the local leader when present.
- This stage does not add a team-save API and does not persist formation outside the battle-session lineup snapshot.
- The client still must not submit hero attributes, rarity overrides, power, rewards, stamina, progress, currency, USDT, fund-pool, or EX data.

### 2026-05-31 Stage 4P Cocos Phase API Gate

Backend now enables a current-phase allowlist by default:

- config: `lootchain.player.cocos-phase-gate-enabled=true`
- gate: `com.lootchain.config.PlayerApiPhaseGate`

Allowed routes in the current Cocos phase:

- `POST /api/player/auth/dev-login`
- `GET /api/player/me/lobby`
- `GET /api/player/protagonist/state`
- `POST /api/player/protagonist`
- `GET /api/player/lobby/adventure`
- `GET /api/player/lobby/codex`
- `GET /api/player/lobby/heroes`
- `GET /api/player/lobby/notices`
- `GET /api/player/battles/recent`
- `POST /api/player/battles/start`
- `POST /api/player/battles/{battleNo}/settle`

Blocked routes include full gacha, full hero growth/detail, full bag/use, reward, currency, USDT, fund-pool, and EX routes unless separately reviewed and added to the allowlist.

Cocos `GachaApi.draw()` must stay locally blocked during this phase and must not POST `/api/player/gacha/draw`.

### 2026-05-31 Stage 4Q Battle Start Idempotency

`POST /api/player/battles/start` now treats `requestId` as a required idempotency key.

Rules:

- missing or blank `requestId` is rejected;
- `requestId` longer than 80 characters is rejected and must not be truncated;
- a repeated `requestId` may return an existing battle session only when all of these match:
  - `stageCode`
  - ordered `heroIds`
  - `leaderHeroId`
- a repeated `requestId` with a different stage, lineup, or leader is rejected with `重复战斗请求参数不一致`.

Cocos must create a new battle start `requestId` whenever the player changes stage or formation.

### 2026-05-31 Stage 4R Settlement No-Economy Flags

Current Cocos battle settlement remains a no-reward record, now persisted with DB-visible guard fields:

- `settlement_mode='NO_REWARD'`
- `reward_granted=0`
- `readonly_economy=1`
- `economy_applied=0`

`POST /api/player/battles/{battleNo}/settle` still returns:

- `rewardGranted=false`
- `readonlyEconomy=true`

Any future reward, stamina, mainline progress, bag/currency, USDT, fund-pool, or EX settlement must be added in a separate reviewed stage and must not treat `NO_REWARD` records as reward-eligible.

### 2026-05-31 Stage 4T Recent Battle Readonly Record

`GET /api/player/battles/recent` is now available in the current Cocos phase as a read-only return-to-lobby clarity endpoint.

Required guard fields per record:

- `settlementMode='NO_REWARD'`
- `rewardGranted=false`
- `readonlyEconomy=true`
- `economyApplied=false`

Cocos `BattleApi.recentBattles()` must fail closed if these flags indicate a reward/economy-applied state. The current strict acceptance contract is:

- `settlementMode === 'NO_REWARD'`
- `rewardGranted === false`
- `readonlyEconomy === true`
- `economyApplied === false`
- `battleNo`, `settlementNo`, `stageCode`, and `recordedTime` must be present.

The backend service also filters the recent query to no-reward readonly rows only. The adventure panel may display these records only as recent no-reward challenge history.

This endpoint must not grant rewards, deduct stamina, write mainline progress, save formation, mutate bag/currency/USDT/fund-pool data, expose EX V1, or become a claimable reward source.

### 2026-05-31 Stage 4W Battle Guard Smoke Matrix

Additional current-phase backend guards now exist for the Cocos battle path:

- `scripts/smoke-battle-request-guard.ps1`
  - missing/null/blank/overlong `requestId` must be rejected before `battle_session` insert.
- `scripts/smoke-battle-stage-guard.ps1`
  - empty, malformed, BOSS, EX, Unicode, and overlong `stageCode` values must be rejected before `battle_session` insert.
- `scripts/smoke-battle-lineup-guard.ps1`
  - empty, zero, negative, duplicate, non-owned, leader-not-in-lineup, and over-limit lineups must be rejected before `battle_session` insert.
- `scripts/smoke-battle-settle-guard.ps1`
  - unknown battle, missing/blank/overlong settle `requestId`, and illegal result must be rejected before `battle_settlement` insert;
  - repeated settle must return the original no-reward settlement and keep one row per battle.
- `scripts/smoke-cocos-current-flow.ps1`
  - same battle-start `requestId` with changed stage, lineup, or leader must be rejected;
  - PhaseGate failures must match the Cocos current-phase blocking message, while tolerating Windows PowerShell UTF-8 display issues.

Cocos must continue to create a fresh start `requestId` when the player changes stage or formation, and a fresh settle `requestId` per settlement attempt. It must not retry a changed payload under an old idempotency key.

### Local Smoke Verification

The backend repo now contains:

```powershell
D:\business\project\LootChain\scripts\smoke-player-flow.ps1
```

Run it after `lootchain-game` starts:

```powershell
cd D:\business\project\LootChain
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\smoke-player-flow.ps1 -BaseUrl http://localhost:8081 -UserId 1 -StageCode MAIN_1_1
```

The script checks the current Cocos player path through dev-login, protagonist state, lobby profile, adventure, hero roster, battle start, no-reward settlement, and lobby profile re-read. Passing criteria include `rewardGranted=false`, `readonlyEconomy=true`, and no stamina/combat-power change.

### 2026-05-31 Current Phase Guard Smoke

The backend repo also contains:

```powershell
D:\business\project\LootChain\scripts\smoke-cocos-current-flow.ps1
```

Run it after restarting `lootchain-game` from current source:

```powershell
cd D:\business\project\LootChain
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\smoke-cocos-current-flow.ps1 -BaseUrl http://localhost:8081 -UserId 1
```

The script verifies:

- forbidden player routes for gacha, bag, and hero growth are blocked by the current Cocos phase gate;
- blocked calls do not mutate tracked economy snapshots;
- battle start `requestId` is idempotent only for the same payload;
- no-reward settlement does not mutate tracked economy snapshots;
- `battle_settlement` persists `settlement_mode='NO_REWARD'`, `reward_granted=0`, `readonly_economy=1`, and `economy_applied=0`.
- recent battle readback contains the just-created settlement and keeps `rewardGranted=false`, `readonlyEconomy=true`, and `economyApplied=false`.

This smoke is contract verification only. It does not open reward, stamina, progress, bag/currency, USDT, fund-pool, EX V1, or any economy write route.

### 2026-05-31 Stage 4AA Locked Stage Backend Guard

`POST /api/player/battles/start` now checks the same readonly adventure unlock state that the Cocos adventure panel displays.

- The backend still validates `stageCode` format and the current static mainline allowlist first.
- After that, the target stage must exist in `GET /api/player/lobby/adventure` and must be `unlocked=true` for the current player.
- Locked mainline stages such as `MAIN_1_2` are rejected before hero lookup and before any `battle_session` insert.
- Cocos should continue to hide/disable locked stages locally, but backend remains authoritative against modified clients.

Verification added in the backend project:

```powershell
cd D:\business\project\LootChain
mvn.cmd --no-transfer-progress -pl lootchain-core "-Dtest=PlayerBattleServiceImplTest,PlayerApiPhaseGateTest,PlayerLobbyAdventureServiceImplTest" test
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\smoke-battle-stage-guard.ps1 -BaseUrl http://localhost:8081 -UserId 1
```

This is a defensive battle-start guard only. It does not open rewards, stamina cost, mainline progress write, saved formation, bag/currency, USDT, fund-pool, EX V1, or any economy write route.
