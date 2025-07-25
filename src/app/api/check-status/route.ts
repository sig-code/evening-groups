import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const CHECK_STATUS_KEY = 'check_status';

/**
 * チェック状態を取得・保存するAPI
 */
export async function GET() {
  try {
    const checkStatus = await kv.hgetall(CHECK_STATUS_KEY);
    
    return NextResponse.json({
      checkStatus: checkStatus || {}
    });
  } catch (error) {
    console.error('Check status GET API error:', error);
    return NextResponse.json(
      { error: 'チェック状態の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { checkStatus } = await request.json() as {
      checkStatus: Record<string, boolean>;
    };

    // チェック状態を保存
    await kv.del(CHECK_STATUS_KEY);
    if (Object.keys(checkStatus).length > 0) {
      await kv.hset(CHECK_STATUS_KEY, checkStatus);
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Check status POST API error:', error);
    return NextResponse.json(
      { error: 'チェック状態の保存に失敗しました' },
      { status: 500 }
    );
  }
}