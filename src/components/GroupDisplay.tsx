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
  const isInSameGroup = (name: string, email: string, groupId: number) => {
    if (!previousGroups || !showDiff) return false;

    const previousGroup = previousGroups.find(g =>
      g.members.some(m => m.email === email)
    );

    if (!previousGroup) return false;

    return previousGroup.id === groupId;
  };

  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">グループ分け結果</h2>

        {previousGroups && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showDiff}
              onChange={() => setShowDiff(!showDiff)}
              className="h-4 w-4"
            />
            <span>前回との変更を表示</span>
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <h3 className="text-lg font-bold mb-2">グループ {group.id}</h3>
            <ul className="space-y-1">
              {group.members.map((member, idx) => (
                <li
                  key={idx}
                  className={`py-1 px-2 rounded ${
                    isInSameGroup(member.name, member.email, group.id)
                      ? 'bg-yellow-100'
                      : ''
                  }`}
                >
                  {member.name}
                  {isInSameGroup(member.name, member.email, group.id) && (
                    <span className="ml-2 text-xs text-yellow-600">
                      (前回と同じ)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
