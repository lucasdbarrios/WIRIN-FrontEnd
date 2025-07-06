import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OcrPage, OcrResponse } from '../../../../types/ocr.interface';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { OrderParagraphService } from '../../../../services/order-paragraph/orderParagraph.service';
import { ProcessParagraphRequest } from '../../../../types/Requests/ProcessParagraphRequest';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { AuthService } from '../../../../services/auth/auth.service';
import { Annotation } from '../../../../types/annotation.interface';
import { ParagraphAnnotationService } from '../../../../services/paragraph-annotation/paragraphAnnotation.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { OrderService } from '../../../../services/order/order.service';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-ocr-text-viewer',
    standalone: true,
    imports: [TextareaModule, Dialog, CommonModule, FormsModule, CardModule, PanelModule, ScrollPanelModule, ButtonModule, ToastModule, EditorModule],
    templateUrl: './ocr-text-viewer.component.html',
    providers: [
        { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
    ]
})
export class OcrTextViewerComponent {
    @Input() ocrData: OcrResponse | null = null;
    @Input() isEditing: boolean = false;
    @Input() editingText: string = '';
    @Input() showPdfPreview: boolean = false;
    @Input() taskId: number = 0; // Añadir esta propiedad para recibir el ID de la tarea
    @Output() showPdfPreviewChange = new EventEmitter<boolean>();
    @Output() editClicked = new EventEmitter<void>();
    @Output() cancelEditing = new EventEmitter<void>();
    @Output() textChanged = new EventEmitter<string>();
    @Output() pageChange = new EventEmitter<number>();
    @Output() pdfVisibilityChange = new EventEmitter<boolean>();
    @Input() currentPage: number = 1;
    pagesPerView: number = 3;
    totalPages: number = 0;
    visible: boolean = false;
    showAnnotation: boolean = false;
    annotation: string = '';
    activeUserId: string = '';
    isVoluntario: boolean = false;

    // Configuración de TinyMCE para modo visualización (solo lectura)
    tinyMceViewConfig = {
        base_url: '/tinymce',
        suffix: '.min',
        plugins: 'autoresize',
        toolbar: false,
        menubar: false,
        min_height: 300,
        max_height: 600,
        readonly: true,
        resize: false,
        autoresize_bottom_margin: 16,
        autoresize_overflow_padding: 16,
        content_style: `
            body { 
                font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; 
                font-size: 16px; 
                line-height: 1.6;
                padding: 1rem;
                color: #374151;
                background-color: #f9fafb !important;
                margin: 0;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            body.dark-mode { 
                background-color: #374151 !important; 
                color: #E5E7EB; 
            }
            p {
                margin: 0 0 1em 0;
                line-height: 1.6;
            }
            @media (max-width: 768px) {
                body {
                    font-size: 14px;
                    padding: 0.75rem;
                }
            }
        `,
        skin: document.body.classList.contains('app-dark') ? 'oxide-dark' : 'oxide',
        content_css: document.body.classList.contains('app-dark') ? 'dark' : 'default',
        promotion: false,
        browser_spellcheck: false,
        language: 'es',
        language_url: '/tinymce/langs/es.js'
    };

    // Configuración de TinyMCE para modo edición
    tinyMceConfig = {
        base_url: '/tinymce',
        suffix: '.min',
        plugins: 'autoresize lists link table code help wordcount visualchars charmap paste searchreplace',
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | searchreplace | help | visualchars | charmap',
        min_height: 400,
        max_height: 800,
        menubar: false,
        readonly: false,
        resize: 'both' as const,
        autoresize_bottom_margin: 16,
        autoresize_overflow_padding: 16,
        paste_as_text: true,
        paste_remove_styles: false,
        content_style: `
            body { 
                font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; 
                font-size: 16px; 
                line-height: 1.6;
                padding: 1rem;
                color: #374151;
                background-color: #ffffff !important;
                margin: 0;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            body.dark-mode { 
                background-color: #1F2937 !important; 
                color: #E5E7EB; 
            }
            p:after {
                content: '¶';
                color: #999;
                margin-left: 5px;
            p {
                margin: 0 0 1em 0;
                line-height: 1.6;
            }
            @media (max-width: 768px) {
                body {
                    font-size: 14px;
                    padding: 0.75rem;
                }
            }
        `,
        skin: document.body.classList.contains('app-dark') ? 'oxide-dark' : 'oxide',
        content_css: document.body.classList.contains('app-dark') ? 'dark' : 'default',
        promotion: false,
        browser_spellcheck: true,
        language: 'es',
        language_url: '/tinymce/langs/es.js',
        mobile: {
            theme: 'mobile' as const,
            plugins: 'autoresize lists link',
            toolbar: 'undo redo | bold italic | bullist numlist'
        }
    };

    constructor(
        private orderParagraphService: OrderParagraphService, 
        private messageService: MessageService, 
        private route: ActivatedRoute,
        private authService: AuthService,
        private paragraphAnnotationService: ParagraphAnnotationService,
        private toastService: ToastService,
        private orderService: OrderService // Añadir el servicio OrderService
    ){}

    ngOnInit() {
        if (this.ocrData) {
        this.totalPages = this.ocrData.metadata.totalPages;
        }
        
        this.authService.getCurrentUser().subscribe({
            next: (userData) => {
                this.activeUserId = userData?.id || '';
            },
            error: (error) => {
                this.toastService.showError('Error al cargar el usuario.');
                console.error('Error al cargar el id:', error);
            },
        });
        this.isVoluntario = this.authService.hasRole('Voluntario');
    }

    onShowAnnotation(){
        this.showAnnotation = !this.showAnnotation;
    }

    showDialog() {
      this.visible = !this.visible;
  }

    getCurrentPage(): OcrPage | undefined {
        if (!this.ocrData) return undefined;
        var ocr = this.ocrData.pages.find((page: OcrPage) => page.number === this.currentPage);
        if (!ocr) return undefined;

        var text = ocr?.text || '';

        ocr.words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        ocr.characters = text.length;

        return ocr;
    }

    checkLowConfidence(): boolean {
        const currentPage = this.getCurrentPage();
        return currentPage ? currentPage.confidence < 70 : false;
    }
    
    downloadPdf(): void {
        if (!this.taskId || this.taskId <= 0) {
            this.toastService.showError('ID de tarea inválido. No se puede descargar el archivo.');
            return;
        }

        // Obtener el nombre del archivo desde los metadatos del OCR si está disponible
        const fileName = this.ocrData?.metadata?.fileName.split("\\").pop() || 'documento.pdf';

        this.orderService.downloadFile(this.taskId).subscribe({
            next: (blob) => {
                saveAs(blob, fileName);
                this.toastService.showSuccess('Archivo descargado correctamente');
            },
            error: (error) => {
                this.toastService.showError('Error al descargar el archivo');
                console.error('Error al descargar el archivo:', error);
            }
        });
    }

    onStartEditing(): void {
        const currentPage = this.getCurrentPage();
        if (currentPage) {
            this.editingText = currentPage.text;
            this.isEditing = true;
        }
    }

    onStartAnnotation(): void {
        const currentPage = this.getCurrentPage();
        if (currentPage) {
            this.showDialog();
        }
    }

    onSaveAnnotation(): void {
        if (!this.ocrData) return;
        const orderId = Number(this.route.snapshot.paramMap.get('id'));
        const body: Annotation = {
                orderId: orderId,
                paragraphId: this.currentPage,
                userId: this.activeUserId,
                annotationText: this.annotation
            };

    this.paragraphAnnotationService.saveErrorMessageParagraph(body).subscribe({
        next: () => {
            this.showDialog();
            this.toastService.showSuccess('La anotación se guardó correctamente');
        },
        error: (error) => {
            console.error('Error al guardar los cambios:', error);
            this.toastService.showError('No se pudo guardar la anotación.');
        }
    });
    this.annotation = '';
    
}

    onSaveChanges(): void {
        if (!this.ocrData || !this.isEditing) return;
        const orderId = Number(this.route.snapshot.paramMap.get('id'));
        const pageIndex = this.ocrData.pages.findIndex((page: OcrPage) => page.number === this.currentPage);
        if (pageIndex !== -1) {
        // Actualizar el texto
        this.ocrData.pages[pageIndex].text = this.editingText;
        
        // Recalcular caracteres y palabras
        this.ocrData.pages[pageIndex].characters = this.editingText.length;
        this.ocrData.pages[pageIndex].words = this.countWords(this.editingText);
        
        // Recalcular estadísticas globales
        this.recalculateStats();

        const body: ProcessParagraphRequest = {
            orderId: orderId,
            paragraphText: this.editingText,
            pageNumber: this.currentPage,
            hasError: false,
            errorMessage: ''
            };
        
            body.paragraphText = this.editingText;
            body.pageNumber = this.currentPage;
            body.hasError = false;
            body.errorMessage = '';

            this.orderParagraphService.processParagraphs(body).subscribe({
                next: () => {
                    this.toastService.showSuccess('Los cambios se guardaron correctamente');
                    this.isEditing = false;
                },
                error: (error) => {
                    console.error('Error al guardar los cambios:', error);
                    this.toastService.showError('No se pudieron guardar los cambios.');
                }
            });
        }

    }

    private countWords(text: string): number {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    private recalculateStats(): void {
        if (!this.ocrData) return;
        
        let totalCharacters = 0;
        let totalWords = 0;
        
        this.ocrData.pages.forEach((page: OcrPage) => {
        totalCharacters += page.characters;
        totalWords += page.words;
        });
        
        this.ocrData.metadata.statistics.totalCharacters = totalCharacters;
        this.ocrData.metadata.statistics.totalWords = totalWords;
        this.ocrData.metadata.statistics.averageCharactersPerPage = 
        totalCharacters / this.ocrData.metadata.totalPages;
        this.ocrData.metadata.statistics.averageWordsPerPage = 
        totalWords / this.ocrData.metadata.totalPages;
    }

    goToPage(pageNumber: number): void {
        this.pageChange.emit(pageNumber);
    }
    togglePdfPreview(): void {
        this.showPdfPreview = !this.showPdfPreview;
        this.showPdfPreviewChange.emit(this.showPdfPreview);
    }
    
    // Getter para obtener el texto de la página actual para visualización
    get currentPageText(): string {
        return this.getCurrentPage()?.text || '';
    }
}

   
