import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const buttonClasses = (variant: ButtonVariant = "primary") => {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 disabled:cursor-not-allowed disabled:opacity-60";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-rose-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-rose-500",
    outline:
      "border border-rose-200 text-rose-700 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50/60",
    ghost: "text-rose-700 hover:text-rose-800 hover:bg-rose-50/60",
  };

  return `${base} ${variants[variant]}`;
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${buttonClasses(variant)} ${className}`} {...props} />
  );
}
