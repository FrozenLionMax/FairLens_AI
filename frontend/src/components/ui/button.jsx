import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-xs font-black uppercase tracking-[0.08em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF6E0]/60 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        premium:
          "border border-[#61677A]/80 bg-gradient-to-b from-[#61677A]/85 to-[#272829] text-[#FFF6E0] shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-[#FFF6E0]/70",
        cream:
          "border border-[#272829]/45 bg-[#FFF6E0] text-[#272829] shadow-[0_14px_32px_rgba(39,40,41,0.22)] hover:-translate-y-0.5 hover:bg-[#D8D9DA]",
        ghost:
          "border border-[#61677A]/55 bg-[#272829]/35 text-[#D8D9DA] hover:-translate-y-0.5 hover:border-[#FFF6E0]/55 hover:text-[#FFF6E0]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "premium",
      size: "sm",
    },
  },
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
