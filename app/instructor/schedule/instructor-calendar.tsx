"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";

interface Props {
  events: EventInput[];
  onEventClick: (info: EventClickArg) => void;
}

export default function InstructorCalendar({ events, onEventClick }: Props) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "timeGridDay,timeGridWeek,dayGridMonth",
      }}
      events={events}
      eventClick={onEventClick}
      slotMinTime="06:00:00"
      slotMaxTime="22:00:00"
      allDaySlot={false}
      height="auto"
      nowIndicator
      eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
      slotLabelFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
    />
  );
}
