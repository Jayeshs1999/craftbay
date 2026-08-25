"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className="inline-flex items-center gap-1 text-sm text-[#64748b] hover:text-[#059669] transition-colors mb-6 group"
    >
      <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </button>
  );
}