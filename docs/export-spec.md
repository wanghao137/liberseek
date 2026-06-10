# Dragon Scale Studio Export Spec

Status: planning baseline

## Purpose

This document defines export formats for the first production path. It should be
used by implementation, testing, and README generation.

## Export Types

MVP export types:

1. Editable project package.
2. Print-ready image package.
3. PDF package.
4. README assembly instructions.

Recording and watermark exports are later features.

## Editable Project Package

Default extension:

```text
.dscale.zip
```

The project package is a ZIP archive:

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

The package must be importable without network access.

### project.json

Required fields:

```json
{
  "schemaVersion": 1,
  "app": "dragon-scale-studio",
  "title": "Untitled Project",
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

Asset record shape:

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

Transform shape:

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

### Password Protection

Password protection is not part of MVP.

If added later, it must:

- Use a user-provided passphrase.
- Derive keys with a standard password-based key derivation function.
- Store salt and encryption metadata in the archive.
- Avoid hard-coded shared keys.
- Avoid copy-proof claims.

## Print-Ready Image Package

Default archive:

```text
<project-title>-images.zip
```

Suggested structure:

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

### Naming Rules

- Frame names must be zero-padded and stable.
- Leaf frame numbering starts at `frame_001`.
- Frame order follows physical assembly order from left to right.
- The package must include `manifest.json`.
- `README.txt` must repeat every physical parameter needed for assembly.

### Frame Image Dimensions

For each leaf frame:

```text
frameWidthCm = pasteWidthCm + visiblePageWidthCm
frameHeightCm = artworkHeightCm
frameWidthPx = round(frameWidthCm / 2.54 * dpi)
frameHeightPx = round(frameHeightCm / 2.54 * dpi)
```

For full scroll images:

```text
scrollWidthCm = scrollArtworkLengthCm
scrollHeightCm = artworkHeightCm
scrollWidthPx = round(scrollWidthCm / 2.54 * dpi)
scrollHeightPx = round(scrollHeightCm / 2.54 * dpi)
```

### Guide Overlays

Guide overlays are optional and must be explicit.

Clean export:

- No page numbers on artwork.
- No construction lines.
- No watermarks.

Guide export:

- Paste area boundary.
- Page number.
- Cut line.
- Optional 10 cm calibration marker.

## PDF Export

Default archive:

```text
<project-title>-pdf.zip
```

Suggested structure:

```text
pdf.zip
  README.txt
  print_pages.pdf
  scroll_artwork.pdf
  calibration.pdf
```

### PDF Page Units

PDF pages must use physical dimensions matching the project settings. If the PDF
library uses points, convert through centimeters:

```text
points = cm / 2.54 * 72
```

### print_pages.pdf

One page per leaf frame:

```text
pageWidthCm = pasteWidthCm + visiblePageWidthCm
pageHeightCm = artworkHeightCm
```

Orientation is derived:

```text
orientation = pageWidthCm >= pageHeightCm ? landscape : portrait
```

### scroll_artwork.pdf

Contains front and back scroll artwork. For home printing, very long scrolls may
need tiling. Tiling can be a Phase 2.5 feature if full-length PDF pages are not
practical in common PDF viewers.

### calibration.pdf

Must include:

- 10 cm horizontal ruler.
- 10 cm vertical ruler.
- Paste width sample.
- Slice width sample.
- DPI and generation date.

## README Assembly Instructions

Every print export must include `README.txt`.

Required sections:

```text
Project
Parameters
Generated Files
Print Settings
Assembly Order
Warnings
Support Links
```

Required parameter list:

- Project title.
- Export date.
- Artwork height.
- Visible page width.
- Paste width.
- Slice width.
- Leaf count.
- Page structure count.
- Edge style.
- DPI.
- Frame size.
- Scroll artwork size.

Assembly order must state:

1. Print frames in file-name order.
2. Keep print scaling at 100 percent.
3. Verify the 10 cm calibration page.
4. Prepare the scroll base.
5. Place `frame_001` first.
6. Offset each next frame by `sliceWidthCm`.
7. Paste only inside the paste area.
8. Check exposed edges before final pressing.

## manifest.json

The export manifest records generated files and dimensions:

```json
{
  "schemaVersion": 1,
  "exportType": "images",
  "projectTitle": "Untitled Project",
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

## Export Validation

Hard errors:

- Missing required images for the selected export.
- Invalid geometry.
- Canvas allocation failure.
- PDF generation failure.
- Project schema cannot serialize.

Warnings:

- Source image lower than export target.
- Export output may exceed browser memory.
- Scroll artwork too long for normal home printing.
- Uploaded inner page count does not match leaf count.
- Guide overlays enabled.

## Performance Requirements

- Generate pages sequentially.
- Show progress.
- Allow cancellation.
- Release each temporary canvas after use by clearing width and height.
- Avoid storing duplicate base64 copies in memory when blobs are available.
- Prefer blob/object URLs for preview.

## Test Plan

### Unit Tests

- Centimeter-to-pixel conversion.
- Derived dimensions.
- Frame naming.
- Manifest generation.
- Export validation errors and warnings.

### Integration Tests

- Create project, export package, import package, compare settings/assets/order.
- Generate image export with a small fixture set.
- Generate PDF and inspect page count and physical page sizes.

### Browser Tests

- Upload front/back/leaf images.
- Reorder leaves.
- Export project package.
- Export image package.
- Verify mobile editor layout at `390x844`.

## Open Decisions

- Whether clean and guide exports should be separate files or a toggle inside one
  archive.
- Whether `scroll_artwork.pdf` should use long physical pages, tiled pages, or
  both.
- Whether image export default should be PNG, JPEG, or user-selectable.
- Whether thumbnail generation belongs in project package export or local draft
  save only.
