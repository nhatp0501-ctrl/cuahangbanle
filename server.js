'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
function createServer() {
  return http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }
    const target = path.resolve(__dirname, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (
      !target.startsWith(__dirname + path.sep) ||
      !['.html', '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico'].includes(
        path.extname(target),
      )
    ) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
    };
    fs.readFile(target, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(target)],
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(data);
    });
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  const server = createServer();
  server.listen(port, '127.0.0.1', () =>
    console.log(`RetailFlow: http://127.0.0.1:${port}\nNhan Ctrl+C de dung.`),
  );
  server.on('error', (err) => {
    console.error(
      err.code === 'EADDRINUSE'
        ? `Cong ${port} dang duoc su dung. Hay dong server cu hoac doi PORT.`
        : err.message,
    );
    process.exit(1);
  });
}
module.exports = { createServer };
