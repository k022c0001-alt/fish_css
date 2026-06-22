import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Valtio ストアのアクションを直接呼び出す（書き込みは snapshot 不要で爆速）
import { canvasStore } from '../store/canvasStore';
import { shapeStore } from '../store/shapeStore';
import { layerStore } from '../store/layerStore';

// 2. Salmon専用の印刷・PDF書き出しエンジン（Ver0.6 / Ver0.7）
import { PrintEngine } from '../engines/PrintEngine';
import { PdfExporter } from '../exporters/PdfExporter';

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// 🐟 Salmon仕様：グラフィック・印刷プリセットテンプレート（初期値：ミリメートル基準）
const SALMON_PRESETS = [
  {
    id: 'tpl-business-card',
    title: '極上の名刺（ナーサリーフィッシュ仕立て）',
    category: 'business_card',
    widthMm: 91,  // 日本の標準名刺サイズ
    heightMm: 55,
    description: '真珠光沢と柔らかい影のテクスチャを纏った、手触りを感じる名刺デザイン。',
    shapes: [
      { id: 'bg', type: 'rect', x: 0, y: 0, width: 91, height: 55, fill: { type: 'texture', textureId: 'nursery_fish' }, locked: true },
      { id: 'text-name', type: 'text', x: 10, y: 20, content: '鮭川 太郎', fontSize: 16, color: '#1e293b', fontWeight: 'bold' },
      { id: 'text-title', type: 'text', x: 10, y: 38, content: 'Project Salmon 総責任者', fontSize: 8, color: '#64748b' },
      { id: 'deco-line', type: 'line', x1: 10, y1: 32, x2: 81, y2: 32, stroke: '#ff8f6d', strokeWidth: 0.5 }
    ]
  },
  {
    id: 'tpl-poster-a4',
    title: 'サーモン寿司フェア 特売POP',
    category: 'pop',
    widthMm: 210, // A4サイズ
    heightMm: 297,
    description: 'インパクト重視の縦長POP。自動警告機能（文字サイズ・余白）のテストに最適。',
    shapes: [
      { id: 'bg', type: 'rect', x: 0, y: 0, width: 210, height: 297, fill: { type: 'single', color: '#fff5f2' } },
      { id: 'main-catch', type: 'text', x: 20, y: 40, content: '鮮度、爆発。', fontSize: 42, color: '#e11d48', fontWeight: 'extrabold' },
      { id: 'sub-catch', type: 'text', x: 22, y: 90, content: '脂の乗ったサーモンステーキ寿司、解禁。', fontSize: 14, color: '#475569' },
      { id: 'accent-circle', type: 'circle', cx: 150, cy: 200, r: 40, fill: { type: 'gradient', gradientId: 'salmon_steak_grad' } }
    ]
  }
];

export default function TemplatesPage() {
  const navigate = useNavigate();

  // 🌟 BFFから取得するクラウドテンプレート用のステート（Ver3.0 プラグイン拡張も見据えて保持）
  const [cloudTemplates, setCloudTemplates] = useState([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(true);

  // 🛠 開発用ツールエディタ（JSONの中身をいじる用）のローカルステート
  const [selectedPreset, setSelectedPreset] = useState(SALMON_PRESETS[0]);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SALMON_PRESETS[0].shapes, null, 2));
  const [customTitle, setCustomTitle] = useState(SALMON_PRESETS[0].title);
  const [jsonError, setJsonError] = useState(null);

  // マウント時にクラウドの追加テンプレート（またはプラグインアセット）を取得
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingCloud(true);
        const response = await fetch('/api/salmon-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list_templates' })
        });
        const data = await response.json();
        if (data.status === 'success' && data.templates) {
          setCloudTemplates(data.templates);
        }
      } catch (error) {
        console.error("Salmonテンプレート一覧の取得に失敗:", error);
      } finally {
        setIsLoadingCloud(false);
      }
    };
    fetchTemplates();
  }, []);

  // プリセット切り替え時の処理
  const handlePresetChange = (presetId) => {
    const target = SALMON_PRESETS.find(t => t.id === presetId);
    if (target) {
      setSelectedPreset(target);
      setCustomTitle(target.title);
      setJsonInput(JSON.stringify(target.shapes, null, 2));
      setJsonError(null);
    }
  };

  // 🚀 Valtioの各独立ストアにデータを直接流し込んでエディタを起動
  const launchSalmonBuilder = (title, widthMm, heightMm, rawShapes) => {
    const pageId = genId();

    // ① キャンバスの基本設定（タイトル、ミリメートルサイズ）をValtioに直接代入
    canvasStore.id = pageId;
    canvasStore.title = title;
    canvasStore.width = widthMm;
    canvasStore.height = heightMm;
    canvasStore.unit = 'mm'; // 印刷に強いデザインエディタの証

    // ② 図形データのセットアップ（IDの解決と格納）
    const shapesMap = {};
    const layersList = [];

    rawShapes.forEach((shape, index) => {
      const shapeId = shape.id || genId();
      shapesMap[shapeId] = {
        ...shape,
        id: shapeId,
        orderIndex: index
      };
      
      // ③ レイヤーシステムの初期構造を生成
      layersList.push({
        id: genId(),
        shapeId: shapeId,
        name: shape.content || `${shape.type}_${index}`,
        visible: true,
        locked: shape.locked || false
      });
    });

    shapeStore.shapes = shapesMap;
    layerStore.layers = layersList;

    // 🚀 エディタへジャンプ
    navigate(`/builder/${pageId}`);
  };

  // 🛠 開発者ツール：現在のカスタムJSONを使ってエディタを起動
  const handleLaunchWithJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('ルート要素は図形（Shape）オブジェクトの配列である必要があります。');
      }
      setJsonError(null);
      launchSalmonBuilder(customTitle, selectedPreset.widthMm, selectedPreset.heightMm, parsed);
    } catch (err) {
      setJsonError(err.message || 'JSONのパースに失敗しました。');
    }
  };

  // 🛠 開発者ツール：エディタを開かず、この場でPrintEngineによるPDFレンダリングテスト
  const handleDirectPdfTest = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error('図形配列ではありません。');
      setJsonError(null);

      // PrintEngineを介して事前チェック（文字が小さい、余白不足などの警告を出す）
      const warnings = PrintEngine.checkPreflight({
        width: selectedPreset.widthMm,
        height: selectedPreset.heightMm,
        shapes: parsed
      });

      if (warnings.length > 0) {
        alert(`🚨 印刷警告を検知しました:\n${warnings.join('\n')}\n\nこのままPDF出力を強行します。`);
      }

      // PDFエクスポート処理のキック
      await PdfExporter.export({
        title: customTitle,
        width: selectedPreset.widthMm,
        height: selectedPreset.heightMm,
        shapes: parsed
      });
    } catch (err) {
      setJsonError(`PDFテスト失敗: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-950 text-slate-100 min-h-screen font-sans">
      
      {/* 上部ヘッダー */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">
            Project Salmon Studio 🎨
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ver 0.8 TemplateEngine & 印刷プレビューの実験場。質感と解像度をハックせよ。
          </p>
        </div>
        <button 
          onClick={() => launchSalmonBuilder('無題のデザイン', 210, 297, [])} 
          className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-sm transition font-bold shadow-lg shadow-orange-900/40"
        >
          空のキャンバス（A4）を開く 🏗
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側・中央：テンプレート選択領域 */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* 🌟 1. プラグイン or クラウドから取得した高度なテクスチャ入りテンプレート */}
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-orange-400">
              💎 特殊質感・クラウドテンプレート <span className="text-xs bg-orange-950 text-orange-300 px-2 py-1 rounded border border-orange-800">Ver 1.0仕様</span>
            </h2>
            
            {isLoadingCloud ? (
              <div className="text-slate-500 text-sm animate-pulse border border-slate-800 rounded-xl p-8 text-center bg-slate-900/50">
                サーバーからサーモン専用グラフィックテンプレートを探索中...
              </div>
            ) : cloudTemplates.length === 0 ? (
              <div className="text-slate-400 text-sm border border-slate-800 rounded-xl p-8 text-center bg-slate-900/30 font-medium">
                🫙 追加のプラグイン用テンプレートは現在未ロードです（ローカルプリセットを使用してください）。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* クラウドデータのマッピング（ロード成功時） */}
              </div>
            )}
          </section>

          <hr className="border-slate-800" />

          {/* 2. ローカルのコア・グラフィックプリセット */}
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-200">
              📐 基本定型・印刷サイズから選ぶ <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">ミリメートル(mm)基準</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SALMON_PRESETS.map((tpl) => (
                <div key={tpl.id} className="border border-slate-800 rounded-xl p-5 bg-slate-900 shadow-xl flex flex-col justify-between hover:border-orange-500/50 transition-colors group">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-orange-400 transition-colors">{tpl.title}</h3>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {tpl.widthMm}x{tpl.heightMm}mm
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2 min-h-[40px] leading-relaxed">{tpl.description}</p>
                  </div>
                  <div className="mt-5">
                    <button 
                      onClick={() => launchSalmonBuilder(tpl.title, tpl.widthMm, tpl.heightMm, tpl.shapes)}
                      className="w-full bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white py-2.5 rounded-lg text-sm font-bold transition duration-200 border border-slate-700 hover:border-transparent"
                    >
                      このサイズで Salmon を起動 🔥
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 実験用タブ・下部ナビゲーション */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-base text-slate-300">その他のコアエンジン用デバッグツール</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              <button onClick={() => navigate('/textures')} className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-800 hover:border-slate-600 transition text-slate-400 hover:text-slate-200">
                🧬 TextureEngine (Ver0.5)
              </button>
              <button onClick={() => navigate('/filters')} className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-800 hover:border-slate-600 transition text-slate-400 hover:text-slate-200">
                🧪 FilterEngine (Ver1.0)
              </button>
              <button onClick={() => navigate('/history')} className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-800 hover:border-slate-600 transition text-slate-400 hover:text-slate-200">
                ⏳ HistoryEngine タイムパラドックス
              </button>
            </div>
          </div>
        </div>

        {/* 右側：モデル書き換え ＆ プリフライト（印刷事前チェック）スタジオ */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-2xl border border-slate-800 space-y-4 flex flex-col justify-between sticky top-6 h-max">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h2 className="text-lg font-bold text-orange-400 flex items-center gap-1">🛠 Salmon JSON エディタ</h2>
              <p className="text-xs text-slate-400">図形オブジェクトの生スキーマをハックします。</p>
            </div>

            {/* プリセット選択 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">土台となるグラフィックモデル</label>
              <select 
                value={selectedPreset.id} 
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-orange-500 font-medium"
              >
                {SALMON_PRESETS.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* ページタイトル */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">プロジェクト名称</label>
              <input 
                type="text" 
                value={customTitle} 
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* JSONコードエディタ領域 */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-slate-400 mb-1">図形構造データ（`models/Shape.js` 準拠）</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={12}
                className="w-full bg-black text-emerald-400 font-mono text-xs p-3 rounded border border-slate-800 focus:outline-none focus:border-orange-500 resize-none leading-relaxed shadow-inner"
                placeholder='[ { "type": "rect", "x": 0, "y": 0, ... } ]'
              />
              {jsonError && (
                <div className="bg-rose-950/80 border border-rose-900 text-rose-300 p-2.5 rounded text-xs mt-2 whitespace-pre-wrap font-mono">
                  ⚠️ {jsonError}
                </div>
              )}
            </div>
          </div>

          {/* テスト実行ボタン群 */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={handleLaunchWithJson}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-950/50 transition duration-150"
            >
              この内部モデルでビルダーを起動 🚀
            </button>
            
            <button
              onClick={handleDirectPdfTest}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-lg text-xs font-bold transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              PrintEngine（プリフライト）経由で直PDF出力 🖨
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}