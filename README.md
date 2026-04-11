# Twitter Ops — AI 驱动的推特内容系统

> A Claude Code skill that turns your notes and ideas into publish-ready tweets.

一个 [Claude Code](https://claude.ai/code) skill，把你的笔记、文章、收藏素材萃取成可直接发布的推特短推。

**Author:** [@ai_xiaomu](https://x.com/ai_xiaomu)

---

## Features

- **排期发布** — 从素材库批量生成一周推文排期，按时段分配内容类型
- **短推萃取** — 指定一段内容，AI 提取核心观点，用 3 种人性视角写成变体
- **风格 DNA** — 用 `voice.md` 统一控制语气、格式、禁忌，所有产出风格一致
- **对标监测** — 采集对标博主爆款，拆结构改写（需配合 agent-reach）
- **查重** — 自动避开近期已发选题和角度
- **人在回路** — 每个选题、每条草稿都停下来等你确认，不会擅自拍板

## How It Works

```
你的笔记 / 文章 / 收藏
        ↓
   AI 提取核心观点
        ↓
   你选定哪些要写
        ↓
   每个选题 × 3 个人性视角变体
        ↓
   Markdown 文件 → 复制粘贴到 X
```

## Installation

1. 把本目录复制到你的 Claude Code skills 目录：

```bash
cp -r xiaomu-x-creator ~/.claude/skills/xiaomu-x-creator
```

2. 在 Claude Code 中说 `xiaomu-x-creator init` 或 `初始化推特运营`，按提示完成配置。

Init 会自动创建工作目录：

```
~/xiaomu-x-creator/          ← 默认路径，可自定义
├── config.yaml         # 核心配置
├── voice.md            # 写作风格 DNA
├── benchmarks.md       # 对标博主清单
├── sources/            # 你的素材
│   ├── notes/
│   ├── articles/
│   └── clippings/
├── schedule/           # 排期产出
├── tweets/             # 短推产出
└── competitors/        # 对标爆款存档
```

## Usage

| 说什么 | 做什么 |
|--------|--------|
| `排推文` / `排下一期推文` | 批量生成一周排期 |
| `写短推 {内容}` / 直接贴内容 + `写成推文` | 单条萃取，直接出短推 |
| 发一个推特用户名 | 添加到对标博主清单 |

## Skill Structure

```
xiaomu-x-creator/
├── SKILL.md                      # Skill 入口定义
├── modules/
│   ├── scheduler.md              # 排期模块
│   └── distiller.md              # 萃取/改写模块
├── templates/
│   ├── config.example.yaml       # 配置模板
│   ├── voice.example.md          # 写作风格模板
│   └── benchmarks.example.md     # 对标博主模板
└── README.md
```

## Dependencies

| Tool | What for | Required? |
|------|----------|-----------|
| [agent-reach](https://github.com/Panniantong/Agent-Reach) | 抓取对标博主爆款、查重已发推文 | Recommended（不装也能用，手动贴内容） |
| last30days | 热点话题调研 | Optional（不装跳过热点） |

## Configuration

- **排期参数**（周期、条数、时段）→ `config.yaml` → `scheduling`
- **写作风格**（语气、禁忌、格式）→ `voice.md`
- **对标博主** → `benchmarks.md`
- **内容配比**（原创 50% / 热点 25% / 改写 25%）→ `config.yaml` → `content_mix`

## Notes

- 所有产出是 Markdown 文件，不会自动发布
- 排期和改写过程中会停下来等你确认
- 所有路径从 config.yaml 读取，不硬编码

---

**Follow:** [@ai_xiaomu](https://x.com/ai_xiaomu) — AI, startups, personal growth.
