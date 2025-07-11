import { NextResponse } from 'next/server';
import { createOptimalGroups } from '@/lib/openai';
import { saveGroupHistory, getLatestGroupHistory } from '@/lib/vercel-kv';
import { Member } from '@/lib/types';

/**
 * グループ分けを行うAPI
 */
export async function POST(request: Request) {
  try {
    const { members, groupCount } = await request.json() as {
      members: Member[];
      groupCount: number;
    };

    // 前回のグループ分け履歴を取得
    const previousHistory = await getLatestGroupHistory();
    const previousGroups = previousHistory?.groups;

    // OpenAI APIを使用して最適なグループ分けを行う
    const groups = await createOptimalGroups(members, groupCount, previousGroups);

    // 履歴を保存
    await saveGroupHistory(groups);

    return NextResponse.json({
      groups,
      previousGroups
    });
  } catch (error) {
    console.error('Groups API error:', error);
    return NextResponse.json(
      { error: 'グループ分けに失敗しました' },
      { status: 500 }
    );
  }
}
