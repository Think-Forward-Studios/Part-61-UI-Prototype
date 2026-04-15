"use client";

import { useState, useCallback } from "react";
import { GripVertical, Settings2, Calendar, Users, CalendarDays, Map, Wrench, Clock, AlertTriangle, Plane, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import {
  getInstructorReservations, getInstructorStudents,
  aircraft, aircraftTotals, maintenanceItems, squawks,
  aircraftPositions, metarReports, personHolds,
  activityTypeLabels, activityTypeColors,
} from "@/lib/mock-data";
import { IDS } from "@/lib/mock-data/ids";
import Link from "next/link";

interface Widget {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  size: "small" | "medium" | "large";
}

const defaultWidgets: Widget[] = [
  { id: "today-schedule", label: "Today's Schedule", icon: Calendar, enabled: true, size: "large" },
  { id: "my-students", label: "My Students", icon: Users, enabled: true, size: "medium" },
  { id: "fleet-status", label: "Fleet Status", icon: Plane, enabled: true, size: "medium" },
  { id: "weather", label: "Weather", icon: Map, enabled: true, size: "small" },
  { id: "alerts", label: "Alerts & Holds", icon: AlertTriangle, enabled: true, size: "small" },
  { id: "maintenance", label: "Maintenance Due", icon: Wrench, enabled: true, size: "small" },
  { id: "upcoming-week", label: "Upcoming This Week", icon: CalendarDays, enabled: true, size: "medium" },
  { id: "flight-stats", label: "Flight Stats", icon: TrendingUp, enabled: false, size: "small" },
];

export default function HomePage() {
  const { currentUser, profile } = useAuth();
  const instructorId = currentUser?.id ?? IDS.instructorMike;
  const firstName = profile?.firstName ?? "Instructor";

  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [configOpen, setConfigOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const enabledWidgets = widgets.filter(w => w.enabled);

  const toggleWidget = useCallback((id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  }, []);

  const cycleSize = useCallback((id: string) => {
    const sizes: Widget["size"][] = ["small", "medium", "large"];
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      const idx = sizes.indexOf(w.size);
      return { ...w, size: sizes[(idx + 1) % sizes.length]! };
    }));
  }, []);

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    setWidgets(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(w => w.id === draggedId);
      const toIdx = arr.findIndex(w => w.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved!);
      return arr;
    });
    setDraggedId(null);
  };

  const sizeClass = (s: Widget["size"]) =>
    s === "large" ? "col-span-2 md:col-span-2" : s === "medium" ? "col-span-2 md:col-span-1" : "col-span-1";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Welcome back, {firstName}</h2>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}>
          <Settings2 className="h-4 w-4 mr-1" />Customize
        </Button>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {enabledWidgets.map(widget => (
          <div
            key={widget.id}
            className={`${sizeClass(widget.size)} ${draggedId === widget.id ? "opacity-50" : ""}`}
            draggable
            onDragStart={() => handleDragStart(widget.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(widget.id)}
          >
            <WidgetCard widget={widget} instructorId={instructorId} onResize={() => cycleSize(widget.id)} />
          </div>
        ))}
      </div>

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Customize Dashboard</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Toggle widgets on/off. Drag to reorder on the dashboard.</p>
            {widgets.map(w => (
              <div key={w.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <w.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{w.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] cursor-pointer" onClick={() => cycleSize(w.id)}>{w.size}</Badge>
                  <Switch checked={w.enabled} onCheckedChange={() => toggleWidget(w.id)} />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Widget Components ──────────────────────────────────

function WidgetCard({ widget, instructorId, onResize }: { widget: Widget; instructorId: string; onResize: () => void }) {
  const content = (() => {
    switch (widget.id) {
      case "today-schedule": return <TodayScheduleWidget instructorId={instructorId} />;
      case "my-students": return <MyStudentsWidget instructorId={instructorId} />;
      case "fleet-status": return <FleetStatusWidget />;
      case "weather": return <WeatherWidget />;
      case "alerts": return <AlertsWidget instructorId={instructorId} />;
      case "maintenance": return <MaintenanceDueWidget />;
      case "upcoming-week": return <UpcomingWeekWidget instructorId={instructorId} />;
      case "flight-stats": return <FlightStatsWidget />;
      default: return <p className="text-sm text-muted-foreground">Widget not found</p>;
    }
  })();

  return (
    <Card className="h-full group relative">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <widget.icon className="h-4 w-4 text-muted-foreground" />
          {widget.label}
        </CardTitle>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity" />
      </CardHeader>
      <CardContent className="pt-0">{content}</CardContent>
    </Card>
  );
}

function TodayScheduleWidget({ instructorId }: { instructorId: string }) {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const events = getInstructorReservations(instructorId)
    .filter(r => r.startTime.startsWith(todayStr))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-2">
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No events today</p>
      ) : (
        events.slice(0, 5).map(e => (
          <div key={e.id} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: activityTypeColors[e.activityType] }} />
            <span className="font-medium">{format(new Date(e.startTime), "h:mm a")}</span>
            <span className="text-muted-foreground truncate">{activityTypeLabels[e.activityType]}</span>
          </div>
        ))
      )}
      <Link href="/instructor/schedule" className="text-xs text-primary hover:underline block pt-1">View full schedule →</Link>
    </div>
  );
}

function MyStudentsWidget({ instructorId }: { instructorId: string }) {
  const students = getInstructorStudents(instructorId);
  const active = students.filter(s => s.status === "active").length;
  const idle = students.filter(s => s.daysSinceActivity > 30).length;

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <div><p className="text-2xl font-bold">{students.length}</p><p className="text-[10px] text-muted-foreground">Total</p></div>
        <div><p className="text-2xl font-bold text-green-500">{active}</p><p className="text-[10px] text-muted-foreground">Active</p></div>
        {idle > 0 && <div><p className="text-2xl font-bold text-amber-500">{idle}</p><p className="text-[10px] text-muted-foreground">Idle</p></div>}
      </div>
      <Link href="/instructor/students" className="text-xs text-primary hover:underline block">View all students →</Link>
    </div>
  );
}

function FleetStatusWidget() {
  const airworthy = aircraft.filter(a => !a.groundedAt).length;
  const grounded = aircraft.filter(a => !!a.groundedAt).length;
  const flying = aircraftPositions.filter(a => a.isSchoolAircraft && a.altitudeFt > 0).length;

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <div><p className="text-2xl font-bold text-green-500">{airworthy}</p><p className="text-[10px] text-muted-foreground">Airworthy</p></div>
        {grounded > 0 && <div><p className="text-2xl font-bold text-red-500">{grounded}</p><p className="text-[10px] text-muted-foreground">Grounded</p></div>}
        <div><p className="text-2xl font-bold text-blue-500">{flying}</p><p className="text-[10px] text-muted-foreground">Flying</p></div>
      </div>
      <Link href="/instructor/live-map" className="text-xs text-primary hover:underline block">View fleet map →</Link>
    </div>
  );
}

function WeatherWidget() {
  const base = metarReports[0];
  if (!base) return null;
  const catColor = { VFR: "text-green-500", MVFR: "text-blue-500", IFR: "text-red-500", LIFR: "text-purple-500" }[base.flightCategory] ?? "text-gray-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm">{base.station}</span>
        <Badge className={`text-[10px] ${catColor} bg-transparent border`}>{base.flightCategory}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{base.windDirection}° @ {base.windSpeed}kt | {base.visibility} SM | {base.temperature}/{base.dewpoint}°C</p>
      <Link href="/instructor/live-map" className="text-xs text-primary hover:underline block pt-1">Full weather →</Link>
    </div>
  );
}

function AlertsWidget({ instructorId }: { instructorId: string }) {
  const holds = personHolds.filter(h => !h.clearedAt);
  const openSquawks = squawks.filter(s => s.severity === "grounding" && !s.resolvedAt);

  return (
    <div className="space-y-1.5">
      {holds.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>{holds.length} active student hold{holds.length > 1 ? "s" : ""}</span>
        </div>
      )}
      {openSquawks.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>{openSquawks.length} grounding squawk{openSquawks.length > 1 ? "s" : ""}</span>
        </div>
      )}
      {holds.length === 0 && openSquawks.length === 0 && (
        <p className="text-xs text-green-500">No active alerts</p>
      )}
    </div>
  );
}

function MaintenanceDueWidget() {
  const dueSoon = maintenanceItems.filter(m => m.status === "due_soon").length;
  const overdue = maintenanceItems.filter(m => m.status === "overdue" || m.status === "grounding").length;

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        {overdue > 0 && <div><p className="text-2xl font-bold text-red-500">{overdue}</p><p className="text-[10px] text-muted-foreground">Overdue</p></div>}
        <div><p className="text-2xl font-bold text-amber-500">{dueSoon}</p><p className="text-[10px] text-muted-foreground">Due Soon</p></div>
      </div>
      <Link href="/instructor/maintenance" className="text-xs text-primary hover:underline block">View maintenance →</Link>
    </div>
  );
}

function UpcomingWeekWidget({ instructorId }: { instructorId: string }) {
  const events = getInstructorReservations(instructorId);
  const upcoming = events
    .filter(r => new Date(r.startTime) > new Date())
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 4);

  return (
    <div className="space-y-1.5">
      {upcoming.map(e => (
        <div key={e.id} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: activityTypeColors[e.activityType] }} />
          <span className="text-muted-foreground">{format(new Date(e.startTime), "EEE h:mm a")}</span>
          <span className="truncate">{activityTypeLabels[e.activityType]}</span>
        </div>
      ))}
      {upcoming.length === 0 && <p className="text-xs text-muted-foreground">No upcoming events</p>}
    </div>
  );
}

function FlightStatsWidget() {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>This week: 12.5 hrs dual given</p>
      <p>This month: 48.2 hrs total</p>
      <p>Students passed checkride: 2</p>
    </div>
  );
}
