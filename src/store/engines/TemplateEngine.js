import { snapshot } from 'valtio';
import { canvasStore } from '../store/canvasStore';
import { shapeStore } from '../store/shapeStore';
import { layerStore } from '../store/layerStore';
import { historyStore } from '../store/historyStore';

export const TemplateEngine = {
  /**
   * ─── 現在のキャンバスをテンプレートとしてシリアライズ ───
   * サーバー保存やローカルファイル保存に使える純粋なJSONオブジェクトを生成します。
   */
  exportAsTemplate(title = '新規テンプレート') {
    return {
      version: '1.0',
      metadata: {
        title,
        createdAt: Date.now()
      },
      canvas: snapshot(canvasStore),
      shapes: snapshot(shapeStore.shapes),
      layers: snapshot(layerStore.layers)
    };
  },

  /**
   * ─── テンプレートのロード ───
   * 既存のストアのデータをすべて上書きし、テンプレートを展開します。
   */
  loadTemplate(templateData) {
    if (!templateData || !templateData.canvas || !templateData.shapes || !templateData.layers) {
      console.error('❌ TemplateEngine: 無効なテンプレートデータです。');
      return false;
    }

    // 1. キャンバス情報の復元
    const { width, height, unit, title } = templateData.canvas;
    // canvasStoreにupdateメソッドがある想定、または直接代入
    canvasStore.width = width;
    canvasStore.height = height;
    canvasStore.unit = unit;
    canvasStore.title = `${title} (テンプレートから作成)`;

    // 2. 図形データの復元
    // 一度空にしてからディープコピーを流し込む
    shapeStore.shapes = JSON.parse(JSON.stringify(templateData.shapes));

    // 3. レイヤー構造の復元
    layerStore.layers = JSON.parse(JSON.stringify(templateData.layers));

    // 4. 履歴の初期化
    historyStore.clear(); // テンプレート展開直後を「原点」にする
    historyStore.pushState();

    console.log(`🎯 テンプレート「${title}」の展開に成功しました。`);
    return true;
  },

  /**
   * ─── バリアブル（流し込み）印刷用データバインディング ───
   * テキスト図形内の {{variable}} を指定のデータで一括置換します。
   * 名刺の大量生成（名前や役職だけを差し替える）などに絶大な威力を発揮します。
   * * @param {Object} dataMap - { name: '山田 太郎', role: 'デザイナー' } のような変数辞書
   */
  bindVariables(dataMap) {
    // 現在の形をベースにするため、一時的にshapesをスキャン
    Object.keys(shapeStore.shapes).forEach(id => {
      const shape = shapeStore.shapes[id];
      
      // テキスト図形かつ、置換用トークン {{...}} が含まれているかチェック
      if (shape.type === 'text' && shape.content.includes('{{')) {
        let newContent = shape.content;

        // dataMapに指定された変数名を探して置換
        Object.entries(dataMap).forEach(([key, value]) => {
          const token = `{{${key}}}`;
          if (newContent.includes(token)) {
            newContent = newContent.replaceAll(token, value);
          }
        });

        // ストアの値を書き換え（画面上のテキストが瞬時に切り替わる）
        shapeStore.updateShape(id, { content: newContent });
      }
    });

    // 置換後の状態を履歴に保存
    historyStore.pushState();
  },

  /**
   * ─── 大量生成（マルチページ/連続出力）用ユーティリティ ───
   * CSV等から読み込んだ配列データを元に、置換とExport（SVG等）を連続して回します。
   * @param {Array<Object>} records - [{name:'A', role:'X'}, {name:'B', role:'Y'}]
   * @param {Object} ExportEngine - 先ほど作成したExportEngineの参照
   */
  batchExport(records, ExportEngine) {
    // オリジナルの状態を退避（置換で壊さないため）
    const originalSnapshot = this.exportAsTemplate('Backup');

    console.log(`🖨️ バッチ出力開始: 全 ${records.length} 件`);

    records.forEach((record, index) => {
      // 1. データを流し込む
      this.bindVariables(record);

      // 2. ExportEngineを使ってSVGを生成
      const svgString = ExportEngine.generateSvgString({
        width: canvasStore.width,
        height: canvasStore.height,
        shapes: Object.values(shapeStore.shapes),
        layers: layerStore.layers
      });

      // 3. ダウンロード発火 (例: item_0.svg, item_1.svg...)
      ExportEngine.downloadAsSvg(`output_page_${index + 1}`, svgString);

      // 4. 状態をオリジナルにリセットして次のループへ
      shapeStore.shapes = JSON.parse(JSON.stringify(originalSnapshot.shapes));
    });

    // 最終的に元の状態に戻す
    this.loadTemplate(originalSnapshot);
    console.log('🏁 バッチ出力がすべて完了し、エディタの状態を復元しました。');
  }
};