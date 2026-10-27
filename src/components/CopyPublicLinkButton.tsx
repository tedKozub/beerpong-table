"use client";

import { useToast } from "@/hooks/use-toast";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyPublicLinkButtonProps {
  roundId: number;
}

export function CopyPublicLinkButton({ roundId }: CopyPublicLinkButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/public/rounds/${roundId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Odkaz zkopírován",
        description: "Veřejný odkaz na výsledky kola byl zkopírován do schránky.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Nepodařilo se zkopírovat",
        description: url,
        variant: "destructive",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-outline btn-sm text-xs gap-1.5"
      title="Zkopírovat veřejný odkaz na toto kolo"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-success" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      <span>{copied ? "Zkopírováno!" : "Kopírovat veřejný odkaz"}</span>
    </button>
  );
}
