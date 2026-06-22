import { proxy } from 'valtio';

export const selectionStore = proxy({
  // ─── 状態 ───
  selectedIds: [],
  hoverId: null,

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  // 単一選択（他の選択を解除）
  select(id) {
    this.selectedIds = [id];
  },

  // 複数選択（Shiftキー押下時など）
  toggleSelect(id) {
    const index = this.selectedIds.indexOf(id);
    if (index === -1) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  },

  // 全選択
  selectAll(allShapeIds) {
    this.selectedIds = [...allShapeIds];
  },

  // 選択解除
  clearSelection() {
    if (this.selectedIds.length > 0) {
      this.selectedIds = [];
    }
  },

  // ホバー状態の更新（アウトライン表示用）
  setHover(id) {
    if (this.hoverId !== id) {
      this.hoverId = id;
    }
  }
});