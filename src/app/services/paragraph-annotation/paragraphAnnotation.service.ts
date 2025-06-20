import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from '../env/env.service';
import { Observable } from 'rxjs';
import { Annotation } from '../../types/annotation.interface';

@Injectable({
    providedIn: 'root'
})
export class ParagraphAnnotationService {
    private apiUrl: string;

    constructor(private http: HttpClient, private envService: EnvService) {
        this.apiUrl = this.envService.getApiUrl() + "/ParagraphAnnotation";
    }

    private getHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    }

    saveErrorMessageParagraph(annotation: Annotation): Observable<any> {
        const tokenHeaders = this.getHeaders().headers;
        return this.http.post(`${this.apiUrl}`, { paragraphAnnotation: annotation }, {
            headers: { ...tokenHeaders, 'Content-Type': 'application/json' },
            responseType: 'text'
        });
    }
    
}