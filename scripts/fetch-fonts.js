#!/usr/bin/env node
/**
 * Download Space Mono + Noto Emoji (SIL OFL) for offline use.
 * Source: Google Fonts / fonts.google.com
 */
const fs = require('fs')
const path = require('path')
const https = require('https')

const root = path.join(__dirname, '..')
const fontsDir = path.join(root, 'fonts')
const cssUrl =
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Emoji&display=swap'
const ua =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': ua } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location).then(resolve, reject)
          return
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })
}

function slugFromUrl(url) {
  const file = url.split('/').pop().split('?')[0]
  return file.replace(/[^a-zA-Z0-9._-]+/g, '-')
}

async function main() {
  fs.mkdirSync(fontsDir, { recursive: true })

  const cssText = (await get(cssUrl)).toString('utf8')
  const blocks = cssText.split('@font-face').slice(1)
  const urlToFile = new Map()
  const faceRules = []

  for (const block of blocks) {
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1]
    const weight = block.match(/font-weight:\s*(\d+)/)?.[1] || '400'
    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1]
    const urls = [...block.matchAll(/url\((https:[^)]+)\)\s*format\('woff2'\)/g)].map((m) => m[1])

    for (const url of urls) {
      if (!urlToFile.has(url)) {
        const filename = slugFromUrl(url)
        urlToFile.set(url, filename)
        process.stdout.write(`fetch ${filename}\n`)
        const data = await get(url)
        fs.writeFileSync(path.join(fontsDir, filename), data)
      }
    }

    const src = urls
      .map((url) => `url('fonts/${urlToFile.get(url)}') format('woff2')`)
      .join(',\n    ')

    faceRules.push(`@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: ${src};${range ? `\n  unicode-range: ${range};` : ''}
}`)
  }

  const license = `# Bundled fonts

- **Space Mono** — Copyright Colophon Foundry. [SIL Open Font License 1.1](https://scripts.sil.org/OFL)
- **Noto Emoji** — Copyright Google. [SIL Open Font License 1.1](https://scripts.sil.org/OFL)
- **flw Glyphs** (`flw-glyphs-*.woff2`) — subsets of DejaVu Sans Mono / DejaVu Sans. Bitstream Vera Fonts copyright, DejaVu changes in the public domain. [DejaVu license](https://dejavu-fonts.github.io/License.html)

Fetched via \`npm run fetch-fonts\` from fonts.google.com (glyph subsets: \`scripts/fetch-glyphs.py\`) for offline / air-gapped use.
`

  fs.writeFileSync(path.join(fontsDir, 'LICENSE.md'), license)
  fs.writeFileSync(path.join(root, 'src', 'fonts.css'), faceRules.join('\n\n') + '\n')

  console.log(`Saved ${urlToFile.size} font files and src/fonts.css`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
