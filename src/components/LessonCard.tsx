import { Link } from "react-router-dom";
import { Clock, Volume2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Lesson } from "@/types/lesson";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";

interface LessonCardProps {
  lesson: Lesson;
}

const categoryColors = {
  solar: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  water: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  trees: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  energy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
};

export const LessonCard = ({ lesson }: LessonCardProps) => {
  const { t } = useLanguage();
  const { progress } = useProgress();
  const isCompleted = progress.completedLessons.includes(lesson.id);

  return (
    <Card className="hover:shadow-[var(--shadow-elevated)] transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{lesson.title}</CardTitle>
            <CardDescription>{lesson.description}</CardDescription>
          </div>
          {isCompleted && (
            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={categoryColors[lesson.category]}>
            {lesson.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{lesson.duration} {t("minutes")}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/lesson/${lesson.id}`} className="flex-1">
            <Button className="w-full">
              {isCompleted ? t("startLesson") : t("startLesson")}
            </Button>
          </Link>
          <Button variant="outline" size="icon" title={t("playVoice")}>
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
