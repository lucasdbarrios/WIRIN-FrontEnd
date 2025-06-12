import { Component } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { OrderDelivery } from '../../../../../types/orderDelivery.type';
import { OrderService } from '../../../../../services/order.service';
import { User } from '../../../../../types/user.interface';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget-wirin',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `<div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Entregas de material</div>
        <p-table [value]="tasksDelived" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Cod. Entrega</th>
                    <th pSortableColumn="name">Alumno <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="price">Cantidad de tareas <p-sortIcon field="price"></p-sortIcon></th>
                    <th>Detalle</th>
                </tr>
            </ng-template>
            <ng-template #body let-task>
                <tr>
                    <td style="width: 35%; min-width: 7rem;" class="text-bold">{{ task.id }}</td>
                    <td style="width: 35%; min-width: 8rem;">{{ task.user.fullName}}</td>

                    <td style="width: 35%; min-width: 8rem;">{{ task?.orderQuantity ?? 0 }}</td>
                    <td style="width: 15%;">
                        <button pButton pRipple type="button" icon="pi pi-search" class="p-button p-component p-button-text p-button-icon-only"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>`,
    providers: [OrderService]
})
export class RecentSalesWidgetWirin {
    tasksDelived!: OrderDelivery[];
    users!: User[];;

    constructor(private orderService: OrderService, private userService: UserService) {}

    

ngOnInit() {
    forkJoin({
        users: this.userService.getAllStudents(),
        orders: this.orderService.getOrdersDelivered()
    }).subscribe(({ users, orders }) => {
        this.users = users;
        this.tasksDelived = orders.map(order => ({
            title: order.title || '', // Add missing required title property
            studentId: order.studentId,
            status: order.status,
            userId: order.userId,
            deliveryDate: order.deliveryDate,
            id: order.id,
            orderQuantity: 0,
            user: this.users.find(user => user.id === order.studentId)
        }));
    });
}
}
