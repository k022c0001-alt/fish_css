// src/hooks/useCanvas.js
import { useState, useEffect, useCallback } from 'react';
import { canvasStore } from '../store/canvasStore';
import { shapeStore } from '../store/shapeStore';
import { layerStore } from '../store/layerStore';

export function useCanvas(pageId) {
  const [loading, setLoading] = useState(true);

  const initCanvas = useCallback(async (id) => {
    try {
      setLoading(true);
      
      // 💡 既にストアに正しいデータが入っている場合はロードをスキップするか、
      // 必要に応じてここでBFFやローカルストレージから最新データをフェッチします。
      // 今回は TemplatesPage からデータが流し込まれている想定のため、
      // データの存在チェック or フェッチのモック処理を挟みます。
      
      if (canvasStore.id === id) {
        // すでに TemplatesPage 等からストアへ直に流し込みが成功している場合
        setLoading(false);
        return;
      }

      // 【拡張用】もしURL直接アクセスなどでストアが空の場合、API等から取得する
      console.log(`Salmon Engine: ページ [${id}] のデータをシリアライズ中...`);
      // const res = await fetch(`/api/design/${id}`);
      // データを各ストアに代入...

      setLoading(false);
    } catch (error) {
      console.error("キャンバスの初期化に失敗しました:", error);
      setLoading(false);
    }
  }, []);

  return {
    initCanvas,
    loading
  };
}