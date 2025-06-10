import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { Paragraph } from '../types/paragraph.Interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + "/Order";
  }

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  getOrdersDelivered(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/delivered', this.getHeaders());
  }

  createOrder(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, {
      ...this.getHeaders(),
      reportProgress: true,
      observe: 'events'
    });
  }

  downloadFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/download/${id}`;
    return this.http.get(downloadUrl, {
      ...this.getHeaders(),
      responseType: 'blob'
    });
  }

  recoveryFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/recovery/${id}`;
    return this.http.get(downloadUrl, {
      ...this.getHeaders(),
      responseType: 'blob'
    });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  updateOrder(id: number, formData: FormData): Observable<any> {
    formData.append('id', id.toString());
    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      ...this.getHeaders(),
      reportProgress: true,
      observe: 'events'
    });
  }

  getTaskById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  checkOcrPrevius(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ocr-previus/${id}`, this.getHeaders());
  }

  getParagraphsByOrderId(orderId: number): Observable<Paragraph[]> {
    return this.http.get<any>(`${this.apiUrl}/getParagraphsByOrderId/${orderId}`, this.getHeaders());
  }
}