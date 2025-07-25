'use client';

import { Group } from '@/lib/types';
import { useState } from 'react';

interface GroupDisplayProps {
  groups: Group[];
  previousGroups?: Group[];
}

export default function GroupDisplay({ groups, previousGroups }: GroupDisplayProps) {
  const [showPreviousPairs, setShowPreviousPairs] = useState<boolean>(false);
  const [checkedMembers, setCheckedMembers] = useState<Set<string>>(new Set());

  // メンバーのチェック状態を切り替え
  const toggleMemberCheck = (memberName: string) => {
    const newChecked = new Set(checkedMembers);
    if (newChecked.has(memberName)) {
      newChecked.delete(memberName);
    } else {
      newChecked.add(memberName);
    }
    setCheckedMembers(newChecked);
  };

  // 前回話した人同士かどうかをチェック
  const isPreviousPair = (member1: string, member2: string) => {
    if (!previousGroups || !showPreviousPairs) return false;
    
    for (const group of previousGroups) {
      const memberNames = group.members.map(m => m.name);
      if (memberNames.includes(member1) && memberNames.includes(member2)) {
        return true;
      }
    }
    return false;
  };

  // グループ内で前回話した人がいるかチェック
  const hasPreviousPairs = (groupMembers: any[]) => {
    if (!showPreviousPairs) return [];
    
    const pairs = [];
    for (let i = 0; i < groupMembers.length; i++) {
      for (let j = i + 1; j < groupMembers.length; j++) {
        if (isPreviousPair(groupMembers[i].name, groupMembers[j].name)) {
          pairs.push([groupMembers[i].name, groupMembers[j].name]);
        }
      }
    }
    return pairs;
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
                checked={showPreviousPairs}
                onChange={() => setShowPreviousPairs(!showPreviousPairs)}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                showPreviousPairs ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  showPreviousPairs ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5`}></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">前回話した人を表示</span>
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const previousPairs = hasPreviousPairs(group.members);
          
          return (
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

              {showPreviousPairs && previousPairs.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-yellow-800 text-xs">!</span>
                    </span>
                    <span className="text-sm font-medium text-yellow-800">前回話した人同士</span>
                  </div>
                  <div className="space-y-1">
                    {previousPairs.map((pair, idx) => (
                      <div key={idx} className="text-xs text-yellow-700">
                        {pair[0]} ↔ {pair[1]}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
          );
        })}
      </div>

      {showPreviousPairs && previousGroups && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-blue-800 text-xs">i</span>
              </span>
              <span className="font-medium text-blue-800">前回話した人の確認</span>
            </div>
            <p className="text-sm text-blue-700">
              各メンバーにチェックを入れることで「前回話した人」として記録できます。
              トグルをオンにすると、前回話した人同士が同じグループになっている場合に警告が表示されます。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
