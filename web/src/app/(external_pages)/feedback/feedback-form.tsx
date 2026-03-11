"use client";

import { Send, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { useState } from "react";

export default function FeedbackForm() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">
          How was your experience?
        </label>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setSelected("great")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors group w-24 ${selected === "great" ? "border-green-500 bg-green-500/10" : "border-border hover:border-green-500/50 hover:bg-green-500/5"}`}
          >
            <ThumbsUp className={`w-6 h-6 transition-colors ${selected === "great" ? "text-green-500" : "text-muted-foreground group-hover:text-green-500"}`} />
            <span className={`text-xs transition-colors ${selected === "great" ? "text-green-500 font-medium" : "text-muted-foreground group-hover:text-green-500"}`}>Great</span>
          </button>
          <button 
            onClick={() => setSelected("okay")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors group w-24 ${selected === "okay" ? "border-yellow-500 bg-yellow-500/10" : "border-border hover:border-yellow-500/50 hover:bg-yellow-500/5"}`}
          >
            <Meh className={`w-6 h-6 transition-colors ${selected === "okay" ? "text-yellow-500" : "text-muted-foreground group-hover:text-yellow-500"}`} />
            <span className={`text-xs transition-colors ${selected === "okay" ? "text-yellow-500 font-medium" : "text-muted-foreground group-hover:text-yellow-500"}`}>Okay</span>
          </button>
          <button 
            onClick={() => setSelected("needswork")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors group w-24 ${selected === "needswork" ? "border-red-500 bg-red-500/10" : "border-border hover:border-red-500/50 hover:bg-red-500/5"}`}
          >
            <ThumbsDown className={`w-6 h-6 transition-colors ${selected === "needswork" ? "text-red-500" : "text-muted-foreground group-hover:text-red-500"}`} />
            <span className={`text-xs transition-colors ${selected === "needswork" ? "text-red-500 font-medium" : "text-muted-foreground group-hover:text-red-500"}`}>Needs Work</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="feedback">
          What&apos;s on your mind? (optional)
        </label>
        <textarea
          id="feedback"
          rows={5}
          placeholder="Tell us what you think..."
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-5 py-3 text-primary-foreground font-medium shadow hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        Send Feedback
      </button>
    </div>
  );
}
