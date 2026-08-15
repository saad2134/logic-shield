"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Shield,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Send,
  ArrowLeft,
  X,
  Brain,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Radio,
  Sliders,
  Trash2,
  Volume2
} from "lucide-react";
import { api, AnalysisResult, DebateSession } from "@/lib/api-app";
import { RealTimeCoach } from "@/components/coach";
import { MessageActions } from "@/components/chat/message-actions";

interface Message {
  id: number;
  content: string;
  isFromUser: boolean;
  analysis?: AnalysisResult;
}

export default function DebateSessionClient() {
  const router = useRouter();
  const params = useParams();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = React.useState<DebateSession | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = React.useState<number | null>(null);
  const [difficulty, setDifficulty] = React.useState<"basic" | "intermediate" | "advanced">("intermediate");
  const [liveCoachEnabled, setLiveCoachEnabled] = React.useState(true);
  const [autoReadAloud, setAutoReadAloud] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Voice Debate Mode states & refs
  const [isListening, setIsListening] = React.useState(false);
  const [autoSubmit, setAutoSubmit] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioClips, setAudioClips] = React.useState<{ id: number; url: string; label: string }[]>([]);
  const [speechRate, setSpeechRate] = React.useState(1);
  const [speechPitch, setSpeechPitch] = React.useState(1);
  const [availableVoices, setAvailableVoices] = React.useState<any[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = React.useState<string>("");
  const [voiceSettingsOpen, setVoiceSettingsOpen] = React.useState(false);
  const [voiceModeActive, setVoiceModeActive] = React.useState(false);
  const [voiceState, setVoiceState] = React.useState<"listening" | "thinking" | "speaking" | "paused">("paused");
  const [voiceTranscript, setVoiceTranscript] = React.useState("");
  const [userVoiceTranscript, setUserVoiceTranscript] = React.useState("");
  const [opponentVoiceTranscript, setOpponentVoiceTranscript] = React.useState("");
  const [voiceError, setVoiceError] = React.useState<string | null>(null);

  const voiceModeActiveRef = React.useRef(voiceModeActive);
  const voiceStateRef = React.useRef(voiceState);

  React.useEffect(() => {
    voiceModeActiveRef.current = voiceModeActive;
  }, [voiceModeActive]);

  React.useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  const mediaRecorderRef = React.useRef<any>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const recognitionRef = React.useRef<any>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioContextRef = React.useRef<any>(null);
  const analyserRef = React.useRef<any>(null);

  const inputRef = React.useRef(input);
  const autoSubmitRef = React.useRef(autoSubmit);
  const isSendingRef = React.useRef(isSending);
  const triggerSendRef = React.useRef<(() => void) | undefined>(undefined);
  const speechTranscriptRef = React.useRef("");
  const handleSendVoiceRef = React.useRef<((text: string) => void) | undefined>(undefined);
  const isRecognitionActiveRef = React.useRef(false);

  React.useEffect(() => {
    inputRef.current = input;
  }, [input]);

  React.useEffect(() => {
    autoSubmitRef.current = autoSubmit;
  }, [autoSubmit]);

  React.useEffect(() => {
    isSendingRef.current = isSending;
  }, [isSending]);

  React.useEffect(() => {
    handleSendVoiceRef.current = handleSendVoice;
  });

  // Load available voices for text-to-speech
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const defaultVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
        if (defaultVoice && !selectedVoiceName) {
          setSelectedVoiceName(defaultVoice.name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceName]);

  // Speech Recognition (STT) setup
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          isRecognitionActiveRef.current = true;
          if (voiceModeActiveRef.current) {
            speechTranscriptRef.current = "";
            setVoiceTranscript("");
          }
        };

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (voiceModeActiveRef.current) {
            const currentTranscript = interimTranscript || finalTranscript;
            setVoiceTranscript(currentTranscript);
          }

          if (finalTranscript) {
            const trimmed = finalTranscript.trim();
            setInput((prev) => {
              const base = prev.trim();
              return base ? `${base} ${trimmed}` : trimmed;
            });
            speechTranscriptRef.current = speechTranscriptRef.current
              ? `${speechTranscriptRef.current} ${trimmed}`
              : trimmed;
          }
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          isRecognitionActiveRef.current = false;

          if (voiceModeActiveRef.current) {
            if (event.error === "audio-capture") {
              setVoiceError("Microphone capture failed. Please ensure your microphone is plugged in, not muted, and not in use by another app or tab.");
            } else if (event.error === "not-allowed") {
              setVoiceError("Microphone access denied. Please click the camera/microphone icon in your address bar and allow permission.");
            } else if (event.error !== "no-speech") {
              setVoiceError(`Voice detection failed: ${event.error}. Please check your connection and system microphone settings.`);
            }
          } else {
            if (event.error !== "no-speech") {
              setError(`Speech recognition error: ${event.error}`);
            }
          }
        };

        rec.onend = () => {
          setIsListening(false);
          isRecognitionActiveRef.current = false;

          if (voiceModeActiveRef.current) {
            const textToSend = speechTranscriptRef.current.trim();
            if (textToSend && !isSendingRef.current) {
              handleSendVoiceRef.current?.(textToSend);
            } else if (voiceStateRef.current === "listening") {
              // Restart Speech Recognition if user was silent and we're still in listening state
              setTimeout(() => {
                if (voiceModeActiveRef.current && voiceStateRef.current === "listening" && !isRecognitionActiveRef.current) {
                  try {
                    isRecognitionActiveRef.current = true;
                    rec.start();
                  } catch (e) {
                    isRecognitionActiveRef.current = false;
                    console.error("Failed to auto-restart recognition:", e);
                  }
                }
              }, 300);
            }
          } else {
            if (autoSubmitRef.current && inputRef.current.trim() && !isSendingRef.current) {
              triggerSendRef.current?.();
            }
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Sync handleSend to trigger ref
  React.useEffect(() => {
    triggerSendRef.current = handleSend;
  }, [input, isSending, sessionId, session, autoReadAloud, selectedVoiceName, availableVoices, speechRate, speechPitch]);

  const releaseUserMedia = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) { }
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) { }
    }
  };

  const startSpeechRecognition = (autoSubmitMode: boolean) => {
    if (!recognitionRef.current) return;
    if (isRecognitionActiveRef.current) return;

    // Stop active recording first to release microphone resource lock
    if (isRecording) {
      stopRecording();
    }

    window.speechSynthesis.cancel();
    recognitionRef.current.continuous = !autoSubmitMode;
    try {
      isRecognitionActiveRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      isRecognitionActiveRef.current = false;
      console.error(e);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      startSpeechRecognition(autoSubmit);
    }
  };

  // Recording Microphone audio logic (Practice Review)
  const startRecording = async () => {
    // Stop speech recognition first to avoid NotReadableError resource collision
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
      setIsListening(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const clipNum = audioClips.length + 1;
        setAudioClips((prev) => [
          ...prev,
          {
            id: Date.now(),
            url,
            label: `Recorded Argument #${clipNum}`,
          },
        ]);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone recording failed:", err);
      setError("Microphone permission denied or recording failed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const deleteClip = (id: number) => {
    setAudioClips((prev) => prev.filter((clip) => clip.id !== id));
  };

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await api.getSettings() as Record<string, unknown>;
        setLiveCoachEnabled(settings.live_coach as boolean ?? true);
        setAutoReadAloud(settings.auto_read_aloud as boolean ?? false);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  React.useEffect(() => {
    async function loadSession() {
      try {
        const data = await api.getDebateHistory(sessionId);
        setSession(data.session);

        const loadedMessages: Message[] = data.arguments.map((arg, idx) => ({
          id: arg.id,
          content: arg.content,
          isFromUser: arg.is_from_user,
          analysis: data.analysis[idx] || undefined,
        }));
        setMessages(loadedMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load debate session");
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      isFromUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      await api.addArgument(sessionId, input);

      const counter = await api.getCounterArgument(
        sessionId,
        input,
        session?.topic || "",
        session?.user_stance || "support",
        session?.opponent_persona || "logical"
      );

      const opponentMessage: Message = {
        id: Date.now() + 1,
        content: counter.counter_argument,
        isFromUser: false,
      };

      setMessages((prev) => [...prev, opponentMessage]);

      if (autoReadAloud && counter.counter_argument) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(counter.counter_argument);
        if (selectedVoiceName) {
          const voiceObj = availableVoices.find((v) => v.name === selectedVoiceName);
          if (voiceObj) utterance.voice = voiceObj;
        }
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsSending(false);
    }
  }

  // Start Voice Recording with Web Audio API silence detection
  const startVoiceRecording = async () => {
    setVoiceError(null);
    setVoiceTranscript("Listening...");
    chunksRef.current = [];

    // Stop active recording first to release microphone resource lock
    releaseVoiceModeResources();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) {
          // Recording was too short, ignore
          return;
        }

        setVoiceState("thinking");
        setVoiceTranscript("Transcribing audio locally...");
        try {
          const res = await api.transcribeAudio(blob, session?.topic || "");
          if (res.text && res.text.trim()) {
            setUserVoiceTranscript(res.text);
            setOpponentVoiceTranscript("");
            setVoiceTranscript(`You: "${res.text}"`);
            await handleSendVoice(res.text);
          } else {
            // No speech detected, restart listening
            if (voiceModeActiveRef.current && voiceStateRef.current !== "paused") {
              setVoiceState("listening");
              setVoiceTranscript("");
              startVoiceRecording();
            }
          }
        } catch (err) {
          console.error("Local ASR error:", err);
          setVoiceError("Local transcription failed. Check backend connection.");
          setVoiceState("paused");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);

      // Web Audio API silence detection
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioCtx) {
        // Fallback: silence detection not supported, just record normally
        setIsListening(true);
        setVoiceState("listening");
        return;
      }

      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let lastSoundTime = Date.now();
      const silenceThreshold = 12; // Volume threshold (0-255)
      const silenceDuration = 1800; // 1.8 seconds of silence before auto-submission

      const checkVolume = () => {
        if (!voiceModeActiveRef.current || voiceStateRef.current !== "listening" || !streamRef.current) {
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const averageVolume = sum / bufferLength;

        const now = Date.now();
        if (averageVolume > silenceThreshold) {
          lastSoundTime = now;
        }

        if (now - lastSoundTime > silenceDuration) {
          if (recorder.state === "recording") {
            recorder.stop();
            // Release tracks
            stream.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            audioContext.close();
            audioContextRef.current = null;
          }
        } else {
          requestAnimationFrame(checkVolume);
        }
      };

      requestAnimationFrame(checkVolume);
      setIsListening(true);
      setVoiceState("listening");

    } catch (err) {
      console.error("Failed to start voice recording:", err);
      setVoiceError("Microphone access denied or setup failed. Please check permissions.");
      setVoiceState("paused");
    }
  };

  const releaseVoiceModeResources = () => {
    releaseUserMedia();
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  const handleStartVoiceMode = () => {
    window.speechSynthesis.cancel();
    setVoiceError(null);
    setVoiceModeActive(true);
    setVoiceState("listening");
    setVoiceTranscript("");
    setUserVoiceTranscript("");
    setOpponentVoiceTranscript("");
    setInput("");
    speechTranscriptRef.current = "";
    setTimeout(() => {
      startVoiceRecording();
    }, 100);
  };

  const handlePauseVoiceMode = () => {
    window.speechSynthesis.cancel();
    releaseVoiceModeResources();
    setVoiceState("paused");
  };

  const handleResumeVoiceMode = () => {
    setVoiceError(null);
    setVoiceState("listening");
    setVoiceTranscript("");
    setUserVoiceTranscript("");
    setOpponentVoiceTranscript("");
    startVoiceRecording();
  };

  const handleInterruptVoiceMode = () => {
    window.speechSynthesis.cancel();
    setVoiceError(null);
    releaseVoiceModeResources();
    setVoiceState("listening");
    setVoiceTranscript("");
    setUserVoiceTranscript("");
    setOpponentVoiceTranscript("");
    setTimeout(() => {
      startVoiceRecording();
    }, 150);
  };

  const handleExitVoiceMode = () => {
    window.speechSynthesis.cancel();
    releaseVoiceModeResources();
    setVoiceModeActive(false);
    setVoiceState("paused");
    setVoiceTranscript("");
    setUserVoiceTranscript("");
    setOpponentVoiceTranscript("");
    setInput("");
  };

  async function handleSendVoice(textToSend: string) {
    if (!textToSend.trim() || isSendingRef.current) return;

    const userMessage: Message = {
      id: Date.now(),
      content: textToSend,
      isFromUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    speechTranscriptRef.current = "";
    setVoiceTranscript("");
    setIsSending(true);
    setVoiceState("thinking");
    setError(null);

    try {
      await api.addArgument(sessionId, textToSend);

      const counter = await api.getCounterArgument(
        sessionId,
        textToSend,
        session?.topic || "",
        session?.user_stance || "support",
        session?.opponent_persona || "logical"
      );

      const opponentMessage: Message = {
        id: Date.now() + 1,
        content: counter.counter_argument,
        isFromUser: false,
      };

      setMessages((prev) => [...prev, opponentMessage]);

      if (voiceModeActiveRef.current) {
        setOpponentVoiceTranscript(counter.counter_argument);
        setVoiceTranscript(counter.counter_argument);
        setVoiceState("speaking");
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(counter.counter_argument);
        if (selectedVoiceName) {
          const voiceObj = availableVoices.find((v) => v.name === selectedVoiceName);
          if (voiceObj) utterance.voice = voiceObj;
        }
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;

        utterance.onend = () => {
          if (voiceModeActiveRef.current) {
            setVoiceState("listening");
            setVoiceTranscript("");
            startVoiceRecording();
          }
        };

        utterance.onerror = (e) => {
          if (e.error === "interrupted" || e.error === "canceled") {
            // Speech was intentionally stopped/interrupted, ignore this event
            return;
          }
          console.error("TTS error:", e);
          if (voiceModeActiveRef.current) {
            setVoiceState("listening");
            setVoiceTranscript("");
            startVoiceRecording();
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      if (voiceModeActiveRef.current) {
        setVoiceState("paused");
      }
    } finally {
      setIsSending(false);
    }
  }

  const handleRegenerate = async (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.isFromUser || !session) return;

    setIsSending(true);
    try {
      const counter = await api.getCounterArgument(
        sessionId,
        message.content,
        session.topic,
        session.user_stance,
        session.opponent_persona
      );

      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, content: counter.counter_argument }
          : m
      ));
    } catch (err) {
      setError("Failed to regenerate response");
    } finally {
      setIsSending(false);
    }
  };

  const handleEndDebate = async () => {
    try {
      await api.endDebate(sessionId);
      router.push("/app/history");
    } catch (err) {
      setError("Failed to end debate");
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-orange-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "bg-green-500/10";
      case "medium":
        return "bg-yellow-500/10";
      case "high":
        return "bg-orange-500/10";
      case "critical":
        return "bg-red-500/10";
      default:
        return "bg-gray-500/10";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/app/debate")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start New Debate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-2 lg:p-4 h-full flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <div className="flex-1 grid grid-cols-1 min-h-0">
          <Card className="flex flex-col min-h-0">
            <CardHeader className="py-3 border-b shrink-0 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="shrink-0 h-8 w-8" title="Go back">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-sm md:text-base font-bold line-clamp-1">
                    {session?.topic}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEndDebate}
                    className="h-7 px-2.5 text-xs font-semibold"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    End
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-muted-foreground pl-10">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 font-medium">
                    {session?.user_stance}
                  </Badge>
                  <Badge variant="secondary" className="capitalize text-[10px] py-0 px-1.5 font-medium">
                    {session?.opponent_persona?.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{messages.length} messages</span>
                </div>
              </div>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`flex ${message.isFromUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-4 ${message.isFromUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            {!message.isFromUser && (
                              <Brain className="h-4 w-4 mt-1 shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              {message.analysis && (
                                <motion.div
                                  initial={false}
                                  animate={{ height: showAnalysis === message.id ? "auto" : 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 pt-3 border-t border-current/20">
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center justify-between">
                                        <span>Argument Strength</span>
                                        <span className="font-medium">
                                          {Math.round(message.analysis.argument_strength * 100)}%
                                        </span>
                                      </div>
                                      <Progress value={message.analysis.argument_strength * 100} className="h-1" />

                                      {message.analysis.fallacy_detected.length > 0 && message.analysis.fallacy_detected[0] !== "no_fallacy" && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                                          <span className="text-orange-500">
                                            Fallacy: {message.analysis.fallacy_detected.join(", ")}
                                          </span>
                                        </div>
                                      )}

                                      <div className={`p-2 rounded ${getRiskBg(message.analysis.reputation_risk_level)}`}>
                                        <div className="flex items-center justify-between">
                                          <span>Risk Level</span>
                                          <span className={`font-medium capitalize ${getRiskColor(message.analysis.reputation_risk_level)}`}>
                                            {message.analysis.reputation_risk_level}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                            {message.isFromUser && (
                              <Shield className="h-4 w-4 mt-1 shrink-0" />
                            )}
                          </div>
                          {message.analysis && (
                            <button
                              onClick={() => setShowAnalysis(showAnalysis === message.id ? null : message.id)}
                              className={`mt-2 text-xs flex items-center gap-1 ${message.isFromUser
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                                }`}
                            >
                              {showAnalysis === message.id ? (
                                <>
                                  <ChevronUp className="h-3 w-3" />
                                  Hide Analysis
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  Show Analysis
                                </>
                              )}
                            </button>
                          )}

                          <MessageActions
                            content={message.content}
                            isFromUser={message.isFromUser}
                            onRegenerate={!message.isFromUser ? () => handleRegenerate(message.id) : undefined}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Ready to Debate</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Present your first argument on &quot;{session?.topic}&quot;
                    </p>
                  </div>
                )}

                {isSending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-lg p-4 max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t shrink-0 space-y-3">
              {liveCoachEnabled && (
                <RealTimeCoach
                  text={input}
                  difficulty={difficulty}
                  context={session?.topic || ""}
                  disabled={isSending}
                  quickAnalyzeFn={(text, ctx, diff) => api.quickAnalyze(text, ctx, diff)}
                />
              )}
              <div className="relative w-full">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your argument..."
                  className="min-h-[90px] w-full resize-none border-foreground/10 bg-background/30 focus:ring-primary focus:border-primary pr-28 pb-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                  {/* Voice Settings Sidebar Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVoiceSettingsOpen(!voiceSettingsOpen)}
                    className={`h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 ${voiceSettingsOpen ? "bg-foreground/5" : ""}`}
                    title="Voice Settings"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                  </Button>

                  {/* Voice Mode Launch Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStartVoiceMode}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    title="Start Voice Mode"
                  >
                    <Mic className="h-3.5 w-3.5 text-primary animate-pulse" />
                  </Button>

                  {/* Send Button */}
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    className="h-7 w-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/95"
                  >
                    {isSending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  Press Enter to send, Shift+Enter for new line
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Toggle Real-Time Coach */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Real-Time Coach:</span>
                    <input
                      type="checkbox"
                      checked={liveCoachEnabled}
                      onChange={(e) => setLiveCoachEnabled(e.target.checked)}
                      className="h-3.5 w-3.5 accent-primary cursor-pointer rounded border-foreground/10"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Coach Level:</span>
                    <Select
                      value={difficulty}
                      onValueChange={(value) => setDifficulty(value as "basic" | "intermediate" | "advanced")}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Voice Practice Suite Settings Dialog */}
          <Dialog open={voiceSettingsOpen} onOpenChange={setVoiceSettingsOpen}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto border-foreground/10 bg-background/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2 font-bold">
                  <Sliders className="h-5 w-5 text-primary" /> Voice Practice Suite
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                {/* Hands-Free Mode Toggle */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Speech Recognition (STT)</h4>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-foreground/5 bg-foreground/5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">Hands-Free Mode</span>
                      <span className="text-[10px] text-muted-foreground">Auto-submit argument on pause</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSubmit}
                      onChange={(e) => setAutoSubmit(e.target.checked)}
                      className="h-4 w-4 accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Speech Synthesis (TTS) Settings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Opponent Voice (TTS)</h4>
                  <div className="space-y-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-muted-foreground">Select Voice</label>
                      <Select value={selectedVoiceName} onValueChange={setSelectedVoiceName}>
                        <SelectTrigger className="w-full h-8 text-xs border-foreground/10 bg-background/30">
                          <SelectValue placeholder="Select system voice" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[300px]">
                          {availableVoices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name} className="text-xs">
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Speed Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Speech Rate</span>
                        <span className="font-semibold text-foreground/80">{speechRate}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Pitch Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Speech Pitch</span>
                        <span className="font-semibold text-foreground/80">{speechPitch}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                        className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-foreground/5" />

                {/* Speech Practice Recordings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Practice Recordings</h4>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">{audioClips.length}</Badge>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      className="w-full flex items-center justify-center gap-2 border-foreground/10"
                    >
                      <Radio className={`h-4 w-4 ${isRecording ? "text-red-500 animate-pulse" : "text-primary"}`} />
                      {isRecording ? "Stop Recording" : "Record Practice Audio"}
                    </Button>
                  </div>

                  {audioClips.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-foreground/10 rounded-lg bg-foreground/5">
                      <Radio className="h-6 w-6 text-muted-foreground/50 mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                        Click &quot;Record Practice Audio&quot; above to capture and self-review your speech.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {audioClips.map((clip) => (
                        <li key={clip.id} className="p-2 rounded-lg border border-foreground/5 bg-foreground/5 flex flex-col gap-1.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground/80 truncate max-w-[150px]">{clip.label}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteClip(clip.id)}
                              className="h-5 w-5 text-destructive hover:bg-destructive/10 border-foreground/5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <audio src={clip.url} controls className="w-full h-7 text-xs bg-background/50 rounded" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Fullscreen Voice Mode Overlay */}
        <AnimatePresence>
          {voiceModeActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex flex-col justify-between p-6 md:p-10 text-foreground select-none border border-border"
            >
              <style dangerouslySetInnerHTML={{
                __html: `
              @keyframes listening-pulse {
                0% { transform: scale(1); box-shadow: 0 0 40px rgba(34, 211, 238, 0.4), 0 0 80px rgba(34, 211, 238, 0.2); }
                50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(34, 211, 238, 0.7), 0 0 120px rgba(34, 211, 238, 0.4); }
                100% { transform: scale(1); box-shadow: 0 0 40px rgba(34, 211, 238, 0.4), 0 0 80px rgba(34, 211, 238, 0.2); }
              }
              @keyframes thinking-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes speaking-wave {
                0% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: scale(1); box-shadow: 0 0 40px rgba(249, 115, 22, 0.4); }
                33% { border-radius: 40% 60% 50% 50% / 50% 40% 60% 50%; transform: scale(1.03); }
                66% { border-radius: 50% 45% 60% 40% / 45% 55% 45% 55%; transform: scale(1.05); box-shadow: 0 0 60px rgba(249, 115, 22, 0.6), 0 0 100px rgba(249, 115, 22, 0.3); }
                100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: scale(1); box-shadow: 0 0 40px rgba(249, 115, 22, 0.4); }
              }
              .orb-listening {
                animation: listening-pulse 2s infinite ease-in-out;
                background: linear-gradient(135deg, #22d3ee, #10b981);
              }
              .orb-thinking {
                animation: thinking-spin 3s infinite linear;
                background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
              }
              .orb-speaking {
                animation: speaking-wave 2s infinite ease-in-out;
                background: linear-gradient(135deg, #f97316, #eab308);
              }
              .orb-paused {
                background: var(--muted);
                box-shadow: 0 0 30px var(--ring);
              }
            `}} />

              {/* Header */}
              <div className="flex items-center justify-between w-full max-w-3xl mx-auto shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                    Realtime Debate (Voice Mode)
                  </span>
                  <h2 className="text-sm md:text-base font-bold line-clamp-1 text-foreground mt-0.5">
                    {session?.topic}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExitVoiceMode}
                  className="rounded-full bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9 md:h-10 md:w-10 shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Central Orb Area */}
              <div className="flex-grow flex flex-col items-center justify-center py-6">
                <div className="relative flex items-center justify-center">
                  {/* Outer glow rings for speaking */}
                  {voiceState === "speaking" && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                      <div className="absolute -inset-4 rounded-full bg-orange-500/10 animate-pulse" style={{ animationDuration: "1.5s" }} />
                    </>
                  )}
                  {voiceState === "listening" && (
                    <div className="absolute -inset-4 rounded-full bg-cyan-500/10 animate-pulse" style={{ animationDuration: "2.5s" }} />
                  )}

                  {/* Main Interactive Orb */}
                  <button
                    onClick={() => {
                      if (voiceState === "speaking") {
                        handleInterruptVoiceMode();
                      } else if (voiceState === "listening") {
                        handlePauseVoiceMode();
                      } else if (voiceState === "paused") {
                        handleResumeVoiceMode();
                      }
                    }}
                    className={`w-36 h-36 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer focus:outline-none border-4 border-foreground/10 z-10 ${voiceState === "listening" ? "orb-listening" :
                        voiceState === "thinking" ? "orb-thinking" :
                          voiceState === "speaking" ? "orb-speaking" : "orb-paused"
                      }`}
                  >
                    <div className="rounded-full bg-foreground/5 w-full h-full flex flex-col items-center justify-center p-4">
                      {voiceState === "listening" && <Mic className="h-10 w-10 md:h-12 md:w-12 text-white animate-pulse" />}
                      {voiceState === "thinking" && <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-white animate-spin" />}
                      {voiceState === "speaking" && <Volume2 className="h-10 w-10 md:h-12 md:w-12 text-white" />}
                      {voiceState === "paused" && <MicOff className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />}
                    </div>
                  </button>
                </div>

                {/* State Label */}
                <div className="mt-8 text-center shrink-0">
                  <span className={`text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full ${voiceState === "listening" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 animate-pulse" :
                      voiceState === "thinking" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" :
                        voiceState === "speaking" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" :
                          "bg-muted text-muted-foreground border border-border"
                    }`}>
                    {voiceState === "listening" && "Listening to you"}
                    {voiceState === "thinking" && "AI is preparing argument"}
                    {voiceState === "speaking" && `${session?.opponent_persona?.toUpperCase() || "Opponent"} Speaking`}
                    {voiceState === "paused" && "Paused"}
                  </span>
                </div>
              </div>

              {/* Transcript Display Area */}
              <div className="w-full max-w-xl mx-auto h-24 md:h-32 bg-muted/40 border border-border rounded-2xl p-4 overflow-y-auto backdrop-blur-sm shrink-0 shadow-inner flex flex-col justify-center">
                {voiceError ? (
                  <div className="text-center space-y-1 select-text">
                    <div className="flex items-center justify-center gap-1.5 text-destructive font-semibold text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Microphone Error</span>
                    </div>
                    <p className="text-xs md:text-sm text-foreground/80 leading-normal">
                      {voiceError}
                    </p>
                  </div>
                ) : (userVoiceTranscript || opponentVoiceTranscript) ? (
                  <div className="space-y-2 select-text text-left max-h-full">
                    {userVoiceTranscript && (
                      <p className="text-xs md:text-sm text-cyan-600 dark:text-cyan-400 font-semibold">
                        You: <span className="font-normal italic text-foreground/85">&ldquo;{userVoiceTranscript}&rdquo;</span>
                      </p>
                    )}
                    {opponentVoiceTranscript && (
                      <p className="text-xs md:text-sm text-orange-500 font-semibold">
                        Opponent: <span className="font-normal italic text-foreground/85">&ldquo;{opponentVoiceTranscript}&rdquo;</span>
                      </p>
                    )}
                    {voiceState === "thinking" && (
                      <p className="text-[10px] md:text-xs text-muted-foreground animate-pulse italic mt-1 pl-1">
                        AI is preparing counterargument...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground italic">
                    {voiceState === "listening" && "Start speaking when ready..."}
                    {voiceState === "thinking" && "Processing..."}
                    {voiceState === "speaking" && "Loading voice..."}
                    {voiceState === "paused" && "Tap the orb to resume"}
                  </p>
                )}
              </div>

              {/* Controls Footer */}
              <div className="mt-6 md:mt-8 flex items-center justify-center gap-6 shrink-0 w-full max-w-3xl mx-auto">
                {/* Pause / Resume Button */}
                <Button
                  onClick={voiceState === "paused" ? handleResumeVoiceMode : handlePauseVoiceMode}
                  variant="outline"
                  className="rounded-full border-border bg-muted/40 hover:bg-muted text-foreground px-6 py-5 md:py-6 h-auto text-xs md:text-sm font-semibold flex items-center gap-2"
                >
                  {voiceState === "paused" ? (
                    <>
                      <Mic className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      Resume
                    </>
                  ) : (
                    <>
                      <MicOff className="h-4 w-4 text-muted-foreground" />
                      Pause
                    </>
                  )}
                </Button>

                {/* Interrupt Button (Only when speaking) */}
                {voiceState === "speaking" && (
                  <Button
                    onClick={handleInterruptVoiceMode}
                    className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 py-5 md:py-6 h-auto text-xs md:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-destructive/20"
                  >
                    <Mic className="h-4 w-4" />
                    Interrupt AI
                  </Button>
                )}

                {/* Exit Button */}
                <Button
                  onClick={handleExitVoiceMode}
                  variant="ghost"
                  className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 px-6 py-5 md:py-6 h-auto text-xs md:text-sm font-medium"
                >
                  Return to Chat
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
