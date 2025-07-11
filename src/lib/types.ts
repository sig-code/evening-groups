export interface Member {
  name: string;
}

export interface Group {
  id: number;
  members: Member[];
}

export interface GroupHistory {
  date: string;
  groups: Group[];
}

export interface CalendarEvent {
  id: string;
  summary: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  start: {
    dateTime?: string;
    date?: string;
  };
}

export interface MemberPreset {
  id: string;
  name: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}
