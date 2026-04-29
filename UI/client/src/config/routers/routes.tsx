import { RouteObject } from "react-router-dom";
import { Login, NotFound, Register } from "@/pages";
import Home from "@/pages/Home";
import ProductsPage from "@/pages/Product/Product";
import ProductDetail from "@/pages/Product/ProductDetail";
import Cart from "@/pages/Cart/Cart";
import About from "@/pages/About";
import Order from "@/pages/Order";
import OrderDetail from "@/pages/Order/[id]";

export const clientRoutes: RouteObject[] = [
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
        path: "*",
        element: <NotFound />
    }
];
