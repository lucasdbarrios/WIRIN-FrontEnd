import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EnvService } from '../env/env.service';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../types/user.interface';
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
  private userDataLoaded = false;

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
    this.userDataLoaded = false;
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
    if (!this.currentUserSubject.value && !this.userDataLoaded) {
      this.userDataLoaded = true;
      this.getUserProfile().subscribe({
        next: (userData) => {
          this.currentUserSubject.next(userData);
        },
        error: (error) => {
          console.error('Error al cargar el perfil:', error);
          this.currentUserSubject.next(null);
          this.userDataLoaded = false;
        },
      });
    }
    return this.currentUser$;
  }

  /**
   * Obtiene el usuario actual de forma síncrona sin necesidad de suscripción
   * @returns El usuario actual o null si no hay usuario autenticado
   */
  getUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene los roles del usuario actual
   * @returns Los roles del usuario actual o null si no hay roles
   */
  getCurrentUserRole(): string[] | null {
    return this.userRoleSubject.value;
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   * @param role El rol a verificar
   * @returns true si el usuario tiene el rol, false en caso contrario
   */
  hasRole(role: string): boolean {
    const roles = this.getCurrentUserRole();
    return roles ? roles.includes(role) : false;
  }
  
  /**
   * Verifica si el usuario actual tiene al menos uno de los roles especificados
   * @param roles Los roles a verificar
   * @returns true si el usuario tiene al menos uno de los roles, false en caso contrario
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getCurrentUserRole();
    return userRoles ? roles.some(role => userRoles.includes(role)) : false;
  }
  
  /**
   * Obtiene el ID del usuario actual de forma síncrona
   * @returns El ID del usuario actual o null si no hay usuario autenticado
   */
  getUserId(): string | null {
    return this.currentUserSubject.value?.id || null;
  }
  
  /**
   * Obtiene el nombre completo del usuario actual de forma síncrona
   * @returns El nombre completo del usuario actual o null si no hay usuario autenticado
   */
  getUserFullName(): string | null {
    return this.currentUserSubject.value?.fullName || null;
  }
  
  /**
   * Obtiene el email del usuario actual de forma síncrona
   * @returns El email del usuario actual o null si no hay usuario autenticado
   */
  getUserEmail(): string | null {
    return this.currentUserSubject.value?.email || null;
  }
  
  /**
   * Fuerza la recarga de los datos del usuario desde el servidor
   * @returns Observable con los datos del usuario actualizados
   */
  refreshUserData(): Observable<User | null> {
    this.userDataLoaded = true;
    return this.getUserProfile().pipe(
      tap({
        next: (userData) => {
          this.currentUserSubject.next(userData);
        },
        error: (error) => {
          console.error('Error al recargar el perfil:', error);
          this.userDataLoaded = false;
        }
      })
    );
  }

  getHeaders() {
    const token = localStorage.getItem('auth_token');

    if (!token || this.isTokenExpired(token)) {
      localStorage.removeItem('auth_token');
      window.location.href = "/login";
      return {};
    }

    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  //verifica si el token sigue siendo válido o ya expiro
  private isTokenExpired(token: string): boolean {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  }

}