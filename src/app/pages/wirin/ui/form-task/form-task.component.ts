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

@Component({
  standalone: true,
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  imports: [ReactiveFormsModule, ButtonModule, CommonModule, RouterModule, SelectModule, FormsModule, InputTextModule, TextareaModule, DatePickerModule, FileUploadModule]
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
  dropdownItems: DropDown[] = [
      { name: 'Pendiente', value: 'Pendiente' },
      { name: 'En Proceso', value: 'En Proceso' },
      { name: 'En Revisión', value: 'En Revisión' },
      { name: 'Denegada', value: 'Denegada' },
      { name: 'Finalizado', value: 'Finalizado' }
  ]
  dropdownItemsUsers: DropDown[] = [
      { name: 'Maria Becerra', value: 'Maria Becerra' },
      { name: 'Manuel Ignacio', value: 'Manuel Ignacio' },
      { name: 'Emanuel Rodriguez', value: 'Emanuel Rodriguez' }
  ]

  @Input() set taskData(data: any) {
    if (data) {
      let formattedDate = null;
      if (data.limitDate) {
        formattedDate = new Date(data.limitDate);
      }

      this.formTask.patchValue({
        name: data.name,
        description: data.description,
        limitDate: formattedDate,
        user: data.user,
        status: data.status,
      });

      if (data.filePath) {
        this.currentFileName = data.filePath.split('\\').pop() || data.filePath.split('/').pop() || data.filePath;
        this.existingFile = this.currentFileName;
        this.uploadedFiles = [{ name: this.currentFileName }];
      }
    }
  }

  constructor(
    private fb: FormBuilder
  ) {
    this.formTask = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      limitDate: ['', Validators.required],
      status: ['Pendiente'],
      user: [''],
      file: ['']
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.formTask.get('status')?.enable();
    } else {
      this.formTask.get('status')?.disable();
    }
  }

  goBack() {
    window.history.back();
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
    }
}

  onSubmit(): void {
    if (this.formTask.valid) {
      const formData = new FormData();
      const rawDate = this.formTask.get('limitDate')?.value;
      const formattedDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';
      formData.append('name', this.formTask.get('name')?.value);
      formData.append('description', this.formTask.get('description')?.value);
      formData.append('limitDate', formattedDate);
      formData.append('status', this.formTask.get('status')?.value || '');
      formData.append('user', this.formTask.get('user')?.value || '');

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
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

  getErrorMessage(controlName: string): string {
    const control = this.formTask.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres`;
    }
    return '';
  }
}