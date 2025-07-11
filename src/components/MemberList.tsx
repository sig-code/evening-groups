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
    const newMembers = [...editableMembers, { name: '', email: '' }];
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
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">参加者リスト</h2>
        <button
          onClick={saveMembers}
          disabled={isSaving}
          className={`
            px-4 py-2 rounded text-white
            ${isSaving ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}
          `}
        >
          {isSaving ? '保存中...' : '参加者を保存'}
        </button>
      </div>

      {editableMembers.length === 0 ? (
        <p className="text-gray-500">参加者がいません</p>
      ) : (
        <ul className="space-y-2">
          {editableMembers.map((member, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={member.name}
                onChange={(e) => updateMember(index, 'name', e.target.value)}
                placeholder="名前"
                className="border rounded px-2 py-1 w-1/3"
              />
              <input
                type="email"
                value={member.email}
                onChange={(e) => updateMember(index, 'email', e.target.value)}
                placeholder="メールアドレス"
                className="border rounded px-2 py-1 w-1/2"
              />
              <button
                onClick={() => removeMember(index)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={addMember}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        参加者を追加
      </button>
    </div>
  );
}
