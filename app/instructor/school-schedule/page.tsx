"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plane, DoorOpen } from "lucide-react";
import { format, addHours, startOfDay, isSameDay, addDays, startOfWeek } from "date-fns";
import {
  aircraft,
  rooms,
  reservations as initialReservations,
  activityTypeColors,
  activityTypeLabels,
  reservationStatusLabels,
  users,
  userRoles,
  scheduleBlocks,
  scheduleBlockInstances,
  aircraftEngines,
  aircraftEquipment,
} from "@/lib/mock-data";
import type { Reservation, ReservationActivityType } from "@/lib/types";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am - 9pm

function formatTag(tag: string): string {
  return tag.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function getAvailabilityInstances(resourceId: string, resourceType: "aircraft" | "room") {
  const matchingBlocks = scheduleBlocks.filter(b =>
    resourceType === "aircraft" ? b.aircraftId === resourceId : b.roomId === resourceId
  );
  const blockIds = new Set(matchingBlocks.map(b => b.id));
  return scheduleBlockInstances.filter(inst => blockIds.has(inst.blockId));
}

const studentUsers = users.filter(u => {
  const role = userRoles.find(r => r.userId === u.id);
  return role?.role === "student";
});

const instructorUsers = users.filter(u => {
  const role = userRoles.find(r => r.userId === u.id);
  return role?.role === "instructor";
});

const DURATION_OPTIONS = [
  { value: "0.5", label: "30 min" },
  { value: "1", label: "1 hr" },
  { value: "1.5", label: "1.5 hr" },
  { value: "2", label: "2 hr" },
  { value: "3", label: "3 hr" },
  { value: "4", label: "4 hr" },
];

export default function SchoolSchedulePage() {
  const [view, setView] = useState<"day" | "week">("day");
  const [currentDate] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState<{ type: "aircraft" | "room"; id: string } | null>(null);
  const [localReservations, setLocalReservations] = useState<Reservation[]>(initialReservations);

  // Event detail dialog
  const [selectedEvent, setSelectedEvent] = useState<Reservation | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  // Create event dialog
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [createResourceContext, setCreateResourceContext] = useState<{ type: "aircraft" | "room"; id: string; day: Date; hour: number } | null>(null);

  // Edit event dialog
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editEvent, setEditEvent] = useState<Reservation | null>(null);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Create form state
  const [createStudentId, setCreateStudentId] = useState("");
  const [createActivityType, setCreateActivityType] = useState<string>("");
  const [createStartTime, setCreateStartTime] = useState("");
  const [createDuration, setCreateDuration] = useState("1.5");
  const [createNotes, setCreateNotes] = useState("");

  // Edit form state
  const [editStudentId, setEditStudentId] = useState("");
  const [editActivityType, setEditActivityType] = useState<string>("");
  const [editNotes, setEditNotes] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editDuration, setEditDuration] = useState("1.5");

  const dayStart = startOfDay(currentDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const viewDays = view === "day" ? [dayStart] : Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const allResources = [
    ...rooms.map(r => ({ id: r.id, type: "room" as const, name: r.name, subtitle: `Cap: ${r.capacity}`, icon: DoorOpen, features: r.features })),
    ...aircraft.filter(a => !a.groundedAt).map(a => ({ id: a.id, type: "aircraft" as const, name: a.tailNumber, subtitle: `${a.make} ${a.model}`, icon: Plane, features: null as string[] | null })),
  ];

  function getEventsForResource(resourceId: string, type: "aircraft" | "room") {
    return localReservations.filter(r => {
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

  // --- Event Detail Handlers ---

  function handleEventClick(event: Reservation) {
    setSelectedEvent(event);
    setShowEventDetail(true);
  }

  function handleEmptyBlockClick(resourceId: string, resourceType: "aircraft" | "room", day: Date, hour: number) {
    setCreateResourceContext({ type: resourceType, id: resourceId, day, hour });
    const startDate = addHours(startOfDay(day), hour);
    setCreateStartTime(format(startDate, "HH:mm"));
    setCreateStudentId("");
    setCreateActivityType(resourceType === "aircraft" ? "flight" : "academic");
    setCreateDuration("1.5");
    setCreateNotes("");
    setShowCreateEvent(true);
  }

  function handleModifyClick() {
    if (!selectedEvent) return;
    const start = new Date(selectedEvent.startTime);
    const end = new Date(selectedEvent.endTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    setEditEvent(selectedEvent);
    setEditStudentId(selectedEvent.studentId ?? "");
    setEditActivityType(selectedEvent.activityType);
    setEditNotes(selectedEvent.notes ?? "");
    setEditStartTime(format(start, "HH:mm"));
    setEditDuration(String(durationHours));
    setShowEventDetail(false);
    setShowEditEvent(true);
  }

  function handleDeleteClick() {
    setShowEventDetail(false);
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    if (!selectedEvent) return;
    setLocalReservations(prev => prev.filter(r => r.id !== selectedEvent.id));
    setShowDeleteConfirm(false);
    setSelectedEvent(null);
    alert("Event deleted successfully.");
  }

  function handleSaveNewEvent() {
    if (!createResourceContext) return;
    const startDate = addHours(startOfDay(createResourceContext.day), parseFloat(createStartTime.split(":")[0] ?? "8") + parseFloat(createStartTime.split(":")[1] ?? "0") / 60);
    const endDate = addHours(startDate, parseFloat(createDuration));
    const newEvent: Reservation = {
      id: `new-${Date.now()}`,
      schoolId: "school-01",
      baseId: "base-01",
      activityType: (createActivityType || "flight") as ReservationActivityType,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      status: "requested",
      aircraftId: createResourceContext.type === "aircraft" ? createResourceContext.id : null,
      instructorId: null,
      studentId: createStudentId || null,
      roomId: createResourceContext.type === "room" ? createResourceContext.id : null,
      notes: createNotes || null,
      lessonId: null,
    };
    setLocalReservations(prev => [...prev, newEvent]);
    setShowCreateEvent(false);
    alert("Event created successfully.");
  }

  function handleSaveEditEvent() {
    if (!editEvent) return;
    const originalStart = new Date(editEvent.startTime);
    const day = startOfDay(originalStart);
    const [hh, mm] = editStartTime.split(":");
    const startDate = addHours(day, parseFloat(hh ?? "8") + parseFloat(mm ?? "0") / 60);
    const endDate = addHours(startDate, parseFloat(editDuration));

    setLocalReservations(prev =>
      prev.map(r =>
        r.id === editEvent.id
          ? {
              ...r,
              studentId: editStudentId || r.studentId,
              activityType: (editActivityType as ReservationActivityType) || r.activityType,
              notes: editNotes || r.notes,
              startTime: startDate.toISOString(),
              endTime: endDate.toISOString(),
            }
          : r
      )
    );
    setShowEditEvent(false);
    setEditEvent(null);
    alert("Event updated successfully.");
  }

  // --- Helpers for event detail display ---

  function getResourceName(event: Reservation): string {
    if (event.aircraftId) {
      const ac = aircraft.find(a => a.id === event.aircraftId);
      return ac ? `${ac.tailNumber} (${ac.make} ${ac.model})` : "Unknown Aircraft";
    }
    if (event.roomId) {
      const rm = rooms.find(r => r.id === event.roomId);
      return rm ? rm.name : "Unknown Room";
    }
    return "No resource assigned";
  }

  function getInstructorName(event: Reservation): string {
    if (!event.instructorId) return "Unassigned";
    const instructor = users.find(u => u.id === event.instructorId);
    return instructor?.fullName ?? "Unknown";
  }

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
                      {resource.features && resource.features.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {resource.features.map(f => (
                            <span key={f} className="inline-block text-[9px] px-1 py-0 rounded bg-muted text-muted-foreground leading-tight">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                {viewDays.map(day => {
                  const availInstances = getAvailabilityInstances(resource.id, resource.type);
                  return (
                  <div key={day.toISOString()} className="flex-1 relative h-12">
                    {/* Availability bands (behind events) */}
                    {availInstances
                      .filter(inst => isSameDay(new Date(inst.startTime), day))
                      .map(inst => {
                        const instStart = new Date(inst.startTime);
                        const instEnd = new Date(inst.endTime);
                        const startHour = instStart.getHours() + instStart.getMinutes() / 60;
                        const endHour = instEnd.getHours() + instEnd.getMinutes() / 60;
                        const clampedStart = Math.max(startHour, 6);
                        const clampedEnd = Math.min(endHour, 22);
                        const left = ((clampedStart - 6) / 16) * 100;
                        const width = ((clampedEnd - clampedStart) / 16) * 100;
                        return (
                          <div
                            key={inst.id}
                            className="absolute top-0 h-full bg-green-500/10 z-0 pointer-events-none"
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title="Available"
                          />
                        );
                      })}
                    {/* Clickable empty time blocks */}
                    <div className="flex h-full relative z-[1]">
                      {HOURS.map(h => (
                        <button
                          key={h}
                          className="flex-1 border-r border-dashed border-muted min-w-[50px] hover:bg-primary/5 transition-colors"
                          onClick={() => handleEmptyBlockClick(resource.id, resource.type, day, h)}
                          title={`Create event at ${h}:00`}
                        />
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
                          <button
                            key={event.id}
                            className="absolute top-1 h-10 rounded-sm px-1 flex items-center text-[10px] text-white font-medium overflow-hidden cursor-pointer hover:brightness-110 hover:shadow-md transition-all z-10"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: activityTypeColors[event.activityType] ?? "#6b7280",
                            }}
                            title={`${student?.fullName ?? "?"} - ${event.notes ?? event.activityType}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            {student?.fullName?.split(" ")[0] ?? ""}
                          </button>
                        );
                      })}
                  </div>
                  );
                })}
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
                {"tailNumber" in selected ? (() => {
                  const ac = selected as typeof aircraft[0];
                  const engines = aircraftEngines.filter(e => e.aircraftId === ac.id);
                  const equipment = aircraftEquipment.filter(e => e.aircraftId === ac.id);
                  return (
                  <div className="space-y-3 text-sm">
                    <div className="space-y-2">
                      <Row label="Make/Model" value={`${ac.make} ${ac.model}`} />
                      <Row label="Year" value={String(ac.year)} />
                      <Row label="Equipment Notes" value={ac.equipmentNotes ?? "\u2014"} />
                      <Row label="Status" value={ac.groundedAt ? "Grounded" : "Airworthy"} />
                    </div>
                    {engines.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Engine{engines.length > 1 ? "s" : ""}</h4>
                        {engines.map(eng => (
                          <div key={eng.id} className="p-2 rounded-md bg-muted/50 space-y-0.5">
                            <p className="font-medium">{eng.manufacturer} {eng.model}</p>
                            <p className="text-xs text-muted-foreground">
                              Position: {eng.position}{eng.serialNumber ? ` | S/N: ${eng.serialNumber}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {equipment.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipment</h4>
                        <div className="flex flex-wrap gap-1">
                          {equipment.map(eq => (
                            <Badge key={eq.id} variant="secondary" className="text-xs">
                              {formatTag(eq.tag)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })() : (
                  <div className="space-y-2 text-sm">
                    <Row label="Capacity" value={String((selected as typeof rooms[0]).capacity ?? "\u2014")} />
                    <Row label="Features" value={(selected as typeof rooms[0]).features?.join(", ") ?? "\u2014"} />
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
                          <p className="font-medium">{student?.fullName ?? "\u2014"}</p>
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

      {/* ── Event Detail Dialog ── */}
      <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>View reservation information</DialogDescription>
          </DialogHeader>
          {selectedEvent && (() => {
            const student = users.find(u => u.id === selectedEvent.studentId);
            const start = new Date(selectedEvent.startTime);
            const end = new Date(selectedEvent.endTime);
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    style={{ backgroundColor: activityTypeColors[selectedEvent.activityType] ?? "#6b7280" }}
                    className="text-white"
                  >
                    {activityTypeLabels[selectedEvent.activityType] ?? selectedEvent.activityType}
                  </Badge>
                  <Badge variant="outline">
                    {reservationStatusLabels[selectedEvent.status] ?? selectedEvent.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <Row label="Student" value={student?.fullName ?? "Unassigned"} />
                  <Row label="Instructor" value={getInstructorName(selectedEvent)} />
                  <Row label="Date" value={format(start, "EEEE, MMM d, yyyy")} />
                  <Row label="Time" value={`${format(start, "h:mm a")} - ${format(end, "h:mm a")}`} />
                  <Row label="Resource" value={getResourceName(selectedEvent)} />
                  {selectedEvent.notes && <Row label="Notes" value={selectedEvent.notes} />}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" variant="outline" onClick={handleModifyClick}>
                    Modify
                  </Button>
                  <Button className="flex-1" variant="destructive" onClick={handleDeleteClick}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Create Event Dialog ── */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              {createResourceContext && (() => {
                const res = allResources.find(r => r.id === createResourceContext.id);
                return `${res?.name ?? "Resource"} - ${format(createResourceContext.day, "EEE, MMM d")}`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={createStudentId} onValueChange={v => v && setCreateStudentId(v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>
                  {studentUsers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={createActivityType} onValueChange={v => v && setCreateActivityType(v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(activityTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={createStartTime} onChange={e => setCreateStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={createDuration} onValueChange={v => v && setCreateDuration(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={createNotes}
                onChange={e => setCreateNotes(e.target.value)}
                placeholder="Optional notes..."
                className="min-h-[60px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>Cancel</Button>
            <Button onClick={handleSaveNewEvent}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Event Dialog ── */}
      <Dialog open={showEditEvent} onOpenChange={setShowEditEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Event</DialogTitle>
            <DialogDescription>Update reservation details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={editStudentId} onValueChange={v => v && setEditStudentId(v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>
                  {studentUsers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={editActivityType} onValueChange={v => v && setEditActivityType(v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(activityTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={editDuration} onValueChange={v => v && setEditDuration(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Notes..."
                className="min-h-[60px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditEvent(false)}>Cancel</Button>
            <Button onClick={handleSaveEditEvent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">{users.find(u => u.id === selectedEvent.studentId)?.fullName ?? "Unknown"}</span></p>
              <p>{activityTypeLabels[selectedEvent.activityType] ?? selectedEvent.activityType} - {format(new Date(selectedEvent.startTime), "h:mm a")}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setSelectedEvent(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
