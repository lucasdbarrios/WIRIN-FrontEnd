import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { OrderSequence } from '../types/orderSequence.type';

@Injectable({
  providedIn: 'root'
})
export class OrderDeliveryService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + "/Ordermanagment";
  }

  /**
   * Procesa la entrega de tareas a un estudiante
   * @param orderSequence Secuencia de órdenes a entregar
   * @param studentId ID del estudiante seleccionado
   * @returns Observable con la respuesta del servidor
   */
  processDelivery(body: {selectedOrders: OrderSequence[], studentId: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/performDelivery`, {
     ...body
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}