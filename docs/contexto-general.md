# Contexto general de la aplicación

## 1. Propósito del sistema

WIRIN es una aplicación web para gestionar tareas, entregas y validaciones relacionadas con documentos, documentos OCR y flujo de revisión académica o operativa. La parte visible en el frontend muestra una lógica orientada a:

- carga y seguimiento de tareas
- asignación de usuarios por rol
- procesamiento de archivos con OCR
- revisión de texto extraído
- validación de entregas y aprobación o rechazo de resultados
- visualización de métricas y dashboards

La app tiene un enfoque de administración interna con distintos perfiles, donde cada tipo de usuario ve y puede operar sobre distintas partes del flujo.

## 2. Stack principal

- Angular 19
- TypeScript
- RxJS
- Angular Router
- Angular HttpClient
- PrimeNG
- Tailwind CSS
- TinyMCE
- Chart.js
- JWT para autenticación

## 3. Mapa funcional del proyecto

### 3.1. Autenticación y control de acceso

- Los usuarios inician sesión con email y contraseña.
- El token JWT se guarda en localStorage.
- El servicio AuthService decodifica el token para obtener roles y datos del usuario.
- El AuthGuard protege las rutas internas y redirige al login si no hay sesión.

### 3.2. Roles de usuario

La app identifica perfiles como:

- Voluntario
- Voluntario Administrativo
- Bibliotecario
- Admin
- Alumno

Esto se observa en UserRoleService y en la lógica que filtra tareas por rol.

### 3.3. Flujos principales

- tareas pendientes
- tareas en proceso
- revisión de OCR
- aprobación / denegación
- entregas por proyecto o grupo
- dashboard con métricas
- gestión de usuarios
- mensajes / notificaciones

## 4. Estructura de carpetas relevante

- src/app/routes: rutas globales y modularizadas.
- src/app/pages/wirin: páginas del negocio principal.
- src/app/layout: estructura visual común (sidebar, topbar, menú, layout base).
- src/app/services: lógica de backend, auth, cache, auto-refresh, entidades, archivos y utilidades.
- src/app/types: modelos y enums para tareas, usuarios, entregas, OCR, mensajes y roles.
- src/environments: configuración de la API según entorno.

## 5. Flujo general de uso

1. El usuario entra a login.
2. Se valida el token y se cargan los roles.
3. La app decide qué pantallas puede ver según el perfil.
4. El usuario se mueve dentro del dashboard y la gestión de tareas.
5. Cuando se carga una tarea, el sistema obtiene datos del backend, estados y archivos relacionados.
6. En la vista OCR, se recupera el PDF, se extrae el texto OCR y el usuario puede revisarlo, corregirlo o aprobarlo.
7. El estado de la tarea se actualiza según la validación del contenido.

## 6. Patrones del proyecto

- separación por dominios funcionales
- servicios por entidad o proceso
- auto-refresh con BaseService y AutoRefreshService
- rutas protegidas por `canActivate`
- uso de interfaces y enums para tipos de negocio
- estado de UI centralizado en la vista o manejado por signals/propiedades del componente

## 7. Observaciones internas relevantes

- La lista de tareas cambia según el rol del usuario.
- El servicio OrderService y OrderManagmentService son fundamentales para flujo de órdenes y estados.
- El servicio FileUploadService gestiona el OCR.
- Los componentes dentro de `src/app/pages/wirin` muestran un dominio muy concreto de negocio, no solo una UI genérica.
- La estructura no es un patrón puro de feature modules, pero sí es consistente con un diseño por dominio funcional.

## 8. Consideraciones para futuras modificaciones

- Mantener la autenticación y permisos centralizados en AuthService y UserRoleService.
- No mezclar lógica de negocio en componentes visuales.
- Añadir nuevas pantallas dentro del dominio `wirin` o bajo un submódulo más específico.
- Preferir reutilizar servicios y tipos ya existentes antes de crear nuevas entidades duplicadas.
- Si se cambia el estado de tareas o se agregan roles, revisar los filtros en TasksComponent y el guardado de estados en OrderManagmentService.

## 9. Comandos útiles

- `npm install`
- `npm start`
- `npm run build`
- `npm run build:prod`
- `npm run lint`

## 10. Conclusión

La app es un sistema de gestión documental y operativa con un flujo de tareas, revisiones OCR y validación por roles. La estructura principal está bien organizada para crecer, pero conviene mantener la lógica de negocio en servicios y no dispersarla en componentes.
