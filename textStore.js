import { proxy } from 'valtio';
import { shapeStore } from './shapeStore';

export const textStore = proxy({
  // ─── 状態 ───
  editingId: null,        // 現在インライン編集中のテキスト図形ID
  isEditing: false,       // 編集モード判定用フラグ
  tempContent: '',        // 編集中の未確定テキスト

  // テキスト・フォントカタログ (DTP・印刷用の登録フォント群)
  fonts: [
    { id: 'noto-sans-jp', name: 'Noto Sans JP', type: 'sans-serif' },
    { id: 'shippori-mincho', name: 'Shippori Mincho', type: 'serif' },
    { id: 'oswald', name: 'Oswald', type: 'display' }
  ],

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  // ダブルクリック等で編集モードに入る
  startEditing(shapeId) {
    const shape = shapeStore.shapes[shapeId];
    if (!shape || shape.type !== 'text') return;

    this.editingId = shapeId;
    this.isEditing = true;
    this.tempContent = shape.content || '';
  },

  // タイピング中の文字更新
  updateTempContent(newText) {
    this.tempContent = newText;
  },

  // 編集完了（エンターキーやキャンバス外クリック）
  finishEditing() {
    if (this.editingId && this.isEditing) {
      // 確定したテキストを shapeStore に書き戻す
      shapeStore.updateShape(this.editingId, { content: this.tempContent });
    }
    this.reset();
  },

  // キャンセル（Escキーなど）
  cancelEditing() {
    this.reset();
  },

  reset() {
    this.editingId = null;
    this.isEditing = false;
    this.tempContent = '';
  }
});