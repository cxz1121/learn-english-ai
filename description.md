# English Learning Platform - 技术栈分析

---

## 项目结构概览

```
english/
├── apps/
│   ├── web/          # Vue 3 前端主应用
│   └── tracker/      # 前端埋点 SDK
├── packages/
│   ├── common/       # 共享类型定义
│   └── config/       # 共享配置
└── server/           # NestJS 后端服务
    ├── apps/
    │   ├── ai/       # AI 服务模块
    │   └── server/   # 主业务服务
    └── libs/
        └── shared/   # 后端共享库
```

---

## 1. 前端主应用 (`apps/web`)

### 框架
- **Vue 3.4** - 渐进式 JavaScript 框架
- **Vue Router 4.3** - 路由管理
- **Pinia 2.1** - 状态管理
- **Vite 5.2** - 构建工具

### UI 组件库
- **Element Plus 2.14** - Vue 3 组件库
- **Tailwind CSS 4.3** - CSS 框架

### 第三方库
- **Three.js 0.184** - 3D 图形渲染
- **GSAP 3.15** - 动画库
- **axios 1.16** - HTTP 客户端
- **socket.io-client 4.8** - WebSocket 客户端
- **marked 18.0** - Markdown 解析
- **@microsoft/fetch-event-source** - SSE 支持

### 开发工具
- **TypeScript 5.4** - 类型安全
- **vue-tsc** - Vue 类型检查
- **npm-run-all2** - 并行脚本执行

---

## 2. 埋点 SDK (`apps/tracker`)

### 核心功能
- **PV/UV 统计**
- **性能监控**
- **错误追踪**
- **事件上报**

### 依赖库
- **@fingerprintjs/fingerprintjs 5.2** - 设备指纹
- **ua-parser-js 2.0** - User-Agent 解析
- **web-vitals 5.3** - 性能指标

### 构建工具
- **Vite 8.0**
- **vite-plugin-dts** - TypeScript 类型声明生成

---

## 3. 后端服务 (`server`)

### 框架
- **NestJS 11.0** - Node.js 企业级框架
- **Express** - HTTP 服务器
- **Socket.IO 4.8** - WebSocket 支持

### 数据库
- **PostgreSQL** - 关系型数据库
- **Prisma 7.8** - ORM

### AI 能力
- **LangChain 1.4** - LLM 应用框架
- **@langchain/deepseek** - DeepSeek 模型集成
- **@langchain/langgraph-checkpoint-postgres** - 状态持久化

### 队列系统
- **BullMQ 5.78** - Redis 队列
- **@nestjs/bullmq** - NestJS 集成

### 文件存储
- **MinIO** - 对象存储

### 支付集成
- **alipay-sdk 4.14** - 支付宝 SDK

### 邮件服务
- **Nodemailer** - 邮件发送

### 认证授权
- **JWT** - JSON Web Token

### 开发工具
- **TypeScript 5.7**
- **Jest** - 测试框架
- **ESLint** - 代码规范
- **Prettier** - 代码格式化

---

## 4. 共享包

### `packages/common`
- 跨项目类型定义
- 通用工具函数

### `packages/config`
- 环境变量配置
- 全局配置项

---

## 技术栈总结

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue | 3.4.x |
| 后端框架 | NestJS | 11.0.x |
| 数据库 | PostgreSQL + Prisma | 7.8.x |
| 构建工具 | Vite | 5.x/8.x |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 4.3.x |
| UI组件 | Element Plus | 2.14.x |
| 状态管理 | Pinia | 2.1.x |
| 路由 | Vue Router | 4.3.x |
| AI | LangChain + DeepSeek | 1.4.x |
| 队列 | BullMQ | 5.78.x |
| 存储 | MinIO | 8.x |
| 3D渲染 | Three.js | 0.184.x |
