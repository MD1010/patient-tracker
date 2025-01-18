import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const RootRedirect = () => {
  const { userId } = useAuth();
  
  // if(!isLoaded) return <LoadingScreen/>;
  
  if (userId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login"  />;
};

export default RootRedirect;