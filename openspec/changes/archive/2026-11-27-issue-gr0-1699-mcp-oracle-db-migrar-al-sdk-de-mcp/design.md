# Design

## Context

`index.ts` registra siete herramientas con SDK 1.x; el servicio Oracle y su pool se crean de forma diferida. El proyecto ESM usa resolución clásica de TypeScript, que no resuelve los exports del SDK 2.x. `common/version.ts` contiene actualmente 0.1.0 mientras el paquete indica 0.1.5. Véase la propuesta y la especificación para el alcance y contrato.

## Goals / Non-Goals

**Goals:** Migrar el ciclo de vida y los esquemas MCP manteniendo el contrato y la inicialización diferida; verificar el protocolo real sin Oracle.

**Non-Goals:** Cambiar el controlador Oracle, la lógica de negocio, los transportes, Jenkins o el proceso de publicación.

## Decisions

- Ejecutar el codemod oficial primero y resolver sus marcas manualmente. Revisar el diff de cada herramienta contra el original: la conversión automática no garantiza paridad de Zod ni de respuestas.
- Usar `module` y `moduleResolution` `Node16` y extensiones `.js` en imports relativos donde sean necesarias; la resolución clásica no entiende los exports. Ajustar Jest solo si es necesario para los tests ESM.
- Extraer `buildServer()` con todos los registros `registerTool` y esquemas `z.object`; iniciar con `serveStdio(() => buildServer())` desde `@modelcontextprotocol/server/stdio`, sin `await` ni `.then()`, porque devuelve un manejador. Preservar logs seguros, señales y servicio diferido. El transporte y conexión manual anteriores se sustituyen por el ciclo de vida del SDK.
- Usar servidor y cliente MCP `^2.4.0`, Zod `^4.2.0`, Node >=20 y versión 0.2.0 tanto en paquete como fichero de versión. Eliminar `zod-to-json-schema` solo tras comprobar que no se importa; actualizar el lockfile. Revisar `z.record`, tipos eliminados y combinaciones optional/default conservando semántica y descripciones.
- El test de humo compila invocando TypeScript con `process.execPath`, inicia el proceso real mediante el cliente stdio y lista herramientas con puerto Oracle inalcanzable. Comprobar nombres exactos y descripciones de dos herramientas; cerrar el cliente y proceso incluso ante errores. Un puerto inalcanzable por sí solo no demuestra ausencia de intento de conexión: complementar con una comprobación observable de que no se intenta conectar durante arranque y listado.

## Risks / Trade-offs

- [Cambios sutiles en valores por defecto o esquemas JSON de Zod 4] → comparar contratos y comprobar descripciones y valores por defecto.
- [La versión mínima de Node rompe instalaciones antiguas] → indicar Node 20 en README y metadatos; rollback a la versión previa si fuera necesario.
- [Sin instancia Oracle no se comprueban operaciones reales] → mantener tests existentes y declarar la limitación en el resumen.
- [Avisos o limpieza perdidos en el nuevo arranque] → conservarlos explícitamente y comprobar stderr y señales sin exponer secretos.

## Migration Plan

Aplicar codemod, completar ajustes y pruebas, instalar dependencias y ejecutar las comprobaciones. La publicación sigue el flujo existente; revertir el cambio o volver a la versión anterior permite restaurar el comportamiento previo si falla el despliegue.
