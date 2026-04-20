import { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: Props) => (
  <div className="grid place-items-center text-center py-16 px-6 border border-dashed rounded-lg bg-muted/30">
    <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-secondary-foreground mb-4">
      {icon ?? <PackageOpen className="h-5 w-5" />}
    </div>
    <h3 className="font-semibold">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
