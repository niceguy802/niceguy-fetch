/**
 * auth manager: handles inactivity timeout, logout redirect, check login
 *
 * params: { request, options }
 */
export function createAuthManager({ request, options = {} }) {
  const checkEndpoint = options.checkEndpoint || "/auth/check"
  const logoutEndpoint = options.logoutEndpoint || "/auth/logout"
  const loginPath = options.loginPath || "/login"
  const inactivityTimeout = options.inactivityTimeout || 30 * 60 * 1000 // 30min
  const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"]
  let timeoutId = null

  function goLogin(redirectUrl) {
    // 解决 redirectUrl 中包含特殊字符的问题
    const redirect = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""
    window.location.href = `${loginPath}${redirect}`
  }

  async function checkLogin() {
    try {
      await request.get(checkEndpoint)
      return true
    } catch (e) {
      return false
    }
  }

  async function logout(serverSide = false) {
    try {
      if (serverSide) {
        await request.post(logoutEndpoint)
      } else {
        // request server to clear cookies, but even if fails, redirect
        try { await request.post(logoutEndpoint) } catch (e) { /* ignore */ }
      }
    } finally {
      // redirect to login
      goLogin(location.pathname + location.search)
    }
  }

  function resetTimer() {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      // inactivity timeout reached -> logout
      logout(true)
    }, inactivityTimeout)
  }

  function startActivityMonitor() {
    resetTimer()
    activityEvents.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }))
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") resetTimer()
    })
  }

  function stopActivityMonitor() {
    if (timeoutId) clearTimeout(timeoutId)
    activityEvents.forEach(ev => window.removeEventListener(ev, resetTimer))
    document.removeEventListener("visibilitychange", resetTimer)
  }

  // expose simple API
  return {
    checkLogin,
    logout,
    goLogin,
    startActivityMonitor,
    stopActivityMonitor,
    options
  }
}
