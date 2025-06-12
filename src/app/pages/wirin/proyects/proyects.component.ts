import { Component, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { Product, ProductService } from '../../service/product.service';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ViewChild } from '@angular/core';
import { OrderDelivery } from '../../../types/orderDelivery.type';
import { OrderDeliveryService } from '../../../services/orderDelivery.service';
import { getSeverity } from '../../../utils/getSeverity';


@Component({
    selector: 'table-row-expansion-demo',
    templateUrl: 'proyects.component.html',
    standalone: true,
    imports: [TableModule, TagModule, ToastModule, RatingModule, ButtonModule, CommonModule, 
        FormsModule, IconFieldModule, InputIconModule, InputTextModule],
    providers: [ProductService, MessageService, InputIconModule]
})
export class ProyectsComponent implements OnInit {
    projects: OrderDelivery[] = []; // 🔥 Ahora `projects` tendrá datos reales

    @ViewChild('dt2') dt2!: Table;
    expandedRows = {};

    constructor(private messageService: MessageService, 
        private orderDeliveryService: OrderDeliveryService) {}

    ngOnInit(): void {
        this.orderDeliveryService.getOrderDeliveriesWithOrders().subscribe({
            next: (data: OrderDelivery[]) => {
                this.projects = data;
                console.log(this.projects);
            },
            error: (error: any) => {
                console.error('Error al obtener los proyectos:', error);
            }
        });
    }

    getSeverity(task: any): string {
        return getSeverity(task);
    }

    onFilter(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.dt2.filterGlobal(inputElement?.value || '', 'contains');
    }

    clear(table: Table) {
        table.clear();
    }

    onRowExpand(event: any) {
        this.messageService.add({ severity: 'info', summary: 'Proyecto Expandido', detail: event.data.Title, life: 3000 });
    }

    onRowCollapse(event: any) {
        this.messageService.add({ severity: 'success', summary: 'Proyecto Colapsado', detail: event.data.Title, life: 3000 });
    }
}