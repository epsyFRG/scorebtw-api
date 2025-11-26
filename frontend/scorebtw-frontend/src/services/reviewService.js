import api from "./api"

const reviewService = {
  // Crea recensione
  createReview: async (gameId, rating, title, content) => {
    // Assicurati che rating sia un numero decimale
    const ratingValue = typeof rating === "number" ? rating : parseFloat(rating)
    
    const payload = {
      gameId: typeof gameId === "number" ? gameId : parseInt(gameId),
      rating: ratingValue,
      title: title || null,
      content: content,
    }
    
    console.log("ReviewService - Creating review with payload:", payload)
    console.log("ReviewService - API base URL:", api.defaults.baseURL)
    
    try {
      const response = await api.post("/reviews", payload)
      console.log("ReviewService - Review created successfully:", response.data)
      return response.data
    } catch (error) {
      console.error("ReviewService - Error creating review:", error)
      console.error("ReviewService - Error response:", error.response)
      console.error("ReviewService - Error response data:", error.response?.data)
      console.error("ReviewService - Error response status:", error.response?.status)
      console.error("ReviewService - Error response headers:", error.response?.headers)
      
      // Assicurati di propagare l'errore completo
      if (error.response) {
        // L'errore ha una risposta dal server
        const errorWithResponse = new Error(error.response.data?.message || error.message)
        errorWithResponse.response = error.response
        errorWithResponse.status = error.response.status
        throw errorWithResponse
      }
      
      throw error
    }
  },

  // Aggiorna recensione
  updateReview: async (reviewId, gameId, rating, title, content) => {
    const response = await api.put(`/reviews/${reviewId}`, {
      gameId,
      rating,
      title,
      content,
    })
    return response.data
  },

  // Elimina recensione
  deleteReview: async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`)
  },

  // Ottieni recensione
  getReview: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`)
    return response.data
  },

  // Ottieni recensioni di un gioco
  getReviewsByGame: async (gameId) => {
    const response = await api.get(`/reviews/game/${gameId}`)
    return response.data
  },

  // Ottieni recensioni di un utente
  getReviewsByUser: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`)
    return response.data
  },

  // Verifica se l'utente ha recensito un gioco
  hasUserReviewedGame: async (userId, gameId) => {
    const response = await api.get("/reviews/check", {
      params: { userId, gameId },
    })
    return response.data
  },
}

export default reviewService
