"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  Palette,
  Bell,
  Shield,
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/api-app";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
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
    setIsLoading(false);
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  const handleReset = () => {
    setSettings({
      autoSaveDebates: true,
      showTypingIndicator: true,
      soundEffects: false,
      defaultPersona: "logical",
    });
    setTheme("system");
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">App Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your LogicShield experience
          </p>
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
                <div className="space-y-3">
                  <Label htmlFor="default-persona">Default Debate Persona</Label>
                  <Select
                    value={settings.defaultPersona}
                    onValueChange={(value) => setSettings(s => ({ ...s, defaultPersona: value }))}
                  >
                    <SelectTrigger id="default-persona">
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logical">Logical - Facts-driven</SelectItem>
                      <SelectItem value="aggressive">Aggressive - Challenging</SelectItem>
                      <SelectItem value="skeptical">Skeptical - Questioning</SelectItem>
                      <SelectItem value="devil_advocate">Devil's Advocate - Contrarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label htmlFor="auto-save">Auto-save Debates</Label>
                    <p className="text-sm text-muted-foreground">Automatically save ongoing debates</p>
                  </div>
                  <Toggle
                    pressed={settings.autoSaveDebates}
                    onPressedChange={() => toggleSetting("autoSaveDebates")}
                  >
                    {settings.autoSaveDebates ? <CheckCircle className="h-4 w-4" /> : null}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label htmlFor="typing-indicator">Show Typing Indicator</Label>
                    <p className="text-sm text-muted-foreground">Show when AI is generating response</p>
                  </div>
                  <Toggle
                    pressed={settings.showTypingIndicator}
                    onPressedChange={() => toggleSetting("showTypingIndicator")}
                  >
                    {settings.showTypingIndicator ? <CheckCircle className="h-4 w-4" /> : null}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label htmlFor="sound-effects">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                  </div>
                  <Toggle
                    pressed={settings.soundEffects}
                    onPressedChange={() => toggleSetting("soundEffects")}
                  >
                    {settings.soundEffects ? <CheckCircle className="h-4 w-4" /> : null}
                  </Toggle>
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
                    <p className="font-medium">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">Download all your debate history and analysis</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="space-y-1">
                    <p className="font-medium text-red-600">Delete All Data</p>
                    <p className="text-sm text-muted-foreground">Permanently delete all your data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-between"
          >
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
