import axios from "axios"

// creating a centralized axios instance
export const api = axios.create({ baseURL: "http://localhost:5050/api" })

// An interceptor is code that Axios runs automatically at a particular point in the request/response lifecycle.
// Here interceptors.request means Before Axios sends a request, run (cfg) => {} function.
// cfg is Axios request configuration object it contains url, methods, headers etc properties of a particular request.
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("sms_token")
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
  }
  // The interceptor receives the request config, modifies it, and then returns it.
  // If you don't return the config, Axios won't have the request configuration it needs to continue normally.
  return cfg
})
//* Conceptually: api.get("/students") -> Request config created -> Request interceptor -> Add Authorization header -> return cfg -> Axios sends HTTP request -> Backend

// Here interceptors.response means Before Axios sends a response, run (r) => r function if the request succeeds it simply returns the response unchanged. but
// if the request fails and Axios receives an error response then run (err) => {} function
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config.url.includes("/auth/login")
    ) {
      localStorage.removeItem("sms_token")
      localStorage.removeItem("sms_user")
      window.location.href = "/login"
    }

    // If the interceptor catches the error and doesn't reject it again, the original caller may not receive the error correctly.
    return Promise.reject(err)
  },
)

export const errMsg = (e) =>
  e?.response?.data?.error || e.message || "Something went wrong"
