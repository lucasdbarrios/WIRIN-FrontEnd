import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '../../types/message.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private baseUrl = '/api/messages';

  constructor(private http: HttpClient) {}

  getMessagesByUserId(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/user/${userId}`);
  }

  getMessageById(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.baseUrl}/${id}`);
  }

  sendMessage(message: Partial<Message>, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('mensaje', new Blob([JSON.stringify(message)], { type: 'application/json' }));
    if (file) formData.append('file', file);
    return this.http.post(`${this.baseUrl}`, formData);
  }

  downloadFileByMessageId(messageId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/file/${messageId}`, {
      responseType: 'blob'
    });
  }

  updateMessage(message: Partial<Message>, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('mensaje', new Blob([JSON.stringify(message)], { type: 'application/json' }));
    if (file) formData.append('file', file);
    return this.http.put(`${this.baseUrl}`, formData);
  }
}