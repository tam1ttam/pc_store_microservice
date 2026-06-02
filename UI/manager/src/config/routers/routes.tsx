import { RouteObject } from "react-router-dom";
import { Login, NotFound, Register } from "@/pages";
import Home from "@/pages/Home";
import ProductsPage from "@/pages/Product/Product";
import ProductDetail from "@/pages/Product/ProductDetail";
import Cart from "@/pages/Cart/Cart";
import About from "@/pages/About";
import Order from "@/pages/Order";
import OrderDetail from "@/pages/Order/[id]";
import { Customer, OrderPage, Product, VoucherPage } from "@/pages/Admin";
import MessagesPage from "@/pages/Messages";

export const managerRoutes: RouteObject[] = [
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/products",
        element: <ProductsPage />
    },
    {
        path: "/products/:id",
        element: <ProductDetail />
    },
    {
        path: "/cart",
        element: <Cart />
    },
    {
        path: "/order",
        element: <Order />
    },
    {
        path: "/order/:id",
        element: <OrderDetail />
    },
    {
        path: "/about",
        element: <About />
    },
    {
        path: "admin/products",
        element: <Product />
    },
    {
        path: "admin/customers",
        element: <Customer />
    },
    {
        path: "admin/orders",
        element: <OrderPage />
    },
    {
        path: "admin/vouchers",
        element: <VoucherPage />
    },
    {
        path: "/messages",
        element: <MessagesPage />
    },
    {
        path: "*",
        element: <NotFound />
    }
];
