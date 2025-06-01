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
  formData?: FormData;
  requesterName: string = '';
  creatorName: string = '';

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
    this.checkUserRole();
    this.loadTaskDetails();
    this.getStatus();
    this.isAlumno = this.authService.getCurrentUserRole() === 'Alumno';
  }

  getStatus(): void {
    this.orderService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.statusTask = task.status;
        this.isEarring = this.statusTask === 'Pendiente';
        this.isProcess = this.statusTask === 'En Proceso';
        this.isRevision = this.statusTask === 'En Revisión';
        this.isDenegated = this.statusTask === 'Denegada';
        this.isCompleted = this.statusTask === 'Completada';
      },
      error: (err) => {
        console.error('Error al obtener la tarea:', err);
      }
    });
  }

  private checkUserRole(): void {
    const userRole = this.authService.getCurrentUserRole();
    this.isLibrarian = userRole === 'Admin';
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
  
          // Esperar los valores antes de asignarlos
          this.creatorName = await this.getUserName(data.createdByUserId);
          this.requesterName = await this.getUserName(data.assignedUserId);
  
          this.isLoading = false;
      },
      error: (error) => {
          console.error('Error al cargar los detalles de la tarea:', error);
          this.errorMessage = 'No se pudo cargar los detalles de la tarea';
          this.isLoading = false;
      }
  });
  }

async getUserName(userId: string): Promise<string> {
    try {
        const user = await firstValueFrom(this.userService.getUserById(userId));
        return user.fullName;
    } catch (err) {
        console.error(`Error al obtener el usuario con ID ${userId}:`, err);
        return "Usuario no encontrado";
    }
}

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'status-pendiente task-status-badge';
      case 'en proceso': return 'status-en-proceso task-status-badge';
      case 'en revisión': return 'status-en-revision task-status-badge';
      case 'denegada': return 'status-denegado task-status-badge';
      case 'completada': return 'status-completado task-status-badge';
      default: return 'status-pendiente task-status-badge';
    }
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

  processOcr(orderId: number, condition: boolean, status: string): void {
    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;
    this.ocrResponse = null;

    if(condition){
      this.formData = new FormData();
      this.formData.append('id', this.taskId.toString());
      this.formData.append('status', status);
      this.formData.append('assignedUserId', this.task.assignedUserId);
      this.orderManagmentService.changeStatus(this.formData).subscribe({
      error: (err) => {
        console.error('Error al cambiar el estado:', err);
      }
    });
    }
    
  
    this.fileUploadService.newProcessOcr(orderId, this.selectedOcrProcessor).subscribe({
      next: (response) => {
        this.uploadStatus = 'success';
        this.uploadProgress = 100;
        this.ocrResponse = response;
  
        // Guardar los datos OCR en localStorage para que estén disponibles en la nueva vista
        localStorage.setItem('ocrData', JSON.stringify(response));
  
        // Redirigir al visualizador OCR
        this.router.navigate(['/wirin/ocr-viewer/' + orderId]);
      },
      error: (error) => {
        console.error('Error al procesar el archivo con OCR:', error);
        this.errorMessage = 'Error al procesar el archivo con OCR. Por favor, intente nuevamente.';
        this.uploadStatus = 'error';
      }
    });
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
          return 'Help';
      case 'En Revisión':
          return 'warn';
      case 'Completada':
          return 'Success';
        case 'Entregada':
          return 'success';
      case 'Denegada':
          return 'Danger';
      default:
          return 'info';
  }
}
}