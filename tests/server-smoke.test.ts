import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

describe('MCP stdio server', () => {
  it('lists the unchanged tools without connecting to Oracle', async () => {
    execFileSync(process.execPath, ['node_modules/typescript/bin/tsc']);
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ['--require', resolve('tests/fixtures/oracle-guard.cjs'), 'dist/index.js'],
      env: {
        ...Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined)),
        ORACLE_HOST: '127.0.0.1', ORACLE_PORT: '9', ORACLE_SERVICE_NAME: 'TEST',
        ORACLE_USER: 'test', ORACLE_PASSWORD: 'test', ORACLE_CONNECTION_STRING: '',
      },
      stderr: 'pipe',
    });
    let stderr = '';
    transport.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
    const client = new Client({ name: 'smoke-test', version: '1.0.0' });
    try {
      await client.connect(transport);
      const { tools } = await client.listTools();
      expect(tools.map(tool => tool.name).sort()).toEqual([
        'oracle_health_check', 'oracle_query', 'oracle_execute', 'oracle_list_tables',
        'oracle_describe_table', 'oracle_transaction', 'oracle_info',
      ].sort());
      const query = tools.find(tool => tool.name === 'oracle_query')!;
      const describe = tools.find(tool => tool.name === 'oracle_describe_table')!;
      expect((query.inputSchema.properties!.sql as { description: string }).description).toBe('Consulta SQL SELECT a ejecutar');
      expect((describe.inputSchema.properties!.tableName as { description: string }).description).toBe('Nombre de la tabla a describir');
      expect((query.inputSchema.properties!.maxRows as { default: number }).default).toBe(100);
      const result = await client.callTool({ name: 'oracle_query', arguments: { sql: 'DELETE FROM test' } });
      expect(result.content).toEqual([{ type: 'text', text: "⚠️ **Advertencia:** Esta herramienta solo permite consultas SELECT. Use 'oracle_execute' para otros comandos." }]);
      expect(stderr).not.toContain('Unexpected Oracle connection attempt');
    } finally {
      await client.close();
    }
  }, 30000);
});
