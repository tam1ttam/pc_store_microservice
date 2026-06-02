import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/redux/slices";
import reviewReducer from "@/redux/slices/review";
import { productReducer } from "@/redux/slices/product";
import cartReducer from "@/redux/slices/cart";
import adminReducer from "@/redux/slices/admin";
import userReducer from "@/redux/slices/user";
import orderReducer from "@/redux/slices/order";
import chatReducer from "@/redux/slices/chat";
import presenceReducer from "@/redux/slices/presence";
import notificationReducer from "@/redux/slices/notification";
import voucherReducer from "@/redux/slices/voucher";

const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
        admin: adminReducer,
        user: userReducer,
        order: orderReducer,
        chat: chatReducer,
        presence: presenceReducer,
        notification: notificationReducer,
        voucher: voucherReducer,
  review: reviewReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
