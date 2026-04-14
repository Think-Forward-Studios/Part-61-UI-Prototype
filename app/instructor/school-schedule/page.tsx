"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plane, DoorOpen } from "lucide-react";
import { format, addHours, startOfDay, isSameDay, addDays, startOfWeek } from "date-fns";
import { aircraft, rooms, reservations, activityTypeColors, users } from "@/lib/mock-data";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am - 9pm

export default function SchoolSchedulePage() {
  const [view, setView] = useState<"day" | "week">("day");
  const [currentDate] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState<{ type: "aircraft" | "room"; id: string } | null>(null);

  const dayStart = startOfDay(currentDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const viewDays = view === "day" ? [dayStart] : Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const allResources = [
    ...rooms.map(r => ({ id: r.id, type: "room" as const, name: r.name, subtitle: `Cap: ${r.capacity}`, icon: DoorOpen })),
    ...aircraft.filter(a => !a.groundedAt).map(a => ({ id: a.id, type: "aircraft" as const, name: a.tailNumber, subtitle: `${a.make} ${a.model}`, icon: Plane })),
  ];

  function getEventsForResource(resourceId: string, type: "aircraft" | "room") {
    return reservations.filter(r => {
      if (r.status === "cancelled") return false;
      if (type === "aircraft") return r.aircraftId === resourceId;
      return r.roomId === resourceId;
    });
  }

  const selected = selectedResource
    ? (selectedResource.type === "aircraft"
        ? aircraft.find(a => a.id === selectedResource.id)
        : rooms.find(r => r.id === selectedResource.id))
    : null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">School Schedule</h2>
        <Tabs value={view} onValueChange={v => setView(v as "day" | "week")}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <p className="text-sm text-muted-foreground">{format(currentDate, "EEEE, MMMM d, yyyy")}</p>

      <ScrollArea className="w-full">
        <div className="min-w-[900px]">
          {/* Time header */}
          <div className="flex border-b">
            <div className="w-48 shrink-0 p-2 text-xs font-medium text-muted-foreground">Resource</div>
            {viewDays.map(day => (
              <div key={day.toISOString()} className="flex-1">
                {view === "week" && (
                  <div className="text-center text-xs font-medium py-1 border-b bg-muted/30">{format(day, "EEE M/d")}</div>
                )}
                <div className="flex">
                  {HOURS.map(h => (
                    <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground border-r py-1 min-w-[50px]">
                      {format(addHours(day, h), "ha")}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Resource rows */}
          {allResources.map(resource => {
            const events = getEventsForResource(resource.id, resource.type);

            return (
              <div key={resource.id} className="flex border-b hover:bg-muted/20">
                <button
                  className="w-48 shrink-0 p-2 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedResource({ type: resource.type, id: resource.id })}
                >
                  <div className="flex items-center gap-2">
                    <resource.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">{resource.subtitle}</p>
                    </div>
                  </div>
                </button>
                {viewDays.map(day => (
                  <div key={day.toISOString()} className="flex-1 relative h-12">
                    <div className="flex h-full">
                      {HOURS.map(h => (
                        <div key={h} className="flex-1 border-r border-dashed border-muted min-w-[50px]" />
                      ))}
                    </div>
                    {/* Event blocks */}
                    {events
                      .filter(e => isSameDay(new Date(e.startTime), day))
                      .map(event => {
                        const start = new Date(event.startTime);
                        const end = new Date(event.endTime);
                        const startHour = start.getHours() + start.getMinutes() / 60;
                        const endHour = end.getHours() + end.getMinutes() / 60;
                        const left = ((startHour - 6) / 16) * 100;
                        const width = ((endHour - startHour) / 16) * 100;
                        const student = users.find(u => u.id === event.studentId);

                        return (
                          <div
                            key={event.id}
                            className="absolute top-1 h-10 rounded-sm px-1 flex items-center text-[10px] text-white font-medium overflow-hidden cursor-default"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: activityTypeColors[event.activityType] ?? "#6b7280",
                            }}
                            title={`${student?.fullName ?? "?"} - ${event.notes ?? event.activityType}`}
                          >
                            {student?.fullName?.split(" ")[0] ?? ""}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Resource Detail Sheet */}
      <Sheet open={!!selectedResource} onOpenChange={(open) => { if (!open) setSelectedResource(null); }}>
        <SheetContent className="w-[400px] sm:w-[400px]">
          {selectedResource && selected && (
            <>
              <SheetHeader>
                <SheetTitle>{"tailNumber" in selected ? (selected as typeof aircraft[0]).tailNumber : (selected as typeof rooms[0]).name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {"tailNumber" in selected ? (
                  <div className="space-y-2 text-sm">
                    <Row label="Make/Model" value={`${(selected as typeof aircraft[0]).make} ${(selected as typeof aircraft[0]).model}`} />
                    <Row label="Year" value={String((selected as typeof aircraft[0]).year)} />
                    <Row label="Equipment" value={(selected as typeof aircraft[0]).equipmentNotes ?? "—"} />
                    <Row label="Status" value={(selected as typeof aircraft[0]).groundedAt ? "Grounded" : "Airworthy"} />
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <Row label="Capacity" value={String((selected as typeof rooms[0]).capacity ?? "—")} />
                    <Row label="Features" value={(selected as typeof rooms[0]).features?.join(", ") ?? "—"} />
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Upcoming Bookings</h4>
                  {getEventsForResource(selectedResource.id, selectedResource.type)
                    .filter(e => new Date(e.endTime) >= new Date())
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .slice(0, 5)
                    .map(event => {
                      const student = users.find(u => u.id === event.studentId);
                      return (
                        <div key={event.id} className="p-2 rounded-md bg-muted/50 text-sm">
                          <p className="font-medium">{student?.fullName ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.startTime), "EEE, MMM d")} {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                          </p>
                        </div>
                      );
                    })}
                </div>
                <Button className="w-full" variant="outline">Add Event</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
