import { Component } from "@angular/core";
import { FluidModule } from "primeng/fluid";
import { FormUserComponent } from "../ui/form-user/form-user.component";
import { AuthService } from "../../../services/auth.service";
import { Router } from "@angular/router";
import { PopupComponent } from "../ui/popup/popup.component";
import { User } from '../../../types/user.interface';

@Component({
    selector: 'app-form-add-user',
    templateUrl: './form-add-user.component.html',
    standalone: true,
    imports: [FluidModule, FormUserComponent, PopupComponent]
})
export class AddUserFormComponent {
    uploadProgress: number = 0;
    uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
    showConfirmPopup: boolean = false;
    formDataToSubmit?: FormData;


    constructor(
        private authService: AuthService,
        private router: Router
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
                this.router.navigate(['/wirin/users']);
            },
            error: (error) => {
                console.error('Error al registrar el usuario:', error);
                this.uploadStatus = 'error';
            }
        });
    }
}