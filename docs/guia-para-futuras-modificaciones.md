# Guía para futuras modificaciones

## 1. Principio general

Antes de tocar una funcionalidad, conviene saber en qué capa vive:

- componente visual
- servicio de negocio
- servicio HTTP
- tipo / modelo
- guard o autorización
- enrutamiento

Esto reduce errores de mantenimiento y evita duplicar lógica.

## 2. Estructura recomendada para cambios

### UI / pantalla

Ubicación sugerida:

- src/app/pages/
- src/app/pages/wirin/

### Lógica del dominio

Ubicación sugerida:

- src/app/services/
- src/app/utils/

### Modelos y contratos

Ubicación sugerida:

- src/app/types/

### Seguridad

Ubicación sugerida:

- src/app/guards/
- src/app/services/auth/

## 3. Flujo recomendado para una nueva Feature

1. Confirmar el flujo de negocio.
2. Definir los roles involucrados.
3. Revisar si ya existe un servicio similar.
4. Identificar la entidad y su modelo.
5. Crear o reutilizar el tipo.
6. Implementar o extender el servicio.
7. Crear la vista/componente bajo la ruta correcta.
8. Añadir o ajustar la ruta en `src/app.routes.ts`.
9. Validar el comportamiento con auth, permisos y estado de la tarea.
10. Probar el flujo de happy path y error path.

## 4. Reglas de mantenimiento

### Mantener separación de responsabilidades

- Los componentes no deben cargar datos directamente sin un servicio.
- Los servicios no deben depender de la vista para resolver estados.
- Los modelos deben mantenerse centralizados en `src/app/types`.

### Reutilizar antes de duplicar

Si ya existe un patrón para:

- carga de tareas
- estados de orden
- roles
- PDF / OCR
- mensajes toast

es mejor reutilizar ese servicio o utilitario.

### Controlar roles

Muy importante en este proyecto:

- la visibilidad del contenido depende del role
- algunos filtros de tareas los decide UserRoleService
- algunos estados permiten o restringen acciones según el rol

## 5. Checklist antes de merge o PR

- ¿La ruta quedó en `src/app.routes.ts`?
- ¿La carga de datos usa un servicio?
- ¿Hay un tipo para la respuesta del backend?
- ¿Se respetan los roles y permisos?
- ¿La tarea tiene estado válido para la acción realizada?
- ¿Se manejan errores HTTP y toasts?
- ¿Se validó el flujo con el backend real o con mocks de datos?
- ¿Se revisó el comportamiento del PDF/OCR si toco ese dominio?

## 6. Puntos de atención en este proyecto

### 6.1. Autenticación

Si cambias login, JWT, roles o headers, revisar:

- AuthService
- AuthGuard
- UserRoleService
- env configuration

### 6.2. Estados de tareas

Si modificás estado, fíjate en:

- OrderStatus enum
- OrderManagmentService
- TasksComponent
- TaskDetailComponent
- DashboardComponent

### 6.3. OCR / PDF

Si modificás el flujo OCR o el render del PDF, validar:

- FileUploadService
- OrderService
- OcrViewerComponent
- OcrTextViewerComponent
- response del backend
- headers y tipos de blob

### 6.4. Entregas / proyectos

Si tocas las entregas, revisar:

- OrderDeliveryService
- StudentDeliveryService
- ProyectsComponent
- DashboardComponent

## 7. Recomendaciones para documentación

Cuando agregues una feature nueva, conviene seguir este patrón:

- resumen del problema o objetivo
- rutas y pantallas involucradas
- servicios usados
- roles que intervienen
- estados o condiciones relevantes
- riesgos conocidos

## 8. Estructura sugerida para futuras notas

- context-general.md
- arquitectura.md
- guia-para-futuras-modificaciones.md
- flujo-de-negocio.md
- modulos-wirin.md
- feature/<nombre-feature>.md

## 9. Conclusión

Este proyecto tiene una lógica bastante clara de negocio y un dominio de tareas + revisión documental. La mejor estrategia para evolucionarlo es seguir la separación actual por servicios, roles y tipos, y documentar los cambios a medida que se agregan ventanas de negocio o flujos de validación.
