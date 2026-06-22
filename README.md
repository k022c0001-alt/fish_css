# fish_css
src/

pages/
│
├ BuilderPage.jsx
├ TemplatesPage.jsx
├ ExportPage.jsx
└ SettingsPage.jsx

components/
│
├ Builder/
│ │
│ ├ TopToolbar/
│ │    TopToolbar.jsx
│ │
│ ├ LeftPanel/
│ │    ShapePalette.jsx
│ │    TemplatePalette.jsx
│ │    GradientPalette.jsx
│ │
│ ├ Canvas/
│ │    CanvasArea.jsx
│ │    SvgCanvas.jsx
│ │    ShapeRenderer.jsx
│ │    SelectionBox.jsx
│ │    ResizeHandles.jsx
│ │    RotateHandle.jsx
│ │    GridOverlay.jsx
│ │    GuideLines.jsx
│ │
│ ├ RightPanel/
│ │    PropertyPanel.jsx
│ │    ColorPanel.jsx
│ │    GradientPanel.jsx
│ │    TexturePanel.jsx
│ │    FilterPanel.jsx
│ │
│ ├ LayerPanel/
│ │    LayerPanel.jsx
│ │
│ ├ HistoryPanel/
│ │    UndoRedoPanel.jsx
│ │
│ ├ PrintPreview/
│ │    PrintPreview.jsx
│ │
│ └ ExportPanel/
│      ExportPanel.jsx
│
templates/
│
├ poster/
├ flyer/
├ menu/
├ sns/
├ youtube/
└ business_card/

textures/
│
├ nursery_fish/
│ │
│ ├ gradient.json
│ ├ stripes.json
│ ├ shadow.json
│ └ filter.json
│
├ wood/
├ glass/
├ watercolor/
├ metal/
├ neon/
└ paper/

engines/
│
├ ShapeEngine.js
├ LayerEngine.js
├ SnapEngine.js
├ SelectionEngine.js
├ GradientEngine.js
├ TextureEngine.js
├ FilterEngine.js
├ PrintEngine.js
├ ExportEngine.js
├ GridEngine.js
└ HistoryEngine.js

exporters/
│
├ CssExporter.js
├ SvgExporter.js
├ HtmlExporter.js
├ PdfExporter.js
├ PngExporter.js
└ JsonExporter.js

hooks/
│
├ useCanvas.js
├ useSelection.js
├ useHistory.js
├ useLayer.js
├ useExport.js
└ usePrint.js

store/
│
├ canvasStore.js
├ shapeStore.js
├ layerStore.js
├ historyStore.js
├ textureStore.js
└ exportStore.js

models/
│
├ Shape.js
├ Line.js
├ Rect.js
├ Circle.js
├ Polygon.js
├ Text.js
├ Image.js
├ Group.js
└ Layer.js

styles/

utils/
│
├ colorUtils.js
├ gradientUtils.js
├ printUtils.js
├ geometryUtils.js
├ filterUtils.js
└ fileUtils.js

assets/

exports/
│
├ css/
├ svg/
├ html/
├ pdf/
├ png/
└ json/