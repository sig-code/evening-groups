'use client';

import { Group } from '@/lib/types';
import { useState } from 'react';

interface GroupDisplayProps {
  groups: Group[];
  previousGroups?: Group[];
}

export default function GroupDisplay({ groups, previousGroups }: GroupDisplayProps) {
  const [showDiff, setShowDiff] = useState<boolean>(false);

  // 前回と同じグループにいるメンバーをチェック
  const isInSameGroup = (name: string, groupId: number) => {
    if (!previousGroups || !showDiff) return false;

    const previousGroup = previousGroups.find(g =>
      g.members.some(m => m.name === name)
    );

    if (!previousGroup) return false;

    return previousGroup.id === groupId;
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">🎯</span>
            </div>
            グループ分け結果
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {groups.length}つのグループに分けました
          </p>
        </div>

        {previousGroups && (
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={showDiff}
                onChange={() => setShowDiff(!showDiff)}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                showDiff ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  showDiff ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5`}></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">前回との変更を表示</span>
          </label>
        )}
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
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isInSameGroup(member.name, group.id)
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-white border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    {isInSameGroup(member.name, group.id) && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span className="text-xs text-yellow-700 font-medium">
                          前回と同じグループ
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showDiff && previousGroups && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-xs">!</span>
              </span>
              <span className="font-medium text-yellow-800">前回との変更点</span>
            </div>
            <p className="text-sm text-yellow-700">
              黄色でハイライトされたメンバーは前回と同じグループに配置されています。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
