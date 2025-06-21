import { TestBed } from '@angular/core/testing';
import { StudentDeliveryService } from './student-delivery.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('StudentDeliveryService', () => {
  let service: StudentDeliveryService;
  let httpMock: HttpTestingController;

  const envServiceSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);
  const authServiceSpy = jasmine.createSpyObj('AuthService', ['getHeaders']);

  beforeEach(() => {
    envServiceSpy.getApiUrl.and.returnValue('https://mockapi.com');
    authServiceSpy.getHeaders.and.returnValue({ headers: { Authorization: 'Bearer token' } });

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
    const mockRequest = { studentId: 'abc', orderDeliveryId: 42 };
    const mockResponse = { id: 1, ...mockRequest };

    service.createStudentDelivery(mockRequest).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://mockapi.com/StudentDelivery');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockResponse);
  });

  it('should get users without delivery', () => {
    const deliveryId = 42;
    const mockUsers = [{ id: 1, name: 'Martina' }];

    service.getUsersWithoutOrderDelivery(deliveryId).subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`https://mockapi.com/StudentDelivery/${deliveryId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    req.flush(mockUsers);
  });
});