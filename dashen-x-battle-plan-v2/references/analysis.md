# 数据分析参考手册

## 标准字段映射

X后台导出的CSV，不同语言界面列名不同，统一映射为：

| 标准字段 | 英文列名 | 中文列名 |
|--------|---------|---------|
| post_text | Post text | 帖文内容 |
| impressions | Impressions | 展示次数 |
| likes | Likes | 点赞数 |
| engagements | Engagements | 互动次数 |
| bookmarks | Bookmarks | 收藏数 |
| shares | Shares / Reposts | 转发数 |
| new_follows | New follows | 新增关注 |
| replies | Replies | 回复数 |
| reposts | Reposts | 转推数 |
| date | Date | 日期 |

如果列名不匹配，打印列名让Claude手动映射。

---

## 完整分析Python代码

```python
import pandas as pd

df = pd.read_csv("/mnt/user-data/uploads/<FILENAME>")

# ── 字段名标准化 ──────────────────────────────────
# 根据实际列名调整以下映射
col_map = {
    'Post text': 'post_text',
    'Impressions': 'impressions',
    'Likes': 'likes',
    'Engagements': 'engagements',
    'Bookmarks': 'bookmarks',
    'Shares': 'shares',
    'New follows': 'new_follows',
    'Replies': 'replies',
    'Reposts': 'reposts',
    'Date': 'date',
}
df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})
df['impressions'] = pd.to_numeric(df.get('impressions', 0), errors='coerce').fillna(0)
df['new_follows'] = pd.to_numeric(df.get('new_follows', 0), errors='coerce').fillna(0)
df['engagements'] = pd.to_numeric(df.get('engagements', 0), errors='coerce').fillna(0)
df['likes'] = pd.to_numeric(df.get('likes', 0), errors='coerce').fillna(0)
df['bookmarks'] = pd.to_numeric(df.get('bookmarks', 0), errors='coerce').fillna(0)

# ── 内容分类 ──────────────────────────────────────
def classify_post(text, custom_categories=None):
    """
    custom_categories: dict of {category_name: [keywords]}
    用于覆盖默认分类，适配不同账号的主题
    """
    text = str(text).lower()
    
    # 固定分类（优先级最高）
    if text.startswith('https://t.co') or text.startswith('http'):
        return '长文/链接'
    if text.startswith('@'):
        return '回复互动'
    
    # 用户自定义分类（优先于默认）
    if custom_categories:
        for cat, keywords in custom_categories.items():
            if any(k in text for k in keywords):
                return cat
    
    # 默认分类关键词
    DEFAULT_CATEGORIES = {
        'AI/技术': ['ai','claude','gpt','llm','model','agent','mcp','skill',
                   '提示词','prompt','大模型','openai','anthropic','gemini',
                   'cursor','copilot','编程','代码','开发','数字人','自媒体工具'],
        '币圈': ['btc','eth','sol','coin','crypto','usdt','交易','做空','做多',
                '期货','合约','现货','币','链','defi','nft','加密','polymarket'],
        '搞钱/副业': ['搞钱','副业','收益','出单','结算','挣钱','赚','变现',
                    '佣金','项目','博主','带货','数字人','短剧','推广','红果',
                    '番茄','字节','免费教','平台','提现'],
        '擦边/情感': ['老婆','结婚','吃醋','nsfw','grok','生活秘书','暗示',
                    '纯情','约','情感','爱','恋爱','喜欢','心动','破防'],
        '财富/增长': ['钱','收入','躺平','年薪','月薪','涨粉','流量','粉丝',
                    '增长','变现','社群','付费'],
    }
    
    for cat, keywords in DEFAULT_CATEGORIES.items():
        if any(k in text for k in keywords):
            return cat
    
    return '泛流量/生活'

df['type'] = df['post_text'].apply(classify_post)

# ── 基础统计 ──────────────────────────────────────
total_posts = len(df)
total_imp = df['impressions'].sum()
avg_imp = df['impressions'].mean()
max_imp = df['impressions'].max()
total_follows = df['new_follows'].sum()

print(f"总帖数: {total_posts}")
print(f"总曝光: {total_imp:,.0f}")
print(f"平均曝光: {avg_imp:,.0f}")
print(f"最高单帖曝光: {max_imp:,.0f}")
print(f"总新增关注: {total_follows:,.0f}")

# ── 类型分析 ──────────────────────────────────────
type_stats = df.groupby('type').agg(
    count=('impressions','count'),
    avg_imp=('impressions','mean'),
    median_imp=('impressions','median'),
    total_imp=('impressions','sum'),
    avg_likes=('likes','mean'),
    avg_follows=('new_follows','mean'),
    avg_bookmarks=('bookmarks','mean'),
    avg_eng=('engagements','mean'),
).sort_values('avg_imp', ascending=False).round(1)
print("\n类型分析:\n", type_stats.to_string())

# ── 月度趋势 ──────────────────────────────────────
df['month'] = pd.to_datetime(df['date'], format='%a, %b %d, %Y', errors='coerce').dt.to_period('M')
monthly = df.groupby('month').agg(
    posts=('impressions','count'),
    total_imp=('impressions','sum'),
    avg_imp=('impressions','mean'),
    total_follows=('new_follows','sum'),
).dropna()
print("\n月度趋势:\n", monthly.to_string())

# ── TOP帖（涨粉） ──────────────────────────────────
top_follows = df.nlargest(10, 'new_follows')[
    ['date','post_text','impressions','new_follows','type']
]
print("\nTOP帖（涨粉）:")
for _, row in top_follows.iterrows():
    print(f"  [+{row['new_follows']:.0f}关注 | {row['impressions']:,.0f}曝光 | {row['type']}] {str(row['post_text'])[:80]}")

# ── TOP帖（曝光） ──────────────────────────────────
top_imp = df.nlargest(10, 'impressions')[
    ['date','post_text','impressions','new_follows','type','likes']
]
print("\nTOP帖（曝光）:")
for _, row in top_imp.iterrows():
    print(f"  [{row['impressions']:,.0f}曝光 | +{row['new_follows']:.0f}关注 | {row['type']}] {str(row['post_text'])[:80]}")

# ── 互动率TOP ──────────────────────────────────────
df['eng_rate'] = df['engagements'] / df['impressions'].replace(0, 1)
high_eng = df[df['impressions'] >= 200].nlargest(10, 'eng_rate')
print("\nTOP互动率（min 200曝光）:")
for _, row in high_eng.iterrows():
    print(f"  [{row['eng_rate']:.1%} | {row['impressions']:,.0f}曝光] {str(row['post_text'])[:80]}")

# ── 回复比例诊断 ──────────────────────────────────
reply_count = (df['type'] == '回复互动').sum()
reply_ratio = reply_count / total_posts
print(f"\n回复帖比例: {reply_ratio:.1%} ({reply_count}/{total_posts})")
if reply_ratio > 0.3:
    print("⚠️ 回复帖占比过高，是当前最大瓶颈")
```

---

## 内容分类定制指南

根据用户账号的主题，在调用 `classify_post` 时传入 `custom_categories`：

**示例：搞钱博主**
```python
custom_cats = {
    '搞钱/副业': ['搞钱','副业','收益','出单','结算','挣钱','赚','变现',
                '佣金','数字人','短剧','推广','红果','番茄','字节','免费教'],
    'AI/工具': ['ai','数字人','工具','claude','gpt','自媒体','算法'],
}
```

**示例：AI开发者**
```python
custom_cats = {
    'AI/技术': ['ai','claude','gpt','llm','agent','mcp','skill','prompt',
               '大模型','openai','编程','代码','开发','架构'],
    '币圈': ['btc','eth','sol','加密','交易','链','defi'],
}
```

**示例：泛流量/生活博主**
```python
# 不传custom_categories，使用默认分类
```

---

## 分析结果数据结构

分析完成后，提取以下数据用于PDF生成：

```python
analysis_result = {
    # 账号信息（用户输入）
    'nickname': '...',
    'handle': '@...',
    'bio': '...',
    'followers': 0,
    'directions': ['AI圈', '币圈', '泛流量', '擦边'],  # 用户选择
    
    # 基础数据
    'total_posts': total_posts,
    'total_imp': total_imp,
    'avg_imp': avg_imp,
    'max_imp': max_imp,
    'total_follows': total_follows,
    'reply_ratio': reply_ratio,
    
    # 类型数据（从type_stats提取）
    'type_stats': type_stats.to_dict(),
    
    # 月度数据
    'monthly': monthly.to_dict(),
    
    # TOP帖列表（取前8条）
    'top_follows_posts': [...],
    'top_imp_posts': [...],
    
    # 核心诊断
    'findings': [
        {'num': '01', 'title': '...', 'body': '...'},
        ...
    ],
}
```

---

## 最佳发帖时段分析

```python
def analyze_best_posting_times(df) -> dict:
    """
    基于真实数据分析最佳发帖时段（不是经验判断，是数据实测）
    需要Date字段包含时间信息；X导出数据如果只有日期则跳过此分析
    """
    import pandas as pd
    
    df = df.copy()
    # 尝试解析时间
    df['dt'] = pd.to_datetime(df['date'], format='%a, %b %d, %Y', errors='coerce')
    
    if df['dt'].isna().all():
        return {'available': False, 'note': 'X导出数据不含发布时间，无法做时段分析'}
    
    df['hour'] = df['dt'].dt.hour
    df['weekday'] = df['dt'].dt.dayofweek  # 0=Monday
    
    # 按小时聚合
    hourly = df.groupby('hour').agg(
        avg_imp=('impressions', 'mean'),
        count=('impressions', 'count'),
        avg_follows=('new_follows', 'mean')
    ).round(1)
    
    # 按星期聚合
    weekday_map = {0:'周一',1:'周二',2:'周三',3:'周四',4:'周五',5:'周六',6:'周日'}
    daily = df.groupby('weekday').agg(
        avg_imp=('impressions', 'mean'),
        count=('impressions', 'count')
    ).round(1)
    daily.index = daily.index.map(weekday_map)
    
    best_hours = hourly.nlargest(3, 'avg_imp').index.tolist()
    best_days = daily.nlargest(2, 'avg_imp').index.tolist()
    
    return {
        'available': True,
        'best_hours': best_hours,
        'best_days': best_days,
        'hourly_table': hourly.to_dict(),
        'daily_table': daily.to_dict(),
        'note': f"实测最佳时段：{best_hours}点，最佳日：{'、'.join(best_days)}"
    }
```

---

## 执行率计算（配合护照对比使用）

```python
def calculate_execution_rate(plan_df, plan_targets: dict) -> dict:
    """
    计算计划期间内的真实执行率
    plan_df: 计划期间内的帖子数据
    plan_targets: 护照中存储的KPI目标
    """
    total = len(plan_df)
    if total == 0:
        return {'execution_rate': 0, 'score': 'D', 'detail': '无数据'}
    
    reply_count = plan_df['post_text'].str.startswith('@').sum()
    reply_ratio = reply_count / total
    active_count = total - reply_count
    
    link_count = plan_df['post_text'].str.startswith('http').sum()
    short_count = active_count - link_count
    
    plan_days = 30
    long_target = plan_targets.get('long_articles_per_day', 1) * plan_days
    short_target = plan_targets.get('short_tweets_per_day', 15) * plan_days
    reply_target = plan_targets.get('reply_ratio_target', 0.2)
    
    long_rate = min(1.0, link_count / max(long_target, 1))
    short_rate = min(1.0, short_count / max(short_target, 1))
    reply_ok = 1.0 if reply_ratio <= reply_target else max(0, 1 - (reply_ratio - reply_target) * 2)
    
    overall = long_rate * 0.4 + short_rate * 0.4 + reply_ok * 0.2
    
    score = 'A' if overall >= 0.85 else ('B' if overall >= 0.60 else ('C' if overall >= 0.30 else 'D'))
    
    return {
        'execution_rate': round(overall, 2),
        'score': score,
        'long_rate': round(long_rate, 2),
        'short_rate': round(short_rate, 2),
        'reply_ratio': round(reply_ratio, 2),
        'reply_ok': reply_ratio <= reply_target,
        'detail': f"长文{round(long_rate*100)}% / 短推{round(short_rate*100)}% / 回复比例{'达标' if reply_ratio <= reply_target else '超标'}"
    }
```
