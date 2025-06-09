import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormTaskComponent } from '../ui/form-task/form-task.component';
import { OrderService } from '../../../services/order.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { PopupComponent } from '../ui/popup/popup.component';
import { FluidModule } from 'primeng/fluid';
import { Order } from '../../../types/order.interface';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';

@Component({
  selector: 'app-form-edit-task',
  standalone: true,
  templateUrl: './form-edit-task.component.html',
  imports: [FormTaskComponent, CommonModule, PopupComponent, FluidModule],
})
export class EditTaskComponent implements OnInit {
  taskId: string | null = null;
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  taskData: Order | null = null;
  showConfirmPopup: boolean = false;
  formDataToSubmit?: FormData;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.taskId = params['id'];
        this.loadTaskData(Number(this.taskId));
      } else {
        this.router.navigate(['/wirin/tasks']);
      }
    });
  }

  show() {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 });
}

  private loadTaskData(taskId: number): void {
    this.orderService.getTaskById(taskId).subscribe({
      next: (task) => {
        this.taskData = task;
      },
      error: (error) => {
        console.error('Error al cargar la tarea:', error);
        this.router.navigate(['/wirin/tasks']);
      }
    });
  }

  onFormSubmit(formData: FormData): void {
    this.formDataToSubmit = formData;
    this.showConfirmPopup = true;
  }

  onConfirmSubmit(): void {
    if (!this.taskId || !this.formDataToSubmit) return;

    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;

    this.orderService.updateOrder(Number(this.taskId), this.formDataToSubmit).subscribe({
        next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
                if (event.total) {
                    this.uploadProgress = Math.round(100 * event.loaded / event.total);
                }
            } else if (event instanceof HttpResponse) {
                this.uploadStatus = 'success';
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Éxito', 
                    detail: 'La tarea se actualizó correctamente', 
                    life: 3000 
                });
                this.location.back();
          
            }
        },
        error: (error) => {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Hubo un problema al actualizar la tarea', 
                life: 3000 
            });
            console.error('Error al actualizar la tarea:', error);
            this.uploadStatus = 'error';
        }
    });
}
}
