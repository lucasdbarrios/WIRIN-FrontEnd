import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { OrderSequence } from '../types/orderSequence.type';
import { OrderDelivery } from '../types/orderDelivery.type';

@Injectable({
  providedIn: 'root'
})
export class OrderDeliveryService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + "/orderdelivery";
  }

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  processDelivery(orderSequence: OrderSequence[], studentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/performDelivery`, {
        SelectedOrders: orderSequence,
        StudentId: studentId
    }, this.getHeaders());
  }

  createDelivery(deliveryData: OrderDelivery): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, deliveryData, this.getHeaders());
  }

  getDeliveries(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, this.getHeaders());
  }

  getOrderDeliveriesWithOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/WithOrders`, this.getHeaders());
  }

}