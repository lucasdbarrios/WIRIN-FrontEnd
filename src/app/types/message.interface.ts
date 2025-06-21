export interface Message {
  id: number;
  userFromId: string;
  userToId?: string;
  sender: string;
  subject: string;
  date: Date;
  content: string;
  filePath?: string;
  isDraft: boolean;
  responded: boolean;
  responseText?: string;
  isRead?: boolean;
  deleted?: boolean;
  userFromRole?: string;
  userToRole?: string;
  
  // Propiedades adicionales para la gestión de la UI
  recipientName?: string | null;
  loadingRecipientInfo?: boolean;
  senderName?: string | null;
  loadingSenderInfo?: boolean;
  
  // Permite otras propiedades dinámicas
  [key: string]: any;
}