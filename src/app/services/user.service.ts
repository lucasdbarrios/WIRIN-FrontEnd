import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { User } from '../types/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + '/User';
  }

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  getAllStudents(): Observable<any[]> {
    const url = `${this.apiUrl}/students`;
    return this.http.get<any[]>(url, this.getHeaders());
  }

  getUsersByRole(role: string): Observable<any[]> {
    const url = `${this.apiUrl}/by-role/${role}`;
    return this.http.get<any[]>(url, this.getHeaders());
  }

  updateUser(id: string, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user, {
      ...this.getHeaders(),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      ...this.getHeaders(),
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