"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Plus, Clock, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import {
  getInstructorReservations, activityTypeColors, activityTypeLabels,
  reservationStatusLabels, users, aircraft, rooms, lessons,
} from "@/lib/mock-data";
import { IDS } from "@/lib/mock-data/ids";
import { AddTrainingDialog } from "./add-training-dialog";
import { BlockoutDialog } from "./blockout-dialog";
import type { Reservation } from "@/lib/types";

// FullCalendar must be loaded client-side only
const InstructorCalendar = dynamic(() => import("./instructor-calendar"), { ssr: false });

export default function SchedulePage() {
  const { currentUser } = useAuth();
  const instructorId = currentUser?.id ?? IDS.instructorMike;

  const events = useMemo(() => {
    const res = getInstructorReservations(instructorId);
    return res.map(r => ({
      id: r.id,
      title: buildTitle(r),
      start: r.startTime,
      end: r.endTime,
      backgroundColor: activityTypeColors[r.activityType] ?? "#6b7280",
      borderColor: activityTypeColors[r.activityType] ?? "#6b7280",
      extendedProps: { reservation: r },
    }));
  }, [instructorId]);

  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [addTrainingOpen, setAddTrainingOpen] = useState(false);
  const [blockoutOpen, setBlockoutOpen] = useState(false);

  function buildTitle(r: Reservation) {
    const student = users.find(u => u.id === r.studentId);
    const label = activityTypeLabels[r.activityType] ?? r.activityType;
    return `${label} - ${student?.fullName ?? "TBD"}`;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Schedule</h2>
        <div className="flex gap-2">
          <Button onClick={() => setAddTrainingOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />Add Training
          </Button>
          <Button variant="outline" onClick={() => setBlockoutOpen(true)}>
            <Clock className="h-4 w-4 mr-1" />Blockout Time
          </Button>
          <Button variant="outline">
            <CalendarCheck className="h-4 w-4 mr-1" />Set Availability
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-lg border p-4">
        <InstructorCalendar
          events={events}
          onEventClick={(info) => {
            const res = info.event.extendedProps.reservation as Reservation;
            setSelectedRes(res);
          }}
        />
      </div>

      {/* Event Detail Sheet */}
      <Sheet open={!!selectedRes} onOpenChange={(open) => { if (!open) setSelectedRes(null); }}>
        <SheetContent className="w-[420px] sm:w-[420px]">
          {selectedRes && <ReservationDetail res={selectedRes} />}
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <AddTrainingDialog open={addTrainingOpen} onOpenChange={setAddTrainingOpen} />
      <BlockoutDialog open={blockoutOpen} onOpenChange={setBlockoutOpen} />
    </div>
  );
}

function ReservationDetail({ res }: { res: Reservation }) {
  const student = users.find(u => u.id === res.studentId);
  const ac = aircraft.find(a => a.id === res.aircraftId);
  const room = rooms.find(r => r.id === res.roomId);
  const lesson = lessons.find(l => l.id === res.lessonId);

  const statusColors: Record<string, string> = {
    requested: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dispatched: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };
  const statusColor = statusColors[res.status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

  return (
    <>
      <SheetHeader>
        <SheetTitle>{activityTypeLabels[res.activityType]} Session</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-2">
          <Badge className={statusColor}>{reservationStatusLabels[res.status] ?? res.status}</Badge>
          <Badge variant="outline" style={{ borderColor: activityTypeColors[res.activityType] }}>
            {activityTypeLabels[res.activityType]}
          </Badge>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Date & Time</span>
            <p className="font-medium">{format(new Date(res.startTime), "EEE, MMM d, yyyy")}</p>
            <p>{format(new Date(res.startTime), "h:mm a")} - {format(new Date(res.endTime), "h:mm a")}</p>
          </div>

          {student && (
            <div>
              <span className="text-muted-foreground">Student</span>
              <p className="font-medium">{student.fullName}</p>
            </div>
          )}

          {ac && (
            <div>
              <span className="text-muted-foreground">Aircraft</span>
              <p className="font-medium">{ac.tailNumber} - {ac.make} {ac.model}</p>
            </div>
          )}

          {room && (
            <div>
              <span className="text-muted-foreground">Room</span>
              <p className="font-medium">{room.name}</p>
            </div>
          )}

          {lesson && (
            <div>
              <span className="text-muted-foreground">Lesson</span>
              <p className="font-medium">{lesson.code}: {lesson.title}</p>
            </div>
          )}

          {res.notes && (
            <div>
              <span className="text-muted-foreground">Notes</span>
              <p>{res.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
