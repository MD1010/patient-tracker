import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { GradientText } from "../ui/gradient-text";
import { BackgroundEffects } from "../ui/background-effects";
import { EyeIcon, EyeOffIcon } from "lucide-react";

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
    <div className="min-h-screen p-8 relative flex items-center justify-center overflow-hidden mobile:items-start mobile:mt-10">


      <BackgroundEffects />

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
          <div className="space-y-6">
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
                   transition-all duration-200 hover:bg-white/10"
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
                     transition-all duration-200 hover:bg-white/10"
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

            {error && (
              <div className="text-red-400 text-base text-center bg-red-500/10 py-2 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Button Container - Mobile-specific styling */}
          <div className="mobile:fixed left-0 right-0 bottom-0 px-0 mobile:px-8">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full font-semibold text-lg py-7 rounded-lg cursor-pointer mb-4"
              disabled={isLoading}
              loaderClasses="!h-6 !w-6"
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