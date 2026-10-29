#!/usr/bin/env node
/**
 * Minimal static server for examples/ — no dependencies, works offline.
 * Clean URLs: /overview → overview.html, / → overview.html
 */
const fs = require('fs')
const http = require('http')
const path = require('path')

const root = path.join(__dirname, '..', 'examples')
const port = Number(process.env.PORT) || 5173

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
}

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0])
  const file = path.normalize(path.join(root, clean === '/' ? 'overview.html' : clean))
  if (!file.startsWith(root + path.sep)) return null
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file
  if (!path.extname(file) && fs.existsSync(`${file}.html`)) return `${file}.html`
  return null
}

http
  .createServer((req, res) => {
    const file = resolve(req.url)
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('404')
      return
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    })
    fs.createReadStream(file).pipe(res)
  })
  .listen(port, () => {
    console.log(`flw examples → http://localhost:${port}/overview`)
  })
