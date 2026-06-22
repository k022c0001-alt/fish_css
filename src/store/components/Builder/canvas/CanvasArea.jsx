// src/components/Builder/Canvas/CanvasArea.jsx
import React from 'react';
import { useSnapshot } from 'valtio';
import { canvasStore } from '../../../store/canvasStore';
import { layerStore } from '../../../store/layerStore';
import { shapeStore } from '../../../store/shapeStore';

// 仮の図形レンダラー（後ほど ShapeRenderer.jsx として独立させます）
import ShapeRenderer from './ShapeRenderer';

export default function CanvasArea() {
  const canvasSnap = useSnapshot(canvasStore);
  const layerSnap = useSnapshot(layerStore);
  const shapeSnap = useSnapshot(shapeStore);

  // 1mm あたり何ピクセルで画面上に表示するか（解像度/スケール因子）
  // ズーム倍率 (canvasSnap.zoom) をここに掛け合わせます。
  const mmToPx = 3.78 * canvasSnap.zoom; // 1mm ≒ 3.78px (96DPI基準の標準)

  const canvasStyle = {
    width: `${canvasSnap.width * mmToPx}px`,
    height: `${canvasSnap.height * mmToPx}px`,
    backgroundColor: canvasSnap.backgroundColor,
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-8 relative">
      {/* ─── 印刷物理サイズを模したキャンバス本体 ─── */}
      <div 
        style={canvasStyle}
        className="relative shadow-2xl transition-all duration-75 select-none overflow-hidden"
        id="salmon-physical-canvas"
      >
        {/* グリッドレイヤー (GridOverlay.jsx が入る場所) */}
        {canvasSnap.gridVisible && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
              backgroundSize: `${canvasSnap.gridSize * mmToPx}px ${canvasSnap.gridSize * mmToPx}px`
            }}
          />
        )}

        {/* ─── レイヤー順(逆順)に図形をレンダリング ─── */}
        {/* 通常、配列の先頭が背面、末尾が前面になるようマッピングします */}
        {layerSnap.layers.map((layer) => {
          if (!layer.visible) return null;
          
          const shape = shapeSnap.shapes[layer.shapeId];
          if (!shape) return null;

          return (
            <ShapeRenderer 
              key={shape.id} 
              shape={shape} 
              mmToPx={mmToPx}
              isLocked={layer.locked}
            />
          );
        })}
      </div>
    </div>
  );
}