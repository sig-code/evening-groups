import { google } from 'googleapis';
import { CalendarEvent, Member } from './types';

// Google Calendar APIの設定
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// リフレッシュトークンを設定
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Calendar APIのインスタンスを作成
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * 直近の夕礼イベントを取得する
 */
export async function getNextEveningMeeting(): Promise<CalendarEvent | null> {
  const now = new Date();
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
    q: '夕礼', // 「夕礼」というキーワードで検索
  });

  const events = response.data.items;
  if (!events || events.length === 0) {
    return null;
  }

  // 最初に見つかった夕礼イベントを返す
  return events[0] as CalendarEvent;
}

/**
 * イベントから参加者リストを取得する
 */
export function getAttendees(event: CalendarEvent): Member[] {
  if (!event.attendees) {
    return [];
  }

  // 出席予定者のみ抽出（responseStatus === 'accepted'）
  return event.attendees
    .filter(attendee => attendee.responseStatus === 'accepted')
    .map(attendee => ({
      name: attendee.displayName || attendee.email.split('@')[0],
      email: attendee.email,
    }));
}

/**
 * 夕礼の参加者リストを取得する
 */
export async function getEveningMeetingMembers(): Promise<Member[]> {
  const event = await getNextEveningMeeting();
  if (!event) {
    return [];
  }

  return getAttendees(event);
}
