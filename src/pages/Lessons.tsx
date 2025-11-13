import { Header } from "@/components/Header";
import { LessonCard } from "@/components/LessonCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { lessons } from "@/data/lessons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Lightbulb, SlidersHorizontal } from "lucide-react";
import { TrackActionButton } from "@/components/TrackActionButton";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const Lessons = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title");
  
  useKeyboardShortcuts();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "solar", label: "☀️ Solar Energy" },
    { value: "water", label: "💧 Water Conservation" },
    { value: "trees", label: "🌳 Trees & Biodiversity" },
    { value: "energy", label: "⚡ Energy Efficiency" },
    { value: "waste", label: "♻️ Waste Management" },
    { value: "community", label: "👥 Community Action" },
    { value: "communication", label: "📢 Communication" },
  ];

  const sortOptions = [
    { value: "title", label: "Title (A-Z)" },
    { value: "duration", label: "Duration (Shortest)" },
    { value: "category", label: "Category" },
  ];

  let filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort lessons
  filteredLessons = [...filteredLessons].sort((a, b) => {
    switch (sortBy) {
      case "duration":
        return a.duration - b.duration;
      case "category":
        return a.category.localeCompare(b.category);
      case "title":
      default:
        return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 bg-gradient-section">
        <div className="space-y-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{t("lessons")}</h1>
              <p className="text-muted-foreground text-lg">
                Browse our collection of climate skills micro-lessons
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/suggest-lesson")}
                variant="outline"
                size="lg"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggest Lesson
              </Button>
              <TrackActionButton />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search lessons... (Press '/' to focus)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(selectedCategory !== "all" || searchTerm) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} found
              </span>
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="ml-1 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear all
                </Button>
              )}
            </div>
          )}

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
