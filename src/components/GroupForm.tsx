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
    <form onSubmit={handleSubmit} className="my-6">
      <h2 className="text-xl font-bold mb-4">グループ設定</h2>

      <div className="flex items-center gap-4">
        <label htmlFor="groupCount" className="font-medium">
          グループ数:
        </label>
        <input
          id="groupCount"
          type="number"
          min="2"
          max="10"
          value={groupCount}
          onChange={(e) => setGroupCount(parseInt(e.target.value) || 2)}
          className="border rounded px-2 py-1 w-20"
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`
            px-4 py-2 rounded text-white
            ${isLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}
          `}
        >
          {isLoading ? '処理中...' : 'グループ分け実行'}
        </button>
      </div>
    </form>
  );
}
