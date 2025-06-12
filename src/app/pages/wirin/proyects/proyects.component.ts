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


@Component({
    selector: 'table-row-expansion-demo',
    templateUrl: 'proyects.component.html',
    standalone: true,
    imports: [TableModule, TagModule, ToastModule, RatingModule, ButtonModule, CommonModule, 
        FormsModule, IconFieldModule, InputIconModule, InputTextModule],
    providers: [ProductService, MessageService, InputIconModule]
})
export class ProyectsComponent implements OnInit {
    projects = [
        {
            Id: 101, Title: "Proyecto A", Status: "Active", StudentUserId: "User123",
            CreationDate: new Date('2025-06-01'), DeliveryDate: new Date('2025-07-01'),
            Tasks: [
                { Id: 1, Name: "Tarea 1", Description: "Resolver ecuaciones", Status: "Pending", CreationDate: new Date('2025-06-01'), LimitDate: new Date('2025-06-15') },
                { Id: 2, Name: "Tarea 2", Description: "Redacción", Status: "Completed", CreationDate: new Date('2025-05-20'), LimitDate: new Date('2025-06-05') }
            ]
        },
        {
            Id: 102, Title: "Proyecto B", Status: "In Progress", StudentUserId: "User456",
            CreationDate: new Date('2025-06-10'), DeliveryDate: new Date('2025-07-05'),
            Tasks: [
                { Id: 3, Name: "Tarea 3", Description: "Diseño gráfico", Status: "Pending", CreationDate: new Date('2025-06-10'), LimitDate: new Date('2025-06-25') }
            ]
        }
    ];

    @ViewChild('dt2') dt2!: Table;
    expandedRows = {};

    constructor(private messageService: MessageService) {}

    ngOnInit() {}

    onFilter(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.dt2.filterGlobal(inputElement?.value || '', 'contains');
    }

    clear(table: Table) {
        table.clear();
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case 'Pending': return 'warn';
            case 'Completed': return 'success';
            default: return 'danger';
        }
    }

    onRowExpand(event: any) {
        this.messageService.add({ severity: 'info', summary: 'Proyecto Expandido', detail: event.data.Title, life: 3000 });
    }

    onRowCollapse(event: any) {
        this.messageService.add({ severity: 'success', summary: 'Proyecto Colapsado', detail: event.data.Title, life: 3000 });
    }

    // onShowTaskDetail(taskId: number) {
    //     this.taskId = taskId;
    //     setTimeout(() => this.isTaskDetailOpen = true, 0);
    // }
}