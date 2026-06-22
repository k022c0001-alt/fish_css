import { shapeStore } from './src/store/shapeStore.js';
import { selectionStore } from './src/store/selectionStore.js';
import { historyStore } from './src/store/historyStore.js';
import { PropertyEngine } from './src/engines/PropertyEngine.js';

console.log('--- 🚀 Project Salmon Core Test ---');

// 1. 初期状態の保存
historyStore.pushState();

// 2. 図形を2つ追加 (shapeStore)
shapeStore.addShape({ id: 'rect1', type: 'rect', x: 10, y: 50, width: 20, height: 20 });
shapeStore.addShape({ id: 'rect2', type: 'rect', x: 100, y: 150, width: 30, height: 30 });
console.log('📦 初期配置:', { 
  rect1_Y: shapeStore.shapes['rect1'].y, 
  rect2_Y: shapeStore.shapes['rect2'].y 
});
// 期待値: rect1_Y: 50, rect2_Y: 150

historyStore.pushState(); // 図形追加を履歴に記録

// 3. 両方を選択状態にする (selectionStore)
selectionStore.selectAll(['rect1', 'rect2']);

// 4. 上揃えを実行 (PropertyEngine)
// バウンディングボックスの最小Y（この場合はrect1の50）に合わせて、rect2のY座標が書き換わるはずです。
PropertyEngine.align('top');
console.log('✨ 上揃え後:', { 
  rect1_Y: shapeStore.shapes['rect1'].y, 
  rect2_Y: shapeStore.shapes['rect2'].y 
});
// 期待値: rect1_Y: 50, rect2_Y: 50

// 5. Undo（元に戻す）をテスト (historyStore)
historyStore.undo();
console.log('⏪ Undo実行後:', { 
  rect1_Y: shapeStore.shapes['rect1'].y, 
  rect2_Y: shapeStore.shapes['rect2'].y 
});
// 期待値: rect1_Y: 50, rect2_Y: 150