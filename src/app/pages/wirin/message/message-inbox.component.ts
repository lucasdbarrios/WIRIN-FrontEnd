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

/**
 * Componente para gestionar mensajes con una interfaz similar a Gmail
 * Permite ver, enviar y responder mensajes, así como guardar borradores
 */
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
  styles: [`
    /* Estilos para el popup de mensajes */
    .message-popup-dialog .p-dialog-content {
      padding: 0;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .message-popup-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--surface-card);
    }
    
    .message-popup-header {
      background-color: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
    }
    
    .message-icon-container {
      width: 40px;
      height: 40px;
    }
    
    .sender-avatar {
      width: 36px;
      height: 36px;
    }
    
    .message-text {
      max-height: 300px;
      overflow-y: auto;
      background-color: var(--surface-ground);
      scrollbar-width: thin;
      scrollbar-color: var(--primary-color) var(--surface-ground);
    }
    
    /* Estilos para el diálogo de detalles del mensaje */
    .message-details-dialog .p-dialog-content {
      max-width: 90vw;
      max-height: 80vh;
      overflow: auto;
      padding: 0;
    }
    
    /* Estilos para la vista de correo electrónico */
    .email-view-container {
      font-family: var(--font-family);
      background-color: var(--surface-card);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .email-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--surface-border);
      background-color: var(--surface-section);
    }
    
    .email-subject {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: 1rem;
    }
    
    .email-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .email-sender, .email-recipient, .email-date {
      display: flex;
      align-items: baseline;
    }
    
    .meta-label {
      font-weight: 600;
      color: var(--text-color-secondary);
      width: 4rem;
      flex-shrink: 0;
    }
    
    .meta-value {
      color: var(--text-color);
    }
    
    .email-content {
      padding: 1.5rem;
      min-height: 150px;
      line-height: 1.6;
      white-space: pre-wrap;
      border-bottom: 1px solid var(--surface-border);
    }
    
    .email-additional-info {
      padding: 1rem 1.5rem;
      background-color: var(--surface-ground);
    }
    
    .email-status {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .status-tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    .status-tag.responded {
      background-color: var(--green-100);
      color: var(--green-700);
    }
    
    .status-tag.draft {
      background-color: var(--yellow-100);
      color: var(--yellow-700);
    }
    
    .email-attachment {
      margin: 1rem 0;
      padding: 0.75rem;
      background-color: var(--surface-card);
      border-radius: 6px;
      border: 1px dashed var(--surface-border);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .attachment-label {
      color: var(--text-color-secondary);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .email-technical-info {
      margin-top: 1rem;
    }
    
    .email-technical-info details {
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 0.5rem;
      background-color: var(--surface-card);
    }
    
    .email-technical-info summary {
      cursor: pointer;
      padding: 0.5rem;
      font-weight: 600;
      color: var(--primary-color);
    }
    
    .technical-details {
      padding: 0.75rem;
      font-size: 0.875rem;
      background-color: var(--surface-ground);
      border-radius: 4px;
      margin-top: 0.5rem;
    }
    
    .message-details pre {
      font-family: monospace;
      background-color: var(--surface-ground);
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid var(--surface-border);
    }
    
    .message-text::-webkit-scrollbar {
      width: 8px;
    }
    
    .message-text::-webkit-scrollbar-track {
      background: var(--surface-ground);
      border-radius: 4px;
    }
    
    .message-text::-webkit-scrollbar-thumb {
      background-color: var(--primary-color);
      border-radius: 4px;
    }
    
    .message-attachment {
      transition: all 0.2s;
    }
    
    .message-attachment:hover {
      background-color: var(--surface-hover);
    }
    
    .reply-container {
      max-height: 200px;
      overflow-y: auto;
    }
    
    .quick-reply-textarea {
      min-height: 100px;
      resize: vertical;
      transition: all 0.3s ease;
    }
    
    .quick-reply-textarea:focus {
      box-shadow: 0 0 0 2px var(--primary-color-transparent);
    }
    
    /* Estilos para la tabla de mensajes */
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      cursor: pointer;
      transition: all 0.2s;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background-color: var(--surface-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    
    /* Estilos para el modal de conversación estilo WhatsApp */
    .conversation-container {
      background-color: #f0f2f5;
      scrollbar-width: thin;
      scrollbar-color: var(--primary-color) #f0f2f5;
    }
    
    .conversation-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .conversation-container::-webkit-scrollbar-track {
      background: #f0f2f5;
      border-radius: 4px;
    }
    
    .conversation-container::-webkit-scrollbar-thumb {
      background-color: var(--primary-color);
      border-radius: 4px;
    }
    
    .message-bubble {
      position: relative;
      max-width: 70%;
      width: fit-content;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      word-wrap: break-word;
    }
    
    .message-bubble.ml-auto {
      border-radius: 12px 0 12px 12px;
    }
    
    .message-bubble.mr-auto {
      border-radius: 0 12px 12px 12px;
    }
    
    .max-w-30rem {
      max-width: 30rem;
    }
    
    /* Animación para el popup */
    .p-dialog-enter {
      animation: fadeIn 0.2s, slideDown 0.3s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideDown {
      from { transform: translateY(-20px); }
      to { transform: translateY(0); }
    }
  `]
})
export class GmailStyleComponent implements OnInit, OnDestroy {
  /**
   * Maneja el cambio de carpeta y recarga los mensajes
   */
  /**
   * Maneja el cambio de carpeta activa
   * @param folder Carpeta seleccionada ('inbox', 'sent')
   */
  onFolderChange(folder: 'inbox' | 'sent'): void {
    this.activeFolder = folder;
    // Recargar los mensajes del servidor al cambiar de carpeta
    this.refreshMessages();
  }
  // Propiedades de usuario y mensajes
  /** ID del usuario actual */
  userId: string = '';
  /** Lista de mensajes filtrados según la carpeta activa */
  messages: Message[] = [];
  /** Lista completa de mensajes sin filtrar */
  allMessages: Message[] = [];
  /** Carpeta actualmente seleccionada */
  activeFolder: 'inbox' | 'sent' = 'inbox';
  
  /** Opciones para el SelectButton de carpetas */
  folderOptions = [
    { label: 'Recibidos', value: 'inbox', icon: 'pi pi-inbox' },
    { label: 'Enviados', value: 'sent', icon: 'pi pi-send' }
  ];
  /** Indica si se están cargando los mensajes */
  isLoading: boolean = false;

  // Propiedades para visualización de mensajes
  /** Mensaje actualmente seleccionado para visualizar */
  selectedMessage: Message | null = null;
  /** Información completa del remitente y destinatario */
  senderInfo: User | null = null;
  recipientInfo: User | null = null;
  /** Controla la visibilidad del diálogo de visualización de mensajes */
  showViewer = false;
  /** Controla la visibilidad del diálogo de respuesta */
  showReplyDialog = false;
  /** Controla la visibilidad del modal de conversación estilo WhatsApp */
  showConversationModal = false;
  /** Texto de respuesta rápida para el mensaje seleccionado */
  quickReply: string = '';

  // Propiedades para composición de mensajes
  /** Controla la visibilidad del diálogo de composición de mensajes */
  showComposer = false;
  /** Datos del nuevo mensaje que se está componiendo */
  newMessage: Partial<Message> = {};
  /** Archivo adjunto para enviar con el mensaje */
  fileToSend?: File;
  /** Indica si el formulario del compositor ha sido enviado para validación */
  composerSubmitted: boolean = false;
  /** Lista de opciones de destinatarios para el dropdown */
  recipientOptions: any[] = [];
  /** Destinatario seleccionado */
  selectedStudent: any = null;
  /** Rol seleccionado para filtrar destinatarios */
  selectedRole: string = 'alumno';
  /** Opciones de roles disponibles */
  roleOptions: any[] = [
    { label: 'Alumno', value: 'alumno' },
    { label: 'Bibliotecario', value: 'bibliotecario' },
    { label: 'Voluntario', value: 'Voluntario' },
    { label: 'Revisor', value: 'Voluntario Administrativo' }
  ];
  
  // Propiedades para auto-refresh
  /** Suscripción a la actualización automática de mensajes */
  private messagesSubscription?: Subscription;
  /** Observable para la actualización automática de mensajes */
  
  /**
   * Obtiene la etiqueta de la carpeta a partir de su valor
   * @param folderValue Valor de la carpeta ('inbox', 'sent')
   * @returns Etiqueta de la carpeta o el valor original si no se encuentra
   */
  getFolderLabel(folderValue: string): string {
    const folder = this.folderOptions.find(opt => opt.value === folderValue);
    return folder ? folder.label : folderValue;
  }
  
  /**
   * Obtiene el nombre de visualización del rol seleccionado
   * @param roleValue Valor del rol ('alumno', 'bibliotecario', 'Voluntario', 'Voluntario Administrativo')
   * @returns Nombre de visualización del rol
   */
  getRoleDisplayName(roleValue: string): string {
    switch(roleValue) {
      case 'alumno': return 'Alumno';
      case 'bibliotecario': return 'Bibliotecario';
      case 'Voluntario': return 'Voluntario';
      case 'Voluntario Administrativo': return 'Revisor';
      default: return roleValue;
    }
  }
  
  /**
   * Obtiene el nombre a mostrar en la columna de remitente/destinatario según la carpeta activa
   * @param message El mensaje del que obtener la información
   * @returns El nombre del remitente o destinatario según corresponda
   */
  getDisplayName(message: Message): string {
    // Si estamos en la bandeja de enviados, mostramos el destinatario
    if (this.activeFolder === 'sent') {
      // Intentamos obtener el nombre del destinatario si está disponible
      if (message.userToId) {
        // Si tenemos la información del destinatario en recipientInfo y coincide con el userToId del mensaje
        if (this.recipientInfo && this.recipientInfo.id === message.userToId && this.recipientInfo.fullName) {
          return this.recipientInfo.fullName;
        }
        
        // Si no tenemos la información en recipientInfo, intentamos cargarla
        // Pero para evitar múltiples llamadas, verificamos si el mensaje ya tiene un nombre de destinatario asignado
        if (!message.recipientName) {
          // Marcamos que estamos cargando la información para este mensaje
          message.loadingRecipientInfo = true;
          
          this.userService.getUserById(message.userToId).subscribe({
            next: (user) => {
              if (user && user.fullName) {
                // Guardamos el nombre en el mensaje para futuras referencias
                message.recipientName = user.fullName;
                // Forzamos la detección de cambios si es necesario
                // (Angular podría no detectar este cambio automáticamente)
              }
              message.loadingRecipientInfo = false;
            },
            error: (err) => {
              console.error('Error al obtener información del destinatario:', err);
              message.loadingRecipientInfo = false;
            }
          });
        }
        
        // Devolvemos el nombre del destinatario si ya lo hemos cargado
        return message.recipientName || 'Destinatario';
      }
      return 'Destinatario';
    } 
    // Si estamos en la bandeja de entrada u otra, mostramos el remitente
    else {
      // Intentamos obtener el nombre completo del remitente si está disponible
      if (message.userFromId) {
        // Si tenemos la información del remitente en senderInfo y coincide con el userFromId del mensaje
        if (this.senderInfo && this.senderInfo.id === message.userFromId && this.senderInfo.fullName) {
          return this.senderInfo.fullName;
        }
        
        // Si no tenemos la información en senderInfo, intentamos cargarla
        // Pero para evitar múltiples llamadas, verificamos si el mensaje ya tiene un nombre de remitente asignado
        if (!message.senderName) {
          // Marcamos que estamos cargando la información para este mensaje
          message.loadingSenderInfo = true;
          
          this.userService.getUserById(message.userFromId).subscribe({
            next: (user) => {
              if (user && user.fullName) {
                // Guardamos el nombre en el mensaje para futuras referencias
                message.senderName = user.fullName;
                // Forzamos la detección de cambios si es necesario
                // (Angular podría no detectar este cambio automáticamente)
              }
              message.loadingSenderInfo = false;
            },
            error: (err) => {
              console.error('Error al obtener información del remitente:', err);
              message.loadingSenderInfo = false;
            }
          });
        }
        
        // Devolvemos el nombre del remitente si ya lo hemos cargado
        return message.senderName || message.sender || 'Desconocido';
      }
      return message.sender || 'Desconocido';
    }
  }
  
  /**
   * Maneja el cambio de rol en el diálogo de composición de mensajes
   * @param event Evento de cambio con el nuevo valor del rol
   */
  onRoleChange(event: any): void {
    this.selectedRole = event.value;
    this.selectedStudent = null;
    this.loadUsersByRole(this.selectedRole);
  }
  
  private messages$?: Observable<Message[]>;
  /** Intervalo para guardar borradores automáticamente */
  private autosaveInterval?: any;

  /**
   * Constructor del componente
   * @param messageService Servicio para gestionar mensajes
   * @param toast Servicio de notificaciones toast de PrimeNG
   * @param autoRefreshService Servicio para actualización automática de datos
   */
  constructor(
    private messageService: MessageService,
    private toast: PrimeToastService,
    private autoRefreshService: AutoRefreshService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  /**
   * Inicializa el componente, configura la actualización automática y carga los borradores
   */
  ngOnInit(): void {
    // Obtener el ID del usuario actual
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user && user.id) {
          this.userId = user.id;
          console.log('Usuario ID inicializado:', this.userId);
          
          // Configurar la actualización automática de mensajes después de obtener el userId
          this.setupAutoRefresh();
          
          // Cargar borradores guardados localmente
          this.loadDraft();
        } else {
          console.error('No se pudo obtener el ID del usuario');
        }
      },
      error: (err) => {
        console.error('Error al obtener el usuario actual', err);
      }
    });
    
    // Cargar usuarios según el rol seleccionado por defecto
    this.loadUsersByRole(this.selectedRole);
    
    // Configurar guardado automático de borradores cada 30 segundos
    this.autosaveInterval = setInterval(() => {
      if (this.showComposer && (this.newMessage.subject || this.newMessage.content || this.newMessage.userToId)) {
        this.saveDraftLocally();
      }
    }, 30000);
  }
  
  /**
   * Carga la lista de estudiantes desde el servicio
   * @deprecated Use loadUsersByRole instead
   */
  loadStudents(): void {
    this.loadUsersByRole('alumno');
  }

  /**
   * Carga la lista de usuarios según el rol seleccionado
   * @param role Rol de los usuarios a cargar
   */
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



  /**
   * Limpia recursos cuando el componente es destruido
   * para evitar fugas de memoria
   */
  ngOnDestroy(): void {
    // Cancelar la suscripción para evitar memory leaks
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
      console.log('Suscripción a mensajes cancelada');
    }
    
    // Detener el intervalo de guardado automático
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }
    
    // Guardar el borrador actual antes de salir
    if (this.showComposer && (this.newMessage.subject || this.newMessage.content || this.newMessage.userToId)) {
      const key = `message_draft_${this.userId}`;
      localStorage.setItem(key, JSON.stringify(this.newMessage));
      console.log('Borrador guardado al salir');
    }
  }
  
  /**
   * Configura la actualización automática de mensajes cada 30 segundos
   * utilizando el servicio AutoRefreshService
   */
  setupAutoRefresh(): void {
    // Crear un observable que se actualice automáticamente cada 30 segundos
    this.messages$ = this.autoRefreshService.createAutoRefreshObservable(
      () => {
        this.isLoading = true;
        return this.messageService.getMessagesByFolder(this.getMessageFolderEnum()).pipe(
          finalize(() => this.isLoading = false)
        );
      },
      30000 // 30 segundos
    );
    
    // Suscribirse al observable
    this.messagesSubscription = this.messages$.subscribe({
      next: (msgs) => {
        // Limpiamos cualquier información de remitente/destinatario almacenada en los mensajes
        msgs.forEach(msg => {
          msg.recipientName = null;
          msg.loadingRecipientInfo = false;
          msg.senderName = null;
          msg.loadingSenderInfo = false;
        });
        
        this.allMessages = msgs;
        this.messages = msgs; // Ya no es necesario filtrar, ya vienen filtrados del servidor
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
  
  /**
   * Fuerza una actualización manual de los mensajes
   */
  refreshMessages(): void {
    this.isLoading = true;
    
    // Limpiamos la información de remitente/destinatario almacenada
    this.senderInfo = null;
    this.recipientInfo = null;
    
    this.messageService.getMessagesByFolder(this.getMessageFolderEnum())
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (msgs) => {
          // Limpiamos cualquier información de remitente/destinatario almacenada en los mensajes
          msgs.forEach(msg => {
            msg.recipientName = null;
            msg.loadingRecipientInfo = false;
            msg.senderName = null;
            msg.loadingSenderInfo = false;
          });
          
          this.allMessages = msgs;
          this.messages = msgs; // Ya no es necesario filtrar, ya vienen filtrados del servidor
          this.toast.add({ 
            severity: 'success', 
            summary: 'Actualizado', 
            detail: 'Mensajes actualizados correctamente', 
            life: 2000 
          });
        },
        error: (err) => {
          console.error('Error al actualizar mensajes', err);
          this.toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No se pudieron actualizar los mensajes. Intente nuevamente.', 
            life: 3000 
          });
        }
      });
  }

  /**
   * Carga los mensajes según la carpeta activa
   */
  loadMessages(): void {
    // Actualiza los mensajes según la carpeta activa
    this.isLoading = true;
    // Limpiamos la información de remitente/destinatario almacenada
    this.senderInfo = null;
    this.recipientInfo = null;
    
    this.getMessagesByActiveFolder()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (msgs) => {
          // Limpiamos cualquier información de remitente/destinatario almacenada en los mensajes
          msgs.forEach(msg => {
            msg.recipientName = null;
            msg.loadingRecipientInfo = false;
            msg.senderName = null;
            msg.loadingSenderInfo = false;
          });
          
          this.allMessages = msgs;
          this.messages = msgs;
          
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

  /**
   * Convierte la carpeta activa a MessageFolder enum
   * @returns El enum MessageFolder correspondiente
   */
  private getMessageFolderEnum(): MessageFolder {
    const folderMapping = {
      'inbox': MessageFolder.INBOX,
      'sent': MessageFolder.SENT,
      'all': MessageFolder.ALL
    };
    
    return folderMapping[this.activeFolder] || MessageFolder.ALL;
  }
  
  /**
   * Obtiene los mensajes según la carpeta activa directamente del servidor
   * @returns Observable con los mensajes filtrados según la carpeta activa
   */
  getMessagesByActiveFolder(): Observable<Message[]> {
    return this.messageService.getMessagesByFolder(this.getMessageFolderEnum());
  }
  
  /**
   * Filtra los mensajes según la carpeta activa seleccionada (método de respaldo)
   * @param all Lista completa de mensajes a filtrar
   * @returns Lista filtrada de mensajes según la carpeta activa
   */
  filterByFolder(all: Message[]): Message[] {
    if (!all || all.length === 0) {
      return [];
    }
    
    switch (this.activeFolder) {
      case 'inbox':
        // Mensajes recibidos (donde el usuario actual es el destinatario)
        return all.filter(m => m.userToId === this.userId && !m.isDraft);
      case 'sent':
        // Mensajes enviados (enviados por el usuario actual y no son borradores)
        return all.filter(m => m.userFromId === this.userId && !m.isDraft);
      default:
        return all;
    }
  }

  /**
   * Muestra el diálogo de visualización para un mensaje seleccionado
   * @param msg El mensaje a visualizar
   */
  viewMessage(msg: Message | Message[] | undefined): void {
    if (!msg) return;
    
    // Si es un array, tomar el primer elemento
    const message = Array.isArray(msg) ? msg[0] : msg;
    if (!message) return;
    
    this.selectedMessage = message;
    this.showViewer = true;
    this.quickReply = '';
    
    // Reiniciar información de usuario
    this.senderInfo = null;
    this.recipientInfo = null;
    
    // Obtener información completa del remitente
    if (message.userFromId) {
      this.userService.getUserById(message.userFromId).subscribe({
        next: (user) => {
          console.log('Información del remitente obtenida:', user);
          this.senderInfo = user;
        },
        error: (err) => {
          console.error('Error al obtener información del remitente:', err);
        }
      });
    } else {
      console.warn('No se encontró userFromId en el mensaje');
    }
    
    // Obtener información completa del destinatario
    if (message.userToId) {
      this.userService.getUserById(message.userToId).subscribe({
        next: (user) => {
          console.log('Información del destinatario obtenida:', user);
          this.recipientInfo = user;
        },
        error: (err) => {
          console.error('Error al obtener información del destinatario:', err);
        }
      });
    } else {
      console.warn('No se encontró userToId en el mensaje');
    }
    
    // Si el mensaje no ha sido leído, marcarlo como leído automáticamente
    if (!message.isRead) {
      this.markAsRead(message.id);
    }
  }
  
  /**
   * Muestra todos los detalles del mensaje en una ventana modal con formato de correo electrónico
   * @param message Mensaje opcional. Si no se proporciona, se usa el mensaje seleccionado
   */
  showMessageDetails(message?: Message): void {
    // Usar el mensaje proporcionado o el mensaje seleccionado
    const msg = message || this.selectedMessage;
    if (!msg) return;
    
    // Formatear la fecha para mostrarla de manera legible
    const formattedDate = new Date(msg.date).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Variables para almacenar los nombres completos
    let senderFullName = msg.sender || 'Desconocido';
    let recipientFullName = this.activeFolder === 'sent' ? 'Destinatario' : 'Usuario actual';
    
    // Función para crear y mostrar la plantilla de correo
    const createAndShowEmailTemplate = () => {
      console.log('Creando plantilla de email con:', {
        senderFullName,
        recipientFullName,
        senderInfo: this.senderInfo,
        recipientInfo: this.recipientInfo,
        msg
      });
      
      // Crear el HTML para mostrar los detalles del mensaje en formato de correo electrónico
      const emailTemplate = `
        <div class="email-view-container">
          <!-- Cabecera del correo -->
          <div class="email-header">
            <div class="email-subject">${msg.subject || 'Sin asunto'}</div>
            
            <div class="email-meta">
              <div class="email-sender">
                <span class="meta-label">De:</span>
                <span class="meta-value">${senderFullName || this.senderInfo?.fullName || msg.sender || 'Desconocido'}</span>
              </div>
              
              <div class="email-recipient">
                <span class="meta-label">Para:</span>
                <span class="meta-value">${recipientFullName || this.recipientInfo?.fullName || 'Destinatario'}</span>
              </div>
              
              <div class="email-date">
                <span class="meta-label">Fecha:</span>
                <span class="meta-value">${formattedDate}</span>
              </div>
            </div>
          </div>
          
          <!-- Contenido del correo -->
          <div class="email-content">
            ${msg.content || 'Sin contenido'}
          </div>
          
          <!-- Información adicional -->
          <div class="email-additional-info">
            <div class="email-status">
              ${msg.responded ? '<span class="status-tag responded">Respondido</span>' : ''}
              ${msg.isDraft ? '<span class="status-tag draft">Borrador</span>' : ''}
            </div>
            
            ${msg.filePath ? `
            <div class="email-attachment">
              <span class="attachment-label"><i class="pi pi-paperclip"></i> Adjunto:</span>
              <span class="attachment-value">${msg.filePath.split('/').pop()}</span>
            </div>` : ''}
            
            <div class="email-technical-info">
              <details>
                <summary>Información técnica</summary>
                <div class="technical-details">
                  <p><strong>ID:</strong> ${msg.id}</p>
                  <p><strong>Remitente ID:</strong> ${msg.userFromId}</p>
                  <p><strong>Remitente:</strong> ${senderFullName || this.senderInfo?.fullName || msg.sender || 'Desconocido'}</p>
                  <p><strong>Remitente Email:</strong> ${this.senderInfo?.email || 'No disponible'}</p>
                  <p><strong>Destinatario ID:</strong> ${msg.userToId}</p>
                  <p><strong>Destinatario:</strong> ${recipientFullName || this.recipientInfo?.fullName || 'Destinatario'}</p>
                  <p><strong>Destinatario Email:</strong> ${this.recipientInfo?.email || 'No disponible'}</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      `;
      
      // Mostrar los detalles en un diálogo de confirmación para visualización
      this.confirmationService.confirm({
        key: 'messageDetails',
        header: 'Detalles del mensaje',
        message: emailTemplate,
        icon: 'pi pi-envelope',
        acceptVisible: false,
        rejectLabel: 'Cerrar'
      });
    };
    
    // Intentar obtener los nombres completos de remitente y destinatario si están disponibles los IDs
    let pendingRequests = 0;
    
    if (msg.userFromId) {
      pendingRequests++;
      this.userService.getUserById(msg.userFromId).subscribe({
        next: (user) => {
          console.log('Información del remitente obtenida (detalles):', user);
          if (user && user.fullName) {
            senderFullName = user.fullName;
          }
          pendingRequests--;
          if (pendingRequests === 0) createAndShowEmailTemplate();
        },
        error: (err) => {
          console.error('Error al obtener información del remitente (detalles):', err);
          pendingRequests--;
          if (pendingRequests === 0) createAndShowEmailTemplate();
        }
      });
    }
    
    if (msg.userToId) {
      pendingRequests++;
      this.userService.getUserById(msg.userToId).subscribe({
        next: (user) => {
          console.log('Información del destinatario obtenida (detalles):', user);
          if (user && user.fullName) {
            recipientFullName = user.fullName;
          }
          pendingRequests--;
          if (pendingRequests === 0) createAndShowEmailTemplate();
        },
        error: (err) => {
          console.error('Error al obtener información del destinatario (detalles):', err);
          pendingRequests--;
          if (pendingRequests === 0) createAndShowEmailTemplate();
        }
      });
    }
    
    // Si no hay solicitudes pendientes, mostrar la plantilla inmediatamente
    if (pendingRequests === 0) {
      createAndShowEmailTemplate();
    }
  }
  
  /**
   * Muestra el modal de conversación estilo WhatsApp para un mensaje seleccionado
   * @param msg El mensaje a visualizar en el contexto de una conversación
   */
  viewConversation(msg: Message | Message[] | undefined): void {
    if (!msg) return;
    
    // Si es un array, tomar el primer elemento
    const message = Array.isArray(msg) ? msg[0] : msg;
    if (!message) return;
    
    console.log('Iniciando visualización de conversación con mensaje:', message);
    
    this.selectedMessage = message;
    this.showConversationModal = true;
    this.quickReply = '';
    
    // Reiniciar información de usuario
    this.senderInfo = null;
    this.recipientInfo = null;
    
    // Obtener información completa del remitente
    if (message.userFromId) {
      console.log('Obteniendo información del remitente con ID:', message.userFromId);
      this.userService.getUserById(message.userFromId).subscribe({
        next: (user) => {
          console.log('Información del remitente obtenida (conversación):', user);
          this.senderInfo = user;
          
          // Actualizar el campo sender del mensaje si tenemos el nombre completo
          if (user && user.fullName) {
            message.sender = user.fullName;
          }
        },
        error: (err) => {
          console.error('Error al obtener información del remitente (conversación):', err);
        }
      });
    } else {
      console.warn('No se encontró userFromId en el mensaje para la conversación');
    }
    
    // Obtener información completa del destinatario
    if (message.userToId) {
      console.log('Obteniendo información del destinatario con ID:', message.userToId);
      this.userService.getUserById(message.userToId).subscribe({
        next: (user) => {
          console.log('Información del destinatario obtenida (conversación):', user);
          this.recipientInfo = user;
          
          // Actualizar la información del destinatario en el mensaje si es necesario
          if (user && user.fullName && message.userFromId === this.userId) {
            // Si el mensaje fue enviado por el usuario actual, el destinatario es el otro usuario
            message.sender = user.fullName; // Esto podría no ser correcto, pero es para asegurar que se muestre el nombre
          }
        },
        error: (err) => {
          console.error('Error al obtener información del destinatario (conversación):', err);
        }
      });
    } else {
      console.warn('No se encontró userToId en el mensaje para la conversación');
    }
    
    // Obtener el historial de conversación para mostrar todos los mensajes
    const otherUserId = message.userFromId === this.userId ? message.userToId : message.userFromId;
    if (otherUserId) {
      // Procesar los mensajes de la conversación para actualizar la información de usuario
      const conversationMessages = this.getConversationHistory(message);
      console.log('Mensajes en la conversación:', conversationMessages.length);
      
      // Para cada mensaje en la conversación, intentar obtener información de usuario si no es del usuario actual
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
    
    // Si el mensaje no ha sido leído, marcarlo como leído automáticamente
    if (!message.isRead) {
      this.markAsRead(message.id);
    }
  }
  
  /**
   * Maneja el cierre del modal de conversación
   */
  onCloseConversationModal(): void {
    this.showConversationModal = false;
    this.quickReply = '';
    // No limpiamos selectedMessage aquí para mantener la selección en la tabla
  }
  
  /**
   * Obtiene el nombre del interlocutor en la conversación
   * @returns Nombre del interlocutor o 'Conversación' si no se puede determinar
   */
  getConversationPartnerName(): string {
    if (!this.selectedMessage) return 'Conversación';
    
    // Si el mensaje fue enviado por el usuario actual, mostrar el nombre del destinatario
    // Si el mensaje fue recibido por el usuario actual, mostrar el nombre del remitente
    if (this.selectedMessage.userFromId === this.userId) {
      // Mensaje enviado por el usuario actual, mostrar destinatario
      if (this.recipientInfo && this.recipientInfo.fullName) {
        return 'Conversación con ' + this.recipientInfo.fullName;
      } else if (this.selectedMessage.userToId) {
        // Si no tenemos la información del destinatario pero tenemos su ID, intentar obtenerla
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
      // Mensaje recibido por el usuario actual, mostrar remitente
      if (this.senderInfo && this.senderInfo.fullName) {
        return 'Conversación con ' + this.senderInfo.fullName;
      } else if (this.selectedMessage.userFromId) {
        // Si no tenemos la información del remitente pero tenemos su ID, intentar obtenerla
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
  
  /**
   * Marca un mensaje como leído
   * @param messageId ID del mensaje a marcar como leído
   */
  markAsRead(messageId?: number): void {
    if (!messageId) return;
    
    this.messageService.updateMessageStatus(messageId, MessageUpdateType.READ).subscribe({
      next: () => {
        // Actualizar el estado del mensaje en la lista local
        if (this.selectedMessage && this.selectedMessage.id === messageId) {
          this.selectedMessage.isRead = true;
        }
        
        // Recargar los mensajes desde el servidor para reflejar el cambio
        this.loadMessages();
      },
      error: (err) => {
        console.error('Error al marcar mensaje como leído', err);
      }
    });
  }
  
  /**
   * Muestra un diálogo de confirmación para eliminar un mensaje
   * @param message El mensaje a eliminar
   */
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
  
  /**
   * Elimina un mensaje
   * @param messageId ID del mensaje a eliminar
   */
  deleteMessage(messageId: number): void {
    this.messageService.updateMessageStatus(messageId, MessageUpdateType.DELETE).subscribe({
      next: () => {
        // Cerrar el visor si el mensaje eliminado es el que se está viendo
        if (this.selectedMessage && this.selectedMessage.id === messageId) {
          this.showViewer = false;
          this.selectedMessage = null;
        }
        
        // Recargar los mensajes desde el servidor para reflejar el cambio
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
  
  /**
   * Maneja el cierre del visor de mensajes
   */
  onCloseViewer(): void {
    this.showViewer = false;
    this.quickReply = '';
    // No limpiamos selectedMessage aquí para mantener la selección en la tabla
    // Limpiar información de usuario
    this.senderInfo = null;
    this.recipientInfo = null;
  }

  /**
   * Envía una respuesta rápida al mensaje seleccionado actualmente
   */
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
          this.selectedMessage = null; // Limpiar el mensaje seleccionado
          // Actualizar la lista de mensajes
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
  
  /**
   * Envía un mensaje rápido desde el modal de conversación
   * Esta función se utiliza tanto para el modal de conversación como para respuestas rápidas
   * @deprecated Esta implementación ha sido reemplazada por la versión en la línea 1196
   */
  // La implementación de sendQuickReply se ha movido a la línea 1196


  /**
   * Envía un nuevo mensaje al destinatario especificado
   */
  sendMessage(): void {
    this.composerSubmitted = true;
    
    // Asignar el ID del destinatario seleccionado al mensaje
    if (this.selectedStudent) {
      this.newMessage.userToId = this.selectedStudent;
    }
    
    // Validar campos requeridos
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
      isRead: true // Los mensajes enviados se marcan como leídos automáticamente
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
          // Actualizar la lista de mensajes
          this.refreshMessages();
        },
        error: (err) => {
          console.error('Error al enviar mensaje', err);
          
          // Mensaje de error más descriptivo según el tipo de error
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
          
          // Si el error es de parsing pero el status es 200, probablemente el mensaje se envió correctamente
          if (err.status === 200 && err.error instanceof SyntaxError) {
            console.log('El mensaje probablemente se envió correctamente a pesar del error de parsing');
            this.showComposer = false;
            this.clearDraft();
            this.refreshMessages();
          }
        }
      });
  }

  /**
   * Guarda el mensaje actual como borrador en el servidor
   */
  saveDraft(): void {
    // No es necesario validar todos los campos para un borrador,
    // pero al menos debería tener algún contenido
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
          // Actualizar la lista de mensajes
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
  
  /**
   * Muestra un diálogo de confirmación para descartar un borrador
   */
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
  
  /**
   * Maneja el cierre del compositor de mensajes
   */
  onCloseComposer(): void {
    // Si hay contenido, preguntar si desea guardar como borrador
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

  /**
   * Maneja la selección de archivos para adjuntar al mensaje
   * @param event Evento de selección de archivo de PrimeNG FileUpload
   */
  onFileSelect(event: any): void {
    if (event.files?.length) {
      this.fileToSend = event.files[0];
      // Mostrar notificación de archivo seleccionado
      this.toast.add({
        severity: 'info',
        summary: 'Archivo seleccionado',
        detail: `${this.fileToSend?.name || ''} (${((this.fileToSend?.size || 0) / 1024).toFixed(1)} KB)`,
        life: 2000
      });
    }
  }
  
  /**
   * Elimina el archivo adjunto actual
   */
  removeAttachment(): void {
    this.fileToSend = undefined;
    this.toast.add({
      severity: 'info',
      summary: 'Archivo eliminado',
      detail: 'El archivo adjunto ha sido eliminado',
      life: 2000
    });
  }

  /**
   * Guarda el borrador actual en el almacenamiento local del navegador
   * Se ejecuta automáticamente cada 30 segundos mientras el compositor está abierto
   */
  saveDraftLocally(): void {
    // Solo guardar si hay contenido y el compositor está abierto
    if (this.showComposer && (this.newMessage.subject || this.newMessage.content || this.newMessage.userToId)) {
      const key = `message_draft_${this.userId}`;
      localStorage.setItem(key, JSON.stringify(this.newMessage));
      console.log('Borrador guardado localmente:', new Date().toLocaleTimeString());
      // No mostrar toast cada vez para no molestar al usuario
    }
  }

  /**
   * Carga el último borrador guardado en el almacenamiento local
   */
  loadDraft(): void {
    const key = `message_draft_${this.userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        this.newMessage = JSON.parse(saved);
        // Si hay un userToId en el borrador, asignarlo al selectedStudent
      if (this.newMessage.userToId) {
        this.selectedStudent = this.newMessage.userToId;
        }
        console.log('Borrador cargado desde almacenamiento local');
      } catch (error) {
        console.error('Error al cargar el borrador:', error);
        // Si hay un error al parsear, eliminar el borrador corrupto
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Limpia el borrador actual tanto en memoria como en almacenamiento local
   */
  clearDraft(): void {
    const key = `message_draft_${this.userId}`;
    localStorage.removeItem(key);
    this.newMessage = {};
    this.selectedStudent = null;
    this.fileToSend = undefined;
  }
  
  /**
   * Abre el compositor para un nuevo mensaje
   */
  composeNewMessage(): void {
    this.clearDraft();
    // Reiniciar el rol seleccionado a 'alumno' por defecto
    this.selectedRole = 'alumno';
    this.loadUsersByRole(this.selectedRole);
    this.showComposer = true;
    this.composerSubmitted = false;
  }
  
  /**
   * Obtiene la etiqueta del destinatario seleccionado
   * @returns La etiqueta del destinatario seleccionado o una cadena vacía
   */
  getSelectedRecipientLabel(): string {
    if (!this.selectedStudent || !this.recipientOptions || this.recipientOptions.length === 0) {
      return '';
    }
    const recipient = this.recipientOptions.find(r => r.value === this.selectedStudent);
    return recipient ? recipient.label : '';
  }
  


  /**
   * Inicia una respuesta a un mensaje abriendo el diálogo de respuesta
   */
  replyToMessage(): void {
    if (!this.selectedMessage) return;
    
    this.quickReply = '';
    this.showReplyDialog = true;
    
    setTimeout(() => {
      const textarea = document.querySelector('#replyContent') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }



  /**
   * Obtiene el historial de conversación para un mensaje seleccionado
   * Agrupa los mensajes por usuario y los ordena por fecha (más antiguos primero)
   */
  getConversationHistory(message: Message): Message[] {
    if (!message || !this.messages) {
      return [];
    }

    console.log('Obteniendo historial de conversación para mensaje:', message);

    // Filtrar mensajes que pertenecen a la misma conversación
    // (mismo remitente y destinatario en cualquier dirección)
    const conversationMessages = this.allMessages.filter(msg => 
      // Mensajes entre los mismos usuarios (en ambas direcciones)
      ((msg.userFromId === message.userFromId && msg.userToId === message.userToId) ||
       (msg.userFromId === message.userToId && msg.userToId === message.userFromId)) &&
      // Ya no se filtra por studentId, ahora se usa userFromId
      // (message.studentId ? msg.studentId === message.studentId : true) &&
      // Excluir mensajes eliminados
      !msg.deleted
    );

    console.log('Mensajes filtrados en la conversación:', conversationMessages.length);

    // Intentar actualizar los nombres de los remitentes si no están disponibles
    conversationMessages.forEach(msg => {
      // Si el mensaje es del usuario actual, no necesitamos buscar información adicional
      if (msg.userFromId === this.userId) {
        // Asegurarnos de que el mensaje tenga un remitente (el usuario actual)
        if (!msg.sender) {
          msg.sender = 'Tú'; // O podríamos usar el nombre del usuario actual si está disponible
        }
      } 
      // Si el mensaje es de otro usuario y no tiene remitente, intentar obtenerlo
      else if (msg.userFromId) {
        // Verificar si ya tenemos la información del remitente
        if (msg.senderName) {
          // Si ya tenemos el nombre completo del remitente en el mensaje, lo usamos
          msg.sender = msg.senderName;
        }
        else if (this.senderInfo && this.senderInfo.id === msg.userFromId && this.senderInfo.fullName) {
          // Si tenemos la información en senderInfo, la usamos y la guardamos en el mensaje
          msg.sender = this.senderInfo.fullName;
          msg.senderName = this.senderInfo.fullName;
        } 
        else if (this.recipientInfo && this.recipientInfo.id === msg.userFromId && this.recipientInfo.fullName) {
          // Si tenemos la información en recipientInfo, la usamos y la guardamos en el mensaje
          msg.sender = this.recipientInfo.fullName;
          msg.senderName = this.recipientInfo.fullName;
        }
        else if (!msg.loadingSenderInfo) {
          // Si no tenemos la información, intentamos cargarla
          msg.loadingSenderInfo = true;
          
          this.userService.getUserById(msg.userFromId).subscribe({
            next: (user) => {
              if (user && user.fullName) {
                // Guardamos el nombre en el mensaje para futuras referencias
                msg.senderName = user.fullName;
                msg.sender = user.fullName;
                // Forzamos la detección de cambios si es necesario
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

    // Ordenar por fecha (más antiguos primero)
    return conversationMessages.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateA - dateB; // Orden ascendente (del más antiguo al más reciente)
    });
  }

  /**
   * Obtiene el número de mensajes no leídos en la bandeja de entrada
   */
  /**
   * Descarga el archivo adjunto de un mensaje
   * @param messageId ID del mensaje que puede ser string o number
   */
  downloadAttachment(messageId: string | number): void {
    window.open('/api/messages/file/' + messageId, '_blank');
  }

  getUnreadCount(): number {
    if (!this.messages) {
      return 0;
    }
    
    // Filtrar mensajes no leídos en la bandeja de entrada
    return this.messages.filter(msg => 
      !msg.isRead && 
      !msg.deleted && 
      this.activeFolder === 'inbox'
    ).length;
  }

  /**
   * Envía una respuesta rápida al mensaje seleccionado
   * Esta función se utiliza tanto para el modal de conversación como para respuestas rápidas
   */
  sendQuickReply(): void {
    // Validar que tenemos un mensaje y contenido para enviar
    if (!this.quickReply || !this.selectedMessage) {
      // Mostrar advertencia
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
    
    // Mostrar indicador de carga
    if (this.isLoading !== undefined) {
      this.isLoading = true;
    }
    
    // Obtener datos del mensaje seleccionado de forma segura
    const selectedMessage = this.selectedMessage;
    const userId = this.userId;
    
    // Verificar que tenemos la información del destinatario
    const otherUserId = selectedMessage.userFromId === userId ? 
                selectedMessage.userToId : 
                selectedMessage.userFromId;
    
    if (otherUserId && (!this.senderInfo || !this.recipientInfo)) {
      console.log('Obteniendo información del usuario para respuesta rápida:', otherUserId);
      this.userService.getUserById(otherUserId).subscribe({
        next: (user) => {
          console.log('Información del usuario obtenida para respuesta rápida:', user);
          // Actualizar la información del remitente o destinatario según corresponda
          if (selectedMessage.userFromId === userId) {
            this.recipientInfo = user;
          } else {
            this.senderInfo = user;
          }
        },
        error: (err) => {
          console.error('Error al obtener información del usuario para respuesta rápida:', err);
        }
      });
    }
    
    // Crear el objeto de respuesta
    const reply: Partial<Message> = {
      userFromId: userId,
      // Si el mensaje seleccionado fue enviado por el usuario actual, enviar al remitente original
      // Si el mensaje seleccionado fue recibido por el usuario actual, enviar al remitente
      userToId: selectedMessage.userFromId === userId ? 
                selectedMessage.userToId : 
                selectedMessage.userFromId,
      // studentId ya no se usa, se utiliza userFromId
      subject: `RE: ${selectedMessage.subject || ''}`,
      content: this.quickReply || '',
      date: new Date(),
      isDraft: false,
      responded: false,
      isRead: true // Los mensajes enviados se marcan como leídos automáticamente
    };
    
    // Enviar la respuesta como un nuevo mensaje
    if (this.messageService) {
      this.messageService.sendMessage(reply)
        .pipe(finalize(() => {
          if (this.isLoading !== undefined) {
            this.isLoading = false;
          }
        }))
        .subscribe({
          next: () => {
            // Notificar éxito
            if (this.toast) {
              this.toast.add({ 
                severity: 'success', 
                summary: 'Mensaje enviado', 
                detail: 'Tu mensaje ha sido enviado correctamente', 
                life: 3000 
              });
            }
            
            // Marcar el mensaje original como respondido si estamos en el visor de mensajes
            if (selectedMessage && this.showViewer) {
              const messageId = selectedMessage.id;
              if (messageId && this.messageService) {
                this.messageService.markAsResponded(messageId).subscribe(() => {
                  // Actualizar la lista de mensajes
                  if (typeof this.refreshMessages === 'function') {
                    this.refreshMessages();
                  }
                });
              }
            }
            
            // Limpiar el campo de respuesta
            if (this.quickReply !== undefined) {
              this.quickReply = '';
            }
            
            // Cerrar el visor de mensajes si está abierto, pero mantener el modal de conversación abierto
            if (this.showViewer !== undefined) {
              this.showViewer = false;
            }
            
            // Actualizar la lista de mensajes
            if (typeof this.refreshMessages === 'function') {
              this.refreshMessages();
            }
          },
          error: (err: any) => {
            // Manejar error
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

}