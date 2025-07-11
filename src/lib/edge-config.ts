import { createClient } from '@vercel/edge-config';
import { Member, Group, GroupHistory } from './types';

// Edge Configクライアントの初期化
const edgeConfig = createClient(process.env.EDGE_CONFIG);

// Edge Configのキー
const MEMBERS_KEY = 'members';
const LAST_DATE_KEY = 'last_date';
const GROUP_HISTORY_PREFIX = 'group_history:';

/**
 * メンバーリストを取得する
 */
export async function getMembers(): Promise<Member[]> {
  try {
    const members = await edgeConfig.get<Member[]>(MEMBERS_KEY);
    return members || [];
  } catch (error) {
    console.error('Error getting members from Edge Config:', error);
    return [];
  }
}

/**
 * メンバーリストを保存する
 */
export async function saveMembers(members: Member[]): Promise<boolean> {
  try {
    await edgeConfig.set(MEMBERS_KEY, members);
    return true;
  } catch (error) {
    console.error('Error saving members to Edge Config:', error);
    return false;
  }
}

/**
 * グループ分け履歴を保存する
 */
export async function saveGroupHistory(groups: Group[]): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
    const history: GroupHistory = {
      date,
      groups,
    };

    // グループ履歴を保存
    await edgeConfig.set(`${GROUP_HISTORY_PREFIX}${date}`, history);
    // 最新の実行日を更新
    await edgeConfig.set(LAST_DATE_KEY, date);
  } catch (error) {
    console.error('Error saving group history to Edge Config:', error);
  }
}

/**
 * 最新のグループ分け履歴を取得する
 */
export async function getLatestGroupHistory(): Promise<GroupHistory | null> {
  try {
    const lastDate = await edgeConfig.get<string>(LAST_DATE_KEY);
    if (!lastDate) {
      return null;
    }

    const history = await edgeConfig.get<GroupHistory>(`${GROUP_HISTORY_PREFIX}${lastDate}`);
    return history || null;
  } catch (error) {
    console.error('Error getting latest group history from Edge Config:', error);
    return null;
  }
}

/**
 * 特定日付のグループ分け履歴を取得する
 */
export async function getGroupHistoryByDate(date: string): Promise<GroupHistory | null> {
  try {
    const history = await edgeConfig.get<GroupHistory>(`${GROUP_HISTORY_PREFIX}${date}`);
    return history || null;
  } catch (error) {
    console.error('Error getting group history by date from Edge Config:', error);
    return null;
  }
}
