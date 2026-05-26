import { createAsyncThunk } from "@reduxjs/toolkit";

// Thunks for admin page — role management is handled directly via adminApi
// (no Redux thunks needed; local component state is sufficient)

// Kept as placeholder to avoid breaking imports — can be extended later
export const adminThunksPlaceholder = createAsyncThunk("admin/placeholder", async () => {});
