import { apiSlice } from "../slices/apiSlice";

const contentManagementApi = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      // Create Content
      createContent: builder.mutation({
         query: (data) => ({
            url: `/content/add`,
            method: "POST",
            body: data,
         }),
         invalidatesTags: ["content"],
      }),
      bulkUploadContent: builder.mutation({
         query: (formData) => ({
            url: `/content/bulk-upload`,
            method: "POST",
            body: formData,
         }),
         invalidatesTags: ["content"],
      }),
      bulkDelete: builder.mutation({
         query: (data) => ({
            url: `/content/bulk-delete`,
            method: "POST",
            body: data,
         }),
         invalidatesTags: ["content"],
      }),

      // Get Single Content by ID
      getContentById: builder.query({
         query: (id) => ({
            url: `/content/${id}`,
            method: "GET",
         }),
         providesTags: ["content"],
      }),

      // Update Content
      updateContent: builder.mutation({
         query: ({ id, ...data }) => ({
            url: `/content/${id}`,
            method: "PUT",
            body: data,
         }),
         invalidatesTags: ["content"],
      }),

      // Delete Content
      deleteContent: builder.mutation({
         query: (id) => ({
            url: `/content/${id}`,
            method: "DELETE",
         }),
         invalidatesTags: ["content"],
      }),

      // Change Content Status (active/inactive)
      changeContentStatus: builder.mutation({
         query: ({ id, status }) => ({
            url: `/content/${id}/status`,
            method: "PATCH",
            body: { status },
         }),
         invalidatesTags: ["content"],
      }),

      // Approve Content (admin)
      approveContent: builder.mutation({
         query: (id) => ({
            url: `/content/${id}/approve`,
            method: "PATCH",
         }),
         invalidatesTags: ["content"],
      }),

      // Admin – Get All Approved Content
      getAdminContent: builder.query({
         query: ({ page, limit, search, status, approved }) => ({
            url: `/admin/content`,
            method: "GET",
            params: { page, limit, search, status, approved },
         }),
         providesTags: ["content"],
      }),
   }),
});

export const {
   useCreateContentMutation,
   useGetContentByIdQuery,
   useBulkUploadContentMutation,
   useUpdateContentMutation,
   useDeleteContentMutation,
   useBulkDeleteMutation,
   useChangeContentStatusMutation,
   useApproveContentMutation,
   useGetAdminContentQuery,
} = contentManagementApi;
