import { NextResponse } from 'next/server';
import { getMembers, saveMembers } from '@/lib/vercel-kv';
import { Member } from '@/lib/types';

/**
 * メンバーリストを取得するAPI
 */
export async function GET() {
  try {
    const members = await getMembers();
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Members API error:', error);
    return NextResponse.json(
      { error: 'メンバー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * メンバーリストを更新するAPI
 */
export async function POST(request: Request) {
  try {
    const { members } = await request.json() as {
      members: Member[];
    };

    const success = await saveMembers(members);

    if (!success) {
      return NextResponse.json(
        { error: 'メンバー情報の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error('Members API error:', error);
    return NextResponse.json(
      { error: 'メンバー情報の保存に失敗しました' },
      { status: 500 }
    );
  }
}
