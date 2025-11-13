import { Progress } from "./ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar = ({ current, total, label }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">
            {current} / {total}
          </span>
        </div>
      )}
      <Progress value={percentage} className="h-2" />
    </div>
  );
};
