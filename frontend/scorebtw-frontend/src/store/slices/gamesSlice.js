import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import gameService from "../../services/gameService"

// Thunks
export const searchGames = createAsyncThunk(
  "games/search",
  async ({ query, page, pageSize }, { rejectWithValue }) => {
    try {
      const data = await gameService.searchGames(query, page, pageSize)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed")
    }
  }
)

export const getPopularGames = createAsyncThunk(
  "games/popular",
  async ({ page, pageSize }, { rejectWithValue }) => {
    try {
      const data = await gameService.getPopularGames(page, pageSize)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load popular games"
      )
    }
  }
)

export const getGameDetails = createAsyncThunk(
  "games/details",
  async (gameId, { rejectWithValue }) => {
    try {
      const data = await gameService.getGameDetails(gameId)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load game details"
      )
    }
  }
)

// Initial state
const initialState = {
  searchResults: [],
  popularGames: [],
  currentGame: null,
  isLoading: false,
  error: null,
  searchQuery: "",
}

// Slice
const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchQuery = ""
    },
    clearCurrentGame: (state) => {
      state.currentGame = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(searchGames.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchGames.fulfilled, (state, action) => {
        state.isLoading = false
        state.searchResults = action.payload.results
      })
      .addCase(searchGames.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Popular
      .addCase(getPopularGames.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPopularGames.fulfilled, (state, action) => {
        state.isLoading = false
        state.popularGames = action.payload.results
      })
      .addCase(getPopularGames.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Details
      .addCase(getGameDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getGameDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentGame = action.payload
      })
      .addCase(getGameDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearSearchResults, clearCurrentGame } = gamesSlice.actions
export default gamesSlice.reducer
