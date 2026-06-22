import { proxy, snapshot } from 'valtio';
import { shapeStore } from './shapeStore';
import { selectionStore } from './selectionStore';

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const groupStore = proxy({
  // ─── 状態 ───
  // { 'group_1': { id: 'group_1', children: ['shape_A', 'shape_B'] } }
  groups: {},

  // ==========================================
  // 🛠️ アクション群
  // ==========================================

  // 選択中の図形をグループ化する
  group() {
    const selectedIds = snapshot(selectionStore.selectedIds);
    if (selectedIds.length < 2) return; // 2つ以上選択されていないとグループ化できない

    const newGroupId = `group_${genId()}`;
    
    this.groups[newGroupId] = {
      id: newGroupId,
      children: [...selectedIds],
    };

    // shapeStore側の各図形にも「自分がどのグループに属しているか」を刻み込む
    selectedIds.forEach(id => {
      if (shapeStore.shapes[id]) {
        shapeStore.shapes[id].groupId = newGroupId;
      }
    });

    // グループ化後は、そのグループ自体（または構成要素すべて）を選択状態にする
    selectionStore.selectedIds = [newGroupId];
  },

  // グループを解除する
  ungroup(groupId) {
    const groupData = this.groups[groupId];
    if (!groupData) return;

    // 子要素の groupId 紐付けを解除
    groupData.children.forEach(childId => {
      if (shapeStore.shapes[childId]) {
        delete shapeStore.shapes[childId].groupId;
      }
    });

    // グループ自体を削除
    delete this.groups[groupId];

    // 解除された子要素たちを選択状態にする
    selectionStore.selectedIds = [...groupData.children];
  },

  // 階層をさかのぼって「最上位のグループID」を取得するユーティリティ（選択ロジック用）
  getTopLevelGroupId(shapeId) {
    let currentId = shapeId;
    let shape = shapeStore.shapes[currentId];
    
    // 親グループがいなくなるまで遡る（入れ子グループ対応）
    while (shape && shape.groupId) {
      currentId = shape.groupId;
      // グループ自体もshapeStoreに仮想ノードとして置くか、groupStoreを引くかで分岐
      shape = shapeStore.shapes[currentId] || { groupId: this.groups[currentId]?.parentId };
    }
    return currentId !== shapeId ? currentId : null;
  }
});