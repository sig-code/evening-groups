import { MemberPreset, Member } from './types';
import { Redis } from '@upstash/redis';

// 環境変数のチェック
const hasRedisCredentials = !!(
  process.env.UPSTASH_REDIS_URL &&
  process.env.UPSTASH_REDIS_TOKEN
);

// Redisクライアントの初期化（環境変数がある場合のみ）
let redis: Redis | null = null;
if (hasRedisCredentials) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL || '',
    token: process.env.UPSTASH_REDIS_TOKEN || '',
  });
}

// Redisのキー
const PRESETS_KEY = 'evening-groups:presets';

// メモリ内ストレージ（Redis が利用できない場合のフォールバック）
let memoryPresets: MemberPreset[] = [];

/**
 * プリセット一覧を取得する
 */
export async function getPresets(): Promise<MemberPreset[]> {
  if (!hasRedisCredentials || !redis) {
    console.log('Redis not available, using memory storage');
    return [...memoryPresets]; // コピーを返す
  }

  try {
    const presetsJson = await redis.get<string>(PRESETS_KEY);
    if (!presetsJson) {
      return [];
    }
    return JSON.parse(presetsJson) as MemberPreset[];
  } catch (error) {
    console.error('Error getting presets:', error);
    return [];
  }
}

/**
 * プリセット一覧を保存する
 */
export async function savePresets(presets: MemberPreset[]): Promise<boolean> {
  if (!hasRedisCredentials || !redis) {
    console.log('Redis not available, saving to memory storage');
    memoryPresets = [...presets]; // コピーを保存
    return true;
  }

  try {
    await redis.set(PRESETS_KEY, JSON.stringify(presets));
    return true;
  } catch (error) {
    console.error('Error saving presets:', error);
    return false;
  }
}

/**
 * プリセットを作成する
 */
export async function createPreset(name: string, members: Member[]): Promise<MemberPreset | null> {
  const presets = await getPresets();

  // 同じ名前のプリセットが既に存在するかチェック
  if (presets.some(preset => preset.name === name)) {
    throw new Error('同じ名前のプリセットが既に存在します');
  }

  const newPreset: MemberPreset = {
    id: generateId(),
    name,
    members: [...members], // ディープコピー
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  presets.push(newPreset);
  const success = await savePresets(presets);

  return success ? newPreset : null;
}

/**
 * プリセットを更新する
 */
export async function updatePreset(id: string, name: string, members: Member[]): Promise<boolean> {
  const presets = await getPresets();
  const index = presets.findIndex(preset => preset.id === id);

  if (index === -1) {
    return false;
  }

  // 同じ名前の他のプリセットが存在するかチェック
  if (presets.some(preset => preset.name === name && preset.id !== id)) {
    throw new Error('同じ名前のプリセットが既に存在します');
  }

  presets[index] = {
    ...presets[index],
    name,
    members: [...members], // ディープコピー
    updatedAt: new Date().toISOString(),
  };

  return savePresets(presets);
}

/**
 * プリセットを削除する
 */
export async function deletePreset(id: string): Promise<boolean> {
  const presets = await getPresets();
  const filteredPresets = presets.filter(preset => preset.id !== id);

  if (filteredPresets.length === presets.length) {
    return false; // 削除対象が見つからなかった
  }

  return savePresets(filteredPresets);
}

/**
 * プリセットをIDで取得する
 */
export async function getPresetById(id: string): Promise<MemberPreset | null> {
  const presets = await getPresets();
  return presets.find(preset => preset.id === id) || null;
}

/**
 * ユニークなIDを生成する
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
