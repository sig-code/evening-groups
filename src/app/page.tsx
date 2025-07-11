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

  // 初期表示時にメンバーリストを取得
  useEffect(() => {
    loadMembers();
  }, []);

  // メンバーリストを取得
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/members');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メンバー情報の取得に失敗しました');
      }

      setMembers(data.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error('Error loading members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // メンバーリストを保存
  const saveMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メンバー情報の保存に失敗しました');
      }

      setError('メンバーリストを保存しました');
      setTimeout(() => setError(null), 3000); // 3秒後にメッセージを消す
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error('Error saving members:', err);
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
        <div className={`border px-4 py-3 rounded mb-4 ${
          error === 'メンバーリストを保存しました'
            ? 'bg-green-100 border-green-400 text-green-700'
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          {error}
        </div>
      )}

      <MemberList
        members={members}
        onMembersChange={setMembers}
        onSave={saveMembers}
      />

      <GroupForm onSubmit={createGroups} isLoading={isLoading} />

      <GroupDisplay groups={groups} previousGroups={previousGroups} />
    </main>
  );
}
