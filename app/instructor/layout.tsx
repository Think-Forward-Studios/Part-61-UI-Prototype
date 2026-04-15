"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Calendar, Users, CalendarDays, Map, Wrench, HelpCircle, LogOut, User, Clock, FileText, Lock, Settings, AlertTriangle, X, CheckCircle, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fifNotices, fifAcknowledgements } from "@/lib/mock-data";
import { IDS } from "@/lib/mock-data/ids";
import { TFSBadge } from "@/components/tfs-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const baseTabs = [
  { label: "Schedule", href: "/instructor/schedule", icon: Calendar },
  { label: "Students", href: "/instructor/students", icon: Users },
  { label: "School Schedule", href: "/instructor/school-schedule", icon: CalendarDays },
  { label: "Live Map", href: "/instructor/live-map", icon: Map },
  { label: "Maintenance", href: "/instructor/maintenance", icon: Wrench },
  { label: "Support", href: "/instructor/support", icon: HelpCircle },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, profile, logout } = useAuth();

  const initials = profile ? `${profile.firstName[0]}${profile.lastName[0]}` : "?";
  const firstName = profile?.firstName ?? "Home";

  const tabs = useMemo(() => [
    { label: `${firstName}'s Page`, href: "/instructor/home", icon: LayoutDashboard },
    ...baseTabs,
  ], [firstName]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex items-center h-14 px-4 gap-4">
          {/* Logo */}
          <Link href="/instructor/schedule" className="flex items-center gap-2 shrink-0">
            <TFSBadge size={32} />
            <span className="font-semibold text-sm hidden sm:inline">TFS Flight School</span>
          </Link>

          {/* Tab Navigation */}
          <nav className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Theme + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger render={<button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />}>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{currentUser?.fullName ?? "Instructor"}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem><User className="mr-2 h-4 w-4" />Update Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Customize Home Page</DropdownMenuItem>
                <DropdownMenuItem><Clock className="mr-2 h-4 w-4" />Create Blockout Times</DropdownMenuItem>
                <DropdownMenuItem><FileText className="mr-2 h-4 w-4" />Pull Training Report</DropdownMenuItem>
                <DropdownMenuItem><Lock className="mr-2 h-4 w-4" />Change Password</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); router.push("/"); }}>
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* FIF Notices Banner */}
      <FifBanner userId={currentUser?.id ?? IDS.instructorMike} />

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// ── FIF Notice Banner ──────────────────────────────────

const severityConfig: Record<string, { bg: string; border: string; icon: string }> = {
  critical: { bg: "bg-red-500/10", border: "border-red-500/40", icon: "text-red-500" },
  important: { bg: "bg-amber-500/10", border: "border-amber-500/40", icon: "text-amber-500" },
  info: { bg: "bg-blue-500/10", border: "border-blue-500/40", icon: "text-blue-500" },
};

function FifBanner({ userId }: { userId: string }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [acknowledged, setAcknowledged] = useState<Set<string>>(
    () => new Set(fifAcknowledgements.filter(a => a.userId === userId).map(a => a.noticeId))
  );

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const activeNotices = useMemo(() => {
    return fifNotices
      .filter(n => {
        if (dismissed.has(n.id)) return false;
        if (n.expiresAt && new Date(n.expiresAt) < new Date()) return false;
        return true;
      })
      .sort((a, b) => {
        const order = { critical: 0, important: 1, info: 2 };
        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
      });
  }, [dismissed]);

  const unacknowledgedCount = activeNotices.filter(n => !acknowledged.has(n.id)).length;

  if (activeNotices.length === 0) return null;

  return (
    <div className="border-b bg-card">
      {activeNotices.map(notice => {
        const config = severityConfig[notice.severity] ?? severityConfig.info;
        const isAcked = acknowledged.has(notice.id);
        return (
          <div key={notice.id} className={`flex items-start gap-3 px-4 py-2 border-b last:border-b-0 ${config.bg}`}>
            <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${config.icon}`} />
            <button
              type="button"
              className="flex-1 min-w-0 text-left cursor-pointer"
              onClick={() => toggleExpand(notice.id)}
            >
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${notice.severity === "critical" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : notice.severity === "important" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                  {notice.severity}
                </Badge>
                <span className="text-sm font-medium truncate">{notice.title}</span>
                <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{expanded.has(notice.id) ? "collapse" : "expand"}</span>
              </div>
              <p className={`text-xs text-muted-foreground mt-0.5 ${expanded.has(notice.id) ? "" : "line-clamp-1"}`}>{notice.body}</p>
              {expanded.has(notice.id) && notice.expiresAt && (
                <p className="text-[10px] text-muted-foreground mt-1">Expires: {new Date(notice.expiresAt).toLocaleDateString()}</p>
              )}
            </button>
            <div className="flex items-center gap-1 shrink-0">
              {!isAcked ? (
                <button
                  onClick={() => setAcknowledged(prev => new Set([...prev, notice.id]))}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Ack
                </button>
              ) : (
                <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />Ack&apos;d
                </span>
              )}
              <button
                onClick={() => setDismissed(prev => new Set([...prev, notice.id]))}
                className="rounded p-1 hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        );
      })}
      {unacknowledgedCount > 0 && (
        <div className="px-4 py-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/5">
          {unacknowledgedCount} notice{unacknowledgedCount > 1 ? "s" : ""} require acknowledgement
        </div>
      )}
    </div>
  );
}
