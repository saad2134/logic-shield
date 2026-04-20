"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  Palette,
  Shield,
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { api } from "@/lib/api-app";
import { useAuth } from "@/context/auth-context";

export default function SettingsClient() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const [settings, setSettings] = React.useState({
    autoSaveDebates: true,
    showTypingIndicator: true,
    soundEffects: false,
    defaultPersona: "logical",
  });

  React.useEffect(() => {
    if (!user || authLoading) return;
    
    const loadSettings = async () => {
      try {
        console.log("Loading settings, user:", user?.email);
        const savedSettings = await api.getSettings() as Record<string, unknown>;
        setSettings(prev => ({
          ...prev,
          autoSaveDebates: savedSettings.auto_save_debates as boolean ?? prev.autoSaveDebates,
          showTypingIndicator: savedSettings.show_typing_indicator as boolean ?? prev.showTypingIndicator,
          soundEffects: savedSettings.sound_effects as boolean ?? prev.soundEffects,
          defaultPersona: savedSettings.default_persona as string ?? prev.defaultPersona,
        }));
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [user, authLoading]);

  const toggleSetting = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    try {
      await api.updateSettings({ [key === 'defaultPersona' ? 'default_persona' : camelToSnake(key)]: newValue });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
      setSettings(prev => ({ ...prev, [key]: !newValue }));
    }
  };

  const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings = {
      autoSaveDebates: true,
      showTypingIndicator: true,
      soundEffects: false,
      defaultPersona: "logical",
    };
    setSettings(defaultSettings);
    setTheme("system");
    try {
      await api.updateSettings({
        auto_save_debates: true,
        show_typing_indicator: true,
        sound_effects: false,
        default_persona: "logical",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset settings");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-start justify-end gap-4">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400">Settings saved successfully!</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          >
            <span className="text-red-600 dark:text-red-400">{error}</span>
          </motion.div>
        )}

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="text-primary" size={20} />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how LogicShield looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "light", icon: Sun, label: "Light" },
                      { value: "dark", icon: Moon, label: "Dark" },
                      { value: "system", icon: Monitor, label: "System" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={theme === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme(option.value)}
                        className="flex-1"
                      >
                        <option.icon className="mr-2 h-4 w-4" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="text-primary" size={20} />
                  Debate Preferences
                </CardTitle>
                <CardDescription>
                  Customize your debate experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="default-persona">Default Debate Persona</Label>
                  <Select
                    value={settings.defaultPersona}
                    onValueChange={async (value) => {
                      setSettings(s => ({ ...s, defaultPersona: value }));
                      try {
                        await api.updateSettings({ default_persona: value });
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to save settings");
                      }
                    }}
                  >
                    <SelectTrigger id="default-persona" className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logical">Logical</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="skeptical">Skeptical</SelectItem>
                      <SelectItem value="devil_advocate">Devil&apos;s Advocate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label htmlFor="auto-save">Auto-save Debates</Label>
                    <p className="text-sm text-muted-foreground">Automatically save ongoing debates</p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSaveDebates}
                    onCheckedChange={() => toggleSetting("autoSaveDebates")}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label htmlFor="typing-indicator">Show Typing Indicator</Label>
                    <p className="text-sm text-muted-foreground">Show when AI is generating response</p>
                  </div>
                  <Switch
                    id="typing-indicator"
                    checked={settings.showTypingIndicator}
                    onCheckedChange={() => toggleSetting("showTypingIndicator")}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label htmlFor="sound-effects">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                  </div>
                  <Switch
                    id="sound-effects"
                    checked={settings.soundEffects}
                    onCheckedChange={() => toggleSetting("soundEffects")}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="text-primary" size={20} />
                  Privacy & Data
                </CardTitle>
                <CardDescription>
                  Manage your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                  <div className="space-y-1">
                    <p className="font-medium">Export Your Data as .csv</p>
                    <p className="text-sm text-muted-foreground">Download all your debate history and analysis in the form of a .csv file</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={async () => {
                    try {
                      const data = await api.exportData();
                      const blob = new Blob([data as string], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'logic-shield-data.csv';
                      a.click();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed to export data");
                    }
                  }}>
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="space-y-1">
                    <p className="font-medium text-red-600">Delete All Data & Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete all your data and your account</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={async () => {
                    if (!confirm("Are you sure you want to delete your account and all data? This cannot be undone.")) return;
                    try {
                      await api.deleteAccount();
                      localStorage.clear();
                      window.location.href = '/';
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed to delete account");
                    }
                  }}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
