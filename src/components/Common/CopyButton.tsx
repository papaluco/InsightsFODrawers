import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "./Icons";

interface CopyButtonProps {
  onCopy: () => Promise<void> | void;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  onCopy,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    await onCopy();

    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? copiedLabel : label}
      aria-label={copied ? copiedLabel : label}
      className={`flex items-center justify-center w-[40px] h-[40px] bg-white rounded-lg hover:shadow-sm transition-all group border-none ${className}`}
    >
      {copied ? (
        <CheckIcon size={24} className="text-emerald-600 transition-colors" />
      ) : (
        <CopyIcon
          size={24}
          className="text-gray-500 group-hover:text-indigo-600 transition-colors"
        />
      )}
    </button>
  );
};