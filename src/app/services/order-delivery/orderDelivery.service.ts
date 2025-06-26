import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../env/env.service';
import { OrderSequence } from '../../types/orderSequence.type';
import { OrderDelivery } from '../../types/orderDelivery.type';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { AutoRefreshService } from '../auto-refresh/auto-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class OrderDeliveryService extends BaseService {
  private apiUrl: string;

  constructor(
    private http: HttpClient, 
    private envService: EnvService, 
    private authService: AuthService,
    autoRefreshService: AutoRefreshService
  ) {
    super(autoRefreshService);
    this.apiUrl = this.envService.getApiUrl() + "/orderdelivery";
  }

  processDelivery(orderSequence: OrderSequence[], studentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/performDelivery`, {
        SelectedOrders: orderSequence,
        StudentId: studentId
    }, this.authService.getHeaders());
  }

  createDelivery(deliveryData: OrderDelivery): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, deliveryData, this.authService.getHeaders());
  }

  getDeliveries(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, this.authService.getHeaders());
  }

  getDeliveriesWithAutoRefresh(): Observable<any> {
    return this.createAutoRefreshObservable(() => this.getDeliveries());
  }

  getOrderDeliveriesWithOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/WithOrders`, this.authService.getHeaders());
  }

  getOrderDeliveriesWithOrdersWithAutoRefresh(): Observable<any> {
    return this.createAutoRefreshObservable(() => this.getOrderDeliveriesWithOrders());
  }

  deleteOrderDelivery(orderDeliveryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${orderDeliveryId}`, this.authService.getHeaders());
  }

  updateOrderDelivery(id: number, body: any): Observable<any> {
  console.log('🚀 Actualizando entrega:', {
    url: `${this.apiUrl}/${id}`,
    payload: body
  });

  return this.http.put(`${this.apiUrl}/${id}`, body, this.authService.getHeaders());
}

}