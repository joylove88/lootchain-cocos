
LootChain 完整动态素材包 v3

这版包含：
1. 横向体积云带素材，而不是简单卡通旋涡。
2. dragon/ 下有分层龙素材：body_back, body_mid_01, body_mid_02, body_front, head, tail。
3. cloak/ 下有左右披风图层，可做轻微风动。
4. particles/ 下有云雾、地雾、披风风雾、灰烬、宝石光效素材。
5. scripts/ 下有 Cocos 脚本。

注意：
dragon 分层是从你认可的龙画面中做近似分层提取，用于 Cocos 动态原型。
如果需要电影级精度，最终仍建议让美术/AI单独输出无背景龙的多段 PSD/PNG。
但这版已经不是“只有龙眼”的测试包了。

天空正确做法：
- sky_cloud_*_band_* 做横向云带节点，挂 VortexBandMotion。
- p_cloud_* 粒子贴图做 VortexEmitterOrbit。
- 不要再只旋转一整张圆形云图。
