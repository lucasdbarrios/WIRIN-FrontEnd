import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoRefreshService } from '../../services/auto-refresh.service';
import { Observable, Subscription } from 'rxjs';

interface ExampleData {
  id: number;
  value: string;
  timestamp: Date;
}

@Component({
  selector: 'app-auto-refresh-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="flex justify-between mb-4">
        <div>
          <span class="block text-xl font-medium mb-4">Ejemplo de Auto-Refresh</span>
          <p class="text-muted-color">Los datos se actualizan automáticamente cada 5 segundos</p>
        </div>
      </div>
      
      <div class="mt-4" *ngIf="data$ | async as data">
        <div class="p-4 border rounded-lg bg-surface-50">
          <p class="mb-2">ID: {{ data.id }}</p>
          <p class="mb-2">Valor: {{ data.value }}</p>
          <p>Última actualización: {{ data.timestamp | date:'medium' }}</p>
        </div>
      </div>
    </div>
  `
})
export class AutoRefreshExampleComponent implements OnInit, OnDestroy {
  data$!: Observable<ExampleData>;
  private subscription?: Subscription;

  constructor(private autoRefreshService: AutoRefreshService) {}

  ngOnInit() {
    // Simula una llamada a la API que devuelve datos actualizados
    const getData = () => {
      return new Observable<ExampleData>(observer => {
        observer.next({
          id: Math.floor(Math.random() * 1000),
          value: `Valor aleatorio ${Math.random().toString(36).substring(7)}`,
          timestamp: new Date()
        });
        observer.complete();
      });
    };

    // Configura el auto-refresh cada 5 segundos
    this.data$ = this.autoRefreshService.createAutoRefreshObservable(
      getData,
      5000
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}