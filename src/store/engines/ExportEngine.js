import { PrintEngine } from './PrintEngine';

export const ExportEngine = {
  /**
   * ─── 高解像度SVGの生成 ───
   * 画面用の装飾用DOMではなく、印刷に耐える純粋なSVG形式コードをパースする
   */
  generateSvgString({ width, height, shapes, layers, textureStore }) {
    const layerMap = new Map(layers.map(l => [l.shapeId, l]));
    
    // Z-index（layerの配列順）に従って図形をソート
    const sortedShapes = [...shapes].sort((a, b) => {
      const idxA = layers.findIndex(l => l.shapeId === a.id);
      const idxB = layers.findIndex(l => l.shapeId === b.id);
      return idxA - idxB;
    });

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}">\n`;
    
    // 1. テクスチャ定義（defs）の注入 (Ver 0.5/1.0 フィルター強化用)
    svgContent += `  <defs>\n`;
    svgContent += `    \n`;
    svgContent += `    <filter id="nursery_fish"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0"/><feComposite operator="in" in2="SourceGraphic"/></filter>\n`;
    svgContent += `  </defs>\n`;

    // 2. 各オブジェクトのベクターライティング
    sortedShapes.forEach(shape => {
      const layer = layerMap.get(shape.id);
      if (layer && !layer.visible) return; // 非表示はスキップ

      const fillStr = shape.fill?.type === 'texture' ? `url(#${shape.fill.textureId})` : (shape.fill?.color || '#ffffff');
      const strokeStr = shape.stroke || 'none';
      const strokeWidthStr = shape.strokeWidth || 0;
      const transformStr = shape.rotation ? ` transform="rotate(${shape.rotation} ${shape.x + shape.width/2} ${shape.y + shape.height/2})"` : '';

      switch (shape.type) {
        case 'rect':
          svgContent += `  <rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${fillStr}" stroke="${strokeStr}" stroke-width="${strokeWidthStr}"${transformStr} />\n`;
          break;
          
        case 'circle':
          svgContent += `  <circle cx="${shape.x + shape.width/2}" cy="${shape.y + shape.height/2}" r="${shape.width/2}" fill="${fillStr}" stroke="${strokeStr}" stroke-width="${strokeWidthStr}"${transformStr} />\n`;
          break;
          
        case 'text':
          // 印刷用ベクターテキストの簡易マッピング
          svgContent += `  <text x="${shape.x}" y="${shape.y + shape.fontSize * 0.35}" font-family="${shape.fontFamily || 'sans-serif'}" font-size="${shape.fontSize}pt" fill="${fillStr}"${transformStr}>${shape.content}</text>\n`;
          break;
          
        case 'path':
          // SvgEngine (Ver 2.0) で生成されたベジェパスの復元
          if (shape.points && shape.points.length > 0) {
            let d = `M ${shape.points[0].x} ${shape.points[0].y}`;
            for (let i = 1; i < shape.points.length; i++) {
              const p = shape.points[i];
              const prev = shape.points[i - 1];
              if (prev.handleOut || p.handleIn) {
                const h1 = prev.handleOut || prev;
                const h2 = p.handleIn || p;
                d += ` C ${h1.x} ${h1.y}, ${h2.x} ${h2.y}, ${p.x} ${p.y}`;
              } else {
                d += ` L ${p.x} ${p.y}`;
              }
            }
            if (shape.closed) d += ' Z';
            svgContent += `  <path d="${d}" fill="${fillStr}" stroke="${strokeStr}" stroke-width="${strokeWidthStr}"${transformStr} />\n`;
          }
          break;
      }
    });

    svgContent += `</svg>`;
    return svgContent;
  },

  /**
   * 生成したSVGファイルをブラウザで即座にダウンロードさせる処理
   */
  downloadAsSvg(filename, content) {
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};