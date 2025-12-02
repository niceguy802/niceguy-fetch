import { createRequest } from "./src/request.js"
import { createAuthManager } from "./src/auth.js"
import { createAuthGuard } from "./src/router-guard.js"

/**
 * options:
 * - baseURL: optional base url (defaults to current origin)
 * - refreshEndpoint: '/auth/refresh'
 * - logoutEndpoint: '/auth/logout'
 * - checkEndpoint: '/auth/check'
 * - loginPath: '/login'
 * - inactivityTimeout: ms (default 30*60*1000)
 * - autoRefreshOn401: true/false (whether plugin tries refresh on 401)
 * - sso: { enabled: true, domain: '.example.com' } // info only; backend must set cookie domain
 */
export default {
  install(app, options = {}) {
    const request = createRequest(options)
    const auth = createAuthManager({ request, options })
    app.config.globalProperties.$request = request
    app.config.globalProperties.$auth = auth

    // provide for composition API
    app.provide("request", request)
    app.provide("auth", auth)
  }
}

export { createRequest, createAuthManager, createAuthGuard };