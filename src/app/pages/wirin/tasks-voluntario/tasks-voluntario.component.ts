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
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FluidModule } from 'primeng/fluid';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../../types/user.interface';
import { ToastService } from '../../../services/toast.service';
import { DialogModule } from 'primeng/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';

@Component({
    selector: 'app-tasks-component',
    standalone: true,
    imports: [CommonModule, RouterModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, 
    OrderListModule, TagModule, ButtonModule,SelectModule, ToolbarModule, IconFieldModule, InputIconModule,
    SplitButtonModule, FluidModule, InputGroupModule, InputTextModule, DialogModule,TaskDetailComponent
],
    templateUrl: './tasks-voluntario.component.html',
})
export class TasksVoluntarioComponent implements OnInit{
    isLoading: boolean = true;
    user: User | null = null;
    isTaskDetailOpen: boolean = false;
    allTasks: any[] = [];
    tasks: any[] = [];
    layout: 'list' | 'grid' = 'list';
    options = ['list', 'grid'];
    selectedEstado: string = '';
    isVoluntario: boolean = false;
    taskId: number = 0;
    dropdownValue:  DropDown | null = null;
    dropdownValues: DropDown[] = [
        { name: 'Todos', value: '' },
        { name: 'Pendiente', value: 'Pendiente' },
        { name: 'En Proceso', value: 'En Proceso' },
        { name: 'En Revisión', value: 'En Revisión' },
        { name: 'Denegada', value: 'Denegada' },
        { name: 'Completada', value: 'Completada' },
        { name: 'Entregado', value: 'Entregado' },
        
    ];

    constructor(private orderService: OrderService, 
      private authService: AuthService, 
      private orderManagmentService: OrderManagmentService,
      private router: Router,
      private toastService: ToastService
    ) {
    }


    ngOnInit(): void {
        this.isVoluntario = this.authService.hasRole('Voluntario');
        this.user = this.authService.getUserSync();
        const validLoadTasks = this.isVoluntario;
        
        if(validLoadTasks){
            this.loadTasks();
        }
    }

    async loadTasks(): Promise<void> {
        this.isLoading = true;
    
        const selectedState = this.dropdownValue?.value || '';
        const request = selectedState
            ? this.orderManagmentService.getOrdersByState(selectedState)
            : this.orderService.getOrders();
    
        await request.subscribe({
            next: (data: any[]) => {
                this.allTasks = data;
                this.tasks = [...data];

            if (this.isVoluntario) {
                this.tasks = this.tasks.filter(task => 
                    task.VoluntarioId === this.user?.id
                );
            }
                this.isLoading = false;
            },
            error: error => {
                this.toastService.showError('Error al obtener las tareas');
                console.error('Error al obtener las tareas:', error);
                this.isLoading = false;
            }
        });
    }

    searchTasks(event: Event): void {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.tasks = this.allTasks.filter(task =>
            task.name.toLowerCase().includes(query)
        );
    }

    getSeverity(task: any): string {
        switch (task.status) {
            case 'En Proceso':
                return 'help';
            case 'En Revisión':
                return 'warn';
            case 'Completada':
                return 'success';
            case 'Validada':
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

    onShowTaskDetail(taskId: number) {
        this.taskId = taskId;
        this.isTaskDetailOpen = !this.isTaskDetailOpen;
    }

    handleTaskDeletion(taskId: number): void {
        this.isTaskDetailOpen = false;
        this.tasks = this.tasks.filter(task => task.id !== taskId);
      }
}