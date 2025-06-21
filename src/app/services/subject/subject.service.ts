import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';

    @Injectable({
    providedIn: 'root',
    })
    export class SubjectService {
    private apiUrl: string;

    constructor(private http: HttpClient, private envService: EnvService, private authService: AuthService) {
        this.apiUrl = this.envService.getApiUrl() + '/Subject';
    }

    getAllSubjects(): Observable<any[]> {
        const url = `${this.apiUrl}`;
        return this.http.get<any[]>(url, this.authService.getHeaders());
    }

}