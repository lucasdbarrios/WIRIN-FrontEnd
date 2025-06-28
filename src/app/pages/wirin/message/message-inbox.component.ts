import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService, MessageFolder, MessageUpdateType } from '../../../services/message/message.service';
import { Message } from '../../../types/message.interface';
import { User } from '../../../types/user.interface';
import { MessageService as PrimeToastService } from 'primeng/api';
import { combineLatest } from 'rxjs';
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
import { UserCacheService } from '../../../services/user-cache/user-cache.service';
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
  conversationMessages: Message[] = [];
  groupedSentMessages: GroupedMessage[] = [];
  activeFolder: 'inbox' | 'sent' = 'inbox';
  isLoadingConversation = false;
  
  // Sistema de caché y polling
  private messagesCache: { sent: Message[], received: Message[] } | null = null;
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minuto en milisegundos
  private pollingInterval: any = null;
  
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
    this.userCacheService.getUserById(userId).subscribe({
      next: (user) => {
          if (user) {
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
        }
      },
      error: (err) => {
        console.error(`Error al obtener información del ${type}:`, err);
      }
    });
  }

  private loadUserInfoForMessages(messages: Message[]): void {
    // Recopilar todos los IDs de usuarios únicos
    const userIds = new Set<string>();
    
    messages.forEach(msg => {
      if (this.activeFolder === 'sent' && msg.userToId) {
        userIds.add(msg.userToId);
      } else if (this.activeFolder === 'inbox' && msg.userFromId) {
        userIds.add(msg.userFromId);
      }
    });

    // Cargar usuarios en lote usando el cache
    if (userIds.size > 0) {
      this.userCacheService.getUsersByIds(Array.from(userIds)).subscribe({
        next: (usersMap) => {
          messages.forEach(msg => {
            if (this.activeFolder === 'sent' && msg.userToId) {
              const user = usersMap.get(msg.userToId);
              if (user?.fullName) {
                msg.recipientName = user.fullName;
                msg.loadingRecipientInfo = false;
              }
            } else if (this.activeFolder === 'inbox' && msg.userFromId) {
              const user = usersMap.get(msg.userFromId);
              if (user?.fullName) {
                msg.senderName = user.fullName;
                msg.loadingSenderInfo = false;
              }
            }
          });
          
          // Reagrupar mensajes después de cargar la información del usuario
          if (this.activeFolder === 'sent') {
            this.groupedSentMessages = this.groupSentMessagesByRecipient(this.messages);
          }
        },
        error: (err) => {
          console.error('Error loading users info:', err);
          // Marcar como no cargando en caso de error
          messages.forEach(msg => {
            msg.loadingRecipientInfo = false;
            msg.loadingSenderInfo = false;
          });
        }
      });
    }
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
    private userCacheService: UserCacheService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user && user.id) {
          this.userId = user.id;
          // Usuario ID inicializado
          this.refreshMessages();
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
      // Suscripción a mensajes cancelada
    }
    
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    if (this.showComposer && (this.newMessage.subject || this.newMessage.content || this.newMessage.userToId)) {
      const key = `message_draft_${this.userId}`;
      localStorage.setItem(key, JSON.stringify(this.newMessage));
      // Borrador guardado al salir
    }
  }
  
  setupAutoRefresh(): void {
    // Método simplificado - solo carga inicial de mensajes
    this.refreshMessages();
  }
  
  refreshMessages(): void {
    this.isLoading = true;
    
    this.senderInfo = null;
    this.recipientInfo = null;
    
    // Usar únicamente el endpoint de conversaciones
    this.messageService.getAllConversations()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (msgs) => {
          msgs.forEach(msg => {
            msg.recipientName = null;
            msg.loadingRecipientInfo = false;
            msg.senderName = null;
            msg.loadingSenderInfo = false;
          });
          
          // Actualizar caché
          const sentMessages = msgs.filter(m => m.userFromId === this.userId);
          const receivedMessages = msgs.filter(m => m.userToId === this.userId);
          
          this.messagesCache = {
            sent: sentMessages || [],
            received: receivedMessages || []
          };
          this.lastCacheUpdate = Date.now();
          
          this.allMessages = msgs;
          const filteredMessages = this.filterByFolder(msgs);
          this.messages = filteredMessages;
          
          if (this.activeFolder === 'sent') {
            this.groupedSentMessages = this.groupSentMessagesByRecipient(filteredMessages);
          }
          
          this.loadUserInfoForMessages(filteredMessages);
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
    this.resetUserInfo();
    
    // Verificar si tenemos caché válido
    const now = Date.now();
    if (this.messagesCache && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
      // Usar caché
      const allMessages = [...(this.messagesCache.sent || []), ...(this.messagesCache.received || [])];
      this.allMessages = allMessages;
      const filteredMessages = this.filterByFolder(allMessages);
      this.processLoadedMessages(filteredMessages);
      this.isLoading = false;
      return;
    }
    
    // Cargar desde API optimizado usando endpoint de conversaciones
     this.loadConversationsFromAPI();
   }
  
  private startPolling(): void {
    // Desactivar polling automático para evitar llamadas excesivas
    // El usuario puede refrescar manualmente cuando sea necesario
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  private refreshMessagesFromAPI(): void {
    // Solo actualizar si no hay una carga en progreso
    if (this.isLoading) {
      return;
    }
    
    // Actualizar caché sin mostrar loading usando endpoint optimizado
    this.messageService.getAllConversations().subscribe({
      next: (messages) => {
        // Separar mensajes por tipo para mantener compatibilidad con caché
        const sentMessages = messages.filter(m => m.userFromId === this.userId);
        const receivedMessages = messages.filter(m => m.userToId === this.userId);
        
        // Actualizar caché
        this.messagesCache = {
          sent: sentMessages || [],
          received: receivedMessages || []
        };
        this.lastCacheUpdate = Date.now();
        
        // Actualizar vista actual si es necesario
        this.allMessages = messages;
        const filteredMessages = this.filterByFolder(messages);
        this.messages = filteredMessages;
        
        if (this.activeFolder === 'sent') {
          this.groupedSentMessages = this.groupSentMessagesByRecipient(filteredMessages);
        }
      },
      error: (err) => {
        console.error('Error en polling de mensajes:', err);
      }
    });
  }
  
  private loadConversationsFromAPI(): void {
     this.messageService.getAllConversations().pipe(
       finalize(() => this.isLoading = false)
     ).subscribe({
      next: (messages) => {
        // Separar mensajes por tipo para mantener compatibilidad con caché
        const sentMessages = messages.filter(m => m.userFromId === this.userId);
        const receivedMessages = messages.filter(m => m.userToId === this.userId);
        
        // Actualizar caché
        this.messagesCache = {
          sent: sentMessages || [],
          received: receivedMessages || []
        };
        this.lastCacheUpdate = Date.now();
        
        this.allMessages = messages;
        
        // Filtrar mensajes para la vista actual
        const filteredMessages = this.filterByFolder(messages);
        this.processLoadedMessages(filteredMessages);
      },
      error: (err) => this.handleLoadError(err)
    });
  }

  private resetUserInfo(): void {
    this.senderInfo = null;
    this.recipientInfo = null;
  }

  private processLoadedMessages(msgs: Message[]): void {
    this.resetMessageInfo(msgs);
    this.allMessages = msgs;
    this.messages = msgs;
    
    if (this.activeFolder === 'sent') {
      this.groupedSentMessages = this.groupSentMessagesByRecipient(msgs);
    }
    
    this.loadUserInfoForMessages(msgs);
  }

  private resetMessageInfo(msgs: Message[]): void {
    msgs.forEach(msg => {
      msg.recipientName = null;
      msg.loadingRecipientInfo = false;
      msg.senderName = null;
      msg.loadingSenderInfo = false;
    });
  }

  private handleLoadError(err: any): void {
    console.error('Error al cargar mensajes', err);
    this.toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'No se pudieron cargar los mensajes. Intente nuevamente.', 
      life: 3000 
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
    // Usar únicamente el endpoint de conversaciones
    return this.messageService.getAllConversations();
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
    
    // Iniciando visualización de conversación
    
    this.selectedMessage = message;
    this.showConversationModal = true;
    this.quickReply = '';
    this.conversationMessages = []; // Limpiar conversación anterior
    this.isLoadingConversation = false; // Resetear bandera para nueva conversación
    
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
    if (otherUserId && !isNaN(Number(otherUserId))) {
      // Cargar mensajes de ambas carpetas para obtener la conversación completa
      this.isLoadingConversation = true;
      this.loadCompleteConversation(Number(this.userId), Number(otherUserId));
    }
    
    if (!message.isRead) {
      this.markAsRead(message.id);
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
    
    if (!this.isValidMessage()) {
      this.showValidationError();
      return;
    }

    this.isLoading = true;
    const msg = this.createMessagePayload();

    this.messageService.sendMessage(msg, this.fileToSend)
      .pipe(finalize(() => this.resetSendingState()))
      .subscribe({
        next: () => this.handleSendSuccess(),
        error: (err) => this.handleSendError(err)
      });
  }

  private isValidMessage(): boolean {
    return !!(this.newMessage.userToId && this.newMessage.subject && this.newMessage.content);
  }

  private showValidationError(): void {
    this.toast.add({ 
      severity: 'warn', 
      summary: 'Campos incompletos', 
      detail: 'Por favor, complete todos los campos requeridos.', 
      life: 3000 
    });
  }

  private createMessagePayload(): Partial<Message> {
    return {
      ...this.newMessage,
      userFromId: this.userId,
      sender: 'Usuario actual',
      date: new Date(),
      isDraft: false,
      responded: false,
      isRead: true
    };
  }

  private resetSendingState(): void {
    this.isLoading = false;
    this.composerSubmitted = false;
  }

  private handleSendSuccess(): void {
    const recipientType = this.getRoleDisplayName(this.selectedRole);
    this.toast.add({ 
      severity: 'success', 
      summary: 'Mensaje enviado', 
      detail: `Mensaje enviado correctamente al ${recipientType}`, 
      life: 2500 
    });
    this.completeSend();
  }

  private handleSendError(err: any): void {
    console.error('Error al enviar mensaje', err);
    
    if (err.status === 200 && err.error instanceof SyntaxError) {
      this.completeSend();
      return;
    }
    
    const errorMessage = this.getErrorMessage(err.status);
    this.toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: errorMessage, 
      life: 5000 
    });
  }

  private getErrorMessage(status: number): string {
    const errorMessages: { [key: number]: string } = {
      0: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      400: 'Datos de mensaje inválidos. Verifique los campos e intente nuevamente.',
      401: 'No tiene permisos para enviar mensajes. Inicie sesión nuevamente.',
      403: 'No tiene permisos para enviar mensajes. Inicie sesión nuevamente.'
    };
    
    if (status >= 500) {
      return 'Error en el servidor. Por favor, intente más tarde.';
    }
    
    return errorMessages[status] || 'No se pudo enviar el mensaje. Intente nuevamente.';
  }

  private completeSend(): void {
    this.showComposer = false;
    this.clearDraft();
    this.refreshMessages();
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
      // Borrador guardado localmente
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
        // Borrador cargado desde almacenamiento local
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



  loadCompleteConversation(userId: number, otherUserId: number): void {
    // Validar parámetros antes de proceder
    if (isNaN(userId) || isNaN(otherUserId) || !userId || !otherUserId) {
      console.warn('IDs de usuario inválidos:', { userId, otherUserId });
      return;
    }
    
    // Evitar cargas duplicadas
    if (this.isLoadingConversation) {
      return;
    }
    
    this.isLoadingConversation = true;
    this.conversationMessages = [];
    
    // Verificar si tenemos caché válido
    const now = Date.now();
    if (this.messagesCache && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
      // Usar caché para la conversación
      const allMessages = [...(this.messagesCache.sent || []), ...(this.messagesCache.received || [])];
      
      this.conversationMessages = allMessages
        .filter(msg => this.isConversationMessage(msg, userId, otherUserId))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      this.loadSenderInfo(userId);
      this.isLoadingConversation = false;
      return;
    }
    
    // Si no hay caché válido, usar endpoint optimizado de conversaciones
    this.messageService.getConversationWithUser(otherUserId.toString()).subscribe({
      next: (conversationMessages) => {
        // Filtrar mensajes de la conversación específica
        this.conversationMessages = conversationMessages
          .filter(msg => this.isConversationMessage(msg, userId, otherUserId))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Actualizar caché parcialmente con los mensajes de conversación
        if (!this.messagesCache) {
          this.messagesCache = { sent: [], received: [] };
        }
        
        // Agregar mensajes de conversación al caché apropiado
        this.conversationMessages.forEach(msg => {
          if (msg.userFromId === userId.toString()) {
            const existingIndex = this.messagesCache!.sent.findIndex(m => m.id === msg.id);
            if (existingIndex === -1) {
              this.messagesCache!.sent.push(msg);
            }
          } else {
            const existingIndex = this.messagesCache!.received.findIndex(m => m.id === msg.id);
            if (existingIndex === -1) {
              this.messagesCache!.received.push(msg);
            }
          }
        });
        
        this.loadSenderInfo(userId);
        this.isLoadingConversation = false;
      },
      error: (err) => {
        console.error('Error al cargar mensajes de conversación:', err);
        this.fallbackToLocalMessages(userId, otherUserId);
        this.isLoadingConversation = false;
      }
    });
  }

  private isConversationMessage(msg: Message, userId: number, otherUserId: number): boolean {
    const fromId = Number(msg.userFromId);
    const toId = Number(msg.userToId);
    return ((fromId === userId && toId === otherUserId) || 
            (fromId === otherUserId && toId === userId)) && !msg.deleted;
  }

  private loadSenderInfo(currentUserId: number): void {
    this.conversationMessages.forEach(msg => {
      if (Number(msg.userFromId) === currentUserId) {
        msg.sender = 'Tú';
      } else if (msg.userFromId) {
        this.userService.getUserById(msg.userFromId.toString()).subscribe({
          next: (user) => {
            if (user?.fullName) {
              msg.sender = user.fullName;
              msg.senderName = user.fullName;
            }
          },
          error: (err) => console.error(`Error al obtener usuario ${msg.userFromId}:`, err)
        });
      }
    });
  }

  private fallbackToLocalMessages(userId: number, otherUserId: number): void {
     this.conversationMessages = this.allMessages
       .filter(msg => this.isConversationMessage(msg, userId, otherUserId))
       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
   }

   private setSenderInfo(msg: Message): void {
     if (msg.userFromId === this.userId) {
       msg.sender = msg.sender || 'Tú';
       return;
     }

     if (!msg.userFromId) return;

     if (msg.senderName) {
       msg.sender = msg.senderName;
       return;
     }

     const userInfo = this.getUserInfo(msg.userFromId);
     if (userInfo?.fullName) {
       msg.sender = userInfo.fullName;
       msg.senderName = userInfo.fullName;
       return;
     }

     if (!msg.loadingSenderInfo) {
       msg.loadingSenderInfo = true;
       this.userCacheService.getUserById(msg.userFromId).subscribe({
         next: (user) => {
           if (user?.fullName) {
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

   private getUserInfo(userId: string | number): any {
     if (this.senderInfo?.id === userId) return this.senderInfo;
     if (this.recipientInfo?.id === userId) return this.recipientInfo;
     return null;
   }

  getConversationHistory(message: Message): Message[] {
    if (!message) {
      return [];
    }

    // Si ya tenemos conversationMessages cargados, usarlos
    if (this.conversationMessages && this.conversationMessages.length > 0) {
      return this.conversationMessages;
    }

    // Evitar múltiples llamadas simultáneas
    if (this.isLoadingConversation) {
      return [];
    }

    // Fallback: cargar conversación completa si no está disponible
    const otherUserId = message.userFromId === this.userId ? message.userToId : message.userFromId;
    if (otherUserId && !isNaN(Number(otherUserId)) && !this.isLoadingConversation) {
      this.loadCompleteConversation(Number(this.userId), Number(otherUserId));
    }

    // Mientras se carga, usar método anterior como fallback
    if (!this.allMessages) {
      return [];
    }

    const conversationMessages = this.allMessages.filter(msg => 
      ((msg.userFromId === message.userFromId && msg.userToId === message.userToId) ||
       (msg.userFromId === message.userToId && msg.userToId === message.userFromId)) &&
      !msg.deleted
    );

    conversationMessages.forEach(msg => this.setSenderInfo(msg));

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
    if (!this.selectedMessage || !this.quickReply?.trim()) {
      return;
    }
    
    this.isLoading = true;
    const reply = this.createQuickReplyPayload();
    
    this.messageService.sendMessage(reply)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => this.handleQuickReplySuccess(),
        error: (err) => this.handleQuickReplyError(err)
      });
  }

  private createQuickReplyPayload(): Partial<Message> {
    const recipientId = this.selectedMessage!.userFromId === this.userId ? 
                       this.selectedMessage!.userToId : 
                       this.selectedMessage!.userFromId;
    
    return {
      userFromId: this.userId,
      userToId: recipientId,
      subject: `Re: ${this.selectedMessage!.subject}`,
      content: this.quickReply.trim(),
      date: new Date(),
      isDraft: false,
      responded: false,
      isRead: true
    };
  }

  private handleQuickReplySuccess(): void {
    this.toast.add({ 
      severity: 'success', 
      summary: 'Mensaje enviado', 
      detail: 'Tu mensaje ha sido enviado correctamente', 
      life: 3000 
    });
    
    this.markOriginalAsResponded();
    this.resetQuickReplyState();
    this.refreshMessages();
  }

  private markOriginalAsResponded(): void {
    if (this.selectedMessage?.id) {
      this.messageService.markAsResponded(this.selectedMessage.id).subscribe();
    }
  }

  private resetQuickReplyState(): void {
    this.quickReply = '';
    this.showViewer = false;
  }

  private handleQuickReplyError(err: any): void {
    console.error('Error al enviar mensaje', err);
    this.toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'No se pudo enviar el mensaje. Intente nuevamente.', 
      life: 3000 
    });
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

  getConversationPartnerName(): string {
    if (!this.selectedMessage) return 'Usuario';
    
    const partnerId = this.selectedMessage.userFromId === this.userId ? 
                     this.selectedMessage.userToId : 
                     this.selectedMessage.userFromId;
    
    // Intentar obtener el nombre del cache primero
    const cachedUsers = this.userCacheService.getCachedUsers();
    const cachedUser = cachedUsers.get(partnerId || '');
    
    if (cachedUser?.fullName) {
      return cachedUser.fullName;
    }
    
    // Fallback a la información ya cargada
    if (this.selectedMessage.userFromId === this.userId) {
      return this.selectedMessage.recipientName || this.recipientInfo?.fullName || 'Usuario';
    } else {
      return this.selectedMessage.senderName || this.senderInfo?.fullName || 'Usuario';
    }
  }

  onCloseConversationModal(): void {
    this.showConversationModal = false;
    this.showConversationReplyInput = false;
    this.quickReply = '';
    this.selectedMessage = null;
    this.senderInfo = null;
    this.recipientInfo = null;
    this.conversationMessages = []; // Limpiar mensajes de conversación
  }

  toggleConversationReplyInput(): void {
    this.showConversationReplyInput = !this.showConversationReplyInput;
    if (!this.showConversationReplyInput) {
      this.quickReply = '';
    }
  }

}