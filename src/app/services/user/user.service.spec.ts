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

  const encabezadosMock = { headers: { Authorization: 'Bearer token' } };
  const urlBase = 'http://localhost/api/User';

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'put', 'delete']);
    envSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);
    authSpy = jasmine.createSpyObj('AuthService', ['getHeaders']);

    envSpy.getApiUrl.and.returnValue('http://localhost/api');
    authSpy.getHeaders.and.returnValue(encabezadosMock);

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

  it('debería obtener un usuario por ID', () => {
    const usuarioMock = { id: '123', fullName: 'Juan Pérez' };
    httpSpy.get.and.returnValue(of(usuarioMock));

    service.getUserById('123').subscribe(user => {
      expect(user).toEqual(usuarioMock);
      expect(httpSpy.get).toHaveBeenCalledWith(`${urlBase}/123`, encabezadosMock);
    });
  });

  it('debería obtener todos los usuarios', () => {
    httpSpy.get.and.returnValue(of([]));
    service.getAll().subscribe(usuarios => {
      expect(usuarios).toEqual([]);
      expect(httpSpy.get).toHaveBeenCalledWith(urlBase, encabezadosMock);
    });
  });

  it('debería obtener todos los estudiantes', () => {
    const estudiantesMock = [
      { id: '1', fullName: 'Lucía' },
      { id: '2', fullName: 'Martín' }
    ];

    httpSpy.get.and.returnValue(of(estudiantesMock));

    service.getAllStudents().subscribe(data => {
      expect(data).toEqual(estudiantesMock);
      expect(httpSpy.get).toHaveBeenCalledWith(`${urlBase}/students`, encabezadosMock);
    });
  });

  it('debería obtener usuarios por rol', () => {
    const rol = 'Alumno';
    httpSpy.get.and.returnValue(of([{ id: '1', fullName: 'Ana' }]));

    service.getUsersByRole(rol).subscribe(() => {
      expect(httpSpy.get).toHaveBeenCalledWith(`${urlBase}/by-role/${rol}`, encabezadosMock);
    });
  });

  it('debería actualizar un usuario', () => {
    const usuario: User = {
      id: '1',
      fullName: 'Usuario de Prueba',
      userName: 'usuarioprueba',
      email: 'test@ejemplo.com',
      phoneNumber: '1234567890',
      roles: ['Alumno']
    };

    httpSpy.put.and.returnValue(of(usuario));

    service.updateUser('1', usuario).subscribe(data => {
      expect(httpSpy.put).toHaveBeenCalledWith(`${urlBase}/1`, usuario, jasmine.any(Object));
    });
  });

  it('debería eliminar un usuario', () => {
    httpSpy.delete.and.returnValue(of('OK'));

    service.deleteUser('9').subscribe(respuesta => {
      expect(respuesta).toBe('OK');
      expect(httpSpy.delete).toHaveBeenCalledWith(`${urlBase}/9`, jasmine.any(Object));
    });
  });

  it('debería resolver el nombre completo con getUserName', async () => {
    const usuarioMock = { fullName: 'Carlos' };
    httpSpy.get.and.returnValue(of(usuarioMock));

    const nombre = await service.getUserName('7');
    expect(nombre).toBe('Carlos');
  });

  it('debería devolver "Usuario no asignado" si hay error en getUserName', async () => {
    httpSpy.get.and.returnValue(throwError(() => new Error('No encontrado')));

    const nombre = await service.getUserName('999');
    expect(nombre).toBe('Usuario no asignado');
  });
});