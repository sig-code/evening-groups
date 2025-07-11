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
 * OpenAI APIを使用して最適なグループ分けを行う
 */
export async function createOptimalGroups(
  members: Member[],
  groupCount: number,
  previousGroups?: Group[]
): Promise<Group[]> {
  // 1グループの場合は全員を1つのグループにまとめる（シャッフルあり）
  if (groupCount === 1) {
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
    return [{
      id: 1,
      members: shuffledMembers
    }];
  }

  // 環境変数が設定されていない場合はランダムなグループ分けを行う
  if (!hasOpenAICredentials || !openai) {
    console.log('OpenAI API key not set. Using random group assignment.');
    return createRandomGroups(members, groupCount);
  }

  try {
    // 人数配分の計算
    const totalMembers = members.length;
    const baseSize = Math.floor(totalMembers / groupCount);
    const remainder = totalMembers % groupCount;

    // 各グループの理想的な人数を計算
    const groupSizes = Array.from({ length: groupCount }, (_, i) =>
      baseSize + (i < remainder ? 1 : 0)
    );

    const prompt = `
以下の参加者を${groupCount}個のグループに分けてください。

【参加者一覧】（合計${totalMembers}名）
${members.map((m, i) => `${i + 1}. ${m.name}`).join('\n')}

【前回のグループ分け】
${previousGroups ?
  previousGroups.map((group, i) =>
    `グループ${group.id}: ${group.members.map(m => m.name).join(', ')}`
  ).join('\n') :
  'なし（初回）'
}

【必須制約】
1. **人数の均等配分を最優先**
   - 各グループの人数: ${groupSizes.map((size, i) => `グループ${i + 1}: ${size}名`).join(', ')}
   - 人数差は最大1名まで
   - 全員を必ず割り当てること

2. **前回との重複最小化**
   - 前回と同じグループになるメンバーペアを可能な限り避ける
   - ただし人数均等を優先し、均等配分を崩してまで重複を避けない

【出力形式】
- 必ず${groupCount}個のグループを作成
- 各グループのメンバー数は指定された人数と完全に一致させる
- グループIDは1から${groupCount}まで連番で設定
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたはグループ分けを最適化するAIアシスタントです。

【最重要原則】
1. 人数の均等配分を絶対に守る - これが最優先事項です
2. 指定された各グループの人数と完全に一致させる
3. 全参加者を漏れなく配置する
4. その上で可能な限り前回との重複を避ける

【処理手順】
1. まず参加者総数とグループ数から各グループの正確な人数を計算
2. 人数配分を厳密に守りながらメンバーを配置
3. 前回の組み合わせを参考に重複を最小化（ただし人数配分は崩さない）
4. 最終確認で各グループの人数が指定通りか検証

必ずJSON形式で正確に出力してください。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'group_assignment',
          schema: {
            type: 'object',
            properties: {
              groups: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    members: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' }
                        },
                        required: ['name'],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ['id', 'members'],
                  additionalProperties: false
                }
              }
            },
            required: ['groups'],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    if (response.choices[0].message.content) {
      // TypeScriptの型定義上、contentは文字列型なのでJSON.parseが必要
      const result = JSON.parse(response.choices[0].message.content) as GroupAssignmentResponse;

      // 結果の検証
      if (validateGroupAssignment(result.groups, members, groupSizes)) {
        return result.groups;
      } else {
        console.log('OpenAI result validation failed. Using fallback random assignment.');
        return createRandomGroups(members, groupCount);
      }
    }

    return createRandomGroups(members, groupCount);
  } catch (error) {
    console.error('Error using OpenAI API:', error);
    return createRandomGroups(members, groupCount);
  }
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
