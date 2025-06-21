declare module 'oracledb' {
  export interface Pool {
    getConnection(): Promise<Connection>;
    close(drainTime?: number): Promise<void>;
    poolAlias?: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
    stmtCacheSize?: number;
    poolStatistics?: any;
  }

  export interface Connection {
    execute(sql: string, binds?: any[], options?: ExecuteOptions): Promise<Result>;
    close(): Promise<void>;
  }

  export interface Result {
    rows?: any[];
    metaData?: MetaData[];
    rowsAffected?: number;
    lastRowid?: string;
    outBinds?: any;
  }

  export interface MetaData {
    name: string;
    fetchType?: number;
    dbType?: number;
    dbTypeName?: string;
    precision?: number;
    scale?: number;
    nullable?: boolean;
    byteSize?: number;
  }

  export interface ExecuteOptions {
    outFormat?: number;
    maxRows?: number;
    fetchArraySize?: number;
    autoCommit?: boolean;
    extendedMetaData?: boolean;
    resultSet?: boolean;
    batchErrors?: boolean;
    dmlRowCounts?: boolean;
  }

  export interface PoolAttributes {
    user: string;
    password: string;
    connectString: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
    stmtCacheSize?: number;
    poolAlias?: string;
  }

  export function createPool(poolAttributes: PoolAttributes): Promise<Pool>;
  export function initOracleClient(options?: { libDir?: string }): void;

  export const OUT_FORMAT_OBJECT: number;
  export const OUT_FORMAT_ARRAY: number;
  export const BIND_IN: number;
  export const BIND_OUT: number;
  export const BIND_INOUT: number;

  export let oracleClientVersion: number[];
  export let outFormat: number;
  export let autoCommit: boolean;
  export let maxRows: number;
  export let fetchArraySize: number;
} 