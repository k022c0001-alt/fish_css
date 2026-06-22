import { proxy, snapshot } from 'valtio';
import { shapeStore } from './shapeStore';
import { layerStore } from './layerStore';
import { selectionStore } from './selectionStore';

// ID生成ユーティリティ
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const clipboardStore = proxy({
  // ─── 状態 ───
  clipboard: [], // コピーされた図形データのスナップショットを保持

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  // 選択中の図形をコピー
  copy() {
    const selectedIds = snapshot(selectionStore.selectedIds);
    if (selectedIds.length === 0) return;

    const shapes = snapshot(shapeStore.shapes);
    // 選択されている図形の実データをディープコピーしてクリップボードへ
    this.clipboard = selectedIds.map(id => ({ ...shapes[id] }));
  },

  // クリップボードの図形をペースト（少しずらして配置）
  paste() {
    if (this.clipboard.length === 0) return;

    const newSelectedIds = [];
    const offset = 10; // 10mm（またはpx）ずらしてペースト

    this.clipboard.forEach(shapeData => {
      const newId = `shape_${genId()}`;
      
      // 図形を複製して追加
      shapeStore.addShape({
        ...shapeData,
        id: newId,
        x: shapeData.x + offset,
        y: shapeData.y + offset,
      });

      // レイヤーも最前面に追加
      layerStore.addLayer({
        id: `layer_${genId()}`,
        shapeId: newId,
        name: `${shapeData.name || '図形'} のコピー`,
      });

      newSelectedIds.push(newId);
    });

    // ペーストした要素を選択状態にする
    selectionStore.selectedIds = newSelectedIds;
  },

  // コピー＆ペーストを1アクションで実行
  duplicate() {
    this.copy();
    this.paste();
  }
});