import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService, MessageFolder, MessageUpdateType } from '../../../services/message/message.service';
import { Message } from '../../../types/message.interface';
import { User } from '../../../types/user.interface';
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
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { AutoRefreshService } from '../../../services/auto-refresh/auto-refresh.service';
import { Observable, Subscription, finalize } from 'rxjs';
import { UserService } from '../../../services/user/user.service';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AuthService } from '../../../services/auth/auth.service';

interface GroupedMessage {
  recipientId: string;
  recipientName: string;
  messages: Message[];
  lastMessageDate: Date;
  messageCount: number;
}


@Component({
  selector: 'app-gmail-style',
  templateUrl: './message-inbox.component.html',
  standalone: true,
  imports: [
    // Módulos Angular
    CommonModule,
    FormsModule,
    
    // Módulos PrimeNG
    ButtonModule,
    ToastModule,
    TableModule,
    TagModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    FileUploadModule,
    InputIconModule,
    ConfirmDialogModule,
    TooltipModule,
    TabViewModule,
    DropdownModule,
    SelectButtonModule,
    CardModule
  ],
  providers: [PrimeToastService, ConfirmationService],
  styleUrls: ["./message-inbox.component.scss"],
})
export class GmailStyleComponent implements OnInit, OnDestroy {
  userId: string = '';
  messages: Message[] = [];
  allMessages: Message[] = [];
  groupedSentMessages: GroupedMessage[] = [];
  activeFolder: 'inbox' | 'sent' = 'inbox';
  
  folderOptions = [
    { label: 'Recibidos', value: 'inbox', icon: 'pi pi-inbox' },
    { label: 'Enviados', value: 'sent', icon: 'pi pi-send' }
  ];
  isLoading: boolean = false;

  selectedMessage: Message | null = null;
  senderInfo: User | null = null;
  recipientInfo: User | null = null;
  showViewer = false;
  showReplyDialog = false;
  showConversationModal = false;
  showConversationReplyInput = false;
  quickReply: string = '';

  showComposer = false;
  newMessage: Partial<Message> = {};
  fileToSend?: File;
  composerSubmitted: boolean = false;
  recipientOptions: any[] = [];
  selectedStudent: any = null;
  selectedRole: string = 'alumno';
  roleOptions: any[] = [
    { label: 'Alumno', value: 'alumno' },
    { label: 'Bibliotecario', value: 'bibliotecario' },
    { label: 'Voluntario', value: 'Voluntario' },
    { label: 'Revisor', value: 'Voluntario Administrativo' }
  ];
  
  private messagesSubscription?: Subscription;
  
  getFolderLabel(folderValue: string): string {
    const folder = this.folderOptions.find(opt => opt.value === folderValue);
    return folder ? folder.label : folderValue;
  }
  
  getRoleDisplayName(roleValue: string): string {
    switch(roleValue) {
      case 'alumno': return 'Alumno';
      case 'bibliotecario': return 'Bibliotecario';
      case 'Voluntario': return 'Voluntario';
      case 'Voluntario Administrativo': return 'Revisor';
      default: return roleValue;
    }
  }
  
  getDisplayName(message: Message): string {
    if (this.activeFolder === 'sent') {
      return message.recipientName || 'Cargando...';
    }
    return message.senderName || 'Cargando...';
  }

  onFolderChange(folder: 'inbox' | 'sent'): void {
    this.activeFolder = folder;
    this.refreshMessages();
  }

  replyToMessageFromTable(message: Message): void {
    this.selectedMessage = message;
    this.loadUserInfoForMessage(message);
    this.showReplyDialog = true;
  }

  private groupSentMessagesByRecipient(messages: Message[]): GroupedMessage[] {
    const grouped = new Map<string, GroupedMessage>();
    
    messages.forEach(message => {
      const recipientId = message.userToId || '';
      const recipientName = message.recipientName || 'Cargando...';
      
      if (!grouped.has(recipientId)) {
        grouped.set(recipientId, {
          recipientId,
          recipientName,
          messages: [],
          lastMessageDate: new Date(message?.date || ''),
          messageCount: 0
        });
      } else {
        // Actualizar el nombre si ahora tenemos uno mejor
        const group = grouped.get(recipientId)!;
        if (recipientName !== 'Cargando...' && recipientName !== 'Usuario desconocido') {
          group.recipientName = recipientName;
        }
      }
      
      const group = grouped.get(recipientId)!;
      group.messages.push(message);
      group.messageCount++;
      
      const messageDate = new Date(message?.date || '');
      if (messageDate > group.lastMessageDate) {
        group.lastMessageDate = messageDate;
      }
    });
    
    return Array.from(grouped.values()).sort((a, b) => 
      b.lastMessageDate.getTime() - a.lastMessageDate.getTime()
    );
  }



  private loadUserInfo(userId: string, type: 'sender' | 'recipient', message?: Message): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        console.log(`Información del ${type} obtenida:`, user);
        if (type === 'sender') {
          this.senderInfo = user;
          if (message && user?.fullName) {
            message.sender = user.fullName;
            message.senderName = user.fullName;
          }
        } else {
          this.recipientInfo = user;
          if (message && user?.fullName) {
            message.recipientName = user.fullName;
          }
        }
      },
      error: (err) => {
        console.error(`Error al obtener información del ${type}:`, err);
      }
    });
  }

  private loadUserInfoForMessages(messages: Message[]): void {
    messages.forEach(msg => {
      if (this.activeFolder === 'sent' && msg.userToId) {
        this.userService.getUserById(msg.userToId).subscribe({
          next: (user) => {
            if (user?.fullName) {
              msg.recipientName = user.fullName;
              msg.loadingRecipientInfo = false;
              // Reagrupar mensajes después de cargar la información del usuario
              if (this.activeFolder === 'sent') {
                this.groupedSentMessages = this.groupSentMessagesByRecipient(this.messages);
              }
            }
          },
          error: () => {
            msg.loadingRecipientInfo = false;
          }
        });
      } else if (this.activeFolder === 'inbox' && msg.userFromId) {
        this.userService.getUserById(msg.userFromId).subscribe({
          next: (user) => {
            if (user?.fullName) {
              msg.senderName = user.fullName;
              msg.loadingSenderInfo = false;
            }
          },
          error: () => {
            msg.loadingSenderInfo = false;
          }
        });
      }
    });
  }

  private loadUserInfoForMessage(message: Message): void {
    if (message.userFromId) {
      this.loadUserInfo(message.userFromId, 'sender', message);
    }
    if (message.userToId) {
      this.loadUserInfo(message.userToId, 'recipient', message);
    }
  }
  
  onRoleChange(event: any): void {
    this.selectedRole = event.value;
    this.selectedStudent = null;
    this.loadUsersByRole(this.selectedRole);
  }
  
  private messages$?: Observable<Message[]>;
  private autosaveInterval?: any;

  constructor(
    private messageService: MessageService,
    private toast: PrimeToastService,
    private autoRefreshService: AutoRefreshService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user && user.id) {
          this.userId = user.id;
          console.log('Usuario ID inicializado:', this.userId);
          this.setupAutoRefresh();
          this.loadDraft();
        } else {
          console.error('No se pudo obtener el ID del usuario');
        }
      },
      error: (err) => {
        console.error('Error al obtener el usuario actual', err);
      }
    });
    
    this.loadUsersByRole(this.selectedRole);
    
    this.autosaveInterval = setInterval(() => {
      if (this.showComposer && (this.newMessage.subject || this.newMessage.content || this.newMessage.userToId)) {
        this.saveDraftLocally();
      }
    }, 30000);
  }
  


  loadUsersByRole(role: string): void {
    this.userService.getUsersByRole(role).subscribe({
      next: (users) => {
        this.recipientOptions = users.map(user => ({
          label: `${user.fullName} (${user.email})`,
          value: user.id
        }));
      },
      error: (err) => {
        console.error(`Error al cargar usuarios con rol ${role}:`, err);
        this.toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: `No se pudieron cargar los usuarios con rol ${role}. Intente nuevamente.`, 
          life: 3000 
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
      console.log('Suscripción a mensajes cancelada');
    }
    
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }
    
    if (this.showComposer && (this.newMessage.subject || this.newMessage.content || this.newMessage.userToId)) {
      const key = `message_draft_${this.userId}`;
      localStorage.setItem(key, JSON.stringify(this.newMessage));
      console.log('Borrador guardado al salir');
    }
  }
  
  setupAutoRefresh(): void {
    this.messages$ = this.autoRefreshService.createAutoRefreshObservable(
      () => {
        this.isLoading = true;
        return this.messageService.getMessagesByFolder(this.getMessageFolderEnum()).pipe(
          finalize(() => this.isLoading = false)
        );
      },
      30000
    );
    
    this.messagesSubscription = this.messages$.subscribe({
      next: (msgs) => {
          msgs.forEach(msg => {
            msg.recipientName = null;
            msg.loadingRecipientInfo = false;
            msg.senderName = null;
            msg.loadingSenderInfo = false;
          });
          
          this.allMessages = msgs;
          this.messages = msgs;
          
          if (this.activeFolder === 'sent') {
            this.groupedSentMessages = this.groupSentMessagesByRecipient(msgs);
          }
          
          this.loadUserInfoForMessages(msgs);
        },
      error: (err) => {
        console.error('Error al cargar mensajes', err);
        this.isLoading = false;
        this.toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'No se pudieron cargar los mensajes. Intente nuevamente.', 
          life: 3000 
        });
      }
    });
  }
  
  refreshMessages(): void {
    this.isLoading = true;
    
    this.senderInfo = null;
    this.recipientInfo = null;
    
    this.messageService.getMessagesByFolder(this.getMessageFolderEnum())
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (msgs) => {
          msgs.forEach(msg => {
            msg.recipientName = null;
            msg.loadingRecipientInfo = false;
            msg.senderName = null;
            msg.loadingSenderInfo = false;
          });
          
          this.allMessages = msgs;
          this.messages = msgs;
          
          if (this.activeFolder === 'sent') {
            this.groupedSentMessages = this.groupSentMessagesByRecipient(msgs);
          }
          
          this.loadUserInfoForMessages(msgs);
        },
        error: (err) => {
          console.error('Error al cargar mensajes', err);
          this.isLoading = false;
          this.toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No se pudieron cargar los mensajes. Intente nuevamente.', 
            life: 3000 
          });
        }
      });
  }

  loadMessages(): void {
    this.isLoading = true;
    this.senderInfo = null;
    this.recipientInfo = null;
    
    this.getMessagesByActiveFolder()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (msgs) => {
          msgs.forEach(msg => {
            msg.recipientName = null;
            msg.loadingRecipientInfo = false;
            msg.senderName = null;
            msg.loadingSenderInfo = false;
          });
          
          this.allMessages = msgs;
          this.messages = msgs;
          
          if (this.activeFolder === 'sent') {
            this.groupedSentMessages = this.groupSentMessagesByRecipient(msgs);
          }
          
          this.loadUserInfoForMessages(msgs);
          
          console.log(`Cargados ${msgs.length} mensajes en carpeta ${this.activeFolder}`);
        },
        error: (err) => {
          console.error('Error al cargar mensajes', err);
          this.toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No se pudieron cargar los mensajes. Intente nuevamente.', 
            life: 3000 
          });
        }
      });
  }

  private getMessageFolderEnum(): MessageFolder {
    const folderMapping = {
      'inbox': MessageFolder.INBOX,
      'sent': MessageFolder.SENT,
      'all': MessageFolder.ALL
    };
    
    return folderMapping[this.activeFolder] || MessageFolder.ALL;
  }
  
  getMessagesByActiveFolder(): Observable<Message[]> {
    return this.messageService.getMessagesByFolder(this.getMessageFolderEnum());
  }
  
  filterByFolder(all: Message[]): Message[] {
    if (!all || all.length === 0) {
      return [];
    }
    
    switch (this.activeFolder) {
      case 'inbox':
        return all.filter(m => m.userToId === this.userId && !m.isDraft);
      case 'sent':
        return all.filter(m => m.userFromId === this.userId && !m.isDraft);
      default:
        return all;
    }
  }

  viewMessage(msg: Message | Message[] | undefined): void {
    if (!msg) return;
    
    const message = Array.isArray(msg) ? msg[0] : msg;
    if (!message) return;
    
    this.selectedMessage = message;
    this.showViewer = true;
    this.quickReply = '';
    
    this.senderInfo = null;
    this.recipientInfo = null;
    
    if (message.userFromId) {
      this.loadUserInfo(message.userFromId, 'sender', message);
    }
    
    if (message.userToId) {
      this.loadUserInfo(message.userToId, 'recipient', message);
    }
    
    if (!message.isRead) {
      this.markAsRead(message.id);
    }
  }
  
  showMessageDetailsModal = false;
  messageDetailsData: Message | null = null;
  formattedMessageDate: string = '';
  senderFullName: string = '';
  recipientFullName: string = '';

  showMessageDetails(message?: Message): void {
    const msg = message || this.selectedMessage;
    if (!msg) return;
    
    this.messageDetailsData = msg;
    
    this.formattedMessageDate = new Date(msg.date).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    this.senderFullName = this.senderInfo?.fullName || msg.senderName || msg.sender || 'Desconocido';
    this.recipientFullName = this.activeFolder === 'sent' 
      ? (this.recipientInfo?.fullName || msg.recipientName || 'Destinatario')
      : (this.recipientInfo?.fullName || 'Usuario actual');
    
    this.showMessageDetailsModal = true;
  }
  
  viewConversation(msg: Message | Message[] | undefined): void {
    if (!msg) return;
    
    const message = Array.isArray(msg) ? msg[0] : msg;
    if (!message) return;
    
    console.log('Iniciando visualización de conversación con mensaje:', message);
    
    this.selectedMessage = message;
    this.showConversationModal = true;
    this.quickReply = '';
    
    setTimeout(() => {
      this.showConversationReplyInput = false;
    });
    
    this.senderInfo = null;
    this.recipientInfo = null;
    
    if (message.userFromId) {
      this.loadUserInfo(message.userFromId, 'sender', message);
    }
    
    if (message.userToId) {
      this.loadUserInfo(message.userToId, 'recipient', message);
    }
    
    const otherUserId = message.userFromId === this.userId ? message.userToId : message.userFromId;
    if (otherUserId) {
      const conversationMessages = this.getConversationHistory(message);
      console.log('Mensajes en la conversación:', conversationMessages.length);
      
      conversationMessages.forEach(msg => {
        if (msg.userFromId && msg.userFromId !== this.userId) {
          this.userService.getUserById(msg.userFromId).subscribe({
            next: (user) => {
              if (user && user.fullName) {
                console.log(`Actualizando nombre de remitente para mensaje ${msg.id}:`, user.fullName);
                msg.sender = user.fullName;
              }
            },
            error: (err) => {
              console.error(`Error al obtener información del remitente para mensaje ${msg.id}:`, err);
            }
          });
        }
      });
    }
    
    if (!message.isRead) {
      this.markAsRead(message.id);
    }
  }
  
  onCloseConversationModal(): void {
    this.showConversationModal = false;
    
    setTimeout(() => {
      this.showConversationReplyInput = false;
    });
    
    if (!this.showReplyDialog) {
      this.quickReply = '';
    }
  }
  
  toggleConversationReplyInput(): void {
    setTimeout(() => {
      this.showConversationReplyInput = !this.showConversationReplyInput;
    });
  }

  getConversationPartnerName(): string {
    if (!this.selectedMessage) return 'Conversación';
    
    if (this.selectedMessage.userFromId === this.userId) {
      if (this.recipientInfo && this.recipientInfo.fullName) {
        return 'Conversación con ' + this.recipientInfo.fullName;
      } else if (this.selectedMessage.userToId) {
        this.userService.getUserById(this.selectedMessage.userToId).subscribe({
          next: (user) => {
            console.log('Información del destinatario obtenida (conversación partner):', user);
            this.recipientInfo = user;
          },
          error: (err) => {
            console.error('Error al obtener información del destinatario (conversación partner):', err);
          }
        });
        return 'Conversación con ' + (this.selectedMessage.sender || 'Destinatario');
      } else {
        return 'Conversación';
      }
    } else {
      if (this.senderInfo && this.senderInfo.fullName) {
        return 'Conversación con ' + this.senderInfo.fullName;
      } else if (this.selectedMessage.userFromId) {
        this.userService.getUserById(this.selectedMessage.userFromId).subscribe({
          next: (user) => {
            console.log('Información del remitente obtenida (conversación partner):', user);
            this.senderInfo = user;
          },
          error: (err) => {
            console.error('Error al obtener información del remitente (conversación partner):', err);
          }
        });
        return 'Conversación con ' + (this.selectedMessage.sender || 'Remitente');
      } else {
        return 'Conversación con ' + (this.selectedMessage.sender || 'Remitente');
      }
    }
  }
  
  markAsRead(messageId?: number): void {
    if (!messageId) return;
    
    this.messageService.updateMessageStatus(messageId, MessageUpdateType.READ).subscribe({
      next: () => {
        // Actualizar el mensaje seleccionado
        if (this.selectedMessage && this.selectedMessage.id === messageId) {
          this.selectedMessage.isRead = true;
        }
        
        // Actualizar el mensaje en el array de mensajes
        const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          this.messages[messageIndex].isRead = true;
        }
        
        // Actualizar también en allMessages si es diferente
        const allMessageIndex = this.allMessages.findIndex(msg => msg.id === messageId);
        if (allMessageIndex !== -1) {
          this.allMessages[allMessageIndex].isRead = true;
        }
        
        // Recargar mensajes para sincronizar con el servidor
        this.loadMessages();
      },
      error: (err) => {
        console.error('Error al marcar mensaje como leído', err);
      }
    });
  }
  
  confirmDeleteMessage(message?: Message): void {
    if (!message) return;
    
    this.confirmationService.confirm({
      key: 'deleteConfirmation',
      message: '¿Está seguro que desea eliminar este mensaje?',
      accept: () => {
        this.deleteMessage(message.id);
      }
    });
  }
  
  deleteMessage(messageId: number): void {
    this.messageService.updateMessageStatus(messageId, MessageUpdateType.DELETE).subscribe({
      next: () => {
        if (this.selectedMessage && this.selectedMessage.id === messageId) {
          this.showViewer = false;
          this.selectedMessage = null;
        }
        
        this.loadMessages();
        
        this.toast.add({ 
          severity: 'success', 
          summary: 'Mensaje eliminado', 
          detail: 'El mensaje ha sido eliminado correctamente', 
          life: 3000 
        });
      },
      error: (err) => {
        console.error('Error al eliminar mensaje', err);
        this.toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'No se pudo eliminar el mensaje. Intente nuevamente.', 
          life: 3000 
        });
      }
    });
  }
  
  onCloseViewer(): void {
    this.showViewer = false;
    this.quickReply = '';
    this.senderInfo = null;
    this.recipientInfo = null;
  }

  sendReply(): void {
    if (!this.selectedMessage || !this.quickReply) {
      if (!this.quickReply) {
        this.toast.add({ 
          severity: 'warn', 
          summary: 'Advertencia', 
          detail: 'Por favor, escriba una respuesta antes de enviar.', 
          life: 3000 
        });
      }
      return;
    }

    this.isLoading = true;
    const updated: Partial<Message> = {
      ...this.selectedMessage,
      responded: true,
      responseText: this.quickReply
    };

    this.messageService.updateMessage(updated)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Respuesta enviada', life: 2500 });
          this.quickReply = '';
          this.showViewer = false;
          this.selectedMessage = null;
          this.refreshMessages();
        },
        error: (err) => {
          console.error('Error al enviar respuesta', err);
          this.toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No se pudo enviar la respuesta. Intente nuevamente.', 
            life: 3000 
          });
        }
      });
  }
  



  sendMessage(): void {
    this.composerSubmitted = true;
    
    if (this.selectedStudent) {
      this.newMessage.userToId = this.selectedStudent;
    }
    
    if (!this.newMessage.userToId || !this.newMessage.subject || !this.newMessage.content) {
      this.toast.add({ 
        severity: 'warn', 
        summary: 'Campos incompletos', 
        detail: 'Por favor, complete todos los campos requeridos.', 
        life: 3000 
      });
      return;
    }

    this.isLoading = true;
    const msg: Partial<Message> = {
      ...this.newMessage,
      userFromId: this.userId,
      sender: 'Usuario actual',
      date: new Date(),
      isDraft: false,
      responded: false,
      isRead: true
    };

    this.messageService.sendMessage(msg, this.fileToSend)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.composerSubmitted = false;
      }))
      .subscribe({
        next: () => {
          const recipientType = this.getRoleDisplayName(this.selectedRole);
          this.toast.add({ 
            severity: 'success', 
            summary: 'Mensaje enviado', 
            detail: `Mensaje enviado correctamente al ${recipientType}`, 
            life: 2500 
          });
          this.showComposer = false;
          this.clearDraft();
          this.refreshMessages();
        },
        error: (err) => {
          console.error('Error al enviar mensaje', err);
          
          let errorMessage = 'No se pudo enviar el mensaje. Intente nuevamente.';
          
          if (err.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          } else if (err.status === 400) {
            errorMessage = 'Datos de mensaje inválidos. Verifique los campos e intente nuevamente.';
          } else if (err.status === 401 || err.status === 403) {
            errorMessage = 'No tiene permisos para enviar mensajes. Inicie sesión nuevamente.';
          } else if (err.status >= 500) {
            errorMessage = 'Error en el servidor. Por favor, intente más tarde.';
          }
          
          this.toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: errorMessage, 
            life: 5000 
          });
          
          if (err.status === 200 && err.error instanceof SyntaxError) {
            console.log('El mensaje probablemente se envió correctamente a pesar del error de parsing');
            this.showComposer = false;
            this.clearDraft();
            this.refreshMessages();
          }
        }
      });
  }

  saveDraft(): void {
    if (!this.newMessage.subject && !this.newMessage.content && !this.newMessage.userToId) {
      this.toast.add({ 
        severity: 'warn', 
        summary: 'Borrador vacío', 
        detail: 'No hay contenido para guardar como borrador.', 
        life: 3000 
      });
      return;
    }

    this.isLoading = true;
    const draft = {
      ...this.newMessage,
      isDraft: true,
      userFromId: this.userId,
      sender: 'Usuario actual',
      date: new Date()
    };

    this.messageService.sendMessage(draft, this.fileToSend)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Borrador guardado', life: 2500 });
          this.clearDraft();
          this.showComposer = false;
          this.refreshMessages();
        },
        error: (err) => {
          console.error('Error al guardar borrador', err);
          this.toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No se pudo guardar el borrador. Intente nuevamente.', 
            life: 3000 
          });
        }
      });
  }
  
  confirmDiscardDraft(): void {
    this.confirmationService.confirm({
      key: 'draftConfirmation',
      message: '¿Está seguro que desea descartar este borrador?',
      accept: () => {
        this.clearDraft();
        this.showComposer = false;
        this.toast.add({ 
          severity: 'info', 
          summary: 'Borrador descartado', 
          life: 2000 
        });
      }
    });
  }
  
  onCloseComposer(): void {
    if (this.newMessage.subject || this.newMessage.content || this.newMessage.userToId) {
      this.confirmationService.confirm({
        key: 'saveConfirmation',
        message: '¿Desea guardar el mensaje como borrador antes de cerrar?',
        accept: () => {
          this.saveDraftLocally();
          this.showComposer = false;
          this.composerSubmitted = false;
        },
        reject: () => {
          this.showComposer = false;
          this.composerSubmitted = false;
        }
      });
    } else {
      this.showComposer = false;
      this.composerSubmitted = false;
    }
  }

  onFileSelect(event: any): void {
    if (event.files?.length) {
      this.fileToSend = event.files[0];
      this.toast.add({
        severity: 'info',
        summary: 'Archivo seleccionado',
        detail: `${this.fileToSend?.name || ''} (${((this.fileToSend?.size || 0) / 1024).toFixed(1)} KB)`,
        life: 2000
      });
    }
  }
  
  removeAttachment(): void {
    this.fileToSend = undefined;
    this.toast.add({
      severity: 'info',
      summary: 'Archivo eliminado',
      detail: 'El archivo adjunto ha sido eliminado',
      life: 2000
    });
  }

  saveDraftLocally(): void {
    if (this.showComposer && (this.newMessage.subject || this.newMessage.content || this.newMessage.userToId)) {
      const key = `message_draft_${this.userId}`;
      localStorage.setItem(key, JSON.stringify(this.newMessage));
      console.log('Borrador guardado localmente:', new Date().toLocaleTimeString());
    }
  }

  loadDraft(): void {
    const key = `message_draft_${this.userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        this.newMessage = JSON.parse(saved);
        if (this.newMessage.userToId) {
          this.selectedStudent = this.newMessage.userToId;
        }
        console.log('Borrador cargado desde almacenamiento local');
      } catch (error) {
        console.error('Error al cargar el borrador:', error);
        localStorage.removeItem(key);
      }
    }
  }

  clearDraft(): void {
    const key = `message_draft_${this.userId}`;
    localStorage.removeItem(key);
    this.newMessage = {};
    this.selectedStudent = null;
    this.fileToSend = undefined;
  }
  
  composeNewMessage(): void {
    this.clearDraft();
    this.selectedRole = 'alumno';
    this.loadUsersByRole(this.selectedRole);
    this.showComposer = true;
    this.composerSubmitted = false;
  }
  
  getSelectedRecipientLabel(): string {
    if (!this.selectedStudent || !this.recipientOptions || this.recipientOptions.length === 0) {
      return '';
    }
    const recipient = this.recipientOptions.find(r => r.value === this.selectedStudent);
    return recipient ? recipient.label : '';
  }
  
  replyToMessage(): void {
    if (!this.selectedMessage) return;
    
    this.quickReply = '';
    
    if (this.showConversationModal) {
      setTimeout(() => {
        this.showConversationReplyInput = true;
      });
      
      setTimeout(() => {
        const textarea = document.querySelector('.p-inputgroup textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    } else {
      this.showReplyDialog = true;
      
      setTimeout(() => {
        const textarea = document.querySelector('#replyContent') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  }



  getConversationHistory(message: Message): Message[] {
    if (!message || !this.messages) {
      return [];
    }

    console.log('Obteniendo historial de conversación para mensaje:', message);

    const conversationMessages = this.allMessages.filter(msg => 
      ((msg.userFromId === message.userFromId && msg.userToId === message.userToId) ||
       (msg.userFromId === message.userToId && msg.userToId === message.userFromId)) &&
      !msg.deleted
    );

    console.log('Mensajes filtrados en la conversación:', conversationMessages.length);

    conversationMessages.forEach(msg => {
      if (msg.userFromId === this.userId) {
        if (!msg.sender) {
          msg.sender = 'Tú';
        }
      } 
      else if (msg.userFromId) {
        if (msg.senderName) {
          msg.sender = msg.senderName;
        }
        else if (this.senderInfo && this.senderInfo.id === msg.userFromId && this.senderInfo.fullName) {
          msg.sender = this.senderInfo.fullName;
          msg.senderName = this.senderInfo.fullName;
        } 
        else if (this.recipientInfo && this.recipientInfo.id === msg.userFromId && this.recipientInfo.fullName) {
          msg.sender = this.recipientInfo.fullName;
          msg.senderName = this.recipientInfo.fullName;
        }
        else if (!msg.loadingSenderInfo) {
          msg.loadingSenderInfo = true;
          
          this.userService.getUserById(msg.userFromId).subscribe({
            next: (user) => {
              if (user && user.fullName) {
                msg.senderName = user.fullName;
                msg.sender = user.fullName;
              }
              msg.loadingSenderInfo = false;
            },
            error: (err) => {
              console.error('Error al obtener información del remitente:', err);
              msg.loadingSenderInfo = false;
            }
          });
        }
      }
    });

    return conversationMessages.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateA - dateB;
    });
  }

  downloadAttachment(messageId: string | number): void {
    window.open('/api/messages/file/' + messageId, '_blank');
  }

  getUnreadCount(): number {
    if (!this.messages) {
      return 0;
    }
    
    return this.messages.filter(msg => 
      !msg.isRead && 
      !msg.deleted && 
      this.activeFolder === 'inbox'
    ).length;
  }

  onQuickReplyKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.sendQuickReply();
      this.toggleConversationReplyInput();
    }
  }

  sendQuickReply(): void {
    if (!this.quickReply || !this.selectedMessage) {
      if (this.toast) {
        this.toast.add({ 
          severity: 'warn', 
          summary: 'Advertencia', 
          detail: 'Por favor, escribe un mensaje antes de enviar.', 
          life: 3000 
        });
      }
      return;
    }
    
    console.log('Enviando respuesta rápida al mensaje:', this.selectedMessage);
    
    if (this.isLoading !== undefined) {
      this.isLoading = true;
    }
    
    const selectedMessage = this.selectedMessage;
    const userId = this.userId;
    
    const otherUserId = selectedMessage.userFromId === userId ? 
                selectedMessage.userToId : 
                selectedMessage.userFromId;
    
    if (otherUserId && (!this.senderInfo || !this.recipientInfo)) {
      const userType = selectedMessage.userFromId === userId ? 'recipient' : 'sender';
      this.loadUserInfo(otherUserId, userType);
    }
    
    const reply: Partial<Message> = {
      userFromId: userId,
      userToId: selectedMessage.userFromId === userId ? 
                selectedMessage.userToId : 
                selectedMessage.userFromId,
      subject: `RE: ${selectedMessage.subject || ''}`,
      content: this.quickReply || '',
      date: new Date(),
      isDraft: false,
      responded: false,
      isRead: true
    };
    
    if (this.messageService) {
      this.messageService.sendMessage(reply)
        .pipe(finalize(() => {
          if (this.isLoading !== undefined) {
            this.isLoading = false;
          }
        }))
        .subscribe({
          next: () => {
            if (this.toast) {
              this.toast.add({ 
                severity: 'success', 
                summary: 'Mensaje enviado', 
                detail: 'Tu mensaje ha sido enviado correctamente', 
                life: 3000 
              });
            }
            
            if (selectedMessage) {
              const messageId = selectedMessage.id;
              if (messageId && this.messageService) {
                this.messageService.markAsResponded(messageId).subscribe(() => {
                  if (typeof this.refreshMessages === 'function') {
                    this.refreshMessages();
                  }
                });
              }
            }
            
            if (this.quickReply !== undefined) {
              this.quickReply = '';
            }
            
            if (this.showViewer !== undefined) {
              this.showViewer = false;
            }
            
            if (typeof this.refreshMessages === 'function') {
              this.refreshMessages();
            }
          },
          error: (err: any) => {
            console.error('Error al enviar mensaje', err);
            if (this.toast) {
              this.toast.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'No se pudo enviar el mensaje. Intente nuevamente.', 
                life: 3000 
              });
            }
          }
        });
    }
  }

  trackByMessageId(index: number, message: Message): any {
    return message.id || index;
  }

  shouldShowDateSeparator(currentMsg: Message, previousMsg: Message): boolean {
    if (!previousMsg) return true;
    
    const currentDate = new Date(currentMsg.date || 0);
    const previousDate = new Date(previousMsg.date || 0);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  }

  getUserInitials(message: Message): string {
    const displayName = this.getUserDisplayName(message);
    if (!displayName || displayName === 'Cargando...') return '?';
    
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }

  getUserDisplayName(message: Message): string {
    if (message.userFromId === this.userId) {
      return 'Tú';
    }
    
    if (message.senderName) {
      return message.senderName;
    }
    
    if (message.userFromId === this.selectedMessage?.userFromId && this.senderInfo?.fullName) {
      return this.senderInfo.fullName;
    }
    
    if (message.userFromId === this.selectedMessage?.userToId && this.recipientInfo?.fullName) {
      return this.recipientInfo.fullName;
    }
    
    return message.sender || 'Usuario';
  }



}