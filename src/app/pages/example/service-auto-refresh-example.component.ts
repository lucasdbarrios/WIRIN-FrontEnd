import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order/order.service';
import { OrderManagmentService } from '../../services/order-managment/orderManagment.service';
import { UserService } from '../../services/user/user.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-service-auto-refresh-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="flex justify-between mb-4">
        <div>
          <span class="block text-xl font-medium mb-4">Ejemplo de Servicios con Auto-Refresh</span>
          <p class="text-muted-color">Los datos se actualizan automáticamente cada minuto</p>
        </div>
      </div>
      
      <div class="mt-4">
        <h3 class="text-lg font-medium mb-2">Órdenes</h3>
        <div class="p-4 border rounded-lg bg-surface-50" *ngIf="orders$ | async as orders">
          <p>Total de órdenes: {{ orders.length }}</p>
          <p>Última actualización: {{ lastUpdate | date:'medium' }}</p>
        </div>
      </div>

      <div class="mt-4">
        <h3 class="text-lg font-medium mb-2">Órdenes Pendientes</h3>
        <div class="p-4 border rounded-lg bg-surface-50" *ngIf="pendingOrders$ | async as pendingOrders">
          <p>Total de órdenes pendientes: {{ pendingOrders.length }}</p>
          <p>Última actualización: {{ lastUpdate | date:'medium' }}</p>
        </div>
      </div>

      <div class="mt-4">
        <h3 class="text-lg font-medium mb-2">Usuarios</h3>
        <div class="p-4 border rounded-lg bg-surface-50" *ngIf="users$ | async as users">
          <p>Total de usuarios: {{ users.length }}</p>
          <p>Última actualización: {{ lastUpdate | date:'medium' }}</p>
        </div>
      </div>
    </div>
  `
})
export class ServiceAutoRefreshExampleComponent implements OnInit, OnDestroy {
  orders$!: Observable<any[]>;
  pendingOrders$!: Observable<any[]>;
  users$!: Observable<any[]>;
  lastUpdate: Date = new Date();
  
  private subscriptions: Subscription[] = [];

  constructor(
    private orderService: OrderService,
    private orderManagmentService: OrderManagmentService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Configurar observables con auto-refresh
    this.orders$ = this.orderService.getOrdersWithAutoRefresh();
    this.pendingOrders$ = this.orderManagmentService.getOrdersByStateWithAutoRefresh('Pendiente');
    this.users$ = this.userService.getAllWithAutoRefresh();

    // Actualizar la fecha de última actualización cada vez que se reciban nuevos datos
    const ordersSubscription = this.orders$.subscribe(() => {
      this.lastUpdate = new Date();
    });

    this.subscriptions.push(ordersSubscription);
  }

  ngOnDestroy() {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}