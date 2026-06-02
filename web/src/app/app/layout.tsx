"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  MessageSquare,
  History,
  BarChart3,
  LogOut,
  Bell,
  Sun,
  Moon,
  Brain,
  Shield,
  Target,
  Zap,
  Settings,
  User,
  Loader2,
  GraduationCap,
  Compass,
  Lock
} from "lucide-react";
import AppUI from "@/components/logos/app_icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/context/auth-context";
import { Network } from "lucide-react";
import { api, LearningProgress } from "@/lib/api-app";

const appNavItems = [
  {
    items: [
      { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Debate",
    items: [
      { title: "New Debate", url: "/app/debate", icon: Zap },
      { title: "History", url: "/app/history", icon: History },
    ],
  },
  {
    title: "Academy",
    items: [
      { title: "Learning Path", url: "/app/learning-path", icon: Compass },
      { title: "Course Academy", url: "/app/academy", icon: GraduationCap },
    ],
  },
  {
    title: "Tools",
    items: [
      { title: "Argument Analysis", url: "/app/argument-analysis", icon: Target },
      { title: "Argument Mapper", url: "/app/argument-mapper", icon: Network },
      { title: "Risk Scanner", url: "/app/risk-scanner", icon: Shield },
    ],
  },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppSidebar>{children}</AppSidebar>;
}

function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { user, isLoading, logout } = useAuth();

  const [learningProgress, setLearningProgress] = React.useState<LearningProgress | null>(null);

  React.useEffect(() => {
    async function fetchProgress() {
      try {
        const data = await api.getLearningProgress();
        setLearningProgress(data);
      } catch (err) {
        console.error("Failed to load learning progress in sidebar:", err);
      }
    }
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const isQuizPending = learningProgress !== null && learningProgress.assessment === null;

  // Dynamic navigation items based on current active session
  const isDebateSession = pathname.startsWith("/app/debate/") && pathname !== "/app/debate";
  const navItems = React.useMemo(() => {
    return appNavItems.map((category) => {
      let items = [...category.items];

      if (category.title === "Academy") {
        items = items.map((item) => {
          if (item.title === "Learning Path" && isQuizPending) {
            return { ...item, isPending: true };
          }
          if (item.title === "Course Academy" && isQuizPending) {
            return { ...item, isLocked: true };
          }
          return item;
        });
      }

      if (category.title === "Debate" && isDebateSession) {
        if (!items.some((item) => item.title === "Debate Session")) {
          items = [
            ...items,
            { title: "Debate Session", url: pathname, icon: MessageSquare },
          ];
        }
      }

      return {
        ...category,
        items,
      };
    });
  }, [pathname, isDebateSession, isQuizPending]);

  React.useEffect(() => {
    if (!isLoading) {
      if (user?.experience_level && pathname === "/app/onboarding") {
        router.push("/app/dashboard");
      } else if (user && !user.experience_level && pathname !== "/app/onboarding") {
        router.push("/app/onboarding");
      }
    }
  }, [user, isLoading, pathname, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (pathname === "/app/onboarding") {
    return <>{children}</>;
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <SidebarProvider defaultOpen={true} className="h-screen">
      <Sidebar collapsible="offcanvas" className="border-r border-foreground/10 z-50">
        <SidebarHeader className="py-4">
          <div className="flex items-center gap-3 px-2">
            <AppUI className="w-10 h-10 select-none" draggable={false} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{siteConfig.name}</span>
              <span className="text-xs text-muted-foreground">{siteConfig.version}</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0">
          {navItems.map((category, idx) => (
            <SidebarGroup key={category.title || idx} className="py-1 px-2">
              {category.title && (
                <SidebarGroupLabel className="text-primary font-semibold px-2 h-6 mt-1">
                  {category.title}
                </SidebarGroupLabel>
              )}
              <SidebarMenu>
                {category.items?.map((item) => {
                  const isActive = pathname === item.url;
                  const itemWithFlags = item as any;
                  
                  if (itemWithFlags.isLocked) {
                    return (
                      <SidebarMenuItem key={item.title} className="opacity-50 cursor-not-allowed select-none">
                        <SidebarMenuButton asChild isActive={false} disabled>
                          <div className="flex items-center justify-between w-full cursor-not-allowed">
                            <div className="flex items-center gap-3">
                              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">{item.title}</span>
                            </div>
                            <span className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground/60 px-1 border border-muted-foreground/20 rounded shrink-0">
                              Locked
                            </span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={isActive ? "font-medium" : ""}>{item.title}</span>
                          </div>
                          {itemWithFlags.isPending && (
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse mr-1" title="Quiz Pending" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="p-3 border-t">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : user ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Link
                  href="/app/profile"
                  className={`flex-1 flex items-center gap-3 p-2 border border-foreground/10 rounded-lg transition-colors ${pathname === "/app/profile"
                    ? "bg-primary/50 dark:bg-primary/20 border border-primary dark:border-primary"
                    : "bg-muted/50 hover:bg-muted"
                    }`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/50 dark:bg-primary/50 flex items-center justify-center font-semibold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground">Profile</p>
                  </div>
                </Link>
                <Link
                  href="/app/settings"
                  className={`w-[60px] flex items-center justify-center  border border-foreground/10 p-2 rounded-lg transition-colors ${pathname === "/app/settings"
                    ? "bg-primary/50 dark:bg-primary/20 border border-primary dark:border-primary"
                    : "bg-muted/50 hover:bg-muted"
                    }`}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground  border border-foreground/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 h-full overflow-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-foreground/10 px-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {pathname === '/app/profile' ? 'Profile' :
                pathname === '/app/settings' ? 'Settings' :
                  navItems
                    .flatMap((cat) => cat.items || [])
                    .find((item) => item.url === pathname)?.title || "LogicShield"}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {pathname === '/app/dashboard' && 'Your personal debate dashboard'}
              {pathname === '/app/debate' && 'Challenge yourself against an AI opponent and improve your argumentation skills'}
              {pathname === '/app/history' && 'View your past debates'}
              {pathname === '/app/argument-analysis' && 'Analyze any argument for logical fallacies, strength, and reputational risks'}
              {pathname === '/app/argument-mapper' && 'Visualize your argument structure as a mind map'}
              {pathname === '/app/risk-scanner' && 'Scan emails, proposals, and press materials for tone, factuality, and reputational risk.'}
              {pathname === '/app/profile' && 'Manage your account details'}
              {pathname === '/app/settings' && 'Configure your preferences'}
              {pathname === '/app/academy' && 'Learn argumentation structure, fallacy types, counter-argument strategies, and communication.'}
              {pathname.startsWith('/app/academy/') && 'Interactive lesson material, example reviews, and quizzes.'}
              {pathname === '/app/learning-path' && 'Your personalized logic training path with onboarding assessment, fallacy analysis, and spaced repetition.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="border border-foreground/10">
                  <Bell size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex gap-3 p-3 rounded-lg border border-foreground/10">
                    <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Debate Session Completed!</p>
                      <p className="text-xs text-muted-foreground">You analyzed 5 arguments successfully</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg border border-foreground/10">
                    <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New Analysis Available</p>
                      <p className="text-xs text-muted-foreground">View your latest debate insights</p>
                      <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative border border-foreground/10">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border border-foreground/10">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
