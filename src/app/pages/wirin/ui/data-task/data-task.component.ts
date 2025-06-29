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
}