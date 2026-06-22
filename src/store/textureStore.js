import { proxy } from 'valtio';

export const textureStore = proxy({
  // ─── 登録済みのテクスチャ・フィルターカタログ ───
  textures: {
    nursery_fish: {
      id: 'nursery_fish',
      name: 'ナーサリーフィッシュ風',
      description: '真珠光沢と透明感のある柔らかい質感。',
      cssValues: {
        background: 'linear-gradient(135deg, #ffb199, #ff8f6d, #ffd2c0)',
        boxShadow: '0 2px 8px rgba(255,150,120,.25)',
        filter: 'saturate(1.2) contrast(1.05)',
      },
      // 印刷（SVG/PDF）出力用のアセット参照
      svgDefId: 'filter-nursery-fish', 
    },
    salmon_steak: {
      id: 'salmon_steak',
      name: 'サーモンステーキ寿司風',
      description: 'シャリの白と、脂の乗ったサーモンのオレンジ、照り感。',
      cssValues: {
        background: 'linear-gradient(180deg, #ffffff 10%, #ff7e5f 40%, #feb47b 90%)',
        boxShadow: 'inset 0 4px 6px rgba(255,255,255,0.8), 0 4px 10px rgba(200,80,50,0.4)',
        filter: 'brightness(1.1) drop-shadow(0px 5px 2px rgba(0,0,0,0.2))',
      },
      svgDefId: 'filter-salmon-steak',
    },
    glass: {
      id: 'glass',
      name: 'すりガラス（グラスモーフィズム）',
      description: '背景を透過しつつぼかす、モダンなUI向け質感。',
      cssValues: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
      svgDefId: 'filter-glass',
    }
  },

  // ==========================================
  // 🛠️ アクション群 (Ver 3.0 プラグイン対応用)
  // ==========================================

  // プラグイン等で外部から新しいテクスチャを注入する
  registerTexture(id, textureData) {
    this.textures[id] = textureData;
  },

  // 指定したIDのテクスチャ情報を取得
  getTexture(id) {
    return this.textures[id] || null;
  }
});