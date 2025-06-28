import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User } from '../../types/user.interface';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserCacheService {
  private usersCache = new Map<string, User>();
  private usersSubject = new BehaviorSubject<Map<string, User>>(new Map());
  private loadingUsers = new Set<string>();

  constructor(private userService: UserService) {}

  /**
   * Obtiene un usuario por ID, primero del cache y si no existe lo carga del servidor
   */
  getUserById(userId: string): Observable<User | null> {
    // Si ya está en cache, lo devolvemos
    if (this.usersCache.has(userId)) {
      return of(this.usersCache.get(userId)!);
    }

    // Si ya se está cargando, esperamos a que termine
    if (this.loadingUsers.has(userId)) {
      return this.usersSubject.pipe(
        map(cache => cache.get(userId) || null),
        // Filtramos hasta que el usuario esté disponible
        map(user => user || null)
      );
    }

    // Marcamos como cargando y hacemos la petición
    this.loadingUsers.add(userId);
    
    return this.userService.getUserById(userId).pipe(
      tap(user => {
        if (user) {
          this.addUserToCache(user);
        }
        this.loadingUsers.delete(userId);
      }),
      catchError(error => {
        console.error(`Error loading user ${userId}:`, error);
        this.loadingUsers.delete(userId);
        return of(null);
      })
    );
  }

  /**
   * Obtiene múltiples usuarios por sus IDs
   */
  getUsersByIds(userIds: string[]): Observable<Map<string, User>> {
    const missingIds = userIds.filter(id => !this.usersCache.has(id) && !this.loadingUsers.has(id));
    
    if (missingIds.length === 0) {
      // Todos los usuarios están en cache
      const result = new Map<string, User>();
      userIds.forEach(id => {
        const user = this.usersCache.get(id);
        if (user) {
          result.set(id, user);
        }
      });
      return of(result);
    }

    // Cargar usuarios faltantes
    const loadPromises = missingIds.map(id => {
      this.loadingUsers.add(id);
      return this.userService.getUserById(id).pipe(
        tap(user => {
          if (user) {
            this.addUserToCache(user);
          }
          this.loadingUsers.delete(id);
        }),
        catchError(error => {
          console.error(`Error loading user ${id}:`, error);
          this.loadingUsers.delete(id);
          return of(null);
        })
      ).toPromise();
    });

    return new Observable(observer => {
      Promise.all(loadPromises).then(() => {
        const result = new Map<string, User>();
        userIds.forEach(id => {
          const user = this.usersCache.get(id);
          if (user) {
            result.set(id, user);
          }
        });
        observer.next(result);
        observer.complete();
      });
    });
  }

  /**
   * Obtiene el nombre de un usuario por ID
   */
  getUserName(userId: string): Observable<string> {
    return this.getUserById(userId).pipe(
      map(user => user?.fullName || 'Usuario desconocido')
    );
  }

  /**
   * Añade un usuario al cache
   */
  private addUserToCache(user: User): void {
    if (user && user.id) {
      this.usersCache.set(user.id, user);
      this.usersSubject.next(new Map(this.usersCache));
    }
  }

  /**
   * Añade múltiples usuarios al cache
   */
  addUsersToCache(users: User[]): void {
    users.forEach(user => {
      if (user && user.id) {
        this.usersCache.set(user.id, user);
      }
    });
    this.usersSubject.next(new Map(this.usersCache));
  }

  /**
   * Limpia el cache de usuarios
   */
  clearCache(): void {
    this.usersCache.clear();
    this.usersSubject.next(new Map());
  }

  /**
   * Obtiene todos los usuarios del cache
   */
  getCachedUsers(): Map<string, User> {
    return new Map(this.usersCache);
  }

  /**
   * Verifica si un usuario está en cache
   */
  isUserCached(userId: string): boolean {
    return this.usersCache.has(userId);
  }

  /**
   * Pre-carga usuarios por rol
   */
  preloadUsersByRole(role: string): Observable<User[]> {
    return this.userService.getUsersByRole(role).pipe(
      tap(users => {
        this.addUsersToCache(users);
      })
    );
  }
}