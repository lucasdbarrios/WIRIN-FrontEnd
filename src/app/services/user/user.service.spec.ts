import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { of, throwError } from 'rxjs';
import { User } from '../../types/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let envSpy: jasmine.SpyObj<EnvService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  const fakeHeaders = { headers: { Authorization: 'Bearer token' } };
  const mockUrl = 'http://localhost/api/User';

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'put', 'delete']);
    envSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);
    authSpy = jasmine.createSpyObj('AuthService', ['getHeaders']);

    envSpy.getApiUrl.and.returnValue('http://localhost/api');
    authSpy.getHeaders.and.returnValue(fakeHeaders);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: HttpClient, useValue: httpSpy },
        { provide: EnvService, useValue: envSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(UserService);
  });

  it('should retrieve user by ID', () => {
    const mockUser = { id: '123', fullName: 'Juan Pérez' };
    httpSpy.get.and.returnValue(of(mockUser));

    service.getUserById('123').subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(httpSpy.get).toHaveBeenCalledWith(`${mockUrl}/123`, fakeHeaders);
    });
  });

  it('should retrieve all users', () => {
    httpSpy.get.and.returnValue(of([]));
    service.getAll().subscribe(data => {
      expect(data).toEqual([]);
      expect(httpSpy.get).toHaveBeenCalledWith(mockUrl, fakeHeaders);
    });
  });

  it('should retrieve users by role', () => {
    const role = 'Alumno';
    httpSpy.get.and.returnValue(of([{ id: '1', fullName: 'Ana' }]));

    service.getUsersByRole(role).subscribe(data => {
      expect(httpSpy.get).toHaveBeenCalledWith(`${mockUrl}/by-role/${role}`, fakeHeaders);
    });
  });

  it('should update a user', () => {
    const user: User = {
      id: '1',
      fullName: 'Test User',
      userName: 'testuser',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      roles: ['Alumno']
    };
  
    httpSpy.put.and.returnValue(of(user));
  
    service.updateUser('1', user).subscribe(data => {
      expect(httpSpy.put).toHaveBeenCalledWith(`${mockUrl}/1`, user, jasmine.any(Object));
    });
  });

  it('should delete a user', () => {
    httpSpy.delete.and.returnValue(of('OK'));
    service.deleteUser('9').subscribe(res => {
      expect(res).toBe('OK');
      expect(httpSpy.delete).toHaveBeenCalled();
    });
  });

  it('should resolve full name with getUserName', async () => {
    const mockUser = { fullName: 'Carlos' };
    httpSpy.get.and.returnValue(of(mockUser));

    const name = await service.getUserName('7');
    expect(name).toBe('Carlos');
  });

  it('should resolve fallback name on error in getUserName', async () => {
    httpSpy.get.and.returnValue(throwError(() => new Error('not found')));

    const name = await service.getUserName('999');
    expect(name).toBe('Usuario no asignado');
  });
});