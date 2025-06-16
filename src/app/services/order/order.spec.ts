import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { provideRouter } from '@angular/router';
import { Paragraph } from '../../types/paragraph.Interface';

describe('OrderService', () => {
  let service: OrderService;
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
        OrderService,
        { provide: EnvService, useValue: envSpy },
        { provide: AuthService, useValue: authSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(EnvService) as jasmine.SpyObj<EnvService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener todas las órdenes', (done) => {
    const mockResponse = [{ id: 1, name: 'Orden 1' }, { id: 2, name: 'Orden 2' }];

    service.getOrders().subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería obtener órdenes entregadas', (done) => {
    const mockResponse = [{ id: 1, delivered: true }];

    service.getOrdersDelivered().subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order/delivered`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería crear una nueva orden', (done) => {
    const mockResponse = { success: true };
    const formData = new FormData();
    formData.append('file', new Blob());
  
    service.createOrder(formData).subscribe(event => {
      if ('body' in event) {
        expect(event.body).toEqual(mockResponse);
        done();
      }
    });
  
    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse, { status: 200, statusText: 'OK' });
  });

  it('debería descargar un archivo por ID', (done) => {
    const mockResponse = new Blob(['archivo contenido'], { type: 'application/pdf' });

    service.downloadFile(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order/download/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería recuperar un archivo por ID', (done) => {
    const mockResponse = new Blob(['archivo recuperado'], { type: 'application/pdf' });

    service.recoveryFile(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order/recovery/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería eliminar una orden por ID', (done) => {
    const mockResponse = { success: true };

    service.deleteOrder(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('debería actualizar una orden', (done) => {
    const mockResponse = { success: true };
    const formData = new FormData();
    formData.append('file', new Blob());
  
    service.updateOrder(1, formData).subscribe(event => {
      if ('body' in event) {
        expect(event.body).toEqual(mockResponse);
        done();
      }
    });
  
    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse, { status: 200, statusText: 'OK' });
  });

  it('debería obtener tarea por ID', (done) => {
    const mockResponse = { id: 1, name: 'Tarea de prueba' };

    service.getTaskById(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería verificar OCR previo por ID', (done) => {
    const mockResponse = { ocrCheck: true };

    service.checkOcrPrevius(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order/ocr-previus/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería obtener párrafos por ID de orden', (done) => {
    const mockResponse: Paragraph[] = [
        {
          number: 1,
          text: 'Párrafo 1',
          paragraphText: 'Párrafo de prueba',
          pageNumber: 2,
          hasError: false,
          errorMessage: ''
        },
        {
          number: 2,
          text: 'Párrafo 2',
          paragraphText: 'Otro párrafo de prueba',
          pageNumber: 3,
          hasError: true,
          errorMessage: 'Error detectado'
        }
      ];

    service.getParagraphsByOrderId(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/Order/getParagraphsByOrderId/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});