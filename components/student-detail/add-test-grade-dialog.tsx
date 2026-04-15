"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  studentName: string;
  editData?: { testKind: string; score: string; maxScore: string; remarks: string } | null;
}

export function AddTestGradeDialog({ open, onOpenChange, studentName, editData }: Props) {
  const isEdit = !!editData;
  const [testKind, setTestKind] = useState(editData?.testKind ?? "");
  const [score, setScore] = useState(editData?.score ?? "");
  const [maxScore, setMaxScore] = useState(editData?.maxScore ?? "100");
  const [remarks, setRemarks] = useState(editData?.remarks ?? "");

  function handleSave() {
    alert(`Test grade ${isEdit ? "updated" : "recorded"} for ${studentName}: ${testKind} ${score}/${maxScore} (prototype)`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Record"} Test Grade — {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Test Type</Label>
            <Select value={testKind} onValueChange={v => v && setTestKind(v)}>
              <SelectTrigger><SelectValue placeholder="Select test type..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="knowledge">Knowledge Test</SelectItem>
                <SelectItem value="oral">Oral Exam</SelectItem>
                <SelectItem value="end_of_stage">End of Stage</SelectItem>
                <SelectItem value="practical">Practical Test</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Score</Label>
              <Input type="number" value={score} onChange={e => setScore(e.target.value)} placeholder="88" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Score</Label>
              <Input type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} placeholder="100" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Remarks</Label>
            <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} placeholder="Test notes..." />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!testKind} onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />{isEdit ? "Save Changes" : "Record Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
