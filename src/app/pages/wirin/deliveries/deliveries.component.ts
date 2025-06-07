import { CommonModule } from '@angular/common'; 
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { OrderManagmentService } from '../../../services/orderManagment.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-deliveries-component',
    standalone: true,
    imports: [
        CommonModule, RouterModule, DataViewModule, FormsModule, TagModule, ButtonModule,
        DialogModule, DropdownModule
    ],
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
    


    constructor(
        private orderService: OrderService,
        private orderManagmentService: OrderManagmentService,
        private authService: AuthService,
        private userService: UserService
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
    }

    getSeverity(task: any): string {
        return task.status.toLowerCase() === 'completada' ? 'success' : 'info';
    }

    performDelivery(): void {
        if (!this.selectedStudent || this.selectedTasks.length === 0) {
            alert('Debe seleccionar al menos un alumno y una o más tareas.');
            return;
        }
        this.formdata = new FormData();
    this.formdata.append('id', toString());
    this.formdata.append('status', 'Entregada');
   
        const deliveryPromises = this.selectedTasks.map(task => 
            this.orderManagmentService.changeStatus(task.id, )
        );

        Promise.all(deliveryPromises).then(() => {
            this.showDialog = false;
            this.selectedTasks = [];
            this.selectedStudent = null;
            this.loadTasks();
        }).catch(error => {
            console.error('Error al realizar la entrega:', error);
            alert('Ocurrió un error al realizar la entrega. Por favor, intente nuevamente.');
        });
    }
}
