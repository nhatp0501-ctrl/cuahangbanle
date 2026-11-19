'use strict';
const path = require('node:path'),
  { createRequire } = require('node:module');
function dependency(name) {
  try {
    return require(name);
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    const fallback = createRequire(path.resolve(__dirname, '../../../.report-tools/package.json'));
    return fallback(name);
  }
}
module.exports = dependency;
module.exports.resolve = function (name) {
  try {
    return require.resolve(name);
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    return createRequire(path.resolve(__dirname, '../../../.report-tools/package.json')).resolve(
      name,
    );
  }
};
