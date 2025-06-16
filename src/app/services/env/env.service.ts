import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  private env: { [key: string]: any } = environment;

  constructor() {
    if (!this.env['apiUrl']) {
      console.warn('Variable de entorno apiUrl no encontrada en el archivo environment.');
    }
  }

  get(key: string, defaultValue: any = ''): any {
    return this.env[key] || defaultValue;
  }

  isProduction(): boolean {
    return this.env['production'] === true;
  }

  getApiUrl(): string {
    return this.env['apiUrl'] || '';
  }
}