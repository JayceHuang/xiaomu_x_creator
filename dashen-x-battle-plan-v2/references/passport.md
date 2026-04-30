# 账号护照系统 — 数据结构 & 读写逻辑

## 设计哲学

账号护照是一个用户本地保存的JSON文件，实现**无服务器的跨会话数据持久化**。
用户唯一需要做的事：每次使用skill时，把这个JSON文件和CSV一起上传。

文件命名规范：`{handle}_passport.json`（如 `dashen_wang_passport.json`）

---

## 完整数据结构

```json
{
  "version": "2.0",
  "handle": "@dashen_wang",
  "nickname": "AI最严厉的父亲",
  "bio": "技术架构 / 自动化体系...",
  "directions": ["AI圈", "币圈", "泛流量", "擦边"],
  "created_at": "2026-04-12T10:00:00",
  "last_analysis_date": "2026-04-19T10:00:00",
  "total_analyses": 3,

  "baseline": {
    "date": "2026-04-12",
    "followers": 82827,
    "avg_imp": 3990,
    "monthly_new_follows": 376,
    "reply_ratio": 0.648,
    "top_content_type": "AI/技术",
    "top_content_avg_imp": 5937,
    "viral_formula": "真实案例 + 具体数据 + 可复现路径"
  },

  "analyses": [
    {
      "id": "2026-04-12",
      "date": "2026-04-12",
      "mode": "FIRST_TIME",
      "data_period": "2026-01-12 to 2026-04-11",
      "followers_at_time": 82827,
      "stats": {
        "total_posts": 1488,
        "total_imp": 5937047,
        "avg_imp": 3990,
        "max_imp": 1898937,
        "new_follows_period": 3962,
        "reply_ratio": 0.629,
        "type_breakdown": {
          "长文/链接": {"count": 23, "avg_imp": 146611, "avg_follows": 119},
          "AI/技术": {"count": 138, "avg_imp": 5937, "avg_follows": 4.9},
          "币圈": {"count": 34, "avg_imp": 6225, "avg_follows": 2.2},
          "擦边/情感": {"count": 36, "avg_imp": 3238, "avg_follows": 0.25},
          "泛流量/生活": {"count": 288, "avg_imp": 2912, "avg_follows": 1.2},
          "回复互动": {"count": 936, "avg_imp": 519, "avg_follows": 0.07}
        },
        "top_viral_posts": [
          {"text_preview": "长文链接（AI变现·社群策略）", "imp": 1898937, "follows": 1560},
          {"text_preview": "40岁零编程朋友用AI上线了产品", "imp": 194658, "follows": 242}
        ],
        "best_month": {"month": "2026-03", "avg_imp": 7652, "new_follows": 3235}
      },
      "plan": {
        "start_date": "2026-04-12",
        "end_date": "2026-05-11",
        "kpi_targets": {
          "new_followers_30d": 3000,
          "avg_daily_imp": 100000,
          "long_articles_per_day": 1,
          "short_tweets_per_day": 15,
          "reply_ratio_target": 0.2
        },
        "daily_ratio": {
          "AI圈": 0.30,
          "币圈": 0.22,
          "泛流量": 0.30,
          "擦边": 0.18
        },
        "top3_article_topics": [
          "Claude Agent实战：一个Skill顶十个员工",
          "BTC突破前，链上数据已经说话了",
          "35岁的焦虑，是被设计出来的"
        ]
      },
      "self_reported_execution": null,
      "execution_score": null
    }
  ],

  "execution_history": [],

  "viral_patterns": {
    "confirmed_formulas": [
      {
        "formula": "真实案例 + 具体数据 + 可复现路径",
        "first_seen": "2026-04-12",
        "examples_count": 4,
        "avg_imp": 245000,
        "still_working": true
      }
    ],
    "fatigue_signals": [],
    "emerging_patterns": []
  },

  "growth_milestones": [
    {"date": "2026-04-12", "followers": 82827, "note": "首次分析基准"}
  ],

  "notes": []
}
```

---

## 护照读取逻辑

```python
import json
from datetime import datetime

def load_passport(filepath: str) -> dict:
    """读取并验证护照文件"""
    with open(filepath) as f:
        passport = json.load(f)
    
    # 版本兼容
    if passport.get('version') != '2.0':
        passport = migrate_passport(passport)
    
    return passport

def get_last_plan(passport: dict) -> dict:
    """获取最近一次的作战计划"""
    analyses = passport.get('analyses', [])
    if not analyses:
        return None
    last = sorted(analyses, key=lambda x: x['date'])[-1]
    return last.get('plan')

def get_last_stats(passport: dict) -> dict:
    """获取上期数据统计"""
    analyses = passport.get('analyses', [])
    if not analyses:
        return None
    return sorted(analyses, key=lambda x: x['date'])[-1].get('stats')
```

---

## 执行复盘对比逻辑

```python
def compare_execution(passport: dict, current_df, user_self_report: str) -> dict:
    """
    对比本期实际数据与上期作战计划，计算执行率和达成率
    
    返回：
    - execution_score: A/B/C/D
    - execution_rate: 0-1
    - kpi_achievements: {指标: {target, actual, rate}}
    - surprises: 意外表现（超出或低于预期20%以上的）
    - new_viral_posts: 本期新爆款
    """
    last_plan = get_last_plan(passport)
    if not last_plan:
        return None
    
    targets = last_plan.get('kpi_targets', {})
    plan_start = last_plan.get('start_date')
    plan_end = last_plan.get('end_date')
    
    import pandas as pd
    # 筛选计划期间的数据
    df = current_df.copy()
    df['date_parsed'] = pd.to_datetime(df['date'], format='%a, %b %d, %Y', errors='coerce')
    plan_df = df[
        (df['date_parsed'] >= plan_start) &
        (df['date_parsed'] <= plan_end)
    ] if plan_start else df
    
    if len(plan_df) == 0:
        plan_df = df  # 如果日期筛选为空，用全量数据
    
    # ── 执行率计算 ──
    total_posts = len(plan_df)
    reply_posts = (plan_df['post_text'].str.startswith('@')).sum()
    active_posts = total_posts - reply_posts
    reply_ratio_actual = reply_posts / total_posts if total_posts > 0 else 0
    
    plan_days = 30  # 默认计划30天
    long_article_count = (plan_df['post_text'].str.startswith('http')).sum()
    short_tweet_count = active_posts - long_article_count
    
    long_exec_rate = min(1.0, long_article_count / (plan_days * targets.get('long_articles_per_day', 1)))
    short_exec_rate = min(1.0, short_tweet_count / (plan_days * targets.get('short_tweets_per_day', 15)))
    reply_ok = 1.0 if reply_ratio_actual <= targets.get('reply_ratio_target', 0.2) else 0.0
    
    execution_rate = long_exec_rate * 0.4 + short_exec_rate * 0.4 + reply_ok * 0.2
    
    if execution_rate >= 0.85:
        score = 'A'
    elif execution_rate >= 0.60:
        score = 'B'
    elif execution_rate >= 0.30:
        score = 'C'
    else:
        score = 'D'
    
    # ── KPI达成率 ──
    actual_avg_imp = plan_df['impressions'].mean()
    actual_new_follows = plan_df['new_follows'].sum()
    
    kpi_achievements = {
        'avg_imp': {
            'target': targets.get('avg_daily_imp', 0),
            'actual': round(actual_avg_imp, 0),
            'rate': round(actual_avg_imp / targets.get('avg_daily_imp', 1), 2)
        },
        'new_follows': {
            'target': targets.get('new_followers_30d', 0),
            'actual': int(actual_new_follows),
            'rate': round(actual_new_follows / targets.get('new_followers_30d', 1), 2)
        },
        'reply_ratio': {
            'target': targets.get('reply_ratio_target', 0.2),
            'actual': round(reply_ratio_actual, 2),
            'achieved': reply_ratio_actual <= targets.get('reply_ratio_target', 0.2)
        }
    }
    
    # ── 新爆款（本期曝光 > 历史TOP10最低值）──
    hist_threshold = 5000  # 默认阈值，可从历史数据动态计算
    new_viral = plan_df[plan_df['impressions'] > hist_threshold].nlargest(3, 'impressions')
    
    return {
        'execution_rate': round(execution_rate, 2),
        'execution_score': score,
        'long_exec_rate': round(long_exec_rate, 2),
        'short_exec_rate': round(short_exec_rate, 2),
        'reply_ratio_actual': round(reply_ratio_actual, 2),
        'reply_ratio_ok': bool(reply_ok),
        'kpi_achievements': kpi_achievements,
        'new_viral_posts': new_viral[['post_text','impressions','new_follows']].to_dict('records'),
    }
```

---

## 护照更新逻辑

```python
def update_passport(passport: dict, current_analysis: dict, new_plan: dict,
                    execution_result: dict = None) -> dict:
    """每次生成报告后调用，写入本次分析快照"""
    from datetime import datetime
    
    now = datetime.now().isoformat()
    
    # 更新基础信息
    passport['last_analysis_date'] = now
    passport['total_analyses'] = passport.get('total_analyses', 0) + 1
    
    # 构建本次分析记录
    analysis_record = {
        'id': now[:10],
        'date': now[:10],
        'mode': current_analysis.get('mode'),
        'data_period': current_analysis.get('data_period'),
        'followers_at_time': current_analysis.get('followers'),
        'stats': current_analysis.get('stats'),
        'plan': new_plan,
        'self_reported_execution': current_analysis.get('self_reported_execution'),
        'execution_score': execution_result.get('execution_score') if execution_result else None,
    }
    
    passport.setdefault('analyses', []).append(analysis_record)
    
    # 更新成长里程碑
    current_followers = current_analysis.get('followers')
    if current_followers:
        last_milestone = passport.get('growth_milestones', [{}])[-1]
        if abs(current_followers - last_milestone.get('followers', 0)) > 1000:
            passport.setdefault('growth_milestones', []).append({
                'date': now[:10],
                'followers': current_followers,
                'note': f"第{passport['total_analyses']}次分析"
            })
    
    # 更新爆款规律（如果有新爆款且符合历史模式，标记verified）
    if execution_result and execution_result.get('new_viral_posts'):
        passport.setdefault('viral_patterns', {}).setdefault('confirmed_formulas', [])
    
    return passport

def save_passport(passport: dict, output_path: str):
    """写入护照文件"""
    import json
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(passport, f, ensure_ascii=False, indent=2)
    print(f"护照已更新: {output_path}")
```

---

## 季度复盘专用：历史趋势提取

```python
def extract_growth_trend(passport: dict) -> dict:
    """提取账号的完整增长曲线数据，用于季度复盘PDF"""
    analyses = sorted(passport.get('analyses', []), key=lambda x: x['date'])
    
    trend = {
        'dates': [],
        'followers': [],
        'avg_imp': [],
        'reply_ratios': [],
        'execution_scores': [],
        'top_content_types': [],
    }
    
    for a in analyses:
        trend['dates'].append(a['date'])
        trend['followers'].append(a.get('followers_at_time', 0))
        stats = a.get('stats', {})
        trend['avg_imp'].append(stats.get('avg_imp', 0))
        trend['reply_ratios'].append(stats.get('reply_ratio', 0))
        trend['execution_scores'].append(a.get('execution_score', 'N/A'))
        
        # 最高曝光的内容类型
        type_breakdown = stats.get('type_breakdown', {})
        if type_breakdown:
            best_type = max(type_breakdown, key=lambda t: type_breakdown[t].get('avg_imp', 0)
                          if t not in ['回复互动'] else 0)
            trend['top_content_types'].append(best_type)
    
    # 计算增长加速度（每期均值的环比变化）
    if len(trend['avg_imp']) >= 2:
        trend['imp_growth_rates'] = [
            round((trend['avg_imp'][i] - trend['avg_imp'][i-1]) / max(trend['avg_imp'][i-1], 1), 2)
            for i in range(1, len(trend['avg_imp']))
        ]
    
    return trend
```

---

## 内容疲劳检测

```python
def detect_content_fatigue(passport: dict) -> list:
    """
    检测哪些内容类型出现了边际递减效应
    返回：需要警惕的内容类型列表
    """
    analyses = sorted(passport.get('analyses', []), key=lambda x: x['date'])
    if len(analyses) < 2:
        return []
    
    fatigue_alerts = []
    
    # 比较每种内容类型在各期的avg_imp
    all_types = set()
    for a in analyses:
        all_types.update(a.get('stats', {}).get('type_breakdown', {}).keys())
    
    for content_type in all_types:
        if content_type in ['回复互动']:
            continue
        
        imp_history = []
        for a in analyses:
            breakdown = a.get('stats', {}).get('type_breakdown', {})
            if content_type in breakdown:
                imp_history.append(breakdown[content_type].get('avg_imp', 0))
        
        if len(imp_history) >= 3:
            # 连续下降超过20%则标记疲劳
            declining = all(
                imp_history[i] < imp_history[i-1] * 0.8
                for i in range(1, len(imp_history))
            )
            if declining:
                fatigue_alerts.append({
                    'type': content_type,
                    'trend': imp_history,
                    'decline_rate': round(1 - imp_history[-1] / imp_history[0], 2)
                })
    
    return fatigue_alerts
```
