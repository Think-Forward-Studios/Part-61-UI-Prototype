"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, CalendarDays, Map, Wrench, HelpCircle, LogOut, User, Clock, FileText, Lock, Settings } from "lucide-react";
import { TFSBadge } from "@/components/tfs-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const tabs = [
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

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
