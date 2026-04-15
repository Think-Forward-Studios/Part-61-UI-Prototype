"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { lessons } from "@/lib/mock-data";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  studentName: string;
}

export function AddOverrideDialog({ open, onOpenChange, studentName }: Props) {
  const [lessonId, setLessonId] = useState("");
  const [kind, setKind] = useState("");
  const [justification, setJustification] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  function handleSave() {
    if (!justification.trim()) {
      alert("Justification is required before saving.");
      return;
    }
    const lesson = lessons.find(l => l.id === lessonId);
    alert(`Override created for ${studentName}: ${kind.replace(/_/g, " ")} on ${lesson?.code ?? "?"} (prototype)`);
    onOpenChange(false);
    setLessonId("");
    setKind("");
    setJustification("");
    setExpiresAt("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Override — {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Lesson</Label>
            <Select value={lessonId} onValueChange={v => v && setLessonId(v)}>
              <SelectTrigger><SelectValue placeholder="Select lesson..." /></SelectTrigger>
              <SelectContent>
                {lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.code}: {l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Override Type</Label>
            <Select value={kind} onValueChange={v => v && setKind(v)}>
              <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="prerequisite_skip">Prerequisite Skip</SelectItem>
                <SelectItem value="repeat_limit_exceeded">Repeat Limit Exceeded</SelectItem>
                <SelectItem value="currency_waiver">Currency Waiver</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Justification <span className="text-destructive">*</span></Label>
            <Textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              rows={3}
              placeholder="Provide detailed justification for this override (required)..."
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Expiration Date</Label>
            <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!lessonId || !kind || !justification.trim()} onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />Create Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
