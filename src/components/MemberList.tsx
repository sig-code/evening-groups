'use client';

import { Member } from '@/lib/types';
import { useState, useEffect } from 'react';

interface MemberListProps {
  members: Member[];
  onMembersChange?: (members: Member[]) => void;
  onSave?: () => void;
}

export default function MemberList({ members, onMembersChange, onSave }: MemberListProps) {
  const [editableMembers, setEditableMembers] = useState<Member[]>(members);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // メンバーリストが変更されたら更新
  useEffect(() => {
    setEditableMembers(members);
  }, [members]);

  // メンバーの削除
  const removeMember = (index: number) => {
    const newMembers = [...editableMembers];
    newMembers.splice(index, 1);
    setEditableMembers(newMembers);
    onMembersChange?.(newMembers);
  };

  // メンバーの追加
  const addMember = () => {
    const newMembers = [...editableMembers, { name: '' }];
    setEditableMembers(newMembers);
    onMembersChange?.(newMembers);
  };

  // メンバー情報の更新
  const updateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...editableMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setEditableMembers(newMembers);
    onMembersChange?.(newMembers);
  };

  // メンバーリストを保存
  const saveMembers = async () => {
    if (onSave) {
      setIsSaving(true);
      await onSave();
      setIsSaving(false);
    }
  };

  return (
    <div className="card-material">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">👥</span>
            </div>
            参加者リスト
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {editableMembers.length}名の参加者が登録されています
          </p>
        </div>
        <button
          onClick={saveMembers}
          disabled={isSaving}
          className={`btn-material ${isSaving ? 'btn-secondary' : 'btn-success'}`}
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              保存中...
            </div>
          ) : (
            '参加者を保存'
          )}
        </button>
      </div>

      {editableMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">👤</span>
          </div>
          <p className="text-gray-500 text-lg">参加者がいません</p>
          <p className="text-gray-400 text-sm mt-1">下のボタンから参加者を追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {editableMembers.map((member, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {index + 1}
              </div>
              <input
                type="text"
                value={member.name}
                onChange={(e) => updateMember(index, 'name', e.target.value)}
                placeholder="ニックネームを入力"
                className="input-material flex-1"
              />
              <button
                onClick={() => removeMember(index)}
                className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors duration-200"
                title="削除"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={addMember}
          className="btn-material btn-primary w-full flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          参加者を追加
        </button>
      </div>
    </div>
  );
}
