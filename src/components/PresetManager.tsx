'use client';

import { useState, useEffect } from 'react';
import { MemberPreset, Member } from '@/lib/types';

interface PresetManagerProps {
  currentMembers: Member[];
  onLoadPreset: (members: Member[]) => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export default function PresetManager({
  currentMembers,
  onLoadPreset,
  onError,
  onSuccess
}: PresetManagerProps) {
  const [presets, setPresets] = useState<MemberPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [presetName, setPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // プリセット一覧を読み込み
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/presets');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プリセットの取得に失敗しました');
      }

      setPresets(data.presets);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'プリセットの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // プリセットを保存
  const savePreset = async () => {
    if (!presetName.trim()) {
      onError('プリセット名を入力してください');
      return;
    }

    if (currentMembers.length === 0) {
      onError('保存する参加者がいません');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/presets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: presetName.trim(),
          members: currentMembers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プリセットの保存に失敗しました');
      }

      onSuccess(`プリセット「${presetName}」を保存しました`);
      setPresetName('');
      setShowSaveDialog(false);
      await loadPresets(); // プリセット一覧を再読み込み
    } catch (error) {
      onError(error instanceof Error ? error.message : 'プリセットの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // プリセットを読み込み
  const loadPreset = (preset: MemberPreset) => {
    onLoadPreset(preset.members);
    onSuccess(`プリセット「${preset.name}」を読み込みました`);
  };

  // プリセットを削除
  const deletePreset = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/presets?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プリセットの削除に失敗しました');
      }

      const deletedPreset = presets.find(p => p.id === id);
      onSuccess(`プリセット「${deletedPreset?.name}」を削除しました`);
      setShowDeleteDialog(null);
      await loadPresets(); // プリセット一覧を再読み込み
    } catch (error) {
      onError(error instanceof Error ? error.message : 'プリセットの削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card-material">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">📋</span>
            </div>
            プリセット管理
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            参加者リストを保存・読み込みできます
          </p>
        </div>
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={currentMembers.length === 0}
          className="btn-material btn-primary"
        >
          現在のリストを保存
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      ) : presets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📋</span>
          </div>
          <p className="text-gray-500 text-lg">保存されたプリセットがありません</p>
          <p className="text-gray-400 text-sm mt-1">参加者リストを作成して保存してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                <p className="text-sm text-gray-600">
                  {preset.members.length}名 • {formatDate(preset.updatedAt)}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {preset.members.slice(0, 5).map((member, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {member.name}
                    </span>
                  ))}
                  {preset.members.length > 5 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{preset.members.length - 5}名
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => loadPreset(preset)}
                  className="btn-material btn-secondary text-sm"
                >
                  読み込み
                </button>
                <button
                  onClick={() => setShowDeleteDialog(preset.id)}
                  className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors duration-200"
                  title="削除"
                >
                  <span className="text-sm">×</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 保存ダイアログ */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              プリセットを保存
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プリセット名
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="例: 開発チーム、営業部など"
                className="input-material w-full"
                maxLength={50}
              />
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                現在の参加者リスト（{currentMembers.length}名）を保存します
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setPresetName('');
                }}
                disabled={isSaving}
                className="btn-material btn-secondary"
              >
                キャンセル
              </button>
              <button
                onClick={savePreset}
                disabled={isSaving || !presetName.trim()}
                className="btn-material btn-primary"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              プリセットを削除
            </h3>
            <p className="text-gray-600 mb-6">
              プリセット「{presets.find(p => p.id === showDeleteDialog)?.name}」を削除しますか？
              <br />
              この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                disabled={isLoading}
                className="btn-material btn-secondary"
              >
                キャンセル
              </button>
              <button
                onClick={() => deletePreset(showDeleteDialog)}
                disabled={isLoading}
                className="btn-material bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
