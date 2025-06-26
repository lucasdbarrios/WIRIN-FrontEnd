import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { MessageService } from 'primeng/api';

describe('ToastService', () => {
  let servicio: ToastService;
  let espiaMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    const espia = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: MessageService, useValue: espia }
      ]
    });

    servicio = TestBed.inject(ToastService);
    espiaMessageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('debería mostrar un mensaje de éxito', () => {
    const mensaje = 'Todo salió bien';

    servicio.showSuccess(mensaje);

    expect(espiaMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: mensaje,
      life: 3000
    });
  });

  it('debería mostrar un mensaje de error', () => {
    const mensaje = 'Algo salió mal';

    servicio.showError(mensaje);

    expect(espiaMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: mensaje,
      life: 3000
    });
  });
});