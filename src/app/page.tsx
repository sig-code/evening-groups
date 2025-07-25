'use client';

import { useState, useEffect } from 'react';
import MemberList from '@/components/MemberList';
import GroupForm from '@/components/GroupForm';
import GroupDisplay from '@/components/GroupDisplay';
import PresetManager from '@/components/PresetManager';
import { Member, Group } from '@/lib/types';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [previousGroups, setPreviousGroups] = useState<Group[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 初期表示時にメンバーリストとグループ結果を取得
  useEffect(() => {
    if (isClient) {
      loadMembers();
      loadLatestGroups();
    }
  }, [isClient]);

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

  // 最新のグループ分け結果を取得
  const loadLatestGroups = async () => {
    try {
      const response = await fetch('/api/groups/latest');
      const data = await response.json();

      if (response.ok && data.groups && data.groups.length > 0) {
        setGroups(data.groups);
        setPreviousGroups(data.previousGroups);
      }
    } catch (err) {
      console.error('Error loading latest groups:', err);
      // エラーは表示せず、単にグループ結果がない状態にする
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

  // プリセットからメンバーを読み込み
  const handleLoadPreset = (presetMembers: Member[]) => {
    setMembers(presetMembers);
  };

  // エラーメッセージを設定
  const handleError = (message: string) => {
    setError(message);
    setSuccessMessage(null);
    setTimeout(() => setError(null), 5000);
  };

  // 成功メッセージを設定
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setError(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            Groups
          </h1>
          <p className="text-gray-600 mt-2">効率的なグループ分けアプリケーション</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Alert Messages */}
        {(error || successMessage) && (
          <div className={`mb-6 p-4 rounded-lg shadow-md ${
            successMessage || error === 'メンバーリストを保存しました'
              ? 'bg-green-50 border-l-4 border-green-400 text-green-800'
              : 'bg-red-50 border-l-4 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full mr-3 ${
                successMessage || error === 'メンバーリストを保存しました'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`}>
                <span className="text-white text-xs flex items-center justify-center h-full">
                  {successMessage || error === 'メンバーリストを保存しました' ? '✓' : '!'}
                </span>
              </div>
              {successMessage || error}
            </div>
          </div>
        )}


        {/* Preset Manager */}
        <div className="mb-8">
          <PresetManager
            currentMembers={members}
            onLoadPreset={handleLoadPreset}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </div>

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
