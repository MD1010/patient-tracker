import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        {...props}
        className={cn("pr-8", className)}
      />
    </div>
  );
}