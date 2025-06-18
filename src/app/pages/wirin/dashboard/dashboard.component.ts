import { Component } from '@angular/core';
import { Order } from '../../../types/order.interface';
import { DataTaskComponent } from '../ui/data-task/data-task.component';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ChartTasksComponent } from '../ui/chart-tasks/chart-tasks.component';
import { OrderDeliveryService } from '../../../services/order-delivery/orderDelivery.service';
import { OrderDelivery } from '../../../types/orderDelivery.interface';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    imports: [DataTaskComponent, CommonModule, TableModule, ChartTasksComponent],
})

export class DashboardComponent {
    isLoading: boolean = true;
    projects: OrderDelivery[] = [];
    tasks: Order[] = [];
    tasksPend: number = 0;
    tasksCompleted: number = 0;
    tasksInProcess: number = 0;
    tasksInReview: number = 0;
    tasksToValidate: number = 0;
    taskStats = [
        { bgClass: 'bg-blue-100 dark:bg-blue-400/10', iconClass: 'pi pi-list text-blue-500 !text-xl' },
        { bgClass: 'bg-orange-100 dark:bg-orange-400/10', iconClass: 'pi pi-clock text-orange-500 !text-xl' },
        { bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
        { bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
        { bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
        { bgClass: 'bg-green-100 dark:bg-green-400/10', iconClass: 'pi pi-check-circle text-green-500 !text-xl' }
    ];

    constructor(private orderDeliveryService: OrderDeliveryService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.getProjects();
    }

    getProjects() {
        this.isLoading = true;
    
        this.orderDeliveryService.getOrderDeliveriesWithOrders().subscribe({
            next: (response) => {
                console.log(response);
                this.projects = response;
                this.getFilterTasksByStatus(this.projects);
                this.isLoading = false;
            },
            error: (error) => {
                this.toastService.showError('Error al obtener los proyectos');
                console.error('Error al obtener proyectos:', error);
                this.isLoading = false;
            }
    });
    
            
    }

    private getFilterTasksByStatus(projects: OrderDelivery[]) {
        this.tasks = projects.map(project => project.orders).flat();

        this.tasksPend = this.tasks.filter(t => t.status === "Pendiente").length;
        this.tasksCompleted = this.tasks.filter(t => t.status === "Completada").length;
        this.tasksInProcess = this.tasks.filter(t => t.status === "En Proceso").length;
        this.tasksInReview = this.tasks.filter(t => t.status === "En Revisión").length;
        this.tasksToValidate = this.tasks.filter(t => t.status === "Aprobada").length;
    }

}