import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getSeverity } from '../../../../utils/getSeverity';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-card-task',
    standalone: true,
    templateUrl: './card-task.component.html',
    imports: [
        ButtonModule, TagModule, CommonModule, CardModule
    ]
})

export class CardTaskComponent {
    @Input() task: any;
    @Output() showTaskDetail = new EventEmitter<number>();

    getSeverity(status: string): string {
        return getSeverity(status);
    }
}