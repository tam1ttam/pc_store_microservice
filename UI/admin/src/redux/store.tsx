import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/redux/slices";

import { productReducer } from "@/redux/slices/product";
import cartReducer from "@/redux/slices/cart";
import adminReducer from "@/redux/slices/admin";
import userReducer from "@/redux/slices/user";
import orderReducer from "@/redux/slices/order";
import chatReducer from "@/redux/slices/chat";

const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
        admin: adminReducer,
        user: userReducer,
        order: orderReducer,
        chat: chatReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
