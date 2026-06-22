import { proxy, snapshot } from 'valtio';
import { shapeStore } from './shapeStore';
import { layerStore } from './layerStore';

export const historyStore = proxy({
  // 過去と未来の状態スタック (JSON文字列の配列)
  past: [],
  future: [],

  // ゲッター相当（UIのボタン活性/非活性判定用）
  get canUndo() {
    return this.past.length > 0;
  },
  get canRedo() {
    return this.future.length > 0;
  },

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  // 現在の状態を履歴に記録（ドラッグ終了時やプロパティ変更確定時に呼ぶ）
  pushState() {
    // Valtioのsnapshotを使って現在の状態をディープコピー的に取得
    const currentShapes = snapshot(shapeStore.shapes);
    const currentLayers = snapshot(layerStore.layers);

    const stateRecord = JSON.stringify({
      shapes: currentShapes,
      layers: currentLayers
    });

    this.past.push(stateRecord);
    
    // 新しいアクションを起こしたら、未来の履歴は消滅する（タイムパラドックス防止）
    this.future = [];

    // メモリ保護のため、履歴は最大50件に制限
    if (this.past.length > 50) {
      this.past.shift();
    }
  },

  undo() {
    if (this.past.length === 0) return;

    // 1. 今の状態をfutureに退避
    const currentShapes = snapshot(shapeStore.shapes);
    const currentLayers = snapshot(layerStore.layers);
    this.future.push(JSON.stringify({ shapes: currentShapes, layers: currentLayers }));

    // 2. 過去の状態を取り出す
    const previousStateStr = this.past.pop();
    const previousState = JSON.parse(previousStateStr);

    // 3. 各ストアに復元（強制上書き）
    shapeStore.shapes = previousState.shapes;
    layerStore.layers = previousState.layers;
  },

  redo() {
    if (this.future.length === 0) return;

    // 1. 今の状態をpastに退避
    const currentShapes = snapshot(shapeStore.shapes);
    const currentLayers = snapshot(layerStore.layers);
    this.past.push(JSON.stringify({ shapes: currentShapes, layers: currentLayers }));

    // 2. 未来の状態を取り出す
    const nextStateStr = this.future.pop();
    const nextState = JSON.parse(nextStateStr);

    // 3. 各ストアに復元
    shapeStore.shapes = nextState.shapes;
    layerStore.layers = nextState.layers;
  },
  
  // ページ切り替え時などに履歴をリセット
  clear() {
    this.past = [];
    this.future = [];
  }
});