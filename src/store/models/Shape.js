/**
 * ⬡ Shape 基底モデル
 * キャンバス上に配置されるすべてのオブジェクトの共通プロパティを定義します。
 */
export class Shape {
  constructor(init = {}) {
    this.id = init.id || Math.random().toString(36).slice(2) + Date.now().toString(36);
    this.type = init.type || 'abstract';
    
    // 📐 幾何学プロパティ（すべてミリメートル[mm]基準）
    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.width = init.width ?? 10;
    this.height = init.height ?? 10;
    this.rotation = init.rotation || 0; // 度数法 (0 ~ 360)

    // 🔒 状態メタデータ
    this.locked = init.locked || false;
    this.hidden = init.hidden || false;

    // 🎨 スタイル（初期値は単色。テクスチャやグラデーションにも対応可能）
    this.fill = init.fill || { type: 'single', color: '#cbd5e1' };
    this.stroke = init.stroke || '#000000';
    this.strokeWidth = init.strokeWidth || 0; // 0 は線なし
  }

  /**
   * JSONシリアライズ用のプレインオブジェクトに変換
   */
  toObject() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      locked: this.locked,
      hidden: this.hidden,
      fill: { ...this.fill },
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    };
  }
}