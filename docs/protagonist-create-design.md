# 主角色创建与三形态设计草案

日期：2026-05-30

参考概念图：

```text
D:\business\project\lootchain-cocos\docs\ui-reference\protagonist\protagonist-create-concept-v1.png
```

当前设计边界：

- 主角色是玩家身份载体和新手保底战斗单位。
- 主角色不进入抽卡池，不参与卡池概率，不产出抽卡碎片。
- 主角色稀有度建议为 `SSR 主角`，但这是主角专属 SSR，不等同于可抽 SSR。
- 主角色可加入战斗，可出现在英雄列表第一位。
- 主角色有三种形态：攻击、防御、辅助；默认解锁攻击形态。
- 防御/辅助形态通过主线剧情道具或主线进度解锁，不走付费、抽卡或交易。
- 本设计不改变经济规则，不开放 EX V1，不新增经济写入口。

## 一、登录后的新流程

建议把登录后的流程调整为：

```text
登录成功 -> 检查是否已有主角色 -> 未创建则进入角色创建 -> 选择男/女 -> 输入名字 -> 创建主角 -> 进入大厅
```

已有主角的玩家：

```text
登录成功 -> 检查已有主角色 -> 直接进入资源加载和大厅
```

这样可以让玩家先完成身份建立，再进入大厅和后续冒险。

## 二、多角色分析

### 产品角色

主角系统的产品定位：

- 解决“玩家是谁”的身份问题。
- 给新手一个稳定可用的 SSR 级战斗单位，降低前期无英雄或抽卡前的不确定性。
- 通过三形态和主线解锁建立长期目标，但不新增独立经济系统。

建议：

- V1 第一阶段只完整支持创建角色、攻击形态、英雄列表置顶、可参战。
- 防御/辅助先做锁定预告，提示通过主线解锁。
- 男/女只影响外观、称呼和演出，不影响初始强度，避免玩家开局强度焦虑。
- 起名必须轻量：支持默认名、随机名、基础非法字符/长度校验。

### 玩家角色

玩家登录后应感觉自己不是“游客账号”，而是已经成为圣契召唤师。

玩家路径：

1. 看到男/女两个主角，快速理解二选一。
2. 选择喜欢的外观。
3. 输入角色名或使用随机名。
4. 点击进入游戏。
5. 在英雄列表第一位看到自己的主角 SSR 卡。
6. 在第一场主线战斗中使用默认攻击形态主角参战。

玩家应看到的承诺：

- 主角不是抽卡产物。
- 主角可以长期陪伴。
- 后续主线可以解锁更多形态。

### UI 角色

角色创建界面建议：

- 背景：暗黑哥特大殿、深渊王座、红色裂隙或祭坛。
- 左侧：男主大卡。
- 右侧：女主大卡。
- 中下：角色名输入框。
- 底部中央：`进入游戏` 主按钮。
- 右侧或卡牌底部：SSR 主角预览和三形态状态。
- 攻击形态高亮，防御/辅助显示锁定与 `主线解锁`。

交互：

- 点击角色卡切换选中状态。
- 选中卡出现红金扫光、法阵或边框脉冲。
- 输入名字时输入框红金聚焦。
- 进入按钮在名字合法时变亮。
- 内部 UI 必须使用安全区自适应，不写死分辨率坐标。

### 美术角色

整体方向：

- 影视级暗黑哥特。
- 黑金主框、深渊红能量、黑曜石材质。
- 不做卡通、Q 版、明亮二次元或现代科幻。

男主建议：

- 名称方向：深渊誓刃 / Abyss Oathblade。
- 黑金重甲、高肩甲、深红披风、黑曜石大剑。
- 气质：冷峻、王权、契约、压迫感。

女主建议：

- 名称方向：血月圣裁 / Crimson Moon Arbiter。
- 黑金轻甲战裙、红色披纱、血月镰或符文细剑。
- 气质：冷艳、审判、神秘、深渊贵族。

SSR 卡牌：

- 黑曜石底框 + 暗金浮雕 + 深红能量槽。
- SSR 标识用金红宝石质感。
- 主角卡要有 `主角` 标签，避免与卡池 SSR 混淆。

三形态视觉：

- 攻击：深渊红、熔金、剑痕、尖锐斜切。
- 防御：黑金、暗铜、护盾、锁链、堡垒纹样。
- 辅助：暗红、圣金、法阵、契约符文、圆环。

### 研发角色

建议把主角创建定义为账号初始化能力。

前端模块建议：

- `ProtagonistCreateFlow`：登录后检查主角状态、处理创建、ticket/cancel 防旧请求。
- `ProtagonistCreateRenderer`：男/女选择、名字输入、形态预览、进入按钮。
- `ProtagonistCreateState`：表单状态与轻量校验。
- `ProtagonistApi`：只封装主角创建和主角只读接口。
- `ProtagonistTypes`：DTO/VO 类型。
- `ProtagonistPreviewRenderer`：主角卡、SSR 边框、三形态状态展示。

后端模型建议：

- `player_protagonist`：主角身份表，唯一键 `user_id`。
- `user_hero`：创建时生成一条 `source_type=PROTAGONIST` 的 SSR 主角英雄实例，用于英雄列表、队伍、战斗引用。
- `protagonist_form_config`：形态配置。
- `user_protagonist_form`：玩家已解锁形态和当前选择形态。

接口建议：

| 接口 | 类型 | 风险 | 用途 |
|---|---:|---:|---|
| `GET /api/player/onboarding/state` | 只读 | 低 | 判断账号是否已有主角 |
| `GET /api/player/protagonist/options` | 只读 | 低 | 返回性别、命名规则、形态展示配置 |
| `GET /api/player/protagonist` | 只读 | 低 | 返回主角和形态状态 |
| `POST /api/player/protagonist` | 玩家状态写入 | 高 | 创建主角，只允许一次 |
| `POST /api/player/protagonist/form/select` | 玩家状态写入 | 中 | 切换已解锁形态 |

暂缓：

- `POST /api/player/protagonist/forms/{formCode}/unlock`。
- 形态解锁更建议由主线结算服务自动解锁，避免开放可刷或可伪造的消耗入口。

### 审查角色

必须坚持：

- 客户端不能传 `heroCode`、`rarity`、`star`、`level`、`power`、`attrs`。
- 后端固定主角模板、SSR 稀有度和初始属性。
- 创建接口必须唯一、幂等、并发安全，双击不能生成两个主角。
- 主角不在任何 gacha pool、reward grant、碎片转换、活动领取或公共补发路径中。
- 主角不是 EX，主角形态也不是 EX。
- 主角属性不能通过重建账号刷随机词条。
- 英雄列表第一位应由后端返回 `isProtagonist` / `sortWeight`，不能只靠前端插队。

### 验收角色

验收场景：

- 新账号登录后进入主角创建页。
- 选择男/女、输入合法名字后创建成功并进入大厅。
- 已创建账号登录时跳过创建页。
- 主角出现在英雄列表第一位，稀有度显示为 SSR 主角。
- 主角默认攻击形态可参战。
- 防御/辅助形态显示锁定和主线解锁提示。
- 非法名字、空名字、超长名字、非法性别被后端拒绝。
- 重复提交、断网重试、刷新不会生成多个主角。
- 小屏、横屏、窄屏创建页不越界、不重叠。
- 抽卡池、图鉴、奖励日志中不出现可抽取或可领取主角的语义。

## 三、Imagegen 概念图说明

本阶段已用 imagegen 生成一张影视级角色创建界面概念图：

```text
D:\business\project\lootchain-cocos\docs\ui-reference\protagonist\protagonist-create-concept-v1.png
```

注意：

- 该图用于 UI/美术方向参考。
- 最终 Cocos 实现时，文字、按钮、输入框、锁定状态应使用 Cocos 原生 UI 渲染，不应依赖 AI 图片中的文字。
- 后续应拆成背景层、角色层、卡牌框层、输入框/按钮九宫格、形态图标和动效层。

## 四、推荐实施顺序

### Stage P1：角色创建产品壳

- 登录后增加本地状态判断。
- 新增角色创建界面。
- 男/女选择、名字输入、攻击形态默认展示。
- 暂不写后端，先完成 UI、布局和交互验证。

### Stage P2：主角创建接口

- 后端新增只允许一次的主角创建接口。
- 创建 `player_protagonist` 与 `user_hero source_type=PROTAGONIST`。
- 前端创建成功后进入大厅。

### Stage P3：英雄列表主角置顶

- 英雄列表接入主角卡。
- 主角 SSR 卡第一位展示。
- 防御/辅助形态锁定展示。

### Stage P4：队伍与战斗接入

- 主角可作为普通上阵单位加入队伍。
- 默认攻击形态参与战斗。
- 防御/辅助形态先保持锁定预告，等主线解锁机制成熟后开放。

## 五、当前结论

主角色系统应该成为登录后进入游戏前的第一层身份建立。

推荐下一阶段从 Cocos 前端 `Stage P1：角色创建产品壳` 开始，先完成高质量 UI、男/女选择、名字输入和本地进入大厅流程。后端创建接口属于高风险玩家状态写入，应单独设计、审查和验收后再接入。

## 六、2026-05-30 Stage P1 前端产品壳实现

已完成 Cocos 前端产品壳：

- 新增主角类型：
  - `assets/scripts/types/ProtagonistTypes.ts`
- 新增主角创建模块：
  - `assets/scripts/scenes/protagonist/ProtagonistCreateState.ts`
  - `assets/scripts/scenes/protagonist/ProtagonistCreateFlow.ts`
  - `assets/scripts/scenes/protagonist/ProtagonistCreateRenderer.ts`
- `LootChainGameRoot.ts` 新增 `protagonistCreate` 视图。
- `LoginFlow.ts` 登录成功后不再直接进入 loading，而是调用主角创建流程。
- 新账号本地预览状态下进入主角创建页；已创建本地主角的账号会跳过创建页进入 loading/大厅。
- 创建页包含男/女选择、角色名输入、`SSR 主角` 状态和攻击/防御/辅助三形态展示。
- 攻击形态默认开放；防御/辅助只显示锁定提示，不允许真正选择参战形态。
- 当前创建结果只保存在本地预览状态 `lootchain.protagonist.preview.v1.{userId}`，用于验证前端流程。

边界：

- 未新增后端接口。
- 未写入数据库。
- 未新增经济写入口。
- 未开放 EX V1。
- 主角真实创建、唯一性、幂等、`user_hero source_type=PROTAGONIST`、英雄列表置顶和参战接入，需要后续单独阶段实现。

验收：

- `npm.cmd run check:layout` -> passed with `layout ok`。
- Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed。

### 2026-05-30 人物卡面接入

- 用户反馈创建页只有占位剪影，没有角色图。
- 已从概念图 `docs/ui-reference/protagonist/protagonist-create-concept-v1.png` 裁切男女主角卡面资产：
  - `assets/resources/ui/protagonist/protagonist_male_attack.png`
  - `assets/resources/ui/protagonist/protagonist_female_attack.png`
- 已补充 Cocos `.meta`，作为 `spriteFrame` 导入。
- `ProtagonistCreateRenderer.ts` 现在优先加载：
  - `ui/protagonist/protagonist_male_attack/spriteFrame`
  - `ui/protagonist/protagonist_female_attack/spriteFrame`
- 如果资源尚未加载完成或加载失败，才回退到原来的 Cocos 剪影兜底。
- `scripts/check-layout.mjs` 已把两张主角图和 meta 文件加入必需资源检查。
- 已验证：
  - `npm.cmd run check:layout` -> passed with `layout ok`。
  - Cocos Creator 3.8.8 bundled focused `tsc.cmd --noEmit` -> passed。

### 2026-05-30 高质量主角卡面替换

- 用户反馈上一版素材来自概念图裁切，裁剪质量不足，要求生成接近概念方向的高质量素材并替换。
- 已重新生成两张影视级暗黑哥特 SSR 主角攻击形态卡面：
  - 男主：黑金重甲、深红披风、深渊红能量巨剑。
  - 女主：黑金战甲、血月冠饰、深红能量剑、哥特王座氛围。
- 已覆盖原有 Cocos 资源文件，资源路径保持不变：
  - `assets/resources/ui/protagonist/protagonist_male_attack.png`
  - `assets/resources/ui/protagonist/protagonist_female_attack.png`
- 两张图已统一处理为 `512x768`，继续复用现有 `.meta` 和 `spriteFrame` 路径，避免影响渲染代码。
- 本次只替换本地 UI 资产，不新增后端接口，不写数据库，不改变经济规则，不开放 EX V1。

## 七、2026-05-30 Stage P2 服务端 DB 同步实现

当前主角创建已从本地预览壳升级为服务端权威创建。

### 前端链路

- 登录成功后，`ProtagonistCreateFlow` 调用 `ProtagonistApi.state()`。
- 已创建主角的账号直接进入资源加载和大厅。
- 未创建主角的账号进入创建页。
- 点击 `进入游戏` 后，前端调用 `ProtagonistApi.create({ gender, protagonistName })`。
- 创建成功后以前端收到的服务端 `profile` 为准，写入本地诊断镜像，再进入大厅。
- 本地 `lootchain.protagonist.preview.v1.{userId}` 不再是权威状态，只用于排查和预览兜底记录。

### 后端链路

- 新增玩家端接口：
  - `GET /api/player/protagonist/state`
  - `POST /api/player/protagonist`
- 新增身份表：
  - `player_protagonist`
- `user_hero` 新增来源和排序字段：
  - `source_type`
  - `sort_weight`
- 创建接口只接受 `gender` 和 `protagonistName`。
- 服务端固定选择主角模板、SSR 展示稀有度、初始等级、初始星级、初始形态和固定属性词条。
- 创建时写入 `player_protagonist`，并创建一条 `user_hero source_type=PROTAGONIST` 英雄实例。
- 通过锁定 `game_user` 与 `player_protagonist.user_id` 唯一约束保证重复点击、刷新重试和并发请求不会创建多个主角。

### SQL 与本地状态

- SQL 脚本：`D:\business\project\LootChain\sql\12_protagonist_module.sql`。
- 本地数据库已执行该脚本，包含：
  - `player_protagonist` 表。
  - `user_hero.source_type` 和 `user_hero.sort_weight`。
  - 主角攻击形态模板 `PROTAGONIST_MALE_ATTACK`、`PROTAGONIST_FEMALE_ATTACK`。
- 主角模板 `hero_template.status=0`，用于避免被普通图鉴/抽卡展示为可获取内容。

### 安全边界

- 主角创建属于账号初始化写入，不是经济写入口。
- 不调用抽卡、奖励、背包、商店、结算、资金池、链上领取等链路。
- 客户端不能传 `heroCode`、`rarity`、`star`、`level`、`power`、`attrs`。
- 主角不进入抽卡池，不参与概率，不产出碎片，不通过奖励系统补发。
- 防御/辅助形态仍锁定，后续必须由主线剧情或主线道具链路解锁。
- EX V1 仍不开放。

### 已完成验收

- 后端单元测试覆盖：
  - 首次创建写入主角身份和 `user_hero`。
  - 重复创建返回已有主角，不生成第二个英雄实例。
- Cocos 检查脚本已守卫：
  - 主角 API 文件和 meta 文件存在。
  - 创建请求不允许发送服务端拥有的强度字段。
  - 主角流程不再用本地预览状态作为跳过创建页的权威依据。

## 八、2026-05-30 Stage P3 英雄入口只读主角置顶

当前已完成 Stage P3 的大厅只读版本：创建主角后，玩家可以在大厅点击 `英雄` 入口查看主角置顶的英雄队列。

### 后端实现

- 新增大厅专用只读接口：
  - `GET /api/player/lobby/heroes`
- 新增后端文件：
  - `PlayerLobbyHeroController`
  - `PlayerLobbyHeroService`
  - `PlayerLobbyHeroServiceImpl`
  - `PlayerLobbyHeroItemVO`
- 接口读取玩家已拥有英雄，并保证：
  - `protagonist=true` 的主角排在第一位。
  - EX 稀有度和 `EX_` 英雄编码被过滤。
  - 只返回大厅展示所需字段，不返回 Entity。
- `lootchain-admin` 已排除 `PlayerLobbyHeroController`，避免后台应用加载玩家端 Controller。

### 前端实现

- 新增 Cocos 模块：
  - `LobbyHeroApi`
  - `LobbyHeroTypes`
  - `LobbyHeroRosterState`
  - `LobbyHeroRosterLoader`
  - `LobbyHeroRosterPanelRenderer`
- 底部 `英雄` 和小屏 compact `英雄` 现在打开只读英雄队列面板。
- 主角卡展示：
  - SSR 稀有度。
  - `主角` 标识。
  - `攻击形态`。
  - 等级、星级、战力。
- 普通英雄只展示只读基础信息，不提供养成按钮。

### 安全边界

- 英雄队列面板不调用 `POST /api/player/heroes/{heroId}/level-up`、`star-up`、`awaken` 或 `refine`。
- 不调用抽卡、背包、奖励、商店、结算或链上接口。
- 不新增经济写入口。
- EX V1 仍不开放。

### 验收

- `npm.cmd run check:layout` -> passed with `layout ok`。
- Cocos Creator 3.8.8 focused `tsc.cmd --noEmit` -> passed。
- `mvn.cmd --no-transfer-progress -pl lootchain-core "-Dtest=PlayerLobbyHeroServiceImplTest,PlayerProtagonistServiceImplTest" test` -> passed。
- `mvn.cmd --no-transfer-progress -pl lootchain-admin,lootchain-game -am -DskipTests compile` -> passed。
