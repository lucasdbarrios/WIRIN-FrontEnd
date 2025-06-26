import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentDeliveryService } from '../student-delivery/student-delivery.service';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';

describe('Servicio StudentDelivery', () => {
  let servicio: StudentDeliveryService;
  let httpMock: HttpTestingController;

  // 🧠 Espías creados FUERA del beforeEach
  const envServiceSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);
  const authServiceSpy = jasmine.createSpyObj('AuthService', ['getHeaders']);

  beforeEach(() => {
    // ✅ Primero se asignan los valores mock
    envServiceSpy.getApiUrl.and.returnValue('https://mockapi.com');
    authServiceSpy.getHeaders.and.returnValue({ headers: { Authorization: 'Bearer token' } });

    // ✅ Luego se configura TestBed con los espías ya listos
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StudentDeliveryService,
        { provide: EnvService, useValue: envServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    servicio = TestBed.inject(StudentDeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear una entrega para un estudiante', () => {
    const solicitudMock = { studentId: 'abc123', orderDeliveryId: 321 };
    const respuestaMock = { id: 1, ...solicitudMock };

    servicio.createStudentDelivery(solicitudMock).subscribe(res => {
      expect(res).toEqual(respuestaMock);
    });

    const req = httpMock.expectOne('https://mockapi.com/StudentDelivery');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(solicitudMock);
    req.flush(respuestaMock);
  });

  it('debería obtener usuarios sin entrega asignada', () => {
    const deliveryId = 321;
    const usuariosMock = [{ id: 1, name: 'Juan' }];

    servicio.getUsersWithoutOrderDelivery(deliveryId).subscribe(res => {
      expect(res).toEqual(usuariosMock);
    });

    const req = httpMock.expectOne(`https://mockapi.com/StudentDelivery/${deliveryId}`);
    expect(req.request.method).toBe('GET');
    req.flush(usuariosMock);
  });
});