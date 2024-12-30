import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import Login from "@/components/Login/Login"; // Adjust the import based on your file structure
import { LoadingScreen } from '../ui/LoadingScreen';

const LoginRedirect = () => {
  const { userId, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen/>;

  if (userId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

export default LoginRedirect;
