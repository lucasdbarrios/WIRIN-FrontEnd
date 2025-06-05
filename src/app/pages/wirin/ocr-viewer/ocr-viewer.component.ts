import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderManagmentService } from '../../../services/orderManagment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { OcrPage, OcrResponse } from '../../../types/ocr.interface';
import { OcrTextViewerComponent } from '../ui/ocr-text-viewer/ocr-text-viewer.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProcessParagraph } from '../../../types/ProcessParagraph.interface';
import { OrderParagraphService } from '../../../services/orderParagraph.service';
import { ProcessParagraphRequest } from '../../../types/Requests/ProcessParagraphRequest';

@Component({
  selector: 'app-ocr-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, OcrTextViewerComponent, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './ocr-viewer.component.html',
})
export class OcrViewerComponent implements OnInit {
  @Input() ocrData: OcrResponse | null = null;
  fileName: string = '';
  isEditing: boolean = false;
  editingText: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  pages: OcrPage[] = [];
  textProcess: ProcessParagraph[] = [];
  user: any;
  errorMessage: string = '';
  isRevision = false;
  formData?: FormData;
  urlSafe: SafeResourceUrl = '';
  task: any;
  taskId: string  = '';
  estado: string | null = null;

  constructor(private router: Router, 
    private orderManagmentService: OrderManagmentService,
    private route: ActivatedRoute,
    private authService: AuthService, 
    private orderService: OrderService,
    public sanitizer: DomSanitizer,
    private messageService: MessageService,
    private orderParagraphService: OrderParagraphService
  ) {}

  ngOnInit(): void {
    this.task = Number(this.route.snapshot.paramMap.get('id'));
    this.estado = this.route.snapshot.queryParamMap.get('estado');

    this.orderService.getTaskById(this.task).subscribe(task => {
      this.isRevision = task?.status === 'En Revisión';
      this.taskId = task.id;
    });

    const storedData = localStorage.getItem('ocrData');
    if (storedData) {
      this.ocrData = JSON.parse(storedData);
      this.totalPages = this.ocrData?.metadata?.totalPages ?? 1; 
      this.fileName = this.ocrData?.metadata?.fileName.split("\\").pop() ?? ''
      this.pages = this.ocrData?.pages?? [];

      this.saveDocProcesed(this.pages);
     // this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.ocrData?.metadata?.fileName?? '');
    }
    this.orderService.recoveryFile(this.task).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (error) => {
        console.error('Error al recuperar el archivo:', error);
      }
    })
    

    

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
              console.error('Error al enviar los datos:', error);
          }
      });
  }
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

  isToRevision(): boolean {
    return this.task?.status === 'En Revisión';
  }
}