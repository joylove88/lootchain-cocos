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
- `GET /api/player/lobby/heroes/filter-options`，只用于大厅英雄队列职业筛选项，优先读取 `sys_param_config.param_key='hero.class.options'` 的职业配置，不写库、不改变英雄或经济状态。

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
        "faction": "深渊议会",
        "heroClass": "战士",
        "level": 1,
        "star": 1,
        "power": 8300,
        "protagonist": true,
        "sourceType": "PROTAGONIST",
        "portraitAsset": "act_1001",
    "cardBackgroundAsset": "ui/hero-roster/card_background/Nuu_Illust",
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
- `portraitAsset`、`cardBackgroundAsset`、`spineAsset`、`spineUuid` 仅用于 Cocos 英雄列表/详情资源展示；`cardBackgroundAsset` 是 `assets/resources` 下的卡牌背景资源路径，前端会按 SpriteFrame 资源加载；`spineUuid` 对应 Cocos `sp.SkeletonData` 资源 uuid，前端优先按 uuid 加载，失败时才按 `assets/resources/spine/hero/{spineAsset}/{spineAsset}` 路径兜底。
- 这些展示字段不代表获取来源、概率、奖励、消耗、碎片转换或任何经济语义。

### 2026-06-06 Hero card background display field

- `hero_template.card_background_asset` 通过玩家英雄列表、详情、图鉴和大厅只读英雄/图鉴 VO 暴露为 `cardBackgroundAsset`。
- 当前 SQL：`D:\project\LootChain\sql\24_hero_card_background_asset.sql`。
- 当前示例值：`UR_EVELYN -> ui/hero-roster/card_background/Nuu_Illust`。
- 该字段只控制 Cocos 英雄界面卡牌背景展示，不改变英雄拥有状态、抽卡概率、池物品、奖励、碎片转换、EX V1、英雄养成或任何经济写入口。

### 2026-06-07 Nine hero display asset mapping

- 当前增量 SQL：`D:\project\LootChain\sql\33_hero_display_asset_batch_sync.sql`。
- 本批只同步展示字段：`portrait_asset`、`card_background_asset`、`spine_asset`、`spine_uuid`。
- 当前映射：
  - `UR_ARTHAS -> IshmaelA / ui/hero-roster/card_background/IshmaelA_Illust`;
  - `UR_ATLAS -> Lucrecia / ui/hero-roster/card_background/Lucrecia_Illust`;
  - `UR_AURELIA -> Belladonna / ui/hero-roster/card_background/Belladonna_Illust`;
  - `UR_NYX -> Sphinx / ui/hero-roster/card_background/Sphinx_Illust`;
  - `UR_SERAPHINA -> LucienA / ui/hero-roster/card_background/LucienA_Illust`;
  - `SSR_KANE -> Ishmael / ui/hero-roster/card_background/Ishmael_center`;
  - `SSR_LIVIA -> Carmilla / ui/hero-roster/card_background/Carmilla_center`;
  - `SSR_MICHAEL -> HeylelS01 / ui/hero-roster/card_background/HeylelS01_Illust`;
  - `SSR_RON -> Eulenspigel / ui/hero-roster/card_background/Eulenspigel_Illust`。
- Cocos 英雄详情优先使用 `spineUuid` 加载 `sp.SkeletonData`，失败再按 `assets/resources/spine/hero/{spineAsset}/{spineAsset}` 路径兜底。
- 本批英雄详情动画统一使用 `idle`。这只是展示动画选择，不改变技能、属性、战斗或养成语义。
- 该批同步不新增接口、不改变返回结构，不开放 EX V1、英雄养成、背包写操作、gacha exchange/reissue，也不改变抽卡概率、保底、消耗、奖励或重复转碎片规则。

### 大厅英雄职业筛选项

- `GET /api/player/lobby/heroes/filter-options`
  - response data:
    ```json
    {
      "heroClasses": ["战士", "辅助", "刺客", "法师", "射手", "坦克"]
    }
    ```

约束：
- 该接口优先读取 `sys_param_config.param_key='hero.class.options'`，`param_value` 使用逗号/分号/换行分隔职业名。
- `heroClasses` 仅用于 Cocos 英雄队列左侧职业筛选项。
- Cocos 左侧按钮显示该接口返回的职业文本，但内部过滤使用规范化职业 key 匹配 `GET /api/player/lobby/heroes` 的 `heroClass`；该规范化只用于只读展示去重、选中态和筛选，不写库、不修改英雄模板。
- 当前运行中的旧本地后端如果尚未开放本接口，或 `GET /api/player/lobby/heroes` 暂时返回 `heroClass: null`，Cocos 会对已知 V1 `heroCode` 使用只读职业兜底映射；后端返回真实 `heroClass` 时始终优先使用后端字段。
- 当配置缺失或为空时，后端才回退读取启用模板 `hero_template.hero_class where status=1` 并合并默认六职业；查询失败时只返回默认六职业展示兜底：`战士 / 辅助 / 刺客 / 法师 / 射手 / 坦克`。
- 该兜底不会插入或修改数据库行，不改变英雄、抽卡、经济或奖励语义。

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
- 除主角色初始化、`GET /api/player/me/lobby` 只读大厅资料、`GET /api/player/lobby/notices` 只读公告、`GET /api/player/lobby/codex` 只读图鉴、`GET /api/player/lobby/heroes` 只读英雄队列、`GET /api/player/lobby/heroes/filter-options` 只读英雄职业筛选项、`GET /api/player/lobby/adventure` 只读冒险壳、`POST /api/player/battles/start` 战斗会话和 `POST /api/player/battles/{battleNo}/settle` 无奖励记录结算外，玩家 `/me` 总览、货币总览等更大接口仍未实现。
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

Historical note: this 2026-05-31 phase required Cocos `GachaApi.draw()` to stay locally blocked. The current 2026-06-02+ summon phase has separately reviewed and connected the existing `POST /api/player/gacha/draw` endpoint only. The client still must not add gacha exchange/reissue, EX V1, bag use/sell, hero growth, reward/currency/fund-pool writes, or any new economy write route.

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

- current readonly/open player APIs are reachable: `GET /api/player/lobby/heroes/filter-options`, `GET /api/player/gacha/pools`, and `GET /api/player/bag`;
- forbidden player write routes are still blocked by the current Cocos phase gate: gacha exchange/reissue, bag use/batch-use/sell, and hero growth;
- blocked calls do not mutate tracked economy snapshots;
- battle start `requestId` is idempotent only for the same payload;
- no-reward settlement does not mutate tracked economy snapshots;
- `battle_settlement` persists `settlement_mode='NO_REWARD'`, `reward_granted=0`, `readonly_economy=1`, and `economy_applied=0`.
- recent battle readback contains the just-created settlement and keeps `rewardGranted=false`, `readonlyEconomy=true`, and `economyApplied=false`.

This smoke is contract verification only. It does not open reward, stamina, progress, bag/currency mutation beyond the already reviewed gacha draw path, USDT, fund-pool, EX V1, gacha exchange/reissue, bag writes, hero growth, or any new economy write route.

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

### 2026-06-05 Lobby hero class fields

- `GET /api/player/lobby/heroes` now includes display-only `faction` and `heroClass`.
- These fields come from `hero_template.faction` and `hero_template.hero_class`.
- Cocos uses `heroClass` for the hero roster class filter and one-character card badge. Missing `heroClass` heroes stay visible in `全部` only.
- The client must not implement class filtering by calling hero detail for every card, and must not add any hero growth, gacha, reward, bag, or economy write path for this filter.

### 2026-06-05 Cocos summon visibility and real-draw gate

- Cocos hides the light/dark display pool by filtering `poolCode=SEALED_LIGHT_DARK`, `displayType=LOCKED`, or `themeColor=locked`.
- Cocos enables summon buttons only for pools returned by the backend with `drawEnabled=true`, `previewOnly=false`, and `locked=false`; the actual draw still goes only through the existing `POST /api/player/gacha/draw`.
- Preview-only pools such as a limited preview must not be treated as real active pools by the client. A limited pool becomes drawable only when backend data exposes it as a real active pool under the same guard.
- This does not add exchange/reissue, does not change `gacha_pool_item`, and does not change probability, weight, pity, cost, reward, or duplicate conversion rules.

### 2026-06-06 Current Cocos PhaseGate and smoke closure

- `PlayerApiPhaseGate` now allows readonly `GET /api/player/lobby/heroes/filter-options`, matching the Cocos hero roster class rail contract.
- The current smoke script verifies the active stage boundary:
  - open: filter-options, gacha pools GET, bag GET, battle start, no-reward battle settlement, and recent battle readback;
  - blocked: gacha exchange/reissue, bag use/batch-use/sell, hero level-up/star-up/awaken/refine;
  - unchanged: no-reward settlement persists `settlement_mode='NO_REWARD'`, `reward_granted=0`, `readonly_economy=1`, and `economy_applied=0`.
- Local DB sync note: if `battle_session` or `battle_settlement` is missing, source existing SQL `13_battle_session_module.sql` and `14_battle_settlement_guard_flags.sql` with `mysql --default-character-set=utf8mb4`.
- Manual runtime acceptance on the restarted local game server confirmed:
  - `GET /api/player/lobby/heroes/filter-options` returned `code=0` with six configured classes;
  - one `NORMAL_HERO` single draw succeeded through the existing `/api/player/gacha/draw` path only;
  - current smoke passed with `rewardGranted=false`, `readonlyEconomy=true`, and `economy_applied=0`.
- Boundary unchanged: no `gacha_pool_item`, probability, weight, pity, cost, reward, duplicate conversion, EX V1, exchange/reissue, bag use/sell/batch-use, hero growth, reward/stamina/progress write, or new economy write endpoint changed.

### 2026-06-06 Cocos language preference request header

- Cocos now keeps display language locally in `assets/scripts/i18n/LootChainI18n.ts`.
- Supported current-stage values are `zh-CN` and `en-US`; default is `zh-CN`.
- `HttpClient` sends `Accept-Language: <current Cocos language>` on API calls.
- This header is passive metadata for future localization. No backend endpoint, response schema, economy rule, gacha rule, bag write, hero growth path, SQL, or PhaseGate rule was changed in this step.
- Login language toggling and Lobby settings language selection are local Cocos UI actions only.

### 2026-06-06 Player API localization contract

- Cocos still sends `Accept-Language` from `LootChainI18n.currentLanguage()`.
- Backend now consumes this header for `/api/player/**`.
- Supported current-stage values:
  - `zh-CN` (default and fallback);
  - `en-US`.
- Backend language parsing:
  - accepts normal browser-style `Accept-Language` values;
  - any unsupported/blank value falls back to `zh-CN`;
  - language context is cleared after request completion.
- New display-only DB table:
  - SQL: `D:\project\LootChain\sql\23_game_text_i18n.sql`;
  - table: `game_text_i18n(owner_type, owner_key, field_name, lang, text_value, status)`;
  - unique key: `(owner_type, owner_key, field_name, lang)`;
  - import must use `mysql --default-character-set=utf8mb4` to avoid corrupting Chinese seed text;
  - local `lootchain` DB currently has `200` enabled `en-US` rows, including `120` `HERO_TEMPLATE` rows for current hero/protagonist display fields.
- Localized response surfaces in this stage:
  - `GET /api/player/lobby/heroes` and related hero detail/codex/fragments display fields, including hero names, factions, classes, detail story, and detail skills where translated rows exist;
  - `GET /api/player/lobby/heroes/filter-options` class labels;
  - `GET /api/player/gacha/pools`, pool detail display fields, and `POST /api/player/gacha/draw` reward display names;
  - `GET /api/player/bag` and item source display fields;
  - `GET /api/player/lobby/notices`;
  - `GET /api/player/lobby/adventure`.
- Runtime acceptance:
  - after restarting local `lootchain-game` from current source on `8081`, readonly calls with `Accept-Language: en-US` returned English hero classes, hero list/detail/codex display fields, gacha pool text, bag type labels, and adventure text.
- Fallback rule:
  - missing translations return the original DB/hardcoded text;
  - translation rows must never drive gacha probability, weight, pity, cost, reward, duplicate conversion, item use/sell, hero growth, progress, or any economy state.
- Boundary unchanged:
  - no new API route;
  - no new economy write endpoint;
  - no `gacha_pool_item` modification;
  - no EX V1, exchange/reissue, bag write, hero growth, reward/stamina/progress write opened.
