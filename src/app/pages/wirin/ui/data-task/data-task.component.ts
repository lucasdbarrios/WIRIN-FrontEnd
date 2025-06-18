import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-data-task',
    templateUrl: './data-task.component.html',
    imports: [CommonModule],
})

export class DataTaskComponent {
    @Input() label!: string;
    @Input() value!: number | string;
    @Input() bgClass!: string;
    @Input() iconClass!: string;
}