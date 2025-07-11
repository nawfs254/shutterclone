import React from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/main";
import Home from "../pages/home";
import About from "../pages/about";
import Admin from "../pages/admin";
import CategoryPage from "../pages/category";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "admin", element: <Admin /> },
      { path: "category/:category", element: <CategoryPage /> },
    ],
  },
]);

export default router;
