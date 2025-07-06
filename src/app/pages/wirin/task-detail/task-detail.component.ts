import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order/order.service';
import { AuthService } from '../../../services/auth/auth.service';
// Removed file-saver dependency - using native browser API instead
import { FileUploadService } from '../../../services/file-upload/file-upload.service';
import { OrderManagmentService } from '../../../services/order-managment/orderManagment.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../services/user/user.service';
import { TagModule } from 'primeng/tag';
import { firstValueFrom, Subscription } from 'rxjs';
import { ToastService } from '../../../services/toast/toast.service';
import { PopupComponent } from '../ui/popup/popup.component';
import { getSeverity } from '../../../utils/getSeverity';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, PopupComponent],
  templateUrl: './task-detail.component.html',
})

export class TaskDetailComponent implements OnInit, OnChanges, OnDestroy  {
  task: any = {};
  isLoading: boolean = true;
  errorMessage: string = '';
  isLibrarian: boolean = false;
  user: any;
  userIdActive: string  = '';
  statusTask: string = '';
  @Input() taskId: number = 0;
  @Output() taskDeleted = new EventEmitter<boolean>();
  uploadProgress: number = 0;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  ocrResponse: any = null;
  selectedOcrProcessor: string = 'Local';
  isAlumno = true;
  isRevision = false;
  isCompleted = false;
  isDenegated = false;
  isEarring = false;
  isProcess = false;
  isApproved = false;
  formData?: FormData;
  requesterName: string = '';
  creatorName: string = '';
  alumnoName: string = '';
  isProcessing: boolean = false;
  private subscriptions: Subscription[] = [];
  showConfirmPopup: boolean = false;
  taskToDeleteId: number | null = null;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private fileUploadService: FileUploadService,
    private orderManagmentService: OrderManagmentService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const subscription = this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
        this.userIdActive = userData?.id ?? '';
      },
      error: (err) => {
        this.toastService.showError('Error al obtener el usuario');
        console.error('Error al obtener el usuario:', err);
      }
    });
    this.subscriptions.push(subscription);
    
    this.isLibrarian = this.authService.hasRole('Admin') || this.authService.hasRole('Bibliotecario');
    this.isAlumno = this.authService.hasRole('Alumno');
    this.loadTaskDetails();
  }

  formatFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(fecha);
}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskId'] && changes['taskId'].currentValue !== changes['taskId'].previousValue) {
      this.task = {};
      this.isLoading = true;
        this.loadTaskDetails();
    }
}


  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadTaskDetails(): void {
  if (!this.taskId) {
    this.errorMessage = 'ID de tarea no válido';
    this.isLoading = false;
    return;
  }

  const subscription = this.orderService.getTaskByIdWithAutoRefresh(this.taskId).subscribe({
    next: async (data: any) => {
      try {
        this.creatorName = await this.userService.getUserName(data.createdByUserId);
        this.requesterName = data.voluntarioId
          ? await this.userService.getUserName(data.voluntarioId)
          : "Usuario no asignado";
        this.alumnoName = await this.userService.getUserName(data.alumnoId);

        this.task = {
          ...data,
          fileName: data.filePath ? data.filePath.split(/[\\/]/).pop() : null
        };

        this.statusTask = data.status;
        this.isEarring = data.status === 'Pendiente';
        this.isProcess = data.status === 'En Proceso';
        this.isRevision = data.status === 'En Revisión';
        this.isApproved = data.status === 'Aprobada';
        this.isDenegated = data.status === 'Denegada';
        this.isCompleted = data.status === 'Completada';

      } catch (err) {
        console.error('Error al cargar datos adicionales de usuario:', err);
        this.toastService.showError('No se pudieron cargar los datos del usuario.');
      } finally {
        this.isLoading = false;
        console.log('✅ Todo cargado, renderizado listo.');
      }
    },
    error: (error) => {
      console.error('Error al cargar los detalles de la tarea:', error);
      this.errorMessage = 'No se pudo cargar los detalles de la tarea';
      this.isLoading = false;
    }
  });

  this.subscriptions.push(subscription);
}

  downloadFile(taskId: number, fileName: string | null): void {
    if (!taskId || taskId <= 0) {
      alert('ID de tarea inválido. No se puede descargar el archivo.');
      return;
    }
  
    if (!fileName) {
      alert('No hay un nombre de archivo válido para descargar.');
      return;
    }

    this.orderService.downloadFile(taskId).subscribe({
      next: (blob) => {
        // Native browser download implementation
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.toastService.showError('Error al descargar el archivo');
        console.error('Error al descargar el archivo:', error);
      }
    });
  }

  async processOcr(orderId: number, condition: boolean, status: string): Promise<void> {
    this.isProcessing = true;
    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;
    this.ocrResponse = null;

    

    if (condition && (this.isEarring || this.isDenegated)) {
      await this.changeStateTask(status);
    }

    const subscription = this.fileUploadService.newProcessOcrWithAutoRefresh(orderId, this.selectedOcrProcessor).subscribe({
        next: (response) => {
          
            this.isProcessing = false;
            this.uploadStatus = 'success';
            this.uploadProgress = 100;
            this.ocrResponse = response;
            
            localStorage.removeItem('ocrData');
            localStorage.setItem('ocrData', JSON.stringify(response));

            this.router.navigate(['/wirin/ocr-viewer/' + orderId]);
          
        },
        error: (error) => {
            
            this.toastService.showError('Error al procesar el archivo con OCR');
            console.error('Error al procesar el archivo con OCR:', error);
            this.uploadStatus = 'error';
            this.isProcessing = false;
        }
    });
    this.subscriptions.push(subscription);
  }

  async saveUserId(): Promise<void> {
    this.formData = new FormData();
    this.formData.append('id', this.taskId.toString());
    this.formData.append('userId', this.userIdActive);

    if(this.isRevision){
      await firstValueFrom(this.orderManagmentService.saveRevisorId(this.formData));
    }else{
      await firstValueFrom(this.orderManagmentService.saveVoluntarioId(this.formData));
    }
    
  }

  async changeStateTask(status: string): Promise<void> {
    this.formData = new FormData();
    this.formData.append('id', this.taskId.toString());
    this.formData.append('status', status);

    await firstValueFrom(this.orderManagmentService.changeStatus(this.formData));
  }

  confirmarEntrega(): void {
    this.formData = new FormData();
    this.formData.append('id', this.taskId.toString());
    this.formData.append('status', 'Entregada');
    this.formData.append('assignedUserId', this.task.assignedUserId);

    this.orderManagmentService.changeStatus(this.formData).subscribe({
        next: () => {
          this.router.navigate(['/wirin/tasks']);
        },
        error: (err) => {
            this.toastService.showError('Error al cambiar el estado');
            console.error('Error al cambiar el estado:', err);
        }
    });
  }

  getSeverity(status: string): string {
    return getSeverity(status);
  }

  confirmDeleteTask(taskId: number, event: Event) {
    event.stopPropagation();
    this.taskToDeleteId = taskId;
    this.showConfirmPopup = true;
  }

  onDeleteTask() {
    if (this.taskToDeleteId !== null) {
        this.orderService.deleteOrder(this.taskToDeleteId).subscribe({
            next: () => {
                this.toastService.showSuccess('Tarea eliminada con éxito');
                this.taskDeleted.emit(true); // 🔥 Emite evento al componente padre
            },
            error: error => {
                this.toastService.showError('Error al eliminar tarea');
                console.error('Error al eliminar tarea:', error);
            }
        });
    }
    this.showConfirmPopup = false;
  }


  editTask(id: number) {
    this.router.navigate([`/wirin/edit-task-form/${id}`]);
  }

}