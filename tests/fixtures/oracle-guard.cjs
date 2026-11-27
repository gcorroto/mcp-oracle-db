// Fail visibly if startup or tools/list tries to open an Oracle connection.
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  const result = originalLoad.call(this, request, ...args);
  if (request === 'oracledb' && !result.__smokeGuard) {
    for (const method of ['createPool', 'getConnection']) {
      result[method] = () => { process.stderr.write('Unexpected Oracle connection attempt: ' + method + '\n'); throw new Error('Unexpected Oracle connection attempt: ' + method); };
    }
    result.__smokeGuard = true;
  }
  return result;
};
