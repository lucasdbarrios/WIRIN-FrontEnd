import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { AutoRefreshService } from '../auto-refresh/auto-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class OrderManagmentService extends BaseService {
  private apiUrl: string;

  constructor(
    private http: HttpClient, 
    private envService: EnvService, 
    private authService: AuthService,
    autoRefreshService: AutoRefreshService
  ) {
    super(autoRefreshService);
    this.apiUrl = this.envService.getApiUrl() + "/OrderManagment";
  }

  getOrdersByState(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Bystatus?status=${status}`, this.authService.getHeaders());
  }

  /**
   * Obtiene las órdenes por estado con actualización automática cada minuto
   * @param status Estado de las órdenes a obtener
   * @returns Observable que emite las órdenes actualizadas cada minuto
   */
  getOrdersByStateWithAutoRefresh(status: string): Observable<any[]> {
    return this.createAutoRefreshObservable(() => this.getOrdersByState(status));
  }

  getAssignedOrders(UserId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/byAssigned?UserId=${UserId}`, this.authService.getHeaders());
  }

  /**
   * Obtiene las órdenes asignadas a un usuario con actualización automática cada minuto
   * @param UserId ID del usuario
   * @returns Observable que emite las órdenes asignadas actualizadas cada minuto
   */
  getAssignedOrdersWithAutoRefresh(UserId: string): Observable<any[]> {
    return this.createAutoRefreshObservable(() => this.getAssignedOrders(UserId));
  }

  changeStatus(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}`, { 
      id: formData.get('id'), 
      status: formData.get('status')
    }, this.authService.getHeaders());
  }

  saveVoluntarioId(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/saveVoluntarioId`, { 
      id: formData.get('id'), 
      userId: formData.get('userId') 
    }, this.authService.getHeaders());
  }

  saveRevisorId(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/saveRevisorId`, { 
      id: formData.get('id'), 
      userId: formData.get('userId') 
    }, this.authService.getHeaders());
  }

  saveOcrChanges(orderId: number, ocrData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/saveOcrChanges/${orderId}`, ocrData, this.authService.getHeaders());
  }
}