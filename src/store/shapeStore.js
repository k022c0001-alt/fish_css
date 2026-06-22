import { proxy } from 'valtio';

/**
 * 【Shapeモデルの基本構造（Schema）】
 * {
 * id: string,
 * type: 'rect' | 'circle' | 'text' | 'line',
 * x: number, y: number, width: number, height: number, rotation: number,
 * fill: { type: 'single', color: '#ff0000' } | { type: 'texture', textureId: 'nursery_fish' },
 * stroke: string, strokeWidth: number,
 * // Ver 1.0 (Filter Engine)
 * filters: { saturate: 1.2, dropShadow: '...' }
 * }
 */

export const shapeStore = proxy({
  // ─── 1. 図形データ本体（IDをキーにしたオブジェクト） ───
  shapes: {},

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  // 図形の追加
  addShape(shape) {
    // idが存在しない場合は生成（エラー防止）
    const id = shape.id || `shape_${Date.now()}`;
    this.shapes[id] = { ...shape, id };
  },

  // 複数図形の一括セット（テンプレート読み込み時などに使用）
  setShapes(shapesMap) {
    this.shapes = shapesMap;
  },

  // 特定の図形のプロパティを更新（ドラッグ移動などで超高頻度に呼ばれる）
  updateShape(id, updates) {
    if (this.shapes[id]) {
      // Valtioのミュータブル更新の恩恵！Object.assignで瞬時に上書き
      Object.assign(this.shapes[id], updates);
    }
  },

  // 図形の削除
  removeShape(id) {
    delete this.shapes[id]; // Valtioなら delete 演算子でリアクティブに削除検知されます
  },

  // 複数図形の削除（選択中の図形を一気に消す時など）
  removeShapes(ids) {
    ids.forEach(id => {
      delete this.shapes[id];
    });
  },

  // 色やテクスチャの変更 (Ver 0.5 対応)
  updateFill(id, fillData) {
    if (this.shapes[id]) {
      this.shapes[id].fill = { ...this.shapes[id].fill, ...fillData };
    }
  }
});