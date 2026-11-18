'use strict';
// Browser checks use the installed Microsoft Edge through the DevTools protocol.
// No browser package or network dependency is required.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { createServer } = require('../server');
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
async function main() {
  const server = createServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browserPath =
    process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'retailflow-browser-'));
  const output = path.join(__dirname, '..', 'preview');
  fs.mkdirSync(output, { recursive: true });
  const child = spawn(
    browserPath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--window-size=1440,1000',
      'about:blank',
    ],
    { windowsHide: true, stdio: 'ignore' },
  );
  let ws;
  const errors = [];
  let sequence = 0;
  const pending = new Map();
  child.on('error', (e) => errors.push(e.message));
  try {
    const active = path.join(profile, 'DevToolsActivePort');
    for (let n = 0; n < 100 && !fs.existsSync(active); n++) await delay(100);
    if (!fs.existsSync(active)) throw new Error('Edge did not start. ' + errors.join('; '));
    const debugPort = fs.readFileSync(active, 'utf8').split('\n')[0];
    const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((r, j) => {
      ws.addEventListener('open', r, { once: true });
      ws.addEventListener('error', j, { once: true });
    });
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.id) {
        const p = pending.get(data.id);
        if (p) {
          clearTimeout(p.timeout);
          pending.delete(data.id);
          data.error ? p.reject(new Error(JSON.stringify(data.error))) : p.resolve(data.result);
        }
      } else if (data.method === 'Runtime.exceptionThrown')
        errors.push(
          data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text,
        );
    });
    const command = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++sequence;
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error('CDP timeout: ' + method));
        }, 15000);
        pending.set(id, { resolve, reject, timeout });
        ws.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const r = await command('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.exceptionDetails)
        throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    };
    const click = (selector) =>
      evaluate(
        `(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing selector: '+${JSON.stringify(selector)});el.click();})()`,
      );
    const fill = (selector, value) =>
      evaluate(
        `(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw new Error('Missing field');el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));})()`,
      );
    const submit = (id) =>
      evaluate(`document.getElementById(${JSON.stringify(id)}).requestSubmit()`);
    const check = async (expression, label) => {
      assert.ok(await evaluate(expression), label);
      console.log('PASS ' + label);
    };
    const screenshot = async (name) => {
      const result = await command('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
      });
      fs.writeFileSync(path.join(output, name), Buffer.from(result.data, 'base64'));
    };
    await command('Runtime.enable');
    await command('Page.enable');
    await command('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await command('Page.navigate', { url: `http://127.0.0.1:${port}` });
    for (let n = 0; n < 60; n++) {
      if (await evaluate(`!!document.querySelector('#login-form')`)) break;
      await delay(100);
    }
    await require('./retail-v2.browser.cjs')({
      evaluate,
      command,
      click,
      fill,
      submit,
      check,
      screenshot,
    });
    assert.deepEqual(errors, [], 'No uncaught browser errors');
    console.log('PASS no uncaught browser errors');
  } finally {
    if (ws) {
      try {
        ws.send(JSON.stringify({ id: ++sequence, method: 'Browser.close' }));
      } catch {}
      ws.close();
    }
    child.kill();
    server.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
