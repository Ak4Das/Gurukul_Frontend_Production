import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { api } from "../api"
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify"

const Context = createContext(null)
// when we need to access the context values then we have to simply import the useApp and call it
export const useApp = () => useContext(Context)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sms_user"))
    } catch {
      return null
    }
  })

  const [settings, setSettings] = useState({
    schoolName: "Demo School",
    currency: "₹",
  })
  
  const [toastObj, setToast] = useState(null)

  // Purpose of useCallback is to safe function from unnecessary recreation
  // till the dependencies of useCallback doesn't change reuse the same function reference
  // Here i use useCallback since i use the function reference inside dependency of useEffect
  const loadSettings = useCallback(async () => {
    const { data } = await api.get(user ? "/settings" : "/public/settings")
    setSettings((s) => ({ ...s, ...data }))
  }, [user])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password })
    localStorage.setItem("sms_token", data.token)
    localStorage.setItem("sms_user", JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem("sms_token")
    localStorage.removeItem("sms_user")
    setUser(null)
  }

  const notify = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    if (toastObj) {
      toastObj.type === "success"
        ? toast.success(toastObj.message)
        : toastObj.type === "error"
          ? toast.error(toastObj.message)
          : toastObj.type === "info"
            ? toast.info(toastObj.message)
            : toast(toastObj.message)
    }
  }, [toastObj])

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        settings,
        setSettings,
        loadSettings,
        notify,
      }}
    >
      {children}
      <ToastContainer />
    </Context.Provider>
  )
}
