import { baseQuery } from "@/config/api_header";

import { createApi } from "@reduxjs/toolkit/query/react";
import { logoutUser } from "./authSlice";

// need to generate svcRqId
export const HEADERS_TO_STORE = ["txnKey", "channelId", "svcRqId", "txnDate", "traceId"];

const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
   const result = await baseQuery(args, api, extraOptions);

   if (result?.error?.status === 401) {
      api.dispatch(logoutUser());

      if (typeof window !== "undefined") {
         window.location.href = "/";
      }
   }

   return result;
};

export const apiSlice = createApi({
   reducerPath: "api",
   baseQuery: customBaseQuery,
   tagTypes: ["roles", "users", "content"],
   endpoints: () => ({}),
});
