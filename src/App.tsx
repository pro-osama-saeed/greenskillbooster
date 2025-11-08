import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import Index from "./pages/Index";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import Badges from "./pages/Badges";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ProgressProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/lesson/:id" element={<LessonDetail />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProgressProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
