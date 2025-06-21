import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Message } from '../../types/message.interface';
import { MessageRequest } from '../../types/message-request.interface';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

// Enum para los tipos de carpetas de mensajes
export enum MessageFolder {
  INBOX = 'inbox',
  SENT = 'sent',
  ALL = 'all'
}

// Enum para los tipos de actualizaciones de mensajes
export enum MessageUpdateType {
  READ = 'read',
  DELETE = 'delete',
  RESPOND = 'respond'
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/message`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  /**
   * Obtiene mensajes según la carpeta especificada
   * @param folder Carpeta de mensajes (inbox, sent, all)
   * @returns Observable con la lista de mensajes
   */
  getMessagesByFolder(folder: MessageFolder): Observable<Message[]> {
    const endpoints = {
      [MessageFolder.INBOX]: `${this.apiUrl}/recived`,
      [MessageFolder.SENT]: `${this.apiUrl}/sended`,
      [MessageFolder.ALL]: `${this.apiUrl}`
    };
    
    return this.http.get<Message[]>(endpoints[folder], this.authService.getHeaders());
  }

  /**
   * Obtiene todos los mensajes
   * @returns Observable con la lista de todos los mensajes
   */
  getMessages(): Observable<Message[]> {
    return this.getMessagesByFolder(MessageFolder.ALL);
  }

  /**
   * Obtiene los mensajes recibidos por el usuario
   * @returns Observable con la lista de mensajes recibidos
   */
  getReceivedMessages(): Observable<Message[]> {
    return this.getMessagesByFolder(MessageFolder.INBOX);
  }

  /**
   * Obtiene los mensajes enviados por el usuario
   * @returns Observable con la lista de mensajes enviados
   */
  getSentMessages(): Observable<Message[]> {
    return this.getMessagesByFolder(MessageFolder.SENT);
  }
  
  /**
   * Obtiene todos los mensajes asociados a un usuario
   * @param userId ID del usuario
   * @returns Observable con la lista de mensajes
   * @deprecated Use getMessagesByFolder instead
   */
  getMessagesByUserId(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/byUserId/${userId}`);
  }
  
  /**
   * Obtiene todos los mensajes asociados a un usuario, filtrando los eliminados
   * @param userId ID del usuario
   * @returns Observable con la lista de mensajes no eliminados
   * @deprecated Use getMessagesByFolder instead
   */
  getMessagesByUserIdFiltered(userId: string): Observable<Message[]> {
    return this.getMessagesByUserId(userId).pipe(
      map(messages => messages.filter(msg => !msg.deleted))
    );
  }

  /**
   * Obtiene un mensaje por su ID
   * @param id ID del mensaje
   * @returns Observable con el mensaje
   */
  getMessageById(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/byId/${id}`);
  }

  /**
   * Convierte un objeto Message parcial a MessageRequest
   * @param message Datos del mensaje parciales
   * @returns Objeto MessageRequest completo
   */
  private convertToMessageRequest(message: Partial<Message>): MessageRequest {
    return {
      id: message.id || 0,
      isDraft: message.isDraft || false,
      userFromId: message.userFromId || '',
      userToId: message.userToId || '',
      sender: message.sender || '',
      subject: message.subject || '',
      date: message.date ? message.date.toISOString() : new Date().toISOString(),
      content: message.content || '',
      responded: message.responded || false,
      responseText: message.responseText || null
    };
  }

  /**
   * Envía un nuevo mensaje
   * @param message Datos del mensaje a enviar
   * @param file Archivo opcional para adjuntar
   * @returns Observable con la respuesta del servidor
   */
  sendMessage(message: Partial<Message>, file?: File): Observable<any> {
    const messageRequest = this.convertToMessageRequest(message);
    
    // Enviar directamente como JSON en lugar de FormData
    return this.http.post(`${this.apiUrl}`, messageRequest, {
      ...this.authService.getHeaders(),
      responseType: 'text' // Cambiar el tipo de respuesta a texto para evitar errores de parsing JSON
    }).pipe(
      map(() => ({}))
    );

    // Nota: El enfoque con FormData está comentado temporalmente
    // const formData = new FormData();
    // formData.append('messageRequest', new Blob([JSON.stringify(messageRequest)], { type: 'application/json' }));
    // if (file) formData.append('file', file);
    // return this.http.post(`${this.apiUrl}`, formData);
  }

  /**
   * Descarga un archivo adjunto a un mensaje
   * @param messageId ID del mensaje que contiene el archivo
   * @returns Observable con el blob del archivo
   */
  downloadFile(messageId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/getFile/${messageId}`, { responseType: 'blob' });
  }

  /**
   * Actualiza un mensaje existente
   * @param message Datos del mensaje a actualizar
   * @param file Archivo opcional para adjuntar
   * @returns Observable con la respuesta del servidor
   */
  updateMessage(message: Partial<Message>, file?: File): Observable<any> {
    const messageRequest = this.convertToMessageRequest(message);
    
    // Enviar directamente como JSON en lugar de FormData
    return this.http.put(`${this.apiUrl}`, messageRequest, this.authService.getHeaders());
    
    // Nota: El enfoque con FormData está comentado temporalmente
    // const formData = new FormData();
    // formData.append('messageRequest', new Blob([JSON.stringify(messageRequest)], { type: 'application/json' }));
    // if (file) formData.append('file', file);
    // return this.http.put(`${this.apiUrl}`, formData);
  }

  /**
   * Método genérico para actualizar el estado de un mensaje
   * @param messageId ID del mensaje a actualizar
   * @param updateType Tipo de actualización a realizar
   * @returns Observable con la respuesta del servidor
   */
  updateMessageStatus(messageId: number, updateType: MessageUpdateType): Observable<any> {
    return this.getMessageById(messageId).pipe(
      switchMap(message => {
        let updatedMessage: Partial<Message> = { ...message };
        
        switch(updateType) {
          case MessageUpdateType.READ:
            updatedMessage.isRead = true;
            break;
          case MessageUpdateType.DELETE:
            updatedMessage.deleted = true;
            break;
          case MessageUpdateType.RESPOND:
            updatedMessage.responded = true;
            break;
        }
        
        return this.updateMessage(updatedMessage);
      })
    );
  }

  /**
   * Marca un mensaje como leído
   * @param messageId ID del mensaje a marcar como leído
   * @returns Observable con la respuesta del servidor
   */
  markAsRead(messageId: number): Observable<any> {
    return this.updateMessageStatus(messageId, MessageUpdateType.READ);
  }
  
  /**
   * Elimina un mensaje (marcándolo como eliminado)
   * @param messageId ID del mensaje a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteMessage(messageId: number): Observable<any> {
    return this.updateMessageStatus(messageId, MessageUpdateType.DELETE);
  }

  /**
   * Marca un mensaje como respondido
   * @param messageId ID del mensaje a marcar como respondido
   * @returns Observable con la respuesta del servidor
   */
  markAsResponded(messageId: number): Observable<any> {
    return this.updateMessageStatus(messageId, MessageUpdateType.RESPOND);
  }
}
