// src/models/Circle.js
import { Shape } from './Shape';

export class Circle extends Shape {
  constructor(init = {}) {
    // 直径を width/height として扱うことで、リサイズエンジンと完全同期
    super(init);
    this.type = 'circle';
    
    // 縦横を強制的に同値にしたい場合はここで丸める
    if (init.r) {
      this.width = init.r * 2;
      this.height = init.r * 2;
    }
  }

  // 便宜上、中心点や半径を計算するゲッター
  get radius() { return this.width / 2; }
  get cx() { return this.x + this.radius; }
  get cy() { return this.y + this.radius; }
}