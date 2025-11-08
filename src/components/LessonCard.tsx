import { Link } from "react-router-dom";
import { Clock, Volume2, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Lesson } from "@/types/lesson";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayVoice = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      setIsPlayingAudio(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: lesson.description,
          voiceId: 'EXAVITQu4vr4xnSDxMaL'
        }
      });

      if (error) throw error;

      if (data?.audio) {
        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          toast.error("Failed to play audio");
        };
        await audio.play();
        toast.success("Playing lesson preview");
      }
    } catch (error) {
      console.error('Error:', error);
      setIsPlayingAudio(false);
      toast.error("Failed to play audio preview");
    }
  };

  return (
    <Card className="bg-gradient-card hover-lift border-primary/10">
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
          <Button 
            variant="outline" 
            size="icon" 
            title={t("playVoice")}
            onClick={handlePlayVoice}
            disabled={isPlayingAudio}
          >
            {isPlayingAudio ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
