import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from "@angular/router";
import { OrderService } from "../../../services/order.service";
import { DropDown } from "../../../types/dropDown";
import { SelectModule } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { FluidModule } from "primeng/fluid";
import { DatePickerModule } from "primeng/datepicker";
import { FileUploadModule } from "primeng/fileupload";
import { ButtonModule } from "primeng/button";
import { HttpEventType, HttpResponse } from "@angular/common/http";

@Component({
    selector: 'app-form-add-task',
    templateUrl: './form.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, ButtonModule, CommonModule, RouterModule, SelectModule, FormsModule, InputTextModule,TextareaModule, FluidModule, DatePickerModule, FileUploadModule]
})
export class TaskFormComponent implements OnInit {
    formTask: FormGroup;
    isEditMode: boolean = false;
    selectedFile: File | null = null;
    currentFileName: string = '';
    dropdownItem: DropDown = {name: 'Pendiente', value: 'Pendiente' };
    dropdownItems: DropDown[] = [
        { name: 'Pendiente', value: 'Pendiente' },
        { name: 'En progreso', value: 'En progreso' },
        { name: 'Finalizado', value: 'Finalizado' }
    ]
    dropdownItemUsers: DropDown = {name: 'Jose Gonzales', value: 'Jose Gonzales' };
    dropdownItemsUsers: DropDown[] = [
        { name: 'Maria Becerra', value: 'Maria Becerra' },
        { name: 'Manuel Ignacio', value: 'Manuel Ignacio' },
        { name: 'Emanuel Rodriguez', value: 'Emanuel Rodriguez' }
    ]
    calendarValue: Date | null = null;
    uploadedFiles: any[] = [];
    uploadStatus: string = '';
    uploadProgress: number = 0;

    constructor(private fb: FormBuilder, private orderService: OrderService, private router: Router) {
        this.formTask = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(5)]],
            limitDate: ['', Validators.required],
            users: [''],
            status: ['Pendiente'],
            file: [null]
        });
    }
    

    ngOnInit(): void {
        if (this.isEditMode) {
            this.formTask.get('status')?.enable();
        } else {
            this.formTask.get('status')?.disable();
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
            formData.append('status', this.formTask.get('status')?.value);
    
            if (this.selectedFile) {
                formData.append('file', this.selectedFile);
            }
    
            this.orderService.createOrder(formData).subscribe({
                next: (event: any) => {
                    if (event.type === HttpEventType.UploadProgress) {
                        if (event.total) {
                            this.uploadProgress = Math.round(100 * event.loaded / event.total);
                        }
                    } else if (event instanceof HttpResponse) {
                        this.uploadStatus = 'success';
                        this.router.navigate(['/wirin/tareas']);
                    }
                },
                error: (error) => {
                    console.error('Error en la API:', error);
                    this.uploadStatus = 'error';
                }
            });
    
        } else {
            Object.keys(this.formTask.controls).forEach(key => {
                const control = this.formTask.get(key);
                if (control?.invalid) {
                    control.markAsTouched();
                }
            });
        }
    }

    onFileSelected(event: any): void {
        if (event.files && event.files.length > 0) {
            const selectedFile = event.files[0]; 
            this.selectedFile = selectedFile;
            this.formTask.patchValue({ file: selectedFile });
        } else {
            this.formTask.patchValue({ file: null });
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

    goBack(): void {
        window.history.back();
    }
}