import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { AuthService } from '../../../services/auth/auth.service';
import { OrderManagmentService } from '../../../services/order-managment/orderManagment.service';
import { OrderService } from '../../../services/order/order.service';
import { SelectModule } from 'primeng/select';
import { DropDown } from '../../../types/dropDown';
import { Router, RouterModule } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../../types/user.interface';
import { ToastService } from '../../../services/toast/toast.service';
import { DialogModule } from 'primeng/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { UserRoleService } from '../../../services/user-role/userRole.service';
import { lastValueFrom } from 'rxjs';
import { OrderStatus } from '../../../types/orderStatus.type';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { CardTaskComponent } from '../ui/card-task/card-task.component';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-tasks-component',
    standalone: true,
    imports: [CommonModule, RouterModule, DataViewModule, FormsModule, ButtonModule,SelectModule, ToolbarModule, IconFieldModule, InputIconModule,
    SplitButtonModule, InputGroupModule, InputTextModule, DialogModule,TaskDetailComponent, ToggleSwitch, CardTaskComponent, CardModule
],
    templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit{
    isLoading: boolean = true;
    user: User | null = null;
    isTaskDetailOpen: boolean = false;
    allTasks: any[] = [];
    tasks: any[] = [];
    layout: 'list' | 'grid' = 'list';
    options = ['list', 'grid'];
    selectedEstado: string = '';
    isRevisor: boolean = false;
    isVoluntario: boolean = false;
    isBibliotecario: boolean = false;
    isAlumno: boolean = false;
    taskId: number = 0;
    showOnlyPriority: boolean = false;
    stateOptions = [
        { label: 'Todas', value: false },
        { label: 'Prioritarias', value: true }
    ];
    value: string = 'off';
    dropdownValue:  DropDown | null = null;
    dropdownValues: { name: string; value: OrderStatus }[] = Object.values(OrderStatus).map(status => ({
        name: status, 
        value: status
    }));
    checked: boolean = false;

    constructor(private orderService: OrderService, 
        private authService: AuthService, 
        private orderManagmentService: OrderManagmentService,
        private router: Router,
        private toastService: ToastService,
        private userRoleService: UserRoleService,
    ) {}

    ngOnInit(): void {
        this.isRevisor = this.userRoleService.isRevisor();
        this.isVoluntario = this.userRoleService.isVoluntario();
        this.isBibliotecario = this.userRoleService.isBibliotecario();
        this.isAlumno = this.userRoleService.isAlumno();
        this.user = this.authService.getUserSync();
    
        const validLoadTasks = this.isRevisor || this.isVoluntario || this.isBibliotecario;
        validLoadTasks ? this.loadTasks() : this.loadTasksDelivered();
    }

    async loadTasks(): Promise<void> {
        this.isLoading = true;

        try {
            const selectedState = this.dropdownValue?.value || '';
            const request = selectedState 
            ? this.orderManagmentService.getOrdersByState(selectedState) 
            : this.orderService.getOrders();

            const data = await lastValueFrom(request);
            this.allTasks = data;
            this.tasks = [...data];

            this.tasks = this.filterTasksByRole(data);

        } catch (error) {
            this.toastService.showError('Error al obtener las tareas');
            console.error('Error al obtener las tareas:', error);
        } finally {
            this.isLoading = false;
        }
    }

    private filterTasksByRole(tasks: any[]): any[] {
        if (this.isVoluntario) {
            return tasks.filter(task => task.status.toLowerCase() === 'pendiente')
                        .sort((a, b) => a.prioridad - b.prioridad);
        } 
        if (this.isRevisor) {
            return tasks.filter(task => task.status.toLowerCase() === 'en revisión')
                        .sort((a, b) => a.prioridad - b.prioridad);
        }
        return [...tasks];
    }

    async loadTasksDelivered(): Promise<void> {
        this.isLoading = true;

        await this.orderService.getOrdersDelivered().subscribe({
            next: (data: any[]) => {
                this.allTasks = data;
                this.tasks = [...data];
                console.log(data);
                this.isLoading = false;
            },
            error: error => {
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

    togglePriorityFilter() {
        this.tasks = this.value 
            ? this.allTasks.filter(task => task.isPriority && this.canUserSeeTask(task))
            : this.allTasks.filter(task => this.canUserSeeTask(task));
    }
    
    canUserSeeTask(task: any): boolean {
        if (this.isVoluntario) return task.status.toLowerCase() === 'pendiente';
        if (this.isRevisor) return task.status.toLowerCase() === 'en revisión';
        if (this.isBibliotecario) return task.createdByUserId === this.user?.id;
        if (this.isAlumno) return task.alumnoId === this.user?.id;
        return false;
    }

    newTask() {
        this.router.navigate(['/wirin/add-task-form']);
    }

    onShowTaskDetail(taskId: number) {
        this.taskId = taskId;
        this.isTaskDetailOpen = true;
    }

    handleTaskDeletion(taskId: number): void {
        this.isTaskDetailOpen = false;
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }
}