import { Card, CardContent } from "./ui/card";
import { Badge as BadgeType } from "@/types/lesson";
import { cn } from "@/lib/utils";

interface BadgeDisplayProps {
  badge: BadgeType;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-16 h-16 text-2xl",
  md: "w-24 h-24 text-4xl",
  lg: "w-32 h-32 text-5xl",
};

const badgeTypeColors = {
  gold: "border-gold bg-gold/10",
  silver: "border-silver bg-silver/10",
  bronze: "border-bronze bg-bronze/10",
};

export const BadgeDisplay = ({ badge, size = "md", onClick }: BadgeDisplayProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all",
        badgeTypeColors[badge.type],
        onClick && "cursor-pointer hover:scale-105 hover:shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 text-center space-y-2">
        <div className={cn(
          "mx-auto rounded-full border-2 flex items-center justify-center",
          sizeClasses[size],
          badgeTypeColors[badge.type]
        )}>
          <span>{badge.icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-card-foreground">{badge.name}</h3>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(badge.earnedDate).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
