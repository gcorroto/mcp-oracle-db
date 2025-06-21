// Formatear duración en milisegundos a texto legible
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

// Formatear bytes a texto legible
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Formatear número con separadores de miles
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Escapar texto SQL para prevenir inyección
export function escapeSqlValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'string') {
    // Escapar comillas simples duplicándolas
    return `'${value.replace(/'/g, "''")}'`;
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  
  if (value instanceof Date) {
    return `TO_DATE('${value.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"')`;
  }
  
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Validar identificador SQL (tabla, columna, etc.)
export function isValidSqlIdentifier(identifier: string): boolean {
  // Permitir identificadores con letras, números, guiones bajos y $
  // Debe empezar con letra o guión bajo
  const regex = /^[a-zA-Z_][a-zA-Z0-9_$]*$/;
  return regex.test(identifier) && identifier.length <= 128;
}

// Limpiar y validar SQL
export function sanitizeSql(sql: string): string {
  // Remover comentarios de línea
  sql = sql.replace(/--[^\n\r]*/g, '');
  
  // Remover comentarios de bloque
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remover espacios extras
  sql = sql.replace(/\s+/g, ' ').trim();
  
  return sql;
}

// Detectar tipo de comando SQL
export function getSqlCommandType(sql: string): string {
  const cleanSql = sanitizeSql(sql).toUpperCase();
  
  if (cleanSql.startsWith('SELECT')) return 'SELECT';
  if (cleanSql.startsWith('INSERT')) return 'INSERT';
  if (cleanSql.startsWith('UPDATE')) return 'UPDATE';
  if (cleanSql.startsWith('DELETE')) return 'DELETE';
  if (cleanSql.startsWith('CREATE')) return 'CREATE';
  if (cleanSql.startsWith('ALTER')) return 'ALTER';
  if (cleanSql.startsWith('DROP')) return 'DROP';
  if (cleanSql.startsWith('TRUNCATE')) return 'TRUNCATE';
  if (cleanSql.startsWith('GRANT')) return 'GRANT';
  if (cleanSql.startsWith('REVOKE')) return 'REVOKE';
  if (cleanSql.startsWith('COMMIT')) return 'COMMIT';
  if (cleanSql.startsWith('ROLLBACK')) return 'ROLLBACK';
  if (cleanSql.startsWith('SAVEPOINT')) return 'SAVEPOINT';
  if (cleanSql.startsWith('MERGE')) return 'MERGE';
  if (cleanSql.startsWith('CALL')) return 'CALL';
  if (cleanSql.startsWith('EXPLAIN')) return 'EXPLAIN';
  if (cleanSql.startsWith('ANALYZE')) return 'ANALYZE';
  if (cleanSql.startsWith('WITH')) return 'WITH';
  
  return 'UNKNOWN';
}

// Determinar si un comando es de solo lectura
export function isReadOnlyCommand(sql: string): boolean {
  const commandType = getSqlCommandType(sql);
  const readOnlyCommands = ['SELECT', 'EXPLAIN', 'WITH'];
  return readOnlyCommands.includes(commandType);
}

// Formatear resultado de consulta como tabla
export function formatQueryResultAsTable(rows: any[], maxRows: number = 100): string {
  if (!rows || rows.length === 0) {
    return 'No hay resultados';
  }
  
  const displayRows = rows.slice(0, maxRows);
  const columns = Object.keys(displayRows[0]);
  
  // Calcular ancho máximo de cada columna
  const columnWidths: { [key: string]: number } = {};
  columns.forEach(col => {
    columnWidths[col] = Math.max(
      col.length,
      ...displayRows.map(row => String(row[col] || '').length)
    );
    // Limitar ancho máximo para evitar salidas muy anchas
    columnWidths[col] = Math.min(columnWidths[col], 50);
  });
  
  // Crear encabezado
  let result = '| ';
  result += columns.map(col => col.padEnd(columnWidths[col])).join(' | ');
  result += ' |\n';
  
  // Crear separador
  result += '|';
  columns.forEach(col => {
    result += '-'.repeat(columnWidths[col] + 2) + '|';
  });
  result += '\n';
  
  // Crear filas
  displayRows.forEach(row => {
    result += '| ';
    result += columns.map(col => {
      let value = String(row[col] || '');
      if (value.length > columnWidths[col]) {
        value = value.substring(0, columnWidths[col] - 3) + '...';
      }
      return value.padEnd(columnWidths[col]);
    }).join(' | ');
    result += ' |\n';
  });
  
  if (rows.length > maxRows) {
    result += `\n... y ${rows.length - maxRows} filas más`;
  }
  
  return result;
}

// Parsear connection string de Oracle
export function parseOracleConnectionString(connectionString: string): {
  host?: string;
  port?: number;
  serviceName?: string;
  sid?: string;
} {
  const result: any = {};
  
  // Patrón para connection string con formato TNS
  const tnsPattern = /\(HOST=([^)]+)\).*\(PORT=(\d+)\).*\(SERVICE_NAME=([^)]+)\)/i;
  const tnsMatch = connectionString.match(tnsPattern);
  
  if (tnsMatch) {
    result.host = tnsMatch[1];
    result.port = parseInt(tnsMatch[2]);
    result.serviceName = tnsMatch[3];
    return result;
  }
  
  // Patrón para connection string simple
  const simplePattern = /^([^:]+):(\d+)\/(.+)$/;
  const simpleMatch = connectionString.match(simplePattern);
  
  if (simpleMatch) {
    result.host = simpleMatch[1];
    result.port = parseInt(simpleMatch[2]);
    result.serviceName = simpleMatch[3];
    return result;
  }
  
  // Patrón para connection string con SID
  const sidPattern = /^([^:]+):(\d+):(.+)$/;
  const sidMatch = connectionString.match(sidPattern);
  
  if (sidMatch) {
    result.host = sidMatch[1];
    result.port = parseInt(sidMatch[2]);
    result.sid = sidMatch[3];
    return result;
  }
  
  return result;
}

// Crear mensaje de error amigable
export function createFriendlyErrorMessage(error: any): string {
  if (!error) return 'Error desconocido';
  
  const message = error.message || String(error);
  
  // Errores comunes de Oracle
  if (message.includes('ORA-00942')) {
    return 'La tabla o vista no existe';
  }
  if (message.includes('ORA-00904')) {
    return 'Columna inválida o inexistente';
  }
  if (message.includes('ORA-01017')) {
    return 'Usuario o contraseña inválidos';
  }
  if (message.includes('ORA-12154')) {
    return 'No se pudo resolver el identificador de conexión TNS';
  }
  if (message.includes('ORA-12545')) {
    return 'Falló la conexión porque el host o objeto de destino no existe';
  }
  if (message.includes('ORA-01031')) {
    return 'Privilegios insuficientes';
  }
  if (message.includes('ORA-00001')) {
    return 'Violación de restricción de unicidad';
  }
  if (message.includes('ORA-02292')) {
    return 'Violación de restricción de integridad (clave foránea)';
  }
  if (message.includes('TNS-12541')) {
    return 'No hay listener en el host y puerto especificados';
  }
  if (message.includes('TNS-12514')) {
    return 'El listener no conoce el servicio solicitado';
  }
  
  return message;
} 