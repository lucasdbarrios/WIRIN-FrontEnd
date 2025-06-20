import { CommonModule } from '@angular/common'; 
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OrderManagmentService } from '../../../services/order-managment/orderManagment.service';
import { OrderDeliveryService } from '../../../services/order-delivery/orderDelivery.service';
import { UserService } from '../../../services/user/user.service';
import { RouterModule } from '@angular/router';
import { OrderSequence } from '../../../types/orderSequence.type';
import { OrderListModule } from 'primeng/orderlist';
import { CardModule } from 'primeng/card';
import { ToastService } from '../../../services/toast/toast.service';
import { CardTaskComponent } from '../ui/card-task/card-task.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-deliveries-component',
    standalone: true,
    imports: [
        CommonModule, RouterModule, DataViewModule, FormsModule, TagModule, ButtonModule,
        DialogModule, DropdownModule, ToastModule, OrderListModule, CardModule, CardTaskComponent
    ],
    providers: [MessageService],
    templateUrl: './deliveries.component.html',
})
export class DeliveriesComponent implements OnInit, OnDestroy {
    isLoading: boolean = true;
    allTasks: any[] = [];
    tasks: any[] = [];
    selectedTasks: any[] = [];
    showDialog: boolean = false;
    selectedStudent: any = null;
    students: any[] = [];
    formdata?: FormData;
    orderSequence: OrderSequence[] = [];
    
    // Suscripciones para gestionar la limpieza al destruir el componente
    private subscriptions: Subscription[] = [];
    
    constructor(
        private orderManagmentService: OrderManagmentService,
        private orderDeliveryService: OrderDeliveryService,
        private userService: UserService,
        private messageService: MessageService,
        private toastService: ToastService
    ) {}

    ngOnInit(): void {
        this.loadTasksWithAutoRefresh();
        this.loadStudentsWithAutoRefresh();
    }
    
    ngOnDestroy(): void {
        // Cancelar todas las suscripciones al destruir el componente
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    // Método original para cargar tareas (se mantiene para compatibilidad)
    async loadTasks(): Promise<void> {
        this.isLoading = true;

        await this.orderManagmentService.getOrdersByState('Completada').subscribe({
            next: (data: any[]) => {
                this.allTasks = data;
                this.tasks = data.filter(task => task.status.toLowerCase() === 'completada');
                this.isLoading = false;
            },
            error: error => {
                this.toastService.showError('Error al cargar las tareas');
                console.error('Error al obtener las tareas:', error);
                this.isLoading = false;
            }
        });
    }
    
    // Nuevo método que utiliza auto-refresh para actualizar las tareas cada minuto
    loadTasksWithAutoRefresh(): void {
        this.isLoading = true;
        
        const subscription = this.orderManagmentService.getOrdersByStateWithAutoRefresh('Completada').subscribe({
            next: (data: any[]) => {
                this.allTasks = data;
                this.tasks = data.filter(task => task.status.toLowerCase() === 'completada');
                this.isLoading = false;
            },
            error: error => {
                this.toastService.showError('Error al cargar las tareas');
                console.error('Error al obtener las tareas:', error);
                this.isLoading = false;
            }
        });
        
        this.subscriptions.push(subscription);
    }

    // Método original para cargar estudiantes (se mantiene para compatibilidad)
    async loadStudents(): Promise<void> {
        this.userService.getUsersByRole('Alumno').subscribe({
            next: (students) => {
                this.students = students;
            },
            error: (error) => {
                this.toastService.showError('Error al cargar los alumnos');
                console.error('Error al cargar los alumnos:', error);
            }
        });
    }
    
    // Nuevo método que utiliza auto-refresh para actualizar los estudiantes cada minuto
    loadStudentsWithAutoRefresh(): void {
        const subscription = this.userService.getUsersByRoleWithAutoRefresh('Alumno').subscribe({
            next: (students) => {
                this.students = students;
            },
            error: (error) => {
                this.toastService.showError('Error al cargar los alumnos');
                console.error('Error al cargar los alumnos:', error);
            }
        });
        
        this.subscriptions.push(subscription);
    }

    onTaskSelectionChange(): void {
        this.selectedTasks = this.tasks.filter(task => task.selected);
        this.updateOrderSequence();
    }
    
    updateOrderSequence(): void {
        this.orderSequence = this.selectedTasks.map((task, index) => ({
            orderId: task.id,
            order: index + 1
        }));
    }
    
    onReorder(): void {
        this.updateOrderSequence();
        this.messageService.add({
            severity: 'info',
            summary: 'Tareas reordenadas',
            detail: 'El orden de las tareas ha sido actualizado'
        });
    }

    getSeverity(task: any): string {
        return task.status.toLowerCase() === 'completada' ? 'success' : 'info';
    }

    performDelivery(): void {
        if (!this.selectedStudent || this.selectedTasks.length === 0) {
            this.toastService.showError('Debe seleccionar al menos un alumno y una o más tareas.');
            return;
        }
        
        this.isLoading = true;
        this.orderDeliveryService.processDelivery(this.orderSequence, this.selectedStudent.id)
            .subscribe({
                next: (response) => {
                    this.toastService.showSuccess('La entrega se ha realizado correctamente');
                    this.showDialog = false;
                    this.selectedStudent = null;
                    this.selectedTasks = [];
                    this.orderSequence = [];
                    this.loadTasksWithAutoRefresh();
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error al realizar la entrega:', error);
                    this.toastService.showError('Ha ocurrido un error al realizar la entrega');
                    this.isLoading = false;
                }
            });
    }
}
