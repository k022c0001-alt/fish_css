// src/components/Builder/Canvas/SelectionBox.jsx
import React from 'react';
import { useSnapshot } from 'valtio';
import { shapeStore } from '../../../store/shapeStore';
import { SelectionBoxEngine } from '../../../engines/SelectionBoxEngine';

// リサイズハンドルの定義（方角とCSS配置用のクラス）
const HANDLES = [
  { type: 'nw', cursor: 'nwse-resize', classes: '-top-1 -left-1' },
  { type: 'n',  cursor: 'ns-resize',   classes: '-top-1 left-1/2 -translate-x-1/2' },
  { type: 'ne', cursor: 'nesw-resize', classes: '-top-1 -right-1' },
  { type: 'e',  cursor: 'ew-resize',   classes: 'top-1/2 -right-1 -translate-y-1/2' },
  { type: 'se', cursor: 'nwse-resize', classes: '-bottom-1 -right-1' },
  { type: 's',  cursor: 'ns-resize',   classes: '-bottom-1 left-1/2 -translate-x-1/2' },
  { type: 'sw', cursor: 'nesw-resize', classes: '-bottom-1 -left-1' },
  { type: 'w',  cursor: 'ew-resize',   classes: 'top-1/2 -left-1 -translate-y-1/2' },
];

export default function SelectionBox({ shapeId, mmToPx }) {
  const shapeSnap = useSnapshot(shapeStore).shapes[shapeId];
  if (!shapeSnap || shapeSnap.locked) return null;

  // ミリメートルから画面上のピクセルに変換
  const x = shapeSnap.x * mmToPx;
  const y = shapeSnap.y * mmToPx;
  const width = shapeSnap.width * mmToPx;
  const height = shapeSnap.height * mmToPx;
  const rotation = shapeSnap.rotation || 0;

  // ─── リサイズドラッグの制御 ───
  const handleResizeMouseDown = (e, handleType) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent) => {
      // 画面上のピクセル移動量を、キャンバスのスケールに合わせたミリメートル(mm)移動量に逆変換
      const dx = (moveEvent.clientX - startX) / mmToPx;
      const dy = (moveEvent.clientY - startY) / mmToPx;

      // Shiftキーが押されているか判定（縦横比固定フラグ）
      const keepRatio = moveEvent.shiftKey;

      // エンジンを叩いてストアをリアルタイムに直接書き換える
      SelectionBoxEngine.resizeShape(shapeId, handleType, dx, dy, keepRatio);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ─── 回転ドラッグの制御 ───
  const handleRotateMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const canvasElement = document.getElementById('salmon-physical-canvas');
    if (!canvasElement) return;
    const rect = canvasElement.getBoundingClientRect();

    const handleMouseMove = (moveEvent) => {
      // マウスの現在位置をキャンバス内のミリメートル座標に換算
      const mouseX = (moveEvent.clientX - rect.left) / mmToPx;
      const mouseY = (moveEvent.clientY - rect.top) / mmToPx;

      // 回転エンジンを点火
      SelectionBoxEngine.rotateShape(shapeId, mouseX, mouseY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
      className="absolute border-2 border-orange-500 pointer-events-none z-40 animate-fade-in"
    >
      {/* 🔄 回転ハンドル (枠の上部に配置) */}
      <div 
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-500 border border-white rounded-full flex items-center justify-center cursor-alias pointer-events-auto shadow-md hover:scale-125 transition-transform"
        onMouseDown={handleRotateMouseDown}
        title="回転"
      >
        <span className="text-[9px] text-white select-none">↻</span>
      </div>

      {/* 🟦 8方向のリサイズポチ */}
      {HANDLES.map((handle) => (
        <div
          key={handle.type}
          onMouseDown={(e) => handleResizeMouseDown(e, handle.type)}
          style={{ cursor: handle.cursor }}
          className={`absolute w-2.5 h-2.5 bg-white border-2 border-orange-500 rounded-sm pointer-events-auto hover:bg-orange-500 hover:scale-125 transition-all shadow-sm ${handle.classes}`}
        />
      ))}
    </div>
  );
}