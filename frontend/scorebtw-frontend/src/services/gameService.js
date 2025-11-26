import api from "./api"

const gameService = {
  // Cerca giochi
  searchGames: async (query, page = 1, pageSize = 20) => {
    const response = await api.get("/games/search", {
      params: { q: query, page, pageSize },
    })
    return response.data
  },

  // Ottieni giochi popolari
  getPopularGames: async (page = 1, pageSize = 20) => {
    const response = await api.get("/games/popular", {
      params: { page, pageSize },
    })
    return response.data
  },

  // Ottieni giochi recenti
  getRecentGames: async (page = 1, pageSize = 20) => {
    const response = await api.get("/games/recent", {
      params: { page, pageSize },
    })
    return response.data
  },

  // Ottieni dettagli gioco
  getGameDetails: async (gameId) => {
    const response = await api.get(`/games/${gameId}`)
    return response.data
  },
}

export default gameService
