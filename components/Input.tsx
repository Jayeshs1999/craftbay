import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = "", required, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-[#1c1917]">{label.replace(/\s*\*$/, "")}</label>
          {required ? (
            <span className="text-red-500 font-bold text-sm leading-none">*</span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-medium text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] px-1.5 py-0.5 rounded-full leading-none">
              Optional
            </span>
          )}
        </div>
      )}
      <input
        ref={ref}
        required={required}
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
