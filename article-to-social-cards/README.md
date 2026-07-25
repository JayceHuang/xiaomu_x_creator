# article-to-social-cards

> 把 Markdown 长文重写、分页并排版成 1080×1440 社媒图卡，可批量导出 PNG，适用于小红书和抖音图文。

**作者：** [@bainianAI](https://x.com/bainianAI)  
**迭代者：** [@ai_xiaomu](https://x.com/ai_xiaomu)

---

## 它解决什么问题

- 把长文改写成适合图文笔记的分页内容
- 自动生成高点击率封面结构（标题 / 权威条 / 数字卡 / 价值预告）
- 输出 1080×1440 PNG，小红书和抖音图文共用一套图

## 快速安装

### 1. 复制文件夹

把本目录复制到 Claude Code skills 目录：

```bash
cp -r article-to-social-cards ~/.claude/skills/article-to-social-cards
```

### 2. 安装依赖

```bash
cd ~/.claude/skills/article-to-social-cards
npm install
```

### 3. 开始使用

自然语言触发即可，例如：

- `生成小红书图文`
- `这篇文章发小红书`
- `做抖音图集`
- `长文转图片`

## 核心文件

| 文件 | 作用 |
|------|------|
| `SKILL.md` | skill 主说明，定义触发条件、重写规范、封面公式、导出流程 |
| `prepare.mjs` | 把 Markdown 中的本地图片压缩并转成 base64 |
| `run.js` | 根据 Markdown + cover.json 生成可导出 PNG 的 HTML |
| `package.json` | Node 依赖：`marked` / `highlight.js` / `sharp` |
| `examples/` | 真实示例：文章、封面配置、发布文案 |

## 使用流程（简版）

1. 阅读原始素材并针对图文重写
2. 按 `---page---` 分页
3. 写 `cover.json`
4. 运行 `prepare.mjs` 处理图片
5. 运行 `run.js` 生成 HTML
6. 浏览器打开后下载全部 PNG

详细规则见 `SKILL.md`。

## 版本与署名

- **版本**：1.0.0
- **作者**：@bainianAI
- **迭代者**：@ai_xiaomu
- **最后更新**：2026-07-25

本 skill 由 @bainianAI 原创，@ai_xiaomu 负责在 `xiaomu_x_creator` 中的迭代适配与工程说明维护。
