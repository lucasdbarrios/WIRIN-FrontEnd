export interface MessageRequest {
  id: number;
  isDraft: boolean;
  userFromId: string;
  userToId?: string;
  sender: string;
  subject: string;
  date: string; // ISO string format
  content: string;
  responded: boolean;
  responseText: string | null;
}