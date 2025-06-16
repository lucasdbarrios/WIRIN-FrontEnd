import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrderParagraphService } from './orderParagraph.service';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { ProcessParagraphRequest } from '../../types/Requests/ProcessParagraphRequest';
import { provideRouter } from '@angular/router';

describe('OrderParagraphService', () => {
  let service: OrderParagraphService;
  let httpMock: HttpTestingController;
  let envService: jasmine.SpyObj<EnvService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const envSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);
    envSpy.getApiUrl.and.returnValue('https://api.test.com');

    const authSpy = jasmine.createSpyObj('AuthService', ['getHeaders']);
    authSpy.getHeaders.and.returnValue({ headers: { 'Authorization': 'Bearer testToken' } });

    TestBed.configureTestingModule({
      providers: [
        OrderParagraphService,
        { provide: EnvService, useValue: envSpy },
        { provide: AuthService, useValue: authSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(OrderParagraphService);
    httpMock = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(EnvService) as jasmine.SpyObj<EnvService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería procesar párrafos y enviar solicitud POST', (done) => {
    const requestBody: ProcessParagraphRequest = { 
      orderId: 1, 
      paragraphText: 'Ejemplo de párrafo',  // Cambié 'text' por 'paragraphText'
      pageNumber: 2,
      hasError: false,
      errorMessage: '' 
    };
  
    const mockResponse = 'Procesado correctamente';
  
    service.processParagraphs(requestBody).subscribe(response => {
      expect(response).toBe(mockResponse);
      done();
    });
  
    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderParagraph`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(requestBody);
    req.flush(mockResponse);
  });

  it('debería obtener párrafos por ID de orden', (done) => {
    const orderId = '123';
    const mockResponse = [{ id: '1', text: 'Párrafo de prueba' }];

    service.getParagraphsByOrderId(orderId).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderParagraph/getParagraphsByOrderId/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería guardar mensaje de error en párrafos', (done) => {
    const errorData = { paragraphId: '1', error: 'Error en el procesamiento' };
    const mockResponse = 'Error registrado';

    service.saveErrorMessageParagraph(errorData).subscribe(response => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderParagraph/hasError`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(errorData);
    req.flush(mockResponse);
  });
});