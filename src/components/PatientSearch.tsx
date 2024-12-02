import { SearchInput } from "./ui/search-input";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";

export function PatientSearch() {
  const [query, setQuery] = useState("");
  const patients = useQuery(api.patients.get);

  console.log("patients", patients);
  

  const searchResults =
    patients?.filter(
      (patient) =>
        !query.trim() ||
        patient._id.toLowerCase().includes(query.toLowerCase()) ||
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.email.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

  return (
    <div className="space-y-4">
      <SearchInput
        placeholder="Search patients (name,id, email)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="space-y-2">
        {searchResults.map((patient) => (
          <div
            key={patient._id}
            className="p-4 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors"
          >
            <h3 className="font-medium">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">{patient.email}</p>
          </div>
        ))}

        {searchResults.length === 0 && query && (
          <div className="text-center py-8 text-muted-foreground">
            No patients found matching "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
