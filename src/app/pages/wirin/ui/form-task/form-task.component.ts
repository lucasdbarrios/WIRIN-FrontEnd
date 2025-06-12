import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { DropDown } from '../../../../types/dropDown';
import { DropdownModule } from 'primeng/dropdown';
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
import { CheckboxModule } from 'primeng/checkbox';
import { ToastService } from '../../../../services/toast.service';
import { OrderDelivery } from '../../../../types/orderDelivery.type';
import { OrderDeliveryService } from '../../../../services/orderDelivery.service';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  standalone: true,
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  imports: [
    DropdownModule,
    ReactiveFormsModule,
    ButtonModule,
    MessageModule,
    CommonModule,
    RouterModule,
    CheckboxModule,
    InputTextModule,
    TextareaModule,
    CalendarModule,
    FileUploadModule,
    BackButtonComponent,
    DialogModule,
    FormsModule,
    SelectModule,
    ToggleSwitchModule
  ]
})
export class FormTaskComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Input() taskId: string | null = null;
  @Output() formSubmitted = new EventEmitter<FormData>();
  
  formTask!: FormGroup;
  deliveryForm!: FormGroup;
  showNewDeliveryModal: boolean = false;
  
  selectedFile: File | null = null;
  currentFileName: string = '';
  existingFile: string = '';
  orderDeliveries: OrderDelivery[] = [];
  
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
  ];
  
  dropdownItemsUsers: DropDown[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService,
    private orderDeliveryService: OrderDeliveryService,
  ) {
    this.initializeForms();
    this.loadUsers();
  }

  private initializeForms() {
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
      orderDeliveryId: ['', Validators.required]
    });

    this.deliveryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      deliveryStudentId: ['', Validators.required]
    });
  }

  private loadUsers() {
    this.userService.getAllStudents().subscribe({
      next: (response) => {
        this.dropdownItemsUsers = response.map((user: any) => ({
          name: user.fullName,
          value: user.id
        }));
      },
      error: (error) => {
        this.toastService.showError('Error al obtener los usuarios');
        console.error('Error al obtener los usuarios:', error);
      }
    });
  }

  ngOnInit() {
    this.initForm();
    this.markFormAsTouched(); // Marcar todos los campos como tocados al inicio
    this.setupFormValidation(); // Configurar validación en tiempo real
  }

  private initForm() {
    if (this.isEditMode) {
      this.formTask.get('status')?.enable();
    } else {
      this.formTask.get('status')?.disable();
    }

    this.loadOrderDeliveries();
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        if (userData && userData.id) {
          this.formTask.patchValue({ createdByUserId: userData.id });
        }
      },
      error: (error) => {
        this.toastService.showError('Error al obtener el usuario');
        console.error('Error al obtener el usuario:', error);
      }
    });
  }

  @Input() set taskData(data: Order) {
    if (data) {
      const formattedDate = data.limitDate ? new Date(data.limitDate) : null;
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
      });

      if (data.filePath) {
        this.currentFileName = data.filePath.split('/').pop() || data.filePath.split('/').pop() || data.filePath;
        this.existingFile = this.currentFileName;
        this.formTask.patchValue({ file: this.currentFileName });
      }
    }
  }

  onFileSelected(event: any) {
    if (event.files && event.files[0]) {
      this.selectedFile = event.files[0];
      this.formTask.patchValue({ file: this.selectedFile?.name });
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formTask.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    return '';
  }

  saveOrderDelivery(): void {
    if (this.deliveryForm.valid) {
      const newDelivery: OrderDelivery = {
        title: this.deliveryForm.get('name')?.value,
        status: "En proceso",
        studentId: this.deliveryForm.get('deliveryStudentId')?.value,
      };

      this.orderDeliveryService.createDelivery(newDelivery).subscribe({
        next: (createdDelivery) => {
          this.orderDeliveries.push(createdDelivery);
          this.showNewDeliveryModal = false;
          this.loadOrderDeliveries();
        },
        error: (error) => {
          this.toastService.showError('Error al crear la entrega');
          console.error('Error al crear la entrega:', error);
        }
      });
    }
  }

  loadOrderDeliveries(): void {
    this.orderDeliveryService.getDeliveries().subscribe({
      next: (deliveries) => {
        this.orderDeliveries = deliveries;
      },
      error: (error) => {
        this.toastService.showError('Error al cargar las entregas');
        console.error('Error al cargar las entregas:', error);
      }
    });
  }

  openNewDeliveryModal(): void {
    this.showNewDeliveryModal = true;
    this.deliveryForm.reset();
  }

  onDeliverySubmit(): void {
    if (this.deliveryForm.valid) {
      this.saveOrderDelivery();
    }
  }

  onSubmit(): void {
    if (this.formTask.valid) {
      const formData = new FormData();
      Object.keys(this.formTask.value).forEach(key => {
        if (key === 'limitDate' && this.formTask.value[key]) {
          formData.append(key, this.formTask.value[key].toISOString());
        } else {
          formData.append(key, this.formTask.value[key]);
        }
      });

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

  private markFormAsTouched() {
    Object.keys(this.formTask.controls).forEach(key => {
      const control = this.formTask.get(key);
      control?.markAsTouched();
    });
  }

  private setupFormValidation() {
    Object.keys(this.formTask.controls).forEach(key => {
      const control = this.formTask.get(key);
      control?.statusChanges.subscribe(() => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    });

    this.formTask.statusChanges.subscribe(() => {
      if (this.formTask.invalid) {
        this.markFormAsTouched();
      }
    });
  }
}