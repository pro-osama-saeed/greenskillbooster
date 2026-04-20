import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

const PageHeader = ({ title, description, actionLabel, onAction, children }: Props) => (
  <header className="flex flex-wrap justify-between items-end gap-4 pb-2">
    <div>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
    </div>
    <div className="flex gap-2 items-center">
      {children}
      {onAction && actionLabel && (
        <Button onClick={onAction} variant="hero" size="sm">
          <Plus className="h-4 w-4 mr-1" /> {actionLabel}
        </Button>
      )}
    </div>
  </header>
);

export default PageHeader;
