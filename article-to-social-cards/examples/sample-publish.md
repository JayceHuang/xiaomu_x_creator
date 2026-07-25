# 上篇发布内容

## 标题

Anthropic黑客松冠军
不手写一行代码拿下$15,000
8小时做完 配置全开源

## 正文

纽约，Anthropic官方黑客松，100多支队伍，8小时从零做产品。冠军全程没手写一行代码，靠12个预配置的Agent跑完全程，拿了$15,000。

这个大佬叫Affaan Mustafa，10个月摸出来的Claude Code配置全开源了，GitHub三周42,663个Star。

我花两天读完了整个仓库，里面的记忆管理和持续学习我照着配了，确实好用。上篇讲这套配置长什么样，下篇讲怎么动手配。

仓库地址：GitHub搜 everything-claude-code，MIT协议

## 话题

#ClaudeCode #AI编程 #Anthropic #黑客松 #开源项目 #AIAgent #编程工具 #程序员 #技术分享 #效率工具

## 评论引导

1. 仓库地址：github.com/affaan-m/everything-claude-code 直接clone就能用

2. 有人问跟Cursor的rules什么区别——思路类似，但Claude Code的Skill和Hook机制比Cursor的rules粒度更细，下篇会讲

3. 下篇会讲Skill怎么写、MCP和Skill怎么选、还有创始人Boris Cherny同时跑15个实例的方案

4. 文章里的Hook配置大概半小时能搞定，我自己配的时候踩了一个坑：Stop Hook里存的文件路径要写绝对路径，不然换目录就读不到了
