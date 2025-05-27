import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../../services/api.service';
import { PickListModule } from 'primeng/picklist';
import { OrderListModule } from 'primeng/orderlist';
import { AuthService } from '../../../services/auth.service';
import { OrderManagmentService } from '../../../services/orderManagment.service';
import { OrderService } from '../../../services/order.service';
import { SelectModule } from 'primeng/select';
import { DropDown } from '../../../types/dropDown';

@Component({
    selector: 'app-tareas',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule,SelectModule],
    templateUrl: './tareasComponent.html',
   
})
export class Tareas implements OnInit{ 
    tasks: any[] = [];
    layout: 'list' | 'grid' = 'list';
    options = ['list', 'grid'];
    selectedEstado: string = '';
    isRevisor: boolean = false;
    isVoluntario: boolean = false;
    isBibliotecario: boolean = false;
    isAlumno: boolean = false;
    isLoading: boolean = false;
    dropdownValue:  DropDown = {name: 'Pendiente', value: 'Pendiente'};
    dropdownValues: DropDown[] = [
        { name: 'Pendiente', value: 'Pendiente' },
        { name: 'Completada', value: 'Completada' },
        { name: 'Denegada', value: 'Denegada' },
        { name: 'En Revisión', value: 'En Revisión' },
        { name: 'En Proceso', value: 'En Proceso' }
    ];
   
   

    constructor(private orderService: OrderService, private authService: AuthService, private orderManagmentService: OrderManagmentService ) {
        this.loadTasks();
    }

    ngOnInit(): void {
        this.loadTasks();
        this.isRevisor = this.authService.hasRole('Voluntario Administrativo');
        this.isVoluntario = this.authService.hasRole('Voluntario');
        this.isBibliotecario = this.authService.hasRole('Bibliotecario') || this.authService.hasRole('Admin');
        this.isAlumno = this.authService.hasRole('Alumno');
      }

      async loadTasks(): Promise<void> {
        this.isLoading = true;
        
        const request = this.dropdownValue
          ? this.orderManagmentService.getOrdersByState(this.dropdownValue.value)
          : this.orderService.getOrders();
    
        await request.subscribe({
          next: (data: any[]) => {
            let filteredTasks = data;
            if (this.isVoluntario) {
              filteredTasks = filteredTasks.filter(task => task.status.toLowerCase() !== 'completada'
                && task.status.toLowerCase() !== 'en revisión' && task.status.toLowerCase() !== 'en proceso');
            } else if (this.isRevisor) {
              filteredTasks = filteredTasks.filter(task => task.status.toLowerCase() === 'en revisión');
            } else if (this.isAlumno) {
              filteredTasks = filteredTasks.filter(task => task.status.toLowerCase() === 'completada');
            }
    
            this.tasks = filteredTasks;
            this.isLoading = false;
          },
          error: error => {
            console.error('Error al obtener las tareas:', error);
            this.isLoading = false;
          }
        });
      }

    getSeverity(task: any): string {
        switch (task.status) {
            case 'Pendiente':
                return 'warning';
            case 'Completada':
                return 'success';
            case 'Cancelada':
                return 'danger';
            default:
                return 'info';
        }
    }

    editTask(task: any) {
        // Implementar la lógica de edición
        console.log('Editar tarea:', task);
    }

    deleteTask(task: any) {
        // Implementar la lógica de eliminación
        console.log('Eliminar tarea:', task);
    }
}