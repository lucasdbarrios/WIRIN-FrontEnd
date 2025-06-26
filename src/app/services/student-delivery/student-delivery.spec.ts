import { TestBed } from '@angular/core/testing';
import { StudentDeliveryService } from './student-delivery.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('Servicio StudentDelivery', () => {
  let servicio: StudentDeliveryService;
  let httpMock: HttpTestingController;

  const envServiceEspia = jasmine.createSpyObj('EnvService', ['getApiUrl']);
  const authServiceEspia = jasmine.createSpyObj('AuthService', ['getHeaders']);

  beforeEach(() => {
    envServiceEspia.getApiUrl.and.returnValue('https://mockapi.com');
    authServiceEspia.getHeaders.and.returnValue({ headers: { Authorization: 'Bearer token' } });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StudentDeliveryService,
        { provide: EnvService, useValue: envServiceEspia },
        { provide: AuthService, useValue: authServiceEspia }
      ]
    });

    servicio = TestBed.inject(StudentDeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear una entrega de estudiante', () => {
    const solicitudMock = { studentId: 'abc', orderDeliveryId: 42 };
    const respuestaMock = { id: 1, ...solicitudMock };

    servicio.createStudentDelivery(solicitudMock).subscribe(respuesta => {
      expect(respuesta).toEqual(respuestaMock);
    });

    const req = httpMock.expectOne('https://mockapi.com/StudentDelivery');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(solicitudMock);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(respuestaMock);
  });

  it('debería obtener usuarios sin entrega asignada', () => {
    const deliveryId = 42;
    const usuariosMock = [{ id: 1, name: 'Martina' }];

    servicio.getUsersWithoutOrderDelivery(deliveryId).subscribe(usuarios => {
      expect(usuarios).toEqual(usuariosMock);
    });

    const req = httpMock.expectOne(`https://mockapi.com/StudentDelivery/${deliveryId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(usuariosMock);
  });
});