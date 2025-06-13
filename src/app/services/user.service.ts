import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { User } from '../types/user.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService, private authService: AuthService) {
    this.apiUrl = this.envService.getApiUrl() + '/User';
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.authService.getHeaders());
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.authService.getHeaders());
  }

  getAllStudents(): Observable<any[]> {
    const url = `${this.apiUrl}/students`;
    return this.http.get<any[]>(url, this.authService.getHeaders());
  }

  getUsersByRole(role: string): Observable<any[]> {
    const url = `${this.apiUrl}/by-role/${role}`;
    return this.http.get<any[]>(url, this.authService.getHeaders());
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