"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am - 9pm

function hourLabel(h: number) {
  if (h === 0 || h === 12) return h === 0 ? "12am" : "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

type SlotKey = `${typeof DAYS[number]}-${number}`;

export function AvailabilityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  // Pre-populate with typical instructor schedule
  const [slots, setSlots] = useState<Set<SlotKey>>(() => {
    const initial = new Set<SlotKey>();
    // Default: Mon-Fri 7am-5pm
    for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"] as const) {
      for (let h = 7; h < 17; h++) {
        initial.add(`${day}-${h}`);
      }
    }
    return initial;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");

  const toggleSlot = useCallback((key: SlotKey) => {
    setSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((key: SlotKey) => {
    setIsDragging(true);
    const mode = slots.has(key) ? "remove" : "add";
    setDragMode(mode);
    setSlots(prev => {
      const next = new Set(prev);
      if (mode === "remove") { next.delete(key); } else { next.add(key); }
      return next;
    });
  }, [slots]);

  const handleMouseEnter = useCallback((key: SlotKey) => {
    if (!isDragging) return;
    setSlots(prev => {
      const next = new Set(prev);
      if (dragMode === "remove") { next.delete(key); } else { next.add(key); }
      return next;
    });
  }, [isDragging, dragMode]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const totalHours = slots.size;

  const handleSave = () => {
    alert(`Availability saved: ${totalHours} hours/week across ${DAYS.filter(d => HOURS.some(h => slots.has(`${d}-${h}`))).length} days (prototype)`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <DialogHeader>
          <DialogTitle>Set Weekly Availability</DialogTitle>
          <p className="text-sm text-muted-foreground">Click or drag to toggle time blocks. This repeats every week.</p>
        </DialogHeader>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="grid gap-0" style={{ gridTemplateColumns: `60px repeat(${DAYS.length}, 1fr)` }}>
              <div />
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs font-medium py-1 border-b">{day}</div>
              ))}
            </div>

            {/* Time rows */}
            {HOURS.map(hour => (
              <div key={hour} className="grid gap-0" style={{ gridTemplateColumns: `60px repeat(${DAYS.length}, 1fr)` }}>
                <div className="text-[10px] text-muted-foreground text-right pr-2 py-1 leading-6">{hourLabel(hour)}</div>
                {DAYS.map(day => {
                  const key: SlotKey = `${day}-${hour}`;
                  const active = slots.has(key);
                  return (
                    <div
                      key={key}
                      className={`h-6 border border-border/30 cursor-pointer transition-colors select-none ${
                        active
                          ? "bg-primary/30 hover:bg-primary/40"
                          : "hover:bg-muted/50"
                      }`}
                      onMouseDown={() => handleMouseDown(key)}
                      onMouseEnter={() => handleMouseEnter(key)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-primary/30 border" />
              Available
            </div>
            <span>{totalHours} hrs/week selected</span>
          </div>
          <Badge variant="outline" className="text-xs">Repeats weekly</Badge>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />Save Availability
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
