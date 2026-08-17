# Guía para futuras modificaciones

## 1. Cómo trabajar con esta base

Cuando vayas a modificar la app, conviene mantener la misma estructura que ya usa el proyecto:

- pantallas en `src/app/pages`
- servicios en `src/app/services`
- tipos en `src/app/types`
- utilidades en `src/app/utils`
- rutas en `src/app.routes.ts`

## 2. Reglas recomendadas

### Mantener separación de responsabilidades

- Los componentes deben enfocarse en la vista.
- Los servicios deben manejar llamadas HTTP, caché, estado y lógica compartida.
- Las interfaces deben vivir en `src/app/types`.

### Evitar lógica duplicada

Si una misma lógica aparece en varios componentes, es mejor extraerla a un servicio o utilidad.

### Tener en cuenta la autenticación

Toda nueva ruta que requiera seguridad debe ir acompañada de `canActivate: [AuthGuard]` o de la validación equivalente que siga el patrón del proyecto.

## 3. Flujo recomendado para nuevas funcionalidades

1. Definir el modelo de datos y añadir interfaces si hace falta.
2. Crear o reutilizar el servicio asociado.
3. Crear el componente o vista dentro de `src/app/pages/...`.
4. Añadir la ruta al router principal si corresponde.
5. Validar que la navegación y la autenticación sigan funcionando.
6. Probar el comportamiento básico y revisar errores de Angular/TypeScript.

## 4. Patrones de nombres

- Componentes: `*.component.ts` o `*.ts` según el proyecto.
- Servicios: `*.service.ts`
- Guards: `*.guard.ts`
- Interfaces: `*.interface.ts` o `*.type.ts`

Mantener estos nombres ayuda a que el proyecto siga siendo claro para futuras personas que trabajen en él.

## 5. Checklist antes de hacer un cambio relevante

- ¿La ruta está en `src/app.routes.ts`?
- ¿La pantalla pertenece al módulo correcto?
- ¿Se reutiliza un servicio existente?
- ¿Hay un tipo para el modelo?
- ¿La lógica quedó fuera del componente?
- ¿Se preservó la estructura del layout?
- ¿La funcionalidad sigue protegiéndose con autenticación cuando aplica?

## 6. Sugerencia de documentación

Cuando se agregue una nueva funcionalidad, conviene actualizar esta carpeta `docs/` con una nota breve sobre:

- objetivo de la funcionalidad
- pantallas involucradas
- servicios y endpoints usados
- reglas de negocio relevantes
- puntos de extensión futuros

## 7. Estructura recomendada para futuras notas

- `contexto-general.md`
- `arquitectura.md`
- `guia-para-futuras-modificaciones.md`
- `feature/<nombre-feature>.md` cuando se agreguen funcionalidades específicas

Esto ayuda a que el proyecto evolucione con memoria técnica sin depender solo de comentarios en código.
