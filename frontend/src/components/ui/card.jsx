import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("audit-card", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-5 flex items-start justify-between gap-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn("text-xl font-black text-[#FFF6E0]", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn(className)} {...props} />;
}
