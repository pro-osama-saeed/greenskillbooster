import { Header } from "@/components/Header";
import { LessonCard } from "@/components/LessonCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { lessons } from "@/data/lessons";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { TrackActionButton } from "@/components/TrackActionButton";

const Lessons = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 bg-gradient-section">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{t("lessons")}</h1>
              <p className="text-muted-foreground text-lg">
                Browse our collection of climate skills micro-lessons
              </p>
            </div>
            <TrackActionButton />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>

          {filteredLessons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No lessons found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Lessons;
