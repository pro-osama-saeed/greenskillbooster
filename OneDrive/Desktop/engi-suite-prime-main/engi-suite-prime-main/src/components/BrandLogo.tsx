import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

/**
 * Apex Arc Engineering icon mark (no wordmark).
 * Use inside a sized container — the image fills it via object-contain.
 */
const BrandLogo = ({ className, alt = "Apex Arc Engineering" }: BrandLogoProps) => (
  <img
    src={logoIcon}
    alt={alt}
    loading="lazy"
    width={512}
    height={512}
    className={cn("h-full w-full object-contain", className)}
  />
);

export default BrandLogo;
