import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../services/message/message.service';
import { Message } from '../../../types/message.interface';

@Component({
  selector: 'app-message-inbox',
  templateUrl: './message-inbox.component.html',
  //styleUrls: ['./message-inbox.component.css']
})
export class MessageInboxComponent implements OnInit {
  messages: Message[] = [];
  selectedMessage: Message | null = null;
  showComposer = false;
  newMessage: Partial<Message> = {};
  fileToSend?: File;
  userId: string = '';

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') ?? ''; // o desde authService
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessagesByUserId(this.userId).subscribe({
      next: (data) => this.messages = data,
      error: (err) => console.error('Error al cargar mensajes', err)
    });
  }

  viewMessage(msg: Message) {
    this.selectedMessage = msg;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fileToSend = input.files[0];
    }
  }

  sendMessage() {
    const msg: Partial<Message> = {
      ...this.newMessage,
      userFromId: this.userId,
      sender: 'Usuario actual',
      date: new Date(),
      isDraft: false,
      responded: false
    };

    this.messageService.sendMessage(msg, this.fileToSend).subscribe({
      next: () => {
        this.showComposer = false;
        this.newMessage = {};
        this.fileToSend = undefined;
        this.loadMessages();
      },
      error: err => console.error('Error al enviar mensaje', err)
    });
  }
}