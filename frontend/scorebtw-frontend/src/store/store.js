import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import gamesReducer from "./slices/gamesSlice"
import reviewsReducer from "./slices/reviewsSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    games: gamesReducer,
    reviews: reviewsReducer,
  },
})

export default store
