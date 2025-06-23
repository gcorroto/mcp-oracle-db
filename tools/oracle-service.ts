import oracledb from 'oracledb';
import {
  OracleConnectionConfig,
  OracleResult,
  QueryResult,
  ExecuteResult,
  TableInfo,
  TableColumnInfo,
  IndexInfo,
  ViewInfo,
  ProcedureInfo,
  SequenceInfo,
  ConnectionStatus,
  QueryOptions,
  ExecuteOptions,
  SchemaInfo,
  TablespaceInfo
} from '../common/types.js';
import {
  formatDuration,
  createFriendlyErrorMessage,
  getSqlCommandType,
  isReadOnlyCommand,
  formatQueryResultAsTable,
  parseOracleConnectionString
} from '../common/utils.js';

export class OracleService {
  private config: OracleConnectionConfig;
  private pool: oracledb.Pool | null = null;
  private isInitialized = false;

  constructor() {
    this.config = this.loadConfigFromEnv();
    this.initializeOracleDB();
  }

  private loadConfigFromEnv(): OracleConnectionConfig {
    const connectionString = process.env.ORACLE_CONNECTION_STRING;
    
    if (connectionString) {
      const parsed = parseOracleConnectionString(connectionString);
      return {
        host: parsed.host || process.env.ORACLE_HOST || 'localhost',
        port: parsed.port || parseInt(process.env.ORACLE_PORT || '1521'),
        serviceName: parsed.serviceName || process.env.ORACLE_SERVICE_NAME || 'XE',
        username: process.env.ORACLE_USERNAME || process.env.ORACLE_USER || 'hr',
        password: process.env.ORACLE_PASSWORD || 'hr',
        connectionString,
        poolMin: parseInt(process.env.ORACLE_POOL_MIN || '1'),
        poolMax: parseInt(process.env.ORACLE_POOL_MAX || '10'),
        poolIncrement: parseInt(process.env.ORACLE_POOL_INCREMENT || '1'),
        poolTimeout: parseInt(process.env.ORACLE_POOL_TIMEOUT || '60'),
        stmtCacheSize: parseInt(process.env.ORACLE_STMT_CACHE_SIZE || '30'),
        fetchSize: parseInt(process.env.ORACLE_FETCH_SIZE || '100')
      };
    }

    return {
      host: process.env.ORACLE_HOST || 'localhost',
      port: parseInt(process.env.ORACLE_PORT || '1521'),
      serviceName: process.env.ORACLE_SERVICE_NAME || 'XE',
      username: process.env.ORACLE_USERNAME || process.env.ORACLE_USER || 'hr',
      password: process.env.ORACLE_PASSWORD || 'hr',
      poolMin: parseInt(process.env.ORACLE_POOL_MIN || '1'),
      poolMax: parseInt(process.env.ORACLE_POOL_MAX || '10'),
      poolIncrement: parseInt(process.env.ORACLE_POOL_INCREMENT || '1'),
      poolTimeout: parseInt(process.env.ORACLE_POOL_TIMEOUT || '60'),
      stmtCacheSize: parseInt(process.env.ORACLE_STMT_CACHE_SIZE || '30'),
      fetchSize: parseInt(process.env.ORACLE_FETCH_SIZE || '100')
    };
  }

  private initializeOracleDB(): void {
    try {
      // Configuración global
      oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
      oracledb.autoCommit = false;
      oracledb.maxRows = 1000;
      oracledb.fetchArraySize = this.config.fetchSize || 100;
      
      // Para conexiones antiguas (anteriores a 11g), usar modo Thick
      if (process.env.ORACLE_OLD_CRYPTO === 'true') {
        console.error('🔧 Configurando modo Thick para soporte de Oracle antiguo...');
        
        // Configurar el directorio del cliente Oracle
        const libDir = process.env.ORACLE_CLIENT_LIB_DIR;
        if (libDir) {
          console.error(`📁 Usando Oracle Instant Client desde: ${libDir}`);
          oracledb.initOracleClient({ libDir });
        } else {
          // Intentar inicializar sin directorio específico
          try {
            console.error('🔍 Intentando inicializar Oracle Thick sin directorio específico...');
            oracledb.initOracleClient();
            console.error('✅ Oracle Thick inicializado correctamente');
          } catch (clientError: any) {
            console.error('⚠️  ADVERTENCIA: No se pudo inicializar Oracle Thick:', clientError.message);
            console.error('💡 SOLUCIÓN 1: Continuar con modo Thin (puede fallar con Oracle muy antiguo)');
            console.error('💡 SOLUCIÓN 2: Instalar Oracle Instant Client y configurar ORACLE_CLIENT_LIB_DIR');
            console.error('📖 Guía: https://node-oracledb.readthedocs.io/en/latest/user_guide/installation.html');
            
            // No lanzar error, continuar con modo Thin
          }
        }
      } else {
        // Configurar el directorio del cliente Oracle si está especificado (modo Thin)
        if (process.env.ORACLE_CLIENT_LIB_DIR) {
          oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR });
        }
      }

      this.isInitialized = true;
    } catch (error: any) {
      throw new Error(`Error inicializando Oracle DB: ${error.message}`);
    }
  }

  private async getConnectionString(): Promise<string> {
    if (this.config.connectionString) {
      return this.config.connectionString;
    }

    return `(DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=${this.config.host})(PORT=${this.config.port}))(CONNECT_DATA=(SERVICE_NAME=${this.config.serviceName})))`;
  }

  private async createPool(): Promise<oracledb.Pool> {
    if (this.pool) {
      return this.pool;
    }

    const connectString = await this.getConnectionString();

    const poolConfig: any = {
      user: this.config.username,
      password: this.config.password,
      connectString,
      poolMin: this.config.poolMin || 1,
      poolMax: this.config.poolMax || 10,
      poolIncrement: this.config.poolIncrement || 1,
      poolTimeout: this.config.poolTimeout || 60,
      stmtCacheSize: this.config.stmtCacheSize || 30,
      poolAlias: 'default'
    };

    // Configuraciones para versiones antiguas de Oracle
    if (process.env.ORACLE_OLD_CRYPTO === 'true') {
      // Usar configuraciones compatibles con versiones antiguas
      poolConfig.events = false;
      poolConfig.externalAuth = false;
      
      // Configuraciones adicionales para Oracle antiguo
      poolConfig.edition = '';
      
      // Reducir timeouts para versiones antiguas
      poolConfig.poolTimeout = Math.min(poolConfig.poolTimeout, 30);
      poolConfig.queueTimeout = 10000; // 10 segundos
      
      console.error('Configurando pool para Oracle antiguo con crypto legacy');
    }

    this.pool = await oracledb.createPool(poolConfig);
    return this.pool;
  }

  // Verificar estado de salud de la conexión
  async healthCheck(): Promise<OracleResult<ConnectionStatus>> {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        throw new Error('Oracle DB no está inicializado');
      }

      const pool = await this.createPool();
      const connection = await pool.getConnection();
      
      try {
        // Verificar conexión básica
        const result = await connection.execute('SELECT 1 FROM DUAL');
        
        // Obtener información del pool
        const poolStatus = pool.poolStatistics || {} as any;
        
        // Obtener información de la sesión
        const sessionResult = await connection.execute(`
          SELECT 
            SYS_CONTEXT('USERENV', 'SID') as SESSION_ID,
            SYS_CONTEXT('USERENV', 'SESSION_USER') as USERNAME,
            SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') as SCHEMA_NAME,
            SYS_CONTEXT('USERENV', 'CLIENT_PROGRAM_NAME') as PROGRAM,
            SYS_CONTEXT('USERENV', 'HOST') as MACHINE,
            SYS_CONTEXT('USERENV', 'OS_USER') as OS_USER,
            SYS_CONTEXT('USERENV', 'CLIENT_INFO') as CLIENT_INFO,
            SYS_CONTEXT('USERENV', 'MODULE') as MODULE,
            SYS_CONTEXT('USERENV', 'ACTION') as ACTION
          FROM DUAL
        `);

        const sessionInfo = (sessionResult.rows as any[])[0];

        // Obtener versión de Oracle
        const versionResult = await connection.execute(`
          SELECT BANNER FROM V$VERSION WHERE BANNER LIKE 'Oracle%'
        `);
        
        const version = (versionResult.rows as any[])[0]?.BANNER || 'Desconocida';

        const status: ConnectionStatus = {
          connected: true,
          poolStatus: {
            connectionsOpen: poolStatus.connectionsOpen || 0,
            connectionsInUse: poolStatus.connectionsInUse || 0,
            poolAlias: pool.poolAlias || 'default',
            poolMin: pool.poolMin || 0,
            poolMax: pool.poolMax || 0,
            poolIncrement: pool.poolIncrement || 0,
            poolTimeout: pool.poolTimeout || 0,
            queueMax: poolStatus.queueMax || 0,
            queueTimeout: poolStatus.queueTimeout || 0,
            stmtCacheSize: pool.stmtCacheSize || 0
          },
          version,
          sessionInfo: {
            sessionId: parseInt(sessionInfo.SESSION_ID),
            username: sessionInfo.USERNAME,
            schemaName: sessionInfo.SCHEMA_NAME,
            program: sessionInfo.PROGRAM,
            machine: sessionInfo.MACHINE,
            osUser: sessionInfo.OS_USER,
            process: '',
            module: sessionInfo.MODULE,
            action: sessionInfo.ACTION,
            clientInfo: sessionInfo.CLIENT_INFO,
            logonTime: new Date()
          }
        };

        return {
          success: true,
          data: status,
          executionTime: Date.now() - startTime
        };

      } finally {
        await connection.close();
      }

    } catch (error: any) {
      return {
        success: false,
        error: createFriendlyErrorMessage(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  // Ejecutar consulta SQL
  async executeQuery(sql: string, binds: any[] = [], options: QueryOptions = {}): Promise<OracleResult<QueryResult>> {
    const startTime = Date.now();
    
    try {
      const pool = await this.createPool();
      const connection = await pool.getConnection();
      
      try {
        const executeOptions = {
          outFormat: options.outFormat || oracledb.OUT_FORMAT_OBJECT,
          maxRows: options.maxRows || 1000,
          fetchArraySize: options.fetchArraySize || this.config.fetchSize || 100,
          autoCommit: options.autoCommit || false,
          extendedMetaData: options.extendedMetaData || true,
          resultSet: options.resultSet || false
        };

        const result = await connection.execute(sql, binds, executeOptions);
        
        const queryResult: QueryResult = {
          rows: result.rows as any[],
          metadata: result.metaData?.map((col: any) => ({
            name: col.name,
            fetchType: col.fetchType || 0,
            dbType: col.dbType || 0,
            dbTypeName: col.dbTypeName || '',
            precision: col.precision,
            scale: col.scale,
            nullable: col.nullable,
            maxSize: col.byteSize
          })) || [],
          rowsAffected: result.rowsAffected
        };

        return {
          success: true,
          data: queryResult,
          command: sql,
          executionTime: Date.now() - startTime,
          rowsAffected: result.rowsAffected
        };

      } finally {
        await connection.close();
      }

    } catch (error: any) {
      return {
        success: false,
        error: createFriendlyErrorMessage(error),
        command: sql,
        executionTime: Date.now() - startTime
      };
    }
  }

  // Ejecutar comando SQL (INSERT, UPDATE, DELETE, etc.)
  async executeCommand(sql: string, binds: any[] = [], options: ExecuteOptions = {}): Promise<OracleResult<ExecuteResult>> {
    const startTime = Date.now();
    
    try {
      const pool = await this.createPool();
      const connection = await pool.getConnection();
      
      try {
        const executeOptions = {
          outFormat: options.outFormat || oracledb.OUT_FORMAT_OBJECT,
          autoCommit: options.autoCommit || true,
          extendedMetaData: options.extendedMetaData || false,
          batchErrors: options.batchErrors || false,
          dmlRowCounts: options.dmlRowCounts || false
        };

        const result = await connection.execute(sql, binds, executeOptions);
        
        const executeResult: ExecuteResult = {
          rowsAffected: result.rowsAffected || 0,
          lastRowid: result.lastRowid,
          outBinds: result.outBinds
        };

        return {
          success: true,
          data: executeResult,
          command: sql,
          executionTime: Date.now() - startTime,
          rowsAffected: result.rowsAffected
        };

      } finally {
        await connection.close();
      }

    } catch (error: any) {
      return {
        success: false,
        error: createFriendlyErrorMessage(error),
        command: sql,
        executionTime: Date.now() - startTime
      };
    }
  }

  // Obtener lista de tablas
  async getTables(owner?: string): Promise<OracleResult<TableInfo[]>> {
    const startTime = Date.now();
    
    let sql = `
      SELECT 
        table_name,
        'TABLE' as table_type,
        owner,
        comments,
        num_rows,
        last_analyzed
      FROM all_tables 
    `;
    
    const binds: any[] = [];
    
    if (owner) {
      sql += ` WHERE owner = :owner`;
      binds.push(owner.toUpperCase());
    } else {
      sql += ` WHERE owner = USER`;
    }
    
    sql += ` ORDER BY table_name`;

    try {
      const result = await this.executeQuery(sql, binds);
      
      if (result.success && result.data) {
        const tables: TableInfo[] = result.data.rows.map((row: any) => ({
          tableName: row.TABLE_NAME,
          tableType: row.TABLE_TYPE,
          owner: row.OWNER,
          comments: row.COMMENTS,
          numRows: row.NUM_ROWS,
          lastAnalyzed: row.LAST_ANALYZED
        }));

        return {
          success: true,
          data: tables,
          executionTime: Date.now() - startTime
        };
      }

      return result as any;

    } catch (error: any) {
      return {
        success: false,
        error: createFriendlyErrorMessage(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  // Obtener columnas de una tabla
  async getTableColumns(tableName: string, owner?: string): Promise<OracleResult<TableColumnInfo[]>> {
    const startTime = Date.now();
    
    let sql = `
      SELECT 
        column_name,
        data_type,
        data_length,
        data_precision,
        data_scale,
        nullable,
        data_default,
        column_id,
        comments
      FROM all_tab_columns c
      LEFT JOIN all_col_comments cc ON c.owner = cc.owner 
        AND c.table_name = cc.table_name 
        AND c.column_name = cc.column_name
      WHERE c.table_name = :tableName
    `;
    
    const binds: any[] = [tableName.toUpperCase()];
    
    if (owner) {
      sql += ` AND c.owner = :owner`;
      binds.push(owner.toUpperCase());
    } else {
      sql += ` AND c.owner = USER`;
    }
    
    sql += ` ORDER BY c.column_id`;

    try {
      const result = await this.executeQuery(sql, binds);
      
      if (result.success && result.data) {
        const columns: TableColumnInfo[] = result.data.rows.map((row: any) => ({
          columnName: row.COLUMN_NAME,
          dataType: row.DATA_TYPE,
          dataLength: row.DATA_LENGTH,
          dataPrecision: row.DATA_PRECISION,
          dataScale: row.DATA_SCALE,
          nullable: row.NULLABLE,
          defaultValue: row.DATA_DEFAULT,
          comments: row.COMMENTS,
          columnId: row.COLUMN_ID
        }));

        return {
          success: true,
          data: columns,
          executionTime: Date.now() - startTime
        };
      }

      return result as any;

    } catch (error: any) {
      return {
        success: false,
        error: createFriendlyErrorMessage(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  // Cerrar pool de conexiones
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close(10);
      this.pool = null;
    }
  }

  // Obtener configuración actual
  getConfig(): OracleConnectionConfig {
    return { ...this.config };
  }
} 