import { useAuth } from "@clerk/clerk-react";
import { ReactNode, FC } from "react";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from '../ui/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { userId, isLoaded } = useAuth();

  if(!isLoaded) return <LoadingScreen/>;

  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
