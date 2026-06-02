import { createSlice } from "@reduxjs/toolkit";

// Admin slice — role management is handled directly in UserManagement component
// via adminApi.updateUserRole(); no shared state needed.

const adminSlice = createSlice({
    name: "admin",
    initialState: {},
    reducers: {},
});

export default adminSlice.reducer;
