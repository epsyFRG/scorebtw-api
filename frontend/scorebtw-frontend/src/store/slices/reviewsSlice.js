import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import reviewService from "../../services/reviewService"

// Thunks
export const createReview = createAsyncThunk(
  "reviews/create",
  async ({ gameId, rating, title, content }, { rejectWithValue }) => {
    try {
      const data = await reviewService.createReview(
        gameId,
        rating,
        title,
        content
      )
      return data
    } catch (error) {
      console.error("createReview thunk error:", error)
      console.error("Error response:", error.response)
      console.error("Error response data:", error.response?.data)
      
      // Estrai il messaggio di errore in modo più dettagliato
      let errorMessage = "Failed to create review"
      
      // Log completo dell'errore per debug
      console.error("=== Review Creation Error Debug ===")
      console.error("Error response status:", error.response?.status || "none")
      console.error("Error response data:", error.response?.data || {})
      console.error("Error message:", error.message || "none")
      
      if (error.response?.status === 401) {
        errorMessage = "You are not authenticated. Please log in and try again."
      } else if (error.response?.status === 403) {
        // Per 403, cerca il messaggio nel body della risposta
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else {
          errorMessage = "Access denied. Please check your authentication token and try again."
        }
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid request. Please check your input."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (typeof error.response?.data === "string") {
        errorMessage = error.response.data
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return rejectWithValue(errorMessage)
    }
  }
)

export const getReviewsByGame = createAsyncThunk(
  "reviews/byGame",
  async (gameId, { rejectWithValue }) => {
    try {
      const data = await reviewService.getReviewsByGame(gameId)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load reviews"
      )
    }
  }
)

export const getReviewsByUser = createAsyncThunk(
  "reviews/byUser",
  async (userId, { rejectWithValue }) => {
    try {
      const data = await reviewService.getReviewsByUser(userId)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load reviews"
      )
    }
  }
)

export const updateReview = createAsyncThunk(
  "reviews/update",
  async ({ reviewId, gameId, rating, title, content }, { rejectWithValue }) => {
    try {
      const data = await reviewService.updateReview(
        reviewId,
        gameId,
        rating,
        title,
        content
      )
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update review"
      )
    }
  }
)

export const deleteReview = createAsyncThunk(
  "reviews/delete",
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(reviewId)
      return reviewId
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete review"
      )
    }
  }
)

// Initial state
const initialState = {
  gameReviews: [],
  userReviews: [],
  isLoading: false,
  error: null,
}

// Slice
const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.gameReviews = []
      state.userReviews = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false
        state.gameReviews.unshift(action.payload)
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Get by game
      .addCase(getReviewsByGame.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getReviewsByGame.fulfilled, (state, action) => {
        state.isLoading = false
        state.gameReviews = action.payload
      })
      .addCase(getReviewsByGame.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Get by user
      .addCase(getReviewsByUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getReviewsByUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.userReviews = action.payload
      })
      .addCase(getReviewsByUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update
      .addCase(updateReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isLoading = false
        // Aggiorna la review nell'array
        const updatedReview = action.payload
        const gameIndex = state.gameReviews.findIndex((r) => r.id === updatedReview.id)
        if (gameIndex !== -1) {
          state.gameReviews[gameIndex] = updatedReview
        }
        const userIndex = state.userReviews.findIndex((r) => r.id === updatedReview.id)
        if (userIndex !== -1) {
          state.userReviews[userIndex] = updatedReview
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.gameReviews = state.gameReviews.filter(
          (r) => r.id !== action.payload
        )
        state.userReviews = state.userReviews.filter(
          (r) => r.id !== action.payload
        )
      })
  },
})

export const { clearReviews } = reviewsSlice.actions
export default reviewsSlice.reducer
