import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { lessons } from "@/data/lessons";
import { CheckCircle2, Volume2, ArrowLeft, Loader2, Pause, Square, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DidYouKnowBox } from "@/components/DidYouKnowBox";
import { DisasterRiskBox } from "@/components/DisasterRiskBox";
import { DragDropActivity } from "@/components/DragDropActivity";
import { ChecklistActivity } from "@/components/ChecklistActivity";
import { ChatBot } from "@/components/ChatBot";
import { QuizQuestion, DragDropActivity as DragDropActivityType, ChecklistActivity as ChecklistActivityType } from "@/types/lesson";
import { shuffleQuizQuestions, shuffleDragDropItems, shuffleChecklistItems } from "@/lib/quizUtils";

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { progress, completeLesson, updateStreak } = useProgress();
  const [quizIndex, setQuizIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showDragDrop, setShowDragDrop] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [activitiesCompleted, setActivitiesCompleted] = useState({
    dragDrop: false,
    checklist: false,
  });
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [randomizedQuiz, setRandomizedQuiz] = useState<QuizQuestion[] | null>(null);
  const [randomizedDragDrop, setRandomizedDragDrop] = useState<DragDropActivityType | null>(null);
  const [randomizedChecklist, setRandomizedChecklist] = useState<ChecklistActivityType | null>(null);

  const lesson = lessons.find((l) => l.id === id);

  // Initialize randomized content on component mount
  useEffect(() => {
    if (lesson) {
      if (lesson.quiz) {
        setRandomizedQuiz(shuffleQuizQuestions(lesson.quiz));
      }
      if (lesson.dragDropActivity) {
        setRandomizedDragDrop(shuffleDragDropItems(lesson.dragDropActivity));
      }
      if (lesson.checklistActivity) {
        setRandomizedChecklist(shuffleChecklistItems(lesson.checklistActivity));
      }
    }
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold">Lesson not found</h1>
          <Button onClick={() => navigate("/lessons")} className="mt-4">
            Back to Lessons
              </Button>
        </div>
      </div>
    );
  }

  const isCompleted = progress.completedLessons.includes(lesson.id);

  const handleComplete = () => {
    // Check if there are activities to complete first
    if (lesson.dragDropActivity && !activitiesCompleted.dragDrop && !showDragDrop) {
      setShowDragDrop(true);
      return;
    }

    if (lesson.checklistActivity && !activitiesCompleted.checklist && !showChecklist) {
      setShowChecklist(true);
      return;
    }

    if (lesson.quiz && !quizCompleted) {
      setShowQuiz(true);
      return;
    }
    
    if (!isPracticeMode) {
      completeLesson(lesson.id);
      updateStreak();
      toast.success(t("congratulations"), {
        description: "You've completed this lesson and earned 100 points!",
      });
      navigate("/badges");
    } else {
      toast.success("Practice session completed!", {
        description: "Great review! Your completion status is preserved.",
      });
      navigate("/lessons");
    }
  };

  const handleRetake = () => {
    setIsPracticeMode(true);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setShowQuiz(false);
    setShowDragDrop(false);
    setShowChecklist(false);
    setActivitiesCompleted({ dragDrop: false, checklist: false });
    
    // Generate new randomized content
    if (lesson) {
      if (lesson.quiz) {
        setRandomizedQuiz(shuffleQuizQuestions(lesson.quiz));
      }
      if (lesson.dragDropActivity) {
        setRandomizedDragDrop(shuffleDragDropItems(lesson.dragDropActivity));
      }
      if (lesson.checklistActivity) {
        setRandomizedChecklist(shuffleChecklistItems(lesson.checklistActivity));
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("🔄 Practice Mode Activated", {
      description: "Questions and activities randomized for better learning",
    });
  };

  const handleQuizAnswer = () => {
    if (selectedAnswer === null) return;

    const quiz = randomizedQuiz || lesson.quiz!;
    const currentQuestion = quiz[quizIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      toast.success("Correct! 🎉", {
        description: "Great job! Keep going!",
      });
      
      if (quizIndex < quiz.length - 1) {
        setQuizIndex(quizIndex + 1);
        setSelectedAnswer(null);
      } else {
        setQuizCompleted(true);
        setShowQuiz(false);
        toast.success("Quiz completed! Amazing work!", {
          description: "You've mastered this lesson content.",
        });
        handleComplete();
      }
    } else {
      toast.error("Not quite right!", {
        description: "Think about it and try again. You can do it!",
      });
    }
  };

  const handlePlayVoice = async () => {
    if (!lesson) return;

    // If audio is already playing and paused, resume it
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      setIsPaused(false);
      setIsPlayingAudio(true);
      return;
    }

    try {
      setIsPlayingAudio(true);
      setIsPaused(false);
      
      // Call the text-to-speech edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: lesson.content,
          voiceId: 'EXAVITQu4vr4xnSDxMaL' // Sarah voice
        }
      });

      if (error) throw error;

      if (data?.audio) {
        // Convert base64 to audio blob
        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Play audio
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlayingAudio(false);
          setIsPaused(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setIsPaused(false);
          toast.error("Failed to play audio");
        };

        await audio.play();
        toast.success("Playing lesson audio");
      }
    } catch (error) {
      console.error('Error playing voice:', error);
      setIsPlayingAudio(false);
      setIsPaused(false);
      toast.error("Failed to generate audio", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handlePauseVoice = () => {
    if (audioRef.current && isPlayingAudio) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlayingAudio(false);
    }
  };

  const handleStopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      setIsPaused(false);
    }
  };

  if (showDragDrop && (randomizedDragDrop || lesson.dragDropActivity)) {
    const activity = randomizedDragDrop || lesson.dragDropActivity!;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/lessons")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
          <DragDropActivity
            activity={activity}
            onComplete={() => {
              setActivitiesCompleted({ ...activitiesCompleted, dragDrop: true });
              setShowDragDrop(false);
              handleComplete();
            }}
          />
        </main>
      </div>
    );
  }

  if (showChecklist && (randomizedChecklist || lesson.checklistActivity)) {
    const activity = randomizedChecklist || lesson.checklistActivity!;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/lessons")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
          <ChecklistActivity
            activity={activity}
            onComplete={() => {
              setActivitiesCompleted({ ...activitiesCompleted, checklist: true });
              setShowChecklist(false);
              handleComplete();
            }}
          />
        </main>
      </div>
    );
  }

  if (showQuiz && (randomizedQuiz || lesson.quiz)) {
    const quiz = randomizedQuiz || lesson.quiz!;
    const currentQuestion = quiz[quizIndex];
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>{t("quiz")}</CardTitle>
              <p className="text-muted-foreground">
                Question {quizIndex + 1} of {quiz.length}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto py-4"
                      onClick={() => setSelectedAnswer(index)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleQuizAnswer} 
                disabled={selectedAnswer === null}
                className="w-full"
              >
                {quizIndex < quiz.length - 1 ? t("nextQuestion") : t("finish")}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/lessons")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>

          {isCompleted && !isPracticeMode && (
            <Button
              onClick={handleRetake}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retake Lesson
            </Button>
          )}
        </div>

        {isPracticeMode && (
          <Card className="mb-6 bg-primary/5 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-primary animate-pulse" />
                <div>
                  <p className="font-semibold text-primary">Practice Mode Active</p>
                  <p className="text-sm text-muted-foreground">
                    Questions and activities randomized for better learning. Your completion status won't be affected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">{lesson.title}</CardTitle>
                <p className="text-muted-foreground">{lesson.description}</p>
              </div>
              {isCompleted && (
                <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="flex gap-2">
              <Button 
                onClick={handlePlayVoice} 
                variant="outline"
                disabled={isPlayingAudio}
              >
                {isPlayingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Playing...
                  </>
                ) : isPaused ? (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    {t("playVoice")}
                  </>
                )}
              </Button>
              {(isPlayingAudio || isPaused) && (
                <>
                  <Button 
                    onClick={handlePauseVoice} 
                    variant="outline"
                    disabled={!isPlayingAudio}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button 
                    onClick={handleStopVoice} 
                    variant="outline"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>

            {/* Lesson Diagram */}
            {lesson.diagramUrl && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img 
                  src={lesson.diagramUrl} 
                  alt={`${lesson.title} diagram`}
                  className="w-full h-auto"
                />
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold mb-4">{t("learningObjectives")}</h3>
              <ul className="space-y-2">
                {lesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="prose prose-green dark:prose-invert max-w-none">
              {lesson.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-foreground">{paragraph}</p>
              ))}
            </div>

            {/* Did You Know Box */}
            {lesson.didYouKnow && (
              <Card className="bg-gradient-to-br from-gold/20 to-accent/20 border-gold/30">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Did You Know?</p>
                      <p className="text-sm text-muted-foreground">{lesson.didYouKnow}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contextual ASDI Data Widgets */}
            <div className="space-y-4">
              <DidYouKnowBox />
              <DisasterRiskBox />
            </div>

            <Button
              onClick={handleComplete} 
              size="lg" 
              className="w-full"
              disabled={isCompleted && !isPracticeMode}
            >
              {isPracticeMode ? "Complete Practice Session" : isCompleted ? "Completed" : t("completeLesson")}
            </Button>
          </CardContent>
        </Card>
      </main>
      
      {/* ChatBot Widget */}
      <ChatBot />
    </div>
  );
};

export default LessonDetail;
