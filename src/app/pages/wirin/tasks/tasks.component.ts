import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { PickListModule } from 'primeng/picklist';
import { OrderListModule } from 'primeng/orderlist';
import { AuthService } from '../../../services/auth.service';
import { OrderManagmentService } from '../../../services/orderManagment.service';
import { OrderService } from '../../../services/order.service';
import { SelectModule } from 'primeng/select';
import { DropDown } from '../../../types/dropDown';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-tasks-component',
    standalone: true,
    imports: [CommonModule, RouterModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule,SelectModule],
    templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit{ 
    tasks: any[] = [];
    layout: 'list' | 'grid' = 'list';
    options = ['list', 'grid'];
    selectedEstado: string = '';
    isRevisor: boolean = false;
    isVoluntario: boolean = false;
    isBibliotecario: boolean = false;
    isAlumno: boolean = false;
    isLoading: boolean = false;
    dropdownValue:  DropDown | null = null;
    dropdownValues: DropDown[] = [
        { name: 'Todos', value: '' },
        { name: 'Pendiente', value: 'Pendiente' },
        { name: 'Completada', value: 'Completada' },
        { name: 'Denegada', value: 'Denegada' },
        { name: 'En Revisión', value: 'En Revisión' },
        { name: 'En Progreso', value: 'En Progreso' }
    ];
   
   

    constructor(private orderService: OrderService, 
      private authService: AuthService, 
      private orderManagmentService: OrderManagmentService,
      private router: Router 
    ) {
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
        const selectedState = this.dropdownValue?.value || '';
        const request = selectedState
          ? this.orderManagmentService.getOrdersByState(selectedState)
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
            case 'En Revisión':
                return 'warning';
            case 'Completada':
                return 'success';
              case 'Entregada':
                return 'success';
            case 'Denegada':
                return 'danger';
            default:
                return 'info';
        }
    }

    newTask() {
        this.router.navigate(['/wirin/add-task-form']);
    }

    editTask(id: number) {
      console.log(id);
      this.router.navigate([`/wirin/edit-task-form/${id}`]);
    }

    deleteTask(taskId: number, event: Event): void {
      event.stopPropagation();
  
      this.orderService.deleteOrder(taskId).subscribe({
          next: () => {
              this.loadTasks();
          },
          error: error => {
              console.error('Error al eliminar tarea:', error);
          }
      });
  }
}