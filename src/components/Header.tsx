import { Link } from "react-router-dom";
import { Leaf, Menu, User, LogOut, Globe, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LANGUAGES } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Language } from "@/i18n/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationsCenter } from "./NotificationsCenter";

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "co_admin"]);

        setIsAdmin(data && data.length > 0);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const NavLinks = () => (
    <>
      <Link to="/lessons">
        <Button variant="ghost">{t("lessons")}</Button>
      </Link>
      <Link to="/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
      <Link to="/community">
        <Button variant="ghost">Community</Button>
      </Link>
      <Link to="/badges">
        <Button variant="ghost">{t("badges")}</Button>
      </Link>
      <Link to="/leaderboard">
        <Button variant="ghost">{t("leaderboard")}</Button>
      </Link>
      <Link to="/challenges">
        <Button variant="ghost">Challenges</Button>
      </Link>
      <Link to="/teams">
        <Button variant="ghost">Teams</Button>
      </Link>
      <Link to="/forums">
        <Button variant="ghost">Forums</Button>
      </Link>
      <Link to="/about">
        <Button variant="ghost">{t("about")}</Button>
      </Link>
      <Link to="/resources">
        <Button variant="ghost">{t("resources")}</Button>
      </Link>
      {isAdmin && (
        <Link to="/admin/dashboard">
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">{t("appName")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">{LANGUAGES[language].flag} {LANGUAGES[language].nativeName}</span>
                <span className="md:hidden">{LANGUAGES[language].flag}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm mb-3">Choose Language</h4>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-1">
                    {(Object.entries(LANGUAGES) as [Language, typeof LANGUAGES[Language]][]).map(([code, lang]) => (
                      <Button
                        key={code}
                        variant={language === code ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                        onClick={() => setLanguage(code)}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{lang.nativeName}</span>
                          <span className="text-xs text-muted-foreground">{lang.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <NotificationsCenter />
              <Link to="/impact">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="hidden md:block">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
