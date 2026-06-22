import { proxy } from 'valtio';

/**
 * 【Layerモデルの基本構造】
 * {
 * id: string,
 * shapeId: string, // shapeStore.shapes[shapeId] と紐づく
 * name: string,    // 「背景」「メインキャッチ」などの表示名
 * visible: boolean,
 * locked: boolean
 * }
 */

export const layerStore = proxy({
  // ─── 1. レイヤー配列 (インデックス0が一番背面、最後が一番前面) ───
  layers: [],

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  // レイヤーの追加（通常は一番前面＝配列の末尾に追加）
  addLayer(layerData) {
    this.layers.push({
      id: layerData.id || `layer_${Date.now()}`,
      shapeId: layerData.shapeId,
      name: layerData.name || '新規レイヤー',
      visible: layerData.visible ?? true,
      locked: layerData.locked ?? false,
    });
  },

  // 複数レイヤーの一括セット（初期ロード時など）
  setLayers(layersArray) {
    this.layers = layersArray;
  },

  // レイヤーの削除（shapeStoreの削除と連動して呼ぶ）
  removeLayer(shapeId) {
    const index = this.layers.findIndex(l => l.shapeId === shapeId);
    if (index !== -1) {
      this.layers.splice(index, 1);
    }
  },

  // ─── Ver 0.3 レイヤー操作エンジン ───

  // 表示/非表示の切り替え
  toggleVisibility(shapeId) {
    const layer = this.layers.find(l => l.shapeId === shapeId);
    if (layer) layer.visible = !layer.visible;
  },

  // ロック/アンロックの切り替え
  toggleLock(shapeId) {
    const layer = this.layers.find(l => l.shapeId === shapeId);
    if (layer) layer.locked = !layer.locked;
  },

  // レイヤー名の変更
  renameLayer(shapeId, newName) {
    const layer = this.layers.find(l => l.shapeId === shapeId);
    if (layer) layer.name = newName;
  },

  // 重なり順の変更 (ドラッグ＆ドロップでの入れ替えや、「最前面へ移動」など)
  reorderLayer(oldIndex, newIndex) {
    if (oldIndex < 0 || oldIndex >= this.layers.length || newIndex < 0 || newIndex >= this.layers.length) return;
    
    // Valtioのミュータブル操作で配列要素を入れ替え
    const [movedItem] = this.layers.splice(oldIndex, 1);
    this.layers.splice(newIndex, 0, movedItem);
  }
});