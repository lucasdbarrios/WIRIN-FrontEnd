# Contexto general de la aplicación

## 1. Descripción del proyecto

Esta aplicación es una interfaz web construida con Angular 19 y PrimeNG. Su finalidad principal es gestionar procesos y flujo de trabajo del proyecto WIRIN, con vistas orientadas a tareas, usuarios, proyectos, mensajes, estadísticas y entregas.

La estructura del proyecto y la navegación indican que la app está enfocada en un panel administrativo o de gestión, con autenticación y rutas protegidas por guardas.

## 2. Stack técnico principal

- Angular 19
- TypeScript
- PrimeNG + PrimeIcons
- Tailwind CSS
- RxJS
- Angular Router
- Angular HttpClient
- TinyMCE (usado en algunos formularios o editor de texto)
- Chart.js para visualización de métricas

## 3. Estructura principal

- src/app.routes.ts: configuración global de rutas y protección por autenticación.
- src/app.config.ts: configuración de Angular, router, HTTP, animaciones y tema visual.
- src/app/: módulos funcionales principales.
- src/app/services/: servicios API, cache, autenticación, mensajes, uploads, etc.
- src/app/types/: interfaces y tipos reutilizables.
- src/environments/: configuración por entorno.

## 4. Modelo de navegación

La app tiene dos niveles principales:

- Rutas públicas: login, landing, auth, notfound.
- Rutas protegidas: layout principal con AuthGuard.

Las rutas del módulo WIRIN están agrupadas bajo /wirin y contienen páginas como:

- tareas
- usuarios
- proyectos
- perfil
- dashboard
- mensajes
- ranking de voluntarios
- estadísticas
- visor OCR

Esto sugiere una lógica de negocio de gestión documental y operativa con una interfaz de trabajo multi-rol.

## 5. Patrones de diseño observados

- Uso de rutas con `canActivate: [AuthGuard]` para validar sesión.
- Separación en `services`, `types`, `guards`, `pages` y `layout`.
- Estructura modular por dominio funcional.
- Uso de componentes reutilizables y layout compartido para toda la app.
- Dependencia de servicios para interacción con backend y almacenamiento local / caché de usuario.

## 6. Flujo general del usuario

1. El usuario accede a la pantalla de login.
2. Si la autenticación es válida, se permite entrar a la vista principal.
3. El sistema carga el layout base y navega a distintas secciones según el rol o acceso del usuario.
4. Los servicios manejan datos provenientes del backend y la UI consume esos datos para mostrar dashboards, listas y formularios.
5. La aplicación mantiene información del usuario y del estado de la sesión en servicios centralizados.

## 7. Consideraciones para futuras modificaciones

- Mantener la lógica de autenticación en guardas y servicios dedicados.
- Preferir añadir nuevos módulos dentro de `src/app/pages/...` según funcionalidad.
- Reusar tipos e interfaces de `src/app/types` para evitar duplicación.
- Mantener la separación entre UI, servicios API y utilidades.
- Cuando se agreguen nuevas rutas, revisar tanto `src/app.routes.ts` como la estructura del layout para mantener el patrón actual.

## 8. Comandos útiles

- Iniciar app: `npm start`
- Build de desarrollo: `npm run build`
- Build producción: `npm run build:prod`
- Lint: `npm run lint`
- Tests: `npm test`

## 9. Observaciones generales

La app parece estar orientada a una solución de administración y supervisión operativa, con trabajo específico alrededor de documentos, entregas y colaboración de voluntarios. El valor de esta guía es servir como mapa inicial para futuras entregas, refactors y nuevas funcionalidades.
