# MCP Oracle Database Server

Servidor MCP (Model Context Protocol) para integración completa con Oracle Database. Permite ejecutar consultas SQL, comandos DDL/DML, gestionar transacciones y explorar la estructura de la base de datos directamente desde aplicaciones MCP.

## 🚀 Características

- **Consultas SQL**: Ejecuta SELECT con formateo inteligente de resultados
- **Comandos DML/DDL**: INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, etc.
- **Gestión de Transacciones**: Soporte para transacciones manuales y automáticas
- **Exploración de BD**: Lista tablas, describe estructuras, explora esquemas
- **Pool de Conexiones**: Gestión eficiente de conexiones con Oracle
- **Compatibilidad**: Soporte para versiones antiguas de Oracle (pre-12c)
- **Monitoreo**: Health checks y estadísticas de conexión

## 📋 Herramientas Disponibles

### `oracle_health_check`
Verifica el estado de salud de la conexión Oracle DB.

### `oracle_query`
Ejecuta consultas SQL SELECT con formato de tabla o JSON.
- **Parámetros**: `sql`, `maxRows`, `formatAsTable`, `showMetadata`

### `oracle_execute` 
Ejecuta comandos SQL (INSERT, UPDATE, DELETE, CREATE, etc.).
- **Parámetros**: `sql`, `autoCommit`, `showDetails`

### `oracle_list_tables`
Lista todas las tablas del esquema especificado.
- **Parámetros**: `owner`, `showDetails`

### `oracle_describe_table`
Muestra la estructura completa de una tabla.
- **Parámetros**: `tableName`, `owner`, `showDetails`

### `oracle_transaction`
Ejecuta múltiples comandos SQL en una transacción.
- **Parámetros**: `commands`, `rollbackOnError`

### `oracle_info`
Muestra información de configuración de la conexión.

## 🛠️ Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Instalar Oracle Instant Client** (si no está instalado):
   - Descargar desde [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client.html)
   - Configurar variable `ORACLE_CLIENT_LIB_DIR` si es necesario

3. **Configurar variables de entorno**:
```bash
cp config.example.env .env
# Editar .env con la configuración de su base de datos
```

4. **Compilar**:
```bash
npm run build
```

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Por Defecto |
|----------|-------------|-------------|
| `ORACLE_HOST` | Host del servidor Oracle | `localhost` |
| `ORACLE_PORT` | Puerto de Oracle | `1521` |
| `ORACLE_SERVICE_NAME` | Nombre del servicio Oracle | `XE` |
| `ORACLE_USERNAME` | Usuario de base de datos | `hr` |
| `ORACLE_PASSWORD` | Contraseña de base de datos | `hr` |
| `ORACLE_CONNECTION_STRING` | Connection string completo (alternativo) | - |
| `ORACLE_OLD_CRYPTO` | Usar criptografía antigua (pre-12c) | `false` |
| `ORACLE_POOL_MIN` | Conexiones mínimas del pool | `1` |
| `ORACLE_POOL_MAX` | Conexiones máximas del pool | `10` |
| `ORACLE_POOL_TIMEOUT` | Timeout del pool en segundos | `60` |
| `ORACLE_FETCH_SIZE` | Filas a traer por lote | `100` |
| `ORACLE_STMT_CACHE_SIZE` | Tamaño cache de statements | `30` |
| `ORACLE_CLIENT_LIB_DIR` | Directorio librerías Oracle Client | - |

### Configuración MCP en Aplicaciones

#### Ubicación del archivo de configuración

**Claude Desktop:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

#### Para Claude Desktop (config.json)

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "npx",
      "args": ["@grec0/mcp-oracle-db"],
      "env": {
        "ORACLE_HOST": "host",
        "ORACLE_PORT": "port",
        "ORACLE_SERVICE_NAME": "service",
        "ORACLE_USERNAME": "user",
        "ORACLE_PASSWORD": "password",
        "ORACLE_OLD_CRYPTO": "true",
        "ORACLE_FETCH_SIZE": "size"
      }
    }
  }
}
```

#### Para instalación local

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "node",
      "args": ["C:/workspaces/mcps/mcp-oracle-db/dist/index.js"],
      "env": {
        "ORACLE_HOST": "host",
        "ORACLE_PORT": "post",
        "ORACLE_SERVICE_NAME": "service",
        "ORACLE_USERNAME": "user",
        "ORACLE_PASSWORD": "pass",
        "ORACLE_OLD_CRYPTO": "true"
      }
    }
  }
}
```

#### Para entorno de desarrollo

```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "C:/workspaces/mcps/mcp-oracle-db",
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521", 
        "ORACLE_SERVICE_NAME": "XE",
        "ORACLE_USERNAME": "hr",
        "ORACLE_PASSWORD": "hr"
      }
    }
  }
}
```

### Verificar configuración MCP

Después de configurar el MCP, puedes verificar que funciona correctamente:

1. **Reiniciar la aplicación** (Claude Desktop, etc.)
2. **Usar herramienta de diagnóstico**:
   ```
   oracle_health_check()
   ```
3. **Probar consulta básica**:
   ```
   oracle_query("SELECT 1 FROM DUAL")
   ```

### Variables de Entorno Principales

```bash
# Configuración básica
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=hr
ORACLE_PASSWORD=hr

# O usar connection string completo
ORACLE_CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=XE)))"

# Para versiones antiguas de Oracle
ORACLE_OLD_CRYPTO=true
```

### Configuración Basada en Java Existente

Basado en la configuración Java proporcionada:

```bash
ORACLE_HOST=host
ORACLE_PORT=port
ORACLE_SERVICE_NAME=service
ORACLE_USERNAME=user
ORACLE_PASSWORD=password
ORACLE_OLD_CRYPTO=true
ORACLE_FETCH_SIZE=100  # Basado en DataSourceCrmConfig.java
```

### Pool de Conexiones

```bash
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=1
ORACLE_POOL_TIMEOUT=60
ORACLE_STMT_CACHE_SIZE=30
```

## 🚀 Uso

### Iniciar el servidor
```bash
npm run start
```

### Modo desarrollo
```bash
npm run dev
```

### Con inspector MCP
```bash
npm run inspector
```

## 📚 Ejemplos de Uso

### Consulta Simple
```sql
SELECT * FROM employees WHERE department_id = 10
```

### Crear Tabla
```sql
CREATE TABLE test_table (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    created_date DATE DEFAULT SYSDATE
)
```

### Insertar Datos
```sql
INSERT INTO test_table (id, name) VALUES (1, 'Test Record')
```

### Transacción Compleja
```sql
-- Comando 1
INSERT INTO customers (id, name) VALUES (1, 'Cliente Test');
-- Comando 2  
UPDATE orders SET customer_id = 1 WHERE id = 100;
-- Comando 3
DELETE FROM temp_data WHERE processed = 'Y';
```

## 🔧 Solución de Problemas

### Error de Criptografía (Oracle Antiguo)
Si obtiene errores relacionados con criptografía:
```bash
ORACLE_OLD_CRYPTO=true
```

### Error de Cliente Oracle
```bash
# Instalar Oracle Instant Client
# Configurar path de librerías
ORACLE_CLIENT_LIB_DIR=/usr/lib/oracle/19.3/client64/lib
```

### Error de Conexión TNS
Verificar:
1. Host y puerto correctos
2. Servicio/SID configurado
3. Firewall/conectividad de red
4. Listener de Oracle ejecutándose

### Problemas de Pool
```bash
# Ajustar configuración del pool
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=5
ORACLE_POOL_TIMEOUT=30
```

## 🧪 Testing

```bash
npm test
```

## 📖 Compatibilidad

- **Oracle Database**: 11g, 12c, 18c, 19c, 21c
- **Node.js**: >=18.0.0
- **Sistemas**: Windows, Linux, macOS

## 🔐 Seguridad

- Validación de SQL para prevenir inyecciones básicas
- Gestión segura de credenciales vía variables de entorno
- Soporte para conexiones SSL/TLS de Oracle
- Separación de permisos entre consultas y comandos

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Para reportar problemas o solicitar características:
- GitHub Issues: [github.com/gcorroto/mcp-oracle-db/issues](https://github.com/gcorroto/mcp-oracle-db/issues)

## 📚 Recursos Adicionales

- [Oracle Database Documentation](https://docs.oracle.com/database/)
- [node-oracledb Documentation](https://oracle.github.io/node-oracledb/)
- [Model Context Protocol](https://modelcontextprotocol.io/) 