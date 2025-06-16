import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrderManagmentService } from './orderManagment.service';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { provideRouter } from '@angular/router';

describe('OrderManagmentService', () => {
  let service: OrderManagmentService;
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
        OrderManagmentService,
        { provide: EnvService, useValue: envSpy },
        { provide: AuthService, useValue: authSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(OrderManagmentService);
    httpMock = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(EnvService) as jasmine.SpyObj<EnvService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener órdenes por estado', (done) => {
    const mockResponse = [{ id: 1, status: 'pendiente' }, { id: 2, status: 'completado' }];

    service.getOrdersByState('pendiente').subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderManagment/Bystatus?status=pendiente`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería obtener órdenes asignadas a un usuario', (done) => {
    const mockResponse = [{ id: 1, assignedUserId: '123' }];

    service.getAssignedOrders('123').subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderManagment/byAssigned?UserId=123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería cambiar el estado de una orden', (done) => {
    const formData = new FormData();
    formData.append('id', '1');
    formData.append('status', 'completado');
    const mockResponse = { success: true };

    service.changeStatus(formData).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderManagment`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: '1', status: 'completado' });
    req.flush(mockResponse);
  });

  it('debería asignar un voluntario a una orden', (done) => {
    const formData = new FormData();
    formData.append('id', '1');
    formData.append('userId', '456');
    const mockResponse = { success: true };

    service.saveVoluntarioId(formData).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderManagment/saveVoluntarioId`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: '1', userId: '456' });
    req.flush(mockResponse);
  });

  it('debería asignar un revisor a una orden', (done) => {
    const formData = new FormData();
    formData.append('id', '1');
    formData.append('userId', '789');
    const mockResponse = { success: true };

    service.saveRevisorId(formData).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderManagment/saveRevisorId`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: '1', userId: '789' });
    req.flush(mockResponse);
  });

  it('debería guardar cambios de OCR en una orden', (done) => {
    const orderId = 1;
    const ocrData = { correctedText: 'Texto corregido' };
    const mockResponse = { success: true };

    service.saveOcrChanges(orderId, ocrData).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/OrderManagment/saveOcrChanges/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(ocrData);
    req.flush(mockResponse);
  });
});