import { proxy } from 'valtio';

export const canvasStore = proxy({
  // ─── 1. ドキュメント基本情報 ───
  id: null,
  title: '無題のデザイン',
  width: 210,   // デフォルトはA4縦
  height: 297,  // デフォルトはA4縦
  unit: 'mm',   // 'mm' | 'px' (Project Salmonは印刷に強いのでmm基準)
  backgroundColor: '#ffffff',

  // ─── 2. エディタのビューポート状態 (表示用) ───
  viewport: {
    zoom: 1,      // 1 = 100%
    panX: 0,      // キャンバスの表示オフセットX
    panY: 0,      // キャンバスの表示オフセットY
  },

  // ─── 3. グリッド＆スナップ設定 (Ver 0.2) ───
  grid: {
    visible: true,
    size: 10,         // 10mm単位のグリッド
    snapToGrid: true, // ドラッグ時のスナップ有効化
  },

  // ==========================================
  // 🛠️ アクション群 (Valtioなので直接代入でOK)
  // ==========================================

  init(id, title, width, height, unit = 'mm') {
    this.id = id;
    this.title = title;
    this.width = width;
    this.height = height;
    this.unit = unit;
  },

  updateSize(width, height) {
    this.width = width;
    this.height = height;
  },

  // ズームイン・アウト（マウスホイール等から呼ばれる）
  setZoom(newZoom) {
    // 最小10% 〜 最大1000%に制限
    this.viewport.zoom = Math.max(0.1, Math.min(newZoom, 10));
  },

  // パン（スペースキー押下＋ドラッグ等から呼ばれる）
  pan(dx, dy) {
    this.viewport.panX += dx;
    this.viewport.panY += dy;
  },

  // グリッドの切り替え
  toggleGrid() {
    this.grid.visible = !this.grid.visible;
  },
  
  toggleSnap() {
    this.grid.snapToGrid = !this.grid.snapToGrid;
  }
});