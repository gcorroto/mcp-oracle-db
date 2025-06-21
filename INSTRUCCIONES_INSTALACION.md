# Instrucciones de Instalación - MCP Oracle Database

## 📋 Prerrequisitos

### 1. Node.js y npm
```bash
# Verificar que Node.js >= 18.0.0 esté instalado
node --version
npm --version
```

### 2. Oracle Instant Client
- **Descargar**: [Oracle Instant Client Downloads](https://www.oracle.com/database/technologies/instant-client/downloads.html)
- **Versión recomendada**: 19c o superior
- **Componentes necesarios**: Basic Package + SQL*Plus Package (opcional)

#### Windows:
1. Descargar `instantclient-basic-windows.x64-19.X.X.X.X.zip`
2. Extraer en `C:\oracle\instantclient_19_X`
3. Añadir al PATH: `C:\oracle\instantclient_19_X`

#### Linux:
```bash
# Ubuntu/Debian
sudo apt-get install libaio1
# CentOS/RHEL
sudo yum install libaio

# Descargar y extraer
wget https://download.oracle.com/otn_software/linux/instantclient/19XX/instantclient-basic-linux.x64-19.X.X.X.X.zip
sudo unzip instantclient-basic-linux.x64-19.X.X.X.X.zip -d /opt/oracle
```

#### macOS:
```bash
# Con Homebrew
brew install --cask oracle-jdk
# O descargar manualmente desde Oracle
```

## 🛠️ Instalación

### 1. Clonar/Obtener el código
```bash
# Si está en Git
git clone [repository-url]
cd mcp-oracle-db

# O simplemente navegar al directorio del proyecto
cd mcp-oracle-db
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de configuración de ejemplo
cp config.example.env .env

# Editar .env con la configuración de su base de datos
```

### 4. Configuración para su entorno AYG (basado en application-local.properties)

Editar `.env` con estos valores:

```bash
# === CONFIGURACIÓN PARA AYGDES ===
ORACLE_HOST=host
ORACLE_PORT=port
ORACLE_SERVICE_NAME=service
ORACLE_USERNAME=user
ORACLE_PASSWORD=pass

# === IMPORTANTE: Para Oracle pre-12c ===
ORACLE_OLD_CRYPTO=true

# === CONFIGURACIÓN DE POOL ===
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=5
ORACLE_POOL_INCREMENT=1
ORACLE_POOL_TIMEOUT=60

# === CONFIGURACIÓN DE RENDIMIENTO ===
ORACLE_FETCH_SIZE=100
ORACLE_STMT_CACHE_SIZE=30
```

### 5. Compilar el proyecto
```bash
npm run build
```

### 6. Verificar instalación
```bash
# Ejecutar tests básicos
npm test

# O verificar configuración manualmente
node dist/index.js
```

## 🚀 Ejecución

### Método 1: Scripts de conveniencia
```bash
# Windows
./run-mcp.bat

# Linux/macOS
./run-mcp.sh
```

### Método 2: npm scripts
```bash
# Desarrollo (rebuild automático)
npm run dev

# Producción
npm run start

# Con inspector MCP
npm run inspector
```

### Método 3: Directo
```bash
# Asegurarse de que esté compilado
npm run build

# Ejecutar
node dist/index.js
```

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module 'oracledb'"
```bash
# Reinstalar oracledb
npm uninstall oracledb
npm install oracledb
```

### Error: "DPI-1047: Cannot locate an Oracle Client library"
**Windows:**
```cmd
# Verificar PATH
echo %PATH%
# Debe incluir C:\oracle\instantclient_XX_X

# Verificar que existan los archivos
dir C:\oracle\instantclient_XX_X\*.dll
```

**Linux:**
```bash
# Configurar LD_LIBRARY_PATH
export LD_LIBRARY_PATH=/opt/oracle/instantclient_XX_X:$LD_LIBRARY_PATH

# O crear /etc/ld.so.conf.d/oracle-instantclient.conf
echo "/opt/oracle/instantclient_XX_X" | sudo tee /etc/ld.so.conf.d/oracle-instantclient.conf
sudo ldconfig
```

### Error: "ORA-01017: invalid username/password"
- Verificar credenciales en `.env`

### Error: "ORA-12154: TNS:could not resolve..."
- Verificar host y puerto
- Verificar conectividad de red:
```bash
telnet srvaygdes01.clouddesprivada.vcndes.oraclevcn.com 1521
```

### Error: Problemas de criptografía
```bash
# En .env
ORACLE_OLD_CRYPTO=true

# Si persiste, configurar variables adicionales:
ORACLE_CLIENT_LIB_DIR=/path/to/instantclient
```

### Error: "Pool is closed"
```bash
# Reiniciar el servidor MCP
# Verificar configuración del pool en .env
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=3
ORACLE_POOL_TIMEOUT=30
```

## 📚 Configuración Avanzada

### Connection String personalizado
```bash
# En lugar de host/port/service individual
ORACLE_CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=srvaygdes01.clouddesprivada.vcndes.oraclevcn.com)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=AYGDES)))"
```

### SSL/TLS
```bash
# Para conexiones seguras
ORACLE_CONNECTION_STRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=tcps)(HOST=hostname)(PORT=2484))(CONNECT_DATA=(SERVICE_NAME=service)))"
```

### Múltiples esquemas
```bash
# Crear múltiples archivos .env
cp .env .env.desarrollo
cp .env .env.produccion

# Usar según necesidad
export NODE_ENV=desarrollo
```

## 🧪 Verificación

### 1. Test de conexión básica
```bash
npm test
```

### 2. Test manual con MCP Inspector
```bash
npm run inspector
```

### 3. Test con herramientas MCP
- Usar `oracle_health_check` para verificar conexión
- Usar `oracle_query` con `SELECT 1 FROM DUAL`
- Usar `oracle_list_tables` para explorar esquema

## 📞 Soporte

Si tiene problemas:

1. **Verificar logs**: Los errores se muestran en la consola
2. **Verificar configuración**: Usar `oracle_info` para ver configuración actual
3. **Verificar conectividad**: Probar con herramientas Oracle nativas
4. **Documentación**: Consultar README.md para más detalles

## 📝 Notas Específicas para AYG

- La configuración está basada en `application-local.properties`
- Se ha configurado `ORACLE_OLD_CRYPTO=true` para compatibilidad
- El `fetch_size` se configura a 100 (igual que en Java)
- Pool configurado con valores conservadores para desarrollo 