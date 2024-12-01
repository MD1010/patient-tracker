import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { usePatients } from '@/lib/store';
import { Search } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useDebounce } from '@/hooks/use-debounce';

export function PatientSearch() {
  const [query, setQuery] = useState('');
  const { setPatients } = usePatients();
  const debouncedQuery = useDebounce(query, 300);

  const searchResults = useQuery(api.patients.search, { 
    searchTerm: debouncedQuery 
  });

  useEffect(() => {
    if (searchResults) {
      setPatients(searchResults);
    }
  }, [searchResults, setPatients]);

  return (
    <div className="relative">
      <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="חיפוש מטופלים..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-8"
      />
    </div>
  );
}