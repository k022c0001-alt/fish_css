import { snapshot } from 'valtio';
import { shapeStore } from '../store/shapeStore';
import { selectionStore } from '../store/selectionStore';
import { historyStore } from '../store/historyStore';

export const PropertyEngine = {
  /**
   * ─── バウンディングボックス計算 ───
   * 選択中のすべての図形を囲む「見えない巨大な箱」の座標とサイズを計算します。
   */
  getSelectionBounds() {
    const selectedIds = snapshot(selectionStore.selectedIds);
    if (selectedIds.length === 0) return null;

    const shapes = shapeStore.shapes;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedIds.forEach(id => {
      const shape = shapes[id];
      if (!shape) return;
      minX = Math.min(minX, shape.x);
      minY = Math.min(minY, shape.y);
      maxX = Math.max(maxX, shape.x + (shape.width || 0));
      maxY = Math.max(maxY, shape.y + (shape.height || 0));
    });

    return { 
      minX, minY, maxX, maxY, 
      width: maxX - minX, 
      height: maxY - minY,
      centerX: minX + (maxX - minX) / 2,
      centerY: minY + (maxY - minY) / 2
    };
  },

  /**
   * ─── 整列 (Alignment) ───
   * @param {'left'|'center'|'right'|'top'|'middle'|'bottom'} direction
   */
  align(direction) {
    const selectedIds = snapshot(selectionStore.selectedIds);
    if (selectedIds.length < 2) return; // 1つの場合はキャンバスに対して整列させるロジックに分岐しても良い

    const bounds = this.getSelectionBounds();
    if (!bounds) return;

    selectedIds.forEach(id => {
      const shape = shapeStore.shapes[id];
      if (!shape || shape.locked) return; // ロックされた要素は動かさない

      let newX = shape.x;
      let newY = shape.y;

      switch (direction) {
        case 'left': 
          newX = bounds.minX; 
          break;
        case 'center': 
          newX = bounds.centerX - (shape.width / 2); 
          break;
        case 'right': 
          newX = bounds.maxX - shape.width; 
          break;
        case 'top': 
          newY = bounds.minY; 
          break;
        case 'middle': 
          newY = bounds.centerY - (shape.height / 2); 
          break;
        case 'bottom': 
          newY = bounds.maxY - shape.height; 
          break;
      }

      shapeStore.updateShape(id, { x: newX, y: newY });
    });

    historyStore.pushState(); // まとめて動かした結果を1つの履歴として保存
  },

  /**
   * ─── 等間隔分布 (Distribution) ───
   * 3つ以上の要素が選択されている時、両端の要素を固定し、中間の要素を等間隔に配置します。
   * @param {'horizontal'|'vertical'} axis
   */
  distribute(axis) {
    const selectedIds = snapshot(selectionStore.selectedIds);
    if (selectedIds.length < 3) return; // 分布は3つ以上必要

    const shapesToDistribute = selectedIds
      .map(id => shapeStore.shapes[id])
      .filter(shape => shape && !shape.locked);

    if (shapesToDistribute.length < 3) return;

    if (axis === 'horizontal') {
      // X座標でソート
      shapesToDistribute.sort((a, b) => a.x - b.x);
      const first = shapesToDistribute[0];
      const last = shapesToDistribute[shapesToDistribute.length - 1];
      
      // 両端の間の合計距離から、全要素の合計幅を引いて、必要な「隙間」の総量を出す
      const totalWidth = shapesToDistribute.reduce((sum, shape) => sum + shape.width, 0);
      const totalDistance = (last.x + last.width) - first.x;
      const gap = (totalDistance - totalWidth) / (shapesToDistribute.length - 1);

      let currentX = first.x + first.width + gap;
      for (let i = 1; i < shapesToDistribute.length - 1; i++) {
        const shape = shapesToDistribute[i];
        shapeStore.updateShape(shape.id, { x: currentX });
        currentX += shape.width + gap;
      }

    } else if (axis === 'vertical') {
      // Y座標でソート
      shapesToDistribute.sort((a, b) => a.y - b.y);
      const first = shapesToDistribute[0];
      const last = shapesToDistribute[shapesToDistribute.length - 1];
      
      const totalHeight = shapesToDistribute.reduce((sum, shape) => sum + shape.height, 0);
      const totalDistance = (last.y + last.height) - first.y;
      const gap = (totalDistance - totalHeight) / (shapesToDistribute.length - 1);

      let currentY = first.y + first.height + gap;
      for (let i = 1; i < shapesToDistribute.length - 1; i++) {
        const shape = shapesToDistribute[i];
        shapeStore.updateShape(shape.id, { y: currentY });
        currentY += shape.height + gap;
      }
    }

    historyStore.pushState();
  },

  /**
   * ─── プロパティの一括適用 ───
   * 右側のプロパティパネルで色やフォントサイズを変えた時、選択中の要素「すべて」に反映させます。
   * @param {Object} updates - { fill: '#ff0000', strokeWidth: 2 } など
   */
  applyBulkProperties(updates) {
    const selectedIds = snapshot(selectionStore.selectedIds);
    if (selectedIds.length === 0) return;

    selectedIds.forEach(id => {
      const shape = shapeStore.shapes[id];
      if (!shape || shape.locked) return;
      
      // テキスト専用のプロパティ（fontSizeなど）を矩形に適用しないための保護もここに書ける
      if (updates.fontSize && shape.type !== 'text') return;

      shapeStore.updateShape(id, updates);
    });

    historyStore.pushState();
  }
};