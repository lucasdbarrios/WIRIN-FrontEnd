import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class OrderManagmentService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + "/OrderManagment";
  }

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  getOrdersByState(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status?status=${status}`, this.getHeaders());
  }

  getAssignedOrders(UserId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assigned?UserId=${UserId}`, this.getHeaders());
  }

  changeStatus(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/changeStatus`, { 
      id: formData.get('id'), 
      status: formData.get('status')
    }, this.getHeaders());
  }

  saveVoluntarioId(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/saveVoluntarioId`, { 
      id: formData.get('id'), 
      userId: formData.get('userId') 
    }, this.getHeaders());
  }

  saveRevisorId(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/saveRevisorId`, { 
      id: formData.get('id'), 
      userId: formData.get('userId') 
    }, this.getHeaders());
  }

  saveOcrChanges(orderId: number, ocrData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/saveOcrChanges/${orderId}`, ocrData, this.getHeaders());
  }
}