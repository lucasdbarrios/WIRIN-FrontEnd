import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OcrPage, OcrResponse } from '../../../../types/ocr.interface';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { OrderParagraphService } from '../../../../services/orderParagraph.service';
import { ProcessParagraphRequest } from '../../../../types/Requests/ProcessParagraphRequest';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ApiService } from '../../../../services/api.service';
import { MessageRequest } from '../../../../types/Requests/MessageRequest';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

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
    showPdfPreview: boolean = true;
    @Output() editClicked = new EventEmitter<void>();
    @Output() cancelEditing = new EventEmitter<void>();
    @Output() textChanged = new EventEmitter<string>();
    @Output() pageChange = new EventEmitter<number>();
    @Output() pdfVisibilityChange = new EventEmitter<boolean>();
    @Input() currentPage: number = 1;
    pagesPerView: number = 3;
    totalPages: number = 0;
    visible: boolean = false;
    annotation: string = '';
    tinyMceConfig = {
        base_url: '/tinymce',
        suffix: '.min',
        plugins: 'lists link image table code help wordcount visualblocks visualchars charmap',
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | help | visualblocks | visualchars | charmap',
        height: 350,
        menubar: false,
        content_style: `
            body { 
                font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; 
                font-size: 14px; 
                padding: 0.5rem;
                color: #374151;
            }
            body.dark-mode { 
                background-color: #1F2937; 
                color: #E5E7EB; 
            }
            p:after {
                content: '¶';
                color: #999;
                margin-left: 5px;
            }
        `,
        skin: document.body.classList.contains('app-dark') ? 'oxide-dark' : 'oxide',
        content_css: document.body.classList.contains('app-dark') ? 'dark' : 'default',
        promotion: false,
        browser_spellcheck: true,
        language: 'es',
        language_url: '/tinymce/langs/es.js',
        visualblocks_default_state: true,
        visualchars_default_state: true
    };

    constructor(
      private orderParagraphService: OrderParagraphService, 
      private messageService: MessageService, 
      private route: ActivatedRoute,
      private apiService: ApiService
    ){}

    ngOnInit() {
        if (this.ocrData) {
        this.totalPages = this.ocrData.metadata.totalPages;
        }
    }

    showDialog() {
      this.visible = true;
  }

    getCurrentPage(): OcrPage | undefined {
        if (!this.ocrData) return undefined;
        var ocr = this.ocrData.pages.find((page: OcrPage) => page.number === this.currentPage);
        console.log("Texto obtenido:", ocr?.text)
        return ocr;
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
        /* const message: MessageRequest = {
            orderId: Number(this.route.snapshot.paramMap.get('id')),
            message: this.annotation,
            pageNumber: this.currentPage,
            userId: 1,
            userName: 'Usuario'
        }
        this.apiService.post('api/message/sendMessage', ) */
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
            next: (response: any) => {
              this.isEditing = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Los cambios se guardaron correctamente',
                life: 3000
              });
            },
            error: (error) => {
              console.error('Error al guardar los cambios:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron guardar los cambios. Por favor, intente nuevamente.',
                life: 3000
              });
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
      console.log('Changing to page:', pageNumber);
        this.pageChange.emit(pageNumber);
    }
    togglePdfPreview(): void {
      this.showPdfPreview = !this.showPdfPreview;
      this.pdfVisibilityChange.emit(this.showPdfPreview);
  }
    
}

