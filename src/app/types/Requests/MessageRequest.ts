export type MessageRequest = {
    id: string;
    status: string;
    isDraft: boolean;
    userFromId: string;
    studentId: string;
    sender: string;
    subject: string;
    date: string;
    content: string;
    responded?: boolean;
    responseText?: string;
}