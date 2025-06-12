import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

interface OrderDelivery {
  id: string;
  name: string;
}

@Component({
  standalone: true,
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.css'],
  imports: [ReactiveFormsModule, CommonModule, DialogModule]
})
export class FormTaskComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Input() taskId: string | null = null;
  @Input() set taskData(data: any) {
    if (data) {
      let formattedDate = '';
      if (data.limitDate) {
        const date = new Date(data.limitDate);
        formattedDate = date.toISOString().split('T')[0];
      }

      this.formTask.patchValue({
        name: data.name,
        description: data.description,
        limitDate: formattedDate,
        status: data.status,
        orderDeliveryId: data.orderDeliveryId
      });

      if (data.filePath) {
        this.currentFileName = data.filePath.split('\\').pop() || data.filePath.split('/').pop() || data.filePath;
      }
    }
  }
  @Output() formSubmitted = new EventEmitter<FormData>();
  @Output() deliveryCreated = new EventEmitter<OrderDelivery>();

  formTask: FormGroup;
  deliveryForm: FormGroup;
  selectedFile: File | null = null;
  currentFileName: string = '';
  showNewDeliveryModal: boolean = false;
  orderDeliveries: OrderDelivery[] = [];

  constructor(
    private fb: FormBuilder
  ) {
    this.formTask = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      limitDate: ['', Validators.required],
      status: ['Pendiente'],
      file: [null],
      orderDeliveryId: ['', Validators.required]
    });

    this.deliveryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.formTask.get('status')?.enable();
    } else {
      this.formTask.get('status')?.disable();
    }
    this.loadOrderDeliveries();
  }

  loadOrderDeliveries(): void {
    // Aquí deberías cargar las entregas desde tu servicio
    // Por ahora usaremos datos de ejemplo
    this.orderDeliveries = [
      { id: '1', name: 'Entrega 1' },
      { id: '2', name: 'Entrega 2' },
    ];
  }

  openNewDeliveryModal(): void {
    this.showNewDeliveryModal = true;
    this.deliveryForm.reset();
  }

  onDeliverySubmit(): void {
    if (this.deliveryForm.valid) {
      const newDelivery: OrderDelivery = {
        id: Date.now().toString(), // Esto debería ser generado por el backend
        name: this.deliveryForm.get('name')?.value
      };
      
      this.orderDeliveries.push(newDelivery);
      this.deliveryCreated.emit(newDelivery);
      this.showNewDeliveryModal = false;
      this.formTask.patchValue({ orderDeliveryId: newDelivery.id });
    } else {
      Object.keys(this.deliveryForm.controls).forEach(key => {
        const control = this.deliveryForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  goBack() {
    window.history.back();
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
  
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.currentFileName = this.selectedFile.name;
      this.formTask.patchValue({ archivo: this.selectedFile });
    } else {
      this.selectedFile = null;
      this.currentFileName = '';
      this.formTask.patchValue({ archivo: null });
    }
  }

  onSubmit(): void {
    if (this.formTask.valid) {
      const formData = new FormData();
      formData.append('name', this.formTask.get('name')?.value);
      formData.append('description', this.formTask.get('description')?.value);
      formData.append('limitDate', this.formTask.get('limitDate')?.value);
      formData.append('status', this.formTask.get('status')?.value);
      formData.append('orderDeliveryId', this.formTask.get('orderDeliveryId')?.value);

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

  getErrorMessage(fieldName: string): string {
    const control = this.formTask.get(fieldName);
    if (control?.hasError('required')) {
      return `El campo ${fieldName} es requerido`;
    }
    if (control?.hasError('minlength')) {
      return `El campo ${fieldName} debe tener al menos ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}