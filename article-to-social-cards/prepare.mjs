#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import sharp from 'sharp'

const args = process.argv.slice(2)

let inputPath = '/tmp/article.md'
let outputPath = '/tmp/article-final.md'
let basePath = process.cwd()

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--base-path' && args[i + 1]) {
    basePath = args[++i]
  } else if (args[i] === '--help') {
    console.log(`
Usage: node prepare.mjs [input.md] [output.md] [options]

Options:
  --base-path <path>  Base path for resolving relative image paths (default: cwd)
  --help              Show this help

Examples:
  node prepare.mjs /tmp/article.md /tmp/article-final.md
  node prepare.mjs article.md output.md --base-path /path/to/project
`)
    process.exit(0)
  }
}

if (args[0] && !args[0].startsWith('-')) inputPath = args[0]
if (args[1] && !args[1].startsWith('-')) outputPath = args[1]

console.log(`Input: ${inputPath}`)
console.log(`Output: ${outputPath}`)
console.log(`Base path: ${basePath}`)

if (!existsSync(inputPath)) {
  console.error(`Error: Input file not found: ${inputPath}`)
  process.exit(1)
}

let content = readFileSync(inputPath, 'utf-8')

const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
const matches = [...content.matchAll(imgRegex)]

let convertedCount = 0
let skippedCount = 0
let failedCount = 0

for (const match of matches) {
  const [, , imgPath] = match

  if (imgPath.startsWith('data:')) {
    skippedCount++
    continue
  }

  const fullPath = resolve(basePath, imgPath)

  if (!existsSync(fullPath)) {
    console.error(`Warning: Image not found: ${fullPath}`)
    failedCount++
    continue
  }

  try {
    const buffer = readFileSync(fullPath)

    const compressed = await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer()

    const base64 = compressed.toString('base64')
    const dataUrl = 'data:image/webp;base64,' + base64

    content = content.replace(imgPath, dataUrl)

    const originalSize = (buffer.length / 1024).toFixed(0)
    const compressedSize = (compressed.length / 1024).toFixed(0)
    console.log(`Converted: ${imgPath}`)
    console.log(`  ${originalSize}KB -> ${compressedSize}KB (${Math.round(compressed.length / buffer.length * 100)}%)`)

    convertedCount++
  } catch (err) {
    console.error(`Error processing ${imgPath}: ${err.message}`)
    failedCount++
  }
}

writeFileSync(outputPath, content)

console.log(`\nDone!`)
console.log(`  Converted: ${convertedCount}`)
console.log(`  Skipped (already base64): ${skippedCount}`)
console.log(`  Failed: ${failedCount}`)
console.log(`\nOutput: ${outputPath}`)
