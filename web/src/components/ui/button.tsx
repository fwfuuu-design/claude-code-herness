import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "quiet";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, type = "button", variant = "secondary", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          variant === "primary" && "button-primary",
          variant === "secondary" && "button-secondary",
          variant === "quiet" &&
            "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] px-3 text-[var(--color-smoke)] transition-colors hover:text-[var(--color-chalk)]",
          className
        )}
        {...props}
      />
    );
  }
);
