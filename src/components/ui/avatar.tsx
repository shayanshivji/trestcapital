import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

const colorPairs = [
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
];

function getColorPair(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPairs[Math.abs(hash) % colorPairs.length];
}

export function Avatar({
  firstName,
  lastName,
  size = "md",
  className,
}: AvatarProps) {
  const colors = getColorPair(firstName + lastName);
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0",
        sizeStyles[size],
        colors.bg,
        colors.text,
        className
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}

export function AvatarGroup({
  people,
  max = 3,
}: {
  people: { firstName: string; lastName: string }[];
  max?: number;
}) {
  const visible = people.slice(0, max);
  const remaining = people.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((p, i) => (
        <Avatar
          key={i}
          firstName={p.firstName}
          lastName={p.lastName}
          size="sm"
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-medium flex items-center justify-center ring-2 ring-white">
          +{remaining}
        </div>
      )}
    </div>
  );
}
