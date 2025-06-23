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

### ⚠️ **IMPORTANTE: Para Oracle 9g y versiones antiguas**

Si está usando Oracle 9g o versiones anteriores, debe realizar estos pasos adicionales:

1. **Configurar modo compatibilidad**:
```bash
ORACLE_OLD_CRYPTO=true
```

2. **Descargar Oracle Instant Client 19.26** (obligatorio para Oracle 9g):
   - **Windows**: [instantclient-basic-windows.x64-19.26.0.0.0dbru.zip](https://download.oracle.com/otn_software/nt/instantclient/1926000/instantclient-basic-windows.x64-19.26.0.0.0dbru.zip)
   - Extraer a una carpeta (ej: `C:\oracle\instantclient_19_26`)
   - Configurar la ruta:
```bash
ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient_19_26
```

3. **Configuración MCP para Oracle 9g**:
```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "npx",
      "args": ["@grec0/mcp-oracle-db"],
      "env": {
        "ORACLE_HOST": "tu-host-oracle",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "tu-servicio",
        "ORACLE_USERNAME": "usuario",
        "ORACLE_PASSWORD": "contraseña",
        "ORACLE_OLD_CRYPTO": "true",
        "ORACLE_CLIENT_LIB_DIR": "C:\\oracle\\instantclient_19_26"
      }
    }
  }
}
```

### Instalación General MCP EN  LOCAL (NO RECOMENDADO)

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
```bash
cp config.example.env .env
# Editar .env con la configuración de su base de datos
```

3. **Compilar**:
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
| `ORACLE_OLD_CRYPTO` | **OBLIGATORIO para Oracle 9g** - Usar modo Thick | `false` |
| `ORACLE_CLIENT_LIB_DIR` | **OBLIGATORIO para Oracle 9g** - Ruta a Instant Client 19.26 | - |
| `ORACLE_POOL_MIN` | Conexiones mínimas del pool | `1` |
| `ORACLE_POOL_MAX` | Conexiones máximas del pool | `10` |
| `ORACLE_POOL_TIMEOUT` | Timeout del pool en segundos | `60` |
| `ORACLE_FETCH_SIZE` | Filas a traer por lote | `100` |
| `ORACLE_STMT_CACHE_SIZE` | Tamaño cache de statements | `30` |

### Configuración MCP en Aplicaciones USANDO NPX (RECOMENDADO)

#### Ubicación del archivo de configuración

**Claude Desktop:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

#### Para Claude Desktop (config.json)

**Configuración para Oracle 9g (con Instant Client 19.26):**
```json
{
  "mcpServers": {
    "oracle-db": {
      "command": "npx",
      "args": ["@grec0/mcp-oracle-db"],
      "env": {
        "ORACLE_HOST": "tu-host-oracle",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "tu-servicio",
        "ORACLE_USERNAME": "usuario",
        "ORACLE_PASSWORD": "contraseña",
        "ORACLE_OLD_CRYPTO": "true",
        "ORACLE_CLIENT_LIB_DIR": "C:\\oracle\\instantclient_19_26"
      }
    }
  }
}
```

**Configuración para Oracle 12c o superior:**
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
        "ORACLE_PASSWORD": "password"
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

# Para versiones antiguas de Oracle (pre-11g)
ORACLE_OLD_CRYPTO=true
ORACLE_CLIENT_LIB_DIR=/path/to/instantclient
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

### ⚠️ Error Oracle 9g: Password Verifier Not Supported
Si obtiene el error "password verifier type 0x939 is not supported by node-oracledb in Thin mode" con **Oracle 9g**:

**Solución OBLIGATORIA para Oracle 9g:**

### 📦 Paso 1: Descargar Oracle Instant Client 19.26
```bash
# Descargar desde:
# https://download.oracle.com/otn_software/nt/instantclient/1926000/instantclient-basic-windows.x64-19.26.0.0.0dbru.zip

# Extraer a:
C:\oracle\instantclient_19_26
```

### ⚙️ Paso 2: Configurar variables obligatorias
```bash
ORACLE_OLD_CRYPTO=true
ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient_19_26
```

### 🚀 Para versiones Oracle 10g-11g: Probar sin Instant Client primero
```bash
ORACLE_OLD_CRYPTO=true
```

### 📦 Si falla con 10g-11g, instalar Oracle Instant Client
1. **Descargar Oracle Instant Client:**
   - Windows: [Oracle Instant Client para Windows](https://www.oracle.com/database/technologies/instant-client/winx64-downloads.html)
   - Linux: [Oracle Instant Client para Linux](https://www.oracle.com/database/technologies/instant-client/linux-x86-64-downloads.html)
   - macOS: [Oracle Instant Client para macOS](https://www.oracle.com/database/technologies/instant-client/macos-intel-x86-downloads.html)

2. **Configurar la ruta:**
```bash
ORACLE_CLIENT_LIB_DIR=/path/to/instantclient
```

### 📋 Ejemplos de configuración:

**Configuración básica (probar primero):**
```bash
ORACLE_HOST=your-oracle-host
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=your-service
ORACLE_USERNAME=username
ORACLE_PASSWORD=password
ORACLE_OLD_CRYPTO=true
```

**Configuración con Instant Client (si es necesario):**
```bash
ORACLE_HOST=your-oracle-host
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=your-service
ORACLE_USERNAME=username
ORACLE_PASSWORD=password
ORACLE_OLD_CRYPTO=true
ORACLE_CLIENT_LIB_DIR=/opt/oracle/instantclient_19_8
```

### ❓ ¿Qué es Oracle Instant Client?

Oracle Instant Client son librerías nativas que permiten conexiones **Thick** (más compatibles con Oracle antiguo).

**¿Cuándo es necesario?**
- ✅ **NO necesario**: Si tu Oracle es 12c o superior
- ⚠️ **Puede ser necesario**: Para Oracle 10g/11g con crypto antiguo
- ❌ **Obligatorio**: Para funciones avanzadas (LDAP, conexiones wallet, etc.)

**¿Cómo saber si lo necesito?**
1. Prueba primero con `ORACLE_OLD_CRYPTO=true` solamente
2. Si obtienes errores, entonces instala Oracle Instant Client

### 📦 Instalación de Oracle Instant Client (Solo si es necesario)

**Windows:**
1. Descargar "Basic Package" desde [Oracle Downloads](https://www.oracle.com/database/technologies/instant-client/winx64-downloads.html)
2. Extraer a `C:\oracle\instantclient_XX_Y`
3. Configurar: `ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient_XX_Y`

**Linux:**
```bash
# Ubuntu/Debian
wget https://download.oracle.com/otn_software/linux/instantclient/XXX/instantclient-basic-linux.x64-XX.Y.Z.zip
unzip instantclient-basic-linux.x64-XX.Y.Z.zip
export ORACLE_CLIENT_LIB_DIR=/opt/oracle/instantclient_XX_Y
```

**macOS:**
```bash
# Descargar desde Oracle y extraer
export ORACLE_CLIENT_LIB_DIR=/opt/oracle/instantclient_XX_Y
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