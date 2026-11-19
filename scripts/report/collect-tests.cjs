'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  { spawnSync } = require('node:child_process');
const { root, out } = require('./browser-session.cjs');
fs.mkdirSync(out, { recursive: true });
const browser = process.argv.includes('--browser');
const args = browser
  ? ['tests/browser.cjs']
  : ['--test', '--test-reporter=spec', 'tests/store.test.js'];
const result = spawnSync(process.execPath, args, {
  cwd: root,
  encoding: 'utf8',
  windowsHide: true,
});
const output = (result.stdout || '') + (result.stderr || '');
const text = output.replace(/\x1b\[[0-9;]*m/g, '');
fs.writeFileSync(
  path.join(out, browser ? 'kiem-thu-trinh-duyet.txt' : 'kiem-thu-nghiep-vu.txt'),
  text,
);
const manifest = {
  executedAt: new Date().toISOString(),
  node: process.version,
  command: 'node ' + args.join(' '),
  exitCode: result.status,
  checks: browser
    ? text
        .split('\n')
        .filter((x) => x.startsWith('PASS '))
        .map((x) => x.slice(5))
    : [],
  counts: browser
    ? null
    : {
        tests: Number(text.match(/tests\s+(\d+)/)?.[1]),
        pass: Number(text.match(/pass\s+(\d+)/)?.[1]),
        fail: Number(text.match(/fail\s+(\d+)/)?.[1]),
      },
};
fs.writeFileSync(
  path.join(out, browser ? 'ket-qua-trinh-duyet.json' : 'ket-qua-nghiep-vu.json'),
  JSON.stringify(manifest, null, 2),
);
console.log(JSON.stringify(manifest));
if (result.status !== 0) {
  console.error(text);
  process.exitCode = 1;
}
