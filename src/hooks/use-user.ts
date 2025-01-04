import { AppUser } from "@/store/user-store";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

const useAppUser = () => {
  const { userId, getToken, isLoaded } = useAuth();
  const userGoogleToken = useQuery(api.auth.getGoogleTokens, {
    userId: userId || "",
  });
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && userId) {
      (async () => {
        const token = await getToken();
        setAuthToken(token);
      })();
    }
  }, [isLoaded, userId, getToken]);

  if (!isLoaded || !userId) return null;

  return {
    userId,
    authToken,
    googleAccessToken: userGoogleToken?.accessToken
  } as AppUser;
};

export default useAppUser;
