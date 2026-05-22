# LootChain 美术与特效资源规范

本文件用于约束登录页、后续大厅、抽奖、英雄、Boss、战斗特效的资源生成与接入方式。所有资源必须是 LootChain 原创表达，禁止复制参考游戏截图、Logo、角色、图标或素材。

## 当前阶段

当前仍是第一阶段登录验收。

- Cocos Creator 负责登录页完整 UI、背景、动态特效、按钮、弹框、状态和接口联调。
- 不再使用 Vue Web/H5 作为登录页验收入口。
- 登录验收通过前，不制作大厅，不开放抽卡、英雄、背包、队伍、装备、商店、副本、Boss、资金池等入口。

## 登录页 Cocos 资源分层

当前建议按以下层级组织：

```text
Canvas
  BG_Main
  Sky_Effects
  Dragon_Layer
  FG_Architecture
  Crystal_Effects
  Character_Effects
  Foreground_Effects
  LootChainGameRoot
```

- 背景主图、建筑、人物、巨龙、宝石等大图层放在场景节点中。
- 云层、红色天象、火焰、灰烬、披风、脚边烟雾等高频动态效果优先使用 Cocos 粒子、序列帧、shader 或骨骼动画。
- `LootChainGameRoot` 只负责登录 UI、弹框、输入框、占位按钮、状态提示和 `dev-login`。
- 不再由 UI 脚本绘制旧黑底、旧宝石和旧程序化背景。

## 性能边界

- Cocos/WebGL 更适合承载游戏动态特效，但仍需要控制粒子数量、贴图尺寸、混合层数和后处理。
- 首屏登录页建议桌面同时活跃粒子不超过 2500。
- 单个粒子贴图建议 256x256 或以下，少量主特效可到 512x512。
- 火焰、烟雾、云层优先使用少量大粒子 + 序列帧，不使用大量小粒子堆叠。
- 低性能模式后续可关闭烟雾、降低云层和火星数量，但不改变登录交互。

## 登录页资源生成清单

建议由美术/生成 Agent 按以下资源切图，统一保持暗黑哥特、黑金、深渊红、永夜城堡风格。

| 资源 | 建议规格 | 用途 | 备注 |
| --- | --- | --- | --- |
| 登录横版背景主图 | 2560x1440 PNG/WebP | Cocos 登录背景 | 必须原创，不包含 UI/文字/Logo |
| 左上 Logo | 1024x320 PNG，透明 | 登录页品牌 | 可含 LootChain 字样 |
| 主登录按钮底图 | 1024x180 PNG，九宫格友好 | 账号登录、进入游戏 | 避免文字烘焙进图 |
| 右侧占位按钮 | 每个 256x256 PNG，透明 | 谕言/客服/公告/修复 | 每个按钮独立切图 |
| 云层透明图 A/B/C | 2048x512 PNG | 顶部横向云层漂移 | 分层横向运动 |
| 深渊红核心 | 512x512 PNG 或 16 帧序列 | 顶部红色天象 | 呼吸、旋转、脉冲 |
| 红色光束 | 128x1024 PNG | 中央能量束 | 透明背景，叠加混合 |
| 宝石光晕 | 512x768 PNG | 中央宝石漂浮与脉冲 | 透明背景 |
| 火焰序列帧 | 每帧 512x512，12-24 帧 | 下方左右火焰 | 透明背景，循环自然 |
| 烟雾序列帧 | 每帧 512x512，16-24 帧 | 角色脚边烟雾 | 低透明、低粒子数 |
| 灰烬粒子 | 64x64 PNG | 粒子系统贴图 | 圆点/火星/碎屑均可 |

## Spine / 龙骨 / 序列帧策略

- 英雄、Boss、怪物优先使用 Spine 或 Cocos 原生动画承载骨骼动作。
- 登录页人物披风和巨龙局部动作可优先采用 Spine/龙骨或分层网格动画；资源未到位前可用序列帧和粒子过渡。
- 如果采用 DragonBones/龙骨，需要先确认 Cocos Creator 3.8.8 项目中的运行时或插件兼容性；未确认前不作为唯一方案。
- 大型技能、抽奖爆光、Boss 入场可以使用序列帧 + 粒子 + shader 混合实现。
- 小型 UI 光效、火星、灰烬、边框扫光可先用粒子或 shader，不必做骨骼。

## 资源命名建议

```text
assets/resources/login-bg/bg_base_final.png
assets/resources/vfx/login/cloud_layer_a.png
assets/resources/vfx/login/cloud_layer_b.png
assets/resources/vfx/login/abyss_core.png
assets/resources/vfx/login/red_beam.png
assets/resources/vfx/login/gem_aura.png
assets/resources/vfx/login/fire_loop_0001.png
assets/resources/vfx/login/ember.png
assets/resources/ui/login/button_gold_frame.png
assets/resources/ui/login/side_btn_oracle.png
```

## 生成提示词方向

美术生成 Agent 可按以下方向生成，不要直接要求复刻某款现有游戏：

```text
LootChain Covenant of Eternal Night, original dark gothic fantasy game login screen asset,
black gold UI, abyss red celestial core, chained floating crimson crystal, eternal night castle,
storm clouds, ritual fire, ash particles, cinematic lighting, transparent PNG layer when requested,
no existing game logo, no copied character, no copyrighted UI icons
```

## 验收要求

- Cocos 预览中登录页可读、可点击、无重叠。
- 登录按钮仍调用 `POST /api/player/auth/dev-login`。
- 登录成功后仍只显示第一阶段登录验收状态。
- 不新增真实经济写入口。
- 不改变概率、消耗、保底、奖励、USDT 审核、资金池释放或 EX 获取规则。
