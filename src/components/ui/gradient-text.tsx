import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export function GradientText({ 
  children, 
  className,
  from = "from-white",
  to = "to-gray-400"
}: GradientTextProps) {
  return (
    <span className={cn(
      "bg-clip-text text-transparent bg-gradient-to-r",
      from,
      to,
      className
    )}>
      {children}
    </span>
  );
}