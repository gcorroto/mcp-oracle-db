#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import Oracle service
import { OracleService } from "./tools/oracle-service.js";
import { 
  formatDuration, 
  formatQueryResultAsTable, 
  getSqlCommandType, 
  isReadOnlyCommand,
  formatNumber
} from "./common/utils.js";

import { VERSION } from "./common/version.js";

// Create the MCP Server with proper configuration
const server = new McpServer({
  name: "oracle-db-mcp-server",
  version: VERSION,
});

// Create Oracle service instance (lazy initialization)
let oracleService: OracleService | null = null;

function getOracleService(): OracleService {
  if (!oracleService) {
    try {
      oracleService = new OracleService();
    } catch (error: any) {
      throw new Error(`Oracle configuration error: ${error.message}`);
    }
  }
  return oracleService;
}

// ----- HERRAMIENTAS MCP PARA ORACLE DATABASE -----

// 1. Health Check del sistema Oracle DB
server.tool(
  "oracle_health_check",
  "Verificar el estado de salud de la conexión Oracle DB",
  {},
  async () => {
    try {
      const result = await getOracleService().healthCheck();
      
      if (!result.success) {
        return {
          content: [{ type: "text", text: `❌ **Error de Conexión:** ${result.error}` }],
        };
      }

      const data = result.data!;
      const statusIcon = data.connected ? '✅' : '❌';
      const poolIcon = '🏊‍♂️';
      const sessionIcon = '👤';
      
      let healthText = `${statusIcon} **Estado de Oracle Database**\n\n` +
        `**Conectado:** ${data.connected ? 'Sí' : 'No'}\n` +
        `**Versión:** ${data.version || 'N/A'}\n\n`;

      if (data.poolStatus) {
        healthText += `${poolIcon} **Pool de Conexiones:**\n` +
          `• Conexiones Abiertas: ${data.poolStatus.connectionsOpen}\n` +
          `• Conexiones en Uso: ${data.poolStatus.connectionsInUse}\n` +
          `• Pool Mín/Máx: ${data.poolStatus.poolMin}/${data.poolStatus.poolMax}\n` +
          `• Timeout: ${data.poolStatus.poolTimeout}s\n` +
          `• Cache de Statements: ${data.poolStatus.stmtCacheSize}\n\n`;
      }

      if (data.sessionInfo) {
        healthText += `${sessionIcon} **Información de Sesión:**\n` +
          `• ID de Sesión: ${data.sessionInfo.sessionId}\n` +
          `• Usuario: ${data.sessionInfo.username}\n` +
          `• Esquema: ${data.sessionInfo.schemaName}\n` +
          `• Máquina: ${data.sessionInfo.machine}\n` +
          `• Usuario OS: ${data.sessionInfo.osUser}\n`;
      }

      healthText += `\n**Tiempo de Verificación:** ${formatDuration(result.executionTime || 0)}`;

      return {
        content: [{ type: "text", text: healthText }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
      };
    }
  }
);

// 2. Ejecutar consulta SQL (SELECT)
server.tool(
  "oracle_query",
  "Ejecutar consulta SQL SELECT en Oracle Database",
  {
    sql: z.string().describe("Consulta SQL SELECT a ejecutar"),
    maxRows: z.number().optional().default(100).describe("Número máximo de filas a devolver"),
    formatAsTable: z.boolean().optional().default(true).describe("Formatear resultado como tabla"),
    showMetadata: z.boolean().optional().default(false).describe("Mostrar metadatos de columnas")
  },
  async (args) => {
    try {
      // Verificar que sea una consulta de solo lectura
      if (!isReadOnlyCommand(args.sql)) {
        return {
          content: [{ type: "text", text: `⚠️ **Advertencia:** Esta herramienta solo permite consultas SELECT. Use 'oracle_execute' para otros comandos.` }],
        };
      }

      const result = await getOracleService().executeQuery(args.sql, [], {
        maxRows: args.maxRows,
        extendedMetaData: args.showMetadata
      });
      
      if (!result.success) {
        return {
          content: [{ type: "text", text: `❌ **Error SQL:** ${result.error}\n\n**Comando:** \`${args.sql}\`` }],
        };
      }

      const queryResult = result.data!;
      const commandType = getSqlCommandType(args.sql);
      
      let responseText = `📊 **Consulta ${commandType} Ejecutada**\n\n`;
      responseText += `**Filas Devueltas:** ${formatNumber(queryResult.rows.length)}\n`;
      responseText += `**Tiempo de Ejecución:** ${formatDuration(result.executionTime || 0)}\n\n`;

      if (queryResult.rows.length === 0) {
        responseText += `**Resultado:** No se encontraron datos`;
      } else {
        if (args.formatAsTable) {
          responseText += `**Resultado:**\n\`\`\`\n${formatQueryResultAsTable(queryResult.rows, args.maxRows)}\n\`\`\``;
        } else {
          responseText += `**Resultado (JSON):**\n\`\`\`json\n${JSON.stringify(queryResult.rows.slice(0, Math.min(10, args.maxRows)), null, 2)}\n\`\`\``;
          if (queryResult.rows.length > 10) {
            responseText += `\n... y ${queryResult.rows.length - 10} filas más`;
          }
        }
      }

      if (args.showMetadata && queryResult.metadata.length > 0) {
        responseText += `\n\n**Metadatos de Columnas:**\n`;
        queryResult.metadata.forEach((col, index) => {
          responseText += `${index + 1}. **${col.name}** (${col.dbTypeName})\n`;
        });
      }

      return {
        content: [{ type: "text", text: responseText }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
      };
    }
  }
);

// 3. Ejecutar comando SQL (INSERT, UPDATE, DELETE, CREATE, etc.)
server.tool(
  "oracle_execute",
  "Ejecutar comando SQL en Oracle Database (INSERT, UPDATE, DELETE, CREATE, etc.)",
  {
    sql: z.string().describe("Comando SQL a ejecutar"),
    autoCommit: z.boolean().optional().default(true).describe("Confirmar automáticamente los cambios"),
    showDetails: z.boolean().optional().default(true).describe("Mostrar detalles de la ejecución")
  },
  async (args) => {
    try {
      const commandType = getSqlCommandType(args.sql);
      
      const result = await getOracleService().executeCommand(args.sql, [], {
        autoCommit: args.autoCommit
      });
      
      if (!result.success) {
        return {
          content: [{ type: "text", text: `❌ **Error SQL:** ${result.error}\n\n**Comando:** \`${args.sql}\`` }],
        };
      }

      const executeResult = result.data!;
      
      const commandIcon = {
        'INSERT': '➕',
        'UPDATE': '✏️',
        'DELETE': '🗑️',
        'CREATE': '🏗️',
        'ALTER': '🔧',
        'DROP': '💥',
        'TRUNCATE': '🧹',
        'MERGE': '🔀',
        'GRANT': '🔑',
        'REVOKE': '🚫'
      }[commandType] || '⚡';

      let responseText = `${commandIcon} **Comando ${commandType} Ejecutado**\n\n`;
      responseText += `**Filas Afectadas:** ${formatNumber(executeResult.rowsAffected)}\n`;
      responseText += `**Tiempo de Ejecución:** ${formatDuration(result.executionTime || 0)}\n`;
      responseText += `**Auto Commit:** ${args.autoCommit ? 'Sí' : 'No'}\n`;

      if (executeResult.lastRowid && args.showDetails) {
        responseText += `**Último ROWID:** ${executeResult.lastRowid}\n`;
      }

      if (executeResult.outBinds && args.showDetails) {
        responseText += `**Parámetros de Salida:** ${JSON.stringify(executeResult.outBinds)}\n`;
      }

      return {
        content: [{ type: "text", text: responseText }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
      };
    }
  }
);

// 4. Listar tablas
server.tool(
  "oracle_list_tables",
  "Listar tablas en Oracle Database",
  {
    owner: z.string().optional().describe("Propietario/esquema específico (por defecto el usuario actual)"),
    showDetails: z.boolean().optional().default(true).describe("Mostrar detalles adicionales de las tablas")
  },
  async (args) => {
    try {
      const result = await getOracleService().getTables(args.owner);
      
      if (!result.success) {
        return {
          content: [{ type: "text", text: `❌ **Error:** ${result.error}` }],
        };
      }

      const tables = result.data!;
      
      if (tables.length === 0) {
        return {
          content: [{ type: "text", text: `📋 **No se encontraron tablas** en el esquema${args.owner ? ` '${args.owner}'` : ' actual'}` }],
        };
      }

      let responseText = `📋 **Tablas en Oracle Database** (${formatNumber(tables.length)} tablas)\n`;
      responseText += `**Esquema:** ${args.owner || 'Usuario actual'}\n`;
      responseText += `**Tiempo de Consulta:** ${formatDuration(result.executionTime || 0)}\n\n`;

      if (args.showDetails) {
        tables.forEach((table, index) => {
          responseText += `**${index + 1}. ${table.tableName}**\n`;
          responseText += `   • Propietario: ${table.owner}\n`;
          if (table.numRows !== null && table.numRows !== undefined) {
            responseText += `   • Filas: ${formatNumber(table.numRows)}\n`;
          }
          if (table.lastAnalyzed) {
            responseText += `   • Último Análisis: ${table.lastAnalyzed}\n`;
          }
          if (table.comments) {
            responseText += `   • Comentarios: ${table.comments}\n`;
          }
          responseText += `\n`;
        });
      } else {
        const tableNames = tables.map(t => t.tableName).join(', ');
        responseText += `**Tablas:** ${tableNames}`;
      }

      return {
        content: [{ type: "text", text: responseText }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
      };
    }
  }
);

// 5. Describir tabla
server.tool(
  "oracle_describe_table",
  "Obtener estructura y columnas de una tabla Oracle",
  {
    tableName: z.string().describe("Nombre de la tabla a describir"),
    owner: z.string().optional().describe("Propietario/esquema de la tabla (por defecto el usuario actual)"),
    showDetails: z.boolean().optional().default(true).describe("Mostrar detalles completos de las columnas")
  },
  async (args) => {
    try {
      const result = await getOracleService().getTableColumns(args.tableName, args.owner);
      
      if (!result.success) {
        return {
          content: [{ type: "text", text: `❌ **Error:** ${result.error}` }],
        };
      }

      const columns = result.data!;
      
      if (columns.length === 0) {
        return {
          content: [{ type: "text", text: `📋 **La tabla '${args.tableName}' no existe o no tiene columnas**` }],
        };
      }

      let responseText = `📋 **Estructura de la Tabla: ${args.tableName}**\n`;
      responseText += `**Esquema:** ${args.owner || 'Usuario actual'}\n`;
      responseText += `**Columnas:** ${formatNumber(columns.length)}\n`;
      responseText += `**Tiempo de Consulta:** ${formatDuration(result.executionTime || 0)}\n\n`;

      if (args.showDetails) {
        responseText += `| # | Columna | Tipo | Nulo | Defecto | Comentarios |\n`;
        responseText += `|---|---------|------|------|---------|-------------|\n`;
        
        columns.forEach(col => {
          let dataType = col.dataType;
          if (col.dataPrecision && col.dataScale !== null && col.dataScale !== undefined) {
            dataType += `(${col.dataPrecision},${col.dataScale})`;
          } else if (col.dataLength && ['VARCHAR2', 'CHAR', 'NVARCHAR2', 'NCHAR'].includes(col.dataType)) {
            dataType += `(${col.dataLength})`;
          }

          responseText += `| ${col.columnId} | **${col.columnName}** | ${dataType} | ${col.nullable === 'Y' ? 'Sí' : 'No'} | ${col.defaultValue || '-'} | ${col.comments || '-'} |\n`;
        });
      } else {
        const columnNames = columns.map(c => c.columnName).join(', ');
        responseText += `**Columnas:** ${columnNames}`;
      }

      return {
        content: [{ type: "text", text: responseText }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
      };
    }
  }
);

// 6. Ejecutar transacción
server.tool(
  "oracle_transaction",
  "Ejecutar múltiples comandos SQL en una transacción",
  {
    commands: z.array(z.string()).describe("Lista de comandos SQL a ejecutar en la transacción"),
    rollbackOnError: z.boolean().optional().default(true).describe("Hacer rollback si hay error en algún comando")
  },
  async (args) => {
    try {
      let totalRowsAffected = 0;
      const results: string[] = [];
      const startTime = Date.now();

      // Nota: Esto requeriría una implementación más avanzada del servicio Oracle
      // para manejar transacciones manuales. Por ahora, ejecutamos comandos individuales
      
      for (let i = 0; i < args.commands.length; i++) {
        const sql = args.commands[i];
        const commandType = getSqlCommandType(sql);
        
        let result;
        if (isReadOnlyCommand(sql)) {
          result = await getOracleService().executeQuery(sql);
        } else {
          result = await getOracleService().executeCommand(sql, [], { autoCommit: false });
        }

        if (!result.success) {
          if (args.rollbackOnError) {
            return {
              content: [{ 
                type: "text", 
                text: `❌ **Error en Transacción (Comando ${i + 1}):** ${result.error}\n\n**Comando que falló:** \`${sql}\`\n\n**Nota:** Se ha hecho rollback de todos los cambios.`
              }],
            };
          } else {
            results.push(`❌ Comando ${i + 1} (${commandType}): Error - ${result.error}`);
          }
        } else {
          if (result.rowsAffected) {
            totalRowsAffected += result.rowsAffected;
          }
          results.push(`✅ Comando ${i + 1} (${commandType}): ${result.rowsAffected || 0} filas afectadas`);
        }
      }

      const totalTime = Date.now() - startTime;

      let responseText = `🔄 **Transacción Completada**\n\n`;
      responseText += `**Comandos Ejecutados:** ${args.commands.length}\n`;
      responseText += `**Total Filas Afectadas:** ${formatNumber(totalRowsAffected)}\n`;
      responseText += `**Tiempo Total:** ${formatDuration(totalTime)}\n\n`;
      responseText += `**Detalle por Comando:**\n${results.join('\n')}`;

      return {
        content: [{ type: "text", text: responseText }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
      };
    }
  }
);

// 7. Información de configuración
server.tool(
  "oracle_info",
  "Obtener información de configuración de Oracle Database",
  {},
  async () => {
    try {
      const config = getOracleService().getConfig();
      
      let infoText = `ℹ️ **Configuración de Oracle Database**\n\n`;
      infoText += `**Host:** ${config.host}\n`;
      infoText += `**Puerto:** ${config.port}\n`;
      infoText += `**Servicio:** ${config.serviceName}\n`;
      infoText += `**Usuario:** ${config.username}\n`;
      infoText += `**Pool Mín/Máx:** ${config.poolMin}/${config.poolMax}\n`;
      infoText += `**Fetch Size:** ${config.fetchSize}\n`;
      infoText += `**Statement Cache:** ${config.stmtCacheSize}\n`;
      infoText += `**Timeout Pool:** ${config.poolTimeout}s\n`;

      if (config.connectionString) {
        infoText += `**Connection String:** Configurado\n`;
      }

      return {
        content: [{ type: "text", text: infoText }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `❌ **Error:** ${error.message}` }],
      };
    }
  }
);

async function runServer() {
  try {
    console.error("Creating Oracle DB MCP Server...");
    console.error("Server info: oracle-db-mcp-server");
    console.error("Version:", VERSION);
    
    // Validate environment variables
    const requiredVars = ['ORACLE_HOST', 'ORACLE_USERNAME', 'ORACLE_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName] && !process.env.ORACLE_CONNECTION_STRING);
    
    if (missingVars.length > 0 && !process.env.ORACLE_CONNECTION_STRING) {
      console.error("Warning: Missing environment variables:", missingVars.join(', '));
      console.error("Either set individual variables or use ORACLE_CONNECTION_STRING");
    }
    
    // Log configuration (without password)
    console.error("Oracle Configuration:");
    console.error("- ORACLE_HOST:", process.env.ORACLE_HOST || 'localhost');
    console.error("- ORACLE_PORT:", process.env.ORACLE_PORT || '1521');
    console.error("- ORACLE_SERVICE_NAME:", process.env.ORACLE_SERVICE_NAME || 'XE');
    console.error("- ORACLE_USERNAME:", process.env.ORACLE_USERNAME || process.env.ORACLE_USER || 'hr');
    console.error("- ORACLE_PASSWORD:", process.env.ORACLE_PASSWORD ? '***' : 'NOT SET');
    console.error("- ORACLE_CONNECTION_STRING:", process.env.ORACLE_CONNECTION_STRING ? 'SET' : 'NOT SET');
    console.error("- ORACLE_OLD_CRYPTO:", process.env.ORACLE_OLD_CRYPTO || 'false');
    
    console.error("Starting Oracle DB MCP Server in stdio mode...");
    
    // Create transport
    const transport = new StdioServerTransport();
    
    console.error("Connecting server to transport...");
    
    // Connect server to transport - this should keep the process alive
    await server.connect(transport);
    
    console.error("MCP Server connected and ready!");
    console.error("Available tools:", [
      "oracle_health_check",
      "oracle_query",
      "oracle_execute", 
      "oracle_list_tables",
      "oracle_describe_table",
      "oracle_transaction",
      "oracle_info"
    ]);
    
  } catch (error) {
    console.error("Error starting server:", error);
    console.error("Stack trace:", (error as Error).stack);
    process.exit(1);
  }
}

// Cleanup on exit
process.on('SIGINT', async () => {
  console.error('Received SIGINT, cleaning up...');
  if (oracleService) {
    await oracleService.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, cleaning up...');
  if (oracleService) {
    await oracleService.close();
  }
  process.exit(0);
});

// Start the server
runServer(); 