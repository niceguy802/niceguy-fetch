import axios from "axios"

export function createRequest(options = {}) {
  const baseURL = options.baseURL || `${location.protocol}//${location.host}`
  const refreshEndpoint = options.refreshEndpoint || "/auth/refresh"
  const autoRefreshOn401 = options.autoRefreshOn401 ?? true

  const instance = axios.create({
    baseURL,
    timeout: options.timeout || 10000,
    withCredentials: true // critical: send HttpOnly cookies
  })

  // lock for refresh
  let isRefreshing = false
  let queue = []

  function processQueue(err, token) {
    queue.forEach(p => {
      if (err) p.reject(err)
      else p.resolve(token)
    })
    queue = []
  }

  // response interceptor
  instance.interceptors.response.use(
    res => res.data,
    async error => {
      const status = error?.response?.status
      const originalRequest = error?.config

      if (status === 401 && autoRefreshOn401 && !originalRequest._retry) {
        // try refresh flow once
        if (isRefreshing) {
          // queue this request
          return new Promise((resolve, reject) => {
            queue.push({
              resolve: token => {
                originalRequest._retry = true
                resolve(instance(originalRequest))
              },
              reject
            })
          })
        }

        isRefreshing = true
        originalRequest._retry = true

        try {
          // refresh call: relies on refresh_token cookie (HttpOnly)
          // if refresh_token is not set, it will throw 401
          const refreshRes = await axios.post(refreshEndpoint, {}, {
            baseURL,
            withCredentials: true,
            timeout: options.refreshTimeout || 5000
          })

          // on successful refresh, the server should set new cookies (HttpOnly)
          processQueue(null, true)
          return instance(originalRequest)
        } catch (refreshErr) {
          processQueue(refreshErr, null)
          // refresh failed -> propagate 401 so auth manager can redirect
          return Promise.reject(refreshErr)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )

  // request interceptor (optional headers)
  instance.interceptors.request.use(
    cfg => {
      // no Authorization header because token is in cookie (HttpOnly)
      cfg.withCredentials = true
      return cfg
    },
    e => Promise.reject(e)
  )

  return instance
}