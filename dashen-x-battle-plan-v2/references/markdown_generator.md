# Markdown报告生成参考手册

## 输出目标

最终只生成 `.md` 格式的内容作战计划报告，不生成 PDF、HTML 或中间渲染文件。

报告文件命名规范：

```text
{handle}_作战计划_{日期}.md
```

示例：

```text
dashen_wang_作战计划_2026-06-04.md
```

如果 handle 中包含 `@`，文件名中去掉 `@`。如果包含空格或特殊符号，替换为 `_`。

---

## 品牌标识规范

所有 Markdown 报告必须保留 **dashen.wang / AI最严厉的父亲** 品牌，但不要依赖图片、HTML、CSS 或 PDF 页脚。

### 标题区固定格式

每份报告开头使用以下结构：

```markdown
# {nickname} X内容作战计划

> by AI最严厉的父亲 · dashen.wang  
> 账号：{handle}  
> 生成日期：{date}  
> 分析模式：{mode_label}
```

### 末尾固定品牌声明

每份报告最后追加：

```markdown
---

本报告由 **AI最严厉的父亲 · dashen.wang** 内容作战系统生成。  
数据驱动创作，不靠玄学碰运气。
```

---

## Markdown格式规则

1. 只输出标准 Markdown。
2. 不使用 HTML 标签。
3. 不使用图片、CSS、分页、脚注页码。
4. 数据对比统一用 Markdown 表格。
5. 执行清单统一用 `- [ ]` 任务列表。
6. TOP 推文、短推模板、创作日历用清晰小节输出，方便用户复制到 Obsidian、飞书、Notion 或 GitHub。
7. 数字必须带单位或解释，例如 `12.4万曝光`、`3.2%关注转化率`。
8. 不要输出“以下是Markdown内容”这类包裹性废话，直接生成报告正文。

---

## 通用报告骨架

```markdown
# {nickname} X内容作战计划

> by AI最严厉的父亲 · dashen.wang  
> 账号：{handle}  
> 生成日期：{date}  
> 分析模式：{mode_label}

## 0. 核心结论

{3-5条最重要结论}

## 1. KPI总览

| 指标 | 数值 | 判断 |
|------|------|------|
| 当前粉丝 | {followers} | {judge} |
| 分析帖子数 | {total_posts} | {judge} |
| 总曝光 | {total_imp} | {judge} |
| 平均曝光 | {avg_imp} | {judge} |
| 最高曝光 | {max_imp} | {judge} |
| 回复占比 | {reply_ratio} | {judge} |

## 2. 数据分析

...

## 3. 内容战略

...

## 4. 执行计划

...

## 5. 检查清单

- [ ] ...

---

本报告由 **AI最严厉的父亲 · dashen.wang** 内容作战系统生成。  
数据驱动创作，不靠玄学碰运气。
```

---

## 首次分析报告结构

首次分析输出 7 章：

1. 标题区 + 核心结论
2. KPI总览
3. 数据分析报告
4. 流量战略
5. 每日内容框架
6. 30天创作日历
7. 短推模板库 + KPI目标 + 执行清单

### 必须包含的小节

```markdown
## 0. 核心结论

1. **{最强内容类型}是当前账号命根子**：均值{avg}曝光，明显高于其他内容。
2. **{最大问题}正在限制增长**：{具体证据}。
3. **可复制爆款公式**：{formula}。

## 1. KPI总览

| 指标 | 数值 | 判断 |
|------|------|------|
| 当前粉丝 | {followers} | {judge} |
| 分析帖子数 | {total_posts} | {judge} |
| 总曝光 | {total_imp} | {judge} |
| 平均曝光 | {avg_imp} | {judge} |
| 新增关注 | {total_follows} | {judge} |
| 回复占比 | {reply_ratio} | {judge} |

## 2. 内容类型分析

| 内容类型 | 数量 | 平均曝光 | 平均关注 | 结论 |
|----------|------|----------|----------|------|
| {type} | {count} | {avg_imp} | {avg_follows} | {conclusion} |

## 3. TOP爆款拆解

### TOP 1：{short_title}

- 曝光：{imp}
- 新增关注：{follows}
- 内容摘要：{text_preview}
- 爆点判断：{why}
- 可复用动作：{action}

## 4. 流量战略

### 板块一：{stream_name}

- 定位：{positioning}
- 目标读者：{audience}
- 内容比例：{ratio}
- 选题方向：
  - {topic_1}
  - {topic_2}
  - {topic_3}

## 5. 每日内容框架

| 时间 | 内容类型 | 目标 | 示例 |
|------|----------|------|------|
| 08:00 | {type} | {goal} | {example} |

## 6. 30天创作日历

| 日期 | 长文题目 | 短推方向 | 当天目标 |
|------|----------|----------|----------|
| Day 1 | {article_topic} | {tweet_mix} | {goal} |

## 7. 短推模板库

### {category}模板

1. {template}
2. {template}
3. {template}

## 8. 30天KPI与执行清单

| KPI | 目标 |
|-----|------|
| 新增粉丝 | {target} |
| 日均曝光 | {target} |
| 每日长文 | {target} |
| 每日短推 | {target} |
| 回复占比 | {target} |

- [ ] 每天发布{n}条短推
- [ ] 每天发布{n}篇长文或长帖
- [ ] 每周复盘TOP 5内容
- [ ] 控制回复占比低于{target}
```

---

## 7天执行复盘报告结构

7天复盘输出 9 章：

1. 标题区 + 本期核心判断
2. 执行纪律评分
3. KPI达成率
4. 本期爆款复盘
5. 数据趋势对比
6. 计划偏差分析
7. 微调后的流量战略
8. 接下来7天聚焦计划
9. 修正后的短推模板 + 下期KPI

### 必须包含的小节

```markdown
## 0. 本期核心判断

执行纪律评分：**{score}**

{一句客观评语}

## 1. KPI达成率

| KPI | 上期目标 | 本期实际 | 达成率 | 判断 |
|-----|----------|----------|--------|------|
| 新增粉丝 | {target} | {actual} | {rate} | {judge} |

## 2. 执行拆解

| 项目 | 计划 | 实际 | 执行率 |
|------|------|------|--------|
| 长文 | {planned} | {actual} | {rate} |
| 短推 | {planned} | {actual} | {rate} |
| 回复占比 | <= {target} | {actual} | {rate} |

## 3. 本期新爆款

### {short_title}

- 曝光：{imp}
- 新增关注：{follows}
- 和上期预测的关系：{matched_or_not}
- 下一步复用方式：{action}

## 4. 接下来7天聚焦计划

| 日期 | 重点动作 | 内容方向 | 检查标准 |
|------|----------|----------|----------|
| Day 1 | {action} | {direction} | {metric} |

## 5. 下期KPI

| KPI | 目标 |
|-----|------|
| 新增粉丝 | {target} |
| 平均曝光 | {target} |
| 回复占比 | {target} |
```

---

## 季度深度复盘报告结构

季度复盘输出 11 章：

1. 标题区 + 三个月增长总结
2. 账号成长轨迹
3. 执行纪律历史
4. KPI达成历史
5. 爆款规律进化
6. 内容疲劳检测
7. 最佳发帖时段
8. 下一季度流量战略
9. 下一季度30天创作日历
10. 升级版短推模板库
11. 季度KPI目标

### 必须包含的小节

```markdown
## 0. 三个月增长总结

账号阶段：**{stage}**

{growth_summary}

## 1. 账号成长轨迹

| 日期 | 粉丝 | 平均曝光 | 新增关注 | 核心变化 |
|------|------|----------|----------|----------|
| {date} | {followers} | {avg_imp} | {follows} | {note} |

## 2. 爆款规律进化

| 阶段 | 有效公式 | 代表内容 | 是否仍有效 |
|------|----------|----------|------------|
| {period} | {formula} | {example} | {yes_no} |

## 3. 内容疲劳检测

| 内容类型 | 早期表现 | 当前表现 | 判断 | 动作 |
|----------|----------|----------|------|------|
| {type} | {old} | {current} | {judge} | {action} |

## 4. 下一季度战略

### 主攻方向：{direction}

- 为什么现在做：{reason}
- 目标读者：{audience}
- 内容比例：{ratio}
- 预期结果：{expected}

## 5. 季度KPI

| KPI | 目标 | 检查周期 |
|-----|------|----------|
| {kpi} | {target} | {period} |
```

---

## Markdown生成代码参考

可以用 Python 直接拼接 Markdown 字符串并写入文件。

```python
from datetime import date
import re

def safe_filename_handle(handle: str) -> str:
    handle = handle.replace('@', '').strip()
    return re.sub(r'[^0-9A-Za-z_\-\u4e00-\u9fff]+', '_', handle).strip('_')

def fmt_num(value):
    if value is None:
        return '-'
    try:
        value = float(value)
    except (TypeError, ValueError):
        return str(value)
    if value >= 10000:
        return f'{value / 10000:.1f}万'
    return str(int(value))

def write_markdown_report(markdown: str, handle: str, output_dir: str) -> str:
    filename = f"{safe_filename_handle(handle)}_作战计划_{date.today().isoformat()}.md"
    path = f"{output_dir.rstrip('/')}/{filename}"
    with open(path, 'w', encoding='utf-8') as f:
        f.write(markdown.rstrip() + '\n')
    return path
```

---

## 内容生成策略

1. 先从 `analysis_result` 生成核心数据表。
2. 再根据模式选择 FIRST_TIME、WEEKLY、QUARTERLY 的章节模板。
3. 所有结论必须引用数据证据，不写空泛判断。
4. 所有计划必须能执行，避免“提升影响力”“打造人设”这类不可检查表达。
5. Markdown 报告生成完毕后，同时生成或更新护照 JSON。

---

## 护照JSON文件生成

Markdown报告生成完毕后，同时生成更新后的护照JSON：

```python
def save_passport(passport: dict, output_dir: str, handle: str) -> str:
    import json
    filename = f"{safe_filename_handle(handle)}_passport.json"
    path = f"{output_dir.rstrip('/')}/{filename}"
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(passport, f, ensure_ascii=False, indent=2)
    return path
```

交付时同时呈现 Markdown 报告和护照 JSON：

```python
# present_files([markdown_path, passport_path])
```
