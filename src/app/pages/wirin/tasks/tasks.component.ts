import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { lastValueFrom, Subscription } from 'rxjs';
import { OrderStatus } from '../../../types/orderStatus.type';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { CardTaskComponent } from '../ui/card-task/card-task.component';
import { CardModule } from 'primeng/card';
import { ExpirationDate } from '../../../types/ExpirationDate.type';

@Component({
    selector: 'app-tasks-component',
    standalone: true,
    imports: [CommonModule, RouterModule, DataViewModule, FormsModule, ButtonModule,SelectModule, ToolbarModule, IconFieldModule, InputIconModule,
    SplitButtonModule, InputGroupModule, InputTextModule, DialogModule,TaskDetailComponent, ToggleSwitch, CardTaskComponent, CardModule
],
    templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit, OnDestroy {
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
    value: boolean = false;
    dropdownValue:  DropDown | null = null;
    dropdownValues: { name: string; value: OrderStatus }[] = Object.values(OrderStatus).map(status => ({
        name: status, 
        value: status
    }));
    dropdownDate:  DropDown | null = null;
    dropdownDates: { name: string; value: ExpirationDate }[] = Object.values(ExpirationDate).map(date => ({
        name: date,
        value: date
      }));
    checked: boolean = false;
    filteredTasksBase: any[] = [];

    // Suscripciones para gestionar la limpieza al destruir el componente
    private subscriptions: Subscription[] = [];
    
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
        validLoadTasks ? this.loadTasksWithAutoRefresh() : this.loadTasksDeliveredWithAutoRefresh();
    }
    
    ngOnDestroy(): void {
        // Cancelar todas las suscripciones al destruir el componente
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    // Método original para cargar tareas (se mantiene para compatibilidad)
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
            this.tasks = this.filterTasksByExpirationDate(this.tasks);
            this.togglePriorityFilter();
        } catch (error) {
            this.toastService.showError('Error al obtener las tareas');
            console.error('Error al obtener las tareas:', error);
        } finally {
            this.isLoading = false;
        }
    }

    // Nuevo método que utiliza auto-refresh para actualizar las tareas cada minuto
    loadTasksWithAutoRefresh(): void {
        this.isLoading = true;
        
        const selectedState = this.dropdownValue?.value || '';
        const observable = selectedState 
            ? this.orderManagmentService.getOrdersByStateWithAutoRefresh(selectedState) 
            : this.orderService.getOrdersWithAutoRefresh();
            
        const subscription = observable.subscribe({
            next: (data: any[]) => {
                this.allTasks = data;
                this.filteredTasksBase = this.filterTasksByExpirationDate(this.filterTasksByRole(data));
                this.togglePriorityFilter();
                this.isLoading = false;
            },
            error: error => {
                this.toastService.showError('Error al obtener las tareas');
                console.error('Error al obtener las tareas:', error);
                this.isLoading = false;
            }
        });
        
        this.subscriptions.push(subscription);
    }

    applyAllFilters(): void {
        const filtradas = this.filterTasksByExpirationDate(
            this.filterTasksByRole(this.allTasks)
        );
        this.filteredTasksBase = filtradas;
        this.togglePriorityFilter();
    }

    private filterTasksByExpirationDate(tasks: any[]): any[] {
    const selectedDate = this.dropdownDate?.value;
    if (!selectedDate) return tasks;

    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const filtradas = tasks.filter(task => {
        if (!task.limitDate) return false;

        const vencimiento = new Date(task.limitDate);
        const vencimientoSinHora = new Date(vencimiento.getFullYear(), vencimiento.getMonth(), vencimiento.getDate());

        switch (selectedDate) {
        case ExpirationDate.Hoy:
            return vencimientoSinHora.getTime() === hoySinHora.getTime();

        case ExpirationDate.Proximos7Dias:
            const limite = new Date(hoySinHora);
            limite.setDate(hoySinHora.getDate() + 7);
            return vencimientoSinHora >= hoySinHora && vencimientoSinHora <= limite;

        case ExpirationDate.EsteMes:
            return vencimiento.getMonth() === hoy.getMonth() && vencimiento.getFullYear() === hoy.getFullYear();

        case ExpirationDate.ProximoMes:
            const proximoMes = new Date(hoy);
            proximoMes.setMonth(hoy.getMonth() + 1);
            return vencimiento.getMonth() === proximoMes.getMonth() && vencimiento.getFullYear() === proximoMes.getFullYear();

        case ExpirationDate.Vencidas:
            return vencimientoSinHora < hoySinHora;

        default:
            return true;
        }
    });
    return filtradas;
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

    // Método original para cargar tareas entregadas (se mantiene para compatibilidad)
    async loadTasksDelivered(): Promise<void> {
        this.isLoading = true;

        await this.orderService.getOrdersDelivered().subscribe({
            next: (data: any[]) => {
                this.allTasks = data;
                this.tasks = [...data];

                this.isLoading = false;
            },
            error: error => {
                console.error('Error al obtener las tareas:', error);
                this.isLoading = false;
            }
        });
    }
    
    // Nuevo método que utiliza auto-refresh para actualizar las tareas entregadas cada minuto
    loadTasksDeliveredWithAutoRefresh(): void {
        this.isLoading = true;
        
        const subscription = this.orderService.getOrdersDeliveredWithAutoRefresh().subscribe({
            next: (data: any[]) => {
                this.allTasks = data;
                this.tasks = [...data];
                this.isLoading = false;
            },
            error: error => {
                this.toastService.showError('Error al obtener las tareas');
                console.error('Error al obtener las tareas:', error);
                this.isLoading = false;
            }
        });
        
        this.subscriptions.push(subscription);
    }

    searchTasks(event: Event): void {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.tasks = this.filteredTasksBase.filter(task =>
            task.name.toLowerCase().includes(query)
        );
    }

    togglePriorityFilter(): void {
        const onlyPriority = this.value;
        this.tasks = onlyPriority
            ? this.filteredTasksBase.filter(task => task.isPriority)
            : [...this.filteredTasksBase];
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