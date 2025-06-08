import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormUserComponent } from '../ui/form-user/form-user.component';
import { UserService } from '../../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PopupComponent } from '../ui/popup/popup.component';
import { FluidModule } from 'primeng/fluid';
import { User } from '../../../types/user.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-form-edit-user',
  standalone: true,
  templateUrl: './form-edit-user.component.html',
  imports: [FormUserComponent, CommonModule, PopupComponent, FluidModule],
  providers: [MessageService]
})
export class EditUserComponent implements OnInit {
  userId: string = '';
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  userData: User | null = null;
  showConfirmPopup: boolean = false;
  formDataToSubmit?: FormData;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = params['id'];
        this.loadUserData(this.userId);
      } else {
        this.router.navigate(['/wirin/users']);
      }
    });
  }

  private loadUserData(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.userData = user;
      },
      error: (error) => {
        console.error('Error al cargar el usuario:', error);
        this.router.navigate(['/wirin/users']);
      }
    });
  }

  onFormSubmit(formData: FormData): void {
    this.formDataToSubmit = formData;
    this.showConfirmPopup = true;
  }

  onConfirmSubmit(): void {
    if (!this.userId || !this.formDataToSubmit) return;

    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;

    const updatedUser: User = {
      id: this.userId,
      fullName: this.formDataToSubmit.get('fullName') as string,
      userName: this.formDataToSubmit.get('userName') as string,
      email: this.formDataToSubmit.get('email') as string,
      phoneNumber: this.formDataToSubmit.get('phoneNumber') as string || '',
      roles: JSON.parse(this.formDataToSubmit.get('roles') as string || '[]'),
      password: this.formDataToSubmit.get('password') as string || ''
    };

    this.userService.updateUser(this.userId, updatedUser).subscribe({
      next: () => {
        this.uploadStatus = 'success';
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario actualizado',
          detail: 'El usuario se actualizó correctamente.',
          life: 3000
        });
        this.router.navigate(['/wirin/users']);
      },
      error: () => {
        this.uploadStatus = 'error';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un problema al actualizar el usuario. Intenta nuevamente.',
          life: 3000
        });
      }
    });
  }
}