import { shapeStore } from '../store/shapeStore';

export const SelectionBoxEngine = {
  /**
   * ハンドルをドラッグした際の変形計算
   * @param {string} shapeId - 対象の図形ID
   * @param {string} handleType - 'nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w' (方角)
   * @param {number} dx - マウスのX移動量 (mm)
   * @param {number} dy - マウスのY移動量 (mm)
   * @param {boolean} keepRatio - Shiftキー押下などの縦横比固定フラグ
   */
  resizeShape(shapeId, handleType, dx, dy, keepRatio = false) {
    const shape = shapeStore.shapes[shapeId];
    if (!shape || shape.locked) return;

    let { x, y, width, height } = shape;

    // 変形ロジック（方角に応じて座標とサイズを計算）
    if (handleType.includes('e')) width += dx;
    if (handleType.includes('s')) height += dy;
    if (handleType.includes('w')) {
      width -= dx;
      x += dx;
    }
    if (handleType.includes('n')) {
      height -= dy;
      y += dy;
    }

    // サイズがマイナスにならないように制限（最小1mm）
    width = Math.max(1, width);
    height = Math.max(1, height);

    // Shiftキー押下時の比率固定ロジック (簡易版)
    if (keepRatio) {
      const originalRatio = shape.width / shape.height;
      if (width / height > originalRatio) {
        height = width / originalRatio;
      } else {
        width = height * originalRatio;
      }
    }

    // ストアへリアルタイム反映（1秒間に60回呼ばれてもValtioなら超軽量）
    shapeStore.updateShape(shapeId, { x, y, width, height });
  },

  // 回転の計算 (中心点を軸にした角度計算)
  rotateShape(shapeId, mouseX, mouseY) {
    const shape = shapeStore.shapes[shapeId];
    if (!shape || shape.locked) return;

    // 図形の中心座標
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    // マウス位置との角度（ラジアンから度数へ）
    const radians = Math.atan2(mouseY - centerY, mouseX - centerX);
    let degrees = radians * (180 / Math.PI);

    // 15度ずつスナップするなどの処理をここに入れることも可能
    // if (snap) degrees = Math.round(degrees / 15) * 15;

    shapeStore.updateShape(shapeId, { rotation: degrees });
  }
};