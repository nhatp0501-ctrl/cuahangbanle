'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../..'),
  out = path.join(root, 'bao-cao', 'phien-ban-3');
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function browserSession(work) {
  const server = require(path.join(root, 'server.js')).createServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'retailflow-report-v3-'));
  const child = spawn(
    process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { windowsHide: true, stdio: 'ignore' },
  );
  const requests = new Map(),
    errors = [];
  let ws,
    seq = 0;
  try {
    const active = path.join(profile, 'DevToolsActivePort');
    for (let n = 0; n < 100 && !fs.existsSync(active); n++) await pause(100);
    if (!fs.existsSync(active)) throw Error('Edge không khởi động được.');
    const port = fs.readFileSync(active, 'utf8').split('\n')[0],
      targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((r, j) => {
      ws.addEventListener('open', r, { once: true });
      ws.addEventListener('error', j, { once: true });
    });
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.id) {
        const p = requests.get(data.id);
        if (p) {
          clearTimeout(p.timer);
          requests.delete(data.id);
          data.error ? p.reject(Error(JSON.stringify(data.error))) : p.resolve(data.result);
        }
      } else if (data.method === 'Runtime.exceptionThrown')
        errors.push(
          data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text,
        );
    });
    const command = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++seq,
          timer = setTimeout(() => {
            requests.delete(id);
            reject(Error('CDP timeout: ' + method));
          }, 90000);
        requests.set(id, { resolve, reject, timer });
        ws.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const r = await command('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.exceptionDetails)
        throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    };
    await command('Runtime.enable');
    await command('Page.enable');
    await work({
      command,
      evaluate,
      pause,
      errors,
      url: `http://127.0.0.1:${server.address().port}`,
      root,
      out,
    });
    if (errors.length) throw Error(errors.join('\n'));
  } finally {
    if (ws) {
      try {
        ws.send(JSON.stringify({ id: ++seq, method: 'Browser.close' }));
      } catch {}
      ws.close();
    }
    for (const p of requests.values()) clearTimeout(p.timer);
    child.kill();
    server.close();
  }
}
module.exports = { browserSession, root, out, pause };
