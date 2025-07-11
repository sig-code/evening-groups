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
 * ランダム関数を使用してグループ分けを行う
 */
export async function createOptimalGroups(
  members: Member[],
  groupCount: number,
  previousGroups?: Group[]
): Promise<Group[]> {
  console.log('Using random group assignment (GPT disabled).');
  return createRandomGroups(members, groupCount);
}

/**
 * グループ分けの結果を検証する
 */
function validateGroupAssignment(
  groups: Group[],
  originalMembers: Member[],
  expectedGroupSizes: number[]
): boolean {
  // グループ数の確認
  if (groups.length !== expectedGroupSizes.length) {
    console.log(`Group count mismatch: expected ${expectedGroupSizes.length}, got ${groups.length}`);
    return false;
  }

  // 各グループの人数確認
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].members.length !== expectedGroupSizes[i]) {
      console.log(`Group ${i + 1} size mismatch: expected ${expectedGroupSizes[i]}, got ${groups[i].members.length}`);
      return false;
    }
  }

  // 全メンバーが含まれているか確認
  const assignedMemberNames = groups.flatMap(group => group.members.map(m => m.name));
  const originalMemberNames = originalMembers.map(m => m.name);

  // 重複チェック
  const uniqueAssignedNames = new Set(assignedMemberNames);
  if (uniqueAssignedNames.size !== assignedMemberNames.length) {
    console.log('Duplicate members found in assignment');
    return false;
  }

  // 全員が含まれているかチェック
  if (assignedMemberNames.length !== originalMemberNames.length) {
    console.log(`Member count mismatch: expected ${originalMemberNames.length}, got ${assignedMemberNames.length}`);
    return false;
  }

  // 全員が正しく含まれているかチェック
  for (const name of originalMemberNames) {
    if (!assignedMemberNames.includes(name)) {
      console.log(`Missing member: ${name}`);
      return false;
    }
  }

  return true;
}

/**
 * ランダムなグループ分けを行う（OpenAI APIが使用できない場合のフォールバック）
 */
function createRandomGroups(members: Member[], groupCount: number): Group[] {
  // 1グループの場合は全員を1つのグループにまとめる（シャッフルあり）
  if (groupCount === 1) {
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
    return [{
      id: 1,
      members: shuffledMembers
    }];
  }

  // メンバーをシャッフル
  const shuffledMembers = [...members].sort(() => Math.random() - 0.5);

  // グループ数を調整（メンバー数より多い場合はメンバー数に合わせる）
  const actualGroupCount = Math.min(groupCount, members.length);

  // 各グループの基本人数と余りを計算
  const baseSize = Math.floor(members.length / actualGroupCount);
  const remainder = members.length % actualGroupCount;

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

  return groups;
}
