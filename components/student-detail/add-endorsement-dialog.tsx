"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

const categories = [
  { value: "student_pilot", label: "Student Pilot" },
  { value: "solo", label: "Solo" },
  { value: "xc", label: "Cross-Country" },
  { value: "aircraft_class_rating", label: "Aircraft/Class Rating" },
  { value: "flight_review", label: "Flight Review" },
  { value: "ipc", label: "IPC" },
  { value: "practical_test", label: "Practical Test" },
  { value: "knowledge_test", label: "Knowledge Test" },
  { value: "other", label: "Other" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  studentName: string;
  editData?: { category: string; text: string; aircraftContext: string; expiresAt: string } | null;
}

export function AddEndorsementDialog({ open, onOpenChange, studentName, editData }: Props) {
  const isEdit = !!editData;
  const [category, setCategory] = useState(editData?.category ?? "");
  const [text, setText] = useState(editData?.text ?? "");
  const [aircraftContext, setAircraftContext] = useState(editData?.aircraftContext ?? "");
  const [expiresAt, setExpiresAt] = useState(editData?.expiresAt ?? "");

  function handleSave() {
    alert(`Endorsement ${isEdit ? "updated" : "added"} for ${studentName}: ${category} (prototype)`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Endorsement — {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={v => v && setCategory(v)}>
              <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Endorsement Text</Label>
            <Textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="I certify that..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Aircraft Context (optional)</Label>
              <Input value={aircraftContext} onChange={e => setAircraftContext(e.target.value)} placeholder="e.g., Cessna 172S (N172SP)" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Expiration Date (optional)</Label>
              <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!category || !text} onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />{isEdit ? "Save Changes" : "Add Endorsement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
