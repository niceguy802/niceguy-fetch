/**
 * createAuthGuard(router, { auth, whiteList })
 * - router: vue-router instance
 * - auth: result of createAuthManager or { checkLogin, goLogin }
 */
export function createAuthGuard(router, { auth, whiteList = ["/login","/public"] } = {}) {
  if (!router || !auth) throw new Error("router and auth required")

  router.beforeEach(async (to, from, next) => {
    if (whiteList.includes(to.path)) return next()

    // optimistic: check backend
    const ok = await auth.checkLogin()
    if (ok) {
      // start activity monitor on protected pages
      auth.startActivityMonitor()
      return next()
    } else {
      auth.stopActivityMonitor()
      auth.goLogin(to.fullPath)
    }
  })
}