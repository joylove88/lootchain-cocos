# LootChain 登录页 Cocos 动态特效最终方案

## 目标

当前登录页第一阶段只做登录验收。背景、天空、龙、人物披风、脚边烟雾、按钮、弹框、输入框和状态提示统一在 Cocos 内实现；HTML/Vue/CSS/H5 不再承担登录页内容或验收。

参考目标为 `C:\Users\axian\Desktop\video_2026-05-21_13-20-44.mp4`。当前 Cocos 效果为 `C:\Users\axian\Desktop\content.mp4`。

## 对比结论

当前版本的问题：

- 天空云层更像整张旋涡图绕中心竖向旋转，云带方向互相反向但缺少横向穹顶流动。
- 目标视频里的天空是横向铺开的天穹旋涡，云带沿左右方向流动，分前中后三层，红色裂隙像在云层中横向卷动。
- 目标视频的龙不是只靠眼部粒子，需要头部、颈部或外轮廓有轻微呼吸/压迫感。
- 人物披风不能只靠静态底图，需要暗红风丝、黑雾、边缘阴影层做伪布料飘动。
- 人物脚边和地面烟雾需要贴地横向漂移，不能做成大面积遮挡画面的前景雾。

## 最终实现路线

采用“静态高精底图 + 分层透明贴图 + Cocos 粒子 + 轻量脚本控制”的 2.5D 登录场景。

不建议继续让整张云层图片旋转。天空应拆成多层横向云带：

1. `SkyBackCloud`：后景灰黑云，慢速从右向左。
2. `SkyMidRedCloud`：中景红色裂隙云，慢速从左向右。
3. `SkyFrontGlowCloud`：前景亮红云丝，稍快从右向左。
4. `BloodMoonCore`：中心黑红圆球，只做呼吸、微缩放、辉光波纹。
5. `SkyLightning`：低频闪电序列帧，只在 3-8 秒随机触发，不持续播放。

横向云层通过两张相同 Sprite 首尾拼接实现循环位移，超出宽度后回绕；每层叠加非常轻的 `scalePulse` 和 `opacityPulse`，形成云层活着的感觉。

## Cocos 节点结构

```text
Canvas
  BG_Base_Static
  SkyVortexRoot
    SkyMask
      SkyBackCloud_A
      SkyBackCloud_B
      SkyMidRedCloud_A
      SkyMidRedCloud_B
      SkyFrontGlowCloud_A
      SkyFrontGlowCloud_B
      BloodMoonCore
      BloodMoonHalo
      SkyLightning
      SkySparkParticle
  ArchitectureRoot
    FG_Architecture
    ArchitectureEdgeShadow
  DragonRoot
    DragonHeadOverlay
    DragonNeckShadow
    DragonEyeGlow
    DragonBreathSmoke
    DragonSpark
  CharacterWindRoot
    LeftCloakShadow
    RightCloakShadow
    LeftCloakWindParticle
    RightCloakWindParticle
    LeftSwordGlow
    RightSwordGlow
  CrystalRoot
    CrystalGlow
    CrystalAsh
    CrystalPulse
  GroundFogRoot
    LeftFootFog
    RightFootFog
    GroundAsh
  LootChainUIRoot
```

`LootChainUIRoot` 只放登录按钮、弹框、输入框、状态文本。背景和特效不再由 `LootChainGameRoot.renderSceneBackground()` 绘制。

## 脚本规划

### `SkyHorizontalVortexController.ts`

职责：

- 控制三层横向云带循环位移。
- 支持每层独立方向、速度、透明度呼吸、缩放呼吸。
- 根据 Cocos 预览视口调整云层宽度和 Y 轴位置。

建议参数：

```text
Back: speed=-8 px/s, opacity=90-130, scalePulse=0.004
Mid: speed=+14 px/s, opacity=120-180, scalePulse=0.006
Front: speed=-22 px/s, opacity=90-150, scalePulse=0.008
```

### `BloodMoonPulseController.ts`

职责：

- 控制红色圆球呼吸、光晕、短促闪烁。
- 不做大幅旋转，避免破坏目标视频的压迫感。

建议参数：

```text
scale=1.00-1.035
opacity=180-255
pulseSpeed=0.75
haloBurstInterval=4-7s
```

### `LightningRandomBurstController.ts`

职责：

- 随机播放闪电序列帧。
- 同步少量火星/亮尘粒子。
- 平时完全隐藏，避免页面持续闪烁。

建议参数：

```text
minInterval=3
maxInterval=8
frameDuration=0.035s
burstDuration=0.35-0.65s
```

### `DragonLoginMotionController.ts`

职责：

- 控制龙头/颈部透明层轻微呼吸。
- 控制龙眼辉光、龙息烟雾、红色火星。

如果只有底图里的静态龙，粒子只能做“龙在呼吸”的错觉，不能真正让龙身体动。要达到目标视频级别，需要至少提供独立透明龙头/颈部/眼部光层。

建议参数：

```text
headMoveX=1.5-3px
headMoveY=1-2px
scalePulse=0.006-0.012
eyeGlowOpacity=160-255
breathSmokeEmission=4-8
sparkEmission=2-5
```

### `CloakWindController.ts`

职责：

- 人物披风边缘用暗红/黑灰粒子做风动。
- 披风阴影透明层轻微横向摆动。

如果要真正披风布料波动，需要单独披风透明层或 Spine/网格变形。当前阶段可先用粒子与阴影层做低成本伪动态。

建议参数：

```text
leftWindGravityX=-8
rightWindGravityX=8
emission=5-9
life=1.8-3.2s
startSize=22-45
endSize=60-120
alpha=0-70
```

### `GroundFogController.ts`

职责：

- 人物脚边和地面低位烟雾。
- 只贴地横向漂移，不遮挡主宝石、按钮和人物主体。

建议参数：

```text
emission=4-8
life=5-8s
startSize=90-180
endSize=240-420
opacity=15-55
gravityX=6 or -6
gravityY=0-2
```

### `LoginVfxQualityController.ts`

职责：

- 桌面高质量、桌面标准、低性能三档质量。
- 自动降低粒子数量、关闭前景大烟雾、减少闪电触发频率。

粒子预算：

```text
Desktop High: active particles <= 1500
Desktop Standard: active particles <= 1000
Low Performance: active particles <= 550
```

## 素材包目录

建议新增目录：

```text
assets/resources/login-vfx-final/
  README.txt
  sky/
  dragon/
  character/
  crystal/
  ground/
  particles/
  lightning/
  ui/
```

## 必需素材清单

### 天空云层

| 文件 | 尺寸 | 格式 | 用途 |
| --- | --- | --- | --- |
| `sky/sky_cloud_back_loop.png` | 2048x1024 | PNG 透明 | 后景灰黑横向云带，可左右无缝循环 |
| `sky/sky_cloud_mid_red_loop.png` | 2048x1024 | PNG 透明 | 中景暗红裂隙云，横向循环 |
| `sky/sky_cloud_front_glow_loop.png` | 2048x1024 | PNG 透明 | 前景亮红云丝，横向循环 |
| `sky/blood_moon_core.png` | 512x512 | PNG 透明 | 中心黑红圆球 |
| `sky/blood_moon_halo.png` | 1024x1024 | PNG 透明 | 圆球外圈辉光 |
| `sky/sky_vortex_mask_soft.png` | 2048x1024 | PNG 灰度 | 天穹椭圆遮罩，控制云层只在天空区域出现 |

### 闪电序列帧

| 文件 | 尺寸 | 格式 | 用途 |
| --- | --- | --- | --- |
| `lightning/lightning_red_01.png` - `lightning_red_16.png` | 768x1024 | PNG 透明 | 红色/红白闪电序列帧 |
| `particles/lightning_spark.png` | 64x64 | PNG 透明 | 闪电火星粒子 |
| `particles/lightning_dust.png` | 128x128 | PNG 透明 | 闪电亮尘粒子 |

### 龙动态层

| 文件 | 尺寸 | 格式 | 用途 |
| --- | --- | --- | --- |
| `dragon/dragon_head_overlay.png` | 1024x512 | PNG 透明 | 龙头独立层，轻微呼吸和位移 |
| `dragon/dragon_neck_shadow.png` | 1024x512 | PNG 透明 | 龙颈/身体暗影层，低透明摆动 |
| `dragon/dragon_eye_glow.png` | 256x256 | PNG 透明 | 龙眼红光 |
| `dragon/dragon_breath_smoke.png` | 512x512 | PNG 透明 | 龙口烟雾粒子 |
| `dragon/dragon_red_spark.png` | 64x64 | PNG 透明 | 龙息火星 |

### 人物披风与风

| 文件 | 尺寸 | 格式 | 用途 |
| --- | --- | --- | --- |
| `character/left_cloak_shadow.png` | 512x768 | PNG 透明 | 左人物披风暗影摆动层 |
| `character/right_cloak_shadow.png` | 512x768 | PNG 透明 | 右人物披风暗影摆动层 |
| `particles/cloak_dark_wisp.png` | 256x256 | PNG 透明 | 披风黑雾风丝粒子 |
| `particles/cloak_red_wisp.png` | 256x256 | PNG 透明 | 披风暗红风丝粒子 |
| `character/sword_glow_left.png` | 256x768 | PNG 透明 | 左剑红色辉光 |
| `character/sword_glow_right.png` | 256x768 | PNG 透明 | 右剑红色辉光 |

### 地面烟雾与灰烬

| 文件 | 尺寸 | 格式 | 用途 |
| --- | --- | --- | --- |
| `particles/ground_smoke_soft.png` | 512x512 | PNG 透明 | 贴地烟雾 |
| `particles/ground_smoke_dark.png` | 512x512 | PNG 透明 | 暗色低雾 |
| `particles/ash_particle.png` | 128x128 | PNG 透明 | 灰烬粒子 |
| `particles/red_ember.png` | 64x64 | PNG 透明 | 红色余烬 |

### 宝石与光束

| 文件 | 尺寸 | 格式 | 用途 |
| --- | --- | --- | --- |
| `crystal/crystal_glow.png` | 768x768 | PNG 透明 | 宝石辉光 |
| `crystal/crystal_pulse_ring.png` | 1024x1024 | PNG 透明 | 宝石脉冲环 |
| `crystal/blood_beam_soft.png` | 256x2048 | PNG 透明 | 顶部到宝石的柔光束 |

## 素材生成要求

所有素材必须满足：

- 不包含 UI、按钮、文字、Logo。
- 使用透明 PNG，发光层可用半透明红色/金色。
- 云层必须横向可循环，左右边缘不能有明显断层。
- 烟雾粒子必须边缘柔和，不要硬边、不用纯白。
- 龙和披风动态层必须和底图视角一致，不能重新画成不同姿态。
- 文件名使用英文小写和下划线，避免中文文件名影响 Cocos 导入。

## 可直接给美术 Agent 的生成提示词

### 横向天空云层

```text
dark gothic fantasy sky vortex cloud layer, horizontal ceiling-like swirling storm, crimson red lightning veins, transparent PNG, seamless horizontal loop, no buildings, no characters, no text, no logo, cinematic dark red and black, high detail, soft alpha edges, 2048x1024
```

### 龙头透明层

```text
black and gold abyss dragon head and neck overlay, side-top view matching a dark gothic login background, sharp horns, glowing red eyes, transparent PNG, no background, no text, no logo, cinematic detailed fantasy game art, 1024x512
```

### 披风风丝

```text
dark cloak wind wisp particle texture, black smoke mixed with subtle crimson ember edges, transparent PNG, soft alpha, no background, no text, game VFX particle sprite, 256x256
```

### 贴地烟雾

```text
low ground fog particle texture, dark gray smoke, soft transparent edges, horizontal drifting shape, no background, no text, game VFX particle sprite, 512x512
```

## 接入顺序

1. 清理当前重复脚本类名：`AlphaPulse`、`CloudLightningSync` 必须唯一。
2. 停用或移除旧代码绘制背景：`LootChainGameRoot.renderSceneBackground()` 不再生成登录背景。
3. 保留当前 `main.scene` 的 Cocos 背景节点，替换天空为横向循环云层。
4. 接入 `SkyHorizontalVortexController.ts`，先完成天空横向云带。
5. 接入 `DragonLoginMotionController.ts`，处理龙头、龙眼、龙息。
6. 接入 `CloakWindController.ts` 与 `GroundFogController.ts`。
7. 加入 `LoginVfxQualityController.ts`，提供桌面高质量和低性能降档两套粒子参数。
8. Cocos Preview 验收桌面 1280x720、1600x900、1920x1080。

## 验收标准

- 天空云层必须横向流动，不能像整张图绕中心竖向转盘。
- 前中后三层云移动方向不同，但整体视觉必须统一成一个天穹旋涡。
- 龙眼、龙息、龙头有轻微生命感，不抢走登录按钮和宝石主视觉。
- 披风风动只在人物边缘出现，不遮挡人物轮廓。
- 脚边烟雾贴地漂移，不覆盖按钮、不造成页面卡顿。
- 桌面高质量档稳定 55-60 FPS，低性能档稳定 30 FPS 以上。
- 不新增大厅、抽卡、英雄、背包、USDT、资金池、链上领取入口。
- 不改变任何经济规则、概率、奖励、EX 获取、USDT 审核、资金池释放规则。
