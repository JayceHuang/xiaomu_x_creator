#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { marked } from 'marked'
import hljs from 'highlight.js'
import sharp from 'sharp'

const args = process.argv.slice(2)
let markdownFile = null
let coverFile = null
let outputFile = '/tmp/article-to-social-cards-output.html'
let useStdin = false
let noMerge = false

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--markdown' && args[i + 1]) {
    markdownFile = args[++i]
  } else if (args[i] === '--cover' && args[i + 1]) {
    coverFile = args[++i]
  } else if (args[i] === '--output' && args[i + 1]) {
    outputFile = args[++i]
  } else if (args[i] === '--stdin') {
    useStdin = true
  } else if (args[i] === '--no-merge') {
    noMerge = true
  } else if (args[i] === '--help') {
    console.log(`
Usage: node run.js [options]

Options:
  --markdown <file>   Markdown 文件路径
  --cover <file>      封面配置 JSON 文件路径
  --output <file>     输出 HTML 路径（默认 /tmp/article-to-social-cards-output.html）
  --stdin             从 stdin 读 JSON 输入: {"markdown": "...", "cover": {...}}
  --no-merge          关闭短页合并，按 ---page--- 手动分页
  --help              显示帮助

Examples:
  node run.js --markdown article.md --cover cover.json --output output.html
  echo '{"markdown": "# 标题", "cover": {...}}' | node run.js --stdin
`)
    process.exit(0)
  }
}

let markdown = ''
let cover = {}

if (useStdin) {
  const input = readFileSync(0, 'utf-8')
  const data = JSON.parse(input)
  markdown = data.markdown || ''
  cover = data.cover || {}
} else {
  if (markdownFile) markdown = readFileSync(markdownFile, 'utf-8')
  if (coverFile) cover = JSON.parse(readFileSync(coverFile, 'utf-8'))
}

if (!markdown) {
  console.error('Error: 未提供 markdown 内容')
  process.exit(1)
}

async function compressBase64Image(base64Data, mimeType) {
  try {
    const buffer = Buffer.from(base64Data, 'base64')
    const compressed = await sharp(buffer).webp({ quality: 80 }).toBuffer()
    return `data:image/webp;base64,${compressed.toString('base64')}`
  } catch {
    return `data:${mimeType};base64,${base64Data}`
  }
}

async function processMarkdown(md) {
  const base64Regex = /!\[([^\]]*)\]\((data:image\/(png|jpeg|jpg|gif);base64,([^)]+))\)/g
  const matches = [...md.matchAll(base64Regex)]
  let result = md
  for (const match of matches) {
    const [, , dataUrl, mimeType, base64Data] = match
    const compressed = await compressBase64Image(base64Data, mimeType)
    result = result.replace(dataUrl, compressed)
  }
  return result
}

function estimateContentHeight(html) {
  const h1Count = (html.match(/<h1/g) || []).length
  const h2Count = (html.match(/<h2/g) || []).length
  const h3Count = (html.match(/<h3/g) || []).length
  const pCount = (html.match(/<p>/g) || []).length
  const liCount = (html.match(/<li>/g) || []).length
  const imgCount = (html.match(/<img/g) || []).length
  const preCount = (html.match(/<pre>/g) || []).length
  const blockquoteCount = (html.match(/<blockquote>/g) || []).length

  let height = 0
  height += h1Count * 120
  height += h2Count * 100
  height += h3Count * 70
  height += pCount * 60
  height += liCount * 55
  height += imgCount * 500
  height += preCount * 150
  height += blockquoteCount * 100
  return height
}

function mergeShortPages(pages, minHeight = 1000) {
  const merged = []
  let buffer = ''
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const combined = buffer ? buffer + '\n\n' + page : page
    const html = marked.parse(combined)
    const height = estimateContentHeight(html)
    if (height < minHeight && i < pages.length - 1) {
      buffer = combined
    } else {
      merged.push(combined)
      buffer = ''
    }
  }
  if (buffer) {
    if (merged.length > 0) merged[merged.length - 1] += '\n\n' + buffer
    else merged.push(buffer)
  }
  return merged
}

marked.setOptions({ async: false })
const renderer = new marked.Renderer()
renderer.code = ({ text, lang }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}
renderer.image = ({ href, title, text }) => {
  const widthMatch = text && text.match(/\{width=(\d+%?)\}/)
  let style = ''
  let alt = text || ''
  if (widthMatch) {
    const width = widthMatch[1].endsWith('%') ? widthMatch[1] : widthMatch[1] + '%'
    style = ` style="width: ${width}; height: auto;"`
    alt = alt.replace(/\{width=\d+%?\}/, '').trim()
  }
  return `<img src="${href}" alt="${alt}"${title ? ` title="${title}"` : ''}${style}>`
}
marked.use({ renderer })

async function main() {
  console.log('压缩图片中...')
  const compressedMarkdown = await processMarkdown(markdown)

  const PAGE_BREAK = '---page---'
  const rawPages = compressedMarkdown.split(PAGE_BREAK).map(p => p.trim()).filter(Boolean)

  console.log(`原始页数: ${rawPages.length}`)
  const mergedPages = noMerge ? rawPages : mergeShortPages(rawPages)
  if (!noMerge) console.log(`合并短页后: ${mergedPages.length}`)

  const pageContents = mergedPages.map(page => marked.parse(page))
  const html = generateOutputHtml(cover, pageContents)

  writeFileSync(outputFile, html)
  console.log(`\n已生成: ${outputFile}`)
  console.log(`总页数: ${pageContents.length + (cover.title ? 1 : 0)}`)
  console.log(`\n用浏览器打开,点击页面右上角下载,或顶部"下载全部 PNG"按钮一键打包`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

function generateOutputHtml(cover, pageContents) {
  const hasCover = cover.title
  const totalPages = pageContents.length + (hasCover ? 1 : 0)

  let titleHtml = cover.title || ''
  titleHtml = titleHtml.replace(/\n/g, '<br>')
  if (cover.highlightWords) {
    for (const word of cover.highlightWords) {
      titleHtml = titleHtml.replace(word, `<span class="highlight">${word}</span>`)
    }
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>小红书/抖音图文生成</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700;900&display=swap" rel="stylesheet">
  <!-- 国内网络访问不到 Google Fonts 时,会自动 fallback 到系统字体(PingFang/苹方/微软雅黑/宋体),设计依然能用 -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .page-title { font-size: 24px; margin-bottom: 8px; color: #333; }
    .subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
    .action-bar {
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .action-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .action-btn.primary { background: #c41230; color: white; }
    .action-btn.primary:hover { background: #a00f28; }
    .stat-info { color: #666; font-size: 13px; }
    .warn-banner {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px 16px;
      margin-bottom: 16px;
      color: #856404;
      font-size: 13px;
      display: none;
    }
    .warn-banner.show { display: block; }

    /* Xiaohongshu Preview - 50% scale for display */
    .xhs-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
    }
    .xhs-page-wrapper { position: relative; }
    .xhs-page-wrapper .page-num {
      text-align: center;
      margin-top: 8px;
      color: #666;
      font-size: 14px;
    }
    .xhs-page-wrapper .download-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.6);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      z-index: 10;
    }
    .xhs-page-wrapper .download-btn:hover { background: rgba(0,0,0,0.85); }
    .xhs-page-wrapper.overflow .xhs-page {
      box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
      outline: 2px solid #dc2626;
    }
    .xhs-page-wrapper.overflow .page-num::after {
      content: ' ⚠ 内容溢出,建议加 ---page---';
      color: #dc2626;
      font-weight: 700;
    }

    /* XHS Page - 1080x1440, scaled 50% */
    .xhs-page {
      width: 1080px;
      height: 1440px;
      background: #FFFFFF;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transform: scale(0.5);
      transform-origin: top left;
      margin-bottom: -720px;
      margin-right: -540px;
    }
    .xhs-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #c41230 0%, #e63946 50%, #c41230 100%);
    }

    .xhs-content {
      padding: 72px 80px;
      height: 100%;
      overflow: hidden;
    }

    .xhs-content h1 {
      font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", serif;
      font-size: 52px;
      font-weight: 900;
      color: #222;
      line-height: 1.35;
      margin-bottom: 24px;
    }
    .xhs-content h1::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, #c41230, #e85a4f);
      margin-top: 16px;
    }
    .xhs-content h2 {
      font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", serif;
      font-size: 38px;
      font-weight: 700;
      color: #222;
      margin-top: 40px;
      margin-bottom: 28px;
      line-height: 1.35;
    }
    .xhs-content h2::after {
      content: '';
      display: block;
      width: 40px;
      height: 4px;
      background: linear-gradient(90deg, #c41230, #e85a4f);
      margin-top: 12px;
    }
    .xhs-content h3 {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-top: 36px;
      margin-bottom: 18px;
      line-height: 1.4;
    }
    .xhs-content p {
      font-size: 24px;
      color: #333;
      line-height: 1.85;
      text-align: justify;
      margin-bottom: 18px;
    }
    .xhs-content strong { color: #c41230; font-weight: 700; }

    .xhs-content ul, .xhs-content ol {
      margin: 18px 0;
      padding-left: 0;
    }
    .xhs-content li {
      font-size: 24px;
      color: #333;
      line-height: 1.8;
      text-align: justify;
      margin-bottom: 14px;
      padding-left: 32px;
      position: relative;
      list-style: none;
    }
    .xhs-content ul li::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 14px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c41230, #e85a4f);
    }
    .xhs-content ol { counter-reset: list-counter; }
    .xhs-content ol li { counter-increment: list-counter; }
    .xhs-content ol li::before {
      content: counter(list-counter);
      position: absolute;
      left: 0;
      top: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c41230, #e85a4f);
      color: white;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .xhs-content pre {
      background: #2d2d2d;
      border-radius: 8px;
      padding: 28px 32px;
      margin: 28px 0;
      overflow-x: auto;
    }
    .xhs-content pre code {
      font-family: "SF Mono", Consolas, Monaco, monospace;
      font-size: 20px;
      color: #f8f8f2;
      line-height: 1.6;
      background: none;
      padding: 0;
    }
    .xhs-content code {
      font-family: "SF Mono", Consolas, Monaco, monospace;
      background: rgba(196, 18, 48, 0.08);
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 20px;
      color: #c41230;
    }

    .xhs-content blockquote {
      border-left: 4px solid #c41230;
      margin: 28px 0;
      padding: 28px 32px;
      background: rgba(196, 18, 48, 0.04);
      border-radius: 0 8px 8px 0;
    }
    .xhs-content blockquote p {
      margin: 0;
      color: #555;
      font-style: italic;
    }

    .xhs-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 28px 0;
      font-size: 20px;
    }
    .xhs-content th, .xhs-content td {
      border: 1px solid #e0e0e0;
      padding: 18px 24px;
      text-align: left;
    }
    .xhs-content th {
      background: #c41230;
      font-weight: 700;
      color: #FFFFFF;
      font-size: 18px;
    }
    .xhs-content tr:nth-child(even) { background: #FFF5F5; }

    .xhs-content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 32px auto;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .xhs-content hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, #ddd 20%, #ddd 80%, transparent);
      margin: 36px 0;
    }

    .xhs-page-number {
      position: absolute;
      bottom: 32px;
      right: 40px;
      font-size: 14px;
      color: #999;
    }

    /* Cover - 5 区域布局 */
    .xhs-cover {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      text-align: left;
      padding: 48px 0 24px 0 !important;
      gap: 0;
    }
    .xhs-cover::after { display: none; }
    .xhs-cover .cover-title-area {
      padding: 0 40px;
      margin-bottom: 36px;
    }
    .xhs-cover .main-title {
      font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", serif;
      font-size: 76px;
      font-weight: 900;
      color: #1A1A1A;
      line-height: 1.15;
      margin-bottom: 20px;
    }
    .xhs-cover .main-title .highlight { color: #c41230; }
    .xhs-cover .authority-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #F5F5F5;
      border-radius: 8px;
      padding: 14px 24px;
      margin-top: 8px;
    }
    .xhs-cover .auth-name {
      font-size: 28px;
      font-weight: 700;
      color: #1A1A1A;
      white-space: nowrap;
    }
    .xhs-cover .auth-divider { color: #CCCCCC; font-size: 22px; }
    .xhs-cover .auth-subtitle { font-size: 22px; color: #666666; }
    .xhs-cover .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
      margin: 56px 24px 24px;
    }
    .xhs-cover .stat-card {
      padding: 24px 16px;
      text-align: center;
      background: #F5F5F5;
    }
    .xhs-cover .stat-card.stat-highlight { background: #C41230; }
    .xhs-cover .stat-number {
      font-size: 64px;
      font-weight: 900;
      color: #1A1A1A;
      line-height: 1.1;
    }
    .xhs-cover .stat-highlight .stat-number { color: #FFFFFF; }
    .xhs-cover .stat-label {
      font-size: 20px;
      color: #666666;
      margin-top: 4px;
    }
    .xhs-cover .stat-highlight .stat-label { color: rgba(255, 255, 255, 0.9); }
    .xhs-cover .value-preview {
      margin: 52px 24px 24px;
      padding: 36px 40px 44px;
      background: #FEF2F2;
      border-radius: 8px;
    }
    .xhs-cover .vp-title {
      font-size: 28px;
      font-weight: 700;
      color: #C41230;
      margin-bottom: 20px;
    }
    .xhs-cover .vp-item {
      font-size: 24px;
      color: #1A1A1A;
      line-height: 2.2;
    }
    .xhs-cover .bottom-bar {
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .xhs-cover .author-info { font-size: 22px; color: #666666; }
    .xhs-cover .tags {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .xhs-cover .tag {
      padding: 8px 18px;
      border: 1.5px solid #CCCCCC;
      border-radius: 20px;
      font-size: 18px;
      color: #666666;
    }

    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      display: none;
      z-index: 999;
    }
    .toast.show { display: block; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="page-title">小红书/抖音图文 · ${totalPages} 页</h1>
    <p class="subtitle">小红书直接发,抖音图文发布选「上传图集」即可。1080×1440 标准尺寸。</p>

    <div class="action-bar">
      <button class="action-btn primary" onclick="downloadAllPng()">下载全部 PNG (ZIP)</button>
      <span class="stat-info" id="overflow-info"></span>
    </div>

    <div class="warn-banner" id="warn-banner"></div>

    <div class="xhs-preview" id="xhs-pages">
      ${hasCover ? `
      <div class="xhs-page-wrapper" data-page-id="0">
        <div class="xhs-page xhs-cover" id="xhs-page-0">
          <div class="cover-title-area">
            <h1 class="main-title">${titleHtml}</h1>
            ${cover.authorityBadge ? `
            <div class="authority-bar">
              <span class="auth-name">${cover.authorityBadge.name}</span>
              <span class="auth-divider">|</span>
              <span class="auth-subtitle">${cover.authorityBadge.subtitle}</span>
            </div>` : ''}
          </div>
          ${cover.stats && cover.stats.length > 0 ? `
          <div class="stats-grid">
            ${cover.stats.map(s => `
            <div class="stat-card${s.highlight ? ' stat-highlight' : ''}">
              <div class="stat-number">${s.number}</div>
              <div class="stat-label">${s.label}</div>
            </div>`).join('')}
          </div>` : ''}
          ${cover.valuePreview ? `
          <div class="value-preview">
            <div class="vp-title">${cover.valuePreview.title}</div>
            ${cover.valuePreview.items.map(item => `<div class="vp-item">- ${item}</div>`).join('')}
          </div>` : ''}
          <div class="bottom-bar">
            <span class="author-info">@${cover.author || ''}${cover.status ? ` | ${cover.status}` : ''}</span>
            ${cover.tags && cover.tags.length > 0 ? `
            <div class="tags">
              ${cover.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>` : ''}
          </div>
        </div>
        <div class="page-num">1 / ${totalPages}</div>
        <button class="download-btn" onclick="downloadPage(0)">下载</button>
      </div>
      ` : ''}
      ${pageContents.map((content, i) => {
        const pageNum = hasCover ? i + 2 : i + 1
        const pageId = hasCover ? i + 1 : i
        return `
      <div class="xhs-page-wrapper" data-page-id="${pageId}">
        <div class="xhs-page" id="xhs-page-${pageId}">
          <div class="xhs-content">${content}</div>
          <div class="xhs-page-number">${pageNum} / ${totalPages}</div>
        </div>
        <div class="page-num">${pageNum} / ${totalPages}</div>
        <button class="download-btn" onclick="downloadPage(${pageId})">下载</button>
      </div>`
      }).join('')}
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    // 检测每页是否溢出(用 DOM 真实测量,移植自 _archive_v1 paginator.ts)
    // .xhs-content 有 overflow:hidden 会裁切 scrollHeight,所以测量前临时改 visible
    function checkOverflow() {
      const pages = document.querySelectorAll('.xhs-page');
      let overflowCount = 0;
      const overflowPages = [];
      pages.forEach((page, i) => {
        const content = page.querySelector('.xhs-content');
        if (!content) return;
        const originalOverflow = content.style.overflow;
        content.style.overflow = 'visible';
        // content 真实高度 vs 容器高度(1440 - 72*2 = 1296px)
        const realHeight = content.scrollHeight;
        const maxHeight = content.clientHeight;
        content.style.overflow = originalOverflow;
        if (realHeight > maxHeight + 10) {
          page.parentElement.classList.add('overflow');
          overflowCount++;
          overflowPages.push(i + 1);
        }
      });
      const info = document.getElementById('overflow-info');
      const banner = document.getElementById('warn-banner');
      if (overflowCount > 0) {
        info.textContent = '检测到 ' + overflowCount + ' 页内容溢出';
        info.style.color = '#dc2626';
        banner.classList.add('show');
        banner.innerHTML = '<strong>⚠ 内容溢出</strong>:第 ' + overflowPages.join(', ') + ' 页内容超出 1440px 边界,导出的图片底部会截断。建议在 markdown 里加 <code>---page---</code> 手动分页。';
      } else {
        info.textContent = '✓ 全部页面在边界内';
        info.style.color = '#16a34a';
      }
    }

    // 等字体和图片加载完再检测
    window.addEventListener('load', () => {
      setTimeout(checkOverflow, 500);
    });

    async function renderPageToCanvas(page) {
      const originalTransform = page.style.transform;
      const originalMarginBottom = page.style.marginBottom;
      const originalMarginRight = page.style.marginRight;
      page.style.transform = 'none';
      page.style.marginBottom = '0';
      page.style.marginRight = '0';

      const canvas = await html2canvas(page, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        width: 1080,
        height: 1440
      });

      page.style.transform = originalTransform;
      page.style.marginBottom = originalMarginBottom;
      page.style.marginRight = originalMarginRight;
      return canvas;
    }

    async function downloadPage(index) {
      const page = document.getElementById('xhs-page-' + index);
      const canvas = await renderPageToCanvas(page);
      const link = document.createElement('a');
      link.download = 'page-' + String(index + 1).padStart(2, '0') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('已下载 page-' + String(index + 1).padStart(2, '0') + '.png');
    }

    async function downloadAllPng() {
      showToast('正在渲染所有页面...');
      const zip = new JSZip();
      const pages = document.querySelectorAll('.xhs-page');
      for (let i = 0; i < pages.length; i++) {
        const canvas = await renderPageToCanvas(pages[i]);
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        zip.file('page-' + String(i + 1).padStart(2, '0') + '.png', blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = 'social-cards.zip';
      link.href = URL.createObjectURL(content);
      link.click();
      showToast('已下载 social-cards.zip (' + pages.length + ' 张)');
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }
  </script>
</body>
</html>`
}
