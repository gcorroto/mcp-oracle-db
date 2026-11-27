# oracle-mcp-stdio Specification

## Purpose

Permitir que clientes MCP accedan a las operaciones Oracle mediante un servidor stdio con un contrato estable y un ciclo de vida seguro.

## Requirements

### Requirement: Herramientas Oracle disponibles
El servidor SHALL exponer exactamente las siete herramientas existentes, conservando nombres, descripciones, parámetros, tipos, obligatoriedad, valores por defecto y formato de respuestas.

#### Scenario: Listado de herramientas
- **WHEN** un cliente MCP solicita `tools/list`
- **THEN** recibe exactamente `oracle_health_check`, `oracle_query`, `oracle_execute`, `oracle_list_tables`, `oracle_describe_table`, `oracle_transaction` y `oracle_info`
- **AND** las descripciones de campos conservan su texto original, incluido `Consulta SQL SELECT a ejecutar` para `oracle_query.sql` y `Nombre de la tabla a describir` para `oracle_describe_table.tableName`

#### Scenario: Invocación de una herramienta existente
- **WHEN** un cliente invoca una herramienta con argumentos válidos u omitidos que tienen valor por defecto
- **THEN** se mantienen la validación, los valores por defecto y el formato de respuesta anteriores

### Requirement: Inicialización diferida de Oracle
El servidor SHALL iniciar y listar herramientas sin abrir una conexión ni crear un pool Oracle.

#### Scenario: Arranque y listado sin base de datos
- **WHEN** se inicia por stdio con `ORACLE_HOST=127.0.0.1`, `ORACLE_PORT=9`, `ORACLE_SERVICE_NAME=TEST`, `ORACLE_USER=test` y `ORACLE_PASSWORD=test` y se solicita `tools/list`
- **THEN** el listado se completa sin conectar a Oracle

### Requirement: Diagnóstico y cierre
El servidor SHALL mantener los avisos de configuración por stderr sin mostrar contraseñas y cerrar el pool Oracle existente al recibir SIGINT o SIGTERM.

#### Scenario: Variables necesarias ausentes
- **WHEN** falta configuración requerida al arrancar
- **THEN** se conservan los avisos de arranque por stderr sin revelar la contraseña

#### Scenario: Señal de terminación
- **WHEN** el proceso recibe SIGINT o SIGTERM tras crear un pool
- **THEN** cierra el pool antes de salir

### Requirement: Versión de ejecución
El paquete SHALL requerir Node.js 20 o posterior y documentar ese mínimo en el README.

#### Scenario: Consulta de requisitos
- **WHEN** se revisan los metadatos del paquete y el README
- **THEN** ambos indican Node.js 20 como versión mínima
