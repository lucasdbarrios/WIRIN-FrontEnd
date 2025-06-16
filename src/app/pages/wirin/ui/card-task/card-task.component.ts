import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getSeverity } from '../../../../utils/getSeverity';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-card-task',
    standalone: true,
    templateUrl: './card-task.component.html',
    imports: [
        ButtonModule, TagModule, CommonModule, CardModule, FormsModule
    ]
})

export class CardTaskComponent implements OnInit {
    @Input() task: any;
    @Input() showCheckbox: boolean = false;
    @Output() taskSelectionChange = new EventEmitter<boolean>();
    @Output() showTaskDetail = new EventEmitter<number>();
    
    ngOnInit() {
        this.checkDueDate();
    }
    
    getSeverity(status: string): string {
        return getSeverity(status);
    }
    
    checkDueDate() {
        if (this.task && this.task.limitDate) {
            const today = new Date();
            const limitDate = new Date(this.task.limitDate);
            
            // Resetear las horas para comparar solo fechas
            today.setHours(0, 0, 0, 0);
            limitDate.setHours(0, 0, 0, 0);
            
            // Calcular la diferencia en días
            const diffTime = limitDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Si falta 1 día o menos, establecer como prioridad alta
            if (diffDays <= 1) {
                this.task.isPriority = true;
            }

            if (this.task.status === "Completada" || this.task.status === "Entregada") {
                this.task.isPriority = false;
            }
        }
    }
}