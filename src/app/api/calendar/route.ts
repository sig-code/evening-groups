import { NextResponse } from 'next/server';
import { getEveningMeetingMembers } from '@/lib/calendar';

/**
 * カレンダーから参加者リストを取得するAPI
 */
export async function GET() {
  try {
    const members = await getEveningMeetingMembers();

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'カレンダー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
