---
name: xiaomu-x-creator
description: |
  推特运营工具 — 排期发布 + 短推改写，两个核心功能。
  首次使用先运行 init 初始化工作目录。
  触发词：推特运营、排推文、写短推、改写短推、推特排期、xiaomu-x-creator。
  init触发词：xiaomu-x-creator init、初始化推特运营。
---

# Twitter Ops — 推特运营工具

两个核心功能：排期发布（批量生产一周内容）+ 短推改写（指定内容直接出推文）。

---

## 前置：读取配置

**每次触发本 skill，第一步都是读取配置文件。**

```
读取 {workspace}/config.yaml
  → 解析所有路径、参数、账号信息
  → 如果 config.yaml 不存在 → 提示用户先运行 init
```

`{workspace}` = config.yaml 中 `workspace` 字段的值。所有后续路径都基于此。

---

## 路由

| 用户说了什么 | 进入 |
|-------------|------|
| "xiaomu-x-creator init" / "初始化推特运营" | → **Init 流程** |
| "排下一期推文" / "推特排期" / "排推文" / "进入推特运营" | → **排期模块**（读 modules/scheduler.md） |
| "写短推" / "改写短推" / "帮我写条推" / "这个写成推文" / 直接贴内容+"写成短推" | → **改写模块**（读 modules/distiller.md） |
| 发一个推特用户名/链接 | → 更新 benchmarks.md |

**两个功能的区别：**
- **排期** = 批量生产。给一堆素材（sources/ + 对标账号），产出一周的排期文件
- **改写** = 单条生产。用户指定具体内容，直接写出短推

---

## Init 流程（首次使用）

**目标：** 创建工作目录、生成配置文件、引导用户填写基本信息。

### Step 0: 环境检查

在做任何事之前，先检查运行环境。

**检查 agent-reach skill：**
```
检查 ~/.claude/skills/agent-reach/SKILL.md 是否存在
```

- **存在** → 输出 `✅ agent-reach 已安装` → 继续
- **不存在** → 输出以下提示，等用户确认后再继续：

```
⚠️ 检测到 agent-reach 未安装。

agent-reach 是一个让 AI 能抓取推特数据的工具（对标博主爆款采集、查重都靠它）。
不装也能用本 skill，但需要手动复制粘贴爆款内容，体验差很多。

安装方式：
  GitHub: https://github.com/Panniantong/Agent-Reach
  按仓库 README 安装即可（一条命令，零配置可用 8 个平台）

装好了说「继续」，或者说「跳过」先不装。
```

用户说跳过 → 继续，后续涉及 agent-reach 的步骤自动降级为手动模式。

**检查 last30days skill（可选）：**
```
检查 ~/.claude/skills/last30days/ 是否存在
```
- 存在 → 静默标记可用
- 不存在 → 不提示（这是可选依赖，排期时跳过热点调研即可）

---

### Step 1: 确认工作目录

询问用户：
```
你想把推特运营的文件放在哪里？
默认：~/xiaomu-x-creator/
```

创建目录结构：
```
{workspace}/
├── config.yaml          ← 核心配置
├── voice.md             ← 写作风格DNA
├── benchmarks.md        ← 对标博主清单
├── sources/             ← 内容来源
│   ├── notes/           ← 随手记的想法、读书笔记、聊天记录
│   ├── articles/        ← 自己写的文章/长文
│   └── clippings/       ← 收藏的别人的内容
├── schedule/            ← 排期文件
├── tweets/              ← 萃取产出的短推
├── competitors/         ← 对标博主爆款原文
└── README.md            ← 使用说明
```

### Step 2: 交互式问答 → 生成 config.yaml

**逐个问，不要一次性甩一堆问题。** 每个问题等用户回答后再问下一个。

```
Q1: 你的推特ID是什么？（比如 @YourName）
Q2: 你的内容方向是什么？简单说几个关键词就行（比如：AI、创业、个人成长）
Q3: 你想多久排一次推文？（默认：2周一轮）
Q4: 每天发几条？（默认：4条）
Q5: 每天什么时间发？（默认：08:00 / 12:00 / 17:00 / 21:00，直接回车用默认）
Q6: 你有想对标的推特博主吗？给几个ID就行，没有也行后面再加
```

用回答生成 `config.yaml`，参考 templates/config.example.yaml。

### Step 3: 生成 voice.md

从 templates/voice.example.md 复制一份到 `{workspace}/voice.md`。

告诉用户：
```
已生成 voice.md，里面是一套默认的推特写作风格规则。
你可以直接用，也可以打开改成你自己的风格。
重点改这几个地方：
- 语言风格（锋利/温和/幽默？）
- 禁止出现的表达
- 你喜欢的开头方式
```

### Step 4: 生成 benchmarks.md

如果 Q6 用户给了对标博主ID：
- 用 agent-reach 抓取每个博主的基本信息（简介、粉丝数、近期高赞推文3条）
- 填入 benchmarks.md

如果没给：生成空模板，告诉用户后面随时加。

### Step 5: 引导放内容

```
最后一步：往 sources/ 里放你的内容素材。

sources/notes/    ← 你平时的想法、读书笔记、聊天记录，txt/md都行
sources/articles/ ← 你写过的文章、长文
sources/clippings/ ← 你收藏的好内容

格式不限，扔进去就行。有内容了就可以开始萃取推文了。
没内容也没关系，先从对标博主的爆款开始改写也行。
```

### Step 6: 生成 README.md

写一份使用说明到 `{workspace}/README.md`，包含：
- 目录结构说明
- 常用命令（排推文 / 写短推 / 加对标博主）
- 配置修改方法

### Init 完成

```
搞定！你的推特运营系统已初始化。

两个核心功能：
  "排推文"       → 从素材+对标账号，生成一周排期
  "写短推 {内容}" → 指定内容，直接出短推

随时可以改 config.yaml 调参数，改 voice.md 调风格。
```

---

## 模块加载

skill 被触发后，根据路由结果加载对应模块：

- **排期**: 读取 `modules/scheduler.md`，按其中流程执行
- **改写**: 读取 `modules/distiller.md`，按其中流程执行

模块中所有 `{workspace}` 占位符替换为 config.yaml 中的实际路径。

---

## 配置文件约定

### config.yaml 结构

```yaml
# 工作目录（所有相对路径的基准）
workspace: ~/xiaomu-x-creator

# 账号信息
twitter_id: "@YourName"
content_direction: ["AI", "创业"]  # 内容方向关键词

# 内容来源路径（相对于 workspace）
sources:
  notes: sources/notes/
  articles: sources/articles/
  clippings: sources/clippings/

# 产出路径
output:
  tweets: tweets/
  schedule: schedule/
  competitors: competitors/

# 排期参数
scheduling:
  cycle_days: 14           # 排期周期（天）
  posts_per_day: 4         # 每天几条
  time_slots:              # 发布时间 → 内容类型
    "08:00": "干货/方法论"
    "12:00": "行业观点"
    "17:00": "大众话题"
    "21:00": "深度走心"

# 内容配比（百分比，合计100）
content_mix:
  original: 50      # 知识库萃取 / 原创
  trending: 25      # 泛内容 / 热点
  rewrite: 25       # 对标爆款改写

# 查重
dedup:
  window_days: 14
  scope: ["选题", "角度"]
```

### voice.md

用户的写作风格DNA。模块中引用 `voice.md` 时读取此文件。

### benchmarks.md

对标博主清单。格式见 templates/benchmarks.example.md。

---

## 依赖

| 工具 | 用在哪 | 必须装吗 |
|------|--------|---------|
| agent-reach | 抓取对标博主爆款、查重（检查近期已发推文） | 推荐装，不装也能用（手动贴内容） |
| last30days | 热点调研（泛内容选题） | 可选，不装就跳过热点 |

---

## 注意事项

- 所有路径从 config.yaml 读取，不硬编码
- voice.md 是写作风格的唯一来源，模块中不内置风格规则
- 用户是审批者：选题、改写判断节点都停下来问用户确认
- 不自动发布：产出是 MD 文件，用户自己复制粘贴到 X
