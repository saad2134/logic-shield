"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  History,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
  Zap,
  Trash2,
  MoreVertical,
  Filter,
  X,
  ArrowUpDown
} from "lucide-react";
import { api, DebateSession } from "@/lib/api-app";
import { useAuth } from "@/context/auth-context";

const ITEMS_PER_PAGE = 5;

export default function HistoryClient() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = React.useState<DebateSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"latest" | "oldest">("latest");
  const [filterStances, setFilterStances] = React.useState<string[]>([]);
  const [filterPersonas, setFilterPersonas] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const loadDebates = async (currentOffset: number, append: boolean = false, newSortBy?: string, newStance?: string[], newPersona?: string[]) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      const data = await api.getUserDebates(
        ITEMS_PER_PAGE, 
        currentOffset, 
        newSortBy || sortBy, 
        newStance ? newStance.join(",") : (filterStances.length > 0 ? filterStances.join(",") : undefined), 
        newPersona ? newPersona.join(",") : (filterPersonas.length > 0 ? filterPersonas.join(",") : undefined)
      );
      if (append) {
        setSessions(prev => [...prev, ...data.debates]);
      } else {
        setSessions(data.debates);
      }
      setTotal(data.total);
      setHasMore(currentOffset + ITEMS_PER_PAGE < data.total);
      setOffset(currentOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  React.useEffect(() => {
    if (!user || authLoading) return;
    loadDebates(0, false, sortBy, filterStances, filterPersonas);
  }, [user, authLoading]);

  const handleSortChange = (newSortBy: "latest" | "oldest") => {
    setSortBy(newSortBy);
    setSessions([]);
    setOffset(0);
    loadDebates(0, false, newSortBy, filterStances, filterPersonas);
  };

  const handleStanceFilter = (stance: string, checked: boolean) => {
    let newStances: string[];
    if (checked) {
      newStances = [...filterStances, stance];
    } else {
      newStances = filterStances.filter(s => s !== stance);
    }
    setFilterStances(newStances);
    setSessions([]);
    setOffset(0);
    loadDebates(0, false, sortBy, newStances, filterPersonas);
  };

  const handlePersonaFilter = (persona: string, checked: boolean) => {
    let newPersonas: string[];
    if (checked) {
      newPersonas = [...filterPersonas, persona];
    } else {
      newPersonas = filterPersonas.filter(p => p !== persona);
    }
    setFilterPersonas(newPersonas);
    setSessions([]);
    setOffset(0);
    loadDebates(0, false, sortBy, filterStances, newPersonas);
  };

  const handleClearFilters = () => {
    setFilterStances([]);
    setFilterPersonas([]);
    setSortBy("latest");
    setSessions([]);
    setOffset(0);
    loadDebates(0, false, "latest", [], []);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadDebates(offset + ITEMS_PER_PAGE, true, sortBy, filterStances, filterPersonas);
    }
  };

  const handleDelete = async (sessionId: number) => {
    if (!confirm("Are you sure you want to delete this debate session?")) return;
    
    try {
      await api.deleteDebate(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete debate");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStanceColor = (stance: string) => {
    switch (stance.toLowerCase()) {
      case "support":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "oppose":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Debate History</h1>
              <p className="text-muted-foreground mt-1">
                {total > 0 ? `View and review your ${total} past debate sessions` : "View and review your past debate sessions"}
              </p>
            </div>
            <Button asChild>
              <Link href="/app/debate">
                <Zap className="mr-2 h-4 w-4" />
                New Debate
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Select value={sortBy} onValueChange={(v) => handleSortChange(v as "latest" | "oldest")}>
              <SelectTrigger className={sortBy !== "latest" ? "border-primary" : ""}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={filterStances.length > 0 || filterPersonas.length > 0 ? "border-primary" : ""}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {(filterStances.length > 0 || filterPersonas.length > 0) && (
                    <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <div className="p-2">
                  <div className="text-sm font-medium mb-2">Your Stance</div>
                  <div className="space-y-2 mb-4">
                    {["support", "oppose", "neutral"].map((stance) => (
                      <div key={stance} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`stance-${stance}`}
                          checked={filterStances.includes(stance)}
                          onCheckedChange={(checked) => handleStanceFilter(stance, checked as boolean)}
                        />
                        <label htmlFor={`stance-${stance}`} className="text-sm capitalize cursor-pointer">
                          {stance}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium mb-2">Opponent Persona</div>
                  <div className="space-y-2">
                    {[
                      { value: "logical", label: "Logical" },
                      { value: "aggressive", label: "Aggressive" },
                      { value: "skeptical", label: "Skeptical" },
                      { value: "devil_advocate", label: "Devil Advocate" }
                    ].map((persona) => (
                      <div key={persona.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`persona-${persona.value}`}
                          checked={filterPersonas.includes(persona.value)}
                          onCheckedChange={(checked) => handlePersonaFilter(persona.value, checked as boolean)}
                        />
                        <label htmlFor={`persona-${persona.value}`} className="text-sm cursor-pointer">
                          {persona.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            {(filterStances.length > 0 || filterPersonas.length > 0) && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
          {(filterStances.length > 0 || filterPersonas.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {filterStances.map((stance) => (
                <Badge key={stance} variant="secondary" className="cursor-pointer" onClick={() => handleStanceFilter(stance, false)}>
                  {stance} <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {filterPersonas.map((persona) => (
                <Badge key={persona} variant="secondary" className="cursor-pointer" onClick={() => handlePersonaFilter(persona, false)}>
                  {persona.replace("_", " ")} <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="outline" className={getStanceColor(session.user_stance)}>
                            {session.user_stance}
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {session.opponent_persona?.replace("_", " ") || "logical"}
                          </Badge>
                          {session.ended_at && (
                            <Badge variant="outline">Completed</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                          {session.topic}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(session.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/app/debate/${session.id}`}>
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Debates Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
                Start your first debate to see your history here
              </p>
              <Button asChild>
                <Link href="/app/debate">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Your First Debate
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
