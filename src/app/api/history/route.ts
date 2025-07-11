import { NextResponse } from 'next/server';
import { getGroupHistoryByDate, getLatestGroupHistory } from '@/lib/redis';

/**
 * グループ分け履歴を取得するAPI
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    let history;
    if (date) {
      // 特定の日付の履歴を取得
      history = await getGroupHistoryByDate(date);
    } else {
      // 最新の履歴を取得
      history = await getLatestGroupHistory();
    }

    if (!history) {
      return NextResponse.json(
        { error: '履歴が見つかりませんでした' },
        { status: 404 }
      );
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: '履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}
