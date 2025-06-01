import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + '/User';
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAllStudents(): Observable<any[]> {
    const url = `${this.apiUrl}/students`; 
    
    return this.http.get<any[]>(url);
  }

  getUsersByRole(role: string): Observable<any[]> {
    const url = `${this.apiUrl}/by-role/${role}`;
    return this.http.get<any[]>(url);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}