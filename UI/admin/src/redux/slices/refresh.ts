import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RefreshState {
    pendingRefreshes: Record<string, number>; // dataType -> timestamp
}

const initialState: RefreshState = {
    pendingRefreshes: {},
};

const refreshSlice = createSlice({
    name: "refresh",
    initialState,
    reducers: {
        invalidate: (state, action: PayloadAction<string>) => {
            state.pendingRefreshes[action.payload] = Date.now();
        },
        clearInvalidation: (state, action: PayloadAction<string>) => {
            delete state.pendingRefreshes[action.payload];
        },
    },
});

export const { invalidate, clearInvalidation } = refreshSlice.actions;
export default refreshSlice.reducer;
