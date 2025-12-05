import { apiSlice } from "../slices/apiSlice";

const userApi = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      // Users CRUD
      createUser: builder.mutation({
         query: (userData) => ({
            url: `/user-control/users/create`,
            method: "POST",
            body: userData,
         }),
         invalidatesTags: ["users"],
      }),
      uploadRm: builder.mutation({
         query: (formData) => ({
            url: `/user-control/users/rm/upload`,
            method: "POST",
            body: formData,
         }),
         invalidatesTags: ["users"],
      }),
      editUser: builder.mutation({
         query: ({ userId, ...userData }) => ({
            url: `/user-control/users/${userId}`,
            method: "PUT",
            body: { ...userData },
         }),
         invalidatesTags: ["users"],
      }),
      deleteUser: builder.mutation({
         query: (userId) => ({
            url: `/user-control/users/${userId}`,
            method: "DELETE",
         }),
         invalidatesTags: ["users"],
      }),
      getUsers: builder.query({
         query: ({ status = "all", limit = 10, query, page = 1 }) => ({
            url: `/user-control/users/all`,
            method: "GET",
            params: { status, query, limit, page },
         }),
         providesTags: ["users"],
      }),

      changeUserStatus: builder.mutation({
         query: ({ userId, status }) => ({
            url: `/user-control/users/status-change/${userId}`,
            method: "PATCH",
            body: { status },
         }),
         invalidatesTags: ["users"],
      }),

      changePassword: builder.mutation({
         query: (data) => ({
            url: `/user-control/users/change-password`,
            method: "PUT",
            body: data,
         }),
         invalidatesTags: ["users"],
      }),
      editProfile: builder.mutation({
         query: ({ id, ...data }) => ({
            url: `/user-control/users/update-profile/${id}`,
            method: "PUT",
            body: data,
         }),
         invalidatesTags: ["users"],
      }),

      // rm
      getAllRm: builder.query({
         query: ({ status = "all", limit = 10, query, page = 0 }) => ({
            url: `/user-control/users/rm/rm-search`,
            method: "GET",
            params: { status, query, limit, page },
         }),
         providesTags: ["users"],
      }),
      getRmDetails: builder.query({
         query: ({ id, startDate, endDate }) => ({
            url: `/dashboard/supervisor/summary/${id}`,
            method: "GET",
            params: { fromDate: startDate, toDate: endDate },
         }),
         providesTags: ["users"],
      }),
   }),
});

export const {
   useCreateUserMutation,
   useEditUserMutation,
   useDeleteUserMutation,
   useGetUsersQuery,
   useChangePasswordMutation,
   useGetRmDetailsQuery,
   useChangeUserStatusMutation,
   useUploadRmMutation,
   useGetAllRmQuery,
   useEditProfileMutation,
} = userApi;
