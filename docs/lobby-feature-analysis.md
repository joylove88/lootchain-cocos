# 大厅参考图功能拆解

参考图：`D:\project\lootchain-cocos\docs\ui-reference\dragonheir\lobby\lobby.png`

本文从产品视角拆解参考大厅的可见功能点，用于后续规划 LootChain Cocos 大厅。当前阶段只做产品拆解与交互定义，不开放抽卡、英雄、背包、USDT、资金池或任何经济写入口。

## 整体结构

大厅采用“全景场景地图 + 固定 HUD”的结构：

- 背景是暗黑城堡全景，场景建筑本身承载功能入口。
- 顶部是玩家状态、资源栏与系统入口。
- 左侧是限时活动与商业化/运营入口列表。
- 中央场景中散布主要玩法入口。
- 右侧是高优先级挑战/副本卡片。
- 底部是常驻主导航、聊天栏和主线冒险入口。

## 顶部区域

### 左上角玩家信息

可见元素：

- 玩家头像与头像框。
- 等级：示例 `Lv.89`。
- 玩家名称：示例 `LootChain`。
- 名称旁有一个小图标，可能是阵营、称号、认证、VIP 或复制/详情入口。
- 战力：示例 `2,658,490`。
- `EXP` 小按钮或经验标识。

点击玩家信息后建议弹出“玩家资料面板”，展示：

- 基础信息：头像、头像框、昵称、UID、服务器、注册时间、最后登录时间。
- 成长信息：等级、当前经验、升级所需经验、体力上限、当前战力。
- 社交信息：公会名称、称号、阵营、好友数量。
- 资产摘要：金币、钻石、核心材料等只读展示。
- 进度摘要：主线章节、深渊层数、世界 Boss 最高伤害、竞技段位。
- 账号信息：账号绑定状态、钱包绑定状态、登录方式。
- 操作按钮：复制 UID、修改昵称、更换头像/头像框、查看详细属性、联系客服、切换账号/退出登录。
- 风控提示：账号状态、封禁/冻结原因、实名或安全绑定状态。

### 顶部资源栏

可见元素：

- 体力/能量：`87/180`，带 `+`。
- 金币：`3,456K`，带 `+`。
- 红色宝石/钻石：`8,888`，带 `+`。
- 紫色水晶/高级材料：`2,450`，带 `+`。

点击资源或 `+` 后建议弹出：

- 资源说明：用途、当前数量、今日获取、今日消耗。
- 获取途径：任务、副本、活动、商店兑换等跳转。
- 购买/兑换入口：仅在对应经济规则和后端接口开放后启用。
- 体力特殊信息：自然恢复倒计时、下次恢复时间、今日购买次数、上限。

当前 LootChain 阶段注意：这些入口前期只能做只读或“暂未开放”，不能新增经济写入口。

### 顶部系统图标

可见元素：

- 好友/社交图标。
- 邮件图标。
- 设置齿轮。
- 菜单图标，右上有红点。

需要开发：

- 好友/社交：好友列表、申请、黑名单、最近互动、赠送体力入口。
- 邮件：系统邮件、奖励邮件、公告邮件、领取状态、批量领取。
- 设置：音效、音乐、画质、语言、账号、安全、客服、隐私协议、退出登录。
- 菜单：更多功能集合，例如公告、排行榜、兑换码、客服、社区、战斗记录、图鉴快捷入口。
- 红点系统：统一红点数据模型、优先级、清除规则、跨入口同步。

## 左侧活动列表

可见条目：

- `活动`：倒计时 `21:47:56`。
- `深渊召唤`：状态 `UP召唤中`。
- `圣契之路`：倒计时 `15天 21小时`。
- `黑市`：状态 `刷新中`。
- `首充礼包`：倒计时 `05:47:56`。

每个条目都有图标、标题、状态/倒计时和红点。

需要开发：

- 活动中心：活动列表、详情页、任务进度、奖励预览、领取状态。
- 限时召唤入口：卡池展示、UP 信息、倒计时、概率说明。当前阶段仅预留，不开放抽卡。
- 圣契之路：成长通行证/阶段任务/里程碑奖励。
- 黑市：限时商店、刷新倒计时、商品列表。当前阶段仅预留。
- 首充礼包：充值/礼包入口。当前阶段必须保持关闭或占位，不能接入真实支付/领取。
- 活动倒计时服务：本地展示必须以后端时间为准，避免客户端改时间。
- 运营配置：活动图标、排序、开始/结束时间、红点、跳转目标。

## 中央场景玩法入口

可见功能点：

- `召唤祭坛`
- `公会`
- `排行榜`
- `旅者集会`
- `熔铸工坊`
- `商店`
- `深渊之门`
- `战役 第24章 暗影回廊`

需要开发：

- 场景热点系统：每个建筑入口有点击区域、标签、红点、锁定态、开放条件、引导高亮。
- 召唤祭坛：抽卡入口、卡池列表、概率展示、历史记录。当前阶段只预留，不开放。
- 公会：公会信息、成员、申请、捐献、活动。未开放时显示解锁条件。
- 排行榜：战力、关卡、Boss、竞技、深渊等榜单。
- 旅者集会：可能对应社交、委托、集市、公告或旅团活动，需要二次定义。
- 熔铸工坊：装备打造、强化、分解、材料合成。当前阶段只预留。
- 商店：普通商店、兑换商店、礼包商店。当前阶段只预留。
- 深渊之门：深渊玩法入口，展示层数、进度、奖励、挑战按钮。
- 战役：主线章节入口，展示当前章节、关卡进度、推荐战力、扫荡/挑战入口。

## 右侧挑战卡片

可见卡片：

- `世界BOSS`：状态 `挑战中`。
- `无尽深渊`：进度 `120层`。
- `跨服竞技`：状态 `赛季进行中`。
- `资源副本`：状态 `今日双倍`。

需要开发：

- 卡片组件：背景图、标题、状态标签、进度、红点、倒计时、跳转。
- 世界 Boss：Boss 信息、开放时间、伤害排行、奖励预览、挑战记录。
- 无尽深渊：当前层数、历史最高层、层奖励、排行榜。
- 跨服竞技：赛季信息、段位、排名、匹配入口、赛季奖励。
- 资源副本：副本类型、剩余次数、今日加成、推荐战力、扫荡入口。

## 底部导航

可见元素：

- 左下角罗盘/世界入口。
- 常驻导航：`英雄`、`背包`、`圣契`、`图鉴`、`任务`、`锻造`、`商店`。
- 部分按钮带红点。
- 底部聊天栏：示例 `[世界] LootChain: 欢迎来到LootChain的世界!`
- 右下角主按钮：`冒险 24-15 暗影之堡`。

需要开发：

- 底部导航容器：图标、文字、红点、选中态、未开放态。
- 英雄：英雄列表、详情、升级、升星、觉醒、装备。经济写入口未开放前只做只读或占位。
- 背包：道具列表、分类、详情、使用/出售。当前阶段不开放写入口。
- 圣契：可能对应通行证、契约系统或成长线，需要产品二次定义。
- 图鉴：英雄、怪物、装备、成就收集。
- 任务：主线、每日、周常、成就、活动任务。
- 锻造：装备打造/强化入口，当前阶段只预留。
- 商店：商店入口，当前阶段只预留。
- 聊天：频道切换、消息列表、发送框、系统公告、屏蔽/举报。
- 冒险主按钮：当前主线关卡、章节名、推荐战力、继续挑战、扫荡、剧情入口。

## 横向基础系统

为了支撑大厅，需要先开发这些基础能力：

- HUD 适配：根据 Cocos 可视区域自适应顶部、底部、左右栏位置。
- 资源显示格式化：K/M/B、千分位、上限展示、颜色区分。
- 红点系统：模块级、入口级、子功能级红点聚合。
- 倒计时系统：统一服务端时间、暂停/恢复、跨天刷新。
- 模块开放条件：等级、主线进度、服务器开服天数、活动时间。
- 弹窗管理器：单弹窗、二级弹窗、遮罩、返回键、关闭恢复。
- 导航路由：场景入口到功能页的统一跳转。
- 引导系统：新手引导、强制点击、功能解锁提示。
- 空状态与未开放状态：所有未完成系统统一显示“暂未开放/敬请期待”。
- 音效与动效：点击、红点、倒计时、入口呼吸光、卡片 hover/press。

## 建议开发顺序

第一阶段，大厅壳与只读展示：

- 大厅背景与 HUD 框架。
- 左上玩家信息只读展示与资料弹窗。
- 顶部资源栏只读展示。
- 底部导航与中央热点占位。
- 右侧挑战卡片占位。
- 红点、倒计时、未开放弹窗基础组件。

第二阶段，低风险只读功能：

- 邮件列表只读/已读状态。
- 公告/活动详情只读。
- 排行榜只读。
- 图鉴只读。
- 主线章节展示。

第三阶段，受控写入口：

- 任务领取、邮件领取、背包使用、商店兑换、抽卡、英雄养成等必须等待服务端经济规则、事务、日志、风控和测试齐备后再开放。

## 当前边界

- 本文仅做产品拆解，不代表当前阶段已开放这些功能。
- 当前 Cocos 阶段仍以登录页、资源加载页、大厅背景页为准。
- 不开放 EX V1。
- 不新增任何经济写入口。
- 不改变概率、消耗、保底、奖励、USDT 审核、资金池释放等经济规则。

## 2026-05-28 阶段 1 实施记录

本轮开始大厅开发阶段 1，只落地参考图左上玩家信息区域与资料弹窗：

- `LootChainGameRoot` 大厅页从“资源准备完成”占位面板切换为 HUD 渲染链：`renderLobbyHud()` -> `renderLobbyPlayerInfo()`。
- 左上玩家信息入口包含头像框、等级、玩家名、战力、EXP 标识，并按 `stageLeft/stageTop/uiScale` 自适应定位。
- 点击玩家信息后打开 `LobbyProfilePanel` 只读资料弹窗，展示 UID、服务器、等级、经验、战力、体力、账号状态、登录方式、钱包绑定状态和脱敏钱包地址。
- 弹窗当前只有关闭能力，不开放复制 UID、修改昵称、换头像、退出登录、绑定钱包等写操作。
- Cocos 客户端新增 `PlayerProfileApi.lobbyProfile()`，只调用 `GET /api/player/me/lobby`。
- 阶段 1 未开放顶部资源栏、左侧活动、中央热点、右侧挑战卡片、底部导航、聊天、冒险按钮。
- 大厅阶段 1 已恢复动态背景视频：`VideoPlayer.stayOnBottom = true` 保持视频在 Canvas 底层，poster 只作为首帧兜底并在 `PLAYING` 后淡出，HUD 继续在 Canvas 上层渲染。
- 叠在背景上的大厅 UI 必须走统一舞台安全区：顶部、左侧、右侧、底部、弹窗都按 `stageLeft/stageRight/stageTop/stageBottom` 派生的 `safeLeft/safeRight/safeTop/safeBottom` 定位。
- 后续新增顶部资源栏、左侧活动、右侧挑战卡、底部导航和中央热点时，必须同步补 `scripts/check-layout.mjs` 多分辨率边界校验，避免只在当前预览分辨率下“碰巧正确”。

### 左上玩家信息 UI 深化

- 左上玩家信息从普通矩形卡片改为参考图方向的徽章式铭牌：大头像徽章 + 右侧半透明暗金底纹 + 三层文字排版。
- 头像不再使用缩写圆牌，改为运行时绘制的盔甲头像剪影、金属圆环和放射形外框。
- EXP 标识改为贴附在头像底部的小铜金牌。
- 玩家名旁增加小型金色徽记，战力下方增加细金线和红色菱形收尾，弱化现代卡片感。
- 左上组件使用 `lobbyHudScale()` 控制缩放下限，避免小分辨率下 UI 缩得无法识别。
- 返修约束：避免卡通化的放射三角、过亮边框和大面积实体色；头像框应保持暗金属、低饱和、细节克制。
- 返修约束：左对齐文字坐标必须按文本框左边界处理，不能再使用节点中心点导致文字压住头像。
- 返修约束：左上铭牌不显示接口状态调试文案，避免污染大厅 HUD。
- 最终方向：左上铭牌主体改为高质量图片资产 `assets/resources/ui/lobby/lobby_player_info_panel.png`，代码只覆盖动态文字和点击区域，避免用 Graphics 手绘导致品质和参考图差距过大。
- Stage 1A 修正：铭牌使用 `lobbyHudEdgeInset()` 贴近参考图左上角，仍由舞台安全区派生；动态文字宽度收窄，避开图片资产中央饰件。
- Stage 1A 修正：玩家名与战力开启文本缩放，所有铭牌动态文字增加黑色描边，提高背景视频播放时的可读性。
- Stage 1A 修正：图片资产首帧未加载时，兜底 Graphics 铭牌会补绘头像，避免出现只有框和文字的空状态。

## 2026-05-29 Stage 1B top-left HUD visual acceptance update

- The provided top-left player reference has been translated into the current Cocos-only lobby HUD as a compact `540x218` logical composition.
- The project asset `assets/resources/ui/lobby/lobby_player_info_panel.png` was rebuilt at `1080x436` so the avatar frame, EXP plate, dark fantasy backing, and underline stay sharp after Cocos scaling.
- Runtime text remains dynamic instead of baked into the bitmap: `Lv`, player name, combat power, and `EXP` are rendered by `LootChainGameRoot.renderLobbyPlayerInfo()` with shrink-safe boxes.
- The previous overlap root cause was addressed by removing the `1600x577` layout dependency and zeroing SpriteFrame trim metadata for the new asset grid.
- Layout guardrails now include HUD asset dimensions, trim metadata, internal text slot separation, avatar safe-zone separation, and multi-resolution bounds.
- Stage boundary unchanged: this is read-only lobby display work only; no gacha, hero, bag, USDT, fund-pool, EX V1, or economy write surface was opened.

### Revision

- The first rebuilt bitmap still read as a custom panel and was not close enough to the reference. It has been replaced with an art-only asset: high-quality portrait/frame/EXP on the left, transparent right-side text area, and no heavy dark backing panel.
- The runtime name sigil is now a thin gold anchor-like shape, and the combat underline is a plain thin gold line without the red diamond ornament.

### High Quality Avatar Frame Regeneration

- The screenshot-crop avatar frame was replaced with a newly generated high-resolution dark-fantasy avatar medallion from imagegen.
- The green-screen generated source was locally keyed to transparency, despilled, scaled, and composited into `assets/resources/ui/lobby/lobby_player_info_panel.png` on the same `1080x436` HUD canvas.
- The right-side player text area remains transparent and driven by Cocos runtime labels; only the avatar medallion and blank EXP plate are bitmap art.

### Profile Dialog Close Flash Fix

- The top-left player profile dialog is now treated as an overlay layer instead of a full lobby rerender trigger.
- Closing the dialog removes only `LobbyProfileDim` and `LobbyProfilePanel`, so the lobby poster/video background remains stable and the login background should not flash through.
- Profile data refresh updates only the HUD/profile overlay nodes.

### Stage 1C Top Resource Bar Implementation

- Implemented the first top-resource-bar pass in the Cocos lobby HUD.
- Current resources:
  - Stamina: read from `PlayerLobbyProfileVO.stamina/maxStamina`.
  - Coin/ruby/crystal: visible as reference-style visual placeholders only, because no read-only asset summary contract is in scope yet.
- The implementation intentionally excludes any obtain/purchase/claim path. Resource cells are visual HUD cells, and their visible `+` marks are disabled art only.
- The resource bar adaptively drops lower-priority placeholder cells on narrower stages, and hides entirely only if there is no safe space beside the player HUD.
- `scripts/check-layout.mjs` mirrors the placement formula and checks the resource bar against desktop, tablet, mobile landscape, mobile portrait, and minimum viewport geometry.
- This completes the "top resource bar read-only display" item from Stage 1 without changing economy rules, opening EX V1, or adding an economy write surface.

### Stage 1D Reference-Style HUD Skeleton

- Implemented a broader lobby HUD skeleton based on `docs/ui-reference/dragonheir/lobby/lobby.png`.
- Added top-right system icons, left activity rail, center scene hotspot plaques, right challenge cards, bottom navigation, chat preview, compass, and red adventure button.
- The visual direction is dark-gold gothic UI with thin transparent panels, icon medallions, red-dot markers, and restrained labels over the lobby video/background.
- Current implementation uses Cocos `Graphics` and dynamic labels rather than bitmap screenshot crops, so the UI remains sharp and editable.
- All module entries remain placeholder-only in this stage. Buttons do not call gacha, hero, bag, shop, reward, fund-pool, or other economy/gameplay write APIs.
- `scripts/check-layout.mjs` was extended to validate the new HUD regions across the existing multi-viewport set.

### Stage 1D Interaction Refinement

- Center scene function-point labels should be treated as labels attached to buildings, not independent floating menu buttons.
- The current implementation moves labels closer to their matching background buildings and increases label font size to better match the reference image proportions.
- Every center function point now has an invisible building hit area. Hovering or clicking the building area triggers the same placeholder content as the visible label.
- Clicking a building or label plays a short red-gold click pulse to make the interaction visible.
- These hotspots remain locked placeholders in the current stage. They must not call economy/gameplay write APIs until the corresponding module, backend contract, risk controls, and tests are explicitly opened.

### Stage 1D Hotspot Alignment Correction

- The first transparent-hit-area pass was visually too broad in preview and did not match the building silhouettes well enough.
- Hotspot data should remain per-building, not shared:
  - Label position and label width are separate from the clickable building hit area.
  - Building hit areas should cover the visible building mass only, not the whole surrounding scenery.
  - Hover should not expose full hit-area rectangles; it should use small local target/glow feedback.
- Current implementation follows that rule with independent coordinates for summon altar, guild, ranking, traveler gathering, forge, abyss gate, campaign, and shop.

### Stage 1D Hotspot Alignment Correction V2

- The second correction is calibrated to the active 16:9 lobby poster, not only to the 1536x1024 reference crop.
- Center labels are now smaller and closer to building-nameplate scale, with revised anchors for all eight center function points.
- Building hit areas are intentionally narrower than the visible plaque area where needed, so hover/click feels tied to the building rather than to empty scenery.
- The stage boundary remains unchanged: all entries are local unopened placeholders and no economy/gameplay write API is called.

### Stage 1D Module Split

- `LootChainGameRoot` should remain the scene root, not the long-term home for every lobby UI detail.
- Lobby HUD implementation is now separated into:
  - `LobbyHudRenderer.ts` for actual Cocos node rendering and local UI interaction.
  - `LobbyHudConfig.ts` for adjustable visual/content data, especially central hotspot anchors and hit areas.
  - `LobbyHudTypes.ts` for HUD contracts, constants, and type definitions.
- Future central-hotspot visual tuning should start in `LobbyHudConfig.ts`, then rely on `scripts/check-layout.mjs` for bounds validation.
- The split is intentionally UI-only and does not change module-opening status. All entries remain placeholder-only until backend contracts and risk controls are explicitly opened.
