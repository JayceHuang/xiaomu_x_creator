# xiaomu_x_creator

## 目录总览

| 路径 | 类型 | 作用 |
|------|------|------|
| `getname/` | skill | 长文标题与封面配文生成器，给文章产出多平台标题方案。 |
| `xiaomu_x_creator-main/` | skill | X/Twitter 运营主 skill，负责排期、短推改写、素材萃取。 |
| `dashen-x-battle-plan-v2/` | skill | X 账号内容作战计划 skill，用 CSV 数据生成 Markdown 作战计划报告。 |
| `x-article-in-obsidian/` | Obsidian 插件 | 把当前 Markdown 文章预览成 X Article 风格，并辅助发布到 X Article 编辑器。 |
| [X Viral Monitor](https://chromewebstore.google.com/detail/x-viral-monitor/dkplofpecmjmbhgjgleeflcnfgfkdfpd) | Chrome 插件 | 在 X 页面监控推文热度、速度、排行榜，并支持复制为 Markdown。 |
| `多平台封面图生成器.html` | 独立工具 | 本地封面图生成器，输出 X / 抖音横竖版封面 PNG。 |
| `README.md` | 说明文档 | 当前这个总说明。 |
| `.git/` | Git 元数据 | 版本管理目录。 |
| `.DS_Store` | 系统文件 | macOS 自动生成，可忽略。 |

---

## 1. `getname/`

这是一个 **标题生成 skill**，内部名字叫 `snail`。

### 文件作用

| 文件 | 作用 |
|------|------|
| `getname/SKILL.md` | skill 主说明，定义标题生成的方法论、流程、输出格式。 |
| `getname/skill.yaml` | skill 元信息，定义名称、描述、触发词、标签。 |
| `getname/README.md` | 该 skill 自己的补充说明。 |

### 它解决什么问题

- 读完一篇长文后，生成适配不同平台的标题和封面配文。
- 支持微信、X、LinkedIn、小红书等平台。
- 方法上融合“爆款标题模板”与“认知/哲学框架”两套体系。
- 增加平台约束校准和最终自检，避免标题承诺与正文错位。

---

## 2. `xiaomu_x_creator-main/`

这是整个目录里最像“主系统”的 **X/Twitter 运营 skill**。

### 文件作用

| 文件 | 作用 |
|------|------|
| `xiaomu_x_creator-main/SKILL.md` | skill 总入口，定义路由：`init`、排期、短推改写。 |
| `xiaomu_x_creator-main/README.md` | 这个 skill 自己的使用说明。 |
| `xiaomu_x_creator-main/modules/scheduler.md` | 排期模块，负责从素材库与对标账号中生成一周/多天发文排期。 |
| `xiaomu_x_creator-main/modules/distiller.md` | 萃取模块，负责把文章、笔记、观点改写成短推。 |
| `xiaomu_x_creator-main/templates/config.example.yaml` | 初始化时生成 `config.yaml` 的示例模板。 |
| `xiaomu_x_creator-main/templates/voice.example.md` | 写作风格 DNA 模板。 |
| `xiaomu_x_creator-main/templates/benchmarks.example.md` | 对标博主清单模板。 |

### 它解决什么问题

- 初始化一个 X 内容运营工作区。
- 管理素材来源、写作风格、对标账号、输出目录。
- 生成排期文件。
- 把长文、笔记、聊天内容萃取成可发的短推。
- 用 `used-index.md` 记录已使用选题与素材，降低重复排期。

### 你可以把它理解成

这是“运营主 skill”，其余一些工具更像它的配套能力。

---

## 3. `dashen-x-battle-plan-v2/`

这是一个 **X 账号分析与作战计划 skill**，侧重点不是写推文，而是做数据分析、策略规划和复盘报告。

### 文件作用

| 文件 | 作用 |
|------|------|
| `dashen-x-battle-plan-v2/SKILL.md` | skill 主说明，定义首次分析、7 天复盘、季度复盘三种模式，并要求最终输出 Markdown。 |
| `dashen-x-battle-plan-v2/references/analysis.md` | 数据分析逻辑说明，负责解析 CSV、做指标计算与复盘对比。 |
| `dashen-x-battle-plan-v2/references/markdown_generator.md` | Markdown 报告生成规范，定义章节结构、表格格式、文件命名和交付方式。 |
| `dashen-x-battle-plan-v2/references/passport.md` | “账号护照”JSON 的结构与读写逻辑。 |
| `dashen-x-battle-plan-v2/assets/logo.svg` | dashen.wang 品牌 Logo，当前 Markdown 流程默认不依赖。 |
| `dashen-x-battle-plan-v2/assets/logo_embed.py` | Logo 转 base64 的辅助脚本，仅在后续需要 HTML/PDF 展示时复用。 |

### 它解决什么问题

- 读取 X 导出的 CSV 数据。
- 生成内容分析、30 天计划、7 天执行复盘、季度升级报告。
- 最终交付 `{handle}_作战计划_{日期}.md`。
- 同时输出 `{handle}_passport.json`，方便跨会话追踪和下次复盘。
- 不再生成 PDF、HTML 或中间渲染文件。

---

## 4. `x-article-in-obsidian/`

这是一个 **Obsidian 插件**，不是 skill。

### 文件作用

| 文件 | 作用 |
|------|------|
| `x-article-in-obsidian/manifest.json` | Obsidian 插件清单，定义插件名、版本、最低兼容版本和描述。 |
| `x-article-in-obsidian/main.js` | 插件主逻辑。核心功能是把当前 Markdown 渲染成 X Article 风格，并生成发布脚本/粘贴内容。 |
| `x-article-in-obsidian/styles.css` | 插件样式，控制侧边栏和文章预览外观。 |

### 它解决什么问题

- 在 Obsidian 里预览“X 长文”效果。
- 支持同步滚动、富媒体嵌入。
- 从代码内容看，还包含把内容写入 X Article 编辑器的辅助脚本能力。

---

## 5. X Viral Monitor

这是一个 **Chrome 浏览器插件**，用于监控 X 上推文热度。本地插件目录已删除，改为使用 Chrome Web Store 版本：

https://chromewebstore.google.com/detail/x-viral-monitor/dkplofpecmjmbhgjgleeflcnfgfkdfpd

### 它解决什么问题

- 给 X 页面上的推文打“热度/爆款”标签。
- 按浏览速度做排行榜。
- 复制推文为 Markdown。
- 显示接口速率限制信息，便于监控抓取状态。

---

## 6. `多平台封面图生成器.html`

这是一个 **独立 HTML 工具**，直接浏览器打开即可。

### 它解决什么问题

- 生成适配不同平台尺寸的封面图。
- 支持 X 横版、抖音竖版、抖音横版切换。
- 支持标题高亮、背景水印字、字体、纹理、配色、安全区预览。
- 最终导出 PNG。

### 代码特征

- 纯前端单文件工具。
- 依赖 `html-to-image` 将页面节点导出成图片。

---

## 7. 这些文件之间的关系

- `xiaomu_x_creator-main/` 是“运营主 skill”，偏执行。
- `getname/` 是“标题配套 skill”，偏包装。
- `dashen-x-battle-plan-v2/` 是“分析复盘 skill”，偏策略。
- `x-article-in-obsidian/` 是写长文和发布 X Article 的编辑器插件。
- [X Viral Monitor](https://chromewebstore.google.com/detail/x-viral-monitor/dkplofpecmjmbhgjgleeflcnfgfkdfpd) 是看别人/看平台热度的监控插件。
- `多平台封面图生成器.html` 是视觉物料制作工具。

合起来看，这个目录更像一套围绕 **X 内容创作、分发、监控、复盘** 的工具箱。

---

## 8. 补充说明

- `x-article-in-obsidian` 是本地 Obsidian 插件；X Viral Monitor 改为使用 Chrome Web Store 版本。它们都不是 skill。
- `getname`、`xiaomu_x_creator-main`、`dashen-x-battle-plan-v2` 都是 skill。
