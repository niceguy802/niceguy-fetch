# niceguy-fetch
vue+js+fetch 请求封装组件

Vue3 plugin that provides:
- axios instance with HttpOnly cookie support (`withCredentials: true`)
- automatic refresh-on-401 (calls `/auth/refresh`)
- inactivity monitor (default 30 minutes) that forces logout
- router guard helper for protected routes
- SSO-friendly (backend must set cookie domain: `.example.com`)

# 安装依赖
```bash
npm install @sisin/vue-web-fetch
```
# 使用实例
```js
import AuthPlugin,{ createAuthGuard } from "niceguy-fetch";

// 安装插件
app.use(AuthPlugin, {
  baseURL: 'https://auth.example.com', // 认证服务基础URL
  refreshEndpoint: '/auth/refresh', // 刷新token endpoint
  checkEndpoint: '/auth/check', // 检查token endpoint
  logoutEndpoint: '/auth/logout', // 登出接口
  loginPath: '/login', // 登录页面路径
  inactivityTimeout: 30 * 60 * 1000, // 30分钟无操作超时
  autoRefreshOn401: true // 开启自动刷新token
});
```