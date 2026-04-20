import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  outline: "bg-transparent text-slate-600 border-slate-300",
};

const sizeStyles = {
  sm: "text-[11px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border border-transparent whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
