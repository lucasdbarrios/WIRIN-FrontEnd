# Arquitectura de la aplicación

## 1. Visión general

La app está construida con Angular 19 y sigue un modelo por capas con un eje principal en el módulo WIRIN. La lógica se organiza así:

- capa de presentación: componentes y plantillas
- capa de negocio: servicios, validaciones, filtros y acciones del dominio
- capa de acceso a datos: HttpClient contra la API
- capa transversal: guarda de autenticación, env config, auto-refresh, cache de sesión

La intención es que el componente muestre UI y reciba datos del servicio, pero no encapsule lógica compleja del negocio ni llamadas HTTP directas.

## 2. Configuración global

### app.config.ts

Este archivo centraliza la configuración de la app:

- `provideRouter(...)`: router global con scroll y navegación bloqueante
- `provideHttpClient(withFetch())`: cliente HTTP moderno
- `provideAnimationsAsync()`: animaciones
- `providePrimeNG(...)`: tema visual y estilos de PrimeNG
- `MessageService`: toasts del sistema
- `UserCacheService`: almacenamiento de datos del usuario
- `TINYMCE_SCRIPT_SRC`: carga TinyMCE en la app

## 3. Enrutamiento y acceso

### app.routes.ts

El router principal tiene varios grupos:

- rutas públicas: login, landing, auth, notfound
- layout principal con `AppLayout`
- módulo WIRIN con rutas protegidas por `AuthGuard`

Estructura relevante:

- `/login`
- `/wirin/tasks`
- `/wirin/task-detail/:id`
- `/wirin/ocr-viewer/:id`
- `/wirin/users`
- `/wirin/proyects`
- `/wirin/dashboard`
- `/wirin/messages`
- `/wirin/volunteer-ranking`
- `/wirin/general-stats`

## 4. Seguridad y autenticación

### AuthGuard

La ruta protegida exige sesión activa. Si no hay token, redirige al login. Si se intenta ir al login con usuario autenticado, redirige a una vista interna.

### AuthService

Este servicio:

- guarda el token JWT en localStorage
- decodifica el token para extraer roles
- expone información del usuario actual
- aporta headers con Authorization para las llamadas HTTP
- controla logout y renovación del estado de sesión

## 5. Servicios clave y su rol

### OrderService

Se encarga de:

- listar tareas y órdenes
- obtener una tarea por ID
- descargar un archivo
- recuperar un archivo para mostrarlo en la vista OCR
- obtener órdenes por estado o entregadas

### OrderManagmentService

Es el servicio de control de estados y asignación.

- cambia estados de la tarea
- guarda voluntario/revisor asignado
- gestiona transiciones de flujo Operativo

### FileUploadService

Responsable de:

- subir documentos
- invocar OCR
- reutilizar respuesta del backend para la revisión escrita

### UserService

Maneja usuarios, roles, usuarios por rol y resolución de nombres de usuarios por ID.

### OrderDeliveryService

Controla entregas y la relación entre proyectos y tareas entregadas.

### StudentDeliveryService

Maneja asignación de estudiantes a entregas.

### BaseService / AutoRefreshService

Este patrón permite que ciertos servicios emitan datos inmediatamente y luego se actualicen cada 60 segundos. Es una capa transversal importante para UI con live data.

## 6. Patrón de auto-refresh

El proyecto usa un patrón regular de `createAutoRefreshObservable`:

- se ejecuta inmediatamente
- luego emite cada 60 segundos
- sirve para dashboards, listas de tareas y estados de orden

Esto ayuda a no necesitar polling manual en cada componente.

## 7. Tipado y modelos

Los tipos importantes están en `src/app/types`:

- User
- Order
- OrderStatus
- OrderDelivery
- Annotation
- ProcessParagraph
- OcrResponse / OcrPage

Esto ayuda a mantener contratos claros entre backend y frontend.

## 8. Estructura del módulo WIRIN

El dominio principal está bajo `src/app/pages/wirin` con vistas como:

- dashboard
- tasks
- task-detail
- ocr-viewer
- users-list
- profile
- proyects
- volunteer-ranking
- volunteer-stats
- general-stats
- message

Dicho módulo concentra la parte de negocio más fuerte del sistema.

## 9. Vista OCR como caso especial

La vista OCR es uno de los puntos más importantes:

- se dispara desde una tarea
- recupera el documento PDF desde el backend
- obtiene los datos OCR
- muestra texto procesado
- permite edición manual o corrección
- habilita la revisión por estado o aprobación

La parte visual incluye:

- editor de texto con TinyMCE
- vista previa del PDF
- navegación de páginas OCR
- descarga del archivo original

## 10. Layout y composición visual

La app usa un layout base compartido con:

- topbar
- sidebar
- menu lateral
- footer
- configuración visual

Esto permite que cada pantalla use la misma estructura sin repetir HTML base.

## 11. Relación entre componentes y servicios

El patrón general es:

- componente de página solicita datos al servicio
- servicio realiza HTTP al backend
- la respuesta se modela con interfaces
- la vista renderiza la respuesta y maneja eventos del usuario

La lógica más compleja no debe vivir en el template ni en la clase de render. Debe moverse a servicio o a un helper reutilizable.

## 12. Observaciones de arquitectura

La estructura actual es clara y escalable, pero presenta algunas características típicas de apps en evolución:

- no hay feature modules completos, sino carpetas funcionales
- la lógica del negocio está dispersa por varios servicios y componentes
- algunos componentes manejan varias responsabilidades al mismo tiempo
- hay un patrón de UI más “panel administrativo” que de app de consumo pura

Esto es válido para un proyecto real en crecimiento, pero requiere disciplina para no duplicar lógica entre pantallas.

## 13. Recomendaciones para mantener la arquitectura

- seguir usando un servicio por dominio, no un servicio único gigante
- mantener la autenticación y roles en AuthService / UserRoleService
- centralizar filtros de estado en servicios o utils
- usar modelos y tipos para cada payload del backend
- ir consolidando vistas complejas en submódulos o módulos funcionales si la app crece

## 14. Conclusión

La arquitectura actual corresponde a una SPA Angular con UI de gestión, acceso protegido por JWT, flujo de tareas y revisión OCR. Es una estructura razonable para un sistema de administración documental y de validación, aunque aún mantiene algunas responsabilidades mezcladas en componentes.
