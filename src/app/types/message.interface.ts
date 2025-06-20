export interface Message {
  id: number;
  userFromId: string;
  studentId: string;
  sender: string;
  subject: string;
  date: Date;
  content: string;
  filePath?: string;
  isDraft: boolean;
  responded: boolean;
  responseText?: string;
}