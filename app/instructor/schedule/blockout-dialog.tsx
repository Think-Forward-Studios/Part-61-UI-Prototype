"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function BlockoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit() {
    alert(`Blockout created: ${startDate ? format(startDate, "MMM d") : ""} - ${endDate ? format(endDate, "MMM d") : ""} (${reason})`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Blockout Time</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger className={cn("w-full justify-start text-left font-normal text-xs inline-flex items-center gap-1 rounded-md border px-3 py-2", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="h-3 w-3" />
                  {startDate ? format(startDate, "MMM d, yyyy") : "Start"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger className={cn("w-full justify-start text-left font-normal text-xs inline-flex items-center gap-1 rounded-md border px-3 py-2", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="h-3 w-3" />
                  {endDate ? format(endDate, "MMM d, yyyy") : "End"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" defaultValue="08:00" />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" defaultValue="17:00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={v => v && setReason(v)}>
              <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!startDate || !endDate || !reason} onClick={handleSubmit}>
            <Check className="h-4 w-4 mr-1" />Create Blockout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
