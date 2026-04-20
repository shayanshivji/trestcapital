import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  className,
  padding = "md",
  hover = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 shadow-sm",
        hover && "hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer",
        paddingStyles[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-sm font-semibold text-slate-900", className)}>
      {children}
    </h3>
  );
}
