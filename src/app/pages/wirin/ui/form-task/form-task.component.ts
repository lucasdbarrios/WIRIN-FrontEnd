import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { DropDown } from '../../../../types/dropDown';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { UserService } from '../../../../services/user.service';
import { Order } from '../../../../types/order.interface';
import { MessageModule } from 'primeng/message';
import { BackButtonComponent } from '../back-button/back-button.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  imports: [ReactiveFormsModule, ButtonModule, MessageModule, CommonModule, RouterModule, 
    SelectModule, FormsModule, InputTextModule, TextareaModule, DatePickerModule, FileUploadModule, BackButtonComponent]
})
export class FormTaskComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Input() taskId: string | null = null;
  @Output() formSubmitted = new EventEmitter<FormData>();
  formTask: FormGroup;
  selectedFile: File | null = null;
  currentFileName: string = '';
  calendarValue: Date | null = null;
  uploadedFiles: any[] = [];
  uploadStatus: string = '';
  uploadProgress: number = 0;
  existingFile: string = '';
  dropdownItemsSubjects: DropDown[] = [
    { name: 'Matemáticas', value: 'Matemáticas' },
    { name: 'Historia', value: 'Historia' },
    { name: 'Ciencias', value: 'Ciencias' },
    { name: 'Lengua', value: 'Lengua' },
    { name: 'Geografía', value: 'Geografía' },
    { name: 'Arte', value: 'Arte' },
    { name: 'Educación Física', value: 'Educación Física' }
];
  dropdownItems: DropDown[] = [
      { name: 'Pendiente', value: 'Pendiente' },
      { name: 'En Proceso', value: 'En Proceso' },
      { name: 'En Revisión', value: 'En Revisión' },
      { name: 'Denegada', value: 'Denegada' },
      { name: 'Aprobada', value: 'Aprobada' },
      { name: 'Completada', value: 'Completada' },
      { name: 'Entregada', value: 'Entregada' }
  ]
  dropdownItemsUsers: DropDown[] = []

  @Input() set taskData(data: Order) {
    if (data) {
      let formattedDate = data.limitDate ? new Date(data.limitDate) : null;

      this.formTask.patchValue({
          name: data.name,
          subject: data.subject,
          description: data.description,
          authorName: data.authorName,
          rangePage: data.rangePage,
          isPriority: data.isPriority,
          status: data.status,
          limitDate: formattedDate,
          alumnoId: data.alumnoId,
          createdByUserId: data.createdByUserId,
      })

        if (data.filePath) {
            this.currentFileName = data.filePath.split('\\').pop() || data.filePath.split('/').pop() || data.filePath;
            this.existingFile = this.currentFileName;
            this.uploadedFiles = [{ name: this.currentFileName }];
            this.formTask.patchValue({ file: this.currentFileName });
        }
    }
}

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
  ) {
    this.formTask = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]],
      authorName: ['', Validators.required],
      rangePage: ['', Validators.required],
      isPriority: [false],
      file: ['', Validators.required],
      status: ['Pendiente'],
      limitDate: ['', Validators.required],
      alumnoId: ['', Validators.required],
      createdByUserId: [''],
  });

    this.userService.getAllStudents().subscribe({
      next: (response) => {
        this.dropdownItemsUsers = response.map((user: any) => ({
          name: user.fullName,
          value: user.id
        }));
      },
    });
  }

  ngOnInit() {
    if (this.isEditMode) {
      this.formTask.get('status')?.enable();
    } else {
      this.formTask.get('status')?.disable();
    }

    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
          if (userData && userData.id) {
              this.formTask.patchValue({ createdByUserId: userData.id });
          }
      },
      error: (error) => {
          console.error('Error al obtener el usuario:', error);
      }
    });
  }

  

  onFileSelected(event: any): void {
    if (event.files && event.files.length > 0) {
        const selectedFile = event.files[0];
        this.selectedFile = selectedFile;
        this.existingFile = '';
        this.uploadedFiles = [];
        this.formTask.patchValue({ file: selectedFile });
    } else {
        this.formTask.patchValue({ file: null });
        this.formTask.get('file')?.markAsTouched();
    }
}

onSubmit(): void {
  if (this.formTask.valid) {
      const formData = new FormData();
      const rawDate = this.formTask.get('limitDate')?.value;
      const formattedDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';

      formData.append('name', this.formTask.get('name')?.value);
      formData.append('subject', this.formTask.get('subject')?.value);
      formData.append('description', this.formTask.get('description')?.value);
      formData.append('authorName', this.formTask.get('authorName')?.value);
      formData.append('rangePage', this.formTask.get('rangePage')?.value);
      formData.append('isPriority', this.formTask.get('isPriority')?.value.toString());
      formData.append('status', this.formTask.get('status')?.value || '');
      formData.append('limitDate', formattedDate);
      formData.append('alumnoId', this.formTask.get('alumnoId')?.value || '');
      formData.append('createdByUserId', this.formTask.get('createdByUserId')?.value || '');

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
    } else if (this.existingFile) {
        formData.append('file', this.existingFile);
    }

      this.formSubmitted.emit(formData);
  } else {
      Object.keys(this.formTask.controls).forEach(key => {
          const control = this.formTask.get(key);
          if (control?.invalid) {
              control.markAsTouched();
          }
      });
  }
}
}