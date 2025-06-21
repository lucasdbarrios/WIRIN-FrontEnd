import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentDeliveryService } from '../student-delivery/student-delivery.service';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';

describe('StudentDelivery Service', () => {
  let service: StudentDeliveryService;
  let httpMock: HttpTestingController;

  // 🧠 creamos los spies FUERA del beforeEach
  const envServiceSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);
  const authServiceSpy = jasmine.createSpyObj('AuthService', ['getHeaders']);

  beforeEach(() => {
    // ✅ primero se le asigna el valor
    envServiceSpy.getApiUrl.and.returnValue('https://mockapi.com');
    authServiceSpy.getHeaders.and.returnValue({ headers: { Authorization: 'Bearer token' } });

    // ✅ luego recién armamos el TestBed con esos spies ya listos
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StudentDeliveryService,
        { provide: EnvService, useValue: envServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(StudentDeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create student delivery', () => {
    const mockRequest = { studentId: 'abc123', orderDeliveryId: 321 };
    const mockResponse = { id: 1, ...mockRequest };

    service.createStudentDelivery(mockRequest).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://mockapi.com/StudentDelivery');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should get users without delivery', () => {
    const deliveryId = 321;
    const mockUsers = [{ id: 1, name: 'Juan' }];

    service.getUsersWithoutOrderDelivery(deliveryId).subscribe(res => {
      expect(res).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`https://mockapi.com/StudentDelivery/${deliveryId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
});