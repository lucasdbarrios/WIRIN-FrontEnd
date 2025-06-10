import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { Annotation } from '../types/annotation.interface';

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
        console.log(annotation);
        return this.http.post(`${this.apiUrl}/SaveParagraphAnnotationAsync`, { paragraphAnnotation: annotation }, {
            ...this.getHeaders(),
            headers: { 'Content-Type': 'application/json' },
            responseType: 'text'
        });
    }
}