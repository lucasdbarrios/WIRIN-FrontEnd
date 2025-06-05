export interface Order {
  id: number;
  name: string;
  subject: string;
  description: string;
  authorName: string;
  rangePage: string;
  isPriority: boolean;
  status: string;
  creationDate: string;
  limitDate: string;
  createdByUserId: string;
  filePath: string;
  voluntarioId?: string;
  alumnoId?: string;
  revisorId?: string;
  delivererId?: string;
  assignedUserId?: string;
}