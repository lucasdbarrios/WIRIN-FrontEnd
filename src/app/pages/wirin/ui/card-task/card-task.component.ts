import { Component, EventEmitter, Input, Output } from '@angular/core';
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

export class CardTaskComponent {
    @Input() task: any;
    @Input() showCheckbox: boolean = false;
    @Output() taskSelectionChange = new EventEmitter<boolean>();
    @Output() showTaskDetail = new EventEmitter<number>();

    getSeverity(status: string): string {
        return getSeverity(status);
    }
}