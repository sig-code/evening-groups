import OpenAI from 'openai';
import { Group, Member } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
                        name: { type: 'string' },
                        email: { type: 'string' }
                      },
                      required: ['name', 'email'],
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

  return [];
}
