import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { User } from '../../../../types/user.interface';
import { BackButtonComponent } from '../back-button/back-button.component';
import { PasswordModule } from 'primeng/password';

@Component({
  standalone: true,
  selector: 'app-form-user',
  templateUrl: './form-user.component.html',
  imports: [
    ReactiveFormsModule, ButtonModule, MessageModule, CommonModule, RouterModule, 
    MultiSelectModule, FormsModule, InputTextModule, BackButtonComponent, PasswordModule
  ]
})
export class FormUserComponent{
  @Input() isEditMode: boolean = false;
  @Input() userId: string | null = null;
  @Input() errorMessage: string = '';
  @Output() formSubmitted = new EventEmitter<FormData>();
  
  formUser: FormGroup;
  dropdownRoles: { name: string, value: string }[] = [
    { name: 'Admin', value: 'Admin' },
    { name: 'Bibliotecario', value: 'Bibliotecario' },
    { name: 'Voluntario', value: 'Voluntario' },
    { name: 'Revisor', value: 'Voluntario Administrativo' },
    { name: 'Alumno', value: 'Alumno' },
  ];

  @Input() set userData(data: User) {
    if (data) {
      this.formUser.patchValue({
        fullName: data.fullName,
        userName: data.userName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        roles: data.roles,
      });

      if (this.isEditMode) {
        this.formUser.get('password')?.clearValidators(); 
        this.formUser.get('repeatPassword')?.clearValidators();
        this.formUser.get('password')?.updateValueAndValidity();
        this.formUser.get('repeatPassword')?.updateValueAndValidity();
    }

    }
  }

  constructor(
    private fb: FormBuilder,
      ) { 
        this.formUser = this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        userName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [''],
        roles: [[], Validators.required],
        password: ['', this.isEditMode ? [] : [
          Validators.required, 
          Validators.minLength(6), 
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/)
      ]],      
        repeatPassword: ['', this.isEditMode ? [] : [Validators.required]],
    }, { validator: this.isEditMode ? null : this.matchPasswords });
  }

  matchPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const repeatPassword = group.get('repeatPassword')?.value;
    return password === repeatPassword ? null : { passwordMismatch: true };
}

  onSubmit(): void {
    if (this.formUser.valid) {
        const formData = new FormData();

        formData.append('fullName', this.formUser.get('fullName')?.value);
        formData.append('userName', this.formUser.get('userName')?.value);
        formData.append('email', this.formUser.get('email')?.value);
        formData.append('phoneNumber', this.formUser.get('phoneNumber')?.value || '');
        formData.append('roles', JSON.stringify(this.formUser.get('roles')?.value || []));

        if (!this.isEditMode) {
            formData.append('password', this.formUser.get('password')?.value);
        }

        this.formSubmitted.emit(formData);
    } else {
        Object.keys(this.formUser.controls).forEach(key => {
            const control = this.formUser.get(key);
            if (control?.invalid) {
                control.markAsTouched();
            }
        });
    }
}
}