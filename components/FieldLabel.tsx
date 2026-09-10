interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}

/** Drop-in label replacement for <select>, <textarea>, and custom fields. */
export default function FieldLabel({ children, required, htmlFor }: FieldLabelProps) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#1c1917]">
        {children}
      </label>
      {required ? (
        <span className="text-red-500 font-bold text-sm leading-none">*</span>
      ) : (
        <span className="inline-flex items-center text-[10px] font-medium text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] px-1.5 py-0.5 rounded-full leading-none">
          Optional
        </span>
      )}
    </div>
  );
}
