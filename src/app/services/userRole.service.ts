import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserRoleService {
    constructor(private authService: AuthService) {}

    isRevisor(): boolean {
        return this.authService.hasRole('Voluntario Administrativo');
    }

    isVoluntario(): boolean {
        return this.authService.hasRole('Voluntario');
    }

    isBibliotecario(): boolean {
        return this.authService.hasRole('Bibliotecario') || this.authService.hasRole('Admin');
    }

    isAlumno(): boolean {
        return this.authService.hasRole('Alumno');
    }
}