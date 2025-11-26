import axios from "axios"

const API_BASE_URL = import.meta.env.PROD
  ? "https://tuo-dominio.com/api"
  : "/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Debug per le richieste POST a /reviews
      if (
        config.url &&
        config.url.includes("/reviews") &&
        config.method === "post"
      ) {
        console.log(
          "API Request - Sending POST to /reviews with token:",
          token ? `${token.substring(0, 20)}...` : "none"
        )
        console.log(
          "API Request - Authorization header:",
          config.headers.Authorization ? "present" : "missing"
        )
      }
    } else {
      // Debug per le richieste POST a /reviews senza token
      if (
        config.url &&
        config.url.includes("/reviews") &&
        config.method === "post"
      ) {
        console.warn(
          "API Request - No token found in localStorage for POST /reviews"
        )
      }
    }

    // Se la richiesta contiene FormData, rimuovi il Content-Type
    // per permettere a axios di impostare automaticamente il boundary corretto
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isInModal = document.querySelector(".modal.show") !== null

      // Se siamo in un modal, NON fare redirect e NON rimuovere il token
      // Lascia che il componente gestisca l'errore
      if (isInModal) {
        console.warn(
          "Authentication error in modal. Let the component handle it."
        )
        // Non fare nulla, lascia che l'errore venga propagato
      } else if (!window.location.pathname.includes("/login")) {
        // Solo se non siamo in un modal e non siamo già sulla pagina di login
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        // Usa un timeout per permettere alla promise di essere rifiutata prima del redirect
        setTimeout(() => {
          window.location.href = "/login"
        }, 100)
      }
    }
    return Promise.reject(error)
  }
)

export default api
