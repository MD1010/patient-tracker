import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const Login = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLoaded || !signIn) {
      setError("Clerk is not loaded yet. Please try again later.");
      return;
    }

    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: username,
        password,
      });

      console.log("sign in attempt", signInAttempt);

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        navigate("/", { replace: true });
      } else {
        setError("Sign-in incomplete. Please try again.");
      }
    } catch (err) {
      setError("Sign-in failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Welcome Section */}
      <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col justify-center items-center px-8">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
          ברוכים הבאים
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8">
          התחברו כדי לנהל את החשבון שלכם וליהנות מהתכונות הייחודיות שלנו.
        </p>
        <img
          src={
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "/login-icon-dark.png"
              : "/login-icon-light.png"
          }
          alt="Login Icon"
          className="w-56"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-black text-white flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-semibold text-center mb-6">
            התחברות לחשבון
          </h2>
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                שם משתמש
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black text-white border border-gray-600 rounded-md px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="הכנס שם משתמש"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                סיסמה
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black text-white border border-gray-600 rounded-md px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="הכנס סיסמה"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Submit Button */}
            <Button className='w-full' isLoading={isLoading}>התחבר</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
