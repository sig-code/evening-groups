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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">夕</span>
            </div>
            夕礼グループ分け
          </h1>
          <p className="text-gray-600 mt-2">効率的なグループ分けで、より良い夕礼を</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Alert Messages */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg shadow-md ${
            error === 'メンバーリストを保存しました'
              ? 'bg-green-50 border-l-4 border-green-400 text-green-800'
              : 'bg-red-50 border-l-4 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full mr-3 ${
                error === 'メンバーリストを保存しました'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`}>
                <span className="text-white text-xs flex items-center justify-center h-full">
                  {error === 'メンバーリストを保存しました' ? '✓' : '!'}
                </span>
              </div>
              {error}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 font-medium">処理中...</span>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Member Management */}
          <div className="lg:col-span-2">
            <MemberList
              members={members}
              onMembersChange={setMembers}
              onSave={saveMembers}
            />
          </div>

          {/* Right Column - Group Settings */}
          <div className="lg:col-span-1">
            <GroupForm onSubmit={createGroups} isLoading={isLoading} />
          </div>
        </div>

        {/* Group Results */}
        <div className="mt-8">
          <GroupDisplay groups={groups} previousGroups={previousGroups} />
        </div>
      </main>
    </div>
  );
}
