import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const SiteFooter = () => (
  <footer className="border-t border-border/60 bg-gradient-surface">
    <div className="container py-12 grid gap-8 md:grid-cols-3">
      <div>
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-background ring-1 ring-border p-1">
            <BrandLogo />
          </span>
          Apex Arc Engineering
        </Link>
        <p className="mt-3 text-sm text-muted-foreground max-w-xs">
          ERP &amp; project workflow for electrical, mechanical and civil engineering firms.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Product</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/login" className="hover:text-foreground">ERP login</Link></li>
          <li><Link to="/signup" className="hover:text-foreground">Get started</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Contact</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <a href="tel:+923058906453" className="hover:text-foreground">+92 305 8906453</a>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <a href="mailto:arcengineering86@gmail.com" className="hover:text-foreground">arcengineering86@gmail.com</a>
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">FBR-aligned tax engine, NTN-ready invoices, KAPRA &amp; PEPRA support.</p>
      </div>
    </div>
    <div className="border-t border-border/60">
      <div className="container py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-center gap-2">
        <span>© {new Date().getFullYear()} Apex Arc Engineering. All rights reserved. | Made by Zintrex Studio | +923175612277</span>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
