import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../types/message.interface';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private baseUrl = '/api/messages';

  constructor(private http: HttpClient) {}

  /** Obtener todos los mensajes del usuario */
  getMessagesByUserId(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/user/${userId}`);
  }

  /** Obtener mensaje individual por ID */
  getMessageById(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.baseUrl}/${id}`);
  }

  /** Enviar un nuevo mensaje (opcionalmente con archivo adjunto) */
  sendMessage(message: Partial<Message>, file?: File): Observable<any> {
    const formData = new FormData();
    const messageBlob = new Blob([JSON.stringify(message)], {
      type: 'application/json',
    });

    formData.append('mensaje', messageBlob);
    if (file) {
      formData.append('file', file);
    }

    return this.http.post(`${this.baseUrl}`, formData);
  }

  /** Descargar archivo asociado a un mensaje */
  downloadFileByMessageId(messageId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/file/${messageId}`, {
      responseType: 'blob',
    });
  }

  /** Actualizar mensaje existente (opcionalmente con archivo nuevo) */
  updateMessage(message: Partial<Message>, file?: File): Observable<any> {
    const formData = new FormData();
    const messageBlob = new Blob([JSON.stringify(message)], {
      type: 'application/json',
    });

    formData.append('mensaje', messageBlob);
    if (file) {
      formData.append('file', file);
    }

    return this.http.put(`${this.baseUrl}`, formData);
  }
}