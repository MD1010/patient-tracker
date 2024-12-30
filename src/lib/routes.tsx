import { App } from "@/App";
import { Layout } from "@/components/Layout";
import LoginRedirect from "@/components/Redirect/LoginRedirect";
import ProtectedRoute from "@/components/Redirect/ProtectedRoute";
import RootRedirect from "@/components/Redirect/RootRedirect";
import {
  createBrowserRouter,
  LoaderFunction,
  Navigate,
  redirect,
} from "react-router-dom";

// Create an auth loader function
const authLoader: LoaderFunction = async () => {
  // Get auth status synchronously from Clerk
  const auth = (window as any).Clerk?.user;

  if (auth) {
    // User is authenticated, redirect to dashboard
    return redirect("/dashboard");
  }

  return null; // Allow rendering login page
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: (
      <Layout>
        <LoginRedirect />
      </Layout>
    ),
    loader: authLoader, // Add the loader here
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
