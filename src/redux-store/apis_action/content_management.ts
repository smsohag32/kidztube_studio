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
         query: () => ({
            url: `/admin/content`,
            method: "GET",
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
   useChangeContentStatusMutation,
   useApproveContentMutation,
   useGetAdminContentQuery,
} = contentManagementApi;
