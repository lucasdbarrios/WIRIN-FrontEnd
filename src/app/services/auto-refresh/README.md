# Auto-Refresh Service para WIRIN-FrontEnd

## Descripción

Este servicio proporciona una funcionalidad de actualización automática (auto-refresh) para los servicios de la aplicación WIRIN-FrontEnd. Permite que los componentes reciban datos actualizados del backend a intervalos regulares (por defecto cada minuto) sin necesidad de realizar actualizaciones manuales.

## Estructura

El sistema de auto-refresh está compuesto por:

1. **AutoRefreshService**: Servicio base que proporciona la funcionalidad de actualización automática.
2. **BaseService**: Clase base que los servicios pueden extender para heredar la funcionalidad de auto-refresh.
3. **Métodos WithAutoRefresh**: Cada servicio implementa métodos específicos con el sufijo `WithAutoRefresh` que devuelven Observables que se actualizan automáticamente.

## Cómo utilizar

### En servicios existentes

Para añadir la funcionalidad de auto-refresh a un servicio existente:

1. Importar `BaseService` y `AutoRefreshService`
2. Extender el servicio de `BaseService`
3. Inyectar `AutoRefreshService` en el constructor
4. Implementar métodos con el sufijo `WithAutoRefresh` que utilicen `createAutoRefreshObservable`

Ejemplo:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { AutoRefreshService } from '../auto-refresh/auto-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class MiServicio extends BaseService {
  constructor(
    private http: HttpClient,
    autoRefreshService: AutoRefreshService
  ) {
    super(autoRefreshService);
  }

  // Método normal
  getDatos(): Observable<any[]> {
    return this.http.get<any[]>('/api/datos');
  }

  // Método con auto-refresh
  getDatosWithAutoRefresh(): Observable<any[]> {
    return this.createAutoRefreshObservable(() => this.getDatos());
  }
}
```

### En componentes

Para utilizar los servicios con auto-refresh en un componente:

1. Inyectar el servicio en el constructor
2. Utilizar los métodos con el sufijo `WithAutoRefresh`
3. Suscribirse al Observable o utilizar el pipe async en la plantilla

Ejemplo:

```typescript
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MiServicio } from '../../services/mi-servicio/mi.service';

@Component({
  selector: 'app-mi-componente',
  template: `
    <div *ngIf="datos$ | async as datos">
      <!-- Mostrar datos -->
    </div>
  `
})
export class MiComponente implements OnInit {
  datos$!: Observable<any[]>;

  constructor(private miServicio: MiServicio) {}

  ngOnInit() {
    // Los datos se actualizarán automáticamente cada minuto
    this.datos$ = this.miServicio.getDatosWithAutoRefresh();
  }
}
```

## Personalización del intervalo

Por defecto, el intervalo de actualización es de 60000 ms (1 minuto). Para personalizar este intervalo, se puede pasar un segundo parámetro al método `createAutoRefreshObservable`:

```typescript
// Actualizar cada 30 segundos
getDatosWithAutoRefresh(): Observable<any[]> {
  return this.createAutoRefreshObservable(() => this.getDatos(), 30000);
}
```

## Consideraciones de rendimiento

- Utilizar auto-refresh solo cuando sea necesario, ya que aumenta el número de peticiones al servidor.
- Considerar el impacto en el rendimiento del servidor al establecer intervalos muy cortos.
- Para datos que no cambian con frecuencia, utilizar intervalos más largos.
- Cancelar las suscripciones en `ngOnDestroy` para evitar fugas de memoria.