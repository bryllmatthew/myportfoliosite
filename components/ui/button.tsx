import Link from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-signal text-signal-ink hover:bg-signal-strong shadow-[0_0_0_1px_rgb(255_181_71/0.4),0_10px_30px_-12px_rgb(255_181_71/0.6)]",
        secondary: "border border-line-strong bg-ink-raised/60 text-paper hover:border-paper/50 hover:bg-surface",
        ghost: "text-muted hover:bg-surface hover:text-paper",
        danger: "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
        link: "h-auto px-0 text-paper underline decoration-signal underline-offset-4 hover:text-signal",
      },
      size: {
        sm: "h-9 rounded-full px-4 text-sm",
        md: "h-11 rounded-full px-5 text-[0.9375rem]",
        lg: "h-13 rounded-full px-7 text-base",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Variants {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, disabled, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, Variants {
  href: string;
  external?: boolean;
}

/** Link styled as a button. External links open in a new tab with safe rel attributes. */
export function ButtonLink({ className, variant, size, href, external, children, ...props }: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  const isExternal = external ?? /^https?:\/\//i.test(href);
  if (isExternal || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
        {isExternal ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
