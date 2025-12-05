import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteCookie, getCookie, setCookie } from "@/helpers/cookies";
import { loginApi } from "../apis_action/login";

const getPersistedToken = getCookie("access_token");
const cookieValue = getCookie("user_info") || "";
const getPersistedUser = cookieValue ? JSON.parse(cookieValue) : null;
const initialState: any = {
   token: getPersistedToken,
   user: getPersistedUser,
   isLoading: false,
   error: null,
};

export const loginUser = createAsyncThunk<any, any>(
   "auth/loginUser",
   async (credentials, { rejectWithValue }: any) => {
      try {
         const response = await loginApi(credentials);
         return response;
      } catch (error: any) {
         return rejectWithValue(error?.message || "Login failed");
      }
   }
);

const authSlice = createSlice({
   name: "auth",
   initialState,
   reducers: {
      logoutUser: (state) => {
         state.token = null;
         state.user = null;
         deleteCookie("access_token");
         deleteCookie("refresh_token");
         deleteCookie("user_info");
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
         })
         .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            const { token, ...restUserInfo } = action.payload.data;
            state.token = token;
            state.user = restUserInfo;

            if (state.token) {
               setCookie("access_token", state.token);
            }

            if (state.user) {
               setCookie("user_info", JSON.stringify(state.user));
            }
         })
         .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Login failed";
         });
   },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;
