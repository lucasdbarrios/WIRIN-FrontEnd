import { CommonModule } from '@angular/common'; 
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OrderManagmentService } from '../../../services/orderManagment.service';
import { OrderService } from '../../../services/order.service';
import { OrderDeliveryService } from '../../../services/orderDelivery.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { RouterModule } from '@angular/router';
import { OrderSequence } from '../../../types/orderSequence.type';
import { OrderListModule } from 'primeng/orderlist';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-deliveries-component',
    standalone: true,
    imports: [
        CommonModule, RouterModule, DataViewModule, FormsModule, TagModule, ButtonModule,
        DialogModule, DropdownModule, ToastModule, OrderListModule, CardModule
    ],
    providers: [MessageService],
    templateUrl: './deliveries.component.html',
})
export class DeliveriesComponent implements OnInit {
    isLoading: boolean = true;
    allTasks: any[] = [];
    tasks: any[] = [];
    selectedTasks: any[] = [];
    showDialog: boolean = false;
    selectedStudent: any = null;
    students: any[] = [];
    formdata?: FormData;
    orderSequence: OrderSequence[] = [];
    


    constructor(
        private orderService: OrderService,
        private orderManagmentService: OrderManagmentService,
        private orderDeliveryService: OrderDeliveryService,
        private authService: AuthService,
        private userService: UserService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadTasks();
        this.loadStudents();
    }

    async loadTasks(): Promise<void> {
        this.isLoading = true;

        await this.orderManagmentService.getOrdersByState('Completada').subscribe({
            next: (data: any[]) => {
                this.allTasks = data;
                this.tasks = data.filter(task => task.status.toLowerCase() === 'completada');
                this.isLoading = false;
            },
            error: error => {
                console.error('Error al obtener las tareas:', error);
                this.isLoading = false;
            }
        });
    }

    async loadStudents(): Promise<void> {
        this.userService.getUsersByRole('Alumno').subscribe({
            next: (students) => {
                this.students = students;
            },
            error: (error) => {
                console.error('Error al cargar los alumnos:', error);
            }
        });
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
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe seleccionar al menos un alumno y una o más tareas.'
            });
            return;
        }
        
        this.isLoading = true;
        const body = {selectedOrders: this.orderSequence, studentId: this.selectedStudent.id};
        this.orderDeliveryService.processDelivery(body)
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'La entrega se ha realizado correctamente'
                    });
                    this.showDialog = false;
                    this.selectedStudent = null;
                    this.selectedTasks = [];
                    this.orderSequence = [];
                    this.loadTasks(); // Recargar las tareas
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error al realizar la entrega:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Ha ocurrido un error al realizar la entrega'
                    });
                    this.isLoading = false;
                }
            });
    }
}
