import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Award, TrendingUp } from "lucide-react";
import { Progress } from "./ui/progress";

interface BadgeDetails {
  id: string;
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  achievement_type: string;
  points_awarded: number;
  earned_at: string;
}

interface BadgeDetailsModalProps {
  badge: BadgeDetails | null;
  isOpen: boolean;
  onClose: () => void;
  userStats?: {
    current_streak?: number;
    total_actions?: number;
    total_points?: number;
  };
}

const getBadgeCategory = (type: string): string => {
  if (type.startsWith('streak_')) return 'Streak Achievement';
  if (type.startsWith('actions_')) return 'Action Milestone';
  if (type.startsWith('category_')) return 'Category Master';
  if (type.startsWith('event_')) return 'Special Event';
  if (type === 'first_action') return 'First Achievement';
  if (type === 'early_adopter') return 'Special Recognition';
  return 'Achievement';
};

const getProgressInfo = (type: string, userStats: any) => {
  if (!userStats) return null;
  
  if (type === 'streak_7') {
    return { current: userStats.current_streak || 0, target: 7, label: 'days streak' };
  }
  if (type === 'streak_30') {
    return { current: userStats.current_streak || 0, target: 30, label: 'days streak' };
  }
  if (type === 'streak_100') {
    return { current: userStats.current_streak || 0, target: 100, label: 'days streak' };
  }
  if (type === 'actions_10') {
    return { current: userStats.total_actions || 0, target: 10, label: 'actions' };
  }
  if (type === 'actions_50') {
    return { current: userStats.total_actions || 0, target: 50, label: 'actions' };
  }
  if (type === 'actions_100') {
    return { current: userStats.total_actions || 0, target: 100, label: 'actions' };
  }
  
  return null;
};

export const BadgeDetailsModal = ({ badge, isOpen, onClose, userStats }: BadgeDetailsModalProps) => {
  if (!badge) return null;

  const category = getBadgeCategory(badge.achievement_type);
  const progressInfo = getProgressInfo(badge.achievement_type, userStats);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Badge Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Badge Icon and Name */}
          <div className="text-center space-y-3">
            <div className="text-7xl mx-auto w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
              {badge.achievement_icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {badge.achievement_name}
              </h3>
              <Badge variant="secondary" className="mt-2">
                {category}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-muted-foreground text-center">
              {badge.achievement_description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm">Points</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                +{badge.points_awarded}
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Earned</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {new Date(badge.earned_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Progress Info */}
          {progressInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Your Progress
                </span>
                <span className="font-semibold text-foreground">
                  {progressInfo.current} / {progressInfo.target} {progressInfo.label}
                </span>
              </div>
              <Progress 
                value={(progressInfo.current / progressInfo.target) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Rarity Indicator */}
          <div className="text-center text-xs text-muted-foreground">
            {badge.points_awarded >= 500 && '💎 Legendary Achievement'}
            {badge.points_awarded >= 200 && badge.points_awarded < 500 && '🏆 Epic Achievement'}
            {badge.points_awarded >= 100 && badge.points_awarded < 200 && '⭐ Rare Achievement'}
            {badge.points_awarded >= 50 && badge.points_awarded < 100 && '🌟 Uncommon Achievement'}
            {badge.points_awarded < 50 && '🌱 Common Achievement'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
