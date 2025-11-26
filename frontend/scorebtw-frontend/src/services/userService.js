import api from "./api"

const userService = {
  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append("file", file)

    // Axios gestisce automaticamente il Content-Type per FormData
    const response = await api.post("/users/me/avatar", formData)

    return response.data
  },

  // Ottieni profilo utente
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/profile`)
    return response.data
  },

  // Ottieni informazioni utente corrente
  getCurrentUser: async () => {
    const response = await api.get("/users/me")
    return response.data
  },

  // Aggiorna profilo
  updateProfile: async (profileData) => {
    const response = await api.put("/users/me/profile", profileData)
    return response.data
  },

  // Cerca utenti
  searchUsers: async (query, page = 1, pageSize = 20) => {
    const response = await api.get("/users/search", {
      params: { q: query, page, pageSize },
    })
    return response.data
  },
}

export default userService
