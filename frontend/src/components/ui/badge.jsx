import { cn } from "../../lib/utils";

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#FFF6E0]/35 bg-[#FFF6E0]/12 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-[#FFF6E0]",
        className,
      )}
      {...props}
    />
  );
}
