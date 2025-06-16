import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormTaskComponent } from '../ui/form-task/form-task.component';
import { OrderService } from '../../../services/order/order.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { PopupComponent } from '../ui/popup/popup.component';
import { FluidModule } from 'primeng/fluid';
import { Order } from '../../../types/order.interface';
import { Location } from '@angular/common';
import { ToastService } from '../../../services/toast/toast.service';

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
    private location: Location,
    private toastService: ToastService
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

  private loadTaskData(taskId: number): void {
    this.orderService.getTaskById(taskId).subscribe({
      next: (task) => {
        this.taskData = task;
      },
      error: (error) => {
        this.toastService.showError('Hubo un problema al cargar la tarea');
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
                this.toastService.showSuccess('La tarea se actualizó correctamente');
                this.location.back();
            }
        },
        error: (error) => {
            this.toastService.showError('Hubo un problema al actualizar la tarea');
            console.error('Error al actualizar la tarea:', error);
            this.uploadStatus = 'error';
        }
    });
}
}
