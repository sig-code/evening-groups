import { Member } from './types';
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
const MEMBERS_KEY = 'evening-groups:members';

/**
 * メンバーリストを取得する
 */
export async function getMembers(): Promise<Member[]> {
  if (!hasRedisCredentials || !redis) {
    return [];
  }

  try {
    const membersJson = await redis.get<string>(MEMBERS_KEY);
    if (!membersJson) {
      return [];
    }
    return JSON.parse(membersJson) as Member[];
  } catch (error) {
    console.error('Error getting members:', error);
    return [];
  }
}

/**
 * メンバーリストを保存する
 */
export async function saveMembers(members: Member[]): Promise<boolean> {
  if (!hasRedisCredentials || !redis) {
    return false;
  }

  try {
    await redis.set(MEMBERS_KEY, JSON.stringify(members));
    return true;
  } catch (error) {
    console.error('Error saving members:', error);
    return false;
  }
}

/**
 * メンバーを追加する
 */
export async function addMember(member: Member): Promise<boolean> {
  const members = await getMembers();
  members.push(member);
  return saveMembers(members);
}

/**
 * メンバーを更新する
 */
export async function updateMember(index: number, member: Member): Promise<boolean> {
  const members = await getMembers();
  if (index < 0 || index >= members.length) {
    return false;
  }
  members[index] = member;
  return saveMembers(members);
}

/**
 * メンバーを削除する
 */
export async function deleteMember(index: number): Promise<boolean> {
  const members = await getMembers();
  if (index < 0 || index >= members.length) {
    return false;
  }
  members.splice(index, 1);
  return saveMembers(members);
}
