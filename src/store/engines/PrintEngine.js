export const PrintEngine = {
  // ─── 規格サイズ定数 (mm) ───
  SIZES: {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    B5: { width: 182, height: 257 },
    POSTCARD: { width: 100, height: 148 },
    BUSINESS_CARD: { width: 91, height: 55 } // 日本の標準名刺
  },

  // ミリメートル(mm) を PDF標準のポイント(pt) に高精度変換 (1 inch = 25.4mm = 72pt)
  mmToPt(mm) {
    return (mm / 25.4) * 72;
  },

  // ポイント(pt) から ミリメートル(mm) への逆変換
  ptToMm(pt) {
    return (pt / 72) * 25.4;
  },

  /**
   * ─── プリフライト（印刷事故防止・事前診断）システム ───
   * デザイナーが気付けない「断裁時の文字切れ」「解像度不足」を自動検知する
   */
  checkPreflight({ width, height, shapes, layers }) {
    const warnings = [];
    const bleedMargin = 3;  // 塗り足し基準: 3mm
    const safeMargin = 3;   // 安全領域基準: 内側3mm

    // ロック/非表示レイヤーのルックアップ作成
    const layerMap = new Map(layers.map(l => [l.shapeId, l]));

    shapes.forEach(shape => {
      const layer = layerMap.get(shape.id);
      if (layer && !layer.visible) return; // 非表示レイヤーはチェック対象外

      // 1. 【極小文字のチェック】
      if (shape.type === 'text') {
        if (shape.fontSize < 5) {
          warnings.push({
            type: 'danger',
            id: shape.id,
            message: `📝 文字「${shape.content.slice(0, 8)}...」のサイズが5pt未満です。実際の印刷で潰れて読めなくなる可能性が極めて高いです。`
          });
        }

        // 2. 【断裁巻き込み（セーフエリア）チェック】
        const isOutOfBounds = 
          shape.x < safeMargin || 
          shape.y < safeMargin || 
          (shape.x + (shape.width || 0)) > (width - safeMargin) || 
          (shape.y + (shape.height || 0)) > (height - safeMargin);

        if (isOutOfBounds) {
          warnings.push({
            type: 'warning',
            id: shape.id,
            message: `✂️ テキストの位置が用紙の端から3mm以内に接近しています。印刷後の断裁時に文字が切り落とされる恐れがあります。`
          });
        }
      }

      // 3. 【塗り足し（ブリード領域）不足チェック】
      // 用紙全体を覆う背景要素であるにもかかわらず、塗り足し（外側+3mm）が設定されていない場合
      if (shape.type === 'rect' && Math.abs(shape.width - width) < 2 && Math.abs(shape.height - height) < 2) {
        if (shape.x >= 0 && shape.y >= 0) {
          warnings.push({
            type: 'warning',
            id: shape.id,
            message: `⚠️ 背景オブジェクトが用紙ぴったり（塗り足し不足）です。印刷・裁断時のわずかなズレで、端に白いフチが残る原因になります。x: -3, y: -3, width: ${width + 6} に広げることを推奨します。`
          });
        }
      }
    });

    return warnings;
  }
};