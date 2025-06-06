import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { saveAs } from 'file-saver';
import { FileUploadService } from '../../../services/file-upload.service';
import { OrderManagmentService } from '../../../services/orderManagment.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../services/user.service';
import { TagModule } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';
import { BackButtonComponent } from '../ui/back-button/back-button.component';
import { Paragraph } from '../../../types/paragraph.Interface';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, BackButtonComponent],
  templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent implements OnInit {
  task: any = {};
  isLoading: boolean = true;
  errorMessage: string = '';
  isLibrarian: boolean = false;
  user: any;
  userIdActive: string  = '';
  statusTask: string = '';
  taskId: number = 0;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private fileUploadService: FileUploadService,
    private orderManagmentService: OrderManagmentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
        this.userIdActive = userData?.id ?? '';
      },
    })
    this.isLibrarian = this.authService.hasRole('Admin') || this.authService.hasRole('Bibliotecario');
    this.isAlumno = this.authService.hasRole('Alumno');
    this.loadTaskDetails();
    this.getStatus();
  }

  getStatus(): void {
    this.orderService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.statusTask = task.status;
        this.isEarring = this.statusTask === 'Pendiente';
        this.isProcess = this.statusTask === 'En Proceso';
        this.isRevision = this.statusTask === 'En Revisión';
        this.isApproved = this.statusTask === 'Aprobada';
        this.isDenegated = this.statusTask === 'Denegada';
        this.isCompleted = this.statusTask === 'Completada';
      },
      error: (err) => {
        console.error('Error al obtener la tarea:', err);
      }
    });
  }

  loadTaskDetails(): void {
    if (!this.taskId) {
      this.errorMessage = 'ID de tarea no válido';
      this.isLoading = false;
      return;
    }

    this.orderService.getTaskById(this.taskId).subscribe({
      next: async (data: any) => { 
          this.task = {
              ...data,
              fileName: data.filePath ? data.filePath.split(/[\\/]/).pop() : null
          };
          
          this.creatorName = await this.userService.getUserName(data.createdByUserId);
          this.requesterName = data.assignedUserId ? await this.userService.getUserName(data.assignedUserId)
          : "Usuario no asignado";
          this.alumnoName = await this.userService.getUserName(data.alumnoId);

  
          this.isLoading = false;
      },
      error: (error) => {
          console.error('Error al cargar los detalles de la tarea:', error);
          this.errorMessage = 'No se pudo cargar los detalles de la tarea';
          this.isLoading = false;
      }
  });
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
      next: (blob) => saveAs(blob, fileName),
      error: (error) => {
        console.error('Error al descargar el archivo:', error);
        alert('No se pudo descargar el archivo.');
      }
    });
  }

  async processOcr(orderId: number, condition: boolean, status: string): Promise<void> {
    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;
    this.ocrResponse = null;

   // await this.saveAssignedUserId();

    if (condition && this.isEarring) {
      await this.changeStateTask(status);
    }

    this.fileUploadService.newProcessOcr(orderId, this.selectedOcrProcessor).subscribe({
        next: (response) => {
            this.uploadStatus = 'success';
            this.uploadProgress = 100;
            this.ocrResponse = response;
            
            localStorage.removeItem('ocrData');
            localStorage.setItem('ocrData', JSON.stringify(response));

            this.router.navigate(['/wirin/ocr-viewer/' + orderId]);
        },
        error: (error) => {
            console.error('Error al procesar el archivo con OCR:', error);
            this.errorMessage = 'Error al procesar el archivo con OCR. Por favor, intente nuevamente.';
            this.uploadStatus = 'error';
        }
    });
}

async saveAssignedUserId(): Promise<void> {
  this.formData = new FormData();
  this.formData.append('id', this.taskId.toString());
  this.formData.append('assignedUserId', this.userIdActive);

  await firstValueFrom(this.orderManagmentService.saveAssignedUserId(this.formData));
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
            console.error('Error al cambiar el estado:', err);
        }
    });
}

getSeverity(task: any): string {
  switch (task.status) {
      case 'En Proceso':
          return 'help';
      case 'En Revisión':
          return 'warn';
      case 'Completada':
          return 'success';
      case 'Validada':
          return 'success';
      case 'Entregada':
          return 'success';
      case 'Denegada':
          return 'danger';
      default:
          return 'info';
  }
}

deleteTask(taskId: number, event: Event): void {
  event.stopPropagation();

  this.orderService.deleteOrder(taskId).subscribe({
      next: () => {
          this.router.navigate(['/wirin/tasks']);
      },
      error: error => {
          console.error('Error al eliminar tarea:', error);
      }
  });
}

  editTask(id: number) {
    this.router.navigate([`/wirin/edit-task-form/${id}`]);
  }

}