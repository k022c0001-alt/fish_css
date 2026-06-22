import { proxy } from 'valtio';

export const cameraStore = proxy({
  // ─── 状態 ───
  zoom: 1,      // 1 = 100%
  panX: 0,      // キャンバスの表示オフセットX
  panY: 0,      // キャンバスの表示オフセットY

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  // ズーム設定（最小5% 〜 最大3200% など、DTPソフト並のレンジを想定）
  setZoom(newZoom) {
    this.zoom = Math.max(0.05, Math.min(newZoom, 32));
  },

  // パン（スクロールやスペース+ドラッグ時）
  pan(dx, dy) {
    this.panX += dx;
    this.panY += dy;
  },

  // 指定した座標へパン（絶対位置指定）
  setPan(x, y) {
    this.panX = x;
    this.panY = y;
  },

  // 画面中央にリセット（フィット機能などで使用）
  reset() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }
});