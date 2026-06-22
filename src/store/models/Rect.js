// src/models/Rect.js
import { Shape } from './Shape';

export class Rect extends Shape {
  constructor(init = {}) {
    super(init);
    this.type = 'rect';
    this.borderRadius = init.borderRadius || 0; // 角丸（mm）
  }

  toObject() {
    return {
      ...super.toObject(),
      borderRadius: this.borderRadius,
    };
  }
}