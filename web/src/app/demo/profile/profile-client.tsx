"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Settings,
  Shield,
  Brain,
  MessageSquare,
  TrendingUp,
  Award,
  Calendar,
  Edit2,
  Save,
  X,
  BarChart3,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function ProfileClient() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [userData, setUserData] = React.useState({
    name: "Demo User",
    email: "demo@logicshield.app",
    bio: "Passionate about critical thinking and logical discourse.",
    occupation: "Student",
    interests: "Philosophy, Debate, AI Ethics",
  });

  const [editData, setEditData] = React.useState({ ...userData });

  const stats = {
    totalDebates: 24,
    winRate: 68,
    avgArgumentStrength: 78,
    fallaciesAvoided: 156,
    streak: 5,
    totalArguments: 89,
  };

  const achievements = [
    { id: 1, title: "First Debate", description: "Complete your first debate", icon: MessageSquare, earned: true },
    { id: 2, title: "Fallacy Buster", description: "Avoid 10 fallacies in debates", icon: Shield, earned: true },
    { id: 3, title: "Logic Master", description: "Achieve 90%+ argument strength", icon: Brain, earned: true },
    { id: 4, title: "Streak Champion", description: "7-day debate streak", icon: Zap, earned: false },
    { id: 5, title: "Risk Aware", description: "Complete 50 debates with low risk", icon: AlertTriangle, earned: false },
    { id: 6, title: "Top Debater", description: "Win 100 debates", icon: Award, earned: false },
  ];

  const skillLevels = [
    { name: "Logical Reasoning", level: 75, color: "bg-blue-500" },
    { name: "Argument Construction", level: 82, color: "bg-green-500" },
    { name: "Evidence Usage", level: 68, color: "bg-purple-500" },
    { name: "Fallacy Detection", level: 90, color: "bg-orange-500" },
    { name: "Reputation Management", level: 72, color: "bg-pink-500" },
  ];

  const recentActivity = [
    { type: "debate", title: "Debate: AI Ethics", date: "2 hours ago", result: "Win" },
    { type: "analysis", title: "Analysis: Climate Policy", date: "5 hours ago", result: "85% Strength" },
    { type: "debate", title: "Debate: Remote Work", date: "1 day ago", result: "Win" },
    { type: "achievement", title: "Earned: Logic Master", date: "2 days ago", result: "Badge" },
  ];

  const handleEdit = () => {
    setEditData({ ...userData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUserData({ ...editData });
    setIsSaving(false);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and track your debate performance
              </p>
            </div>
            {!isEditing && (
              <Button variant="outline" asChild>
                <Link href="/demo/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            )}
          </div>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400">Profile updated successfully!</span>
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
                        {editData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
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
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="your@email.com"
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
                            <Save className="mr-2 h-4 w-4 animate-spin" />
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
                        {userData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <h2 className="text-xl font-bold">{userData.name}</h2>
                      <p className="text-muted-foreground">{userData.email}</p>
                      <p className="text-sm text-muted-foreground mt-2 text-center">{userData.bio}</p>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="space-y-3">
                        {userData.occupation && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{userData.occupation}</span>
                          </div>
                        )}
                        {userData.interests && (
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>{userData.interests}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {!isEditing && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-3">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-primary">{stats.totalDebates}</div>
                        <div className="text-xs text-muted-foreground">Debates</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-green-500">{stats.winRate}%</div>
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-blue-500">{stats.streak}</div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-purple-500">{stats.fallaciesAvoided}</div>
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
                          <achievement.icon className={`h-5 w-5 ${
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
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-primary" size={20} />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {activity.type === "debate" && <MessageSquare className="h-5 w-5 text-primary" />}
                          {activity.type === "analysis" && <Brain className="h-5 w-5 text-blue-500" />}
                          {activity.type === "achievement" && <Award className="h-5 w-5 text-yellow-500" />}
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.date}</p>
                          </div>
                        </div>
                        <Badge variant={activity.result === "Win" ? "default" : "secondary"}>
                          {activity.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
