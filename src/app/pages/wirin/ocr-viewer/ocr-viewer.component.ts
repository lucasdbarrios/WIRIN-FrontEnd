import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderManagmentService } from '../../../services/order-managment/orderManagment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { OrderService } from '../../../services/order/order.service';
import { OcrPage, OcrResponse } from '../../../types/ocr.interface';
import { OcrTextViewerComponent } from '../ui/ocr-text-viewer/ocr-text-viewer.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProcessParagraph } from '../../../types/ProcessParagraph.interface';
import { OrderParagraphService } from '../../../services/order-paragraph/orderParagraph.service';
import { FileUploadService } from '../../../services/file-upload/file-upload.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-ocr-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, OcrTextViewerComponent, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService,ConfirmationService],
  templateUrl: './ocr-viewer.component.html',
})
export class OcrViewerComponent implements OnInit, OnDestroy {
  @Input() ocrData: OcrResponse | null = null;
  showPdfPreview: boolean = false;
  fileName: any;
  isEditing: boolean = false;
  editingText: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  pages: OcrPage[] = [];
  textProcess: ProcessParagraph[] = [];
  user: any;
  errorMessage: string = '';
  state: string = '';
  formData?: FormData;
  urlSafe: SafeResourceUrl = '';
  task: any;
  taskId: string  = '';
  private subscriptions: Subscription[] = [];
  estado: string | null = null;

  constructor(private router: Router,
    private confirmationService: ConfirmationService,  
    private orderManagmentService: OrderManagmentService,
    private route: ActivatedRoute,
    private authService: AuthService, 
    private orderService: OrderService,
    public sanitizer: DomSanitizer,
    private fileUploadService: FileUploadService,
    private orderParagraphService: OrderParagraphService,
    private toastService: ToastService
    
  ) {}

  ngOnInit(): void {
    this.task = Number(this.route.snapshot.paramMap.get('id'));
    this.estado = this.route.snapshot.queryParamMap.get('estado');

    this.loadTaskWithAutoRefresh();
    this.processOcrWithAutoRefresh();
    this.recoverFileWithAutoRefresh();
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private loadTaskWithAutoRefresh(): void {
    const subscription = this.orderService.getTaskByIdWithAutoRefresh(this.task).subscribe({
      next: (task) => {
        this.state = task.status;
        this.taskId = task.id;
      },
      error: (error) => {
        console.error('Error al cargar la tarea:', error);
        this.toastService.showError('Error al cargar la información de la tarea.');
      }
    });
    this.subscriptions.push(subscription);
  }

  private processOcrWithAutoRefresh(): void {
    const subscription = this.fileUploadService.newProcessOcrWithAutoRefresh(this.task, "Local").subscribe({
      next: (response) => {
        this.ocrData = response;
        this.totalPages = this.ocrData?.metadata?.totalPages?? 1;
        this.fileName = this.ocrData?.metadata?.fileName.split("\\").pop()?? ''
        this.pages = this.ocrData?.pages?? [];
        localStorage.setItem('ocrData', JSON.stringify(this.ocrData));
      },
      error: (error) => {
        console.error('Error al procesar OCR:', error);
        this.toastService.showError('Error al procesar el documento con OCR.');
      }
    });
    this.subscriptions.push(subscription);
  }

  private recoverFileWithAutoRefresh(): void {
    const subscription = this.orderService.recoveryFile(this.task).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (error) => {
        this.toastService.showError('Error al recuperar el archivo.');
        console.error('Error al recuperar el archivo:', error);
      }
    });
    this.subscriptions.push(subscription);
  }

  private loadCurrentUser(): void {
    const subscription = this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.errorMessage = 'No se pudo cargar la información del perfil.';
      },
    });
    this.subscriptions.push(subscription);
}

confirmDenegarResultado(): void {
  this.confirmationService.confirm({
    message: '¿Estás seguro de que quieres denegar el resultado?',
    acceptLabel: 'Sí',
    rejectLabel: 'No',
    accept: () => {
      this.denegarResultado();
    }
  });
}

saveDocProcesed(pages: OcrPage[]): void {
  for (const page of pages) {
      const pageData: ProcessParagraph = {
          orderId: this.task,
          pageNumber: page.number,
          paragraphText: page.text,
          hasError: false,
          errorMessage: ''
      };

      this.orderParagraphService.processParagraphs(pageData).subscribe({
          error: (error: any) => {
            this.toastService.showError('Error al enviar los datos.');
            console.error('Error al enviar los datos:', error);
          }
      });
  }
}

actualizarEstado(event: boolean): void {
  this.showPdfPreview = event;
}

  finalizarProceso(): void {
    const getFormData = this.getFormData('En Revisión');
    this.orderManagmentService.changeStatus(getFormData).subscribe({
      next: () => {
        this.router.navigate(['/wirin/tasks']);
      },
      error: (err) => {
        this.toastService.showError('Error al cambiar el estado.');
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
        this.toastService.showError('Error al cambiar el estado.');
        console.error('Error al cambiar el estado:', err);
      }
    });
  }
  
  finalizarRevision(state: string): void {
    var getFormData = null;

    if(state == 'En Revisión'){
      getFormData = this.getFormData('Aprobada');
    }else{
      getFormData = this.getFormData('Completada');
    }
    
    this.orderManagmentService.changeStatus(getFormData).subscribe({
      next: () => {
        this.router.navigate(['/wirin/tasks']);
      },
      error: (err) => {
        this.toastService.showError('Error al cambiar el estado.');
        console.error('Error al cambiar el estado:', err);
      }
    });
  }

  getFormData(status: string): FormData {
    this.formData = new FormData();
    this.formData.append('id', this.taskId);
    this.formData.append('status', status);

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

  cancelEditing(): void {
    this.isEditing = false;
  }
}