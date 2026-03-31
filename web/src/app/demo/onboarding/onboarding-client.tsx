"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Target,
  Brain,
  BookOpen,
  MessageSquare,
  Sparkles
} from "lucide-react";

interface OnboardingData {
  name: string;
  experienceLevel: string;
  goals: string[];
  interests: string[];
  debateFrequency: string;
  focusAreas: string[];
}

const experienceLevels = [
  { value: "beginner", label: "Beginner", description: "New to debates and critical thinking" },
  { value: "intermediate", label: "Intermediate", description: "Some experience with debates" },
  { value: "advanced", label: "Advanced", description: "Experienced debater looking to refine skills" },
  { value: "expert", label: "Expert", description: "Professional or competitive debater" },
];

const goalOptions = [
  { id: "improve_arguments", label: "Improve argument structure", description: "Build stronger, more logical arguments" },
  { id: "detect_fallacies", label: "Detect fallacies", description: "Identify logical flaws in arguments" },
  { id: "debate_skills", label: "Practice debate skills", description: "Sharpen real-time argumentation" },
  { id: "reputation", label: "Manage reputation risk", description: "Communicate without damaging reputation" },
  { id: "career", label: "Career preparation", description: "Prepare for interviews, presentations" },
  { id: "academic", label: "Academic improvement", description: "Improve essay and debate performance" },
];

const interestOptions = [
  { id: "politics", label: "Politics & Policy" },
  { id: "technology", label: "Technology & AI" },
  { id: "ethics", label: "Ethics & Philosophy" },
  { id: "science", label: "Science & Environment" },
  { id: "business", label: "Business & Economics" },
  { id: "social", label: "Social Issues" },
];

const focusAreaOptions = [
  { id: "logical_reasoning", label: "Logical Reasoning" },
  { id: "evidence_usage", label: "Evidence & Citations" },
  { id: "persuasion", label: "Persuasion Techniques" },
  { id: "public_speaking", label: "Public Speaking" },
  { id: "critical_analysis", label: "Critical Analysis" },
];

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "few_times_month", label: "Few times a month" },
  { value: "occasionally", label: "Occasionally" },
];

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<OnboardingData>({
    name: "",
    experienceLevel: "",
    goals: [],
    interests: [],
    debateFrequency: "",
    focusAreas: [],
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateData = (field: keyof OnboardingData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof OnboardingData, item: string) => {
    const current = data[field] as string[];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateData(field, updated);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.name.trim().length > 0 && data.experienceLevel.length > 0;
      case 2:
        return data.goals.length > 0;
      case 3:
        return data.interests.length > 0;
      case 4:
        return data.debateFrequency.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push("/demo/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to LogicShield</h1>
          <p className="text-muted-foreground mt-2">Let's personalize your experience</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Step {step} of {totalSteps}</CardTitle>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Tell us about yourself</h3>
                    <p className="text-sm text-muted-foreground">We'll customize your learning path</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="name">What's your name?</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => updateData("name", e.target.value)}
                    placeholder="Enter your name"
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label>What's your experience level with debates?</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {experienceLevels.map((level) => (
                      <motion.button
                        key={level.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateData("experienceLevel", level.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          data.experienceLevel === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-muted-foreground">{level.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">What are your goals?</h3>
                    <p className="text-sm text-muted-foreground">Select all that apply</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {goalOptions.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => toggleArrayItem("goals", goal.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        data.goals.includes(goal.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={data.goals.includes(goal.id)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{goal.label}</div>
                        <div className="text-sm text-muted-foreground">{goal.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">What topics interest you?</h3>
                    <p className="text-sm text-muted-foreground">Select at least one</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <motion.button
                      key={interest.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleArrayItem("interests", interest.id)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        data.interests.includes(interest.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{interest.label}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">How often will you practice?</h3>
                    <p className="text-sm text-muted-foreground">Help us set realistic goals</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Debate practice frequency</Label>
                  <Select
                    value={data.debateFrequency}
                    onValueChange={(value) => updateData("debateFrequency", value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-4">
                  <Label>What would you like to focus on? (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {focusAreaOptions.map((area) => (
                      <div
                        key={area.id}
                        onClick={() => toggleArrayItem("focusAreas", area.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          data.focusAreas.includes(area.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox checked={data.focusAreas.includes(area.id)} />
                        <span className="text-sm">{area.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 mt-6">
                  <h4 className="font-medium mb-2">Ready to start!</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on your profile, we'll recommend the best debate personas and exercises to help you achieve your goals.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : step === totalSteps ? (
                  <>
                    Complete
                    <Check className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
