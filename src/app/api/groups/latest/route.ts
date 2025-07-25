import { NextResponse } from 'next/server';
import { getLatestGroupHistory } from '@/lib/vercel-kv';

/**
 * 最新のグループ分け結果を取得するAPI
 */
export async function GET() {
  try {
    const latestHistory = await getLatestGroupHistory();
    
    if (!latestHistory) {
      return NextResponse.json({
        groups: [],
        previousGroups: undefined
      });
    }

    return NextResponse.json({
      groups: latestHistory.groups,
      previousGroups: undefined,
      date: latestHistory.date
    });
  } catch (error) {
    console.error('Latest groups API error:', error);
    return NextResponse.json(
      { error: '最新のグループ分け結果の取得に失敗しました' },
      { status: 500 }
    );
  }
}