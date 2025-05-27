import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + "/Order";
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createOrder(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  downloadFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/download/${id}`;

    return this.http.get(downloadUrl, {
      responseType: 'blob'
    });
  }

  deleteOrder(id: number): Observable<any> {
    console.log(this.apiUrl);
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateOrder(id: number, formData: FormData): Observable<any> {
    formData.append('id', id.toString());
    
    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getTaskById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}