import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AutoRefreshService } from '../auto-refresh/auto-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  constructor(private autoRefreshService: AutoRefreshService) {}

  /**
   * Crea un Observable que se actualiza automáticamente a intervalos regulares
   * @param dataFn Función que devuelve un Observable con los datos a actualizar
   * @param intervalMs Intervalo de actualización en milisegundos (por defecto 60000ms = 1 minuto)
   * @returns Observable que emite datos actualizados en el intervalo especificado
   */
  protected createAutoRefreshObservable<T>(
    dataFn: () => Observable<T>,
    intervalMs: number = 60000
  ): Observable<T> {
    return this.autoRefreshService.createAutoRefreshObservable(dataFn, intervalMs);
  }
}