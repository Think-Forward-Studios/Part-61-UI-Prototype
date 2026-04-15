"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { stages, users } from "@/lib/mock-data";
import { IDS } from "@/lib/mock-data/ids";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  studentName: string;
  editData?: { stageId: string; checkerUserId: string; scheduledAt: string; status: string; remarks: string } | null;
}

export function AddStageCheckDialog({ open, onOpenChange, studentName, editData }: Props) {
  const isEdit = !!editData;
  const instructorIds: string[] = [IDS.instructorMike, IDS.instructorSarah, IDS.instructorJames];
  const instructors = users.filter(u => instructorIds.includes(u.id));

  const [stageId, setStageId] = useState(editData?.stageId ?? "");
  const [checkerUserId, setCheckerUserId] = useState(editData?.checkerUserId ?? "");
  const [scheduledAt, setScheduledAt] = useState(editData?.scheduledAt ?? "");
  const [status, setStatus] = useState(editData?.status ?? "scheduled");
  const [remarks, setRemarks] = useState(editData?.remarks ?? "");

  function handleSave() {
    const stage = stages.find(s => s.id === stageId);
    alert(`Stage check ${isEdit ? "updated" : "scheduled"} for ${studentName}: ${stage?.title ?? "?"} (prototype)`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Schedule"} Stage Check — {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Stage</Label>
            <Select value={stageId} onValueChange={v => v && setStageId(v)}>
              <SelectTrigger><SelectValue placeholder="Select stage..." /></SelectTrigger>
              <SelectContent>
                {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.code}: {s.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Checker (Instructor)</Label>
            <Select value={checkerUserId} onValueChange={v => v && setCheckerUserId(v)}>
              <SelectTrigger><SelectValue placeholder="Select checker..." /></SelectTrigger>
              <SelectContent>
                {instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Scheduled Date/Time</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </div>
          {isEdit && (
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={v => v && setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Remarks</Label>
            <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} placeholder="Notes..." />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!stageId || !checkerUserId} onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />{isEdit ? "Save Changes" : "Schedule Check"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
