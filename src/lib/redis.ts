import { Redis } from "@upstash/redis";
import { Group, GroupHistory } from "./types";

// Redisクライアントの初期化
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || "",
  token: process.env.UPSTASH_REDIS_TOKEN || "",
});

/**
 * グループ分け履歴を保存する
 */
export async function saveGroupHistory(groups: Group[]): Promise<void> {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式
  const history: GroupHistory = {
    date,
    groups,
  };

  // グループ履歴を保存
  await redis.set(`group:history:${date}`, JSON.stringify(history));
  // 最新の実行日を更新
  await redis.set("group:last_date", date);
}

/**
 * 最新のグループ分け履歴を取得する
 */
export async function getLatestGroupHistory(): Promise<GroupHistory | null> {
  const lastDate = await redis.get<string>("group:last_date");
  if (!lastDate) {
    return null;
  }

  const historyJson = await redis.get<string>(`group:history:${lastDate}`);
  if (!historyJson) {
    return null;
  }

  return JSON.parse(historyJson) as GroupHistory;
}

/**
 * 特定日付のグループ分け履歴を取得する
 */
export async function getGroupHistoryByDate(
  date: string
): Promise<GroupHistory | null> {
  const historyJson = await redis.get<string>(`group:history:${date}`);
  if (!historyJson) {
    return null;
  }

  return JSON.parse(historyJson) as GroupHistory;
}
