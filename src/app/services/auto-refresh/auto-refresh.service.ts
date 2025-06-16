import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { switchMap, takeUntil, retry, share, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutoRefreshService implements OnDestroy {
  private stopPolling = new Subject<void>();

  constructor() {}

  /**
   * Crea un observable que se actualiza automáticamente en un intervalo especificado
   * @param dataFn Función que devuelve un Observable con los datos a actualizar
   * @param interval Intervalo de actualización en milisegundos (por defecto 5000ms)
   * @returns Observable que emite los datos actualizados periódicamente
   */
  createAutoRefreshObservable<T>(
    dataFn: () => Observable<T>,
    interval: number = 5000
  ): Observable<T> {
    return timer(0, interval).pipe(
      switchMap(() => dataFn()),
      retry(),
      takeUntil(this.stopPolling),
      share()
    );
  }

  ngOnDestroy(): void {
    this.stopPolling.next();
    this.stopPolling.complete();
  }
}