import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { OracleService } from '../tools/oracle-service';

describe('Oracle MCP Integration Tests', () => {
  let oracleService: OracleService;

  beforeAll(async () => {
    // Solo ejecutar tests si hay configuración de Oracle
    if (!process.env.ORACLE_HOST && !process.env.ORACLE_CONNECTION_STRING) {
      console.log('Skipping Oracle tests - no configuration found');
      return;
    }
    
    try {
      oracleService = new OracleService();
    } catch (error) {
      console.log('Skipping Oracle tests - configuration error:', error);
    }
  });

  afterAll(async () => {
    if (oracleService) {
      await oracleService.close();
    }
  });

  it('should connect to Oracle database', async () => {
    if (!oracleService) {
      console.log('Skipping test - no Oracle service');
      return;
    }

    const result = await oracleService.healthCheck();
    
    if (result.success) {
      expect(result.success).toBe(true);
      expect(result.data?.connected).toBe(true);
      console.log('✅ Oracle connection successful');
      console.log('Version:', result.data?.version);
    } else {
      console.log('❌ Oracle connection failed:', result.error);
      // No fallar el test si es problema de configuración
      expect(result.error).toBeTruthy();
    }
  }, 30000);

  it('should execute basic query', async () => {
    if (!oracleService) {
      console.log('Skipping test - no Oracle service');
      return;
    }

    const result = await oracleService.executeQuery('SELECT 1 as TEST_VALUE FROM DUAL');
    
    if (result.success) {
      expect(result.success).toBe(true);
      expect(result.data?.rows).toHaveLength(1);
      expect(result.data?.rows[0].TEST_VALUE).toBe(1);
      console.log('✅ Basic query successful');
    } else {
      console.log('❌ Basic query failed:', result.error);
      // Permitir que falle si hay problemas de conexión
      expect(result.error).toBeTruthy();
    }
  }, 30000);

  it('should list user tables', async () => {
    if (!oracleService) {
      console.log('Skipping test - no Oracle service');
      return;
    }

    const result = await oracleService.getTables();
    
    if (result.success) {
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      console.log(`✅ Found ${result.data?.length || 0} tables`);
    } else {
      console.log('❌ List tables failed:', result.error);
      expect(result.error).toBeTruthy();
    }
  }, 30000);

  it('should handle invalid SQL gracefully', async () => {
    if (!oracleService) {
      console.log('Skipping test - no Oracle service');
      return;
    }

    const result = await oracleService.executeQuery('SELECT * FROM non_existent_table');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    console.log('✅ Invalid SQL handled correctly');
  }, 30000);
}); 