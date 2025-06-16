import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderManagmentService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService, private authService: AuthService) {
    this.apiUrl = this.envService.getApiUrl() + "/OrderManagment";
  }

  getOrdersByState(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Bystatus?status=${status}`, this.authService.getHeaders());
  }

  getAssignedOrders(UserId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/byAssigned?UserId=${UserId}`, this.authService.getHeaders());
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