import { Component } from "@angular/core";
import { FluidModule } from "primeng/fluid";
import { FormTaskComponent } from "../../wirin/ui/form-task/form-task.component";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { OrderService } from "../../../services/order/order.service";
import { Router } from "@angular/router";
import { PopupComponent } from "../ui/popup/popup.component";
import { ToastService } from "../../../services/toast/toast.service";

@Component({
    selector: 'app-form-add-task',
    templateUrl: './form-add-task.component.html',
    standalone: true,
    imports: [FluidModule, FormTaskComponent, PopupComponent]
})
export class AddTaskFormComponent{
    uploadProgress: number = 0;
    uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
    showConfirmPopup: boolean = false;
    formDataToSubmit?: FormData;

    constructor(
        private orderService: OrderService,
        private router: Router,
        private toastService : ToastService
    ) {}

    onFormSubmit(formData: FormData): void {
        this.formDataToSubmit = formData;
        this.showConfirmPopup = true;
    }

    onConfirmSubmit(): void {
        if (!this.formDataToSubmit) return;

        this.uploadStatus = 'uploading';
        this.uploadProgress = 0;

        this.orderService.createOrder(this.formDataToSubmit).subscribe({
            next: (event: any) => {
                if (event.type === HttpEventType.UploadProgress) {
                if (event.total) {
                    this.uploadProgress = Math.round(100 * event.loaded / event.total);
                }
                } else if (event instanceof HttpResponse) {
                    this.uploadStatus = 'success';
                    this.toastService.showSuccess('Tarea creada con éxito');
                    this.router.navigate(['/wirin/tasks']);
                }
            },
        error: (error: any) => {
            console.error('Error al crear la tarea:', error);
            this.uploadStatus = 'error';
            this.toastService.showError('Error al crear la tarea');
        }

        });
    }
}