import { proxy } from 'valtio';
import { textureStore } from '../store/textureStore';
import { shapeStore } from '../store/shapeStore';
import { layerStore } from '../store/layerStore';

// ─── 1. プラグインの登録状態 (UI描画用) ───
// ツールバーやエクスポートメニューがここを監視し、動的にメニューを増やします。
export const pluginRegistry = proxy({
  installedPlugins: [], // インストール済みのプラグイン一覧
  customShapes: {},     // 外部から追加された図形ツール { 'star': { name: '星', icon: '⭐' } }
  customExporters: {},  // 外部から追加された書き出し形式 { 'png': exportFn }
  customFilters: {},    // 外部から追加されたSVGフィルター
});

// ─── 2. プラグインエンジン本体 (ロジック) ───
export const PluginEngine = {
  /**
   * プラグインを初期化・インストールするエントリーポイント
   * @param {Object} plugin - { id, name, version, init: Function }
   */
  install(plugin) {
    if (pluginRegistry.installedPlugins.some(p => p.id === plugin.id)) {
      console.warn(`🔌 Plugin [${plugin.id}] は既にインストールされています。`);
      return;
    }

    try {
      // プラグインの初期化関数に、このエンジン自身のAPIを渡して実行させる
      plugin.init(this);
      
      pluginRegistry.installedPlugins.push({
        id: plugin.id,
        name: plugin.name,
        version: plugin.version || '1.0.0'
      });
      console.log(`🔌 Plugin Installed: ${plugin.name} (${plugin.id})`);
    } catch (error) {
      console.error(`🔌 Plugin [${plugin.id}] のインストールに失敗しました:`, error);
    }
  },

  // ==========================================
  // 🛠️ プラグイン向け公開API群 (SDK)
  // ==========================================

  /**
   * 新しい図形（カスタムシェイプ）を登録する
   * 例：星形、QRコード、チャートなど
   */
  registerShape(type, metaData, defaultProps = {}) {
    pluginRegistry.customShapes[type] = metaData;

    // ヘルパー関数を engine 側に持たせておくことで、
    // プラグイン側から簡単にキャンバスへ図形をドロップできるようにする
    return (x, y) => {
      const id = `${type}_${Date.now()}`;
      shapeStore.addShape({
        id,
        type,
        x,
        y,
        ...defaultProps
      });
      layerStore.addLayer({
        id: `layer_${Date.now()}`,
        shapeId: id,
        name: metaData.name || 'カスタム図形'
      });
      return id;
    };
  },

  /**
   * テクスチャストアに新しい質感を注入する
   */
  registerTexture(textureId, textureData) {
    textureStore.registerTexture(textureId, textureData);
  },

  /**
   * エクスポート形式を追加する (例：PNG, WebP, 独自JSONなど)
   */
  registerExporter(formatId, name, exportFunction) {
    pluginRegistry.customExporters[formatId] = { name, execute: exportFunction };
  },

  /**
   * カスタムSVGフィルターを登録する (Ver 1.0 Filter Engine 連携)
   */
  registerFilter(filterId, svgDefsString) {
    pluginRegistry.customFilters[filterId] = svgDefsString;
  }
};