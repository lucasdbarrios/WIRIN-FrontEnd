import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './popup.component.html',
})
export class PopupComponent {
  @Input() title: string = 'Confirmar Acción';
  @Input() question: string = '¿Estás seguro de que deseas realizar esta acción?';
  @Input() isVisible: boolean = false;
  @Input() primaryActionText: string = 'Confirmar';
  @Input() secondaryActionText: string = 'Cancelar';

  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  constructor() { }

  onPrimaryAction(): void {
    this.primaryAction.emit();
    this.closePopup();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
    this.closePopup();
  }

  closePopup(): void {
    this.isVisible = false;
    this.secondaryAction.emit();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isVisible && !target.closest('.popup-content')) {
      this.closePopup();
    }
  }
}