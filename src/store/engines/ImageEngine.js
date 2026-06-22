export const ImageEngine = {
  // アプリ内で許容する画像の最大長（これを超えたら自動縮小する）
  MAX_IMAGE_DIMENSION: 4096, 

  /**
   * ─── 画像ファイルの読み込み＆自動最適化 ───
   * Fileオブジェクトを受け取り、必要に応じて縮小・圧縮をかけた上で、
   * shapeStoreに保存しやすいBase64（DataURL）とメタデータを返します。
   * * @param {File} file - ユーザーがドロップした画像ファイル
   * @returns {Promise<Object>} { dataUrl, originalWidth, originalHeight, aspect }
   */
  async processUpload(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // 1. サイズが巨大すぎる場合はアスペクト比を保ったまま縮小（メモリパンク防止）
          if (width > this.MAX_IMAGE_DIMENSION || height > this.MAX_IMAGE_DIMENSION) {
            const ratio = Math.min(this.MAX_IMAGE_DIMENSION / width, this.MAX_IMAGE_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // 2. Offscreen Canvas を使って画像を再描画＆圧縮
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // 画質を落とさずにリサイズするスムージング設定
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // 3. WebP形式（またはPNG/JPEG）でエンコードして軽量化 (品質0.9)
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/webp';
          const optimizedDataUrl = canvas.toDataURL(mimeType, 0.9);

          resolve({
            dataUrl: optimizedDataUrl,
            originalWidth: width,
            originalHeight: height,
            aspect: width / height
          });
        };
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました。'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * ─── 画像のトリミング (Crop) ───
   * ユーザーがUI上で指定した範囲だけを切り出し、新しい画像データとして生成します。
   * * @param {string} dataUrl - 元画像のBase64
   * @param {Object} cropRect - 切り抜く範囲 { x, y, width, height } (ピクセル単位)
   * @returns {Promise<string>} 切り抜き後の新しいDataURL
   */
  async cropImage(dataUrl, cropRect) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = cropRect.width;
        canvas.height = cropRect.height;
        const ctx = canvas.getContext('2d');

        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        // 元画像の(sx, sy)から切り取って、Canvasの(0, 0)に描画する
        ctx.drawImage(
          img,
          cropRect.x, cropRect.y, cropRect.width, cropRect.height,
          0, 0, cropRect.width, cropRect.height
        );

        resolve(canvas.toDataURL('image/webp', 0.9));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  },

  /**
   * ─── 印刷向け解像度（DPI/PPI）チェック ───
   * PrintEngineと連携し、「この画像をキャンバス上でこの物理サイズ(mm)で印刷した場合、
   * 画質が粗くならないか？」を計算します。
   * * @param {number} pixelWidth - 画像のピクセル幅 (px)
   * @param {number} physicalWidthMm - キャンバス上での表示幅 (mm)
   * @returns {Object} { dpi: number, isPrintSafe: boolean }
   */
  checkResolution(pixelWidth, physicalWidthMm) {
    // インチに変換 (1インチ = 25.4mm)
    const physicalWidthInch = physicalWidthMm / 25.4;
    
    // DPI (Dots Per Inch) を計算
    const dpi = Math.round(pixelWidth / physicalWidthInch);

    // 一般的なカラー印刷の推奨解像度は 300〜350 DPI
    // 200 DPI を下回ると目に見えて粗くなる（モザイク状になる）
    const isPrintSafe = dpi >= 250; 

    return { dpi, isPrintSafe };
  }
};