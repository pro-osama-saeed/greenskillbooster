import { Link } from "react-router-dom";
import { Leaf, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
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

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();

  const NavLinks = () => (
    <>
      <Link to="/lessons">
        <Button variant="ghost">{t("lessons")}</Button>
      </Link>
      <Link to="/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
      <Link to="/badges">
        <Button variant="ghost">{t("badges")}</Button>
      </Link>
      <Link to="/leaderboard">
        <Button variant="ghost">{t("leaderboard")}</Button>
      </Link>
      <Link to="/about">
        <Button variant="ghost">{t("about")}</Button>
      </Link>
      <Link to="/resources">
        <Button variant="ghost">{t("resources")}</Button>
      </Link>
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
          <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="sw">Kiswahili</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
            </SelectContent>
          </Select>

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
