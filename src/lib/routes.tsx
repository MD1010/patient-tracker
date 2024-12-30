import { App } from "@/App";
import { Layout } from "@/components/Layout";
import Login from "@/components/Login/Login";
import LoginRedirect from "@/components/Redirect/LoginRedirect";

import ProtectedRoute from "@/components/Redirect/ProtectedRoute";
import RootRedirect from "@/components/Redirect/RootRedirect";

import { createBrowserRouter, Navigate } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />, // Handle root redirection
  },
  {
    path: "/login",
    element: (
      <Layout>
        <LoginRedirect />
      </Layout>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Layout>
          <App />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
