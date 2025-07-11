'use client';

import { useState, useEffect } from 'react';
import MemberList from '@/components/MemberList';
import GroupForm from '@/components/GroupForm';
import GroupDisplay from '@/components/GroupDisplay';
import { Member, Group } from '@/lib/types';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [previousGroups, setPreviousGroups] = useState<Group[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // カレンダーから参加者を取得
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/calendar');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'カレンダー情報の取得に失敗しました');
      }

      setMembers(data.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // グループ分けを実行
  const createGroups = async (groupCount: number) => {
    if (members.length === 0) {
      setError('参加者が設定されていません');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members, groupCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'グループ分けに失敗しました');
      }

      setGroups(data.groups);
      setPreviousGroups(data.previousGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error('Error creating groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">夕礼グループ分け</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={fetchMembers}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded text-white
            ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}
          `}
        >
          {isLoading ? '取得中...' : 'カレンダーから参加者取得'}
        </button>
      </div>

      <MemberList members={members} onMembersChange={setMembers} />

      <GroupForm onSubmit={createGroups} isLoading={isLoading} />

      <GroupDisplay groups={groups} previousGroups={previousGroups} />
    </main>
  );
}
