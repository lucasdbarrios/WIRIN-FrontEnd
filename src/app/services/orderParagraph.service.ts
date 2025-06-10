import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { ProcessParagraphRequest } from '../types/Requests/ProcessParagraphRequest';

@Injectable({
  providedIn: 'root'
})
export class OrderParagraphService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + "/OrderParagraph";
  }

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  processParagraphs(body: ProcessParagraphRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/processParagraphs`, body, {
        headers: { 
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
        },
        responseType: 'text'
    });
}

  getParagraphsByOrderId(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getParagraphsByOrderId/${orderId}`, this.getHeaders());
  }

  saveErrorMessageParagraph(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hasError`, { ...body }, {
      ...this.getHeaders(),
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }
}