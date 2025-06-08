import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { ProcessParagraphRequest } from '../types/Requests/ProcessParagraphRequest';

@Injectable({
  providedIn: 'root'
})
export class OrderParagraphService {
  private apiUrl:string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl()+"/OrderParagraph";
  }

  processParagraphs(body: ProcessParagraphRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/processParagraphs`, { ...body }, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }

  getParagraphsByOrderId(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getParagraphsByOrderId/${orderId}`);
  }

  saveErrorMessageParagraph(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hasError`, { ...body }, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }
}
