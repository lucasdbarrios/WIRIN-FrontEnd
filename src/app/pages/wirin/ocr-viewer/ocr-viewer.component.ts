import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderManagmentService } from '../../../services/orderManagment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { OcrResponse } from '../../../types/ocr.interface';
import { OcrTextViewerComponent } from '../ui/ocr-text-viewer/ocr-text-viewer.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ocr-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, OcrTextViewerComponent, ButtonModule],
  templateUrl: './ocr-viewer.component.html',
})
export class OcrViewerComponent implements OnInit {
  @Input() ocrData: OcrResponse | null = null;
  fileName: string = '';
  isEditing: boolean = false;
  editingText: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  user: any;
  errorMessage: string = '';
  isRevision = false;
  formData?: FormData;
  urlSafe: SafeResourceUrl = '';
  task: any;

  constructor(private router: Router, 
    private orderManagmentService: OrderManagmentService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private orderService: OrderService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!taskId) {
        console.error("Error: `id` no está definido en la ruta.");
        return;
    }

    this.orderService.getTaskById(taskId).subscribe({
        next: (task) => {
            if (!task) {
                console.error("Error: La tarea no tiene un `id` válido.");
                return;
            }
            this.task = task; // ✅ Ahora `task` está definido

            // ✅ Llamamos a `recoveryFile` solo después de que `task` existe
            this.orderService.recoveryFile(this.task.id).subscribe({
                next: (data) => {
                    const blob = new Blob([data], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                },
                error: (error) => {
                    console.error('Error al recuperar el archivo:', error);
                }
            });

            // ✅ Verificación del estado de revisión
            this.isRevision = this.task.status === 'En Revisión';
        },
        error: (error) => {
            console.error('Error al obtener la tarea:', error);
        }
    });

    // ✅ Obtener usuario sin depender de `this.task`
    this.authService.getCurrentUser().subscribe({
        next: (userData) => {
            this.user = userData;
        },
        error: (error) => {
            console.error('Error al cargar el perfil:', error);
            this.errorMessage = 'No se pudo cargar la información del perfil.';
        },
    });
}

  finalizarProceso(): void {
    const getFormData = this.getFormData('En Revisión');
    this.orderManagmentService.changeStatus(getFormData).subscribe({
      next: () => {
        this.router.navigate(['/wirin/tasks']);
      },
      error: (err) => {
        console.error('Error al cambiar el estado:', err);
      }
    });
  }
  
  denegarResultado(): void {
    const getFormData = this.getFormData('Denegada');
    this.orderManagmentService.changeStatus(getFormData).subscribe({
      next: () => {
        this.router.navigate(['/wirin/tasks']);
      },
      error: (err) => {
        console.error('Error al cambiar el estado:', err);
      }
    });
  }
  
  finalizarRevision(): void {
    const getFormData = this.getFormData('Completada');
    this.orderManagmentService.changeStatus(getFormData).subscribe({
      next: () => {
        this.router.navigate(['/wirin/tasks']);
      },
      error: (err) => {
        console.error('Error al cambiar el estado:', err);
      }
    });
  }

  getFormData(status: string): FormData {
    this.formData = new FormData();
    this.formData.append('id', this.task.id);
    this.formData.append('status', status);
    this.formData.append('assignedUserId', this.task.assignedUserId);
    
    return this.formData;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
    }
  }

  startEditing(): void {
    this.isEditing = true;
  }

  saveChanges(): void {
    if (!this.ocrData || !this.isEditing) return;
    localStorage.setItem('ocrData', JSON.stringify(this.ocrData));
    this.isEditing = false;
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  isToRevision(): boolean {
    return this.task?.status === 'En Revisión';
  }
}