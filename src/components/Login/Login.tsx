import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { GradientText } from "../ui/gradient-text";
import { BackgroundEffects } from "../ui/background-effects";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Ripple from "../ui/ripple";

const Login = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        navigate("/", { replace: true });
      } else {
        setError("Sign-in incomplete. Please try again.");
      }
    } catch (err) {
      setError("שם משתמש או סיסמה שגויים");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 relative flex items-center justify-center overflow-hidden mobile:items-start mobile:pt-20">
      <BackgroundEffects />
      <Ripple
      mainCircleSize={20}
        mainCircleOpacity={0.6}
      />

      {/* Content Container */}
      <div className="container max-w-2xl mx-auto z-10 px-4">
        <div className="text-center mb-12">
          <h1 className="md:text-4xl font-bold mb-4 text-3xl">
            <GradientText from="from-white" to="to-gray-400">
              מערכת לניהול מטופלים
            </GradientText>
          </h1>
          <p className="text-gray-300 md:text-lg text-md font-semibold">
            איזה כיף לראות אותך! התחבר כדי להתחיל לעבוד
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16 max-w-lg mx-auto">
          <div className="space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="username"
                className="text-base font-medium text-gray-200"
              >
                שם משתמש
              </label>
              <input
                autoComplete="off"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-3 bg-white/5 rounded-lg
                   focus:ring-2 focus:ring-white/20 focus:border-transparent
                   text-primary backdrop-blur-xl text-lg
                   transition-all duration-200 hover:bg-white/10 text-white"
                placeholder="הזן את שם המשתמש שלך"
                required
                dir="rtl"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="password"
                className="text-base font-medium text-gray-200"
              >
                סיסמה
              </label>
              <div className="relative">
                <input
                  autoComplete="off"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-3 bg-white/5 rounded-lg
                     focus:ring-2 focus:ring-white/20 focus:border-transparent
                     text-primary backdrop-blur-xl text-lg
                     transition-all duration-200 hover:bg-white/10 text-white"
                  placeholder="הזן את הסיסמה שלך"
                  required
                  dir="rtl"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>

            <div className="">
              {error && (
                <div className="mt-3 text-red-400 text-base text-center bg-red-500/10 py-4 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Button Container - Mobile-specific styling */}
          <div className="mobile:fixed left-0 right-0 bottom-0 px-0 mobile:px-8">
            <Button
              className="w-full font-semibold text-lg rounded-lg cursor-pointer mb-8 text-black bg-white py-6"
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              variant="submit"
            >
              התחבר
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
