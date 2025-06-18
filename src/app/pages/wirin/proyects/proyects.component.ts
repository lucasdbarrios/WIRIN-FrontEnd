import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ViewChild } from '@angular/core';
import { OrderDelivery } from '../../../types/orderDelivery.interface';
import { OrderDeliveryService } from '../../../services/order-delivery/orderDelivery.service';
import { getSeverity } from '../../../utils/getSeverity';
import { DialogModule } from 'primeng/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';

@Component({
    selector: 'table-row-expansion-demo',
    templateUrl: 'proyects.component.html',
    standalone: true,
    imports: [TableModule, TagModule, ToastModule, RatingModule, ButtonModule, CommonModule, 
        FormsModule, IconFieldModule, InputIconModule, InputTextModule, DialogModule, TaskDetailComponent],
    providers: [ MessageService, InputIconModule]
})

export class ProyectsComponent implements OnInit {
    projects: OrderDelivery[] = [];
    @ViewChild('dt2') dt2!: Table;
    expandedRows = {};
    taskId: number = 0;
    isTaskDetailOpen: boolean = false;
    @Output() taskDeleted = new EventEmitter<number>();
    selectedProject: OrderDelivery | null = null;
    isLoading: boolean = true;

    constructor(private messageService: MessageService, 
        private orderDeliveryService: OrderDeliveryService) {}

    ngOnInit(): void {
        this.loadTasksDelivered();
    }

    loadTasksDelivered(): void {
        this.isLoading = true;
        this.orderDeliveryService.getOrderDeliveriesWithOrders().subscribe({
            next: (data: OrderDelivery[]) => {
                this.projects = data;
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error al obtener los proyectos:', error);
            }
        })
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

    onShowTaskDetail(projectId: number, taskId: number) {
        console.log("hola")
        this.selectedProject = this.projects.find(p => p.id === projectId) || null;
        this.taskId = taskId;
        console.log(taskId)
        setTimeout(() => this.isTaskDetailOpen = true, 0);
    }

    handleTaskDeletion(projectId: number, taskId: number): void {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.orders = project.orders?.filter(task => task.id !== taskId);
        }
        this.isTaskDetailOpen = false;
    }
}