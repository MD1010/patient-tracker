import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider enableSystem defaultTheme="dark" attribute="class">
      <div className="min-h-screen bg-background" dir="rtl">
        {/* <Header /> */}
        {children}
      </div>
      <Toaster dir="rtl" position="top-left" />
    </ThemeProvider>
  );
};
