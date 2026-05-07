import { ListCustomerResponse } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { getCustomer, setIsAdmin } from "../thunks/admin";

interface AdminState {
    customers: ListCustomerResponse | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: AdminState = {
    customers: null,
    status: "idle",
    error: null
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCustomer.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getCustomer.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.customers = action.payload;
            })
            .addCase(getCustomer.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(setIsAdmin.pending, (state) => {
                state.status = "loading";
            })
            .addCase(setIsAdmin.fulfilled, (state) => {
                state.status = "succeeded";
            })
            .addCase(setIsAdmin.rejected, (state) => {
                state.status = "failed";
            });
    }
});

export default adminSlice.reducer;
