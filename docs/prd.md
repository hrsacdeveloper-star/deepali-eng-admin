# 需求文档

## 1. 应用概述

### 1.1 应用名称
Deepali Engineering 管理后台（Admin Panel）

### 1.2 应用描述
为 Deepali Engineering 工程公司网站提供完整的内容和数据管理能力的Web管理后台系统，支持多角色权限管理，涵盖内容管理、营销提交、聊天机器人、用户管理、系统设置等核心模块。

---

## 2. 用户与使用场景

### 2.1 目标用户

- **Super Admin**：拥有全部模块访问权限，包括用户管理和系统设置
- **Content Admin**：管理页面/博客/产品/FAQ/下载/画廊，无法访问用户管理和系统设置
- **Support Admin**：查看和回复联系/RFQ/招聘申请，产品和页面只读
- **SEO Admin**：管理SEO元数据、robots.txt/sitemap设置、重定向

### 2.2 核心使用场景

- 管理员登录后台，管理网站内容（产品、博客、画廊、下载等）
- 查看和处理用户提交的询盘、RFQ、招聘申请
- 配置聊天机器人知识库和上传PDF文档
- 管理后台用户及其角色权限
- 配置网站基础信息、SEO元数据、导航菜单

---

## 3. 页面结构与功能说明

### 3.1 页面结构

```
管理后台
├── 登录页面
├── 仪表盘（Dashboard）
├── 内容管理（Content Management）
│   ├── 首页管理
│   ├── About Us页面管理
│   ├── 产品管理
│   ├── 行业管理
│   ├── 基础设施管理
│   ├── 质量管理
│   ├── Tool Room管理
│   ├── 画廊与客户
│   ├── 博客/文章/新闻
│   ├── 下载管理
│   ├── 招聘管理
│   ├── FAQ管理
│   └── 合作伙伴
├── 聊天机器人管理（Chatbot Management）
│   ├── Knowledge Base
│   └── PDF Documents
├── 营销与提交（Marketing & Submissions）
│   ├── Contact Enquiries
│   ├── Request for Quote (RFQ)
│   ├── Newsletter Subscribers
│   └── Testimonials
├── 用户管理（User Management）
│   ├── Admin Users
│   ├── Website Users/Profiles
│   └── Roles & Permissions
└── 设置（Settings）
    ├── Site Settings
    ├── Social Media Links
    ├── Footer Content
    ├── SEO Meta
    └── Menu/Navigation Manager
```

### 3.2 登录页面

- 管理员输入邮箱和密码登录
- 支持邮箱密码重置功能
- 登录成功后跳转至仪表盘

### 3.3 仪表盘（Dashboard）

#### 3.3.1 统计卡片

- 展示产品总数、今日询盘/未读数量、博客总数、订阅者总数

#### 3.3.2 最新询盘列表

- 展示最新的联系询盘记录

#### 3.3.3 最新博客列表

- 展示最新发布的博客文章

#### 3.3.4 快速操作按钮

- 提供「添加产品」「添加博客」「查看RFQ」快捷入口

### 3.4 内容管理（Content Management）

#### 3.4.1 首页管理

**Hero Slides/Banners**

- 管理首页轮播图/横幅
- 字段：标题、副标题、描述、背景图片/视频、按钮文字+链接、显示顺序、启用/禁用
- 支持创建、编辑、删除、排序

**Stats/Counter区块**

- 管理首页统计数字区块
- 字段：标签、数值、图标、显示顺序
- 支持创建、编辑、删除、排序

**About/Welcome区块**

- 管理首页关于/欢迎区块
- 字段：标题、描述、图片、CTA按钮
- 支持查看和编辑

**Featured Sections**

- 管理首页精选内容
- 支持多选精选产品、合作伙伴、博客

#### 3.4.2 About Us页面管理

**Company Story/Overview**

- 字段：页面标题、描述、侧边图片（2张）、亮点列表
- 支持编辑

**Vision & Mission**

- 字段：愿景标题+内容、使命标题+内容
- 支持编辑

**Core Values**

- 字段：标题、描述、图标、顺序
- 支持创建、编辑、删除、排序

**Leadership Team**

- 字段：姓名、职位、简介、图片、顺序、启用/禁用
- 支持创建、编辑、删除、排序、启用/禁用切换

#### 3.4.3 产品管理

**Product Categories**

- 字段：分类名、Slug、描述、图片、父分类、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

**Products**

- 字段：产品名、Slug、分类、短描述、全描述、规格、多图、行业标签、PDF目录、启用、精选
- 支持创建、编辑、删除、批量启用/禁用、复制

#### 3.4.4 行业管理（Industries We Serve）

- 字段：行业名、Slug、描述、图片、相关产品（多选）、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

#### 3.4.5 基础设施管理（Infrastructure）

**Facilities**

- 字段：设施名、描述、图片、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

**Machines**

- 字段：机器名、类型/分类、规格、图片、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

#### 3.4.6 质量管理（Quality）

**Certifications**

- 字段：标题、证书图片/PDF、颁发机构、有效期、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

**Quality Standards**

- 字段：标准名、描述、图标、顺序
- 支持创建、编辑、删除、排序

**Testing Procedures**

- 字段：程序名、描述、图片/视频、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

#### 3.4.7 Tool Room管理

**Tool Room Machines**

- 字段：机器名、描述、规格、图片、顺序
- 支持创建、编辑、删除、排序

**Tool Room Facilities**

- 字段：设施名、描述、图片、顺序
- 支持创建、编辑、删除、排序

**Tool Room Team**

- 字段：姓名、职位、简介、图片、顺序
- 支持创建、编辑、删除、排序

#### 3.4.8 画廊与客户（Gallery & Clients）

**Gallery Images**

- 字段：标题、图片、分类/标签、顺序、启用
- 支持创建、编辑、删除、批量上传、排序、启用/禁用切换

**Client Logos**

- 字段：客户名、Logo、网站链接、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

#### 3.4.9 博客/文章/新闻（Blog/Articles/News）

- 字段：标题、Slug、作者、精选图片、摘要、正文（富文本编辑器）、分类、标签、发布日期、SEO标题/描述、发布/草稿状态
- 支持创建、编辑、删除、发布前预览

#### 3.4.10 下载管理（Downloads）

**Download Categories**

- 字段：分类名、顺序
- 支持创建、编辑、删除、排序

**Download Files**

- 字段：标题、文件（PDF/DOC等）、分类、描述、下载次数（只读）、顺序
- 支持创建、编辑、删除、排序

#### 3.4.11 招聘管理（Careers）

**Job Openings**

- 字段：职位名、部门、地点、工作类型、工作经验、薪资范围、描述、职责、要求、截止日期、启用
- 支持创建、编辑、删除、启用/禁用切换

**Job Applicants**

- 字段：申请人姓名、邮箱/电话、申请职位、简历/CV、申请日期、状态（新建/已审/入围/拒绝）
- 支持查看、更新状态、下载简历、删除
- 只读模式，不支持创建

#### 3.4.12 FAQ管理

- 字段：问题、答案、分类、顺序、启用
- 支持创建、编辑、删除、拖拽排序、启用/禁用切换

#### 3.4.13 合作伙伴（Partners/Global Partners）

- 字段：合作伙伴名、Logo、网站URL、合作类型（国内/全球）、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

### 3.5 聊天机器人管理（Chatbot Management）

#### 3.5.1 Knowledge Base

- 字段：问题、答案、分类、关键词（逗号分隔）
- 支持创建、编辑、删除、搜索过滤
- 管理路由：`/admin/chatbot-knowledge`

#### 3.5.2 PDF Documents

- 字段：标题、PDF文件、提取文本（只读）、上传日期
- 支持上传PDF（最大20MB）、查看、删除
- 上传后自动提取文本并存储至数据库
- 管理路由：`/admin/chatbot-documents`

### 3.6 营销与提交（Marketing & Submissions）

#### 3.6.1 Contact Enquiries

- 字段：姓名、邮箱/电话、主题、消息、日期、状态（新/已回/已关闭）
- 支持查看、更新状态、回复、删除
- 只读模式，不支持创建

#### 3.6.2 Request for Quote (RFQ)

- 字段：公司名、联系人、邮箱/电话、产品兴趣、数量、需求、状态
- 支持查看、更新状态、回复、删除
- 只读模式，不支持创建

#### 3.6.3 Newsletter Subscribers

- 字段：邮箱、订阅日期
- 支持查看、导出CSV、删除

#### 3.6.4 Testimonials

- 字段：客户名、公司、职位、引言、评分、图片/Logo、顺序、启用
- 支持创建、编辑、删除、排序、启用/禁用切换

### 3.7 用户管理（User Management）

#### 3.7.1 Admin Users

- 字段：姓名、邮箱、角色、密码/重置密码、状态
- 支持创建、编辑、删除、分配角色

#### 3.7.2 Website Users/Profiles

- 字段：姓名、邮箱、电话、职位、公司、注册日期
- 支持查看、编辑、停用、删除

#### 3.7.3 Roles & Permissions

- 字段：角色名、按模块的权限复选框
- 支持创建、编辑、删除
- 权限模块包括：仪表盘、内容管理、聊天机器人管理、营销与提交、用户管理、设置

### 3.8 设置（Settings）

#### 3.8.1 Site Settings

- 字段：公司名、Logo、Favicon、地址、电话、邮箱、简介、工作时间
- 支持编辑

#### 3.8.2 Social Media Links

- 字段：平台、URL、顺序
- 支持创建、编辑、删除、排序

#### 3.8.3 Footer Content

- 字段：版权文字、页脚列/链接、联系信息
- 支持编辑

#### 3.8.4 SEO Meta

- 字段：页面/路由名、meta标题、meta描述、meta关键词、OG图片
- 支持创建、编辑、删除

#### 3.8.5 Menu/Navigation Manager

- 字段：菜单标签、URL/slug、父菜单、顺序、新标签页打开
- 支持创建、编辑、删除、拖拽排序

---

## 4. 业务规则与逻辑

### 4.1 用户认证与授权

- 所有管理路由需要登录认证
- 基于角色的访问控制（RBAC）：
  - Super Admin：访问所有模块
  - Content Admin：访问内容管理模块，无法访问用户管理和系统设置
  - Support Admin：访问营销与提交模块，产品和页面只读
  - SEO Admin：访问SEO Meta、Menu/Navigation Manager

### 4.2 数据存储

- 后端使用Supabase（PostgreSQL + Auth + Storage + Edge Functions）
- 数据库表包括：
  - 已有表：site_settings, hero_slides, products, product_categories, industries, machines, gallery, clients, certificates, team, partners/global_partners, articles/blogs, downloads, careers, faqs, testimonials, form_submissions, profiles, seo_meta, chatbot_knowledge, chatbot_documents, newsletter_subscribers
  - 新增表：stats_counters, about_page, core_values, facilities, quality_standards, testing_procedures, tool_room_machines, tool_room_facilities, tool_room_team, download_categories, admin_users, roles_permissions, social_media_links, footer_content, nav_menu_items, blog_categories, job_applications

### 4.3 聊天机器人逻辑

- 使用PostgreSQL Full Text Search（tsvector/tsquery）实现离线AI聊天机器人
- 搜索流程：
  1. 清理用户输入，构建OR-based tsquery
  2. 搜索chatbot_knowledge表
  3. 若无匹配，搜索chatbot_documents表
  4. 若仍无匹配但问题包含公司相关关键词，返回通用公司概述
  5. 完全无关问题返回：「Sorry, I couldn't find information related to your question.」
- 调用方式：`supabase.rpc('search_chatbot', { query_text: '...' })`

### 4.4 文件上传

- 图片上传至Supabase Storage，支持预览和验证
- PDF上传至Supabase Storage，使用pdfjs-dist在浏览器端提取文本
- 上传图片自动优化

### 4.5 审计日志

- 记录谁创建/更新/删除了记录

---

## 5. 异常与边界情况

| 场景 | 处理方式 |
|------|----------|
| 用户未登录访问管理路由 | 跳转至登录页面 |
| 用户角色无权限访问某模块 | 显示403禁止访问提示 |
| 删除操作 | 弹出确认对话框 |
| 表单验证失败 | 显示错误提示信息 |
| 文件上传超过大小限制 | 显示错误提示（PDF最大20MB） |
| 网络请求失败 | 显示错误toast通知 |
| 操作成功 | 显示成功toast通知 |
| 聊天机器人无匹配结果 | 返回默认回复或通用公司概述 |
| PDF文本提取失败 | 显示错误提示 |

---

## 6. 验收标准

1. Super Admin登录后台，访问仪表盘查看统计数据
2. 进入产品管理模块，创建新产品并上传多张图片
3. 进入聊天机器人管理，添加新的Q&A记录并上传PDF文档
4. 进入营销与提交模块，查看最新的Contact Enquiries并更新状态为「已回」
5. 进入用户管理模块，创建新的Content Admin用户并分配角色
6. 进入设置模块，编辑Site Settings中的公司信息
7. 退出登录，使用Content Admin账号登录，验证无法访问用户管理和系统设置模块

---

## 7. 本期不实现功能

- 前端网站（仅实现管理后台）
- 移动端App版本管理后台
- 实时通知推送
- 数据导入/导出（除Newsletter Subscribers的CSV导出）
- 多语言版本管理后台
- 高级数据分析与报表
- 第三方集成（除Supabase外）
- 自动化工作流
- 版本控制与内容回滚
- 批量编辑（除批量启用/禁用、批量删除外）