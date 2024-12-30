import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import Login from "@/components/Login/Login"; // Adjust the import based on your file structure

const LoginRedirect = () => {
  const { userId, isLoaded } = useAuth();

  // Wait for Clerk to load
  if (!isLoaded) return null;

  // If the user is authenticated, redirect to the dashboard
  if (userId) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the Login component
  return <Login />;
};

export default LoginRedirect;
