'use client';

import { useState } from 'react';

interface GroupFormProps {
  onSubmit: (groupCount: number) => void;
  isLoading?: boolean;
}

export default function GroupForm({ onSubmit, isLoading = false }: GroupFormProps) {
  const [groupCount, setGroupCount] = useState<number>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(groupCount);
  };

  return (
    <div className="card-material">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-sm">⚙️</span>
          </div>
          グループ設定
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          グループ数を設定してグループ分けを実行
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="groupCount" className="block text-sm font-medium text-gray-700 mb-2">
            グループ数
          </label>
          <div className="relative">
            <input
              id="groupCount"
              type="number"
              min="1"
              max="10"
              value={groupCount}
              onChange={(e) => setGroupCount(parseInt(e.target.value) || 1)}
              className="input-material text-center text-lg font-semibold"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400 text-sm">グループ</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            1〜10グループまで設定可能です（1グループ = 全員一緒）
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setGroupCount(count)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  groupCount === count
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs">グループ</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[4, 5, 6].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setGroupCount(count)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  groupCount === count
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs">グループ</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[7, 8, 9].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setGroupCount(count)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  groupCount === count
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs">グループ</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 max-w-[120px] mx-auto">
            <button
              type="button"
              onClick={() => setGroupCount(10)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                groupCount === 10
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="text-lg font-bold">10</div>
              <div className="text-xs">グループ</div>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className={`btn-material w-full ${isLoading ? 'btn-secondary' : 'btn-primary'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                処理中...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🎯</span>
                グループ分け実行
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
