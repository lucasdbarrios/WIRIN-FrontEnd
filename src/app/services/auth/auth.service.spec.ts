import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { EnvService } from '../env/env.service';
import { provideRouter } from '@angular/router';
import { User } from '../../types/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let envService: jasmine.SpyObj<EnvService>;

  beforeEach(() => {
    const envSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);
    envSpy.getApiUrl.and.returnValue('https://api.test.com');

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: EnvService, useValue: envSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(EnvService) as jasmine.SpyObj<EnvService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería hacer login y guardar el token', (done) => {
    const mockResponse = { token: 'testToken', userId: '123' };
    const credentials = { email: 'test@example.com', password: 'password123' };

    service.login(credentials).subscribe(response => {
      expect(response.token).toBe('testToken');
      expect(localStorage.getItem('auth_token')).toBe('testToken');
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('debería registrar un usuario correctamente', (done) => {
    const mockUser: User = {
      id: '123',
      userName: 'testUser',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '123456789',
      password: 'password123',
      roles: ['user']
    };

    service.register(mockUser).subscribe(response => {
      expect(response).toEqual(mockUser);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
  });

  it('debería obtener el perfil del usuario', (done) => {
    const mockUserProfile: User = {
      id: '123',
      userName: 'testUser',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '123456789',
      password: '',
      roles: ['user']
    };

    localStorage.setItem('auth_token', 'testToken');

    service.getUserProfile().subscribe(response => {
      expect(response).toEqual(mockUserProfile);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/user/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUserProfile);
  });

  it('debería refrescar los datos del usuario correctamente', (done) => {
    const updatedUser: User = {
      id: '123',
      userName: 'updatedUser',
      email: 'updated@example.com',
      fullName: 'Updated User',
      phoneNumber: '987654321',
      password: '',
      roles: ['admin']
    };

    service.refreshUserData().subscribe(response => {
      expect(response).toEqual(updatedUser);
      done();
    });

    const req = httpMock.expectOne(`${envService.getApiUrl()}/user/me`);
    expect(req.request.method).toBe('GET');
    req.flush(updatedUser);
  });
});