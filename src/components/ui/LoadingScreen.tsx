import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
      <Loader2 size={50} />
    </div>
  );
};
