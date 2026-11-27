# Proposal

## Why

El servidor usa el SDK MCP 1.6.1 y Node 18. La migración al SDK 2.x y Node 20 actualiza la base del servidor sin alterar el contrato de sus herramientas Oracle.

## What Changes

- Migrar el servidor stdio al SDK MCP 2.x y Zod 4.2 o posterior, conservando las siete herramientas y su comportamiento observable.
- **BREAKING**: exigir Node.js 20 como mínimo y publicar la versión 0.2.0.
- Añadir una prueba de humo MCP que verifique el listado y las descripciones sin conexión Oracle.
- Mantener los avisos de arranque y el cierre del pool; no cambiar `oracledb`, Jenkins ni el flujo de publicación, ni añadir HTTP o MCP Events.

## Capabilities

### New Capabilities

- `oracle-mcp-stdio`: contrato del servidor MCP stdio, sus herramientas y su ciclo de vida.

### Modified Capabilities

Ninguna; no existen especificaciones principales registradas.

## Impact

Afecta a `index.ts`, configuración TypeScript y Jest según sea necesario, dependencias y lockfile npm, versión, README y pruebas. Las pruebas con una base Oracle real quedan fuera del entorno local si no hay una disponible.
