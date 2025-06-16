import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from '../env/env.service';
import { Observable } from 'rxjs';
import { ProcessParagraphRequest } from '../../types/Requests/ProcessParagraphRequest';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderParagraphService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService, private authService: AuthService) {
    this.apiUrl = this.envService.getApiUrl() + "/OrderParagraph";
  }

  processParagraphs(body: ProcessParagraphRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, body, {
        headers: { 
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
        },
        responseType: 'text'
    });
}

  getParagraphsByOrderId(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getParagraphsByOrderId/${orderId}`, this.authService.getHeaders());
  }

  saveErrorMessageParagraph(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hasError`, { ...body }, {
      ...this.authService.getHeaders(),
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }
}