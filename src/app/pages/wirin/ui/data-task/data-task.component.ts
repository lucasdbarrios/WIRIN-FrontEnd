import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';


@Component({
    selector: 'app-data-task',
    templateUrl: './data-task.component.html',
    imports: [CommonModule, CardModule],
})

export class DataTaskComponent {
    @Input() label!: string;
    @Input() value!: number | string;
    @Input() bgClass!: string;
    @Input() iconClass!: string;

    getValueColorClass(): string {
        const labelLower = this.label.toLowerCase();
        
        if (labelLower.includes('total')) {
            return 'text-blue-600';
        } else if (labelLower.includes('pendientes')) {
            return 'text-orange-600';
        } else if (labelLower.includes('completadas')) {
            return 'text-green-600';
        } else if (labelLower.includes('proceso')) {
            return 'text-yellow-600';
        } else if (labelLower.includes('revisar')) {
            return 'text-purple-600';
        } else if (labelLower.includes('validar')) {
            return 'text-red-600';
        }
        
        return 'text-gray-600';
    }
}