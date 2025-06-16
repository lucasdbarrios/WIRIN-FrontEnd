import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { MessageService } from 'primeng/api';

describe('ToastService', () => {
  let service: ToastService;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: MessageService, useValue: spy }
      ]
    });

    service = TestBed.inject(ToastService);
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should show a success message', () => {
    const message = 'Todo salió bien';

    service.showSuccess(message);

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  });

  it('should show an error message', () => {
    const message = 'Algo salió mal';

    service.showError(message);

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  });
});