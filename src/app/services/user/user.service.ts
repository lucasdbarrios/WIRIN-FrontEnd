import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../env/env.service';
import { User } from '../../types/user.interface';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { AutoRefreshService } from '../auto-refresh/auto-refresh.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  private apiUrl: string;

  constructor(
    private http: HttpClient, 
    private envService: EnvService, 
    private authService: AuthService,
    autoRefreshService: AutoRefreshService
  ) {
    super(autoRefreshService);
    this.apiUrl = this.envService.getApiUrl() + '/User';
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.authService.getHeaders());
  }

  /**
   * Obtiene un usuario por ID con actualización automática cada minuto
   * @param id ID del usuario
   * @returns Observable que emite el usuario actualizado cada minuto
   */
  getUserByIdWithAutoRefresh(id: string): Observable<any> {
    return this.createAutoRefreshObservable(() => this.getUserById(id));
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.authService.getHeaders());
  }

  /**
   * Obtiene todos los usuarios con actualización automática cada minuto
   * @returns Observable que emite todos los usuarios actualizados cada minuto
   */
  getAllWithAutoRefresh(): Observable<any[]> {
    return this.createAutoRefreshObservable(() => this.getAll());
  }

  getAllStudents(): Observable<any[]> {
    let url = `${this.apiUrl}/students`;

    return this.http.get<any[]>(url, this.authService.getHeaders());
  }

  /**
   * Obtiene todos los estudiantes con actualización automática cada minuto
   * @returns Observable que emite todos los estudiantes actualizados cada minuto
   */
  getAllStudentsWithAutoRefresh(): Observable<any[]> {
    return this.createAutoRefreshObservable(() => this.getAllStudents());
  }

  getUsersByRole(role: string): Observable<any[]> {
    const url = `${this.apiUrl}/by-role/${role}`;
    return this.http.get<any[]>(url, this.authService.getHeaders());
  }

  /**
   * Obtiene usuarios por rol con actualización automática cada minuto
   * @param role Rol de los usuarios a obtener
   * @returns Observable que emite los usuarios por rol actualizados cada minuto
   */
  getUsersByRoleWithAutoRefresh(role: string): Observable<any[]> {
    return this.createAutoRefreshObservable(() => this.getUsersByRole(role));
  }

  updateUser(id: string, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user, {
      ...this.authService.getHeaders(),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      ...this.authService.getHeaders(),
      responseType: 'text'
    });
  }

  getUserName(userId: string): Promise<string> {
    return new Promise((resolve) => {
      this.getUserById(userId).subscribe({
        next: (user) => resolve(user.fullName),
        error: () => resolve("Usuario no asignado")
      });
    });
  }
}