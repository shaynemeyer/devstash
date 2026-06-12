"use client";

import { Loader2, Sparkles, Crown } from "lucide-react";

interface AIFeatureButtonProps {
  label: string;
  loadingLabel: string;
  loading: boolean;
  isPro?: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: "xs" | "sm";
}

export function AIFeatureButton({
  label,
  loadingLabel,
  loading,
  isPro,
  onClick,
  disabled,
  size = "sm",
}: AIFeatureButtonProps) {
  const textSize = size === "xs" ? "text-xs" : "text-sm";

  if (isPro) {
    return (
      <button
        onClick={onClick}
        disabled={loading || disabled}
        className={`flex items-center gap-1 ${textSize} text-[#858585] hover:text-[#cccccc] transition-colors disabled:opacity-50`}
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
        <span>{loading ? loadingLabel : label}</span>
      </button>
    );
  }

  return (
    <span
      title="AI features require Pro subscription"
      className={`flex items-center gap-1 ${textSize} text-[#858585] opacity-50 cursor-default`}
    >
      <Crown className="size-3.5" />
      <span>{label}</span>
    </span>
  );
}
