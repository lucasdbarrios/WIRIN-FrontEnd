import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FormsModule } from '@angular/forms';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../services/auth/auth.service';
import { OrderService } from '../../services/order/order.service';
import { TagModule } from 'primeng/tag';
import { MessageService } from '../../services/message/message.service';
import { BadgeModule } from 'primeng/badge';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, TagModule, CalendarModule, OverlayPanelModule, FormsModule, BadgeModule],
    template: ` <div class="layout-topbar" style="display: flex; align-items: center; justify-content: center;">
    <div class="layout-topbar-logo-container" style="position: absolute; left: 1rem;">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>
        <div class="flex gap-2 hidden xs:hidden md:flex sm:flex lg:flex">
            <p-tag *ngFor="let role of userRoles" [value]="role" severity="info"></p-tag>
        </div>
    </div>

    <a class="layout-topbar-logo" routerLink="/" style="display: flex; flex-direction: column; align-items: center;">
    <img [src]="layoutService.isDarkTheme() ? 'logo/wirin-white.png' : 'logo/wirin.png'" alt="Logo" width="54" />
        
    </a>

    <div class="layout-topbar-actions" style="position: absolute; right: 1rem; display: flex; gap: 1rem;">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <app-configurator />
            
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" (click)="calendarOverlay.toggle($event)">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action" (click)="router.navigate(['/wirin/messages'])" style="position: relative;">
                        <i class="pi pi-inbox"></i>
                        <span class="p-badge p-badge-danger p-badge-dot" 
                              *ngIf="unreadMessagesCount > 0" 
                              style="position: absolute; top: -5px; right: 8px; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">
                            {{ unreadMessagesCount }}
                        </span>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action" (click)="goToProfile()">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <button type="button" class="layout-topbar-action" (click)="logout()">
                        <i class="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Overlay Panel para el calendario -->
    <p-overlayPanel #calendarOverlay>
        <div class="calendar-container" style="width: 400px; padding: 1rem;">
            <!-- En el template, dentro del calendario container -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #333;">Calendario de Tareas</h4>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" 
                            class="p-button-text p-button-plain" 
                            style="border: none; background: none; cursor: pointer; padding: 0.25rem;"
                            (click)="refreshTasksFromAPI()"
                            title="Actualizar datos">
                        <i class="pi pi-refresh" style="font-size: 1rem; color: #666;"></i>
                    </button>
                    <button type="button" 
                            class="p-button-text p-button-plain" 
                            style="border: none; background: none; cursor: pointer; padding: 0.25rem;"
                            (click)="calendarOverlay.hide()">
                        <i class="pi pi-times" style="font-size: 1.2rem; color: #666;"></i>
                    </button>
                </div>
            </div>
            
            <!-- Calendario con indicadores personalizados -->
            <div class="custom-calendar" style="position: relative;">
                <p-calendar 
                    [(ngModel)]="selectedDate" 
                    [inline]="true" 
                    dateFormat="dd/mm/yy"
                    (onSelect)="onDateSelect($event)"
                    (onMonthChange)="onMonthChange($event)"
                    (onYearChange)="onYearChange($event)"
                    [locale]="esLocale"
                    [style]="{'width': '100%'}">
                </p-calendar>
                
                <!-- CSS personalizado para los indicadores -->
                <style>
                    .custom-calendar {
                        position: relative;
                        z-index: 1000;
                    }
                    
                    .custom-calendar ::ng-deep .p-datepicker-calendar td {
                        position: relative;
                    }
                    
                    .custom-calendar ::ng-deep .p-datepicker-calendar td.has-tasks::after {
                        content: attr(data-task-count);
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        background-color: #ff4444;
                        color: white;
                        border-radius: 50%;
                        width: 18px;
                        height: 18px;
                        font-size: 11px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        z-index: 1002;
                        pointer-events: none;
                    }
                    
                    /* Asegurar que el indicador sea visible en temas oscuros */
                    .layout-dark .custom-calendar ::ng-deep .p-datepicker-calendar td.has-tasks::after {
                        background-color: #ff6b6b;
                        box-shadow: 0 2px 4px rgba(255,255,255,0.2);
                    }
                    
                    /* Mejorar la visibilidad en días seleccionados */
                    .custom-calendar ::ng-deep .p-datepicker-calendar td.p-highlight.has-tasks::after {
                        background-color: #ff2222;
                        border: 1px solid white;
                    }
                    
                    /* Asegurar que el overlay panel tenga el z-index correcto */
                    .p-overlaypanel {
                        z-index: 1100 !important;
                    }
                    
                    /* Mejorar el contenedor del calendario */
                    .calendar-container {
                        position: relative;
                        z-index: 1000;
                        background: white;
                        border-radius: 8px;
                    }
                </style>
            </div>
            
            <!-- Lista de tareas para la fecha seleccionada -->
            <div *ngIf="selectedDate && getTasksForSelectedDate().length > 0" 
                 style="margin-top: 1.5rem; max-height: 250px; overflow-y: auto; border-top: 1px solid #eee; padding-top: 1rem; position: relative; z-index: 1001; background: white; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h5 style="margin: 0; color: #333;">Tareas para {{ formatDate(selectedDate) }}:</h5>
                    <button type="button" 
                            class="p-button-text p-button-plain" 
                            style="border: none; background: none; cursor: pointer; padding: 0.25rem; color: #666;"
                            (click)="clearSelectedDate()"
                            title="Cerrar detalle">
                        <i class="pi pi-times" style="font-size: 1rem;"></i>
                    </button>
                </div>
                <div *ngFor="let task of getTasksForSelectedDate()" 
                     style="padding: 0.75rem; margin: 0.5rem 0; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #007ad9; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-weight: bold; font-size: 0.95rem; color: #333; margin-bottom: 0.25rem;">{{ task.name }}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">
                        <span style="background-color: #e3f2fd; padding: 2px 6px; border-radius: 3px;">{{ task.status }}</span>
                    </div>
                    <div *ngIf="task.assignedUserName" style="font-size: 0.8rem; color: #888;">
                        <i class="pi pi-user" style="margin-right: 4px;"></i>{{ task.assignedUserName }}
                    </div>
                </div>
            </div>
            
            <div *ngIf="selectedDate && getTasksForSelectedDate().length === 0" 
                 style="margin-top: 1.5rem; text-align: center; color: #999; padding: 2rem; border-top: 1px solid #eee; position: relative; z-index: 1001; background: white; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div style="flex: 1;"></div>
                    <button type="button" 
                            class="p-button-text p-button-plain" 
                            style="border: none; background: none; cursor: pointer; padding: 0.25rem; color: #666;"
                            (click)="clearSelectedDate()"
                            title="Cerrar detalle">
                        <i class="pi pi-times" style="font-size: 1rem;"></i>
                    </button>
                </div>
                <i class="pi pi-calendar" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                No hay tareas programadas para esta fecha
            </div>
            
            <!-- Información general -->
            <div style="margin-top: 1rem; padding: 0.75rem; background-color: #f0f8ff; border-radius: 6px; font-size: 0.85rem; color: #666; position: relative; z-index: 1001;">
                <i class="pi pi-info-circle" style="margin-right: 0.5rem;"></i>
                Los números rojos indican la cantidad de tareas con vencimiento en cada día.
            </div>
        </div>
    </p-overlayPanel>`
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    userRoles: string[] = [];
    selectedDate: Date | null = null;
    tasks: any[] = [];
    currentCalendarMonth: number = new Date().getMonth();
    currentCalendarYear: number = new Date().getFullYear();
    unreadMessagesCount: number = 0;
    
    // Propiedades para la optimización
    private updateTimeout: any = null;
    private isUpdating = false;
    
    // Propiedades para caché de tareas
    private readonly TASKS_CACHE_KEY = 'wirin_tasks_cache';
    private readonly CACHE_EXPIRY_KEY = 'wirin_cache_expiry';
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    
    // Propiedades para caché de indicadores
    private taskIndicatorsCache: Map<string, number> = new Map();
    private readonly INDICATORS_CACHE_KEY = 'wirin_calendar_indicators';
    private calendarObserver?: MutationObserver;
    
    // Propiedades para polling de mensajes
    private unreadMessagesInterval: any = null;
    private readonly UNREAD_MESSAGES_POLL_INTERVAL = 30000; // 30 segundos
    
    // Configuración de idioma español para el calendario
    esLocale = {
        firstDayOfWeek: 1,
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        today: 'Hoy',
        clear: 'Limpiar'
    };

    constructor(
        public layoutService: LayoutService,
        public router: Router,
        private authService: AuthService,
        private orderService: OrderService,
        private messageService: MessageService
    ) {
        this.userRoles = this.authService.getCurrentUserRole() || [];
        this.loadTasks();
    }

    ngOnInit() {
        // Cargar mensajes no leídos después de que el componente esté inicializado
        this.loadUnreadMessagesCount();
        this.startUnreadMessagesPolling();
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    goToProfile() {
        this.router.navigate(['/wirin/profile']);
    }
    
    loadTasks() {
        // Primero intentar cargar desde localStorage
        const cachedTasks = this.loadTasksFromCache();
        if (cachedTasks) {
            console.log('Cargando tareas desde caché');
            this.tasks = cachedTasks;
            this.scheduleIndicatorUpdateOptimized();
            return;
        }
        
        // Si no hay caché válido, cargar desde API
        console.log('Cargando tareas desde API');
        this.orderService.getOrdersWithAutoRefresh().subscribe({
            next: (tasks) => {
                this.tasks = tasks.filter(task => task.limitDate);
                // Guardar en localStorage
                this.saveTasksToCache(this.tasks);
                this.scheduleIndicatorUpdateOptimized();
            },
            error: (error) => {
                console.error('Error al cargar tareas:', error);
                // En caso de error, intentar usar caché expirado como fallback
                const expiredCache = this.loadTasksFromCache(true);
                if (expiredCache) {
                    console.log('Usando caché expirado como fallback');
                    this.tasks = expiredCache;
                    this.scheduleIndicatorUpdateOptimized();
                }
            }
        });
    }
    
    private saveTasksToCache(tasks: any[]): void {
        try {
            const now = new Date().getTime();
            const expiryTime = now + this.CACHE_DURATION;
            
            localStorage.setItem(this.TASKS_CACHE_KEY, JSON.stringify(tasks));
            localStorage.setItem(this.CACHE_EXPIRY_KEY, expiryTime.toString());
            
            console.log(`Tareas guardadas en caché. Expira en ${this.CACHE_DURATION / 60000} minutos`);
        } catch (error) {
            console.warn('Error al guardar tareas en localStorage:', error);
        }
    }
    
    private loadTasksFromCache(ignoreExpiry: boolean = false): any[] | null {
        try {
            const cachedTasks = localStorage.getItem(this.TASKS_CACHE_KEY);
            const expiryTime = localStorage.getItem(this.CACHE_EXPIRY_KEY);
            
            if (!cachedTasks || (!ignoreExpiry && !expiryTime)) {
                return null;
            }
            
            // Verificar si el caché ha expirado
            if (!ignoreExpiry && expiryTime) {
                const now = new Date().getTime();
                const expiry = parseInt(expiryTime);
                
                if (now > expiry) {
                    console.log('Caché de tareas expirado');
                    this.clearTasksCache();
                    return null;
                }
            }
            
            const tasks = JSON.parse(cachedTasks);
            console.log(`Tareas cargadas desde caché: ${tasks.length} elementos`);
            return tasks;
            
        } catch (error) {
            console.warn('Error al cargar tareas desde localStorage:', error);
            this.clearTasksCache();
            return null;
        }
    }
    
    private clearTasksCache(): void {
        try {
            localStorage.removeItem(this.TASKS_CACHE_KEY);
            localStorage.removeItem(this.CACHE_EXPIRY_KEY);
            console.log('Caché de tareas limpiado');
        } catch (error) {
            console.warn('Error al limpiar caché:', error);
        }
    }
    
    // Método para forzar actualización desde API (útil para botón de refresh)
    refreshTasksFromAPI(): void {
        console.log('Forzando actualización desde API');
        this.clearTasksCache();
        this.loadTasks();
    }
    
    // Método para limpiar caché cuando el usuario hace logout
    logout(): void {
        this.clearTasksCache();
        localStorage.removeItem(this.INDICATORS_CACHE_KEY);
        this.taskIndicatorsCache.clear();
        this.stopUnreadMessagesPolling();
        this.authService.logout();
    }
    
    private scheduleIndicatorUpdateOptimized() {
        // Cancelar timeout anterior si existe
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        // Evitar múltiples actualizaciones simultáneas
        if (this.isUpdating) {
            return;
        }
        
        // Programar una sola actualización con debounce
        this.updateTimeout = setTimeout(() => {
            this.updateTaskIndicatorsOptimized();
        }, 300);
    }
    
    onMonthChange(event: any) {
        this.currentCalendarMonth = event.month;
        this.currentCalendarYear = event.year;
        // Usar el método optimizado
        this.scheduleIndicatorUpdateOptimized();
    }
    
    onYearChange(event: any) {
        this.currentCalendarYear = event.year;
        // Usar el método optimizado
        this.scheduleIndicatorUpdateOptimized();
    }
    
    onDateSelect(date: Date) {
        this.selectedDate = date;
        // Guardar los indicadores antes de que se pueda perder el estado
        this.saveCurrentIndicators();
    }
    
    updateTaskIndicatorsOptimized() {
        if (this.isUpdating) {
            return;
        }
        
        this.isUpdating = true;
        console.log('Actualizando indicadores...');
        console.log('Mes actual:', this.currentCalendarMonth, 'Año actual:', this.currentCalendarYear);
        
        try {
            const calendarCells = document.querySelectorAll('.custom-calendar .p-datepicker-calendar td');
            console.log('Celdas encontradas:', calendarCells.length);
            
            if (calendarCells.length === 0) {
                setTimeout(() => {
                    this.isUpdating = false;
                    this.scheduleIndicatorUpdateOptimized();
                }, 500);
                return;
            }
            
            // Limpiar caché de indicadores para el mes actual
            this.taskIndicatorsCache.clear();
            
            calendarCells.forEach((cell, index) => {
                const dayElement = cell.querySelector('span');
                if (dayElement && dayElement.textContent) {
                    const day = parseInt(dayElement.textContent);
                    if (!isNaN(day)) {
                        const currentDate = new Date(this.currentCalendarYear, this.currentCalendarMonth, day);
                        const taskCount = this.getTaskCountForDate(currentDate);
                        
                        // Crear clave única para el día
                        const dayKey = `${this.currentCalendarYear}-${this.currentCalendarMonth}-${day}`;
                        
                        console.log(`Día ${day}: ${taskCount} tareas`);
                        
                        if (taskCount > 0) {
                            // Guardar en caché
                            this.taskIndicatorsCache.set(dayKey, taskCount);
                            
                            // Aplicar indicador
                            cell.classList.add('has-tasks');
                            cell.setAttribute('data-task-count', taskCount.toString());
                            console.log(`Agregando indicador para día ${day} con ${taskCount} tareas`);
                        } else {
                            cell.classList.remove('has-tasks');
                            cell.removeAttribute('data-task-count');
                        }
                    }
                }
            });
            
            // Guardar indicadores en localStorage
            this.saveIndicatorsToLocalStorage();
            
        } finally {
            this.isUpdating = false;
        }
    }
    
    private saveCurrentIndicators(): void {
        const calendarCells = document.querySelectorAll('.custom-calendar .p-datepicker-calendar td.has-tasks');
        
        calendarCells.forEach(cell => {
            const dayElement = cell.querySelector('span');
            const taskCount = cell.getAttribute('data-task-count');
            
            if (dayElement && dayElement.textContent && taskCount) {
                const day = parseInt(dayElement.textContent);
                if (!isNaN(day)) {
                    const dayKey = `${this.currentCalendarYear}-${this.currentCalendarMonth}-${day}`;
                    this.taskIndicatorsCache.set(dayKey, parseInt(taskCount));
                }
            }
        });
        
        this.saveIndicatorsToLocalStorage();
    }
    
    private restoreTaskIndicators(): void {
        // Cargar indicadores desde localStorage si no están en memoria
        if (this.taskIndicatorsCache.size === 0) {
            this.loadIndicatorsFromLocalStorage();
        }
        
        const calendarCells = document.querySelectorAll('.custom-calendar .p-datepicker-calendar td');
        
        calendarCells.forEach(cell => {
            const dayElement = cell.querySelector('span');
            if (dayElement && dayElement.textContent) {
                const day = parseInt(dayElement.textContent);
                if (!isNaN(day)) {
                    const dayKey = `${this.currentCalendarYear}-${this.currentCalendarMonth}-${day}`;
                    const taskCount = this.taskIndicatorsCache.get(dayKey);
                    
                    if (taskCount && taskCount > 0) {
                        cell.classList.add('has-tasks');
                        cell.setAttribute('data-task-count', taskCount.toString());
                        console.log(`Restaurando indicador para día ${day} con ${taskCount} tareas`);
                    }
                }
            }
        });
    }
    
    private saveIndicatorsToLocalStorage(): void {
        try {
            const indicatorsObj = Object.fromEntries(this.taskIndicatorsCache);
            localStorage.setItem(this.INDICATORS_CACHE_KEY, JSON.stringify(indicatorsObj));
            console.log('Indicadores guardados en localStorage');
        } catch (error) {
            console.warn('Error al guardar indicadores en localStorage:', error);
        }
    }
    
    private loadIndicatorsFromLocalStorage(): void {
        try {
            const stored = localStorage.getItem(this.INDICATORS_CACHE_KEY);
            if (stored) {
                const indicatorsObj = JSON.parse(stored);
                this.taskIndicatorsCache = new Map(Object.entries(indicatorsObj).map(([key, value]) => [key, Number(value)]));
                console.log('Indicadores cargados desde localStorage');
            }
        } catch (error) {
            console.warn('Error al cargar indicadores desde localStorage:', error);
            this.taskIndicatorsCache.clear();
        }
    }
    
    getTaskCountForDate(date: Date): number {
        if (!date || !this.tasks) {
            console.log('No hay fecha o tareas');
            return 0;
        }
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const count = this.tasks.filter(task => {
            if (!task.limitDate) return false;
            
            let taskDate;
            try {
                taskDate = new Date(task.limitDate);
                if (isNaN(taskDate.getTime())) {
                    console.warn('Fecha inválida en tarea:', task.limitDate);
                    return false;
                }
            } catch (error) {
                console.warn('Error al parsear fecha:', task.limitDate, error);
                return false;
            }
            
            taskDate.setHours(0, 0, 0, 0);
            
            const matches = taskDate.getTime() === targetDate.getTime();
            if (matches) {
                console.log(`Tarea encontrada para ${targetDate.toDateString()}:`, task.name);
            }
            
            return matches;
        }).length;
        
        return count;
    }
    
    getTasksForSelectedDate(): any[] {
        if (!this.selectedDate || !this.tasks) return [];
        
        const selectedDateOnly = new Date(this.selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);
        
        return this.tasks.filter(task => {
            if (!task.limitDate) return false;
            
            let taskDate;
            try {
                taskDate = new Date(task.limitDate);
                if (isNaN(taskDate.getTime())) {
                    return false;
                }
            } catch (error) {
                return false;
            }
            
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === selectedDateOnly.getTime();
        });
    }
    
    clearSelectedDate() {
        this.selectedDate = null;
        // Asegurar que los indicadores se mantengan después de cerrar el detalle
        setTimeout(() => {
            this.restoreTaskIndicators();
        }, 100);
    }
    
    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('es-ES', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        }).format(date);
    }
    
    private setupCalendarObserver(): void {
        const calendarContainer = document.querySelector('.custom-calendar');
        
        if (calendarContainer && !this.calendarObserver) {
            this.calendarObserver = new MutationObserver((mutations) => {
                let shouldRestore = false;
                
                mutations.forEach(mutation => {
                    // Fix: Remove the invalid 'subtree' comparison
                    if (mutation.type === 'childList') {
                        const addedNodes = Array.from(mutation.addedNodes);
                        if (addedNodes.some(node => 
                            node.nodeType === Node.ELEMENT_NODE && 
                            (node as Element).querySelector('.p-datepicker-calendar')
                        )) {
                            shouldRestore = true;
                        }
                    }
                });
                
                if (shouldRestore) {
                    setTimeout(() => this.restoreTaskIndicators(), 100);
                }
            });
            
            this.calendarObserver.observe(calendarContainer, {
                childList: true,
                subtree: true
            });
        }
    }
    
    ngAfterViewInit() {
        setTimeout(() => {
            this.setupCalendarObserver();
        }, 1000);
    }
    
    // Métodos para manejar mensajes no leídos
    private loadUnreadMessagesCount(): void {
        this.messageService.getReceivedMessages().subscribe({
            next: (messages) => {
                const unreadMessages = messages.filter(msg => {
                    const isNotRead = msg.isRead === false || msg.isRead === undefined || msg.isRead === null;
                    const isNotDeleted = msg.deleted === false || msg.deleted === undefined || msg.deleted === null;
                    return isNotRead && isNotDeleted;
                });
                this.unreadMessagesCount = unreadMessages.length;
            },
            error: (error) => {
                console.error('Error al cargar mensajes no leídos:', error);
                this.unreadMessagesCount = 0;
            }
        });
    }
    
    private startUnreadMessagesPolling(): void {
        // Limpiar cualquier polling anterior
        this.stopUnreadMessagesPolling();
        
        // Iniciar nuevo polling
        this.unreadMessagesInterval = setInterval(() => {
            this.loadUnreadMessagesCount();
        }, this.UNREAD_MESSAGES_POLL_INTERVAL);
    }
    
    private stopUnreadMessagesPolling(): void {
        if (this.unreadMessagesInterval) {
            clearInterval(this.unreadMessagesInterval);
            this.unreadMessagesInterval = null;
        }
    }

    ngOnDestroy() {
        if (this.calendarObserver) {
            this.calendarObserver.disconnect();
        }
        this.stopUnreadMessagesPolling();
    }
}
