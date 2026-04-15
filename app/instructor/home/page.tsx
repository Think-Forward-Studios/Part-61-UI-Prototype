"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Calendar, Users, CalendarDays, Map, Wrench, AlertTriangle, Plane,
  TrendingUp, Plus, X, Columns2, Columns3, LayoutGrid,
  ArrowUpDown, ArrowLeftRight, FlipVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import {
  getInstructorReservations, getInstructorStudents,
  aircraft, maintenanceItems, squawks,
  aircraftPositions, metarReports, personHolds,
  activityTypeLabels, activityTypeColors,
  school, base,
} from "@/lib/mock-data";
import { IDS } from "@/lib/mock-data/ids";
import Link from "next/link";

// ── Widget Catalog ──────────────────────────────────

interface WidgetDef {
  id: string;
  label: string;
  icon: React.ElementType;
}

const WIDGET_CATALOG: WidgetDef[] = [
  { id: "today-schedule", label: "Today's Schedule", icon: Calendar },
  { id: "my-students", label: "My Students", icon: Users },
  { id: "fleet-status", label: "Fleet Status", icon: Plane },
  { id: "weather", label: "Weather", icon: Map },
  { id: "alerts", label: "Alerts & Holds", icon: AlertTriangle },
  { id: "maintenance", label: "Maintenance Due", icon: Wrench },
  { id: "upcoming-week", label: "Upcoming This Week", icon: CalendarDays },
  { id: "flight-stats", label: "Flight Stats", icon: TrendingUp },
  { id: "live-map", label: "Live Map", icon: Map },
];

// ── Layout Types ──────────────────────────────────

type PaneCount = 2 | 3 | 4;
type Orientation2 = "vertical" | "horizontal";
type ThreePaneFlip = "full-top" | "full-bottom";

interface LayoutState {
  paneCount: PaneCount;
  orientation2: Orientation2;       // for 2-pane
  threePaneFlip: ThreePaneFlip;     // for 3-pane
  paneWidgets: (string | null)[];   // widget def id per pane slot
  // Divider positions (0-1 ratio)
  divider2: number;                 // 2-pane: position of the single divider
  divider3H: number;                // 3-pane: horizontal divider (full vs split half)
  divider3V: number;                // 3-pane: vertical divider in the split half
  divider4H: number;                // 4-pane: horizontal divider
  divider4VTop: number;             // 4-pane: vertical divider in top half
  divider4VBottom: number;          // 4-pane: vertical divider in bottom half
}

const DEFAULT_LAYOUT: LayoutState = {
  paneCount: 4,
  orientation2: "vertical",
  threePaneFlip: "full-top",
  paneWidgets: ["today-schedule", "weather", "my-students", "fleet-status"],
  divider2: 0.5,
  divider3H: 0.5,
  divider3V: 0.5,
  divider4H: 0.5,
  divider4VTop: 0.5,
  divider4VBottom: 0.5,
};

const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;
function clampRatio(v: number) { return Math.min(MAX_RATIO, Math.max(MIN_RATIO, v)); }

// ── Main Component ──────────────────────────────────

export default function HomePage() {
  const { currentUser, profile } = useAuth();
  const instructorId = currentUser?.id ?? IDS.instructorMike;
  const firstName = profile?.firstName ?? "Instructor";

  const [layout, setLayout] = useState<LayoutState>(DEFAULT_LAYOUT);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingWidget, setPendingWidget] = useState<string | null>(null); // widget id waiting to be placed
  const containerRef = useRef<HTMLDivElement>(null);

  const paneSlotCount = layout.paneCount === 2 ? 2 : layout.paneCount === 3 ? 3 : 4;

  // Ensure paneWidgets array has enough slots
  const paneWidgets = layout.paneWidgets.slice(0, paneSlotCount);
  while (paneWidgets.length < paneSlotCount) paneWidgets.push(null);

  function setPaneCount(count: PaneCount) {
    setLayout(prev => {
      const widgets = [...prev.paneWidgets];
      while (widgets.length < count) widgets.push(null);
      return { ...prev, paneCount: count, paneWidgets: widgets.slice(0, count) };
    });
    setPendingWidget(null);
  }

  function setWidgetForPane(paneIdx: number, widgetId: string | null) {
    setLayout(prev => {
      const widgets = [...prev.paneWidgets];
      while (widgets.length < paneSlotCount) widgets.push(null);
      widgets[paneIdx] = widgetId;
      return { ...prev, paneWidgets: widgets };
    });
  }

  function handlePaneClick(paneIdx: number) {
    if (pendingWidget) {
      setWidgetForPane(paneIdx, pendingWidget);
      setPendingWidget(null);
    }
  }

  function openPicker() {
    setPickerOpen(true);
  }

  function selectWidget(widgetId: string) {
    setPendingWidget(widgetId);
    setPickerOpen(false);
  }

  function clearPane(paneIdx: number) {
    setWidgetForPane(paneIdx, null);
  }

  return (
    <div className="p-4 flex flex-col" style={{ height: "calc(100vh - 3.5rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h2 className="text-xl font-semibold">Welcome back, {firstName}</h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")} &middot; {base.name} &middot; {(base.timezone ?? school.timezone).replace("America/", "")} Time
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pane Count Selector */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            {([2, 3, 4] as PaneCount[]).map(n => (
              <button
                key={n}
                onClick={() => setPaneCount(n)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  layout.paneCount === n
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {n === 2 && <Columns2 className="h-3.5 w-3.5" />}
                {n === 3 && <Columns3 className="h-3.5 w-3.5" />}
                {n === 4 && <LayoutGrid className="h-3.5 w-3.5" />}
                {n}-Pane
              </button>
            ))}
          </div>

          {/* Layout Options */}
          {layout.paneCount === 2 && (
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setLayout(prev => ({ ...prev, orientation2: "vertical" }))}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  layout.orientation2 === "vertical" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                }`}
                title="Top / Bottom"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setLayout(prev => ({ ...prev, orientation2: "horizontal" }))}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  layout.orientation2 === "horizontal" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                }`}
                title="Left / Right"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {layout.paneCount === 3 && (
            <Button
              variant="outline" size="sm"
              onClick={() => setLayout(prev => ({
                ...prev,
                threePaneFlip: prev.threePaneFlip === "full-top" ? "full-bottom" : "full-top",
              }))}
              title="Flip full-width pane position"
            >
              <FlipVertical className="h-3.5 w-3.5 mr-1" />
              {layout.threePaneFlip === "full-top" ? "Full Top" : "Full Bottom"}
            </Button>
          )}

          {/* Add Widget */}
          <Button variant="outline" size="sm" onClick={openPicker}>
            <Plus className="h-4 w-4 mr-1" />Widget
          </Button>
        </div>
      </div>

      {/* Pending placement indicator */}
      {pendingWidget && (
        <div className="mb-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-md flex items-center gap-2 text-sm shrink-0">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>Click a pane to place <strong>{WIDGET_CATALOG.find(w => w.id === pendingWidget)?.label}</strong></span>
          <button onClick={() => setPendingWidget(null)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      )}

      {/* Pane Layout */}
      <div ref={containerRef} className="flex-1 min-h-0 relative">
        {layout.paneCount === 2 && (
          <TwoPaneLayout
            layout={layout}
            setLayout={setLayout}
            paneWidgets={paneWidgets}
            instructorId={instructorId}
            onPaneClick={handlePaneClick}
            onClearPane={clearPane}
            pendingWidget={pendingWidget}
            containerRef={containerRef}
          />
        )}
        {layout.paneCount === 3 && (
          <ThreePaneLayout
            layout={layout}
            setLayout={setLayout}
            paneWidgets={paneWidgets}
            instructorId={instructorId}
            onPaneClick={handlePaneClick}
            onClearPane={clearPane}
            pendingWidget={pendingWidget}
            containerRef={containerRef}
          />
        )}
        {layout.paneCount === 4 && (
          <FourPaneLayout
            layout={layout}
            setLayout={setLayout}
            paneWidgets={paneWidgets}
            instructorId={instructorId}
            onPaneClick={handlePaneClick}
            onClearPane={clearPane}
            pendingWidget={pendingWidget}
            containerRef={containerRef}
          />
        )}
      </div>

      {/* Widget Picker Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Select Widget</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Pick a widget, then click the pane where you want to place it.</p>
          <div className="grid grid-cols-2 gap-2 py-2">
            {WIDGET_CATALOG.map(def => {
              const placed = paneWidgets.includes(def.id);
              return (
                <button
                  key={def.id}
                  onClick={() => selectWidget(def.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 ${placed ? "opacity-50" : ""}`}
                >
                  <def.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{def.label}</span>
                  {placed && <Badge variant="outline" className="text-[9px] ml-auto shrink-0">in use</Badge>}
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPickerOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Draggable Divider Hook ──────────────────────────────────

function useDividerDrag(
  containerRef: React.RefObject<HTMLDivElement | null>,
  axis: "x" | "y",
  currentValue: number,
  onChange: (v: number) => void,
) {
  const dragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;

    const handleMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = axis === "y"
        ? (ev.clientY - rect.top) / rect.height
        : (ev.clientX - rect.left) / rect.width;
      onChange(clampRatio(ratio));
    };

    const handleUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }, [containerRef, axis, onChange]);

  return onMouseDown;
}

// ── Divider Component ──────────────────────────────────

function Divider({ axis, onMouseDown }: { axis: "x" | "y"; onMouseDown: React.MouseEventHandler }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`${
        axis === "y"
          ? "h-1.5 cursor-row-resize hover:bg-primary/20 active:bg-primary/30"
          : "w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/30"
      } bg-border/50 transition-colors rounded-full shrink-0 z-20`}
    />
  );
}

// ── Pane Wrapper ──────────────────────────────────

interface PaneProps {
  paneIdx: number;
  widgetId: string | null;
  instructorId: string;
  onPaneClick: (idx: number) => void;
  onClearPane: (idx: number) => void;
  pendingWidget: string | null;
}

function Pane({ paneIdx, widgetId, instructorId, onPaneClick, onClearPane, pendingWidget }: PaneProps) {
  const def = widgetId ? WIDGET_CATALOG.find(d => d.id === widgetId) : null;

  if (!def) {
    // Empty pane
    return (
      <button
        onClick={() => onPaneClick(paneIdx)}
        className={`h-full w-full rounded-lg border border-dashed flex items-center justify-center transition-colors ${
          pendingWidget
            ? "border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer"
            : "border-muted-foreground/20"
        }`}
      >
        <Plus className={`h-6 w-6 ${pendingWidget ? "text-primary" : "text-muted-foreground/30"}`} />
      </button>
    );
  }

  return (
    <Card className="h-full w-full overflow-hidden flex flex-col">
      <CardHeader className="pb-1 pt-3 px-3 flex flex-row items-center justify-between space-y-0 shrink-0">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
          <def.icon className="h-3.5 w-3.5" />
          {def.label}
        </CardTitle>
        <button
          onClick={(e) => { e.stopPropagation(); onClearPane(paneIdx); }}
          className="p-0.5 rounded hover:bg-destructive/10 transition-colors"
          title="Remove widget"
        >
          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </button>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 flex-1 overflow-auto min-h-0">
        <WidgetContent defId={def.id} instructorId={instructorId} />
      </CardContent>
    </Card>
  );
}

// ── 2-Pane Layout ──────────────────────────────────

interface LayoutProps {
  layout: LayoutState;
  setLayout: React.Dispatch<React.SetStateAction<LayoutState>>;
  paneWidgets: (string | null)[];
  instructorId: string;
  onPaneClick: (idx: number) => void;
  onClearPane: (idx: number) => void;
  pendingWidget: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function TwoPaneLayout({ layout, setLayout, paneWidgets, instructorId, onPaneClick, onClearPane, pendingWidget, containerRef }: LayoutProps) {
  const isVert = layout.orientation2 === "vertical";
  const ratio = layout.divider2;

  const onDrag = useDividerDrag(
    containerRef,
    isVert ? "y" : "x",
    ratio,
    (v) => setLayout(prev => ({ ...prev, divider2: v })),
  );

  const paneProps = (idx: number) => ({
    paneIdx: idx,
    widgetId: paneWidgets[idx] ?? null,
    instructorId,
    onPaneClick,
    onClearPane,
    pendingWidget,
  });

  if (isVert) {
    return (
      <div className="h-full flex flex-col gap-0">
        <div style={{ height: `calc(${ratio * 100}% - 3px)` }}><Pane {...paneProps(0)} /></div>
        <Divider axis="y" onMouseDown={onDrag} />
        <div style={{ height: `calc(${(1 - ratio) * 100}% - 3px)` }}><Pane {...paneProps(1)} /></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-row gap-0">
      <div style={{ width: `calc(${ratio * 100}% - 3px)` }} className="h-full"><Pane {...paneProps(0)} /></div>
      <Divider axis="x" onMouseDown={onDrag} />
      <div style={{ width: `calc(${(1 - ratio) * 100}% - 3px)` }} className="h-full"><Pane {...paneProps(1)} /></div>
    </div>
  );
}

// ── 3-Pane Layout ──────────────────────────────────

function ThreePaneLayout({ layout, setLayout, paneWidgets, instructorId, onPaneClick, onClearPane, pendingWidget, containerRef }: LayoutProps) {
  const isFullTop = layout.threePaneFlip === "full-top";
  const hRatio = layout.divider3H;
  const vRatio = layout.divider3V;

  const splitContainerRef = useRef<HTMLDivElement>(null);

  const onDragH = useDividerDrag(
    containerRef,
    "y",
    hRatio,
    (v) => setLayout(prev => ({ ...prev, divider3H: v })),
  );

  const onDragV = useDividerDrag(
    splitContainerRef,
    "x",
    vRatio,
    (v) => setLayout(prev => ({ ...prev, divider3V: v })),
  );

  const paneProps = (idx: number) => ({
    paneIdx: idx,
    widgetId: paneWidgets[idx] ?? null,
    instructorId,
    onPaneClick,
    onClearPane,
    pendingWidget,
  });

  // Pane 0 = full-width, Pane 1 & 2 = split pair
  const fullPane = <Pane {...paneProps(0)} />;
  const splitPane = (
    <div ref={splitContainerRef} className="h-full flex flex-row gap-0">
      <div style={{ width: `calc(${vRatio * 100}% - 3px)` }} className="h-full"><Pane {...paneProps(1)} /></div>
      <Divider axis="x" onMouseDown={onDragV} />
      <div style={{ width: `calc(${(1 - vRatio) * 100}% - 3px)` }} className="h-full"><Pane {...paneProps(2)} /></div>
    </div>
  );

  const fullRatio = isFullTop ? hRatio : 1 - hRatio;
  const splitRatio = isFullTop ? 1 - hRatio : hRatio;

  return (
    <div className="h-full flex flex-col gap-0">
      <div style={{ height: `calc(${(isFullTop ? fullRatio : splitRatio) * 100}% - 3px)` }}>
        {isFullTop ? fullPane : splitPane}
      </div>
      <Divider axis="y" onMouseDown={onDragH} />
      <div style={{ height: `calc(${(isFullTop ? splitRatio : fullRatio) * 100}% - 3px)` }}>
        {isFullTop ? splitPane : fullPane}
      </div>
    </div>
  );
}

// ── 4-Pane Layout ──────────────────────────────────

function FourPaneLayout({ layout, setLayout, paneWidgets, instructorId, onPaneClick, onClearPane, pendingWidget, containerRef }: LayoutProps) {
  const hRatio = layout.divider4H;
  const vtRatio = layout.divider4VTop;
  const vbRatio = layout.divider4VBottom;

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const onDragH = useDividerDrag(
    containerRef,
    "y",
    hRatio,
    (v) => setLayout(prev => ({ ...prev, divider4H: v })),
  );
  const onDragVT = useDividerDrag(
    topRef,
    "x",
    vtRatio,
    (v) => setLayout(prev => ({ ...prev, divider4VTop: v })),
  );
  const onDragVB = useDividerDrag(
    bottomRef,
    "x",
    vbRatio,
    (v) => setLayout(prev => ({ ...prev, divider4VBottom: v })),
  );

  const paneProps = (idx: number) => ({
    paneIdx: idx,
    widgetId: paneWidgets[idx] ?? null,
    instructorId,
    onPaneClick,
    onClearPane,
    pendingWidget,
  });

  return (
    <div className="h-full flex flex-col gap-0">
      {/* Top row */}
      <div ref={topRef} style={{ height: `calc(${hRatio * 100}% - 3px)` }} className="flex flex-row gap-0">
        <div style={{ width: `calc(${vtRatio * 100}% - 3px)` }} className="h-full"><Pane {...paneProps(0)} /></div>
        <Divider axis="x" onMouseDown={onDragVT} />
        <div style={{ width: `calc(${(1 - vtRatio) * 100}% - 3px)` }} className="h-full"><Pane {...paneProps(1)} /></div>
      </div>
      <Divider axis="y" onMouseDown={onDragH} />
      {/* Bottom row */}
      <div ref={bottomRef} style={{ height: `calc(${(1 - hRatio) * 100}% - 3px)` }} className="flex flex-row gap-0">
        <div style={{ width: `calc(${vbRatio * 100}% - 3px)` }} className="h-full"><Pane {...paneProps(2)} /></div>
        <Divider axis="x" onMouseDown={onDragVB} />
        <div style={{ width: `calc(${(1 - vbRatio) * 100}% - 3px)` }} className="h-full"><Pane {...paneProps(3)} /></div>
      </div>
    </div>
  );
}

// ── Widget Content Renderer ──────────────────────────────────

function WidgetContent({ defId, instructorId }: { defId: string; instructorId: string }) {
  switch (defId) {
    case "today-schedule": return <TodayScheduleWidget instructorId={instructorId} />;
    case "my-students": return <MyStudentsWidget instructorId={instructorId} />;
    case "fleet-status": return <FleetStatusWidget />;
    case "weather": return <WeatherWidget />;
    case "alerts": return <AlertsWidget />;
    case "maintenance": return <MaintenanceDueWidget />;
    case "upcoming-week": return <UpcomingWeekWidget instructorId={instructorId} />;
    case "flight-stats": return <FlightStatsWidget />;
    case "live-map": return <LiveMapWidget />;
    default: return <p className="text-xs text-muted-foreground">Unknown widget</p>;
  }
}

// ── Widget Implementations ──────────────────────────────────

function TodayScheduleWidget({ instructorId }: { instructorId: string }) {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const events = getInstructorReservations(instructorId)
    .filter(r => r.startTime.startsWith(todayStr))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-1.5">
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1">No events today</p>
      ) : (
        events.map(e => (
          <div key={e.id} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: activityTypeColors[e.activityType] }} />
            <span className="font-medium">{format(new Date(e.startTime), "h:mm a")}</span>
            <span className="text-muted-foreground truncate">{activityTypeLabels[e.activityType]}</span>
          </div>
        ))
      )}
      <Link href="/instructor/schedule" className="text-[10px] text-primary hover:underline block pt-1">View full schedule →</Link>
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
      <Link href="/instructor/students" className="text-[10px] text-primary hover:underline block">View all students →</Link>
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
      <Link href="/instructor/live-map" className="text-[10px] text-primary hover:underline block">View fleet map →</Link>
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
      <Link href="/instructor/live-map" className="text-[10px] text-primary hover:underline block pt-1">Full weather →</Link>
    </div>
  );
}

function AlertsWidget() {
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
      <Link href="/instructor/maintenance" className="text-[10px] text-primary hover:underline block">View maintenance →</Link>
    </div>
  );
}

function UpcomingWeekWidget({ instructorId }: { instructorId: string }) {
  const events = getInstructorReservations(instructorId);
  const upcoming = events
    .filter(r => new Date(r.startTime) > new Date())
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 8);

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
      <p>This week: <span className="font-medium text-foreground">12.5h</span> dual given</p>
      <p>This month: <span className="font-medium text-foreground">48.2h</span> total</p>
      <p>Checkrides: <span className="font-medium text-foreground">2 passed</span></p>
    </div>
  );
}

function LiveMapWidget() {
  const flying = aircraftPositions.filter(a => a.isSchoolAircraft && a.altitudeFt > 0);
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 rounded-md bg-muted/50 border border-dashed flex items-center justify-center relative overflow-hidden min-h-[100px]">
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
