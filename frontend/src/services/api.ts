import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

export const setAccessToken = (token: string | null) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalReq = err.config
    if (err.response && err.response.status === 401 && !originalReq._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalReq.headers['Authorization'] = `Bearer ${token}`
            resolve(api(originalReq))
          })
        })
      }
      originalReq._retry = true
      isRefreshing = true
      try {
        const resp = await api.post('/auth/refresh')
        const { access_token } = resp.data
        setAccessToken(access_token)
        onRefreshed(access_token)
        return api(originalReq)
      } catch (e) {
        // redirect to login by throwing
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
