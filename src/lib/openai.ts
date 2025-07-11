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
  // 環境変数が設定されていない場合はランダムなグループ分けを行う
  if (!hasOpenAICredentials || !openai) {
    console.log('OpenAI API key not set. Using random group assignment.');
    return createRandomGroups(members, groupCount);
  }

  try {
    const prompt = `
以下の参加者を${groupCount}個のグループに分けてください。

参加者: ${members.map(m => m.name).join(', ')}

前回のグループ分け:
${previousGroups ? JSON.stringify(previousGroups) : 'なし'}

制約:
- 各グループの人数を均等にする
- 前回と同じグループのメンバーを最小化する
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたはグループ分けを最適化するAIアシスタントです。'
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
      return result.groups;
    }

    return createRandomGroups(members, groupCount);
  } catch (error) {
    console.error('Error using OpenAI API:', error);
    return createRandomGroups(members, groupCount);
  }
}

/**
 * ランダムなグループ分けを行う（OpenAI APIが使用できない場合のフォールバック）
 */
function createRandomGroups(members: Member[], groupCount: number): Group[] {
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
