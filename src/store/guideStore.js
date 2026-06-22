import { proxy } from 'valtio';

export const guideStore = proxy({
  // ─── 状態 ───
  snap: true,          // オブジェクト同士やグリッドへのスナップ
  
  grid: {
    visible: false,
    size: 10,          // 10mm単位
  },
  
  // 印刷・DTP用ガイド
  safeArea: {
    visible: true,     // 文字切れを防ぐ内側の安全マージン（例: 端から3mm）
    margin: 3,
  },
  bleedArea: {
    visible: true,     // 塗り足し領域（例: 外側に3mm）
    margin: 3,
  },

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  toggleSnap() {
    this.snap = !this.snap;
  },

  toggleGrid() {
    this.grid.visible = !this.grid.visible;
  },

  toggleSafeArea() {
    this.safeArea.visible = !this.safeArea.visible;
  },

  toggleBleedArea() {
    this.bleedArea.visible = !this.bleedArea.visible;
  }
});