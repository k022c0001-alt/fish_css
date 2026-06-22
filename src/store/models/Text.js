// src/models/Text.js
import { Shape } from './Shape';

export class Text extends Shape {
  constructor(init = {}) {
    super(init);
    this.type = 'text';
    this.content = init.content || 'テキストを入力';
    this.fontSize = init.fontSize || 12; // ポイント[pt]基準
    this.color = init.color || '#1e293b';
    this.fontWeight = init.fontWeight || 'normal';
    this.fontFamily = init.fontFamily || 'sans-serif';
    this.align = init.align || 'left'; // 'left' | 'center' | 'right'
  }

  toObject() {
    return {
      ...super.toObject(),
      content: this.content,
      fontSize: this.fontSize,
      color: this.color,
      fontWeight: this.fontWeight,
      fontFamily: this.fontFamily,
      align: this.align,
    };
  }
}