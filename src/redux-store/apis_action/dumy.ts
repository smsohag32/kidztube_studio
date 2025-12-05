import { apiSlice } from "../slices/apiSlice";

const dummy = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      getData: builder.query({
         query: () => ({
            url: `/users`,
            method: "GET",
         }),
      }),
   }),
});

export const { useGetDataQuery } = dummy;
