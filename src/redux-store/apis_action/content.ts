import { apiSlice } from "../slices/apiSlice";

export const publicContentApi = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      // Get all public content (with pagination + filters)
      getPublicContents: builder.query({
         query: ({ page = 1, limit = 10, category, search }) => ({
            url: `/content`,
            method: "GET",
            params: { page, limit, category, search },
         }),
         providesTags: ["content"],
      }),

      // Get single public content
      getPublicContentById: builder.query({
         query: (id) => ({
            url: `/content/${id}`,
            method: "GET",
         }),
         providesTags: ["content"],
      }),
   }),
});

export const { useGetPublicContentsQuery, useGetPublicContentByIdQuery } = publicContentApi;
