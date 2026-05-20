# LootChain 美术与特效资源规范

本文件用于约束登录页、后续大厅、抽奖、英雄、Boss、战斗特效的资源生成与接入方式。所有资源必须是 LootChain 原创表达，禁止复制参考游戏截图、Logo、角色、图标或素材。

## 当前阶段

当前仍是第一阶段登录验收。

- Vue Web/H5 负责登录 UI、按钮、状态、接口联调，不再承载全屏 Canvas 2D 粒子/火焰循环。
- Cocos Creator 负责登录页特效层 V1 原型，并作为后续战斗、技能、Boss、怪物、英雄动作的长期承载。
- 登录验收通过前，不制作大厅，不开放抽卡、英雄、背包、队伍、装备、商店、副本、Boss、资金池等入口。

## 登录页特效层 V1

已预置 Cocos 脚本：

```text
assets/scripts/scenes/LootChainLoginEffectLayer.ts
```

使用方式：

1. 在 Cocos Creator 中打开 `D:\project\lootchain-cocos`。
2. 在 Canvas 下创建空节点 `LoginEffectLayer`。
3. 将 `LootChainLoginEffectLayer` 组件挂到该节点。
4. 该节点只负责透明特效层：云层、深渊红核心、红色光束、漂浮宝石光晕、火焰、灰烬。
5. Vue 登录页仍负责真实按钮和 `dev-login` 逻辑；动态火焰、红色天象、灰烬等高频特效走 Cocos 或正式序列帧/粒子资源。

当前脚本不依赖外部贴图，后续可逐步替换为贴图、序列帧、Spine、粒子和 shader。

## 性能边界

- 不再在 Vue 登录页使用全屏 Canvas 2D 每帧重绘特效。
- Web/H5 UI 层只保留背景、按钮、状态、轻量 CSS 过渡和少量低频氛围动画。
- 高频粒子、火焰、红光、光束、宝石漂浮优先放到 Cocos WebGL、序列帧或正式粒子系统中。
- Cocos 特效同样需要控制粒子数量、贴图尺寸、混合层数和后处理，不能默认视为无限性能。

## 登录页资源生成清单

建议由美术/生成 Agent 按以下资源切图，统一保持暗黑哥特、黑金、深渊红、永夜城堡风格。

| 资源 | 建议规格 | 用途 | 备注 |
| --- | --- | --- | --- |
| 登录背景主图 | 2048x3072 PNG/WebP | Web/H5 竖版主视觉 | 必须原创，不复制参考图 |
| 云层透明图 A/B | 2048x512 PNG | 顶部云层慢速漂移 | 透明背景，灰黑紫红 |
| 深渊红核心 | 512x512 PNG | 顶部红色天象 | 可做 8-16 帧呼吸序列 |
| 红色光束 | 128x1536 PNG | 中央垂直能量束 | 透明背景，可叠加混合 |
| 宝石光晕 | 512x768 PNG | 中央宝石漂浮与脉冲 | 透明背景 |
| 火焰序列帧 | 每帧 512x512，12-24 帧 | 下方左右火焰 | 透明背景，循环自然 |
| 灰烬粒子 | 64x64 PNG | 粒子系统贴图 | 圆点/火星/碎屑均可 |
| 黑金按钮边框 | 1024x160 PNG，九宫格友好 | 登录按钮与后续大厅按钮 | 避免文字烘焙进图 |

## Spine / 龙骨 / 序列帧策略

- 英雄、Boss、怪物优先使用 Spine 或 Cocos 原生动画承载骨骼动作。
- 如果采用 DragonBones/龙骨，需要先确认 Cocos Creator 3.8.8 项目中的运行时或插件兼容性；未确认前不作为唯一方案。
- 大型技能、抽奖爆光、Boss 入场可以使用序列帧 + 粒子 + shader 混合实现。
- 小型 UI 光效、火星、灰烬、边框扫光可先用粒子或 shader，不必做骨骼。

## 资源命名建议

```text
assets/resources/vfx/login/cloud_layer_a.png
assets/resources/vfx/login/cloud_layer_b.png
assets/resources/vfx/login/abyss_core.png
assets/resources/vfx/login/red_beam.png
assets/resources/vfx/login/gem_aura.png
assets/resources/vfx/login/fire_loop_0001.png
assets/resources/vfx/login/ember.png
assets/resources/ui/login/button_gold_frame.png
```

Vue Web/H5 使用的临时或正式位图放在：

```text
web-vue/src/assets/
```

## 生成提示词方向

美术生成 Agent 可按以下方向生成，不要直接要求复刻某款现有游戏：

```text
LootChain Covenant of Eternal Night, original dark gothic fantasy mobile game login screen asset,
black gold UI, abyss red celestial core, chained floating crimson crystal, eternal night castle,
storm clouds, ritual fire, ash particles, high detail, cinematic lighting, transparent PNG layer when requested,
no existing game logo, no copied character, no copyrighted UI icons
```

## 验收要求

- Web/H5 宽屏和手机竖屏均可读、可点击、无横向溢出。
- 登录按钮仍调用 `POST /api/player/auth/dev-login`。
- 登录成功后仍只显示第一阶段登录验收状态。
- 不新增真实经济写入口。
- 不改变概率、消耗、保底、奖励、USDT 审核、资金池释放或 EX 获取规则。
