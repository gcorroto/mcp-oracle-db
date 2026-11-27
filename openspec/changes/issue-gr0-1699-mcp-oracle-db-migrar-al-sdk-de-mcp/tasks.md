# Tasks

## 1. Migración y dependencias

- [ ] 1.1 Ejecutar `npx @modelcontextprotocol/codemod@latest v1-to-v2 .` desde la raíz y resolver cada marca `@mcp-codemod-error`; verificar mediante búsqueda que no queda ninguna.
- [ ] 1.2 Sustituir SDK por `@modelcontextprotocol/server` `^2.4.0`, añadir `@modelcontextprotocol/client` `^2.4.0` como dependencia de desarrollo, fijar Zod `^4.2.0`, comprobar con grep si se importa `zod-to-json-schema` y retirarlo si no; actualizar lockfile e instalar dependencias con npm, verificando instalación.
- [ ] 1.3 Cambiar TypeScript a `module` y `moduleResolution` `Node16`, corregir imports relativos con `.js` y compatibilidad Jest cuando corresponda; verificar compilación.
- [ ] 1.4 Actualizar versión del paquete y `common/version.ts` a `0.2.0`, Node mínimo a `>=20` y README; comprobar la coherencia de los tres archivos y lockfile.

## 2. Servidor y contrato

- [ ] 2.1 Extraer `buildServer()` y convertir los siete registros a `registerTool` con `z.object`, manteniendo literalmente nombres, descripciones, campos y respuestas; comparar cada registro con el original y revisar `z.record`, `ZodTypeDef` y optional/default de Zod 4.
- [ ] 2.2 Arrancar con `serveStdio(() => buildServer())` sin await ni then, conservando inicialización diferida, avisos por stderr sin contraseñas y cierre del pool con SIGINT/SIGTERM; verificar arranque, avisos y limpieza.
- [ ] 2.3 Crear `tests/server-smoke.test.ts` con timeout de 30 s: compilar mediante `execFileSync(process.execPath, ['node_modules/typescript/bin/tsc'])`, arrancar `dist/index.js` con `Client` y `StdioClientTransport`, y las cinco variables falsas especificadas; verificar exactamente las siete herramientas, descripciones literales de campos de dos herramientas y ausencia observable de intentos de conexión Oracle, cerrando el cliente al terminar.
- [ ] 2.4 Verificar la paridad de parámetros, valores por defecto, descripciones y respuestas con el código previo, incluyendo casos representativos sin Oracle; mantener el test existente y su comportamiento sin base real.

## 3. Verificación integrada

- [ ] 3.1 Ejecutar `npm run build`, `npm test` y `npm run check` con dependencias instaladas; resolver errores y registrar resultados, indicando si las pruebas de Oracle real no se ejecutaron.
- [ ] 3.2 Buscar referencias al SDK anterior en código, tests, scripts y `package.json`, y marcas del codemod; verificar que no quedan, que no se modificaron Jenkins ni el flujo de publicación y resumir en la issue el codemod, ajustes manuales, Node16 y sorpresas.
