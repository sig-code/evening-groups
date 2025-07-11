import OpenAI from 'openai';
import { Group, Member } from './types';

// 環境変数のチェック
const hasOpenAICredentials = !!process.env.OPENAI_API_KEY;

// OpenAI APIクライアントの初期化（環境変数がある場合のみ）
let openai: OpenAI | null = null;
if (hasOpenAICredentials) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// レスポンス用の型定義
interface GroupAssignmentResponse {
  groups: Group[];
}

/**
 * ランダム関数を使用してグループ分けを行う（前回のグループ分けを考慮）
 */
export async function createOptimalGroups(
  members: Member[],
  groupCount: number,
  previousGroups?: Group[]
): Promise<Group[]> {
  console.log('Using random group assignment with previous group consideration (GPT disabled).');
  return createRandomGroups(members, groupCount, previousGroups);
}


/**
 * ランダムなグループ分けを行う（前回のグループ分けを考慮）
 */
function createRandomGroups(members: Member[], groupCount: number, previousGroups?: Group[]): Group[] {
  // 1グループの場合は全員を1つのグループにまとめる（シャッフルあり）
  if (groupCount === 1) {
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
    return [{
      id: 1,
      members: shuffledMembers
    }];
  }

  // グループ数を調整（メンバー数より多い場合はメンバー数に合わせる）
  const actualGroupCount = Math.min(groupCount, members.length);

  // 各グループの基本人数と余りを計算
  const baseSize = Math.floor(members.length / actualGroupCount);
  const remainder = members.length % actualGroupCount;

  // 前回のグループ分けを考慮したグループ分けを試行
  let bestGroups: Group[] = [];
  let bestScore = -1;

  // 複数回試行して最も前回と重複の少ない組み合わせを選択
  const maxAttempts = previousGroups ? 50 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // メンバーをシャッフル
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);

    // グループを作成
    const groups: Group[] = [];
    let currentIndex = 0;

    for (let i = 0; i < actualGroupCount; i++) {
      // このグループのサイズ（余りがある場合は1人多く）
      const groupSize = baseSize + (i < remainder ? 1 : 0);

      // グループメンバーを取得
      const groupMembers = shuffledMembers.slice(currentIndex, currentIndex + groupSize);
      currentIndex += groupSize;

      // グループを追加
      groups.push({
        id: i + 1,
        members: groupMembers
      });
    }

    // 前回のグループ分けがある場合、重複度を計算
    if (previousGroups) {
      const score = calculateDiversityScore(groups, previousGroups);
      if (score > bestScore) {
        bestScore = score;
        bestGroups = groups;
      }
    } else {
      bestGroups = groups;
      break;
    }
  }

  return bestGroups;
}

/**
 * 前回のグループ分けとの多様性スコアを計算（高いほど前回と異なる）
 */
function calculateDiversityScore(currentGroups: Group[], previousGroups: Group[]): number {
  let totalPairs = 0;
  let duplicatePairs = 0;

  // 現在のグループの全ペアを取得
  const currentPairs = new Set<string>();
  for (const group of currentGroups) {
    for (let i = 0; i < group.members.length; i++) {
      for (let j = i + 1; j < group.members.length; j++) {
        const pair = [group.members[i].name, group.members[j].name].sort().join('-');
        currentPairs.add(pair);
        totalPairs++;
      }
    }
  }

  // 前回のグループの全ペアを取得
  const previousPairs = new Set<string>();
  for (const group of previousGroups) {
    for (let i = 0; i < group.members.length; i++) {
      for (let j = i + 1; j < group.members.length; j++) {
        const pair = [group.members[i].name, group.members[j].name].sort().join('-');
        previousPairs.add(pair);
      }
    }
  }

  // 重複するペアの数を計算
  for (const pair of currentPairs) {
    if (previousPairs.has(pair)) {
      duplicatePairs++;
    }
  }

  // 多様性スコア = (総ペア数 - 重複ペア数) / 総ペア数
  // 1に近いほど前回と異なる（良い）、0に近いほど前回と同じ（悪い）
  return totalPairs > 0 ? (totalPairs - duplicatePairs) / totalPairs : 1;
}
