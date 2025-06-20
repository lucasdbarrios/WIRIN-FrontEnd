import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../services/message/message.service';
import { Message } from '../../../types/message.interface';
import { MessageService as PrimeToastService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-gmail-style',
  templateUrl: './message-inbox.component.html',
  providers: [PrimeToastService, ConfirmationService, ButtonModule, CommonModule, FormsModule, ToastModule, TableModule, TagModule, DialogModule, InputTextModule]
})
export class GmailStyleComponent implements OnInit {
  userId: string = '';
  messages: Message[] = [];
  activeFolder: 'inbox' | 'sent' | 'drafts' = 'inbox';

  selectedMessage: Message | null = null;
  showViewer = false;

  showComposer = false;
  newMessage: Partial<Message> = {};
  fileToSend?: File;
  quickReply: string = '';

  constructor(
    private messageService: MessageService,
    private toast: PrimeToastService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') ?? '';
    this.loadMessages();
    this.loadDraft();
    setInterval(() => this.saveDraftLocally(), 5000);
  }

  loadMessages(): void {
    this.messageService.getMessagesByUserId(this.userId).subscribe({
      next: (msgs) => {
        this.messages = this.filterByFolder(msgs);
      },
      error: (err) => console.error('Error al cargar mensajes', err)
    });
  }

  filterByFolder(all: Message[]): Message[] {
    switch (this.activeFolder) {
      case 'inbox':
        return all.filter(m => m.studentId);
      case 'sent':
        return all.filter(m => m.userFromId === this.userId && !m.isDraft);
      case 'drafts':
        return all.filter(m => m.isDraft);
      default:
        return all;
    }
  }

  viewMessage(msg: Message): void {
    this.selectedMessage = msg;
    this.showViewer = true;
  }

  sendReply(): void {
    if (!this.selectedMessage || !this.quickReply) return;

    const updated: Partial<Message> = {
      ...this.selectedMessage,
      responded: true,
      responseText: this.quickReply
    };

    this.messageService.updateMessage(updated).subscribe(() => {
      this.toast.add({ severity: 'success', summary: 'Respuesta enviada', life: 2500 });
      this.quickReply = '';
      this.showViewer = false;
      this.loadMessages();
    });
  }

  sendMessage(): void {
    const msg: Partial<Message> = {
      ...this.newMessage,
      userFromId: this.userId,
      sender: 'Usuario actual',
      date: new Date(),
      isDraft: false,
      responded: false
    };

    this.messageService.sendMessage(msg, this.fileToSend).subscribe(() => {
      this.toast.add({ severity: 'success', summary: 'Mensaje enviado', life: 2500 });
      this.showComposer = false;
      this.clearDraft();
      this.loadMessages();
    });
  }

  saveDraft(): void {
    const draft = {
      ...this.newMessage,
      isDraft: true,
      userFromId: this.userId,
      sender: 'Usuario actual'
    };

    this.messageService.sendMessage(draft, this.fileToSend).subscribe(() => {
      this.toast.add({ severity: 'success', summary: 'Borrador guardado', life: 2500 });
      this.loadMessages();
      this.clearDraft();
      this.showComposer = false;
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fileToSend = input.files[0];
    }
  }

  saveDraftLocally(): void {
    const key = `message_draft_${this.userId}`;
    localStorage.setItem(key, JSON.stringify(this.newMessage));
    this.toast.add({
      severity: 'info',
      summary: 'Borrador guardado',
      detail: 'Se guardó automáticamente en tu dispositivo.',
      life: 2000
    });
  }

  loadDraft(): void {
    const key = `message_draft_${this.userId}`;
    const saved = localStorage.getItem(key);
    if (saved) this.newMessage = JSON.parse(saved);
  }

  clearDraft(): void {
    const key = `message_draft_${this.userId}`;
    localStorage.removeItem(key);
    this.newMessage = {};
    this.fileToSend = undefined;
  }
}