# Arquitectura de la aplicación

## 1. Visión general

La aplicación sigue una arquitectura basada en Angular con una organización funcional por carpetas y un enfoque de capas:

- capa de presentación: componentes y páginas
- capa de acceso a datos: servicios y clientes HTTP
- capa de dominio: tipos e interfaces
- capa de infraestructura: guards, cache, configuración global, utilidades

La idea general es mantener la lógica de negocio y el acceso a datos fuera de los componentes, para que las pantallas se centren en la renderización y la interacción del usuario.

## 2. Configuración global

### app.config.ts

Este archivo centraliza la configuración global de la app:

- `provideRouter(...)`: habilita el enrutamiento con scroll restoration y navegación bloqueante.
- `provideHttpClient(withFetch())`: habilita el cliente HTTP moderno.
- `provideAnimationsAsync()`: incorpora animaciones del framework.
- `providePrimeNG(...)`: configura el tema visual de PrimeNG.
- `MessageService`: servicio para toasts y mensajes de UI.
- `UserCacheService`: servicio global de cache de información del usuario.
- `TINYMCE_SCRIPT_SRC`: carga TinyMCE desde assets públicos.

## 3. Enrutamiento

### app.routes.ts

El archivo de rutas define dos niveles clave:

- una zona principal con `AppLayout` y `AuthGuard`
- una zona WIRIN con vistas específicas del proyecto

La estructura por rutas sugiere que la app tiene:

- navegación principal
- navegación de autenticación
- navegación de dominio WIRIN
- fallback a `notfound`

### Patrón observado

```ts
{
  path: 'wirin',
  component: AppLayout,
  canActivate: [AuthGuard],
  children: [
    { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] }
  ]
}
```

Esto mantiene consistencia: toda ruta sensible pasa por la guarda y el layout compartido.

## 4. Layout y composición visual

La app usa un layout general, posiblemente con:

- topbar
- sidebar
- menu
- footer
- configurator

Los componentes de layout están en:

- src/app/layout/component/
- src/app/layout/service/

Esto permite un patrón de UI reutilizable para todas las páginas y evita duplicación de estructura visual.

## 5. Organización funcional

### Estructura sugerida por dominio

- `src/app/pages/`: pantallas por módulo o sección.
- `src/app/services/`: logica de acceso a backend, caché, mensajería, autenticación, archivos, etc.
- `src/app/types/`: interfaces para modelos de negocio.
- `src/app/guards/`: reglas de acceso.
- `src/app/utils/`: utilidades genéricas.

Este patrón es apropiado para una app de mediana a grande escala y facilita crecimiento sin mezclar responsabilidades.

## 6. Servicios

Los servicios parecen agruparse por dominio:

- auth
- user
- user-cache
- order
- subject
- file-upload
- message
- toast
- auto-refresh
- api
- base
- env

Esto es una buena práctica porque cada servicio encapsula una responsabilidad concreta, reduce acoplamiento y facilita pruebas.

## 7. Tipado y modelos

El directorio `src/app/types` contiene interfaces y tipos reutilizables como:

- user.interface.ts
- order.interface.ts
- paragraph.Interface.ts
- annotation.interface.ts
- orderDelivery.interface.ts
- message.interface.ts

Este enfoque ayuda a mantener consistencia de datos entre backend, servicios y pantallas.

## 8. Seguridad

El uso de `AuthGuard` en rutas protegidas muestra un enfoque centralizado de autorización. La comprobación de sesión o tokens se debería mantener en este punto para que otras rutas no tengan que implementar controles manuales.

Recomendación: si en el futuro se agregan roles, conviene centralizar la lógica de roles en un guard o servicio dedicado en lugar de duplicarla por vista.

## 9. Dependencias clave

### PrimeNG

Se usa para componentes UI, toasts, formularios y temas visuales.

### Angular Router

Se usa para navegación modular, rutas protegidas y carga de páginas.

### RxJS

Es probable que se use para flujos y observables de datos, especialmente en servicios de actualización y mensajes.

### TinyMCE

Se usa en flujos donde se requiere edición de texto enriquecido.

## 10. Buenas prácticas recomendadas para continuar

- Crear nuevos componentes bajo el dominio correcto en `src/app/pages/...`.
- Mantener servicios especializados por funcionalidad, no centralizar todo en un único servicio.
- Usar interfaces y tipos en `src/app/types` para contratos claros.
- Mantener guards para autenticación y autorización.
- Si agregas nuevas pantallas, integrar la ruta en `app.routes.ts` y mantener la estructura del layout.
- Evitar lógica de negocio compleja dentro de componentes; moverla a servicios.

## 11. Mapa de archivos clave

- `src/app.routes.ts` – rutas globales
- `src/app.config.ts` – configuración global
- `src/app/guards/auth.guard.ts` – protección de rutas
- `src/app/layout/` – estructura visual reutilizable
- `src/app/services/` – acceso a datos y lógica transversal
- `src/app/types/` – modelos del dominio
- `src/environments/` – configuraciones por entorno

## 12. Resumen

La arquitectura actual es una aplicación Angular modular, con un layout global, rutas protegidas, servicios bien segmentados y un esquema funcional claro. Es una base sólida para ampliar funcionalidades sin perder orden ni consistencia.
