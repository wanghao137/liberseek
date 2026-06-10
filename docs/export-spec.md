# 鳞卷工坊导出规格

状态：规划基线

## 目的

本文定义鳞卷工坊 MVP 的导出格式。实现、测试和导出 README 都必须遵守该契约。

## 导出类型

MVP 导出类型：

1. 可编辑项目包。
2. 打印图片包。
3. PDF 包。
4. 中文 README 组装说明。

录制和水印导出属于后续阶段。

## 可编辑项目包

默认扩展名：

```text
.dscale.zip
```

项目包是 ZIP：

```text
project.dscale.zip
  project.json
  assets/
    front.<ext>
    back.<ext>
    leaves/
      <assetId>.<ext>
  previews/
    thumbnail.jpg
```

项目包必须能离线导入。

### project.json

必需字段：

```json
{
  "schemaVersion": 1,
  "app": "linjuan-workshop",
  "title": "未命名项目",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "settings": {
    "artworkHeightCm": 30,
    "visiblePageWidthCm": 22,
    "pasteWidthCm": 2,
    "sliceWidthCm": 2,
    "leafCount": 23,
    "edgeStyle": "straight",
    "orientation": "horizontal",
    "dpi": 300
  },
  "assets": [],
  "order": {
    "leaves": []
  },
  "transforms": {}
}
```

素材记录：

```json
{
  "id": "asset_...",
  "role": "front",
  "path": "assets/front.png",
  "name": "front.png",
  "mimeType": "image/png",
  "widthPx": 4000,
  "heightPx": 2400,
  "sha256": "optional"
}
```

变换记录：

```json
{
  "xCm": 0,
  "yCm": 0,
  "scale": 1,
  "rotationDeg": 0,
  "fitMode": "cover",
  "cropRect": null
}
```

### 密码保护

密码保护不属于 MVP。

如后续加入，必须：

- 使用用户提供的口令。
- 使用标准口令派生算法。
- 在包内保存 salt 和加密元数据。
- 不使用硬编码共享密钥。
- 不宣传“绝对防拷贝”。

## 打印图片包

默认文件：

```text
<项目名>-图片包.zip
```

建议结构：

```text
images.zip
  manifest.json
  README.txt
  scroll/
    front_full.png
    back_full.png
  frames/
    frame_001.png
    frame_002.png
    ...
  guides/
    placement_map.png
    calibration_10cm.png
```

### 命名规则

- frame 文件名必须补零且稳定。
- 叶片编号从 `frame_001` 开始。
- 文件顺序等于从左到右的物理组装顺序。
- 图片包必须包含 `manifest.json`。
- `README.txt` 必须列出组装所需的全部物理参数。

### 叶片图片尺寸

```text
frameWidthCm = pasteWidthCm + visiblePageWidthCm
frameHeightCm = artworkHeightCm
frameWidthPx = round(frameWidthCm / 2.54 * dpi)
frameHeightPx = round(frameHeightCm / 2.54 * dpi)
```

### 长卷图片尺寸

```text
scrollWidthCm = scrollArtworkLengthCm
scrollHeightCm = artworkHeightCm
scrollWidthPx = round(scrollWidthCm / 2.54 * dpi)
scrollHeightPx = round(scrollHeightCm / 2.54 * dpi)
```

### 辅助线

辅助线必须显式选择。

干净导出：

- 不加页码。
- 不加施工线。
- 不加水印。

辅助导出：

- 粘贴区边界。
- 页码。
- 裁切线。
- 10cm 校准标尺。

## PDF 导出

默认文件：

```text
<项目名>-PDF包.zip
```

建议结构：

```text
pdf.zip
  README.txt
  print_pages.pdf
  scroll_artwork.pdf
  calibration.pdf
```

### PDF 单位

如果 PDF 库使用 point，按厘米转换：

```text
points = cm / 2.54 * 72
```

### print_pages.pdf

每个叶片一页：

```text
pageWidthCm = pasteWidthCm + visiblePageWidthCm
pageHeightCm = artworkHeightCm
```

方向：

```text
orientation = pageWidthCm >= pageHeightCm ? landscape : portrait
```

### scroll_artwork.pdf

包含正面长卷和背面长卷。长卷过长时可能需要分片打印；分片导出可作为 Phase 2.5 功能。

### calibration.pdf

必须包含：

- 10cm 横向标尺。
- 10cm 纵向标尺。
- 粘贴宽度样条。
- 鳞片露出宽度样条。
- DPI 和导出日期。

## README 组装说明

所有打印导出都必须包含 `README.txt`。

必需章节：

```text
项目
参数
生成文件
打印设置
组装顺序
警告
支持链接
```

必需参数：

- 项目名。
- 导出日期。
- 画心高度。
- 页面可视宽度。
- 粘贴宽度。
- 鳞片露出宽度。
- 叶片数量。
- 页面结构数。
- 边缘样式。
- DPI。
- 叶片文件尺寸。
- 长卷画心尺寸。

组装顺序必须说明：

1. 按文件名顺序打印 frame 文件。
2. 打印缩放保持 100%。
3. 先校验 10cm 标尺。
4. 准备底卷。
5. 先贴 `frame_001`。
6. 每张后续叶片按鳞片露出宽度错位。
7. 只在粘贴区上胶或固定。
8. 最终压平前检查露出边缘。

## manifest.json

导出 manifest 记录文件与尺寸：

```json
{
  "schemaVersion": 1,
  "exportType": "images",
  "projectTitle": "未命名项目",
  "exportedAt": "ISO-8601",
  "settings": {},
  "derived": {
    "leafPhysicalWidthCm": 24,
    "scrollArtworkLengthCm": 68,
    "pageStructureCount": 24
  },
  "files": [
    {
      "path": "frames/frame_001.png",
      "role": "leaf-frame",
      "widthCm": 24,
      "heightCm": 30,
      "widthPx": 2835,
      "heightPx": 3543
    }
  ],
  "warnings": []
}
```

## 导出校验

硬错误：

- 当前导出所需图片缺失。
- 几何参数非法。
- canvas 分配失败。
- PDF 生成失败。
- 项目 schema 无法序列化。

警告：

- 源图分辨率低于目标导出像素。
- 导出可能超过浏览器内存。
- 长卷尺寸不适合家用打印机。
- 上传内页数量与叶片数量不一致。
- 辅助线已开启。

## 性能要求

- 逐页生成。
- 显示进度。
- 允许取消。
- 每页生成后清空临时 canvas 的宽高。
- 有 Blob 时避免重复保存 base64。
- 预览优先使用 Blob URL。

## 测试计划

### 单元测试

- 厘米到像素转换。
- 派生尺寸。
- frame 命名。
- manifest 生成。
- 导出校验错误和警告。

### 集成测试

- 创建项目、导出项目包、导入项目包、比较设置/素材/顺序。
- 用小型 fixture 生成图片包。
- 生成 PDF 并检查页数和物理尺寸。

### 浏览器测试

- 上传正面/背面/内页。
- 内页排序。
- 导出项目包。
- 导出图片包。
- `390x844` 移动宽度布局检查。

## 待决策

- 干净导出和辅助导出是两个包，还是同一包内两个目录。
- `scroll_artwork.pdf` 使用长页、分片页，还是二者都支持。
- 图片导出默认 PNG、JPEG，还是用户可选。
- 缩略图在项目导出时生成，还是只用于本地草稿。
