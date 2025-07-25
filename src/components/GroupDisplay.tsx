'use client';

import { Group } from '@/lib/types';
import { useState, useEffect } from 'react';

interface GroupDisplayProps {
  groups: Group[];
  previousGroups?: Group[];
}

export default function GroupDisplay({ groups }: GroupDisplayProps) {
  const [checkedMembers, setCheckedMembers] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState<boolean>(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // チェック状態を読み込み
  useEffect(() => {
    if (isClient && groups.length > 0) {
      loadCheckStatus();
    }
  }, [isClient, groups]);

  // 新しいグループ分けが実行された際のチェック状態のリセット機能を追加
  const clearCheckStatus = async () => {
    try {
      await fetch('/api/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkStatus: {} }),
      });
      setCheckedMembers(new Set());
    } catch (error) {
      console.error('Error clearing check status:', error);
    }
  };

  // チェック状態を読み込み
  const loadCheckStatus = async () => {
    try {
      const response = await fetch('/api/check-status');
      const data = await response.json();
      
      if (response.ok && data.checkStatus) {
        const checkedSet = new Set<string>();
        Object.entries(data.checkStatus).forEach(([name, isChecked]) => {
          if (isChecked) {
            checkedSet.add(name);
          }
        });
        setCheckedMembers(checkedSet);
      }
    } catch (error) {
      console.error('Error loading check status:', error);
    }
  };

  // チェック状態を保存
  const saveCheckStatus = async (newChecked: Set<string>) => {
    try {
      const checkStatus: Record<string, boolean> = {};
      newChecked.forEach(name => {
        checkStatus[name] = true;
      });

      await fetch('/api/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkStatus }),
      });
    } catch (error) {
      console.error('Error saving check status:', error);
    }
  };

  // メンバーのチェック状態を切り替え
  const toggleMemberCheck = (memberName: string) => {
    const newChecked = new Set(checkedMembers);
    if (newChecked.has(memberName)) {
      newChecked.delete(memberName);
    } else {
      newChecked.add(memberName);
    }
    setCheckedMembers(newChecked);
    saveCheckStatus(newChecked);
  };

  if (!groups || groups.length === 0) {
    return (
      <div className="card-material text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-400 text-2xl">🎯</span>
        </div>
        <p className="text-gray-500 text-lg">グループ分け結果がありません</p>
        <p className="text-gray-400 text-sm mt-1">参加者を追加してグループ分けを実行してください</p>
      </div>
    );
  }

  return (
    <div className="card-material">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">🎯</span>
              </div>
              グループ分け結果
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {groups.length}つのグループに分けました・チェックで前回話した人をマーク
            </p>
          </div>
          {checkedMembers.size > 0 && (
            <button
              onClick={clearCheckStatus}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              チェックをクリア
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{group.id}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">グループ {group.id}</h3>
                <p className="text-sm text-gray-600">{group.members.length}名</p>
              </div>
            </div>

            <div className="space-y-2">
              {group.members.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 bg-white border border-gray-100 hover:bg-gray-50"
                >
                  <button
                    onClick={() => toggleMemberCheck(member.name)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      checkedMembers.has(member.name)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {checkedMembers.has(member.name) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
