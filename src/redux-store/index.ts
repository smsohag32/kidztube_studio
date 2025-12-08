import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import authentication from "./slices/authSlice";
import searchReducer from "./slices/searchSlice";

const rootReducer = {
   [apiSlice.reducerPath]: apiSlice.reducer,
   auth: authentication,
   search: searchReducer,
};

export const store = configureStore({
   reducer: rootReducer,
   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
