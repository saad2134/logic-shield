"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Settings,
  Shield,
  Brain,
  MessageSquare,
  Award,
  Calendar,
  Edit2,
  Save,
  X,
  BarChart3,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { api, UserStats, Achievement } from "@/lib/api-app";

export default function ProfileClient() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const [editData, setEditData] = React.useState({
    name: user?.full_name || "",
    bio: user?.bio || "",
    occupation: user?.occupation || "",
    interests: user?.interests || "",
  });

  React.useEffect(() => {
    async function loadData() {
      try {
        const [statsData, achievementsData] = await Promise.all([
          api.getUserStats().catch(() => null),
          api.getUserAchievements().catch(() => []),
        ]);
        setStats(statsData);
        setAchievements(achievementsData);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (user) {
      setEditData({
        name: user.full_name || "",
        bio: user.bio || "",
        occupation: user.occupation || "",
        interests: user.interests || "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setEditData({
      name: user?.full_name || "",
      bio: user?.bio || "",
      occupation: user?.occupation || "",
      interests: user?.interests || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await api.updateProfile({
        full_name: editData.name,
        bio: editData.bio,
        occupation: editData.occupation,
        interests: editData.interests,
      });
      await refreshUser();
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const skillLevels = [
    { name: "Logical Reasoning", level: stats ? Math.round(stats.avg_argument_strength * 100 * 0.8) : 75, color: "bg-blue-500" },
    { name: "Argument Construction", level: stats ? Math.round(stats.avg_argument_strength * 100) : 82, color: "bg-green-500" },
    { name: "Evidence Usage", level: stats ? Math.round(stats.avg_argument_strength * 100 * 0.7) : 68, color: "bg-purple-500" },
    { name: "Fallacy Detection", level: stats ? Math.round(100 - (stats.fallacy_count / (stats.total_arguments || 1) * 100)) : 90, color: "bg-orange-500" },
    { name: "Reputation Management", level: 72, color: "bg-pink-500" },
  ];

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400">Profile updated successfully!</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 flex items-center gap-2"
          >
            <span className="text-red-600 dark:text-red-400">{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-3xl font-bold text-white">
                        {editData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editData.bio}
                          onChange={(e) => handleChange("bio", e.target.value)}
                          placeholder="Tell us about yourself"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          value={editData.occupation}
                          onChange={(e) => handleChange("occupation", e.target.value)}
                          placeholder="Your occupation"
                        />
                      </div>
                      <div>
                        <Label htmlFor="interests">Interests</Label>
                        <Input
                          id="interests"
                          value={editData.interests}
                          onChange={(e) => handleChange("interests", e.target.value)}
                          placeholder="Your interests"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-3xl font-bold text-white mb-4">
                        {initials}
                      </div>
                      <h2 className="text-xl font-bold">{user?.full_name || user?.email}</h2>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <p className="text-sm text-muted-foreground mt-2 text-center">{user?.bio || "No bio yet"}</p>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="space-y-3">
                        {user?.occupation && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{user.occupation}</span>
                          </div>
                        )}
                        {user?.interests && (
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>{user.interests}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {!isEditing && stats && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-3">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-primary">{stats.total_debates}</div>
                        <div className="text-xs text-muted-foreground">Debates</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-green-500">{stats.win_rate}%</div>
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-blue-500">{stats.current_streak}</div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-purple-500">{stats.fallacy_count}</div>
                        <div className="text-xs text-muted-foreground">Fallacies Caught</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="text-primary" size={20} />
                    Skills Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillLevels.map((skill) => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="text-primary" size={20} />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {achievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-3 rounded-lg border text-center ${
                            achievement.earned
                              ? "bg-primary/5 border-primary/20"
                              : "bg-muted/50 opacity-60"
                          }`}
                        >
                          <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            achievement.earned ? "bg-primary/10" : "bg-muted"
                          }`}>
                            <Award className={`h-5 w-5 ${
                              achievement.earned ? "text-primary" : "text-muted-foreground"
                            }`} />
                          </div>
                          <h4 className="font-medium text-sm">{achievement.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{achievement.description}</p>
                          {achievement.earned && (
                            <Badge variant="secondary" className="mt-2 text-xs">Earned</Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Complete debates to earn achievements!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
