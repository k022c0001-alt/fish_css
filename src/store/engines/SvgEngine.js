import { proxy } from 'valtio';
import { shapeStore } from '../store/shapeStore';
import { layerStore } from '../store/layerStore';

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * 【Pathモデルの基本構造（完成してshapeStoreに入る時）】
 * type: 'path',
 * points: [
 * { x: 10, y: 10, handleIn: null, handleOut: { x: 15, y: 5 } },
 * { x: 40, y: 40, handleIn: { x: 30, y: 45 }, handleOut: null }
 * ],
 * closed: false,
 * stroke: '#000', strokeWidth: 1, fill: 'none'
 */

export const SvgEngine = proxy({
  // ─── ペンツールの状態 ───
  mode: 'idle',           // 'idle' | 'drawing' (新規パス作成中) | 'editing_nodes' (アンカー編集モード)
  activePathId: null,     // 現在描画中・編集中のパスID
  tempPoints: [],         // 描画中の一時的なアンカーポイント配列
  isClosed: false,        // パスが閉じられたか

  // ドラッグによるハンドル（方向線）操作のトラッキング用
  draggingHandle: null,   // { pointIndex: 1, type: 'handleOut' }

  // ==========================================
  // 🛠️ ペンツール アクション群
  // ==========================================

  // ペンツールでキャンバスをクリックし、最初のアンカーを打つ
  startDrawing(x, y) {
    this.mode = 'drawing';
    this.activePathId = `path_${genId()}`;
    this.tempPoints = [
      { x, y, handleIn: null, handleOut: null }
    ];
    this.isClosed = false;
  },

  // 2点目以降のアンカーを追加
  addPoint(x, y) {
    if (this.mode !== 'drawing') return;
    this.tempPoints.push({ x, y, handleIn: null, handleOut: null });
  },

  // クリックしたままドラッグして、最新のアンカーにベジェハンドルを伸ばす
  pullHandle(x, y) {
    if (this.mode !== 'drawing' || this.tempPoints.length === 0) return;
    
    const lastIndex = this.tempPoints.length - 1;
    const currentPoint = this.tempPoints[lastIndex];

    // 引っ張った先が handleOut、逆方向（点対称）が handleIn
    currentPoint.handleOut = { x, y };
    currentPoint.handleIn = {
      x: currentPoint.x - (x - currentPoint.x),
      y: currentPoint.y - (y - currentPoint.y)
    };
  },

  // 最初のアンカーをクリックしてパスを閉じる
  closePath() {
    if (this.mode !== 'drawing') return;
    this.isClosed = true;
    this.finishDrawing();
  },

  // エンターキー等で、パスを閉じずに描画を完了する
  finishDrawing() {
    if (this.tempPoints.length < 2) {
      // 1点しか打ってない場合はキャンセル扱い
      this.reset();
      return;
    }

    // 🌟 shapeStore に完成したパス図形として納品
    shapeStore.addShape({
      id: this.activePathId,
      type: 'path',
      points: [...this.tempPoints], // Valtioのプロキシから純粋な配列にコピー
      closed: this.isClosed,
      x: 0, y: 0, // パスの場合は絶対座標系（pointsの生座標）を使うか、BoundingBoxを計算してX,Yを入れる
      stroke: '#334155', // デフォルトの線色
      strokeWidth: 0.5,  // 印刷想定 (0.5mm)
      fill: this.isClosed ? '#e2e8f0' : 'none'
    });

    // レイヤーにも追加
    layerStore.addLayer({
      id: `layer_${genId()}`,
      shapeId: this.activePathId,
      name: 'カスタムパス',
    });

    this.reset();
  },

  // ─── ダイレクト選択ツール（白矢印）用のアクション ───

  enterNodeEditMode(shapeId) {
    const shape = shapeStore.shapes[shapeId];
    if (!shape || shape.type !== 'path') return;

    this.mode = 'editing_nodes';
    this.activePathId = shapeId;
    // 既存のポイントをエンジン側に読み込む
    this.tempPoints = [...shape.points]; 
  },

  updateNodePosition(index, newX, newY) {
    if (this.mode !== 'editing_nodes') return;
    
    const point = this.tempPoints[index];
    const dx = newX - point.x;
    const dy = newY - point.y;

    point.x = newX;
    point.y = newY;

    // ノードが動いたらハンドルも追従させる
    if (point.handleIn) {
      point.handleIn.x += dx;
      point.handleIn.y += dy;
    }
    if (point.handleOut) {
      point.handleOut.x += dx;
      point.handleOut.y += dy;
    }

    // リアルタイムで shapeStore も更新してキャンバスに反映
    shapeStore.updateShape(this.activePathId, { points: [...this.tempPoints] });
  },

  reset() {
    this.mode = 'idle';
    this.activePathId = null;
    this.tempPoints = [];
    this.isClosed = false;
    this.draggingHandle = null;
  }
});