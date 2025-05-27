import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
})

export class ActionButtonComponent {
  @Input() label: string = '';
  @Input() type: string = '';
  @Input() styleEdit: string = '';
  @Input() onActionClick: () => any = () => '';
}
