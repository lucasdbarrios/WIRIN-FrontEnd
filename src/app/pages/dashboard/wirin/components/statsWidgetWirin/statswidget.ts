import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../../../types/order.interface';

@Component({
    standalone: true,
    selector: 'app-stats-widget-wirin',
    imports: [CommonModule],
    template: `<div *ngFor="let stat of taskStats" class="col-span-12 lg:col-span-6 xl:col-span-3">
    <div class="card mb-0">
        <div class="flex justify-between mb-4">
            <div>
                <span class="block text-muted-color font-medium mb-4">{{ stat.label }}</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stat.value }}</div>
            </div>
            <div class="flex items-center justify-center" [ngClass]="stat.bgClass" style="width: 2.5rem; height: 2.5rem">
                <i [ngClass]="stat.iconClass"></i>
            </div>
        </div>
    </div>
</div>`
})
export class WirinStatsWidget implements OnChanges {
    @Input() tasks: Order[] = [];
    @Input() volunteers: number = 0;
    taskPend: number = 0;
    tasksCompleted: number = 0;
    tasksInProgress: number = 0;
    tasksInReview: number = 0;
    tasksToValidate: number = 0;
    taskStats = [
        { label: 'Total tareas', value: this.tasks.length, bgClass: 'bg-blue-100 dark:bg-blue-400/10', iconClass: 'pi pi-list text-blue-500 !text-xl' },
        { label: 'Tareas pendientes', value: this.taskPend, bgClass: 'bg-orange-100 dark:bg-orange-400/10', iconClass: 'pi pi-clock text-orange-500 !text-xl' },
        { label: 'Tareas en proceso', value: this.tasksInProgress, bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
        { label: 'Tareas para revisar', value: this.tasksInReview, bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
        { label: 'Tareas para validar', value: this.tasksToValidate, bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
        { label: 'Tareas completadas', value: this.tasksCompleted, bgClass: 'bg-green-100 dark:bg-green-400/10', iconClass: 'pi pi-check-circle text-green-500 !text-xl' }
      ];
    ngOnChanges(changes: SimpleChanges) {
        if (changes['tasks'] && changes['tasks'].currentValue.length > 0) { 
            this.updateTaskCounts();
          }
        
      }
    
      updateTaskCounts() {
        this.taskPend = this.tasks.filter(t => t.status !== "Pendiente").length;
        this.tasksCompleted = this.tasks.filter(t => t.status === "Completada").length;
        this.tasksInProgress = this.tasks.filter(t => t.status === "En Proceso").length;
        this.tasksInReview = this.tasks.filter(t => t.status === "En Revisión").length;
        this.tasksToValidate = this.tasks.filter(t => t.status === "Aprobada").length;
      
        // Actualiza dinámicamente la lista de estadísticas
        this.taskStats = [
          { label: 'Total tareas', value: this.tasks.length, bgClass: 'bg-blue-100 dark:bg-blue-400/10', iconClass: 'pi pi-list text-blue-500 !text-xl' },
          { label: 'Tareas pendientes', value: this.taskPend, bgClass: 'bg-orange-100 dark:bg-orange-400/10', iconClass: 'pi pi-clock text-orange-500 !text-xl' },
          { label: 'Tareas en proceso', value: this.tasksInProgress, bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
          { label: 'Tareas para revisar', value: this.tasksInReview, bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
          { label: 'Tareas para validar', value: this.tasksToValidate, bgClass: 'bg-cyan-100 dark:bg-cyan-400/10', iconClass: 'pi pi-users text-cyan-500 !text-xl' },
          { label: 'Tareas completadas', value: this.tasksCompleted, bgClass: 'bg-green-100 dark:bg-green-400/10', iconClass: 'pi pi-check-circle text-green-500 !text-xl' }
        ];
      }
}
