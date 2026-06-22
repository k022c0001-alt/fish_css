// src/components/Builder/Canvas/ShapeRenderer.jsx
import React from 'react';
import { layerStore } from '../../../store/layerStore';
import { useSnapshot } from 'valtio';

export default function ShapeRenderer({ shape, mmToPx, isLocked }) {
  const layerSnap = useSnapshot(layerStore);
  const isSelected = layerSnap.selectedShapeIds.includes(shape.id);

  // ミリメートルからピクセルへの変換
  const x = (shape.x ?? 0) * mmToPx;
  const y = (shape.y ?? 0) * mmToPx;
  const width = (shape.width ?? 0) * mmToPx;
  const height = (shape.height ?? 0) * mmToPx;

  // クリック時に選択状態にする処理
  const handleSelect = (e) => {
    e.stopPropagation(); // 背景のクリックイベント発火を防ぐ
    if (isLocked) return;
    
    // Shiftキーを押しながらなら複数選択モード
    layerStore.selectShape(shape.id, e.shiftKey);
  };

  // 基本配置用のラッパースタイル
  const wrapperStyle = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    cursor: isLocked ? 'not-allowed' : 'move',
  };

  // 各形状に応じたレンダリング分岐
  const renderElement = () => {
    // 塗りつぶし(fill)の判定（テクスチャやグラデーションは追って実装）
    const fillStyle = shape.fill?.type === 'single' ? shape.fill.color : '#e2e8f0';

    switch (shape.type) {
      case 'rect':
        return (
          <div 
            className="w-full h-full" 
            style={{ 
              backgroundColor: fillStyle,
              // テクスチャ(nursery_fish等)が指定されている場合は、CSS背景として適用可能
              backgroundImage: shape.fill?.type === 'texture' ? 'repeating-linear-gradient(45deg, #ffedd5, #ffedd5 10px, #ffd8a8 10px, #ffd8a8 20px)' : 'none'
            }} 
          />
        );

      case 'circle':
        return (
          <div 
            className="w-full h-full rounded-full" 
            style={{ backgroundColor: fillStyle }} 
          />
        );

      case 'text':
        return (
          <div 
            style={{ 
              fontSize: `${shape.fontSize * (mmToPx / 3.78)}px`, // フォントサイズも適切にスケール
              color: shape.color || '#000000',
              fontWeight: shape.fontWeight || 'normal',
              whiteSpace: 'nowrap'
            }}
            className="w-full h-full select-text"
          >
            {shape.content}
          </div>
        );

      case 'line':
        // 直線の場合はx1, y1, x2, y2からSVG等で描画するのが理想ですが、今回は簡易モック
        return (
          <div 
            style={{ 
              height: `${shape.strokeWidth || 1}px`, 
              backgroundColor: shape.stroke || '#ff8f6d' 
            }} 
            className="w-full"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div 
      style={wrapperStyle} 
      onClick={handleSelect}
      className={`relative group ${isSelected ? 'outline outline-2 outline-orange-500 z-30' : 'hover:outline hover:outline-1 hover:outline-slate-400'}`}
    >
      {renderElement()}
      
      {/* 選択中のバウンディングボックス表示（ここにResizeHandlesなどをドッキングさせます） */}
      {isSelected && !isLocked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-orange-500 rounded-sm" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-orange-500 rounded-sm" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-orange-500 rounded-sm" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-orange-500 rounded-sm" />
        </div>
      )}
    </div>
  );
}