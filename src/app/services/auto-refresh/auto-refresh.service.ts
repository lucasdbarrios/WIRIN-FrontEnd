import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { switchMap, takeUntil, retry, share, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutoRefreshService implements OnDestroy {
  private stopPolling = new Subject<void>();

  constructor() {}

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