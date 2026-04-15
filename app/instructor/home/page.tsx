"use client";

import { useState, useCallback, useRef } from "react";
import { Settings2, Calendar, Users, CalendarDays, Map, Wrench, AlertTriangle, Plane, TrendingUp, Plus, X, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// ── Grid Constants ──────────────────────────────────
// 4-column × 6-row grid (24 cells). Each widget occupies a rectangular region.

const COLS = 4;
const ROWS = 6;

type WidgetSize = "1x1" | "1x2" | "2x1" | "2x2" | "2x3" | "4x1" | "4x2";

interface SizeDef { cols: number; rows: number; label: string }
const SIZES: Record<WidgetSize, SizeDef> = {
  "1x1": { cols: 1, rows: 1, label: "Small" },
  "1x2": { cols: 1, rows: 2, label: "Tall" },
  "2x1": { cols: 2, rows: 1, label: "Wide" },
  "2x2": { cols: 2, rows: 2, label: "Medium" },
  "2x3": { cols: 2, rows: 3, label: "Large" },
  "4x1": { cols: 4, rows: 1, label: "Full-Width Bar" },
  "4x2": { cols: 4, rows: 2, label: "Full-Width" },
};

interface WidgetDef {
  id: string;
  label: string;
  icon: React.ElementType;
  defaultSize: WidgetSize;
  allowedSizes: WidgetSize[];
}

const WIDGET_CATALOG: WidgetDef[] = [
  { id: "today-schedule", label: "Today's Schedule", icon: Calendar, defaultSize: "2x2", allowedSizes: ["2x1", "2x2", "2x3", "4x2"] },
  { id: "my-students", label: "My Students", icon: Users, defaultSize: "2x1", allowedSizes: ["1x1", "2x1", "2x2"] },
  { id: "fleet-status", label: "Fleet Status", icon: Plane, defaultSize: "2x1", allowedSizes: ["1x1", "2x1", "2x2"] },
  { id: "weather", label: "Weather", icon: Map, defaultSize: "1x1", allowedSizes: ["1x1", "2x1"] },
  { id: "alerts", label: "Alerts & Holds", icon: AlertTriangle, defaultSize: "1x1", allowedSizes: ["1x1", "2x1", "1x2"] },
  { id: "maintenance", label: "Maintenance Due", icon: Wrench, defaultSize: "1x1", allowedSizes: ["1x1", "2x1"] },
  { id: "upcoming-week", label: "Upcoming This Week", icon: CalendarDays, defaultSize: "2x2", allowedSizes: ["2x1", "2x2", "2x3", "4x2"] },
  { id: "flight-stats", label: "Flight Stats", icon: TrendingUp, defaultSize: "1x1", allowedSizes: ["1x1", "2x1", "2x2"] },
  { id: "live-map", label: "Live Map", icon: Map, defaultSize: "2x2", allowedSizes: ["2x2", "2x3", "4x2"] },
];

interface PlacedWidget {
  id: string;         // unique instance id
  defId: string;      // references WIDGET_CATALOG
  col: number;        // 0-based start column
  row: number;        // 0-based start row
  size: WidgetSize;
}

const DEFAULT_LAYOUT: PlacedWidget[] = [
  { id: "w1", defId: "today-schedule", col: 0, row: 0, size: "2x2" },
  { id: "w2", defId: "weather",        col: 2, row: 0, size: "1x1" },
  { id: "w3", defId: "alerts",         col: 3, row: 0, size: "1x1" },
  { id: "w4", defId: "my-students",    col: 2, row: 1, size: "2x1" },
  { id: "w5", defId: "fleet-status",   col: 0, row: 2, size: "2x1" },
  { id: "w6", defId: "maintenance",    col: 2, row: 2, size: "1x1" },
  { id: "w7", defId: "flight-stats",   col: 3, row: 2, size: "1x1" },
  { id: "w8", defId: "upcoming-week",  col: 0, row: 3, size: "2x2" },
];

function cellsOccupied(w: PlacedWidget): string[] {
  const s = SIZES[w.size];
  const cells: string[] = [];
  for (let r = w.row; r < w.row + s.rows; r++) {
    for (let c = w.col; c < w.col + s.cols; c++) {
      cells.push(`${r}-${c}`);
    }
  }
  return cells;
}

function getOccupiedSet(widgets: PlacedWidget[], excludeId?: string): Set<string> {
  const set = new Set<string>();
  for (const w of widgets) {
    if (w.id === excludeId) continue;
    for (const cell of cellsOccupied(w)) set.add(cell);
  }
  return set;
}

function canPlace(col: number, row: number, size: WidgetSize, widgets: PlacedWidget[], excludeId?: string): boolean {
  const s = SIZES[size];
  if (col + s.cols > COLS || row + s.rows > ROWS) return false;
  const occupied = getOccupiedSet(widgets, excludeId);
  for (let r = row; r < row + s.rows; r++) {
    for (let c = col; c < col + s.cols; c++) {
      if (occupied.has(`${r}-${c}`)) return false;
    }
  }
  return true;
}

function findFirstFit(size: WidgetSize, widgets: PlacedWidget[]): { col: number; row: number } | null {
  const s = SIZES[size];
  for (let r = 0; r <= ROWS - s.rows; r++) {
    for (let c = 0; c <= COLS - s.cols; c++) {
      if (canPlace(c, r, size, widgets)) return { col: c, row: r };
    }
  }
  return null;
}

let nextId = 100;

// ── Main Component ──────────────────────────────────

export default function HomePage() {
  const { currentUser, profile } = useAuth();
  const instructorId = currentUser?.id ?? IDS.instructorMike;
  const firstName = profile?.firstName ?? "Instructor";

  const [widgets, setWidgets] = useState<PlacedWidget[]>(DEFAULT_LAYOUT);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addDefId, setAddDefId] = useState("");
  const [addSize, setAddSize] = useState<WidgetSize>("2x1");
  const [dragging, setDragging] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const occupied = getOccupiedSet(widgets);

  // ── Add Widget Flow ──
  function handleAddWidget() {
    if (!addDefId) return;
    const pos = findFirstFit(addSize, widgets);
    if (!pos) {
      alert("No space available for this widget size. Try a smaller size or remove an existing widget.");
      return;
    }
    setWidgets(prev => [...prev, {
      id: `w${nextId++}`,
      defId: addDefId,
      col: pos.col,
      row: pos.row,
      size: addSize,
    }]);
    setAddOpen(false);
    setAddDefId("");
  }

  function removeWidget(id: string) {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }

  function cycleSize(id: string) {
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      const def = WIDGET_CATALOG.find(d => d.id === w.defId);
      if (!def) return w;
      const idx = def.allowedSizes.indexOf(w.size);
      const nextSize = def.allowedSizes[(idx + 1) % def.allowedSizes.length]!;
      if (canPlace(w.col, w.row, nextSize, prev, w.id)) {
        return { ...w, size: nextSize };
      }
      // Try to find a fit elsewhere
      const pos = findFirstFit(nextSize, prev.filter(x => x.id !== id));
      if (pos) return { ...w, size: nextSize, col: pos.col, row: pos.row };
      return w; // can't resize, stay as-is
    }));
  }

  // ── Drag & Drop ──
  function handleDragStart(id: string) {
    if (!editMode) return;
    setDragging(id);
  }

  function handleCellDrop(col: number, row: number) {
    if (!dragging) return;
    const w = widgets.find(x => x.id === dragging);
    if (!w) return;
    if (canPlace(col, row, w.size, widgets, w.id)) {
      setWidgets(prev => prev.map(x => x.id === dragging ? { ...x, col, row } : x));
    }
    setDragging(null);
  }

  const ROW_HEIGHT = 120;
  const GAP = 12;

  // Selected add-widget def
  const selectedDef = WIDGET_CATALOG.find(d => d.id === addDefId);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Welcome back, {firstName}</h2>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)}>
            <Settings2 className="h-4 w-4 mr-1" />{editMode ? "Done" : "Edit"}
          </Button>
          {editMode && (
            <Button variant="outline" size="sm" onClick={() => { setAddOpen(true); setAddDefId(""); }}>
              <Plus className="h-4 w-4 mr-1" />Add Widget
            </Button>
          )}
        </div>
      </div>

      {/* Widget Grid */}
      <div
        ref={gridRef}
        className="relative"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, ${ROW_HEIGHT}px)`,
          gap: GAP,
          minHeight: ROWS * ROW_HEIGHT + (ROWS - 1) * GAP,
        }}
      >
        {/* Drop target cells (edit mode only) */}
        {editMode && Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const isOccupied = occupied.has(`${r}-${c}`);
          return (
            <div
              key={`cell-${r}-${c}`}
              className={`rounded-lg border border-dashed transition-colors ${isOccupied ? "border-transparent" : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"}`}
              style={{ gridColumn: c + 1, gridRow: r + 1 }}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={() => handleCellDrop(c, r)}
            />
          );
        })}

        {/* Placed Widgets */}
        {widgets.map(w => {
          const s = SIZES[w.size];
          const def = WIDGET_CATALOG.find(d => d.id === w.defId);
          if (!def) return null;
          return (
            <div
              key={w.id}
              className={`relative z-10 ${dragging === w.id ? "opacity-50 scale-95" : ""} transition-all`}
              style={{
                gridColumn: `${w.col + 1} / span ${s.cols}`,
                gridRow: `${w.row + 1} / span ${s.rows}`,
              }}
              draggable={editMode}
              onDragStart={() => handleDragStart(w.id)}
              onDragEnd={() => setDragging(null)}
            >
              <Card className={`h-full overflow-hidden ${editMode ? "ring-2 ring-primary/30 ring-offset-1" : ""}`}>
                <CardHeader className="pb-1 pt-3 px-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <def.icon className="h-3.5 w-3.5" />
                    {def.label}
                  </CardTitle>
                  {editMode && (
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => cycleSize(w.id)} className="p-0.5 rounded hover:bg-muted" title="Resize">
                        <Maximize2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <button className="p-0.5 rounded cursor-grab active:cursor-grabbing hover:bg-muted" title="Drag to move">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <button onClick={() => removeWidget(w.id)} className="p-0.5 rounded hover:bg-destructive/10" title="Remove">
                        <X className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-0 overflow-auto" style={{ maxHeight: s.rows * ROW_HEIGHT - 44 }}>
                  <WidgetContent defId={w.defId} instructorId={instructorId} size={w.size} />
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {editMode && (
        <p className="text-xs text-muted-foreground text-center">
          Drag widgets to reposition. Click <Maximize2 className="h-3 w-3 inline" /> to cycle sizes. Click <X className="h-3 w-3 inline text-destructive" /> to remove.
        </p>
      )}

      {/* Add Widget Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Widget</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Choose Widget</p>
              <div className="grid grid-cols-2 gap-2">
                {WIDGET_CATALOG.map(def => {
                  const alreadyPlaced = widgets.some(w => w.defId === def.id);
                  return (
                    <button
                      key={def.id}
                      onClick={() => { setAddDefId(def.id); setAddSize(def.defaultSize); }}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-colors ${
                        addDefId === def.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40"
                      } ${alreadyPlaced ? "opacity-50" : ""}`}
                    >
                      <def.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{def.label}</span>
                      {alreadyPlaced && <Badge variant="outline" className="text-[9px] ml-auto shrink-0">placed</Badge>}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDef && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Size</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDef.allowedSizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setAddSize(sz)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                        addSize === sz ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {SIZES[sz].label} ({sz})
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Widget will be placed in the first available {SIZES[addSize].cols}×{SIZES[addSize].rows} space on your grid.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={!addDefId} onClick={handleAddWidget}>
              <Plus className="h-4 w-4 mr-1" />Place Widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Widget Content Renderer ──────────────────────────────────

function WidgetContent({ defId, instructorId, size }: { defId: string; instructorId: string; size: WidgetSize }) {
  const s = SIZES[size];
  const isCompact = s.cols === 1 && s.rows === 1;

  switch (defId) {
    case "today-schedule": return <TodayScheduleWidget instructorId={instructorId} compact={isCompact} rows={s.rows} />;
    case "my-students": return <MyStudentsWidget instructorId={instructorId} compact={isCompact} />;
    case "fleet-status": return <FleetStatusWidget compact={isCompact} />;
    case "weather": return <WeatherWidget compact={isCompact} />;
    case "alerts": return <AlertsWidget compact={isCompact} />;
    case "maintenance": return <MaintenanceDueWidget compact={isCompact} />;
    case "upcoming-week": return <UpcomingWeekWidget instructorId={instructorId} rows={s.rows} />;
    case "flight-stats": return <FlightStatsWidget compact={isCompact} />;
    case "live-map": return <LiveMapWidget rows={s.rows} cols={s.cols} />;
    default: return <p className="text-xs text-muted-foreground">Unknown widget</p>;
  }
}

// ── Widget Implementations ──────────────────────────────────

function TodayScheduleWidget({ instructorId, compact, rows }: { instructorId: string; compact: boolean; rows: number }) {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const events = getInstructorReservations(instructorId)
    .filter(r => r.startTime.startsWith(todayStr))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const limit = compact ? 2 : rows >= 3 ? 8 : 4;

  return (
    <div className="space-y-1.5">
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1">No events today</p>
      ) : (
        events.slice(0, limit).map(e => (
          <div key={e.id} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: activityTypeColors[e.activityType] }} />
            <span className="font-medium">{format(new Date(e.startTime), "h:mm a")}</span>
            {!compact && <span className="text-muted-foreground truncate">{activityTypeLabels[e.activityType]}</span>}
          </div>
        ))
      )}
      <Link href="/instructor/schedule" className="text-[10px] text-primary hover:underline block">View full schedule →</Link>
    </div>
  );
}

function MyStudentsWidget({ instructorId, compact }: { instructorId: string; compact: boolean }) {
  const students = getInstructorStudents(instructorId);
  const active = students.filter(s => s.status === "active").length;
  const idle = students.filter(s => s.daysSinceActivity > 30).length;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-4">
        <div><p className="text-2xl font-bold">{students.length}</p><p className="text-[10px] text-muted-foreground">Total</p></div>
        <div><p className="text-2xl font-bold text-green-500">{active}</p><p className="text-[10px] text-muted-foreground">Active</p></div>
        {!compact && idle > 0 && <div><p className="text-2xl font-bold text-amber-500">{idle}</p><p className="text-[10px] text-muted-foreground">Idle</p></div>}
      </div>
      <Link href="/instructor/students" className="text-[10px] text-primary hover:underline block">View all students →</Link>
    </div>
  );
}

function FleetStatusWidget({ compact }: { compact: boolean }) {
  const airworthy = aircraft.filter(a => !a.groundedAt).length;
  const grounded = aircraft.filter(a => !!a.groundedAt).length;
  const flying = aircraftPositions.filter(a => a.isSchoolAircraft && a.altitudeFt > 0).length;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-4">
        <div><p className="text-2xl font-bold text-green-500">{airworthy}</p><p className="text-[10px] text-muted-foreground">Airworthy</p></div>
        {!compact && grounded > 0 && <div><p className="text-2xl font-bold text-red-500">{grounded}</p><p className="text-[10px] text-muted-foreground">Grounded</p></div>}
        <div><p className="text-2xl font-bold text-blue-500">{flying}</p><p className="text-[10px] text-muted-foreground">Flying</p></div>
      </div>
      <Link href="/instructor/live-map" className="text-[10px] text-primary hover:underline block">View fleet map →</Link>
    </div>
  );
}

function WeatherWidget({ compact }: { compact: boolean }) {
  const base = metarReports[0];
  if (!base) return null;
  const catColor = { VFR: "text-green-500", MVFR: "text-blue-500", IFR: "text-red-500", LIFR: "text-purple-500" }[base.flightCategory] ?? "text-gray-500";
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm">{base.station}</span>
        <Badge className={`text-[10px] ${catColor} bg-transparent border`}>{base.flightCategory}</Badge>
      </div>
      {!compact && (
        <p className="text-[10px] text-muted-foreground">{base.windDirection}° @ {base.windSpeed}kt | {base.visibility} SM | {base.temperature}/{base.dewpoint}°C</p>
      )}
    </div>
  );
}

function AlertsWidget({ compact }: { compact: boolean }) {
  const holds = personHolds.filter(h => !h.clearedAt);
  const openSquawks = squawks.filter(s => s.severity === "grounding" && !s.resolvedAt);

  return (
    <div className="space-y-1">
      {holds.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>{holds.length} hold{holds.length > 1 ? "s" : ""}</span>
        </div>
      )}
      {openSquawks.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>{openSquawks.length} squawk{openSquawks.length > 1 ? "s" : ""}</span>
        </div>
      )}
      {holds.length === 0 && openSquawks.length === 0 && (
        <p className="text-xs text-green-500">All clear</p>
      )}
    </div>
  );
}

function MaintenanceDueWidget({ compact }: { compact: boolean }) {
  const dueSoon = maintenanceItems.filter(m => m.status === "due_soon").length;
  const overdue = maintenanceItems.filter(m => m.status === "overdue" || m.status === "grounding").length;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-4">
        {overdue > 0 && <div><p className="text-2xl font-bold text-red-500">{overdue}</p><p className="text-[10px] text-muted-foreground">Overdue</p></div>}
        <div><p className="text-2xl font-bold text-amber-500">{dueSoon}</p><p className="text-[10px] text-muted-foreground">Due Soon</p></div>
      </div>
      <Link href="/instructor/maintenance" className="text-[10px] text-primary hover:underline block">View maintenance →</Link>
    </div>
  );
}

function UpcomingWeekWidget({ instructorId, rows }: { instructorId: string; rows: number }) {
  const events = getInstructorReservations(instructorId);
  const upcoming = events
    .filter(r => new Date(r.startTime) > new Date())
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, rows >= 3 ? 8 : 4);

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

function FlightStatsWidget({ compact }: { compact: boolean }) {
  return (
    <div className="space-y-0.5 text-xs text-muted-foreground">
      <p>This week: <span className="font-medium text-foreground">12.5h</span></p>
      {!compact && <p>This month: <span className="font-medium text-foreground">48.2h</span></p>}
      {!compact && <p>Checkrides: <span className="font-medium text-foreground">2 passed</span></p>}
    </div>
  );
}

function LiveMapWidget({ rows, cols }: { rows: number; cols: number }) {
  const flying = aircraftPositions.filter(a => a.isSchoolAircraft && a.altitudeFt > 0);
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 rounded-md bg-muted/50 border border-dashed flex items-center justify-center relative overflow-hidden" style={{ minHeight: rows * 80 }}>
        {/* Simulated map area */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5" />
        {flying.map((pos, i) => (
          <div
            key={pos.tailNumber}
            className="absolute flex items-center gap-1"
            style={{ left: `${20 + i * 25}%`, top: `${30 + (i % 2) * 30}%` }}
          >
            <Plane className="h-4 w-4 text-blue-500 -rotate-45" />
            <span className="text-[9px] font-mono font-bold bg-background/80 px-1 rounded">{pos.tailNumber}</span>
          </div>
        ))}
        {flying.length === 0 && <p className="text-xs text-muted-foreground z-10">No aircraft in flight</p>}
      </div>
      <Link href="/instructor/live-map" className="text-[10px] text-primary hover:underline block mt-1.5">Open Live Map →</Link>
    </div>
  );
}
