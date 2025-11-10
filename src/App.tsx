import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatBot } from "@/components/ChatBot";
import Index from "./pages/Index";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import SuggestLesson from "./pages/SuggestLesson";
import AdminSuggestions from "./pages/AdminSuggestions";
import AdminDashboard from "./pages/AdminDashboard";
import Badges from "./pages/Badges";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import TrackAction from "./pages/TrackAction";
import Community from "./pages/Community";
import Impact from "./pages/Impact";
import Challenges from "./pages/Challenges";
import Teams from "./pages/Teams";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <ProgressProvider>
          <LocationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
  <Route path="/lessons" element={<Lessons />} />
                  <Route path="/lesson/:id" element={<LessonDetail />} />
                  <Route path="/suggest-lesson" element={<SuggestLesson />} />
                  <Route path="/admin/suggestions" element={<AdminSuggestions />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/badges" element={<Badges />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/track-action" element={<TrackAction />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/impact" element={<Impact />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/forums/:forumId/posts/:postId" element={<ForumPost />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ChatBot />
              </BrowserRouter>
            </TooltipProvider>
          </LocationProvider>
        </ProgressProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
