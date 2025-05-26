import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from "../../../../../services/api.service";
import { Router, RouterModule } from "@angular/router";

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class FormComponent implements OnInit {
    formTask: FormGroup;
    isEditMode: boolean = false;
    selectedFile: File | null = null;
    currentFileName: string = '';

    constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
        this.formTask = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(5)]],
            limitDate: ['', Validators.required],
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
            formData.append('name', this.formTask.get('name')?.value);
            formData.append('description', this.formTask.get('description')?.value);
            formData.append('limitDate', this.formTask.get('limitDate')?.value);
            formData.append('status', this.formTask.get('status')?.value);

            if (this.selectedFile) {
                formData.append('file', this.selectedFile);
            }

            this.apiService.post("/order", formData).subscribe({
                    next: (result: any) => this.router.navigate(['/wirin']),
                    error: (error: any) => console.error({error})
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

    onFileSelected(event: Event): void {
        const element = event.currentTarget as HTMLInputElement;
        let fileList: FileList | null = element.files;

        if (fileList && fileList.length > 0) {
            this.selectedFile = fileList[0];
            this.currentFileName = this.selectedFile.name;
            this.formTask.patchValue({ file: this.selectedFile });
        } else {
            this.selectedFile = null;
            this.currentFileName = '';
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