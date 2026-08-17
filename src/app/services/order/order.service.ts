import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvService } from '../env/env.service';
import { Paragraph } from '../../types/paragraph.Interface';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { AutoRefreshService } from '../auto-refresh/auto-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends BaseService {
  private apiUrl: string;

  constructor(
    private http: HttpClient, 
    private envService: EnvService, 
    private authService: AuthService, // Inyectar AuthHeaderService
    autoRefreshService: AutoRefreshService
  ) {
    super(autoRefreshService);
    this.apiUrl = this.envService.getApiUrl() + "/Order";
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.authService.getHeaders());
  }

  /**
   * Obtiene las órdenes con actualización automática cada minuto
   * @returns Observable que emite las órdenes actualizadas cada minuto
   */
  getOrdersWithAutoRefresh(): Observable<any[]> {
    return this.createAutoRefreshObservable(() => this.getOrders());
  }

  getOrdersDelivered(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/delivered', this.authService.getHeaders());
  }

  /**
   * Obtiene las órdenes entregadas con actualización automática cada minuto
   * @returns Observable que emite las órdenes entregadas actualizadas cada minuto
   */
  getOrdersDeliveredWithAutoRefresh(): Observable<any[]> {
    return this.createAutoRefreshObservable(() => this.getOrdersDelivered());
  }

  createOrder(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, {
      ...this.authService.getHeaders(),
      reportProgress: true,
      observe: 'events'
    });
  }

  downloadFile(id: number): Observable<{ blob: Blob; fileName: string }> {
    const downloadUrl = `${this.apiUrl}/download/${id}`;
    return this.http.get(downloadUrl, {
      ...this.authService.getHeaders(),
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        const responseBlob = response.body ?? new Blob([], { type: 'application/pdf' });
        const fileName = this.extractFileNameFromDisposition(response.headers.get('content-disposition')) ?? 'document.pdf';
        return { blob: responseBlob, fileName };
      })
    );
  }

  recoveryFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/recovery/${id}`;
    return this.http.get(downloadUrl, {
      ...this.authService.getHeaders(),
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Blob>) => response.body ?? new Blob([], { type: 'application/pdf' }))
    );
  }

  private extractFileNameFromDisposition(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (encodedMatch && encodedMatch[1]) {
      const rawName = encodedMatch[1].replace(/['"]/g, '').trim();
      try {
        return decodeURIComponent(rawName);
      } catch {
        return rawName;
      }
    }

    const regularMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
    if (regularMatch && regularMatch[1]) {
      return regularMatch[1].trim();
    }

    return null;
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

  /**
   * Obtiene una tarea por ID con actualización automática cada minuto
   * @param id ID de la tarea
   * @returns Observable que emite la tarea actualizada cada minuto
   */
  getTaskByIdWithAutoRefresh(id: number): Observable<any> {
    return this.createAutoRefreshObservable(() => this.getTaskById(id));
  }

  checkOcrPrevius(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ocr-previus/${id}`, this.authService.getHeaders());
  }

  getParagraphsByOrderId(orderId: number): Observable<Paragraph[]> {
    return this.http.get<any>(`${this.apiUrl}/getParagraphsByOrderId/${orderId}`, this.authService.getHeaders());
  }

  /**
   * Obtiene los párrafos de una orden con actualización automática cada minuto
   * @param orderId ID de la orden
   * @returns Observable que emite los párrafos actualizados cada minuto
   */
  getParagraphsByOrderIdWithAutoRefresh(orderId: number): Observable<Paragraph[]> {
    return this.createAutoRefreshObservable(() => this.getParagraphsByOrderId(orderId));
  }
}