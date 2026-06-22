import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnapshot } from 'valtio';

// 1. Valtio ストアの読み込み
import { canvasStore } from '../store/canvasStore';
import { shapeStore } from '../store/shapeStore';
import { layerStore } from '../store/layerStore';
import { historyStore } from '../store/historyStore';

// 2. Salmon 専用カスタムフック群
import { useCanvas } from '../hooks/useCanvas';
import { useSelection } from '../hooks/useSelection';
import { useHistory } from '../hooks/useHistory';

// 3. コンポーネント群のドッキング（フォルダー構成通り）
import TopToolbar from '../components/Builder/TopToolbar/TopToolbar';
import ShapePalette from '../components/Builder/LeftPanel/ShapePalette';
import TemplatePalette from '../components/Builder/LeftPanel/TemplatePalette';
import GradientPalette from '../components/Builder/LeftPanel/GradientPalette';

import CanvasArea from '../components/Builder/Canvas/CanvasArea';
import PropertyPanel from '../components/Builder/RightPanel/PropertyPanel';
import LayerPanel from '../components/Builder/LayerPanel/LayerPanel';
import UndoRedoPanel from '../components/Builder/HistoryPanel/UndoRedoPanel';

export default function BuilderPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // ⚡ Valtio 状態のスナップショット（レンダリング同期用）
  // =========================================================
  const canvasSnap = useSnapshot(canvasStore);
  const shapeSnap = useSnapshot(shapeStore);
  const layerSnap = useSnapshot(layerStore);
  const historySnap = useSnapshot(historyStore);

  // =========================================================
  // 🛠️ Salmon コアフックの初期化
  // =========================================================
  const { initCanvas, loading } = useCanvas(pageId);
  const { selectedIds, clearSelection } = useSelection();
  const { undo, redo } = useHistory();

  // =========================================================
  // 🎛️ UI表示制御用のローカルステート
  // =========================================================
  const [leftTab, setLeftTab] = useState<'shape' | 'template' | 'gradient'>('shape');
  const [rightTab, setRightTab] = useState<'properties' | 'layers'>('properties');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // ページ初期化処理
  useEffect(() => {
    if (pageId) {
      initCanvas(pageId);
    }
  }, [pageId, initCanvas]);

  // =========================================================
  // 🚦 画面分岐レンダリング
  // =========================================================

  // 分岐①：データロード中
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-900 text-salmon-200 text-sm font-medium animate-pulse">
        🐟 Project Salmon 描画エンジン展開中...
      </div>
    );
  }

  // 分岐②：メインエディタ画面
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-800 text-slate-100 overflow-hidden relative font-sans select-none">
      
      {/* ─── 1. 上部固定ツールバー ─── */}
      <TopToolbar 
        pageTitle={canvasSnap.title}
        isDirty={historySnap.canUndo} // 履歴がある＝変更されている
        onUndo={undo}
        onRedo={redo}
        canUndo={historySnap.canUndo}
        canRedo={historySnap.canRedo}
        onTogglePrintPreview={() => setShowPrintPreview(!showPrintPreview)}
        onBack={() => navigate('/pages')}
      />

      {/* ─── 2. メインワークスペース (3ペイン構成) ─── */}
      <div className="flex flex-1 overflow-hidden relative w-full">
        
        {/* 🧩 A. 左側サイドパネル (図形・テンプレ・グラデーションのパレット) */}
        <div className="w-72 border-r border-slate-700 bg-slate-900 flex flex-col flex-shrink-0 z-20 shadow-xl overflow-hidden">
          {/* タブヘッダー */}
          <div className="flex border-b border-slate-700 bg-slate-950 text-xs flex-shrink-0">
            <button 
              onClick={() => setLeftTab('shape')}
              className={`flex-1 py-3 font-bold border-b-2 transition-colors ${leftTab === 'shape' ? 'border-orange-500 text-orange-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              ⬡ 図形 (Ver0.1)
            </button>
            <button 
              onClick={() => setLeftTab('template')}
              className={`flex-1 py-3 font-bold border-b-2 transition-colors ${leftTab === 'template' ? 'border-orange-500 text-orange-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              🎴 テンプレ
            </button>
            <button 
              onClick={() => setLeftTab('gradient')}
              className={`flex-1 py-3 font-bold border-b-2 transition-colors ${leftTab === 'gradient' ? 'border-orange-500 text-orange-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              🌈 グラデ
            </button>
          </div>

          {/* パレットコンテンツ */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {leftTab === 'shape' && <ShapePalette />}
            {leftTab === 'template' && <TemplatePalette />}
            {leftTab === 'gradient' && <GradientPalette />}
          </div>
          
          {/* 下部にひっそり配置する履歴コントロール */}
          <div className="p-3 border-t border-slate-700 bg-slate-950">
            <UndoRedoPanel />
          </div>
        </div>

        {/* 🖥️ B. 中央メインキャンバスエリア (自由配置エディタ) */}
        {/* 🌟 自由配置エディタでは、dndライブラリの厳密なリスト制約から外れ、マウス座標(useSelection)で操作するためDragDropContextを排除し軽量化 */}
        <div 
          className="flex-1 min-w-0 h-full relative overflow-hidden bg-slate-950"
          onClick={(e) => {
            // 背景をクリックしたら選択解除
            if (e.target === e.currentTarget) clearSelection();
          }}
        >
          <CanvasArea />
        </div>

        {/* 🛠️ C. 右側サイドパネル (プロパティ ＆ レイヤーシステム) */}
        <div className="w-80 border-l border-slate-700 bg-slate-900 flex flex-col flex-shrink-0 z-20 shadow-xl overflow-hidden">
          {/* タブヘッダー */}
          <div className="flex border-b border-slate-700 bg-slate-950 text-xs flex-shrink-0">
            <button 
              onClick={() => setRightTab('properties')}
              className={`flex-1 py-3 font-bold border-b-2 transition-colors ${rightTab === 'properties' ? 'border-orange-500 text-orange-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              🎨 プロパティ (質感)
            </button>
            <button 
              onClick={() => setRightTab('layers')}
              className={`flex-1 py-3 font-bold border-b-2 transition-colors ${rightTab === 'layers' ? 'border-orange-500 text-orange-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              👁️ レイヤー ({layerSnap.layers.length})
            </button>
          </div>

          {/* 右パネルコンテンツ */}
          <div className="flex-1 overflow-y-auto min-h-0 text-slate-300">
            {rightTab === 'properties' ? (
              // 選択されている図形があればプロパティを表示
              selectedIds.length > 0 ? (
                <PropertyPanel selectedIds={selectedIds} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs p-4 text-center">
                  キャンバス上の図形を選択すると、<br/>色やテクスチャ(Ver0.5)を変更できます。
                </div>
              )
            ) : (
              <LayerPanel />
            )}
          </div>
        </div>

      </div>

      {/* 🖨️ 4. 印刷プレビューモード (モーダルまたは全画面オーバーレイ) */}
      {showPrintPreview && (
        <div className="absolute inset-0 z-50 bg-slate-900 bg-opacity-95 flex flex-col">
          {/* ここに PrintPreview コンポーネントをマウント */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
            <span className="font-bold text-orange-400">🖨️ 印刷プレビュー (Ver0.6 プリフライト搭載)</span>
            <button 
              onClick={() => setShowPrintPreview(false)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
            >
              エディタに戻る
            </button>
          </div>
          <div className="flex-1 overflow-auto p-8 flex justify-center items-center">
            {/* プレビュー本体 */}
          </div>
        </div>
      )}

    </div>
  );
}