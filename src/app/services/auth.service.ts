import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EnvService } from './env.service';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types/user.interface';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private userRoleSubject = new BehaviorSubject<string[] | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private envService: EnvService, private router: Router) {
    this.apiUrl = this.envService.getApiUrl();
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        
        const rolesClaim = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        const user: User = {
          id: decodedToken.sub || '',
          userName: decodedToken.userName || '',
          email: decodedToken.email || '',
          fullName: decodedToken.fullName || '',
          phoneNumber: decodedToken.phoneNumber || '',
          password: '',
          roles: Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim]
        };
        this.currentUserSubject.next(user);
        this.userRoleSubject.next(user.roles.length > 0 ? user.roles : null);
      } catch (error: any) {
        console.error('Error al decodificar el token:', error);
        console.error('Stack del error:', error?.stack);
        this.currentUserSubject.next(null);
      }
    }
  }

  login(credentials: LoginRequest): Observable<{ token: string; userId: string; role?: string }> {
    return this.http.post<{ token: string; userId: string; role?: string }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);

          try {
            const decodedToken: any = jwtDecode(response.token);

            const rolesClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            const userRoles = Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];

            const user: User = {
              id: decodedToken.sub || '',
              userName: decodedToken.userName || '',
              email: decodedToken.email || '',
              fullName: decodedToken.fullName || '',
              phoneNumber: decodedToken.phoneNumber || '',
              password: '',
              roles: userRoles
            };

            this.currentUserSubject.next(user);

            this.userRoleSubject.next(user.roles.length > 0 ? user.roles : null);

          } catch (error) {
            console.error("Error al decodificar el token en login:", error);
          }
        })
      );
}

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, user);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  
    this.currentUserSubject.next(null);
    this.userRoleSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserProfile(): Observable<User> {
    const token = localStorage.getItem(this.tokenKey);
    return this.http.get<User>(`${this.apiUrl}/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getCurrentUser(): Observable<User | null> {
    if (!this.currentUserSubject.value) {
      this.getUserProfile().subscribe({
        next: (userData) => {
          this.currentUserSubject.next(userData);
        },
        error: (error) => {
          console.error('Error al cargar el perfil:', error);
          this.currentUserSubject.next(null);
        },
      });
    }
    return this.currentUser$;
  }

  getCurrentUserRole(): string[] | null {
    return this.userRoleSubject.value;
  }

  hasRole(role: string): boolean {
    const roles = this.getCurrentUserRole();
    return roles ? roles.includes(role) : false;
}

}