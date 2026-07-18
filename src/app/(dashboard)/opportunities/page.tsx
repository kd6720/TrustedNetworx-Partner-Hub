import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import OpportunitiesContent from "./content";

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    }>
      <OpportunitiesContent />
    </Suspense>
  );
}
