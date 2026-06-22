import { shapeStore } from '../store/shapeStore';
import { guideStore } from '../store/guideStore';

export const ConstraintEngine = {
  // スナップが発動する距離の閾値 (例: 2mm)
  SNAP_THRESHOLD: 2,

  /**
   * ─── スマートガイドの計算 ───
   * ドラッグ中の図形の仮座標を受け取り、スナップ後の座標とガイド線を返します。
   * * @param {string} movingShapeId - ドラッグ中の図形ID
   * @param {number} proposedX - ドラッグによる移動先の仮のX座標
   * @param {number} proposedY - ドラッグによる移動先の仮のY座標
   * @returns {Object} { snappedX, snappedY, guides: Array }
   */
  applySmartGuides(movingShapeId, proposedX, proposedY) {
    const movingShape = shapeStore.shapes[movingShapeId];
    if (!movingShape) return { snappedX: proposedX, snappedY: proposedY, guides: [] };

    // スナップ機能がOFFの場合は、そのまま返す
    if (!guideStore.snap) {
      return { snappedX: proposedX, snappedY: proposedY, guides: [] };
    }

    const { width, height } = movingShape;
    let snappedX = proposedX;
    let snappedY = proposedY;
    const guides = []; // 表示用のガイド線オブジェクト配列

    // ドラッグ中図形のX軸の注目点 (左端, 中央, 右端)
    const movingXPoints = [
      { type: 'left', val: proposedX },
      { type: 'center', val: proposedX + width / 2 },
      { type: 'right', val: proposedX + width }
    ];

    // ドラッグ中図形のY軸の注目点 (上端, 中央, 下端)
    const movingYPoints = [
      { type: 'top', val: proposedY },
      { type: 'middle', val: proposedY + height / 2 },
      { type: 'bottom', val: proposedY + height }
    ];

    let minDeltaX = this.SNAP_THRESHOLD;
    let minDeltaY = this.SNAP_THRESHOLD;
    let bestSnapX = null;
    let bestSnapY = null;

    // ─── 比較対象となる他の図形を走査 ───
    Object.values(shapeStore.shapes).forEach(target => {
      if (target.id === movingShapeId || target.hidden) return; // 自分自身と非表示レイヤーは無視

      const targetXPoints = [
        target.x, 
        target.x + target.width / 2, 
        target.x + target.width
      ];
      
      const targetYPoints = [
        target.y, 
        target.y + target.height / 2, 
        target.y + target.height
      ];

      // --- X軸のチェック (垂直ガイド線) ---
      movingXPoints.forEach(mPoint => {
        targetXPoints.forEach(tVal => {
          const delta = Math.abs(mPoint.val - tVal);
          if (delta < minDeltaX) {
            minDeltaX = delta;
            
            // どれだけ補正すればターゲットとぴったり重なるかを計算
            const correction = tVal - mPoint.val;
            snappedX = proposedX + correction;
            
            bestSnapX = {
              x: tVal,
              // ガイド線の描画用に、対象となった2つの図形を覆うY座標の範囲を記録
              startY: Math.min(proposedY, target.y),
              endY: Math.max(proposedY + height, target.y + target.height)
            };
          }
        });
      });

      // --- Y軸のチェック (水平ガイド線) ---
      movingYPoints.forEach(mPoint => {
        targetYPoints.forEach(tVal => {
          const delta = Math.abs(mPoint.val - tVal);
          if (delta < minDeltaY) {
            minDeltaY = delta;
            
            const correction = tVal - mPoint.val;
            snappedY = proposedY + correction;
            
            bestSnapY = {
              y: tVal,
              startX: Math.min(proposedX, target.x),
              endX: Math.max(proposedX + width, target.x + target.width)
            };
          }
        });
      });
    });

    // ─── ガイド線の生成 ───
    if (bestSnapX) {
      guides.push({ axis: 'vertical', x: bestSnapX.x, startY: bestSnapX.startY, endY: bestSnapX.endY });
    }
    if (bestSnapY) {
      guides.push({ axis: 'horizontal', y: bestSnapY.y, startX: bestSnapY.startX, endX: bestSnapY.endX });
    }

    return { snappedX, snappedY, guides };
  }
};