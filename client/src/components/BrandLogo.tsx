import { cn } from "../lib/utils";

type BrandLogoProps = {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  showText?: boolean;
  theme?: "light" | "dark";
};

const BrandLogo = ({
  className,
  textClassName,
  iconClassName,
  showText = true,
  theme = "light",
}: BrandLogoProps) => {
  const isDark = theme === "dark";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md font-heading text-xs font-bold tracking-wider",
          isDark ? "bg-accent text-accent-foreground" : "bg-foreground text-primary-foreground",
          iconClassName,
        )}
        aria-hidden="true"
      >
        EB
      </span>
      {showText && (
        <span
          className={cn(
            "font-heading font-bold tracking-tight",
            isDark ? "text-primary-foreground" : "text-foreground",
            textClassName,
          )}
        >
          EpixBox
        </span>
      )}
    </span>
  );
};

export default BrandLogo;
