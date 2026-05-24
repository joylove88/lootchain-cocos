# Spine 黑龙对位修正版：为什么 cropped 部件对不上参考图

## 原因

你现在拖进去的是 `parts_cropped` 里的裁切图。裁切图的问题是：

- 每张 PNG 的画布大小不同；
- 每张 PNG 的中心点不同；
- Spine 拖入舞台时，会把图片中心放到你鼠标松开的位置；
- 它不会记得这块身体原来在完整龙姿势里的位置。

所以部件不会自动和底层参考图重合。不是你手残，是我前面的教程把“裁切图需要坐标还原”说得不够醒目，坐标系这种东西果然很会偷袭人类。

## 最简单解决方案

改用本包里的：

```txt
parts_full_canvas_aligned/
```

这些图片已经放在完整姿势画布里，每张都是 `832 × 831` 的透明 PNG。

### 操作步骤

1. 删除或隐藏你现在已经拖进去的旧 `parts_cropped` 部件。
2. 保留参考图 `references/assembled_full_pose_transparent.png`。
3. 选中参考图，在左下角 Transform 设置：

```txt
Translate X = 0
Translate Y = 0
Scale X = 1
Scale Y = 1
Rotation = 0
```

4. 在右下角 `Color` 色块里，把 Alpha 调到 35% ~ 50%。
5. 取消勾选右下角的 `Export`。
6. 从 `parts_full_canvas_aligned` 拖入身体部件。
7. 每个部件都设置：

```txt
Translate X = 0
Translate Y = 0
Scale X = 1
Scale Y = 1
Rotation = 0
```

这样就会直接和参考图重合。

## 推荐 Draw Order

```txt
P01_head_neck_and_upper_curl
P02_upper_mid_sweep
P03_right_descending_turn
P04_middle_left_sweep
P05_lower_left_u_turn
P06_lower_front_sweep
P07_tail_tip_taper
```

## 如果正式项目要用 cropped 图

正式项目可以用 `parts_cropped_aligned`，但必须按这个文件里的坐标填：

```txt
spine_setup/spine_aligned_pose_layout.json
```

把对应 `spine_position_for_cropped.x/y` 填到 Spine 左下角 Transform 的 Translate X / Y 里。

## Trial 版注意

Trial 版不能保存和导出，所以现在只建议你练习流程。正式绑骨、Mesh、Weights、导出到 Cocos，还是要用正式版。工具链真是会挑地方收钱。
