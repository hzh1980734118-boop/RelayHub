# RelayHub — AI 模型中转站

参考 [Higgsfield AI](https://higgsfield.ai/) 和 [Higgsfield Cloud](https://cloud.higgsfield.ai/dashboard) 风格开发的 AI 模型中转平台前端展示。

## 技术栈

- Vue 3 + Vite
- Element Plus
- Vue Router

## 页面

| 路由 | 说明 |
|------|------|
| `/` | 首页 — Hero、功能卡片、模型展示 |
| `/studio` | 创作工作台 — 模型选择与生成 |
| `/models` | 模型列表 |
| `/pricing` | 定价方案 |
| `/docs` | API 文档 |
| `/login` | 邮箱登录 |
| `/register` | 邮箱注册 |
| `/forgot-password` | 忘记密码 |

## 启动

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

> 本项目仅包含前端 UI 展示，无后端功能实现。
