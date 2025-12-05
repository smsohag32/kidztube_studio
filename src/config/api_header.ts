import { getCookie } from "@/helpers/cookies";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const baseQuery = fetchBaseQuery({
   baseUrl: `${import.meta.env.VITE_BASE_URL}/api/v1`,
   prepareHeaders: (headers) => {
      const access_token = getCookie("access_token");
      if (access_token) {
         headers.set("Authorization", `Bearer ${access_token}`);
      }
      return headers;
   },
});
