import { Construction } from "lucide-react";

interface Props { title: string; description: string }

const ModulePlaceholder = ({ title, description }: Props) => (
  <div className="space-y-6">
    <header>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </header>
    <div className="rounded-xl border bg-card p-12 shadow-card grid place-items-center text-center">
      <Construction className="h-10 w-10 text-accent" />
      <h2 className="mt-4 font-semibold">Coming in the next slice</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        This module will be built in the next phase. The data model, RLS and UI will be added together so it ships fully working.
      </p>
    </div>
  </div>
);

export default ModulePlaceholder;
