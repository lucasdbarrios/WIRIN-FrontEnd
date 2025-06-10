import { Component } from "@angular/core";
import { FluidModule } from "primeng/fluid";
import { FormUserComponent } from "../ui/form-user/form-user.component";
import { AuthService } from "../../../services/auth.service";
import { Router } from "@angular/router";
import { PopupComponent } from "../ui/popup/popup.component";
import { User } from '../../../types/user.interface';
import { HttpErrorResponse } from "@angular/common/http";
import { MessageService } from "primeng/api";
import { ToastService } from "../../../services/toast.service";

@Component({
    selector: 'app-form-add-user',
    templateUrl: './form-add-user.component.html',
    standalone: true,
    imports: [FluidModule, FormUserComponent, PopupComponent],
    providers: [MessageService]
})
export class AddUserFormComponent {
    uploadProgress: number = 0;
    uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
    showConfirmPopup: boolean = false;
    formDataToSubmit?: FormData;
    errorMessage: any;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private toastService: ToastService
    ) {}

    onFormSubmit(formData: FormData): void {
        this.formDataToSubmit = formData;
        this.showConfirmPopup = true;
    }

    onConfirmSubmit(): void {
        if (!this.formDataToSubmit) return;
    
        this.uploadStatus = 'uploading';
        this.uploadProgress = 0;
    
        const newUser: User = {
            fullName: this.formDataToSubmit.get('fullName') as string,
            userName: this.formDataToSubmit.get('userName') as string,
            email: this.formDataToSubmit.get('email') as string,
            phoneNumber: this.formDataToSubmit.get('phoneNumber') as string || '',
            password: this.formDataToSubmit.get('password') as string,
            roles: JSON.parse(this.formDataToSubmit.get('roles') as string || '[]'),
        };
    
        this.authService.register(newUser).subscribe({
            next: () => {
                this.uploadStatus = 'success';
                this.toastService.showSuccess('El usuario ha sido registrado correctamente');
                this.router.navigate(['/wirin/users']);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error al registrar el usuario:', error);
        
                if (error.status === 400 && error.error?.message) {
                    this.errorMessage = error.error.message;
                } else {
                    this.errorMessage = 'Ocurrió un error inesperado.';
                }
        
                this.uploadStatus = 'error';
                this.toastService.showError(this.errorMessage);
            }
        });
    }
}