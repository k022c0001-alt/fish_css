import { textureStore } from '../store/textureStore';

export const FilterEngine = {
  /**
   * アプリ起動時に呼び出し、すべてのカスタムフィルターを textureStore に登録する
   */
  initialize() {
    this.definitions.forEach(filterDef => {
      textureStore.registerTexture(filterDef.id, {
        id: filterDef.id,
        name: filterDef.name,
        description: filterDef.description,
        cssValues: filterDef.cssValues,
        svgDefId: filterDef.svgDefId,
        svgDefString: filterDef.svgDefString
      });
    });
    console.log(`🎨 FilterEngine: ${this.definitions.length}件のフィルターをロード完了`);
  },

  // ─── フィルター・テクスチャ カタログ ───
  definitions: [
    {
      id: 'paper',
      name: '画用紙 (Paper)',
      description: '微細な凹凸があるマットな画用紙の質感。',
      cssValues: {
        filter: 'contrast(0.9) brightness(1.05)',
        // CSSでの簡易プレビュー用ノイズ（本番SVGは下のsvgDefStringを使用）
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.08%22/%3E%3C/svg%3E")'
      },
      svgDefId: 'filter-paper',
      svgDefString: `<filter id="filter-paper"><feTurbulence type="fractalNoise" baseFrequency="0.04" result="noise" /><feDiffuseLighting in="noise" lighting-color="#fff" surfaceScale="2"><feDistantLight azimuth="45" elevation="60" /></feDiffuseLighting><feBlend mode="multiply" in="SourceGraphic" in2="noise" /></filter>`
    },
    {
      id: 'washi',
      name: '和紙 (Washi)',
      description: '長い繊維が絡み合う、温かみのある日本の伝統紙。',
      cssValues: {
        filter: 'sepia(0.2) contrast(0.85)',
      },
      svgDefId: 'filter-washi',
      // baseFrequencyのXとYを変えることで繊維の「流れ」を表現
      svgDefString: `<filter id="filter-washi"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="5" result="noise" /><feColorMatrix type="matrix" values="1 0 0 0 0  0 0.95 0 0 0  0 0.85 0 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" /><feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" /></filter>`
    },
    {
      id: 'watercolor',
      name: '水彩 (Watercolor)',
      description: 'フチに絵の具が溜まり、色が滲むアナログ表現。',
      cssValues: {
        filter: 'saturate(1.2) blur(0.5px)',
      },
      svgDefId: 'filter-watercolor',
      // feDisplacementMap でエッジを歪ませて「滲み」を作る
      svgDefString: `<filter id="filter-watercolor"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="displaced" /><feMorphology operator="dilate" radius="1" in="displaced" result="dilated" /><feComposite operator="in" in="dilated" in2="displaced" result="edge" /><feBlend mode="multiply" in="displaced" in2="edge" /></filter>`
    },
    {
      id: 'wood',
      name: '木目 (Wood)',
      description: 'ナチュラルな板目のテクスチャ。',
      cssValues: {
        filter: 'sepia(0.5) contrast(1.2)',
      },
      svgDefId: 'filter-wood',
      // 横方向に極端に引き伸ばしたノイズで木目を生成
      svgDefString: `<filter id="filter-wood"><feTurbulence type="fractalNoise" baseFrequency="0.1 0.01" numOctaves="3" result="noise" /><feColorMatrix type="matrix" values="0.8 0 0 0 0  0 0.6 0 0 0  0 0.4 0 0 0  0 0 0 0.4 0" in="noise" result="coloredNoise" /><feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" /></filter>`
    },
    {
      id: 'metal',
      name: '金属 (Metal)',
      description: '光沢と反射を持つシャープな質感。',
      cssValues: {
        background: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 40%, #888888 50%, #f5f5f5 60%, #c0c0c0 100%)',
        boxShadow: 'inset 0 0 2px rgba(255,255,255,0.8), 0 4px 6px rgba(0,0,0,0.3)',
      },
      svgDefId: 'filter-metal',
      svgDefString: `<filter id="filter-metal"><feComponentTransfer in="SourceGraphic"><feFuncR type="linear" slope="1.5"/><feFuncG type="linear" slope="1.5"/><feFuncB type="linear" slope="1.5"/></feComponentTransfer><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3" /></filter>`
    },
    {
      id: 'neon',
      name: 'ネオンサイン (Neon)',
      description: '暗闇で発光するチューブライト効果。',
      cssValues: {
        // CSS側での簡易ネオン表現 (色味はプロパティパネルで可変にする想定)
        filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 10px var(--shape-color, #0ff)) drop-shadow(0 0 20px var(--shape-color, #0ff))',
      },
      svgDefId: 'filter-neon',
      // 元の図形を白く飛ばし、その背後に複数のブラーを重ねて発光させる
      svgDefString: `<filter id="filter-neon" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" /><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" /><feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" /><feMerge result="glow"><feMergeNode in="blur3" /><feMergeNode in="blur2" /><feMergeNode in="blur1" /></feMerge><feColorMatrix type="matrix" values="1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0" in="SourceGraphic" result="whiteCore" /><feMerge><feMergeNode in="glow" /><feMergeNode in="whiteCore" /></feMerge></filter>`
    }
  ],

  /**
   * ExportEngine向けユーティリティ
   * 登録されている全フィルターの SVG <defs> 文字列を一括生成する
   */
  generateAllSvgDefs() {
    return this.definitions.map(def => def.svgDefString).join('\n');
  }
};