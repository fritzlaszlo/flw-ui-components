#!/usr/bin/env node
/**
 * Concatenate flw source CSS into dist/flw.css and copy flw.js + fonts.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const distDir = path.join(root, 'dist')
const srcDir = path.join(root, 'src')
const fontsDir = path.join(root, 'fonts')

const cssFiles = [
  'fonts.css',
  'tokens.css',
  'base.css',
  'utilities.css',
  'typography.css',
  'layout.css',
  'components/box.css',
  'components/button.css',
  'components/form.css',
  'components/slider.css',
  'components/range.css',
  'components/progress.css',
  'components/status.css',
  'components/spinner.css',
  'components/sep.css',
  'components/marquee.css',
  'components/accordion.css',
  'components/tabs.css'
]

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(from, to)
    else fs.copyFileSync(from, to)
  }
}

if (!fs.existsSync(fontsDir) || !fs.existsSync(path.join(srcDir, 'fonts.css'))) {
  console.error('Missing fonts. Run: npm run fetch-fonts')
  process.exit(1)
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

const { version } = require(path.join(root, 'package.json'))
const banner = `/* flw v${version} — personal DIY terminal CSS library */\n`
const css = cssFiles
  .map((file) => {
    const fullPath = path.join(srcDir, file)
    return `/* ── ${file} ── */\n${fs.readFileSync(fullPath, 'utf8').trim()}\n`
  })
  .join('\n')

const cssOut = path.join(distDir, 'flw.css')
const jsOut = path.join(distDir, 'flw.js')

fs.writeFileSync(cssOut, banner + css)
fs.copyFileSync(path.join(root, 'js', 'flw.js'), jsOut)
copyDir(fontsDir, path.join(distDir, 'fonts'))

const examplesDist = path.join(root, 'examples', 'dist')
fs.mkdirSync(examplesDist, { recursive: true })
fs.copyFileSync(cssOut, path.join(examplesDist, 'flw.css'))
fs.copyFileSync(jsOut, path.join(examplesDist, 'flw.js'))
copyDir(fontsDir, path.join(examplesDist, 'fonts'))

console.log('Built dist/flw.css, dist/flw.js, dist/fonts/, and examples/dist/*')
