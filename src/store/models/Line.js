// src/models/Line.js
import { Shape } from './Shape';

export class Line extends Shape {
  constructor(init = {}) {
    super(init);
    this.type = 'line';
    
    // 始点終点(x1, y1, x2, y2)で初期化された場合、バウンディングボックスに変換
    if (init.x1 !== undefined && init.y1 !== undefined) {
      const minX = Math.min(init.x1, init.x2);
      const minY = Math.min(init.y1, init.y2);
      const maxX = Math.max(init.x1, init.x2);
      const maxY = Math.max(init.y1, init.y2);

      this.x = minX;
      this.y = minY;
      this.width = Math.max(0.5, maxX - minX);
      this.height = Math.max(0.5, maxY - minY);
    }
    
    // 線の色と太さを明示的にセット
    this.stroke = init.stroke || '#ff8f6d';
    this.strokeWidth = init.strokeWidth || 1;
    this.fill = { type: 'none' }; // 直線は塗りつぶしなし
  }
}