import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../base/base.service';
import { AutoRefreshService } from '../auto-refresh/auto-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService extends BaseService {
  private apiUrl: string;

  constructor(
    private http: HttpClient, 
    private envService: EnvService, 
    private authService: AuthService,
    autoRefreshService: AutoRefreshService
  ) {
    super(autoRefreshService);
    this.apiUrl = this.envService.getApiUrl();
  }

  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.apiUrl}/upload`, formData, { 
      ...this.authService.getHeaders(), 
      reportProgress: true, 
      observe: 'events' 
    });
  }

  processOcr(file: File, processor: string = 'Local'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.apiUrl}/ocr/${processor}`, formData, this.authService.getHeaders());
  }

  newProcessOcr(id: number, processor: string = 'Local'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ocr/${processor}?id=${id}`, processor, this.authService.getHeaders());
  }

  /**
   * Procesa OCR con actualización automática cada minuto
   * @param id ID de la tarea
   * @param processor Tipo de procesador OCR (por defecto 'Local')
   * @returns Observable que emite los datos OCR actualizados cada minuto
   */
  newProcessOcrWithAutoRefresh(id: number, processor: string = 'Local'): Observable<any> {
    return this.createAutoRefreshObservable(() => this.newProcessOcr(id, processor));
  }

  isValidFileType(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return validTypes.includes(file.type);
  }
}