"use client";
import { Instagram } from "lucide-react";

interface InstagramEmbedProps {
  url: string;
}

function isValidInstagramUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.hostname.includes("instagram.com") && /^\/(p|reel|tv)\//.test(u.pathname);
  } catch {
    return false;
  }
}

export default function InstagramEmbed({ url }: InstagramEmbedProps) {
  if (!isValidInstagramUrl(url)) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex items-center gap-2.5 w-full rounded-xl border border-[#fce4ec] bg-[#fff0f4] px-4 py-2.5 hover:bg-[#ffd6e2] hover:border-[#e1306c] transition-all group"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0">
        <Instagram size={14} className="text-white" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#1c1917] leading-tight">See this product on Instagram</p>
        <p className="text-[11px] text-[#78716c] leading-tight mt-0.5">{url}</p>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#e1306c] shrink-0 group-hover:translate-x-0.5 transition-transform"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
    </a>
  );
}
