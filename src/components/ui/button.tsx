import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-sm active:bg-brand-800",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm active:bg-slate-100",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm active:bg-red-800",
};

const sizeStyles = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-3.5 py-2 gap-2",
  lg: "text-sm px-5 py-2.5 gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
