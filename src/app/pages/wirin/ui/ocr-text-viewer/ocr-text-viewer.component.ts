import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OcrPage, OcrResponse } from '../../../../types/ocr.interface';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { OrderParagraphServiceService } from '../../../../services/orderParagraph.service';
import { ProcessParagraphRequest } from '../../../../types/Requests/ProcessParagraphRequest';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-ocr-text-viewer',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, PanelModule, ScrollPanelModule, ButtonModule, ToastModule],
    templateUrl: './ocr-text-viewer.component.html',
})
export class OcrTextViewerComponent {
    @Input() ocrData: OcrResponse | null = null;
    @Input() isEditing: boolean = false;
    @Input() editingText: string = '';
    @Output() editClicked = new EventEmitter<void>();
    @Output() cancelEditing = new EventEmitter<void>();
    @Output() textChanged = new EventEmitter<string>();
    @Output() pageChange = new EventEmitter<number>();
    @Input() currentPage: number = 1;
    pagesPerView: number = 5;
    totalPages: number = 0;

    constructor(private orderParagraphService: OrderParagraphServiceService, private messageService: MessageService, private route: ActivatedRoute){}

    ngOnInit() {
        if (this.ocrData) {
        this.totalPages = this.ocrData.metadata.totalPages;
        }
    }

    getCurrentPage(): OcrPage | undefined {
        if (!this.ocrData) return undefined;
        return this.ocrData.pages.find((page: OcrPage) => page.number === this.currentPage);
    }

    onStartEditing(): void {
        const currentPage = this.getCurrentPage();
        if (currentPage) {
            this.editingText = currentPage.text;
            this.editClicked.emit();
        }
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
          console.log('body:', body);

          this.orderParagraphService.processParagraphs(body).subscribe({
            next: (response) => {
              console.log('Respuesta del servidor:', response);
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
        this.pageChange.emit(pageNumber);
    }
    
}