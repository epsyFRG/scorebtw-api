import api from "./api"

const authService = {
  // Registrazione
  register: async (username, email, password) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    })

    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }

    return response.data
  },

  // Login
  login: async (username, password) => {
    const response = await api.post("/auth/login", {
      username,
      password,
    })

    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }

    return response.data
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  // Ottieni utente corrente
  getCurrentUser: () => {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  // Verifica se l'utente è autenticato
  isAuthenticated: () => {
    return !!localStorage.getItem("token")
  },
}

export default authService
