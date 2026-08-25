import { ButtonHTMLAttributes, forwardRef } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?:    "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary:   "bg-[#c05621] text-white hover:bg-[#9a3e12] focus:ring-[#c05621]",
  secondary: "bg-[#f59e0b] text-white hover:bg-[#d97706] focus:ring-[#f59e0b]",
  outline:   "border border-[#c05621] text-[#c05621] hover:bg-[#fef3e8] focus:ring-[#c05621]",
  ghost:     "text-[#c05621] hover:bg-[#fef3e8] focus:ring-[#c05621]",
  danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
};
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
export default Button;
