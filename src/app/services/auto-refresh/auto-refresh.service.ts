import { Injectable } from '@angular/core';
import { Observable, interval, switchMap, shareReplay, concat, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoRefreshService {
  /**
   * Crea un Observable que se actualiza automáticamente a intervalos regulares
   * @param dataFn Función que devuelve un Observable con los datos a actualizar
   * @param intervalMs Intervalo de actualización en milisegundos (por defecto 60000ms = 1 minuto)
   * @returns Observable que emite datos actualizados en el intervalo especificado
   */
  createAutoRefreshObservable<T>(
    dataFn: () => Observable<T>,
    intervalMs: number = 60000
  ): Observable<T> {
    // Utilizamos startWith y concat para emitir inmediatamente y luego seguir con el intervalo
    return concat(
      // Primero emitimos los datos iniciales inmediatamente
      dataFn(),
      // Luego configuramos el intervalo para actualizaciones periódicas
      interval(intervalMs).pipe(
        switchMap(() => dataFn())
      )
    ).pipe(
      // shareReplay permite que múltiples suscriptores compartan la misma secuencia de datos
      // y obtengan el último valor emitido al suscribirse
      shareReplay(1)
    );
  }
}