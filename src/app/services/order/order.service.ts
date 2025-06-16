import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../env/env.service';
import { Paragraph } from '../../types/paragraph.Interface';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl: string;

  constructor(
    private http: HttpClient, 
    private envService: EnvService, 
    private authService: AuthService // Inyectar AuthHeaderService
  ) {
    this.apiUrl = this.envService.getApiUrl() + "/Order";
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.authService.getHeaders());
  }

  getOrdersDelivered(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/delivered', this.authService.getHeaders());
  }

  createOrder(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, {
      ...this.authService.getHeaders(),
      reportProgress: true,
      observe: 'events'
    });
  }

  downloadFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/download/${id}`;
    return this.http.get(downloadUrl, {
      ...this.authService.getHeaders(),
      responseType: 'blob'
    });
  }

  recoveryFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/recovery/${id}`;
    return this.http.get(downloadUrl, {
      ...this.authService.getHeaders(),
      responseType: 'blob'
    });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.authService.getHeaders());
  }

  updateOrder(id: number, formData: FormData): Observable<any> {
    formData.append('id', id.toString());
    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      ...this.authService.getHeaders(),
      reportProgress: true,
      observe: 'events'
    });
  }

  getTaskById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.authService.getHeaders());
  }

  checkOcrPrevius(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ocr-previus/${id}`, this.authService.getHeaders());
  }

  getParagraphsByOrderId(orderId: number): Observable<Paragraph[]> {
    return this.http.get<any>(`${this.apiUrl}/getParagraphsByOrderId/${orderId}`, this.authService.getHeaders());
  }
}