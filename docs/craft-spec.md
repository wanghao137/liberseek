# 龙鳞装工艺规格

状态：规划基线

## 目的

本文定义鳞卷工坊第一版使用的龙鳞装/旋风装工艺模型和几何规则。编辑器、预览、导出、测试和组装说明都必须引用同一套规则。

## 标准单位

项目内部以厘米作为标准设计单位。

只在渲染和导出边界转换为像素：

```text
px = round(cm / 2.54 * dpi)
cm = px / dpi * 2.54
```

默认导出精度：

```text
dpi = 300
```

所有公式应实现为 `binding` 模块中的纯函数。

## 结构模型

龙鳞装包含以下结构：

- 底卷：承载整件作品的长纸或底衬。
- 正面长卷：完全展开时看到的长卷画面。
- 背面长卷：收卷或查看鳞片边缘时参考的背面画面。
- 叶片：粘贴在底卷上的单页。
- 粘贴区：叶片固定在底卷上的区域。
- 可视区：叶片展开后承载图像或文字的区域。
- 鳞片露出区：连续错位后形成“龙鳞”效果的边缘。

MVP 先实现横向龙鳞装。纵向装帧在横向导出稳定后再扩展。

## 默认预设

第一版默认预设：

```text
artworkHeightCm = 30
visiblePageWidthCm = 22
pasteWidthCm = 2
sliceWidthCm = 2
leafCount = 23
edgeStyle = straight
orientation = horizontal
dpi = 300
```

中文含义：

- 画心高度：30cm
- 页面可视宽度：22cm
- 粘贴宽度：2cm
- 鳞片露出宽度：2cm
- 叶片数量：23
- 边缘样式：直边
- 方向：横向
- 导出 DPI：300

## 核心术语

### 画心高度

打印作品的有效高度，字段为 `artworkHeightCm`。

### 页面可视宽度

单个叶片展开后可见部分的宽度，不包含粘贴区，字段为 `visiblePageWidthCm`。

### 粘贴宽度

叶片固定到底卷上的宽度，字段为 `pasteWidthCm`。

### 鳞片露出宽度

相邻叶片之间的水平错位距离，也是默认模型中的鳞片露出宽度，字段为 `sliceWidthCm`。

MVP 中粘贴宽度和鳞片露出宽度默认同为 2cm，但数据模型必须分开保存。

### 叶片物理宽度

```text
leafPhysicalWidthCm = pasteWidthCm + visiblePageWidthCm
```

### 长卷画心长度

```text
scrollArtworkLengthCm = visiblePageWidthCm + leafCount * sliceWidthCm
```

该值不包含额外首尾留边或装裱尾纸。

### 页面结构数

```text
pageStructureCount = leafCount + 1
```

该值用于描述底卷结构加叶片序列，不等同于最终导出的文件数量。导出规格必须单独说明每类文件。

## 叶片排布

叶片从左到右按固定错位排布：

```text
leaf[i].xCm = i * sliceWidthCm
leaf[i].yCm = 0
leaf[i].widthCm = pasteWidthCm + visiblePageWidthCm
leaf[i].heightCm = artworkHeightCm
leaf[i].pasteRect = {
  xCm: 0,
  yCm: 0,
  widthCm: pasteWidthCm,
  heightCm: artworkHeightCm
}
leaf[i].visibleRect = {
  xCm: pasteWidthCm,
  yCm: 0,
  widthCm: visiblePageWidthCm,
  heightCm: artworkHeightCm
}
```

编辑器必须明确显示粘贴区和可视区。最终干净导出不应包含施工线，除非用户选择导出辅助版。

## 留边

MVP 可先隐藏留边设置，但模型应预留字段：

```text
marginStartCm = 0
marginEndCm = 0
marginTopCm = 0
marginBottomCm = 0
```

底卷总尺寸：

```text
scrollBaseLengthCm =
  marginStartCm + scrollArtworkLengthCm + marginEndCm

scrollBaseHeightCm =
  marginTopCm + artworkHeightCm + marginBottomCm
```

## 图片角色

### 正面长卷

映射到长卷画心区域：

```text
widthCm = scrollArtworkLengthCm
heightCm = artworkHeightCm
```

### 背面长卷

使用同样的物理画心区域，可用于卷动预览或鳞片边缘检查。

### 内页叶片

每张内页图映射到一个叶片可视区：

```text
widthCm = visiblePageWidthCm
heightCm = artworkHeightCm
```

粘贴区可留白、延展边缘或显示施工标记，取决于导出模式。

## 边缘样式

MVP 支持：

- `straight`：直边。
- `wave`：波浪边。
- `sawtooth`：锯齿边。

边缘样式只影响显示/导出遮罩，不改变几何排布公式。

## 图片适配

MVP 支持：

- `cover`：填满目标区域，超出部分裁切。
- `contain`：完整显示图片，可能留空。

默认：

```text
fitMode = cover
```

变换参数非破坏性保存：

```text
transform = {
  xCm,
  yCm,
  scale,
  rotationDeg,
  cropRect
}
```

## 校验规则

硬错误：

- 画心高度小于或等于 0。
- 页面可视宽度小于或等于 0。
- 粘贴宽度小于或等于 0。
- 鳞片露出宽度小于或等于 0。
- 叶片数量小于 1。
- 导出 DPI 小于或等于 0。
- 导出所需图片缺失。
- 项目 schema 版本不支持且无法迁移。

警告：

- 源图分辨率低于导出目标。
- PDF 物理页面超出常见打印能力。
- 鳞片露出宽度大于粘贴宽度。
- 粘贴宽度过窄，不利于手工组装。
- 上传内页数量与叶片数量不一致。
- 长卷长度可能不适合家用打印机。

## 分辨率参考

目标区域像素：

```text
targetWidthPx = round(widthCm / 2.54 * dpi)
targetHeightPx = round(heightCm / 2.54 * dpi)
```

30cm 高、300DPI 时：

```text
round(30 / 2.54 * 300) = 3543 px
```

编辑器可以低分辨率预览，但导出检查必须按真实目标像素计算。

## 测试用例

### 默认预设

输入：

```text
artworkHeightCm = 30
visiblePageWidthCm = 22
pasteWidthCm = 2
sliceWidthCm = 2
leafCount = 23
```

期望：

```text
leafPhysicalWidthCm = 24
scrollArtworkLengthCm = 68
pageStructureCount = 24
```

### 更宽鳞片

输入：

```text
visiblePageWidthCm = 22
pasteWidthCm = 2.5
sliceWidthCm = 2.5
leafCount = 10
```

期望：

```text
leafPhysicalWidthCm = 24.5
scrollArtworkLengthCm = 47
```

### 非法鳞片宽度

输入：

```text
sliceWidthCm = 0
```

期望：硬错误。

## 待决策

- P0 是否导出长卷底纸分片，还是只导出完整长图。
- `sliceWidthCm > pasteWidthCm` 是保持警告，还是高级模式外直接报错。
- 纵向装帧是否进入 MVP。
- 正/背长卷是否所有导出都必需，还是只在完整组装导出中必需。
