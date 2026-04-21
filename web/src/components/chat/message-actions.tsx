"use client";

import * as React from "react";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Volume2, 
  Copy, 
  RefreshCw,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  content: string;
  isFromUser: boolean;
  onRegenerate?: () => void;
}

export function MessageActions({ content, isFromUser, onRegenerate }: MessageActionsProps) {
  const [liked, setLiked] = React.useState<boolean | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const speechRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const handleLike = () => {
    setLiked(liked === true ? null : true);
  };

  const handleDislike = () => {
    setLiked(liked === false ? null : false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 1;
      utterance.onend = () => setSpeaking(false);
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 ${liked === true ? "text-green-500" : "text-muted-foreground"}`}
        onClick={handleLike}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 ${liked === false ? "text-red-500" : "text-muted-foreground"}`}
        onClick={handleDislike}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 ${speaking ? "text-blue-500" : "text-muted-foreground"}`}
        onClick={handleReadAloud}
      >
        <Volume2 className="h-3 w-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-muted-foreground"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      </Button>
      
      {!isFromUser && onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground"
          onClick={handleRegenerate}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
}