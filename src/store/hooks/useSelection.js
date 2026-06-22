// src/hooks/useSelection.js
import { useSnapshot } from 'valtio';
import { selectionStore } from '../store/selectionStore';
import { shapeStore } from '../store/shapeStore';

export function useSelection() {
  // レンダリング同期用のスナップショット
  const snap = useSnapshot(selectionStore);
  const shapeSnap = useSnapshot(shapeStore);

  // 全図形のIDリストを取得（selectAll用）
  const getAllShapeIds = () => Object.keys(shapeSnap.shapes);

  return {
    // ─── 状態 ───
    selectedIds: snap.selectedIds,
    hoverId: snap.hoverId,

    // ─── アクションのラップ ───
    select: (id) => selectionStore.select(id),
    toggleSelect: (id) => selectionStore.toggleSelect(id),
    selectAll: () => selectionStore.selectAll(getAllShapeIds()),
    clearSelection: () => selectionStore.clearSelection(),
    setHover: (id) => selectionStore.setHover(id),
  };
}