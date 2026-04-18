# dujiao-next-user 前端

Vue 3 + Vite 电商用户端。

## 技术栈

- Vue 3 + TypeScript
- Vue Router 4
- Pinia 状态管理
- vue-i18n 多语言
- @unhead/vue SEO 管理
- Tailwind CSS

## 目录结构

```
src/
  composables/      # 可复用逻辑
  components/       # 公共组件
  views/            # 页面视图
    auth/           # 认证页面
    personal/       # 个人中心子面板
  stores/           # Pinia 状态
  router/           # 路由配置
  i18n/             # 多语言资源
  api/              # 接口封装
  utils/            # 工具函数
```

## 多语言与路由

### URL 结构

所有页面路由带短码前缀，3 种语言对应：

| URL 短码 | 内部 locale | 语言 |
|---------|------------|------|
| `/cn`   | `zh-CN`    | 简体中文 |
| `/hk`   | `zh-TW`    | 繁體中文 |
| `/en`   | `en-US`    | English |

示例：`/cn/products/xxx`、`/hk/products/xxx`、`/en/products/xxx`

根路径 `/` 自动重定向到用户上次选择的语言（localStorage `locale`）。

### 核心文件

- `src/composables/useLocalizedRouter.ts` — URL slug ↔ 内部 locale 双向映射，以及 `useLocalizedRouter()` hook
- `src/router/index.ts` — 路由配置，`/:locale(cn|hk|en)` 嵌套路由，beforeEach 同步 locale
- `src/stores/app.ts` — locale 状态，hreflang 标签（响应式）

### 导航规范

**所有路由跳转必须通过 `useLocalizedRouter` 提供的方法**，不得直接用裸路径：

```typescript
// ✅ 正确
import { useLocalizedRouter, addLocalePrefix } from '../composables/useLocalizedRouter'
const { push, replace, switchLocale } = useLocalizedRouter()
push('/products')           // 自动加当前语言前缀
addLocalePrefix('/me', appStore.locale)  // 在 template 中用于 router-link

// ❌ 错误
router.push('/products')    // 不带语言前缀
```

### 语言切换

Navbar.vue 调用 `switchLocale(langCode)`，会切换 URL slug 并保持当前路径。

### hreflang SEO

`app.ts` 的 `useHead` 响应式生成所有语言的 `<link rel="alternate" hreflang="...">` 标签，在每次路由变化后（`router.afterEach` → `applySEO()`）自动更新。

## 编码约定

- 新增页面路由：在 `src/router/index.ts` 的 `pageRoutes` 数组中添加（不含 locale 前缀）
- 错误状态：空对象/数组而非 null
- 认证：统一 Cookie，禁止 localStorage 存 token（注意：locale 偏好使用 localStorage）
