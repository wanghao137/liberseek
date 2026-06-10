# Dragon Scale Binding Craft Spec

Status: planning baseline

## Purpose

This document defines the craft model and geometry rules for the first version
of Dragon Scale Studio. It is the source of truth for editor layout, preview,
export, tests, and README assembly instructions.

## Canonical Units

Use centimeters as the canonical project unit.

Convert to pixels only at render/export boundaries:

```text
px = round(cm / 2.54 * dpi)
cm = px / dpi * 2.54
```

Default export DPI:

```text
dpi = 300
```

All formulas should be implemented as pure functions under the future `binding`
module.

## Binding Model

Dragon scale binding has these structural parts:

- Scroll base: the long paper or backing surface.
- Front scroll image: the artwork visible when the scroll is open.
- Back scroll image: the artwork formed or referenced when the scroll is rolled
  or viewed from the exposed slice side.
- Leaf: one pasted page.
- Paste area: the part of a leaf attached to the scroll base.
- Visible area: the part of a leaf carrying the artwork shown when opened.
- Exposed slice: the repeated offset edge that creates the scale structure.

The MVP uses a horizontal binding model. Vertical orientation can be added after
the horizontal export path is verified.

## Default Preset

The first preset should match the public Dayu reference closely enough that users
understand the model:

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

The app may later add smaller preview/demo presets, but the default craft preset
must remain physically meaningful.

## Required Terms

### artworkHeightCm

Height of the printed artwork area.

### visiblePageWidthCm

Width of the visible part of one leaf, excluding the paste area.

### pasteWidthCm

Width of the area glued or mounted to the scroll base.

### sliceWidthCm

Horizontal offset between consecutive leaves. This is also the exposed scale
width in the default craft model.

For MVP, `pasteWidthCm` and `sliceWidthCm` can default to the same value but must
remain separate fields in the data model.

### leafPhysicalWidthCm

Total physical width of one leaf:

```text
leafPhysicalWidthCm = pasteWidthCm + visiblePageWidthCm
```

### scrollArtworkLengthCm

Length needed for the visible scale sequence:

```text
scrollArtworkLengthCm = visiblePageWidthCm + leafCount * sliceWidthCm
```

This does not include optional scroll margins or mounting tails.

### pageStructureCount

Default page structure count:

```text
pageStructureCount = leafCount + 1
```

This accounts for the base/open structure plus the leaf sequence. Export naming
must define exactly which assets are generated for leaves, scroll artwork, and
assembly maps.

## Leaf Placement

Leaves are placed left to right with a constant offset:

```text
leaf[i].xCm = i * sliceWidthCm
leaf[i].yCm = 0
leaf[i].widthCm = leafPhysicalWidthCm
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

The editor should display paste and visible regions distinctly. Export may
include optional construction guides, but final artwork exports should be clean
unless the user selects guide overlays.

## Scroll Margins

The MVP should support optional margins, even if the first UI hides them behind
advanced settings:

```text
marginStartCm = 0
marginEndCm = 0
marginTopCm = 0
marginBottomCm = 0
```

Derived base size:

```text
scrollBaseLengthCm =
  marginStartCm + scrollArtworkLengthCm + marginEndCm

scrollBaseHeightCm =
  marginTopCm + artworkHeightCm + marginBottomCm
```

## Source Image Roles

### Front Scroll Image

Fills the front scroll artwork area:

```text
widthCm = scrollArtworkLengthCm
heightCm = artworkHeightCm
```

### Back Scroll Image

Fills the same physical artwork area as the front scroll image. It may be used
as a continuous image or as a source for exposed slice checks.

### Inner Page Images

Each inner page image maps into one leaf visible area:

```text
widthCm = visiblePageWidthCm
heightCm = artworkHeightCm
```

The paste area may remain blank, use edge continuation, or carry construction
marks depending on export mode.

## Edge Styles

MVP edge styles:

- `straight`: rectangular leaf.
- `wave`: subtle wave edge for decorative or aged-paper effect.
- `sawtooth`: stylized tooth edge.

Edge style must not change the underlying placement formula. It only changes the
mask used for display/export.

## Image Fit Modes

MVP should support:

- `cover`: fills the target region and crops overflow.
- `contain`: fits the whole image with empty space.

Default:

```text
fitMode = cover
```

Transforms are non-destructive:

```text
transform = {
  xCm,
  yCm,
  scale,
  rotationDeg,
  cropRect
}
```

## Validation Rules

Hard errors:

- `artworkHeightCm <= 0`.
- `visiblePageWidthCm <= 0`.
- `pasteWidthCm <= 0`.
- `sliceWidthCm <= 0`.
- `leafCount < 1`.
- Missing required image for an export mode.
- Unsupported project schema version without migration.

Warnings:

- Source image resolution below target export pixels.
- PDF physical page larger than common printer capability.
- `sliceWidthCm > pasteWidthCm`.
- `pasteWidthCm` too narrow for hand assembly.
- Leaf count and uploaded inner page count differ.
- Long scroll length likely exceeds home printer paper sizes.

## Resolution Guidance

For a region:

```text
targetWidthPx = round(widthCm / 2.54 * dpi)
targetHeightPx = round(heightCm / 2.54 * dpi)
```

At 300 DPI, a 30 cm high region needs about:

```text
round(30 / 2.54 * 300) = 3543 px
```

The editor may preview at lower resolution, but export checks must use the
actual target pixels.

## Test Cases

### Default Preset

Input:

```text
artworkHeightCm = 30
visiblePageWidthCm = 22
pasteWidthCm = 2
sliceWidthCm = 2
leafCount = 23
```

Expected:

```text
leafPhysicalWidthCm = 24
scrollArtworkLengthCm = 68
pageStructureCount = 24
```

### Wider Slice

Input:

```text
visiblePageWidthCm = 22
pasteWidthCm = 2.5
sliceWidthCm = 2.5
leafCount = 10
```

Expected:

```text
leafPhysicalWidthCm = 24.5
scrollArtworkLengthCm = 47
```

### Invalid Slice

Input:

```text
sliceWidthCm = 0
```

Expected:

```text
hard error
```

## Open Decisions

- Whether P0 export should include physical scroll base artwork split across
  printable sheets or only as long images.
- Whether `sliceWidthCm > pasteWidthCm` should remain a warning or become an
  advanced-mode error.
- Whether vertical orientation belongs in MVP or Phase 3.
- Whether front/back scroll images should be required for all exports or only
  for full assembly exports.
