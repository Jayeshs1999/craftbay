import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-[#1c1917]">{label}</label>}
      <input
        ref={ref}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-[#a8a29e]
          ${error ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-[#e2e8f0] focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5]"}
          ${className}`}
        {...props}
      />
      {error    && <p className="text-xs text-red-500">{error}</p>}
      {helpText && <p className="text-xs text-[#78716c]">{helpText}</p>}
    </div>
  )
);
Input.displayName = "Input";
export default Input;
