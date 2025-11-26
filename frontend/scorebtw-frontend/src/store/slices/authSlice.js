import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import authService from "../../services/authService"

// Thunks
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(username, password)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed")
    }
  }
)

export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.register(username, email, password)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      )
    }
  }
)

// Initial state
const initialState = {
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
}

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout()
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      // Aggiorna anche localStorage
      if (state.user) {
        localStorage.setItem("user", JSON.stringify(state.user))
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer
