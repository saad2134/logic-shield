"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronDown
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

const demoNavItems = [
  {
    items: [
      { title: "Dashboard", url: "/demo/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Debate",
    items: [
      { title: "New Debate", url: "/demo/debate", icon: Zap },
      { title: "History", url: "/demo/history", icon: History },
    ],
  },
  {
    title: "Tools",
    items: [
      { title: "Argument Analysis", url: "/demo/argument-analysis", icon: Target },
    ],
  },
];

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoSidebar>{children}</DemoSidebar>;
}

function DemoSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  if (pathname === "/demo/onboarding") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true} className="h-screen">
      <Sidebar collapsible="offcanvas" className="border-r border-foreground/10 z-50">
        <SidebarHeader className="py-4">
          <div className="flex items-center gap-3 px-2">
            <AppUI className="w-10 h-10 select-none" draggable={false} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{siteConfig.name}</span>
              <span className="text-xs text-muted-foreground">{siteConfig.version} ✦ <span className="text-red-500 font-bold">Demo Mode</span></span>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          {demoNavItems.map((category, idx) => (
            <SidebarGroup key={category.title || idx}>
              {category.title && (
                <SidebarGroupLabel className="text-primary font-semibold px-2 mb-1">
                  {category.title}
                </SidebarGroupLabel>
              )}
              <SidebarMenu>
                {category.items?.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={isActive ? "font-medium" : ""}>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
        
        <SidebarFooter className="p-3">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Link 
                href="/demo/profile" 
                className={`flex-1 flex items-center border border-foreground/10 gap-3 p-2 rounded-lg transition-colors ${
                  pathname === "/demo/profile" 
                    ? "bg-primary/50 dark:bg-primary/20 border border-primary dark:border-primary" 
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/50 dark:bg-primary/50 flex items-center justify-center font-semibold text-sm shrink-0">
                  DU
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Demo User</p>
                  <p className="text-xs text-muted-foreground">Profile</p>
                </div>
              </Link>
              <Link 
                href="/demo/settings" 
                className={`w-[60px] flex items-center border border-foreground/10 justify-center p-2 rounded-lg transition-colors ${
                  pathname === "/demo/settings" 
                    ? "bg-primary/50 dark:bg-primary/20 border border-primary dark:border-primary" 
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start border border-foreground/10 text-muted-foreground"
              asChild
            >
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Exit Demo
              </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset className="flex flex-col flex-1 h-full overflow-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-foreground/10 px-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {pathname === '/demo/profile' ? 'Profile' : 
               pathname === '/demo/settings' ? 'Settings' : 
               demoNavItems.flatMap(cat => cat.items || []).find(item => item.url === pathname)?.title || "Demo"}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {pathname === '/demo/dashboard' && 'Your personal debate dashboard'}
              {pathname === '/demo/debate' && 'Challenge yourself against an AI opponent and improve your argumentation skills'}
              {pathname === '/demo/history' && 'View your past debates'}
              {pathname === '/demo/argument-analysis' && 'Analyze any argument for logical fallacies, strength, and reputational risks'}
              {pathname === '/demo/profile' && 'Manage your account details'}
              {pathname === '/demo/settings' && 'Configure your preferences'}
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
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
