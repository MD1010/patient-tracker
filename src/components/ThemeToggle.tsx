import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted before accessing the theme value
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent rendering until mounted

  const toggleTheme = () => {
    // Use the View Transitions API for smooth animations
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      });
    } else {
      // Fallback for browsers that do not support View Transitions API
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative"
    >
      {/* Sun and Moon icons with transition */}
      <Sun
        className={`h-5 w-5 transition-transform duration-300 ${
          theme === 'dark' ? '-rotate-90 scale-0' : 'rotate-0 scale-100'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-transform duration-300 ${
          theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
        }`}
      />
    </Button>
  );
}